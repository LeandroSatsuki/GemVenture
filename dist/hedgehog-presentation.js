// GV007 consumer of the real, frozen GV006 CP2 art recipe. Presentation only.
import {createHedgehogRasterRig} from './hedgehog-raster-art.js';
export const HEDGEHOG_ASSET_ROOT='assets/hedgehog-v1/';
export const HEDGEHOG_EMBEDDED=Object.freeze({});
export const HEDGEHOG_SOURCES=Object.freeze([
 Object.freeze({id:'master',file:'hedgehog-master-v01.png',width:1448,height:1086,sha256:'b7e702d345c153a562e1bbfcea9303fc6d563b434a636e7c29088330e11515e8'}),
 Object.freeze({id:'backing',file:'hedgehog-backing-v01.png',width:1448,height:1086,sha256:'7b8c4b49ac32565f1989eadc8cd4099e90b483540c2ae79a4e6a44d0f46d2a39'}),
 Object.freeze({id:'eyeBacking',file:'hedgehog-eye-backing-v01.png',width:1448,height:1086,sha256:'9f802be295a28c33c5ea1b326dbc2ddc60323c3895d51529ff3e3620a96927f5'})
]);
function browserCanvas(width,height){const c=globalThis.document?.createElement('canvas');if(!c)throw Error('Hedgehog canvas unavailable');c.width=width;c.height=height;return c;}
function browserImage(url){return new Promise((resolve,reject)=>{if(typeof globalThis.Image!=='function'){reject(Error('Hedgehog image decoder unavailable'));return;}const img=new globalThis.Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Hedgehog source failed: '+url));img.src=url;});}
export function createHedgehogPresentation({readImage=browserImage,createCanvas=browserCanvas,sourceUrl=spec=>HEDGEHOG_EMBEDDED[spec.id]||HEDGEHOG_ASSET_ROOT+spec.file}={}){
 let phase='idle',pending=null,rig=null,error=null,decoded=0,preparations=0,draws=0,revision=0;
 const status=()=>({phase,error,decoded,preparations,draws,revision,sourceCount:HEDGEHOG_SOURCES.length,cache:rig?{...rig.cache}:null});
 function prepare(){
  if(pending)return pending;
  phase='loading';pending=(async()=>{
   const images={};try{
    // Sequential decode bounds source concurrency; cache/variants are warmed once.
    for(const spec of HEDGEHOG_SOURCES){const image=await readImage(sourceUrl(spec));const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;if(width!==spec.width||height!==spec.height)throw Error('Hedgehog source dimensions changed: '+spec.id);images[spec.id]=image;decoded++;}
    const prepared=createHedgehogRasterRig({...images,createCanvas});preparations++;
    for(let biome=0;biome<7;biome++)prepared.crystalVariant(biome);
    rig=prepared;phase='ready';revision++;
   }catch(e){rig=null;phase='failed';error=e instanceof Error?e.message:String(e);revision++;}
   finally{for(const image of Object.values(images))if(typeof image.close==='function')image.close();}
   return status();
  })();return pending;
 }
 function draw(c,x,y,options){if(phase!=='ready'){if(phase==='idle')void prepare();return false;}rig.draw(c,x,y,options);draws=Math.min(Number.MAX_SAFE_INTEGER,draws+1);return true;}
 return Object.freeze({prepare,draw,status});
}
const shared=createHedgehogPresentation();
export const loadHedgehogArt=()=>shared.prepare();
export const drawHedgehogArt=(c,x,y,options)=>shared.draw(c,x,y,options);
export const hedgehogArtStatus=()=>shared.status();
export function traceHedgehogArch(c,x,y){
 c.beginPath();c.moveTo(x-65,y-43);c.bezierCurveTo(x-65,y-73,x-35,y-97,x,y-97);c.bezierCurveTo(x+35,y-97,x+65,y-73,x+65,y-43);c.lineTo(x+65,y-7);c.quadraticCurveTo(x+65,y+11,x+47,y+11);c.lineTo(x-47,y+11);c.quadraticCurveTo(x-65,y+11,x-65,y-7);c.closePath();
}
