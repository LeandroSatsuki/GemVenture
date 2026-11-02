import {approvedArtSpec,approvedArtSource} from './approved-art.js';
import {createGeodeRig,paintGeodeRig} from './geode-rig.js';
import {GEODE_PATCH_FILE,GEODE_PATCH_EMBEDDED} from './geode-art-manifest.js';
let loading=null,rig=null,phase='cold';
const image=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Geode art unavailable'));im.src=src;});
export function loadGeodeArt(){
 if(loading)return loading;
 if(typeof Image==='undefined'||typeof document==='undefined')return Promise.resolve(false);
 phase='loading';
 loading=(async()=>{try{const spec=approvedArtSpec('boss',{variant:0});if(!spec)throw Error('Missing approved Geode');const [body,patch]=await Promise.all([image(approvedArtSource(spec)),image(GEODE_PATCH_EMBEDDED||GEODE_PATCH_FILE)]);if(body.naturalWidth!==spec.width||body.naturalHeight!==spec.height||patch.naturalWidth!==spec.width||patch.naturalHeight!==spec.height)throw Error('Geode source dimensions changed');rig=createGeodeRig(body,(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},{chestImage:patch});phase='ready';return true;}catch{phase='failed';return false;}})();
 return loading;
}
export function geodeArtStatus(){return {phase,ready:!!rig,cachePixels:rig?.pixels||0};}
export function paintGeodeArt(c,options){if(!rig)return false;paintGeodeRig(c,rig,{...options,variant:'A'});return true;}
