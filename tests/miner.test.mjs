import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState,startRun} from '../dist/core.js';
import {createMiner,restoreMiner,setMinerEnabled,setMinerFocus,settleMiner,refineFragments,exchangeCrystals,upgradeMiner,minerUpgrade,minerYield,minerCapacity,minerBlock,minerTile,minerEmpty,minerRare,minerOffline,MINER_OFFLINE_MS,GRAVEL_CAP,FRAGMENT_CAP,REFINE_RATIO} from '../dist/miner.js';
const epoch=1700000000000;
const advance=s=>{const m=s.miner,b=minerBlock(m),rate=(100+2*(m.level-1))*(m.overdrive>0?4:1);return settleMiner(s,m.lastAt+Math.ceil((b.work-m.carry)/rate));};
test('older saves gain a dormant machine and version one preserves reserves and investments',()=>{
 const s=createState(73);s.materials=[12,23,34,45];s.bank=900;delete s.miner;
 const saved=restoreState(JSON.stringify(s));assert.deepEqual(saved.miner,createMiner());assert.deepEqual(saved.materials,s.materials);
 const legacy={version:1,enabled:true,level:10,focus:2,fragments:[9100,2000,1000,0],steps:42,lastAt:epoch,carry:2000};
 const m=restoreMiner(legacy);assert.equal(m.version,2);assert.equal(m.level,10);assert.equal(minerOffline(m),MINER_OFFLINE_MS);assert.deepEqual(m.fragments,legacy.fragments);assert.equal(m.carry,200000);assert.equal(m.gravel,0);assert.deepEqual(restoreMiner(m),m);
});
test('offline and frequent settlement match across builds, focuses, expiry and reloads',()=>{
 for(const rank of [1,10,20])for(const focus of [-1,0,3])for(const offset of [0,7,19]){
 const a=createState(123+offset),b=createState(123+offset);for(const s of[a,b]){Object.assign(s.miner,{level:rank,focus,steps:offset,offline:7,side:rank===20?2:0,bombs:rank===20?3:0});setMinerEnabled(s,true,epoch);}
 settleMiner(a,epoch+3600123);for(let at=epoch+997;at<epoch+3600123;at+=997)settleMiner(b,at);settleMiner(b,epoch+3600123);
 assert.deepEqual(a.miner,b.miner);assert.deepEqual(a.materials,b.materials);assert.equal(a.bank,30);assert.equal(a.stars,0);assert.equal(a.essence,0);assert.equal(a.zag.passes,0);assert.deepEqual(a.miner.fragments,[0,0,0,0]);assert.deepEqual(restoreMiner(a.miner),a.miner);
 }});
test('pause, repeated timestamps and clock rewind cannot mint any resource',()=>{
 const s=createState(8);settleMiner(s,epoch);settleMiner(s,epoch+100000);assert.equal(s.miner.gravel,0);
 setMinerEnabled(s,true,epoch+100000);settleMiner(s,epoch+102000);setMinerEnabled(s,false,epoch+102000);const carry=s.miner.carry;settleMiner(s,epoch+900000);
 assert.equal(s.miner.carry,carry);assert.equal(s.miner.gravel,0);setMinerEnabled(s,true,epoch+900000);settleMiner(s,epoch+940000);const before=JSON.stringify(s);
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
 for(let i=0;i<1000&&types.size<5;i++){const block=minerBlock(s.miner);s.miner.combo=20;const before=s.miner.gravel,col=s.miner.col;const r=advance(s),e=r.events[0];types.add(e.type);
 if(e.type==='dense'&&!e.hot){assert.equal(e.combo,0);assert.ok(block.work>400000);}
 if(e.type==='titanium'){assert.equal(s.miner.gravel,before);assert.notEqual(s.miner.col,col);assert.equal(e.crystal,-1);}
 if(e.type==='overdrive')assert.equal(s.miner.overdrive,5000);
 if(e.hot&&e.type==='dense')assert.equal(block.work,400000);
 }assert.ok(types.has('dense')&&types.has('titanium')&&types.has('overdrive')&&types.has('bomb'));
});
test('TNT harvests an actual bounded neighborhood and skips already cleared rows',()=>{
 const s=createState(12);setMinerEnabled(s,true,epoch);s.miner.bombs=2;
 while(minerBlock(s.miner).type!=='bomb')advance(s);
 const m=s.miner,step=m.steps+1,col=m.col;let expected=0;
 for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)if(col+x>=0&&col+x<=6&&step+y>=1&&minerTile(m,step+y,col+x)!=='titanium'&&!minerEmpty(m,step+y,col+x))expected++;
 m.combo=0;const r=advance(s),e=r.events[0];assert.equal(e.radius,2);assert.equal(e.count,expected);assert.equal(m.steps,step+2);assert.equal(r.gain.reduce((a,b)=>a+b,0),minerRare(m,step,col)?1:0);assert.ok(m.cuts.length<=20);
});
test('world cells retain their types after pinball movement and cleared masks survive reload',()=>{
 const m=createMiner(713),before=Array.from({length:7},(_,col)=>minerTile(m,42,col));m.col=0;assert.deepEqual(Array.from({length:7},(_,col)=>minerTile(m,42,col)),before);
 m.cuts=[[0,6,41,43]];const restored=restoreMiner(m);assert.deepEqual(restored.cuts,m.cuts);restored.cuts[0][0]=1;assert.equal(m.cuts[0][0],0);
 for(let col=0;col<7;col++)assert.equal(minerEmpty(m,42,col),before[col]!=='titanium');
});
test('50-chain pulse grants exactly one crystal, resets heat and cannot recurse',()=>{
 const s=createState(4);setMinerEnabled(s,true,epoch);
 while(['dense','titanium'].includes(minerBlock(s.miner).type))advance(s);
 s.miner.combo=49;const old=s.miner.pulses,r=advance(s);assert.equal(r.events[0].pulse,true);assert.equal(r.gain.reduce((a,b)=>a+b,0),1);assert.equal(s.miner.combo,0);assert.equal(s.miner.pulses,old+1);
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
test('rare rolls stay near 2 percent and full builds do not dominate crystal economy',()=>{
 let rare=0,total=0,initial=0,maxed=0;for(let seed=1;seed<=100;seed++){const m=createMiner(seed);for(let step=1;step<=1000;step++){rare+=Number(minerRare(m,step));total++;}
 for(const max of[false,true]){const s=createState(seed);if(max)Object.assign(s.miner,{level:20,power:20,side:2,bombs:3});setMinerEnabled(s,true,epoch);const r=settleMiner(s,epoch+3600000);if(max)maxed+=r.gain.reduce((a,b)=>a+b,0);else initial+=r.gain.reduce((a,b)=>a+b,0);assert.ok(r.events.length<=24);}}
 assert.ok(rare/total>.017&&rare/total<.023);assert.ok(initial/100<35);assert.ok(maxed/100<120);
});
test('long-term scaling grows prize size without raising rare odds, with polynomial core costs',()=>{
 const s=createState(713);assert.equal(minerYield(s),1);s.miner.steps=25000;const deeper=minerYield(s);assert.ok(deeper>1.25&&deeper<1.3);
 const before=Array.from({length:1000},(_,i)=>minerRare(s.miner,i+1));s.miner.core=100;s.best=150;assert.ok(minerYield(s)>20);assert.deepEqual(Array.from({length:1000},(_,i)=>minerRare(s.miner,i+1)),before);
 assert.ok(minerCapacity(s.miner)>minerUpgrade(s,'core').cost);s.miner.gravel=minerUpgrade(s,'core').cost;const materials=[...s.materials],bank=s.bank;assert.equal(upgradeMiner(s,epoch,'core'),true);assert.equal(s.miner.core,101);assert.deepEqual(s.materials,materials);assert.equal(s.bank,bank);
 const raw=createMiner();delete raw.core;assert.equal(restoreMiner(raw).core,0);assert.equal(restoreMiner({...createMiner(),core:-1}),null);
});
test('scaled jackpot rounding is deterministic across batches, save reloads and offline time',()=>{
 const a=createState(49),b=createState(49);for(const s of[a,b]){s.best=150;Object.assign(s.miner,{core:100,steps:250000,level:20,side:2,bombs:3,offline:7});setMinerEnabled(s,true,epoch);}
 const result=settleMiner(a,epoch+3600000);for(let at=epoch+333;at<epoch+3600000;at+=333)settleMiner(b,at);settleMiner(b,epoch+3600000);assert.deepEqual(a.miner,b.miner);assert.deepEqual(a.materials,b.materials);assert.ok(result.gain.reduce((a,b)=>a+b,0)>1000);assert.deepEqual(restoreMiner(a.miner),a.miner);
});
