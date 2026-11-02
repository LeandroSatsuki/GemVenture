import {visible} from './cavern.js';
export function sentinelStatus(run){
 const m=run?.room?.miniboss,e=m&&run.room.enemies.find(e=>e.id===m.enemyId&&e.miniboss&&e.hp>0);
 if(!e||run.room.cleared||!['dormant','engaged'].includes(m.state))return null;
 if(!visible(run.room,e))return m.near?{state:'near'}:null;
 return {state:m.state==='engaged'?'engaged':'visible',hp:Math.ceil(e.hp),max:Math.ceil(e.maxHp),ratio:Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHp)))};
}
export const SENTINEL_REWARD_MS=3200;
// Cosmetic only: bounded pending notices, deduplicated by encounter identity.
export class SentinelRewardQueue{
 #profile=null;#seen=new WeakSet();#pending=[];#current=null;#remaining=0;#serial=0;
 setProfile(profile){if(profile===this.#profile)return;this.#profile=profile;this.#seen=new WeakSet();this.#pending=[];this.#current=null;this.#remaining=0;}
 accept(events,profile){
  this.setProfile(profile);const m=profile?.run?.room?.miniboss;
  if(!m||m.state!=='defeated'||!m.rewardClaimed||this.#seen.has(m))return 0;
  const reward=m.reward,valid=reward&&Number.isInteger(reward.kind)&&reward.kind>=0&&reward.kind<4&&Number.isSafeInteger(reward.coins)&&reward.coins>=0&&Number.isSafeInteger(reward.crystals)&&reward.crystals>=0;
  if(!valid||!(Array.isArray(events)?events:[]).some(e=>e?.type==='minibossDefeated'&&e.id===m.enemyId&&e.coins===reward.coins&&e.crystals===reward.crystals))return 0;
  this.#seen.add(m);if(this.#pending.length>=4)this.#pending.shift();this.#pending.push(Object.freeze({key:++this.#serial,coins:reward.coins,crystals:reward.crystals,kind:reward.kind}));return 1;
 }
 get peek(){return this.#current||this.#pending[0]||null;}
 get current(){return this.#current;}
 get pendingCount(){return this.#pending.length;}
 get remainingMs(){return this.#remaining;}
 advance(delta,{blocked=false}={}){if(blocked)return;if(!this.#current){this.#current=this.#pending.shift()||null;this.#remaining=this.#current?SENTINEL_REWARD_MS:0;return;}this.#remaining=Math.max(0,this.#remaining-(Number.isFinite(delta)?Math.max(0,delta):0));if(!this.#remaining)this.#current=null;}
}
