import {rectangularRoom} from './helpers/rectangular-room.mjs';
// Legacy encounter fixtures preserve in-progress save compatibility; see geode-crown-official.test.mjs for fresh Coroa Fraturada arenas.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {floorMinerals,rollMineral,pickRecipe,wellRecipe} from '../dist/materials.js';
import {forgeProject,depositForge,craftForge} from '../dist/forge.js';
import {BIOME_CREATURES} from '../dist/creatures.js';
import {generateAsset} from '../dist/art-kit.js';
function mine(kind=0){const s=E.createState(713);E.startRun(s);rectangularRoom(s);s.run.room.explored=null;s.run.room.visible=null;s.run.room.terrain=Array((s.run.room.cols||21)*(s.run.room.rows||15)).fill(0);s.run.room.wave=null;s.run.room.rocks=[];s.run.room.enemies=[];s.run.room.nodes=[{id:999,type:'crystal',kind,x:4,y:11,hp:1,maxHp:1,value:20,born:0}];return s;}
test('mining stores each color independently, pays no generic currency and cannot duplicate rewards',()=>{
 for(let kind=0;kind<4;kind++){const s=mine(kind);E.act(s,{type:'hit',id:999},0);assert.equal(s.run.bag,0);assert.ok(s.run.materials[kind]>0);assert.equal(s.run.materials.filter(n=>n>0).length,1);const held=[...s.run.materials];E.act(s,{type:'hit',id:999},1);assert.deepEqual(s.run.materials,held);const copy=E.restoreState(JSON.stringify(s));assert.deepEqual(copy.run.materials,held);E.finishRun(copy);assert.deepEqual(copy.materials,held);assert.ok(copy.lastResult.resources.some(r=>r.destination==='material-'+kind&&r.value===held[kind]));E.finishRun(copy);assert.deepEqual(copy.materials,held);}
});
test('death applies salvage to each color once; protected cargo stacks within its cap',()=>{
 for(const protectedCargo of [false,true]){const s=mine();s.run.floor=6;s.run.materials=[11,21,31,41];s.run.bag=51;if(protectedCargo)s.unlocked.push('caravan');E.finishRun(s,'death');const ratio=protectedCargo?.6:.5;assert.deepEqual(s.materials,[11,21,31,41].map(n=>Math.floor(n*ratio)));assert.equal(s.bank,30+Math.floor(51*ratio));assert.deepEqual(E.restoreState(JSON.stringify(s)).materials,s.materials);}
});
test('every floor has a deterministic abundant crystal and weighted spawn distribution',()=>{
 for(let floor=1;floor<=25;floor++){const {focus,weights}=floorMinerals(floor),random=E.rng(712+floor),counts=[0,0,0,0];assert.ok(Math.abs(weights.reduce((a,b)=>a+b)-100)<1e-8);for(let i=0;i<5000;i++)counts[rollMineral(floor,random)]++;assert.equal(weights.indexOf(Math.max(...weights)),focus);for(let i=0;i<4;i++)assert.ok(Math.abs(counts[i]/50-weights[i])<4);for(let i=0;i<4;i++)assert.ok(counts[i]>0);if(floor%5!==0)assert.notEqual(focus,floorMinerals(floor+1).focus);}
});
test('forge requires every named material, deposits partial supplies and grants only one benefit',()=>{
 const s=E.createState();s.bank=1000;s.materials=[30,0,0,900];assert.ok(depositForge(s,'anvil',600));assert.equal(s.materials[3],900);assert.equal(craftForge(s,'anvil'),false);assert.deepEqual(forgeProject(s,'anvil').materials,[30,0,0,0]);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);restored.materials=[30,40,20,900];assert.ok(depositForge(restored,'anvil',1));assert.ok(forgeProject(restored,'anvil').ready);assert.ok(craftForge(restored,'anvil'));assert.equal(E.power(restored),1.005);assert.equal(craftForge(restored,'anvil'),false);assert.equal(restored.bank,400);assert.deepEqual(restored.materials,[0,0,0,900]);
});
test('pickaxe and fountain consume exact recipes atomically, refusing insufficient resources',()=>{
 const s=E.createState();s.bank=1000;assert.equal(E.purchaseUpgrade(s),false);assert.equal(s.bank,1000);const recipe=pickRecipe(s);s.materials=[...recipe];assert.ok(E.purchaseUpgrade(s));assert.deepEqual(s.materials,[0,0,0,0]);assert.equal(E.purchaseCore(s),false);s.materials=wellRecipe(s);assert.ok(E.purchaseCore(s));assert.deepEqual(s.materials,[0,0,0,0]);
});
test('new tree nodes enforce links and skill points; passive and equipped effects alter gameplay',()=>{
 const s=E.createState();s.bank=9999;s.essence=99;s.experience.points=30;s.materials=[1000,1000,1000,1000];assert.equal(E.learn(s,'bossbane'),false);s.unlocked=['ear','breath'];assert.ok(E.learn(s,'starter'));assert.equal(s.equipped.includes('starter'),false);E.startRun(s);assert.equal(s.run.items.tonic,1);
 const a=mine(),b=mine();b.unlocked.push('gemcraft');b.equipped=['geologist'];for(const x of [a,b])E.act(x,{type:'hit',id:999},0);assert.ok(b.run.materials[0]>=a.run.materials[0]*1.4);
 for(const skill of ['bossbane','renewal']){const x=E.createState();x.seals=3;E.startRun(x);x.run.floor=5;E.generateRoom(x);const boss=x.run.room.enemies[0];delete boss.crown;boss.windup=null;boss.recoverUntil=3;x.run.player={x:boss.x-1,y:boss.y};boss.exposedUntil=50;x.equipped=[skill];x.level=5;x.run.health=40;if(skill==='renewal')boss.hp=1;E.act(x,{type:'hit',id:boss.id},0);if(skill==='bossbane')assert.equal(boss.hp,boss.maxHp-2);else assert.equal(x.run.health,64);}
});
test('old four-floor campaigns migrate once without losing health, loot, cards or investments',()=>{
 for(const [oldFloor,newFloor]of [[1,1],[3,3],[4,5],[5,6],[8,10],[12,15],[16,20]]){const s=E.createState();s.seals=3;s.best=newFloor;s.bank=456;s.forge.invested.anvil=333;E.startRun(s);s.run.floor=newFloor;E.generateRoom(s);s.run.health=43;s.run.bag=127;s.run.cards={muscle:3};s.run.score.target=28800;s.run.score.points=1234;s.run.score.totalPoints=1234;delete s.campaignVersion;delete s.materials;delete s.run.materials;s.best=oldFloor;s.run.floor=oldFloor;const t=E.restoreState(JSON.stringify(s));assert.ok(t,'floor '+oldFloor);assert.equal(t.run.floor,newFloor);assert.equal(t.best,newFloor);assert.equal(t.run.health,43);assert.equal(t.run.bag,127);assert.equal(t.bank,456);assert.equal(t.forge.invested.anvil,333);assert.deepEqual(t.run.cards,{muscle:3});assert.deepEqual(E.restoreState(JSON.stringify(t)),t);}
});
test('each biome has exclusive creature identities and silhouettes, and generated enemies match their biome',()=>{
 assert.equal(new Set(BIOME_CREATURES.flat().map(c=>c.name)).size,21);for(const type of ['slime','bat','golem'])assert.equal(new Set([0,1,2,3,4,5,6].map(biome=>JSON.stringify(generateAsset(type,{biome}).shapes))).size,7);
 for(const floor of [1,6,11,16,21,26,31]){const s=E.createState();s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);assert.ok(s.run.room.enemies.every(e=>e.species===E.biomeIndex(floor)+':'+e.kind));}
});
test('invalid material wallets and invalid project deposits are rejected on load',()=>{
 for(const bad of [[1,2,3],[-1,0,0,0],[1.5,0,0,0]]){const s=E.createState();s.materials=bad;assert.equal(E.restoreState(JSON.stringify(s)),null);}const s=E.createState();s.forge.materials.anvil=[99999,0,0,0];assert.equal(E.restoreState(JSON.stringify(s)),null);
});
