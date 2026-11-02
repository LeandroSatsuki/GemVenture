import {confirmButtonResult,installButtonFeedback} from './button-feedback.js';
// Presentation only. Native clicks remain the sole command path.
const controls='button,input,select,textarea,summary,[tabindex]';
const usable=node=>!!node?.isConnected&&!node.disabled&&!node.closest('[hidden],[inert]')&&node.checkVisibility?.()!==false&&node.getClientRects().length>0;

export function captureControlFocus(root){
 const node=root.ownerDocument.activeElement;
 if(!root.contains(node)||!node.matches(controls))return null;
 return {node,id:node.id,tag:node.tagName,data:Object.entries(node.dataset).filter(([key])=>!key.startsWith('ui')),index:[...root.querySelectorAll(controls)].indexOf(node)};
}
export function restoreControlFocus(root,snapshot){
 if(!snapshot)return false;
 const nodes=[...root.querySelectorAll(controls)];
 const same=usable(snapshot.node)?snapshot.node:nodes.find(node=>snapshot.id?node.id===snapshot.id:snapshot.data.length&&node.tagName===snapshot.tag&&snapshot.data.every(([key,value])=>node.dataset[key]===value));
 const fallback=nodes.find(node=>usable(node)&&node.getAttribute('aria-pressed')==='true')||nodes.slice(Math.max(0,snapshot.index)).find(usable)||nodes.find(usable);
 const target=usable(same)?same:fallback;if(!target)return false;
 target.focus({preventScroll:true});return true;
}
export function restoreDialogOpener(opener,fallback){
 const target=usable(opener)?opener:fallback;
 if(usable(target))target.focus({preventScroll:true});
}
export function repeatedUIActivation(event){
 return event.repeat&&['Enter','Space'].includes(event.code)&&!!event.target?.closest?.('button,summary');
}
export function installCommandFeedback(doc,{reduced=()=>false}={}){
 installButtonFeedback(doc,{soft:reduced});
 let pressed=null;
 const release=()=>{if(pressed)delete pressed.dataset.uiPressed;pressed=null;};
 const press=target=>{release();const button=target?.closest?.('button');if(button&&!button.disabled&&button.getAttribute('aria-disabled')!=='true'){pressed=button;button.dataset.uiPressed='true';}};
 doc.addEventListener('pointerdown',event=>{if(event.button===0)press(event.target);},true);
 for(const name of ['pointerup','pointercancel','keyup'])doc.addEventListener(name,release,true);
 doc.defaultView.addEventListener('blur',release);
 doc.addEventListener('keydown',event=>{
  if(repeatedUIActivation(event)){event.preventDefault();return;}
  if(['Enter','Space'].includes(event.code))press(event.target);
 },true);
 doc.addEventListener('click',event=>{
  release();const button=event.target?.closest?.('button');
  if(!button||button.disabled||button.getAttribute('aria-disabled')==='true'||reduced())return;
  // Input has no reward pulse. Accepted domain results use confirmButtonResult.
 });
}

export function showCommandResult(root,text){
 let status=root.querySelector('.ui-command-result');
 if(!status){status=root.ownerDocument.createElement('p');status.className='ui-command-result';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');root.append(status);}
 status.textContent=text;confirmButtonResult(root?.ownerDocument,'craft');return status;
}
