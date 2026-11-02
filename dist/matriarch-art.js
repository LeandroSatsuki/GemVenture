import {recordBossMeshEmission} from './boss-emission-materials.js';
import {creatureBuilder} from './dungeon-creature-mesh.js';
import {rootActive,rootOpen} from './matriarch-mechanic.js';
// Local migrated family: exact Cosmos64 samples, cave column(44,0), row(4,32).
export const ROOT_MATERIALS=Object.freeze({
 bark:{lit:'#ed9353',base:'#9c3824',dark:'#591d35',glint:'#f7bf6f'},
 cut:{lit:'#f7bf6f',base:'#ed9353',dark:'#9c3824',glint:'#f7bf6f'},
 leaf:{lit:'#a2e66f',base:'#5dae27',dark:'#1d3926',glint:'#c5e848'},
 leafDeep:{lit:'#5acc9a',base:'#288a3f',dark:'#005a41',glint:'#a2e66f'},
 seed:{lit:'#f7bf6f',base:'#e97c07',dark:'#9c3824',glint:'#ffd95a'},
 ink:'#161928'
});
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},tau=Math.PI*2;
const paintCache=new WeakMap();
const angle=p=>-Math.atan2(p.x,p.y),turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export function matriarchPose(b,beat,time=0,soft=false){const m=b.vine,hit=m.hitAt>=0?Math.max(0,1-(beat-m.hitAt)/.28)*.12:0,impact=Math.max(hit,m.impactAt>=0?Math.max(0,1-(beat-m.impactAt)/.65)*.6:0);return{yaw:0,impact,open:rootOpen(b,beat)?smooth((beat-m.openFrom)/.25):0,breath:Math.sin(time*2.1)*.65*(soft?.25:1),blink:Math.sin(time*.83+1.7)>.997,time,soft};}
function transformAt(p,pivot,rx=0,rz=0,dy=0,dz=0){let[x,y,z]=p.map((n,i)=>n-pivot[i]);const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(rz),sy=Math.sin(rz);[y,z]=[y*cx-z*sx,y*sx+z*cx];[x,y]=[x*cy-y*sy,x*sy+y*cy];return[x+pivot[0],y+pivot[1]+dy,z+pivot[2]+dz];}
const lowerCanopy=([x,y,z])=>[x,y,35+(z-35)*.9];
export function matriarchMesh(b,beat,time=0,{soft=false,yaw=null}={}){
 const pose=matriarchPose(b,beat,time,soft);if(yaw!==null)pose.yaw=yaw;
 const m=creatureBuilder({time:0,soft:true,includeHidden:true}),materials=new Map(),fixed=new Set(),names=[];
 const box=(id,x,y,z,w,d,h,material,bevel=2,tf=p=>p,ground=false)=>{materials.set(id,material);if(ground)fixed.add(id);names.push(id);m.box(id,x,y,z,w,d,h,[material.lit,material.base,material.dark],bevel,tf);};
 const body=p=>transformAt(p,[0,0,15],pose.impact*.05,0,-pose.impact*.3,0);
 box('root-left',-17,6,0,25,17,10,ROOT_MATERIALS.bark,2.3,p=>p,true);
 box('root-right',17,6,0,25,17,10,ROOT_MATERIALS.bark,2.3,p=>p,true);
 box('root-front',0,12,0,17,20,8,ROOT_MATERIALS.bark,2,p=>p,true);
 box('root-collar',0,0,3,35,29,12,ROOT_MATERIALS.bark,2.5,p=>p,true);
 box('trunk',0,0,15,31,27,22,pose.open>.05?ROOT_MATERIALS.cut:ROOT_MATERIALS.bark,2.4,body);
 if(pose.open>.05)box('sap-fissure',1,14.1,19,2.2,.8,13,ROOT_MATERIALS.cut,.3,body);
 const crowns=[['crown-center',0,0,37,30,26,18,ROOT_MATERIALS.leaf,0],['crown-left',-26,0,35,18,22,19,ROOT_MATERIALS.leafDeep,1.7],['crown-right',26,0,35,18,22,19,ROOT_MATERIALS.leaf,.6],['crown-back-left',-16,-27,37,28,24,18,ROOT_MATERIALS.leafDeep,2.4],['crown-back-right',14,-27,37,28,24,18,ROOT_MATERIALS.leaf,3.2],['crown-top',0,-9,58,40,32,12,ROOT_MATERIALS.leaf,1.2],['crown-front-left',-22,20,35,22,10,16,ROOT_MATERIALS.leaf,4.1],['crown-front-right',22,20,35,22,10,16,ROOT_MATERIALS.leaf,5.2]];
 for(const[id,x,y,z,w,d,h,mat,phase]of crowns){const leaf=p=>body(lowerCanopy(transformAt(p,[x,y,z],0,Math.sin(time*.9+phase)*.018*(soft?.2:1),0,(.35+Math.sin(time*1.3+phase)*.35)*(soft?.2:1)+pose.impact*1.3)));box(id,x,y,z,w,d,h,mat,2.8,leaf);}
 for(const side of[-1,1]){const x=side*6,z=30,h=pose.blink?1:3.2,points=[[x-3,13.85,z+(side<0?1:-1)],[x+3,13.85,z+(side<0?-1:1)],[x+3,13.85,z-h+(side<0?-1:1)],[x-3,13.85,z-h+(side<0?1:-1)]];materials.set('eye-'+side,{lit:ROOT_MATERIALS.ink,base:ROOT_MATERIALS.ink,dark:ROOT_MATERIALS.ink,glint:ROOT_MATERIALS.ink});m.face('eye-'+side,points,[ROOT_MATERIALS.ink,ROOT_MATERIALS.ink,ROOT_MATERIALS.ink],body,ROOT_MATERIALS.ink);}
 const co=Math.cos(pose.yaw),si=Math.sin(pose.yaw),out=[];
 for(const f of m.finish()){
  const mat=materials.get(f.id),isFixed=fixed.has(f.id),p=isFixed?f.points:f.points.map(([x,y,z])=>[x*co-y*si,x*si+y*co,z]);
  const n=isFixed?f.normal:[f.normal[0]*co-f.normal[1]*si,f.normal[0]*si+f.normal[1]*co,f.normal[2]];
  if(-n[0]/11+n[1]+n[2]*8/11<=.0001)continue;
  const light=-n[0]*.52-n[1]*.32+n[2]*.79;
  const glint=n[2]>.15&&n[2]<.96&&light>.64;
  out.push({...f,points:p,normal:n,fill:glint?mat.glint:light>.35?mat.lit:light>-.42?mat.base:mat.dark,depth:p.reduce((a,q)=>a+q[1]+q[2]*8/11,0)/p.length});
 }
 return out.sort((a,z)=>a.depth-z.depth);
}
function polygon(c,points){c.beginPath();for(let i=0;i<points.length;i++){const[x,y,z]=points[i];i?c.lineTo(x+y/11,y*8/11-z):c.moveTo(x+y/11,y*8/11-z);}c.closePath();}
function contourLookup(faces){const edges=new Map(),key=p=>p.map(n=>n.toFixed(3)).join(',');const edgeKey=(f,a,b)=>f.id+':'+[key(a),key(b)].sort().join('|');for(const f of faces)for(let i=0;i<f.points.length;i++){const k=edgeKey(f,f.points[i],f.points[(i+1)%f.points.length]);edges.set(k,(edges.get(k)||0)+1);}return(f,a,b)=>edges.get(edgeKey(f,a,b))===1;}
export function paintMatriarch(c,b,x,y,width,time,beat,soft=false){if(!rootActive(b))return false;const key=JSON.stringify([beat,time,soft,b.x,b.y,b.vine]),prior=paintCache.get(b);let cached=prior;if(!prior||prior.key!==key){const faces=matriarchMesh(b,beat,time,{soft});cached={key,faces,boundary:contourLookup(faces)};paintCache.set(b,cached);}const{faces,boundary}=cached,scale=width/83;
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';
 c.save();c.fillStyle='#183454';c.globalAlpha*=.24;c.beginPath();for(const f of faces){for(let i=0;i<f.points.length;i++){const[a,d,z]=f.points[i],px=a+z*.24+(d+z*.1)/11,py=(d+z*.1)*8/11;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();}c.fill();c.restore();
 // Localized contact follows roots, not a generic circle under every tree.
 c.save();c.globalAlpha*=.18;c.fillStyle=ROOT_MATERIALS.ink;for(const f of faces.filter(f=>f.id.startsWith('root-'))){polygon(c,f.points.map(([a,d])=>[a,d,-.3]));c.fill();}c.restore();
 for(const f of faces){polygon(c,f.points);c.fillStyle=f.fill;c.fill();c.strokeStyle=f.fill;c.lineWidth=.22;c.stroke();c.strokeStyle=ROOT_MATERIALS.ink;c.lineWidth=.55;c.lineCap='round';c.beginPath();for(let i=0;i<f.points.length;i++){const a=f.points[i],b=f.points[(i+1)%f.points.length];if(boundary(f,a,b)){c.moveTo(a[0]+a[1]/11,a[1]*8/11-a[2]);c.lineTo(b[0]+b[1]/11,b[1]*8/11-b[2]);}}c.stroke();}c.restore();recordBossMeshEmission(c,1,faces,x,y,scale);return true;
}

export {rootSceneEntities,paintSapRoot,paintSummonBush,paintVineGround,paintVineWrap,paintSapArc} from './matriarch-effects.js';
