import {drawAsset} from './art-kit.js';
import {approvedArtAvailable,approvedArtSpec,approvedArtRect,approvedArtRevision} from './approved-art.js';
import {P,BIOME_ART} from './palette.js';

// Pilot only. Called at the two cave entity draws, never through UI/art-kit.
export const MINERAL_TREATMENT=Object.freeze({cacheLimit:64,sourceSide:256,definitionDensity:1.5,rockTint:.06,crystalTint:.035,shadowAlpha:.14,coreAlpha:.16,shadowRadiusX:.30,shadowRadiusY:.055,coreRadiusX:.14,coreRadiusY:.026,groundOffset:.20});
export function createMineralTreatment({makeCanvas=()=>document.createElement('canvas')}={}){
 const cache=new Map();let prepared=0,revision=-1;
 const status=()=>({entries:cache.size,prepared,pixels:[...cache.values()].reduce((s,v)=>s+v.canvas.width*v.canvas.height,0),limit:MINERAL_TREATMENT.cacheLimit});
 function paint(c,type,x,y,width,options={},mode='contact'){
  if(type==='crystal'||type==='rock'){drawAsset(c,type,x,y,width,{...options,procedural:true});return true;}
  if(!['rock','crystal'].includes(type)||!['contact','definition'].includes(mode)||!approvedArtAvailable(type,options)){drawAsset(c,type,x,y,width,options);return false;}
  const current=approvedArtRevision();if(current!==revision){cache.clear();revision=current;}
  const spec=approvedArtSpec(type,options),r=approvedArtRect(spec,0,0,width),biome=spec.biome,key=[spec.id,spec.sha256,width,mode,revision].join(':');let item=cache.get(key);
  if(!item){
   const density=mode==='definition'?MINERAL_TREATMENT.definitionDensity:MINERAL_TREATMENT.sourceSide/Math.max(r.width,r.height),pixelWidth=Math.max(1,Math.ceil(r.width*density)),pixelHeight=Math.max(1,Math.ceil(r.height*density));
   let canvas;if(cache.size>=MINERAL_TREATMENT.cacheLimit){const first=cache.keys().next().value;canvas=cache.get(first).canvas;cache.delete(first);}else canvas=makeCanvas();canvas.width=pixelWidth;canvas.height=pixelHeight;const g=canvas.getContext('2d');
   g.save();g.scale(pixelWidth/r.width,pixelHeight/r.height);g.translate(-r.x,-r.y);g.imageSmoothingEnabled=true;drawAsset(g,type,0,0,width,options);g.restore();
   g.globalCompositeOperation='source-atop';g.globalAlpha=type==='rock'?MINERAL_TREATMENT.rockTint:MINERAL_TREATMENT.crystalTint;g.fillStyle=BIOME_ART[biome].floor;g.fillRect(0,0,pixelWidth,pixelHeight);g.globalCompositeOperation='source-over';g.globalAlpha=1;
   item={canvas,rect:r};cache.set(key,item);prepared++;
  }else{cache.delete(key);cache.set(key,item);}
  c.save();const a=c.globalAlpha;c.fillStyle=P.ink;c.globalAlpha=a*MINERAL_TREATMENT.shadowAlpha;c.beginPath();c.ellipse(x,y+MINERAL_TREATMENT.groundOffset,width*MINERAL_TREATMENT.shadowRadiusX,width*MINERAL_TREATMENT.shadowRadiusY,0,0,Math.PI*2);c.fill();c.globalAlpha=a*MINERAL_TREATMENT.coreAlpha;c.beginPath();c.ellipse(x,y,width*MINERAL_TREATMENT.coreRadiusX,width*MINERAL_TREATMENT.coreRadiusY,0,0,Math.PI*2);c.fill();
  c.globalAlpha=a;c.imageSmoothingEnabled=true;c.drawImage(item.canvas,x+r.x,y+r.y,r.width,r.height);c.restore();return true;
 }
 return{paint,status,dispose(){cache.clear();}};
}
let shared=null;
export function drawCaveMineral(c,type,x,y,width,options={},mode='contact'){shared??=createMineralTreatment();return shared.paint(c,type,x,y,width,options,mode);}
export function caveMineralTreatmentStatus(){return shared?.status()||{entries:0,prepared:0,pixels:0,limit:MINERAL_TREATMENT.cacheLimit};}
export function disposeCaveMineralTreatment(){shared?.dispose();shared=null;}
