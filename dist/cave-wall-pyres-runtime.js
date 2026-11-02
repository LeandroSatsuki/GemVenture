import {planWallPyres,wallPyreLight} from './cave-wall-pyres-plan.js';
// One bounded instance per scene, disposed with that scene. Nothing is serialized.
export function createWallPyres(){
 let room=null,mask=null,material=null,key='',plan={items:[],scanned:0,candidates:0,truncated:0},disposed=false;
 return {
  prepare(next,options){if(disposed)return [];const v=options.view,center=[Math.round(v.center[0]/22)*22,Math.round(v.center[1]/16)*16],k=[options.depth||0,options.biome,...center,v.width,v.height,next.hedgehog?.x,next.hedgehog?.y].join(':');if(next!==room||mask!==next.floorMask||material!==options.material||key!==k){room=next;mask=next.floorMask;material=options.material;key=k;plan=planWallPyres(next,{...options,view:{...v,center,width:v.width+64,height:v.height+64}});}return plan.items;},
  invalidate(){key='';},
  lights(options={}){return disposed?[]:plan.items.map(item=>wallPyreLight(item,options));},
  status(){return {disposed,instances:plan.items.length,scanned:plan.scanned,candidates:plan.candidates,truncated:plan.truncated,rasterCaches:0};},
  dispose(){disposed=true;room=null;mask=null;material=null;key='';plan={items:[],scanned:0,candidates:0,truncated:0};}
 };
}
