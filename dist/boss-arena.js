import {DUNGEON_MATERIALS,volumeBuilder} from './dungeon-volumes.js';
import {drawAsset} from './art-kit.js';
import {isFloor} from './cave-layout.js';
const cache=new WeakMap(),point=(x,y)=>[50+22*x+2*y,57.5+16*y];
const THEMES=['crystal','mushroom','fossil','lava','mushroom','molehill','bush'];
export function buildBossArena(room,biome=0){
 if(!room.bossFloor)return null;
 if(cache.get(room)?.biome===biome)return cache.get(room);
 const plan={biome,props:[],center:point(10,biome===4||biome===6?7:6)};
 // Decorative masses are outside the navigable rectangle, including their
 // projected silhouettes. Never add obstacles to the combat simulation.
 for(const [gx,gy,w,h]of [[3,0,54,43],[9,0,72,50],[15,0,54,43],[-1,5,56,94],[room.cols,5,56,94],[-1,11,48,72],[room.cols,11,48,72]]){
  const [x,y]=point(gx,gy),bounds={left:x-w/2,right:x+w/2,top:y-h,bottom:y+2};
  let clear=true;for(let ty=0;ty<room.rows&&clear;ty++)for(let tx=0;tx<room.cols;tx++)if(isFloor(room,tx,ty)){const [px,py]=point(tx,ty);if(bounds.left<px+12&&bounds.right>px-12&&bounds.top<py+8&&bounds.bottom>py-8){clear=false;break;}}
  if(clear)plan.props.push({x,y,w,h,bounds,seed:(room.seed+gx*97+gy*31)>>>0});
 }
 cache.set(room,plan);return plan;
}
export function paintBossArena(c,room,biome,ground){
 const p=buildBossArena(room,biome);if(!p)return false;
 const b=DUNGEON_MATERIALS[biome],[cx,cy]=p.center;
 c.save();c.clip(ground);
 // Broad fitted slabs, not rings of glowing combat-warning color.
 c.fillStyle=b.rock[2];c.globalAlpha=.22;c.beginPath();
 for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8,x=cx+Math.cos(a)*122,y=cy+Math.sin(a)*73;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();
 for(let i=0;i<12;i++){const a=i*Math.PI/6,da=.105,poly=[[Math.cos(a-da)*111,Math.sin(a-da)*65],[Math.cos(a+da)*111,Math.sin(a+da)*65],[Math.cos(a+da)*125,Math.sin(a+da)*74],[Math.cos(a-da)*125,Math.sin(a-da)*74]];c.beginPath();poly.forEach(([x,y],j)=>j?c.lineTo(cx+x,cy+y):c.moveTo(cx+x,cy+y));c.closePath();c.fillStyle=b.rock[i%3===0?0:1];c.globalAlpha=.20;c.fill();}
 c.restore();
 for(const prop of p.props){
  const v=volumeBuilder({castShadow:false}),s=prop.w/72;
  // Terraced mineral buttresses with fitted bases and a protected glowing core.
  v.prism(-20,0,0,26,25,23,b.rock,2,4);v.prism(18,0,0,31,27,32,b.rock,2,4);
  v.prism(0,-8,0,36,28,47,b.rock,2,4);
  c.save();c.translate(prop.x-50*s,prop.y-88*s);c.scale(s,s);for(const shape of v.shapes){c.fillStyle=shape.fill;c.fill(new Path2D(shape.d));}c.restore();
  drawAsset(c,THEMES[biome],prop.x,prop.y-15*s,prop.w*.72,{biome,variant:biome%4,seed:prop.seed});
 }
 return true;
}
