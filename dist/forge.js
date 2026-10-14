import {projectCost} from './balance.js';
import {emptyMaterials,validMaterials} from './materials.js';
import {buildingLevel} from './village.js';
import {createGear,restoreGear,migrateArmorSet,gearBonuses} from './gear.js';
export const FORGE_CAP=100;
const grow=(first)=>Array.from({length:FORGE_CAP},(_,level)=>level<3?first[level]:projectCost(first[2],level));
export const pickStrength=level=>{const n=Math.max(0,level-1);return 1+.025*n+.001*n*n;};
export const createForge=()=>({version:5,legacy:{pickaxe:0,vigor:0,anvil:0,armor:0,tonic:0,vault:0},levels:{anvil:0,armor:0,tonic:0,vault:0},invested:{anvil:0,armor:0,tonic:0,vault:0},materials:{anvil:emptyMaterials(),armor:emptyMaterials(),tonic:emptyMaterials(),vault:emptyMaterials()},gear:createGear()});
export const forgeLevel=(s,id)=>s.forge?.levels?.[id]||0;
export function forgeEffects(s){
 const l=s.forge?.legacy||{},pick=pickStrength(s.level)+(l.pickaxe||0),a=gearBonuses(s);
 return {power:(pick*(1+forgeLevel(s,'anvil')*.005)+(l.anvil||0))*(1+(buildingLevel(s,'forge')-1)*.02)*(1+Math.min(25,a.force)/100),health:100+s.core+(l.vigor||0)+Math.min(60,a.health),armor:Math.min(.55,forgeLevel(s,'armor')*.003+(l.armor||0)+Math.min(20,a.guard)/100),tonic:(25+forgeLevel(s,'tonic')*.15+(l.tonic||0))*(1+Math.min(25,a.tonic)/100),retention:Math.min(.9,.5+forgeLevel(s,'vault')*.0025+(l.vault||0)+Math.min(20,a.retention)/100),breathGuard:Math.min(25,a.steady)/100,breathGain:Math.min(3,a.breath),bossPower:Math.min(30,a.boss)/100,yield:Math.min(25,a.yield)/100,crystalPower:Math.min(25,a.crystal)/100,rockPower:Math.min(25,a.rock)/100,blastChance:Math.min(.2,a.blast/100),killHeal:Math.min(12,a.siphon),stride:Math.min(3,a.stride),sight:Math.min(30,a.sight)/100};
}
const pct=n=>Number(n.toFixed(2)).toLocaleString('pt-BR');
export const FORGE_PROJECTS=Object.freeze([
 {id:'anvil',name:'Bigorna rúnica',icon:'force',art:'pickaxe',text:'Mais força da picareta.',costs:grow([600,1800,4800]),floors:[0,5,10],reward:n=>'+'+pct(n*.5)+'% FORÇA'},
 {id:'armor',name:'Armadura',icon:'guard',art:'rock',text:'Menos dano de criaturas.',costs:grow([900,2700,6500]),floors:[5,10,15],reward:n=>'−'+pct(n*.3)+'% DANO RECEBIDO'},
 {id:'tonic',name:'Alambique vital',icon:'tonic',art:'well',text:'Curas mais eficientes.',costs:grow([750,2200,5600]),floors:[0,5,10],reward:n=>'+'+pct(n*.6)+'% CURA DAS POÇÕES'},
 {id:'vault',name:'Cofre de resgate',icon:'gem',art:'crate',text:'Proteja sua coleta.',costs:grow([1200,3500,8500]),floors:[5,10,15],reward:n=>'SALVA '+pct(50+n*.25)+'% DO SAQUE'}
].map(p=>Object.freeze({...p,costs:Object.freeze(p.costs),floors:Object.freeze(p.floors)})));
const RECIPES={anvil:[60,40,20,0],armor:[20,0,60,10],tonic:[0,20,0,70],vault:[40,15,50,0]};
export const forgeRecipe=(id,level)=>RECIPES[id].map(n=>Math.ceil(n*(level<3?[1,3,7][level]:7*(1+.07*(level-2))**1.65)));
export function forgeProject(s,id){const p=FORGE_PROJECTS.find(p=>p.id===id);if(!p)return null;const level=forgeLevel(s,id),complete=level>=FORGE_CAP,cost=complete?0:p.costs[level],invested=s.forge?.invested?.[id]||0,required=complete?0:p.floors[Math.min(level,2)];const recipe=complete?emptyMaterials():forgeRecipe(id,level),materials=s.forge?.materials?.[id]||emptyMaterials(),missing=recipe.map((n,i)=>Math.max(0,n-materials[i]));return{...p,level,complete,cost,invested,recipe,materials,missing,remaining:Math.max(0,cost-invested),required,locked:!complete&&s.best<required,ready:!complete&&invested===cost&&missing.every(n=>n===0)};}
export function depositForge(s,id,amount=250){const p=forgeProject(s,id);if(s.run||!p||p.complete||p.locked||p.ready||!Number.isSafeInteger(amount)||amount<=0)return 0;const paid=Math.min(amount,p.remaining,s.bank),materials=p.missing.map((n,i)=>Math.min(n,s.materials?.[i]||0,Math.max(250,Math.ceil(n/4))));if(paid+materials.reduce((a,b)=>a+b,0)<=0)return 0;s.forge??=createForge();s.forge.materials??=createForge().materials;s.bank-=paid;s.forge.invested[id]+=paid;materials.forEach((n,i)=>{s.materials[i]-=n;s.forge.materials[id][i]+=n;});return paid+materials.reduce((a,b)=>a+b,0);}
export function craftForge(s,id){const p=forgeProject(s,id);if(s.run||!p||p.locked||!p.ready)return false;s.forge.levels[id]++;s.forge.invested[id]=0;s.forge.materials[id]=emptyMaterials();return true;}
export function restoreForge(raw,pickLevel=1,coreLevel=0){
 if(raw!==undefined&&(!raw||!raw.levels||!raw.invested||raw.version!==undefined&&![2,3,4,5].includes(raw.version)))return null;
 const result=createForge(),legacy=raw?.version===undefined,oldCosts=raw?.version!==3&&raw?.version!==4&&raw?.version!==5,refund={coins:0,materials:emptyMaterials()};
 for(const p of FORGE_PROJECTS){const level=raw?.levels[p.id]??0,invested=raw?.invested[p.id]??0;if(!Number.isInteger(level)||level<0||level>(legacy?3:FORGE_CAP)||!Number.isSafeInteger(invested)||invested<0||invested>(level>=FORGE_CAP?0:oldCosts&&level>=3?Math.round(p.costs[2]*1.075**(level-2)):p.costs[level]))return null;
 const materials=raw?.materials?.[p.id]||emptyMaterials();if(!validMaterials(materials)||materials.some((n,i)=>n>(level>=FORGE_CAP?0:oldCosts?Math.ceil(RECIPES[p.id][i]*(level<3?[1,3,7][level]:7*1.055**(level-2))):forgeRecipe(p.id,level)[i])))return null;result.levels[p.id]=level;result.invested[p.id]=Math.min(invested,p.costs[level]||0);refund.coins+=invested-result.invested[p.id];result.materials[p.id]=materials.map((v,i)=>{const kept=Math.min(v,level>=FORGE_CAP?0:forgeRecipe(p.id,level)[i]);refund.materials[i]+=v-kept;return kept;});}
 if(legacy){const n=result.levels;result.legacy={pickaxe:Math.max(0,pickLevel-pickStrength(pickLevel)),vigor:coreLevel*9,anvil:Math.max(0,n.anvil-pickLevel*n.anvil*.005),armor:n.armor*.047,tonic:n.tonic*4.85,vault:n.vault*.0975};}
 else{for(const k of Object.keys(result.legacy)){const value=raw.legacy?.[k]??0;if(!Number.isFinite(value)||value<0||value>100)return null;result.legacy[k]=value;}}
 if(raw?.version===4){result.gear=migrateArmorSet(raw.armorSet);if(!result.gear)return null;}if(raw?.version===5){result.gear=restoreGear(raw.gear);if(!result.gear)return null;}if(refund.coins||refund.materials.some(Boolean))result.migrationRefund=refund;return result;
}
