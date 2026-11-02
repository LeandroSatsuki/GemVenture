// Forced low-HP departure fixtures exercise legacy saves; fresh crown victories are covered by geode-crown-official.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {reveal,sightRange,wavePlan,explored} from '../dist/cavern.js';
import {heatState} from '../dist/frenzy.js';
import {awardScore,scoreBeats} from '../dist/stars.js';
import {usesStairs,stairReady,stopAtStair,cavePressure,announceCavePressure,autoContinueStair,stairGuided,stairObjective,stairHint} from '../dist/cave-descent.js';
function start(floor=1,seed=43){const s=E.createState(seed);s.seals=6;E.startRun(s);if(floor!==1){s.run.floor=floor;E.generateRoom(s);}return s;}
function approach(s){const r=s.run,exit=r.room.exit;const p=[[0,1],[0,-1],[1,0],[-1,0]].map(([x,y])=>({x:exit.x+x,y:exit.y+y})).find(p=>E.walkable(r.room,p.x,p.y));assert.ok(p);r.player=p;reveal(r.room,p,sightRange(r));return {...exit};}
test('subtle navigation help uses musical time and never grants score or forces an exit',()=>{const r=start().run;assert.equal(stairGuided(r),false);r.beat=127;assert.equal(stairGuided(r),false);r.beat=128;assert.equal(stairGuided(r),true);assert.match(stairHint(r),/BURACO/);assert.equal(stairObjective(r),'MINERE CRISTAIS');assert.equal(r.room.cleared,false);assert.equal(r.score.points,0);r.trainingClock={};assert.equal(stairGuided(r),false);});
test('campaign charge, combo and elapsed time never end exploration; stepping on the exit does',()=>{
 const s=start(),r=s.run;r.room.charge=9999;r.combo=1000;r.room.minBeats=0;r.room.goal=0;
 E.act(s,{type:'move',...r.player},0);E.tick(s,0);assert.equal(r.room.cleared,false);
 r.room.charge=0;r.combo=0;r.room.minBeats=99999;const exit=approach(s);E.act(s,{type:'move',...exit},1);
 assert.ok(r.room.cleared);assert.equal(r.room.stairDeparted,true);assert.deepEqual(r.player,exit);assert.equal(r.cardOffer.length,3);assert.equal(r.events.filter(e=>e.type==='clear').length,1);
 const earned=r.score.points;E.tick(s,2);E.act(s,{type:'move',...exit},2);assert.equal(r.score.points,earned);assert.ok(E.restoreState(JSON.stringify(s)));
});
test('off-beat steps cannot descend or double-pay; deliberate card choice still precedes the next floor',()=>{
 const s=start(),r=s.run,exit=approach(s);assert.equal(E.act(s,{type:'move',...exit},.45).miss,true);assert.equal(r.room.cleared,false);
 E.act(s,{type:'move',...exit},1);assert.equal(E.descend(s),false);assert.equal(autoContinueStair(s),false);
 assert.ok(E.chooseCard(s,r.cardOffer[0]));assert.equal(autoContinueStair(s),true);const hp=r.health,bag=r.bag;assert.ok(E.descend(s));assert.equal(s.run.floor,2);assert.equal(s.run.health,hp);assert.equal(s.run.bag,bag);assert.equal(s.run.room.stairDeparted,undefined);assert.equal(s.run.beat,-1);
});
test('movement stops on a ready stair even when speed would carry it past; other paths remain unchanged',()=>{
 const r=start().run,p=r.room.exit,path=[{x:p.x-1,y:p.y},{...p},{x:p.x+1,y:p.y}];assert.deepEqual(stopAtStair(r,path),path.slice(0,2));
 assert.deepEqual(stopAtStair(r,[{x:1,y:1}]),[{x:1,y:1}]);r.trainingClock={};assert.equal(stopAtStair(r,path),path);
});
test('discovering an exit permits leaving and returning later without closing or freezing the room',()=>{
 const s=start(),r=s.run,exit=approach(s),origin={...r.player};E.act(s,{type:'move',...origin},0);assert.equal(r.room.cleared,false);assert.ok(explored(r.room,exit));assert.equal(stairReady(r),true);
 E.act(s,{type:'move',...exit},1);assert.equal(r.room.cleared,true);
});
test('a living mandatory boss keeps the stair locked, while death alone does not force departure',()=>{
 const s=start(5),r=s.run,b=r.room.enemies.find(e=>e.boss),exit=approach(s);E.act(s,{type:'move',...exit},0);assert.equal(stairReady(r),false);assert.equal(r.room.cleared,false);
 delete b.crown;b.windup=null;b.recoverUntil=3;r.player={x:b.x-1,y:b.y};b.hp=1;E.act(s,{type:'hit',id:b.id},1);assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,false);assert.equal(stairReady(r),true);
 approach(s);E.act(s,{type:'move',...exit},2);assert.equal(r.room.cleared,true);assert.ok(E.restoreState(JSON.stringify(s)));
});
test('stair exit abandons an optional guardian without any miniboss bonus or mandatory kill',()=>{
 const s=start(2),r=s.run,m=r.room.miniboss;assert.ok(m);const before=[r.bag,...r.materials],exit=approach(s);E.act(s,{type:'move',...exit},0);assert.equal(r.room.cleared,true);assert.equal(m.state,'ignored');assert.equal(m.rewardClaimed,false);assert.deepEqual([r.bag,...r.materials],before);assert.ok(E.restoreState(JSON.stringify(s)));
});
test('first floor preserves its slow opening and population cap; late pressure has warning and bounded stages',()=>{
 const r=start().run;assert.equal(r.room.wave.next,40);assert.equal(wavePlan(1,200).cap,3);assert.equal(cavePressure(r,256).stage,0);assert.equal(cavePressure(r,367).warning,false);assert.equal(cavePressure(r,368).warning,true);
 for(const [beat,stage]of [[383,0],[384,1],[448,2],[512,3],[100000,3]])assert.equal(cavePressure(r,beat).stage,stage);
 assert.equal(cavePressure(r,100000).damage,1.75);assert.equal(cavePressure(r,100000).interval,.6);
});
test('warning/stage events emit once at thresholds and do not reset through reload',()=>{
 const s=start(2),r=s.run,startAt=scoreBeats(r);r.events=[];announceCavePressure(r,startAt-17,startAt-16);announceCavePressure(r,startAt-16,startAt-15);assert.equal(r.events.filter(e=>e.type==='cavePressureWarning').length,1);
 announceCavePressure(r,startAt-1,startAt);announceCavePressure(r,startAt,startAt+1);assert.equal(r.events.filter(e=>e.type==='cavePressure').length,1);
 r.beat=startAt+64;r.acted=r.beat;const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.deepEqual(cavePressure(t.run),cavePressure(r));
});
test('real late enemy damage rises while the first floor remains unchanged before its grace period',()=>{
 for(const floor of [1,2]){const s=start(floor),r=s.run;const enemy=r.room.enemies.find(e=>!e.miniboss);r.room.enemies=[enemy];delete r.room.miniboss;r.room.wave.next=1e9;r.room.nodes=[];r.room.hazards=[];r.room.terrain.fill(0);r.room.rocks=[];const beat=floor===1?300:scoreBeats(r)+64;
  enemy.windup={...r.player,tiles:[{...r.player}],beat,radius:0};enemy.stunUntil=-1;r.acted=beat;r.guardUntil=-1;r.beat=beat-1;const hp=r.health;E.tick(s,beat);assert.ok(s.run);
  const expected=(20+floor*2.4)*(floor===1?.35:.4)*(floor===1?1:1.5)*heatState(r).damage;assert.ok(Math.abs(hp-r.health-expected)<1e-7);
 }
});
test('late wave cadence tightens without increasing first-floor counts, cap or creating an unannounced wave',()=>{
 const s=start(),r=s.run;r.room.enemies=[];r.room.nodes=[];r.room.wave={number:5,next:513,warned:false};r.acted=507;r.beat=506;E.tick(s,507);assert.equal(r.room.wave.warned,true);assert.equal(r.room.wave.number,5);
 r.acted=513;E.tick(s,513);assert.equal(r.room.wave.number,6);assert.equal(r.room.wave.next,537);assert.ok(r.room.enemies.filter(e=>e.hp>0).length<=3);
});
test('a won mandatory arena keeps its remaining deposits but never replenishes a safe endless resource source',()=>{const s=start(5),r=s.run,b=r.room.enemies.find(e=>e.boss);delete b.crown;b.windup=null;b.recoverUntil=3;r.player={x:b.x-1,y:b.y};b.hp=1;E.act(s,{type:'hit',id:b.id},0);assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,false);const ids=r.room.nodes.map(n=>n.id),bag=r.bag,materials=[...r.materials];for(let beat=1;beat<400;beat++){E.act(s,{type:'move',...r.player},beat);E.tick(s,beat);}assert.equal(r.room.cleared,false);assert.deepEqual(r.room.nodes.map(n=>n.id),ids);assert.equal(r.bag,bag);assert.deepEqual(r.materials,materials);E.act(s,{type:'move',...approach(s)},400);assert.equal(r.room.cleared,true);});
test('finite score window and best-rating ledger prevent more stars from staying, reloading or replaying',()=>{
 const s=start(),r=s.run,cutoff=scoreBeats(r);awardScore(s,r.score.target*5,0);assert.equal(s.floorStars[1],5);assert.equal(s.stars,5);const points=r.score.points;
 for(let b=cutoff;b<cutoff+10000;b+=7)assert.equal(awardScore(s,999999,b),0);assert.equal(r.score.points,points);assert.equal(s.stars,5);
 r.beat=cutoff+200;const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(awardScore(t,999999,t.run.beat),0);assert.equal(t.stars,5);E.finishRun(t);E.startRun(t);awardScore(t,t.run.score.target*5,0);assert.equal(t.stars,5);assert.equal(t.run.score.awarded,0);
});
test('long-lived replenishment cannot enlarge the initial score budget',()=>{
 const s=start(),r=s.run,budget=r.room.scoreLimit;r.room.nodes.push({...r.room.nodes[0],id:r.room.nextId++,maxHp:99999,hp:99999});assert.equal(r.room.scoreLimit,budget);awardScore(s,budget*10,0);assert.equal(r.score.points,budget);assert.equal(awardScore(s,9999,1),0);
});
test('save validation preserves stars, resources and departure, rejecting forged incomplete departure flags',()=>{
 const s=start();s.run.room.stairDeparted=true;assert.equal(E.restoreState(JSON.stringify(s)),null);delete s.run.room.stairDeparted;const r=s.run,exit=approach(s);E.act(s,{type:'move',...exit},0);const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.deepEqual(t.materials,s.materials);assert.deepEqual(t.floorStars,s.floorStars);assert.equal(t.run.room.stairDeparted,true);
});
test('camp and final biome gates remain in force after stepping on stairs',()=>{
 const s=start(10),r=s.run;r.room.enemies=[];r.room.bossDefeated=true;E.act(s,{type:'move',...approach(s)},0);assert.ok(E.chooseCard(s,r.cardOffer[0]));assert.equal(E.descend(s),false);assert.ok(E.enterCamp(s));assert.equal(autoContinueStair(s),false);assert.ok(E.leaveCamp(s));assert.ok(E.descend(s));
 const t=start(35),q=t.run;q.room.enemies=[];q.room.bossDefeated=true;E.act(t,{type:'move',...approach(t)},0);assert.ok(E.chooseCard(t,q.cardOffer[0]));assert.equal(autoContinueStair(t),false);assert.equal(E.descend(t),false);
});
test('training, continuous Abyss and legacy room contracts retain their previous flow and pressure',()=>{
 for(const floor of [1,5,10,35]){const r=start(floor).run;if(floor%5===0)assert.equal(cavePressure(r,99999).active,false);r.trainingClock={};assert.equal(usesStairs(r),false);assert.equal(cavePressure(r,99999).stage,0);delete r.trainingClock;r.mode='abyss';assert.equal(usesStairs(r),false);assert.equal(cavePressure(r,99999).active,false);r.mode='floors';delete r.room.campaignCave;assert.equal(usesStairs(r),false);}
});
test('all common floors keep an accessible exit without new keys or geometry changes',()=>{
 for(const floor of [1,2,3,4,6,11,16,21,26,31,34])for(const seed of [1,43,712]){const r=start(floor,seed).run;assert.ok(E.pathTo(r.room,r.player,r.room.exit).length>0,`${floor}/${seed}`);assert.equal(stairReady(r),true);}
});
