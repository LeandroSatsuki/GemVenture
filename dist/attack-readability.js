import {dangerTiles,walkable} from './core.js';
import {openingBalance} from './balance.js';
import {P} from './palette.js';
import {paintCarrotTelegraph} from './carrot-telegraph-art.js';

// Presentation only: the native windup owns area, target and scheduled beat.
export const ATTACK_SPEC=Object.freeze({maskCache:16,contacts:12,seen:128,contactSeconds:.28,softContactSeconds:.16});
const clamp=n=>Math.max(0,Math.min(1,n)),key=p=>p.x+','+p.y;
const DANGER=P.blush;
const CORNERS=[[-12,-8],[10,-8],[12,8],[-10,8]],NEIGHBORS=[[0,-1],[1,0],[0,1],[-1,0]];
export function uniqueTiles(tiles){const found=new Map();for(const t of tiles||[])if(Number.isInteger(t.x)&&Number.isInteger(t.y))found.set(key(t),{x:t.x,y:t.y});return [...found.values()];}
export function threatMask(tiles,project){
 const cells=uniqueTiles(tiles),set=new Set(cells.map(key)),edges=[];
 for(const t of cells){const p=project(t.x,t.y);for(let i=0;i<4;i++){const [dx,dy]=NEIGHBORS[i];if(set.has(key({x:t.x+dx,y:t.y+dy})))continue;const a=CORNERS[i],b=CORNERS[(i+1)%4];edges.push([p.x/2+a[0],p.y/2+a[1],p.x/2+b[0],p.y/2+b[1]]);}}
 return {cells:cells.map(t=>{const p=project(t.x,t.y);return{...t,px:p.x/2,py:p.y/2};}),edges};
}
export function warningDuration(n,run){return n.windup?.startedBeat!=null?n.windup.beat-n.windup.startedBeat:n.boss?n.bossIndex===4?1:[2,3].includes(n.bossIndex)?2:3:n.elite?3:(n.kind===2?2:1)+openingBalance(run).windup;}
export function attackTiming(n,run,visualBeat){
 const w=n.windup,start=w.startedBeat??w.beat-warningDuration(n,run),stunned=n.stunUntil>=0&&n.stunUntil>=run.beat;
 return {start,due:w.beat,progress:clamp((visualBeat-start)/Math.max(.001,w.beat-start)),remaining:Math.max(1,Math.ceil(w.beat-visualBeat)),stunned};
}
function cellPath(c,x,y){c.beginPath();CORNERS.forEach(([dx,dy],i)=>i?c.lineTo(x+dx,y+dy):c.moveTo(x+dx,y+dy));c.closePath();}
function edgePath(c,edges){c.beginPath();for(const [ax,ay,bx,by]of edges){c.moveTo(ax,ay);c.lineTo(bx,by);}}
function outline(c,mask,color,{progress=0,alpha=1,soft=false}={}){
 c.save();c.globalAlpha*=alpha;c.lineCap='square';c.lineJoin='bevel';edgePath(c,mask.edges);c.strokeStyle=P.ink;c.lineWidth=3.8;c.stroke();c.strokeStyle=color;c.lineWidth=1.9;c.stroke();
 // A finer fixed rim is information; the short moving ticks are expendable.
 c.globalAlpha*=.7;c.strokeStyle=P.white;c.lineWidth=.55;c.stroke();
 if(!soft&&progress>0){c.globalAlpha=alpha*.7;c.strokeStyle=P.white;c.lineWidth=1;c.beginPath();for(const [ax,ay,bx,by]of mask.edges){const dx=bx-ax,dy=by-ay,lo=Math.max(0,progress-.18);c.moveTo(ax+dx*lo,ay+dy*lo);c.lineTo(ax+dx*progress,ay+dy*progress);}c.stroke();}c.restore();
}
function caption(c,text,x,y,color,size=8){c.save();c.font=`800 ${size}px 'GV R2 Body','Trebuchet MS',sans-serif`;c.textAlign='center';c.lineJoin='round';c.lineWidth=3;c.strokeStyle=P.ink;c.fillStyle=color;c.strokeText(text,x,y);c.fillText(text,x,y);c.restore();}
function direction(a,b){const dx=b.x-a.x,dy=b.y-a.y;return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}
function snapshot(n,run,beat){const w=n.windup;return{id:n.id,kind:n.kind,boss:n.boss,bossIndex:n.bossIndex,elite:n.elite,...(n.miniboss?{miniboss:true}:{}),source:{x:n.x,y:n.y},w:{...w,tiles:uniqueTiles(dangerTiles(w)),safe:w.safe?{...w.safe}:null},timing:attackTiming(n,run,beat)};}
function recordKey(n){return n.id+':'+n.windup.beat+':'+n.windup.kind+':'+(n.windup.geodePulse?'pulse':'strike');}
const expected=r=>r.boss?(r.bossIndex===0?r.w.geodePulse?'geodePulse':'geodeEruption':r.bossIndex===6?r.w.rabbitAim===2?'rabbitCarrotImpact':'carrotSlam':'slam'):r.kind===2?'slam':'enemyAttack';

export class AttackReadability{
 constructor(){this.clear();}
 clear(){this.active=new Map();this.contacts=[];this.cache=new Map();this.seen=new Set();this.run=null;this.time=0;this.beat=0;this.hasClock=false;this.paused=false;this.project=null;}
 mask(tiles){const cells=uniqueTiles(tiles),k=cells.map(key).sort().join(';');if(this.cache.has(k))return this.cache.get(k);const mask=threatMask(cells,this.project);if(this.cache.size>=ATTACK_SPEC.maskCache)this.cache.delete(this.cache.keys().next().value);this.cache.set(k,mask);return mask;}
 accept(events){
  const replaced=new Set();let shake=0;
  for(const e of events){
   if(e.type==='scroll'){for(const r of [...this.active.values(),...this.contacts]){r.source.y--;if(r.from)r.from.y--;r.w.y--;r.w.tiles=r.w.tiles.map(p=>({...p,y:p.y-1}));if(r.w.safe)r.w.safe.y--;}this.cache.clear();continue;}
   for(const [id,r]of this.active){
    const live=this.run?.room.enemies.find(n=>n.id===r.id),target=e.target||e;
    if(!live||live.hp<=0||live.windup||this.run.beat<r.w.beat||e.type!==expected(r))continue;
    if(e.sourceId!=null&&e.sourceId!==r.id||target.x!==r.w.x||target.y!==r.w.y)continue;
    if(!this.seen.has(id)){this.seen.add(id);if(this.seen.size>ATTACK_SPEC.seen)this.seen.delete(this.seen.values().next().value);this.contacts.push({...r,at:this.time,from:{...r.source}});while(this.contacts.length>ATTACK_SPEC.contacts)this.contacts.shift();}
    // Existing Geode and Rabbit presentation retain their own verified physical VFX.
    if(!r.boss||![0,6].includes(r.bossIndex)){replaced.add(e);shake=Math.max(shake,e.type==='slam'?2.8:.8);}
   }
  }
  return {events:events.filter(e=>!replaced.has(e)),shake,replaced:replaced.size};
 }
 sync(s,{project,visualBeat,time,paused=false,soft=false}={}){
  this.project=project;this.run=s.run;this.soft=soft;this.paused=paused;
  if(!paused||!this.hasClock){this.time=time;this.beat=visualBeat;this.hasClock=true;}
  this.contacts=this.contacts.filter(r=>this.time-r.at<(soft?ATTACK_SPEC.softContactSeconds:ATTACK_SPEC.contactSeconds));
  const next=new Map();for(const n of s.run?.room.enemies||[])if(n.hp>0&&n.windup&&n.rabbitChild===undefined&&n.summon===undefined)next.set(recordKey(n),snapshot(n,s.run,this.beat));this.active=next;
 }
 get(n){return [...this.active.values()].find(r=>r.id===n.id)||null;}
 pose(n){
  const r=this.get(n),hit=this.contacts.findLast(v=>v.id===n.id),age=hit?this.time-hit.at:Infinity,w=r?.w||hit?.w;
  if(!w)return null;const facing=direction(r?.source||hit.source,w),a=r?.timing.stunned?0:r?.timing.progress||0,charge=a*a*(3-2*a),contact=age>=0&&age<.24?Math.sin(Math.PI*Math.min(1,age/.24)):0;
  if(this.soft)return{direction:facing,sx:1,sy:1,dx:0,dy:0,tilt:0,charge:r?charge:0,frozen:!!r};
  const origin=r?.source||hit.source,p=this.project(origin.x,origin.y),q=this.project(w.x,w.y),length=Math.hypot(q.x-p.x,q.y-p.y)||1,ux=(q.x-p.x)/length,uy=(q.y-p.y)/length;
  const lean=r?-.9*charge:contact*1.8;
  return {direction:facing,sx:1+(n.kind===0?(r?.085*charge:-.055*contact):n.kind===2?contact*.035:0),sy:1+(n.kind===0?(r?-.09*charge:.07*contact):n.kind===2?-.055*contact:0),dx:ux*lean,dy:uy*lean+(n.kind===2?(r?-3*charge:contact*1.3):n.kind===1?(r?-1.5*charge:0):0),tilt:n.kind===1?ux*(r?-.08*charge:.08*contact):n.kind===2?ux*.035*charge:0,charge:r?charge:age<.1?1-clamp(age/.1):0,frozen:!!r};
 }
 bossPose(n){const p=this.pose(n),r=this.get(n)||this.contacts.findLast(v=>v.id===n.id);return p?{node:{...n,windup:{...(n.windup||{}),aim:{x:r.w.x,y:r.w.y},startedBeat:0,beat:1}},beat:p.charge}:null;}
 bossCaption(n){const r=this.get(n);if(!r)return null;const verb=r.w.geodePulse?'EMPURRÃO · AFASTE-SE':r.w.safe?r.w.attack:r.bossIndex===4?'SIGA O GIRO':r.w.hint||'DESVIE';return `${verb} · ${r.timing.stunned?'SUSPENSO':r.timing.remaining}`;}
 bossTicks(c,n,{x,top}){const r=this.get(n);if(!r)return;const total=Math.max(1,Math.min(4,Math.round(r.w.beat-r.timing.start))),width=total*7-2;c.save();c.fillStyle=r.w.geodePulse?P.silver:DANGER;for(let i=0;i<total;i++){c.globalAlpha=i<r.timing.remaining?1:.22;c.fillRect(x-width/2+i*7,top-21,5,1.5);}c.restore();}
 travel(n){
  if(this.soft||n.boss||n.kind!==1)return null;const hit=this.contacts.findLast(r=>r.id===n.id),age=hit?this.time-hit.at:Infinity;if(age<0||age>=.16)return null;
  const from=this.project(hit.from.x,hit.from.y),to=this.project(n.x,n.y),u=clamp(age/.16),eased=1-(1-u)**3;
  return{x:from.x+(to.x-from.x)*eased,y:from.y+(to.y-from.y)*eased,direction:direction(hit.from,n),moving:true,motionProgress:u};
 }
 safeTiles(r){
  if(!r.w.safe)return[];const radius=r.bossIndex===5?1:2,out=[],danger=new Set([...this.active.values()].flatMap(v=>v.w.tiles).map(key));for(const h of this.run.room.hazards||[])if(h.until>=this.run.beat)danger.add(key(h));
  for(let y=r.w.safe.y-radius;y<=r.w.safe.y+radius;y++)for(let x=r.w.safe.x-radius;x<=r.w.safe.x+radius;x++)if(!danger.has(key({x,y}))&&walkable(this.run.room,x,y))out.push({x,y});return out;
 }
 floor(c){
  c.save();const union=new Map();for(const r of this.active.values())if(!r.w.geodePulse&&!r.w.crown)for(const t of r.w.tiles)union.set(key(t),t);
  c.globalAlpha=.13;c.fillStyle=P.red;for(const t of union.values()){const p=this.project(t.x,t.y);cellPath(c,p.x/2,p.y/2);c.fill();}c.globalAlpha=1;
  // Hatching persists without motion and colour: it never grows the hitbox.
  c.globalAlpha=.24;c.strokeStyle=P.red;c.lineWidth=.8;c.beginPath();for(const t of union.values()){const p=this.project(t.x,t.y),x=p.x/2,y=p.y/2;c.moveTo(x-6,y+5);c.lineTo(x+3,y-4);}c.stroke();c.globalAlpha=1;
  for(const r of this.active.values()){
   if(r.bossIndex===6&&r.w.rabbitAim===2)paintCarrotTelegraph(c,{center:r.w.aim||{x:r.w.x,y:r.w.y},direction:r.w.direction,tiles:r.w.tiles,phase:'warning',fade:.28},{project:p=>{const q=this.project(p.x,p.y);return{x:q.x/2,y:q.y/2};}});
   if(r.w.geodePulse){const m=this.mask(r.w.tiles);c.globalAlpha=.12;c.fillStyle=P.silver;for(const p of m.cells){cellPath(c,p.px,p.py);c.fill();}c.globalAlpha=1;continue;}
   const safe=this.safeTiles(r);if(safe.length){c.globalAlpha=.16;c.fillStyle=P.cyan;for(const t of safe){const p=this.project(t.x,t.y);cellPath(c,p.x/2,p.y/2);c.fill();}c.globalAlpha=1;}
  }
  for(const h of this.run?.room.hazards||[]){if(h.until<this.run.beat)continue;const m=this.mask([h]),p=m.cells[0];if(!p)continue;c.globalAlpha=.2;c.fillStyle=P.green;cellPath(c,p.px,p.py);c.fill();c.globalAlpha=1;outline(c,m,P.red,{soft:true});caption(c,'×',p.px,p.py+3,P.lemon,9);}
  for(const r of this.contacts){if(r.boss&&[0,6].includes(r.bossIndex))continue;const u=(this.time-r.at)/(this.soft?ATTACK_SPEC.softContactSeconds:ATTACK_SPEC.contactSeconds),m=this.mask(r.w.tiles);outline(c,m,P.lemon,{alpha:(1-u)*.8,soft:true});if(u<.32){c.globalAlpha=(1-u/.32)*.2;c.fillStyle=P.lemon;for(const p of m.cells){cellPath(c,p.px,p.py);c.fill();}c.globalAlpha=1;}}
  c.restore();
 }
 crisp(c){
  c.save();c.beginPath();c.rect(-100000,-100000,200000,200000);
  for(const n of [...(this.run?.room.nodes||[]),...(this.run?.room.enemies||[])])if(n.hp>0&&!n.boss){const p=this.project(n.x,n.y);if(n.type==='crystal')c.rect(p.x/2-13,p.y/2+2,26,12);else if(n.type==='enemy'&&!n.miniboss)c.rect(p.x/2-11,p.y/2+5,22,5);}c.clip('evenodd');
  for(const r of this.active.values()){
   if(r.w.crown)continue;
   const m=this.mask(r.w.tiles),color=r.w.geodePulse?P.silver:DANGER;outline(c,m,color,{progress:r.timing.progress,soft:this.soft});
   const safe=this.safeTiles(r);if(safe.length)outline(c,this.mask(safe),P.cyan,{soft:true});
   if(r.boss||r.miniboss)continue; // Bosses use their HUD; ground timing remains visible.
   const p=this.project(r.source.x,r.source.y),x=p.x/2,y=p.y/2-(r.boss?(r.bossIndex===6?120:78):r.elite?64:r.kind===1?45:34),label=r.timing.stunned?'ATORDOADO':r.w.geodePulse?'EMPURRÃO':r.boss?'DESVIE':'!';
   caption(c,`${label} · ${r.timing.stunned?'—':r.timing.remaining}`,x,y,P.white,r.boss?10:9);
   const total=Math.max(1,Math.min(4,Math.round(r.w.beat-r.timing.start))),width=total*6-2,start=x-width/2;
   c.save();c.fillStyle=P.ink;c.fillRect(start-2,y+4,width+4,5);for(let i=0;i<total;i++){c.fillStyle=color;c.globalAlpha=i<r.timing.remaining?.95:.25;c.fillRect(start+i*6,y+5,4,2);}c.restore();
   // One compact direction glyph per charge, aligned to its locked aim.
   if(r.kind===1&&!r.boss){const target=m.cells.at(-1);if(target){const d=direction(r.source,r.w),glyph={right:'›',left:'‹',up:'⌃',down:'⌄'}[d];caption(c,glyph,target.px,target.py+4,P.lemon,14);}}
  }
  c.restore();
 }
 status(){return{active:this.active.size,contacts:this.contacts.length,masks:this.cache.size,seen:this.seen.size,time:this.time,beat:this.beat,threatTiles:uniqueTiles([...this.active.values()].flatMap(r=>r.w.tiles)).length};}
}
