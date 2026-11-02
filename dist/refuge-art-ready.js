import {minerOutfitKey} from './miner-outfit.js';
// Only the selected, approved lobby families. No historical candidate scanning.
export const REFUGE_NIGHT_FILES=Object.freeze([
 'assets/refuge-night-v1/forest.png','assets/refuge-night-v3/echo-tree.png',
 // Other actions are warmed just before use by the bounded appearance cache.
 ...['front','idle','wardrobe'].map(n=>'assets/miner-living-v7/hardhat-blue/'+n+'.png'),
 ...['copper','silver','gold','emerald','ruby','amethyst','stellar'].map(n=>'assets/refuge-night-v2/statue-'+n+'.png'),
 ...['slime-front','slime-hop','bat-front','bat-fly'].map(n=>'assets/pets-procedural-v1/'+n+'.png')
]);
let ready=null;
export function loadNightRefugeArt(){
 if(typeof Image==='undefined')return Promise.resolve({failed:[]});
 let profile;try{profile=JSON.parse(localStorage.getItem('gemventure-save-v2'));}catch{}const key=minerOutfitKey(profile);
 return ready??=Promise.all(REFUGE_NIGHT_FILES.map(p=>p.replace('miner-living-v7/hardhat-blue/','miner-living-v7/'+key+'/')).map(url=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(null);im.onerror=()=>resolve(url);im.src=url;}))).then(files=>({failed:files.filter(Boolean)}));
}
