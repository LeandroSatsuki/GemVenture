import {complementImage} from './complement-art.js';
import {starIcon} from './shared-ui-art.js';
import {RELIC_ART} from './relic-art-registry.js';
// Accepted raster by ID; missing art remains explicit, never a fallback glyph.

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>n.toLocaleString('pt-BR');
const title=text=>text.toLocaleLowerCase('pt-BR').replace(/^./u,c=>c.toLocaleUpperCase('pt-BR'));
const icon=id=>`<span class="r2-relic-icon${RELIC_ART[id]?'':' art-pending'}" aria-hidden="true" data-art-id="${escape(id)}">${RELIC_ART[id]?`<img src="${RELIC_ART[id].url}" alt="" width="256" height="256">`:`<small>ARTE<br>PENDENTE</small>`}</span>`;

// Pure markup. This function does not run or predict a draw, equip, payment or save.
export function relicMarkup(vm){
 const byId=new Map(vm.relics.map(r=>[r.id,r]));
 const equipped=Array.from({length:vm.slots},(_,i)=>{
  const r=byId.get(vm.equipped[i]);
  return `<li class="${r?'is-filled':'is-empty'}"><span class="r2-relic-slot-number">${i+1}</span>${r?icon(r.id):'<span class="r2-relic-empty" aria-hidden="true">+</span>'}<div><strong>${r?escape(title(r.name)):'Espaço livre'}</strong><span>${r?escape(r.text):'Equipe um eco da coleção.'}</span></div></li>`;
 }).join('');
 const offer=vm.offer.length?`<section class="r2-relic-invoke" aria-labelledby="relicOfferTitle"><header><span class="r2-relic-eyebrow">Oferta guardada</span><h2 id="relicOfferTitle">Escolha um eco</h2><p>Uma escolha permanente. A oferta fica guardada até você escolher.</p></header><div class="r2-relic-offers">${vm.offer.map(id=>{
  const r=byId.get(id);
  return `<article>${icon(r.id)}<h3>${escape(title(r.name))}</h3><p>${escape(r.text)}</p><button type="button" class="primary" data-choose-astral="${escape(id)}" aria-label="Escolher ${escape(title(r.name))}">Escolher</button></article>`;
 }).join('')}</div></section>`:`<section class="r2-relic-invoke" aria-labelledby="relicInvokeTitle"><div class="r2-relic-invoke-copy"><span class="r2-relic-sigil" aria-hidden="true">${starIcon()}</span><div><h2 id="relicInvokeTitle">${vm.remaining?'Descubra um eco':'Coleção completa'}</h2><p>${vm.remaining?'Receba até três opções e escolha uma para sua coleção.':'Você descobriu todos os ecos. Troque os equipados na coleção.'}</p><span class="r2-relic-remaining">${number(vm.remaining)} ${vm.remaining===1?'eco a descobrir':'ecos a descobrir'}</span></div></div><div class="r2-relic-invoke-action"><button type="button" class="primary" id="rollAstral" aria-label="Invocar por ${number(vm.cost)} estrelas"${vm.canInvoke?'':' disabled'}>Invocar <span class="relic-cost">${starIcon()} <span>${number(vm.cost)}</span></span></button>${vm.remaining&&vm.stars<vm.cost?'<p>Estrelas insuficientes.</p>':''}</div><div class="relic-vignette" data-art-id="relicary-vignette" aria-hidden="true">${complementImage('relicary-vignette')}</div></section>`;
 const last=vm.last&&byId.get(vm.last);
 const collection=vm.relics.map(r=>{
  const owned=vm.owned.includes(r.id),active=vm.equipped.includes(r.id),full=!active&&vm.equipped.length>=vm.slots;
  const status=active?'Equipado':!owned?'Não descoberto':full?'Sem espaço':'Equipar';
  return `<button type="button" class="r2-relic-card${owned?' is-owned':''}${active?' is-equipped':''}" data-equip-astral="${escape(r.id)}" aria-pressed="${active}" aria-label="${escape(title(r.name))}. ${escape(r.text)} ${active?'Equipado; remover':!owned?'Não descoberto':full?'Três espaços ocupados':'Equipar'}"${!owned||full?' disabled':''}>${icon(r.id)}<span class="r2-relic-card-copy"><strong>${escape(title(r.name))}</strong><span>${escape(r.text)}</span></span><span class="r2-relic-card-state">${status}</span></button>`;
 }).join('');
 const wallet=`<div class="r2-relic-wallet" aria-label="${number(vm.stars)} estrelas disponíveis"><span>Estrelas</span><strong>${starIcon()} <span>${number(vm.stars)}</span></strong></div>`;
 const slots=`<section class="r2-relic-equipped" aria-labelledby="relicEquippedTitle"><header><h2 id="relicEquippedTitle">Equipados</h2><span>${number(vm.equipped.length)}/${number(vm.slots)}</span></header><ol>${equipped}</ol><p>Troque os ecos na coleção abaixo.</p></section>`;
 const receipt=last?`<p class="r2-relic-last" role="status" tabindex="-1">Adicionado à coleção: <strong>${escape(title(last.name))}</strong>.</p>`:'';
 const help=`<details id="relicHelp" class="quiet-details r2-relic-help"><summary>Como funciona</summary><p>Equipe até ${number(vm.slots)} ecos e troque na vila. O sorteio custa ${number(vm.cost)} estrelas, fica guardado e não repete um eco da coleção. Escolher a oferta não cobra estrelas novamente.</p></details>`;
 return `<section class="r2-relic" aria-label="Ecos das estrelas"><div class="r2-relic-top">${wallet}${offer}</div>${receipt}${slots}${help}<section class="r2-relic-collection" aria-labelledby="relicCollectionTitle"><header><h2 id="relicCollectionTitle">Coleção <span>${number(vm.owned.length)}/${number(vm.relics.length)}</span></h2><p>${vm.equipped.length>=vm.slots?'Remova um equipado para abrir espaço.':'Selecione um eco descoberto para equipar.'}</p></header><div class="r2-relic-grid">${collection}</div></section></section>`;
}

// Local presentation continuity only. No game-state or transaction handler lives here.
const sessions=new WeakMap();
const attributes=['data-choose-astral','data-equip-astral','data-relic','data-relic-filter'];
function focusKey(target,body){
 const node=target?.closest?.('button,summary');if(!node||!body?.contains(node))return null;
 if(node.id==='rollAstral')return{type:'roll'};
 for(const attribute of attributes)if(node.hasAttribute(attribute))return{type:attribute,value:node.getAttribute(attribute)};
 if(node.localName==='summary')return{type:'details',id:node.parentElement.id||'',legacy:node.parentElement.classList.contains('astral-legacy')};
 return null;
}
function findTarget(body,key){
 if(!key)return null;
 if(key.type==='roll')return body.querySelector('#rollAstral:not(:disabled)')||body.querySelector('[data-choose-astral]');
 if(key.type==='details')return key.legacy?body.querySelector('.astral-legacy>summary'):[...body.querySelectorAll('details[id]')].find(d=>d.id===key.id)?.querySelector('summary');
 const match=attribute=>[...body.querySelectorAll('['+attribute+']')].find(e=>e.getAttribute(attribute)===key.value&&!e.disabled&&!e.hidden);
 return match(key.type)||(key.type==='data-choose-astral'?match('data-equip-astral')||body.querySelector('.r2-relic-last'):key.type==='data-relic'?body.querySelector('.astral-legacy>summary'):key.type==='data-equip-astral'?body.querySelector('[data-relic-filter][aria-pressed="true"]'):null);
}

// Call once per applyRebrandUI pass, including active=false on every other screen.
export function applyRebrandRelic(dialog,active=true){
 let session=sessions.get(dialog);
 if(!active){
  if(session){session.epoch++;dialog.removeEventListener('focusin',session.focus);dialog.removeEventListener('scroll',session.scroll,true);dialog.removeEventListener('close',session.close);sessions.delete(dialog);}
  return false;
 }
 const body=dialog.querySelector('#dialogBody');if(!body?.querySelector('.r2-relic'))return applyRebrandRelic(dialog,false);
 const sameScreen=!!session&&dialog.dataset.r2Screen==='stars';
 const restore=sameScreen&&dialog.open&&session.key;
 const previous=restore?{key:session.key,top:session.top}:null;
 dialog.classList.add('gv-r2');dialog.classList.remove('bosque-ui','gv-expedition-theme');delete dialog.dataset.gvui;delete dialog.dataset.gvExpedition;dialog.dataset.r2Screen='stars';
 const label=dialog.querySelector('#dialogLabel');if(label)label.textContent='Relicário';
 if(!session){
  session={key:null,top:0,epoch:0};
  session.focus=event=>{if(dialog.dataset.r2Screen!=='stars')return;const key=focusKey(event.target,dialog.querySelector('#dialogBody'));if(key)session.key=key;};
  session.scroll=event=>{if(dialog.dataset.r2Screen==='stars'&&event.target===dialog.querySelector('#dialogBody'))session.top=event.target.scrollTop;};
  session.close=()=>{if(dialog.open)return;session.key=null;session.top=0;session.epoch++;};
  dialog.addEventListener('focusin',session.focus);dialog.addEventListener('scroll',session.scroll,true);dialog.addEventListener('close',session.close);sessions.set(dialog,session);
 }
 const epoch=++session.epoch;
 if(previous)queueMicrotask(()=>{
  if(session.epoch!==epoch||session.key!==previous.key||!dialog.open||dialog.dataset.r2Screen!=='stars'||!dialog.isConnected)return;
  const current=dialog.querySelector('#dialogBody');if(!current?.querySelector('.r2-relic'))return;
  const focused=dialog.ownerDocument.activeElement;
  if(focused?.isConnected&&focused!==dialog.ownerDocument.body&&focused!==dialog&&!current.contains(focused))return;
  const target=findTarget(current,previous.key);if(!target)return;
  current.scrollTop=previous.top;target.focus({preventScroll:true});target.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});
 });
 return true;
}
