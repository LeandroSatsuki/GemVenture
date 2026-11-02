import {caveFindShapes} from './cave-find-shapes.js';
import {volumeBuilder,projectDungeon} from './dungeon-volumes.js';

export const CHEST_OPENING=Object.freeze({durationMs:450,frameCount:16,maximumAngle:68*Math.PI/180,anchor:Object.freeze({x:50,y:96}),width:100,height:110,hinge:Object.freeze({y:-17,z:28})});
const WOOD=['#ed9353','#9c3824','#591d35'],GOLD=['#ffd95a','#e97c07','#9c3824'];
const canonicalClosed=caveFindShapes('cave-chest',{variant:0});
const groundShadow=canonicalClosed.filter(s=>s.fill==='#132233');

// The old builder's prism rings and material assignment, lifted into a hinge rig.
// No yaw, camera change, whole-chest squash, reward data or time-dependent cache key.
function prismFaces(x,y,z,w,d,h,ramp,bevel=2,cut=3,{nativeCull=false}={}){
 const ring=(inset,height)=>{const a=w/2-inset,b=d/2-inset,k=Math.max(.3,cut-inset*.3);return[[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]].map(([u,v])=>[x+u,y+v,z+height]);};
 const rings=[ring(bevel,0),ring(0,bevel),ring(0,h-bevel),ring(bevel,h)],faces=[];
 for(let level=0;level<3;level++)for(let i=0;i<8;i++){
  const j=(i+1)%8,a=rings[level][i],b=rings[level][j],nx=b[1]-a[1],ny=a[0]-b[0];
  if(nativeCull&&-nx/11+ny<=0)continue;
  faces.push({points:[a,b,rings[level+1][j],rings[level+1][i]],fill:level===2?(nx<0?'#ffffe0':ramp[0]):level===0?ramp[2]:nx<0?ramp[1]:ramp[2]});
 }
 faces.push({points:rings[3],fill:ramp[0]});
 if(!nativeCull)faces.push({points:[...rings[0]].reverse(),fill:ramp[2]});
 const p=rings[3][6],q=rings[3][7];faces.push({points:[p,q,[q[0]+.65,q[1],q[2]],[p[0]+.65,p[1],p[2]]],fill:'#ffffe0',decal:true});
 return faces;
}
function clipZ(points,z,above){
 const out=[],inside=p=>above?p[2]>=z:p[2]<=z;
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],ai=inside(a),bi=inside(b);
  if(ai)out.push(a);
  if(ai!==bi){const t=(z-a[2])/(b[2]-a[2]);out.push(a.map((n,k)=>n+(b[k]-n)*t));}
 }
 return out;
}
const bodyBuilder=volumeBuilder({castShadow:false});bodyBuilder.prism(0,0,0,65,42,29,WOOD,3,5);
const originalBody=bodyBuilder.shapes.map(s=>({...s,matrix:[1,0,0,1,0,8]}));
const lowerBandFaces=[-21,21].flatMap(x=>prismFaces(x,1,0,6,43,44,GOLD,1,1,{nativeCull:true}).map(f=>({...f,points:clipZ(f.points,28,false)})).filter(f=>f.points.length>=3));
const bandCaps=[-21,21].map(x=>({points:[[x-3,-20.5,28],[x+3,-20.5,28],[x+3,22.5,28],[x-3,22.5,28]],fill:GOLD[0]}));
const lidFaces=prismFaces(0,0,28,68,44,17,WOOD,5,10);
const upperBandFaces=[-21,21].flatMap(x=>prismFaces(x,1,0,6,43,44,GOLD,1,1).map(f=>({...f,points:clipZ(f.points,28,true)})).filter(f=>f.points.length>=3));
const claspFaces=prismFaces(0,20,18,13,5,17,GOLD,1,2);
const camera=[-1/11,1,8/11];
function visible(points){
 if(points.length<3)return false;let normal=null;
 for(let i=1;i<points.length-1;i++){
  const a=points[0],u=points[i].map((n,k)=>n-a[k]),v=points[i+1].map((n,k)=>n-a[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  if(n.some(x=>Math.abs(x)>1e-7)){normal=n;break;}
 }
 return normal&&normal.reduce((sum,n,i)=>sum+n*camera[i],0)>1e-6;
}
// A short ease-in avoids a first-frame jerk; the last frames settle gently.
const eased=p=>p*p*(3-2*p);
export function chestOpeningShapes(progress=0){
 const p=Number.isFinite(Number(progress))?Math.max(0,Math.min(1,Number(progress))):0;
 // Strong invariance: the closed state is the actual v1 shape list, unchanged.
 if(p===0)return canonicalClosed.map(s=>({...s}));
 // The original lid's rear lower ring is inset5: y=-22+5=-17.
 // Rotating about the outer footprint(-22) would make that ring float away.
 const angle=CHEST_OPENING.maximumAngle*eased(p),c=Math.cos(angle),s=Math.sin(angle),axis=CHEST_OPENING.hinge,hinge=([x,y,z])=>{const dy=y-axis.y,dz=z-axis.z;return[x,axis.y+dy*c-dz*s,axis.z+dy*s+dz*c];};
 const v=volumeBuilder({castShadow:false});
 const paint=(f,{moving=false,cull=true}={})=>{const points=moving?f.points.map(hinge):f.points;if(cull&&!f.decal&&!visible(points))return;v.path(points.map(projectDungeon),f.fill);};
 // Source body and source shadow never move. Band pieces split at the lid seam,
 // retaining their existing side planes instead of introducing new lower bevels.
 for(const f of lowerBandFaces)paint(f,{cull:false});for(const f of bandCaps)paint(f);
 // Empty interior appears only as the original lid physically reveals it.
 paint({points:[[-27,-15,29.1],[27,-15,29.1],[27,15,29.1],[-27,15,29.1]],fill:'#591d35'},{cull:false});
 const baseFaces=v.shapes.map(f=>({...f,matrix:[1,0,0,1,0,8]}));
 const movingBuilder=volumeBuilder({castShadow:false});
 function movingPaint(f){const points=f.points.map(hinge);if(!f.decal&&!visible(points))return;movingBuilder.path(points.map(projectDungeon),f.fill);}
 for(const f of lidFaces)movingPaint(f);
 // Inner lid lining is a single broad wood inset, no particles or fake treasure.
 movingPaint({points:[[-27,-15,27.95],[-27,15,27.95],[27,15,27.95],[27,-15,27.95]],fill:'#9c3824'});
 for(const f of upperBandFaces)movingPaint(f);for(const f of claspFaces)movingPaint(f);
 const moving=movingBuilder.shapes.map(f=>({...f,matrix:[1,0,0,1,0,8]}));
 return [...groundShadow.map(f=>({...f})),...originalBody.map(f=>({...f})),...baseFaces,...moving];
}
let cachedFrames=null;
export function chestOpeningFrames(){return cachedFrames??=Object.freeze(Array.from({length:CHEST_OPENING.frameCount},(_,i)=>Object.freeze(chestOpeningShapes(i/(CHEST_OPENING.frameCount-1)).map(Object.freeze))));}
export function chestOpeningFrameIndex(elapsedMs,{soft=false,reduced=false}={}){return soft||reduced?CHEST_OPENING.frameCount-1:Math.max(0,Math.min(CHEST_OPENING.frameCount-1,Math.floor(Math.max(0,Number(elapsedMs)||0)/CHEST_OPENING.durationMs*(CHEST_OPENING.frameCount-1))));}

// Lazy, fixed-key native art cache. Importing this module never accesses DOM,
// Image or Path2D. Frame0 stays with the original drawAsset consumer.
const openingSprites=new Map(),openingPaths=new WeakMap();
function nativePath(shape){let path=openingPaths.get(shape);if(!path){path=new Path2D(shape.d);openingPaths.set(shape,path);}return path;}
function paintOpeningShapes(ctx,shapes){
 ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=2.8;
 for(const shape of shapes){
  ctx.save();if(shape.matrix)ctx.transform(...shape.matrix);
  const path=nativePath(shape);if(shape.fill){ctx.fillStyle=shape.fill;ctx.fill(path);}if(shape.stroke){ctx.strokeStyle=shape.stroke;ctx.lineWidth=shape.strokeWidth??2.8;ctx.stroke(path);}ctx.restore();
 }
}
export function paintChestOpening(ctx,x,y,width=34,frameIndex=15){
 const index=Math.max(0,Math.min(CHEST_OPENING.frameCount-1,Math.floor(Number(frameIndex)||0)));
 if(index===0||typeof Path2D!=='function'||!ctx||typeof ctx.drawImage!=='function'||!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(width)||width<=0)return false;
 const scale=width/CHEST_OPENING.width,doc=ctx.canvas?.ownerDocument||(typeof document!=='undefined'?document:null),shapes=chestOpeningFrames()[index];
 let sprite=openingSprites.get(index);
 if(!sprite&&doc?.createElement){
  const candidate=doc.createElement('canvas');candidate.width=216;candidate.height=236;const paint=candidate.getContext('2d');
  if(paint){paint.scale(2,2);paint.translate(4,4);paintOpeningShapes(paint,shapes);sprite=candidate;openingSprites.set(index,sprite);}
 }
 ctx.save();
 if(sprite)ctx.drawImage(sprite,x-(CHEST_OPENING.anchor.x+4)*scale,y-(CHEST_OPENING.anchor.y+4)*scale,108*scale,118*scale);
 else{ctx.translate(x-CHEST_OPENING.anchor.x*scale,y-CHEST_OPENING.anchor.y*scale);ctx.scale(scale,scale);paintOpeningShapes(ctx,shapes);}
 ctx.restore();return true;
}
