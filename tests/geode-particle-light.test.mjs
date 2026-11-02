import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleGeodeParticleLights,PARTICLE_LIGHT_SPEC} from '../dist/geode-particle-light.js';
const world=()=>({campaignScene:{biome:0,room:{seed:712}},camera:{x:0,y:0},viewWidth:1400,viewHeight:800,fx:{particles:[]}});
test('particle light follows existing samples and live spark positions without mutating or emitting particles',()=>{
 const w=world();w.fx.particles=[{x:100,y:200,life:.5,total:1,color:'#ff5748'}];const before=JSON.stringify(w),s=sampleGeodeParticleLights(w,{time:4});
 assert.equal(s[0].x,100);assert.equal(s[0].y,200);assert.equal(s[0].color,'#ff5748');assert(s.length>1);assert.equal(JSON.stringify(w),before);assert.deepEqual(s,sampleGeodeParticleLights(w,{time:4}));
 w.fx.particles[0].life=0;assert.equal(sampleGeodeParticleLights(w,{time:4}).some(p=>p.color==='#ff5748'),false);
});
test('soft mode removes ambient motes, halves live spark light and all lights have bounded count and local overlap',()=>{
 const w=world();assert.equal(sampleGeodeParticleLights(w,{soft:true}).length,0);
 w.fx.particles=Array.from({length:500},()=>({x:100,y:200,life:1,total:1,color:'invalid'}));
 const s=sampleGeodeParticleLights(w,{time:4,fallbackColor:'#ffcf30'}),soft=sampleGeodeParticleLights(w,{soft:true});
 assert(s.length<=PARTICLE_LIGHT_SPEC.maxLights);assert(soft.length<=PARTICLE_LIGHT_SPEC.maxSparks);assert.equal(s[0].color,'#ffcf30');assert.equal(soft[0].alpha,s[0].alpha*.5);assert(s.filter(p=>p.x===100).reduce((sum,p)=>sum+p.alpha,0)<=3.01);assert.equal(PARTICLE_LIGHT_SPEC.alpha,.06);
});
