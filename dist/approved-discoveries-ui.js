import {DiscoveryQueue,discoverySlot} from './discovery-notices.js';

const obstacleSelectors='.cave-miniboss-status,.cave-miniboss-warning,#hud5Root .top,#hud5Root .location,.cave-combo-guard,.run-orb-tray,#targetTip,#runCards .card-chip,#objective,#hud5Root .boost-node,#hud5Root .proc-label,#hud5Root .items,#hud5Root .rail,#hud5Root .score,#hud5Root .mission,#refugeLobby .head,#refugeLobby button,#refugeResourceDock';
export function createDiscoveryNotices({document:doc}){
 const queue=new DiscoveryQueue(),win=doc.defaultView;let root=null,notice=null,image=null,label=null,name=null,link=null,animation=null,rendered=null,arrived=null,last=null,lastMeasure=-Infinity,dirty=true,slot=null,wasBlocked=true,shown=false,observer=null;
 const invalidate=()=>{dirty=true;};
 function mount(){
  const plane=doc.getElementById('gvUiPlane')||doc.getElementById('stage');if(!plane)return false;
  if(!link){link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./approved-discoveries-ui.css',import.meta.url).href;link.addEventListener('load',invalidate);doc.head.append(link);}
  if(!root){
   root=doc.createElement('div');root.id='approvedDiscoveryNotice';root.hidden=true;root.setAttribute('aria-hidden','true');
   notice=doc.createElement('div');notice.className='gv-discovery-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.setAttribute('aria-atomic','true');
   image=doc.createElement('img');image.alt='';image.draggable=false;const copy=doc.createElement('div');label=doc.createElement('small');name=doc.createElement('strong');copy.append(label,name);notice.append(image,copy);root.append(notice);plane.append(root);
   if(win.ResizeObserver){observer=new win.ResizeObserver(invalidate);observer.observe(plane);observer.observe(root);}
   win.addEventListener('resize',invalidate);doc.fonts?.addEventListener?.('loadingdone',invalidate);
  }
  return true;
 }
 function hide(){if(root){root.style.visibility='hidden';root.setAttribute('aria-hidden','true');}shown=false;if(animation?.playState==='running')animation.pause();}
 function render(item){if(rendered===item.key)return;animation?.cancel();animation=null;rendered=item.key;arrived=null;image.src=item.art;label.textContent=item.label;name.textContent=item.name;dirty=true;}
 function measure(profile,now){
  const plane=root.parentElement,box=plane.getBoundingClientRect(),scale=box.width/plane.clientWidth;if(!(scale>0))return null;
  const width=plane.clientWidth,height=plane.clientHeight,noticeWidth=Math.min(312,Math.max(180,width*.27),width-24);
  root.style.width=noticeWidth+'px';root.dataset.compact=String(noticeWidth<240);
  const obstacles=[];
  for(const e of doc.querySelectorAll(obstacleSelectors)){
   const r=e.getBoundingClientRect();if(!r.width||!r.height||e.closest('[hidden]'))continue;const style=win.getComputedStyle(e);if(style.visibility!=='visible'||style.opacity==='0')continue;
   obstacles.push({left:(r.left-box.left)/scale,right:(r.right-box.left)/scale,top:(r.top-box.top)/scale,bottom:(r.bottom-box.top)/scale});
  }
  if(profile.run)obstacles.push({left:width*.35,right:width*.65,top:height*.25,bottom:height*.72});
  lastMeasure=now;dirty=false;
  const options={width,height,noticeWidth,noticeHeight:root.offsetHeight,obstacles};let result=discoverySlot(options);
  // Refuge navigation fills the left edge at large UI sizes. Keep discoveries
  // beside that list; the active cave never uses this central fallback.
  if(!result&&!profile.run){const nav=doc.querySelector('#refugeLobby .nav')?.getBoundingClientRect();if(nav?.width)result=discoverySlot({...options,left:Math.ceil((nav.right-box.left)/scale+12)});}
  return result;
 }
 return {
  accept(events,profile){const accepted=queue.accept(events,profile);if(accepted)dirty=true;return accepted;},
  frame(now,{profile,blocked=false,soft=false}={}){
   queue.setProfile(profile);const delta=last===null?0:Math.max(0,Math.min(50,now-last));last=now;
   const item=queue.peek;if(!item){if(root)root.hidden=true;animation?.cancel();animation=null;rendered=null;arrived=null;return;}
   if(blocked||doc.hidden){hide();wasBlocked=true;return;}
   if(!mount())return;root.hidden=false;render(item);
   if(wasBlocked)dirty=true;wasBlocked=false;
   if(dirty||now-lastMeasure>=250)slot=measure(profile,now);
   if(!slot||!link.sheet){hide();return;}
   queue.advance(shown?delta:0,{blocked:false});
   if(queue.current?.key!==item.key){hide();rendered=null;return;}
   root.style.left=slot.left+'px';root.style.top=slot.top+'px';root.style.visibility='visible';root.setAttribute('aria-hidden','false');
   const reduced=soft||win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   if(reduced){animation?.cancel();animation=null;arrived=item.key;}
   else if(arrived!==item.key){animation=notice.animate?.([{transform:'translateY(-8px) scale(.96)',opacity:.55},{transform:'translateY(1px) scale(1.015)',opacity:1,offset:.65},{transform:'translateY(0) scale(1)',opacity:1}],{duration:230,easing:'ease-out'});arrived=item.key;}
   else if(animation?.playState==='paused')animation.play();
   shown=true;
  },
  get hasPending(){return !!queue.peek;},
  invalidateLayout:invalidate,
  dispose(){animation?.cancel();observer?.disconnect();win.removeEventListener('resize',invalidate);doc.fonts?.removeEventListener?.('loadingdone',invalidate);root?.remove();link?.remove();},
 };
}
