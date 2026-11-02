import {equippedPet} from './home-collection.js';
import {P} from './palette.js';

export const createPetPower=()=>({version:1,miningHits:0,veins:0,rhythmHits:0,nimboCharge:false,mizuBeats:0,mizuCharge:false,lastBeat:-1,coinRemainder:0,healedSection:1,pendingRecoil:false});
export function validPetPower(p){return !!p&&(p.pendingRecoil===undefined||typeof p.pendingRecoil==='boolean')&&p.version===1&&['nimboCharge','mizuCharge'].every(k=>typeof p[k]==='boolean')&&Object.entries({miningHits:4,veins:9,rhythmHits:19,mizuBeats:31,coinRemainder:99}).every(([k,max])=>Number.isSafeInteger(p[k])&&p[k]>=0&&p[k]<=max)&&Number.isSafeInteger(p.lastBeat)&&p.lastBeat>=-1&&Number.isSafeInteger(p.healedSection)&&p.healedSection>=1;}
function state(s){if(!s.run||s.run.trainingClock)return null;if(s.run.petPower===undefined)s.run.petPower={...createPetPower(),lastBeat:s.run.beat??-1};return validPetPower(s.run.petPower)?s.run.petPower:null;}
const active=(s,id)=>equippedPet(s)?.id===id&&!s.run?.trainingClock;
function feedback(s,id,extra={}){const p=equippedPet(s);s.run.events.push({type:'proc',id:'pet-'+id,name:p?.power||id,color:P.cyan,...s.run.player,...extra});}
export function petMiningMultiplier(s,target){if(!active(s,'cascalhito')||!['rock','crystal'].includes(target.type))return 1;const p=state(s);if(!p)return 1;p.miningHits=(p.miningHits+1)%5;if(p.miningHits)return 1;feedback(s,'cascalhito');return 2;}
export const petDamageMultiplier=s=>active(s,'cadencio')&&s.run.combo>=50?1.2:1;
export function petCoinValue(s,base){if(!active(s,'bolota'))return base;const p=state(s);if(!p)return base;const numerator=base*12+p.coinRemainder;p.coinRemainder=numerator%100;return base+Math.floor(numerator/100);}
export function petCommonVein(s,target){if(!active(s,'garim')||target.rare)return;const p=state(s);if(!p)return;p.veins=(p.veins+1)%10;if(p.veins)return;const r=s.run;r.materials[target.kind]++;r.loot.crystals[target.kind].gems++;r.events.push({type:'loot',x:target.x,y:target.y,value:1,color:P.cyan,source:'pet-garim'});feedback(s,'garim');}
export function petRhythmHit(s){if(!active(s,'nimbo'))return;const p=state(s);if(!p||p.nimboCharge)return;p.rhythmHits++;if(p.rhythmHits===20){p.rhythmHits=0;p.nimboCharge=true;feedback(s,'nimbo');}}
export function petMusicBeat(s,beat){const p=state(s);if(!p)return;const delta=Math.max(0,beat-p.lastBeat);p.lastBeat=Math.max(p.lastBeat,beat);if(!active(s,'mizu')||p.mizuCharge)return;p.mizuBeats+=delta;if(p.mizuBeats>=32){p.mizuBeats=0;p.mizuCharge=true;feedback(s,'mizu');}}
// Returns the remaining damage multiplier. Only real creature attacks consume a charge.
export function petDefense(s,creature,canMove){if(!creature)return 1;const p=state(s);if(!p)return 1;
 if(active(s,'mizu')&&p.mizuCharge){p.mizuCharge=false;p.mizuBeats=0;s.run.events.push({type:'shieldBlock',...s.run.player});feedback(s,'mizu');return 0;}
 if(!active(s,'nimbo')||!p.nimboCharge)return 1;p.nimboCharge=false;p.pendingRecoil=true;feedback(s,'nimbo');return .5;
}
export function resolvePetRecoil(s,canMove){const p=state(s);if(!p?.pendingRecoil)return;p.pendingRecoil=false;const r=s.run,manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
 for(const e of r.room.enemies){if(e.hp<=0||e.boss||e.rabbitChild!==undefined||manhattan(e,r.player)>2)continue;
  const next=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:e.x+dx,y:e.y+dy})).filter(q=>manhattan(q,r.player)>manhattan(e,r.player)&&canMove(q.x,q.y)&&!r.room.enemies.some(other=>other!==e&&other.hp>0&&other.x===q.x&&other.y===q.y)&&!r.room.nodes.some(n=>n.hp>0&&n.x===q.x&&n.y===q.y));
  if(next[0]){e.x=next[0].x;e.y=next[0].y;e.windup=null;r.events.push({type:'enemyKnockback',id:e.id,...next[0]});}
 }
}
export function petClearHeal(s,maxHealth,section=null){if(!active(s,'trufa'))return;const p=state(s);if(!p)return;if(section!==null){if(section<=p.healedSection)return;p.healedSection=section;}
 const amount=Math.min(maxHealth-s.run.health,maxHealth*.08);if(amount<=0)return;s.run.health+=amount;s.run.events.push({type:'heal',...s.run.player,value:amount});feedback(s,'trufa');}
