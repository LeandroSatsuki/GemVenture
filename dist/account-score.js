// Experimental standalone domain model. No official game imports or side effects.
export const RULES='gv-account-score-proposal-v1';
export const PARTICIPATION_BEATS=4;
export const THRESHOLDS=Object.freeze([0,30000,120000,480000,1440000,4320000,12000000]);
const MAX=Number.MAX_SAFE_INTEGER;
const modes=['floors','abyss'];
const excludedKeys=['eliteFill','inactive','unknown','discontinuity','overflow'];
const initialized=new WeakSet();
const integer=(n,max=MAX)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const add=(a,b)=>Math.min(MAX,a+b);
export const scoreTier=total=>THRESHOLDS.reduce((tier,limit,i)=>total>=limit?i:tier,0);
const achievementId=tier=>'GV_STATUE_ELO_'+String(tier+1).padStart(2,'0');
const promotionId=(id,tier)=>id+':'+RULES+':promotion:'+tier;
function validId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(id);}
export function createAccountScore({id=globalThis.crypto.randomUUID(),legacy=false}={}){
 if(!validId(id))throw Error('Invalid account identity');
 const account={schema:1,rules:RULES,id,total:0,byMode:{floors:0,abyss:0},runs:0,current:null,
  excluded:Object.fromEntries(excludedKeys.map(k=>[k,0])),
  origin:legacy?'legacy-zero':'new',
  unlocks:[{id:achievementId(0),tier:0,atTotal:0}],promotions:[],ackTier:0};
 initialized.add(account);return account;
}
export function restoreAccountScore(raw){
 if(!raw||raw.schema!==1||raw.rules!==RULES||!validId(raw.id)||!integer(raw.total)||!integer(raw.runs)||!['legacy-zero','new'].includes(raw.origin))return null;
 if(!raw.byMode||!modes.every(k=>integer(raw.byMode[k]))||raw.byMode.floors+raw.byMode.abyss!==raw.total)return null;
 if(!raw.excluded||!excludedKeys.every(k=>integer(raw.excluded[k])))return null;
 const tier=scoreTier(raw.total);
 if(!Array.isArray(raw.unlocks)||raw.unlocks.length!==tier+1||raw.unlocks.some((u,i)=>!u||u.id!==achievementId(i)||u.tier!==i||!integer(u.atTotal)||scoreTier(u.atTotal)<i||u.atTotal>raw.total||i===0&&u.atTotal!==0))return null;
 if(!Array.isArray(raw.promotions)||raw.promotions.length>6)return null;
 let previousTier=0,previousScore=0;
 for(const e of raw.promotions){
  if(!e||e.type!=='accountTierChanged'||e.version!==1||e.id!==promotionId(raw.id,e.newTier)||e.oldTier!==previousTier||!integer(e.newTier,6)||e.newTier<=e.oldTier||!integer(e.oldScore)||!integer(e.newScore)||e.oldScore<previousScore||e.newScore<=e.oldScore||e.newScore>raw.total||scoreTier(e.oldScore)!==e.oldTier||scoreTier(e.newScore)!==e.newTier||!integer(e.runId)||e.runId<1||e.runId>raw.runs)return null;
  const crossed=Array.from({length:e.newTier-e.oldTier},(_,i)=>achievementId(e.oldTier+i+1));
  if(JSON.stringify(e.unlocked)!==JSON.stringify(crossed))return null;
  for(let i=e.oldTier+1;i<=e.newTier;i++)if(raw.unlocks[i].atTotal!==e.newScore)return null;
  previousTier=e.newTier;previousScore=e.newScore;
 }
 if(previousTier!==tier||!integer(raw.ackTier,6)||![0,...raw.promotions.map(e=>e.newTier)].includes(raw.ackTier))return null;
 const c=raw.current;
 if(c!==null&&(!c||!integer(c.id)||c.id<1||c.id!==raw.runs||!modes.includes(c.mode)||!integer(c.rawCursor)))return null;
 const account=structuredClone(raw);initialized.add(account);return account;
}
// Called once after a successful official restore; a malformed extension is
// retained for diagnosis. It never makes the existing game save unusable.
export function initializeAccountScore(s,{id,legacy=true}={}){
 if(s.accountScore!==undefined){
  const restored=restoreAccountScore(s.accountScore);
  if(!restored)return{ok:false,status:'preserve-invalid-extension'};
  if(restored.current&&(!s.run||restored.current.mode!==(s.run.mode||'floors')||!integer((s.run.score?.totalPoints??s.run.score?.points))||(s.run.score.totalPoints??s.run.score.points)<restored.current.rawCursor))return{ok:false,status:'preserve-cursor-mismatch'};
  if(!restored.current&&s.run)return{ok:false,status:'preserve-missing-active-cursor'};
  s.accountScore=restored;return{ok:true,status:'restored'};
 }
 const account=createAccountScore({id,legacy});
 if(s.run){
  if(!modes.includes(s.run.mode||'floors')||!integer((s.run.score?.totalPoints??s.run.score?.points)))return{ok:false,status:'invalid-run-baseline'};
  account.runs=1;account.current={id:1,mode:s.run.mode||'floors',rawCursor:s.run.score.totalPoints??s.run.score.points};
 }
 s.accountScore=account;return{ok:true,status:legacy?'migrated-zero':'created'};
}
export function beginAccountRun(s){
 const a=s.accountScore,r=s.run;
 if(!initialized.has(a)||a.rules!==RULES||!r||a.current||!modes.includes(r.mode||'floors')||!integer(r.score?.points)||a.runs===MAX)return false;
 a.runs++;a.current={id:a.runs,mode:r.mode||'floors',rawCursor:r.score.totalPoints??r.score.points};return a.current.id;
}
export function endAccountRun(s){const a=s.accountScore;if(!initialized.has(a)||!a.current)return false;a.current=null;return true;}
// Invoke immediately after the authoritative score commit, not from UI events.
// rawTotal is the existing cumulative run score after this single award.
export function recordAccountAward(s,e){
 const a=s.accountScore,c=a?.current;
 if(!initialized.has(a)||!c||a.rules!==RULES||e?.runId!==c.id||e.mode!==c.mode||!integer(e.amount)||e.amount===0||!integer(e.rawTotal)||!Number.isSafeInteger(e.beat)||!Number.isSafeInteger(e.acted))return{credited:0,status:'invalid-or-inactive-run'};
 if(e.rawTotal<=c.rawCursor)return{credited:0,status:'replay'};
 const delta=e.rawTotal-c.rawCursor;
 c.rawCursor=e.rawTotal;
 if(delta!==e.amount){a.excluded.discontinuity=add(a.excluded.discontinuity,delta);return{credited:0,status:'gap-baselined'};}
 let excluded;
 if(e.source==='elite-fill')excluded='eliteFill';
 else if(e.source!=='gameplay')excluded='unknown';
 else if(e.acted<0||e.beat<e.acted||e.beat-e.acted>PARTICIPATION_BEATS)excluded='inactive';
 if(excluded){a.excluded[excluded]=add(a.excluded[excluded],delta);return{credited:0,status:excluded};}
 const credit=Math.min(delta,MAX-a.total),oldScore=a.total,oldTier=scoreTier(oldScore);
 a.total+=credit;a.byMode[c.mode]+=credit;
 a.excluded.overflow=add(a.excluded.overflow,delta-credit);
 const newTier=scoreTier(a.total);
 let event=null;
 if(newTier>oldTier){
  const unlocked=[];
  for(let tier=oldTier+1;tier<=newTier;tier++){const id=achievementId(tier);a.unlocks.push({id,tier,atTotal:a.total});unlocked.push(id);}
  event={type:'accountTierChanged',version:1,id:promotionId(a.id,newTier),oldTier,newTier,oldScore,newScore:a.total,runId:c.id,unlocked};
  a.promotions.push(event);
 }
 return{credited:credit,status:credit?'credited':'numeric-ceiling',event:event?structuredClone(event):null};
}
export function accountScoreView(s){
 const a=s.accountScore;if(!initialized.has(a))return null;
 const tier=scoreTier(a.total),next=THRESHOLDS[tier+1]??null,start=THRESHOLDS[tier];
 return structuredClone({rules:a.rules,total:a.total,tier,stage:tier+1,byMode:a.byMode,next,
  fill:next===null?1:(a.total-start)/(next-start),
  achievements:a.unlocks,pending:a.promotions.filter(e=>e.newTier>a.ackTier)});
}
export function acknowledgePromotion(s,id){
 const a=s.accountScore;if(!initialized.has(a))return false;const next=a.promotions.find(e=>e.newTier>a.ackTier);
 if(!next||next.id!==id)return false;a.ackTier=next.newTier;return true;
}
