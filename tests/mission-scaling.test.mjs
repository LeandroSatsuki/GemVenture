import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {BUILDINGS,buildingUpgrade,upgradeBuilding,restoreVillage} from '../dist/village.js';
import {MISSION_TYPES,MISSION_TIERS,missionTerms,missionOffers,missionOdds,missionReward,acceptMission,recordMission,tickMission,claimMission,validMission} from '../dist/missions.js';
import {buildingMarkup} from '../dist/village-view.js';

test('mission board reaches 150 without changing the forge and well caps or old prices',()=>{
 assert.equal(BUILDINGS.missions.cap,150);assert.equal(BUILDINGS.forge.cap,10);assert.equal(BUILDINGS.well.cap,10);
 const s=E.createState(92);let previous={cost:0,recipe:[0,0,0,0]},coins=0,minerals=0;
 for(let level=1;level<150;level++){
  s.village.missions=level;const p=buildingUpgrade(s,'missions');
  assert.ok(Number.isSafeInteger(p.cost)&&p.cost>previous.cost);assert.ok(p.recipe.every((n,i)=>Number.isSafeInteger(n)&&n>previous.recipe[i]));
  if(level<=9){assert.equal(p.cost,Math.round(300*1.65**(level-1)));assert.deepEqual(p.recipe,[65,25,55,45].map(n=>Math.ceil(n*1.5**(level-1))));}
  else{assert.ok(p.cost/previous.cost<1.09);assert.ok(p.recipe.every((n,i)=>n/previous.recipe[i]<1.04));}
  coins+=p.cost;minerals+=p.recipe.reduce((a,b)=>a+b,0);previous=p;
 }
 assert.ok(coins>20e6&&coins<100e6,'multi-session investment, bounded polynomial costs');assert.ok(minerals>1e6&&minerals<5e6);
 s.village.missions=149;const p=buildingUpgrade(s,'missions');s.bank=p.cost;s.materials=[...p.recipe];
 s.materials[1]--;const before=JSON.stringify(s);assert.equal(upgradeBuilding(s,'missions'),false);assert.equal(JSON.stringify(s),before);
 s.materials[1]++;assert.ok(upgradeBuilding(s,'missions'));assert.equal(s.village.missions,150);assert.equal(s.bank,0);assert.deepEqual(s.materials,[0,0,0,0]);
 const max=buildingUpgrade(s,'missions');assert.ok(max.max);assert.equal(max.cap,150);assert.equal(upgradeBuilding(s,'missions'),false);
 assert.equal(E.restoreState(JSON.stringify(s)).village.missions,150);assert.equal(restoreVillage({...s.village,missions:151}),null);
 assert.match(buildingMarkup(s,'missions'),/NV\. 150 \/ 150/);assert.match(buildingMarkup(s,'missions'),/NÍVEL MÁXIMO/);assert.doesNotMatch(buildingMarkup(s,'missions'),/data-building/);
});

test('all levels produce distinct deterministic offers, sane rarity and only reachable templates',()=>{
 for(let level=1;level<=150;level++)for(const lucky of [false,true]){
  const s=E.createState(level*711);s.village.missions=level;if(lucky)s.unlocked.push('questluck');
  const odds=missionOdds(s);assert.ok(odds.gold>0&&odds.rare>0&&odds.gold+odds.rare<.85);
  const a=missionOffers(s),b=missionOffers(E.restoreState(JSON.stringify(s)));
  assert.equal(a.length,Math.min(6,3+Math.floor((level-1)/3)));assert.deepEqual(a,b);
  assert.equal(new Set(a.map(m=>m.template)).size,a.length);assert.ok(a.every(validMission));
  assert.ok(a.every(m=>m.rewardLevel===level&&m.goal>0&&m.duration===m.remaining));
  assert.ok(a.every(m=>!['depth8','guardians'].includes(m.template)));
  if(level>10)assert.ok(a.every(m=>!MISSION_TYPES.find(d=>d.id===m.template).fixed),'intro depth quests cannot pay high-level rewards for an unlocked checkpoint');
 }
 const s=E.createState();s.village.missions=150;const normal=missionOdds(s);s.unlocked=['questluck'];const lucky=missionOdds(s);assert.ok(lucky.gold>normal.gold&&lucky.rare>normal.rare);
});

test('goals and rewards scale through the cap; tempo and floor completion retain feasible deadlines',()=>{
 for(const def of MISSION_TYPES.filter(d=>!d.fixed))for(const tier of Object.keys(MISSION_TIERS)){
  let previous=missionTerms(def.id,tier,1);
  for(let level=2;level<=150;level++){
   const t=missionTerms(def.id,tier,level);assert.ok(t.goal>=previous.goal);assert.ok(t.reward.gems>=previous.reward.gems);assert.ok(t.duration<=7200);
   if(['beat','combo'].includes(def.metric))assert.ok(t.duration>t.goal*.65,'enough time for real musical pulses');
   if(def.metric==='clear')assert.ok(t.duration>t.goal*60,'never faster than minimum floor time plus travel');
   previous=t;
  }
  const first=missionTerms(def.id,tier,10),last=missionTerms(def.id,tier,150);
  assert.ok(last.goal>first.goal&&last.duration>first.duration);
  assert.ok(last.reward.gems/first.reward.gems<=last.goal/first.goal*1.05,'no exponential reward advantage over work required');
 }
 assert.equal(missionTerms('miner','common',150).goal,199);assert.equal(missionTerms('miner','gold',150).goal,358);
 assert.ok(missionTerms('combo','gold',150).goal<200);assert.ok(missionTerms('floors','gold',150).goal<40);
 assert.ok(missionTerms('beats','gold',150).reward.gems<missionTerms('miner','gold',150).reward.gems,'passive timing objectives do not pay like mining');
});

test('level 149 contract is frozen across upgrade, death, reload, progress and one-time delivery',()=>{
 const s=E.createState(923);s.village.missions=149;s.bank=1e8;s.materials.fill(1e6);s.seals=5;
 const offer=missionOffers(s).find(m=>!['combo','floor'].includes(MISSION_TYPES.find(d=>d.id===m.template).metric));
 assert.ok(acceptMission(s,offer.id));const contract=structuredClone(s.mission),reward=missionReward(s.mission);
 assert.notEqual(s.mission.reward,offer.reward);assert.ok(upgradeBuilding(s,'missions'));assert.deepEqual(s.mission,contract);
 E.startRun(s);const def=MISSION_TYPES.find(d=>d.id===contract.template);recordMission(s,def.metric,1,def.kind);tickMission(s,7);
 E.finishRun(s,'death');const time=s.mission.remaining;tickMission(s,300);assert.equal(s.mission.remaining,time);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.mission.progress,1);assert.deepEqual(missionReward(restored.mission),reward);
 E.startRun(restored);recordMission(restored,def.metric,contract.goal,def.kind);assert.equal(restored.mission.status,'ready');assert.equal(claimMission(restored),false);
 E.finishRun(restored);const bank=restored.bank,essence=restored.essence;assert.ok(claimMission(restored));assert.equal(restored.bank,bank+reward.gems);assert.equal(restored.essence,essence+reward.essence);assert.equal(claimMission(restored),false);
 assert.ok(missionOffers(restored).every(m=>m.rewardLevel===150));
});

test('legacy accepted missions retain old prices and time; new long contracts reject corrupted saves',()=>{
 const s=E.createState();s.village.missions=10;s.mission={id:'legacy',template:'combo',tier:'gold',rewardLevel:10,goal:54,progress:12,remaining:123,duration:360,status:'active'};
 const old=structuredClone(s.mission);s.village.missions=150;const restored=E.restoreState(JSON.stringify(s));assert.deepEqual(restored.mission,old);assert.deepEqual(missionReward(restored.mission),{gems:1892,essence:9});
 s.mission=null;const fresh=missionOffers(s)[0];assert.ok(fresh.duration>360);assert.ok(validMission(fresh));
 for(const changes of [{rewardLevel:151},{rewardLevel:1.5},{version:99},{duration:7201},{remaining:fresh.duration+1},{reward:{gems:Infinity,essence:1}},{reward:{gems:12,essence:-1}},{reward:null}])assert.equal(validMission({...fresh,...changes}),false);
 const expired={...fresh,remaining:.1};s.mission=expired;E.startRun(s);tickMission(s,1);assert.equal(s.mission.status,'expired');recordMission(s,'mine',1e6);assert.equal(s.mission.progress,0);E.finishRun(s);assert.equal(claimMission(s),false);
});
