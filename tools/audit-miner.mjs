import {createMiner,setMinerEnabled,settleMiner,minerUpgrade} from '../dist/miner.js';
const rows=[];
for(const build of ['initial','mechanical-max','core-25-floor-35','core-100-floor-150']){
 const samples=[];
 for(let seed=1;seed<=300;seed++){
  const s={miner:createMiner(seed),materials:[0,0,0,0],best:0};
  if(build!=='initial')Object.assign(s.miner,{level:20,power:20,side:2,bombs:3,offline:7});
  if(build==='core-25-floor-35'){s.best=35;Object.assign(s.miner,{core:25,steps:25000});}
  if(build==='core-100-floor-150'){s.best=150;Object.assign(s.miner,{core:100,steps:250000});}
  setMinerEnabled(s,true,100000);const r=settleMiner(s,3700000);
  samples.push({crystals:r.gain.reduce((a,b)=>a+b,0),gravel:r.gravel,pulses:s.miner.pulses});
 }
 const avg=key=>+(samples.reduce((a,b)=>a+b[key],0)/samples.length).toFixed(2);
 const sorted=samples.map(s=>s.crystals).sort((a,b)=>a-b);
 rows.push({build,seeds:samples.length,gravelHour:avg('gravel'),crystalsHour:avg('crystals'),crystalsP10:sorted[30],crystalsP90:sorted[269],pulsesHour:avg('pulses')});
}
const s={miner:createMiner(712),materials:[0,0,0,0]};Object.assign(s.miner,{level:20,power:20,side:2,bombs:3,offline:7});setMinerEnabled(s,true,100000);
const start=performance.now(),r=settleMiner(s,100000+8*3600000);
console.log(JSON.stringify({hourly:rows,offline8h:{events:r.steps,retained:r.events.length,ms:+(performance.now()-start).toFixed(2)},firstCosts:Object.fromEntries(['speed','core','power','side','bombs','offline'].map(id=>[id,minerUpgrade({miner:createMiner()},id).cost]))},null,2));
