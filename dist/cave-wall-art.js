import {paintDungeonWalls} from './dungeon-wall-finish.js';
import {isFloor} from './cave-layout.js';
import {P} from './palette.js';
import {caveBiomeProfile,createWallMaterial,wallMaterialMetrics} from './cave-biome-art.js';
export {wallMaterialMetrics};

// Art is raster. Geometry supplies one connected support, never a sprite per cell.
export const WALL_ART_ROOT='./assets/cave-walls/';
export const WALL_ART_FILES=['stone-courses-v3.png','stone-coping-v4.png','timber-front-v4.png','stone-footing-v4.png'];
export const WALL_HEIGHT=48;
export const WALL_RIM=4;
export const PILLAR_HEIGHT=52;
export const PILLAR_WIDTH=10;
export const WALL_REPEAT=132;
export const WALL_ROUND=3;
const INK=P.ink,FACE=P.slate;
let ready=false,loading=null,revision=0;
const images=[];
const patterns=new WeakMap();
export const wallArtRevision=()=>revision;
export const wallArtReady=()=>ready;
// Current boss arenas share one audited open rectangle. Unknown or legacy
// layouts retain their fallback; enabling art never modifies topology.
export function supportsBossWallArt(room){
 if(!room?.bossFloor||room.cols!==21||room.rows!==15||room.layout?.style!=='ARENA'||room.floorMask?.length!==315)return false;
 for(let i=0;i<315;i++)if(room.floorMask[i]!==+(i%21>0&&i%21<20&&Math.floor(i/21)>0&&Math.floor(i/21)<14))return false;
 return true;
}
export function usesWallArt(room,biome=0){return !!caveBiomeProfile(biome)&&!!room.floorMask&&(!room.bossFloor||supportsBossWallArt(room))&&room.layout?.style!=='ABISMO';}
export function loadWallArt(){
 if(loading)return loading;
 if(typeof Image==='undefined')return Promise.resolve(false);
 loading=Promise.all(WALL_ART_FILES.map((file,i)=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>{images[i]=image;resolve(true);};image.onerror=()=>resolve(false);image.src=WALL_ART_ROOT+file;
 }))).then(result=>{ready=result.every(Boolean);if(ready)revision++;return ready;});return loading;
}
const point=([x,y])=>[38+22*x+2*y,49.5+16*y];
const key=p=>p.join(',');
// Clockwise edges keep the walkable area on the right. Right-hand pairing at
// diagonal contacts prevents bow ties and preserves separate inner circuits.
export function buildWallContours(room){
 const edges=[];
 for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(isFloor(room,x,y)){
  for(const [dx,dy,a,b,dir]of [[0,-1,[x,y],[x+1,y],0],[1,0,[x+1,y],[x+1,y+1],1],[0,1,[x+1,y+1],[x,y+1],2],[-1,0,[x,y+1],[x,y],3]])if(!isFloor(room,x+dx,y+dy))edges.push({a,b,dir});
 }
 const starts=new Map();edges.forEach((e,i)=>{const k=key(e.a);if(!starts.has(k))starts.set(k,[]);starts.get(k).push(i);});
 const used=new Set(),loops=[];
 for(let i=0;i<edges.length;i++)if(!used.has(i)){
  const loop=[];let index=i;
  while(!used.has(index)){used.add(index);const e=edges[index];loop.push(e.a);
   if(key(e.b)===key(edges[i].a))break;
   const candidates=(starts.get(key(e.b))||[]).filter(j=>!used.has(j));
   if(!candidates.length)throw new Error('Open cave wall contour');
   candidates.sort((a,b)=>[1,0,3,2].indexOf((edges[a].dir-e.dir+4)%4)-[1,0,3,2].indexOf((edges[b].dir-e.dir+4)%4));index=candidates[0];
  }
  loops.push(loop.filter((p,j)=>{const a=loop[(j+loop.length-1)%loop.length],b=loop[(j+1)%loop.length];return(p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);}).map(point));
 }
 return{loops,edgeCount:edges.length};
}

const planCache=new WeakMap();
const linePath=points=>{const p=new Path2D();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));return p;};
const polygon=points=>{const p=linePath(points);p.closePath();return p;};
// Presentation-only inset curves keep the logical contour and conservative bounds.
export function roundedWallPath(points,radius=WALL_ROUND){
 const p=new Path2D(),corners=points.map((b,i)=>{
  const a=points[(i+points.length-1)%points.length],d=points[(i+1)%points.length];
  const al=Math.hypot(a[0]-b[0],a[1]-b[1]),dl=Math.hypot(d[0]-b[0],d[1]-b[1]),r=Math.min(radius,al/3,dl/3);
  return {b,in:al?[b[0]+(a[0]-b[0])*r/al,b[1]+(a[1]-b[1])*r/al]:b,out:dl?[b[0]+(d[0]-b[0])*r/dl,b[1]+(d[1]-b[1])*r/dl]:b};
 });
 corners.forEach((v,i)=>{if(i)p.lineTo(...v.in);else p.moveTo(...v.in);p.quadraticCurveTo(...v.b,...v.out);});p.closePath();return p;
}
function overlaps(a,b){
 for(const shape of [a,b])for(let i=0;i<shape.length;i++){
  const p=shape[i],q=shape[(i+1)%shape.length],nx=p[1]-q[1],ny=q[0]-p[0];
  let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;
  for(const v of a){const n=v[0]*nx+v[1]*ny;amin=Math.min(amin,n);amax=Math.max(amax,n);}
  for(const v of b){const n=v[0]*nx+v[1]*ny;bmin=Math.min(bmin,n);bmax=Math.max(bmax,n);}
  if(amax<=bmin+.001||bmax<=amin+.001)return false;
 }return true;
}
function floorCells(room){
 const result=[];for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(isFloor(room,x,y)){
  const px=50+22*x+2*y,py=57.5+16*y;
  // Fixed presentation gutter: only the outside edge can be overhung by bevels.
  // Logical navigation and the full floorMask remain unchanged.
  result.push({x,y,left:px-9,right:px+9,top:py-6,bottom:py+6,poly:[[px-9,py-6],[px+7.5,py-6],[px+9,py+6],[px-7.5,py+6]]});
 }return result;
}
const facePoly=(a,b,h,rim=0)=>[a,b,[b[0],b[1]-h-rim],[a[0],a[1]-h-rim]];
function fits(poly,cells){
 const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
 return !cells.some(c=>c.right>l&&c.left<r&&c.bottom>t&&c.top<b&&overlaps(poly,c.poly));
}
export function buildWallPlan(room){
 const old=planCache.get(room);if(old?.mask===room.floorMask)return old.plan;
 const contours=buildWallContours(room),cells=floorCells(room),faces=[],joints=[],runs=[];
 for(const [li,loop]of contours.loops.entries()){
  const edges=loop.map((a,i)=>{const b=loop[(i+1)%loop.length];return{id:`${li}:${i}`,a,b,role:b[0]>a[0]?(b[1]===a[1]?'front':'return'):'cutaway',height:0};});
  for(const e of edges)if(e.role==='front'){
   e.height=[48,32,16,8,0].find(h=>h===0||fits(facePoly(e.a,e.b,h,4),cells));runs.push(e);
  }
  for(let i=0;i<edges.length;i++){
   const e=edges[i],prev=edges[(i+edges.length-1)%edges.length],next=edges[(i+1)%edges.length];
   if(e.role==='return'){
    const preferred=Math.max(prev.height,next.height,8);
    e.height=[48,32,16,8,0].find(h=>h<=preferred&&(h===0||fits(facePoly(e.a,e.b,h,4),cells)));
    e.startHeight=Math.min(e.height,prev.role==='front'?prev.height:0);
    e.endHeight=Math.min(e.height,next.role==='front'?next.height:0);
   }else{e.startHeight=e.height;e.endHeight=e.height;}
  }
  for(let i=0;i<edges.length;i++){
   const e=edges[i],prev=edges[(i+edges.length-1)%edges.length];
   if(e.height>0)faces.push({...e,face:[e.a,e.b,[e.b[0],e.b[1]-e.endHeight],[e.a[0],e.a[1]-e.startHeight]],cap:[[e.a[0],e.a[1]-e.startHeight],[e.b[0],e.b[1]-e.endHeight],[e.b[0],e.b[1]-e.endHeight-4],[e.a[0],e.a[1]-e.startHeight-4]]});
   // Exactly one owner per contour vertex, including cut transitions.
   if(e.startHeight||prev.endHeight)joints.push({id:`joint:${e.id}`,base:[...e.a],left:prev.id,right:e.id,leftHeight:prev.endHeight,rightHeight:e.startHeight,kind:prev.endHeight===e.startHeight?'corner':'transition'});
  }
 }
 faces.sort((a,b)=>Math.max(a.a[1],a.b[1])-Math.max(b.a[1],b.b[1])||a.a[0]-b.a[0]);
 const supports=[];
 function addSupport(f,x,kind,joint=null){
  const height=f.height+WALL_RIM,width=PILLAR_WIDTH;
  const p={x,y:f.a[1],width,height,kind,owner:f.id,joint:joint?.id??null,corner:joint?[...joint.base]:[x,f.a[1]],upper:[x,f.a[1]-height],lower:[x,f.a[1]]};
  const rect=[[x-width/2,p.y],[x+width/2,p.y],[x+width/2,p.y-height],[x-width/2,p.y-height]];
  if(!fits(rect,cells))return;
  const reserved=[room.hedgehog&&{...room.hedgehog,r:80},room.exit&&{...room.exit,r:38},{x:3,y:11,r:35}].filter(Boolean);
  if(reserved.some(q=>Math.abs((50+22*q.x+2*q.y)-x)<q.r+8&&Math.abs((57.5+16*q.y)-(p.y-height/2))<q.r+height/2))return;
  if(supports.some(q=>Math.abs(q.x-x)<36&&Math.abs(q.y-p.y)<Math.max(height,q.height)))return;
  supports.push(p);
 }
 // Material joints take priority; a nearby corner does not need a second post.
 for(const f of faces)if(f.role==='front'&&f.height>=16){
  for(let x=Math.ceil((f.a[0]+PILLAR_WIDTH)/WALL_REPEAT)*WALL_REPEAT;x<f.b[0]-PILLAR_WIDTH;x+=WALL_REPEAT)addSupport(f,x,'seam');
 }
 for(const f of faces){
  if(f.role!=='front'||f.height!==48||f.b[0]-f.a[0]<66)continue;
  // A support belongs to a front/return junction. Its right edge is the vertex;
  // its centre is not moved until an arbitrary free rectangle is discovered.
  const joint=joints.find(j=>j.left===f.id&&j.leftHeight===48&&j.rightHeight===48);
  if(!joint)continue;
  addSupport(f,joint.base[0]-PILLAR_WIDTH/2,'corner',joint);
 }
 const plan={...contours,faces,joints,supports,runs};planCache.set(room,{mask:room.floorMask,plan});return plan;
}
export const buildWallPillars=room=>buildWallPlan(room).supports;
export function pillarFits(room,p){return fits([[p.x-p.width/2,p.y],[p.x+p.width/2,p.y],[p.x+p.width/2,p.y-p.height],[p.x-p.width/2,p.y-p.height]],floorCells(room));}
// The authored material is sampled directly. No opposing-edge blending, no
// per-face phase reset, and no stretched duplication of the old two-row wall.
export function createWallSampler(image,width,height){const tile=document.createElement('canvas');tile.width=width*4;tile.height=height*4;tile.getContext('2d').drawImage(image,0,0,tile.width,tile.height);return tile;}
function materials(c,biome){let bank=patterns.get(c);if(!bank){bank=new Map();patterns.set(c,bank);}if(bank.has(biome))return bank.get(biome);const material=biome===0?{face:createWallSampler(images[0],WALL_REPEAT,48),cap:images[1],capCrop:[0,0,2079,756],foot:images[3],footCrop:[24,305,2124,166],color:FACE}:createWallMaterial(images,biome);const value={...material,face:c.createPattern(material.face,'repeat')};value.face.setTransform(new DOMMatrix().translate(0,1.5).scale(.25));bank.set(biome,value);return value;}
// A band follows a shared edge. Its phase stays fixed across adjacent surfaces.
function paintBand(c,img,source,a,b,height,period){
 const width=b[0]-a[0];if(width<=0)return;
 const slope=(b[1]-a[1])/width;
 c.save();c.transform(1,slope,0,1,0,a[1]-slope*a[0]);
 for(let x=Math.floor(a[0]/period)*period;x<b[0];x+=period)c.drawImage(img,...source,x,-height,period,height);
 c.restore();
}
export function paintWallArt(c,room,biome=0){return caveBiomeProfile(biome)?paintDungeonWalls(c,buildWallPlan(room),biome):false;}
export function paintLegacyWallArt(c,room,biome=0){
 if(!ready||!caveBiomeProfile(biome))return false;
 const plan=buildWallPlan(room),{face,cap,capCrop,foot,footCrop,color}=materials(c,biome);
 const ground=new Path2D();for(const loop of plan.loops)ground.addPath(polygon(loop));
 // Only the low floor perimeter uses a floor clip; high wall faces are whole.
 const outside=new Path2D();outside.rect(-512,-512,4096,4096);outside.addPath(ground);
 c.save();c.clip(outside,'evenodd');c.lineJoin='round';c.lineWidth=6;c.strokeStyle=INK;c.stroke(ground);c.lineWidth=3;c.strokeStyle=color;c.stroke(ground);c.restore();
 for(const f of plan.faces){
  c.save();c.lineJoin='round';
  const outline=roundedWallPath([f.a,f.b,f.cap[2],f.cap[3]]);
  c.clip(outline);
  c.fillStyle=color;c.fill(outline);
  c.fillStyle=color;c.fill(polygon(f.face));c.fillStyle=face;c.fill(polygon(f.face));
  if(f.role==='return'){c.fillStyle=INK;c.globalAlpha=.3;c.fill(polygon(f.face));c.globalAlpha=1;}
  c.save();c.clip(polygon(f.cap));c.fillStyle=color;c.fill(polygon(f.cap));paintBand(c,cap,capCrop,f.cap[0],f.cap[1],WALL_RIM,72);c.restore();
  c.save();c.clip(polygon([f.a,f.b,[f.b[0],f.b[1]-4],[f.a[0],f.a[1]-4]]));paintBand(c,foot,footCrop,f.a,f.b,4,88);c.restore();
  // Shared material boundaries give the thin trim a readable thickness.
  // All contact lines remain inside the same rounded wall silhouette.
  c.strokeStyle=INK;c.lineCap='round';
  c.lineWidth=.8;c.stroke(linePath([f.cap[0],f.cap[1]]));
  c.lineWidth=.65;c.stroke(linePath([[f.a[0],f.a[1]-4],[f.b[0],f.b[1]-4]]));
  c.lineWidth=1.3;c.stroke(linePath([f.a,f.b]));
  c.strokeStyle=INK;c.lineWidth=.7;c.stroke(outline);
  c.restore();
 }
 // Structural jambs share the face endpoints, including complete-to-cut joins.
 // No disconnected cap is drawn along an invisible/back-facing edge.
 for(const j of plan.joints){
  const h=Math.max(j.leftHeight,j.rightHeight);if(!h)continue;
  const x=j.base[0],y=j.base[1];
  c.save();c.strokeStyle=INK;c.lineWidth=j.kind==='transition'?1.4:.75;c.globalAlpha=j.kind==='transition'?.9:.45;
  c.lineCap='round';c.stroke(linePath([[x,y-1],[x,y-h+1]]));c.restore();
 }
 for(const p of plan.supports){
  c.save();c.fillStyle=INK;c.globalAlpha=.3;c.fillRect(p.x-p.width/2-1,p.y-p.height+1,2,p.height-1);c.restore();
  c.drawImage(images[2],348,63,328,1408,p.x-p.width/2,p.y-p.height,p.width,p.height);
 }
 return true;
}
