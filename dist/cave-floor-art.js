// Seam-free floor presentation. Continuous opaque substrate + sparse broad surface variants.
// Reuses the 47 connection masks, projection and anchors of terrain-kit; no unfinished atlas.
import {P} from './palette.js';
import {isFloor} from './cave-layout.js';
import {terrainMaskAt,terrainPolygon} from './terrain-kit.js';
import {caveBiomeProfile} from './cave-biome-art.js';
const plans=new WeakMap();
function noise(seed,x,y){let a=(seed^Math.imul(x+31,374761393)^Math.imul(y+19,668265263))>>>0;a=Math.imul(a^(a>>>13),1274126177);return (a^(a>>>16))>>>0;}
export function buildCaveFloor(room){
 const old=plans.get(room);if(old?.mask===room.floorMask)return old.plan;
 const map=Array.from({length:room.rows},(_,y)=>Array.from({length:room.cols},(_,x)=>isFloor(room,x,y)?1:0)),coverage=new Path2D(),variants=[];
 for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(map[y][x]){const px=38+22*x+2*y,py=49.5+16*y;terrainPolygon(terrainMaskAt(map,x,y)).forEach(([u,v],i)=>i?coverage.lineTo(px+22*u+2*v,py+16*v):coverage.moveTo(px+22*u+2*v,py+16*v));coverage.closePath();}
 // World-anchored large motifs span several logical cells; no per-cell borders.
 for(let y=1;y<room.rows;y+=4)for(let x=1;x<room.cols;x+=5){const h=noise(room.seed,x,y),px=50+22*x+2*y,py=57.5+16*y,dx=(h%13)-6,dy=((h>>>5)%9)-4,k=.8+((h>>>10)%5)*.07;variants.push({x:px+dx,y:py+dy,k,kind:(h>>>16)%4});}
 const plan={coverage,variants};plans.set(room,{mask:room.floorMask,plan});return plan;
}
function poly(c,p){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function paintCaveFloorSurface(c,room,biome){
 const profile=caveBiomeProfile(biome);if(!profile||room.bossFloor||!room.floorMask||room.layout?.style==='ABISMO')return false;
 const {coverage,variants}=buildCaveFloor(room);c.save();c.clip(coverage);c.lineJoin='round';c.lineCap='round';
 for(const v of variants){c.save();c.translate(v.x,v.y);c.scale(v.k,v.k);
  // Four low-relief finishes: broad bevel, paired planes, inset, and a short forked groove.
  const shapes=[[[2,0],[55,-3],[72,6],[63,23],[10,27],[-3,17]],[[0,2],[35,-4],[49,9],[33,22],[4,23],[-5,13]],[[4,2],[68,0],[78,11],[65,25],[12,29],[0,17]],[[1,1],[57,-2],[69,9],[55,22],[7,24],[-4,13]]];
  const p=shapes[v.kind];poly(c,p);c.fillStyle=profile.light;c.globalAlpha=biome===3?.14:.1;c.fill();
  c.beginPath();c.moveTo(...p[2]);for(let i=3;i<p.length;i++)c.lineTo(...p[i]);c.strokeStyle=profile.dark;c.globalAlpha=.36;c.lineWidth=.8;c.stroke();
  if(v.kind===1){c.beginPath();c.moveTo(24,3);c.lineTo(32,11);c.lineTo(27,20);c.globalAlpha=.25;c.stroke();}
  if(v.kind===2){poly(c,[[18,8],[54,5],[61,12],[50,18],[21,20],[14,14]]);c.globalAlpha=.12;c.fillStyle=profile.dark;c.fill();}
  if(v.kind===3){c.beginPath();c.moveTo(13,9);c.lineTo(31,12);c.lineTo(40,7);c.moveTo(31,12);c.lineTo(38,18);c.globalAlpha=.3;c.stroke();}
  c.restore();
 }c.restore();return true;
}
