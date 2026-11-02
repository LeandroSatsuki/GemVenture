import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun,finishRun,restoreState} from '../dist/core.js';
import {recordFloorResult} from '../dist/descent-progress.js';
import {liftPresentationModel,expeditionMap} from '../dist/expedition-map.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {liftScreenMarkup} from '../dist/lift-view.js';

const counts=s=>liftPresentationModel(s).biomes.map(b=>b.explored);
const record=(clears=1,stars=0)=>({points:100,clears,stars});

test('discovery, unlocked stops and guardians do not invent explored floors',()=>{
 const s=createState();assert.deepEqual(counts(s),[0]);
 s.best=35;s.seals=6;s.descent.stops=Array.from({length:35},(_,i)=>i+1);
 s.descent.bosses=[5,10,15,20,25,30,35];
 const before=JSON.stringify(s);assert.deepEqual(counts(s),[0,0,0,0,0,0,0]);
 assert.equal(JSON.stringify(s),before);
 delete s.descent.records;
 const restored=restoreState(JSON.stringify(s));assert.ok(restored);
 assert.deepEqual(counts(restored),[0,0,0,0,0,0,0]);
});

test('biome counters use unique completed floors and agree in visual and accessible labels',()=>{
 const s=createState();s.best=35;s.seals=6;
 s.descent.records={1:record(8),3:record(1,5),5:record(2),6:record(5),10:record(),11:record(),15:record(),35:record()};
 const expected=[3,2,2,0,0,0,1],before=JSON.stringify(s);
 assert.deepEqual(counts(s),expected);
 assert.deepEqual(liftHostPresentationModel(s).biomeCards.map(b=>b.explored),expected);
 for(const html of [expeditionMap(s),liftScreenMarkup(s)]){
  assert.deepEqual([...html.matchAll(/<em>(\d)\/5 explorados<\/em>/g)].map(m=>Number(m[1])),expected);
  assert.deepEqual([...html.matchAll(/aria-label="[^"\n]+, (\d)\/5 explorados/g)].map(m=>Number(m[1])),expected);
 }
 assert.equal(JSON.stringify(s),before,'Rendering must not modify the player profile');
});

test('five of five requires all five distinct floors, including the guardian floor',()=>{
 const s=createState();s.best=6;
 s.descent.records={1:record(10,5),2:record(),3:record(),4:record()};
 assert.deepEqual(counts(s),[4,0]);
 s.descent.records[5]=record();assert.deepEqual(counts(s),[5,0]);
 s.descent.records[6]=record();assert.deepEqual(counts(s),[5,1]);
});

test('a recorded clear updates exploration, survives save restore and is not counted twice',()=>{
 let s=createState();assert.ok(startRun(s));assert.deepEqual(counts(s),[0]);
 assert.equal(recordFloorResult(s),false);assert.deepEqual(counts(s),[0]);
 s.run.room.cleared=true;assert.equal(recordFloorResult(s),true);assert.deepEqual(counts(s),[1]);
 finishRun(s);s=restoreState(JSON.stringify(s));assert.ok(s);assert.deepEqual(counts(s),[1]);
 assert.ok(startRun(s));s.run.room.cleared=true;assert.equal(recordFloorResult(s),true);
 assert.equal(s.descent.records[1].clears,2);assert.deepEqual(counts(s),[1]);
 s.run.mode='abyss';s.run.floor=2;s.run.room.recordSaved=false;
 assert.equal(recordFloorResult(s),false);assert.deepEqual(counts(s),[1]);
});
