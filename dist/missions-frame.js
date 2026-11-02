import {missionArt} from './missions-assets.js';
// Invoke from the existing dialog presentation dispatcher, for every dialog kind.
// No domain/controller or shared-header handlers are replaced.
export function applyMissionsFrame(dialog,enabled){
 dialog.querySelector('.missions-header-art')?.remove();
 if(!enabled||!dialog.querySelector('.r2-missions'))return;
 const label=dialog.querySelector('#dialogLabel');
 if(!label)return;
 const slot=dialog.ownerDocument.createElement('span');slot.className='missions-header-art';slot.setAttribute('aria-hidden','true');
 if(missionArt['missions-scroll-header']){const img=dialog.ownerDocument.createElement('img');img.src=missionArt['missions-scroll-header'];img.alt='';img.draggable=false;slot.append(img);}
 label.before(slot);label.textContent='MISSÕES';
}
