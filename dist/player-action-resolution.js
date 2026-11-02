// Presentation metadata only. Positions are logical ground cells, never a
// measured tool tip, collision normal, world projection or future hit timer.
export const PLAYER_ACTION_EVENT='playerActionResolved';
export function playerActionId(s,r,beat){
 return 'player-action:'+JSON.stringify([1,s.seed,s.attempts,r.mode||'floors',r.room.seed,r.floor,r.abyss?.section??null,beat]);
}
const point=p=>({x:p.x,y:p.y});
const vector=(from,to)=>({dx:to.x-from.x,dy:to.y-from.y});
export function gridFacing(from,to){
 const dx=to.x-from.x,dy=to.y-from.y;
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.abs(dx)===Math.abs(dy))return null;
 return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
}
function targetSnapshot(target){return target?{id:target.id,type:target.type||'unknown',...(Number.isInteger(target.kind)?{kind:target.kind}:{}),x:target.x,y:target.y,boss:!!target.boss,...(Number.isInteger(target.bossIndex)?{bossIndex:target.bossIndex}:{}),...(Number.isInteger(target.rabbitChild)?{rabbitChild:target.rabbitChild}:{}),...(Number.isInteger(target.parentBoss)?{parentBoss:target.parentBoss}:{})}:null;}
export function createPrimaryVisual(target){return{target:targetSnapshot(target),outcome:'no-effect',damage:0};}
export function emitPlayerAction(s,r,{id,action,beat,phase,clockFloor,from,travel,bumped,bumpVector,requested,intangible,primary}){
 const path=travel.map(point),to=point(r.player),target=primary?.target||targetSnapshot(requested);
 let direction=null;for(let i=path.length-1;i>=0;i--){direction=gridFacing(i?path[i-1]:from,path[i]);if(direction)break;}
 let gesture='none',outcome='none',attempted=false,damage=0,aim=null;
 if(primary){attempted=true;outcome=primary.outcome;damage=primary.damage;aim=target?vector(to,target):null;if(outcome==='damage'||outcome==='stun')gesture='strike';}
 else if(intangible){outcome='intangible';gesture=bumped?'bump':'none';aim=bumpVector?{...bumpVector}:null;}
 else if(action.type==='item'){gesture='item';outcome='item';}
 else if(action.type==='hit'){outcome=!requested?'missing-target':path.length?'approaching':'unreachable';gesture=bumped?'bump':'none';aim=bumpVector?{...bumpVector}:null;}
 else{outcome=bumped?'bump':path.length?'movement':'none';gesture=bumped?'bump':'none';aim=bumpVector?{...bumpVector}:null;}
 const event={type:PLAYER_ACTION_EVENT,version:1,id:id??playerActionId(s,r,beat),beat,phase,clockFloor,
  context:{attempt:s.attempts,mode:r.mode||'floors',floor:r.floor,roomSeed:r.room.seed,section:r.abyss?.section??null},
  input:action.type,movement:{from:point(from),to,path,direction},
  interaction:{gesture,outcome,attempted,damage,direction:aim?gridFacing({x:0,y:0},{x:aim.dx,y:aim.dy}):null,vector:aim,target,...(action.type==='item'?{item:action.item}:{} )}};
 r.events.push(event);return event;
}
export function reviseHedgehogAction(s,r,phase,result){
 if(!result.ok)return null;
 const id=playerActionId(s,r,Math.round(phase)),event=r.events.findLast(e=>e.type===PLAYER_ACTION_EVENT&&e.id===id);
 if(!event)return null;
 const h=r.room.hedgehog,target=h?{id:'hedgehog',type:'hedgehog',x:h.x,y:h.y,boss:false}:null;
 const hit=result.hedgehog&&Object.hasOwn(result,'spawned'),aim=hit&&target?vector(event.movement.to,target):null;
 event.input='hit';event.interaction={gesture:hit?'strike':result.blocked?'bump':'none',outcome:hit?'hedgehog':result.approaching?'approaching':result.blocked?'unreachable':'interrupted',attempted:!!hit,damage:0,direction:aim?gridFacing({x:0,y:0},{x:aim.dx,y:aim.dy}):null,vector:aim,target};
 return event;
}
