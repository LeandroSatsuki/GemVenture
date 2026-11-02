import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun,generateRoom,act,enemyBeat,CRYSTALS,rng} from '../dist/core.js';
import {biomeMineral,floorMinerals,rollMineral} from '../dist/materials.js';import {frenzyTick} from '../dist/frenzy.js';
import {Effects} from '../dist/effects.js';import {sampleRareOre,paintRareOre} from '../dist/rare-ore-vfx.js';import {CRYSTAL_VEIN_RAMPS} from '../dist/crystal-veins.js';
test('rare creation chooses the biome mineral before spawning, with the original timer and multiplier',()=>{
 for(let biome=0;biome<7;biome++)for(let local=1;local<=5;local++)for(const seed of [55,41001,1208]){
  const floor=biome*5+local,s=createState(seed);s.seals=6;startRun(s);s.run.floor=floor;generateRoom(s);const r=s.run;
  r.room.cleared=false;r.room.bossFloor=false;r.frenzy.nextQuest=0;r.frenzy.lastBeat=-1;r.frenzy.quest=null;r.events=[];
  const nativeCalls=[];const api={spawnCrystal(_s,_rand,kind){nativeCalls.push(kind);const def=CRYSTALS[kind],node={id:900,type:'crystal',kind,hp:def.hp,maxHp:def.hp,value:def.value,x:2,y:2};r.room.nodes.push(node);r.events.push({type:'sprout',x:2,y:2,color:def.color});return node;},walkable(){return true;},awardScore(){}};
  frenzyTick(s,0,api);const n=r.room.nodes.at(-1),q=r.frenzy.quest;
  assert.deepEqual(nativeCalls,[biomeMineral(floor)]);assert.equal(n.kind,[0,3,2,1,3,2,3][biome]);assert.equal(n.hp,CRYSTALS[n.kind].hp);assert.equal(n.value,CRYSTALS[n.kind].value*3);assert.equal(n.rareUntil,48);assert.equal(q.until,48);assert.equal(r.frenzy.nextQuest,72);
  const sprout=r.events.find(e=>e.type==='sprout');assert.equal(sprout.color,CRYSTALS[n.kind].color);assert.equal(sprout.x,n.x);assert.equal(sprout.y,n.y);
 }
});
test('all damaging crystal hits carry their own kind and a failed hit emits no spark source',()=>{
 for(let kind=0;kind<4;kind++){
  const s=createState(712);startRun(s);rectangularRoom(s);const r=s.run;r.player={x:3,y:11};r.room.rocks=[];r.room.enemies=[];r.room.quota=999;r.frenzy.nextQuest=1000;r.events=[];
  r.room.nodes=[{id:999,type:'crystal',kind,x:4,y:11,hp:100,maxHp:100,value:20,born:0}];assert.ok(act(s,{type:'hit',id:999},0).ok);
  const hit=r.events.find(e=>e.type==='hit');assert.deepEqual(hit.mineral,{id:999,kind,rare:false});const fx=new Effects();fx.consume([hit],(x,y)=>({x:x*44,y:y*32}),{x:0,y:0});assert.equal(fx.particles.length,0);assert.equal(fx.rings.length,0);assert.equal(fx.mining.status(fx.age).active,1);assert.equal(fx.mining.status(fx.age).breaks,0);
  r.events=[];act(s,{type:'hit',id:999},0);assert.ok(!r.events.some(e=>e.type==='hit'));
 }
});
test('mining sparks expire, remain bounded, freeze on update zero and reduce motion without yellow/white fallback',()=>{
 for(let kind=0;kind<4;kind++){const f=new Effects();f.crystalSpark(20,30,{kind,id:5});const before=structuredClone(f.particles);f.update(0);assert.deepEqual(f.particles,before);f.update(.5);assert.equal(f.particles.length,0);f.setSoft(true);f.crystalSpark(20,30,{kind});assert.equal(f.particles.length,2);assert.ok(f.particles.every(p=>p.color===CRYSTAL_VEIN_RAMPS[kind][3]));for(let i=0;i<200;i++)f.crystalSpark(20,30,{kind,id:i});assert.ok(f.particles.length<=80);}
});
test('enchanted ore has a color-matched bounded halo, asynchronous glints and a stationary soft pose',()=>{
 for(let kind=0;kind<4;kind++){const node={id:8,type:'crystal',rare:true,kind,hp:20},a=sampleRareOre({node,time:.7,width:36});assert.equal(a.color,CRYSTAL_VEIN_RAMPS[kind][3]);assert.equal(a.glints.length,3);assert.ok(a.radius*2<60);assert.notEqual(a.glints[0].alpha,a.glints[1].alpha);assert.deepEqual(sampleRareOre({node,time:0,soft:true}),sampleRareOre({node,time:99,soft:true}));assert.equal(sampleRareOre({node:{...node,hp:0}}),null);assert.equal(sampleRareOre({node:{...node,rare:false}}),null);}
});
test('rare glow restores Canvas state and uses finite native coordinates',()=>{
 let balance=0,calls=0;const ctx=new Proxy({globalAlpha:.5,save(){balance++;},restore(){balance--;},createRadialGradient(...a){assert.ok(a.every(Number.isFinite));return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(...a)=>{calls++;for(const n of a)if(typeof n==='number')assert.ok(Number.isFinite(n));}});
 assert.ok(paintRareOre(ctx,{node:{id:1,type:'crystal',kind:2,rare:true,hp:10},x:10,y:20,time:1}));assert.equal(balance,0);assert.ok(calls>10);
});
