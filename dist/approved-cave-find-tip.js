import {collectedGemSvg} from './collected-gems.js';
import {MATERIALS} from './materials.js';
const origins=new WeakMap();

// The clean HUD deliberately hides its legacy details region. Only the approved
// chest hint leaves that region; all other target hints keep their current owner.
export function placeApprovedCaveFindTip(target,find){
 const chest=find?.kind==='chest'&&!find.used;
 target.classList.toggle('approved-cave-find-tip',chest);
 if(chest){
  const host=target.ownerDocument.querySelector('#hud5Root .hud');
  if(host&&target.parentNode!==host){origins.set(target,{parent:target.parentNode,next:target.nextSibling,host});host.append(target);}
 }else{
  const origin=origins.get(target);
  if(origin?.parent?.isConnected&&target.parentNode===origin.host)origin.parent.insertBefore(target,origin.next?.parentNode===origin.parent?origin.next:null);
  origins.delete(target);
 }
}

// Presentation only: the existing seeded reward remains owned by cave-finds.
export function approvedCaveFindTip(run,find){
 if(!run||find?.kind!=='chest'||find.used)return '';
 const reward=find.reward,material=MATERIALS[reward?.kind];
 if(!material||!Number.isSafeInteger(reward.amount)||reward.amount<0)return '';
 return '<strong>Baú de cristais</strong><span class="cave-find-reward">'+collectedGemSvg(reward.kind)+'<b>+'+reward.amount+'</b><span>'+material.name+'</span></span><small>Golpeie</small>';
}
