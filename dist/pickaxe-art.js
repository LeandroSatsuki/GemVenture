import {dungeonPickaxeSvg} from './dungeon-pickaxe.js';
import {PICKAXE_ART} from './pickaxe-art-manifest.js';
import {PICKAXE_STYLES,pickaxeTier} from './pickaxe-style.js';
import {generateAsset,assetSvgBody} from './art-kit.js';
// At most ten styles × three derived roles. No masters, timers, object URLs or saves.
const cache=new Map();let generation=0;
export const pickaxeArtGeneration=()=>generation;
export const pickaxeArtRecord=level=>PICKAXE_ART[pickaxeTier(level)];
const keyFor=(record,role)=>record.id+':'+role+':'+record.roles[role].sha256+':'+generation;
export const pickaxeAssetURL=(record,role)=>new URL(record.roles[role].file,import.meta.url).href;
export function pickaxeAssetState(level,role){const record=pickaxeArtRecord(level),entry=cache.get(keyFor(record,role));return{status:entry?.status||'idle',record,url:entry?.status==='ready'?pickaxeAssetURL(record,role):null};}
export function loadPickaxeAsset(level,role){
 const record=pickaxeArtRecord(level),key=keyFor(record,role),existing=cache.get(key);if(existing)return existing.promise;
 if(typeof Image!=='function')return Promise.resolve({status:'unavailable',record,url:null});
 const image=new Image(),entry={status:'loading',promise:null,cancel:null};
 entry.promise=new Promise(resolve=>{const finish=status=>{if(entry.status!=='loading')return;entry.status=status;image.onload=null;image.onerror=null;resolve({status,record,url:status==='ready'?pickaxeAssetURL(record,role):null});};entry.cancel=()=>finish('disposed');
  image.decoding='async';image.onload=()=>{if(typeof image.decode==='function')image.decode().then(()=>finish(image.naturalWidth>0?'ready':'failed'),()=>finish('failed'));else finish(image.naturalWidth>0?'ready':'failed');};image.onerror=()=>finish('failed');image.src=pickaxeAssetURL(record,role);
 });cache.set(key,entry);return entry.promise;
}
export function disposePickaxeArt(){for(const entry of cache.values())entry.cancel();cache.clear();generation++;}
export function pickaxePreview(level){
 const tier=pickaxeTier(level);
 return '<svg viewBox="0 0 100 110" role="img" aria-label="Picareta '+PICKAXE_STYLES[tier].name+'" data-pickaxe-art="forge-native" data-pickaxe-tier="'+tier+'">'+dungeonPickaxeSvg(tier)+'</svg>';
}
export function hydratePickaxePreviews(dialog){
 for(const host of dialog.querySelectorAll('[data-pickaxe-art="forge"]')){
  const tier=Number(host.dataset.pickaxeTier),record=PICKAXE_ART[tier];if(!record)continue;const key=keyFor(record,'forge');if(host.dataset.pickaxeLoadKey===key)continue;host.dataset.pickaxeLoadKey=key;
  loadPickaxeAsset(PICKAXE_STYLES[tier].level,'forge').then(result=>{
   if(host.dataset.pickaxeLoadKey!==key||!host.isConnected||host.closest('dialog')!==dialog||!dialog.open||Number(host.dataset.pickaxeTier)!==tier)return;
   host.dataset.pickaxeState=result.status;if(result.status!=='ready')return;
   const image=host.ownerDocument.createElementNS('http://www.w3.org/2000/svg','image');image.setAttribute('href',record.roles.forge.file);image.setAttribute('width','100');image.setAttribute('height','110');host.replaceChildren(image);
  });
 }
}
