import {collectedGemSvg} from './collected-gems.js';
import {approvedArtSvg} from './approved-art.js';
import {MATERIALS} from './materials.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Existing die remains at -18,-22,36,36. Mineral occupies an adjacent14x16 slot.
export function fortuneWheelPrizeMarkup(prize,place){
 const mineral=prize.amount?place(collectedGemSvg(prize.kind),11,14,14,16):'';
 return '<title>'+escape(prize.dice+' dados'+(prize.amount?' + '+prize.amount+' '+MATERIALS[prize.kind].name:''))+'</title><text x="'+(prize.amount?-7:0)+'" y="29" text-anchor="middle" font-size="15" fill="'+(prize.amount?MATERIALS[prize.kind].color:'#ffffff')+'" font-weight="900">'+prize.dice+(prize.amount?' +':' D')+'</text>'+mineral;
}
const sessions=new WeakMap(),keys=['data-route','data-die','data-tool','data-craft','data-module','data-invest','data-adjust'];
export function applyRebrandFortune(dialog,active=true){
 let state=sessions.get(dialog);
 if(!active||!dialog.querySelector('#zagGame')){if(state){state.epoch++;dialog.removeEventListener('focusin',state.focus);sessions.delete(dialog);}return false;}
 const previous=state&&dialog.open&&dialog.dataset.r2Screen==='zag'?state.key:null;
 dialog.classList.add('gv-r2');dialog.classList.remove('bosque-ui','gv-expedition-theme');delete dialog.dataset.gvui;delete dialog.dataset.gvExpedition;dialog.dataset.r2Screen='zag';
 const label=dialog.querySelector('#dialogLabel');if(label)label.textContent='Fortuna';
 if(!state){state={epoch:0,key:null};state.focus=event=>{const b=event.target?.closest?.('button');if(!b||!dialog.querySelector('#zagGame')?.contains(b))return;state.key=b.id?{id:b.id}:keys.map(a=>b.hasAttribute(a)?{attribute:a,value:b.getAttribute(a)}:null).find(Boolean)||null;};dialog.addEventListener('focusin',state.focus);sessions.set(dialog,state);}
 const epoch=++state.epoch;
 if(previous)queueMicrotask(()=>{if(state.epoch!==epoch||state.key!==previous||!dialog.open||dialog.dataset.r2Screen!=='zag'||!dialog.isConnected)return;const current=dialog.ownerDocument.activeElement,body=dialog.querySelector('#dialogBody');if(current?.isConnected&&current!==dialog.ownerDocument.body&&current!==dialog&&!body?.contains(current))return;const target=previous.id?dialog.querySelector('#'+previous.id):[...dialog.querySelectorAll('button['+previous.attribute+']')].find(b=>b.getAttribute(previous.attribute)===previous.value);if(target&&!target.disabled){target.focus({preventScroll:true});target.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});}});
 return true;
}
