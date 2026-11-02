import {HUD_WIDGETS,getHudLayoutPreferences,hudPlacement} from './hud-layout.js';
export function createHudLayoutPresenter({preferences=getHudLayoutPreferences()}={}){
 const owned=new Map();let lastRoot=null,current=preferences.getState().current,dirty=true,resize=null,structure=null;const observed=new Set();
 const unsubscribe=preferences.subscribe(state=>{current=state.current;dirty=true;});
 function observe(root){
  const win=root.ownerDocument?.defaultView;if(!win?.ResizeObserver||resize)return;
  resize=new win.ResizeObserver(()=>{dirty=true;});resize.observe(root);observed.add(root);
  if(win.MutationObserver){structure=new win.MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))dirty=true;});structure.observe(root,{childList:true,subtree:true});}
 }
 function restore(node,state){if(observed.delete(node))resize?.unobserve?.(node);for(const [key,value,priority]of state.original){if(value)node.style.setProperty(key,value,priority);else node.style.removeProperty(key);}delete node.gvHudBaseBounds;delete node.dataset.hudAdjusted;delete node.dataset.hudLayoutHidden;owned.delete(node);}
 function clear(){resize?.disconnect();structure?.disconnect();resize=structure=null;observed.clear();for(const [node,state]of [...owned])restore(node,state);lastRoot=null;dirty=true;}
 function frame(root,override){
  if(!root||root.hidden)return;if(lastRoot&&lastRoot!==root)clear();lastRoot=root;
  const layout=override??current;
  // The normal HUD is already placed by CSS. Reading its bounds after the
  // rhythmic DOM updates forces a synchronous layout on every animation frame.
  if(!Object.keys(layout).length&&!owned.size)return;
  observe(root);if(resize&&!dirty&&!override)return;
  const rect=root.getBoundingClientRect(),factor=rect.width/root.clientWidth;if(!(factor>0))return;dirty=false;
  const reads=[];const active=new Set();
  for(const def of HUD_WIDGETS){const entry=layout[def.id];for(const node of root.querySelectorAll(def.selector)){
   const old=owned.get(node);if(!entry){if(old)restore(node,old);continue;}active.add(node);
   if(resize&&!observed.has(node)){resize.observe(node);observed.add(node);}
   let state=old;if(!state){state={dx:0,dy:0,scale:1,original:['translate','scale','transform-origin'].map(k=>[k,node.style.getPropertyValue(k),node.style.getPropertyPriority(k)]),nativeTranslate:null};owned.set(node,state);}
   const r=node.getBoundingClientRect();if(!r.width||!r.height){node.dataset.hudLayoutHidden=String(entry.hidden);continue;}
   let cx=(r.left-rect.left+r.width/2)/factor-state.dx,cy=(r.top-rect.top+r.height/2)/factor-state.dy;
   if(!state.applied&&entry.x!==undefined){const value=node.ownerDocument.defaultView.getComputedStyle(node).translate;const parts=value==='none'?[0,0]:value.split(/\s+/).map(parseFloat);cx-=parts[0]||0;cy-=parts[1]||0;}
   reads.push({node,state,entry,def,base:{left:cx-r.width/factor/state.scale/2,right:cx+r.width/factor/state.scale/2,top:cy-r.height/factor/state.scale/2,bottom:cy+r.height/factor/state.scale/2},place:hudPlacement({width:root.clientWidth,height:root.clientHeight,baseWidth:r.width/factor/state.scale,baseHeight:r.height/factor/state.scale,centerX:cx,centerY:cy,entry})});
  }}
  for(const [node,state]of [...owned])if(!active.has(node))restore(node,state);
  for(const {node,state,entry,def,place,base}of reads){
   node.gvHudBaseBounds=base;
   node.dataset.hudLayoutHidden=String(entry.hidden);node.dataset.hudAdjusted=String(entry.hidden||entry.scale!==1||entry.x!==undefined);
   node.style.setProperty('transform-origin',def.id==='items'?'0px 50%':'50% 50%','important');node.style.setProperty('scale',String(place.scale),'important');
   if(entry.x!==undefined){node.style.setProperty('translate',place.dx+'px '+place.dy+'px','important');state.dx=place.dx;state.dy=place.dy;}else{const [,value,priority]=state.original.find(x=>x[0]==='translate');if(value)node.style.setProperty('translate',value,priority);else node.style.removeProperty('translate');state.dx=state.dy=0;}
   state.scale=place.scale;state.applied=true;
  }
 }
 return {frame,clear,dispose(){clear();unsubscribe();}};
}
