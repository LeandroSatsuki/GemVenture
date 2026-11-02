import {restoreState,upgradeCost,purchaseUpgrade,power} from './core.js';
import {pickRecipe} from './materials.js';
import {restoreAccountScore} from './account-score.js';
import {INTRO_REWARD,validTutorialIntro} from './tutorial-intro.js';
import {isCompletedTraining} from './tutorial-training.js';
const empty=()=>[0,0,0,0];
const fail=(reason,extra={})=>({ok:false,reason,...extra});
const clone=x=>JSON.parse(JSON.stringify(x));
export function tutorialRewardView(profile){
 const intro=profile?.tutorialIntro,account=profile?.accountScore;
 const valid=validTutorialIntro(intro)&&!!restoreAccountScore(account)&&(!intro.reward||intro.reward.accountId===account.id);
 if(!valid)return {eligible:false,status:'unsupported-progress',claimed:false};
 const cost=upgradeCost(profile),recipe=pickRecipe(profile),upgraded=profile.level>1;
 const eligible=intro.eligibility==='eligible'&&!intro.reward&&!upgraded;
 return {eligible,status:intro.reward?'claimed':upgraded?'already-upgraded':intro.eligibility==='legacy'?'veteran':'eligible',claimed:!!intro.reward,upgraded,cost,recipe:[...recipe],missing:{coins:eligible?Math.max(0,cost-profile.bank-(profile.forge?.funds?.pickaxe||0)):0,materials:recipe.map((n,i)=>eligible?Math.max(0,n-profile.materials[i]):0)},receipt:intro.reward?clone(intro.reward):null};
}
function transactionContext(profile,{storage,key='gemventure-save-v2',expectedRaw,readFailed=false}={}){
 if(readFailed)return fail('save-not-loaded');
 if(profile?.run)return fail('return-required');
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof expectedRaw!=='string')return fail('save-required');
 try{
  if(JSON.stringify(profile)!==expectedRaw)return fail('profile-unsaved');
  if(storage.getItem(key)!==expectedRaw)return fail('save-conflict',{requiresReload:true});
  const restored=restoreState(expectedRaw);if(!restored||!restoreAccountScore(restored.accountScore))return fail('unsupported-profile',{requiresReload:true});
  if(!validTutorialIntro(profile.tutorialIntro)||profile.tutorialIntro.reward&&profile.tutorialIntro.reward.accountId!==profile.accountScore.id)return fail('unsupported-progress');
  return {ok:true,storage,key,expectedRaw,next:clone(profile)};
 }catch{return fail('storage-unavailable');}
}
function commit(profile,ctx,result){
 const serialized=JSON.stringify(ctx.next),operation=result.status==='upgraded'?'purchase':'reward';
 const backupKey=ctx.key+':tutorial-intro:'+ctx.next.accountScore.id+':'+operation+'-before-v1';let writeError=false;
 // Mandatory recovery copy of the exact preceding save. It is never loaded or
 // credited automatically. If backup persistence is unavailable, do not grant.
 try{ctx.storage.setItem(backupKey,ctx.expectedRaw);}catch{}
 try{if(ctx.storage.getItem(backupKey)!==ctx.expectedRaw)return fail('backup-unavailable');}catch{return fail('backup-unavailable');}
 try{if(ctx.storage.getItem(ctx.key)!==ctx.expectedRaw)return fail('save-conflict',{requiresReload:true});ctx.storage.setItem(ctx.key,serialized);}catch{writeError=true;}
 let actual;
 try{actual=ctx.storage.getItem(ctx.key);}catch{return fail('commit-unknown',{requiresReload:true});}
 if(actual!==serialized)return actual===ctx.expectedRaw?fail(writeError?'write-failed':'write-not-confirmed'):fail('commit-conflict',{requiresReload:true});
 // A storage adapter may throw after committing. Readback recovers that exact
 // committed transaction without crediting it twice or overwriting the receipt.
 profile.bank=ctx.next.bank;profile.materials=[...ctx.next.materials];profile.level=ctx.next.level;profile.forge=clone(ctx.next.forge);profile.tutorialIntro=clone(ctx.next.tutorialIntro);
 return {ok:true,persisted:true,recoveredWrite:writeError,backupKey,...result};
}
export function commitTutorialReward(profile,session,options={}){return grantFirstUpgrade(profile,isCompletedTraining(session),options);}
export const hasCampaignReturn=profile=>!profile?.run&&profile?.attempts>0&&profile?.lastResult?.presented===true&&profile.lastResult.mode==='floors';
export function commitFirstReturnReward(profile,options={}){return grantFirstUpgrade(profile,hasCampaignReturn(profile),options);}
function grantFirstUpgrade(profile,qualified,options){
 const ctx=transactionContext(profile,options);if(!ctx.ok)return ctx;
 const view=tutorialRewardView(profile);if(view.status==='unsupported-progress')return fail(view.status);
 if(view.claimed)return {ok:true,persisted:true,status:'already-claimed',grant:{coins:0,materials:empty()},receipt:view.receipt};
 if(view.status==='veteran'||view.upgraded)return {ok:true,persisted:true,status:view.status,grant:{coins:0,materials:empty()}};
 if(!qualified)return fail('intro-milestone-required');
 const grant={coins:view.missing.coins,materials:[...view.missing.materials]};
 ctx.next.bank+=grant.coins;ctx.next.materials=ctx.next.materials.map((n,i)=>n+grant.materials[i]);
 ctx.next.tutorialIntro.reward={id:INTRO_REWARD,accountId:profile.accountScore.id,status:grant.coins||grant.materials.some(Boolean)?'granted':'funded',coins:grant.coins,materials:[...grant.materials],targetLevel:2};
 return commit(profile,ctx,{status:ctx.next.tutorialIntro.reward.status,grant,receipt:clone(ctx.next.tutorialIntro.reward)});
}
export function commitTutorialUpgrade(profile,options={}){
 const ctx=transactionContext(profile,options);if(!ctx.ok)return ctx;
 if(profile.level>1)return {ok:true,persisted:true,status:'already-upgraded',level:profile.level};
 const view=tutorialRewardView(profile);if(!view.claimed)return fail('intro-reward-required');
 const before=power(ctx.next),cost=upgradeCost(ctx.next),recipe=pickRecipe(ctx.next);
 if(!purchaseUpgrade(ctx.next))return fail('purchase-unavailable');
 return commit(profile,ctx,{status:'upgraded',level:ctx.next.level,cost,recipe:[...recipe],powerBefore:before,powerAfter:power(ctx.next)});
}
