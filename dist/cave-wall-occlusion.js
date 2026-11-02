// Complete, fixed-height walls, sorted with actors. No shortening to reveal a tile.
import {buildWallContours,WALL_HEIGHT,WALL_RIM} from './cave-wall-art.js';
import {paintDungeonWalls} from './dungeon-wall-finish.js';
const cache=new WeakMap();
export function occludingWallPlan(room){
 const old=cache.get(room);if(old?.mask===room.floorMask)return old.faces;
 const faces=[];
 for(const [li,loop]of buildWallContours(room).loops.entries())for(let i=0;i<loop.length;i++){
  const start=loop[i],end=loop[(i+1)%loop.length],height=30,steps=Math.max(1,Math.round(Math.max(Math.abs(end[0]-start[0])/22,Math.abs(end[1]-start[1])/16)));
  for(let j=0;j<steps;j++){
   const at=t=>[start[0]+(end[0]-start[0])*t,start[1]+(end[1]-start[1])*t],a=at(j/steps),b=at((j+1)/steps),base=Math.max(a[1],b[1]);
   faces.push({id:`${li}:${i}:${j}`,type:'wall',a,b,height,startHeight:height,endHeight:height,role:end[0]>start[0]?'front':'return',cap:[[a[0],a[1]-height],[b[0],b[1]-height],[b[0],b[1]-height-WALL_RIM],[a[0],a[1]-height-WALL_RIM]],visualDepth:(base*2-115)/32});
  }
 }
 cache.set(room,{mask:room.floorMask,faces});return faces;
}
export function wallOcclusion(face,player){
 const x=player.x/2,y=player.y/2,left=Math.min(face.a[0],face.b[0]),right=Math.max(face.a[0],face.b[0]),base=Math.max(face.a[1],face.b[1]);
 if(y>base+2||y<base-face.height-22)return 1;
 const distance=Math.max(left-x,x-right,0),blend=Math.max(0,Math.min(1,(23-distance)/12));
 const vertical=Math.min(1,Math.max(0,(base+2-y)/12),Math.max(0,(y-(base-face.height-22))/12));return 1-.76*blend*vertical;
}
// Per-room faces are immutable. Cache their opaque raster; only compositing and
// occlusion alpha vary per frame. Weak keys release the previous room naturally.
const rasters=new WeakMap();
function wallRaster(face,biome){
 const old=rasters.get(face);if(old?.biome===biome)return old;
 if(typeof document==='undefined')return null;
 const points=[face.a,face.b,...face.cap],x=Math.floor(Math.min(...points.map(p=>p[0])))-2,y=Math.floor(Math.min(...points.map(p=>p[1])))-2,w=Math.ceil(Math.max(...points.map(p=>p[0])))-x+2,h=Math.ceil(Math.max(...points.map(p=>p[1])))-y+2;
 const canvas=document.createElement('canvas');canvas.width=w*2;canvas.height=h*2;const ctx=canvas.getContext('2d');ctx.setTransform(2,0,0,2,-x*2,-y*2);paintDungeonWalls(ctx,{loops:[],faces:[face]},biome);
 const value={canvas,x,y,w,h,biome};rasters.set(face,value);return value;
}
export function paintOccludingWall(c,face,biome,player){c.save();c.globalAlpha*=wallOcclusion(face,player);const r=wallRaster(face,biome);if(r)c.drawImage(r.canvas,r.x,r.y,r.w,r.h);else paintDungeonWalls(c,{loops:[],faces:[face]},biome);c.restore();}

