import {P} from './palette.js';
import {biomeIndex,TOTAL_FLOORS} from './campaign.js';

// One quiet, static veil over the world. No extra CRT, animation or raster bank.
export const CAVE_ATMOSPHERE_MAX_ALPHA=.03;
export const CAVE_ATMOSPHERES=Object.freeze([
 {color:P.cyan,alpha:.020},
 {color:P.lime,alpha:.018},
 {color:P.sand,alpha:.025},
 {color:P.orange,alpha:.025},
 {color:P.pink,alpha:.018},
 {color:P.gold,alpha:.022},
 {color:P.green,alpha:.025}
].map(Object.freeze));
export function caveAtmosphereProfile(run){
 if(!run?.room||run.mode==='abyss'||run.room.layout?.style==='ABISMO'||!Number.isInteger(run.floor)||run.floor<1||run.floor>TOTAL_FLOORS)return null;
 return CAVE_ATMOSPHERES[biomeIndex(run.floor)]??null;
}
// Covers the world canvas, including its dark margins, with no cache-edge seam.
// If separate crisp rendering failed this frame, skip rather than tint text.
export function paintCaveAtmosphere(c,run,{crispReady=false}={}){
 const p=caveAtmosphereProfile(run);
 if(!p||crispReady!==true||!c?.canvas?.width||!c.canvas.height)return false;
 c.save();try{
  c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(p.alpha,CAVE_ATMOSPHERE_MAX_ALPHA)*.5;
  c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;if('filter' in c)c.filter='none';
  c.fillStyle=p.color;c.fillRect(0,0,c.canvas.width,c.canvas.height);
 }finally{c.restore();}
 return true;
}
