import {restoreAccountScore} from './account-score.js';
import {equipPet,carePet,validHomeCollection} from './home-collection.js';
import {petsServiceView} from './pets-service.js';
// Synchronous storage acknowledgement is a host contract, not OS durability.
// No Casa, tasks, R7 progression or implicit storage selection.
export function commitPetAction({profile,action,id,persist,install,readProfile}){
 if(!['equip','care','remove'].includes(action)||typeof persist!=='function'||typeof install!=='function'||typeof readProfile!=='function')return {ok:false,reason:'invalid-action'};
 try{if(readProfile()!==profile||!petsServiceView(profile).canOpen)return {ok:false,reason:'unavailable'};}catch{return {ok:false,reason:'unavailable'};}
 let before,draft,result,confirmed;
 try{before=JSON.stringify(profile);draft=structuredClone(profile);if(draft.accountScore!==undefined){draft.accountScore=restoreAccountScore(draft.accountScore);if(!draft.accountScore)return {ok:false,reason:'invalid-profile'};}result=action==='care'?carePet(draft,id):equipPet(draft,action==='remove'?null:id);if(!result.ok||!validHomeCollection(draft.homeCollection))return {ok:false,reason:'not-owned'};confirmed=JSON.stringify(draft);if(readProfile()!==profile||JSON.stringify(profile)!==before)return {ok:false,reason:'profile-changed'};}catch{return {ok:false,reason:'invalid-profile'};}
 try{if(persist(draft)!==true)return {ok:false,reason:'save-failed'};}catch(error){return {ok:false,reason:'save-failed',error};}
 try{if(readProfile()!==profile||JSON.stringify(profile)!==before||JSON.stringify(draft)!==confirmed)return {ok:false,reason:'profile-changed',persisted:true};
  if(install(draft)!==true||readProfile()!==draft||JSON.stringify(draft)!==confirmed)return {ok:false,reason:'install-failed',persisted:true};
 }catch(error){return {ok:false,reason:'install-failed',persisted:true,error};}
 return {ok:true,events:result.events||[],profile:draft};
}
