import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import * as M from '../dist/missions.js';
import {RECORDS} from '../dist/records.js';
import {questRoll,grantQuestCollectibles,MISSION_MINERALS} from '../dist/mission-rewards.js';
import {commitMissionClaim} from '../dist/mission-claim.js';
import {recordPetProgress} from '../dist/pet-bonds.js';
function contract(template='miner',tier='common',level=1,id='reward-test'){const t=M.missionTerms(template,tier,level);return {id,version:3,rewardSeed:43,rewardLevel:level,template,tier,...t,remaining:t.duration,progress:t.goal,status:'ready'};}
function ready(template='miner',tier='common',level=1){const s=E.createState(43);s.mission=contract(template,tier,level);return s;}
function winning(m,type){const salt=type==='record'?0x57a721:0x706574,chance=type==='record'?m.reward.recordChance:m.reward.petChance;for(let n=0;n<100000;n++){m.id='drop-'+n;if(questRoll(m,salt)<chance)return m;}throw Error('Missing deterministic fixture');}
function storage(profile){let raw=JSON.stringify(profile);return {getItem:()=>raw,setItem:(_k,v)=>{raw=v;}};}
test('contracts offer meaningful color choices and some coin-only quests',()=>{
 assert.deepEqual(M.missionTerms('quartz','common',1).reward.materials,[8,0,0,0]);assert.deepEqual(M.missionTerms('prism','common',1).reward.materials,[0,5,0,0]);assert.deepEqual(M.missionTerms('geode','common',1).reward.materials,[0,0,3,0]);assert.deepEqual(M.missionTerms('vital','common',1).reward.materials,[0,0,0,6]);
 for(const id of ['beats','combo','points','items','cures'])assert.deepEqual(M.missionTerms(id,'gold',150).reward.materials,[0,0,0,0]);
 for(const id of ['items','bombs','cures'])assert.equal(M.missionTerms(id,'common',1).reward.gems,250);
});
test('all 150 levels preserve monotone resource growth, rarity order and bounded work scaling',()=>{
 for(const def of M.MISSION_TYPES){for(let lv=1;lv<=150;lv++){
  let previous=0;for(const tier of ['common','rare','gold']){const t=M.missionTerms(def.id,tier,lv),sum=t.reward.materials.reduce((a,b)=>a+b,0);assert.ok(sum>=previous);previous=sum;assert.ok(sum<1000);assert.ok(M.validMission(contract(def.id,tier,lv)));
   if(lv>1){const old=M.missionTerms(def.id,tier,lv-1);assert.ok(sum>=old.reward.materials.reduce((a,b)=>a+b,0));}
  }
  if(MISSION_MINERALS[def.id]){const start=M.missionTerms(def.id,'gold',10),end=M.missionTerms(def.id,'gold',150),i=MISSION_MINERALS[def.id][0];assert.ok(end.reward.materials[i]/start.reward.materials[i]<=end.goal/start.goal*1.1);}
 }}
});
test('new reward terms and nested materials freeze across acceptance, upgrade and reload',()=>{
 const s=E.createState(92),offer=M.missionOffers(s)[0];assert.ok(M.acceptMission(s,offer.id));const copy=structuredClone(s.mission);assert.notEqual(s.mission.reward.materials,offer.reward.materials);offer.reward.materials[0]+=999;s.village.missions=150;
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.deepEqual(t.mission,copy);assert.deepEqual(M.missionReward(t.mission),M.missionReward(copy));
});
test('v2 and unversioned accepted missions retain exactly their old coin payouts',()=>{
 for(const version of [undefined,2]){const s=ready();s.mission={...s.mission,version,reward:{gems:321},rewardLevel:1};if(version===undefined)delete s.mission.version;assert.ok(M.validMission(s.mission));const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.ok(M.claimMission(t));assert.equal(t.bank,30+(version===2?321:200));assert.deepEqual(t.materials,[0,0,0,0]);}
});
test('claim credits bank/materials once, never stars, and survives save/reload',()=>{
 const s=ready('prism','gold',10),reward=M.missionReward(s.mission),stars=s.stars;assert.ok(M.claimMission(s));assert.equal(s.bank,30+reward.gems);assert.deepEqual(s.materials,reward.materials);assert.equal(s.stars,stars);assert.equal(s.petBonds.progress.bankedGems,reward.materials[1]);const t=E.restoreState(JSON.stringify(s));assert.ok(t);const before=JSON.stringify(t);assert.equal(M.claimMission(t),false);assert.equal(JSON.stringify(t),before);
});
test('rare disc is always unowned and eligible, does not equip or reroll on repeat',()=>{
 const s=ready('miner','gold'),m=winning(s.mission,'record');s.records.owned=RECORDS.filter(r=>r.id!=='storm').map(r=>r.id);const active=s.records.active;
 const result=grantQuestCollectibles(s,m);assert.equal(result.record.id,'storm');assert.equal(s.records.active,active);assert.equal(grantQuestCollectibles(s,m).record,null);assert.equal(s.records.owned.filter(id=>id==='storm').length,1);
 const t=ready('miner','gold');winning(t.mission,'record');const gained=grantQuestCollectibles(t,t.mission).record;assert.ok(gained.mission);assert.ok(!gained.floor);
});
test('complete disc collection creates no duplicate, replacement coins or extra stars',()=>{
 const s=ready('miner','gold');winning(s.mission,'record');s.records.owned=RECORDS.map(r=>r.id);const before=[s.bank,s.stars];assert.equal(grantQuestCollectibles(s,s.mission).record,null);assert.deepEqual([s.bank,s.stars],before);assert.equal(s.records.owned.length,RECORDS.length);
});
test('Bolota can arrive from eligible rare contracts without replacing the equipped pet or its regular journey',()=>{
 const s=ready('hunter','gold');winning(s.mission,'pet');assert.equal(s.missionsCompleted,0);assert.ok(M.claimMission(s));assert.deepEqual(s.homeCollection.pets,['bolota']);assert.equal(s.homeCollection.activePet,null);assert.ok(E.restoreState(JSON.stringify(s)));
 s.mission=winning(contract('hunter','gold'),'pet');assert.ok(M.claimMission(s));assert.equal(s.homeCollection.pets.filter(id=>id==='bolota').length,1);
 const normal=E.createState(9);normal.missionsCompleted=20;normal.petBonds.progress.coins=5000;recordPetProgress(normal);assert.ok(normal.homeCollection.pets.includes('bolota'));
});
test('no reward from expired, active, missing or in-expedition contracts',()=>{
 for(const mode of ['active','expired','run','missing']){const s=ready();if(mode==='run')E.startRun(s);else if(mode==='missing')s.mission=null;else s.mission.status=mode;const before=JSON.stringify(s);assert.equal(M.claimMission(s),false);assert.equal(JSON.stringify(s),before);}
});
test('invalid minerals, rates and seeds reject a save rather than inflate rewards',()=>{
 const m=contract();for(const changes of [{materials:[1,2,3]},{materials:[-1,0,0,0]},{materials:[.5,0,0,0]},{materials:[10001,0,0,0]},{recordChance:.1},{petChance:NaN}])assert.equal(M.validMission({...m,reward:{...m.reward,...changes}}),false);
 for(const rewardSeed of [-1,NaN,2**32])assert.equal(M.validMission({...m,rewardSeed}),false);
});
test('reloading or changing mutable campaign seed never changes an accepted reward roll',()=>{
 const s=ready('floors','gold'),m=winning(s.mission,'record'),roll=questRoll(m,0x57a721),t=E.restoreState(JSON.stringify(s));assert.ok(t);t.seed+=100000;assert.equal(questRoll(t.mission,0x57a721),roll);assert.deepEqual(grantQuestCollectibles(s,s.mission),grantQuestCollectibles(t,t.mission));
});
test('bounded rare rates over deterministic contracts agree with disclosed chances',()=>{
 for(const tier of ['common','rare','gold']){const m=contract('floors',tier),N=50000;for(const [key,salt]of [['recordChance',0x57a721],['petChance',0x706574]]){let hits=0;for(let i=0;i<N;i++){m.id='sample-'+i;if(questRoll(m,salt)<m.reward[key])hits++;}const expected=N*m.reward[key];assert.ok(Math.abs(hits-expected)<=6*Math.sqrt(expected||1),`${tier} ${key}: ${hits}`);}}
});
test('persistence rejects failed write, retries exactly once and rejects stale/double delivery',()=>{
 const s=ready(),store=storage(s),before=JSON.stringify(s),put=store.setItem;store.setItem=()=>{throw Error('quota');};assert.equal(commitMissionClaim({profile:s,id:s.mission.id,storage:store,key:'qa'}).ok,false);assert.equal(JSON.stringify(s),before);assert.equal(store.getItem(),before);store.setItem=put;const id=s.mission.id;assert.ok(commitMissionClaim({profile:s,id,storage:store,key:'qa'}).ok);assert.equal(JSON.stringify(s),store.getItem());assert.equal(commitMissionClaim({profile:s,id,storage:store,key:'qa'}).ok,false);const stale=JSON.parse(before);assert.equal(commitMissionClaim({profile:stale,id,storage:store,key:'qa'}).requiresReload,true);
});
test('write-then-throw uses read-back; unreadable committed state blocks unsafe retry',()=>{
 const s=ready('hunter','gold');winning(s.mission,'pet');const store=storage(s),put=store.setItem;store.setItem=(k,v)=>{put(k,v);throw Error('after commit');};assert.ok(commitMissionClaim({profile:s,id:s.mission.id,storage:store,key:'qa'}).ok);assert.ok(s.homeCollection.pets.includes('bolota'));
 const t=ready(),disk=storage(t),write=disk.setItem,read=disk.getItem;disk.setItem=(k,v)=>{write(k,v);disk.getItem=()=>{throw Error('unreadable');};};const prior=JSON.stringify(t),result=commitMissionClaim({profile:t,id:t.mission.id,storage:disk,key:'qa'});assert.equal(result.requiresReload,true);assert.equal(JSON.stringify(t),prior);assert.equal(E.restoreState(read()).mission,null);
});
