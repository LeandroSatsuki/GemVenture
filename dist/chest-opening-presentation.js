import {FIND_RULES} from './cave-finds.js';
import {CHEST_OPENING} from './approved-chest-opening-art.js';

const CLOSED=Object.freeze({frameIndex:0,progress:0,phase:'closed'}),OPEN=Object.freeze({frameIndex:CHEST_OPENING.frameCount-1,progress:1,phase:'open'});
const visualAge=value=>Number.isFinite(value)?Math.max(0,value):0;

// Transient presentation only. Confirmed domain events own consumption/reward.
// The caller supplies World.ambientAge(seconds), already frozen while blocked.
export class ChestOpeningPresentation{
 #room=null;#nodes=new Map();#entries=new Map();
 setContext(room){
  const next=room??null;if(next===this.#room)return false;this.#room=next;this.#nodes.clear();this.#entries.clear();
  for(const find of (Array.isArray(next?.caveFinds)?next.caveFinds:[]).slice(0,FIND_RULES.maxProps)){
   if(find?.type!=='caveFind'||find.kind!=='chest'||find.id==null||this.#nodes.has(find.id))continue;
   this.#nodes.set(find.id,find);if(find.used===true)this.#entries.set(find.id,{settled:true,started:0,progress:1});
  }
  return true;
 }
 #current(find){return find?.type==='caveFind'&&find.kind==='chest'&&this.#nodes.get(find.id)===find&&this.#room?.caveFinds?.includes(find);}
 accept(events,ageSeconds){
  let accepted=0;const age=visualAge(ageSeconds);
  for(const event of Array.isArray(events)?events:[]){
   if(event?.type!=='findUsed'||event.kind!=='chest'||this.#entries.has(event.id))continue;
   const find=this.#nodes.get(event.id);if(!this.#current(find)||find.used!==true)continue;
   if(event.x!==undefined&&event.x!==find.x||event.y!==undefined&&event.y!==find.y)continue;
   this.#entries.set(find.id,{settled:false,started:age,progress:0});accepted++;
  }
  return accepted;
 }
 sample(find,{age=0,soft=false}={}){
  if(!this.#current(find)||find.used!==true)return CLOSED;
  let entry=this.#entries.get(find.id);
  // A used object first seen without a new confirmed event is already open;
  // neither a reload nor a delayed/stale event may replay its reward animation.
  if(!entry){entry={settled:true,started:0,progress:1};this.#entries.set(find.id,entry);}
  if(soft||entry.settled){entry.settled=true;entry.progress=1;return OPEN;}
  entry.progress=Math.max(entry.progress,Math.min(1,Math.max(0,visualAge(age)-entry.started)*1000/CHEST_OPENING.durationMs));
  if(entry.progress>=1){entry.settled=true;return OPEN;}
  return {frameIndex:Math.max(1,Math.floor(entry.progress*(CHEST_OPENING.frameCount-1))),progress:entry.progress,phase:'opening'};
 }
}
