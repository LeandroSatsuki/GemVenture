import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {FORGE_PROJECTS,createForge,forgeProject,depositForge,craftForge} from '../dist/forge.js';
function base(){const s=E.createState(713);s.bank=1000000000;s.best=20;s.materials=[1000000000,1000000000,1000000000,1000000000];return s;}
function craft(s,id){const p=forgeProject(s,id);while(!forgeProject(s,id).ready)assert.ok(depositForge(s,id,p.cost)>0);assert.ok(craftForge(s,id));}
test('four projects fund incrementally without granting early benefits; final construction pays once',()=>{
 assert.equal(FORGE_PROJECTS.length,4);const s=base(),bank=s.bank;
 assert.equal(depositForge(s,'anvil',200),320);assert.equal(s.bank,bank-200);assert.equal(E.power(s),1);assert.equal(craftForge(s,'anvil'),false);
 assert.equal(depositForge(s,'anvil',99999),400);assert.equal(s.bank,bank-600);assert.equal(depositForge(s,'anvil'),0);assert.ok(craftForge(s,'anvil'));
 assert.equal(E.power(s),1.005);assert.equal(craftForge(s,'anvil'),false);assert.equal(s.bank,bank-600);assert.equal(forgeProject(s,'anvil').invested,0);assert.equal(forgeProject(s,'anvil').cost,1800);
});
test('deposits enforce balances, floor gates, safe amounts and base-only use',()=>{
 const s=E.createState();assert.equal(depositForge(s,'armor',100),0);assert.equal(depositForge(s,'anvil',500),30);assert.equal(s.bank,0);assert.equal(depositForge(s,'anvil'),0);
 s.bank=1000;for(const amount of [-1,0,NaN,Infinity,1.5,'100'])assert.equal(depositForge(s,'anvil',amount),0);assert.equal(depositForge(s,'unknown',100),0);
 E.startRun(s);assert.equal(depositForge(s,'anvil',100),0);assert.equal(craftForge(s,'anvil'),false);assert.equal(s.bank,1000);
});
test('all projects have 100 increasingly costly gated ranks and stop charging when complete',()=>{
 for(const project of FORGE_PROJECTS){const s=base();for(let rank=0;rank<100;rank++){const p=forgeProject(s,project.id);assert.equal(p.level,rank);if(rank)assert.ok(p.cost>project.costs[rank-1]);craft(s,project.id);}const bank=s.bank;assert.ok(forgeProject(s,project.id).complete);assert.equal(depositForge(s,project.id,10000),0);assert.equal(craftForge(s,project.id),false);assert.equal(s.bank,bank);}
});
test('investment and benefits survive reload and death; legacy saves get empty projects',()=>{
 const s=base();craft(s,'anvil');depositForge(s,'armor',333);const restored=E.restoreState(JSON.stringify(s));assert.deepEqual(restored.forge,s.forge);
 E.startRun(restored);E.finishRun(restored,'death');assert.equal(E.power(restored),1.005);assert.equal(restored.forge.invested.armor,333);
 const legacy=JSON.parse(JSON.stringify(s));delete legacy.forge;assert.deepEqual(E.restoreState(JSON.stringify(legacy)).forge,createForge());
 for(const [field,value]of [['levels',-1],['levels',101],['invested',-20],['invested',999999]]){const bad=structuredClone(s);bad.forge[field].anvil=value;assert.equal(E.restoreState(JSON.stringify(bad)),null);}
});
test('anvil boosts actual attacks and alchemist boosts actual tonic healing',()=>{
 const s=base();craft(s,'anvil');craft(s,'tonic');E.startRun(s);const r=s.run;r.room.rocks=[];r.room.enemies=[];r.room.quota=999;r.room.nodes=[{id:999,type:'crystal',kind:0,x:4,y:11,hp:100,maxHp:100,value:1,born:0}];
 E.act(s,{type:'hit',id:999},0);assert.equal(r.room.nodes[0].hp,98.995);r.health=20;r.items.tonic=1;E.act(s,{type:'item',item:'tonic'},1);assert.equal(r.health,45.15);assert.equal(r.items.tonic,0);
});
test('armor reduces enemy attacks, stacks with cards and does not erase rhythm penalties',()=>{
 const s=base();craft(s,'armor');E.startRun(s);const r=s.run;r.cards={shell:1};r.room.rocks=[];r.room.nodes=[];r.room.enemies=[{id:999,type:'enemy',kind:2,x:4,y:11,hp:100,maxHp:100,stunUntil:-1,windup:{x:3,y:11,radius:0,beat:4}}];r.acted=4;E.tick(s,4);
 assert.ok(Math.abs(r.health-(100-22.4*.35*.997*.85))<1e-8);const before=r.health;E.act(s,{type:'move',x:2,y:11},5.45);assert.equal(r.health,before);assert.equal(r.rhythm,87.5);
});
test('vault protects real loot on death or retreat, while safe returns still keep everything',()=>{
 for(const reason of ['death','retreat','return']){const s=base();for(let i=0;i<3;i++)craft(s,'vault');const bank=s.bank;E.startRun(s);s.run.floor=6;s.run.bag=101;E.finishRun(s,reason);const kept=reason==='return'?101:51;assert.equal(s.lastResult.kept,kept);assert.equal(s.bank,bank+kept);assert.equal(E.finishRun(s,reason),false);assert.equal(s.bank,bank+kept);}
});
