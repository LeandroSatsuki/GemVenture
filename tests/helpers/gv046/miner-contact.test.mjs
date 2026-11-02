import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as M from './miner.candidate.mjs';
import * as Old from '../../fixtures/miner-v3.mjs';
import {createState} from '../../../dist/core.js';
const epoch=1700000000000;
function fixture(api=M,seed=7){const s=createState(seed);s.miner=api.createMiner(seed);api.setMinerEnabled(s,true,epoch);return s;}
function next(s,api=M){const b=api.minerBlock(s.miner),m=s.miner,rate=(100+2*(m.level-1))*(m.overdrive>0?4:1);return api.settleMiner(s,m.lastAt+Math.max(1,Math.ceil((b.work-m.carry)/rate)));}
test('seed1 catches the intact previous-row prism before the planned next row',async()=>{
 const baseline=JSON.parse(await readFile(new URL('baseline.json',import.meta.url),'utf8')).findings.firstSolid;
 const m=M.restoreMiner(baseline.miner),b=M.minerBlock(m);
 assert.equal(b.type,'prism');assert.equal(b.step,1);assert.equal(b.col,2);assert.equal(b.plan.aim.row,2);
 const end=M.minerFlight(m,1);assert.equal(end.row,1);assert.equal(end.lift,0);assert.ok(Math.abs(end.physicalTipRow-1)<1e-9);
 const s=fixture();s.miner=m;const r=next(s);assert.equal(r.steps,0);assert.equal(r.impacts,1);assert.equal(r.events[0].destroyed,false);assert.equal(s.miner.steps,1);
});
test('stone and dense retain exact total resistance with partial bounce contacts and no partial payout',()=>{
 for(const [type,power,total]of [['stone',0,100000],['dense',0,200000],['dense',20,100000+Math.round(100000/2.2)]]){
  const api=M.createMinerModel({tileOverride:()=>type}),s=fixture(api);s.miner.power=power;
  let work=0,hits=0;
  while(s.miner.blocks===0){const b=api.minerBlock(s.miner);work+=b.work;const r=next(s,api);hits++;const e=r.events[0];
   assert.ok(e);assert.equal(e.contact.row,1);assert.equal(e.contact.col,3);
   if(!e.destroyed){assert.equal(r.steps,0);assert.equal(r.gravel,0);assert.deepEqual(r.gain,[0,0,0,0]);assert.equal(r.passes,0);assert.equal(s.miner.blocks,0);assert.equal(s.miner.steps,0);}
  }
  assert.equal(work,total);assert.equal(hits,Math.ceil(total/50000));assert.equal(s.miner.steps,1);
  assert.equal(s.miner.lastAt-epoch,Math.ceil(total/100));
 }
});
test('a complete titanium row is a real stable hard-block, including offline time and capped ore reserve',()=>{
 const api=M.createMinerModel({tileOverride:()=> 'titanium'}),s=fixture(api);s.miner.offline=7;s.miner.level=20;
 const r=api.settleMiner(s,epoch+8*3600000);
 assert.equal(s.miner.steps,0);assert.equal(s.miner.tipRow,1);assert.equal(s.miner.blocks,0);assert.equal(s.miner.rewardSeq,0);
 assert.equal(r.gravel,0);assert.deepEqual(r.gain,[0,0,0,0]);assert.equal(r.passes,0);
 assert.ok(r.impacts>1000);assert.ok(r.impacts<100000);assert.equal(r.events.length,24);assert.equal(s.miner.oreCharge,270000);
 assert.ok(r.events.every(e=>e.contact.row===1&&!e.destroyed&&e.advanced===0));
});
test('titanium can reach a legitimate open lane without requiring the rest of the row to be cleared',()=>{
 const api=M.createMinerModel({tileOverride:(m,row,col)=>row===1&&col!==5?'titanium':'stone'}),s=fixture(api);
 let attempts=0;while(s.miner.steps<1&&attempts++<20)next(s,api);
 assert.ok(s.miner.steps>=1);assert.ok(attempts<20);assert.ok(s.miner.cuts.some(([l,r,t])=>t===1&&l===5&&r===5));
 for(const col of [0,1,2,3,4,6])assert.equal(api.minerEmpty(s.miner,1,col),false);
});
test('arc truncation never penetrates a solid of the forward frontier, endpoint stays continuous and reduced mode changes no state',()=>{
 const s=fixture();let lastDepth=0,lastImpact=0;
 for(let i=0;i<150;i++){
  const m=s.miner,plan=M.minerPlan(m),snapshot=JSON.stringify(m);
  for(let n=0;n<=60;n++){
   const p=M.minerFlight(m,n/60),col=Math.floor(p.col+.5);
   for(let row=Math.max(1,Math.ceil(plan.from.row));row<=Math.floor(p.physicalTipRow-1e-7);row++)assert.ok(M.minerEmpty(m,row,col),'Penetration at '+row+','+col);
   M.minerFlight(m,n/60,{soft:true});
  }
  assert.equal(JSON.stringify(m),snapshot);const end=M.minerFlight(m,1);assert.ok(Math.abs(end.lift)<1e-8);
  const oldTip={row:m.tipRow,col:m.tipCol},r=next(s);assert.ok(m.steps>=lastDepth);lastDepth=m.steps;
  for(const e of r.events)if(e.impact){assert.ok(e.impactId>lastImpact);lastImpact=e.impactId;}
  if(r.motions){assert.equal(m.tipRow,end.row);assert.ok(Math.abs(m.tipCol-end.col)<1e-9);}
  else {assert.equal(m.tipRow,oldTip.row);assert.equal(m.tipCol,oldTip.col);}
 }
});
test('v3 carry and reserves migrate without a payment; v4 partially damaged block survives reload exactly',()=>{
 const old=Old.createMiner(7);Object.assign(old,{enabled:true,carry:75000,lastAt:epoch});
 const m=M.restoreMiner(old);assert.ok(m);assert.equal(m.version,4);assert.equal(m.carry,75000);assert.equal(m.legacyCarry,true);
 assert.equal(m.blocks,old.blocks);assert.deepEqual(m.crystals,old.crystals);assert.deepEqual(M.restoreMiner(JSON.parse(JSON.stringify(m))),m);
 const api=M.createMinerModel({tileOverride:()=> 'dense'}),s=fixture(api);next(s,api);assert.equal(s.miner.damage.work,50000);
 const restored=api.restoreMiner(JSON.parse(JSON.stringify(s.miner)));assert.deepEqual(restored,s.miner);
 for(const patch of [{tipRow:-1},{tipCol:7},{impacts:NaN},{damage:{row:0,col:3,work:50000}},{carry:50000,legacyCarry:false}])assert.equal(api.restoreMiner({...s.miner,...patch}),null);
});
test('same-row return stays below the upper-row top along the entire shared sampler, both sides, dense/power/frenzy/pause/soft',()=>{
 for(const side of [-1,1])for(const power of [0,20])for(const overdrive of [0,5000]){
  const api=M.createMinerModel({tileOverride:()=> 'dense'}),s=fixture(api),m=s.miner;
  Object.assign(m,{steps:9,tipRow:10,tipCol:3+side*.3,col:3,launch:true,power,overdrive,damage:{row:10,col:3,work:50000}});
  const plan=api.minerPlan(m);assert.equal(plan.height,57);const snapshot=JSON.stringify(m);
  for(let i=0;i<=200;i++){
   const p=api.minerFlight(m,i/200),soft=api.minerFlight(m,i/200,{soft:true});
   assert.ok(p.physicalTipRow>9,'Return must not cross previous top');assert.ok(p.physicalTipRow<=10+1e-8);
   assert.equal(soft.lift,p.lift);assert.equal(soft.tilt,0);assert.equal(soft.row,10);assert.equal(soft.col,p.col);
  }
  assert.equal(JSON.stringify(m),snapshot);api.setMinerEnabled(s,false,epoch);
  const pose=api.minerFlight(m,m.carry/api.minerBlock(m).work);api.settleMiner(s,epoch+120000);
  assert.deepEqual(api.minerFlight(m,m.carry/api.minerBlock(m).work),pose);
 }
 const api=M.createMinerModel({tileOverride:(m,row,col)=>row===1&&col!==0?'titanium':'stone'}),s=fixture(api),m=s.miner;
 Object.assign(m,{steps:0,tipRow:1,tipCol:3,col:0,launch:true,cuts:[[0,0,1,1]]});
 assert.equal(api.minerPlan(m).contact.row,2);
 for(let i=0;i<=100;i++){
  const p=api.minerFlight(m,i/100,{soft:true}),col=Math.floor(p.col+.5);
  for(let row=1;row<=Math.floor(p.physicalTipRow-1e-7);row++)assert.ok(api.minerEmpty(m,row,col),'Soft mode crossed solid beside a legitimate gap');
 }
});
test('frequent, batched and reloaded settlement preserve finances, contacts, partial damage and timing',()=>{
 for(const seed of [7,42,713])for(const level of [1,20]){
  const a=fixture(M,seed),b=fixture(M,seed);for(const s of [a,b])Object.assign(s.miner,{level,power:level===20?20:0,side:level===20?2:0,bombs:level===20?3:0,core:5});
  M.settleMiner(a,epoch+600123);
  for(let time=epoch+997;time<epoch+600123;time+=997){M.settleMiner(b,time);b.miner=M.restoreMiner(JSON.parse(JSON.stringify(b.miner)));assert.ok(b.miner);}
  M.settleMiner(b,epoch+600123);assert.deepEqual(b.miner,a.miner);assert.deepEqual(b.materials,a.materials);assert.equal(b.zag.passes,a.zag.passes);
 }
});
test('pause and timestamp replay cannot mint resources; gain is the exact paid delta despite tail events',()=>{
 const s=fixture();Object.assign(s.miner,{offline:7,core:20,side:2,bombs:3});
 const before=[...s.materials],historical=[...s.miner.crystals];const r=M.settleMiner(s,epoch+3600000);
 assert.deepEqual(r.gain,s.materials.map((n,i)=>n-before[i]));assert.deepEqual(r.gain,s.miner.crystals.map((n,i)=>n-historical[i]));
 const snapshot=JSON.stringify(s);assert.equal(M.settleMiner(s,epoch+3600000).impacts,0);assert.equal(JSON.stringify(s),snapshot);
 M.setMinerEnabled(s,false,epoch+3600000);const carry=s.miner.carry,damage=JSON.stringify(s.miner.damage);M.settleMiner(s,epoch+7200000);
 assert.equal(s.miner.carry,carry);assert.equal(JSON.stringify(s.miner.damage),damage);assert.deepEqual(s.materials.map((n,i)=>n-before[i]),r.gain);
});
test('first-frontier collision remains valid across procedural seeds, basic and upgraded builds',()=>{
 for(const seed of [1,7,42,713])for(const level of [1,20]){
  const s=fixture(M,seed);Object.assign(s.miner,{level,power:level===20?20:0,side:level===20?2:0,bombs:level===20?3:0});
  for(let i=0;i<220;i++){
   const m=s.miner,plan=M.minerPlan(m);
   for(let t=0;t<1;t+=.05){const p=M.minerFlight(m,t),col=Math.floor(p.col+.5);
    for(let row=Math.max(1,Math.ceil(plan.from.row));row<=Math.floor(p.physicalTipRow-1e-7);row++)assert.ok(M.minerEmpty(m,row,col),'Solid crossed: seed'+seed+' row'+row+' col'+col);
   }next(s);
  }
 }
});
