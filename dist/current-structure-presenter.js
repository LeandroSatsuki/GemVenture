// Presentation only. The existing art loader/cache and all game state stay with their owners.
export async function decodeCurrentImage({document,url,label}){
 const image=document.createElement('img');image.className='flow-art';image.alt=label;image.decoding='async';
 image.style.cssText='display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain';
 if(typeof image.decode==='function'){
  image.src=url;await image.decode();
  if(!(image.naturalWidth>0))throw new Error('Current structure image has no decoded pixels');
 }else await new Promise((resolve,reject)=>{
  const cleanup=()=>{image.onload=null;image.onerror=null;};
  image.onload=()=>{cleanup();resolve();};image.onerror=()=>{cleanup();reject(new Error('Current structure image could not be loaded'));};
  image.src=url;if(image.complete&&image.naturalWidth>0){cleanup();resolve();}
 });
 return image;
}
function neutral(host,state){
 const text=host.ownerDocument.createElement('small');text.style.cssText='font:12px/1.3 var(--body, sans-serif);text-align:center;color:#c5cddb;max-width:100%;overflow-wrap:anywhere';
 text.textContent=state==='error'?'Arte indisponível':'Carregando arte…';host.replaceChildren(text);host.dataset.structureState=state;
 if(state==='loading')host.setAttribute('aria-busy','true');else host.removeAttribute('aria-busy');
}
export function createCurrentStructurePresenter({prepareCurrent,readCurrentUrl,decode=decodeCurrentImage,onError=()=>{},animateWell=null}){
 const epochs=new WeakMap(),animations=new WeakMap();
 function cancel(host){epochs.set(host,(epochs.get(host)||0)+1);animations.get(host)?.cancel();animations.delete(host);host.removeAttribute('aria-busy');}
 async function present(host,type,label=type){
  cancel(host);const epoch=(epochs.get(host)||0)+1;epochs.set(host,epoch);
  const alive=()=>{const dialog=host.closest('dialog');return epochs.get(host)===epoch&&host.isConnected&&(!dialog||dialog.open);};
  // Synchronous replacement happens before the caller displays its dialog.
  neutral(host,'loading');
  try{
   if(type==='well'&&host.dataset.structureMotion==='well'&&animateWell){const session=animateWell({host,label,alive});animations.set(host,session);const result=await session.ready;if(!alive()){session.cancel();return {status:'stale'};}return result;}
   let url=readCurrentUrl(type);
   if(!url){await prepareCurrent();if(!alive())return {status:'stale'};url=readCurrentUrl(type);}
   if(!url)throw new Error('No current composition ready for '+type);
   const image=await decode({document:host.ownerDocument,url,label});
   if(!alive())return {status:'stale'};
   host.replaceChildren(image);host.dataset.structureState='ready';host.removeAttribute('aria-busy');
   return {status:'ready',type};
  }catch(error){
   if(!alive())return {status:'stale'};
   neutral(host,'error');onError({host,type,error});return {status:'error',type,error};
  }
 }
 return Object.freeze({present,cancel});
}
export function createDialogStructurePresenter(presenter){
 const sessions=new WeakMap(),bound=new WeakSet();
 function cancel(dialog){for(const host of sessions.get(dialog)||[])presenter.cancel(host);sessions.delete(dialog);}
 function mount(dialog){
  cancel(dialog);
  if(!bound.has(dialog)){
   bound.add(dialog);
   dialog.addEventListener('cancel',()=>cancel(dialog));
   // A queued close event must not cancel a newly reopened dialog.
   dialog.addEventListener('close',()=>{if(!dialog.open)cancel(dialog);});
  }
  const hosts=[...dialog.querySelectorAll('[data-current-structure]')];sessions.set(dialog,hosts);
  return hosts.map(host=>presenter.present(host,host.dataset.currentStructure,host.dataset.structureLabel));
 }
 return Object.freeze({mount,cancel});
}
