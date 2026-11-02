import {power,upgradeCost} from './core.js';
import {FORGE_CAP} from './forge.js';
import {MATERIALS,pickRecipe} from './materials.js';
const fmt=n=>Number(n.toFixed(3)).toLocaleString('pt-BR');
// A view of the current contract, never a copied PROG-01 curve or a purchase.
export function firstUpgradeGoal(profile){
 if(profile.level>=FORGE_CAP)return {complete:true,lines:['Picareta no nível máximo.']};
 const cost=upgradeCost(profile),recipe=pickRecipe(profile),funded=profile.forge?.funds?.pickaxe||0;
 const missing={coins:Math.max(0,cost-funded-profile.bank),materials:recipe.map((n,i)=>Math.max(0,n-profile.materials[i]))};
 const before=power(profile),after=power({...profile,level:profile.level+1}),gain=after-before;
 const materials=recipe.map((n,i)=>n?`${n} ${MATERIALS[i].name}`:null).filter(Boolean);
 const shortages=[missing.coins?`${missing.coins} moedas`:null,...missing.materials.map((n,i)=>n?`${n} ${MATERIALS[i].name}`:null)].filter(Boolean);
 const ready=!shortages.length;
 return {level:profile.level,nextLevel:profile.level+1,cost,recipe,funded,missing,before,after,gain,ready,lines:[`Picareta ${profile.level} → ${profile.level+1} · Força ${fmt(before)} → ${fmt(after)} (+${fmt(gain)})`,`Custo: ${cost} moedas${materials.length?' · '+materials.join(' · '):''}${funded?' · '+funded+' moedas já depositadas':''}`,ready?'Você já tem tudo. A compra é sua escolha.':'Falta: '+shortages.join(' · '),...(profile.tutorialIntro?.reward?.status==='granted'?['Ajuda inicial salva · uma vez por perfil.']:[])]};
}
