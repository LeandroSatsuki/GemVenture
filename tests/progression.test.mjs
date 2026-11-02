import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
function arena(){const s=E.createState(12);E.startRun(s);rectangularRoom(s);Object.assign(s.run.room,{floorMask:null,layout:null,explored:null,visible:null,wave:null,terrain:Array((s.run.room.cols||21)*(s.run.room.rows||15)).fill(0),rocks:[],nodes:[],enemies:[],quota:999});return s;}
test('movement starts at four legal tiles, ranks add speed, unequipping removes it',()=>{
 const s=arena();E.act(s,{type:'move',x:18,y:11},0);assert.equal(s.run.player.x,7);
 E.act(s,{type:'dodge',dx:-1,dy:0},1);assert.equal(s.run.player.x,3);
 s.unlocked=['dash'];s.equipped=['dash'];s.skillRanks.dash=3;
 E.act(s,{type:'move',x:18,y:11},2);assert.equal(s.run.player.x,10);
 s.equipped=[];assert.equal(E.movement(s),4);
 s.run.room.rocks=[{x:11,y:11,hp:10}];E.act(s,{type:'dodge',dx:1,dy:0},3);assert.equal(s.run.player.x,10);
});
test('six skills upgrade to three levels, enforce costs and cannot upgrade underground',()=>{
 for(const id of E.RANKED_SKILLS){
  const s=E.createState(12);s.bank=10000;s.essence=100;s.experience.points=20;s.unlocked=[id];s.equipped=[id];
  for(let rank=1;rank<3;rank++){const cost=E.skillUpgradeCost(s,id),bank=s.bank,ess=s.essence,points=s.experience.points;assert.ok(E.upgradeSkill(s,id));assert.equal(E.skillRank(s,id),rank+1);assert.equal(s.bank,bank);assert.equal(s.essence,ess);assert.equal(s.experience.points,points-cost.points);}
  assert.equal(E.upgradeSkill(s,id),false);
  const copy=E.restoreState(JSON.stringify(s));assert.equal(E.skillRank(copy,id),3);
 }
 const s=E.createState();s.unlocked=['dash'];assert.equal(E.upgradeSkill(s,'dash'),false);s.bank=999;s.essence=99;E.startRun(s);assert.equal(E.upgradeSkill(s,'dash'),false);
});
test('old saves retain learned skills at rank one; malformed rank saves are rejected',()=>{
 const s=E.createState();s.unlocked=['dash'];s.equipped=['dash'];delete s.skillRanks;
 const restored=E.restoreState(JSON.stringify(s));assert.equal(E.skillRank(restored,'dash'),1);assert.equal(E.movement(restored),5);
 for(const ranks of [{dash:4},{dash:-1},{unknown:2},[]])assert.equal(E.restoreState(JSON.stringify({...s,skillRanks:ranks})),null);
});
test('on-beat empty actions sustain rhythm without free mining, area damage or score',()=>{
 const s=arena();s.equipped=['breath','chain','echo'];s.run.rhythm=70;s.run.combo=7;
 const health=s.run.health;E.act(s,{type:'move',x:3,y:11},0);assert.equal(s.run.combo,8);assert.ok(s.run.rhythm>70);assert.equal(s.run.health,health);assert.equal(s.run.score.points,0);assert.equal(s.run.events.some(e=>['wave','echo','hit','loot'].includes(e.type)),false);assert.equal(s.run.events.some(e=>e.type==='perfect'),true);
});
test('stun has gaps even at maximum rank, so enemies get attack opportunities',()=>{
 const s=arena();s.unlocked=['stun'];s.equipped=['stun'];s.skillRanks.stun=3;
 const enemy={id:999,type:'enemy',kind:0,x:4,y:11,hp:100,maxHp:100,stunUntil:-1,windup:null};s.run.room.enemies=[enemy];
 for(let b=0;b<3;b++)E.act(s,{type:'hit',id:999},b);
 assert.equal(enemy.stunUntil,3);E.act(s,{type:'hit',id:999},3);E.act(s,{type:'hit',id:999},4);E.enemyBeat(s,4);assert.ok(enemy.windup);
});
test('resistance and enemy health rise with depth, including upgraded characters',()=>{
 const s=E.createState(712);s.seals=3;E.startRun(s);const first=s.run.room.nodes.find(n=>n.kind===2).maxHp;
 s.run.floor=13;s.level=12;E.generateRoom(s);assert.ok(s.run.room.nodes.find(n=>n.kind===2).maxHp>first);assert.ok(s.run.room.enemies.every(e=>e.maxHp>=29));assert.ok(E.CRYSTALS[2].minHits>=6);
});
