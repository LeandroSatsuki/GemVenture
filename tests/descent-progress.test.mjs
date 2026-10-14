import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {floorAddress,ABYSS_GATE_COST,gateProgress,canEnterAbyss,depositGate,unlockStop,stopCost,recordBossVictory} from '../dist/descent-progress.js';
import {gateMarkup,departureMarkup} from '../dist/lift-view.js';

test('floor addresses reset every five floors and remain distinct beyond current content',()=>{
 assert.equal(floorAddress(1).code,'1–1');assert.equal(floorAddress(9).code,'2–4');assert.ok(floorAddress(9).nextBoss);assert.ok(floorAddress(10).boss);
 assert.deepEqual(floorAddress(500003),{region:100001,step:3,code:'100001–3',boss:false,nextBoss:false});
 assert.throws(()=>floorAddress(0));assert.throws(()=>floorAddress(Infinity));
});
test('abyss requires both four-color construction and the final boss, checked by the engine',()=>{
 const s=E.createState(11);s.materials=[...ABYSS_GATE_COST];const before=s.attempts;
 assert.equal(E.startRun(s,'abyss'),false);assert.equal(s.attempts,before);
 for(let i=0;i<4;i++)assert.equal(depositGate(s,i,ABYSS_GATE_COST[i]),ABYSS_GATE_COST[i]);
 assert.equal(gateProgress(s),1);assert.equal(canEnterAbyss(s),false);assert.equal(E.startRun(s,'abyss'),false);
 s.descent.bosses=[20];assert.ok(canEnterAbyss(s));assert.ok(E.startRun(s,'abyss'));assert.equal(depositGate(s,0),0);
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);E.finishRun(t,'death');assert.ok(canEnterAbyss(t));assert.ok(E.startRun(t,'abyss'));
});
test('partial deposits preserve each color, clamp to inventory and never charge past completion',()=>{
 const s=E.createState(12);s.materials=[40,120,0,0];assert.equal(depositGate(s,0),40);assert.equal(depositGate(s,1),100);
 assert.deepEqual(s.materials,[0,20,0,0]);assert.deepEqual(s.descent.gate,[40,100,0,0]);
 const t=E.restoreState(JSON.stringify(s));assert.deepEqual(t.descent.gate,s.descent.gate);
 t.materials[0]=10000;assert.equal(depositGate(t,0,10000),1460);assert.equal(depositGate(t,0),0);assert.equal(t.materials[0],8540);
 for(const [i,n]of [[-1,10],[4,10],[0,-1],[0,Infinity],[0,2.5]])assert.equal(depositGate(t,i,n),0);
});
test('stops require discovery, biome access and exact payment; fresh departures retain no run bonuses',()=>{
 const s=E.createState(12);s.best=11;s.materials=[999,999,999,999];const old=[...s.materials];
 assert.equal(unlockStop(s,12),false);assert.equal(unlockStop(s,11),false);assert.deepEqual(s.materials,old);
 s.seals=2;assert.ok(unlockStop(s,11));assert.deepEqual(s.materials,old.map((n,i)=>n-stopCost(11)[i]));assert.equal(unlockStop(s,11),false);
 assert.equal(E.startRun(s,'floors',10),false);assert.equal(E.startRun(s,'floors',500003),false);assert.ok(E.startRun(s,'floors',11));
 assert.equal(s.run.floor,11);assert.equal(s.run.combo,0);assert.deepEqual(s.run.cards,{});assert.equal(s.run.bag,0);assert.equal(s.run.health,E.maxHealth(s));
 const t=E.restoreState(JSON.stringify(s));assert.ok(t.descent.stops.includes(11));E.finishRun(t,'death');assert.ok(E.startRun(t,'floors',11));
});
test('real boss kill permanently records victory once; abyss invaders do not unlock the campaign gate',()=>{
 const s=E.createState(55);s.seals=3;s.best=20;E.startRun(s);s.run.floor=20;E.generateRoom(s);
 const r=s.run,boss=r.room.enemies.find(e=>e.boss);boss.hp=1;boss.exposedUntil=999;boss.windup=null;r.room.rocks=[];r.room.nodes=[];r.player={x:boss.x-1,y:boss.y};
 E.act(s,{type:'hit',id:boss.id},0);assert.ok(r.room.bossDefeated);assert.deepEqual(s.descent.bosses,[20]);recordBossVictory(s,20);assert.deepEqual(s.descent.bosses,[20]);
 r.mode='abyss';recordBossVictory(s,5);assert.deepEqual(s.descent.bosses,[20]);
});
test('legacy saves preserve active abyss runs but do not manufacture gate contributions or final victories',()=>{
 const s=E.createState(55);s.best=16;delete s.descent;const t=E.restoreState(JSON.stringify(s));assert.deepEqual(t.descent.bosses,[5,10,15]);assert.deepEqual(t.descent.gate,[0,0,0,0]);
 s.best=20;assert.equal(canEnterAbyss(E.restoreState(JSON.stringify(s))),false);
 t.descent.bosses.push(20);t.descent.gate=[...ABYSS_GATE_COST];E.startRun(t,'abyss');delete t.descent;assert.equal(E.restoreState(JSON.stringify(t)).run.mode,'abyss');
 const bad=E.createState();bad.descent.gate[0]=1501;assert.equal(E.restoreState(JSON.stringify(bad)),null);bad.descent.gate[0]=0;bad.descent.stops.push(9);assert.equal(E.restoreState(JSON.stringify(bad)),null);
});
test('gate view exposes progress, named mineral costs and disabled entry; departure lists purchased stops only',()=>{
 const s=E.createState();const gate=gateMarkup(s);assert.match(gate,/PORTÃO SELADO/);assert.match(gate,/id="abyssStart" disabled/);assert.match(gate,/Quartzo/);assert.match(gate,/aria-valuenow="0"/);
 s.best=15;assert.doesNotMatch(departureMarkup(s),/value="11"/);s.descent.stops.push(11);s.seals=2;assert.match(departureMarkup(s),/value="11"/);
});
