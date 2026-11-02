import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MINION_EFFECTS} from '../dist/minion-vfx-manifest.js';
import {minionEffectFrame} from '../dist/minion-effects-player.js';
import {createState,startRun,act,tick,enemyBeat} from '../dist/core.js';

test('minion effect sources match the approved bodies; all 48 atlases retain original hashes',async()=>{
 const {APPROVED_ART}=await import('../dist/approved-art-manifest.js');
 const hashes=JSON.parse(await readFile(new URL('../dist/assets/minion-vfx/SHA256.json',import.meta.url)));
 assert.equal(MINION_EFFECTS.length,42);assert.equal(hashes.length,48);
 for(const e of MINION_EFFECTS){assert.equal(e.sourceSha256,APPROVED_ART.find(a=>a.file===e.sourceAsset).sha256);assert.equal(e.gameplayAuthority,false);assert.equal(e.reward,false);assert.deepEqual(e.anchor,{x:48,y:68});}
 for(const h of hashes){const bytes=await readFile(new URL('../dist/assets/minion-vfx/'+h.path.replaceAll('\\','/'),import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),h.sha256.toLowerCase());}
});

test('finite death clips end; offensive loops stay external to lifetime and never become decorative damage',()=>{
 for(const e of MINION_EFFECTS){assert.equal(minionEffectFrame(e,-1),null);assert.equal(minionEffectFrame(e,NaN),null);assert.equal(minionEffectFrame(e,0).index,0);
  if(!e.loop)assert.equal(minionEffectFrame(e,e.clipSeconds),null);else{assert.equal(e.kind,'slime-offensive');assert.equal(minionEffectFrame(e,e.clipSeconds).index,0);assert.equal(minionEffectFrame(e,3,{lifetimeSeconds:3}),null);}}
});

test('real kills carry species metadata once and offensive puddles have their own source/expiry',()=>{
 const make=kind=>{const s=createState(712);startRun(s);rectangularRoom(s);const r=s.run;r.room.wave=null;r.room.minBeats=999;r.room.rocks=[];r.room.nodes=[{id:999,type:'crystal',kind:0,x:10,y:10,hp:100,maxHp:100}];r.player={x:3,y:11};r.room.enemies=[{id:500,type:'enemy',kind,x:4,y:11,hp:1,maxHp:1,windup:null,stunUntil:-1}];r.events=[];return s;};
 for(const kind of [0,1,2]){const s=make(kind);act(s,{type:'hit',id:500},0);const kill=s.run.events.filter(e=>e.type==='kill');assert.equal(kill.length,1);assert.deepEqual(kill[0].minion,{id:500,kind,biome:0});assert.equal(s.run.room.hazards.length,0,'death does not create a damaging puddle');act(s,{type:'hit',id:500},0);assert.equal(s.run.events.filter(e=>e.type==='kill').length,1);}
 const s=make(0);s.run.room.enemies[0].hp=10;enemyBeat(s,4);const due=s.run.room.enemies[0].windup.beat;s.run.acted=due;tick(s,due);const h=s.run.room.hazards[0];assert.ok(h.id.startsWith('slime:500:'));assert.equal(h.sourceId,500);assert.equal(h.biome,0);assert.equal(h.until-h.born,3);
});

test('loader decodes sequentially with bounded cache; deaths deduplicate, freeze and follow abyss scroll',async()=>{
 const before=globalThis.Image;let pending=0,peak=0,loads=0;
 globalThis.Image=class{set src(url){loads++;pending++;peak=Math.max(peak,pending);queueMicrotask(()=>{pending--;this.naturalWidth=384;this.naturalHeight=288;this.onload?.();});}};
 try{const api=await import('../dist/minion-effects.js?cache-qa');for(let biome=0;biome<7;biome++){await api.loadMinionEffects(biome,false);assert.ok(api.minionVfxStatus().ready<=12);}assert.equal(peak,1);assert.ok(api.minionVfxStatus().bytes<=5308416);
  const fx=new api.MinionEffects();await fx.setContext(6);const event={x:4,y:5,minion:{id:8,kind:0,biome:6}},project=(x,y)=>({x:x*44,y:y*32});
  assert.equal(fx.death(event,project),true);assert.equal(fx.items.length,2);assert.equal(fx.death(event,project),true);assert.equal(fx.items.length,2);
  const original=structuredClone(fx.items);fx.update(0);assert.deepEqual(fx.items,original);fx.scroll(2,16);assert.equal(fx.items[0].x,original[0].x-2);assert.equal(fx.items[0].y,original[0].y-16);
  fx.update(.35);assert.deepEqual(fx.items.map(i=>i.spec.kind),['slime-residue']);fx.update(.4);assert.equal(fx.items.length,0);
  assert.equal(fx.death({x:0,y:0},project),false,'boss and untagged legacy effects stay on their existing path');
  for(let i=0;i<150;i++)fx.death({...event,minion:{...event.minion,id:100+i}},project);assert.ok(fx.items.length<=48);assert.ok(fx.seen.size<=96);
  const count=loads;const c={save(){},restore(){},drawImage(){},globalAlpha:1};for(let i=0;i<100;i++)fx.draw(c);assert.equal(loads,count,'drawing never creates images');
  fx.setSoft(true);await fx.setContext(6,true);assert.ok(fx.items.length<=16);assert.ok(api.minionVfxStatus().ready<=12);fx.clear();assert.equal(fx.items.length,0);
  const {Effects}=await import('../dist/effects.js'),effects=new Effects();await effects.minions.setContext(0,false);
  effects.consume([{type:'hit',x:4,y:5,damage:1},{type:'kill',x:4,y:5,value:6,minion:{id:900,kind:0,biome:0}}],project,{x:0,y:0});
  assert.equal(effects.minions.items.length,2);assert.equal(effects.particles.length,0,'generic fatal-hit burst does not obscure the small splash');assert.equal(effects.sprites.items.length,0,'death is not duplicated by a reward or impact sprite');assert.equal(effects.labels.length,2);assert.ok(effects.labels.some(l=>l.text==='+6 ◇'),'real loot amount remains visible');
  effects.consume([{type:'kill',x:4,y:5,value:0,minion:{id:901,kind:1,biome:0}}],project,{x:0,y:0});assert.equal(effects.labels.length,2,'no invented +4 for zero-valued kills');
 }finally{globalThis.Image=before;}
});
