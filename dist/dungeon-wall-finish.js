import {DUNGEON_MATERIALS} from './dungeon-volumes.js';
const poly=(c,p)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
// Geometry from the audited shared contour. Broad rock strata, restrained bevels,
// no texture substitution and no full-height wall on a hidden walkable cell.
export function paintDungeonWalls(c,plan,biome){
 const alpha=c.globalAlpha,m=DUNGEON_MATERIALS[biome],ink='#161928';c.save();c.lineJoin='round';
 for(const loop of plan.loops){poly(c,loop);c.strokeStyle=ink;c.lineWidth=5;c.stroke();c.strokeStyle=m.rock[2];c.lineWidth=2.5;c.stroke();}
 for(const f of plan.faces){c.save();poly(c,[f.a,f.b,f.cap[2],f.cap[3]]);c.clip();
  c.fillStyle=m.rock[2];c.fill();
  const minX=Math.min(f.a[0],f.b[0]),maxX=Math.max(f.a[0],f.b[0]),slope=(f.b[1]-f.a[1])/(f.b[0]-f.a[0]||1),base=f.a[1]+slope*(minX-f.a[0]);
  for(let row=0;row<5;row++){const top=base-row*15,offset=row%2?19:0;
   for(let x=Math.floor((minX-offset)/38)*38+offset;x<maxX;x+=38){const yy=top+slope*(x-minX),w=38,h=15;
    poly(c,[[x+2,yy-h],[x+w-3,yy-h],[x+w,yy-h+3],[x+w,yy-2],[x+w-3,yy],[x+2,yy],[x,yy-2],[x,yy-h+2]]);c.fillStyle=f.role==='return'?m.rock[2]:m.rock[1];c.fill();
    poly(c,[[x+2,yy-h],[x+w-3,yy-h],[x+w-5,yy-h+1.5],[x+3,yy-h+1.5],[x+1.5,yy-h+3]]);c.fillStyle=m.rock[0];c.fill();
    c.strokeStyle=ink;c.globalAlpha=alpha*.4;c.lineWidth=.7;c.beginPath();c.moveTo(x+w,yy-h+3);c.lineTo(x+w,yy-2);c.lineTo(x+w-3,yy);c.lineTo(x+2,yy);c.stroke();c.globalAlpha=alpha;
   }
  }
  poly(c,f.cap);c.fillStyle=m.rock[0];c.fill();c.strokeStyle=m.rock[1];c.lineWidth=.6;c.stroke();
  c.strokeStyle='#c4ccc7';c.globalAlpha=alpha*.45;c.lineWidth=.65;c.beginPath();c.moveTo(...f.cap[3]);c.lineTo(...f.cap[2]);c.stroke();c.globalAlpha=alpha;
  c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.moveTo(...f.a);c.lineTo(...f.b);c.stroke();c.restore();
 }
 c.restore();return true;
}
