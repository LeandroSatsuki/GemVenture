import {collectedGemSvg} from './collected-gems.js';
import {applyMissionsFrame} from './missions-frame.js';
import {applyRebrandRecords} from './rebrand-records.js';
import {applyRebrandTree} from './rebrand-tree.js';
import {applyRebrandFortune} from './rebrand-fortune.js';
import {applyRebrandRelic} from './rebrand-relic.js';
import {hydratePickaxePreviews} from './pickaxe-art.js';
import {MATERIALS} from './materials.js';
import {approvedArtSvg} from './approved-art.js';
// View decoration only. No game state, save, financial action or listener is owned here.
export function applyRebrandUI(dialog,kind){
 applyMissionsFrame(dialog,false);
 const relicR2=applyRebrandRelic(dialog,kind==='stars'),fortuneR2=applyRebrandFortune(dialog,kind==='zag'),treeR2=applyRebrandTree(dialog,kind==='tree'),recordsR2=applyRebrandRecords(dialog,kind==='records');
 if(relicR2||fortuneR2||treeR2||recordsR2)return true;
 // V2AB owns the Lift composition. Do not let the legacy gv-r2 button/theme
 // cascade override its approved UI; other dialogs retain their current skins.
 if(kind==='lift'&&dialog.querySelector('.gv-lift-v2')){
  dialog.classList.remove('gv-r2','bosque-ui','gv-expedition-theme');
  delete dialog.dataset.r2Screen;delete dialog.dataset.gvExpedition;delete dialog.dataset.gvui;
  return true;
 }
 if(kind==='pets'&&dialog.querySelector('.gv-pets--caregiver')){dialog.classList.add('gv-r2');dialog.classList.remove('bosque-ui','gv-expedition-theme');delete dialog.dataset.gvExpedition;delete dialog.dataset.gvui;dialog.dataset.r2Screen='pets';const title=dialog.querySelector('#dialogLabel');if(title)title.textContent='PETS';return true;}
 const enabled=kind==='forge'||kind==='lift'||kind==='well'||kind==='missions';dialog.classList.toggle('gv-r2',enabled);
 if(!enabled){delete dialog.dataset.r2Screen;return false;}
 dialog.classList.remove('bosque-ui');dialog.dataset.r2Screen=kind;
 const title=dialog.querySelector('#dialogLabel');if(title)title.textContent=kind==='lift'?'ELEVADOR':kind==='well'?'POÇO DOS DESEJOS':kind==='missions'?'Missões':'FORJA';
 if(kind==='lift'){dialog.classList.remove('gv-expedition-theme');delete dialog.dataset.gvExpedition;delete dialog.dataset.gvui;return true;}
 if(kind==='well'){dialog.classList.remove('gv-expedition-theme');delete dialog.dataset.gvExpedition;delete dialog.dataset.gvui;return true;}
 if(kind==='missions'){applyMissionsFrame(dialog,true);dialog.classList.remove('gv-expedition-theme');delete dialog.dataset.gvExpedition;delete dialog.dataset.gvui;return true;}
 hydratePickaxePreviews(dialog);
 function crystal(host,i){if(!host||!Number.isInteger(i)||i<0||i>3)return;const previous=host.querySelector('svg');if(!previous||previous.dataset.r2Material===String(i))return;const template=host.ownerDocument.createElement('template');template.innerHTML=collectedGemSvg(i);const svg=template.content.firstElementChild;if(!svg)return;svg.dataset.r2Material=String(i);svg.setAttribute('aria-hidden','true');previous.replaceWith(svg);}
 dialog.querySelectorAll('.smith-stock>div,.smith-purpose>span').forEach((el,index)=>crystal(el,index%4));
 dialog.querySelectorAll('.recipe-gem').forEach(el=>{const name=el.getAttribute('aria-label')||'';crystal(el,MATERIALS.findIndex(m=>name.startsWith(m.name+',')));});
 dialog.querySelectorAll('[data-gear-kind]').forEach(el=>crystal(el,Number(el.dataset.gearKind)));
 dialog.querySelectorAll('.building-cost>span').forEach(el=>crystal(el,MATERIALS.findIndex(m=>(el.title||'').startsWith(m.name+' ·'))));
 return true;
}
