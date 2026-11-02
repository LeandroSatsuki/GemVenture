import {recordBossMeshEmission} from './boss-emission-materials.js';
const white=['#ffffe0','#c4ccc7','#8394a6'];
const YAWS={down:0,left:Math.PI/2,up:Math.PI,right:-Math.PI/2};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((n,i)=>n-b[i]);
export function creatureBuilder({direction='down',time=0,soft=false,includeHidden=false}={}){
 const yaw=YAWS[direction]??0,co=Math.cos(yaw),si=Math.sin(yaw),faces=[],bob=soft?0:Math.sin(time*2)*.45;
 const rotate=p=>[p[0]*co-p[1]*si,p[0]*si+p[1]*co,p[2]+bob];
 const face=(id,points,ramp,transform=p=>p,color=null)=>{const p=points.map(q=>rotate(transform(q))),n=cross(sub(p[1],p[0]),sub(p[2],p[0])),length=Math.hypot(...n);if(length<1e-8)return;const unit=n.map(v=>v/length);if(!includeHidden&&unit[0]*(-1/11)+unit[1]+unit[2]*8/11<=.0001)return;
  const light=unit[0]*-.5+unit[1]*-.3+unit[2]*.8,fill=color||ramp[light>.3?0:light>-.5?1:2];faces.push({id,points:p,normal:unit,fill,depth:p.reduce((s,q)=>s+q[1]+q[2]*8/11,0)/p.length});};
 const box=(id,x,y,z,w,d,h,ramp,bevel=2,transform=p=>p)=>{
  const ring=(inset,zz)=>{const a=w/2-inset,b=d/2-inset,k=Math.min(3,a*.45,b*.45);return [[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]].map(([u,v])=>[x+u,y+v,z+zz]);};
  const rings=[ring(bevel,0),ring(0,bevel),ring(0,h-bevel),ring(bevel,h)];
  for(let layer=0;layer<3;layer++)for(let i=0;i<8;i++){const j=(i+1)%8;face(id,[rings[layer][i],rings[layer][j],rings[layer+1][j],rings[layer+1][i]],ramp,transform);}
  face(id,rings[3],ramp,transform);face(id,[...rings[0]].reverse(),ramp,transform);
 };
 const front=(id,x,z,w,h,color,y=19.1)=>face(id,[[x-w/2,y,z],[x+w/2,y,z],[x+w/2,y,z-h],[x-w/2,y,z-h]],white,p=>p,color);
return {box,front,face,faces,finish(){return faces.sort((a,b)=>a.depth-b.depth);}};
}
export function paintCreatureMesh(c,faces,x,y,scale=1,{shadow=true,emissionIndex=null}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';
 const poly=(points)=>{c.beginPath();points.forEach(([a,b,z],i)=>i?c.lineTo(a+b/11,b*8/11-z):c.moveTo(a+b/11,b*8/11-z));c.closePath();};
 if(shadow){c.save();c.globalAlpha*=.22;c.fillStyle='#132233';c.beginPath();for(const f of faces){const p=f.points.map(([a,b,z])=>[a+z*.24+(b+z*.1)/11,(b+z*.1)*8/11]);p.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();}c.fill();c.restore();}
 for(const f of faces){poly(f.points);c.fillStyle=f.fill;c.fill();c.strokeStyle=f.fill;c.lineWidth=.22;c.stroke();}c.restore();if(emissionIndex!==null)recordBossMeshEmission(c,emissionIndex,faces,x,y,scale);
}
