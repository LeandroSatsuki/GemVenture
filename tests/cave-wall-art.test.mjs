import {legacyArtRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {isFloor} from '../dist/cave-layout.js';
import {buildWallContours,usesWallArt,WALL_HEIGHT} from '../dist/cave-wall-art.js';
function area(loop){return loop.reduce((s,p,i)=>{const q=loop[(i+1)%loop.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2;}
function inside(loops,x,y){let winding=0;for(const loop of loops)for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length],cross=(b[0]-a[0])*(y-a[1])-(x-a[0])*(b[1]-a[1]);if(a[1]<=y&&b[1]>y&&cross>0)winding++;if(a[1]>y&&b[1]<=y&&cross<0)winding--;}return winding!==0;}
function check(room){
 const before=JSON.stringify(room),plan=buildWallContours(room);assert.equal(JSON.stringify(room),before);
 let cells=0,edges=0;
 for(let y=0;y<room.rows;y++)for(let x=0;x<room.cols;x++){
  const floor=isFloor(room,x,y);cells+=floor?1:0;
  assert.equal(inside(plan.loops,50+22*x+2*y,57.5+16*y),floor,`cell ${x},${y}`);
  if(floor)for(const [dx,dy]of [[0,-1],[1,0],[0,1],[-1,0]])if(!isFloor(room,x+dx,y+dy))edges++;
 }
 assert.equal(plan.edgeCount,edges);assert.equal(plan.loops.reduce((s,l)=>s+area(l),0),cells*22*16);
 for(const loop of plan.loops){assert.ok(loop.length>=4);for(const p of loop)assert.ok(p.every(Number.isFinite));}
 return plan;
}
test('all 512 local patterns preserve holes, concave corners and diagonal contacts',()=>{
 for(let mask=0;mask<512;mask++){
  const room={cols:5,rows:5,floorMask:Array(25).fill(0)};
  for(let i=0;i<9;i++)if(mask&(1<<i))room.floorMask[(1+Math.floor(i/3))*5+1+i%3]=1;
  check(room);
 }
});
test('1000 legacy procedural caves have closed exact contours without modifying architecture or simulation',()=>{
 let edges=0,loops=0;
 for(let seed=1;seed<=1000;seed++){
  const room=legacyArtRoom(seed),plan=check(room);edges+=plan.edgeCount;loops+=plan.loops.length;
  if(seed<=10){assert.deepEqual(buildWallContours(room),plan);room.rocks=[];room.nodes=[];room.enemies=[];room.cleared=true;assert.deepEqual(buildWallContours(room),plan);}
 }console.log(JSON.stringify({seeds:1000,edges,loops,height:WALL_HEIGHT}));
});
test('rollout covers ordinary biomes and audited arenas while unknown bosses, Abyss and missing masks retain fallback',()=>{
 for(let biome=0;biome<7;biome++){
  const s=E.createState(712);s.seals=6;E.startRun(s);s.run.floor=biome*5+1;E.generateRoom(s);const room=s.run.room,before=JSON.stringify(room);
  assert.ok(usesWallArt(room,biome));assert.equal(JSON.stringify(room),before);
  assert.equal(usesWallArt({...room,bossFloor:true},biome),false);assert.equal(usesWallArt({...room,layout:{style:'ABISMO'}},biome),false);assert.equal(usesWallArt({...room,floorMask:null},biome),false);
  s.run.floor=biome*5+5;E.generateRoom(s);const legacyBoss={...s.run.room,cols:21,rows:15,floorMask:Array.from({length:315},(_,i)=>+(i%21>0&&i%21<20&&Math.floor(i/21)>0&&Math.floor(i/21)<14))};delete legacyBoss.campaignCave;assert.equal(usesWallArt(legacyBoss,biome),true);
 }
 const s=E.createState(712);E.startRun(s);for(const invalid of [-1,7,NaN])assert.equal(usesWallArt(s.run.room,invalid),false);
 assert.equal(usesWallArt({cols:21,rows:15}),false);check({cols:21,rows:15});
});


import {buildWallPlan,buildWallPillars,PILLAR_HEIGHT,PILLAR_WIDTH,WALL_RIM,WALL_ART_FILES} from '../dist/cave-wall-art.js';
// Independent Sutherland–Hodgman clipping, rather than the planner's SAT.
function intersection(subject,clip){
 let poly=subject;
 for(let j=0;j<clip.length;j++){
  const a=clip[j],b=clip[(j+1)%clip.length],side=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const next=[];
  for(let i=0;i<poly.length;i++){
   const p=poly[i],q=poly[(i+1)%poly.length],u=side(p),v=side(q);
   if(u>=0)next.push(p);
   if((u>=0)!==(v>=0)){const t=u/(u-v);next.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
  }poly=next;if(!poly.length)break;
 }return Math.abs(area(poly));
}
function structure(room,label){
 const before=JSON.stringify(room),plan=buildWallPlan(room),cells=[];
 assert.equal(JSON.stringify(room),before,label+' changed simulation');assert.equal(buildWallPlan(room),plan);
 for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(isFloor(room,x,y)){
  const px=50+22*x+2*y,py=57.5+16*y;
  cells.push({x,y,l:px-9,r:px+9,t:py-6,b:py+6,poly:[[px-9,py-6],[px+7.5,py-6],[px+9,py+6],[px-7.5,py+6]]});
 }
 function clear(poly,kind){
  const l=Math.min(...poly.map(p=>p[0])),r=Math.max(...poly.map(p=>p[0])),t=Math.min(...poly.map(p=>p[1])),b=Math.max(...poly.map(p=>p[1]));
  for(const c of cells)if(c.r>l&&c.l<r&&c.b>t&&c.t<b)assert.ok(intersection(poly,c.poly)<1e-6,`${label} ${kind} covers playable interior ${c.x},${c.y}`);
 }
 const faceIds=new Map(plan.faces.map(f=>[f.id,f]));
 assert.equal(new Set(plan.joints.map(j=>j.id)).size,plan.joints.length,'Two joint owners');
 for(const f of plan.faces){
  assert.ok([8,16,32,48].includes(f.height));
  assert.deepEqual(f.face.slice(0,2),[f.a,f.b]);
  assert.deepEqual(f.face[2],f.cap[1]);assert.deepEqual(f.face[3],f.cap[0]);
  assert.equal(f.cap[0][1]-f.cap[3][1],4);assert.equal(f.cap[1][1]-f.cap[2][1],4);
  clear(f.face,'face '+f.id);clear(f.cap,'cap '+f.id);
 }
 for(const j of plan.joints){
  const left=faceIds.get(j.left),right=faceIds.get(j.right);
  if(left){assert.deepEqual(left.b,j.base);assert.equal(left.endHeight,j.leftHeight);}
  if(right){assert.deepEqual(right.a,j.base);assert.equal(right.startHeight,j.rightHeight);}
 }
 for(let i=0;i<plan.supports.length;i++){
  const p=plan.supports[i],f=faceIds.get(p.owner);
  assert.equal(f.role,'front');assert.equal(p.width,PILLAR_WIDTH);assert.equal(p.height,f.height+WALL_RIM);
  assert.deepEqual(p.lower,[p.x,f.a[1]]);assert.deepEqual(p.upper,[p.x,f.a[1]-p.height]);
  if(p.kind==='corner'){
   const j=plan.joints.find(j=>j.id===p.joint);assert.equal(j.leftHeight,48);assert.equal(j.rightHeight,48);
   assert.deepEqual(p.corner,j.base);assert.equal(p.x+p.width/2,j.base[0]);assert.equal(p.y,j.base[1]);
  }else{
   assert.equal(p.kind,'seam');assert.equal(p.x%132,0);assert.ok(p.x>f.a[0]&&p.x<f.b[0]);
  }
  clear([[p.x-5,p.y],[p.x+5,p.y],[p.x+5,p.y-p.height],[p.x-5,p.y-p.height]].reverse(),'support');
  for(const q of plan.supports.slice(i+1))assert.ok(Math.abs(p.x-q.x)>=36||Math.abs(p.y-q.y)>=Math.max(p.height,q.height));
 }return plan;
}
test('500 legacy caves retain complete anchored faces, shared caps and safe structural supports',()=>{
 let faces=0,posts=0,cut=0;
 for(let seed=1;seed<=500;seed++){
  const p=structure(legacyArtRoom(seed),'seed '+seed);
  faces+=p.faces.length;posts+=p.supports.length;cut+=p.faces.filter(f=>f.role==='front'&&f.height<48).length;
 }
 assert.ok(posts>500);assert.ok(cut>0);console.log(JSON.stringify({structureSeeds:500,faces,posts,cut}));
});
test('all 512 junction configurations and narrow solid gaps keep caps out of floor interiors',()=>{
 for(let mask=0;mask<512;mask++){
  const r={cols:5,rows:5,floorMask:Array(25).fill(0)};
  for(let i=0;i<9;i++)if(mask&(1<<i))r.floorMask[(1+Math.floor(i/3))*5+1+i%3]=1;
  structure(r,'pattern '+mask);
 }
 for(const gap of [1,2,3,4]){
  const r={cols:16,rows:18,floorMask:Array(16*18).fill(0)};
  for(let y=2;y<16;y++)for(let x=2;x<14;x++)if(y<5||y>=5+gap)r.floorMask[y*16+x]=1;
  structure(r,'solid gap '+gap);
 }
});
test('replacing the logical mask invalidates the presentation plan',()=>{
 const r={cols:5,rows:5,floorMask:Array(25).fill(0)},p=buildWallPlan(r);
 r.floorMask=[...r.floorMask];r.floorMask[12]=1;assert.notEqual(buildWallPlan(r),p);assert.ok(buildWallPlan(r).faces.length);
});
test('four-row raster, thin cap and post use explicit portable assets',()=>{
 assert.equal(WALL_HEIGHT,48);assert.equal(WALL_RIM,4);assert.equal(PILLAR_HEIGHT,52);assert.equal(PILLAR_WIDTH,10);
 assert.deepEqual(WALL_ART_FILES,['stone-courses-v3.png','stone-coping-v4.png','timber-front-v4.png','stone-footing-v4.png']);
 assert.deepEqual(buildWallPillars({cols:5,rows:5,floorMask:Array(25).fill(0)}),[]);
});

test('material-repeat joints in a clear long wall have frontal anchored supports',()=>{
 const r={cols:36,rows:16,floorMask:Array(36*16).fill(0)};
 for(let y=3;y<13;y++)for(let x=3;x<33;x++)r.floorMask[y*36+x]=1;
 const p=buildWallPlan(r),f=p.faces.find(f=>f.role==='front'&&f.b[0]-f.a[0]>600);
 const candidates=[];for(let x=Math.ceil((f.a[0]+10)/132)*132;x<f.b[0]-10;x+=132)candidates.push(x);
 const seams=p.supports.filter(s=>s.owner===f.id&&s.kind==='seam').map(s=>s.x);
 assert.deepEqual(seams,candidates);
});

