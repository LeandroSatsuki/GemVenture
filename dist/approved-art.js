import {currentCreatureArt} from './current-creature-art.js';
import {APPROVED_ART,APPROVED_ART_ROOT,APPROVED_EMBEDDED} from './approved-art-manifest.js';

// A bounded, sequentially decoded set of approved raster art. No palette
// conversion or per-frame allocation: original PNGs are only cropped/scaled.
export const APPROVED_ART_LIMITS=Object.freeze({assets:80,side:256,bossSide:384});
const byKey=new Map(),sprites=new Map(),failed=new Set();let loading=null,revision=0;
const key=(type,{biome=0,variant=0}={})=>type==='boss'?'boss:'+variant:type==='rabbit'?'rabbit':['rock','crystal'].includes(type)?type+':'+biome+':'+variant:type+':'+biome;
const ACTIVE_ART=APPROVED_ART.map(spec=>{const a=currentCreatureArt(spec.type,spec.biome);return a?{...spec,width:a.width,height:a.height,bounds:a.bounds,anchor:{x:128,y:192},currentSource:a.source,currentId:a.id}:spec;});
for(const spec of ACTIVE_ART)byKey.set(key(spec.type,spec),spec);
export function approvedArtSpec(type,options={}){return byKey.get(key(type,options))||null;}
export function approvedArtAvailable(type,options={}){const spec=approvedArtSpec(type,options);return Boolean(spec&&sprites.has(spec.id));}
export function approvedArtSource(spec){return spec.currentSource||APPROVED_EMBEDDED[spec.id]||APPROVED_ART_ROOT+spec.file;}
export function approvedArtRevision(){return revision;}
export function approvedArtStatus(){return {total:APPROVED_ART.length,ready:sprites.size,failed:[...failed],revision,cachePixels:[...sprites.values()].reduce((n,s)=>n+s.canvas.width*s.canvas.height,0)};}
export function approvedArtRect(spec,x,y,width){
 const b=spec.bounds,a=spec.anchor,fit=spec.fit||{width:100,height:96};
 const scale=Math.min(width*(fit.width/100)/b.width,width*(fit.height/100)/b.height);
 return {x:x-(a.x-b.x)*scale,y:y-(a.y-b.y)*scale,width:b.width*scale,height:b.height*scale,scale};
}
export function loadApprovedArt(){
 if(loading)return loading;if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(approvedArtStatus());
 loading=(async()=>{for(const spec of [...ACTIVE_ART].sort((a,b)=>a.biome-b.biome).slice(0,APPROVED_ART_LIMITS.assets))await new Promise(resolve=>{
  const image=new Image();image.onerror=()=>{failed.add(spec.id);resolve();};
  image.onload=()=>{try{
   if(image.naturalWidth!==spec.width||image.naturalHeight!==spec.height)throw new Error('Approved art dimensions changed: '+spec.id);
   const b=spec.bounds,side=spec.type==='boss'?APPROVED_ART_LIMITS.bossSide:APPROVED_ART_LIMITS.side,k=Math.min(1,side/Math.max(b.width,b.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(b.width*k));canvas.height=Math.max(1,Math.ceil(b.height*k));
   const c=canvas.getContext('2d');if(!c)throw new Error('Missing raster context');c.imageSmoothingEnabled=true;c.drawImage(image,b.x,b.y,b.width,b.height,0,0,canvas.width,canvas.height);sprites.set(spec.id,{canvas,spec});
  }catch{failed.add(spec.id);}resolve();};
  image.src=approvedArtSource(spec);
 });revision++;return approvedArtStatus();})();return loading;
}
export function drawApprovedArt(c,type,x,y,width,options={}){
 // Procedural multipart animation remains in place for families without a
 // matching approved full-body sprite. Never repeat a body in every layer.
 if(options.layer&&options.layer!=='all')return false;
 const spec=approvedArtSpec(type,options);if(!spec)return false;
 const sprite=sprites.get(spec.id);if(!sprite){loadApprovedArt();return false;}
 const r=approvedArtRect(spec,x,y,width);c.drawImage(sprite.canvas,r.x,r.y,r.width,r.height);return true;
}
export function approvedArtSvg(type,options={}){
 const spec=approvedArtSpec(type,options);if(!spec)return null;const r=approvedArtRect(spec,50,96,100),b=spec.bounds;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="110" viewBox="0 0 100 110" role="img" aria-label="${spec.id}"><svg x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" style="width:${r.width}px;height:${r.height}px" viewBox="${b.x} ${b.y} ${b.width} ${b.height}" overflow="hidden"><image href="${approvedArtSource(spec)}" width="${spec.width}" height="${spec.height}"/></svg></svg>`;
}
