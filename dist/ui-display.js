export const UI_DISPLAY_KEY='gemventure-ui-display-v1';
export const UI_PERCENT=Object.freeze({min:75,max:150,step:5,default:80});
export function normalizeUiPercent(value){const n=Number(value);return Number.isFinite(n)?Math.min(150,Math.max(75,Math.round(n/5)*5)):UI_PERCENT.default;}
export function uiDisplayMetrics(width,height,percent=UI_PERCENT.default){
 const automatic=Math.max(1,Math.min(2,Number(width)/1280,Number(height)/800));
 return {percent:normalizeUiPercent(percent),automatic,scale:Math.round(automatic*normalizeUiPercent(percent)/100*10000)/10000};
}
export function createUiPreferences({storage}={}){
 let percent=UI_PERCENT.default,persisted=true;const listeners=new Set();
 try{const raw=JSON.parse(storage?.getItem(UI_DISPLAY_KEY)??'null');if(raw?.version===1&&typeof raw.percent==='number')percent=normalizeUiPercent(raw.percent);}catch{persisted=false;}
 return {getState:()=>({percent,persisted}),subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},setPercent(value){
  percent=normalizeUiPercent(value);try{storage?.setItem(UI_DISPLAY_KEY,JSON.stringify({version:1,percent}));persisted=!!storage;}catch{persisted=false;}
  const state={percent,persisted};for(const fn of listeners)fn(state);return state;
 }};
}
// Pointer coordinates are physical CSS pixels; scrolling and layout use local pixels.
export function elementLayoutScale(element){const width=element?.offsetWidth,rect=element?.getBoundingClientRect?.();return width&&rect?.width?rect.width/width:1;}
export function normalizePopupViewport(root){
 let z=1;const win=root.ownerDocument.defaultView;
 for(let p=root.parentElement;p;p=p.parentElement){const value=parseFloat(win.getComputedStyle(p).zoom);if(value>0)z*=value;}
 const next=String(1/z);if(root.style.zoom!==next)root.style.zoom=next;
}
const stageIds=new Set(['explorationHud','villageActions','villagePlaceName','musicCue','runControls','procFeed','comboBurst','depthLift','runHud','objective','boostHud','targetTip','message','clearBanner','pauseCover','hud5Root','refugeLobby','bossHud','toast']);
const panelSelector='dialog,#gameSettings,#pauseCover .approved-pause-window,#clearBanner>.approved-service-host';
export function installUiDisplay(document,preferences){
 const win=document.defaultView,html=document.documentElement,stage=document.getElementById('stage');
 if(!stage||!win||!preferences)return null;
 const plane=document.createElement('div');plane.id='gvUiPlane';plane.setAttribute('aria-label','Interface do jogo');
 Object.assign(plane.style,{position:'absolute',left:'0',top:'0',transform:'translateZ(0)',transformOrigin:'0 0',zIndex:'20',pointerEvents:'none'});stage.append(plane);
 const css=document.createElement('style');css.id='gvUiDisplayStyles';css.textContent=`
 :where(#gvUiPlane)>*{pointer-events:auto}
 #tutorialOverlay .tutor-panel{zoom:var(--gv-ui-scale,1);width:min(360px,calc((100vw - 24px)/var(--gv-ui-scale,1)))}
 #tutorialOverlay .tutor-top{zoom:var(--gv-ui-scale,1);left:50%;max-width:calc((100vw - 24px)/var(--gv-ui-scale,1))}
 .tutor-training>header,.tutor-training>footer,.tutor-training .tutor-vitals,.tutor-training [data-training-exit]{zoom:var(--gv-ui-scale,1)}
 .tutor-training .tutor-vitals{max-width:calc((100vw - 32px)/var(--gv-ui-scale,1))}
 .tutor-training .tutor-pulse{transform:translate(-50%,-50%) scale(var(--gv-ui-scale,1))}
 `;document.head.append(css);
 let metrics,raf=0,disposed=false;const moved=new Map(),panels=new Set(),toolbar=document.querySelector('.game-toolbar');
 const originalToolbarZoom=toolbar?.style.getPropertyValue('zoom')||'';
 const put=(element,key,value,priority='')=>{if(element.style.getPropertyValue(key)!==value||element.style.getPropertyPriority(key)!==priority)element.style.setProperty(key,value,priority);};
 function adopt(){
  for(const node of [...stage.children,document.getElementById('bossHud'),document.getElementById('toast')]){
   if(!node||node===plane||!stageIds.has(node.id)||plane.contains(node))continue;
   // A presenter can legitimately move a node inside its own Shadow DOM.
   if(node.getRootNode()!==document)continue;
   const marker=document.createComment('UI display: '+node.id);
   if(!moved.has(node)){node.before(marker);moved.set(node,{marker,pointer:node.style.getPropertyValue('pointer-events')});}
   plane.append(node);
  }
 }
 function fit(panel){
  const scale=panel.id==='gameSettings'?Number(panel.dataset.uiScaleLock)||metrics.scale:metrics.scale;
  if(!plane.contains(panel))put(panel,'zoom',String(scale));
  put(panel,'max-width',`max(1px, calc((100vw - 24px) / ${scale}))`,'important');
  put(panel,'max-height',`max(1px, calc((100dvh - 24px) / ${scale}))`,'important');
  if(panel.id==='gameSettings')put(panel,'width',`min(760px, calc((100vw - 36px) / ${scale}))`,'important');
  if(plane.contains(panel)&&!panel.classList.contains('approved-pause-window'))put(panel,'overflow-y','auto','important');
  if(panel.classList.contains('approved-pause-window')){
   put(panel,'display','flex','important');put(panel,'flex-direction','column','important');put(panel,'box-sizing','border-box','important');
   put(panel,'height',`min(500px, calc((100dvh - 36px) / ${scale}))`,'important');put(panel,'overflow','hidden','important');
   for(const child of panel.children)put(child,'flex-shrink','0','important');
   const list=panel.querySelector('.approved-pause-content');if(list){put(list,'flex','1 1 auto','important');put(list,'min-height','0','important');put(list,'height','auto','important');put(list,'overflow','auto','important');}
  }
 }
 function refresh(){
  if(disposed)return;adopt();for(const node of document.querySelectorAll(panelSelector))panels.add(node);
  metrics=uiDisplayMetrics(win.innerWidth,win.innerHeight,preferences.getState().percent);
  put(html,'--gv-ui-scale',String(metrics.scale));put(html,'--gv-ui-percent',String(metrics.percent));
  html.dataset.uiPercent=String(metrics.percent);
  // CSS zoom already resolves percentages in the adjusted containing block.
  put(plane,'zoom',String(metrics.scale));put(plane,'width','100%');put(plane,'height','100%');
  for(const panel of panels){if(panel.isConnected)fit(panel);else panels.delete(panel);}
  for(const id of ['clearBanner','pauseCover']){const cover=document.getElementById(id);if(cover&&plane.contains(cover)){put(cover,'width','100%','important');put(cover,'height','100%','important');put(cover,'min-height','0','important');}}
  if(toolbar)put(toolbar,'zoom',plane.contains(toolbar)?originalToolbarZoom:String(metrics.scale));
 }
 function queue(){if(!raf)raf=win.requestAnimationFrame(()=>{raf=0;refresh();});}
 const observer=new win.MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1)))queue();});
 observer.observe(document.body,{childList:true,subtree:true});
 const uiChange=()=>{refresh();win.dispatchEvent(new win.Event('resize'));};
 const unsubscribe=preferences.subscribe(uiChange);win.addEventListener('resize',queue);document.addEventListener('gemventure-ui-unlock',refresh);
 refresh();return {refresh,getState:()=>({...metrics}),dispose(){disposed=true;unsubscribe();observer.disconnect();win.removeEventListener('resize',queue);document.removeEventListener('gemventure-ui-unlock',refresh);if(raf)win.cancelAnimationFrame(raf);for(const [node,{marker,pointer}]of moved){if(marker.isConnected){marker.replaceWith(node);put(node,'pointer-events',pointer);}}plane.remove();css.remove();if(toolbar)put(toolbar,'zoom',originalToolbarZoom);}};
}
