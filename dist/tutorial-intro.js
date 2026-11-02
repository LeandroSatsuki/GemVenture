// Persistent introductory benefit; kept separate from disposable training data.
export const INTRO_VERSION=1;
export const INTRO_REWARD='first-pickaxe-v1';
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export const createTutorialIntro=()=>({version:INTRO_VERSION,eligibility:'eligible',reward:null});
export function validTutorialIntro(raw){
 if(!raw||raw.version!==INTRO_VERSION||!['eligible','legacy'].includes(raw.eligibility))return false;
 if(raw.reward===null)return true;
 const r=raw.reward;
 return r?.id===INTRO_REWARD&&['granted','funded','already-upgraded'].includes(r.status)&&typeof r.accountId==='string'&&r.accountId.length>=8&&integer(r.coins)&&Array.isArray(r.materials)&&r.materials.length===4&&r.materials.every(integer)&&r.targetLevel===2;
}
function untouched(s){return s.level===1&&s.core===0&&s.attempts===0&&s.best===0&&s.deaths===0&&s.totalGems===0&&!s.run&&s.seals===0&&s.experience?.level===1&&s.experience.xp===0&&!s.unlocked?.length&&!s.relics?.length;}
export function restoreTutorialIntro(raw,s){
 if(raw===undefined)return {version:INTRO_VERSION,eligibility:untouched(s)?'eligible':'legacy',reward:null};
 // Unknown/future data is retained. Only the introductory operation fails closed;
 // the existing profile is never reset to manufacture another reward.
 return structuredClone(raw);
}
