import {DESCENT_ICONS} from './descent-icons.js';
// Presentation pass after the existing run owner renders the header/loot/cards.
// Never changes values, card IDs, handlers, focus, disabled/hidden state or saves.
const headings=new WeakMap();
export function decorateDescentChoice(root,run){
 if(!root)return;
 if(!run||run.mode==='abyss'){root.classList.remove('gv-card-lighting','gv-card-floating','gv-descent-shell');const state=headings.get(root);if(state){for(const [node,marker]of state.nodes){marker.replaceWith(node);}state.header.remove();if(state.emblem)state.emblem.hidden=state.emblemHidden;headings.delete(root);}return;}
 const doc=root.ownerDocument,choice=root.querySelector('.floor-choice');if(!choice)return;
 root.classList.add('gv-card-lighting','gv-card-floating','gv-descent-shell');
 let header=choice.querySelector('.descent-heading');
 if(!header){const state={nodes:[],header:null,emblem:choice.querySelector(':scope > .clear-emblem')};state.emblemHidden=state.emblem?.hidden;header=doc.createElement('header');state.header=header;headings.set(root,state);header.className='descent-heading';choice.prepend(header);for(const selector of [':scope > small','#clearTitle','#clearSubtitle']){const node=choice.querySelector(selector);if(node){const marker=doc.createComment('descent-origin');node.before(marker);state.nodes.push([node,marker]);header.append(node);}}const slot=doc.createElement('span');slot.className='descent-header-art';slot.dataset.artSlot='descent-header-ornament';slot.setAttribute('aria-hidden','true');for(const side of ['left','right']){const img=doc.createElement('img');img.src=DESCENT_ICONS['material-0'];img.alt='';img.className='header-crystal '+side;slot.append(img);}header.prepend(slot);}
 const legacyEmblem=choice.querySelector(':scope > .clear-emblem');if(legacyEmblem)legacyEmblem.hidden=true;
 const loot=choice.querySelector('#floorLoot');if(!loot)return;
 loot.setAttribute('tabindex','0');loot.setAttribute('aria-label','Ganhos deste andar; role horizontalmente quando necessário');
 for(const item of loot.querySelectorAll(':scope > div:not(.floor-materials):not(.floor-record-drop)')){
  const strong=item.querySelector('strong'),label=item.querySelector('small')?.textContent.trim();const id={'MOEDAS':'coin','ESTRELAS':'star','PONTOS':'points'}[label];if(!strong||!id||strong.querySelector('img'))continue;
  const value=strong.textContent.replace(/^[◇✦★♫]\s*/,'');if(!DESCENT_ICONS[id]){strong.textContent=value;strong.dataset.artPending=id;continue;}const img=doc.createElement('img');img.src=DESCENT_ICONS[id];img.alt='';img.setAttribute('aria-hidden','true');strong.replaceChildren(img,doc.createTextNode(value));
 }
 const ids=(run.materials||[]).flatMap((n,i)=>n-(run.room?.floorStart?.materials?.[i]||0)>0?[i]:[]);
 const spans=loot.querySelectorAll('.floor-materials>span');if(spans.length===ids.length)spans.forEach((span,i)=>{if(span.querySelector('img'))return;const svg=span.querySelector('svg');if(!svg)return;const img=doc.createElement('img');img.src=DESCENT_ICONS['material-'+ids[i]];img.alt='';img.setAttribute('aria-hidden','true');svg.replaceWith(img);});
}
