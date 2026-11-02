// GV-016 candidate. Global final-composite CRT, shared half-strength 0.45.
// Isolated proposal: no game state, storage, economy or pointer handlers.
import {APPROVED_CRT,FINISH_PRESETS} from './screen-finish.js';
const KEY=Symbol.for('gemventure.global-crt');
export function globalFinishStatus(){return globalThis[KEY]?.status()||{active:false};}
const smooth=t=>t*t*(3-2*t);
export function approvedDisplacementMap(){
 const stops=[];
 for(let i=0;i<=32;i++){const t=i/32,e=smooth(t),r=.61+.39*e,b=.39-.39*e;stops.push(`<stop offset="${(.1+.65*t)/.75}" stop-color="rgb(${r*100}%,50%,${b*100}%)"/>`);}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="m" r="75%" color-interpolation="sRGB">${stops.join('')}</radialGradient></defs><rect width="100" height="100" fill="url(#m)"/></svg>`;
}
export function approvedFilterMarkup(id){
 const p=FINISH_PRESETS.crt,k=APPROVED_CRT.strength,s=p.softness*k/2,chroma=p.chroma*k*2;
 const map='data:image/svg+xml,'+encodeURIComponent(approvedDisplacementMap());
 return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
 <feConvolveMatrix in="SourceGraphic" order="3" kernelMatrix="0 .25 0 .25 0 .25 0 .25 0" divisor="1" edgeMode="duplicate" kernelUnitLength="1" preserveAlpha="true" result="near"/>
 <feImage href="${map}" preserveAspectRatio="none" result="map"/>
 <feDisplacementMap in="SourceGraphic" in2="map" scale="${chroma}" xChannelSelector="R" yChannelSelector="G" result="redShift"/>
 <feDisplacementMap in="SourceGraphic" in2="map" scale="${chroma}" xChannelSelector="B" yChannelSelector="G" result="blueShift"/>
 <feColorMatrix in="redShift" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
 <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
 <feColorMatrix in="blueShift" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
 <feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen" result="shifted"/>
 <feComposite in="shifted" in2="near" operator="arithmetic" k2=".5" k3="${s}" result="positive"/>
 <feComposite in="positive" in2="SourceGraphic" operator="arithmetic" k2="1" k3="${-s}" result="half"/>
 <!-- Arithmetic works on premultiplied channels; half RGB / half alpha already
      contains the desired straight color. Only restore opaque alpha here. -->
 <feColorMatrix in="half" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"/>
 </filter>`;
}
export function approvedChromaPixels(side=128){
 const data=new Uint8ClampedArray(side*side*4),peak=FINISH_PRESETS.crt.chroma*APPROVED_CRT.strength;
 for(let y=0;y<side;y++)for(let x=0;x<side;x++){const t=Math.max(0,Math.min(1,(Math.hypot((x+.5)/side-.5,(y+.5)/side-.5)-.1)/.65)),at=(y*side+x)*4;data[at]=data[at+1]=data[at+2]=255;data[at+3]=Math.round(255*peak*(.22+.78*smooth(t)));}
 return data;
}
export function fastFilterMarkup(id,mapUrl=null){
 const peak=FINISH_PRESETS.crt.chroma*APPROVED_CRT.strength,stops=[];
 for(let i=0;i<=32;i++){const t=i/32;stops.push(`<stop offset="${(.1+.65*t)/.75}" stop-color="white" stop-opacity="${peak*(.22+.78*smooth(t))}"/>`);}
 const map=mapUrl||'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><radialGradient id="a" r="75%">${stops.join('')}</radialGradient></defs><rect width="100" height="100" fill="url(#a)"/></svg>`);
 return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
 <feOffset in="SourceGraphic" dx="-1" result="redShift"/><feOffset in="SourceGraphic" dx="1" result="blueShift"/>
 <feColorMatrix in="redShift" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
 <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
 <feColorMatrix in="blueShift" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
 <feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen" result="shifted"/>
 <feImage href="${map}" preserveAspectRatio="none" result="weight"/>
 <feComposite in="shifted" in2="weight" operator="in" result="offsetPart"/>
 <feComposite in="SourceGraphic" in2="weight" operator="out" result="centerPart"/>
 <feComposite in="offsetPart" in2="centerPart" operator="arithmetic" k2="1" k3="1"/>
 </filter>`;
}
export function approvedMask(width,height,dpr=1){
 const data=new Uint8ClampedArray(width*height*4),p=FINISH_PRESETS.crt,k=APPROVED_CRT.strength;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=(x+.5)/width,v=(y+.5)/height,r=Math.hypot(u-.5,v-.5);
  const t=Math.max(0,Math.min(1,(r-.25)/(.72-.25)));
  const line=.5+.5*Math.cos(2*Math.PI*(height-y-.5)/(3*dpr));
  const alpha=1-(1-p.scanlines*k*line)*(1-p.vignette*k*smooth(t));
  data[(y*width+x)*4+3]=Math.round(alpha*255);
 }
 return data;
}
export function installGlobalFinish({doc=globalThis.document,win=globalThis.window}={}){
 if(globalThis[KEY])return globalThis[KEY];
 if(!doc?.body||!win)return null;
 const id='gv-approved-crt-global',svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
 let mapUrl=null;try{const tile=doc.createElement('canvas');tile.width=tile.height=128;const ctx=tile.getContext('2d'),im=ctx.createImageData(128,128);im.data.set(approvedChromaPixels());ctx.putImageData(im,0,0);mapUrl=tile.toDataURL('image/png');}catch{}
 svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';svg.innerHTML=fastFilterMarkup(id,mapUrl);doc.body.append(svg);
 const overlay=doc.createElement('div'),mask=doc.createElement('canvas');overlay.id='gv-global-crt';overlay.setAttribute('popover','manual');overlay.setAttribute('aria-hidden','true');overlay.inert=true;
 overlay.style.cssText=`position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;pointer-events:none;overflow:hidden;z-index:2147483647;backdrop-filter:blur(.225px) url(#${id});-webkit-backdrop-filter:blur(.225px) url(#${id})`;
 mask.style.cssText='display:block;width:100%;height:100%;pointer-events:none';overlay.append(mask);doc.body.append(overlay);
 const style=doc.createElement('style');style.textContent='#gv-global-crt::backdrop{background:transparent;pointer-events:none}';doc.head.append(style);
 let active=true,dead=false,maskBuilds=0,promotions=0,scheduled=false,observations=0,errors=0,graphicLost=false;
 const support={popover:typeof overlay.showPopover==='function',backdrop:win.CSS?.supports('backdrop-filter',`url(#${id})`)||false};
 const supported=support.popover&&support.backdrop&&!!mask.getContext('2d');
 if(!supported)overlay.style.display='none';
 function resize(force=false){
  const dpr=Math.min(2,win.devicePixelRatio||1),w=Math.max(1,Math.round(win.innerWidth*dpr)),h=Math.max(1,Math.round(win.innerHeight*dpr));
  if(!force&&maskBuilds&&mask.width===w&&mask.height===h)return;
  mask.width=w;mask.height=h;const ctx=mask.getContext('2d');if(ctx){const im=ctx.createImageData(w,h);im.data.set(approvedMask(w,h,dpr));ctx.putImageData(im,0,0);maskBuilds++;}
 }
 function promote(){
  scheduled=false;if(dead||!active||!supported||graphicLost)return;
  const parent=doc.fullscreenElement||doc.body;
  if(!svg.isConnected)doc.body.append(svg);if(!style.isConnected)doc.head.append(style);
  if(overlay.parentElement!==parent)parent.append(overlay);
  try{if(overlay.matches(':popover-open'))overlay.hidePopover();overlay.showPopover();overlay.style.visibility='visible';promotions++;}catch{errors++;overlay.style.visibility='hidden';return;}
  resize();
 }
 function schedule(){if(!scheduled&&!dead&&active){scheduled=true;queueMicrotask(promote);}}
 function layerChange(e){if(e.target===overlay)return;if(e.type==='beforetoggle'&&e.newState!=='open')return;schedule();}
 function maskLost(){graphicLost=true;overlay.style.visibility='hidden';}
 function maskRestored(){graphicLost=false;resize(true);schedule();}
 mask.addEventListener('contextlost',maskLost);mask.addEventListener('contextrestored',maskRestored);
 const observer=new win.MutationObserver(records=>{
  observations++;
  if(records.some(r=>r.type==='attributes'||[...r.addedNodes].some(n=>n.nodeType===1&&n!==overlay&&n!==svg&&(n.matches?.('body,dialog[open],[popover]')||n.querySelector?.('dialog[open],[popover]')))))schedule();
 });
 observer.observe(doc.documentElement,{subtree:true,attributes:true,attributeFilter:['open'],childList:true});
 doc.addEventListener('beforetoggle',layerChange,true);doc.addEventListener('toggle',layerChange,true);doc.addEventListener('fullscreenchange',schedule);win.addEventListener('resize',resize);win.visualViewport?.addEventListener('resize',resize);
 const api={
  status:()=>({installed:!dead,active:active&&!dead&&supported&&!graphicLost,...APPROVED_CRT,presentation:supported&&!graphicLost?'global-backdrop':'clear-fallback',chromaMap:mapUrl?'cached-png':'svg-fallback',reconstruction:'gaussian .45 CSS px',support,graphicLost,maskBuilds,promotions,observations,errors,width:mask.width,height:mask.height}),
  setEnabled(value){active=!!value;if(active&&supported){overlay.style.display='';schedule();}else{if(support.popover&&overlay.matches(':popover-open'))overlay.hidePopover();overlay.style.display='none';}},
  refresh:schedule,
  dispose(){if(dead)return;dead=true;observer.disconnect();doc.removeEventListener('beforetoggle',layerChange,true);doc.removeEventListener('toggle',layerChange,true);doc.removeEventListener('fullscreenchange',schedule);win.removeEventListener('resize',resize);win.visualViewport?.removeEventListener('resize',resize);mask.removeEventListener('contextlost',maskLost);mask.removeEventListener('contextrestored',maskRestored);overlay.remove();svg.remove();style.remove();delete globalThis[KEY];}
 };
 globalThis[KEY]=api;promote();return api;
}
