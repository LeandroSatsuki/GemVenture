import {createMiner as createLegacyMiner} from './fixtures/miner-v3.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState,startRun} from '../dist/core.js';
import {createMiner,restoreMiner,setMinerEnabled,setMinerFocus,settleMiner,refineFragments,exchangeCrystals,upgradeMiner,minerUpgrade,minerYield,minerCapacity,minerBlock,minerTile,minerEmpty,minerRare,minerOffline,minerCascade,minerFlight,MINER_SPECIALS,MINER_CREDIT_MS,MINER_OFFLINE_MS,GRAVEL_CAP,FRAGMENT_CAP,REFINE_RATIO} from '../dist/miner.js';
const epoch=1700000000000;
const advance=s=>{const m=s.miner,b=minerBlock(m),rate=(100+2*(m.level-1))*(m.overdrive>0?4:1);return settleMiner(s,m.lastAt+Math.ceil((b.work-m.carry)/rate));};
test('older saves gain a dormant machine and version one preserves reserves and investments',()=>{
 const s=createState(73);s.materials=[12,23,34,45];s.bank=900;delete s.miner;
 const saved=restoreState(JSON.stringify(s));assert.deepEqual(saved.miner,createMiner());assert.deepEqual(saved.materials,s.materials);
 const legacy={version:1,enabled:true,level:10,focus:2,fragments:[9100,2000,1000,0],steps:42,lastAt:epoch,carry:2000};
 const m=restoreMiner(legacy);assert.equal(m.version,4);assert.equal(m.level,10);assert.equal(minerOffline(m),MINER_OFFLINE_MS);assert.deepEqual(m.fragments,legacy.fragments);assert.equal(m.carry,50000);assert.equal(m.gravel,0);assert.deepEqual(restoreMiner(m),m);
});
test('offline and frequent settlement match across builds, focuses, expiry and reloads',()=>{
 for(const rank of [1,10,20])for(const focus of [-1,0,3])for(const offset of [0,7,19]){
 const a=createState(123+offset),b=createState(123+offset);for(const s of[a,b]){s.miner=restoreMiner({...createLegacyMiner(123+offset),level:rank,focus,steps:offset,offline:7,side:rank===20?2:0,bombs:rank===20?3:0});assert.ok(s.miner);setMinerEnabled(s,true,epoch);}
 settleMiner(a,epoch+3600123);for(let at=epoch+997;at<epoch+3600123;at+=997)settleMiner(b,at);settleMiner(b,epoch+3600123);
 assert.deepEqual(a.miner,b.miner);assert.deepEqual(a.materials,b.materials);assert.equal(a.bank,30);assert.equal(a.stars,0);assert.ok(!('essence' in a));assert.equal(a.zag.passes,b.zag.passes);assert.deepEqual(a.miner.fragments,[0,0,0,0]);assert.deepEqual(restoreMiner(a.miner),a.miner);
 }});
test('pause, repeated timestamps and clock rewind cannot mint any resource',()=>{
 const s=createState(8);settleMiner(s,epoch);settleMiner(s,epoch+100000);assert.equal(s.miner.gravel,0);
 setMinerEnabled(s,true,epoch+100000);settleMiner(s,epoch+102000);setMinerEnabled(s,false,epoch+102000);const carry=s.miner.carry,gravel=s.miner.gravel;settleMiner(s,epoch+900000);
 assert.equal(s.miner.carry,carry);assert.equal(s.miner.gravel,gravel);setMinerEnabled(s,true,epoch+900000);settleMiner(s,epoch+940000);const before=JSON.stringify(s);
 assert.equal(settleMiner(s,epoch+940000).steps,0);assert.equal(settleMiner(s,epoch-1).steps,0);assert.equal(JSON.stringify(s),before);assert.equal(setMinerEnabled(s,false,epoch),false);
});
test('offline capacity starts at one hour, grows to eight, and reload cannot double collect',()=>{
 const a=createState(9),b=createState(9);setMinerEnabled(a,true,epoch);setMinerEnabled(b,true,epoch);
 settleMiner(a,epoch+86400000);settleMiner(b,epoch+3600000);assert.equal(a.miner.gravel,b.miner.gravel);assert.deepEqual(a.materials,b.materials);
 const saved=restoreState(JSON.stringify(a)),before=JSON.stringify(saved);assert.equal(settleMiner(saved,epoch+86400000).steps,0);assert.equal(JSON.stringify(saved),before);
 a.miner.offline=7;assert.equal(minerOffline(a.miner),MINER_OFFLINE_MS);
});
test('dense rock cools the chain, titanium deflects without loot, overdrive ignores hardness',()=>{
 const s=createState(42);setMinerEnabled(s,true,epoch);const types=new Set();
 for(let i=0;i<3000&&(!types.has('dense')||!types.has('titanium')||!types.has('overdrive')||!types.has('bomb'));i++){const block=minerBlock(s.miner);s.miner.combo=20;const before=s.miner.gravel,col=s.miner.col;const r=advance(s),e=r.events[0];if(!e)continue;types.add(e.type);
 if(e.type==='dense'&&!e.hot){assert.ok(block.totalWork>100000);if(e.destroyed)assert.equal(e.combo,0);else{assert.equal(s.miner.gravel,before);assert.deepEqual(r.gain,[0,0,0,0]);}}
 if(e.type==='titanium'){assert.equal(s.miner.gravel,before);assert.notEqual(s.miner.col,col);assert.equal(e.crystal,-1);}
 if(e.effects.some(v=>v.type==='overdrive'))assert.equal(s.miner.overdrive,5000);
 if(e.hot&&e.type==='dense')assert.equal(block.totalWork,100000);
 }assert.ok(types.has('dense')&&types.has('titanium')&&types.has('overdrive')&&types.has('bomb'));
});
test('TNT cascades through actual neighbors, never mines titanium, and never pays a cell twice',()=>{
 const s=createState(12);setMinerEnabled(s,true,epoch);s.miner.bombs=2;
 let guard=0;while(minerBlock(s.miner).type!=='bomb'&&guard++<3000)advance(s);assert.ok(guard<3000);
 const m=s.miner,block=minerBlock(m),step=block.step,col=block.col,depth=m.steps,cascade=minerCascade(m,step,col);assert.ok(cascade.cells.length>1);assert.ok(cascade.effects.some(e=>e.type==='bomb'));
 m.combo=0;let e;for(let i=0;i<20&&!e;i++){const r=advance(s);e=r.events.find(e=>e.destroyed&&e.type==='bomb');}assert.ok(e);assert.equal(e.radius,2);assert.ok(e.count>=cascade.cells.length);assert.equal(e.step,step);assert.equal(e.col,col);assert.ok(m.steps>=depth);assert.ok(m.cuts.length<=192);
 const keys=e.cells.map(c=>c.row+':'+c.col);assert.equal(new Set(keys).size,keys.length);assert.ok(e.cells.every(c=>minerEmpty(m,c.row,c.col)));assert.equal(minerCascade(m,step,col).cells.length,0);
});

test('world cells retain their types after pinball movement and cleared masks survive reload',()=>{
 const m=createMiner(713),before=Array.from({length:7},(_,col)=>minerTile(m,42,col));m.col=0;assert.deepEqual(Array.from({length:7},(_,col)=>minerTile(m,42,col)),before);
 m.cuts=[[0,6,41,43]];const restored=restoreMiner(m);assert.deepEqual(restored.cuts,m.cuts);restored.cuts[0][0]=1;assert.equal(m.cuts[0][0],0);
 for(let col=0;col<7;col++)assert.equal(minerEmpty(m,42,col),before[col]!=='titanium');
});
test('50-chain pulse resets heat and spends mineral credit, not one rare roll per blasted block',()=>{
 const s=createState(4);setMinerEnabled(s,true,epoch);while(['dense','titanium','air'].includes(minerBlock(s.miner).type))advance(s);
 s.miner.combo=49;s.miner.oreCharge=MINER_CREDIT_MS;const old=s.miner.pulses;let e,gain=0;
 for(let i=0;i<20&&!e;i++){const r=advance(s);gain+=r.gain.reduce((a,b)=>a+b,0);const hit=r.events[0];if(hit?.destroyed)e=hit;else{assert.equal(hit?.pulse,false);assert.deepEqual(r.gain,[0,0,0,0]);}}
 assert.ok(e?.pulse);assert.ok([1,2].includes(gain));assert.equal(s.miner.combo,0);assert.equal(s.miner.pulses,old+1);assert.ok(s.miner.oreCharge<MINER_CREDIT_MS);
});

test('gravel has a bounded independent wallet and never turns into crystals',()=>{
 const s=createState(1);s.miner.gravel=GRAVEL_CAP-1;s.miner.fragments.fill(FRAGMENT_CAP);setMinerEnabled(s,true,epoch);const r=settleMiner(s,epoch+3600000);
 assert.equal(s.miner.gravel,GRAVEL_CAP);assert.equal(r.gravel,1);assert.equal(r.capped,true);assert.deepEqual(s.miner.fragments,Array(4).fill(FRAGMENT_CAP));
 const material=[...s.materials],bank=s.bank;assert.equal(upgradeMiner(s,s.miner.lastAt,'speed'),true);assert.deepEqual(s.materials,material);assert.equal(s.bank,bank);
});
test('refining and swapping consume exactly their separate currencies',()=>{const s=createState();s.miner.fragments=[6100,0,0,0];s.materials=[20,5,0,0];s.bank=100;assert.equal(refineFragments(s,0,3),true);assert.deepEqual(s.materials,[23,5,0,0]);assert.equal(s.miner.fragments[0],100);assert.equal(s.bank,100);assert.equal(exchangeCrystals(s,0,2,4),true);assert.deepEqual(s.materials,[3,5,4,0]);assert.equal(s.bank,80);assert.equal(s.miner.fragments[0],100);});
test('invalid, unaffordable, same-color and overflowing transactions are atomic',()=>{const s=createState();s.materials=[5,0,0,0];s.miner.fragments=[2000,0,0,0];for(const args of [[0,0,1],[0,1,2],[0,1,-1],[0,1,1.5],[4,1,1],[0,1,NaN],[0,1,Infinity]]){const before=JSON.stringify(s);assert.equal(exchangeCrystals(s,...args),false);assert.equal(JSON.stringify(s),before);}for(const args of [[0,2],[0,-1],[0,1.5],[5,1]]){const before=JSON.stringify(s);assert.equal(refineFragments(s,...args),false);assert.equal(JSON.stringify(s),before);}s.materials[1]=Number.MAX_SAFE_INTEGER;assert.equal(exchangeCrystals(s,0,1,1),false);s.materials[0]=Number.MAX_SAFE_INTEGER;assert.equal(refineFragments(s,0,1),false);});
test('every round-trip exchange loses resources and pays both fees',()=>{for(let from=0;from<4;from++)for(let to=0;to<4;to++){if(from===to)continue;const s=createState();s.materials[from]=125;s.bank=300;assert.equal(exchangeCrystals(s,from,to,25),true);assert.equal(exchangeCrystals(s,to,from,5),true);assert.equal(s.materials[from],5);assert.equal(s.materials.reduce((a,b)=>a+b,0),5);assert.equal(s.bank,150);}});
test('upgrades consume gravel only, settle old time, cap ranks and reject invalid actions',()=>{
 const s=createState(1),control=createState(1);for(const v of[s,control]){v.miner.gravel=10000;setMinerEnabled(v,true,epoch);}
 settleMiner(control,epoch+24000);const cost=minerUpgrade(s);assert.equal(upgradeMiner(s,epoch+24000),true);assert.equal(s.miner.gravel,control.miner.gravel-cost.cost);assert.equal(s.bank,30);assert.deepEqual(s.materials,control.materials);assert.equal(s.miner.level,2);
 for(const change of ['not-a-part','__proto__','constructor'])assert.equal(upgradeMiner(s,s.miner.lastAt,change),false);
 s.miner.level=20;assert.equal(upgradeMiner(s,s.miner.lastAt),false);s.miner.gravel=0;assert.equal(upgradeMiner(s,s.miner.lastAt,'side'),false);
});
test('run wallets cannot fund AFK upgrades and AFK never awards run progress',()=>{
 const s=createState(1);s.miner.gravel=10000;s.miner.fragments.fill(4000);s.materials.fill(1000);setMinerEnabled(s,true,epoch);startRun(s);
 assert.equal(upgradeMiner(s,epoch+4000),false);assert.equal(refineFragments(s,0,1),false);assert.equal(exchangeCrystals(s,0,1,1),false);
 settleMiner(s,epoch+3600000);assert.deepEqual(s.run.materials,[0,0,0,0]);assert.equal(s.run.score.points,0);
});
test('corrupt saves and excessive values are rejected; valid arrays are cloned',()=>{
 for(const change of[{level:0},{level:21},{enabled:'yes'},{focus:4},{carry:650000},{steps:-1},{fragments:[1,2,3,4.5]},{lastAt:Infinity},{gravel:-1},{gravel:GRAVEL_CAP+1},{overdrive:5001},{offline:8},{side:3},{combo:50},{seed:-1}])assert.equal(restoreMiner({...createMiner(),...change}),null);
 const raw=createMiner(),m=restoreMiner(raw);m.fragments[0]=10;m.crystals[0]=20;assert.equal(raw.fragments[0],0);assert.equal(raw.crystals[0],0);
});
test('rare rolls stay near 2 percent; visual cascade density cannot bypass the hourly crystal budget',()=>{
 let rare=0,total=0,initial=0,maxed=0;for(let seed=1;seed<=24;seed++){const m=createMiner(seed);for(let step=1;step<=4000;step++){rare+=Number(minerRare(m,step));total++;}
 for(const max of[false,true]){const s=createState(seed);if(max)Object.assign(s.miner,{level:20,power:20,side:2,bombs:3});setMinerEnabled(s,true,epoch);const r=settleMiner(s,epoch+3600000);if(max)maxed+=r.gain.reduce((a,b)=>a+b,0);else initial+=r.gain.reduce((a,b)=>a+b,0);assert.ok(r.events.length<=24);}}
 assert.ok(rare/total>.017&&rare/total<.023);assert.ok(initial/24>=30&&initial/24<=82);assert.ok(maxed/24>=30&&maxed/24<=82);
});
test('special seams, real cascades and trajectory contacts keep the AFK board active',()=>{
 for(let seed=1;seed<=30;seed++){const m=createMiner(seed);for(let row=6;row<=60;row+=6)for(let col=0;col<7;col++)assert.ok(MINER_SPECIALS.includes(minerTile(m,row,col)));
  for(let row=1;row<=60;row++){const chain=minerCascade(m,row,3);assert.ok(chain.cells.length<=72);assert.ok(chain.effects.length<=16);assert.ok(chain.cells.every(c=>c.col>=0&&c.col<7&&c.row>=1&&c.row<=row+5));}
 }
 const m=restoreMiner({...createLegacyMiner(),steps:8,origin:1,col:5});assert.ok(m);const block=minerBlock(m);
 const a=minerFlight(m,0),mid=minerFlight(m,.5),end=minerFlight(m,1);assert.equal(a.col,m.tipCol);assert.equal(a.row,m.tipRow);assert.equal(end.col,block.plan.end.col);assert.equal(end.physicalTipRow,block.step);assert.equal(end.row,block.step);assert.equal(a.lift,0);assert.equal(end.lift,0);const poses=Array.from({length:41},(_,i)=>minerFlight(m,i/40));assert.ok(poses.some(p=>p.lift>0));assert.ok(poses.every(p=>Number.isFinite(p.col)&&Number.isFinite(p.row)&&p.lift>=0));assert.ok(mid.col>=Math.min(a.col,end.col)&&mid.col<=Math.max(a.col,end.col));
});
test('version two migrates investments, separate reserves, cuts and partial work without resetting the save',()=>{
 const old={...createMiner(71),version:2,core:9,power:4,level:12,gravel:10000,carry:240000,col:1,steps:50,cuts:[[0,2,49,52]],crystals:[2,3,4,5],fragments:[5,6,7,8]};
 const m=restoreMiner(old);assert.ok(m);assert.equal(m.version,4);assert.equal(m.core,9);assert.equal(m.level,12);assert.equal(m.gravel,10000);assert.deepEqual(m.crystals,old.crystals);assert.deepEqual(m.fragments,old.fragments);assert.ok(m.carry<minerBlock(m).work);assert.deepEqual(restoreMiner(m),m);
});
test('crystal transformation and double prize expire in real mining time and awards remain authoritative',()=>{
 const s=createState(9);setMinerEnabled(s,true,epoch);Object.assign(s.miner,{crystalRush:8000,doubleLoot:8000,oreCharge:MINER_CREDIT_MS});
 const result=settleMiner(s,epoch+1000);assert.equal(result.gain.reduce((a,b)=>a+b,0),2);assert.ok(s.miner.crystalRush>0);assert.equal(s.materials.reduce((a,b)=>a+b,0),2);
 settleMiner(s,epoch+8001);assert.equal(s.miner.crystalRush,0);assert.equal(s.miner.doubleLoot,0);const before=JSON.stringify(s);assert.equal(settleMiner(s,epoch+8001).steps,0);assert.equal(JSON.stringify(s),before);
});
test('long-term scaling grows prize size without raising rare odds, with polynomial core costs',()=>{
 const s=createState(713);assert.equal(minerYield(s),1);s.miner.steps=25000;const deeper=minerYield(s);assert.ok(deeper>1.25&&deeper<1.3);
 const before=Array.from({length:1000},(_,i)=>minerRare(s.miner,i+1));s.miner.core=100;s.best=150;assert.ok(minerYield(s)>20);assert.deepEqual(Array.from({length:1000},(_,i)=>minerRare(s.miner,i+1)),before);
 assert.ok(minerCapacity(s.miner)>minerUpgrade(s,'core').cost);s.miner.gravel=minerUpgrade(s,'core').cost;const materials=[...s.materials],bank=s.bank;assert.equal(upgradeMiner(s,epoch,'core'),true);assert.equal(s.miner.core,101);assert.deepEqual(s.materials,materials);assert.equal(s.bank,bank);
 const raw=createMiner();delete raw.core;assert.equal(restoreMiner(raw).core,0);assert.equal(restoreMiner({...createMiner(),core:-1}),null);
});
test('scaled jackpot rounding is deterministic across batches, save reloads and offline time',()=>{
 const a=createState(49),b=createState(49);for(const s of[a,b]){s.best=150;s.miner=restoreMiner({...createLegacyMiner(49),core:100,steps:250000,level:20,side:2,bombs:3,offline:7});assert.ok(s.miner);setMinerEnabled(s,true,epoch);}
 const result=settleMiner(a,epoch+3600000);for(let at=epoch+333;at<epoch+3600000;at+=333)settleMiner(b,at);settleMiner(b,epoch+3600000);assert.deepEqual(a.miner,b.miner);assert.deepEqual(a.materials,b.materials);assert.ok(result.gain.reduce((a,b)=>a+b,0)>1000);assert.deepEqual(restoreMiner(a.miner),a.miner);
});
