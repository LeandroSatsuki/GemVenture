import {RECORDS} from './records.js';
import {PET_CATALOG} from './home-collection.js';
import {RECORD_ART} from './approved-records-assets.js';
import {petArtSpec} from './pet-art-catalog.js';

export const DISCOVERY_HOLD_MS=3200;
const capacity=RECORDS.length+PET_CATALOG.length;
const display=name=>name.toLocaleLowerCase('pt-BR').replace(/(^|\s|–)([a-zà-ÿ])/g,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR')).replace(/\b(Do|Da|De|Em|Das)\b/g,m=>m.toLocaleLowerCase('pt-BR'));
export function discoveryNotice(event,profile){
 if(event?.type==='recordDrop'){
  const record=RECORDS.find(r=>r.id===event.id),art=record&&RECORD_ART[record.id];
  if(!art||!profile?.records?.owned?.includes(record.id))return null;
  return Object.freeze({key:'record:'+record.id,id:record.id,kind:'record',label:'Disco raro',name:display(record.name),art});
 }
 if(event?.type==='petUnlocked'){
  const pet=PET_CATALOG.find(p=>p.id===event.id),spec=pet&&petArtSpec(pet.id),art=spec?.views.presentation.clips.pose.url;
  if(!art||!profile?.homeCollection?.pets?.includes(pet.id))return null;
  return Object.freeze({key:'pet:'+pet.id,id:pet.id,kind:'pet',label:'Novo companheiro',name:pet.name,art});
 }
 return null;
}
// Transient and catalog-bounded. This never grants ownership or modifies a save.
export class DiscoveryQueue{
 #profile=null;#seen=new Set();#pending=[];#current=null;#remaining=0;
 setProfile(profile){if(this.#profile===profile)return;this.#profile=profile;this.#seen.clear();this.#pending=[];this.#current=null;this.#remaining=0;}
 accept(events,profile){
  this.setProfile(profile);let count=0;
  for(const event of Array.isArray(events)?events:[]){const item=discoveryNotice(event,profile);if(!item||this.#seen.has(item.key)||this.#seen.size>=capacity)continue;this.#seen.add(item.key);this.#pending.push(item);count++;}
  return count;
 }
 get peek(){return this.#current||this.#pending[0]||null;}
 get current(){return this.#current;}
 get remainingMs(){return this.#remaining;}
 get pendingCount(){return this.#pending.length;}
 advance(deltaMs,{blocked=false}={}){
  if(blocked)return this.#current;
  if(!this.#current){this.#current=this.#pending.shift()||null;this.#remaining=this.#current?DISCOVERY_HOLD_MS:0;return this.#current;}
  this.#remaining=Math.max(0,this.#remaining-(Number.isFinite(deltaMs)?Math.max(0,deltaMs):0));
  if(!this.#remaining)this.#current=null;
  return this.#current;
 }
}
// Local CSS coordinates; callers convert native rectangles through the UI scale.
export function discoverySlot({width,height,noticeWidth,noticeHeight,obstacles=[],left=12}){
 if(![width,height,noticeWidth,noticeHeight,left].every(Number.isFinite)||noticeWidth<=0||noticeHeight<=0||left<12||width<left+noticeWidth+12)return null;
 const right=left+noticeWidth,gap=10;let top=12;
 const rows=obstacles.filter(r=>r&&[r.left,r.top,r.right,r.bottom].every(Number.isFinite)&&r.right>left-gap&&r.left<right+gap).sort((a,b)=>a.top-b.top);
 for(const r of rows)if(top+noticeHeight>r.top-gap&&top<r.bottom+gap)top=Math.max(top,r.bottom+gap);
 return top+noticeHeight<=height-12?{left,top}:null;
}
