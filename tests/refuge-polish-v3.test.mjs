import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createState,startRun,restoreState,generateRoom} from '../dist/core.js';
import {closeMinibossFloor} from '../dist/cave-miniboss.js';
import {recordFloorResult} from '../dist/descent-progress.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {currentCreatureArt} from '../dist/current-creature-art.js';
import {HUB_GUIDES} from '../dist/tutorial-hub-guide.js';
import {makeOffering} from '../dist/pillars.js';
import {buildingUpgrade} from '../dist/village.js';
test('floor stars record only the individual floor rating, preserve best, survive restore and never invent history',()=>{
 const s=createState(41001);startRun(s);s.run.room.floorStart.stars=1;s.run.score.earned=2;closeMinibossFloor(s.run);s.run.room.enemies=[];s.run.room.cleared=true;recordFloorResult(s);
 assert.equal(s.descent.records[1].stars,2);assert.equal(liftHostPresentationModel(s).floors[0].stars.earned,2);
 s.run.floor=2;generateRoom(s);closeMinibossFloor(s.run);s.run.room.enemies=[];s.run.room.cleared=true;s.run.score.earned=4;recordFloorResult(s);assert.equal(s.descent.records[2].stars,4);
 const loaded=restoreState(JSON.stringify(s));assert.ok(loaded);assert.equal(loaded.descent.records[1].stars,2);
 s.descent.records[1]={points:900,clears:1};assert.equal(restoreState(JSON.stringify(s)).descent.records[1].stars,undefined);
 s.descent.records[1].stars=6;assert.equal(restoreState(JSON.stringify(s)),null);
});
test('all seven biome panoramas and current enemies resolve to actual files without changing discovery',()=>{
 const s=createState(),before=JSON.stringify(s),vm=liftHostPresentationModel(s);assert.equal(JSON.stringify(s),before);assert.equal(vm.biomeCards.length,1);
 for(const b of vm.visualCatalog){assert.ok(readFileSync(new URL('../dist/'+b.panorama.source,import.meta.url)).length>10000);for(const type of ['slime','bat','golem']){const a=currentCreatureArt(type,b.id);assert.match(a.id,/generated-/);assert.ok(readFileSync(new URL('../dist/'+a.source,import.meta.url)).length>1000);}}
});
test('retired well and absent characters are not offered in current guides or transactions',()=>{
 assert.ok(!HUB_GUIDES.some(x=>['well','zag','miner'].includes(x.id)));assert.ok(HUB_GUIDES.some(x=>x.id==='stars'));
 const s=createState(),before=JSON.stringify(s);assert.equal(makeOffering(s,0),null);assert.equal(buildingUpgrade(s,'well'),null);assert.equal(JSON.stringify(s),before);
});
