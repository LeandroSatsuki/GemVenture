import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {openingBalance} from '../dist/balance.js';
import {wavePlan} from '../dist/cavern.js';
import {pickRecipe} from '../dist/materials.js';
import {playNoviceFloor} from './novice-player.mjs';

test('starter materials and horde pressure rise through four teaching floors',()=>{
 const snapshots=[];
 for(const floor of [1,2,3,4,6]){
  const s=E.createState(712);s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);
  const n=s.run.room.nodes.find(n=>n.kind===0);
  snapshots.push({health:openingBalance(s.run).enemyHealth,crystal:n.hp,damage:openingBalance(s.run).incoming,cap:wavePlan(floor,1).cap});
  assert.ok(s.run.room.minBeats>=96);assert.equal(n.hp,({1:2,2:3,3:5,4:7})[floor]??E.CRYSTALS[0].hp+Math.floor((floor-1)*1.1));
  if(floor===1)assert.ok(s.run.room.enemies.every(e=>e.hp===6));
  for(let beat=0;beat<3;beat++)E.act(s,{type:'hit',id:n.id},beat);
  if(floor===1)assert.equal(n.hp,0);
 }
 for(let i=1;i<snapshots.length;i++)for(const key of ['health','crystal','damage','cap'])assert.ok(snapshots[i][key]>=snapshots[i-1][key],key);
 assert.equal(snapshots.at(-1).damage,1);
});
test('early danger deals about eight life instead of twenty-two; a hit still breaks the combo',()=>{
 const s=E.createState(712);E.startRun(s);rectangularRoom(s);const r=s.run;r.room.rocks=[];r.room.nodes=[];r.room.wave=null;r.room.terrain.fill(0);r.room.enemies=[{id:999,type:'enemy',kind:0,x:4,y:11,hp:6,maxHp:6,stunUntil:-1,windup:{x:3,y:11,beat:4,radius:0}}];r.acted=4;r.combo=12;
 E.tick(s,4);assert.ok(Math.abs(r.health-92.16)<1e-8);assert.equal(r.combo,0);assert.equal(r.rhythm,100);
});
test('death/retreat protect 80, 75, 68 and 60 percent early, then preserve the normal late risk',()=>{
 for(const reason of ['death','retreat'])for(const [floor,kept]of [[1,80],[2,75],[3,68],[4,60],[6,50]]){
  const s=E.createState(31);s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);s.run.bag=100;s.run.materials=[100,1,0,20];const bank=s.bank;
  const saved=E.restoreState(JSON.stringify(s));assert.ok(saved);E.finishRun(saved,reason);
  assert.equal(saved.bank,bank+kept);assert.equal(saved.materials[0],kept);assert.equal(saved.materials[1],floor<5?1:0);
  assert.equal(E.finishRun(saved,reason),false);assert.equal(saved.bank,bank+kept);
 }
 const s=E.createState(31);s.forge.levels.vault=3;E.startRun(s);s.run.materials=[400,0,0,0];E.finishRun(s,'death');assert.equal(s.materials[0],323);
});
test('first permanent improvement is funded by actual early mining and a defeated creature',()=>{
 const s=E.createState(99);E.startRun(s);const r=s.run;r.room.explored=null;r.room.visible=null;r.room.rocks=[];r.room.wave=null;r.room.enemies=[];r.room.quota=999;
 r.room.nodes=[{id:901,type:'crystal',kind:0,x:4,y:11,hp:3,maxHp:3,value:5,born:0},{id:902,type:'crystal',kind:0,x:4,y:10,hp:3,maxHp:3,value:5,born:0},{id:903,type:'crystal',kind:1,x:5,y:11,hp:7,maxHp:7,value:16,born:0}];
 let beat=0;for(const n of r.room.nodes)while(n.hp>0)E.act(s,{type:'hit',id:n.id},beat++);
 r.room.enemies=[{id:904,type:'enemy',kind:0,x:r.player.x+1,y:r.player.y,hp:6,maxHp:6,stunUntil:-1,windup:null}];
 for(let i=0;i<6;i++)E.act(s,{type:'hit',id:904},beat++);
 E.finishRun(s,'death');assert.ok(s.bank>=35);const wallet=[...s.materials],bank=s.bank,recipe=pickRecipe(s);assert.ok(E.purchaseUpgrade(s));assert.equal(s.level,2);assert.equal(s.bank,bank-35);assert.deepEqual(s.materials,wallet.map((n,i)=>n-recipe[i]));
});
test('a novice with imperfect timing clears the first floor without a preloaded build',()=>{
 for(const seed of [43,71,88,123]){const s=E.createState(seed);E.startRun(s);const result=playNoviceFloor(s);assert.ok(result.cleared,'seed '+seed);assert.ok(result.misses>0);assert.ok(result.beats>0&&result.beats<300);assert.ok(s.run.health>0);assert.equal(s.level,1);}
});
test('the introduction cannot leak its protection into the infinite Abyss',()=>{
 const r={mode:'abyss',floor:1};assert.equal(openingBalance(r).incoming,1);assert.equal(openingBalance(r).enemyHealth,1);assert.equal(openingBalance(r).salvageBonus,0);
});
