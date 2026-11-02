import {mountTreeEcosFrame,unmountTreeEcosFrame} from './tree-host.js';
// Visual opt-in and local focus continuity;TalentView owns selection/pan/zoom/actions.
const sessions=new WeakMap(),attributes=['data-talent','data-sector','data-zoom'];
export function applyRebrandTree(dialog,active=true){
 let state=sessions.get(dialog);
 if(!active||!dialog.querySelector('.web-layout')){unmountTreeEcosFrame(dialog);if(state){state.epoch++;dialog.removeEventListener('focusin',state.focus);dialog.removeEventListener('close',state.close);sessions.delete(dialog);}return false;}
 const previous=state&&dialog.open&&dialog.dataset.r2Screen==='tree'?state.key:null;
 dialog.classList.add('gv-r2');dialog.classList.remove('bosque-ui','gv-expedition-theme');delete dialog.dataset.gvui;delete dialog.dataset.gvExpedition;dialog.dataset.r2Screen='tree';
 const title=dialog.querySelector('#dialogLabel');if(title)title.textContent='Árvore dos Ecos';
 mountTreeEcosFrame(dialog);
 if(!state){state={key:null,epoch:0};state.focus=e=>{const button=e.target?.closest?.('button');if(!button||!dialog.querySelector('#dialogBody')?.contains(button))return;state.key=button.id?{id:button.id}:attributes.map(a=>button.hasAttribute(a)?{attribute:a,value:button.getAttribute(a)}:null).find(Boolean)||null;};state.close=()=>{if(!dialog.open){state.key=null;state.epoch++;}};dialog.addEventListener('focusin',state.focus);dialog.addEventListener('close',state.close);sessions.set(dialog,state);}
 const epoch=++state.epoch;
 if(previous)queueMicrotask(()=>{if(state.epoch!==epoch||state.key!==previous||!dialog.open||!dialog.isConnected||dialog.dataset.r2Screen!=='tree')return;const body=dialog.querySelector('#dialogBody'),focused=dialog.ownerDocument.activeElement;if(focused?.isConnected&&focused!==dialog.ownerDocument.body&&focused!==dialog&&!body?.contains(focused))return;const target=previous.id?dialog.querySelector('#'+previous.id):[...dialog.querySelectorAll('button['+previous.attribute+']')].find(b=>b.getAttribute(previous.attribute)===previous.value);const node=target&&!target.disabled?target:dialog.querySelector('button.web-node.selected');if(!node)return;node.focus({preventScroll:true});if(!node.matches('[data-talent]'))node.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});});
 return true;
}
