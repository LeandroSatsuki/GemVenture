// Draw information into a separate 2D layer, then composite after screen finish.
// Native/offline renderers without document/OffscreenCanvas draw directly instead.
const layers=new WeakMap();
const styles=['globalAlpha','globalCompositeOperation','font','textAlign','textBaseline','direction','lineWidth','lineCap','lineJoin','miterLimit','fillStyle','strokeStyle','shadowColor','shadowBlur','shadowOffsetX','shadowOffsetY','imageSmoothingEnabled'];
export function crispCanvasFor(source){return layers.get(source)?.canvas||null;}
export function beginCrispFrame(source,{makeCanvas=()=>typeof document!=='undefined'?document.createElement('canvas'):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null}={}){
 let entry=layers.get(source);
 if(!entry){let canvas=null,ctx=null;try{canvas=makeCanvas();ctx=canvas?.getContext('2d');}catch{}entry={canvas,ctx,active:false};layers.set(source,entry);}
 if(!entry.ctx)return false;
 const canvas=entry.canvas;if(canvas.width!==source.canvas.width)canvas.width=source.canvas.width;if(canvas.height!==source.canvas.height)canvas.height=source.canvas.height;
 const h=entry.ctx;h.setTransform(1,0,0,1,0,0);h.clearRect(0,0,canvas.width,canvas.height);entry.active=true;return true;
}
export function paintCrisp(source,paint){
 const entry=layers.get(source);if(!entry?.active){paint(source);return;}
 const h=entry.ctx;h.save();try{h.setTransform(source.getTransform());for(const key of styles)if(key in source)h[key]=source[key];if(source.getLineDash)h.setLineDash(source.getLineDash());paint(h);}finally{h.restore();}
}
export function flushCrispFrame(source){
 const entry=layers.get(source);if(!entry?.active)return false;if(!entry.canvas.width||!entry.canvas.height){entry.active=false;return false;}
 if(entry.canvas.parentElement&&entry.canvas.parentElement===source.canvas.parentElement){entry.active=false;return true;}
 source.save();try{source.setTransform(1,0,0,1,0,0);source.globalAlpha=1;source.globalCompositeOperation='source-over';source.shadowBlur=0;source.shadowOffsetX=0;source.shadowOffsetY=0;if('filter' in source)source.filter='none';source.drawImage(entry.canvas,0,0);}finally{source.restore();entry.active=false;}return true;
}
