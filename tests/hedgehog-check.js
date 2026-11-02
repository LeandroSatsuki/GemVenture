// Real pointer/rhythm regression; use only on the separate QA origin.
import {World,project} from '/world.js';
import {hedgehogApproaches,hedgehogMood} from '/hedgehog.js';
import {beatPhase} from '/score.js';
import {musicFloor} from '/frenzy.js';
import {reveal} from '/cavern.js';
export function prepareHedgehogCheck(state){
 const r=state.run;r.room.rocks=[];r.room.nodes=[];r.room.enemies=[];r.room.wave=null;r.room.quota=99999;r.room.minBeats=9999;r.room.cleared=false;r.player=hedgehogApproaches(r.room)[3]||hedgehogApproaches(r.room)[0];
 r.room.terrain=Array(r.room.cols*r.room.rows).fill(0);r.events=[];r.elapsed=0;r.musicClock=2;r.beat=-1;r.acted=-1;r.enemyBeat=-1;reveal(r.room,r.player,9);
 const errors=[],results=[],beats=[1,2,7,13],draw=World.prototype.draw;let next=0,finished=false,settling=false;
 const report=document.createElement('output');report.id='hedgehogReport';report.style.cssText='position:fixed;left:12px;bottom:10px;z-index:99999;background:#180d2f;color:#e8ff75;padding:8px;font:13px monospace;pointer-events:none';document.body.append(report);
 addEventListener('error',e=>errors.push(e.message));
 World.prototype.draw=function(s,time,dt,...args){
  if(s.run){s.run.room.enemies=[];s.run.health=100;s.run.rhythm=100;}draw.call(this,s,time,dt,...args);
  const r=s.run;if(!r)return;const phase=beatPhase(musicFloor(r),time),beat=Math.round(phase);
  if(!args[2]&&!finished&&!settling&&beat===beats[next]&&Math.abs(phase-beat)<.045){
   const p=project(r.room.hedgehog.x,r.room.hedgehog.y),rect=this.canvas.getBoundingClientRect(),x=rect.left+this.offsetX+(p.x-this.camera.x)*this.scale,y=rect.top+this.offsetY+(p.y-100-this.camera.y)*this.scale,hit=document.elementFromPoint(x,y),combo=r.combo,before=r.room.hedgehogGrowth?.spawned||0;
   hit?.dispatchEvent(new PointerEvent('pointerdown',{button:0,clientX:x,clientY:y,bubbles:true}));
   results.push({beat,hit:hit?.id,combo:r.combo,spawned:(r.room.hedgehogGrowth?.spawned||0)-before,passed:r.combo===combo+1&&(r.room.hedgehogGrowth?.hits||0)===next+1});next++;
   if(next===beats.length)settling=true;
  }
  if(settling&&!finished&&phase>=beats.at(-1)+.35){finished=true;document.getElementById('pause').click();const style=document.createElement('style');style.textContent='#pauseCover{display:none!important}';document.head.append(style);}
  report.textContent=JSON.stringify({qa:'OURIÇO · CLIQUE REAL',finished,results,hits:r.room.hedgehogGrowth?.hits||0,bonus:r.room.hedgehogGrowth?.spawned||0,mood:hedgehogMood(r.room.hedgehogGrowth,phase).state,errors});
 };
}
