import {paintVfxEmission} from './vfx-emission.js';
import {P} from './palette.js';
import {CAVE_PLAYER_POSES as POSES,CAVE_PLAYER_TOOL as TOOL} from './cave-player-manifest.js';
import {caveRightPlacement} from './cave-player-art.js';

export const TITAN_VFX_SPEC=Object.freeze({entrySeconds:.32,steadyRadius:2.6,strikeRadius:4.7,entryRadius:8,chipCount:3,maxLocalRadius:20});
const finite=n=>typeof n==='number'&&Number.isFinite(n),clamp=n=>Math.max(0,Math.min(1,n));
// These are the existing tool transforms, never a new hit/contact coordinate.
export function titanToolAnchor(bodyWorld,picture){
 if(!bodyWorld||![bodyWorld.x,bodyWorld.y].every(finite))return null;
 const x=bodyWorld.x/2,y=bodyWorld.y/2,width=picture?.toolWidth||39;
 if(picture?.native){const pose=POSES[picture.direction+'-'+picture.bodyPose],tool=POSES[picture.direction+'-'+picture.toolPose];if(!pose||!tool)return null;
  const ground=caveRightPlacement(x,y),angle=tool.toolAngleRadians,scale=width/1200,dx=(TOOL.tip[0]-TOOL.grip[0])*scale,dy=(TOOL.tip[1]-TOOL.grip[1])*scale;
  return{x:ground.x+pose.handAnchorLocal[0]+dx*Math.cos(angle)-dy*Math.sin(angle),y:ground.y+pose.handAnchorLocal[1]+dx*Math.sin(angle)+dy*Math.cos(angle),angle,native:true};
 }
 const angle=-.3-(picture?.legacySwing||0),dx=1+(13-50)*width/100,dy=6+(40-96)*width/100;
 return{x:x+10+dx*Math.cos(angle)-dy*Math.sin(angle),y:y-9+dx*Math.sin(angle)+dy*Math.cos(angle),angle,native:false};
}
function star(c,r,color){c.fillStyle=color;c.beginPath();c.moveTo(0,-r);c.lineTo(r*.22,-r*.22);c.lineTo(r,0);c.lineTo(r*.22,r*.22);c.lineTo(0,r);c.lineTo(-r*.22,r*.22);c.lineTo(-r,0);c.lineTo(-r*.22,-r*.22);c.closePath();c.fill();}
export function createPlayerTitan(){
 let emission=[],emissionAt=-Infinity,pending=false,entryAt=null,lastDeadline=null,wasActive=false,seen=new WeakSet();
 const clear=()=>{emission=[];emissionAt=-Infinity;pending=false;entryAt=null;lastDeadline=null;wasActive=false;seen=new WeakSet();};
 function consume(events){for(const e of events)if(e?.type==='boost'&&e.id==='giant'&&!seen.has(e)){seen.add(e);pending=true;}}
 function sample({active,deadline,time,picture,soft=false}){
  if(!finite(time)||time<0)return null;
  if(!active){pending=false;entryAt=null;wasActive=false;lastDeadline=deadline;return null;}
  if(pending&&(!wasActive||deadline!==lastDeadline))entryAt=time;
  pending=false;wasActive=true;lastDeadline=deadline;
  const u=entryAt===null?1:clamp((time-entryAt)/TITAN_VFX_SPEC.entrySeconds),entry=soft?0:Math.sin(Math.PI*u),strike=!soft&&!!picture?.active;
  return{entry,u,strike,soft:!!soft,radius:soft?2.6:Math.max(TITAN_VFX_SPEC.steadyRadius,strike?TITAN_VFX_SPEC.strikeRadius:0,entry*TITAN_VFX_SPEC.entryRadius),alpha:soft?.55:Math.max(.48,strike?.85:0,entry*.95)};
 }
 function draw(c,{bodyWorld,picture,active,deadline,time,soft=false}){
  emission=[];
  const frame=sample({active,deadline,time,picture,soft}),anchor=titanToolAnchor(bodyWorld,picture);if(!frame||!anchor)return false;
  emissionAt=time;emission=[{x:anchor.x,y:anchor.y,radius:frame.radius+5,alpha:frame.alpha,color:P.lemon}];paintVfxEmission(c,emission,{soft});
  c.save();c.translate(anchor.x,anchor.y);c.rotate(anchor.angle-.35);c.globalAlpha*=frame.alpha;
  star(c,frame.radius+1,P.ink);star(c,frame.radius,P.gold);star(c,frame.radius*.52,P.lemon);
  if(frame.entry>.02&&!frame.soft)for(const a of [-2.2,-.5,1]){const d=8+frame.u*9,s=1.5*(1-frame.u)+.5;c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);c.rotate(a);c.globalAlpha*=frame.entry;c.fillStyle=P.gold;c.beginPath();c.moveTo(-s,0);c.lineTo(0,-s*.55);c.lineTo(s*1.6,0);c.lineTo(0,s*.55);c.closePath();c.fill();c.restore();}
  c.restore();return true;
 }
 return Object.freeze({clear,consume,sample,draw,emissionSources:time=>time>=emissionAt&&time-emissionAt<=.06?emission:[]});
}
