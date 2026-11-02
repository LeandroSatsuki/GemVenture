import {P} from './palette.js';

// Presentation only: all values, confirmations, saving and flight destinations belong to ReturnScreen.
const MAX_FACETS=8,MAX_ARRIVALS=4;
let facets=0,peakFacets=0,arrivals=0,completedArrivals=0,leases=0;
export const readCompletionFeel=()=>({facets,peakFacets,arrivals,completedArrivals,leases});
const format=n=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(Math.floor(n));
const tint=card=>card?.destination==='bank'?P.lemon:([P.cyan,P.red,P.lemon,P.pink][Number(card?.destination?.split('-')[1])]||P.cyan);

export function mountCompletionFeel(root,{soft=false,reason='return',cards=[]}={}){
 const animations=new Set(),nodes=new Set(),revealed=new Set(),finished=new Set();let disposed=false;
 const metrics={reveals:0,completedCounters:0,recognizedStars:0};
 const animate=(node,frames,options)=>{if(!node||disposed)return;const a=node.animate(frames,{...options,fill:'none'});animations.add(a);a.finished.then(()=>animations.delete(a),()=>animations.delete(a));return a;};
 const window=root.querySelector('.window');
 animate(window,soft?[{opacity:.6},{opacity:1}]:[{opacity:.5,transform:'translateY(6px) scale(.99)'},{opacity:1,transform:'none'}],{duration:soft?150:260,easing:'cubic-bezier(.2,.7,.2,1)'});
 const items=[...root.querySelectorAll('.reward-card')];
 function accent(item,color){
  if(soft||reason==='death')return;
  const count=reason==='victory'?4:2;if(facets+count>MAX_FACETS)return;
  const span=root.ownerDocument.createElement('span');span.setAttribute('aria-hidden','true');
  span.style.cssText='position:absolute;top:0;right:0;width:48px;height:48px;pointer-events:none';
  const points=[[10,10],[33,30],[35,7],[10,35]].slice(0,count);
  span.innerHTML='<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">'+points.map(([x,y],i)=>'<path fill="'+(i%2?P.white:color)+'" d="M'+x+' '+(y-4)+' l2 3 3 1 -3 1 -2 4 -1 -4 -3 -1 3 -1Z"/>').join('')+'</svg>';
  const oldPosition=item.style.position;item.style.position='relative';item.append(span);nodes.add(span);facets+=count;peakFacets=Math.max(peakFacets,facets);
  let live=true;const remove=()=>{if(!live)return;live=false;span.remove();nodes.delete(span);facets-=count;if(!item.style.position||item.style.position==='relative')item.style.position=oldPosition;};
  span._release=remove;const a=animate(span,[{opacity:0,transform:'translateY(3px) scale(.8)'},{opacity:.95,transform:'none',offset:.25},{opacity:0,transform:'translateY(-6px) scale(1.08)'}],{duration:300,easing:'ease-out'});a?.finished.then(remove,remove);
 }
 function inspect(){if(disposed)return;items.forEach((item,i)=>{
  if(item.classList.contains('revealed')&&!revealed.has(item)){revealed.add(item);metrics.reveals++;animate(item,soft?[{opacity:.65},{opacity:1}]:[{opacity:.25,transform:'translateY(6px) scale(.985)'},{opacity:1,transform:'none'}],{duration:soft?150:280,easing:'cubic-bezier(.2,.7,.2,1)'});}
  const counter=item.querySelector('[data-count]'),value=Number(counter?.dataset.count);
  if(!(value>0)||finished.has(item)||counter.textContent!=='+'+format(value))return;
  finished.add(item);metrics.completedCounters++;if(soft)return;
  const color=tint(cards[i]);animate(item,[{boxShadow:'inset 0 0 0 1px '+color},{boxShadow:'inset 0 0 0 1px transparent'}],{duration:reason==='death'?180:320,easing:'ease-out'});
  if(reason!=='death'){animate(item.querySelector('.reward-art'),[{transform:'scale(1)'},{transform:'scale(1.13)',offset:.3},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});animate(counter,[{transform:'scale(1)'},{transform:'scale(1.08)',offset:.3},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});accent(item,color);}
 });
 const expected=items.filter(item=>Number(item.querySelector('[data-count]')?.dataset.count)>0).length;
 if(!soft&&reason!=='death'&&expected>0&&finished.size===expected&&!metrics.recognizedStars){const summary=root.querySelector('.stats [aria-label*="estrelas"]'),stars=Number(summary?.querySelector('b')?.textContent);if(stars>0){metrics.recognizedStars=stars;animate(summary.querySelector('img'),[{transform:'scale(1)'},{transform:'scale('+(1.10+Math.min(5,stars)*.025)+')',offset:.32},{transform:'scale(1)'}],{duration:320,easing:'ease-out'});}}
 }
 const observer=new MutationObserver(inspect);observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class'],characterData:true,childList:true});inspect();
 const visibility=()=>{if(root.ownerDocument.hidden)dispose();};root.ownerDocument.addEventListener('visibilitychange',visibility);
 function dispose(){if(disposed)return;disposed=true;observer.disconnect();root.ownerDocument.removeEventListener('visibilitychange',visibility);for(const a of animations)a.cancel();animations.clear();for(const n of nodes)n._release?.();nodes.clear();}
 return {dispose,read:()=>({...metrics,disposed,animations:animations.size,...readCompletionFeel()})};
}

// Called only by the native flight's fulfilled promise. A cancelled/occluded flight never celebrates arrival.
export function completionArrival(target,{soft=false}={}){
 if(soft||!target?.isConnected||target.ownerDocument.hidden||arrivals>=MAX_ARRIVALS)return;
 arrivals++;completedArrivals++;const a=target.animate([{transform:'scale(1)'},{transform:'scale(1.12)',offset:.32},{transform:'scale(1)'}],{duration:240,easing:'ease-out',fill:'none'});
 let live=true;const finish=()=>{if(!live)return;live=false;arrivals--;target.ownerDocument.removeEventListener('visibilitychange',hide);};const hide=()=>{if(target.ownerDocument.hidden)a.cancel();};target.ownerDocument.addEventListener('visibilitychange',hide);a.finished.then(finish,finish);
}

// Same temporary sizing principle as the existing refuge-dock transfer lease,
// applied to the approved lobby wallet. Freeze geometry before native visibility
// sampling; keep all its clipping/cancellation checks. Restore at native counter finish.
export function reserveCompletionTargets(document,cards,state){
 const saved=[];let released=false;
 for(const id of new Set(cards.filter(c=>c.value>0).map(c=>c.destination))){
  const target=document.getElementById((document.body.classList.contains('night-refuge')?'lobby-':'')+id),value=id==='bank'?state.bank:state.materials?.[Number(id.split('-')[1])];
  if(!target?.isConnected||!Number.isFinite(value)||!target.getBoundingClientRect().width)continue;
  const old=target.style.cssText,clone=target.cloneNode(false);clone.removeAttribute('id');clone.setAttribute('aria-hidden','true');clone.textContent=format(value).replace(/\d/g,'8');clone.style.cssText=old+';position:fixed;left:-10000px;top:0;visibility:hidden;max-width:none;width:auto;min-width:0;flex:none';target.parentElement.append(clone);
  const width=Math.ceil(Math.max(target.getBoundingClientRect().width,clone.getBoundingClientRect().width));clone.remove();
  target.style.width=width+'px';target.style.minWidth=width+'px';target.style.flex='0 0 '+width+'px';target.style.fontVariantNumeric='tabular-nums';target.style.textAlign='right';saved.push([target,old]);
 }
 if(saved.length)leases++;
 const hide=()=>{if(document.hidden)release();};const resize=()=>release();
 function release(){if(released)return;released=true;for(const [target,old]of saved)target.style.cssText=old;if(saved.length)leases--;document.removeEventListener('visibilitychange',hide);document.defaultView.removeEventListener('resize',resize);}
 document.addEventListener('visibilitychange',hide);document.defaultView.addEventListener('resize',resize);return release;
}
