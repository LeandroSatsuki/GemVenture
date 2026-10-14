import {flowMarkup} from './flow-village.js';

// Presentation only: save IDs, prices, bindings and progression stay in their owners.
export function applyDialogUI(dialog,kind){
 dialog.classList.remove('gear-focused');
 const label=dialog.querySelector('#dialogLabel');
 const roles={forge:'FORÇA',tree:'TALENTOS',well:'SORTE',missions:'MISSÕES',stars:'PRESTÍGIO',lift:'EXPEDIÇÕES',records:'DISCOS',zag:'ZAG',rest:'DESCANSO',miner:'EXTRAÇÃO AFK'};
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
 if(kind==='forge'){
  const building=dialog.querySelector('.smith-header .building-upgrade');
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
  const scene=dialog.querySelector('.gramophone-scene');if(scene)scene.innerHTML=flowMarkup('gramophone','Vitrola');
 }
 if(kind==='zag'){
  const host=dialog.querySelector('.zag-host');if(host)host.innerHTML=flowMarkup('zag','Zag');
 }
}
