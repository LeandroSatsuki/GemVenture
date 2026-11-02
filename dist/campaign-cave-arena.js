import {paintGeodePulseWarning} from './geode-vfx.js';
import {paintArenaGround as paintArenaGroundR1} from './campaign-cave-arena-legacy.js';
const arenaPoly=(c,p)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
// Small, coherent material relief. It does not introduce platform height or
// collision: the source combat grid and ground anchors remain unchanged.
function arenaPaver(c,points,index,ring=false,tones=null){
 const height=ring?1.65:.6,top=points.map(([x,y])=>[x,y-height]),cx=top.reduce((s,p)=>s+p[0],0)/top.length,cy=top.reduce((s,p)=>s+p[1],0)/top.length;
 arenaPoly(c,points);c.fillStyle='#17243a';c.fill();
 for(let i=0;i<points.length;i++){
  const j=(i+1)%points.length;if(points[j][0]>=points[i][0])continue;
  arenaPoly(c,[top[i],top[j],[points[j][0],points[j][1]+.7],[points[i][0],points[i][1]+.7]]);c.fillStyle=tones?tones[2]:(ring?'#26364b':'#203047');c.fill();
 }
 arenaPoly(c,top);c.fillStyle=tones?tones[Math.abs(index)%3===0?1:0]:(ring?(Math.floor(index/2)%2?'#3d4c61':'#414f64'):(index%4===0?'#2e3e54':'#2a3950'));c.fill();
 c.strokeStyle=tones?.[2]||'#1c2a3e';c.lineWidth=ring?.65:.48;c.stroke();
 const inset=top.map(([x,y])=>{const d=Math.hypot(cx-x,cy-y)||1,k=(ring?1.1:.65)/d;return [x+(cx-x)*k,y+(cy-y)*k];});
 for(let i=0;i<top.length;i++){
  const j=(i+1)%top.length;if(top[j][0]<=top[i][0])continue;
  arenaPoly(c,[top[i],top[j],inset[j],inset[i]]);c.fillStyle=tones?.[3]||(ring?'#586b80':'#43556b');c.fill();
 }
}
export function paintArenaGround(c,scene,path){
 if(!scene.arena)return;
 if(scene.arena.floorRevision!==2)return paintArenaGroundR1(c,scene,path);
 const x=284,y=164,point=(a,rx,ry,z=0)=>[x+Math.cos(a)*rx,y+Math.sin(a)*ry-z];
 c.save();c.clip(path);
 // The inset center is one continuous staggered bond, not independent patches.
 c.save();c.beginPath();c.ellipse(x,y,137.5,72,0,0,Math.PI*2);c.clip();c.fillStyle=scene.arena.tones?.[2]||'#1c2a3e';c.fillRect(x-165,y-78,330,156);
 for(let row=-6;row<=6;row++)for(let col=-6;col<=6;col++){
  const v=row*12.2,u=col*29.5+(row%2?14.75:0),at=(u,v)=>[x+u+v/8,y+v];
  arenaPaver(c,[at(u+.5,v+.4),at(u+28.8,v+.4),at(u+28.8,v+11.8),at(u+.5,v+11.8)],row*17+col,false,scene.arena.tones);
 }c.restore();
 // Two connected annular courses. Staggered joints and visible lower faces
 // give masonry volume while keeping the circular space the user liked.
 for(const [course,n,outerX,outerY,innerX,innerY]of [[0,32,166,91,152,81],[1,28,151.5,80.7,137,72]]){
  const step=Math.PI*2/n,phase=course*step*.5;
  for(let i=0;i<n;i++){
   const a=i*step+phase+.0025,b=(i+1)*step+phase-.0025;
   arenaPaver(c,[point(a,outerX,outerY),point(b,outerX,outerY),point(b,innerX,innerY),point(a,innerX,innerY)],i+course*31,true,scene.arena.tones);
  }
 }
 // A small fitted keystone rosette resolves the middle of the bond.
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,b=(i+1)*Math.PI/4;
  arenaPaver(c,[point(a,27,14),point(b,27,14),point(b,9,4.8),point(a,9,4.8)],i,false,scene.arena.tones);
 }
 arenaPaver(c,[[x-9,y],[x,y-4.8],[x+9,y],[x,y+4.8]],0,false,scene.arena.tones);
 c.restore();
}
export function paintArenaProp(c,prop){
 c.save();c.translate(...prop.offset);for(const shape of prop.shapes){c.fillStyle=shape.fill;c.fill(new Path2D(shape.d));}c.restore();
 if(prop.brazier){
  const {x,y}=prop.brazier;
  arenaPoly(c,[[x-10,y-5],[x-7,y],[x+7,y],[x+10,y-5]]);c.fillStyle='#394551';c.fill();c.strokeStyle='#1b2838';c.lineWidth=.7;c.stroke();
  c.beginPath();c.ellipse(x,y-5,10,2.6,0,0,Math.PI*2);c.fillStyle='#172638';c.fill();c.strokeStyle='#75818a';c.lineWidth=.8;c.stroke();
 }
}
export function paintArenaCage(c,plan){
 const {cx:x,cy:y}=plan;
 c.save();
 // Fixed ironwork is anchored to the existing opening. The creature's rig
 // remains behind this layer; the approaching miner is sorted in front.
 for(const u of [-54,-36,-18,0,18,36,54]){
  c.fillStyle='#182334';c.fillRect(x+u-1.9,y-104,3.8,116);
  c.fillStyle='#4c5962';c.fillRect(x+u-1.1,y-104,2.2,116);
  c.fillStyle='#7b8485';c.fillRect(x+u-1.05,y-104,.65,116);
 }
 for(const [v,w]of [[-71,108],[4,130]]){
  c.fillStyle='#182334';c.fillRect(x-w/2,y+v-1.6,w,3.6);
  c.fillStyle='#596367';c.fillRect(x-w/2,y+v-1.1,w,1.8);
  c.fillStyle='#7b8485';c.fillRect(x-w/2,y+v-1.1,w,.5);
  for(const u of [-w/2+4,w/2-4]){c.fillStyle='#95998e';c.fillRect(x+u-.65,y+v-.6,1.3,1.3);}
 }
 // Small central latch: muted aged metal, with no quest/key behavior.
 c.strokeStyle='#697373';c.lineWidth=1.5;c.beginPath();c.moveTo(x-16,y-22);c.lineTo(x-16,y-26);c.quadraticCurveTo(x-13,y-30,x-10,y-26);c.lineTo(x-10,y-22);c.stroke();
 c.fillStyle='#303a44';c.fillRect(x-18,y-23,10,8);c.fillStyle='#87816b';c.fillRect(x-17,y-23,8,6.5);c.fillStyle='#343d43';c.fillRect(x-13.5,y-21.5,1.3,3);
 c.restore();
}
export function paintBossWarning(c,scene,warning){
 if(!warning)return;
 if(warning.geodePulse){
  paintGeodePulseWarning(c,{windup:warning,project:(x,y)=>({x:100+44*x+4*y,y:115+32*y}),presentationBeat:5.6,soft:true});return;
 }
 const cells=new Set(warning.tiles.map(p=>p.x+','+p.y)),corners=[[-12,-8],[10,-8],[12,8],[-10,8]],dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 c.save();c.fillStyle='#ffd95a';c.globalAlpha=.16;
 for(const p of warning.tiles){const x=50+22*p.x+2*p.y,y=57.5+16*p.y;arenaPoly(c,corners.map(([u,v])=>[x+u,y+v]));c.fill();}
 c.globalAlpha=.95;c.lineWidth=1.3;c.strokeStyle='#ffd95a';c.beginPath();
 for(const p of warning.tiles)for(let i=0;i<4;i++)if(!cells.has((p.x+dirs[i][0])+','+(p.y+dirs[i][1]))){const x=50+22*p.x+2*p.y,y=57.5+16*p.y,a=corners[i],b=corners[(i+1)%4];c.moveTo(x+a[0],y+a[1]);c.lineTo(x+b[0],y+b[1]);}c.stroke();c.restore();
}
