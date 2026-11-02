import {captureSceneryEmission} from './scenery-emission-bridge.js';
// Approved Abismo scene. Rendering reads the native run without editing simulation.
import {CAMPAIGN_CAVE_ART} from './campaign-cave-data.js';
import {buildWallContours} from './cave-wall-art.js';
import {buildPilotWallPlan,paintPilotWall,traceBurrowArch} from './campaign-cave-walls.js';
import {buildTerrainPlan,createTerrainPainter,paintTerrainMotion} from './campaign-cave-terrain.js';
import {clipBurrowFog,paintBurrowHabitat} from './abyss-cave-habitat.js';
import {hedgehogMood} from './hedgehog.js';

const project=(x,y)=>[50+22*x+2*y,57.5+16*y];
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);return((n^n>>>16)>>>0)/4294967296;};
const mix=(a,b,t)=>'#'+[16,8,0].map(k=>{const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return Math.round(((x>>k)&255)*(1-t)+((y>>k)&255)*t).toString(16).padStart(2,'0');}).join('');
const tile=(p,x,y)=>{const[a,b]=project(x,y);p.moveTo(a-12,b-8);p.lineTo(a+10,b-8);p.lineTo(a+12,b+8);p.lineTo(a-10,b+8);p.closePath();};
const loaded=new Map();
function imagesFor(bi){
 if(loaded.has(bi))return loaded.get(bi);
 const p=Promise.all(Object.entries({...CAMPAIGN_CAVE_ART[bi].assets,'occlusion-mask':'./assets/campaign-caves-v1/occlusion-mask.png'}).map(([key,url])=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok([key,im]);im.onerror=()=>no(Error('Asset: '+key));im.src=url;}))).then(entries=>new Map(entries));
 if(loaded.size>=2)loaded.delete(loaded.keys().next().value);loaded.set(bi,p);return p;
}
export function abyssMaterial(bi){
 const m=CAMPAIGN_CAVE_ART[bi].material;
 return {...m,floor:mix(m.floor,'#111929',.30),rock:m.rock.map((c,i)=>mix(c,['#47536d','#303951','#182236'][i],.34))};
}
export function createAbyssScene(run,biome){
 const room=run.room,data={...CAMPAIGN_CAVE_ART[biome],material:abyssMaterial(biome)},terrainPainter=createTerrainPainter(make),cache=new Map(),scratch=make(1,1);
 const state={room,biome,data,dynamicMineralShadows:true,images:null,error:null,props:[],view:null,initial:true,disposed:false};
 let revision='',floorPath,patches=[],terrain,faces=[],burrow=null,peak=0,totalRasters=0;
 state.promise=imagesFor(biome).then(images=>{if(!state.disposed)state.images=images;}).catch(e=>{state.error=String(e.message||e);});
 const depth=()=>run.abyss.rows;
 function rebuild(){
  const d=depth(),contours=buildWallContours(room).loops;floorPath=new Path2D();patches=[];
  // A single outline represents the same floor union. Clipping every draw to
  // a compound path of 1,000 tile quads is unnecessarily expensive.
  for(const loop of contours){floorPath.moveTo(...loop[0]);for(const p of loop.slice(1))floorPath.lineTo(...p);floorPath.closePath();}
  for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(room.floorMask[y*room.cols+x]){
   const n=room.seed+x*977+(y+d)*157;
   if(hash(n)>.973){const [px,py]=project(x,y);patches.push({px,py,rx:9+hash(n+5)*12,ry:3+hash(n+8)*3,light:hash(n+9)>.5});}
  }
  terrain=buildTerrainPlan(room);
  // The appearance of a retained strip follows its absolute row, not the
  // rebased local array index. Native terrain types and connectivity stay intact.
  for(const group of terrain.groups){
   for(const cell of group.cells){const n=room.seed+(cell.x+(cell.y+d)*room.cols)*157;cell.variant=Math.floor(hash(n)*4);cell.priority=hash(n+691);cell.phase=hash(n+31);}
   group.emitters=[...group.cells].sort((a,b)=>a.priority-b.priority).filter((a,i,all)=>!all.slice(0,i).some(b=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<3)).slice(0,group.type===1?8:group.type===3?6:group.type===4?8:0);
  }
  terrainPainter.prepareTerrain(terrain);
  // One native contour supplies curves, returns and corner joins. Segment
  // rasters have a bounded cache; no infinite world-sized bitmap is allocated.
  faces=buildPilotWallPlan(contours).faces.filter(f=>f.visualDepth>=1&&f.visualDepth<room.rows-2).map(f=>{
   const a=[f.a[0]+2*d,f.a[1]+16*d],b=[f.b[0]+2*d,f.b[1]+16*d],dx=b[0]-a[0],dy=b[1]-a[1],axis=Math.abs(dx)>=Math.abs(dy)?0:1,sign=Math.sign(b[axis]-a[axis])||1,s0=a[axis]*sign;
   const absolute={...f,a,b,cap:f.cap.map(([x,y])=>[x+2*d,y+16*d]),arcStart:s0,arcEnd:b[axis]*sign,loop:axis+Math.max(0,-sign)*2};
   const key=[...a,...b,absolute.loop].map(v=>Math.round(v*1000)/1000).join(':');
   return {type:'campaignWall',id:key,key,face:absolute,visualDepth:f.visualDepth};
  });
  burrow=null;revision=d+':'+room.floorMask.length;state.metrics={depth:d,faces:faces.length,terrainCells:terrain.count};
 }
 function faceRaster(item){
  if(cache.has(item.key)){const a=cache.get(item.key);cache.delete(item.key);cache.set(item.key,a);return a;}
  const f=item.face,pts=[f.a,f.b,...f.cap],x=Math.floor(Math.min(...pts.map(p=>p[0])))-2,y=Math.floor(Math.min(...pts.map(p=>p[1])))-2,w=Math.ceil(Math.max(...pts.map(p=>p[0]))-x)+3,h=Math.ceil(Math.max(...pts.map(p=>p[1]))-y)+3;
  const canvas=make(w*2,h*2),c=canvas.getContext('2d');c.setTransform(2,0,0,2,-2*x,-2*y);paintPilotWall(c,f,data.material);
  const raster={canvas,x,y,w,h};if(cache.size>=512){const first=cache.keys().next().value;cache.get(first).canvas.width=1;cache.delete(first);}cache.set(item.key,raster);peak=Math.max(peak,cache.size);totalRasters++;return raster;
 }
 state.prepare=(view)=>{
  state.view=view;if(state.disposed||state.error||!state.images)return false;
  try{if(revision!==depth()+':'+room.floorMask.length)rebuild();return true;}catch(e){state.error=String(e.stack||e);return false;}
 };
 state.paintGround=(c,time,soft)=>{
  c.save();c.fillStyle=data.material.floor;c.fill(floorPath);c.clip(floorPath);
  for(const p of patches){c.globalAlpha=.16;c.fillStyle=p.light?data.material.rock[1]:'#0b1323';c.beginPath();c.ellipse(p.px,p.py,p.rx,p.ry,-.08,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  terrainPainter.paintTerrainLayer(c,terrain);paintTerrainMotion(c,terrain,{time,soft});
  // Mineral contact is drawn with its body, including impact offsets.
  c.restore();
 };
 state.walls=()=>{
  const d=depth(),v=state.view;return faces.filter(a=>{const f=a.face,x=(f.a[0]+f.b[0])/2-2*d,y=(f.a[1]+f.b[1])/2-16*d;return Math.abs(x-v.center[0])<v.width/2+45&&Math.abs(y-v.center[1])<v.height/2+65;});
 };
 state.paintWall=(c,item,player)=>{
  const r=faceRaster(item),d=depth(),x=r.x-2*d,y=r.y-16*d,px=player.x/2,py=player.y/2,playerY=(player.y-115)/32;
  if(item.visualDepth<=playerY||px+52<=x||px-52>=x+r.w||py+40<=y||py-80>=y+r.h){c.drawImage(r.canvas,x,y,r.w,r.h);captureSceneryEmission(c,'occluder',[r.canvas,x,y,r.w,r.h]);return;}
  if(scratch.width<r.w*2)scratch.width=r.w*2;if(scratch.height<r.h*2)scratch.height=r.h*2;
  const s=scratch.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,scratch.width,scratch.height);s.drawImage(r.canvas,0,0);s.save();s.globalCompositeOperation='destination-out';s.drawImage(state.images.get('occlusion-mask'),(px-52-x)*2,(py-80-y)*2,208,240);s.restore();c.drawImage(scratch,0,0,r.w*2,r.h*2,x,y,r.w,r.h);captureSceneryEmission(c,'occluder',[scratch,0,0,r.w*2,r.h*2,x,y,r.w,r.h]);
 };
 state.paintBurrow=(c,{phase=0,soft=false}={})=>{
  const h=room.hedgehog;if(!h)return;const [cx,cy]=project(h.x,h.y);
  if(!burrow){const path=new Path2D();path.rect(cx-130,cy-146,260,166);path.addPath(floorPath);burrow={path};}
  const mood=hedgehogMood(room.hedgehogGrowth,phase,soft),age=phase-(room.hedgehogGrowth?.lastHitBeat??-1e6),frame=mood.state==='sad'?8+Math.min(3,Math.floor(Math.max(0,age)*2)):mood.state==='recover'?12+Math.min(3,Math.floor((age-2)*4)):Math.floor((soft?0:Math.max(0,phase))*4)%8;
  c.save();c.clip(burrow.path,'evenodd');c.drawImage(state.images.get('burrow-host'),cx-130,cy-146,260,166);paintBurrowHabitat(c,cx,cy,data.material);traceBurrowArch(c,cx,cy);c.clip();c.drawImage(state.images.get('hedgehog-atlas'),frame*384,0,384,320,cx-96,cy+5-135,192,160);captureSceneryEmission(c,'hedgehog',{image:state.images.get('hedgehog-atlas'),frame,clip:burrow.path,traceArch:traceBurrowArch,cx,cy});c.restore();
 };
 state.clipFog=c=>clipBurrowFog(c,room,state.view);
 state.paintDisco=(c,item,player,paint)=>{const d=depth(),f=item.face,local={...f,a:[f.a[0]-2*d,f.a[1]-16*d],b:[f.b[0]-2*d,f.b[1]-16*d],cap:f.cap.map(([x,y])=>[x-2*d,y-16*d]),visualDepth:item.visualDepth};c.save();if(item.visualDepth>(player.y-115)/32){const path=new Path2D();path.rect(state.view.center[0]-state.view.width,state.view.center[1]-state.view.height,state.view.width*2,state.view.height*2);path.rect(player.x/2-52,player.y/2-80,104,120);c.clip(path,'evenodd');}paint(c,local);c.restore();};
 state.dispose=()=>{state.disposed=true;for(const r of cache.values())r.canvas.width=1;cache.clear();scratch.width=1;};
 state.status=()=>({depth:depth(),wallEntries:cache.size,wallLimit:512,wallPeak:peak,totalRasters,wallBytes:[...cache.values()].reduce((n,r)=>n+r.canvas.width*r.canvas.height*4,0),terrain:terrainPainter.terrainCacheStatus(),...state.metrics});
 return state;
}
