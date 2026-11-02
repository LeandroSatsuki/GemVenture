import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {wavePlan} from '../dist/cavern.js';
import {cavePressure} from '../dist/cave-descent.js';
import {CaveAlertModel,caveAlertView,HORDE_ARRIVAL_MS} from '../dist/cave-alerts-model.js';
const start=()=>{const s=E.createState(43);E.startRun(s);return s;};

test('anticipation follows the real wave window and shared phase; it never forecasts a creature count',()=>{
 const s=start(),r=s.run,plan=wavePlan(r.floor,r.room.wave.number+1),end=r.room.wave.next,before=JSON.stringify(s);
 assert.equal(caveAlertView(r,end-plan.warning-1).horde,null);
 const a=caveAlertView(r,end-plan.warning),b=caveAlertView(r,end-plan.warning/2);
 assert.equal(a.horde.remaining,plan.warning);assert.equal(a.horde.progress,0);assert.equal(b.horde.progress,.5);assert.equal('count' in b.horde,false);
 assert.equal(JSON.stringify(s),before);
});
test('pressure uses actual campaign thresholds, stages and damage, and coexists with horde warnings',()=>{
 const s=start(),r=s.run,threshold=cavePressure(r).start;r.room.wave.next=threshold;
 assert.equal(caveAlertView(r,threshold-17).pressure,null);
 assert.equal(caveAlertView(r,threshold-16).pressure.remaining,16);
 const both=caveAlertView(r,threshold-1);assert.equal(both.horde.state,'warning');assert.equal(both.pressure.state,'warning');
 for(const stage of [1,2,3]){const v=caveAlertView(r,threshold+(stage-1)*64);assert.equal(v.pressure.stage,stage);assert.equal(v.pressure.damagePercent,stage*25);}
 r.beat=threshold+64;assert.equal(caveAlertView(r,0).pressure.damagePercent,50);
 r.room.cleared=true;assert.deepEqual(caveAlertView(r,threshold),{horde:null,pressure:null});
});
test('an actual confirmed horde reports zero spawned creatures accurately, freezes and deduplicates without mutating the game',()=>{
 const s=start(),r=s.run;r.room.wave.next=4;r.room.enemies=[];r.room.visible=Array(r.room.cols*r.room.rows).fill(1);r.room.explored=Array(r.room.cols*r.room.rows).fill(1);
 E.tick(s,4);const event=r.events.find(e=>e.type==='horde');assert.ok(event);assert.equal(event.count,0);
 const before=JSON.stringify(s),model=new CaveAlertModel();assert.equal(model.accept(r.events,r),1);assert.equal(model.accept(r.events,r),0);
 assert.deepEqual(model.sample(r,4).horde,{state:'arrived',number:event.number,count:0});
 model.advance(500);const left=model.remainingMs;model.advance(9000,{blocked:true});assert.equal(model.remainingMs,left);
 model.advance(HORDE_ARRIVAL_MS);assert.equal(model.sample(r,4).horde,null);assert.equal(model.accept(r.events,r),0);assert.equal(JSON.stringify(s),before);
});
test('restored/current wave number never implies an arrival; room changes clear cosmetic state and unsupported pressure stays absent',()=>{
 const s=start(),r=s.run,model=new CaveAlertModel();r.room.wave.number=1;model.setContext(r);assert.equal(model.sample(r,0).horde,null);
 assert.equal(model.accept([{type:'horde',number:1,count:3}],r),1);
 assert.equal(model.accept([{type:'horde',number:1,count:4},{type:'horde',number:2,count:3},{type:'horde',number:1,count:-1}],r),0);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(model.sample(restored.run,0).horde,null);
 const abyss={...r,mode:'abyss'};assert.equal(caveAlertView(abyss,10000).pressure,null);
 const training={...r,trainingClock:{version:1,bpm:100}};assert.deepEqual(caveAlertView(training,10000),{horde:null,pressure:null});
});
