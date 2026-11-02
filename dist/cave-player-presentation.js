import {beatTime,beatDuration} from './score.js';
import {hasAlbumClock} from './album-clock.js';
import {runBeatTime,runBeatDuration} from './training-clock.js';
import {musicFloor} from './frenzy.js';
import {gridFacing,PLAYER_ACTION_EVENT} from './player-action-resolution.js';
export const CAVE_STRIKE_BEAT_FRACTION=.4;
const directions=new Set(['right','left','up','down']);
const key=c=>c?JSON.stringify([c.attempt,c.mode,c.floor,c.roomSeed,c.section??null]):null;
export function caveActionContext(s){const r=s?.run;return r?.room?{attempt:s.attempts,mode:r.mode||'floors',floor:r.floor,roomSeed:r.room.seed,section:r.abyss?.section??null}:null;}
export function caveFacingFromWorld(a,b,previous='right'){const dy=(b.y-a.y)/32,dx=(b.x-a.x-4*dy)/44;if(Math.hypot(dx,dy)<1e-7)return previous;return gridFacing({x:0,y:0},{x:dx,y:dy})||previous;}
function routeIndex(route,sampleHop){const duration=sampleHop(route,0).duration,n=route.points.length-1,p=Math.max(0,Math.min(1,route.elapsed/duration))*n;return Math.max(0,Math.min(n-1,Math.ceil(p-1e-9)-1));}
function pointDirection(route,point,previous){for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;if(!d)continue;const t=((point.x-a.x)*dx+(point.y-a.y)*dy)/d;if(t>=-1e-7&&t<=1+1e-7&&Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy)<1e-5)return caveFacingFromWorld(a,b,previous);}return previous;}
function picture(direction,active,age,duration,{soft,pickTier,armorTier,giant,assetsReady,toolStatus=null,motionTime=0,walking=false},id=null,targetId=null){const native=!!assetsReady;return Object.freeze({direction,active,actionProgress:active?Math.min(1,age/duration):0,motionTime,walking,bodyPose:active&&!soft?'strike':'rest',toolPose:active?'strike':'rest',legacySwing:active?Math.max(0,1-age/duration):0,pickTier,armorTier,giant,toolWidth:giant?39:21,native,toolSource:toolStatus?.source??null,toolVersion:toolStatus?.version??null,toolReady:toolStatus?.ready??false,fallbackReason:!native?'body-loading':toolStatus&&!toolStatus.ready?'tool-'+toolStatus.status:null,actionId:id,targetId});}
export class CavePlayerPresentation{
 constructor(){this.reset();}
 reset(context=null){this.contextKey=key(context);this.pending=[];this.cue=null;this.direction='right';this.lastId=null;this.lastBeat=-Infinity;this.snapshot=null;this.routeIds=new WeakMap();this.trailPictures=new WeakMap();this.lastRoute=null;this.cancelCue=false;}
 onRoute(route,actionId){if(route){this.routeIds.set(route,actionId||null);this.lastRoute=route;}}
 accept(events,currentRoute){
  for(const e of events){if(e.type==='scroll'&&this.lastRoute&&this.lastRoute!==currentRoute)for(const p of this.lastRoute.points){p.x-=4;p.y-=32;}
   if(e.type==='dash'&&!e.actionId)this.cancelCue=true;
   if(e.type!==PLAYER_ACTION_EVENT||e.version!==1||typeof e.id!=='string'||!Number.isFinite(e.phase)||!Number.isFinite(e.clockFloor)||!Number.isInteger(e.beat))continue;
   this.pending.push({id:e.id,contextKey:key(e.context),beat:e.beat,phase:e.phase,clockFloor:e.clockFloor,gesture:e.interaction?.gesture,direction:directions.has(e.interaction?.direction)?e.interaction.direction:null,movementDirection:directions.has(e.movement?.direction)?e.movement.direction:null,outcome:e.interaction?.outcome,targetId:e.interaction?.target?.id??null});
   this.pending=this.pending.slice(-4);
  }
 }
 sample(s,time,{paused=false,route=null,previousRoute=null,trail=[],sampleHop,...appearance}={}){
  const context=key(caveActionContext(s));if(context!==this.contextKey){this.contextKey=context;this.cue=null;this.lastId=null;this.lastBeat=-Infinity;this.direction='right';this.snapshot=null;}
  if(!s.run){this.pending=[];this.cue=null;return this.snapshot=picture(this.direction,false,0,1,appearance);}
  if(paused)return this.snapshot??=picture(this.direction,false,0,1,appearance);
  if(this.cancelCue){this.cue=null;this.cancelCue=false;}
  for(const e of this.pending){if(e.contextKey!==context||e.clockFloor!==musicFloor(s.run)||e.id===this.lastId||e.beat<=this.lastBeat)continue;this.lastId=e.id;this.lastBeat=e.beat;
   if(!route&&e.movementDirection)this.direction=e.movementDirection;
   if(!route&&e.direction)this.direction=e.direction;
   // The first draw may already have finished the route; reduced mode also removes it in consume.
   const matchedRoute=[route,previousRoute,this.lastRoute].some(r=>r&&this.routeIds.get(r)===e.id);
   this.cue=e.gesture==='strike'?{...e,start:matchedRoute?null:hasAlbumClock(s.run)?runBeatTime(s.run,e.phase):beatTime(e.clockFloor,e.phase),duration:(hasAlbumClock(s.run)?runBeatDuration(s.run,e.beat):beatDuration(e.clockFloor,e.beat))*CAVE_STRIKE_BEAT_FRACTION}:null;
  }this.pending=[];
  if(previousRoute?.points.length>1){const i=routeIndex(previousRoute,sampleHop);this.direction=caveFacingFromWorld(previousRoute.points[i],previousRoute.points[i+1],this.direction);}
  if(this.cue?.start===null&&(!route||this.routeIds.get(route)!==this.cue.id))this.cue.start=time;
  const cue=this.cue,age=cue?.start!=null?Math.max(0,time-cue.start):0,active=!!cue&&cue.start!==null&&age<cue.duration;
  if(active&&cue.direction)this.direction=cue.direction;
  if(cue&&cue.start!==null&&!active)this.cue=null;
  this.snapshot=picture(this.direction,active,age,cue?.duration||1,{...appearance,motionTime:time,walking:!!route&&!appearance.soft},active?cue.id:null,active?cue.targetId:null);
  const historyRoute=previousRoute||this.lastRoute;
  for(const p of trail)if(!this.trailPictures.has(p)){const facing=historyRoute?pointDirection(historyRoute,p,this.direction):this.direction;this.trailPictures.set(p,picture(facing,false,0,1,appearance,this.lastId));}
  if(!route)this.lastRoute=null;return this.snapshot;
 }
 trailPicture(sample){return this.trailPictures.get(sample)||this.snapshot;}
}

// Only the actually adjacent rendered target can split DOWN body/tool depth.
export function caveFrontTarget(entities,ground,picture,project){if(!picture?.native||picture.direction!=='down')return null;return entities.find(n=>{if(!['rock','crystal','enemy'].includes(n.type)||picture.targetId!=null&&n.id!==picture.targetId)return false;const p=project(n.x,n.y);return Math.abs(p.x-ground.x-4)<1&&Math.abs(p.y-ground.y-32)<1;})||null;}
