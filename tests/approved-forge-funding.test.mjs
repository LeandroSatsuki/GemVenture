import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState,upgradeCost,coreCost,purchaseUpgrade,purchaseCore} from '../dist/core.js';
import {depositEquipment,FORGE_CAP} from '../dist/forge.js';
import {pickRecipe,wellRecipe} from '../dist/materials.js';
import {compactTalentNetwork} from '../dist/compact-talents.js';
import {SKILLS} from '../dist/core.js';
import {positions,overview} from '../dist/approved-tree-geometry.js';
test('partial coins survive reload and crafting consumes escrow once without requiring a second wallet payment',()=>{
 const s=createState(91),cost=upgradeCost(s),recipe=pickRecipe(s);s.bank=cost-1;s.materials=[...recipe];
 assert.equal(depositEquipment(s,'pickaxe'),cost-1);assert.equal(s.bank,0);assert.deepEqual(s.materials,recipe);
 const restored=restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.forge.funds.pickaxe,cost-1);
 const before=JSON.stringify(restored);assert.equal(purchaseUpgrade(restored),false);assert.equal(JSON.stringify(restored),before);
 restored.bank=11;assert.equal(depositEquipment(restored,'pickaxe'),1);assert.equal(restored.bank,10);
 assert.equal(purchaseUpgrade(restored),true);assert.equal(restored.bank,10);assert.equal(restored.level,2);assert.equal(restored.forge.funds.pickaxe,0);assert.deepEqual(restored.materials,[0,0,0,0]);
 assert.equal(purchaseUpgrade(restored),false);assert.equal(restored.bank,10);
});
test('life funding is independent and failed craft retains both escrow and materials',()=>{
 const s=createState(92);s.bank=1000;const cost=coreCost(s);assert.equal(depositEquipment(s,'vigor'),cost);assert.equal(s.forge.funds.pickaxe,0);
 const before=JSON.stringify(s);assert.equal(purchaseCore(s),false);assert.equal(JSON.stringify(s),before);
 s.materials=wellRecipe(s);assert.equal(purchaseCore(s),true);assert.equal(s.bank,1000-cost);assert.equal(s.core,1);assert.equal(s.forge.funds.vigor,0);
});
test('old saves initialize empty funds and malformed or overfunded saves are rejected',()=>{
 const s=createState(93);delete s.forge.funds;const old=restoreState(JSON.stringify(s));assert.deepEqual(old.forge.funds,{pickaxe:0,vigor:0});assert.equal(old.bank,s.bank);
 for(const value of [-1,.5,NaN,upgradeCost(s)+1]){const a=structuredClone(s);a.forge.funds={pickaxe:value,vigor:0};assert.equal(restoreState(JSON.stringify(a)),null);}
});
test('deposit guards do not debit during a run, at the cap, or for another project',()=>{
 const s=createState(94);s.bank=1000;s.run={};assert.equal(depositEquipment(s,'pickaxe'),0);s.run=null;s.level=FORGE_CAP;assert.equal(depositEquipment(s,'pickaxe'),0);assert.equal(depositEquipment(s,'anvil'),0);assert.equal(depositEquipment(s,'vigor',-1),0);assert.equal(s.bank,1000);
});
test('direct legacy equipment purchase still pays the same original price',()=>{const s=createState(95);s.bank=1000;s.materials=pickRecipe(s);const cost=upgradeCost(s);assert.equal(purchaseUpgrade(s),true);assert.equal(s.bank,1000-cost);});
test('approved tree projection keeps every current node and overview uses only real edges',()=>{const net=compactTalentNetwork(SKILLS);assert.equal(net.nodes.length,52);assert.equal(net.edges.length,127);assert.deepEqual(Object.keys(positions).sort(),net.nodes.map(n=>n.id).sort());assert.equal(overview.length,51);for(const [a,b]of overview)assert(net.edges.some(([x,y])=>x===a&&y===b||x===b&&y===a));});
