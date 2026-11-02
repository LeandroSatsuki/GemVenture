// Authentic pre-GV046 schema3, QA only; never imported by runtime.
import {validMaterials} from '../../dist/materials.js';
export const MINER_STEP_MS=1000,MINER_OFFLINE_MS=8*3600000,MINER_CAP=20;
export const FRAGMENT_CAP=2000000,GRAVEL_CAP=20000000,REFINE_RATIO=2000,EXCHANGE_RATIO=5,EXCHANGE_FEE=5;
const MAX_STEPS=1e12;
const integer=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const kind=n=>Number.isInteger(n)&&n>=0&&n<4;
const hash=(seed,step,salt=0)=>{let n=Math.imul(seed^salt,374761393)^Math.imul(step>>>0,668265263)^Math.imul(Math.floor(step/4294967296),1274126177);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
export const MINER_CASCADE_CAP=72,MINER_CREDIT_MS=90000;
export const createMiner=(seed=713)=>({version:3,seed:seed>>>0,enabled:false,level:1,core:0,power:0,side:0,bombs:0,offline:0,focus:-1,gravel:0,fragments:[0,0,0,0],crystals:[0,0,0,0],cuts:[],steps:0,blocks:0,pulses:0,combo:0,col:3,origin:3,direction:1,overdrive:0,crystalRush:0,doubleLoot:0,oreCharge:0,passes:0,lastAt:0,carry:0});
export function restoreMiner(raw){
 if(raw===undefined)return createMiner();
 if(!raw||![1,2,3].includes(raw.version)||typeof raw.enabled!=='boolean'||!integer(raw.level,MINER_CAP)||raw.level<1||!Number.isInteger(raw.focus)||raw.focus< -1||raw.focus>3||!validMaterials(raw.fragments)||raw.fragments.some(n=>n>FRAGMENT_CAP)||!integer(raw.steps,MAX_STEPS)||!integer(raw.lastAt,8640000000000000))return null;
 // Preserve old investments and reserves; the new closed loop starts here.
 if(raw.version===1){if(!integer(raw.carry,3999))return null;const m={...createMiner(),enabled:raw.enabled,level:raw.level,offline:7,focus:raw.focus,fragments:[...raw.fragments],steps:raw.steps,blocks:raw.steps,lastAt:raw.lastAt};m.carry=Math.floor(raw.carry/4000*minerBlock(m).work);return m;}
 if(!integer(raw.seed,4294967295)||!integer(raw.core??0,1000000)||!integer(raw.power,20)||!integer(raw.side,2)||!integer(raw.bombs,3)||!integer(raw.offline,7)||!integer(raw.gravel)||!validMaterials(raw.crystals)||!integer(raw.blocks,MAX_STEPS*100)||!integer(raw.pulses,MAX_STEPS)||!integer(raw.combo,49)||!integer(raw.col,6)||!integer(raw.overdrive,5000)||!integer(raw.carry,649999))return null;
 const m={...createMiner(raw.seed),enabled:raw.enabled,level:raw.level,power:raw.power,side:raw.side,bombs:raw.bombs,offline:raw.offline,focus:raw.focus,gravel:raw.gravel,fragments:[...raw.fragments],crystals:[...raw.crystals],steps:raw.steps,blocks:raw.blocks,pulses:raw.pulses,combo:raw.combo,col:raw.col,overdrive:raw.overdrive,lastAt:raw.lastAt,carry:raw.carry};
 m.core=raw.core??0;if(m.gravel>minerCapacity(m))return null;
 const cuts=raw.cuts??[];if(!Array.isArray(cuts)||cuts.length>(raw.version===3?192:20)||cuts.some(a=>!Array.isArray(a)||a.length!==4||!integer(a[0],6)||!integer(a[1],6)||a[0]>a[1]||!integer(a[2],MAX_STEPS)||a[2]<1||!integer(a[3],MAX_STEPS)||a[2]>a[3]))return null;m.cuts=cuts.map(a=>[...a]);
 if(raw.version===3){for(const [key,max] of [['origin',6],['crystalRush',8000],['doubleLoot',8000],['oreCharge',MINER_CREDIT_MS*3],['passes',Number.MAX_SAFE_INTEGER]]){if(!integer(raw[key],max))return null;m[key]=raw[key];}if(![-1,1].includes(raw.direction))return null;m.direction=raw.direction;}
 else {m.origin=m.col;m.carry=Math.min(minerBlock(m).work-1,Math.floor(m.carry/4));}
 if(m.carry>=minerBlock(m).work)return null;return m;
}
export function minerKind(m,step){if(m.focus===-1)return hash(m.seed,step,933)%4;if(hash(m.seed,step,241)%2===0)return m.focus;return [0,1,2,3].filter(i=>i!==m.focus)[hash(m.seed,step,633)%3];}
export const MINER_SPECIALS=['bomb','line','bolt','overdrive','double','prism'];
const tileType=(m,step,col)=>{const n=hash(m.seed,step,57^Math.imul(col,991))%10000;
 // Visible seams guarantee a special contact at least every six layers.
 if(step%6===0)return MINER_SPECIALS[hash(m.seed,Math.floor(step/6),91)%6];
 if(n<350)return 'dense';if(n<1000)return 'titanium';if(n<2000+m.bombs*150)return 'bomb';if(n<2600)return 'line';if(n<3100)return 'bolt';if(n<3500)return 'overdrive';if(n<3900)return 'double';if(n<4200)return 'prism';return 'stone';};
export function minerBlock(m,step=m.steps+1){
 const type=minerEmpty(m,step,m.col)?'air':minerTile(m,step,m.col);
 return {step,type,col:m.col,work:type==='dense'&&m.overdrive===0?100000+Math.round(100000/(1+m.power*.06)):type==='air'?35000:type==='titanium'?70000:100000,kind:minerKind(m,step),radius:m.bombs>=2?2:1};
}
export const minerRare=(m,step,col=m.col)=>hash(m.seed,step,821^Math.imul(col,137))%10000<200;
export const minerTile=(m,row,col)=>m.crystalRush>0&&row>=m.steps&&row<=m.steps+7&&tileType(m,row,col)!=='titanium'?'crystal':tileType(m,row,col);
const cutCache=new WeakMap();
function cutIndex(m){let cached=cutCache.get(m);if(cached?.source===m.cuts&&cached.length===m.cuts.length)return cached;const rows=new Map();for(const [left,right,top,bottom] of m.cuts){const mask=((1<<(right-left+1))-1)<<left;for(let row=Math.max(top,m.steps-6);row<=Math.min(bottom,m.steps+8);row++)rows.set(row,(rows.get(row)||0)|mask);}cached={source:m.cuts,length:m.cuts.length,rows};cutCache.set(m,cached);return cached;}
export const minerEmpty=(m,row,col)=>(row<m.steps-6||row>m.steps+8?m.cuts.some(([l,r,t,b])=>col>=l&&col<=r&&row>=t&&row<=b):Boolean((cutIndex(m).rows.get(row)||0)&(1<<col)))&&tileType(m,row,col)!=='titanium';
function markCut(m,row,col){const cached=cutIndex(m);m.cuts.push([col,col,row,row]);cached.length++;cached.rows.set(row,(cached.rows.get(row)||0)|(1<<col));}
export const minerMultiplier=m=>1+Math.min(3,Math.floor(m.combo/12));
export const minerRate=m=>Math.round(3600000/MINER_STEP_MS*(1+.02*(m.level-1)));
export const minerOffline=m=>(1+m.offline)*3600000;
export const minerReward=m=>(3+m.side*2)*minerMultiplier(m);
export const minerDepthScale=m=>(1+m.steps/25000)**.35;
export const minerYield=s=>Math.min(1000000000,minerDepthScale(s.miner)*(1+s.miner.core*.04)*(1+Math.max(0,s.best||0)*.015));
export const minerCapacity=m=>Math.min(Number.MAX_SAFE_INTEGER,Math.floor(GRAVEL_CAP*(1+m.core)**1.3));
// Resolve real cells once, then emit a bounded breadth-first cascade for playback.
// The UI never pays resources and cannot mint rewards by replaying an animation.
export function minerCascade(m,row,col){
 const cells=[],effects=[],seen=new Set(),queue=[{row,col,depth:0}],bottom=row+5,top=Math.max(1,row-2);
 if(m.side)queue.push({row,col:Math.max(0,col-1),depth:0});if(m.side>1)queue.push({row,col:Math.min(6,col+1),depth:0});
 const add=(r,c,depth)=>{if(r>=top&&r<=bottom&&c>=0&&c<7&&!seen.has(r+':'+c))queue.push({row:r,col:c,depth});};
 let specials=0;
 while(queue.length&&cells.length<MINER_CASCADE_CAP){const q=queue.shift(),key=q.row+':'+q.col;if(seen.has(key))continue;seen.add(key);
  const type=minerTile(m,q.row,q.col);if(type==='titanium'||minerEmpty(m,q.row,q.col))continue;
  const cell={...q,type,kind:minerKind(m,q.row)};cells.push(cell);
  if(!MINER_SPECIALS.includes(type)||specials>=16)continue;specials++;effects.push({...cell,id:row+':'+col+':'+specials});
  if(type==='bomb'){const radius=m.bombs>=2?2:1;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)add(q.row+dy,q.col+dx,q.depth+1);}
  if(type==='line')for(let x=0;x<7;x++)add(q.row,x,q.depth+1);
  if(type==='bolt')for(let dy=0;dy<4;dy++)for(const dx of [-1,0,1])add(q.row+dy,q.col+dx,q.depth+1);
 }
 return {cells,effects};
}
// Ballistic arc between two authoritative contacts; its tip meets the tile at t=1.
// Position is derived from work progress, so FPS, resizing and reloads cannot
// advance the machine or affect any reward.
export function minerFlight(m,progress){const t=Math.max(0,Math.min(1,progress)),dx=m.col-m.origin;return {col:m.origin+dx*(t*t*(3-2*t)),row:m.steps+t,lift:Math.max(0,4*t*(1-t))*65,tilt:dx*Math.sin(Math.PI*t)*.18};}
export function settleMiner(s,now){
 const m=s.miner,gain=[0,0,0,0],events=[];let gravel=0,steps=0,capped=false,passes=0;
 if(!m||!integer(now,8640000000000000)||now<m.lastAt)return {steps,gain,gravel,events,capped};
 let time=m.enabled?Math.min(minerOffline(m),now-m.lastAt):0;m.lastAt=now;
 // Integer work units: frequent, offline and reloaded settlement match exactly.
 // Bounded absence and event history; no persistent or growing tile map.
 while(time>0&&m.steps<MAX_STEPS){
  const block=minerBlock(m),hot=m.overdrive>0,rate=(100+2*(m.level-1))*(hot?4:1);
  const until=Math.ceil((block.work-m.carry)/rate),dt=Math.min(time,until,hot?m.overdrive:Infinity,m.crystalRush||Infinity,m.doubleLoot||Infinity);
  m.carry+=dt*rate;m.overdrive=Math.max(0,m.overdrive-dt);m.crystalRush=Math.max(0,m.crystalRush-dt);m.doubleLoot=Math.max(0,m.doubleLoot-dt);m.oreCharge=Math.min(MINER_CREDIT_MS*3,m.oreCharge+dt);time-=dt;
  if(m.carry<block.work)continue;
  m.carry-=block.work;m.steps++;steps++;
  let count=0,award=0,pulse=false,k=-1,crystalAmount=0,pass=0;const from=m.col;
  let cells=[],effects=[];
  if(!['titanium','air'].includes(block.type)){
   ({cells,effects}=minerCascade(m,m.steps,from));count=cells.length;
   for(const cell of cells)markCut(m,cell.row,cell.col);
   for(const e of effects){if(e.type==='overdrive')m.overdrive=5000;if(e.type==='double')m.doubleLoot=8000;if(e.type==='prism')m.crystalRush=8000;}
   if(block.type==='dense'&&!hot)m.combo=0;else m.combo+=count;
   const multiplier=minerMultiplier(m);award=count*3*multiplier;
   if(m.combo>=50){pulse=true;m.combo=0;m.pulses++;for(let row=m.steps;row<=m.steps+4;row++)for(let col=0;col<7;col++)if(minerTile(m,row,col)!=='titanium'&&!minerEmpty(m,row,col)){const cell={row,col,depth:4,type:minerTile(m,row,col),kind:minerKind(m,row)};cells.push(cell);markCut(m,row,col);count++;award+=3;}effects.push({id:m.steps+':'+from+':pulse',type:'pulse',row:m.steps,col:from,depth:4,kind:block.kind});}
   m.blocks+=count;
   // Exciting boards do not multiply the economy: only elapsed mining time
   // supplies ore credits. Cascades and temporary crystals spend that reserve.
   const eligible=pulse||block.type==='crystal'||minerRare(m,m.steps,from);
   if(eligible&&m.oreCharge>=MINER_CREDIT_MS){const scale=minerYield(s)*(m.doubleLoot>0?2:1),whole=Math.floor(scale);crystalAmount=whole+Number(hash(m.seed,m.steps,1291)%1000000<Math.round((scale-whole)*1000000));k=block.kind;
    if(Number.isSafeInteger(s.materials[k]+crystalAmount)&&Number.isSafeInteger(m.crystals[k]+crystalAmount)){m.oreCharge-=MINER_CREDIT_MS;s.materials[k]+=crystalAmount;gain[k]+=crystalAmount;m.crystals[k]+=crystalAmount;}else{k=-1;crystalAmount=0;}}
   if(hash(m.seed,m.steps,7331)%25000===0&&s.zag&&s.zag.passes<Number.MAX_SAFE_INTEGER&&m.passes<Number.MAX_SAFE_INTEGER){s.zag.passes++;m.passes++;pass=1;passes++;}
   award=Math.min(Number.MAX_SAFE_INTEGER,Math.round(award*minerDepthScale(m)*(1+m.core*.02)));
   const credited=Math.min(award,minerCapacity(m)-m.gravel);m.gravel+=credited;gravel+=credited;capped ||= credited<award;award=credited;
  }
  m.origin=from;
  // Contact-driven pinball lanes. Alternating side momentum and titanium
  // reflection avoid an endless straight descent, without any unbounded physics.
  if(block.type==='titanium'||from===0||from===6)m.direction=from===0?1:from===6?-1:-m.direction;
  else if(hash(m.seed,m.steps,194)%5===0)m.direction=-m.direction;
  m.col=Math.max(0,Math.min(6,from+m.direction*(block.type==='titanium'?2:1)));
  if(minerEmpty(m,m.steps+1,m.col)){const candidates=Array.from({length:7},(_,i)=>i).filter(c=>!(block.type==='titanium'&&c===from)&&!minerEmpty(m,m.steps+1,c));if(candidates.length)m.col=candidates.sort((a,b)=>Math.abs(a-m.col)-Math.abs(b-m.col))[0];}
  m.cuts=m.cuts.filter(a=>a[3]>=m.steps-6).slice(-192);
  // Work cost may change after a bonus or lane change; retain only valid residue.
  m.carry=Math.min(m.carry,minerBlock(m).work-1);
  events.push({...block,id:m.steps,from,to:m.col,contact:{row:m.steps,col:from,offsetY:-22,normal:{x:0,y:-1}},hot,count,cells,effects,gravel:award,crystal:k,crystalAmount,pass,pulse,combo:m.combo,multiplier:minerMultiplier(m)});if(events.length>24)events.shift();
 }
 return {steps,gain,gravel,passes,events,capped};
}
export function setMinerEnabled(s,enabled,now){if(typeof enabled!=='boolean'||!integer(now,8640000000000000)||now<s.miner.lastAt)return false;settleMiner(s,now);s.miner.enabled=enabled;return true;}
export function setMinerFocus(s,focus,now){if(!Number.isInteger(focus)||focus< -1||focus>3||!integer(now,8640000000000000)||now<s.miner.lastAt)return false;settleMiner(s,now);s.miner.focus=focus;return true;}
export const MINER_UPGRADES=Object.freeze({speed:{name:'MOTOR',field:'level',cap:20,base:1800,growth:1.42,icon:'↯',effect:'+2% VELOCIDADE'},core:{name:'NÚCLEO',field:'core',cap:1000000,base:120000,icon:'◆',effect:'+4% PRÊMIO · +2% CASCALHO'},power:{name:'PERFURAÇÃO',field:'power',cap:20,base:2400,growth:1.4,icon:'⬟',effect:'ROMPE ROCHA MAIS RÁPIDO'},side:{name:'LATERAIS',field:'side',cap:2,base:48000,growth:5,icon:'◀▶',effect:'+1 BLOCO POR IMPACTO'},bombs:{name:'DINAMITE',field:'bombs',cap:3,base:36000,growth:4,icon:'▣',effect:'+1,5% TNT'},offline:{name:'AUTONOMIA',field:'offline',cap:7,base:18000,growth:2.5,icon:'◷',effect:'+1 HORA OFFLINE'}});
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
