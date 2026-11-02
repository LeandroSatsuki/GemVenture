// Material presentation only: original bitmaps, geometry, alpha and simulation stay intact.
import {P,BIOME_ART} from './palette.js';
export const CAVE_BIOME_STAGE=Object.freeze([0,1,2,3,4,5,6]);
export const ARRIVAL_ART_BOUNDS=Object.freeze({left:25,right:74,top:183.5,bottom:239.5});
const profiles=Object.freeze([
 {dark:P.ink,base:P.slate,light:P.steel,fields:[P.wood,P.gray],decor:'lantern'},
 {dark:P.ink,base:P.deepTeal,light:P.forest,fields:[P.forest,P.bark],decor:'bush'},
 {dark:P.coal,base:P.bark,light:P.wood,fields:[P.wood,P.clay],decor:'fossil'},
 {dark:P.ink,base:P.aubergine,light:P.plum,fields:[P.maroon,P.coal],decor:'lantern'},
 {dark:P.ink,base:P.deepTeal,light:P.slate,fields:[P.plum,P.forest],decor:'mushroom'},
 {dark:P.coal,base:P.wood,light:P.clay,fields:[P.bark,P.rust],decor:'molehill'},
 {dark:P.ink,base:P.deepTeal,light:P.forest,fields:[P.wood,P.deepTeal],decor:'bush'}
].map((p,i)=>Object.freeze({...p,fields:Object.freeze(p.fields),floor:BIOME_ART[i].floor})));
export function caveBiomeProfile(biome){return CAVE_BIOME_STAGE.includes(biome)?profiles[biome]:null;}
const banks=new Map();let reads=0,pixels=0;
export const wallMaterialMetrics=()=>({banks:banks.size,reads,pixels,maxBanks:6});
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function sample(image,crop,width,height,profile){
 const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.drawImage(image,...crop,0,0,width,height);
 const frame=ctx.getImageData(0,0,width,height),a=rgb(profile.dark),b=rgb(profile.base),d=rgb(profile.light);reads++;pixels+=width*height;
 for(let i=0;i<frame.data.length;i+=4){if(!frame.data[i+3])continue;const l=(frame.data[i]*.2126+frame.data[i+1]*.7152+frame.data[i+2]*.0722)/255,t=Math.max(0,Math.min(1,(l-.075)/.36)),u=t<.45?t/.45:(t-.45)/.55,from=t<.45?a:b,to=t<.45?b:d;for(let j=0;j<3;j++)frame.data[i+j]=Math.round(from[j]+(to[j]-from[j])*u);}
 ctx.putImageData(frame,0,0);return c;
}
export function createWallMaterial(images,biome){
 if(banks.has(biome))return banks.get(biome);const p=caveBiomeProfile(biome);if(!p||biome===0)throw Error('Original biome uses its unchanged sampler');
 const face=sample(images[0],[0,0,images[0].naturalWidth||images[0].width,images[0].naturalHeight||images[0].height],528,192,p),cap=sample(images[1],[0,0,2079,756],288,16,p),foot=sample(images[3],[24,305,2124,166],352,16,p);
 const value={face,cap,capCrop:[0,0,288,16],foot,footCrop:[0,0,352,16],color:p.base};banks.set(biome,value);return value;
}
