// Read-only scenery plan. Local rows are rebased against the Abismo stream.
export const WALL_PYRE_SPEC=Object.freeze({version:1,maxInstances:8,minDistance:9,maxScanCells:4489,queryHalfLimit:24,halo:9,lightRadius:58,flameScale:.34,maxEmbers:16,newRasterCaches:0});
const project=(x,y)=>({x:50+22*x+2*y,y:57.5+16*y});
const hash=(seed,x,y,salt=0)=>{let n=(seed^Math.imul(x,73856093)^Math.imul(y,19349663)^salt)>>>0;n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0;};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const directions=[{facing:'north',dx:0,dy:1,ex:-1,ey:-8},{facing:'west',dx:1,dy:0,ex:-11,ey:0},{facing:'east',dx:-1,dy:0,ex:11,ey:0}];
function exclusions(room,x,y){
 const h=room.hedgehog;if(h?.x>0&&Math.abs(x-h.x)<=9&&y>=h.y-11&&y<=h.y+5)return true;
 return [room.layout?.spawn,room.exit].some(p=>p&&distance(p,{x,y})<5);
}
export function planWallPyres(room,{depth=0,view,material,biome=0}={}){
 if(!room?.floorMask||!view||!material||room.bossFloor)return {items:[],scanned:0,candidates:0,truncated:0};
 const cols=room.cols||21,rows=room.rows||15,d=room.abyssCave?Math.max(0,Math.floor(depth)):0;
 const cy=Math.round((view.center[1]-57.5)/16),cx=Math.round((view.center[0]-50-cy*2)/22),hx=Math.min(24,Math.ceil(view.width/44)+3),hy=Math.min(24,Math.ceil(view.height/32)+3),halo=WALL_PYRE_SPEC.halo;
 const l=Math.max(1,cx-hx-halo),r=Math.min(cols-2,cx+hx+halo),t=Math.max(1,cy-hy-halo),b=Math.min(rows-2,cy+hy+halo);
 const floor=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows&&room.floorMask[y*cols+x]===1;
 const raw=[],cells=new Map();let scanned=0;
 for(let y=t;y<=b;y++)for(let x=l;x<=r;x++){
  scanned++;if(floor(x,y)||exclusions(room,x,y))continue;
  // Keep a backing halo: the top/bottom cut of a rolling window is never a wall.
  if(room.abyssCave&&(y<2||y>rows-3))continue;
  for(const dir of directions){
   const {dx,dy}=dir,tx=dy,ty=-dx;
   if((dir.facing==='north'?x:y+d)%3!==0)continue;
   // Continuous backing and a broad floor apron, with no corner-mounted flame.
   let fits=true;for(let k=-1;k<=1;k++)for(let n=0;n<=2;n++)if(floor(x+tx*k+dx*n,y+ty*k+dy*n)!==(n>0))fits=false;
   if(!fits)continue;
   const p={x,y,absoluteY:y+d,dir,rank:hash(room.seed||0,x,y+d,1777)};raw.push(p);cells.set(x+','+y,p);break;
  }
 }
 const selected=[];
 for(const p of raw){
  if(Math.abs(p.x-cx)>hx||Math.abs(p.y-cy)>hy)continue;
  let winner=true;for(let yy=p.y-halo;yy<=p.y+halo&&winner;yy++)for(let xx=p.x-halo;xx<=p.x+halo;xx++){
   const q=cells.get(xx+','+yy);if(!q||q===p||distance(p,q)>=WALL_PYRE_SPEC.minDistance)continue;
   if(q.rank<p.rank||q.rank===p.rank&&(q.absoluteY<p.absoluteY||q.absoluteY===p.absoluteY&&q.x<p.x)){winner=false;break;}
  }
  if(!winner)continue;
  const grid={x:p.x+p.dir.dx,y:p.y+p.dir.dy},q=project(grid.x,grid.y),mount={x:q.x+p.dir.ex+(p.dir.dx?Math.sign(p.dir.dx)*1.5:0),y:q.y+p.dir.ey-12};
  const bounds={x:mount.x-12,y:mount.y-24,w:24,h:35};
  if(bounds.x+bounds.w<view.center[0]-view.width/2||bounds.x>view.center[0]+view.width/2||bounds.y+bounds.h<view.center[1]-view.height/2||bounds.y>view.center[1]+view.height/2)continue;
  // Wall batches quantize the depth of their far edge to quarters. The sconce
  // follows that complete face, and stays behind an actor on the next row.
  selected.push({id:`wall-pyre:v1:${room.seed||0}:${p.x}:${p.absoluteY}:${p.dir.facing}`,wallGrid:{x:p.x,y:p.y},absoluteWallGrid:{x:p.x,y:p.absoluteY},grid,projected:{mount,flame:{x:mount.x,y:mount.y-2},foot:project(grid.x,grid.y)},facing:p.dir.facing,visualDepth:grid.y+.76,bounds,phase:p.rank/4294967296*6.28,material,biome,rank:p.rank});
 }
 selected.sort((a,b)=>distance(a.projected.mount,{x:view.center[0],y:view.center[1]})-distance(b.projected.mount,{x:view.center[0],y:view.center[1]})||a.rank-b.rank);
 const items=selected.slice(0,WALL_PYRE_SPEC.maxInstances);
 return {items,scanned,candidates:raw.length,truncated:Math.max(0,selected.length-items.length)};
}
export function wallPyreLight(item,{soft=false}={}){
 return {id:item.id,kind:'wall-pyre',grid:{...item.grid},wallGrid:{...item.wallGrid},absoluteWallGrid:{...item.absoluteWallGrid},projected:{...item.projected.flame},color:item.material.light||item.material.gem[0],material:item.material,biome:item.biome,radius:WALL_PYRE_SPEC.lightRadius,intensity:.3,persistentScenery:true,revealsEnemies:false,clip:'receiver-floor-and-source-line-of-sight',soft,animate:!soft};
}
