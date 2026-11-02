import {campaignCaveProfile} from './campaign-cave-profile.js';
import {usesStairs,stairReady} from './cave-descent.js';
// Presentation roles only. Boss arenas have an exit marker, never a cabin.
import {isFloor} from './cave-layout.js';
import {roomSize} from './cavern.js';
import {isBossFloor} from './bosses.js';
const projectHalf=(x,y)=>({x:50+22*x+2*y,y:57.5+16*y});
const bossRoom=run=>!!run&&(isBossFloor(run.floor)||!!run.room?.bossFloor);
export const ARRIVAL=Object.freeze({spawn:Object.freeze({x:3,y:11}),doorstep:Object.freeze({x:1,y:11}),mount:Object.freeze({x:0,y:11}),envelope:Object.freeze({left:-47,right:2,top:-50,bottom:6})});
export function floorOverlap(room,rect){const {cols,rows}=roomSize(room);for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(isFloor(room,x,y)){const p=projectHalf(x,y);if(rect.left<p.x+12&&rect.right>p.x-12&&rect.top<p.y+8&&rect.bottom>p.y-8)return {x,y};}return null;}
export function bossExitPlan(run){
 if(!run||run.mode==='abyss'||!run.room||!bossRoom(run))return null;
 const room=run.room;return {kind:'boss-exit-only',exit:{...(room.exit||{x:18,y:2})},exitHalf:projectHalf(room.exit?.x??18,room.exit?.y??2),exitActive:usesStairs(run)?stairReady(run):!!room.cleared,collision:false,interactive:false};
}
export function arrivalPlan(run){
 if(!run||run.mode==='abyss'||bossRoom(run))return {enabled:false,reason:'outside-common-floor-scope'};
 const room=run.room;if(!room)return {enabled:false,reason:'missing-room'};
 if(room.campaignCave?.version===1&&[2,3].includes(room.layout?.version)){if(!campaignCaveProfile(room))return {enabled:false,reason:'unknown-room-geometry'};const spawn=room.layout.spawn;if(!spawn)return {enabled:false,reason:'missing-campaign-entry'};let x=spawn.x;while(isFloor(room,x-1,spawn.y))x--;const mount={x:x-1,y:spawn.y},mountHalf=projectHalf(mount.x,mount.y),e=ARRIVAL.envelope;return {enabled:true,spawn:{...spawn},doorstep:{x,y:spawn.y},mount,mountHalf,bounds:{left:mountHalf.x+e.left,right:mountHalf.x+e.right,top:mountHalf.y+e.top,bottom:mountHalf.y+e.bottom},wallClipRequired:true,collision:false,interactive:false,exit:{...room.exit},exitHalf:projectHalf(room.exit.x,room.exit.y),exitActive:usesStairs(run)?stairReady(run):!!room.cleared};}
const {cols,rows}=roomSize(room);if(![[42,30],[21,15]].some(([x,y])=>cols===x&&rows===y))return {enabled:false,reason:'unknown-room-geometry'};
 if(![ARRIVAL.spawn,ARRIVAL.doorstep,{x:2,y:11}].every(p=>isFloor(room,p.x,p.y)))return {enabled:false,reason:'entry-geometry-not-compatible'};
 const p=projectHalf(ARRIVAL.mount.x,ARRIVAL.mount.y),e=ARRIVAL.envelope,bounds={left:p.x+e.left,right:p.x+e.right,top:p.y+e.top,bottom:p.y+e.bottom};
 if(floorOverlap(room,bounds))return {enabled:false,reason:'art-envelope-overlaps-floor'};
 return {enabled:true,spawn:{...ARRIVAL.spawn},doorstep:{...ARRIVAL.doorstep},mount:{...ARRIVAL.mount},mountHalf:p,bounds,collision:false,interactive:false,exit:{...(room.exit||{x:18,y:2})},exitHalf:projectHalf(room.exit?.x??18,room.exit?.y??2),exitActive:usesStairs(run)?stairReady(run):!!room.cleared};
}
export function presentationSlots(run){
 if(!run||run.mode==='abyss')return [];
 const boss=bossExitPlan(run);if(boss&&usesStairs(run))return [{role:'exit-stair',at:boss.exit,locked:!stairReady(run),usesPhysicalStep:true}];
 if(boss)return boss.exitActive?[{role:'exit-marker',at:boss.exit,label:'↓ ABERTO',usesExistingExitClick:true}]:[];
 const plan=arrivalPlan(run);
 if(!plan.enabled)return [{role:'legacy-exit-lift',at:{...(run.room.exit||{x:18,y:2})},fallbackReason:plan.reason}];
 if(usesStairs(run))return [{role:'arrival-lift',at:plan.mount,interactive:false},{role:'exit-stair',at:plan.exit,locked:false,usesPhysicalStep:true}];
 return [{role:'arrival-lift',at:plan.mount,interactive:false},...(plan.exitActive?[{role:'exit-marker',at:plan.exit,label:'↓ ABERTO',usesExistingExitClick:true}]:[])];
}
