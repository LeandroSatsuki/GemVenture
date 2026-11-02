import {reveal,sightRange} from '../dist/cavern.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {canStartAt,recordFloorResult,canEnterAbyss,ABYSS_GATE_COST,depositGate} from '../dist/descent-progress.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {liftScreenMarkup} from '../dist/lift-view.js';
import {floorRecordsMarkup} from '../dist/floor-records-view.js';
import {runBeatTime} from '../dist/training-clock.js';
test('post-Geode seal reveals biome two and gives its entrance without false completions or payment',()=>{
 const s=E.createState(41001);s.best=5;s.descent.bosses=[5];s.journey.earnedStars=3;s.floorStars={1:3};s.stars=3;
 assert.equal(canStartAt(s,6),false);const before=JSON.stringify([s.materials,s.bank,s.stars,s.descent.records]);assert.ok(E.purchaseSeal(s));
 const vm=liftHostPresentationModel(s,6);assert.equal(vm.biomeCards.length,2);assert.equal(vm.selectedFloor,6);assert.equal(vm.selected.stopActive,true);assert.equal(vm.actions.depart.enabled,true);assert.equal(vm.biomeCards[1].explored,0);
 assert.equal(JSON.stringify([s.materials,s.bank,s.stars,s.descent.records]),before);assert.equal(s.best,5);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.ok(E.startRun(restored,'floors',6));assert.equal(restored.run.floor,6);assert.equal(canStartAt(s,7),false);
});
test('all seven biomes and 35 floors stay playable through seal progression, with free entries only',()=>{
 const s=E.createState(81273);s.journey.earnedStars=175;s.stars=175;
 for(let biome=0;biome<7;biome++){
  const start=biome*5+1;assert.ok(E.startRun(s,'floors',start));assert.equal(s.run.floor,start);assert.equal(E.biomeIndex(start),biome);
  s.run.floor=start+4;E.generateRoom(s);assert.ok(s.run.room.enemies.some(e=>e.boss&&e.bossIndex===biome));E.finishRun(s,'return');s.best=start+4;
  if(biome<6){assert.ok(E.purchaseSeal(s));const copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.ok(canStartAt(copy,start+5));}
 }
 assert.equal(E.depthLimit(s),35);assert.equal(liftHostPresentationModel(s,35).biomeCards.length,7);assert.equal(E.purchaseSeal(s),false);assert.equal(canStartAt(s,36),false);
});
test('real completion records time, latest score, best score and rating; replay only improves bests',()=>{
 const s=E.createState(41001);E.startRun(s);const r=s.run;r.room.charge=r.room.quota;r.combo=r.room.goal;
 r.items.ward=0;assert.equal(E.act(s,{type:'item',item:'ward'},96.05).ok,false);assert.equal(s.descent.records[1],undefined);
 r.items.ward=1;assert.equal(E.act(s,{type:'item',item:'ward'},97).ok,true);assert.equal(r.room.cleared,false);r.player={x:r.room.exit.x,y:r.room.exit.y+1};reveal(r.room,r.player,sightRange(r));assert.equal(E.act(s,{type:'move',...r.room.exit},98).ok,true);
 assert.ok(r.room.cleared);const a={...s.descent.records[1]};assert.ok(a.bestTimeMs>0);assert.equal(a.lastScore,r.score.points);assert.equal(a.stars,r.score.earned);assert.equal(a.clears,1);
 assert.equal(recordFloorResult(s),false);assert.equal(s.descent.records[1].clears,1);
 const copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.deepEqual(copy.descent.records[1],a);
 E.finishRun(copy);E.startRun(copy);copy.run.score.points=1;copy.run.room.cleared=true;recordFloorResult(copy,200);
 const b=copy.descent.records[1];assert.equal(b.lastScore,1);assert.equal(b.points,a.points);assert.equal(b.bestTimeMs,a.bestTimeMs);assert.equal(b.lastTimeMs,Math.round(runBeatTime(copy.run,200)*1000));assert.equal(b.clears,2);
 const vm=liftHostPresentationModel(copy,1);assert.equal(vm.selected.performance.bestTimeMs,a.bestTimeMs);assert.equal(vm.selected.performance.lastScore,1);assert.match(floorRecordsMarkup(copy),/Desempenho pessoal/);
});
test('legacy records retain proven data; invalid timing is refused; no training or Abyss records',()=>{
 const s=E.createState(42);s.descent.records[1]={points:321,stars:2,clears:1};let copy=E.restoreState(JSON.stringify(s));assert.deepEqual(copy.descent.records[1],s.descent.records[1]);
 assert.equal(liftHostPresentationModel(copy,1).selected.performance.bestTimeMs,null);
 for(const v of [-1,1.5,null,'100']){s.descent.records[1].bestTimeMs=v;assert.equal(E.restoreState(JSON.stringify(s)),null);}
 delete s.descent.records[1].bestTimeMs;E.startRun(s);s.run.room.cleared=true;s.run.trainingClock={version:1,bpm:100};assert.equal(recordFloorResult(s),false);delete s.run.trainingClock;s.run.mode='abyss';assert.equal(recordFloorResult(s),false);
});
test('Abyss openly states its exact gate and remains locked until both independent requirements are met',()=>{
 const s=E.createState(77);const html=liftScreenMarkup(s,1,'abyss');assert.match(html,/COMO LIBERAR/);assert.match(html,/4–5 \(20\)/);assert.match(html,/Não exige terminar os 35 andares/);
 assert.equal((html.match(/data-gate="/g)||[]).length,4);assert.ok(html.indexOf('COMO LIBERAR')<html.indexOf('id="abyssStart"'));
 s.descent.bosses=[20];assert.equal(canEnterAbyss(s),false);s.materials=[...ABYSS_GATE_COST];for(let i=0;i<4;i++)depositGate(s,i,ABYSS_GATE_COST[i]);assert.ok(canEnterAbyss(s));assert.ok(E.startRun(s,'abyss'));
});
