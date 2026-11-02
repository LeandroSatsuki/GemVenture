import {sampleRefugeLiftIdle} from './refuge-idles.js';
import {drawLiftLayers} from './lift-layer-draw.js';
export const LIFT_PART_ROLES=Object.freeze(['fixed','cabin','rope','socket','front']);
export function liftLayersReady(layers,sourceToCache){
  if(!Number.isFinite(sourceToCache)||sourceToCache<=0)return false;
  const width=Math.ceil(1263*sourceToCache),height=Math.ceil(1246*sourceToCache);
  return LIFT_PART_ROLES.every(role=>{const im=layers?.[role];return im&&im.complete!==false&&im.width===width&&im.height===height;});
}
// No clock/loader/masks: uses the frozen sampler and supplied decoded caches.
export function paintRefugeLift(c,{layers,sourceToCache,paintStatic},{x,y,width=105,time=0,reduced=false,soft=false,poseOverride}={}){
  if(![x,y,width].every(Number.isFinite)||width<=0)return {painted:false,mode:'invalid-placement',dy:0};
  if(!liftLayersReady(layers,sourceToCache)){
    paintStatic?.(c,{x,y,width});return {painted:typeof paintStatic==='function',mode:'static-fallback',dy:0};
  }
  const pose=poseOverride?{...poseOverride,dy:poseOverride.dy*width/105}:sampleRefugeLiftIdle({time,width,reduced,soft});
  drawLiftLayers(c,layers,{x,y,width,dyLocal:pose.dy,sourceToCache});
  return {painted:true,mode:'provisional-layers',...pose};
}
