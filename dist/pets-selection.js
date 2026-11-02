export const PET_PAGE_SIZE=8;
const memories=new WeakMap();
// View-only pagination; no profile data or unlocks are changed.
export function petPage(items,{filter='all',page=0,selected=null}={}){
 const matching=items.filter(p=>filter==='all'||p.tier===filter),pages=Math.max(1,Math.ceil(matching.length/PET_PAGE_SIZE));
 page=Math.max(0,Math.min(pages-1,Math.floor(page)||0));
 const visible=matching.slice(page*PET_PAGE_SIZE,(page+1)*PET_PAGE_SIZE);
 if(!visible.some(p=>p.id===selected))selected=visible[0]?.id||null;
 return {page,pages,total:matching.length,visible:visible.map(p=>p.id),selected};
}
export function bindPetsSelection(root,{reset=false}={}){
 const shell=root.querySelector('.gv-pets--caregiver');if(!shell)return;
 const buttons=[...root.querySelectorAll('[data-pet-select]')],cards=[...root.querySelectorAll('[data-pet-card]')],panels=[...root.querySelectorAll('[data-pet-panel]')],filters=[...root.querySelectorAll('[data-pet-filter]')];
 const arrows=[...root.querySelectorAll('[data-pet-page]')];
 const state=reset||!memories.has(root)?{selected:shell.dataset.petInitial,filter:'all',page:Math.floor(cards.findIndex(c=>c.dataset.petCard===shell.dataset.petInitial)/PET_PAGE_SIZE)}:memories.get(root);memories.set(root,state);
 function update(){
  const view=petPage(cards.map(c=>({id:c.dataset.petCard,tier:c.dataset.petTier})),state);Object.assign(state,{selected:view.selected,page:view.page});
  for(const card of cards)card.hidden=!view.visible.includes(card.dataset.petCard);
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.petSelect===state.selected));
  for(const c of cards)c.dataset.selected=String(c.dataset.petCard===state.selected);
  for(const p of panels)p.hidden=p.dataset.petPanel!==state.selected;
  for(const f of filters)f.setAttribute('aria-pressed',String(f.dataset.petFilter===state.filter));
  for(const a of arrows)a.disabled=a.dataset.petPage==='previous'?view.page===0:view.page===view.pages-1;
  const label=root.querySelector('[data-pet-page-label]');if(label)label.textContent=(view.page+1)+' / '+view.pages;
  for(const id of ['petsFilterEmpty','petsDetailEmpty']){const el=root.querySelector('#'+id);if(el)el.hidden=view.total>0;}
 }
 const select=id=>{if(cards.some(c=>!c.hidden&&c.dataset.petCard===id)){state.selected=id;update();}};
 update();for(const b of buttons)b.onclick=()=>select(b.dataset.petSelect);
 for(const f of filters)f.onclick=()=>{state.filter=f.dataset.petFilter;state.page=0;update();};
 for(const a of arrows)a.onclick=()=>{state.page+=a.dataset.petPage==='previous'?-1:1;update();};
 // Selection listener runs before the host's later onclick handler. It never mutates profile data.
 for(const b of root.querySelectorAll('[data-pet-equip]'))b.addEventListener('click',()=>select(b.dataset.petEquip));
}
