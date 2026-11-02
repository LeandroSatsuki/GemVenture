import test from 'node:test';
import assert from 'node:assert/strict';
import {createRefugeHoverMotion} from '../dist/refuge-presentation.js';

test('roulette turns once on pointer or focus entry, completes after leaving and rests without autonomous spins',()=>{
 const motion=createRefugeHoverMotion();assert.equal(motion.sample(15,false),0);assert.equal(motion.sample(35,false),0);
 assert.equal(motion.sample(35,true),0);const angle=motion.sample(36,true);assert.ok(angle>0&&angle<Math.PI*2);
 assert.equal(motion.sample(36,true),angle,'a stopped visual clock cannot advance the wheel');
 const leaving=motion.sample(36.5,false);assert.ok(leaving>angle);assert.equal(motion.sample(38,false),0);
 assert.equal(motion.sample(60,false),0);motion.sample(61,true);assert.ok(motion.sample(62,true)>0);assert.equal(motion.sample(70,true),0,'remaining hovered does not trigger a new turn');
});

test('reduced motion keeps the wheel fixed and re-enabling motion starts smoothly',()=>{
 const motion=createRefugeHoverMotion();motion.sample(0,true);assert.ok(motion.sample(1,true)>0);
 assert.equal(motion.sample(1,true,true),0);assert.equal(motion.sample(100,true,true),0);
 assert.equal(motion.sample(100,true,false),0);assert.ok(motion.sample(101,true,false)>0);
});
