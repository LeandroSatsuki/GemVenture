// Scenery illumination is independent of enemy sight (human direction 01/11/2026).
// Neither mask mode writes native visibility or exploration.
export const CAVE_LIGHT_MASK_SPEC=Object.freeze({maxCells:4096,maxSourcePaths:64,maxCrystalLights:24});
const size=room=>({cols:room.cols||21,rows:room.rows||15});
const project=(x,y)=>[50+22*x+2*y,57.5+16*y];
const grid=(x,y)=>{const gy=(y-57.5)/16;return {x:Math.round((x-50-gy*2)/22),y:Math.round(gy)};};
export function lightingVisible(room,x,y){const {cols,rows}=size(room);return x>=0&&y>=0&&x<cols&&y<rows&&!!room.floorMask?.[y*cols+x]&&(!room.explored||!!room.visible?.[y*cols+x]);}
export function sceneryVisible(room,x,y){const {cols,rows}=size(room);return x>=0&&y>=0&&x<cols&&y<rows&&!!room.floorMask?.[y*cols+x];}
export function lightingLineClear(room,a,b,blocked=new Set()){
 const {cols,rows}=size(room),steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*4));
 for(let i=0;i<=steps;i++){const t=i/steps,x=Math.round(a.x+(b.x-a.x)*t),y=Math.round(a.y+(b.y-a.y)*t);if(x<0||y<0||x>=cols||y>=rows||!room.floorMask?.[y*cols+x])return false;if(i>0&&i<steps&&blocked.has(x+','+y))return false;}return true;
}
export function createExplorationLightingMasks(room,view,previous=null,{depth=0,scope='scenery',makePath=()=>new Path2D()}={}){
 const {cols,rows}=size(room),center=grid(...view.center),halfX=Math.min(31,Math.ceil(view.width/44)+5),halfY=Math.min(31,Math.ceil(view.height/32)+5),l=Math.max(0,center.x-halfX),r=Math.min(cols-1,center.x+halfX),t=Math.max(0,center.y-halfY),b=Math.min(rows-1,center.y+halfY),rockKey=(room.rocks||[]).filter(n=>(n.hp==null||n.hp>0)&&n.x>=l&&n.x<=r&&n.y>=t&&n.y<=b).map(n=>n.x+','+n.y).join(';'),key=[l,r,t,b,depth,scope,rockKey].join(':'),accepts=scope==='sight'?lightingVisible:sceneryVisible;
 if(previous?.key===key&&(scope!=='sight'||previous.visible===room.visible)&&previous.floorMask===room.floorMask)return previous;
 const cells=[];for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(accepts(room,x,y))cells.push({x,y});
 function pathForCells(list,top=-8){const path=makePath();let start=null,last=null;const flush=()=>{if(!start)return;const [ax,ay]=project(start.x,start.y),[bx,by]=project(last.x,last.y);path.moveTo(ax-12,ay+top);path.lineTo(bx+10,by+top);path.lineTo(bx+12,by+9);path.lineTo(ax-10,ay+9);path.closePath();};for(const q of list){if(!last||q.y!==last.y||q.x!==last.x+1){flush();start=q;}last=q;}flush();return path;}
 const floor=pathForCells(cells),reveal=pathForCells(cells,-65),sources=[],paths=new Map(),blocked=new Set((room.rocks||[]).filter(n=>n.hp==null||n.hp>0).map(n=>n.x+','+n.y));
 const sourcePath=(point,vertical=false)=>{
  let origin={x:Math.round(point.x),y:Math.round(point.y)};if(!accepts(room,origin.x,origin.y)&&cells.length)origin=cells.reduce((best,q)=>Math.hypot(q.x-origin.x,q.y-origin.y)<Math.hypot(best.x-origin.x,best.y-origin.y)?q:best,cells[0]);
  const id=origin.x+','+origin.y+':'+vertical;if(paths.has(id))return paths.get(id);
  const local=cells.filter(q=>Math.abs(q.x-origin.x)<=12&&Math.abs(q.y-origin.y)<=12&&lightingLineClear(room,origin,q,blocked)),path=pathForCells(local,vertical?-65:-8);
  if(paths.size>=CAVE_LIGHT_MASK_SPEC.maxSourcePaths)paths.delete(paths.keys().next().value);paths.set(id,path);return path;
 };
 const fogAnchors=cells.filter(q=>q.x%8===Math.abs(room.seed||0)%8&&(q.y+depth)%6===Math.abs(room.seed||0)%6).slice(0,6);
 return {key,scope,visible:room.visible,floorMask:room.floorMask,floor,reveal,cells,sources,fogAnchors,depth,sourcePath,
  contains:(x,y)=>{const p=grid(x,y);return accepts(room,p.x,p.y);},status:()=>({cells:cells.length,sourcePaths:paths.size,maxSourcePaths:CAVE_LIGHT_MASK_SPEC.maxSourcePaths})};
}
