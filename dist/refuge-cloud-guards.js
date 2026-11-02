import {FLOW_PROPS,flowBounds} from './flow-village.js';
import {REFUGE_HOTSPOTS} from './refuge-scene.js';
// Bounds come from the current consumer in local coordinates, never the preview layout.
export function refugeCloudGuards(player){
 const guards=[];for(const [type,x,y,width]of FLOW_PROPS){const b=flowBounds(type,width);if(!b){guards.push({kind:'unavailable',left:-2000,top:-2000,right:3000,bottom:3000});continue;}guards.push({left:x+b.left-16,right:x+b.right+16,top:y+b.top-16,bottom:y+b.bottom+16});}
 for(const h of REFUGE_HOTSPOTS)guards.push({left:(h.x-h.w/2)/2-8,right:(h.x+h.w/2)/2+8,top:(h.y-h.h/2)/2-8,bottom:(h.y+h.h/2)/2+8});
 guards.push({kind:'player',left:player.x-28,right:player.x+28,top:player.y-52,bottom:player.y+12});return guards;
}
