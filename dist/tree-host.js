import {decorateTreeFrame} from './tree-presentation.js';
// Bridge only the real dialog shell. No profile/demo data, storage or actions.
export function mountTreeEcosFrame(dialog){
 const header=dialog.querySelector('.dialog-top'),label=dialog.querySelector('#dialogLabel'),close=dialog.querySelector('#close');
 if(!header||!label||!close||!dialog.querySelector('.web-node.root'))return false;
 if(dialog.dataset.treeEcos==='03'&&!dialog.querySelector('#dialogBody .web-points'))return true;
 header.querySelector('.web-points')?.remove();
 let heading=header.querySelector('.tree-heading');
 if(!heading){heading=dialog.ownerDocument.createElement('div');heading.className='tree-heading';header.insertBefore(heading,close);heading.append(label);const copy=dialog.ownerDocument.createElement('p');copy.textContent='Fortaleça suas explorações e desbloqueie novos poderes.';heading.append(copy);}
 let emblem=header.querySelector('.tree-emblem-slot');
 if(!emblem){emblem=dialog.ownerDocument.createElement('div');emblem.className='tree-emblem-slot';const image=dialog.ownerDocument.createElement('img');image.src='assets/refuge-night-v3/echo-tree.png';image.alt='';image.draggable=false;emblem.append(image);header.insertBefore(emblem,heading);}
 decorateTreeFrame(dialog);dialog.dataset.treeEcos='03';return true;
}
export function unmountTreeEcosFrame(dialog){
 if(dialog.dataset?.treeEcos!=='03')return;
 const header=dialog.querySelector('.dialog-top'),heading=header?.querySelector('.tree-heading'),label=heading?.querySelector('#dialogLabel');
 if(label)heading.before(label);heading?.remove();header?.querySelector('.tree-emblem-slot')?.remove();header?.querySelector('.web-points')?.remove();delete dialog.dataset.treeEcos;
}
