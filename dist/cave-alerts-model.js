import {cavePressure} from './cave-descent.js';
import {wavePlan} from './cavern.js';
import {hasTrainingClock} from './training-clock.js';

export const HORDE_ARRIVAL_MS=1200;
const phaseOf=(run,phase)=>Math.max(0,run?.beat??0,run?.acted??0,Number.isFinite(phase)?phase:0);
export function caveAlertView(run,phase,arrival=null){
 if(!run?.room||run.room.cleared||hasTrainingClock(run))return {horde:null,pressure:null};
 const beat=phaseOf(run,phase),wave=run.room.wave,q=cavePressure(run,beat);let horde=null;
 if(wave&&Number.isFinite(wave.next)&&Number.isInteger(wave.number)){
  const plan=wavePlan(run.floor,wave.number+1),remaining=Math.max(0,wave.next-beat);
  if(beat>=wave.next-plan.warning)horde={state:'warning',number:wave.number+1,remaining,progress:Math.max(0,Math.min(1,1-remaining/plan.warning))};
  else if(arrival&&arrival.number===wave.number)horde={state:'arrived',number:arrival.number,count:arrival.count};
 }
 const pressure=q.stage?{state:'active',stage:q.stage,damagePercent:Math.round((q.damage-1)*100)}:q.warning?{state:'warning',stage:0,remaining:q.remaining,progress:Math.max(0,Math.min(1,1-q.remaining/16))}:null;
 return {horde,pressure};
}
// One transient confirmed arrival per room. No domain state, timers or saves.
export class CaveAlertModel{
 #run=null;#room=null;#arrival=null;#remaining=0;#lastNumber=0;
 setContext(run){const room=run?.room??null;if(run===this.#run&&room===this.#room)return false;this.#run=run;this.#room=room;this.#arrival=null;this.#remaining=0;this.#lastNumber=0;return true;}
 accept(events,run){
  this.setContext(run);let accepted=0;if(!run?.room||run.room.cleared||hasTrainingClock(run))return 0;
  for(const event of Array.isArray(events)?events:[]){
   if(event?.type!=='horde'||!Number.isSafeInteger(event.number)||event.number<=this.#lastNumber||event.number!==run.room.wave?.number||!Number.isSafeInteger(event.count)||event.count<0)continue;
   this.#lastNumber=event.number;this.#arrival={number:event.number,count:event.count};this.#remaining=HORDE_ARRIVAL_MS;accepted++;
  }
  return accepted;
 }
 advance(deltaMs,{blocked=false}={}){if(blocked||!this.#arrival)return;this.#remaining=Math.max(0,this.#remaining-(Number.isFinite(deltaMs)?Math.max(0,deltaMs):0));if(!this.#remaining)this.#arrival=null;}
 sample(run,phase){this.setContext(run);return caveAlertView(run,phase,this.#arrival);}
 get remainingMs(){return this.#remaining;}
}
