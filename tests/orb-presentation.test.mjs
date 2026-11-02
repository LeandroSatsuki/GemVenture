import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun} from '../dist/core.js';import {reveal} from '../dist/cavern.js';import {RUN_ORBS} from '../dist/run-orbs.js';
import {orbPresentationView,orbPauseMarkup,orbSlotMarkup} from '../dist/approved-orb-presentation.js';
test('legacy equipped powers retain real cooldown and hit count without wallet or offer presentation',()=>{
 const s=createState(994);startRun(s);const r=s.run;s.bank=99999;r.bag=2;r.orbs.red='pulse';r.orbs.yellow='brace';r.orbs.blue='lantern';r.orbs.pulseHits=3;r.orbs.guardCooldown=8;const before=structuredClone(s),v=orbPresentationView(r);
 assert.equal(v.bag,undefined);assert.equal(v.offers,undefined);assert.equal(v.slots.length,3);assert.equal(v.slots[0].pulseHits,3);assert.equal(v.slots[1].cooldown,8);assert.match(orbSlotMarkup(v.slots[0]),/3 de 4 golpes/);assert.match(orbSlotMarkup(v.slots[1]),/8 batidas/);assert.deepEqual(s,before);
});
test('pause retains every exact orb effect and correctly excludes disabled modes without resetting powers',()=>{
 const s=createState(994);startRun(s);const r=s.run;for(const o of RUN_ORBS){r.orbs[o.color]=o.id;assert.ok(orbPauseMarkup(r).includes(o.effect));}const before=structuredClone(r.orbs);r.mode='abyss';assert.equal(orbPresentationView(r),null);assert.equal(orbPauseMarkup(r),'');assert.deepEqual(r.orbs,before);r.mode='floors';r.trainingClock={};assert.equal(orbPauseMarkup(r),'');
});
