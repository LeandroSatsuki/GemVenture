import {traceTerrainTile,normalizeTerrainMask} from './campaign-cave-terrain.js';
import {sceneryVisible} from './cave-lighting-masks.js';

export const LIQUID_LIGHT_SPEC=Object.freeze({maxCells:4096,maxEmitters:12,emittersPerType:6,maxParticles:24,textureSize:128,maxCacheSide:1024});
export const LIQUID_LIGHT_COLORS=Object.freeze({
 1:Object.freeze({color:'#28dcff',core:'#b9fbff',radius:27,surface:.23,reveal:.48}),
 3:Object.freeze({color:'#ff681f',core:'#ffe3a1',radius:34,surface:.34,reveal:.70}),
 4:Object.freeze({color:'#ad42ff',core:'#ecc8ff',radius:33,surface:.56,reveal:.82})
});
const hash=n=>{n=Math.imul(n^(n>>>16),0x45d9f3b);return ((n^(n>>>16))>>>0)/4294967296;};
const project=(x,y)=>[50+22*x+2*y,57.5+16*y];
const neighbors=[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8],[1,-1,16],[1,1,32],[-1,1,64],[-1,-1,128]];
const clamp=n=>Math.max(0,Math.min(1,n));
export function buildLiquidEmissionPlan(room,cells,{depth=0,makePath=()=>new Path2D()}={}){
 const cols=room.cols||21,rows=room.rows||15,groups=new Map(),emitters=[];
 const same=(x,y,type)=>x>=0&&y>=0&&x<cols&&y<rows&&!!room.floorMask?.[y*cols+x]&&room.terrain?.[y*cols+x]===type;
 for(const cell of cells.slice(0,LIQUID_LIGHT_SPEC.maxCells)){
  const {x,y}=cell,type=room.terrain?.[y*cols+x];if(!LIQUID_LIGHT_COLORS[type]||!sceneryVisible(room,x,y))continue;
  if(!groups.has(type))groups.set(type,{type,path:makePath(),cells:[]});const group=groups.get(type),[px,py]=project(x,y);let mask=0;
  for(const [dx,dy,bit]of neighbors)if(same(x+dx,y+dy,type))mask|=bit;
  traceTerrainTile(group.path,normalizeTerrainMask(mask),px,py);
  const seed=(room.seed||0)^Math.imul(x+31,977)^Math.imul(y+depth+17,157);
  group.cells.push({x,y,px,py,type,phase:hash(seed),priority:hash(seed+691)});
 }
 const occupied=groups.has(4)?new Set([...(room.rocks||[]),...(room.nodes||[])].filter(p=>p.hp==null||p.hp>0).map(p=>p.x+','+p.y)):null;
 for(const group of groups.values()){ 
  const selected=[];for(const cell of [...group.cells].sort((a,b)=>a.priority-b.priority)){if(group.type===4&&occupied.has(cell.x+','+cell.y))continue;
   if(selected.every(p=>Math.abs(p.x-cell.x)+Math.abs(p.y-cell.y)>=3))selected.push(cell);
   if(selected.length>=LIQUID_LIGHT_SPEC.emittersPerType)break;
  }emitters.push(...selected);
 }
 const all=[...groups.values()].flatMap(g=>g.cells),bounds=all.length?{x:Math.floor(Math.min(...all.map(p=>p.px)))-50,y:Math.floor(Math.min(...all.map(p=>p.py)))-50,w:Math.ceil(Math.max(...all.map(p=>p.px))-Math.min(...all.map(p=>p.px)))+100,h:Math.ceil(Math.max(...all.map(p=>p.py))-Math.min(...all.map(p=>p.py)))+100}:null;
 return {groups:[...groups.values()],emitters:emitters.length<=LIQUID_LIGHT_SPEC.maxEmitters?emitters:[...Array(LIQUID_LIGHT_SPEC.emittersPerType).keys()].flatMap(i=>[...groups.values()].map(g=>emitters.filter(e=>e.type===g.type)[i]).filter(Boolean)).slice(0,LIQUID_LIGHT_SPEC.maxEmitters),cells:all.length,depth,bounds};
}
export function sampleLiquidParticles(plan,time=0,soft=false){
 if(soft)return [];const t=Number.isFinite(time)?Math.max(0,time):0,particles=[];
 for(const source of plan.emitters)for(let i=0;i<(source.type===4?1:2);i++){
  if(source.type===4){const u=(t/(4.1+source.phase*.9)+source.phase)%1,rise=clamp(u/.78),pop=clamp((u-.78)/.22);particles.push({type:4,x:source.px+Math.sin(rise*4.2+source.phase*6.283)*1.8,y:source.py-rise*23-pop*.8,radius:1.4+Math.sin(rise*Math.PI/2)*1.1,alpha:(pop?(1-pop)**.75:Math.min(1,rise*7))*.82,pop,phase:source.phase,sourceX:source.x,sourceY:source.y});continue;}
  const water=source.type===1,u=((t/(water?3.8:2.6)+source.phase+i*.5)%1+1)%1,alpha=Math.sin(u*Math.PI)**1.4;
  particles.push({type:source.type,x:source.px+Math.sin(u*4.2+source.phase*6.283+i)*1.9,y:source.py-u*(water?15:23),radius:(water?.85:1.05)+Math.sin(u*Math.PI)*.35,alpha:alpha*(water?.60:.76),sourceX:source.x,sourceY:source.y});
 }
 return particles.slice(0,LIQUID_LIGHT_SPEC.maxParticles);
}
export function createLiquidAmbience(room,{makeCanvas}={}){
 const textures=new Map();let plan={groups:[],emitters:[],cells:0},maskRef=null,terrainRef=null,nodeRef=null,rockRef=null,signature='',particles=[],time=0,soft=false,dead=false,revision=0,surface=null,reveal=null,cacheKey='';
 function glow(type){
  if(textures.has(type))return textures.get(type);const size=LIQUID_LIGHT_SPEC.textureSize,canvas=makeCanvas(size,size),c=canvas.getContext('2d'),p=LIQUID_LIGHT_COLORS[type],g=c.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,p.color+'e0');g.addColorStop(.25,p.color+'a0');g.addColorStop(.62,p.color+'35');g.addColorStop(1,p.color+'00');c.fillStyle=g;c.fillRect(0,0,size,size);textures.set(type,canvas);return canvas;
 }
 function update(masks,{depth=0,time:nextTime=0,soft:nextSoft=false}={}){
  if(dead)return;time=Math.max(0,Number(nextTime)||0);soft=!!nextSoft;
  // A small viewport-cell signature also observes native in-place terrain edits.
  const cols=room.cols||21;let version=0;for(const p of masks.cells){const type=room.terrain?.[p.y*cols+p.x]||0;version=Math.imul(version^((p.y*cols+p.x)*7+type),16777619);}
  const next=depth+':'+version,occupiedChanged=plan.groups.some(g=>g.type===4)&&(nodeRef!==room.nodes||rockRef!==room.rocks);if(maskRef!==masks||terrainRef!==room.terrain||signature!==next||occupiedChanged){plan=buildLiquidEmissionPlan(room,masks.cells,{depth});maskRef=masks;terrainRef=room.terrain;nodeRef=room.nodes;rockRef=room.rocks;signature=next;revision++;}
  particles=sampleLiquidParticles(plan,time,soft);
 }
 function drawGround(c,masks,{gain=1,duck=1}={}){
  if(dead||gain<=0)return;const g=Math.max(0,Math.min(2.5,gain));c.save();c.globalCompositeOperation='screen';
  for(const s of plan.emitters){const p=LIQUID_LIGHT_COLORS[s.type],r=p.radius;c.save();c.clip(masks.sourcePath?.(s)||masks.floor);c.globalAlpha*=Math.min(.55,(s.type===1?.36:.48)*g*duck);c.drawImage(glow(s.type),s.px-r,s.py-r*.65,r*2,r*1.30);c.restore();}
  for(const group of plan.groups){const p=LIQUID_LIGHT_COLORS[group.type];c.save();c.clip(group.path);c.fillStyle=p.color;c.globalAlpha*=Math.min(.72,p.surface*g*duck);c.fill(group.path);c.restore();}
  for(const s of plan.emitters){const p=LIQUID_LIGHT_COLORS[s.type],r=s.type===1?15:18;c.save();c.clip(plan.groups.find(g=>g.type===s.type).path);c.globalAlpha*=Math.min(.85,.62*g*duck);c.drawImage(glow(s.type),s.px-r,s.py-r*.6,r*2,r*1.2);c.strokeStyle=p.core;c.globalAlpha*=.75;c.lineWidth=s.type===1?.65:.9;c.beginPath();c.moveTo(s.px-5,s.py+.8);c.quadraticCurveTo(s.px-1,s.py-2,s.px+4,s.py-1);c.stroke();c.restore();}
  c.restore();
 }
 function prepareCaches(masks,gain){
  if(!plan.bounds)return false;const key=revision+':'+Math.round(gain*100);if(cacheKey===key)return true;const b=plan.bounds,scale=Math.min(1,LIQUID_LIGHT_SPEC.maxCacheSide/b.w,LIQUID_LIGHT_SPEC.maxCacheSide/b.h),w=Math.ceil(b.w*scale),h=Math.ceil(b.h*scale);
  surface??=makeCanvas(1,1);reveal??=makeCanvas(1,1);
  for(const canvas of [surface,reveal]){if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.setTransform(scale,0,0,scale,-b.x*scale,-b.y*scale);}
  drawGround(surface.getContext('2d'),masks,{gain});const m=reveal.getContext('2d');
  // Source-over alpha here is the union of light openings. One destination-out
  // bitmap replaces repeated clipping/filling of the pool's curves every frame.
  for(const group of plan.groups){m.save();m.globalAlpha=Math.min(.80,LIQUID_LIGHT_COLORS[group.type].reveal*gain);m.fillStyle='black';m.fill(group.path);m.restore();}
  for(const s of plan.emitters){const p=LIQUID_LIGHT_COLORS[s.type],power=Math.min(.75,p.reveal*.72*gain),reach=1.24,r=p.radius*reach,g=m.createRadialGradient(s.px,s.py,0,s.px,s.py,r);g.addColorStop(0,`rgba(0,0,0,${power})`);for(const [stop,alpha]of [[.18,.92],[.50,.56],[.85,.16],[1,.055]])g.addColorStop(stop/reach,`rgba(0,0,0,${power*alpha})`);g.addColorStop(1,'rgba(0,0,0,0)');m.save();m.clip(masks.sourcePath?.(s)||masks.floor);m.globalAlpha=1;m.fillStyle=g;m.fillRect(s.px-r,s.py-r,r*2,r*2);m.restore();}
  cacheKey=key;return true;
 }
 function paintGround(c,masks,{gain=1,duck=1}={}){
  if(dead||gain<=0||!prepareCaches(masks,gain))return;const b=plan.bounds;c.save();c.globalCompositeOperation='screen';c.globalAlpha*=duck;c.drawImage(surface,b.x,b.y,b.w,b.h);c.restore();
 }
 function paintNight(m,viewport,_hole,masks,{gain=1}={}){
  if(dead||gain<=0||!prepareCaches(masks,gain))return;const b=plan.bounds;m.save();m.globalAlpha=1;m.drawImage(reveal,b.x-viewport.x+4,b.y-viewport.y+4,b.w,b.h);m.restore();
 }
 function paintParticles(c,{gain=1,duck=1}={}){
  if(dead||gain<=0)return;c.save();c.globalCompositeOperation='screen';
  for(const s of particles){const p=LIQUID_LIGHT_COLORS[s.type],alpha=clamp(s.alpha*gain*duck),r=s.radius;
   if(s.type===4){c.save();const clip=maskRef?.sourcePath?.({x:s.sourceX,y:s.sourceY},true);if(clip)c.clip(clip);const halo=s.pop?8:5.5;c.globalAlpha=alpha*.28;c.drawImage(glow(4),s.x-halo,s.y-halo,halo*2,halo*2);c.strokeStyle=p.core;c.fillStyle=p.color;
    if(!s.pop){c.globalAlpha=alpha*.20;c.beginPath();c.arc(s.x,s.y,r,0,Math.PI*2);c.fill();c.globalAlpha=alpha*.88;c.lineWidth=.65;c.beginPath();c.arc(s.x,s.y,r,0,Math.PI*2);c.stroke();c.globalAlpha=alpha;c.lineWidth=.8;c.beginPath();c.arc(s.x-r*.15,s.y-r*.15,r*.61,Math.PI*1.08,Math.PI*1.56);c.stroke();}
    else{const ring=r+s.pop*4.5;c.globalAlpha=alpha*.72;c.lineWidth=.65;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+s.phase*6.283;c.beginPath();c.arc(s.x,s.y,ring,a,a+.38*(1-s.pop));c.stroke();c.fillStyle=p.core;c.beginPath();c.arc(s.x+Math.cos(a)*ring,s.y+Math.sin(a)*ring*.76,.28+.48*(1-s.pop),0,Math.PI*2);c.fill();}}c.restore();continue;
   }c.globalAlpha=alpha*.32;c.drawImage(glow(s.type),s.x-3.5,s.y-3.5,7,7);c.globalAlpha=Math.min(.9,alpha);c.fillStyle=p.core;c.beginPath();
   if(s.type===1){c.moveTo(s.x,s.y-r*1.6);c.lineTo(s.x+r*.45,s.y-r*.25);c.lineTo(s.x+r,s.y);c.lineTo(s.x+r*.35,s.y+r*.25);c.lineTo(s.x,s.y+r*1.6);c.lineTo(s.x-r*.35,s.y+r*.25);c.lineTo(s.x-r,s.y);c.lineTo(s.x-r*.45,s.y-r*.25);c.closePath();}
   else{c.moveTo(s.x-r*.65,s.y+r);c.lineTo(s.x-r*.25,s.y-r);c.lineTo(s.x+r*.6,s.y-r*.6);c.lineTo(s.x+r*.45,s.y+r*.7);c.closePath();}c.fill();
  }c.restore();
 }
 return {update,paintGround,paintNight,paintParticles,status:()=>({visibleCells:plan.cells,emitters:plan.emitters.length,particles:particles.length,types:plan.groups.map(g=>g.type),textures:textures.size,cacheWidth:surface?.width||0,cacheHeight:surface?.height||0,canvasBytes:[...textures.values(),surface,reveal].filter(Boolean).reduce((n,c)=>n+c.width*c.height*4,0),time,soft}),
  dispose(){if(dead)return;dead=true;for(const c of [...textures.values(),surface,reveal].filter(Boolean))c.width=c.height=1;textures.clear();surface=reveal=null;plan={groups:[],emitters:[],cells:0};particles=[];maskRef=terrainRef=nodeRef=rockRef=null;}};
}
