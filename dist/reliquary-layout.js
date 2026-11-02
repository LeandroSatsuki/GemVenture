import {ASTRAL_RELICS} from './astral.js';
import {filterMarkup,applyCollectionFilter} from './relic-filters.js';
import {complementImage} from './complement-art.js';
import {starIcon} from './shared-ui-art.js';
// Presentation ownership only. The real header/body/button nodes and game handlers survive.
const sessions=new WeakMap();
export function releaseReliquaryPresentation(dialog){
 const state=sessions.get(dialog);if(!state)return;
 state.header.replaceChildren(...state.headerChildren);state.header.className=state.headerClass;
 state.close.className=state.closeClass;if(state.closeLabel===null)state.close.removeAttribute('aria-label');else state.close.setAttribute('aria-label',state.closeLabel);
 state.headerMarker.replaceWith(state.header);state.bodyMarker.replaceWith(state.body);state.shell.remove();dialog.classList.remove('gv-relic-v10');sessions.delete(dialog);
}
export function decorateReliquary(dialog,state){
 if(!dialog?.classList.contains('relic-dialog'))return false;
 const doc=dialog.ownerDocument,body=dialog.querySelector('#dialogBody'),header=dialog.querySelector('.dialog-top'),label=doc.getElementById('dialogLabel'),close=doc.getElementById('close');
 if(!body?.querySelector('.r2-relic')||!header||!label||!close)return false;
 let ui=sessions.get(dialog);
 if(!ui){
  const headerMarker=doc.createComment('relic-v10-header-origin'),bodyMarker=doc.createComment('relic-v10-body-origin');header.before(headerMarker);body.before(bodyMarker);
  const shell=doc.createElement('div');shell.className='relic-shell';dialog.insertBefore(shell,headerMarker);
  ui={header,body,close,headerMarker,bodyMarker,shell,headerChildren:[...header.childNodes],headerClass:header.className,closeClass:close.className,closeLabel:close.getAttribute('aria-label'),filter:'all'};sessions.set(dialog,ui);shell.append(header,body);
  const art=doc.createElement('div');art.className='header-art';art.dataset.artId='relicary-emblem';art.setAttribute('aria-hidden','true');art.innerHTML=complementImage('relicary-emblem');
  const copy=doc.createElement('div'),description=doc.createElement('p');description.textContent='Descubra ecos e fortaleça suas explorações.';copy.append(label,description);
  const wallet=doc.createElement('div');wallet.className='header-wallet';wallet.innerHTML='<small>Estrelas</small><b>'+starIcon()+' <span id="headerStars"></span></b>';
  header.replaceChildren(art,copy,wallet,close);header.classList.add('relic-heading-main');close.classList.add('close-relic');close.setAttribute('aria-label','Fechar Relicário');
 }
 dialog.classList.add('gv-relic-v10');label.textContent='RELICÁRIO';doc.getElementById('headerStars').textContent=state.stars.toLocaleString('pt-BR');
 const collection=body.querySelector('.r2-relic-collection');if(!collection.querySelector('.relic-filters'))collection.querySelector('header').insertAdjacentHTML('afterend',filterMarkup(ui.filter));
 applyCollectionFilter(body,ASTRAL_RELICS,state.astral,ui.filter);
 for(const button of body.querySelectorAll('[data-relic-filter]'))button.onclick=()=>{ui.filter=button.dataset.relicFilter;applyCollectionFilter(body,ASTRAL_RELICS,state.astral,ui.filter);};
 return true;
}
