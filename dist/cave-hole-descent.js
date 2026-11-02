import {stairReady,usesStairs} from './cave-descent.js';

export function holeClickTarget(run,point,project){
 if(!stairReady(run)||run.room.cleared)return null;
 const exit=run.room.exit;if(run.room.explored&&!run.room.explored[exit.y*run.room.cols+exit.x])return null;
 const p=project(exit.x,exit.y),dx=(point.x-p.x)/62,dy=(point.y-p.y+6)/38;
 return dx*dx+dy*dy<=1?exit:null;
}

// This is transient presentation. Reloading an already completed room opens its
// existing completion UI; no animation timers or rewards are written to saves.
export class CaveHoleDescent{
 constructor(){this.reset();}
 reset(){this.phase='idle';this.age=0;this.anchor=null;this.completion=false;}
 begin(run,project){
  if(this.phase!=='idle'||!usesStairs(run)||!run.room.cleared||!run.room.stairDeparted)return false;
  this.anchor=project(run.room.exit.x,run.room.exit.y);this.phase='approach';return true;
 }
 get pending(){return this.phase==='approach'||this.phase==='fall';}
 get falling(){return this.phase==='fall'||this.phase==='done';}
 step(dt,{moving=false,paused=false,soft=false}={}){
  if(paused||!this.pending)return;
  if(this.phase==='approach'){if(moving)return;this.phase='fall';this.age=0;return;}
  this.age+=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.05));
  if(this.age>=(soft?.22:.64)){this.phase='done';this.completion=true;}
 }
 pose(soft=false){
  if(!this.falling)return null;
  const progress=this.phase==='done'?1:Math.min(1,this.age/(soft?.22:.64)),ease=progress*progress;
  return{progress,scale:soft?1:1-.82*ease,drop:soft?0:37*ease,tilt:soft?0:-.14*Math.sin(progress*Math.PI),alpha:Math.max(0,1-(soft?progress:Math.max(0,progress-.35)/.65))};
 }
 paint(c,draw,soft=false){
  const pose=this.pose(soft);if(!pose)return false;if(!pose.alpha)return true;
  const x=this.anchor.x/2,y=this.anchor.y/2;
  c.save();c.beginPath();c.rect(x-70,y-150,140,160);c.clip();
  c.translate(x,y+pose.drop);c.rotate(pose.tilt);c.scale(pose.scale,pose.scale);c.globalAlpha*=pose.alpha;draw();c.restore();return true;
 }
 takeCompletion(){const value=this.completion;this.completion=false;return value;}
}
