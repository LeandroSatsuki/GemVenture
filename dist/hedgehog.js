import {isFloor,visible,explored} from './cavern.js';

export const HEDGEHOG_ID='hedgehog';
export const HEDGEHOG_RULES=Object.freeze({perHit:3,budget:9,cooldown:6,maxLive:64,maxNodes:180,sadBeats:2,recoverBeats:1});
export function hedgehogApproaches(room){
 const h=room?.hedgehog;if(!h)return [];
 const out=[];for(let x=h.x-3;x<=h.x+3;x++){const y=h.y+1;if(isFloor(room,x,y)&&!room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===x&&n.y===y))out.push({x,y});}return out;
}
export function hedgehogVisible(room){const h=room?.hedgehog;return !!h&&!(room.abyssCave?.version===1&&h.x===0)&&(visible(room,h)||hedgehogApproaches(room).some(p=>visible(room,p)));}
export function hedgehogTarget(room){
 const h=room?.hedgehog;return h&&hedgehogVisible(room)?{id:HEDGEHOG_ID,type:'hedgehog',x:h.x,y:h.y}:null;
}
export function hedgehogHitTest(room,point,project){
 const target=hedgehogTarget(room);if(!target)return null;const p=project(target.x,target.y);
 // The body is inside the wall above its ground support, not on the walkable floor.
 return Math.hypot((point.x-p.x)/137,(point.y-(p.y-112))/109)<=1?target:null;
}
export function reachableHedgehogApproaches(room){return hedgehogApproaches(room).filter(p=>explored(room,p));}
export function hedgehogWindow(run){return run.mode==='abyss'?Math.max(0,(run.abyss?.section||1)-1):0;}
export function hedgehogStatus(run,beat=Math.max(run.beat,run.acted)){
 const g=run.room.hedgehogGrowth,remaining=HEDGEHOG_RULES.budget-(g?.window===hedgehogWindow(run)?g.spawned:0);
 return remaining<=0?'rest':beat<(g?.nextBloomBeat??-1)?'cooldown':run.room.nodes.filter(n=>n.hp>0).length>=HEDGEHOG_RULES.maxLive||run.room.nodes.length>=HEDGEHOG_RULES.maxNodes?'full':'ready';
}
export function validHedgehogGrowth(room){
 const g=room?.hedgehogGrowth;if(g===undefined)return true;
 return !!g&&g.version===1&&Number.isSafeInteger(g.window)&&g.window>=0&&Number.isSafeInteger(g.spawned)&&g.spawned>=0&&g.spawned<=HEDGEHOG_RULES.budget&&Number.isSafeInteger(g.hits)&&g.hits>=0&&Number.isSafeInteger(g.lastHitBeat)&&g.lastHitBeat>=-1&&Number.isSafeInteger(g.nextBloomBeat)&&g.nextBloomBeat>=-1;
}
export function hedgehogMood(growth,phase,reduced=false){
 const age=phase-(growth?.lastHitBeat??-1e6),sad=age>=0&&age<HEDGEHOG_RULES.sadBeats,recover=age>=HEDGEHOG_RULES.sadBeats&&age<HEDGEHOG_RULES.sadBeats+HEDGEHOG_RULES.recoverBeats;
 const tuck=sad?Math.min(1,age/.18):recover?1-(age-HEDGEHOG_RULES.sadBeats)/HEDGEHOG_RULES.recoverBeats:0;
 return {state:sad?'sad':recover?'recover':'dance',tuck:reduced?(sad?1:0):tuck,contact:age>=0&&age<.18};
}
