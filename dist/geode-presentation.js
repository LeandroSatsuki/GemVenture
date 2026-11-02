import {geodePose} from './geode-rig.js';

// Read-only presentation. The engine alone schedules and resolves each attack.
export class GeodePresentation{
 constructor(){this.reset();}
 reset(){this.context=null;this.bossId=null;this.windup=null;this.pulseId=null;this.impact=null;this.hit=null;this.seen=new Set();this.visualBeat=null;}
 capture(run,attempt=0,seed=0){
  const b=run?.mode!=='abyss'&&run?.room?.enemies?.find(e=>e.boss&&e.bossIndex===0&&e.hp>0);
  const key=b?[attempt,run.mode,run.floor,run.room.seed,b.id].join(':'):null;
  if(key!==this.context){this.reset();this.context=key;}
  if(!b)return;
  this.bossId=b.id;
  if(b.windup?.geode){this.windup={...b.windup};this.pulseId='geode-pulse:'+JSON.stringify([seed,attempt,run.mode||'floors',run.floor,run.room.seed,b.id,b.windup.startedBeat,b.windup.beat]);}
 }
 accept(events,age=0){
  if(this.bossId==null)return;
  const remember=key=>{if(this.seen.has(key))return false;this.seen.add(key);if(this.seen.size>32)this.seen.delete(this.seen.values().next().value);return true;};
  for(const e of events){
   if(e.type==='geodePulse'&&e.version===1&&e.bossIndex===0&&e.sourceId===this.bossId&&this.windup?.geodePulse&&e.id===this.pulseId&&e.scheduledBeat===this.windup.beat&&e.startedBeat===this.windup.startedBeat&&e.x===this.windup.x&&e.y===this.windup.y&&Array.isArray(e.tiles)&&remember('pulse:'+e.id))this.impact={state:'pulse-impact',age,bossId:this.bossId};
   if(e.type==='geodeEruption'&&this.windup?.geode&&!this.windup.geodePulse&&e.x===this.windup.x&&e.y===this.windup.y&&remember('pillar:'+this.bossId+':'+this.windup.beat))this.impact={state:'pillar-impact',age,bossId:this.bossId};
   if(e.type==='hit'&&e.targetType==='enemy'&&e.bossIndex===0&&e.targetId===this.bossId&&Number.isInteger(e.beat)&&Number.isFinite(e.actualDamage)&&e.actualDamage>0&&remember('hit:'+this.bossId+':'+e.beat))this.hit={age,damage:e.actualDamage};
  }
 }
 sample(boss,{age=0,visualBeat=0,ambient=age,soft=false,paused=false}={}){
  if(paused&&this.visualBeat!==null)visualBeat=this.visualBeat;else this.visualBeat=visualBeat;
  let state='idle',progress=0,poseAge=0;
  const w=boss.windup;
  if(w?.geode){state=w.geodePulse?'pulse-charge':'pillar-charge';progress=Math.max(0,Math.min(1,(visualBeat-w.startedBeat)/Math.max(1,w.beat-w.startedBeat)));poseAge=progress*Math.max(1,w.beat-w.startedBeat);}
  const elapsed=this.impact?Math.max(0,age-this.impact.age):Infinity;
  if(this.impact?.bossId===boss.id&&elapsed<.26){state=this.impact.state;poseAge=elapsed;}
  const pose=geodePose({state,progress,age:poseAge,ambient,soft});
  const hitAge=this.hit?Math.max(0,age-this.hit.age):Infinity;
  if(hitAge<.18){const hit=geodePose({state:'hit',age:hitAge,ambient,soft,confirmedDamage:this.hit.damage});pose.dx+=hit.dx;pose.flash=hit.flash;}
  return {state,progress,pose,visualBeat,grounded:pose.dy===0};
 }
}
