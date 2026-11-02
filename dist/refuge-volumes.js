// Native geometric animation components. Fixed elevated orthographic camera;
// Object-space star roll and drill yaw; fixed light/camera. Build/cache outside RAF.
import {P} from './palette.js';
const TAU=Math.PI*2,OUTLINE=P.ink;
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function normal(points){const n=[0,0,0];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1])}const l=Math.hypot(...n)||1;return n.map(x=>x/l)}
function starMesh(){const vertices=[],faces=[],rings=[];
 for(const [radius,z] of [[1,.12],[.84,.24],[1,-.12],[.84,-.24]]){const ring=[];for(let i=0;i<10;i++){const a=i*TAU/10,r=(i%2?.45:1)*radius;ring.push(vertices.length);vertices.push([Math.sin(a)*r,Math.cos(a)*r,z])}rings.push(ring)}
 const [front,inner,back,backInner]=rings;
 faces.push({v:[...inner].reverse(),material:'gold'},{v:[...backInner],material:'gold'});
 for(let i=0;i<10;i++){const j=(i+1)%10;faces.push({v:[front[i],inner[i],inner[j],front[j]],material:'gold'},{v:[back[j],backInner[j],backInner[i],back[i]],material:'gold'},{v:[back[i],front[i],front[j],back[j]],material:'gold'})}
 return{vertices,faces};
}
function drillMesh(){const vertices=[],faces=[],rings=[],N=12;
 // Twisted polygon rings create two broad helical flute bands on the cone.
 for(let k=0;k<5;k++){const y=.65-k*.34,r=.52*(1-k/4)+.015,ring=[];for(let i=0;i<N;i++){const a=i*TAU/N+k*.6;ring.push(vertices.length);vertices.push([Math.cos(a)*r,y,Math.sin(a)*r])}rings.push(ring)}
 for(let k=0;k<4;k++)for(let i=0;i<N;i++){const j=(i+1)%N;faces.push({v:[rings[k][i],rings[k+1][i],rings[k+1][j],rings[k][j]],material:i%6<2?'steelDark':'steel'})}
 faces.push({v:[...rings[0]].reverse(),material:'steel'});
 return{vertices,faces};
}
const meshes={star:starMesh(),drill:drillMesh()};
const ramps={gold:[P.gold,P.gold,P.yellow,P.lemon],steel:[P.slate,P.slate,P.steel,P.silver],steelDark:[P.slate,P.slate,P.gray,P.steel]};
function paintFaces(ctx,kind,x,y,width,angle=0){
 const mesh=meshes[kind];if(!mesh||![x,y,width,angle].every(Number.isFinite)||width<=0)return;
 const yaw=(kind==='star'?0:angle)-.30,c=Math.cos(yaw),s=Math.sin(yaw),e=.42,ce=Math.cos(e),se=Math.sin(e),scale=width/2.22,spinCos=Math.cos(angle),spinSin=Math.sin(angle);
 // Spin the existing star mesh in XY before the fixed yaw/camera. World light remains fixed.
 const verts=mesh.vertices.map(([x,y,z])=>{if(kind==='star'){const rx=x*spinCos-y*spinSin;y=x*spinSin+y*spinCos;x=rx;}return [x*c+z*s,y,-x*s+z*c];});
 const view=[0,se,ce],light=[-.45,.75,.50];
 const projected=verts.map(([vx,vy,vz])=>[x+vx*scale,y+(-vy*ce+vz*se)*scale]);
 const fs=mesh.faces.map((f,index)=>{const p=f.v.map(i=>verts[i]),n=normal(p);return{...f,index,n,visible:dot(n,view)>0.00001,depth:p.reduce((sum,v)=>sum+dot(v,view),0)/p.length}});
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 for(const f of fs.filter(f=>f.visible).sort((a,b)=>a.depth-b.depth)){
  const l=dot(f.n,light),shade=l>.65?3:l>.20?2:l>-.30?1:0;ctx.fillStyle=ramps[f.material][shade];ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.6;
  ctx.beginPath();f.v.forEach((n,i)=>i?ctx.lineTo(...projected[n]):ctx.moveTo(...projected[n]));ctx.closePath();ctx.fill();ctx.stroke();
 }
 ctx.restore();
}
export function paintVolume(ctx,kind,x,y,width,angle=0){
 if(!meshes[kind]||![x,y,width,angle].every(Number.isFinite)||width<=0)return;
 // Rasterize the geometric volume once, then outline its actual visible union.
 // This avoids hidden concave edges being drawn over nearer star faces.
 // This preparation function is not intended for the live draw loop.
 const size=Math.ceil(width*1.3),color=document.createElement('canvas'),mask=document.createElement('canvas');color.width=color.height=mask.width=mask.height=size;
 const cc=color.getContext('2d'),mc=mask.getContext('2d');paintFaces(cc,kind,size/2,size/2,width,angle);
 mc.drawImage(color,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle=OUTLINE;mc.fillRect(0,0,size,size);
 const r=width*.018;for(let i=0;i<16;i++){const a=i*TAU/16;ctx.drawImage(mask,x-size/2+Math.cos(a)*r,y-size/2+Math.sin(a)*r)}
 ctx.drawImage(color,x-size/2,y-size/2);
}
export function buildVolumeFrames(kind,{size=256,count=32}={}){
 if(!meshes[kind]||!Number.isInteger(size)||size<32||size>512||!Number.isInteger(count)||count<8||count>64)throw Error('Invalid volume cache');
 const frames=[];for(let i=0;i<count;i++){const c=document.createElement('canvas');c.width=c.height=size;paintVolume(c.getContext('2d'),kind,size/2,size/2,size*.88,i/count*TAU);frames.push(c)}
 return {kind,frames,size,count,pivot:[size/2,size/2],sourceWidth:size*.88,bytes:size*size*4*count};
}
export function drawVolumeFrame(ctx,cache,x,y,width,phase=0){const i=((Math.floor(phase*cache.count)%cache.count)+cache.count)%cache.count,s=width/cache.sourceWidth;ctx.drawImage(cache.frames[i],x-cache.pivot[0]*s,y-cache.pivot[1]*s,cache.size*s,cache.size*s)}
export const VOLUME_PLACEMENTS={star:{asset:'altar-base',sourcePivot:[646,70],widthSourcePx:525,periodSeconds:18,hoverSourcePx:10},drill:{asset:'drill-base',sourcePivot:[630,636],widthSourcePx:270,periodSeconds:19,hoverSourcePx:0}};


