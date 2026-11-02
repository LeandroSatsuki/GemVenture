import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {sampleDungeonMotes,DUNGEON_MOTE_SPEC,DUNGEON_NIGHT} from '../dist/dungeon-environment.js';import {DUNGEON_MATERIALS} from '../dist/dungeon-volumes.js';
import {dungeonToolBasis} from '../dist/dungeon-miner.js';import {MINER_CLIPS} from '../dist/dungeon-miner-data.js';import {CRYSTAL_VEIN_RAMPS,crystalVeinShapes} from '../dist/crystal-veins.js';import {sampleRareOre} from '../dist/rare-ore-vfx.js';import {Effects} from '../dist/effects.js';
test('tool axis and readable blade width stay intact while the blade follows authored handedness in every clip',()=>{
 const signs={};for(const [clip,spec]of Object.entries(MINER_CLIPS))for(const [key,s]of Object.entries(spec.sockets))for(const active of [true,false]){
  const g=s[4],a=s[5].slice(0,2).map((v,i)=>(v-g[i])/24),u=s[6].slice(0,2).map((v,i)=>(v-g[i])/8),v=active?a:[a[0]*.4+u[0]*.9165,a[1]*.4+u[1]*.9165],length=Math.hypot(...v),scale=Math.max(.55,length)*.65,b=dungeonToolBasis(s,active),det=b[0]*b[3]-b[1]*b[2];
  assert.ok(b.every(Number.isFinite));assert.ok(Math.abs(b[0]-v[0]/length*scale)<1e-12);assert.ok(Math.abs(b[1]-v[1]/length*scale)<1e-12);assert.ok(b[2]*u[0]+b[3]*u[1]>0,key+' '+clip);assert.ok(Math.abs(Math.hypot(b[2],b[3])-.65)<1e-12);assert.ok(Math.abs(det)>.2);signs[key[0]]=Math.sign(det);
 }assert.deepEqual(signs,{S:-1,W:1,N:1,E:-1});
});
test('ambient motes use the biome color with greater but bounded presence, repeatable phases and a paused clock',()=>{
 const viewport={x:222,y:80,w:630,h:360};assert.ok(DUNGEON_MOTE_SPEC.count>7&&DUNGEON_MOTE_SPEC.count<=24);
 for(let biome=0;biome<7;biome++)for(const seed of [55,1208,41001])for(const time of [0,.4,30,1000]){
  const opts={biome,seed,time,viewport},a=sampleDungeonMotes(opts);assert.equal(a.length,22);assert.deepEqual(a,sampleDungeonMotes(opts));
  for(const p of a){assert.equal(p.color,DUNGEON_MATERIALS[biome].light);assert.ok(p.x>=viewport.x&&p.x<viewport.x+viewport.w);assert.ok(p.y>=viewport.y&&p.y<viewport.y+viewport.h);assert.ok(p.radius<=1.5);assert.ok(p.alpha>=.34&&p.alpha<=.64);}
 }assert.deepEqual(sampleDungeonMotes({soft:true}),[]);assert.deepEqual(sampleDungeonMotes({viewport:{x:0,y:0,w:0,h:10}}),[]);assert.equal(DUNGEON_NIGHT.strength,.9);
});
test('ruby veins, their mission icon, mining sparks and enchanted halo share the new red ramp',async()=>{
 assert.deepEqual(CRYSTAL_VEIN_RAMPS[1],['#ce2029','#9c3824','#591d35','#f27f72']);const a=crystalVeinShapes({variant:1});assert.ok(a.some(s=>s.fill==='#ce2029'));assert.ok(a.every(s=>!['#ab3293','#7f3896','#5e1d5d','#db5ebe'].includes(s.fill)));
 const halo=sampleRareOre({node:{type:'crystal',rare:true,hp:1,kind:1}});assert.equal(halo.color,'#f27f72');const fx=new Effects();fx.crystalSpark(0,0,{kind:1});assert.ok(fx.particles.every(p=>p.color==='#f27f72'));
 const svg=await readFile(new URL('../dist/assets/crystal-veins-v5/vein-1.svg',import.meta.url),'utf8');assert.match(svg,/#ce2029/);assert.doesNotMatch(svg,/#ab3293|#7f3896|#db5ebe/);
});
