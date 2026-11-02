import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';

test('first-floor waves leave a reaction window before arrival and keep overlap bounded',()=>{
 const s=E.createState(712);assert.ok(E.startRun(s));const r=s.run;
 r.room.enemies=[];r.room.nodes=[];r.frenzy=null;r.guardUntil=10000;
 function advance(beat){r.events=[];r.acted=beat;E.tick(s,beat);return r.events;}
 assert.equal(r.room.wave.next,40);
 assert.ok(advance(34).some(e=>e.type==='waveWarning'));assert.equal(r.room.enemies.length,0);
 advance(39);assert.equal(r.room.enemies.length,0);
 assert.ok(advance(40).some(e=>e.type==='horde'));assert.equal(r.room.wave.number,1);assert.ok(r.room.enemies.length<=1);assert.equal(r.room.wave.next,80);
 for(const beat of [80,120,160,200]){advance(beat);assert.ok(r.room.enemies.filter(e=>e.hp>0).length<=3);}
 assert.equal(r.bag,0,'waiting for waves cannot pay passive coins');
});

test('loading an already pending opening wave preserves its deadline and purchased progression',()=>{
 const s=E.createState(43);assert.ok(E.startRun(s));s.run.room.wave.next=36;s.level=12;s.core=6;s.forge.levels.armor=3;s.bank=887;s.materials=[61,42,23,14];
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(t.run.room.wave.next,36);assert.equal(t.level,12);assert.equal(t.core,6);assert.deepEqual(t.forge,s.forge);assert.equal(t.bank,887);assert.deepEqual(t.materials,s.materials);assert.deepEqual(t.run.room.nodes,s.run.room.nodes);
});
