import {GEM_RAMPS} from './palette.js';
import {biomeIndex} from './campaign.js';
export const MATERIALS=[
 {name:'Quartzo',use:'Ferramentas e proteção',color:GEM_RAMPS[0][0]},
 {name:'Rubi',use:'Força e explosões',color:GEM_RAMPS[1][0]},
 {name:'Topázio',use:'Armaduras e cofres',color:GEM_RAMPS[2][0]},
 {name:'Esmeralda',use:'Cura e crescimento',color:GEM_RAMPS[3][0]}
];
export const emptyMaterials=()=>[0,0,0,0];
export const validMaterials=a=>Array.isArray(a)&&a.length===4&&a.every(n=>Number.isSafeInteger(n)&&n>=0);
export function floorMinerals(floor){const main=[0,3,2,1,3,2,3][biomeIndex(floor)],focus=(main+(floor-1)%5)%4;const bases=[[64,14,10,12],[16,12,14,58],[18,14,54,14],[14,56,20,10],[16,12,24,48],[32,8,48,12],[10,18,24,48]],weights=[...bases[biomeIndex(floor)]];weights[focus]+=60;const sum=weights.reduce((a,b)=>a+b,0);for(let i=0;i<4;i++)weights[i]=weights[i]/sum*100;return {focus,weights};}
export function rollMineral(floor,random){let roll=random()*100;const {weights}=floorMinerals(floor);for(let i=0;i<4;i++){roll-=weights[i];if(roll<0)return i;}return 3;}
export const canPayMaterials=(s,cost)=>cost.every((n,i)=>(s.materials?.[i]||0)>=n);
export function payMaterials(s,cost){if(!canPayMaterials(s,cost))return false;cost.forEach((n,i)=>s.materials[i]-=n);return true;}
export const pickRecipe=s=>[4*s.level,2*s.level,s.level>=4?s.level:0,0].map(n=>Math.ceil(n*1.035**Math.max(0,s.level-12)));
export const wellRecipe=s=>[0,0,0,Math.ceil(12*(s.core+1)*1.035**Math.max(0,s.core-6))];
