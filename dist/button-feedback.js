// Approved VFX-BUTTONS-P1: presentation only, with domain-owned confirmation.
export const BUTTON_FEEL=Object.freeze({pressPx:2,releaseMs:140,selectMs:160,depositMs:300,craftMs:520,softMs:180,maxEffects:2,maxSeen:64,glints:4});
const instances=new WeakMap();
const CSS=`
:where(button[data-gv-button]){position:relative}
button[data-gv-button]>[data-gv-button-face]{translate:0 0;transition:translate 140ms cubic-bezier(.2,.8,.2,1)}
button[data-gv-button]>gv-button-label{display:inline-block}
button[data-gv-button][data-gv-held=true]:not(:disabled)>[data-gv-button-face]{translate:0 2px;transition:none}
button[data-gv-button][data-gv-held=true]:not(:disabled){box-shadow:inset 0 4px var(--gv-bg,#041025),0 1px var(--gv-edge,#020816)!important}
button[data-gv-button][data-gv-soft=true]>[data-gv-button-face]{translate:none!important;transition:none!important}
button[data-gv-button]>[data-gv-button-selection]{position:absolute;left:12px;right:12px;bottom:5px;height:2px;border-radius:1px;background:var(--gv-select,#35d6f2);transform:scaleX(0);opacity:0;transform-origin:center;transition:transform 160ms cubic-bezier(.2,.8,.2,1),opacity 120ms;pointer-events:none}
button[data-gv-button][data-gv-selected=true]>[data-gv-button-selection]{transform:scaleX(1);opacity:1}
button[data-gv-button][data-gv-soft=true]>[data-gv-button-selection]{transition:none}
@media(prefers-reduced-motion:reduce){button[data-gv-button]>[data-gv-button-face]{translate:none!important;transition:none!important}button[data-gv-button]>[data-gv-button-selection]{transition:none}}
`;
export function confirmationPlan(kind,{accepted=true,soft=false}={}){if(!accepted||!['deposit','craft','building','set','unset','refund'].includes(kind))return null;return{duration:soft?BUTTON_FEEL.softMs:kind==='deposit'?BUTTON_FEEL.depositMs:BUTTON_FEEL.craftMs,glints:soft||['deposit','unset','refund'].includes(kind)?0:BUTTON_FEEL.glints};}
export function buttonIdentity(button){return{id:button.id||'',data:Object.entries(button.dataset||{}).filter(([k])=>!k.startsWith('gv')&&!k.startsWith('ui')&&!['cost','level','ready','selected'].includes(k))};}
export function resolveButton(scope,original,identity){
 if(original?.isConnected&&original.getRootNode()===scope.getRootNode?.())return original;
 if(!identity.id&&!identity.data.length)return null;
 return [...scope.querySelectorAll('button')].find(b=>identity.id?b.id===identity.id:identity.data.every(([k,v])=>b.dataset[k]===v))||null;
}
export function installButtonFeedback(doc,{soft}={}){
 if(instances.has(doc)){const api=instances.get(doc);if(soft)api.setSoftReader(soft);return api;}
 if(!doc?.documentElement||!doc.createElement||!doc.defaultView?.MutationObserver)return null;
 const win=doc.defaultView,media=win.matchMedia('(prefers-reduced-motion: reduce)'),scopes=new Map(),effects=new Map(),seen=new Set(),listeners=[];
 let readSoft=soft||(()=>false),softMode=false,held=null,current=null,sequence=0,dead=false;
 const counters={presses:0,confirmed:0,cancelled:0};
 const reduced=b=>media.matches||!!readSoft()||!!b?.closest('[data-soft=true]');
 const usable=b=>!!b?.isConnected&&!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&!b.closest('[hidden],[inert]')&&b.checkVisibility?.()!==false&&b.getClientRects().length>0;
 const eventButton=e=>(e.composedPath?.()||[e.target]).find(n=>n?.tagName==='BUTTON')||e.target?.closest?.('button');
 function cancel(button){const e=effects.get(button);if(!e)return;effects.delete(button);e.animations.forEach(a=>a.cancel());e.svg.remove();counters.cancelled++;}
 function release(){if(held){delete held.dataset.gvHeld;held=null;}}
 function clear(){release();for(const b of [...effects.keys()])cancel(b);current=null;}
 function prepare(b,entry){
  entry.buttons.add(b);b.dataset.gvButton='true';b.dataset.gvSoft=String(reduced(b));
  // Keep existing elements/direct-child selectors and card layouts intact.
  for(const n of [...b.childNodes]){
   if(n.nodeType===3&&n.textContent.trim()){const label=doc.createElement('gv-button-label');n.replaceWith(label);label.append(n);label.dataset.gvButtonFace='';}
   else if(n.nodeType===1&&!n.hasAttribute('data-gv-button-overlay'))n.dataset.gvButtonFace='';
  }
  const selectable=b.matches('.button,.tab,.filter,.sector,[role=tab],nav button')&&(b.hasAttribute('aria-pressed')||b.hasAttribute('aria-selected')||b.matches('.tab,.filter,.sector,nav button'));
  if(selectable){let line=b.querySelector(':scope > [data-gv-button-selection]');if(!line){line=doc.createElement('i');line.dataset.gvButtonOverlay='';line.dataset.gvButtonSelection='';line.setAttribute('aria-hidden','true');b.append(line);}b.dataset.gvSelected=String(b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true'||!b.hasAttribute('aria-pressed')&&!b.hasAttribute('aria-selected')&&(b.classList.contains('active')||b.classList.contains('selected')));}
 }
 function scan(node,entry){if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;if(node.matches?.('button'))prepare(node,entry);for(const b of node.querySelectorAll('button'))prepare(b,entry);if(node.shadowRoot)register(node.shadowRoot);for(const e of node.querySelectorAll('*'))if(e.shadowRoot)register(e.shadowRoot);}
 function prune(){for(const [root,entry]of scopes){if(root.host&&!root.host.isConnected){entry.observer.disconnect();entry.style.remove();scopes.delete(root);}for(const b of entry.buttons)if(!b.isConnected){cancel(b);entry.buttons.delete(b);}}for(const [b,e]of effects)if(!usable(b)||!e.svg.isConnected)cancel(b);if(held&&!usable(held))release();}
 function syncMode(){const next=media.matches||!!readSoft();if(next!==softMode){softMode=next;clear();for(const entry of scopes.values())for(const b of entry.buttons)b.dataset.gvSoft=String(reduced(b));}}
 function register(root){
  if(root.host&&!root.host.matches('.approved-service-host'))return;
  if(scopes.has(root))return;const style=doc.createElement('style');style.dataset.gvButtonStyles='';style.textContent=CSS;(root===doc?doc.head:root).append(style);
  const entry={style,buttons:new Set(),observer:null};scopes.set(root,entry);
  entry.observer=new win.MutationObserver(records=>{if(dead)return;for(const r of records){if(r.type==='attributes'){if(r.target.tagName==='BUTTON')prepare(r.target,entry);else if(r.attributeName==='class'||r.attributeName==='hidden')syncMode();}else{const button=r.target.closest?.('button');if(button)prepare(button,entry);for(const n of r.addedNodes)scan(n,entry);}}prune();});
  entry.observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-selected','disabled','class','hidden','inert','open','data-soft']});scan(root,entry);
 }
 function on(target,name,fn,options=true){target.addEventListener(name,fn,options);listeners.push(()=>target.removeEventListener(name,fn,options));}
 function press(b){release();if(!usable(b))return;const root=b.getRootNode();register(root);if(!scopes.has(root))return;prepare(b,scopes.get(root));held=b;b.dataset.gvHeld='true';counters.presses++;}
 function capture(b){if(!b)return null;const scope=b.getRootNode()===doc?(b.closest('dialog')||doc):b.getRootNode();return{original:b,scope,identity:buttonIdentity(b),id:++sequence};}
 function confirm(token,kind,{accepted=true}={}){
  if(dead||!token)return false;const {scope,identity,original,id}=token;if(scope.host&&!scope.host.isConnected)return false;
  const b=resolveButton(scope,original,identity),plan=confirmationPlan(kind,{accepted,soft:reduced(b)});
  if(!plan||!b?.isConnected||doc.hidden||b.closest('[hidden],[inert]')||b.checkVisibility?.()===false||!b.getClientRects().length||seen.has(id))return false;
  seen.add(id);if(seen.size>BUTTON_FEEL.maxSeen)seen.delete(seen.values().next().value);const root=b.getRootNode();register(root);prepare(b,scopes.get(root));cancel(b);while(effects.size>=BUTTON_FEEL.maxEffects)cancel(effects.keys().next().value);
  const ns='http://www.w3.org/2000/svg',make=n=>doc.createElementNS(ns,n),w=b.clientWidth,h=b.clientHeight,svg=make('svg');svg.dataset.gvButtonOverlay='';svg.dataset.gvButtonConfirmation=kind;svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;overflow:visible;pointer-events:none;translate:none;transform:none;filter:none;z-index:2';
  const rim=make('rect');for(const [k,v]of Object.entries({x:1,y:1,width:w-2,height:h-2,rx:Math.min(8,w/4,h/4),fill:'none',stroke:['deposit','unset','refund'].includes(kind)?'var(--gv-success,#67e3b8)':'var(--gv-gold-hover,#ffcc32)','stroke-width':1.5}))rim.setAttribute(k,String(v));svg.append(rim);
  const glints=make('g');for(let i=0;i<plan.glints;i++){const x=i%2?w-7:7,y=i<2?5:h-5,g=make('g');g.setAttribute('transform',`translate(${x} ${y})`);for(const [points,fill]of [['0,-3 2,0 0,3 -2,0','var(--gv-gold-hover,#ffcc32)'],['0,-3 2,0 0,0','var(--gv-text,#edf4ff)']]){const p=make('polygon');p.setAttribute('points',points);p.setAttribute('fill',fill);g.append(p);}glints.append(g);}svg.append(glints);b.append(svg);
  const animations=[svg.animate([{opacity:0},{opacity:1,offset:.14},{opacity:.85,offset:.45},{opacity:0}],{duration:plan.duration,easing:'ease-out'})];if(plan.glints)animations.push(glints.animate([{transform:'translateY(1px)'},{transform:'translateY(-3px)'}],{duration:plan.duration,easing:'ease-out'}));
  const e={svg,animations,glints:plan.glints};effects.set(b,e);counters.confirmed++;Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(effects.get(b)===e){svg.remove();effects.delete(b);}});return true;
 }
 register(doc);syncMode();
 on(doc,'pointerdown',e=>{if(e.button===0)press(eventButton(e));});
 for(const name of ['pointerup','pointercancel','keyup'])on(doc,name,release);
 on(doc,'keydown',e=>{if(['Enter','Space'].includes(e.code)&&!e.repeat)press(eventButton(e));});
 on(doc,'click',e=>{release();current=null;const b=eventButton(e);if(!usable(b)||b.getRootNode().host&&!b.getRootNode().host.matches('.approved-service-host'))return;const token=capture(b);current=token;queueMicrotask(()=>{if(current===token)current=null;});});
 on(win,'blur',clear);on(doc,'visibilitychange',()=>{if(doc.hidden)clear();});on(media,'change',syncMode);
 const api={
  current:()=>current,capture,confirm,clear,syncMode,setSoftReader(fn){readSoft=fn;syncMode();},
  read:()=>({scopeRoots:[...scopes].map(([root,e])=>({type:root.nodeType,host:root.host?.className||root.host?.id||null,connected:root.host?.isConnected,buttons:e.buttons.size})),...counters,scopes:scopes.size,buttons:[...scopes.values()].reduce((n,e)=>n+e.buttons.size,0),effects:effects.size,glints:[...effects.values()].reduce((n,e)=>n+e.glints,0),seen:seen.size,held:held?.id||null,soft:softMode,disposed:dead}),
  dispose(){if(dead)return;dead=true;clear();listeners.forEach(fn=>fn());for(const entry of scopes.values()){entry.observer.disconnect();entry.style.remove();for(const b of entry.buttons){delete b.dataset.gvButton;delete b.dataset.gvHeld;delete b.dataset.gvSoft;delete b.dataset.gvSelected;b.querySelectorAll(':scope > [data-gv-button-overlay]').forEach(n=>n.remove());for(const e of b.querySelectorAll(':scope > [data-gv-button-face]')){delete e.dataset.gvButtonFace;if(e.tagName==='GV-BUTTON-LABEL')e.replaceWith(...e.childNodes);}}}scopes.clear();seen.clear();instances.delete(doc);}
 };instances.set(doc,api);return api;
}
// Capture while the domain callback is synchronous; paint after its native render.
// No click handler, timer, sound, save, cost or command is introduced here.
export function confirmButtonResult(target,kind='craft',options={}){
 const doc=target?.ownerDocument||target?.nodeType===9&&target||globalThis.document,api=doc&&instances.get(doc);if(!api)return false;
 const token=target?.tagName==='BUTTON'?(api.current()?.original===target?api.current():api.capture(target)):api.current();if(!token)return false;
 queueMicrotask(()=>api.confirm(token,kind,options));return true;
}
export function buttonFeedbackStatus(doc=globalThis.document){return instances.get(doc)?.read()||{installed:false};}
