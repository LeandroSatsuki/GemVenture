import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun,act,generateRoom,restoreState,finishRun} from '../dist/core.js';
import {recordFloorResult} from '../dist/descent-progress.js';
import {liftScreenMarkup,bindLiftNavigation} from '../dist/lift-view.js';
test('finishing a real floor stores its own score once and preserves the best across runs',()=>{
 const s=createState(31);startRun(s);const r=s.run;r.score.points=0;r.score.totalPoints=10000;r.room.floorStart.points=0;r.room.charge=r.room.quota;r.room.goal=1;r.room.minBeats=0;r.room.rocks=[];
 r.player={x:r.room.exit.x,y:r.room.exit.y+1};r.room.explored=null;r.room.visible=null;act(s,{type:'move',...r.room.exit},0);assert.equal(r.room.cleared,true);
 assert.equal(s.descent.records[1].points,r.score.points);assert.equal(s.descent.records[1].clears,1);assert.equal(recordFloorResult(s),false);
 const first=s.descent.records[1].points,stars=s.descent.records[1].stars;finishRun(s);const saved=restoreState(JSON.stringify(s));assert.deepEqual(saved.descent.records,s.descent.records);
 startRun(saved);saved.run.room.cleared=true;saved.run.score.points=1;recordFloorResult(saved);assert.deepEqual(saved.descent.records[1],{points:first,lastScore:1,clears:2,stars,lastTimeMs:0,bestTimeMs:0});
 saved.run.floor=2;generateRoom(saved);saved.run.room.cleared=true;saved.run.score.points+=600;recordFloorResult(saved);assert.equal(saved.descent.records[2].points,600);
 saved.run.mode='abyss';saved.run.room.recordSaved=false;assert.equal(recordFloorResult(saved),false);
});
test('old saves have no invented records and malformed records are rejected',()=>{
 const s=createState();delete s.descent.records;assert.deepEqual(restoreState(JSON.stringify(s)).descent.records,{});
 for(const records of [{1:{points:-1,clears:1}},{1:{points:100,clears:0}},{36:{points:3,clears:1}},[]]){s.descent.records=records;assert.equal(restoreState(JSON.stringify(s)),null);}
});
test('elevator shows one biome, five selectors and only the selected floor action without revealing future regions',()=>{
 const s=createState();s.best=2;const before=JSON.stringify(s);let html=liftScreenMarkup(s);assert.equal((html.match(/data-lift-biome=/g)||[]).length,1);assert.equal((html.match(/data-lift-floor=/g)||[]).length,5);assert.equal((html.match(/class="gv-v2-biome-banner"/g)||[]).length,1);assert.equal((html.match(/data-depart=/g)||[]).length,1);assert.match(html,/NÃO EXPLORADO/i);assert.match(html,/SEM REGISTRO/i);assert.doesNotMatch(html,/Floresta Esquecida/);
 s.descent.records[1]={points:2400,clears:2};html=liftScreenMarkup(s);assert.match(html,/2\.400 PTS/);assert.match(html,/2 VITÓRIAS/i);assert.ok(html.toUpperCase().indexOf('>ANDARES<')<html.toUpperCase().indexOf('>ABISMO<'));assert.match(html,/class="gv-v2-tab-icon" aria-hidden="true"><svg/);
 assert.doesNotMatch(liftScreenMarkup(s,1,'abyss'),/data-lift-biome=/);
 const unknown=liftScreenMarkup(s,5);assert.doesNotMatch(unknown,/data-stop=|data-depart=|Rei Geodo/);assert.match(unknown,/NÃO EXPLORADO/i);
 const invalid=liftScreenMarkup(s,31);assert.match(invalid,/data-lift-floor="1" aria-pressed="true"/);
 delete s.descent.records[1];assert.equal(JSON.stringify(s),before,'browsing cannot spend resources or update discovery');
});

test('floor navigation switches selection with arrows, Home and End, without triggering travel',()=>{
 const selections=[],buttons=[1,2,3,4,5].map(floor=>({dataset:{liftFloor:String(floor)},getAttribute:()=>String(floor),click(){this.onclick();}}));
 const root={querySelector:()=>null,querySelectorAll:selector=>selector==='[data-lift-floor]'?buttons:[]};bindLiftNavigation(root,(floor,selector)=>selections.push({floor,selector}));
 let prevented=0;const key=(index,value)=>buttons[index].onkeydown({key:value,preventDefault:()=>prevented++});
 buttons[1].click();key(1,'ArrowRight');key(4,'ArrowRight');key(0,'ArrowLeft');key(2,'Home');key(2,'End');key(2,'Escape');
 assert.deepEqual(selections.map(s=>s.floor),[2,3,1,5,1,5]);assert.equal(prevented,5);assert.equal(selections[0].selector,'[data-lift-floor="2"]');
});
