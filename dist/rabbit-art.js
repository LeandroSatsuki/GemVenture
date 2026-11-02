import {approvedArtSpec,approvedArtSource} from './approved-art.js';
import {createRabbitRig} from './rabbit-rig.js';
export const RABBIT_BODY_FILE='assets/rabbit-rig-v4/rabbit-child-body.png';
export const RABBIT_BODY_EMBEDDED=null;
let loading=null,rig=null,phase='cold';
const image=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Rabbit art unavailable'));im.src=src;});
export function loadRabbitArt(){
 if(loading)return loading;
 if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(false);
 phase='loading';loading=(async()=>{try{const boss=approvedArtSpec('boss',{variant:6}),child=approvedArtSpec('rabbit',{biome:6});if(!boss||!child)throw Error('Missing approved rabbit sources');const [bossImage,childImage,bodyImage]=await Promise.all([image(approvedArtSource(boss)),image(approvedArtSource(child)),image(RABBIT_BODY_EMBEDDED||RABBIT_BODY_FILE)]);rig=createRabbitRig({bossImage,childImage,bodyImage,makeCanvas:(width,height)=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;}});phase='ready';return true;}catch{rig=null;phase='failed';return false;}})();return loading;
}
export function rabbitArtStatus(){return {phase,ready:!!rig,cacheSurfaces:rig?.canvasCount||0,cachePixels:rig?.pixels||0};}
export const rabbitArtRig=()=>rig;
