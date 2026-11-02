import test from 'node:test';import assert from 'node:assert/strict';
import {createState} from '../dist/core.js';import {ABYSS_GATE_COST,canEnterAbyss} from '../dist/descent-progress.js';import {abyssRequirementView} from '../dist/approved-abyss-requirement.js';
test('reaching floor 35 does not fabricate boss victory; partial deposits remain partial and projection changes no profile',()=>{
 const s=createState(994);s.best=35;s.descent.gate=[ABYSS_GATE_COST[0],ABYSS_GATE_COST[1]-1,0,ABYSS_GATE_COST[3]];const before=structuredClone(s),v=abyssRequirementView(s);assert.equal(v.bossName,'BOSS MÍSTICO');assert.equal(v.code,'4–5');assert.equal(v.bossDefeated,false);assert.deepEqual(v.complete,[true,false,false,true]);assert.equal(v.completed,2);assert.equal(v.total,4);assert.deepEqual(s,before);assert.equal(canEnterAbyss(s),false);
});
test('boss and four full contributions remain separate conditions, without money or a new 35-floor requirement',()=>{
 const s=createState(994);s.best=20;s.bank=0;s.descent.gate=[...ABYSS_GATE_COST];assert.equal(abyssRequirementView(s).completed,4);assert.equal(abyssRequirementView(s).bossDefeated,false);assert.equal(canEnterAbyss(s),false);s.descent.bosses=[20];assert.equal(abyssRequirementView(s).bossDefeated,true);assert.equal(canEnterAbyss(s),true);s.descent.gate[0]--;assert.equal(abyssRequirementView(s).completed,3);assert.equal(canEnterAbyss(s),false);
});
