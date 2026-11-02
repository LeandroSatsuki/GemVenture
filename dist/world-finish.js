import {globalFinishStatus} from './global-screen-finish.js';
import {createScreenFinish,APPROVED_CRT} from './screen-finish.js';

// Browser: direct GPU presentation with a separate crisp HUD. Original Canvas2D
// keeps all input and remains the fallback. Detached/native output can copy back.
export function createWorldFinish({makeCanvas=()=>typeof document!=='undefined'?document.createElement('canvas'):null}={}){
 let canvas=null,renderer=null,unsupported=false,lost=false,dead=false,enabled=true,frames=0,failures=0,dom=false,hudCanvas=null,sourceCanvas=null;
 function hide(){if(dom&&canvas)canvas.style.visibility='hidden';}
 function onLost(e){e.preventDefault();lost=true;hide();}
 function onRestored(){renderer=null;lost=false;unsupported=false;}
 function ready(){
  if(dead||unsupported||lost||!enabled){hide();return false;}
  if(!canvas){canvas=makeCanvas();if(!canvas){unsupported=true;return false;}canvas.addEventListener?.('webglcontextlost',onLost);canvas.addEventListener?.('webglcontextrestored',onRestored);}
  if(!renderer){try{renderer=createScreenFinish(canvas);}catch{renderer=null;}if(!renderer)unsupported=true;}
  return !!renderer;
 }
 function presentBeside(source,hud){
  const parent=source.parentElement;
  if(!parent||!canvas?.style||!hud?.style||typeof parent.insertBefore!=='function')return false;
  if(canvas.parentElement!==parent)parent.insertBefore(canvas,source.nextSibling);
  if(hud.parentElement!==parent)parent.insertBefore(hud,canvas.nextSibling);
  for(const [layer,role]of [[canvas,'crt'],[hud,'crisp-hud']]){
   layer.dataset.worldLayer=role;layer.setAttribute('aria-hidden','true');layer.tabIndex=-1;
   const style=layer.style;style.position='absolute';style.inset='auto';style.left=source.offsetLeft+'px';style.top=source.offsetTop+'px';style.width=source.clientWidth+'px';style.height=source.clientHeight+'px';style.pointerEvents='none';style.margin='0';style.border='0';style.padding='0';style.imageRendering='auto';
  }
  dom=true;sourceCanvas=source;hudCanvas=hud;return true;
 }
 return {
  apply(ctx,{dpr=1,hud=null}={}){
   if(globalFinishStatus().installed&&ctx?.canvas?.isConnected){hide();if(hud?.dataset?.worldLayer==='crisp-hud')hud.remove();return false;}
   if(!ctx?.canvas||!ready())return false;const source=ctx.canvas;if(!source.width||!source.height)return false;
   if(canvas.width!==source.width)canvas.width=source.width;if(canvas.height!==source.height)canvas.height=source.height;
   let ok=false;try{ok=renderer.draw(source,{...APPROVED_CRT,dpr});}catch{ok=false;}
   if(!ok){failures++;hide();return false;}
   if(presentBeside(source,hud)){canvas.style.visibility='visible';frames++;return true;}
   ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;if('filter' in ctx)ctx.filter='none';ctx.drawImage(canvas,0,0);frames++;return true;}finally{ctx.restore();}
  },
  setEnabled(value){enabled=!!value;if(!enabled)hide();},
  status(){return {enabled,available:!!renderer&&!lost&&!unsupported,lost,unsupported,frames,failures,...APPROVED_CRT,presentation:dom?'gpu-layer':'copy',width:canvas?.width||0,height:canvas?.height||0};},
  dispose(){if(dead)return;dead=true;hide();renderer?.dispose();canvas?.removeEventListener?.('webglcontextlost',onLost);canvas?.removeEventListener?.('webglcontextrestored',onRestored);if(dom){canvas.remove();if(hudCanvas?.parentElement===sourceCanvas?.parentElement)hudCanvas.remove();}renderer=null;canvas=null;}
 };
}
