import {nextLevelXP} from './pillars.js';

export const LEVEL_NOTICE_MS=3200;
// One aggregate, never a queue proportional to the number of levels gained.
// Events confirm the gain; the profile supplies current XP, not an invented snapshot.
export class LevelProgressNotice{
 #profile=null;#highest=1;#notice=null;#remaining=0;#serial=0;
 setProfile(profile){if(this.#profile===profile)return;this.#profile=profile;this.#highest=1;this.#notice=null;this.#remaining=0;}
 accept(events,profile){
  this.setProfile(profile);const level=profile?.experience?.level;
  if(!Number.isSafeInteger(level)||level<1)return 0;
  const levels=[...new Set((Array.isArray(events)?events:[]).filter(e=>e?.type==='levelUp'&&Number.isSafeInteger(e.level)&&e.level>this.#highest&&e.level<=level).map(e=>e.level))].sort((a,b)=>a-b);
  if(!levels.length)return 0;
  this.#highest=levels.at(-1);this.#notice=Object.freeze({serial:++this.#serial,points:(this.#notice?.points||0)+levels.length});this.#remaining=LEVEL_NOTICE_MS;return levels.length;
 }
 get pending(){return !!this.#notice;}
 get remainingMs(){return this.#remaining;}
 view(profile){
  this.setProfile(profile);if(!this.#notice)return null;const e=profile?.experience,max=nextLevelXP(e?.level);
  if(!Number.isSafeInteger(e?.level)||e.level<1||!Number.isSafeInteger(e.xp)||e.xp<0||!Number.isFinite(max)||max<=e.xp)return null;
  return {...this.#notice,level:e.level,xp:e.xp,max,ratio:e.xp/max};
 }
 advance(delta,{blocked=false}={}){if(blocked||!this.#notice)return;this.#remaining=Math.max(0,this.#remaining-(Number.isFinite(delta)?Math.max(0,delta):0));if(!this.#remaining)this.#notice=null;}
}
