import {paintVfxEmission} from './vfx-emission.js';
import {P} from './palette.js';

export const GEODE_VFX_SPEC=Object.freeze({maxEffects:6,maxPieces:96,maxSeen:64,maxMasks:8,pulseSeconds:.42,pillarSeconds:.42,hitSeconds:.26});
const finite=Number.isFinite,clamp=n=>Math.max(0,Math.min(1,n));
const masks=new Map();
const corners=[[-12,-8],[10,-8],[12,8],[-10,8]],neighbors=[[0,-1],[1,0],[0,1],[-1,0]];
const cellKey=t=>t.x+','+t.y;
function validTiles(tiles){return Array.isArray(tiles)&&tiles.length>0&&tiles.length<=25&&tiles.every(t=>Number.isInteger(t.x)&&Number.isInteger(t.y))&&new Set(tiles.map(cellKey)).size===tiles.length;}
function maskFor(tiles,project){
 if(!validTiles(tiles))return null;
 const origin=project(0,0),unit=project(1,1),key=origin.x+':'+origin.y+':'+unit.x+':'+unit.y+':'+tiles.map(cellKey).sort().join(';');
 if(masks.has(key))return masks.get(key);
 const set=new Set(tiles.map(cellKey)),cells=[],edges=[];
 for(const t of tiles){const p=project(t.x,t.y),x=p.x/2,y=p.y/2;cells.push({x,y});for(let i=0;i<4;i++){const d=neighbors[i];if(set.has((t.x+d[0])+','+(t.y+d[1])))continue;const a=corners[i],b=corners[(i+1)%4];edges.push([x+a[0],y+a[1],x+b[0],y+b[1]]);}}
 const mask={cells,edges};masks.set(key,mask);if(masks.size>GEODE_VFX_SPEC.maxMasks)masks.delete(masks.keys().next().value);return mask;
}
function clipMask(c,mask){c.beginPath();for(const p of mask.cells){c.moveTo(p.x-12,p.y-8);c.lineTo(p.x+10,p.y-8);c.lineTo(p.x+12,p.y+8);c.lineTo(p.x-10,p.y+8);c.closePath();}c.clip();}
function block(c,x,y,size,angle,alpha,stone=false){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.fillStyle=P.gray;c.beginPath();c.moveTo(-size,-size*.65);c.lineTo(size*.65,-size);c.lineTo(size,size*.55);c.lineTo(-size*.7,size);c.closePath();c.fill();
 c.fillStyle=P.white;c.beginPath();c.moveTo(-size,-size*.65);c.lineTo(size*.65,-size);c.lineTo(size,stone?0:size*.45);c.lineTo(-size*.7,size*.1);c.closePath();c.fill();c.restore();
}
function seedNumber(s){let n=2166136261;for(const ch of String(s))n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;}
function randomFor(seed){let n=seedNumber(seed);return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function isGeodeDamage(e){return e?.type==='hit'&&e.targetType==='enemy'&&e.bossIndex===0&&(typeof e.targetId==='string'||finite(e.targetId))&&Number.isInteger(e.beat)&&finite(e.actualDamage)&&e.actualDamage>0;}
export function isGeodePulse(e){return e?.type==='geodePulse'&&e.version===1&&e.bossIndex===0&&typeof e.id==='string'&&e.id.length>0&&finite(e.sourceId)&&Number.isInteger(e.beat)&&Number.isInteger(e.startedBeat)&&Number.isInteger(e.scheduledBeat)&&e.scheduledBeat===e.startedBeat+3&&e.beat>=e.scheduledBeat&&e.pulseRadius===3&&Number.isInteger(e.x)&&Number.isInteger(e.y)&&['miss','guarded','pushed','blocked-by-obstacle'].includes(e.contact)&&validTiles(e.tiles)&&e.tiles.every(t=>Math.abs(t.x-e.x)+Math.abs(t.y-e.y)<=3);}

// Under the actors. A broken stone seam follows only the outside edges of the
// authoritative mask; it is separate from the pillar's existing three points.
// presentationBeat must come from World's frozen visual beat, never wall time.
export function paintGeodePulseWarning(c,{windup:w,project,presentationBeat=0,soft=false}={}){
 if(!w?.geodePulse||!w.geode||typeof project!=='function'||!finite(w.startedBeat)||!finite(w.beat)||w.beat<=w.startedBeat||!finite(presentationBeat))return null;
 const mask=maskFor(w.tiles,project);if(!mask)return null;
 const progress=clamp((presentationBeat-w.startedBeat)/(w.beat-w.startedBeat)),remaining=Math.max(1,Math.min(3,Math.ceil(w.beat-presentationBeat)));
 c.save();c.globalCompositeOperation='source-over';c.lineJoin='bevel';c.lineCap='square';
 for(let i=0;i<mask.edges.length;i++){const [ax,ay,bx,by]=mask.edges[i],dx=bx-ax,dy=by-ay,n=Math.hypot(dx,dy)||1,mx=(ax+bx)/2,my=(ay+by)/2;
  c.globalAlpha=.7+progress*.25;c.strokeStyle=P.gray;c.lineWidth=2.4;c.beginPath();c.moveTo(ax+dx*.06,ay+dy*.06);c.lineTo(mx-dy/n*1.1,my+dx/n*1.1);c.lineTo(bx-dx*.06,by-dy*.06);c.stroke();
  c.globalAlpha=.48+progress*.25;c.strokeStyle=P.white;c.lineWidth=.7;c.stroke();
  if(i%2===0)block(c,mx,my,1.6+(soft?0:progress*.35),i*.8,.8,true);
 }
 c.restore();return{remaining,progress,edges:mask.edges.length};
}
// Optional crisp pass, above floor/actors and below HUD. No flashing count.
export function paintGeodePulseCount(c,{windup:w,project,presentationBeat=0,labelY}={}){
 if(!w?.geodePulse||!finite(presentationBeat)||typeof project!=='function')return false;
 const p=project(w.x,w.y),remaining=Math.max(1,Math.min(3,Math.ceil(w.beat-presentationBeat)));
 c.save();c.globalAlpha=1;c.font="700 10px 'Trebuchet MS','Segoe UI',sans-serif";c.textAlign='center';c.lineJoin='round';c.lineWidth=3;c.strokeStyle=P.gray;c.fillStyle=P.white;const text='AFASTE-SE · '+remaining,y=finite(labelY)?labelY:p.y/2-96;c.strokeText(text,p.x/2,y);c.fillText(text,p.x/2,y);c.restore();return true;
}

export class GeodeVfx{
 constructor(){this.clear();}
 clear(){this.effects=[];this.seen=new Set();this.lastVisualBeat=null;}
 visualBeat(beat,paused=false){if(finite(beat)&&(!paused||this.lastVisualBeat===null))this.lastVisualBeat=beat;return this.lastVisualBeat??0;}
 remember(key){if(this.seen.has(key))return false;this.seen.add(key);if(this.seen.size>GEODE_VFX_SPEC.maxSeen)this.seen.delete(this.seen.values().next().value);return true;}
 consume(events,project,time=0,soft=false){
  const eruptions=new Set();
  for(const e of events){let kind,key,mask=null;
   if(isGeodePulse(e)){kind='pulse';key='pulse:'+e.id;mask=maskFor(e.tiles,project);if(!this.remember(key))continue;}
   else if(isGeodeDamage(e)&&finite(e.x)&&finite(e.y)){kind='hit';key='hit:'+e.targetId+':'+e.beat;if(!this.remember(key))continue;}
   else if(e.type==='geodeEruption'&&finite(e.x)&&finite(e.y)){kind='pillar';key='pillar:'+e.x+':'+e.y;if(eruptions.has(key))continue;eruptions.add(key);}
   else continue;
   const p=project(e.x,e.y),r=randomFor(key),pieces=[],count=soft?(kind==='pulse'?10:kind==='pillar'?6:2):(kind==='pulse'?28:kind==='pillar'?15:4);
   for(let i=0;i<count;i++){const a=i/count*Math.PI*2+r()*.2,dx=Math.cos(a),dy=Math.sin(a),l=Math.abs(dx)+Math.abs(dy)||1;pieces.push({dx:dx/l,dy:dy/l,size:kind==='hit'?1.3+r()*1.2:1.6+r()*1.9,angle:r()*3,spread:.65+r()*.35,stone:i%4===0});}
   this.effects.push({kind,key,x:p.x/2,y:p.y/2,time,soft:!!soft,mask,pieces,duration:soft?.2:kind==='hit'?GEODE_VFX_SPEC.hitSeconds:GEODE_VFX_SPEC.pulseSeconds});
   while(this.effects.length>GEODE_VFX_SPEC.maxEffects||this.effects.reduce((n,f)=>n+f.pieces.length,0)>GEODE_VFX_SPEC.maxPieces)this.effects.shift();
  }
 }
 update(time){this.effects=this.effects.filter(e=>time-e.time<e.duration);}
 scroll(dx,dy){for(const e of this.effects){e.x-=dx;e.y-=dy;/* Boss pulse exists only in fixed arenas; clear masked effects on a row shift. */}this.effects=this.effects.filter(e=>!e.mask);}
 draw(c,time,{layer='floor',soft=false}={}){
  for(const e of this.effects){if(layer==='floor'&&e.kind==='hit'||layer==='chips'&&e.kind==='pulse')continue;const u=clamp((time-e.time)/e.duration);if(u>=1)continue;const reduced=soft||e.soft;
   c.save();c.globalCompositeOperation='source-over';if(e.mask)clipMask(c,e.mask);
   for(let i=0;i<e.pieces.length;i++){const p=e.pieces[i];if(e.kind==='pillar'&&(layer==='chips')!==(p.dy>=0))continue;const piece=geodePieceFrame(e,p,time,soft);if(!piece)continue;const{x,y,alpha,angle}=piece;
    if(e.kind==='pulse'){
     if(i<4&&!reduced){const tile=e.mask.cells[(i*7)%e.mask.cells.length];block(c,tile.x,tile.y,1.25,p.angle,(1-u)*.4);}
    }
    paintVfxEmission(c,[{x,y,radius:4,alpha:alpha*.65,color:P.silver}],{soft:reduced});
    block(c,x,y,p.size*(p.stone?1:1+u*.45),angle,alpha,p.stone);
   }
   c.restore();
  }
 }
 emissionSources(time,{soft=false,limit=24}={}){const points=[];for(const e of this.effects)for(const p of e.pieces){const f=geodePieceFrame(e,p,time,soft);if(f)points.push({...f,radius:4,alpha:f.alpha*.65,color:P.silver,kind:'geode-chip'});if(points.length>=limit)return points;}return points;}
 status(){return{effects:this.effects.length,pieces:this.effects.reduce((n,e)=>n+e.pieces.length,0),seen:this.seen.size,masks:masks.size};}
}

export function geodePieceFrame(e,p,time,soft=false){const u=clamp((time-e.time)/e.duration),reduced=soft||e.soft;if(u<0||u>=1||time<e.time)return null;let x=e.x,y=e.y,alpha=(1-u)*(reduced?.6:.85),angle=p.angle;
    if(e.kind==='pulse'){
     const reach=reduced?1.8:Math.min(3,.22+u*4.2)*p.spread,tx=p.dx*reach,ty=p.dy*reach;x+=tx*22+ty*2;y+=ty*16;
    }else{
     const distance=(reduced?(e.kind==='pillar'?28:3):(e.kind==='pillar'?28+24*u:12*u))*p.spread;x+=p.dx*distance;y+=p.dy*distance*.35;
     if(e.kind==='hit')y-=30;
     if(!reduced){y-=Math.sin(u*Math.PI)*6;angle+=u*(p.stone?2:.4);}
    }
 return{x,y,alpha,angle};}
