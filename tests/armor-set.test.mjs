import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {forgeEffects} from '../dist/forge.js';
import {createGear,gearRollCost,rollGear,chooseGearTrait,discardGearRoll,gearUpgradeCost,upgradeGearTrait,clearGearTrait,gearTraitText,gearPool} from '../dist/gear.js';
import {forgeMarkup} from '../dist/forge-view.js';
function ready(){const s=E.createState(316);s.best=35;s.bank=100000;s.materials=[10000,10000,10000,10000];s.forge.levels.armor=25;return s;}

test('one permanent eight-piece outfit migrates old saves and rejects corrupt gear',()=>{
 const s=ready(),old=structuredClone(s);old.forge.version=3;delete old.forge.gear;
 const restored=E.restoreState(JSON.stringify(old));assert.ok(restored);assert.equal(restored.forge.version,5);assert.deepEqual(restored.forge.gear,createGear());
 const v4=structuredClone(s);v4.forge.version=4;delete v4.forge.gear;v4.forge.armorSet={version:1,slots:[{id:'steady',rank:3,critical:false},{id:'force',rank:2,critical:false},null,{id:'yield',rank:2,critical:false}],rolls:[1,1,0,1],pending:null};
 const migrated=E.restoreState(JSON.stringify(v4));assert.ok(migrated);assert.equal(migrated.forge.gear.items.helmet.traits[0].id,'steady');assert.equal(migrated.forge.gear.items.pickaxe.traits[0].id,'force');assert.equal(migrated.forge.gear.items.backpack.traits[0].id,'yield');
 const bad=structuredClone(s);bad.forge.gear.items.helmet.traits[0]={id:'force',kind:1,rank:9};assert.equal(E.restoreState(JSON.stringify(bad)),null);
});
test('a piece accepts compatible colors and three offers without replacing the current trait',()=>{
 const s=ready(),cost=gearRollCost(s,'pickaxe',0,1),before=[...s.materials],coins=s.bank;
 assert.equal(gearRollCost(s,'pickaxe',0,0),null);assert.equal(rollGear(s,'pickaxe',0,1,()=>1),null);assert.deepEqual(s.materials,before);
 const pending=rollGear(s,'pickaxe',0,1,()=>.1);assert.equal(pending.options.length,3);assert.equal(new Set(pending.options.map(o=>o.id)).size,3);assert.equal(s.materials[1],before[1]-cost.crystals);assert.equal(s.materials[0],before[0]);assert.equal(s.bank,coins-cost.coins);assert.equal(s.forge.gear.items.pickaxe.traits[0],null);
 assert.equal(rollGear(s,'ring',0,1,()=>0),null);assert.ok(E.restoreState(JSON.stringify(s)));assert.ok(chooseGearTrait(s,0));assert.equal(s.forge.gear.pending,null);assert.equal(s.forge.gear.items.pickaxe.traits[0].kind,1);assert.ok(gearRollCost(s,'pickaxe',0,1).crystals>cost.crystals);assert.ok(gearPool('pickaxe',1).length>=3);
});
test('upgrades spend the matching crystal, never downgrade, and cleaning preserves other gear',()=>{
 const s=ready();s.forge.gear.items.pickaxe.traits[0]={id:'force',kind:1,rank:1};const cost=gearUpgradeCost(s,'pickaxe',0),before=[...s.materials];
 assert.equal(upgradeGearTrait(s,'pickaxe',0,()=>.99).success,false);assert.equal(s.forge.gear.items.pickaxe.traits[0].rank,1);assert.equal(s.materials[1],before[1]-cost.crystals);
 const next=gearUpgradeCost(s,'pickaxe',0);assert.ok(next.crystals>cost.crystals);const result=upgradeGearTrait(s,'pickaxe',0,()=>0);assert.equal(result.success,true);assert.equal(result.critical,true);assert.equal(result.rank,3);assert.match(gearTraitText(s.forge.gear.items.pickaxe.traits[0]),/DANO DA PICARETA/);
 const current=structuredClone(s.forge.gear.items.pickaxe.traits[0]);const reroll=rollGear(s,'pickaxe',0,1,()=>.7);assert.equal(reroll.options.length,3);assert.ok(reroll.options.every(o=>o.id!=='force'));assert.deepEqual(s.forge.gear.items.pickaxe.traits[0],current);assert.ok(discardGearRoll(s));assert.deepEqual(s.forge.gear.items.pickaxe.traits[0],current);assert.ok(clearGearTrait(s,'pickaxe',0));assert.equal(s.forge.gear.items.pickaxe.traits[0],null);assert.ok(s.forge.gear.items.pickaxe.strain>0);
});
test('piece traits change actual run stats and the forge shows gear, color and upgrade odds',()=>{
 const s=ready();s.forge.gear.items.helmet.traits[0]={id:'steady',kind:0,rank:2};s.forge.gear.items.pickaxe.traits[0]={id:'force',kind:1,rank:2};s.forge.gear.items.chest.traits[0]={id:'health',kind:2,rank:2};s.forge.gear.items.backpack.traits[0]={id:'yield',kind:3,rank:2};s.forge.gear.items.boots.traits[0]={id:'stride',kind:0,rank:1};
 assert.equal(forgeEffects(s).breathGuard,.016);assert.equal(E.power(s),1.016);assert.equal(E.maxHealth(s),103);assert.equal(E.movement(s),5);
 assert.ok(E.startRun(s));const target={value:200,kind:0};const value=E.crystalValue(s,target);s.forge.gear.items.backpack.traits[0]=null;assert.ok(value>E.crystalValue(s,target));assert.equal(rollGear(s,'pickaxe',0,1,()=>0),null);
 E.finishRun(s,'return');const html=forgeMarkup(s,'armor',0,0,false,'pickaxe',0,1);assert.match(html,/EQUIPAMENTO/);assert.match(html,/MOCHILA/);assert.match(html,/ROLETAR OUTRO/);assert.match(html,/APRIMORAR/);assert.doesNotMatch(html,/INVENTÁRIO/);
});
test('a developed ruby mining trait removes one required hit from tough crystals and rocks',()=>{
 const hit=(type,traitId)=>{const s=ready();s.level=100;if(traitId)s.forge.gear.items.pickaxe.traits[0]={id:traitId,kind:1,rank:7};assert.ok(E.startRun(s));rectangularRoom(s);Object.assign(s.run.room,{explored:null,visible:null,wave:null,terrain:Array(s.run.room.cols*s.run.room.rows).fill(0),nodes:[],rocks:[],enemies:[]});const n={id:999,type,kind:0,x:4,y:11,hp:6,maxHp:6,value:5,born:0};s.run.room[type==='rock'?'rocks':'nodes'].push(n);assert.equal(E.act(s,{type:'hit',id:n.id},0).ok,true);return n.hp;};
 assert.ok(hit('crystal','crystal')<hit('crystal',null));assert.ok(hit('rock','rock')<hit('rock',null));
});
