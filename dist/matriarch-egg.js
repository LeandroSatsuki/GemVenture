import{creatureBuilder}from'./dungeon-creature-mesh.js';
import{tubeMesh,rootProject,WOOD,paintRootMesh}from'./matriarch-root-geometry.js';
import{VINE_RULES,rootCaption}from'./matriarch-mechanic.js';
import{beatTime}from'./score.js';
export const EGG_RAMP=Object.freeze(['#a2e66f','#5dae27','#1d3926']);
const clamp=n=>Math.max(0,Math.min(1,n));
export function eggDimensions(pose){return{radius:14*pose.scale,depth:12*pose.scale,rz:17*pose.scale,center:4+17*pose.scale};}
function transform(p,pose,center){const[x,y,z]=p,co=Math.cos(pose.shake),si=Math.sin(pose.shake);return[x*co+(z-center)*si,y,-x*si+(z-center)*co+center+pose.hop];}
export function eggShellMesh(f,pose){const m=creatureBuilder({soft:true}),{radius,depth,rz,center}=eggDimensions(pose),tf=p=>transform(p,pose,center),rows=6,columns=10,point=(lat,a)=>{const n=Math.sin(lat),r=Math.cos(lat)*(1-.18*n);return[radius*r*Math.cos(a),depth*r*Math.sin(a),center+rz*n];};
 for(let l=0;l<rows;l++)for(let i=0;i<columns;i++){const a=i*Math.PI*2/columns,b=(i+1)*Math.PI*2/columns,u=-Math.PI/2+l*Math.PI/rows,v=-Math.PI/2+(l+1)*Math.PI/rows,A=point(u,a),B=point(u,b),C=point(v,b),D=point(v,a);m.face('egg-shell',[A,B,C],EGG_RAMP,tf);m.face('egg-shell',[A,C,D],EGG_RAMP,tf);}
 if(pose.q>.55){const points=[[-1,center+rz*.8],[2,center+rz*.4],[-2,center+rz*.1],[1,center-rz*.25],[-1,center-rz*.65]].map(([x,z])=>{const n=(z-center)/rz,r=Math.sqrt(Math.max(0,1-n*n))*(1-.18*n);return[x,depth*r+.45,z];});for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];m.face('egg-crack',[[a[0]-.4,a[1],a[2]],[a[0]+.4,a[1],a[2]],[b[0]+.4,b[1],b[2]],[b[0]-.4,b[1],b[2]]],WOOD,tf,'#005a41');}}
 return m.finish();}
export function eggStemMesh(f,pose){const dx=f.x-f.start.x,dy=f.y-f.start.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,points=Array.from({length:7},(_,i)=>{const t=i/6,d=19*(1-t);return[-ux*d,-uy*d,-2+7*t*t+pose.hop*t*.25];});return tubeMesh('egg-root-tip',points,t=>4.1-2*t);}
export function eggCountdown(f,beat,timeAt=b=>beatTime(10,b)){const end=f.activeAt+VINE_RULES.chargeBeats-1,remaining=Math.max(0,end-beat),seconds=Math.max(0,timeAt(end)-timeAt(Math.min(beat,end)));return{remaining,seconds,fraction:clamp(remaining/VINE_RULES.chargeBeats),label:seconds.toFixed(1)+' s'};}
export function rootVisualCaption(b,beat){const text=rootCaption(b,beat);return text.startsWith('OVO')?null:text;}
// Convex projected silhouette of the deliberately faceted revolved shell.
export function eggOutline(mesh){const p=mesh.filter(f=>f.id==='egg-shell').flatMap(f=>f.points.map(rootProject)).sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),half=points=>{const out=[];for(const n of points){while(out.length>1&&cross(out.at(-2),out.at(-1),n)<=0)out.pop();out.push(n);}return out;};return[...half(p).slice(0,-1),...half([...p].reverse()).slice(0,-1)];}
// Broad planar faces use the same three green material stops as the tree family.
export function paintEggShell(c,mesh,x,y,pose){paintRootMesh(c,mesh,x,y);const outline=eggOutline(mesh);c.save();c.translate(x,y);c.beginPath();outline.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.strokeStyle=EGG_RAMP[2];c.lineWidth=.65;c.stroke();c.restore();}
