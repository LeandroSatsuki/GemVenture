import {validMaterials,canPayMaterials,payMaterials} from './materials.js';
export const BUILDING_CAP=10;
export const MISSION_BUILDING_CAP=150;
export const createVillage=()=>({forge:1,well:1,missions:1});
export const buildingLevel=(s,id)=>s.village?.[id]??1;
export const missionSlots=s=>Math.min(5,1+Math.floor(buildingLevel(s,'missions')/30));
export const nextMissionSlot=s=>missionSlots(s)<5?missionSlots(s)*30:null;
export const BUILDINGS={forge:{name:'FORJA',benefit:'FORÇA DAS FERRAMENTAS',cap:BUILDING_CAP,recipe:[80,45,60,15]},well:{name:'POÇO',benefit:'MAIS CHANCE DE BÊNÇÃOS RARAS',cap:BUILDING_CAP,recipe:[35,50,20,90]},missions:{name:'QUADRO',benefit:'MISSÕES MELHORES',cap:MISSION_BUILDING_CAP,recipe:[65,25,55,45]}};
export function restoreVillage(raw){if(raw===undefined)return createVillage();if(!raw||Array.isArray(raw)||Object.keys(raw).some(k=>!BUILDINGS[k]))return null;const result={};for(const id of Object.keys(BUILDINGS)){const n=raw[id];if(!Number.isInteger(n)||n<1||n>BUILDINGS[id].cap)return null;result[id]=n;}return result;}
export function buildingUpgrade(s,id){
 const def=BUILDINGS[id];if(!def||id==='well')return null;const level=buildingLevel(s,id),max=level>=def.cap;
 // Preserve every old price through level ten; use a polynomial tail after it.
 const tail=id==='missions'?Math.max(0,level-9):0,early=level-1-tail;
 const cost=max?0:Math.round(300*1.65**early*(1+.04*tail)**2);
 const recipe=def.recipe.map(n=>max?0:Math.ceil(n*1.5**early*(1+.02*tail)**1.55));
 return{...def,id,level,max,cost,recipe,ready:!s.run&&!max&&s.bank>=cost&&validMaterials(s.materials)&&canPayMaterials(s,recipe)};
}
export function upgradeBuilding(s,id){const p=buildingUpgrade(s,id);if(!p?.ready)return false;payMaterials(s,p.recipe);s.bank-=p.cost;s.village??=createVillage();s.village[id]++;if(id==='missions')s.missionBoard={key:'',offers:[]};return true;}
