// Run-only powers. Values deliberately do not modify Forge power or card procs.
export const ORB_COLORS=Object.freeze(['red','yellow','blue']);
export const ORB_FAMILIES=Object.freeze({red:{name:'Ataque',color:'#f94e6d',letter:'A'},yellow:{name:'Defesa',color:'#ece910',letter:'P'},blue:{name:'Explorar',color:'#5ee9e9',letter:'E'}});
export const RUN_ORBS=Object.freeze([
 {id:'impact',color:'red',name:'Impacto',effect:'+10% no golpe direto em criaturas',short:'CRIATURAS +10%',strike:.10},
 {id:'pulse',color:'red',name:'Ressonância',effect:'4º golpe direto em criatura causa +25%',short:'4º GOLPE +25%',pulse:.25},
 {id:'shelter',color:'yellow',name:'Amparo',effect:'−8% de dano de criaturas',short:'−8% DANO',guard:.08},
 {id:'brace',color:'yellow',name:'Aparo',effect:'Apara 20% de um golpe a cada 12 batidas',short:'−20% · 12 BATIDAS',brace:.20},
 {id:'stride',color:'blue',name:'Passada',effect:'+1 passo, respeitando o limite de movimento',short:'+1 PASSO',stride:1},
 {id:'lantern',color:'blue',name:'Lanterna',effect:'+2 de alcance de visão',short:'+2 VISÃO',vision:2}
].map(Object.freeze));
export const orbDefinition=id=>RUN_ORBS.find(o=>o.id===id)||null;
export const createRunOrbs=()=>({version:1,red:null,yellow:null,blue:null,pulseHits:0,guardCooldown:0,spent:0});
export const orbsEnabled=run=>!!run&&run.mode!=='abyss'&&!run.trainingClock;
export function equippedOrb(run,color){return orbsEnabled(run)?orbDefinition(run.orbs?.[color]):null;}
export const orbStride=run=>equippedOrb(run,'blue')?.stride||0;
export const orbVision=run=>equippedOrb(run,'blue')?.vision||0;
export function advanceRunOrbs(run,beats){if(orbsEnabled(run)&&run.orbs)run.orbs.guardCooldown=Math.max(0,run.orbs.guardCooldown-Math.max(0,beats));}
export function orbStrikeBonus(run,damage,target){
 const o=equippedOrb(run,'red');if(!o||target.type!=='enemy'||!(target.hp>0))return 0;
 if(o.strike)return damage*o.strike;
 run.orbs.pulseHits=(run.orbs.pulseHits+1)%4;
 return run.orbs.pulseHits===0?damage*o.pulse:0;
}
export function orbIncoming(run,damage,creature){
 const o=creature&&damage>0&&equippedOrb(run,'yellow');if(!o)return damage;
 if(o.guard)return damage*(1-o.guard);
 if(o.brace&&run.orbs.guardCooldown===0){run.orbs.guardCooldown=12;return damage*(1-o.brace);}
 return damage;
}
export function validRunOrbs(o){
 return !!o&&o.version===1&&ORB_COLORS.every(c=>o[c]===null||orbDefinition(o[c])?.color===c)&&Number.isInteger(o.pulseHits)&&o.pulseHits>=0&&o.pulseHits<=3&&Number.isInteger(o.guardCooldown)&&o.guardCooldown>=0&&o.guardCooldown<=12&&Number.isSafeInteger(o.spent)&&o.spent>=0;
}
