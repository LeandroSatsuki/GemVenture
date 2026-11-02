export const FORGE_UI_IDS=Object.freeze(['pickaxe','vigor','anvil','tonic','vault']);
export const FORGE_ART_FILES=Object.freeze({pickaxe:'pickaxe-v01-256.png',vigor:'life-heart-reuse.png',anvil:'anvil-v05-attempt-3-256.png',tonic:'alembic-v06-256.png',vault:'safe-v06-256.png'});
// Presentation only, called after the host renders and hydrates its own dialog.
export function decorateForge(dialog,{assetBase='assets/forge-review',coinSrc='assets/descent-choice/summary/coin.png',projectAssets=null,portraitSrc=null}={}){
 if(!dialog?.classList.contains('forge-dialog'))return false;
 projectAssets??=Object.fromEntries(FORGE_UI_IDS.filter(id=>FORGE_ART_FILES[id]).map(id=>[id,assetBase+'/'+FORGE_ART_FILES[id]]));
 // Fail visibly to the host if it skipped normalization; never reinterpret armor costs.
 const incoming=dialog.querySelector('[data-forge][aria-pressed="true"]')?.dataset.forge;
 if(incoming==='armor'){dialog.dataset.gvForgeNeedsFallback='pickaxe';return false;}
 delete dialog.dataset.gvForgeNeedsFallback;
 for(const retired of dialog.querySelectorAll('[data-forge="armor"]'))retired.remove();
 dialog.classList.add('gv-forge-v1');const doc=dialog.ownerDocument;
 const header=dialog.querySelector('.dialog-top');
 if(header&&!portraitSrc)header.querySelectorAll('.gv-forge-portrait-slot').forEach(n=>n.remove());
 if(header&&portraitSrc){
  let slot=header.querySelector('.gv-forge-portrait-slot');
  if(!slot){slot=doc.createElement('div');slot.className='gv-forge-portrait-slot';slot.setAttribute('aria-hidden','true');header.prepend(slot);}
  slot.replaceChildren();slot.dataset.artStatus=portraitSrc?'received-pending-visual-review':'awaiting-specialized-bust';
  if(portraitSrc){const portrait=doc.createElement('img');portrait.src=portraitSrc;portrait.alt='';portrait.className='gv-forge-portrait';slot.append(portrait);}
 }
 // Move existing nodes, preserving IDs, details state and already bound handlers.
 const content=dialog.querySelector('#dialogBody'),stock=dialog.querySelector('.smith-stock'),balances=dialog.querySelector('.smith-header');
 if(content&&stock&&balances){
  let resources=content.querySelector('.gv-forge-resources');
  if(!resources){resources=doc.createElement('div');resources.className='gv-forge-resources';content.insertBefore(resources,balances);}
  if(stock.parentElement!==resources)resources.append(stock);
  if(balances.parentElement!==resources)resources.append(balances);
 }
 const img=(src,cls)=>{const n=doc.createElement('img');n.src=src;n.className=cls;n.alt='';n.setAttribute('aria-hidden','true');return n;};
 for(const button of dialog.querySelectorAll('[data-forge]')){
  const id=button.dataset.forge;if(!FORGE_UI_IDS.includes(id))continue;
  const previous=button.querySelector('.forge-project-icon,.gv-forge-icon');
  const replacement=projectAssets[id]?img(projectAssets[id],'gv-forge-icon'):doc.createElement('span');
  replacement.className='gv-forge-icon';replacement.setAttribute('aria-hidden','true');
  replacement.dataset.artStatus=projectAssets[id]?'received-pending-visual-review':'awaiting-specialized-png';
  if(previous)previous.replaceWith(replacement);else button.prepend(replacement);
 }
 const selected=dialog.querySelector('[data-forge][aria-pressed="true"]')?.dataset.forge;
 const selectedSlot=dialog.querySelector('.smith-selection-icon');
 if(selectedSlot&&FORGE_UI_IDS.includes(selected)){selectedSlot.replaceChildren(...(projectAssets[selected]?[img(projectAssets[selected],'gv-forge-project-art')]:[]));selectedSlot.dataset.artStatus=projectAssets[selected]?'received-pending-visual-review':'awaiting-specialized-png';selectedSlot.dataset.gvProject=selected;}
 const scene=dialog.querySelector('.forge-illustration');if(scene&&!dialog.querySelector('.gv-forge-workshop')){const art=img(assetBase+'/workshop.png','gv-forge-workshop');art.alt='Oficina da Forja';art.removeAttribute('aria-hidden');scene.replaceWith(art);}
 for(const slot of [dialog.querySelector('.smith-header-tools>strong'),dialog.querySelector('.recipe-coins>span')]){
  if(!slot||slot.querySelector('.gv-forge-coin'))continue;
  for(const text of [...slot.childNodes])if(text.nodeType===3)text.textContent=text.textContent.replace('◇','').trimStart();
  slot.prepend(img(coinSrc,'gv-forge-coin'));
 }
 return true;
}

// Shared dialog header belongs to the next screen when leaving Forge.
export function releaseForgePresentation(dialog){dialog?.classList.remove('gv-forge-v1');dialog?.querySelectorAll('.gv-forge-portrait-slot').forEach(node=>node.remove());if(dialog)delete dialog.dataset.gvForgeNeedsFallback;}
