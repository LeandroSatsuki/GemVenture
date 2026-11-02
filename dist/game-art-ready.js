import {minerOutfitKey} from './miner-outfit.js';
import {loadDungeonPickaxes} from './dungeon-pickaxe.js';
import {loadDungeonMiner} from './dungeon-miner.js';
import {loadVillageArt} from './flow-village.js';
import {loadApprovedArt} from './approved-art.js';
import {loadWallArt} from './cave-wall-art.js';
import {loadCavePlayerArt} from './cave-player-art.js';
import {loadHedgehogArt} from './hedgehog-presentation.js';
import {loadNightRefugeArt} from './refuge-art-ready.js';

// These loaders own decoding, bounded caches and failed-image fallbacks. Wait
// for their final state before showing either the refuge or a saved expedition.
// loadVillageArt also prepares the current structures, player and lift layers.
let ready=null;
export function prepareGameArt(onProgress=()=>{}){
 if(ready)return ready;let completed=0;const labels=['Refúgio','Minérios e criaturas','Cavernas','Personagem','Ouriço','Refúgio noturno','Minerador aprovado','Ferramentas'];const loaders=[loadVillageArt,loadApprovedArt,loadWallArt,loadCavePlayerArt,loadHedgehogArt,loadNightRefugeArt,()=>{let profile;try{profile=JSON.parse(localStorage.getItem('gemventure-save-v2'));}catch{}return loadDungeonMiner(minerOutfitKey(profile));},loadDungeonPickaxes];
 return ready=Promise.all(loaders.map((load,i)=>Promise.resolve().then(load).then(result=>{completed++;onProgress(labels[i]+' preparado · '+completed+' de '+loaders.length+' conjuntos',{completed,total:loaders.length});if(result===false||result?.failed?.length||typeof result?.failed==='number'&&result.failed>0)throw Error(labels[i]+' indisponível');return result;})));
}
