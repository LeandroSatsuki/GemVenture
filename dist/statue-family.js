import {STATUE_FAMILY,STATUE_FRAME,STATUE_EMBEDDED} from './statue-family-manifest.js';
import {createAlphaPlane,createAlphaMask,transformedAlphaContains} from './refuge-picking.js';

// Presentation only. Tier comes from the canonical domain; no score or ACK here.
const sprites=new Map(),failed=new Set();let loading=null;
export function statueMaterial(tier){return STATUE_FAMILY[Number.isInteger(tier)&&tier>=0&&tier<STATUE_FAMILY.length?tier:0];}
export function statueFamilyReady(tier){return sprites.has(statueMaterial(tier).tier);}
export function statueFamilyUrl(tier){const spec=statueMaterial(tier);return STATUE_EMBEDDED[spec.id]||spec.file;}
export function statueFamilyStatus(){return {expected:STATUE_FAMILY.length,ready:sprites.size,failed:[...failed],imagePixels:[...sprites.values()].reduce((n,s)=>n+s.image.width*s.image.height,0)};}
export function loadStatueFamily(){
 if(loading||typeof Image==='undefined'||typeof document==='undefined')return loading;
 let next=0;
 const load=spec=>new Promise(resolve=>{
  const image=new Image();image.onerror=()=>{failed.add(spec.id);resolve();};image.onload=()=>{
   try{
    if(image.naturalWidth!==STATUE_FRAME.pixels[0]||image.naturalHeight!==STATUE_FRAME.pixels[1])throw Error('Statue cache frame changed');
    const read=document.createElement('canvas');read.width=image.naturalWidth;read.height=image.naturalHeight;
    const c=read.getContext('2d');c.drawImage(image,0,0);
    const plane=createAlphaPlane(c.getImageData(0,0,read.width,read.height).data,read.width,read.height);
    const mask=createAlphaMask(plane,()=>document.createElement('canvas'));
    read.width=read.height=1;
    sprites.set(spec.tier,{image,plane,mask});
   }catch{failed.add(spec.id);}resolve();
  };image.src=statueFamilyUrl(spec.tier);
 });
 loading=Promise.all(Array.from({length:2},async()=>{while(next<STATUE_FAMILY.length)await load(STATUE_FAMILY[next++]);}));
 return loading;
}
export function statueFamilyBounds(width){
 const k=width/STATUE_FRAME.referenceWidth,[w,h]=STATUE_FRAME.local,[x,y]=STATUE_FRAME.anchor;
 return {left:-x*k-3,top:-y*k-3,right:(w-x)*k+3,bottom:(h-y)*k+3};
}
export function drawStatueFamily(c,tier,x,y,width,{mask=false}={}){
 const sprite=sprites.get(statueMaterial(tier).tier);if(!sprite)return false;
 const k=width/STATUE_FRAME.referenceWidth,[w,h]=STATUE_FRAME.local,[ax,ay]=STATUE_FRAME.anchor;
 c.drawImage(mask?sprite.mask:sprite.image,x-ax*k,y-ay*k,w*k,h*k);return true;
}
export function statueFamilyContains(tier,x,y,width,px,py){
 const sprite=sprites.get(statueMaterial(tier).tier);if(!sprite)return false;
 const k=width/STATUE_FRAME.referenceWidth,[w,h]=STATUE_FRAME.local,[ax,ay]=STATUE_FRAME.anchor;
 return transformedAlphaContains(sprite.plane,[w*k/sprite.image.width,0,0,h*k/sprite.image.height,x-ax*k,y-ay*k],px,py);
}
