import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createState} from '../../../dist/core.js';
import * as M from './miner.candidate.mjs';
import {minerCollectionReceipt,sumPaidEvents} from './miner-collection-contract.mjs';
import {MinerCollectionLedger} from '../../../dist/miner-collection-ledger.js';
const epoch=1700000000000,zero=()=>[0,0,0,0],sum=a=>a.reduce((n,v)=>n+v,0);
function base(seed=9,options={}){const s=createState(seed);s.miner=M.createMiner(seed);s.materials=[100,200,300,400];s.miner.crystals=[10,20,30,40];Object.assign(s.miner,options);M.setMinerEnabled(s,true,epoch);return s;}
function finishBlock(s){
 const output={steps:0,impacts:0,motions:0,gain:zero(),gravel:0,passes:0,events:[]};
 for(let i=0;i<10;i++){
  const m=s.miner,b=M.minerBlock(m),rate=(100+2*(m.level-1))*(m.overdrive>0?4:1);
  const r=M.settleMiner(s,m.lastAt+Math.max(1,Math.ceil((b.work-m.carry)/rate)));
  for(const key of ['steps','impacts','motions','gravel','passes'])output[key]+=r[key];r.gain.forEach((n,k)=>output.gain[k]+=n);output.events=[...output.events,...r.events].slice(-24);
  if(r.events.some(e=>e.destroyed))return output;
 }
 throw Error('Fixture did not finish a block');
}
function find(options,predicate){for(let seed=1;seed<=2000;seed++){const s=base(seed,options);if(predicate(M.minerBlock(s.miner)))return s;}throw Error('No fixture');}
function capture(id,s,run){
 const wallet=[...s.materials],history=[...s.miner.crystals],r=run(s);
 assert.deepEqual(r.gain,s.materials.map((n,k)=>n-wallet[k]),id+' wallet');
 assert.deepEqual(r.gain,s.miner.crystals.map((n,k)=>n-history[k]),id+' history');
 const receipt=minerCollectionReceipt(r,{beforeCrystals:history,afterCrystals:s.miner.crystals});
 const ledger=new MinerCollectionLedger(history),queued=[];const fx={enqueue(data){queued.push(data);return {accepted:true};}};
 const snapshot=JSON.stringify(s);ledger.reconcile(s.miner.crystals,fx);const once=queued.length;ledger.reconcile(s.miner.crystals,fx);assert.equal(queued.length,once,id+' receipt replay');assert.equal(JSON.stringify(s),snapshot,id+' UI cannot pay');
 return {id,steps:r.steps,impacts:r.impacts,paid:r.gain,retainedPaid:sumPaidEvents(r.events),outsideSampled:receipt.outsideSampled,outsideRetained:receipt.outsideRetained,receipts:queued.length,creditMatchesWalletAndHistory:true,replayCannotPay:true};
}
export function buildCreditAudit(){
 const cases=[];
 for(let kind=0;kind<4;kind++){
  const s=find({crystalRush:8000,oreCharge:M.MINER_CREDIT_MS},b=>b.type==='crystal'&&b.kind===kind);
  const c=capture('credit-kind-'+kind,s,finishBlock);assert.ok(c.paid[kind]>0);assert.ok(c.paid.every((n,k)=>k===kind||n===0));cases.push(c);
 }
 cases.push(capture('empty-reserve',find({crystalRush:8000},b=>b.type==='crystal'),finishBlock));assert.equal(sum(cases.at(-1).paid),0);
 cases.push(capture('double-jazida',find({crystalRush:8000,doubleLoot:8000,oreCharge:M.MINER_CREDIT_MS},b=>b.type==='crystal'),finishBlock));assert.ok(sum(cases.at(-1).paid)>=2);
 for(const credit of [0,M.MINER_CREDIT_MS]){
  const s=find({combo:49,oreCharge:credit},b=>!['dense','air','titanium'].includes(b.type));
  cases.push(capture(credit?'pulse-paid':'pulse-empty',s,finishBlock));assert.ok(s.miner.pulses>0);
  assert.equal(sum(cases.at(-1).paid)>0,credit>0);
 }
 const cascade=find({bombs:2,combo:49,oreCharge:M.MINER_CREDIT_MS},b=>b.type==='bomb');cases.push(capture('cascade',cascade,finishBlock));assert.ok(cascade.miner.blocks>1);
 let elapsed=0;for(let ms=2000;ms<=30000;ms+=250){const s=base(9,{crystalRush:8000,oreCharge:M.MINER_CREDIT_MS,doubleLoot:8000}),r=M.settleMiner(s,epoch+ms);if(r.impacts>=5&&sum(r.gain)>sum(sumPaidEvents(r.events.slice(-4)))){elapsed=ms;break;}}
 assert.ok(elapsed);cases.push(capture('tail-four',base(9,{crystalRush:8000,oreCharge:M.MINER_CREDIT_MS,doubleLoot:8000}),s=>M.settleMiner(s,epoch+elapsed)));assert.ok(sum(cases.at(-1).outsideSampled)>0);
 cases.push(capture('tail-twentyfour',base(9,{crystalRush:8000,oreCharge:M.MINER_CREDIT_MS,doubleLoot:8000,level:20,overdrive:5000,side:2,bombs:3}),s=>M.settleMiner(s,epoch+60000)));assert.ok(sum(cases.at(-1).outsideRetained)>0);
 cases.push(capture('offline',base(49,{level:20,core:100,side:2,bombs:3}),s=>M.settleMiner(s,epoch+3600000)));
 const paused=base();M.setMinerEnabled(paused,false,epoch);cases.push(capture('paused',paused,s=>M.settleMiner(s,epoch+120000)));assert.equal(sum(cases.at(-1).paid),0);
 const resumed=base(9,{crystalRush:8000,oreCharge:M.MINER_CREDIT_MS});M.setMinerEnabled(resumed,false,epoch);M.settleMiner(resumed,epoch+120000);M.setMinerEnabled(resumed,true,epoch+120000);cases.push(capture('resumed',resumed,finishBlock));assert.ok(sum(cases.at(-1).paid)>0);
 assert.equal(cases.length,14);return {cases,tailFourMs:elapsed,note:'Fourteen GV022 financial categories adapted to completion, not one partial strike. Uses actual candidate model and Fernando ledger; UI never pays.'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const report=buildCreditAudit();await writeFile(new URL('credit-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(report.cases.length+' credit/receipt cases passed; tail-four '+report.tailFourMs+'ms.');}
