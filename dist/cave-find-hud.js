import {comboGuardRemaining,FIND_RULES} from './cave-finds.js';
import {ORB_ICONS} from './approved-orb-assets.js';

export function caveGuardView(run,phase){
 const seconds=comboGuardRemaining(run,phase);
 return {hidden:seconds<=0||!!run?.room?.cleared,seconds,label:Math.ceil(seconds)+' s',fraction:seconds/FIND_RULES.comboSeconds};
}
export function updateCaveFindHud(root,run,phase){
 let badge=root.querySelector('.cave-combo-guard');
 if(!badge){
  const doc=root.ownerDocument;
  if(!doc.getElementById('caveFindStyles')){const link=doc.createElement('link');link.id='caveFindStyles';link.rel='stylesheet';link.href=new URL('./cave-find-hud.css',import.meta.url).href;doc.head?.append(link);}
  badge=doc.createElement('output');badge.className='cave-combo-guard';badge.setAttribute('aria-label','Proteção de combo');
  badge.innerHTML='<img class="cave-guard-glyph" src="'+ORB_ICONS.guard+'" alt=""><span class="cave-guard-name">Combo protegido</span><b class="cave-guard-time"></b><span class="cave-guard-track" aria-hidden="true"><i></i></span>';
  root.querySelector('.combo').append(badge);
 }
 const view=caveGuardView(run,phase);badge.hidden=view.hidden;if(view.hidden)return;
 const value=badge.querySelector('.cave-guard-time');if(value.textContent!==view.label)value.textContent=view.label;
 badge.querySelector('i').style.width=view.fraction*100+'%';
}
