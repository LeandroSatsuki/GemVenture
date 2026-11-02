import {generateAsset,assetSvgBody} from './art-kit.js';
import {pickaxeTier} from './pickaxe-style.js';
import {pickaxeAssetState,loadPickaxeAsset,pickaxeArtRecord,pickaxeArtGeneration} from './pickaxe-art.js';
const cursors=new Map();
function fallback(level){const tier=pickaxeTier(level);if(!cursors.has(tier)){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 100 110">'+assetSvgBody(generateAsset('pickaxe',{variant:tier}))+'</svg>';
 cursors.set(tier,'url("data:image/svg+xml,'+encodeURIComponent(svg)+'") 5 16, pointer');
 }return cursors.get(tier);}
export function pickaxeCursor(level){
 const one=pickaxeAssetState(level,'cursor1x');if(!one.url)return fallback(level);
 const two=pickaxeAssetState(level,'cursor2x');if(two.url){const value='image-set(url("'+one.url+'") 1x, url("'+two.url+'") 2x) 5 16, pointer';if(globalThis.CSS?.supports?.('cursor',value))return value;}
 return 'url("'+one.url+'") 5 16, pointer';
}
let currentTier=-1,currentRoot=null,requestKey='';
export function updatePickaxeCursor(level){
 const tier=pickaxeTier(level),root=document.documentElement;if(root!==currentRoot){currentRoot=root;requestKey='';}currentTier=tier;
 const paint=()=>{const css=pickaxeCursor(level);if(root.style.getPropertyValue('--pickaxe-cursor')!==css)root.style.setProperty('--pickaxe-cursor',css);root.dataset.pickaxeTier=String(tier);};paint();
 const record=pickaxeArtRecord(level),key=record.id+':'+record.roles.cursor1x.sha256+':'+record.roles.cursor2x.sha256+':'+pickaxeArtGeneration();if(requestKey===key)return;requestKey=key;
 for(const role of ['cursor1x','cursor2x'])loadPickaxeAsset(level,role).then(()=>{if(currentTier===tier&&currentRoot===root&&document.documentElement===root&&requestKey===key)paint();});
}
