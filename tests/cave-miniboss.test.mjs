import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {reveal,sightRange,explored} from '../dist/cavern.js';
import {calculateFloorScore} from '../dist/stars.js';
import {heatState} from '../dist/frenzy.js';
import {wavePlan} from '../dist/cavern.js';
import {minibossEnemy,minibossHealth,minibossReward,minibossEligible,placeCaveMiniboss,refreshCaveMiniboss,allowMinibossDamage,stepCaveMiniboss,rewardCaveMiniboss,validCaveMiniboss} from '../dist/cave-miniboss.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function start(floor=2,seed=43){const s=E.createState(seed);E.startRun(s);if(floor!==1){s.seals=6;s.best=floor;s.run.floor=floor;E.generateRoom(s);}return s;}
function arena(){const s=start(),r=s.run,e=minibossEnemy(r);assert.ok(e);r.room.enemies=[e];r.room.wave.next=1e9;r.room.quota=1e9;r.room.minBeats=1e9;r.player={x:e.x,y:e.y+1};reveal(r.room,r.player,sightRange(r));return {s,r,e,m:r.room.miniboss};}
function beat(s,b,action={type:'move',...s.run.player}){assert.equal(E.act(s,action,b).ok,true);E.tick(s,b);}
function retreat(s,b=1){const r=s.run,home=r.room.miniboss.home;let target;for(let dy=-7;dy<=7&&!target;dy++)for(let dx=-7;dx<=7;dx++){if(Math.abs(dx)+Math.abs(dy)<7)continue;const p={x:home.x+dx,y:home.y+dy};if(!E.walkable(r.room,p.x,p.y))continue;const path=E.pathTo(r.room,r.player,p);if(path.length>0&&path.length<=8){target=p;break;}}assert.ok(target);for(let i=0;i<8&&r.room.miniboss.state==='engaged';i++){const path=E.pathTo(r.room,r.player,target),step=path.slice(0,4).reverse().find(p=>explored(r.room,p));assert.ok(step);E.act(s,{type:'move',...step},b+i);}return target;}

test('first floor stays free of minibosses; one optional guardian occupies reachable common floors without changing star targets',()=>{
 for(const floor of [1,2,3,4,6,11,16,21,26,31,34,5,10,35]){const s=start(floor),r=s.run,e=minibossEnemy(r);if(floor===1||floor%5===0){assert.equal(r.room.miniboss,undefined);assert.equal(e,undefined);continue;}assert.ok(e);assert.equal(e.boss,undefined);assert.equal(e.hp,minibossHealth(r));assert.equal(r.room.enemies.filter(e=>e.miniboss).length,1);assert.ok(E.pathTo(r.room,r.player,e).length>=45);assert.ok(validCaveMiniboss(r));assert.equal(r.score.target,calculateFloorScore({...r.room,enemies:r.room.enemies.filter(e=>!e.miniboss)}));}
 for(const run of [{mode:'abyss',floor:2,room:{campaignCave:{}}},{mode:'floors',floor:2,trainingClock:{},room:{campaignCave:{}}}]){assert.equal(minibossEligible(run),false);placeCaveMiniboss(run);assert.equal(run.room.miniboss,undefined);}
});

test('proximity warns once before combat; the dormant sentry never follows or attacks a passing player',()=>{
 const {s,r,e,m}=arena(),home={x:e.x,y:e.y};refreshCaveMiniboss(r);assert.equal(m.near,true);assert.equal(m.state,'dormant');assert.equal(r.events.filter(e=>e.type==='minibossNearby').length,1);r.events=[];
 for(let b=4;b<25;b++){E.enemyBeat(s,b);assert.equal(e.windup,null);assert.deepEqual({x:e.x,y:e.y},home);}assert.equal(r.events.some(e=>e.type==='minibossNearby'),false);assert.equal(m.state,'dormant');
});

test('off-beat inputs, bombs and damage over time cannot activate or farm an unchallenged miniboss',()=>{
 const {s,r,e,m}=arena(),hp=e.hp,before=[r.bag,...r.materials];assert.equal(E.act(s,{type:'hit',id:e.id},.4).miss,true);assert.equal(m.state,'dormant');r.items.blast=1;E.act(s,{type:'item',item:'blast'},1);assert.equal(e.hp,hp);assert.equal(m.state,'dormant');e.burn={start:1,until:8,damage:999};r.acted=2;E.tick(s,2);assert.equal(e.hp,hp);assert.deepEqual([r.bag,...r.materials],before);assert.equal(allowMinibossDamage(r,e,false),false);
});

test('direct on-beat hit opts in; local skills then work without an artificial damage cap',()=>{
 const {s,r,e,m}=arena(),hp=e.hp;assert.equal(E.act(s,{type:'hit',id:e.id},0).ok,true);assert.equal(m.state,'engaged');close(e.hp,hp-E.power(s));r.items.blast=1;E.act(s,{type:'item',item:'blast'},1);close(e.hp,hp-E.power(s)*4);assert.equal(m.rewardClaimed,false);
});

test('the strike fixes its marked 3x3 footprint two beats ahead and permits a single basic move to safety',()=>{
 const {s,r,e}=arena();beat(s,0,{type:'hit',id:e.id});for(let b=1;b<=4;b++)beat(s,b);const w=structuredClone(e.windup);assert.equal(w.beat,6);const marked=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const p={x:w.x+dx,y:w.y+dy};if(r.room.floorMask[p.y*r.room.cols+p.x])marked.push(p);}assert.deepEqual(w.tiles,marked);assert.ok(w.tiles.length>=1&&w.tiles.length<=9);const health=r.health;
 beat(s,5,{type:'move',x:e.x,y:e.y-1});assert.deepEqual(e.windup,w);assert.ok(!E.dangerTiles(w).some(p=>p.x===r.player.x&&p.y===r.player.y));beat(s,6);assert.equal(r.health,health);assert.equal(e.windup,null);assert.equal(e.recoverUntil,9);for(let b=7;b<=9;b++)beat(s,b);assert.equal(e.windup,null);beat(s,10);assert.equal(e.windup.beat,12);
});

test('ignoring the warning takes normal introductory damage once and leaves a recovery window',()=>{
 const {s,r,e}=arena();beat(s,0,{type:'hit',id:e.id});for(let b=1;b<=5;b++)beat(s,b);const health=r.health;beat(s,6);close(health-r.health,(20+2*2.4)*.4*heatState(r).damage);const after=r.health;E.tick(s,6);assert.equal(r.health,after);assert.equal(e.windup,null);assert.equal(e.recoverUntil,9);
});

test('leaving the room cancels the attack, keeps the guardian wounds and permits the normal floor to clear',()=>{
 const {s,r,e,m}=arena();E.act(s,{type:'hit',id:e.id},0);E.enemyBeat(s,4);assert.ok(e.windup);const hp=e.hp;r.room.quota=0;r.room.goal=0;r.room.minBeats=0;
 E.act(s,{type:'move',...r.player},1);assert.equal(r.room.cleared,false);retreat(s,2);assert.equal(r.room.cleared,false);r.player={x:r.room.exit.x,y:r.room.exit.y+1};reveal(r.room,r.player,sightRange(r));E.act(s,{type:'move',...r.room.exit},20);assert.equal(r.room.cleared,true);assert.equal(m.state,'ignored');assert.equal(m.rewardClaimed,false);assert.equal(e.hp,hp);assert.equal(e.windup,null);assert.equal(r.room.enemies.length,0);assert.ok(E.restoreState(JSON.stringify(s)));
});

test('a player can ignore the encounter entirely and clear without paying or defeating it',()=>{
 const s=start(),r=s.run,m=r.room.miniboss,before=[r.bag,...r.materials];r.room.quota=0;r.room.goal=0;r.room.minBeats=0;r.player={x:r.room.exit.x,y:r.room.exit.y+1};reveal(r.room,r.player,sightRange(r));E.act(s,{type:'move',...r.room.exit},0);assert.equal(r.room.cleared,true);assert.equal(m.state,'ignored');assert.deepEqual([r.bag,...r.materials],before);assert.ok(E.restoreState(JSON.stringify(s)));
});

test('victory pays fixed bonus plus ordinary kill loot once, preserves card healing and never registers a final boss victory',()=>{
 const {s,r,e,m}=arena(),reward=minibossReward(2),before={coins:r.bag,materials:[...r.materials],xp:s.experience.xp};r.health=50;r.cards.vampire=1;e.hp=1;
 E.act(s,{type:'hit',id:e.id},0);assert.equal(e.hp,0);assert.equal(m.rewardClaimed,true);assert.equal(m.state,'defeated');assert.equal(r.bag,before.coins+reward.coins+6);assert.equal(r.materials[reward.kind],before.materials[reward.kind]+reward.crystals);assert.equal(r.loot.enemies.count,1);assert.equal(r.loot.enemies.gems,r.bag);assert.equal(s.experience.xp,before.xp+12);assert.ok(r.health>54);assert.equal(r.room.bossDefeated,undefined);assert.equal(r.events.filter(e=>e.type==='minibossDefeated').length,1);assert.ok(E.restoreState(JSON.stringify(s)));
 const paid=[r.bag,...r.materials];assert.equal(rewardCaveMiniboss(s,e),false);E.act(s,{type:'hit',id:e.id},1);E.tick(s,1);assert.deepEqual([r.bag,...r.materials],paid);assert.equal(minibossEnemy(r),undefined);assert.ok(E.restoreState(JSON.stringify(s)));
});

test('resource bonus is not multiplied by loot upgrades and remains subject to ordinary return retention',()=>{
 const {s,r,e,m}=arena();s.starUpgrades.yield=3;r.cards.greed=8;r.cards.pockets=8;r.blessing='luck';r.blessingLevel=10;e.hp=1;r.blessing=null;E.act(s,{type:'hit',id:e.id},0);assert.equal(r.materials[m.reward.kind],m.reward.crystals);const resources=[...r.materials],bank=s.bank,coins=r.bag;E.finishRun(s);assert.equal(s.bank,bank+coins);assert.deepEqual(s.materials,resources);
});

test('save during warning restores the same scheduled hit; duplicate beats never replan it',()=>{
 const {s,r,e}=arena();beat(s,0,{type:'hit',id:e.id});for(let b=1;b<=4;b++)beat(s,b);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.deepEqual(restored.run.room.miniboss,r.room.miniboss);assert.deepEqual(minibossEnemy(restored.run).windup,e.windup);const w=structuredClone(e.windup);E.enemyBeat(restored,4);assert.deepEqual(minibossEnemy(restored.run).windup,w);
});

test('corrupt rewards, duplicate guardians, moved anchors and malformed attacks are rejected while old saves remain valid',()=>{
 const {s}=arena();const mutate=fn=>{const a=JSON.parse(JSON.stringify(s));fn(a.run);assert.equal(E.restoreState(JSON.stringify(a)),null);};
 mutate(r=>r.room.miniboss.reward.coins++);mutate(r=>r.room.miniboss.reward.crystals=9999);mutate(r=>r.room.miniboss.rewardClaimed=true);mutate(r=>r.room.miniboss.home.x++);mutate(r=>r.room.enemies.push({...r.room.enemies[0],id:99999}));mutate(r=>r.room.enemies[0].maxHp++);mutate(r=>r.room.enemies[0].windup={kind:'slam',beat:8,radius:1,x:0,y:0,tiles:[]});
 const old=JSON.parse(JSON.stringify(s));old.run.room.enemies=old.run.room.enemies.filter(e=>!e.miniboss);delete old.run.room.miniboss;assert.ok(E.restoreState(JSON.stringify(old)));
});

test('declared recovery and health do not depend on player upgrades; a dead guardian cannot keep attacking',()=>{
 const {s,r,e,m}=arena(),hp=minibossHealth(r);s.level=100;s.core=100;assert.equal(minibossHealth(r),hp);e.hp=0;m.state='defeated';m.rewardClaimed=true;m.near=false;stepCaveMiniboss(r,e,900);assert.equal(e.windup,null);assert.equal(allowMinibossDamage(r,e,true),false);
});

test('a dormant optional guardian never consumes the ordinary wave population cap',()=>{
 const s=start(16,712),r=s.run,e=minibossEnemy(r),plan=wavePlan(16,1),normal=r.room.enemies.find(e=>!e.miniboss),hall=r.room.layout.rooms.find(h=>E.distance(h,e)>30);assert.ok(hall);r.player={x:hall.x,y:hall.y};r.room.rocks=[];r.room.nodes=[];r.room.terrain.fill(0);r.room.enemies=[...Array.from({length:plan.cap-2},()=>({...normal,id:r.room.nextId++,windup:null,stunUntil:-1})),e];reveal(r.room,r.player,sightRange(r));const control=structuredClone(s);control.run.room.enemies=control.run.room.enemies.filter(e=>!e.miniboss);delete control.run.room.miniboss;
 for(const state of [s,control]){state.run.acted=16;E.tick(state,16);}assert.equal(r.room.enemies.filter(e=>!e.miniboss&&e.hp>0).length,plan.cap);assert.equal(r.room.enemies.filter(e=>!e.miniboss&&e.hp>0).length,control.run.room.enemies.filter(e=>e.hp>0).length);assert.equal(r.room.enemies.filter(e=>e.miniboss&&e.hp>0).length,1);assert.equal(r.room.miniboss.state,'dormant');
});
