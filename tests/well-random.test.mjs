import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState,startRun,finishRun,power,maxHealth} from '../dist/core.js';
import {makeOffering,rollWish,wishOdds,blessingEffects,blessingInfo,grantXP} from '../dist/pillars.js';
import {upgradeBuilding} from '../dist/village.js';
import {wellMarkup} from '../dist/pillar-view.js';
const rich=()=>{const s=createState(712);s.materials=[10000,10000,10000,10000];s.bank=10000;return s;};

test('well levels alter only quality odds; all outcomes and extreme risks remain possible',()=>{
 const n=16000,counts=[[0,0,0],[0,0,0]],risks=[0,0,0];
 for(let seed=0;seed<n;seed++){
  const low=rollWish(seed,1,1),high=rollWish(seed,1,10);
  assert.equal(low.choice,high.choice);assert.equal(low.roll.risk,high.roll.risk);assert.ok(high.roll.tier>=low.roll.tier);
  counts[0][low.roll.tier]++;counts[1][high.roll.tier]++;risks[low.roll.risk]++;
 }
 for(const [index,level] of [[0,1],[1,10]])for(let tier=0;tier<3;tier++)assert.ok(Math.abs(counts[index][tier]/n-wishOdds(level)[tier])<.015);
 for(let risk=0;risk<3;risk++)assert.ok(Math.abs(risks[risk]/n-[.6,.3,.1][risk])<.015);
 for(let tier=0;tier<3;tier++)for(let risk=0;risk<3;risk++){
  const roll={version:1,tier,risk};assert.deepEqual(blessingEffects({blessing:'might',blessingLevel:1,blessingRoll:roll}),blessingEffects({blessing:'might',blessingLevel:10,blessingRoll:roll}));
 }
});
test('paid outcome is frozen across upgrades, reload and a run, and cannot reroll for free',()=>{
 const s=rich(),result=makeOffering(s,1),roll=structuredClone(s.pendingBlessingRoll),before=[...s.materials];
 assert.equal(makeOffering(s,1),null);assert.deepEqual(s.materials,before);assert.ok(upgradeBuilding(s,'well'));assert.deepEqual(s.pendingBlessingRoll,roll);
 const b=restoreState(JSON.stringify(s));assert.deepEqual(blessingInfo(b.pendingBlessing,b.pendingBlessingLevel,b.pendingBlessingRoll),result);
 startRun(b);assert.deepEqual(b.run.blessingRoll,roll);assert.equal(b.pendingBlessingRoll,null);assert.equal(makeOffering(b,0),null);assert.deepEqual(restoreState(JSON.stringify(b)).run.blessingRoll,roll);
 finishRun(b,'death');startRun(b);assert.equal(b.run.blessingRoll,null);
});
test('random blessings apply their strong bonuses and severe downsides in the actual run',()=>{
 const run=id=>{const s=rich();s.pendingBlessing=id;s.pendingBlessingRoll={version:1,tier:2,risk:2};startRun(s);return s;};
 const ruby=run('might');assert.equal(power(ruby),1.6);assert.equal(blessingEffects(ruby.run).incoming,1.8);
 const emerald=run('bountywish');assert.equal(maxHealth(emerald),60);assert.equal(emerald.run.health,60);assert.equal(blessingEffects(emerald.run).loot,1.75);
 const quartz=run('wisdom');grantXP(quartz,50);assert.equal(quartz.experience.xp,100);assert.equal(blessingEffects(quartz.run).loot,.6);
 const topaz=run('shellwish');assert.equal(blessingEffects(topaz.run).incoming,.65);assert.equal(power(topaz),.65);
 for(const s of [ruby,emerald,quartz,topaz])assert.ok(restoreState(JSON.stringify(s)));
});
test('legacy blessings retain purchased power; corrupt or orphaned new rolls cannot replace saves',()=>{
 const s=rich();s.pendingBlessing='might';s.pendingBlessingLevel=10;const old=blessingEffects({blessing:'might',blessingLevel:10});const copy=restoreState(JSON.stringify(s));startRun(copy);assert.deepEqual(blessingEffects(copy.run),old);
 for(const roll of [{version:2,tier:1,risk:1},{version:1,tier:3,risk:0},{version:1,tier:0,risk:-1},{}]){s.pendingBlessingRoll=roll;assert.equal(restoreState(JSON.stringify(s)),null);}
 s.pendingBlessing=null;s.pendingBlessingRoll={version:1,tier:1,risk:1};assert.equal(restoreState(JSON.stringify(s)),null);
 copy.run.blessingRoll={version:1,tier:1,risk:7};assert.equal(restoreState(JSON.stringify(copy)),null);
});
test('well hides outcome odds and possibilities, then reveals the purchased blessing and curse',()=>{
 const s=rich();s.village.well=10;let html=wellMarkup(s,false,1);assert.doesNotMatch(html,/wish-odds|wish-possibilities|wish-chances|48%|40%|12%|60%|RISCO EXTREMO/);assert.match(html,/FORÇA · CRÍTICOS/);assert.ok(html.includes("BÊNÇÃO + MALDIÇÃO"));assert.match(html,/OFERECER 45/);
 makeOffering(s,1);const b=blessingInfo(s.pendingBlessing,s.pendingBlessingLevel,s.pendingBlessingRoll);html=wellMarkup(s,true,1);assert.ok(html.includes(b.good));assert.ok(html.includes(b.risk));assert.doesNotMatch(html,/wish-odds|wish-chances/);
});
