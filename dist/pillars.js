import {progressionEffects} from './progression-effects.js';
import {validMaterials,MATERIALS} from './materials.js';
import {buildingLevel} from './village.js';
export const createExperience=()=>({level:1,xp:0,points:0});
export const nextLevelXP=level=>Math.floor(120+level*30+1.4*Math.max(0,level-10)**1.55);
export function grantXP(s,amount){if(!s.run||amount<=0)return 0;const gain=Math.round(amount*(blessingEffects(s.run).xp+progressionEffects(s).xp));s.experience.xp+=gain;while(s.experience.xp>=nextLevelXP(s.experience.level)){s.experience.xp-=nextLevelXP(s.experience.level);s.experience.level++;s.experience.points++;s.run.events.push({type:'levelUp',level:s.experience.level});}return gain;}
export const skillPointCost=skill=>skill.parents[0]==='root'?1:skill.parents.length>1?3:2;
export const BLESSINGS=[
 {id:'hunger',name:'FOME DE BRILHO',good:'XP EM DOBRO',risk:'INIMIGOS: +25% DANO',icon:'fortune'},
 {id:'glass',name:'VIDRO VIVO',good:'+50% CRISTAIS',risk:'−25% VIDA MÁXIMA',icon:'gem'},
 {id:'fury',name:'FÚRIA DO POÇO',good:'+2 FORÇA NESTA DESCIDA',risk:'ERROS: +50% DANO',icon:'force'}
];
export const WISH_FAMILIES=[
 {label:'VIDA · FÔLEGO',hint:'Erre menos. Aprenda mais.',ids:['steady','wisdom','vitalwish']},
 {label:'FORÇA · CRÍTICOS',hint:'Golpes mais fortes.',ids:['might','crit','blastwish']},
 {label:'DEFESA · ESCUDO',hint:'Aguente mais golpes.',ids:['shellwish','wardwish','floorward']},
 {label:'SORTE · CURA',hint:'Chance de levar mais.',ids:['luckywish','bountywish','mendingwish']}
];
const NEW_WISHES=[
 {id:'vitalwish',name:'CORAÇÃO DE QUARTZO',icon:'revive',kind:0},
 {id:'blastwish',name:'RUBI EXPLOSIVO',icon:'force',kind:1},
 {id:'floorward',name:'PORTA DOURADA',icon:'ward',kind:2},
 {id:'mendingwish',name:'SEIVA VIVA',icon:'revive',kind:3},
 {id:'steady',name:'PULSO SERENO',icon:'ear',kind:0},
 {id:'wisdom',name:'MENTE CRISTALINA',icon:'fortune',kind:0},
 {id:'might',name:'BRASA RUBRA',icon:'force',kind:1},
 {id:'crit',name:'GOLPE DE SORTE',icon:'force',kind:1},
 {id:'shellwish',name:'PELE DE PEDRA',icon:'guard',kind:2},
 {id:'wardwish',name:'ABRAÇO DOURADO',icon:'ward',kind:2},
 {id:'luckywish',name:'SORTE VERDE',icon:'fortune',kind:3},
 {id:'bountywish',name:'COLHEITA VERDE',icon:'gem',kind:3}
];
BLESSINGS.push(...NEW_WISHES);
export const WISH_TIERS=['COMUM','RARA','ÉPICA'];
export const WISH_RISKS=['LEVE','FORTE','EXTREMO'];
export function wishOdds(level=1){const n=Math.max(0,Math.min(9,Math.floor(level)-1));return [(.75-n*.03),(.22+n*.02),(.03+n*.01)];}
export function validBlessingRoll(id,roll){return roll==null||!!(NEW_WISHES.some(b=>b.id===id)&&roll.version===1&&Number.isInteger(roll.tier)&&roll.tier>=0&&roll.tier<=2&&Number.isInteger(roll.risk)&&roll.risk>=0&&roll.risk<=2);}
export function rollWish(seed,offering,level){
 let state=(seed^Math.imul(offering,2654435761))>>>0;
 const random=()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 const choice=Math.floor(random()*3),quality=random(),risk=random(),odds=wishOdds(level);
 return {choice,roll:{version:1,tier:quality<odds[0]?0:quality<odds[0]+odds[1]?1:2,risk:risk<.6?0:risk<.9?1:2}};
}
export function blessingEffects(run){
 const id=run?.blessing,n=Math.max(0,Math.min(9,(run?.blessingLevel||1)-1)),v={power:1,flatPower:0,health:1,incoming:1,timing:1,xp:1,loot:1,critical:0,doubleLoot:0,shield:0,floorShield:0,blastChance:0,blastPower:0,killHeal:0};
 if(['vitalwish','blastwish','floorward','mendingwish'].includes(id)&&!run?.blessingRoll)return blessingEffects({...run,blessingRoll:{version:1,tier:0,risk:0}});
 if(id==='hunger'){v.xp=2;v.incoming=1.25;}if(id==='glass'){v.loot=1.5;v.health=.75;}if(id==='fury'){v.flatPower=2;v.timing=1.5;}
 if(run?.blessingRoll&&validBlessingRoll(id,run.blessingRoll)){
  const {tier:t,risk:r}=run.blessingRoll,kind=NEW_WISHES.find(b=>b.id===id).kind;
  if(kind===0)v.loot=1-[.05,.2,.4][r];
  if(kind===1)v.incoming=1+[.15,.4,.8][r];
  if(kind===2)v.power=1-[.05,.2,.35][r];
  if(kind===3)v.health=1-[.05,.2,.4][r];
  if(id==='vitalwish')v.health=1+[.08,.2,.4][t];
  if(id==='blastwish'){v.blastChance=[.08,.15,.25][t];v.blastPower=[.5,1,1.5][t];}
  if(id==='floorward')v.floorShield=[6,8,10][t];
  if(id==='mendingwish')v.killHeal=[1,3,6][t];
  if(id==='steady')v.timing=1-[.05,.2,.45][t];
  if(id==='wisdom')v.xp=1+[.05,.3,1][t];
  if(id==='might')v.power=1+[.04,.2,.6][t];
  if(id==='crit')v.critical=[.03,.12,.25][t];
  if(id==='shellwish')v.incoming=1-[.03,.15,.35][t];
  if(id==='wardwish')v.shield=[2,6,12][t];
  if(id==='luckywish')v.doubleLoot=[.04,.15,.3][t];
  if(id==='bountywish')v.loot=1+[.04,.3,.75][t];
  return v;
 }
 // Already purchased blessings without a roll retain their previous strength.
 if(['steady','wisdom'].includes(id))v.loot=.97;
 if(['might','crit'].includes(id))v.incoming=1.05;
 if(['shellwish','wardwish'].includes(id))v.power=.97;
 if(['luckywish','bountywish'].includes(id))v.health=.97;
 if(id==='steady')v.timing=1-(.05+n*.02);
 if(id==='wisdom')v.xp=1+.05+n*.03;
 if(id==='might')v.power=1+.04+n*.02;
 if(id==='crit')v.critical=.03+n*.01;
 if(id==='shellwish')v.incoming=1-(.03+n*.01);
 if(id==='wardwish')v.shield=2+Math.floor(n/3);
 if(id==='luckywish')v.doubleLoot=.04+n*.02;
 if(id==='bountywish')v.loot=1+.04+n*.02;
 return v;
}
export function blessingInfo(id,level=1,roll=null){
 const b=BLESSINGS.find(b=>b.id===id);if(!b)return null;if(b.kind===undefined)return b;
 const e=blessingEffects({blessing:id,blessingLevel:level,blessingRoll:roll}),pct=v=>Math.round(v*100);
 const good={vitalwish:'+'+pct(e.health-1)+'% VIDA',blastwish:'GOLPES PODEM EXPLODIR',floorward:'ESCUDO EM CADA ANDAR',mendingwish:'ABATES CURAM '+e.killHeal+' DE VIDA',steady:'ERROS: −'+pct(1-e.timing)+'% FÔLEGO',wisdom:'+'+pct(e.xp-1)+'% XP',might:'+'+pct(e.power-1)+'% FORÇA',crit:'+'+pct(e.critical)+'% CHANCE DE CRÍTICO',shellwish:'−'+pct(1-e.incoming)+'% DANO RECEBIDO',wardwish:'ESCUDO INICIAL · '+e.shield+' PULSOS',luckywish:pct(e.doubleLoot)+'% CHANCE: CRISTAIS EM DOBRO',bountywish:'+'+pct(e.loot-1)+'% CRISTAIS'}[id];
 return{...b,good,rarity:roll?WISH_TIERS[roll.tier]:null,riskRank:roll?WISH_RISKS[roll.risk]:null,risk:['−'+pct(1-e.loot)+'% CRISTAIS','INIMIGOS: +'+pct(e.incoming-1)+'% DANO','−'+pct(1-e.power)+'% FORÇA','−'+pct(1-e.health)+'% VIDA MÁXIMA'][b.kind]};
}
export const OFFERING_COST=45;
export function makeOffering(s,kind){if(s.run||s.pendingBlessing||!Number.isInteger(kind)||kind<0||kind>3||!validMaterials(s.materials)||s.materials[kind]<OFFERING_COST)return null;
 const offering=(s.offerings||0)+1;if(!Number.isSafeInteger(offering))return null;const level=buildingLevel(s,'well'),draw=rollWish(s.seed,offering,level);
 s.materials[kind]-=OFFERING_COST;s.offerings=offering;s.pendingBlessing=WISH_FAMILIES[kind].ids[draw.choice];s.pendingBlessingLevel=level;s.pendingBlessingRoll=draw.roll;
 return blessingInfo(s.pendingBlessing,level,draw.roll);
}
export const RELICS=[
 {id:'aurora',name:'ESCUDO DA AURORA',text:'Comece protegido.',detail:'Escudo nos primeiros 8 pulsos.',cost:12,icon:'guard'},
 {id:'phoenix',name:'CORAÇÃO FÊNIX',text:'Uma segunda chance.',detail:'Reviva uma vez por descida.',cost:24,icon:'revive'},
 {id:'echo',name:'MEMÓRIA ARCANA',text:'Comece com uma carta.',detail:'Uma carta aleatória por descida.',cost:35,icon:'echo'}
];
export function buyRelic(s,id){const relic=RELICS.find(r=>r.id===id);if(s.run||!relic||s.relics.includes(id)||s.stars<relic.cost)return false;s.stars-=relic.cost;s.relics.push(id);return true;}
export function validPillars(s){const p=s.experience;return validBlessingRoll(s.pendingBlessing,s.pendingBlessingRoll)&&validBlessingRoll(s.run?.blessing,s.run?.blessingRoll)&&Number.isInteger(s.pendingBlessingLevel??1)&&(s.pendingBlessingLevel??1)>=1&&(s.pendingBlessingLevel??1)<=10&&p&&Number.isSafeInteger(p.level)&&p.level>=1&&Number.isSafeInteger(p.xp)&&p.xp>=0&&p.xp<nextLevelXP(p.level)&&Number.isSafeInteger(p.points)&&p.points>=0&&Number.isSafeInteger(s.offerings)&&s.offerings>=0&&(!s.pendingBlessing||BLESSINGS.some(b=>b.id===s.pendingBlessing))&&Array.isArray(s.relics)&&new Set(s.relics).size===s.relics.length&&s.relics.every(id=>RELICS.some(r=>r.id===id));}
