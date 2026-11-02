import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createState,restoreState} from '../dist/core.js';
import {MinerGame} from '../dist/miner-view.js';
import {minerBlock,minerFlight,restoreMiner,settleMiner,setMinerEnabled,setMinerFocus} from '../dist/miner.js';
const epoch=1700000000000;
function view(state,soft=false){const v=new MinerGame({state,music:{sfx(){},loot(){}},onSave(){},onUpdate(){},open(){},soft:()=>soft,onSound(){}});const c=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:()=>{}});Object.assign(v,{active:true,canvas:{isConnected:true},ctx:c,presentationDirty:false,targetsDirty:false,targetCache:[null,null,null,null],root:{querySelectorAll:()=>[]},stats(){},receipt(){},burst(){}});return v;}
function nextAt(m){const b=minerBlock(m);return m.lastAt+Math.max(1,Math.ceil((b.work-m.carry)/((100+2*(m.level-1))*(m.overdrive>0?4:1))));}
function docScope(run){const old=globalThis.document,oldNow=Date.now;globalThis.document={hidden:false};try{return run();}finally{Date.now=oldNow;if(old===undefined)delete globalThis.document;else globalThis.document=old;}}
test('candidate runtime is byte-exact to the delivered model, not the synthetic factory',async()=>{const previous=JSON.parse(await fs.readFile(new URL('./fixtures/miner-engine-freeze.json',import.meta.url))),p=JSON.parse(await fs.readFile(new URL('./fixtures/miner-material-r1-freeze.json',import.meta.url)));assert.equal(p.previousMinerSha256,previous.engineSources.find(s=>s.file==='miner.js').sha256);assert.equal(p.engineSources.find(s=>s.file==='miner-contact.js').sha256,previous.engineSources.find(s=>s.file==='miner-contact.js').sha256);assert.equal(p.engineSources.length,2);for(const source of p.engineSources){const bytes=await fs.readFile(new URL('../dist/'+source.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256);}const text=await fs.readFile(new URL('../dist/miner.js',import.meta.url),'utf8');assert.equal(text.includes('tileOverride'),false);});
test('real frame consumes two contacts on the same row with zero depth increment and distinct identities',async t=>{
 // Frame timestamps below are synthetic: keep queued event timestamps on the same clock.
 // The suite can start this test after performance.now() has already exceeded 1000ms.
 t.mock.method(performance,'now',()=>0);
 const baseline=JSON.parse(await fs.readFile(new URL('./helpers/gv046/baseline.json',import.meta.url),'utf8')),s=createState(1);s.miner=restoreMiner(baseline.findings.firstSolid.miner);assert.ok(s.miner);const v=view(s),played=[];v.playEvent=e=>played.push(e);v.draw=()=>{};
 docScope(()=>{let now=nextAt(s.miner);Date.now=()=>now;const before=s.miner.steps;v.frame(1000);assert.equal(s.miner.steps,before);assert.equal(played.filter(e=>e.type==='contact').length,1);const first=played.find(e=>e.type==='contact');assert.equal(first.row,1);assert.equal(first.destroyed,false);assert.ok(first.resistance.remaining>0);assert.ok(Math.abs(first.col-Math.round(first.col))>1e-4,'actual fractional point is retained');
 const count=played.length;v.frame(1020);assert.equal(played.length,count,'same settled state cannot replay contact');now=nextAt(s.miner);v.frame(1600);const contacts=played.filter(e=>e.type==='contact');assert.equal(contacts.length,2);assert.equal(contacts[1].row,first.row);assert.notEqual(contacts[1].batchId,first.batchId);assert.notEqual(contacts[1].impactId,first.impactId);assert.equal(s.miner.steps,before);});
});
test('real drawing applies one physical lift in normal and reduced at every sampled point',async()=>{
 const baseline=JSON.parse(await fs.readFile(new URL('./helpers/gv046/baseline.json',import.meta.url),'utf8')),s=createState(1);s.miner=restoreMiner(baseline.findings.firstSolid.miner);
 for(const soft of [false,true]){const v=view(s,soft);v.cameraY=43;for(let i=0;i<=40;i++){const t=i/40,flight=minerFlight(s.miner,t,{soft}),normal=minerFlight(s.miner,t);v.draw(1000+i*20,flight);assert.ok(Math.abs(v.machinePoint.x-(134+72*flight.col))<1e-9);assert.ok(Math.abs(v.machinePoint.y-(58*flight.physicalTipRow-43+208))<1e-8);assert.equal(flight.lift,normal.lift);if(soft)assert.equal(flight.tilt,0);}}
});
test('pause, hidden interval and layout changes preserve partial resistance, wallet and canonical pose',()=>{
 const s=createState(77);setMinerEnabled(s,true,epoch);settleMiner(s,nextAt(s.miner));assert.ok(s.miner.damage);setMinerEnabled(s,false,s.miner.lastAt);const snapshot=JSON.stringify(s),expected=minerFlight(s.miner,s.miner.carry/minerBlock(s.miner).work),v=view(s);let actual;v.draw=(_,f)=>{actual=f;};
 docScope(()=>{Date.now=()=>s.miner.lastAt;v.frame(1000);assert.deepEqual(actual,expected);assert.equal(JSON.stringify(s),snapshot);globalThis.document.hidden=true;v.frame(2000);assert.equal(JSON.stringify(s),snapshot);globalThis.document.hidden=false;v.frame(4000);assert.deepEqual(actual,expected);assert.equal(JSON.stringify(s),snapshot);const restored=restoreState(JSON.stringify(s));assert.ok(restored);assert.deepEqual(restored.miner,s.miner);});
});
test('receipts survive clipped targets and repeated reload batches without changing paid state',async()=>{
 const audit=JSON.parse(await fs.readFile(new URL('./fixtures/collection-cases.json',import.meta.url),'utf8')),f=audit.cases.find(c=>c.id==='double-jazida'),s=structuredClone(f.before),v=view(s);const result=settleMiner(s,s.miner.lastAt+f.elapsedMs),paid=JSON.stringify(s);
 docScope(()=>{v.earned(result);assert.deepEqual(v.collection.status().unannounced,[0,2,0,0]);v.advanceCollection(.1);assert.deepEqual(v.collection.status().unannounced,[0,2,0,0]);v.collection.suspend();v.earned(result);assert.equal(JSON.stringify(s),paid);v.soft=()=>true;v.targetCache=Array.from({length:4},(_,k)=>({x:100+k*160,y:760,width:158,height:60,visible:true}));const receipts=[];v.receipt=t=>receipts.push(t);v.advanceCollection(.1);assert.deepEqual(receipts,['+2 RUBI']);v.earned(result);v.advanceCollection(.1);assert.deepEqual(receipts,['+2 RUBI']);assert.equal(JSON.stringify(s),paid);});
});

// R1 retires new choices while retaining valid historical save preferences.
test('retired focus setter is inert and saved legacy preferences survive restoration',()=>{
 for(const focus of [-1,0,1,2,3]){const state=createState(713);state.miner.focus=focus;state.miner.lastAt=epoch;const before=JSON.stringify(state);
  for(const value of [-2,-1,0,1,2,3,4,NaN]){assert.equal(setMinerFocus(state,value,epoch+90000),false);assert.equal(JSON.stringify(state),before);}
  assert.equal(restoreState(before).miner.focus,focus);
 }
});
