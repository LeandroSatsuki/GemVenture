import test from 'node:test';
import assert from 'node:assert/strict';
import {CaveHoleDescent,holeClickTarget} from '../dist/cave-hole-descent.js';
const project=(x,y)=>({x:100+44*x+4*y,y:115+32*y});
function run(){return{mode:'floors',floor:1,room:{campaignCave:{version:1},cols:20,exit:{x:8,y:5},cleared:true,stairDeparted:true,enemies:[]}};}
test('fall waits for rendered approach, freezes on pause and completes once only',()=>{
 const r=run(),before=JSON.stringify(r),d=new CaveHoleDescent();assert.ok(d.begin(r,project));assert.equal(d.begin(r,project),false);
 d.step(10,{moving:true});assert.equal(d.phase,'approach');assert.equal(d.pose(),null);
 d.step(.02);assert.equal(d.phase,'fall');assert.equal(d.pose().progress,0);
 d.step(1,{paused:true});assert.equal(d.pose().progress,0);
 for(let i=0;i<7;i++)d.step(.05);const p=d.pose();assert.ok(p.scale<1&&p.drop>0&&p.alpha<1);assert.equal(d.takeCompletion(),false);
 for(let i=0;i<8;i++)d.step(.05);assert.equal(d.pending,false);assert.equal(d.pose().alpha,0);assert.equal(d.takeCompletion(),true);assert.equal(d.takeCompletion(),false);assert.equal(JSON.stringify(r),before);
 d.reset();assert.equal(d.falling,false);assert.equal(d.pose(),null);
});
test('reduced motion fades without displacement or rotation and clock gaps stay bounded',()=>{
 const d=new CaveHoleDescent();d.begin(run(),project);d.step(.01,{soft:true});d.step(100,{soft:true});assert.equal(d.phase,'fall');const p=d.pose(true);assert.equal(p.drop,0);assert.equal(p.scale,1);assert.equal(p.tilt,0);assert.ok(p.alpha<1&&p.alpha>0);for(let i=0;i<5;i++)d.step(.05,{soft:true});assert.equal(d.takeCompletion(),true);
});
test('only a new actual campaign departure starts presentation; restored completion is inert',()=>{
 const d=new CaveHoleDescent();assert.equal(d.pending,false);assert.equal(d.takeCompletion(),false);
 for(const patch of [{mode:'abyss'},{trainingClock:{}},{room:{...run().room,cleared:false}},{room:{...run().room,stairDeparted:false}}])assert.equal(d.begin({...run(),...patch},project),false);
 assert.equal(d.begin(run(),project),true);
});
test('hole click accepts its visible silhouette and preserves the boss and exploration gates',()=>{
 const r=run();r.room.cleared=false;const p=project(8,5);assert.deepEqual(holeClickTarget(r,p,project),r.room.exit);assert.deepEqual(holeClickTarget(r,{x:p.x-24,y:p.y-10},project),r.room.exit);assert.equal(holeClickTarget(r,{x:p.x+90,y:p.y},project),null);
 r.floor=5;assert.equal(holeClickTarget(r,p,project),null);r.room.bossDefeated=true;assert.ok(holeClickTarget(r,p,project));r.room.explored=Array(400).fill(0);assert.equal(holeClickTarget(r,p,project),null);r.room.explored[5*20+8]=1;assert.ok(holeClickTarget(r,p,project));
});
