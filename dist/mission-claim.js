import {claimMission,missionList} from './missions.js';
// Save all reward ledgers and removal of the contract in one storage value.
// Keep the live profile identity (the open UI and account-score tracker own it).
const ledgers=['bank','totalGems','materials','missionsCompleted','mission','extraMissions','missionRoll','missionBoard','records','homeCollection','petBonds'];
export function commitMissionClaim({profile,id,storage,key}){
 if(profile.run||!missionList(profile).some(m=>m.id===id&&m.status==='ready'))return {ok:false,reason:'unavailable'};
 let prior,draft,serialized;
 try{
  prior=storage.getItem(key);const disk=JSON.parse(prior);
  if(!disk||disk.accountScore?.id!==profile.accountScore?.id||ledgers.some(k=>JSON.stringify(disk[k])!==JSON.stringify(profile[k])))return {ok:false,reason:'conflict',requiresReload:true};
  draft=structuredClone(profile);if(!claimMission(draft,id))return {ok:false,reason:'unavailable'};
  serialized=JSON.stringify(draft);
  if(storage.getItem(key)!==prior)return {ok:false,reason:'conflict',requiresReload:true};
 }catch{return {ok:false,reason:'save-unavailable'};}
 try{storage.setItem(key,serialized);}catch{/* Read-back distinguishes a rejected write from an acknowledged commit. */}
 let actual;try{actual=storage.getItem(key);}catch{return {ok:false,reason:'unknown-commit',requiresReload:true};}
 if(actual!==serialized)return {ok:false,reason:actual===prior?'save-failed':'conflict',requiresReload:actual!==prior};
 for(const field of ledgers)profile[field]=draft[field];
 return {ok:true};
}
