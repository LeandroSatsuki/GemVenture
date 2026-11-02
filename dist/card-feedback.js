import {CARDS} from './cards.js';
import {APPROVED_CARD_RASTERS} from './approved-card-raster.js';
import {ABYSS_RECOVERY_CARDS} from './abyss-cards.js';
export const ROLE_PALETTE=Object.freeze({damage:{name:'Dano',color:'#ff965c'},healing:{name:'Cura',color:'#67e3b8'},defense:{name:'Defesa',color:'#67cfff'},utility:{name:'Utilidade',color:'#bca6ff'}});
export const CARD_FEEL=Object.freeze({entryMs:380,staggerMs:70,selectMs:220,confirmMs:560,flightMs:420,softMs:180,maxParticles:12,maxGroups:2,maxFlights:1});
export function cardRole(id){const card=[...CARDS,...ABYSS_RECOVERY_CARDS].find(c=>c.id===id);if(!card)return null;if(['CURA','VIDA EXTRA','FÔLEGO'].includes(card.role))return'healing';if(['DEFESA','ESCUDO'].includes(card.role))return'defense';return card.group==='attack'?'damage':'utility';}
export function cardVfxPlan(id,{special=false,soft=false}={}){const role=cardRole(id);if(!role)return null;return{role,color:ROLE_PALETTE[role].color,particles:soft?0:special?12:role==='healing'?8:6,duration:soft?CARD_FEEL.softMs:CARD_FEEL.confirmMs,special:!!special};}
export function installCardFeel(doc,{soft=()=>false,field=id=>doc.getElementById(id),notice=()=>null}={}){
 let disposed=false,selected=null;const groups=new Map(),flights=new Set(),entry=new Map(),animations=new Set();const counters={appearances:0,selections:0,confirmations:0,departures:0,acceptedSignals:0,targetMisses:0};
 const win=doc.defaultView,ns='http://www.w3.org/2000/svg',node=n=>doc.createElementNS(ns,n),reduced=()=>soft()||win.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const layer=doc.createElement('div');layer.setAttribute('popover','manual');layer.setAttribute('aria-hidden','true');layer.inert=true;layer.dataset.cardFeelLayer='';layer.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;pointer-events:none;overflow:visible';
 const layerStyle=doc.createElement('style');layerStyle.textContent='[data-card-feel-layer]::backdrop{background:transparent;pointer-events:none}';doc.head.append(layerStyle);doc.body.append(layer);layer.showPopover();
 const cards=()=>[...(field('cardOffers')?.querySelectorAll('[data-card]')||[]),...(field('abyssCardOffers')?.querySelectorAll('[data-abyss-card]')||[])].filter(b=>b.getClientRects().length&&b.getBoundingClientRect().width>0);
 const styleLinks=[];doc.documentElement.dataset.cardVfxEnhanced='true';const ready=Promise.all([...new Set([field('cardOffers')?.getRootNode(),field('abyssCardOffers')?.getRootNode()])].filter(Boolean).map(root=>new Promise(resolve=>{const css=doc.createElement('link');css.rel='stylesheet';css.href=new URL('./card-feedback.css',import.meta.url).href;css.onload=css.onerror=resolve;root.append(css);styleLinks.push(css);})));
 const idOf=b=>b.dataset.card||b.dataset.abyssCard;
 function animate(el,frames,options){const a=el.animate(frames,options);animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a;}
 function cancelGroup(key){const g=groups.get(key);if(!g)return;g.animations.forEach(a=>a.cancel());g.svg.remove();groups.delete(key);}
 function svgAt(rect,margin=32){const svg=node('svg');svg.setAttribute('viewBox',`0 0 ${rect.width+margin*2} ${rect.height+margin*2}`);svg.style.cssText=`position:fixed;left:${rect.left-margin}px;top:${rect.top-margin}px;width:${rect.width+margin*2}px;height:${rect.height+margin*2}px;overflow:visible;pointer-events:none;filter:none`;layer.append(svg);return svg;}
 function halo(target,id,phase='confirm'){
  if(disposed||!target?.isConnected||doc.hidden)return;const p=cardVfxPlan(id,{soft:reduced()});if(!p)return;
  const rect=target.getBoundingClientRect();if(!rect.width||!rect.height)return;cancelGroup(phase);const count=phase==='select'?0:p.particles;while(groups.size&&(groups.size>=CARD_FEEL.maxGroups||[...groups.values()].reduce((n,g)=>n+g.count,0)+count>CARD_FEEL.maxParticles))cancelGroup(groups.keys().next().value);
  try{layer.hidePopover();layer.showPopover();}catch{}const margin=32,svg=svgAt(rect,margin),rim=node('rect'),duration=phase==='select'?(reduced()?180:300):p.duration;
  for(const[k,v]of Object.entries({x:margin-2,y:margin-2,width:rect.width+4,height:rect.height+4,rx:12,fill:'none',stroke:p.color,'stroke-width':phase==='select'?2:3}))rim.setAttribute(k,String(v));svg.append(rim);
  const own=[];
  for(let i=0;i<count;i++){
   const angle=(i/count*Math.PI*2)-Math.PI/2,x=margin+rect.width/2+Math.cos(angle)*(rect.width/2+5),y=margin+rect.height/2+Math.sin(angle)*(rect.height/2+5),g=node('g'),shape=node('path');g.setAttribute('transform',`translate(${x} ${y})`);
   shape.setAttribute('d',p.role==='healing'?'M-2-6H2V-2H6V2H2V6H-2V2H-6V-2H-2Z':p.role==='defense'?'M0-6 5-3 5 3 0 6-5 3-5-3Z':p.role==='damage'?'M-2-7 4-2 2 7-4 2Z':'M0-6 4 0 0 6-4 0Z');shape.setAttribute('fill',p.color);shape.setAttribute('stroke','#edf4ff');shape.setAttribute('stroke-width','1');
   const motion=node('g');motion.append(shape);g.append(motion);svg.append(g);const dx=p.role==='healing'?Math.cos(angle)*8:Math.cos(angle)*(phase==='select'?9:20),dy=p.role==='healing'?-22:Math.sin(angle)*(phase==='select'?9:20);
   own.push(animate(motion,[{transform:'translate(0,0)',opacity:0},{opacity:1,offset:.16},{transform:`translate(${dx}px,${dy}px)`,opacity:0}],{duration,easing:'cubic-bezier(.15,.7,.25,1)'}));
  }
  own.push(animate(svg,[{opacity:0},{opacity:1,offset:.14},{opacity:.8,offset:.5},{opacity:0}],{duration,easing:'ease-out'}));
  const group={svg,animations:own,count};groups.set(phase,group);Promise.allSettled(own.map(a=>a.finished)).then(()=>{if(groups.get(phase)===group){svg.remove();groups.delete(phase);}});
 }
 function paint(){
  if(disposed)return;for(const id of ['cardOffers','abyssCardOffers'])field(id)?.closest('[id^="gv-expedition-"]')?.setAttribute('data-card-feel','true');
  for(const b of cards()){const id=idOf(b),role=cardRole(id);if(!role)continue;b.style.setProperty('--card',ROLE_PALETTE[role].color);b.dataset.feelRole=role;b.dataset.feelSelected=String(b.getAttribute('aria-pressed')==='true');}
 }
 function appear(){if(disposed||doc.hidden)return;clear();paint();counters.appearances++;cards().forEach((b,i)=>{const delay=reduced()?0:i*CARD_FEEL.staggerMs,a=animate(b,[{opacity:.12},{opacity:1}],{duration:reduced()?CARD_FEEL.softMs:CARD_FEEL.entryMs,delay,fill:'backwards',easing:'ease-out'});const list=[a];if(!reduced())for(const child of b.children)if(!child.hasAttribute('data-gv-button-overlay'))list.push(animate(child,[{translate:'0 14px'},{translate:'0 0px'}],{duration:CARD_FEEL.entryMs,delay,fill:'backwards',easing:'cubic-bezier(.18,.85,.25,1)'}));entry.set(b,list);Promise.allSettled(list.map(a=>a.finished)).then(()=>{if(entry.get(b)===list)entry.delete(b);});});}
 function captureChosen(id){const image=field('chosenCard')?.querySelector('img'),r=image?.getBoundingClientRect();return image&&r?.width&&r?.height?{src:image.currentSrc||image.src,rect:{left:r.left,top:r.top,width:r.width,height:r.height}}:null;}
 function capture(){return new Map(cards().map(b=>{const image=b.querySelector('img'),r=image?.getBoundingClientRect();return[idOf(b),image&&r?{src:image.currentSrc||image.src,rect:{left:r.left,top:r.top,width:r.width,height:r.height}}:null];}));}
 function select(id){paint();if(selected===id)return;selected=id;const b=cards().find(b=>idOf(b)===id);if(!b)return;entry.get(b)?.forEach(a=>a.cancel());entry.delete(b);counters.selections++;halo(b,id,'select');}
 function visible(el){return el?.isConnected&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;}
 function chip(id){const src=APPROVED_CARD_RASTERS[id],url=src&&new URL(src,doc.baseURI).href;const c=[...doc.querySelectorAll('#runCards .card-chip')].find(el=>el.querySelector('img')?.src===url);if(visible(c))return c;const fallback=doc.querySelector('#hud5Root .hud5-details summary')||doc.getElementById('pause');return visible(fallback)?fallback:null;}
 function targetFor(id){const chosen=field('chosenCard');return visible(chosen)?chosen:visible(notice())?notice():chip(id);}
 function fly(saved,target,id){
  if(reduced()||!saved||!target)return;for(const old of flights){old.animation.cancel();old.image.remove();}flights.clear();const imageTarget=target.querySelector('img'),to=(visible(imageTarget)?imageTarget:target).getBoundingClientRect(),from=saved.rect;if(!to.width||!to.height)return;
  const image=doc.createElement('img');image.src=saved.src;image.alt='';image.style.cssText=`position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;object-fit:contain;pointer-events:none;filter:none;transform-origin:center;max-width:none`;layer.append(image);
  const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top+to.height/2-from.top-from.height/2,sx=Math.min(to.width/from.width,to.height/from.height),sy=sx;
  const a=animate(image,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.55}px,${dy*.45-20}px) scale(${1+(sx-1)*.5},${1+(sy-1)*.5})`,opacity:1,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,opacity:0}],{duration:CARD_FEEL.flightMs,easing:'cubic-bezier(.18,.7,.24,1)'}),flight={image,animation:a};flights.add(flight);a.finished.catch(()=>{}).finally(()=>{image.remove();flights.delete(flight);});
 }
 function confirm(id,saved){if(disposed||doc.hidden)return;counters.acceptedSignals++;paint();const role=cardRole(id);if(!role)return;const chosen=field('chosenCard');if(chosen){chosen.style.setProperty('--feel-role-color',ROLE_PALETTE[role].color);chosen.dataset.feelRole=role;}const target=targetFor(id);if(!target){counters.targetMisses++;return;}counters.confirmations++;cancelGroup('select');fly(saved,target,id);halo(target,id,'confirm');}
 function depart(id,saved){if(disposed||doc.hidden)return;const target=chip(id);if(!target)return;counters.departures++;fly(saved,target,id);halo(target,id,'confirm');}
 function interrupt(e){const b=e.composedPath().find(n=>n?.matches?.('[data-card],[data-abyss-card]'));entry.get(b)?.forEach(a=>a.cancel());entry.delete(b);}
 const onHidden=()=>{if(doc.hidden)clear();},onScroll=()=>{for(const key of [...groups.keys()])cancelGroup(key);for(const f of [...flights]){f.animation.cancel();f.image.remove();flights.delete(f);}};
 doc.addEventListener('visibilitychange',onHidden);doc.addEventListener('scroll',onScroll,true);win.addEventListener('resize',clear);win.addEventListener('pagehide',clear);
 doc.addEventListener('pointerdown',interrupt,true);doc.addEventListener('focusin',interrupt,true);
 function clear(){for(const a of animations)a.cancel();animations.clear();for(const g of groups.values())g.svg.remove();groups.clear();for(const f of flights)f.image.remove();flights.clear();entry.clear();selected=null;}
 function dispose(){if(disposed)return;disposed=true;clear();doc.removeEventListener('visibilitychange',onHidden);doc.removeEventListener('scroll',onScroll,true);win.removeEventListener('resize',clear);win.removeEventListener('pagehide',clear);doc.removeEventListener('pointerdown',interrupt,true);doc.removeEventListener('focusin',interrupt,true);layer.remove();layerStyle.remove();styleLinks.forEach(l=>l.remove());delete doc.documentElement.dataset.cardVfxEnhanced;}
 return{ready,paint,appear,capture,captureChosen,select,confirm,depart,clear,dispose,pause(value){for(const a of animations)value?a.pause():a.play();},speed(value){for(const a of animations)a.updatePlaybackRate(value);},read:()=>({...counters,groups:groups.size,particles:[...groups.values()].reduce((n,g)=>n+g.count,0),flights:flights.size,animations:animations.size,disposed})};
}
