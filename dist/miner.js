import {validMaterials} from './materials.js';
export const MINER_STEP_MS=4000,MINER_OFFLINE_MS=8*3600000,MINER_CAP=20;
export const FRAGMENT_CAP=2000000,GRAVEL_CAP=20000000,REFINE_RATIO=2000,EXCHANGE_RATIO=5,EXCHANGE_FEE=5;
const MAX_STEPS=1e12;
const integer=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const kind=n=>Number.isInteger(n)&&n>=0&&n<4;
const hash=(seed,step,salt=0)=>{let n=Math.imul(seed^salt,374761393)^Math.imul(step>>>0,668265263)^Math.imul(Math.floor(step/4294967296),1274126177);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
export const createMiner=(seed=713)=>({version:2,seed:seed>>>0,enabled:false,level:1,core:0,power:0,side:0,bombs:0,offline:0,focus:-1,gravel:0,fragments:[0,0,0,0],crystals:[0,0,0,0],cuts:[],steps:0,blocks:0,pulses:0,combo:0,col:3,overdrive:0,lastAt:0,carry:0});
export function restoreMiner(raw){
 if(raw===undefined)return createMiner();
 if(!raw||![1,2].includes(raw.version)||typeof raw.enabled!=='boolean'||!integer(raw.level,MINER_CAP)||raw.level<1||!Number.isInteger(raw.focus)||raw.focus< -1||raw.focus>3||!validMaterials(raw.fragments)||raw.fragments.some(n=>n>FRAGMENT_CAP)||!integer(raw.steps,MAX_STEPS)||!integer(raw.lastAt,8640000000000000))return null;
 // Preserve old investments and reserves; the new closed loop starts here.
 if(raw.version===1){if(!integer(raw.carry,3999))return null;return {...createMiner(),enabled:raw.enabled,level:raw.level,offline:7,focus:raw.focus,fragments:[...raw.fragments],steps:raw.steps,blocks:raw.steps,lastAt:raw.lastAt,carry:raw.carry*100};}
 if(!integer(raw.seed,4294967295)||!integer(raw.core??0,1000000)||!integer(raw.power,20)||!integer(raw.side,2)||!integer(raw.bombs,3)||!integer(raw.offline,7)||!integer(raw.gravel)||!validMaterials(raw.crystals)||!integer(raw.blocks,MAX_STEPS*100)||!integer(raw.pulses,MAX_STEPS)||!integer(raw.combo,49)||!integer(raw.col,6)||!integer(raw.overdrive,5000)||!integer(raw.carry,649999))return null;
 const m={...createMiner(raw.seed),enabled:raw.enabled,level:raw.level,power:raw.power,side:raw.side,bombs:raw.bombs,offline:raw.offline,focus:raw.focus,gravel:raw.gravel,fragments:[...raw.fragments],crystals:[...raw.crystals],steps:raw.steps,blocks:raw.blocks,pulses:raw.pulses,combo:raw.combo,col:raw.col,overdrive:raw.overdrive,lastAt:raw.lastAt,carry:raw.carry};
 m.core=raw.core??0;if(m.gravel>minerCapacity(m))return null;
 const cuts=raw.cuts??[];if(!Array.isArray(cuts)||cuts.length>20||cuts.some(a=>!Array.isArray(a)||a.length!==4||!integer(a[0],6)||!integer(a[1],6)||a[0]>a[1]||!integer(a[2],MAX_STEPS)||a[2]<1||!integer(a[3],MAX_STEPS)||a[2]>a[3]))return null;m.cuts=cuts.map(a=>[...a]);
 if(m.carry>=minerBlock(m).work)return null;return m;
}
export function minerKind(m,step){if(m.focus===-1)return hash(m.seed,step,933)%4;if(hash(m.seed,step,241)%2===0)return m.focus;return [0,1,2,3].filter(i=>i!==m.focus)[hash(m.seed,step,633)%3];}
const tileType=(m,step,col)=>{const n=hash(m.seed,step,57^Math.imul(col,991))%10000,bombChance=300+m.bombs*100;return n<400?'dense':n<1000?'titanium':n<1000+bombChance?'bomb':n<1200+bombChance?'overdrive':'stone';};
export function minerBlock(m,step=m.steps+1){
 const type=tileType(m,step,m.col);
 return {step,type,col:m.col,work:type==='dense'&&m.overdrive===0?400000+Math.round(250000/(1+m.power*.06)):type==='titanium'?120000:400000,kind:minerKind(m,step),radius:m.bombs>=2?2:1};
}
export const minerRare=(m,step,col=m.col)=>hash(m.seed,step,821^Math.imul(col,137))%10000<200;
export const minerTile=(m,row,col)=>tileType(m,row,col);
export const minerEmpty=(m,row,col)=>minerTile(m,row,col)!=='titanium'&&m.cuts.some(([left,right,top,bottom])=>col>=left&&col<=right&&row>=top&&row<=bottom);
export const minerMultiplier=m=>1+Math.min(3,Math.floor(m.combo/12));
export const minerRate=m=>Math.round(3600000/MINER_STEP_MS*(1+.02*(m.level-1)));
export const minerOffline=m=>(1+m.offline)*3600000;
export const minerReward=m=>(3+m.side*2)*minerMultiplier(m);
export const minerDepthScale=m=>(1+m.steps/25000)**.35;
export const minerYield=s=>Math.min(1000000000,minerDepthScale(s.miner)*(1+s.miner.core*.04)*(1+Math.max(0,s.best||0)*.015));
export const minerCapacity=m=>Math.min(Number.MAX_SAFE_INTEGER,Math.floor(GRAVEL_CAP*(1+m.core)**1.3));
export function settleMiner(s,now){
 const m=s.miner,gain=[0,0,0,0],events=[];let gravel=0,steps=0,capped=false;
 if(!m||!integer(now,8640000000000000)||now<m.lastAt)return {steps,gain,gravel,events,capped};
 let time=m.enabled?Math.min(minerOffline(m),now-m.lastAt):0;m.lastAt=now;
 // Integer work units: frequent, offline and reloaded settlement match exactly.
 // Bounded absence and event history; no persistent or growing tile map.
 while(time>0&&m.steps<MAX_STEPS){
  const block=minerBlock(m),hot=m.overdrive>0,rate=(100+2*(m.level-1))*(hot?4:1);
  const until=Math.ceil((block.work-m.carry)/rate),dt=Math.min(time,until,hot?m.overdrive:Infinity);
  m.carry+=dt*rate;m.overdrive=Math.max(0,m.overdrive-dt);time-=dt;
  if(m.carry<block.work)continue;
  m.carry-=block.work;m.steps++;steps++;
  let count=0,award=0,pulse=false,k=-1,crystalAmount=0;const from=m.col;
  if(block.type==='titanium'){const dir=m.col===0?1:m.col===6?-1:hash(m.seed,m.steps,194)%2?1:-1;m.col+=dir;}
  else{
   const radius=block.type==='bomb'?block.radius:0;
   for(let dy=-radius;dy<=radius;dy++)for(let dx=-Math.max(radius,m.side?1:0);dx<=Math.max(radius,m.side?1:0);dx++){
    if(!radius&&dy===0&&dx!==0&&(m.side===0||m.side===1&&dx>0))continue;
    const col=m.col+dx,row=m.steps+dy;if(col>=0&&col<=6&&row>=1&&minerTile(m,row,col)!=='titanium'&&!minerEmpty(m,row,col))count++;
   }
   if(block.type==='dense'&&!hot)m.combo=0;else m.combo+=count;
   award=count*minerReward(m);m.blocks+=count;
   m.cuts.push([Math.max(0,from-(radius||Number(m.side>0))),Math.min(6,from+(radius||Number(m.side>1))),Math.max(1,m.steps-radius),m.steps+radius]);
   // Only direct impacts roll crystals. Blasts cannot multiply rare rolls.
   if(minerRare(m,m.steps))k=block.kind;
   if(m.combo>=50){pulse=true;m.combo=0;m.pulses++;let swept=0;for(let row=Math.max(1,m.steps-5);row<=m.steps+7;row++)for(let col=0;col<7;col++)if(minerTile(m,row,col)!=='titanium'&&!minerEmpty(m,row,col))swept++;award+=swept*3;m.blocks+=swept;k=block.kind;m.cuts.push([0,6,Math.max(1,m.steps-5),m.steps+7]);}
   if(k>=0){const scale=minerYield(s),whole=Math.floor(scale),fraction=scale-whole;crystalAmount=whole+Number(hash(m.seed,m.steps,1291)%1000000<Math.round(fraction*1000000));}
   if(k>=0&&Number.isSafeInteger(s.materials[k]+crystalAmount)){s.materials[k]+=crystalAmount;gain[k]+=crystalAmount;m.crystals[k]=Math.min(Number.MAX_SAFE_INTEGER,m.crystals[k]+crystalAmount);}else{k=-1;crystalAmount=0;}
   award=Math.min(Number.MAX_SAFE_INTEGER,Math.round(award*minerDepthScale(m)*(1+m.core*.02)));
   const credited=Math.min(award,minerCapacity(m)-m.gravel);m.gravel+=credited;gravel+=credited;capped ||= credited<award;award=credited;
   if(block.type==='overdrive')m.overdrive=5000;
   if(hash(m.seed,m.steps,992)%4===0)m.col=Math.max(0,Math.min(6,m.col+(hash(m.seed,m.steps,481)%2?1:-1)));
  }
  // Blast rows are already harvested. Move past their cleared center cells,
  // rather than awarding them again on the next drilling cycle.
  const skip=pulse?7:block.type==='bomb'?block.radius:0;
  for(let i=0;i<skip&&m.steps<MAX_STEPS;i++){
   const next=m.steps+1;if(minerTile(m,next,m.col)==='titanium'){
    const left=pulse?0:Math.max(0,from-block.radius),right=pulse?6:Math.min(6,from+block.radius),free=Array.from({length:right-left+1},(_,i)=>left+i).filter(col=>minerEmpty(m,next,col)).sort((a,b)=>Math.abs(a-m.col)-Math.abs(b-m.col));
    if(!free.length)break;m.col=free[0];
   }
   if(!minerEmpty(m,next,m.col))break;m.steps++;
  }
  m.cuts=m.cuts.filter(a=>a[3]>=m.steps-6).slice(-20);
  events.push({...block,from,to:m.col,hot,count,gravel:award,crystal:k,crystalAmount,pulse,combo:m.combo});if(events.length>24)events.shift();
 }
 return {steps,gain,gravel,events,capped};
}
export function setMinerEnabled(s,enabled,now){if(typeof enabled!=='boolean'||!integer(now,8640000000000000)||now<s.miner.lastAt)return false;settleMiner(s,now);s.miner.enabled=enabled;return true;}
export function setMinerFocus(s,focus,now){if(!Number.isInteger(focus)||focus< -1||focus>3||!integer(now,8640000000000000)||now<s.miner.lastAt)return false;settleMiner(s,now);s.miner.focus=focus;return true;}
export const MINER_UPGRADES=Object.freeze({speed:{name:'MOTOR',field:'level',cap:20,base:90,growth:1.42,icon:'↯',effect:'+2% VELOCIDADE'},core:{name:'NÚCLEO',field:'core',cap:1000000,base:6000,icon:'◆',effect:'+4% PRÊMIO · +2% CASCALHO'},power:{name:'PERFURAÇÃO',field:'power',cap:20,base:140,growth:1.4,icon:'⬟',effect:'ROMPE ROCHA MAIS RÁPIDO'},side:{name:'LATERAIS',field:'side',cap:2,base:2200,growth:5,icon:'◀▶',effect:'+1 BLOCO POR IMPACTO'},bombs:{name:'DINAMITE',field:'bombs',cap:3,base:1800,growth:4,icon:'▣',effect:'+1% TNT'},offline:{name:'AUTONOMIA',field:'offline',cap:7,base:900,growth:2.5,icon:'◷',effect:'+1 HORA OFFLINE'}});
export function minerUpgrade(s,id='speed'){const u=MINER_UPGRADES[id];if(!u)return null;const level=s.miner[u.field],rank=id==='speed'?level-1:level;return {...u,id,level,cost:Math.ceil(id==='core'?u.base*(1+rank)**1.6:u.base*u.growth**rank),ready:level<u.cap};}
export function upgradeMiner(s,now,id='speed'){
 const cost=minerUpgrade(s,id);if(s.run||!cost||!integer(now,8640000000000000)||now<s.miner.lastAt||!cost.ready)return false;
 settleMiner(s,now);if(s.miner.gravel<cost.cost)return false;s.miner.gravel-=cost.cost;s.miner[cost.field]++;
 s.miner.carry=Math.min(s.miner.carry,minerBlock(s.miner).work-1);return true;
}
export function refineFragments(s,type,amount){
 if(s.run||!kind(type)||!integer(amount)||amount<1||amount>Math.floor(s.miner.fragments[type]/REFINE_RATIO)||!Number.isSafeInteger(s.materials[type]+amount))return false;
 s.miner.fragments[type]-=amount*REFINE_RATIO;s.materials[type]+=amount;return true;
}
export function exchangeCrystals(s,from,to,amount){
 if(s.run||!kind(from)||!kind(to)||from===to||!integer(amount)||amount<1||amount>Math.floor(s.materials[from]/EXCHANGE_RATIO)||amount>Math.floor(s.bank/EXCHANGE_FEE)||!Number.isSafeInteger(s.materials[to]+amount))return false;
 s.materials[from]-=amount*EXCHANGE_RATIO;s.materials[to]+=amount;s.bank-=amount*EXCHANGE_FEE;return true;
}
