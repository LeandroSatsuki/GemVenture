const hudBox=r=>r&&[r.left,r.top,r.right,r.bottom,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0?r:null;
const hudOverlapX=(a,b,gap=0)=>a.right+gap>b.left&&a.left-gap<b.right;
function hudGaps(lane,top,bottom,obstacles,gap){
 const blocked=obstacles.filter(r=>hudOverlapX(lane,r,gap)&&r.bottom+gap>top&&r.top-gap<bottom).map(r=>[Math.max(top,r.top-gap),Math.min(bottom,r.bottom+gap)]).sort((a,b)=>a[0]-b[0]);
 const free=[];let cursor=top;for(const[a,b]of blocked){if(a>cursor)free.push([cursor,a]);cursor=Math.max(cursor,b);}if(cursor<bottom)free.push([cursor,bottom]);return free;
}
function hudRect(left,top,width,height){return {left,top,right:left+width,bottom:top+height,width,height};}
function planFloatingHud({bounds,pulse,depth,heat,explorationRect,cardsRect,controls=[],obstacles=[],minimumHeatTop=0,explorationHeight=0,cardsHeight=0,cardMinHeight=60,laneWidth=220,gap=12}={}){
 bounds=hudBox(bounds);if(!bounds||![minimumHeatTop,explorationHeight,cardsHeight,cardMinHeight,laneWidth,gap].every(Number.isFinite)||[explorationHeight,cardsHeight,cardMinHeight,laneWidth,gap].some(n=>n<0))return null;
 controls=controls.map(hudBox).filter(Boolean);obstacles=obstacles.map(hudBox).filter(Boolean);
 const top=bounds.top+gap,bottom=Math.min(bounds.bottom-gap,...controls.map(r=>r.top-gap)),right=Math.min(bounds.right-gap,hudBox(pulse)?.left-gap||Infinity),width=Math.min(laneWidth,right-bounds.left-gap);
 if(width<64||bottom<=top)return {status:'constrained',heat:null,exploration:null,cards:null,reason:'no usable lane'};
 let heatPlan=null;if(hudBox(heat)){const y=Math.max(minimumHeatTop,hudBox(depth)?.bottom+gap||top),free=hudGaps(heat,y,bottom,[...obstacles,...[explorationRect,cardsRect].map(hudBox).filter(Boolean)],gap),fit=free.find(([a,b])=>b-a>=heat.height);if(fit)heatPlan=hudRect(heat.left,fit[0],heat.width,heat.height);obstacles.push(heatPlan||heat);}
 const lane={left:right-width,right},free=hudGaps(lane,top,bottom,[...obstacles,...[cardsRect].map(hudBox).filter(Boolean)],gap);let exploration=null;
 if(explorationHeight>0){const fit=[...free].reverse().find(([a,b])=>b-a>=explorationHeight);if(fit)exploration=hudRect(lane.left,fit[1]-explorationHeight,width,explorationHeight);}
 const cardFree=hudGaps(lane,top,bottom,[...obstacles,...(exploration?[exploration]:[explorationRect].map(hudBox).filter(Boolean))],gap).sort((a,b)=>(b[1]-b[0])-(a[1]-a[0])||b[1]-a[1]);let cards=null;
 if(cardsHeight>0){const fit=cardFree.find(([a,b])=>b-a>=Math.min(cardsHeight,cardMinHeight));if(fit){const h=Math.min(cardsHeight,fit[1]-fit[0]);cards={...hudRect(lane.left,fit[1]-h,width,h),scroll:cardsHeight>h+.5};}}
 return {status:(!heat||heatPlan)&&(!explorationHeight||exploration)&&(!cardsHeight||cards)?'safe':'constrained',heat:heatPlan,exploration,cards,laneWidth:width,free,physical:false};
}

const railLeft=['depthLift','frenzyHud','objective','missionHud','targetTip'];
const railRight=['explorationHud','runCards','breathHud','scoreHud','runHud','bossHud','boostHud','procFeed','comboBurst','musicCue'];
const hudIntersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
export function planCaveHudLayout(input={}){
 const notices=(input.notices||[]).filter(n=>hudBox(n.rect)),floating=planFloatingHud({...input,obstacles:[...(input.obstacles||[]),...notices.map(n=>n.rect)]});
 if(!floating)return null;
 if(floating.status==='safe'&&!input.forceRails)return {...floating,mode:'floating',reflowIds:[],alertViewports:[]};
 const bounds=hudBox(input.bounds),gap=input.gap??12,top=bounds.top+gap,bottom=Math.min(bounds.bottom-gap,...(input.controls||[]).map(hudBox).filter(Boolean).map(r=>r.top-gap)),right=Math.min(bounds.right-gap,hudBox(input.pulse)?.left-gap||Infinity),left=bounds.left+gap,width=right-left,height=bottom-top;
 // Below these explicit dimensions the player must enlarge the content area.
 if(width<176||height<112)return {...floating,mode:'unsupported-area',status:'unsupported-area',reason:'usable HUD area below 176x112 CSSpx',alertViewports:[],reflowIds:[]};
 const innerGap=8,n=notices.length,alertBudget=n?Math.min(Math.max(70,height*.28),height-56-innerGap):0,railHeight=height-(n?alertBudget+innerGap:0),mapMinimum=width<400?64:width*.36,space=width-mapMinimum,leftWidth=Math.min(170,Math.max(56,space*.35)),rightWidth=Math.min(220,space-leftWidth);
 const rails={left:hudRect(left,top,leftWidth,railHeight),right:hudRect(right-rightWidth,top,rightWidth,railHeight)},mapCorridor=hudRect(left+leftWidth,top,width-leftWidth-rightWidth,railHeight),alertViewports=[];
 if(n)alertViewports.push({id:'notices',noticeIds:notices.map(n=>n.id),...hudRect(left,top+railHeight+innerGap,width,alertBudget),scroll:true});
 // Only neighbors actually colliding with the reserved areas join the flow.
 const zones=[rails.left,rails.right,...alertViewports],required=['depthLift','frenzyHud','explorationHud','runCards'];
 const unknown=(input.obstacles||[]).filter(r=>!railLeft.includes(r.id)&&!railRight.includes(r.id)&&zones.some(z=>hudIntersects(r,z)));if(unknown.length)return {...floating,mode:'unsupported-obstacle',status:'unsupported-obstacle',reason:'unreserved obstacle in fallback area',alertViewports:[],reflowIds:[]};
 const reflowIds=[...new Set([...required,...(input.obstacles||[]).filter(r=>r.id&&zones.some(z=>hudIntersects(r,z))).map(r=>r.id)])];
 return {mode:'rails',status:'safe-scroll',rails,mapCorridor,alertViewports,reflowIds,leftOrder:railLeft.filter(id=>reflowIds.includes(id)),rightOrder:railRight.filter(id=>reflowIds.includes(id)),flowGap:12,contentTruncated:false,physical:false,floatingAttempt:floating.status};
}

const hudInstances=new WeakMap();
export function installCaveHudLayout(doc=globalThis.document,{onLayout}={}){
 if(!doc?.body||!doc.defaultView)return null;if(hudInstances.has(doc))return hudInstances.get(doc);
 const win=doc.defaultView,byId=id=>doc.getElementById(id),main=doc.querySelector('main'),ids=[...railLeft,...railRight,'toast','message'],nodes=new Map(ids.map(id=>[id,byId(id)]).filter(([,n])=>n));
 if(!main||!['depthLift','frenzyHud','explorationHud','runCards'].every(id=>nodes.has(id)))return null;
 const controls=['controlDeck','itemBar','inspectSkills','extract'].map(byId).filter(Boolean),pulse=byId('runControls'),styleKeys=['--gv-hud-left','--gv-hud-top','--gv-hud-width','--gv-hud-height'],attrKeys=['data-gv-hud-placement','data-gv-hud-fit','data-gv-hud-scroll','data-gv-flow','data-gv-notice-flow','tabindex'];
 const saved=new Map([...nodes].map(([id,node])=>[id,{node,styleWasNull:node.getAttribute('style')===null,styles:styleKeys.map(key=>({key,value:node.style.getPropertyValue(key),priority:typeof node.style.getPropertyPriority==='function'?node.style.getPropertyPriority(key):''})),attrs:attrKeys.map(key=>({key,value:node.getAttribute(key)}))}]));
 const anchors=new Map(),panes=new Map(),cleanups=[];let disposed=false,queued=false,last=null,latched=false,viewportKey='',visibilityKey='',deferredEvaluation=false,baseHeatTop=null;
 const attr=(n,k,v)=>{if(v===null){if(n.hasAttribute(k))n.removeAttribute(k);}else if(n.getAttribute(k)!==v)n.setAttribute(k,v);};
 const style=(n,k,v,p='')=>{if(v){if(n.style.getPropertyValue(k)!==v)n.style.setProperty(k,v,p);}else if(n.style.getPropertyValue(k))n.style.removeProperty(k);};
 const notify=()=>{if(typeof onLayout==='function')onLayout();};
 function restoreNode(id){const x=saved.get(id);if(!x)return;for(const s of x.styles)style(x.node,s.key,s.value,s.priority);for(const a of x.attrs)attr(x.node,a.key,a.value);if(x.styleWasNull&&x.node.getAttribute('style')==='')x.node.removeAttribute('style');}
 function transfer(parent,node,before=null){const focused=doc.activeElement,keep=focused&&(node===focused||node.contains?.(focused));if(typeof parent.moveBefore==='function'&&node.isConnected)parent.moveBefore(node,before);else{parent.insertBefore(node,before);if(keep&&doc.activeElement!==focused)focused.focus?.({preventScroll:true});}}
 function restoreParents(){for(const [id,anchor]of anchors){if(anchor.parentNode){transfer(anchor.parentNode,nodes.get(id),anchor);anchor.remove();}}anchors.clear();for(const pane of panes.values())pane.remove();panes.clear();}
 function reset(){restoreParents();for(const id of nodes.keys())restoreNode(id);latched=false;deferredEvaluation=false;baseHeatTop=null;last=null;}
 function visible(n){if(!n?.isConnected||n.hidden||n.inert||n.closest('[hidden],[inert]'))return false;const s=win.getComputedStyle(n);return s.display!=='none'&&s.visibility!=='hidden';}
 const rect=n=>visible(n)?hudBox(n.getBoundingClientRect?.()):null;
 function observedRect(id){const node=nodes.get(id);let r=rect(node);if(id==='runHud'&&visible(node)){const children=[...node.querySelectorAll('.combo,.vital,.track-card')].map(rect).filter(Boolean);if(children.length){const left=Math.min(...children.map(x=>x.left)),top=Math.min(...children.map(x=>x.top));r=hudRect(left,top,Math.max(...children.map(x=>x.right))-left,Math.max(...children.map(x=>x.bottom))-top);}}return r?{...r,id}:null;}
 function place(node,r){for(const[k,v]of[['left',r.left],['top',r.top],['width',r.width],['height',r.height]])style(node,'--gv-hud-'+k,Math.round(v*100)/100+'px');}
 function paneFor(side,r){let pane=panes.get(side);if(!pane){pane=doc.createElement('section');pane.className=side==='notices'?'gv-cave-alerts':'gv-cave-rail';pane.setAttribute('data-gv-rail',side);pane.setAttribute('role','region');pane.setAttribute('aria-label',side==='left'?'Elevador, calor e indicadores da expedição':side==='right'?'Exploração, cartas e indicadores da expedição':'Avisos da expedição; rolagem vertical');pane.setAttribute('tabindex','0');if(side!=='notices'){const caption=doc.createElement('p');caption.textContent=side==='left'?'EXPEDIÇÃO ↕':'EXPLORA · CARTAS ↕';pane.append(caption);}const parent=side==='notices'?byId('stage'):main;parent.insertBefore(pane,side==='notices'?byId('world'):byId('stage'));panes.set(side,pane);}attr(pane,'data-gv-narrow',r.width<140?'true':null);place(pane,r);return pane;}
 function move(id,pane){const node=nodes.get(id);if(!node)return;if(!anchors.has(id)){const marker=doc.createComment('gv-hud-origin:'+id);node.before(marker);anchors.set(id,marker);}attr(node,'data-gv-flow','true');if(node.parentNode!==pane)transfer(pane,node);}
 function sync(){if(disposed)return null;if(doc.body.classList.contains('hud-v5')){if(anchors.size||latched)reset();return {mode:'hud-v5'};}if(!doc.body.classList.contains('immersive-run')){reset();notify();return null;}try{
  const key=win.innerWidth+'x'+win.innerHeight,mask=[...nodes].map(([id,n])=>id+':'+visible(n)).join('|')+'|'+nodes.get('runCards').childElementCount+'|'+nodes.get('toast')?.classList.contains('show')+'|'+!!nodes.get('message')?.textContent.trim()+'|'+visible(byId('liveQuest'))+'|'+visible(byId('rescueHud')),reading=!!doc.activeElement?.closest?.('.gv-cave-rail,.gv-cave-alerts');
  if(key!==viewportKey||latched&&mask!==visibilityKey||deferredEvaluation){if(reading&&latched)deferredEvaluation=true;else reset();}viewportKey=key;visibilityKey=mask;
  const bounds=rect(main);if(!bounds){reset();return null;}
  const h=rect(nodes.get('frenzyHud')),e=rect(nodes.get('explorationHud')),c=rect(nodes.get('runCards'));if(baseHeatTop===null&&h)baseHeatTop=h.top+12;
  const notices=['message','toast'].map(id=>({id,node:nodes.get(id)})).filter(x=>visible(x.node)&&(x.id==='toast'?x.node.classList.contains('show'):!!x.node.textContent.trim())).map(x=>({id:x.id,rect:rect(x.node)}));
  if(!notices.length&&doc.activeElement?.closest?.('.gv-cave-alerts')){const r=hudBox(panes.get('notices')?.getBoundingClientRect?.())||last?.alertViewports?.[0];if(r)notices.push({id:'focus-hold',rect:r});}
  const obstacles=[...nodes.keys()].filter(id=>!['frenzyHud','explorationHud','runCards','toast','message'].includes(id)).map(observedRect).filter(Boolean);for(const id of ['liveQuest','rescueHud']){const r=rect(byId(id));if(r)obstacles.push({...r,id:'frenzyHud'});}
  const first=nodes.get('runCards').querySelector('.card-chip');
  const plan=planCaveHudLayout({bounds,pulse:rect(pulse),depth:rect(nodes.get('depthLift')),heat:h,explorationRect:e,cardsRect:c,controls:controls.map(rect).filter(Boolean),obstacles,notices,minimumHeatTop:baseHeatTop??bounds.top+12,explorationHeight:e?.height||0,cardsHeight:c?Math.max(nodes.get('runCards').scrollHeight||c.height,c.height):0,cardMinHeight:rect(first)?.height||60,laneWidth:win.innerWidth<=800?132:220,forceRails:latched});
  if(!plan)return null;
  if(plan.mode==='rails'){
   latched=true;const left=paneFor('left',plan.rails.left),right=paneFor('right',plan.rails.right);
   // Once a neighbor joins this viewport's flow, retain it until resize or exit.
   for(const id of railLeft)if(plan.reflowIds.includes(id)||anchors.has(id))move(id,left);
   for(const id of railRight)if(plan.reflowIds.includes(id)||anchors.has(id))move(id,right);
   for(const id of ['depthLift','frenzyHud','explorationHud','runCards']){restoreNode(id);attr(nodes.get(id),'data-gv-flow','true');attr(nodes.get(id),'data-gv-hud-fit','safe-scroll');}
   const alert=plan.alertViewports[0];if(alert)paneFor('notices',alert);for(const id of ['message','toast']){restoreNode(id);if(alert?.noticeIds.includes(id)){const pane=panes.get('notices');move(id,pane);attr(nodes.get(id),'data-gv-flow',null);attr(nodes.get(id),'data-gv-notice-flow','true');}else if(anchors.has(id)){const marker=anchors.get(id);if(marker.parentNode){transfer(marker.parentNode,nodes.get(id),marker);marker.remove();}anchors.delete(id);}}
   if(!alert&&panes.has('notices')){panes.get('notices').remove();panes.delete('notices');}
   plan.flowMembers={left:[...left.children].filter(n=>n.id).map(n=>n.id),right:[...right.children].filter(n=>n.id).map(n=>n.id)};
  }else if(plan.mode==='floating'){
   for(const [id,r]of [['frenzyHud',plan.heat],['explorationHud',plan.exploration],['runCards',plan.cards]]){restoreNode(id);if(r){place(nodes.get(id),r);attr(nodes.get(id),'data-gv-hud-placement','safe');attr(nodes.get(id),'data-gv-hud-fit','safe');}}
   if(plan.cards?.scroll){const node=nodes.get('runCards');attr(node,'data-gv-hud-scroll','true');attr(node,'tabindex','0');if(!anchors.has('runCards')){const marker=doc.createComment('gv-hud-origin:runCards');node.before(marker);anchors.set('runCards',marker);}if(node.nextElementSibling!==byId('stage'))transfer(main,node,byId('stage'));}else if(anchors.has('runCards')){const marker=anchors.get('runCards');if(marker.parentNode){transfer(marker.parentNode,nodes.get('runCards'),marker);marker.remove();}anchors.delete('runCards');}
  }else{for(const id of ['depthLift','frenzyHud','explorationHud','runCards'])attr(nodes.get(id),'data-gv-hud-fit','unsupported-area');}
  last=plan;notify();return plan;
 }catch(error){reset();last={status:'unmeasured',reason:String(error)};return last;}}
 function schedule(){if(disposed||queued)return;queued=true;(win.queueMicrotask?.bind(win)||((f)=>Promise.resolve().then(f)))(()=>{queued=false;sync();});}
 function resize(){viewportKey='';schedule();}
 const listen=(n,event,fn)=>{n?.addEventListener?.(event,fn);cleanups.push(()=>n?.removeEventListener?.(event,fn));};listen(win,'resize',resize);listen(win.visualViewport,'resize',resize);listen(doc.fonts,'loadingdone',()=>{deferredEvaluation=true;schedule();});listen(doc,'focusout',schedule);
 if(typeof win.ResizeObserver==='function'){const o=new win.ResizeObserver(schedule);for(const node of [main,pulse,...nodes.values(),...controls].filter(Boolean))o.observe(node);cleanups.push(()=>o.disconnect());}
 if(typeof win.MutationObserver==='function'){const o=new win.MutationObserver(schedule);o.observe(doc.body,{attributes:true,attributeFilter:['class']});for(const node of nodes.values())o.observe(node,{attributes:true,attributeFilter:['class','hidden','inert'],childList:true,subtree:true,characterData:true});cleanups.push(()=>o.disconnect());}
 const api=Object.freeze({sync,release:reset,getState:()=>last,dispose(){if(disposed)return;disposed=true;for(const f of cleanups)f();reset();notify();hudInstances.delete(doc);}});hudInstances.set(doc,api);sync();return api;
}

export function releaseCaveHudLayout(doc=globalThis.document){hudInstances.get(doc)?.release?.();}
