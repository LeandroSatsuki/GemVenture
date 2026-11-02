// Tapered, seeded ribbons. Geometry is prepared once per discharge, never per frame.
const clamp=n=>Math.max(0,Math.min(1,n));
const random=seed=>{let n=(seed|0)^0x71e9;return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return(n>>>0)/4294967296;};};
export function lightningMesh(from,to,seed=0,{soft=false}={}){
  if(![from?.x,from?.y,to?.x,to?.y].every(Number.isFinite))return null;
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<.01)return null;
  const rnd=random(seed),nx=-dy/length,ny=dx/length,points=[[from.x,from.y]],progress=[0];
  const amplitude=Math.min(6,length*.13)*(soft?.65:1);
  for(let i=1;i<6;i++){
    const t=(i+(rnd()-.5)*.4)/6;
    const side=(i%2?1:-1)*(seed%2?-1:1),offset=side*amplitude*(.45+rnd()*.55)*Math.sin(Math.PI*t);
    points.push([from.x+dx*t+nx*offset,from.y+dy*t+ny*offset]);progress.push(t);
  }
  points.push([to.x,to.y]);progress.push(1);
  const widths=progress.map(t=>(soft?1.05:1.85)*(1-t)**1.15);
  return {points,progress,widths,length};
}
export const lightningPath=(from,to,seed=0)=>lightningMesh(from,to,seed)?.points??null;

function ribbon(mesh,multiplier){
  const {points,widths}=mesh,left=[],right=[];
  for(let i=0;i<points.length;i++){
    const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
    const nx=-dy/len,ny=dx/len,w=widths[i]*multiplier;
    left.push([points[i][0]+nx*w,points[i][1]+ny*w]);right.push([points[i][0]-nx*w,points[i][1]-ny*w]);
  }
  return left.concat(right.reverse());
}
export function createLightningPainter(P){
  const cache=new Map();
  function geometry(from,to,seed,soft){
    if(!from||!to)return null;
    const key=[from.x,from.y,to.x,to.y,seed,soft].join(':');if(cache.has(key))return cache.get(key);
    const mesh=lightningMesh(from,to,seed,{soft});if(!mesh)return null;
    const value={mesh,polygons:[2,1.4,1,.25].map(n=>ribbon(mesh,n))};
    if(cache.size>=64)cache.delete(cache.keys().next().value);cache.set(key,value);return value;
  }
  function draw(c,from,to,age,{soft=false,glow=true,seed=0}={}){
    if(!Number.isFinite(age)||age<0||age>=.35)return false;
    const g=geometry(from,to,seed,soft);if(!g)return false;
    c.save();try{
      c.globalCompositeOperation='source-over';const alpha=c.globalAlpha*(1-age/.35);
      if(!soft&&age<.055){
        // Fast propagation is presentation only; damage is already resolved by core.
        const dx=(to.x-from.x)/g.mesh.length,dy=(to.y-from.y)/g.mesh.length,nx=-dy,ny=dx;
        const reach=g.mesh.length*clamp(age/.055),margin=18;
        const corners=[[-margin,-margin],[reach,-margin],[reach,margin],[-margin,margin]];
        c.beginPath();corners.forEach(([along,across],i)=>{
          const x=from.x+dx*along+nx*across,y=from.y+dy*along+ny*across;
          i?c.lineTo(x,y):c.moveTo(x,y);
        });c.closePath();c.clip();
      }
      const colors=[P.cyan,P.blue,P.cyan,P.lemon],opacity=[soft?.045:.08,.7,1,.94];
      for(let i=glow?0:1;i<4;i++){
        c.globalAlpha=alpha*opacity[i];c.fillStyle=colors[i];c.beginPath();
        g.polygons[i].forEach(([x,y],n)=>n?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
      }
      if(age<.16&&(soft||age>=.055)){
        const r=(soft?1.2:2.2)*clamp(1-age/.18);c.globalAlpha=alpha;c.fillStyle=P.lemon;
        c.beginPath();c.moveTo(to.x,to.y-r*1.4);c.lineTo(to.x+r,to.y);c.lineTo(to.x,to.y+r*1.4);c.lineTo(to.x-r,to.y);c.closePath();c.fill();
      }
    }finally{c.restore();}return true;
  }
  return Object.freeze({draw,status:()=>({cachedDischarges:cache.size,cacheLimit:64})});
}
