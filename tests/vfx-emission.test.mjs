import test from'node:test';import assert from'node:assert/strict';
import{createMiningPainter as afterMining}from'../dist/mining-vfx.js';
import{Effects}from'../dist/effects.js';
import{paintVfxEmission,vfxEmissionStatus,VFX_EMISSION_SPEC}from'../dist/vfx-emission.js';
import{sampleGeodeParticleLights,PARTICLE_LIGHT_SPEC}from'../dist/geode-particle-light.js';
const project=(x,y)=>({x:100+x*44+y*4,y:115+y*32}),hit=(kind=0)=>({type:'hit',x:4,y:5,damage:3,mineral:{id:1,kind}});
function ctx(){let balance=0;const ops=[],c=new Proxy({globalAlpha:1,globalCompositeOperation:'source-over',save(){balance++;ops.push(['save']);},restore(){assert.ok(--balance>=0);ops.push(['restore']);}},{get:(o,k)=>k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),k);ops.push([k,...args]);},set(o,k,v){o[k]=v;return true;}});return{c,ops,get balance(){return balance;}};}
test('every break shard emits in the mineral color and follows its own lifetime, pause, scroll and reset',()=>{
 const p=afterMining(),packet=[hit(),{type:'loot',x:4,y:5}];p.consume(packet,project,{x:3,y:5},0);const a=p.emissionSources(.2);assert.equal(a.length,7);assert.ok(a.every(s=>s.kind==='mining-fragment'&&s.color==='#2fbfcd'));
 assert.deepEqual(p.emissionSources(.2),a);p.scroll(2,16);const b=p.emissionSources(.2);assert.equal(b[0].x,a[0].x-2);assert.equal(b[0].y,a[0].y-16);assert.equal(p.emissionSources(.2,{soft:true}).length,3);assert.equal(p.emissionSources(.7).length,0);p.clear();assert.equal(p.emissionSources(.2).length,0);
});
test('real Effects mining contacts feed the existing shader sampler without mutating events or spawning particles',()=>{
 const fx=new Effects(),events=[hit(),{type:'loot',x:4,y:5,value:2}],packet=JSON.stringify(events);fx.consume(events,project,project(3,5));fx.update(.12);
 const world={fx,camera:{x:0,y:0},viewWidth:800,viewHeight:600,campaignScene:{biome:0,room:{seed:42}}};const a=sampleGeodeParticleLights(world,{time:.12});assert.ok(a.some(p=>p.kind==='mining-fragment'));assert.equal(fx.particles.length,0);assert.equal(JSON.stringify(events),packet);assert.ok(a.length<=PARTICLE_LIGHT_SPEC.maxLights);fx.clear();assert.equal(fx.emissionSources().length,0);
});
test('dense mixed effects retain a bounded light budget and fully expire',()=>{
 const fx=new Effects();for(let i=0;i<80;i++)fx.consume([{type:'bomb',x:3,y:5},{type:'echo',from:{x:2,y:5},x:3,y:5}],project,project(2,5));assert.ok(fx.emissionSources().length<=VFX_EMISSION_SPEC.maxSources);fx.update(3);assert.equal(fx.emissionSources().length,0);
});
test('local halo cache is bounded and drawing reuses textures without reads, blur or new particles',()=>{
 const prev=globalThis.document;let allocations=0,draws=0;globalThis.document={createElement(){allocations++;return{width:0,height:0,getContext(){return{createRadialGradient:()=>({addColorStop(){}}),fillRect(){}};}};}};
 try{const c=ctx();c.c.drawImage=()=>draws++;const sources=Array.from({length:30},(_,i)=>({x:i*20,y:10,radius:6,alpha:.8,color:'#'+(0x102030+i*0x050403).toString(16).padStart(6,'0')}));paintVfxEmission(c.c,sources,{strength:1});const first=allocations;for(let i=0;i<50;i++)paintVfxEmission(c.c,sources,{strength:1});assert.equal(allocations,first);assert.ok(first<=VFX_EMISSION_SPEC.maxColors);assert.equal(c.balance,0);assert.ok(draws>0);assert.ok(vfxEmissionStatus().bytes<=12*48*48*4);}finally{globalThis.document=prev;}
});

test('soft healing emits only its one real stationary symbol; normal healing keeps three',async()=>{const {createPlayerHeal}=await import('../dist/player-heal-vfx.js');const fx=createPlayerHeal();fx.consume([{type:'heal',value:10}],0);const c=ctx();fx.draw(c.c,{x:100,y:200},.2,{soft:true});assert.equal(fx.emissionSources(.2,{soft:true}).length,1);assert.equal(fx.emissionSources(.2,{soft:false}).length,3);assert.equal(fx.emissionSources(1,{soft:true}).length,0);assert.equal(c.balance,0);});
