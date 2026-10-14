// Browser regression harness; only served by the isolated QA server on port 4174.
import {startRun} from '/core.js';
import {roomSize,reveal} from '/cavern.js';
import {World,project} from '/world.js';
import {beatPhase} from '/score.js';
import {musicFloor} from '/frenzy.js';
export function prepareInputCheck(state,mode){
 state.run=null;state.descent.bosses=[5,10,15,20];state.descent.gate=[1500,1200,1000,800];startRun(state,mode);
 const r=state.run,{cols,rows}=roomSize(r.room);
 r.player={x:12,y:rows-2};r.room.rocks=[];r.room.nodes=[];r.room.enemies=[];r.room.terrain=Array(cols*rows).fill(0);
 r.room.charge=0;r.cards={popcorn:1,elastic:1};r.items={blast:1,tonic:1,ward:1};
 r.elapsed=0;r.musicClock=2;r.health=70;r.events=[];reveal(r.room,r.player);
 const report=document.createElement('output');report.id='inputReport';
 report.style.cssText='position:fixed;bottom:2px;left:150px;z-index:999;pointer-events:none;background:#180d2f;color:#5ee9e9;font:12px monospace';
 document.body.append(report);
 const errors=[],results=[],cases=['message','musicCue','runCards','explorationHud','breathHud','combo','wall','ground','outside','item-tonic'];
 let next=0,lastBeat=-1,finished=false,live;const draw=World.prototype.draw;
 addEventListener('error',e=>errors.push(e.message));
 const publish=()=>{report.dataset.results=JSON.stringify({mode,done:finished,results,errors,screen:live&&{playerY:live.player.y-live.camera.y,height:live.viewHeight}});report.textContent=`TESTE ${mode==='abyss'?'ABISMO':'ANDARES'} · ${results.filter(r=>r.passed).length}/${cases.length} CLIQUES · ${errors.length} ERROS`;};
 World.prototype.draw=function(s,time,dt,...args){
  live=this;const run=s.run,paused=args[2];
  if(run){run.guardUntil=run.beat+20;run.room.enemies=[];run.health=Math.max(40,run.health);run.rhythm=100;}
  draw.call(this,s,time,dt,...args);
  if(!run||paused||finished)return;
  const phase=beatPhase(musicFloor(run),time),beat=Math.round(phase);
  if(beat<1||beat<=lastBeat||Math.abs(phase-beat)>.055)return;
  lastBeat=beat;const id=cases[next++],canvas=document.getElementById('world'),rect=canvas.getBoundingClientRect();
  if(!id){finished=true;document.getElementById('pause').click();const style=document.createElement('style');style.textContent='#pauseCover{display:none!important}.immersive-run #controlDeck{visibility:visible!important}';document.head.append(style);publish();return;}
  let point;
  if(['wall','ground','outside'].includes(id)){
   const p=id==='wall'?project(run.player.x,roomSize(run.room).rows-1):id==='ground'?project(run.player.x,run.player.y):{x:this.camera.x+20,y:this.camera.y+this.viewHeight*.55};
   point={x:rect.left+(p.x-this.camera.x)*this.scale,y:rect.top+(p.y-this.camera.y)*this.scale};
  }else{
   const el=document.getElementById(id);el.hidden=false;
   if(id==='musicCue')document.getElementById('musicCueLabel').textContent='DESACELERA';
   if(id==='message')el.textContent='NO PULSO!';
   const b=el.getBoundingClientRect();point={x:(Math.max(rect.left,b.left)+Math.min(rect.right,b.right))/2,y:(b.top+b.bottom)/2};
  }
  const hit=document.elementFromPoint(point.x,point.y),combo=run.combo,items=run.items.tonic;
  const button=hit?.closest('button');
  if(id.startsWith('item-'))button?.click();else hit?.dispatchEvent(new PointerEvent('pointerdown',{button:0,clientX:point.x,clientY:point.y,bubbles:true}));
  results.push({id,hit:hit?.id||hit?.tagName,passed:run.combo===combo+1&&(id!=='item-tonic'||run.items.tonic===items-1),combo:run.combo});
  publish();
 };
}
