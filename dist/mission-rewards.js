import {RECORDS,grantRecord} from './records.js';
import {validHomeCollection} from './home-collection.js';
// Coins keep their existing budget. Mineral grants are a small, targeted supplement
// to native mining; rhythm/item-spam objectives deliberately remain coin-only.
export const MISSION_MINERALS=Object.freeze({miner:[0,8],quartz:[0,8],prism:[1,5],geode:[2,3],vital:[3,6],rocks:[0,6],brute:[2,3],hunter:[1,4],slime:[3,4],bats:[1,4],guardians:[2,4],floors:[3,8],bombs:[2,2],depth4:[1,6],depth8:[2,6]});
const DISC_TYPES=new Set(['miner','geode','floors','depth4','depth8']);
const PET_TYPES=new Set(['rocks','hunter','floors']);
export function questResourceReward(template,tier,growth){
 const materials=[0,0,0,0],entry=MISSION_MINERALS[template];
 if(entry)materials[entry[0]]=Math.max(1,Math.round(entry[1]*({common:1,rare:2,gold:4}[tier])*growth));
 return {materials,recordChance:DISC_TYPES.has(template)?{common:.001,rare:.003,gold:.0075}[tier]:0,petChance:PET_TYPES.has(template)?{common:0,rare:.001,gold:.0025}[tier]:0};
}
export function validQuestReward(reward){
 return !!reward&&Array.isArray(reward.materials)&&reward.materials.length===4&&reward.materials.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=10000)&&Number.isFinite(reward.recordChance)&&reward.recordChance>=0&&reward.recordChance<=.0075&&Number.isFinite(reward.petChance)&&reward.petChance>=0&&reward.petChance<=.0025;
}
export function questRoll(m,salt=0){let n=(m.rewardSeed^salt)>>>0;for(const c of m.id)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
export const questRecordCandidates=s=>RECORDS.filter(r=>r.id!=='pulse'&&!s.records.owned.includes(r.id)&&(r.mission||!r.floor||s.best>=r.floor-1));
export function grantQuestCollectibles(s,m){
 if(m.version!==3||m.collectiblesResolved)return {record:null,pet:null};
 m.collectiblesResolved=true;let record=null,pet=null;
 const candidates=questRecordCandidates(s);
 if(candidates.length&&questRoll(m,0x57a721)<m.reward.recordChance){const chosen=candidates[Math.floor(questRoll(m,0x193abc)*candidates.length)];if(grantRecord(s,chosen.id))record=chosen;}
 if(validHomeCollection(s.homeCollection)&&!s.homeCollection.pets.includes('bolota')&&questRoll(m,0x706574)<m.reward.petChance){s.homeCollection.pets.push('bolota');pet='bolota';}
 return {record,pet};
}
