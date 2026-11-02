import {createWellPortrait} from './well-portrait.js';
import {applyRebrandUI} from './rebrand-ui.js';
import {applyBosqueMenu} from './bosque-menu.js';
import {applyExpeditionUI} from './expedition-ui.js';
import {currentFlowMarkup,prepareCurrentFlowArt,currentFlowImageUrl} from './flow-village.js';
import {createCurrentStructurePresenter,createDialogStructurePresenter} from './current-structure-presenter.js';
const structurePresenter=createCurrentStructurePresenter({prepareCurrent:prepareCurrentFlowArt,readCurrentUrl:currentFlowImageUrl,animateWell:options=>createWellPortrait(options)});
const dialogStructures=createDialogStructurePresenter(structurePresenter);
export function cancelDialogUI(dialog){dialogStructures.cancel(dialog);}

const soundControl=document.getElementById('sound');
if(soundControl){
 const syncSoundLabel=()=>{
  soundControl.title=soundControl.getAttribute('aria-label')||'Som';
  soundControl.setAttribute('aria-pressed',String(['Desativar música','Desativar som'].includes(soundControl.getAttribute('aria-label'))));
 };
 syncSoundLabel();
 new MutationObserver(syncSoundLabel).observe(soundControl,{attributes:true,attributeFilter:['aria-label']});
}

// Presentation only: save IDs, prices, bindings and progression stay in their owners.
export function applyDialogUI(dialog,kind){
 cancelDialogUI(dialog);
 dialog.classList.remove('gear-focused');
 const label=dialog.querySelector('#dialogLabel');
 const roles={forge:'FORÇA',tree:'TALENTOS',well:'SORTE',missions:'MISSÕES',stars:'PRESTÍGIO',lift:'EXPEDIÇÕES',records:'DISCOS',zag:'ZAG',rest:'DESCANSO',miner:'MINERADORA AUTOMÁTICA'};
 if(label&&roles[kind])label.textContent=roles[kind];
 if(kind==='tree'){
  const heading=dialog.querySelector('.web-top h2');if(heading)heading.textContent='TALENTOS';
  const sectors=['RITMO','CRÍTICOS','EXPLOSÕES','DEFESA','SAQUE','CRESCIMENTO'];
  dialog.querySelectorAll('[data-sector]').forEach(b=>{
   const name=sectors[Number(b.dataset.sector)];if(!name)return;
   b.title=b.textContent.trim();
   const text=[...b.childNodes].find(n=>n.nodeType===3);if(text)text.textContent=name;
  });
 }
 if(kind==='stars'){
  const h=dialog.querySelector('.astral-header h2');if(h)h.textContent='RELICÁRIO';
  const altar=dialog.querySelector('.astral-altar h3');
  if(altar)altar.textContent=altar.textContent.replace('ESCOLHA UM ECO','ESCOLHA UMA RELÍQUIA').replace('NOVO ECO','NOVA RELÍQUIA');
  const rule=dialog.querySelector('.astral-rule');if(rule)rule.textContent=rule.textContent.replace('ECOS','RELÍQUIAS');
 }
 if(kind==='forge'||kind==='well'){
  const building=dialog.querySelector(kind==='well'?'.r2-well-toolbar .building-upgrade':'.smith-header .building-upgrade');
  if(building&&!building.querySelector('.building-popover')){const popover=document.createElement('div');popover.className='building-popover';[...building.children].slice(1).forEach(child=>popover.append(child));building.append(popover);}
  const names={pickaxe:'Picareta',vigor:'Vida',anvil:'Bigorna',armor:'Armadura',tonic:'Poções',vault:'Cofre'};
  dialog.querySelectorAll('[data-forge]').forEach(b=>{const title=b.querySelector('strong'),name=names[b.dataset.forge];if(title&&name){b.title=title.textContent;title.textContent=name;}});
  dialog.querySelectorAll('.gear-possible').forEach(old=>{
   if(old.tagName==='DETAILS')return;
   const details=document.createElement('details'),summary=document.createElement('summary');details.className=old.className;
   summary.textContent=(old.querySelector('b')?.textContent||'CRISTAL').replace('PODE DAR','· ATRIBUTOS');details.append(summary);
   const pool=old.querySelector('div');if(pool)details.append(pool);old.replaceWith(details);
  });
  const gear=dialog.querySelector('.gear-workbench'),center=dialog.querySelector('.smith-center');
  if(gear&&center){
   dialog.classList.add('gear-focused');
   const scene=center.querySelector('.forge-scene'),celebration=scene?.querySelector('.forge-celebration');
   center.prepend(gear);if(scene)scene.hidden=true;
   if(celebration)center.append(celebration);
  }
 }
 if(kind==='records'){
  const scene=dialog.querySelector('.gramophone-scene');if(scene)scene.innerHTML=currentFlowMarkup('gramophone','Vitrola');
 }
 if(kind==='zag'){
  const host=dialog.querySelector('.zag-host');if(host)host.innerHTML=currentFlowMarkup('zag','Zag');
 }
 refineMenu(dialog,kind);
 applyBosqueMenu(dialog,kind);
 applyExpeditionUI(dialog,kind);
 applyRebrandUI(dialog,kind);
 return dialogStructures.mount(dialog);
}

// Presentation only. Keep the existing elements, IDs and controllers intact.
const menuDisclosure=new Map();
function refineMenu(dialog,kind){
 dialog.dataset.menu=kind;
 const close=dialog.querySelector('#close');if(close)close.title='Fechar · Esc';
 if(kind==='forge'){
  const recipe=dialog.querySelector('.recipe-grid');
  if(recipe){
   const label=document.createElement('span');label.className='menu-section-label';
   const deposited=recipe.querySelector('.recipe-gem')?.title.startsWith('DEPOSITADO');
   label.textContent=deposited?'DEPOSITADO / CUSTO':'DISPONÍVEL / CUSTO';
   recipe.before(label);
  }
  const action=dialog.querySelector('#forgeAction');
  if(action?.disabled&&action.textContent.trim()!=='FUNDINDO…'&&action.textContent.trim()!=='BLOQUEADO'){
   const note=document.createElement('p');note.className='menu-cost-state';
   note.textContent='Recursos insuficientes para esta melhoria.';action.after(note);
  }
  if(dialog.classList.contains('gear-focused')){
   const heading=dialog.querySelector('.gear-workbench h4');if(heading)heading.textContent='ATRIBUTOS DO EQUIPAMENTO';
   const panel=dialog.querySelector('.smith-recipe');
   if(panel){
    const details=document.createElement('details'),summary=document.createElement('summary');
    details.className='menu-armor-upgrade';
    const title=document.createElement('strong'),benefit=document.createElement('span');
    title.textContent='MELHORAR ARMADURA · '+(panel.querySelector('.smith-kicker')?.textContent.trim()||'');
    benefit.textContent=panel.querySelector('.forge-benefit')?.textContent.trim()||'Ver melhoria e custo';
    summary.append(title,benefit);details.append(summary,panel);
    dialog.querySelector('.smith-center').append(details);
   }
  }
 }
 if(kind==='zag'){
  const labels=dialog.querySelector('.zag-lane-labels'),window=dialog.querySelector('.zag-board-window');
  if(labels&&window){
   const alignLabels=()=>labels.querySelectorAll('b').forEach(b=>b.style.transform='translateX('+(-window.scrollLeft)+'px)');
   window.addEventListener('scroll',alignLabels,{passive:true});alignLabels();
  }
  const supply=dialog.querySelector('.zag-roulette-row');
  if(supply&&dialog.querySelector('.zag-hand [data-die]')){
   const details=document.createElement('details'),summary=document.createElement('summary');
   details.className='menu-zag-supply';summary.textContent='OBTER MAIS DADOS';
   supply.before(details);details.append(summary,supply);
  }
  const tools=dialog.querySelector('.zag-tools'),satchel=dialog.querySelector('.zag-satchel');
  if(tools&&satchel){
   const details=document.createElement('details'),summary=document.createElement('summary');
   details.className='menu-zag-inventory';summary.textContent='FERRAMENTAS E MOCHILA';
   tools.before(details);details.append(summary,tools,satchel);
  }
  const workshop=dialog.querySelector('.zag-workshops');
  if(workshop&&!workshop.parentElement.classList.contains('menu-workshop-details')){
   const details=document.createElement('details'),summary=document.createElement('summary');
   details.className='menu-workshop-details';summary.textContent='OFICINA · FERRAMENTAS E MELHORIAS';
   workshop.before(details);details.append(summary,workshop);
  }
 }
 dialog.querySelectorAll('details').forEach((details,index)=>{
  const section=[...details.classList].find(c=>c.startsWith('menu-'));
  const key=kind+':'+(section||index+':'+details.querySelector('summary')?.textContent.trim());
  if(menuDisclosure.has(key))details.open=menuDisclosure.get(key);
  else if(details.classList.contains('web-totals'))details.open=false;
  details.addEventListener('toggle',()=>menuDisclosure.set(key,details.open));
 });
}
