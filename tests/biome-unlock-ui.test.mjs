import test from 'node:test';import assert from 'node:assert/strict';
import {createState,purchaseSeal,SEALS} from '../dist/core.js';
import {biomeUnlockView} from '../dist/approved-biome-unlock.js';
import {canStartAt} from '../dist/descent-progress.js';
import {earnedStars} from '../dist/refuge-journey.js';
function fixture(seals,best,stars){const s=createState(994);s.seals=seals;s.best=best;s.journey.earnedStars=stars;let left=stars;for(let i=1;left;i++){s.floorStars[i]=Math.min(5,left);left-=s.floorStars[i];}return s;}
test('each biome requirement reads permanent stars; opening spends no wallet or materials and releases the native first stop',()=>{
 for(let i=0;i<SEALS.length;i++){const requirement=SEALS[i],s=fixture(i,requirement.floor,requirement.stars),before=structuredClone(s),v=biomeUnlockView(s);assert.equal(v.name,requirement.name);assert.equal(v.enabled,true);assert.equal(v.percent,100);assert.equal(v.floorDone,true);assert.equal(v.starsDone,true);assert.equal(s.stars,0);assert.equal(v.earnedStars,earnedStars(s));assert.deepEqual(s,before);assert.equal(purchaseSeal(s),true);assert.equal(s.seals,i+1);assert.deepEqual(s.materials,before.materials);assert.equal(s.bank,before.bank);assert.equal(s.stars,before.stars);assert.equal(earnedStars(s),earnedStars(before));assert.equal(canStartAt(s,(i+1)*5+1),true);}
});
test('floor and campaign stars are independent requirements; active runs and completed catalogue cannot open another biome',()=>{
 const floor=biomeUnlockView(fixture(0,4,3));assert.equal(floor.bestCode,'1–4');assert.equal(floor.requiredCode,'1–5');assert.equal(floor.nextCode,'2–1');assert.equal(floor.floorDone,false);assert.equal(floor.starsDone,true);assert.equal(floor.enabled,false);
 const stars=biomeUnlockView(fixture(0,5,2));assert.equal(stars.floorDone,true);assert.equal(stars.starsDone,false);assert.equal(stars.enabled,false);assert.ok(stars.percent>66&&stars.percent<67);const s=fixture(0,5,3);s.run={};assert.equal(biomeUnlockView(s).enabled,false);s.run=null;s.seals=SEALS.length;assert.equal(biomeUnlockView(s),null);
});
