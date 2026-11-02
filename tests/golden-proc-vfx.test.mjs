import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun,act} from '../dist/core.js';
import {Effects} from '../dist/effects.js';
import {P} from '../dist/palette.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';

const project=(x,y)=>({x:x*20,y:y*20});
const player={x:60,y:220};

test('native force critical replaces the player flame without changing resolved combat',()=>{
 const s=createState(37);startRun(s);rectangularRoom(s);s.equipped=['force'];
 const r=s.run;r.cardHits=4;r.events=[];r.room.quota=9999;r.room.enemies=[];r.room.rocks=[];
 r.room.nodes=[{id:1,type:'crystal',kind:0,x:4,y:11,hp:100,maxHp:100,value:5,born:0}];
 assert.ok(act(s,{type:'hit',id:1},0).ok);
 const critical=r.events.find(e=>e.type==='proc'&&e.id==='force');assert.ok(critical);
 assert.equal(critical.x,undefined);assert.equal(critical.color,P.lemon);
 const before=JSON.stringify(s),f=new Effects();f.consume(r.events,project,player);
 assert.equal(JSON.stringify(s),before);assert.equal(f.buffAccents.length,1);
 assert.deepEqual([f.buffAccents[0].x,f.buffAccents[0].y],[30,110]);
 assert.equal(f.sprites.items.some(e=>e.id==='aura'),false);
 assert.equal(f.rings.some(e=>e.radius===74),false);
 assert.ok(f.labels.some(e=>!e.big));
});

test('critical sources preserve their event anchor and do not replay the same event',()=>{
 for(const id of ['force','talent-critical','lucky']){
  const f=new Effects(),e={type:'proc',id,color:P.yellow,...(id==='lucky'?{x:7,y:8}:{})};
  f.consume([e],project,player);f.consume([e],project,player);
  assert.equal(f.buffAccents.length,1,id);
  assert.deepEqual([f.buffAccents[0].x,f.buffAccents[0].y],id==='lucky'?[70,80]:[30,110]);
  assert.equal(f.sprites.items.length+f.rings.length+f.particles.length,0);
  f.consume([{...e}],project,player);assert.equal(f.buffAccents.length,2);
 }
});

test('gold accents share the existing cap, scroll, expiration and soft cleanup',()=>{
 const f=new Effects();f.consume(Array.from({length:50},()=>({type:'proc',id:'force',color:P.lemon})),project,player);
 assert.equal(f.buffAccents.length,8);
 f.consume([{type:'scroll'}],project,player);
 assert.deepEqual([f.buffAccents[0].x,f.buffAccents[0].y],[28,94]);
 f.update(.9);assert.equal(f.buffAccents.length,0);
 f.setSoft(true);f.consume([{type:'proc',id:'talent-critical',color:P.lemon}],project,player);
 assert.equal(f.buffAccents.length,1);assert.equal(f.sprites.items.length,0);
 f.clear();assert.equal(f.buffAccents.length,0);
});

test('yellow laser procs retain their approved dedicated renderer',()=>{
 const f=new Effects();f.consume([{type:'proc',id:'laser',color:P.yellow,x:7,y:8}],project,player);
 assert.equal(f.buffAccents.length,0);assert.equal(f.sprites.items.length,0);
});
