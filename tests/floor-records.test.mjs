import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun,act,generateRoom,restoreState,finishRun} from '../dist/core.js';
import {recordFloorResult} from '../dist/descent-progress.js';
import {liftScreenMarkup} from '../dist/lift-view.js';
test('finishing a real floor stores its own score once and preserves the best across runs',()=>{
 const s=createState(31);startRun(s);const r=s.run;r.score.points=10000;r.room.floorStart.points=10000;r.room.charge=r.room.quota;r.room.goal=1;r.room.minBeats=0;r.room.rocks=[];
 act(s,{type:'move',x:r.player.x+1,y:r.player.y},0);assert.equal(r.room.cleared,true);
 assert.equal(s.descent.records[1].points,r.score.points-10000);assert.equal(s.descent.records[1].clears,1);assert.equal(recordFloorResult(s),false);
 const first=s.descent.records[1].points;finishRun(s);const saved=restoreState(JSON.stringify(s));assert.deepEqual(saved.descent.records,s.descent.records);
 startRun(saved);saved.run.room.cleared=true;saved.run.score.points=1;recordFloorResult(saved);assert.deepEqual(saved.descent.records[1],{points:first,clears:2});
 saved.run.floor=2;generateRoom(saved);saved.run.room.cleared=true;saved.run.score.points+=600;recordFloorResult(saved);assert.equal(saved.descent.records[2].points,600);
 saved.run.mode='abyss';saved.run.room.recordSaved=false;assert.equal(recordFloorResult(saved),false);
});
test('old saves have no invented records and malformed records are rejected',()=>{
 const s=createState();delete s.descent.records;assert.deepEqual(restoreState(JSON.stringify(s)).descent.records,{});
 for(const records of [{1:{points:-1,clears:1}},{1:{points:100,clears:0}},{36:{points:3,clears:1}},[]]){s.descent.records=records;assert.equal(restoreState(JSON.stringify(s)),null);}
});
test('biome groups start collapsed, include five slots, and do not reveal undiscovered biomes',()=>{
 const s=createState();s.best=2;let html=liftScreenMarkup(s);assert.equal((html.match(/<details id="map-biome-/g)||[]).length,1);assert.equal((html.match(/class="map-stop"/g)||[]).length,5);assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|>)/);assert.match(html,/NÃO EXPLORADO/);assert.match(html,/SEM REGISTRO/);
 s.descent.records[1]={points:2400,clears:2};html=liftScreenMarkup(s);assert.match(html,/2\.400 PTS/);assert.match(html,/2 VITÓRIAS/);assert.ok(html.indexOf('>ANDARES<')<html.indexOf('>ABISMO<'));assert.match(html,/class="lift-mode-icon"><svg/);
 assert.doesNotMatch(liftScreenMarkup(s,1,'abyss'),/map-biome-/);
});
