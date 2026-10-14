import {FLOORS_PER_BIOME,TOTAL_FLOORS,depthLimit} from './campaign.js';
import {validMaterials,canPayMaterials,payMaterials} from './materials.js';

// Addresses never clamp to the current content catalog. Future layers keep their identity.
export function floorAddress(floor){
 if(!Number.isSafeInteger(floor)||floor<1)throw new RangeError('Invalid floor');
 const region=Math.floor((floor-1)/FLOORS_PER_BIOME)+1,step=(floor-1)%FLOORS_PER_BIOME+1;
 return{region,step,code:region+'–'+step,boss:step===FLOORS_PER_BIOME,nextBoss:step===FLOORS_PER_BIOME-1};
}
export const ABYSS_GATE_COST=[1500,1200,1000,800];
export const createDescentProgress=()=>({version:1,bosses:[],stops:[1],gate:[0,0,0,0],records:{}});
export function restoreDescentProgress(raw,s){
 if(raw===undefined){
  const p=createDescentProgress();
  // Reaching the next biome proves the previous guardian was passed in old saves.
  for(let floor=FLOORS_PER_BIOME;floor<=TOTAL_FLOORS;floor+=FLOORS_PER_BIOME)
   if(s.best>floor||(s.run?.floor===floor&&s.run.room?.bossDefeated)||(s.lastResult?.reason==='victory'&&s.lastResult.floor>=floor))p.bosses.push(floor);
  return p;
 }
 if(!raw||raw.version!==1||!Array.isArray(raw.bosses)||!Array.isArray(raw.stops)||!raw.stops.includes(1)||!validMaterials(raw.gate))return null;
 if(raw.gate.some((n,i)=>n>ABYSS_GATE_COST[i]))return null;
 if(raw.bosses.some(n=>!Number.isSafeInteger(n)||n<5||n%5!==0||n>TOTAL_FLOORS))return null;
 if(raw.stops.some(n=>!Number.isSafeInteger(n)||n<1||n>TOTAL_FLOORS||n>Math.max(1,s.best)))return null;
 const records=raw.records??{};if(typeof records!=='object'||Array.isArray(records))return null;
 for(const [floor,r]of Object.entries(records))if(!/^[1-9]\d*$/.test(floor)||Number(floor)>TOTAL_FLOORS||!r||!Number.isSafeInteger(r.points)||r.points<0||!Number.isSafeInteger(r.clears)||r.clears<1)return null;
 return{version:1,bosses:[...new Set(raw.bosses)],stops:[...new Set(raw.stops)].sort((a,b)=>a-b),gate:[...raw.gate],records:Object.fromEntries(Object.entries(records).map(([f,r])=>[f,{points:r.points,clears:r.clears}]))};
}
export function recordFloorResult(s){
 const r=s.run;if(!r||r.mode==='abyss'||!r.room.cleared||r.room.recordSaved)return false;
 const points=Math.max(0,Math.round(r.score.points-(r.room.floorStart?.points??r.score.points-(r.room.scoreSpent||0))));
 const records=s.descent.records??={},previous=records[r.floor];records[r.floor]={points:Math.max(previous?.points||0,points),clears:(previous?.clears||0)+1};r.room.recordSaved=true;return true;
}
export function recordBossVictory(s,floor){
 if(!s.run||s.run.mode==='abyss'||floor%FLOORS_PER_BIOME!==0)return;
 if(!s.descent.bosses.includes(floor))s.descent.bosses.push(floor);
}
export const gateProgress=s=>s.descent.gate.reduce((a,n)=>a+n,0)/ABYSS_GATE_COST.reduce((a,n)=>a+n,0);
export const gateBossDefeated=s=>s.descent.bosses.includes(20);
// Temporary playtest switch. Never stored in the save or enabled on the hosted game.
export const ABYSS_PLAYTEST_ENABLED=true;
export const abyssTestAccess=()=>ABYSS_PLAYTEST_ENABLED&&typeof location!=='undefined'&&['localhost','127.0.0.1','[::1]'].includes(location.hostname);
export const canEnterAbyss=s=>abyssTestAccess()||(gateBossDefeated(s)&&s.descent.gate.every((n,i)=>n===ABYSS_GATE_COST[i]));
export function depositGate(s,index,amount=100){
 if(s.run||!Number.isInteger(index)||index<0||index>3||!Number.isSafeInteger(amount)||amount<1)return 0;
 const paid=Math.min(amount,s.materials[index],ABYSS_GATE_COST[index]-s.descent.gate[index]);
 if(paid<=0)return 0;s.materials[index]-=paid;s.descent.gate[index]+=paid;return paid;
}
export const stopCost=floor=>[12*floor,floor>=6?8*floor:0,floor>=11?6*floor:0,floor>=16?6*floor:0];
export const canStartAt=(s,floor)=>Number.isSafeInteger(floor)&&floor>=1&&floor<=TOTAL_FLOORS&&floor<=depthLimit(s)&&floor<=Math.max(1,s.best)&&s.descent.stops.includes(floor);
export function unlockStop(s,floor){
 if(s.run||!Number.isSafeInteger(floor)||floor<2||floor>TOTAL_FLOORS||floor>s.best||floor>depthLimit(s)||s.descent.stops.includes(floor))return false;
 if(!canPayMaterials(s,stopCost(floor)))return false;
 payMaterials(s,stopCost(floor));s.descent.stops.push(floor);s.descent.stops.sort((a,b)=>a-b);return true;
}
