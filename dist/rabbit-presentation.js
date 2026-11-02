import{polishedPose,paintPolishedRabbit,paintPolishedBurrow,paintSwingTrail,paintDizzy,paintRabbitStrikeFx}from'./rabbit-polished.js';
import {paintDirectionalRabbit,rabbitDirection} from './dungeon-rabbit.js';
import {rabbitMechanicActive} from './rabbit-mechanic.js';
import {paintCarrotTelegraph} from './carrot-telegraph-art.js';
import {loadRabbitArt,rabbitArtStatus,rabbitArtRig} from './rabbit-art.js';
import {rabbitPose,paintRabbit,paintRabbitBase,paintRabbitChildFigure,paintRabbitCubes,rabbitChildEmergence} from './rabbit-rig.js';
import {createRabbitImpactVfx,planRabbitCompatibility,rabbitContactAnchors,isRabbitVfxEvent} from './rabbit-impact-vfx.js';
const clamp=n=>Math.max(0,Math.min(1,n)),finite=Number.isFinite;
const scene=s=>s?.run?JSON.stringify([s.seed,s.attempts,s.run.mode||'floors',s.run.floor,s.run.room?.seed]):null;
const bossFor=s=>s?.run?.room?.enemies?.find(n=>rabbitMechanicActive(n));
export class RabbitPresentation{
 constructor(){this.vfx=createRabbitImpactVfx();this.context=null;this.pending=[];this.phase=null;this.time=0;this.soft=false;this.warningHandled=new Set();this.carrot=null;void loadRabbitArt();}
 place(s){const boss=bossFor(s);this.scene=scene(s);this.context=boss?{scene:this.scene,bossId:boss.id,prefix:[2,s.seed,s.attempts,s.run.mode||'floors',s.run.floor,s.run.room.seed,boss.id]}:null;this.state=s;this.pending=[];this.phase=null;this.carrot=null;this.lastFacing=null;this.lastStrikeBeat=-1;this.warningHandled.clear();this.vfx.clear();}
 sync(s){if(scene(s)!==this.scene||!this.context&&bossFor(s))this.place(s);this.state=s;}
 ready(){return true;}
 isR2Boss(n){return !!this.context&&n?.id===this.context.bossId&&rabbitMechanicActive(n);}
 isR2Child(n){return !!this.context&&n?.parentBoss===this.context.bossId&&n.rabbitChild!==undefined;}
 accepts(e){if(!this.context||!rabbitEventInArena(e,this.state?.run?.room)||e?.version!==2||typeof e.id!=='string'||e.id.length>=1024||!e.id.startsWith(e.type+':')||e.sourceId!==this.context.bossId)return false;try{const id=JSON.parse(e.id.slice(e.type.length+1));return Array.isArray(id)&&this.context.prefix.every((value,i)=>id[i]===value);}catch{return false;}}
 queue(events){
  if(!this.context)return null;
  const scoped=events.map(e=>e?.version===2&&e.type?.startsWith('rabbit')&&!this.accepts(e)?{type:'ignoredRabbitContext'}:e),emit=this.ready();
  const plan=emit?planRabbitCompatibility(scoped):null;this.pending.push({events:scoped.slice(-512),emit});if(this.pending.length>16)this.pending.shift();
  return plan;
 }
 beginFrame(s,{time,musicTime,visualBeat,beatTime,project,soft=false,paused=false}={}){
  this.sync(s);this.warningHandled.clear();this.time=time;this.soft=!!soft;this.project=project;this.beatTime=beatTime;
  if(!this.context)return;
  const phase=Math.max(s.run.beat||0,finite(visualBeat)?visualBeat:0);if(this.phase===null||!paused)this.phase=phase;
  for(const batch of this.pending){if(!batch.emit||!this.ready()){this.vfx.prime(batch.events);continue;}this.vfx.consume(batch.events,{project,time,musicTime,beatTime,bossWidth:92});for(const e of batch.events)if(this.accepts(e)&&e.type==='rabbitCarrotImpact'&&isRabbitVfxEvent(e)){if(e.scheduledBeat>=(this.lastStrikeBeat??-1)){this.lastFacing=e.direction;this.lastStrikeBeat=e.scheduledBeat;}const age=Math.max(0,musicTime-beatTime(e.scheduledBeat));if(age<.55)this.carrot={scheduledBeat:e.scheduledBeat,origin:e.origin,target:{...e.target},tiles:e.tiles,direction:e.direction,start:time-age};}}
  this.pending=[];this.vfx.update(time);if(this.carrot&&time-this.carrot.start>=.55)this.carrot=null;
 }
 hasCustomWarning(n){return this.warningHandled.has(n.id);}
 drawWarning(c,n){
  if(!this.isR2Boss(n)||n.windup?.rabbitAim!==2)return false;
  if(n.hp<=0){this.warningHandled.add(n.id);return true;}
  const w=n.windup,ok=paintCarrotTelegraph(c,{center:w.aim||{x:w.x,y:w.y},direction:w.direction,tiles:w.tiles,phase:'warning',fade:1,remaining:w.beat-this.phase,beat:this.phase,soft:this.soft},{project:p=>{const q=this.project(p.x,p.y);return{x:q.x/2,y:q.y/2};}});
  if(ok)this.warningHandled.add(n.id);return ok;
 }
 drawFloor(c){if(this.context)paintRabbitStrikeFx(c,this.carrot,this.phase,this.project,this.soft);}
 activeBoss(){return this.state?.run?.room.enemies.find(n=>this.isR2Boss(n))||null;}
 vulnerable(b){return !!b?.rabbitMutiny?.impactApplied&&this.phase>=b.rabbitMutiny.impactBeat&&b.rabbitWindowUntil>=Math.max(this.state.run.beat,this.state.run.acted);}
 poseForBoss(b,x,y){const hit=this.vfx.sampleBossHit(b.id,this.time);return polishedPose(b,this.phase,{soft:this.soft,cue:this.carrot,hit:hit&&hit.actualDamage>0?hit.age:0});}
 flight(n){
  const boss=this.activeBoss(),m=boss?.rabbitMutiny;if(!this.isR2Child(n)||!boss||boss.hp<=0||!m?.childIds.includes(n.id))return null;
  let p=clamp((this.phase-m.startedBeat)/(2*(m.impactBeat-m.startedBeat)));if(!m.impactApplied)p=Math.min(p,.499);if(p<=0||p>=1)return null;
  const start=this.project(n.x,n.y),ground={x:start.x/2,y:start.y/2},b=this.project(boss.x,boss.y),contacts=rabbitContactAnchors({x:b.x/2,y:b.y/2},92),index=m.childIds.indexOf(n.id),target=contacts[index],mid=clamp((p-.12)/.76),travel=mid<.5?mid*2:(1-mid)*2;
  return {p,ground,x:ground.x+(target.x-ground.x)*travel,y:ground.y+(target.y-ground.y)*travel-(this.soft?0:Math.sin(Math.PI*travel)*22),tilt:this.soft?0:Math.sin(Math.PI*travel)*.1*(index-1),emergence:rabbitChildEmergence(p)};
 }
 paintEntity(c,n,{x,y,label}={}){
  if(this.isR2Boss(n)){const pose=this.poseForBoss(n,x,y),direction=pose.state==='impact'&&this.carrot?.direction?this.carrot.direction:pose.stunned&&this.lastFacing?this.lastFacing:rabbitDirection(n,this.state.run.player);this.lastFacing=direction;if(c.canvas?.dataset)Object.assign(c.canvas.dataset,{rabbitFacing:direction,rabbitPose:pose.state,rabbitArtBeat:String(this.phase)});paintPolishedBurrow(c,{x,y,width:92});paintSwingTrail(c,{x,y,width:92,direction,pose,soft:this.soft});paintPolishedRabbit(c,{x,y,width:92,direction,pose});paintPolishedBurrow(c,{x,y,width:92,foreground:true});if(pose.stunned)paintDizzy(c,x,y,92,this.phase,this.soft);return true;}
  if(!this.isR2Child(n))return false;const air=this.flight(n);paintPolishedBurrow(c,{x,y,width:42});if(!air){const pose={headRoll:this.soft?0:Math.sin(this.phase*Math.PI)*.025,headNod:n.stunned?.13:0,earLeft:0,earRight:0,blink:n.stunned};paintPolishedRabbit(c,{kind:'child',x,y,width:42,pose,emergence:0});if(n.stunned)paintDizzy(c,x,y+9,42,this.phase,this.soft);}else if(air.emergence<.999)this.paintFlight(c,null,n,air,true);paintPolishedBurrow(c,{x,y,width:42,foreground:true});return true;
 }
 paintFlight(c,rig,n,a,lip=false){const boss=this.activeBoss(),pose={headRoll:this.soft?0:a.tilt,headNod:0,earLeft:this.soft?0:-.13,earRight:this.soft?0:.13};paintPolishedRabbit(c,{kind:'child',x:a.x,y:a.y,width:42,direction:rabbitDirection(n,boss),pose,emergence:a.emergence});if(lip)paintPolishedBurrow(c,{x:a.ground.x,y:a.ground.y,width:42,foreground:true});}
 drawFront(c){if(!this.context)return;const children=this.state.run.room.enemies.filter(n=>n.hp>0&&this.isR2Child(n)).map(n=>({n,air:this.flight(n)})).filter(v=>v.air).sort((a,b)=>a.air.y-b.air.y);for(const{n,air}of children)if(air.emergence>=.999)this.paintFlight(c,null,n,air);}
 status(){return {context:this.context?.scene||null,bossId:this.context?.bossId??null,ready:this.ready(),pendingBatches:this.pending.length,phase:this.phase,time:this.time,transients:this.vfx.status(),art:rabbitArtStatus()};}
}

function rabbitEventInArena(e,room){if(!room)return false;const p=q=>q&&Number.isInteger(q.x)&&Number.isInteger(q.y)&&q.x>=1&&q.x<room.cols-1&&q.y>=1&&q.y<room.rows-1;return (!e.target||p(e.target))&&(!e.origin||p(e.origin))&&(!e.tiles||Array.isArray(e.tiles)&&e.tiles.every(p))&&(!e.children||Array.isArray(e.children)&&e.children.every(p));}
