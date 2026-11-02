import {LevelProgressNotice} from './level-progress-notice.js';
import {discoverySlot} from './discovery-notices.js';

const obstacles='#hud5Root .top,#hud5Root .location,.cave-combo-guard,.run-orb-tray,#targetTip,#runCards .card-chip,#objective,#hud5Root .boost-node,#hud5Root .proc-label,#hud5Root .items,#hud5Root .rail,#hud5Root .score,#hud5Root .mission,.cave-miniboss-status,.cave-miniboss-warning,#approvedDiscoveryNotice,#refugeLobby .head,#refugeLobby button,#refugeResourceDock';
export function createLevelProgressNotice({document:doc}){
 const model=new LevelProgressNotice(),win=doc.defaultView,animations=new Set();let root=null,link=null,observer=null,last=null,lastMeasure=-Infinity,dirty=true,slot=null,shown=false,rendered=null,arrived=null,bar=null,art=null,title=null,points=null,xp=null,track=null;
 const invalidate=()=>{dirty=true;};
 const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 function mount(){
  const plane=doc.getElementById('gvUiPlane')||doc.getElementById('stage');if(!plane)return false;
  if(!link){link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./approved-level-progress-ui.css',import.meta.url).href;link.addEventListener('load',invalidate);doc.head.append(link);}
  if(!root){root=doc.createElement('div');root.id='approvedLevelNotice';root.hidden=true;root.setAttribute('aria-hidden','true');root.innerHTML='<div class="gv-level-notice"><img src="assets/refuge-night-v3/echo-tree.png" alt="" draggable="false"><div class="gv-level-copy"><div class="gv-level-heading" role="status" aria-live="polite" aria-atomic="true"><strong></strong><b></b></div><div class="gv-level-track" role="progressbar" aria-label="Experiência no nível atual" aria-valuemin="0"><i></i></div><small></small></div></div>';plane.append(root);
   art=root.querySelector('img');title=root.querySelector('strong');points=root.querySelector('b');xp=root.querySelector('small');track=root.querySelector('[role=progressbar]');bar=track.querySelector('i');
   if(win.ResizeObserver){observer=new win.ResizeObserver(invalidate);observer.observe(plane);observer.observe(root);}win.addEventListener('resize',invalidate);doc.fonts?.addEventListener?.('loadingdone',invalidate);
  }return true;
 }
 function hide(){if(root){root.style.visibility='hidden';root.setAttribute('aria-hidden','true');}shown=false;for(const a of animations)if(a.playState==='running')a.pause();}
 function cancel(){for(const a of animations)a.cancel();animations.clear();}
 function animate(node,frames,options){const a=node.animate?.(frames,options);if(a){animations.add(a);a.onfinish=()=>animations.delete(a);}}
 function measure(profile,now){
  const plane=root.parentElement,rect=plane.getBoundingClientRect(),scale=rect.width/plane.clientWidth;if(!(scale>0))return null;
  const width=plane.clientWidth,height=plane.clientHeight;root.style.width=Math.min(352,Math.max(240,width*.32),width-24)+'px';const occupied=[];
  for(const e of doc.querySelectorAll(obstacles)){const r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('[hidden]'))continue;const style=win.getComputedStyle(e);if(style.visibility!=='visible'||style.opacity==='0')continue;occupied.push({left:(r.left-rect.left)/scale,right:(r.right-rect.left)/scale,top:(r.top-rect.top)/scale,bottom:(r.bottom-rect.top)/scale});}
  if(profile.run)occupied.push({left:width*.35,right:width*.65,top:height*.25,bottom:height*.72});
  const options={width,height,noticeWidth:root.offsetWidth,noticeHeight:root.offsetHeight,obstacles:occupied};let result=discoverySlot(options);
  if(!result&&!profile.run){const nav=doc.querySelector('#refugeLobby .nav')?.getBoundingClientRect();if(nav?.width)result=discoverySlot({...options,left:Math.ceil((nav.right-rect.left)/scale+12)});}
  dirty=false;lastMeasure=now;return result;
 }
 return {
  accept(events,profile){const count=model.accept(events,profile);if(count)dirty=true;return count;},
  frame(now,{profile,blocked=false,soft=false}={}){
   const delta=last===null?0:Math.max(0,Math.min(50,now-last));last=now;let view=model.view(profile);
   if(!view){if(root)root.hidden=true;cancel();rendered=null;arrived=null;shown=false;return;}
   if(blocked||doc.hidden){hide();dirty=true;return;}if(!mount())return;root.hidden=false;
   if(rendered!==view.serial){cancel();rendered=view.serial;arrived=null;dirty=true;}
   text(title,'Nível '+view.level);text(points,'+'+view.points+' '+(view.points===1?'ponto':'pontos'));text(xp,view.xp+' / '+view.max+' XP');track.setAttribute('aria-valuenow',String(view.xp));track.setAttribute('aria-valuemax',String(view.max));bar.style.width=view.ratio*100+'%';
   if(dirty||now-lastMeasure>=250)slot=measure(profile,now);
   if(!slot||!link.sheet){hide();return;}
   model.advance(shown?delta:0);view=model.view(profile);if(!view){hide();root.hidden=true;return;}
   root.style.left=slot.left+'px';root.style.top=slot.top+'px';root.style.visibility='visible';root.setAttribute('aria-hidden','false');
   const reduced=soft||!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   if(reduced){cancel();arrived=view.serial;}
   else if(arrived!==view.serial){animate(art,[{transform:'scale(.9) translateY(3px)'},{transform:'scale(1.05) translateY(-1px)',offset:.65},{transform:'scale(1) translateY(0)'}],{duration:260,easing:'ease-out'});animate(bar,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:230,easing:'ease-out'});arrived=view.serial;}
   else for(const a of animations)if(a.playState==='paused')a.play();shown=true;
  },
  invalidateLayout:invalidate,
  dispose(){cancel();observer?.disconnect();win.removeEventListener('resize',invalidate);doc.fonts?.removeEventListener?.('loadingdone',invalidate);root?.remove();link?.remove();},
 };
}
