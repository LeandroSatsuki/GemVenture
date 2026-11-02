import {createCoinFillAudio} from './completion-coin-audio.js';
import {mountCompletionFeel,completionArrival,reserveCompletionTargets} from './completion-feedback.js';
import {mountApprovedReturnSurface,approvedReturnMarkup,approvedReturnTransfers,approvedReturnFlightArt} from './approved-return-ui.js';
import {decorateReturn} from './return-layout.js';
import {activateReturnPresentation,returnCardArt,returnFlightArt} from './rebrand-return-cave-art.js';
import {beginRefugeResourceTransfer} from './rebrand-refuge-dock.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {returnRewards} from './rewards.js';
const fmt=n=>new Intl.NumberFormat('pt-BR').format(Math.max(0,Math.floor(n)));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Geometric visibility is sampled once per destination, never in the counter RAF.
const emptyRewardTransfer=Object.freeze({track:()=>false,finishCounter:()=>false,release:()=>false});
function rewardBox(node,cache){
 if(cache.boxes.has(node))return cache.boxes.get(node);
 let box=null;try{const r=node?.getBoundingClientRect?.();if(r&&[r.left,r.top,r.width,r.height,r.right,r.bottom].every(Number.isFinite)&&r.width>0&&r.height>0)box={left:r.left,top:r.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom};}catch{}
 cache.boxes.set(node,box);return box;
}
function rewardStyle(node,cache){
 if(cache.styles.has(node))return cache.styles.get(node);
 let result=null;try{const s=node.ownerDocument.defaultView?.getComputedStyle?.(node);if(s&&s.display&&s.visibility&&s.opacity!==''&&Number.isFinite(Number(s.opacity))){result={display:s.display,visibility:s.visibility,opacity:Number(s.opacity),overflowX:s.overflowX||s.overflow,overflowY:s.overflowY||s.overflow,transform:s.transform,clip:s.clip,clipPath:s.clipPath,maskImage:s.maskImage,contain:s.contain};}}catch{}
 cache.styles.set(node,result);return result;
}
function measuredRewardDestination(document,id,cache){
 try{
  const key=document.body.classList.contains('night-refuge')&&['bank','material-0','material-1','material-2','material-3'].includes(id)?'lobby-'+id:id;const element=document.getElementById(key);if(!element?.isConnected||element.closest('[hidden],[inert]')||document.querySelector('dialog[open]'))return null;
  const box=rewardBox(element,cache),win=document.defaultView,v=win?.visualViewport;
  const width=v?v.width:(win?.innerWidth||document.documentElement.clientWidth),height=v?v.height:(win?.innerHeight||document.documentElement.clientHeight),left=v?v.offsetLeft:0,top=v?v.offsetTop:0;
  if(!box||![width,height,left,top].every(Number.isFinite)||width<=0||height<=0)return null;
  const visible={left,top,right:left+width,bottom:top+height},overflow=new Set(['hidden','clip','scroll','auto','overlay']);
  for(let node=element;node;node=node.parentElement){
   if(node.hidden||node.inert)return null;const s=rewardStyle(node,cache);if(!s||s.display==='none'||s.visibility!=='visible'||s.opacity<=0)return null;
   if(s.clipPath&&s.clipPath!=='none'||s.maskImage&&s.maskImage!=='none'||s.clip&&!['auto','none'].includes(s.clip))return null;
   if(node===element||node===document.body||node===document.documentElement)continue;
   if(!s.overflowX||!s.overflowY)return null;
   const paint=/(?:^|\s)(paint|strict|content)(?:\s|$)/.test(s.contain||''),clipX=overflow.has(s.overflowX)||paint,clipY=overflow.has(s.overflowY)||paint;
   if(clipX||clipY){const r=rewardBox(node,cache);if(!r||s.transform&&s.transform!=='none'||!Number.isFinite(node.clientLeft)||!Number.isFinite(node.clientTop)||!Number.isFinite(node.clientWidth)||!Number.isFinite(node.clientHeight)||node.clientWidth<=0||node.clientHeight<=0)return null;
    if(clipX){visible.left=Math.max(visible.left,r.left+node.clientLeft);visible.right=Math.min(visible.right,r.left+node.clientLeft+node.clientWidth);}
    if(clipY){visible.top=Math.max(visible.top,r.top+node.clientTop);visible.bottom=Math.min(visible.bottom,r.top+node.clientTop+node.clientHeight);}
   }
  }
  if(box.left<visible.left-.75||box.top<visible.top-.75||box.right>visible.right+.75||box.bottom>visible.bottom+.75)return null;
  for(const node of [document.getElementById('refugeDockNav'),document.querySelector('header.game-toolbar')]){
   if(!node?.isConnected||node.closest('[hidden],[inert]'))continue;const s=rewardStyle(node,cache);if(!s)return null;if(s.display==='none'||s.visibility!=='visible'||s.opacity<=0)continue;const r=rewardBox(node,cache);if(r&&Math.min(box.right,r.right)-Math.max(box.left,r.left)>.75&&Math.min(box.bottom,r.bottom)-Math.max(box.top,r.top)>.75)return null;
  }
  return {element,box};
 }catch{return null;}
}
function writeRewardCounter(document,id,value){const node=document.getElementById(id);if(node)node.textContent=fmt(value);const lobby=document.getElementById('lobby-'+id);if(lobby)lobby.textContent=fmt(value);}
function createRewardVisualSession(document,materials){
 let transfer=emptyRewardTransfer;try{transfer=beginRefugeResourceTransfer({document,materials,format:fmt})||emptyRewardTransfer;}catch{}
 const call=(method,...args)=>{try{if(typeof transfer[method]==='function')return {ok:true,value:transfer[method](...args)};}catch{}return {ok:false};};
 const cache={boxes:new Map(),styles:new Map()},entries=new Set(),scrolls=new Map(),cleanups=[];let installed=false,counterDone=false,released=false,observer=null;
 const cancel=entry=>{if(entry.cancelled)return;entry.cancelled=true;try{entry.animation.cancel?.();}catch{}};
 const cancelAll=()=>{for(const entry of entries)cancel(entry);};
 const revalidateDestinations=()=>{const fresh={boxes:new Map(),styles:new Map()};for(const entry of entries){const next=measuredRewardDestination(document,entry.target.id,fresh),r=next?.box;if(!r||Math.abs(r.left+r.width/2-entry.box.left-entry.box.width/2)>.75||Math.abs(r.top+r.height/2-entry.box.top-entry.box.height/2)>.75)cancel(entry);}};
 const cleanup=()=>{if(!counterDone||entries.size)return;for(const fn of cleanups.splice(0))try{fn();}catch{}};
 const listen=(node,type,fn,options)=>{try{node?.addEventListener?.(type,fn,options);cleanups.push(()=>node?.removeEventListener?.(type,fn,options));}catch{}};
 function gone(){if(document.hidden||document.body.classList.contains('application-menu-open')||!document.body.classList.contains('immersive-base')){cancelAll();return;}for(const entry of entries)if(!entry.target.isConnected||entry.target.closest('[hidden],[inert]'))cancel(entry);}
 function watch(){
  if(installed)return;installed=true;const win=document.defaultView;
  listen(win,'resize',cancelAll);listen(win?.visualViewport,'resize',cancelAll);listen(win?.visualViewport,'scroll',cancelAll);listen(document.fonts,'loadingdone',revalidateDestinations);listen(document,'visibilitychange',gone);
  listen(document,'scroll',event=>{const node=event.target===document?(document.scrollingElement||document.documentElement):event.target,old=scrolls.get(node);if(!old)return;if(Math.abs((node.scrollTop||0)-old.top)>.75||Math.abs((node.scrollLeft||0)-old.left)>.75)for(const entry of entries)if(entry.ancestors.has(node))cancel(entry);},true);
  try{const Resize=win?.ResizeObserver||globalThis.ResizeObserver;if(typeof Resize==='function'){observer=new Resize(revalidateDestinations);cleanups.push(()=>observer.disconnect());}}catch{}
  try{const Mutation=win?.MutationObserver||globalThis.MutationObserver;if(typeof Mutation==='function'){const m=new Mutation(gone);m.observe(document.body,{attributes:true,attributeFilter:['class']});for(const n of document.querySelectorAll('main[data-game-surface],#refugeResourceDock'))m.observe(n,{attributes:true,attributeFilter:['hidden','inert']});cleanups.push(()=>m.disconnect());}}catch{}
 }
 return Object.freeze({
  destination(id){return measuredRewardDestination(document,id,cache);},
  track(animation,destination){
   try{watch();const ancestors=new Set();for(let n=destination.element;n;n=n.parentElement){ancestors.add(n);if(!scrolls.has(n))scrolls.set(n,{top:n.scrollTop||0,left:n.scrollLeft||0});try{observer?.observe(n);}catch{}}
    const entry={animation,target:destination.element,box:destination.box,ancestors,cancelled:false};entries.add(entry);const wrapped={finished:animation.finished,cancel:()=>cancel(entry)};
    const tracked=call('track',wrapped);if(!tracked.ok)cancel(entry);
    const settled=()=>{entries.delete(entry);cleanup();};Promise.resolve(animation.finished).then(settled,settled);
   }catch{try{animation.cancel?.();}catch{}}
  },
  finishCounter(){if(counterDone)return;counterDone=true;call('finishCounter');cleanup();},
  release(){if(released)return;released=true;counterDone=true;call('release');cancelAll();cleanup();}
 });
}

export class ReturnScreen{
 constructor({music,soft,onSave,onFinish,audioPreferences}){this.music=music;this.soft=()=>soft()||!!this.motion?.matches;this.onSave=onSave;this.onFinish=onFinish;this.active=false;this.settling=false;this.token=0;this.dialog=document.getElementById('returnDialog');this.motion=this.dialog.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');this.coinAudio=createCoinFillAudio(music,{preferences:audioPreferences,visible:()=>!this.dialog.ownerDocument.hidden});this.dialog.ownerDocument.addEventListener('visibilitychange',()=>{if(this.dialog.ownerDocument.hidden)this.coinAudio.cancel();});this.dialog.addEventListener('close',()=>{if(!this.settling)this.coinAudio.cancel();});this.view=mountApprovedReturnSurface(this.dialog);this.dialog.addEventListener('cancel',e=>e.preventDefault());}
 balances(s){return this.active?this.display:{bank:s.bank,materials:s.materials};}
 show(s){if(this.active)return;this.state=s;this.result=s.lastResult;if(!this.result)return;this.active=true;this.page=0;this.cards=Array.isArray(this.result.resources)?this.result.resources:returnRewards(null,this.result.bag,this.result.kept);this.display={bank:s.bank-this.result.kept,materials:s.materials.map((n,i)=>n-(this.result.keptMaterials?.[i]||0))};this.music.silence();this.coinAudio.reset();this.render();this.dialog.showModal();if(!(this.result.kept>0)&&this.result.reason!=='death'&&this.cards.some(card=>card.value>0))this.music.reward();this.view.querySelector('#rewardOK').focus();}
 render(){const r=this.result,death=r.reason==='death',page=this.cards.slice(this.page*4,this.page*4+4),more=(this.page+1)*4<this.cards.length;
  this.coinAudio.cancel();this.completionFeel?.dispose();this.view.innerHTML=approvedReturnMarkup(r,this.page,this.cards);this.completionFeel=mountCompletionFeel(this.view,{soft:this.soft(),reason:r.reason,cards:page});
  if(!more&&!this.cards.some(card=>card.value>0))this.view.querySelector('#rewardOK').textContent='Voltar ao refúgio';
  this.view.querySelector('#rewardOK').onclick=()=>{if(more){this.page++;this.render();this.view.querySelector('#rewardOK').focus();}else this.collect();};
  const token=++this.token,start=performance.now(),elements=[...this.view.querySelectorAll('.reward-card')],sounded=new Set();
  const frame=now=>{if(token!==this.token||this.settling)return;let complete=true;elements.forEach((el,i)=>{const age=now-start-i*160,p=this.soft()?1:Math.min(1,Math.max(0,age/600));if((age>=0||this.soft())&&!sounded.has(i)){sounded.add(i);if(page[i].value>0){if(page[i].destination==='bank')this.coinAudio.play('count-'+this.page,{coins:this.result.kept,reason:this.result.reason,phase:'count',duration:this.soft()?.18:.6+(elements.length-i-1)*.16});else this.music.loot(i);}}el.classList.toggle('revealed',age>=0||this.soft());el.querySelector('[data-count]').textContent='+'+fmt(page[i].value*(1-(1-p)**3));if(p<1)complete=false;});if(!complete)requestAnimationFrame(frame);};requestAnimationFrame(frame);
 }
 collect(){if(this.settling)return;this.settling=true;this.token++;const releaseCompletion=!this.soft()?reserveCompletionTargets(document,this.cards,this.state):()=>{};const rewardVisuals=createRewardVisualSession(document,this.state?.materials);try{const startBalance={...this.display},rect=this.dialog.getBoundingClientRect(),origins=[...this.view.querySelectorAll('.reward-art')].map(el=>el.getBoundingClientRect());this.result.presented=true;this.onSave();this.completionFeel?.dispose();this.dialog.close();if(!(this.result.kept>0)&&this.result.reason!=='death'&&this.cards.some(card=>card.value>0))this.music.reward();
  if(!this.soft())approvedReturnTransfers(this.cards).forEach((card,i)=>{const measured=rewardVisuals.destination(card.destination);if(!measured)return;const destination=measured.box,origin=origins[i%origins.length]||rect,x=origin.left+origin.width/2,y=origin.top+origin.height/2;if(![x,y,origin.width,origin.height].every(Number.isFinite)||origin.width<=0||origin.height<=0)return;for(let j=0;j<1;j++){const token=document.createElement('div');token.className='flying-reward';token.innerHTML=approvedReturnFlightArt(card);token.style.left=x+'px';token.style.top=y+'px';document.body.append(token);const dx=destination.left+destination.width/2-x,dy=destination.top+destination.height/2-y;const a=token.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${dx*.35+0}px),calc(-50% + ${dy*.3-60}px)) scale(1.2)`,opacity:1,offset:.35},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.25)`,opacity:0}],{duration:650,delay:i*50+j*45,easing:'cubic-bezier(.4,0,.4,1)',fill:'both'});rewardVisuals.track(a,measured);a.finished.then(()=>{completionArrival(measured.element,{soft:this.soft()});token.remove();},()=>token.remove());}});
  const started=performance.now(),duration=this.cards.some(card=>card.value>0)?(this.soft()?250:1100):1;this.coinAudio.play('transfer',{coins:this.result.kept,reason:this.result.reason,phase:'transfer',duration:duration/1000});const frame=now=>{const p=Math.min(1,(now-started)/duration);this.display={bank:startBalance.bank+this.result.kept*p,materials:startBalance.materials.map((n,i)=>n+(this.result.keptMaterials?.[i]||0)*p)};writeRewardCounter(document,'bank',this.display.bank);this.display.materials.forEach((n,i)=>{writeRewardCounter(document,'material-'+i,n);});if(p<1)requestAnimationFrame(frame);else{this.active=false;this.settling=false;try{this.onFinish();}catch(error){this.coinAudio.cancel();rewardVisuals.release();releaseCompletion();throw error;}finally{rewardVisuals.finishCounter();releaseCompletion();}}};requestAnimationFrame(frame);
 }catch(error){this.coinAudio.cancel();rewardVisuals.release();releaseCompletion();throw error;}
 }
}
