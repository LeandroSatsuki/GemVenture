// Read-only adapter between the current product and the approved V2AB renderer.
// Preview fixture fields never enter this model. Domain functions own all rules.
import {liftPresentationModel} from './expedition-map.js';
import {BIOMES,SKILLS} from './core.js';
import {BIOME_ART} from './palette.js';
import {BOSSES} from './bosses.js';
import {approvedArtSpec,approvedArtSource} from './approved-art.js';
import {MATERIALS} from './materials.js';
import {ABYSS_GATE_COST,abyssTestAccess,canEnterAbyss,gateProgress,gateBossDefeated} from './descent-progress.js';
import {blessingInfo,RELICS} from './pillars.js';
import {ASTRAL_RELICS} from './astral.js';
import {gateHeroArt} from './abyss-gate-art.js';
import {selectedDungeonRewards} from './dungeon-rewards-catalog.js';
import {attachSelectedFloorRewards} from './reward-catalog-ui.js';
import {approvedConsumableGlyph,approvedCardArt} from './approved-interface-icons.js';
import {approvedInterfaceIcons} from './approved-interface-entry.js';
import {glyph} from './ui-art.js';

const panoramas=Array.from({length:7},(_,i)=>({source:'assets/refuge-night-v3/biome-'+i+'.png',width:2172,height:724}));
function art(type,options={}){if(type==='boss'&&options.variant>=1&&options.variant<=5)return {source:'assets/dungeon-refinement-v2/boss-'+options.variant+'.svg',width:120,height:110,bounds:{x:0,y:0,width:120,height:110}};const spec=approvedArtSpec(type,options);return spec?{source:approvedArtSource(spec),width:spec.width,height:spec.height,bounds:{...spec.bounds}}:null;}
export function liftHostPresentationModel(state,selected=1,mode='floors',modeIcons={}){
 let vm=liftPresentationModel(state,selected);
 const visualCatalog=BIOMES.map((b,i)=>({id:i,name:b.name,color:BIOME_ART[i].floor,panorama:panoramas[i]}));
 // Keep undiscovered regions hidden exactly as the current product does.
 vm={...vm,mode:mode==='abyss'?'abyss':'floors',review:false,modeIcons,liftMark:{source:'assets/refuge-night-v3/lift.png',width:128,height:128},visualCatalog,
  biomeCards:vm.biomes.map(b=>({...b,color:visualCatalog[b.id].color,panorama:panoramas[b.id]})),
  biomeVisual:{...vm.biomeVisual,panorama:panoramas[vm.selectedBiome],description:'Explore os andares desta região e encontre seus minerais.'},
  floors:vm.floors.map(f=>({...f,stars:{earned:state.descent.records?.[f.actionValue]?.stars??null,total:5}}))};
 const record=vm.selected.record;
 const objectives=!vm.selected.reached?[]:vm.selected.boss?[{kind:'boss',label:`Derrote ${BOSSES[vm.selectedBiome].name} para liberar a descida.`}]:[{kind:'stairs',label:'Minere para completar a carga. O buraco é um atalho.'}];
 vm.selected={...vm.selected,stars:{earned:record?.stars??null,total:5},performance:{bestTimeMs:Number.isFinite(record?.bestTimeMs)?record.bestTimeMs:null,lastScore:Number.isFinite(record?.lastScore)?record.lastScore:null,lastTimeMs:Number.isFinite(record?.lastTimeMs)?record.lastTimeMs:null},objectives};
 if(vm.selected.boss&&vm.selected.reached){const boss=art('boss',{variant:vm.selectedBiome});vm.art={...vm.art,boss:{scene:boss?[{...boss,name:BOSSES[vm.selectedBiome].name}]:[]}};}
 vm=vm.selected.reached?attachSelectedFloorRewards(state,vm,selectedDungeonRewards,{approvedConsumableGlyph,approvedCardArt,glyph,approvedInterfaceIcons}):{...vm,selected:{...vm.selected,rewards:{catalog:{available:false,entries:[],reason:'unexplored-floor'}}}};
 const relics=[...RELICS.filter(r=>state.relics.includes(r.id)),...ASTRAL_RELICS.filter(r=>state.astral?.equipped?.includes(r.id))];
 vm.abyss={requirement:'Vença o Boss Místico no andar 4–5 (20) e deposite as quatro gemas no portão. Não exige terminar os 35 andares nem pagar moedas.',testAccess:abyssTestAccess(),canEnter:canEnterAbyss(state),progressPercent:Math.floor(gateProgress(state)*100),bestMeters:state.abyssBest||0,maxWave:null,leaderboard:{label:'Sem registro'},bossDefeated:gateBossDefeated(state),
  heroScene:{source:'assets/lift-v2/abyss-hero-fit-v02-1456x220.png',width:1456,height:220},
  // Preserve producer hero markup; host feedback targets this root explicitly
  // instead of adding a legacy class that carries incompatible width rules.
  heroArt:gateHeroArt(state),
  rewardVisuals:{ruby:art('crystal',{biome:0,variant:1}),quartz:art('crystal',{biome:0,variant:0}),coin:glyph('coin')},
  materials:MATERIALS.map((m,i)=>{const remaining=ABYSS_GATE_COST[i]-state.descent.gate[i];return{name:m.name,color:m.color,deposited:state.descent.gate[i],required:ABYSS_GATE_COST[i],remaining,complete:remaining===0,available:state.materials[i],deposit:Math.min(100,remaining,state.materials[i])};}),
  preparation:{blessing:blessingInfo(state.pendingBlessing,state.pendingBlessingLevel,state.pendingBlessingRoll),relics,skills:SKILLS.filter(k=>state.equipped.includes(k.id)||(k.passive&&state.unlocked.includes(k.id)))}};
 return vm;
}
