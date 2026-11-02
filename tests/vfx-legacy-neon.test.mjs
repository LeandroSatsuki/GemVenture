import test from 'node:test';import assert from 'node:assert/strict';
import {Effects} from '../dist/effects.js';
import {P} from '../dist/palette.js';
import {crispAssetEmission,paintCrispAsset} from '../dist/vfx-crisp-assets.js';
import {sampleFamilyEmission} from '../dist/vfx-family.js';
import {minionEmission} from '../dist/minion-effects-player.js';
import {MINION_EFFECTS} from '../dist/minion-vfx-manifest.js';
import {GeodeVfx,geodePieceFrame} from '../dist/geode-vfx.js';
import {rabbitDirtEmission} from '../dist/vfx-actor-emission.js';
import {strikeDirt} from '../dist/rabbit-polished.js';
const project=(x,y)=>({x:100+44*x+4*y,y:115+32*y});
test('remaining yellow procs use crisp facets with no old aura burst, without touching domain events',()=>{
 for(const id of['orb-fury','miniboss-reward','zag-pass','pet-echo','find-full'])for(const soft of[false,true]){
  const fx=new Effects();fx.setSoft(soft);const e=Object.freeze({type:'proc',id,color:P.yellow,x:4,y:5}),packet=JSON.stringify(e);fx.consume([e],project,project(3,5));assert.equal(fx.sprites.items.length,1);assert.equal(fx.particles.length+fx.rings.length,0);fx.update(.2);
  const lights=fx.emissionSources();assert.ok(lights.length>0);assert.ok(lights.some(p=>p.color===P.yellow));assert.equal(JSON.stringify(e),packet);fx.update(1);assert.equal(fx.emissionSources().length,0);
 }
});
test('every generic clip has matching moving light anchors and finite geometry without image loading',()=>{
 const c=new Proxy({globalAlpha:1},{get:(o,k)=>o[k]??((...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n));})});
 for(const id of['impact','aura','reward','shield','explosion'])for(const soft of[false,true]){
  const points=crispAssetEmission(id,100,200,.12,{color:P.yellow,soft});assert.ok(points.length>0);assert.ok(points.every(p=>p.alpha>0&&p.color));assert.equal(paintCrispAsset(c,id,100,200,.12,{color:P.yellow,soft}),true);assert.deepEqual(crispAssetEmission(id,100,200,3,{soft}),[]);
 }
 const a=crispAssetEmission('aura',0,0,.2,{soft:true}),b=crispAssetEmission('aura',0,0,.3,{soft:true});assert.equal(a.length,1);assert.deepEqual([a[0].x,a[0].y],[b[0].x,b[0].y]);
});
test('critical and luck illumination follows actual signature locations instead of the body center',()=>{
 const a=sampleFamilyEmission(P,'critical',.2);assert.equal(a.length,5);assert.ok(a[0].y<-48);assert.equal(sampleFamilyEmission(P,'critical',.2,{soft:true}).length,1);
 const fx=new Effects();fx.consume([{type:'proc',id:'force',color:P.lemon}],project,project(3,5));fx.update(.2);const b=fx.buffAccents[0],points=fx.emissionSources();assert.equal(points.length,5);assert.equal(points[0].x,b.x+a[0].x);assert.equal(points[0].y,b.y+a[0].y);assert.equal(sampleFamilyEmission(P,'luck',.2).length,2);
});
test('minion atlas emissions use their real anchor, material, clip lifetime and quiet residue',()=>{
 for(const spec of MINION_EFFECTS){const p=minionEmission(spec,{x:10,y:20,age:.1})[0];assert.ok(p&&p.radius<=8);assert.ok(spec.colors.includes(p.color));assert.equal(p.y,20-(spec.anchor.y/spec.frameSize-.5)*spec.worldSize);if(!spec.loop)assert.equal(minionEmission(spec,{x:10,y:20,age:spec.clipSeconds}).length,0);}
 const a=MINION_EFFECTS.find(s=>s.kind==='slime-splash'),b=MINION_EFFECTS.find(s=>s.kind==='slime-residue');assert.ok(minionEmission(b,{x:0,y:0,age:.1})[0].alpha<minionEmission(a,{x:0,y:0,age:.1})[0].alpha);
});
test('geode light sources share the native piece trajectory and expire with their event',()=>{
 const fx=new GeodeVfx();fx.consume([{type:'geodeEruption',x:4,y:5}],project,0);assert.equal(fx.effects.length,1);for(const soft of[false,true]){const p=geodePieceFrame(fx.effects[0],fx.effects[0].pieces[0],.1,soft),a=fx.emissionSources(.1,{soft})[0];assert.equal(a.x,p.x);assert.equal(a.y,p.y);assert.deepEqual(fx.emissionSources(.1,{soft}),fx.emissionSources(.1,{soft}));}fx.update(1);assert.equal(fx.emissionSources(1).length,0);
});
test('rabbit lights read the approved dirt geometry with the same projection, beat and reduced option',()=>{
 const p={context:{},carrot:{scheduledBeat:8,target:{x:4,y:5}},phase:8.2,project};for(const soft of[false,true]){const a=rabbitDirtEmission(p,{soft}),parts=strikeDirt(p.carrot,p.phase,soft),q=project(4,5);assert.equal(a.length,parts.length);assert.equal(a[0].x,q.x/2+parts[0].x+parts[0].y/11);assert.equal(a[0].y,q.y/2+parts[0].y*8/11-parts[0].z);assert.deepEqual(rabbitDirtEmission(p,{soft}),a);}assert.equal(rabbitDirtEmission({...p,phase:9}).length,0);assert.equal(rabbitDirtEmission(null).length,0);
});
