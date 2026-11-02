import {loadRefugeArt,refugeArtReady,refugeArtBounds,drawRefugeArt} from './refuge-art.js';

// Only the explicit well portrait opts in. Art,water,crystal phases and caches stay owned.
export function createWellPortrait({host,label='Poço',alive=()=>host.isConnected,
 prepare=loadRefugeArt,ready=()=>refugeArtReady('well'),bounds=()=>refugeArtBounds('well'),paint=drawRefugeArt,
 requestFrame=fn=>host.ownerDocument.defaultView.requestAnimationFrame(fn),cancelFrame=id=>host.ownerDocument.defaultView.cancelAnimationFrame(id),
 makeObserver=(win,fn)=>typeof win.MutationObserver==='function'?new win.MutationObserver(fn):null,
 makeResizeObserver=(win,fn)=>typeof win.ResizeObserver==='function'?new win.ResizeObserver(fn):null}={}){
 const doc=host.ownerDocument,win=doc.defaultView,media=win.matchMedia?.('(prefers-reduced-motion: reduce)'),canvas=doc.createElement('canvas');
 canvas.className='well-portrait-canvas';canvas.setAttribute('aria-hidden','true');canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
 let cancelled=false,loaded=false,raf=null,last=null,time=0,dirty=true,width=320,height=280,dpr=1,frames=0;
 const connected=()=>!cancelled&&alive()&&host.isConnected&&!!host.closest('dialog')?.open;
 const stable=()=>!!media?.matches||doc.body.classList.contains('soft-fx');
 const paused=()=>doc.hidden||host.dataset.structurePaused==='true';
 function stopFrame(){if(raf!==null)cancelFrame(raf);raf=null;last=null;}
 function cancel(){if(cancelled)return;cancelled=true;stopFrame();mutation?.disconnect();resize?.disconnect();doc.removeEventListener('visibilitychange',wake);media?.removeEventListener?.('change',wake);win.removeEventListener?.('resize',measure);host.removeAttribute('aria-busy');}
 function measure(){dirty=true;wake();}
 function draw(){if(dirty){const r=host.getBoundingClientRect();width=Math.max(1,r.width||320);height=Math.max(1,r.height||280);dpr=Math.min(2,Math.max(1,win.devicePixelRatio||1));canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);dirty=false;}const c=canvas.getContext('2d');if(!c)return false;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);const b=bounds(),pad=12,scale=Math.max(.01,Math.min(Math.max(1,width-pad*2)/b.width,Math.max(1,height-pad*2)/(b.height+6))),x=(width-b.width*scale)/2-b.left*scale,y=(height-b.height*scale)/2-b.top*scale;paint(c,'well',x,y,b.width*scale,time,stable());frames++;return true;}
 function tick(now){raf=null;if(!connected()){cancel();return;}if(paused()){stopFrame();return;}const dt=last===null?0:Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(!stable())time+=dt;try{if(!draw()){cancel();return;}}catch{cancel();return;}if(!stable())raf=requestFrame(tick);else last=null;}
 function wake(){if(!connected()){cancel();return;}if(!loaded)return;if(paused()){stopFrame();return;}if(stable()){stopFrame();draw();}else if(raf===null){last=null;raf=requestFrame(tick);}}
 const mutation=makeObserver(win,()=>{if(!connected()){cancel();return;}wake();}),resize=makeResizeObserver(win,measure);
 mutation?.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['open','class','data-structure-paused']});resize?.observe(host);doc.addEventListener('visibilitychange',wake);media?.addEventListener?.('change',wake);win.addEventListener?.('resize',measure);
 const promise=(async()=>{try{await prepare();if(!connected()){cancel();return{status:'stale'};}if(!ready())throw Error('Current well composition unavailable');host.replaceChildren(canvas);host.dataset.structureState='ready';host.removeAttribute('aria-busy');loaded=true;if(!draw())throw Error('Canvas2D unavailable');wake();return{status:'ready',type:'well',animated:true};}catch(error){if(!connected()){cancel();return{status:'stale'};}host.dataset.structureState='error';host.removeAttribute('aria-busy');const text=doc.createElement('small');text.textContent='Arte indisponível';host.replaceChildren(text);cancel();return{status:'error',type:'well',error};}})();
 return Object.freeze({ready:promise,cancel,status:()=>({cancelled,loaded,pendingFrame:raf!==null,time,frames,stable:stable(),paused:paused()})});
}
