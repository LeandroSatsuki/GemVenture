import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {validateLayout,isFloor} from '../dist/cave-layout.js';
import {expeditionDistances} from '../dist/campaign-cave-expedition.js';
import {campaignEnemySpawn} from '../dist/campaign-cave-layout.js';
import {CAMPAIGN_CAVE_ART} from '../dist/campaign-cave-data.js';
import {ceilingTick} from '../dist/cave-ceiling.js';
function game(floor,seed=712){const s=E.createState(seed);s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);return s;}
test('all seven biomes and all common floors use the approved connected expedition with deep wall burrows',()=>{
 for(let biome=0;biome<7;biome++)for(let offset=1;offset<=4;offset++){
  const s=game(biome*5+offset),r=s.run.room;assert.equal(r.cols,160);assert.equal(r.rows,108);assert.ok(validateLayout(r));assert.equal(r.layout.rooms.filter(v=>v.kind==='main').length,15);assert.equal(r.layout.rooms.filter(v=>v.kind==='side').length,3);
  const {dist}=expeditionDistances(r,s.run.player);assert.equal(r.floorMask.filter(Boolean).length,Array.from(dist).filter(v=>v>=0).length);assert.ok(r.layout.burrowDistance>=180);assert.ok(r.layout.rooms.every(v=>dist[v.y*r.cols+v.x]>=0));assert.ok(r.nodes.every(v=>Number.isSafeInteger(v.id)&&isFloor(r,v.x,v.y)));assert.ok(r.nodes.slice(0,3).every(v=>E.distance(v,s.run.player)<=6));
  const p=campaignEnemySpawn(r,s.run.player,E.rng(19));assert.ok(p&&dist[p.y*r.cols+p.x]>=7&&dist[p.y*r.cols+p.x]<=24);assert.equal(r.campaignCave.biome,biome);
 }
});
test('each boss has its original living boss, connected paving, integrated burrow and four color-matched braziers',()=>{
 for(let biome=0;biome<7;biome++){const s=game(biome*5+5),r=s.run.room;assert.ok(r.enemies.some(e=>e.boss&&e.hp>0));assert.equal(r.floorMask.filter(Boolean).length,379);assert.ok(validateLayout(r));assert.equal(CAMPAIGN_CAVE_ART[biome].arena.props.filter(p=>p.brazier).length,4);assert.deepEqual(r.layout.burrow,{x:10,y:0});assert.ok(r.nodes.every(n=>isFloor(r,n.x,n.y)));assert.ok(E.restoreState(JSON.stringify(s)));}
});
test('versioned expedition saves retain damage, depletion and room geography; malformed dimensions and marker mismatches fail',()=>{
 const s=game(1),r=s.run.room;r.nodes[0].hp=1;const removed=r.nodes.pop().id;const raw=JSON.stringify(s),restored=E.restoreState(raw);assert.ok(restored);assert.deepEqual(restored.run.room,r);assert.equal(restored.run.room.nodes.some(n=>n.id===removed),false);
 for(const mutate of [r=>r.cols=42,r=>r.campaignCave.biome=4,r=>r.layout.burrow.x=-2,r=>r.layout.rooms[0].rx=1000]){const forged=JSON.parse(raw);mutate(forged.run.room);assert.equal(E.restoreState(JSON.stringify(forged)),null);}
});
test('giant caves retain nearby three-beat rockfall warnings with the original bounded stock',()=>{
 const s=game(1),run=s.run,r=run.room;r.nodes=[];r.rocks=[];r.enemies=[];let warning;
 for(let beat=24;beat<240&&!warning;beat+=24){ceilingTick(run,beat,E.rng(beat));warning=r.ceiling.falls[0];}
 assert.ok(warning);assert.ok(E.distance(warning,run.player)<=18);assert.equal(warning.due-warning.born,3);assert.ok(r.ceiling.budget===12);
});
