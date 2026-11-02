import {P} from './palette.js';
import {caveBiomeProfile,ARRIVAL_ART_BOUNDS} from './cave-biome-art.js';
import {buildWallPlan} from './cave-wall-art.js';
import {isFloor} from './cave-layout.js';
import {terrainMaskAt,terrainPolygon} from './terrain-kit.js';
import {drawAsset} from './art-kit.js';

const directions=[[1,0],[0,1],[-1,0],[0,-1]];
const point=(x,y)=>[50+22*x+2*y,57.5+16*y];
function visualRandom(seed){let n=(seed^0x51ce7a19)>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
// Conservative screen-space bounds include the entire sprite, not only its anchor.
export function decorationFits(room,d){
 const [px,py]=point(d.x,d.y),half=d.width/2+3,height=d.height+3;
 for(let y=Math.max(0,d.y-5);y<=Math.min(room.rows-1,d.y+2);y++)for(let x=Math.max(0,d.x-3);x<=Math.min(room.cols-1,d.x+3);x++)if(isFloor(room,x,y)){
  const [tx,ty]=point(x,y);
  if(tx+12>px-half&&tx-12<px+half&&ty+8>py-height&&ty-8<py+3)return false;
 }return true;
}

// Only immutable architecture drives choices. Never consume the simulation RNG.
export function buildCaveScenery(room,{seed=room.seed,biome=0}={}){
 const plan={fields:[],rails:[],decorations:[]};
 const profile=caveBiomeProfile(biome);
 if(!profile||!room.floorMask||room.layout?.style==='ABISMO')return plan;
 const random=visualRandom(seed),{cols,rows}=room,protectedTiles=new Set(room.layout?.protectedTiles||[]);
 const reserved=[{x:3,y:11,radius:5},{...(room.exit||{x:cols-3,y:2}),radius:4},...(room.hedgehog?[{...room.hedgehog,radius:6}]:[])];
 const nearReserved=p=>reserved.some(q=>distance(p,q)<=q.radius);
 const chambers=(room.layout?.rooms||[]).slice(0,9);
 // Broad, connected masses: each field grows from one chamber, without speckle.
 for(let i=0;i<chambers.length;i++){
  if(i%3===1)continue;
  const ch=chambers[i],cx=ch.x+(random()<.5?-1:1),cy=ch.y+(random()<.5?-1:1),rx=2.5+random()*1.7,ry=1.7+random()*1.4;
  const map=Array.from({length:rows},()=>Array(cols).fill(0));
  for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(isFloor(room,x,y)&&Math.pow(Math.abs(x-cx)/rx,3)+Math.pow(Math.abs(y-cy)/ry,3)<1)map[y][x]=1;
  plan.fields.push({color:biome===0?(i%2?P.gray:P.wood):profile.fields[i%profile.fields.length],map});
 }
 // Rails retired: keep the schema for saved/review consumers, leave it empty.
 if(biome!==0){
  const walls=buildWallPlan(room),candidates=[];
  for(const f of walls.faces){if(f.role!=='front'||f.height<32||f.b[0]-f.a[0]<66)continue;
   const x=(f.a[0]+f.b[0])/2,y=f.a[1]-f.height-4,width=profile.decor==='bush'?24:18,height=width*1.1,box={left:x-width/2-3,right:x+width/2+3,top:y-height-3,bottom:y+3};
   const overlaps=b=>box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top;
   if(overlaps(ARRIVAL_ART_BOUNDS)||walls.supports.some(p=>overlaps({left:p.x-p.width/2-4,right:p.x+p.width/2+4,top:p.y-p.height-3,bottom:p.y+3})))continue;
   if(reserved.some(q=>{const [px,py]=point(q.x,q.y);return Math.abs(x-px)<q.radius*22+width&&Math.abs(y-py)<q.radius*16+height;}))continue;
   let clear=true;for(let yy=1;yy<rows-1&&clear;yy++)for(let xx=1;xx<cols-1;xx++)if(isFloor(room,xx,yy)){const [px,py]=point(xx,yy);if(overlaps({left:px-12,right:px+12,top:py-8,bottom:py+8})){clear=false;break;}}
   if(clear)candidates.push({x,y,width,height,type:profile.decor,screenSpace:true,biome,seed:(seed+Math.round(x)*97+Math.round(y)*31)>>>0,rank:random(),bounds:box,face:f.id});
  }
  candidates.sort((a,b)=>a.rank-b.rank);for(const d of candidates){if(plan.decorations.length>=4)break;if(plan.decorations.some(p=>Math.hypot(p.x-d.x,p.y-d.y)<90))continue;plan.decorations.push(d);}return plan;
 }
 const candidates=[];
 for(let y=1;y<rows-1;y++)for(let x=2;x<cols-2;x++)if(!isFloor(room,x,y)&&isFloor(room,x,y+1)&&!nearReserved({x,y})){
  const d={x,y,type:'support',width:34,height:38,seed:(seed+x*97+y*31)>>>0,rank:random()};
  if(decorationFits(room,d))candidates.push(d);
 }
 candidates.sort((a,b)=>a.rank-b.rank);
 for(const d of candidates){if(plan.decorations.length>=7)break;if(plan.decorations.some(p=>distance(p,d)<7))continue;plan.decorations.push(d);}
 return plan;
}

export function paintCaveScenery(c,plan,{projectPoint=point,layer='ground'}={}){
 c.save();c.lineJoin='round';c.lineCap='round';
 if(layer==='ground'){
  for(const field of plan.fields){
   c.beginPath();for(let y=0;y<field.map.length;y++)for(let x=0;x<field.map[y].length;x++)if(field.map[y][x]){
    const [px,py]=projectPoint(x,y),points=terrainPolygon(terrainMaskAt(field.map,x,y));
    points.forEach(([u,v],i)=>{const a=px-12+22*u+2*v,b=py-8+16*v;i?c.lineTo(a,b):c.moveTo(a,b);});c.closePath();
   }c.save();c.translate(0,1.1);c.fillStyle='#071b2b';c.globalAlpha=.3;c.fill();c.restore();c.fillStyle=field.color;c.globalAlpha=.24;c.fill();c.globalAlpha=1;
  }
  for(const route of plan.rails){
   const points=route.map(p=>projectPoint(p.x,p.y));
   for(let i=0;i<points.length;i++){
    const [x,y]=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,ny=(b[0]-a[0])/length;
    c.beginPath();c.moveTo(x-nx*6,y-ny*6);c.lineTo(x+nx*6,y+ny*6);c.strokeStyle=P.ink;c.lineWidth=5;c.stroke();c.strokeStyle=P.wood;c.lineWidth=3;c.stroke();
   }
   c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
   for(const [color,width]of [[P.ink,7],[P.gray,5],[P.ink,2]]){c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  }
 }else{
  for(const d of plan.decorations){if(d.screenSpace){drawAsset(c,d.type,d.x,d.y,d.width,{seed:d.seed,biome:d.biome});continue;}const [x,y]=projectPoint(d.x,d.y);
   // Three broad timbers and one restrained lantern, all behind the floor edge.
   c.strokeStyle=P.ink;c.lineWidth=3;c.fillStyle=P.wood;
   for(const [dx,dy,w,h]of [[-15,-32,6,32],[9,-32,6,32],[-17,-38,34,8]]){c.beginPath();c.roundRect(x+dx,y+dy,w,h,2);c.fill();c.stroke();}
   c.fillStyle=P.clay;c.fillRect(x-15,y-37,29,2);
   drawAsset(c,'lantern',x,y-5,16,{seed:d.seed,biome:0});
  }
 }
 c.restore();
}
