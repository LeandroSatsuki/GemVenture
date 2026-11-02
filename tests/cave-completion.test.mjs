// Forced low-HP departure fixtures exercise legacy saves; fresh crown victories are covered by geode-crown-official.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {caveObjective,stairObjective,autoContinueStair,cavePressure} from '../dist/cave-descent.js';
import {reveal,sightRange} from '../dist/cavern.js';
import {scoreBeats,awardScore} from '../dist/stars.js';
import {CaveHoleDescent} from '../dist/cave-hole-descent.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';
function start(floor=1){const s=E.createState(43);s.seals=6;E.startRun(s);if(floor!==1){s.run.floor=floor;E.generateRoom(s);}delete s.run.room.campaignCave.departureVersion;return s;}
test('one visible charge target unlocks departure anywhere without combo, time, exploration or the hole',()=>{
 const s=start(),r=s.run,position={...r.player};r.room.minBeats=99999;r.room.goal=999;r.combo=0;r.room.charge=r.room.quota-1;
 assert.equal(caveObjective(r).ready,false);assert.equal(stairObjective(r),'MINERE CRISTAIS');const before=JSON.stringify(s);assert.equal(E.completeCaveFloor(s),false);assert.equal(JSON.stringify(s),before);
 r.room.charge++;assert.equal(caveObjective(r).ready,true);assert.equal(stairObjective(r),'DESCIDA LIBERADA');assert.equal(r.room.cleared,false);assert.ok(E.completeCaveFloor(s));assert.deepEqual(r.player,position);assert.notDeepEqual(position,r.room.exit);assert.equal(r.room.stairDeparted,undefined);assert.equal(new CaveHoleDescent().begin(r,(x,y)=>({x,y})),false);
});
test('ready charge preserves continued exploration and its pressure; it does not close the room automatically',()=>{
 const s=start(),r=s.run;r.room.charge=r.room.quota;r.room.enemies=[];r.room.wave.next=1e9;
 E.act(s,{type:'move',...r.player},0);assert.equal(r.room.cleared,false);r.acted=400;E.tick(s,400);assert.equal(r.room.cleared,false);assert.equal(cavePressure(r).stage,1);assert.equal(caveObjective(r).ready,true);
});
test('completion settles once, restores safely, preserves loot and requires a card before descending',()=>{
 const s=start(),r=s.run;r.room.charge=r.room.quota;r.bag=25;const health=r.health,materials=[...r.materials];assert.ok(E.completeCaveFloor(s,0));const once=JSON.stringify(s);assert.equal(E.completeCaveFloor(s,0),false);assert.equal(JSON.stringify(s),once);assert.equal(r.events.filter(e=>e.type==='clear').length,1);assert.equal(r.cardOffer.length,3);assert.equal(r.bag,25);assert.deepEqual(r.materials,materials);assert.equal(E.descend(s),false);assert.equal(autoContinueStair(s),false);
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.ok(E.chooseCard(t,t.run.cardOffer[0]));assert.equal(autoContinueStair(t),true);assert.ok(E.descend(t));assert.equal(t.run.floor,2);assert.equal(t.run.health,health);assert.equal(t.run.bag,25);assert.equal(caveObjective(t.run).ready,false);
});
test('full charge cannot bypass the mandatory boss, while its confirmed death unlocks departure in place',()=>{
 const s=start(5),r=s.run,b=r.room.enemies.find(e=>e.boss);r.room.charge=999;assert.equal(E.completeCaveFloor(s),false);assert.equal(stairObjective(r),'DERROTE O CHEFE');delete b.crown;b.windup=null;b.recoverUntil=3;r.player={x:b.x-1,y:b.y};b.hp=1;E.act(s,{type:'hit',id:b.id},0);assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,false);assert.equal(caveObjective(r).ready,true);assert.equal(stairObjective(r),'CHEFE DERROTADO');assert.ok(E.completeCaveFloor(s));assert.ok(E.restoreState(JSON.stringify(s)));
});
test('the physical hole remains an early exit below the charge target',()=>{
 const s=start(),r=s.run,e=r.room.exit;r.player=[[0,1],[1,0],[-1,0],[0,-1]].map(([x,y])=>({x:e.x+x,y:e.y+y})).find(p=>E.walkable(r.room,p.x,p.y));reveal(r.room,r.player,sightRange(r));assert.equal(caveObjective(r).ready,false);assert.ok(E.act(s,{type:'move',...e},0).ok);assert.equal(r.room.cleared,true);assert.equal(r.room.stairDeparted,true);
});
test('departure abandons the optional miniboss without granting its resources or requiring its death',()=>{
 const s=start(2),r=s.run,m=r.room.miniboss;r.room.charge=r.room.quota;const loot=[r.bag,...r.materials];assert.ok(E.completeCaveFloor(s));assert.equal(m.state,'ignored');assert.equal(m.rewardClaimed,false);assert.deepEqual([r.bag,...r.materials],loot);
});
test('completion after the score window cannot award points or duplicate stars, even across reload',()=>{
 const s=start(),r=s.run;awardScore(s,r.score.target*.5,0);r.room.charge=r.room.quota;r.beat=scoreBeats(r)+500;r.acted=r.beat;const stars=s.stars,points=r.score.points;assert.ok(E.completeCaveFloor(s));assert.equal(r.score.points,points);assert.equal(s.stars,stars);const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(E.completeCaveFloor(t),false);assert.equal(t.stars,stars);
});
test('training, Abyss, legacy rooms and recovery never gain the new departure action',()=>{
 for(const mode of ['training','abyss','legacy','recovery','rest']){const s=start(),r=s.run;r.room.charge=r.room.quota;if(mode==='training')r.trainingClock={};if(mode==='abyss')r.mode='abyss';if(mode==='legacy')rectangularRoom(s);if(mode==='recovery')r.recovery={active:true};if(mode==='rest')r.rest={active:true};const before=JSON.stringify(s);assert.equal(E.completeCaveFloor(s),false,mode);assert.equal(JSON.stringify(s),before,mode);}
});
test('first-floor quota and pacing remain gentle and upgrades keep their existing charge contribution',()=>{
 const s=E.createState(43);s.starUpgrades.charge=3;E.startRun(s);const r=s.run;assert.equal(r.room.quota,18);assert.equal(r.room.charge,3);assert.equal(caveObjective(r).value,3);assert.equal(r.room.wave.next,40);assert.equal(cavePressure(r,383).stage,0);const snapshot=JSON.stringify(s);for(const bad of [NaN,Infinity,-1])assert.equal(E.completeCaveFloor(s,bad),false);assert.equal(JSON.stringify(s),snapshot);
});
