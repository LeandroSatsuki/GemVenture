import {buildWallContours} from './cave-wall-art.js';
import {occludingWallPlan} from './cave-wall-occlusion.js';
import {DUNGEON_MATERIALS} from './dungeon-volumes.js';

// Ground-plane projection of the same upper-left light as the native solids.
export const CAVE_DEPTH=Object.freeze({light:[.24+.12/11,.12*8/11],shadowAlpha:.28,contactAlpha:.22,mistCount:6,mistAlpha:.055});
const geometry=new WeakMap(),paths=new WeakMap(),mistTextures=new Map();
const polygon=(c,p)=>{c.moveTo(...p[0]);for(const q of p.slice(1))c.lineTo(...q);c.closePath();};
const clockwise=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0)<0?p.reverse():p;
export function caveDepthGeometry(room){
 if(!room?.floorMask||room.layout?.style==='ABISMO')return null;
 const old=geometry.get(room);if(old?.mask===room.floorMask)return old;
 const loops=buildWallContours(room).loops,shadows=occludingWallPlan(room).map(f=>{
  const dx=Math.min(12,f.height*CAVE_DEPTH.light[0]),dy=Math.min(6,f.height*CAVE_DEPTH.light[1]);
  return {id:f.id,height:f.height,offset:[dx,dy],cast:clockwise([f.a,f.b,[f.b[0]+dx,f.b[1]+dy],[f.a[0]+dx,f.a[1]+dy]]),contact:clockwise([f.a,f.b,[f.b[0]+1.5,f.b[1]+.55],[f.a[0]+1.5,f.a[1]+.55]])};
 });
 const points=loops.flat(),bounds=points.length?{left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))}:null;
 const anchors=[];for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(room.floorMask[y*room.cols+x])anchors.push([50+22*x+2*y,57.5+16*y]);
 const value={mask:room.floorMask,loops,shadows,bounds,anchors};geometry.set(room,value);return value;
}
export function caveGroundPath(room){
 const g=caveDepthGeometry(room);if(!g)return null;let p=paths.get(g);if(p)return p;
 const ground=new Path2D(),cast=new Path2D(),contact=new Path2D();for(const loop of g.loops)polygon(ground,loop);for(const s of g.shadows){polygon(cast,s.cast);polygon(contact,s.contact);}p={ground,cast,contact};paths.set(g,p);return p;
}
export function paintCaveWallShadows(c,room,biome=0){
 const p=caveGroundPath(room);if(!p)return false;
 c.save();try{c.clip(p.ground,'evenodd');c.globalCompositeOperation='multiply';const alpha=c.globalAlpha;c.fillStyle=DUNGEON_MATERIALS[biome].rock[2];c.globalAlpha=alpha*CAVE_DEPTH.shadowAlpha;c.fill(p.cast);c.globalAlpha=alpha*CAVE_DEPTH.contactAlpha;c.fill(p.contact);}finally{c.restore();}return true;
}
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967296;};
export function sampleCaveMist(room,{time=0,soft=false}={}){
 const g=caveDepthGeometry(room);if(!g?.anchors.length)return [];const t=soft?0:Math.max(0,Number(time)||0),seed=room.seed>>>0;
 return Array.from({length:CAVE_DEPTH.mistCount},(_,i)=>{const a=hash(seed^Math.imul(i+1,193939)),z=hash(seed^Math.imul(i+3,71933)),anchor=g.anchors[Math.floor(((i*.618+a*.3)%1)*g.anchors.length)];return {x:anchor[0]+Math.sin(t*.08+a*6.283)*12,y:anchor[1]+Math.cos(t*.06+z*6.283)*5,width:170+a*130,height:22+z*17,alpha:CAVE_DEPTH.mistAlpha*(.8+.2*Math.sin(t*.12+a*6.283))};});
}
function mistTexture(biome){
 if(mistTextures.has(biome))return mistTextures.get(biome);if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const c=canvas.getContext('2d'),color=DUNGEON_MATERIALS[biome].light;c.scale(1,.25);
 for(const [x,y,r,alpha]of [[84,128,82,'99'],[143,115,97,'88'],[187,139,62,'77']]){const gradient=c.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,color+alpha);gradient.addColorStop(.45,color+'44');gradient.addColorStop(1,color+'00');c.fillStyle=gradient;c.fillRect(x-r,y-r,r*2,r*2);}
 mistTextures.set(biome,canvas);return canvas;
}
export function paintCaveMist(c,room,biome,time,{soft=false}={}){
 const p=caveGroundPath(room);if(!p)return false;const texture=mistTexture(biome);if(!texture)return false;
 c.save();try{c.clip(p.ground,'evenodd');c.globalCompositeOperation='source-over';const alpha=c.globalAlpha;for(const m of sampleCaveMist(room,{time,soft})){c.globalAlpha=alpha*m.alpha;c.drawImage(texture,m.x-m.width/2,m.y-m.height/2,m.width,m.height);}}finally{c.restore();}return true;
}
