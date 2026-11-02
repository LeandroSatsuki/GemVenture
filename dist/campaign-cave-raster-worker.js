import {createExpeditionRenderer} from './campaign-cave-surface.js';
import {paintPilotWall,traceBurrowArch} from './campaign-cave-walls.js';
import {createTerrainPainter,normalizeTerrainMask,traceTerrainTile,paintTerrainMotion} from './campaign-cave-terrain.js';
let surface=null;
function transferChunk(chunk){
 const transfers=[],bitmap=canvas=>{const image=canvas.transferToImageBitmap();transfers.push(image);canvas.width=1;return image;};
 const terrainPlan={count:chunk.terrainPlan.count,groups:chunk.terrainPlan.groups.map(g=>({type:g.type,cells:g.cells}))};
 const data={key:chunk.key,x:chunk.x,y:chunk.y,w:chunk.w,h:chunk.h,rasterBytes:chunk.rasterBytes,canvas:bitmap(chunk.canvas),walls:chunk.walls.map(({canvas,faces,...rest})=>({...rest,canvas:bitmap(canvas)})),shadows:[],terrainRasters:chunk.terrainRasters.map(({canvas,...rest})=>({...rest,canvas:bitmap(canvas)})),terrainPlan};
 return {data,transfers};
}
self.onmessage=({data})=>{
 try{
  if(data.type==='init'){
   if(typeof OffscreenCanvas!=='function'||typeof Path2D!=='function')throw Error('Worker Canvas 2D unavailable');
   const makeCanvas=(w,h)=>new OffscreenCanvas(w,h),population={all:[],byChunk:new Map()};
   const runtime={makeCanvas,images:new Map(),material:data.material,paintPilotWall,traceBurrowArch,createTerrainPainter,normalizeTerrainMask,traceTerrainTile,paintTerrainMotion,population,ledger:{removed:new Set()},mineralShadows:false,skipBurrow:true};
   surface=createExpeditionRenderer(runtime,data.world,data.wallGroups,null);self.postMessage({type:'ready'});return;
  }
  if(data.type==='chunk'){
   if(!surface)throw Error('Raster worker not initialized');const start=performance.now(),job=surface.createJob(data.key);let result;do{result=job.next();}while(!result.done);const {data:chunk,transfers}=transferChunk(result.value);self.postMessage({type:'chunk',id:data.id,key:data.key,chunk,elapsed:performance.now()-start},transfers);
  }
 }catch(error){self.postMessage({type:'fatal',error:String(error.message||error)});}
};
