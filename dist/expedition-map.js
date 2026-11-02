import {earnedStars} from './refuge-journey.js';
import {currentCreatureArt} from './current-creature-art.js';
import {collectedGemSvg} from './collected-gems.js';
import {composeExpeditionScene} from './expedition-composition.js';
import {floorAddress,canStartAt,stopCost,biomeEntrance} from './descent-progress.js';
import {liftBrowserMarkup} from './rebrand-lift.js';
import {MATERIALS,canPayMaterials,floorMinerals} from './materials.js';
import {FLOORS_PER_BIOME,depthLimit} from './campaign.js';
import {BIOMES,SEALS,biomeIndex} from './core.js';
import {BOSSES} from './bosses.js';
import {BIOME_ART} from './palette.js';
import {BIOME_CREATURES} from './creatures.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {approvedArtSpec,approvedArtSource} from './approved-art.js';
export const gemIcon=i=>collectedGemSvg(i);
export function floorPicture(biome,floor,boss=false){
 const b=BIOME_ART[biome],names=BIOME_CREATURES[biome];
 const sprite=(i,x,y,width,height)=>{const a=approvedArtSpec(['slime','bat','golem','crystal'][i],{biome,variant:0}),box=a.bounds;return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" preserveAspectRatio="xMidYMax meet"><title>${i===3?'Quartzo':names[i].name}</title><image href="${approvedArtSource(a)}" width="${a.width}" height="${a.height}"/></svg>`;};
 const scene=`<svg class="lift-biome-scene" viewBox="0 0 560 180" role="img" aria-label="${boss?BOSSES[biome].name:BIOMES[biome].name} · slime, morcego e geodo"><rect width="560" height="180" rx="12" fill="${b.floor}"/><path d="M0 145L290 101L560 148V180H0Z" fill="${b.patch}"/><path d="M72 136L280 95L488 136V146L280 178L72 146Z" fill="${b.edge}"/><path d="M72 136L280 95L488 136L280 167Z" fill="${b.rock}"/><ellipse cx="194" cy="147" rx="33" ry="7" fill="${b.edge}" opacity=".28"/><ellipse cx="390" cy="149" rx="37" ry="8" fill="${b.edge}" opacity=".28"/>${sprite(3,93,92,54,62)}${sprite(0,151,80,84,67)}<g class="lift-creature-hover">${sprite(1,250,12,106,77)}</g>${sprite(2,339,56,107,95)}</svg>`;
 return composeExpeditionScene(scene,biome);
}
// Read-only presentation adapter. Progression and payments stay with existing owners.
export function liftPresentationModel(s,selectedFloor=1){
 const best=Math.max(1,s.best),count=Math.min(BIOMES.length,Math.max(Math.ceil(best/5),s.seals+1));
 const floor=Number.isSafeInteger(selectedFloor)&&selectedFloor>=1&&selectedFloor<=count*5?selectedFloor:1;
 const bi=biomeIndex(floor),address=floorAddress(floor),focus=floorMinerals(floor).focus;
 const reached=floor<=best||biomeEntrance(s,floor),stopActive=s.descent.stops.includes(floor)||biomeEntrance(s,floor),cost=stopCost(floor),seal=SEALS[s.seals],record=s.descent.records?.[floor];
 const artwork=(type,options)=>{const current=currentCreatureArt(type,options.biome);if(current)return current;const spec=approvedArtSpec(type,options);return{source:approvedArtSource(spec),width:spec.width,height:spec.height,bounds:{...spec.bounds}};};
 return{
  selectedFloor:floor,selectedBiome:bi,
  biomeVisual:{name:BIOMES[bi].name,palette:BIOME_ART[bi]},
  // Discovery controls visibility; only saved completions count as explored.
  biomes:BIOMES.slice(0,count).map((b,i)=>({id:i,name:b.name,selected:i===bi,explored:Array.from({length:FLOORS_PER_BIOME},(_,j)=>s.descent.records?.[i*FLOORS_PER_BIOME+j+1]).filter(record=>record?.clears>0).length,locked:i>s.seals,actionValue:i})),
  floors:Array.from({length:5},(_,j)=>{const f=bi*5+j+1;return{address:floorAddress(f).code,selected:f===floor,reached:f<=best||biomeEntrance(s,f),boss:j===4,canStart:canStartAt(s,f),actionValue:f};}),
  selected:{address:address.code,depthMeters:floor*25,reached,boss:address.boss,name:!reached?'Não explorado':address.boss?BOSSES[bi].name:['Veio de quartzo','Veio de rubi','Veio de topázio','Jardim de esmeralda'][focus],focusMaterialName:MATERIALS[focus].name,record:record?{...record}:null,stopActive,unlockEligible:reached&&floor<=depthLimit(s),canPay:canPayMaterials(s,cost),cost:cost.map((amount,i)=>({material:i,name:MATERIALS[i].name,amount,available:s.materials[i]}))},
  actions:{depart:{value:floor,enabled:canStartAt(s,floor)},unlockStop:{value:floor,enabled:!stopActive&&reached&&floor<=depthLimit(s)&&canPayMaterials(s,cost)},buySeal:seal?{name:seal.name,requiredFloor:seal.floor,requiredStars:seal.stars,earnedStars:earnedStars(s),enabled:s.best>=seal.floor&&earnedStars(s)>=seal.stars}:null},
  wallet:{stars:s.stars},
  art:{scene:['slime','bat','golem'].map((type,i)=>({...artwork(type,{biome:bi,variant:0}),name:BIOME_CREATURES[bi][i].name})),crystal:artwork('crystal',{biome:0,variant:focus})}
 };
}
export function expeditionMap(s,selectedFloor=1){return liftBrowserMarkup(liftPresentationModel(s,selectedFloor));}
