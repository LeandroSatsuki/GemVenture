import {generateAsset,assetSvgBody} from './art-kit.js';
import {pickaxeTier} from './pickaxe-style.js';
const cursors=new Map();
export function pickaxeCursor(level){const tier=pickaxeTier(level);if(!cursors.has(tier)){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 100 110">'+assetSvgBody(generateAsset('pickaxe',{variant:tier}))+'</svg>';
 // The left blade tip (13,40) is the click point, not the middle of the handle.
 cursors.set(tier,'url("data:image/svg+xml,'+encodeURIComponent(svg)+'") 5 16, pointer');
 }return cursors.get(tier);}
let lastTier=-1;
export function updatePickaxeCursor(level){const tier=pickaxeTier(level);if(tier===lastTier)return;lastTier=tier;document.documentElement.style.setProperty('--pickaxe-cursor',pickaxeCursor(level));document.documentElement.dataset.pickaxeTier=String(tier);}
