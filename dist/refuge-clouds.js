import {P} from './palette.js';
export const CLOUD_SPEED_FACTOR=1.25;
export const CLOUD_SKY_SPEC=Object.freeze({clearance:12,approach:32});
export const CLOUD_SPEC=Object.freeze({variants:3,volumesPerCloud:5,maxFaces:15,maxCacheSide:512,density:2,margin:200,span:1400,fadeDistance:24,base:P.white,shade:P.silver});
export const CLOUD_TRACKS=Object.freeze([
 Object.freeze({id:'north-west',variant:0,x:130,y:30,scale:.95,speed:.65,slope:0,alpha:.76,layer:'far'}),
 Object.freeze({id:'north-east',variant:1,x:855,y:20,scale:.8,speed:.9,slope:0,alpha:.68,layer:'far'}),
 Object.freeze({id:'front-bank',variant:2,x:515,y:8,scale:1.25,speed:.72,slope:0,alpha:.88,layer:'near'})
]);
const iso=(u,v,z)=>[u-v,(u+v)*.5-z],mod=(x,d)=>((x%d)+d)%d;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
function buildCloudGeometry(variant=0){
 if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Unregistered cloud variant');
 const stretch=[1,1.15,.95][variant],height=[1,.85,1.08][variant];
 // A connected fixed skeleton of broad low prisms; only proportions vary.
 const blocks=[[-55,-35,0,110,70,20],[-22,-18,14,50,46,44],[-65,-17,4,55,41,32],[12,-22,3,60,47,29],[-18,18,0,73,34,24]].map(([u,v,z,w,d,h])=>({u:u*stretch,v:v*stretch,z:z*height,w:w*stretch,d:d*stretch,h:h*height}));
 blocks.sort((a,b)=>(a.u+a.v+a.w*.5+a.d*.5)-(b.u+b.v+b.w*.5+b.d*.5));
 const faces=[];for(const b of blocks){const {u,v,z,w,d,h}=b,A=iso(u,v,z+h),B=iso(u+w,v,z+h),C=iso(u+w,v+d,z+h),D=iso(u,v+d,z+h),bB=iso(u+w,v,z),bC=iso(u+w,v+d,z),bD=iso(u,v+d,z);faces.push({points:[D,C,bC,bD],color:P.silver},{points:[B,C,bC,bB],color:P.silver},{points:[A,B,C,D],color:P.white});}
 const points=faces.flatMap(f=>f.points),bounds={left:Math.min(...points.map(p=>p[0]))-4,top:Math.min(...points.map(p=>p[1]))-4,right:Math.max(...points.map(p=>p[0]))+4,bottom:Math.max(...points.map(p=>p[1]))+4};
 return {variant,blocks,faces,bounds};
}
const GEOMETRIES=Object.freeze([0,1,2].map(buildCloudGeometry));
export function cloudGeometry(variant=0){if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Unregistered cloud variant');return GEOMETRIES[variant];}
function roundedPolygon(c,points,radius){const corners=points.map((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]),r=Math.min(radius,da/3,db/3);return {p,a:[p[0]+(a[0]-p[0])*r/da,p[1]+(a[1]-p[1])*r/da],b:[p[0]+(b[0]-p[0])*r/db,p[1]+(b[1]-p[1])*r/db]};});c.beginPath();c.moveTo(...corners[0].a);for(const q of corners){c.lineTo(...q.a);c.quadraticCurveTo(...q.p,...q.b);}c.closePath();}
export function createCloudCache(makeCanvas){return Object.freeze(Array.from({length:3},(_,variant)=>{const geometry=cloudGeometry(variant),b=geometry.bounds,width=b.right-b.left,height=b.bottom-b.top,k=Math.min(CLOUD_SPEC.density,512/Math.max(width,height)),image=makeCanvas();image.width=Math.ceil(width*k);image.height=Math.ceil(height*k);const c=image.getContext('2d');c.scale(k,k);c.translate(-b.left,-b.top);c.lineJoin='round';for(const f of geometry.faces){roundedPolygon(c,f.points,9);c.fillStyle=c.strokeStyle=f.color;c.lineWidth=.55;c.fill();c.stroke();}return Object.freeze({variant,image,bounds:b,k,width,height,geometry});}));}
function boxGap(a,b){const dx=Math.max(b.left-a.right,a.left-b.right,0),dy=Math.max(b.top-a.bottom,a.top-b.bottom,0);return Math.hypot(dx,dy);}
// A sky corridor above the complete conservative sprite bounds, not an alpha mask.
export function cloudSkyY(track,x,geometry,guards){const base=track.y;let rise=0;for(const b of guards){if(b.kind==='player'||b.kind==='unavailable')continue;if(!Number.isFinite(b.left)||!Number.isFinite(b.right)||!Number.isFinite(b.top))continue;const left=x+geometry.bounds.left*track.scale,right=x+geometry.bounds.right*track.scale,gap=Math.max(b.left-right,left-b.right,0),weight=1-smooth(gap/CLOUD_SKY_SPEC.approach),ceiling=b.top-CLOUD_SKY_SPEC.clearance-geometry.bounds.bottom*track.scale;rise=Math.max(rise,Math.max(0,base-ceiling)*weight);}return base-rise;}
export function cloudPoses({time=0,soft=false,reduced=false,guards=[],enabled=true}={}){
 if(!enabled)return [];const t=soft||reduced?0:Number.isFinite(time)?Math.max(0,time):0;
 return CLOUD_TRACKS.filter(q=>!(soft||reduced)||q.layer==='far').map(q=>{const g=cloudGeometry(q.variant),x=-200+mod(q.x+200+q.speed*t*CLOUD_SPEED_FACTOR,1400),y=cloudSkyY(q,x,g,guards),bounds={left:x+g.bounds.left*q.scale,right:x+g.bounds.right*q.scale,top:y+g.bounds.top*q.scale,bottom:y+g.bounds.bottom*q.scale};let alpha=q.alpha*(soft?.55:reduced?.45:1);if(guards.length){let distance=Infinity;for(const b of guards)distance=Math.min(distance,boxGap(bounds,b));alpha*=smooth(distance/CLOUD_SPEC.fadeDistance);}return {...q,x,y,bounds,alpha};});
}
export function paintClouds(c,cache,poses,layer='all'){let drawn=0;for(const p of poses){if((layer!=='all'&&p.layer!==layer)||p.alpha<=0)continue;const a=cache[p.variant];c.save();c.globalAlpha*=p.alpha;c.drawImage(a.image,p.x+a.bounds.left*p.scale,p.y+a.bounds.top*p.scale,a.width*p.scale,a.height*p.scale);c.restore();drawn++;}return drawn;}
