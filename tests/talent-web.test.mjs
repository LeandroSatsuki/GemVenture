import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {TALENTS,talentNetwork,talentCost,talentRank,talentConnected,buyTalent,refundTalent,talentEffects,talentInvestment,restoreTalents,TALENT_EFFECTS} from '../dist/talents.js';
import {progressionEffects} from '../dist/progression-effects.js';
const state=()=>{const s=E.createState(12);s.experience.points=1000000;return s;};
test('223 talents form one traversable web with cross routes, 24 major nodes and 6 endless masteries',()=>{
 const net=talentNetwork(E.SKILLS),seen=new Set(['root']);let changed=true;while(changed){changed=false;for(const [a,b]of net.edges)if(seen.has(a)!==seen.has(b)){seen.add(a);seen.add(b);changed=true;}}
 assert.equal(net.nodes.length,224);assert.equal(seen.size,net.nodes.length);assert.ok(net.edges.length>net.nodes.length*2);assert.equal(TALENTS.filter(n=>n.kind==='notable').length,24);assert.equal(TALENTS.filter(n=>n.max===Infinity).length,6);
});
test('an owned neighbor opens a node sideways, small and large ranks have distinct benefits and maximums',()=>{
 const s=state();assert.equal(buyTalent(s,'web-0-0',E.SKILLS),false);assert.ok(E.learn(s,'ear'));assert.ok(buyTalent(s,'web-0-0',E.SKILLS));assert.ok(talentConnected(s,'web-0-23',E.SKILLS));assert.ok(buyTalent(s,'web-0-23',E.SKILLS));
 for(let i=1;i<3;i++)assert.ok(buyTalent(s,'web-0-0',E.SKILLS));const before=s.experience.points;assert.equal(buyTalent(s,'web-0-0',E.SKILLS),false);assert.equal(s.experience.points,before);assert.equal(talentRank(s,'web-0-0'),3);
 const small=TALENTS.find(n=>n.effect==='critical'&&n.kind==='minor'),large=TALENTS.find(n=>n.effect==='critical'&&n.kind==='notable');assert.ok(large.amount>small.amount*3);
});
test('refund prevents severing a purchased branch, refunds exact points and recomputes cached bonuses',()=>{
 const s=state();E.learn(s,'ear');buyTalent(s,'web-0-0',E.SKILLS);buyTalent(s,'web-1-0',E.SKILLS);const value=progressionEffects(s).breath;assert.equal(refundTalent(s,'web-0-0',E.SKILLS),false);const points=s.experience.points;assert.ok(refundTalent(s,'web-1-0',E.SKILLS));assert.equal(s.experience.points,points+1);assert.ok(progressionEffects(s).breath<value);assert.ok(refundTalent(s,'web-0-0',E.SKILLS));
});
test('mastery costs rise while marginal power falls; defenses and resources remain capped',()=>{
 const s=state();s.unlocked=['ear'];for(let ring=0;ring<8;ring++)buyTalent(s,`web-${ring}-0`,E.SKILLS);buyTalent(s,'web-7-1',E.SKILLS);assert.ok(buyTalent(s,'mastery-0',E.SKILLS));const first=talentEffects(s).abyssPower;buyTalent(s,'mastery-0',E.SKILLS);assert.ok(talentEffects(s).abyssPower-first<first);
 s.talents.ranks['mastery-0']=100;assert.ok(talentCost(s,'mastery-0')>50);for(const n of TALENTS)s.talents.ranks[n.id]=n.max===Infinity?1000000:3;const effects=talentEffects(s);for(const [id,d]of Object.entries(TALENT_EFFECTS))assert.ok(effects[id]<=d.cap);
});
test('talent investments and effects survive saves; invalid rank or refund ledger is rejected',()=>{
 const s=state();E.learn(s,'ear');buyTalent(s,'web-0-0',E.SKILLS);assert.deepEqual(E.restoreState(JSON.stringify(s)).talents.ranks,s.talents.ranks);const old=structuredClone(s);delete old.talents;assert.deepEqual(E.restoreState(JSON.stringify(old)).talents.ranks,{});
 for(const mutate of [t=>t.ranks['web-0-0']=4,t=>t.spent['web-0-0']=999,t=>t.ranks.unknown=1]){const bad=structuredClone(s.talents);mutate(bad);assert.equal(restoreTalents(bad),null);}
 const n=TALENTS.find(n=>n.id==='mastery-0');assert.equal(talentInvestment(n,3),15);
});
test('web purchases are forbidden in combat and allowed at a genuine camp',()=>{
 const s=state();E.learn(s,'ear');E.startRun(s);assert.equal(buyTalent(s,'web-0-0',E.SKILLS),false);s.run.rest={active:true};assert.ok(buyTalent(s,'web-0-0',E.SKILLS));assert.equal(refundTalent(s,'web-0-0',E.SKILLS),false);
});
