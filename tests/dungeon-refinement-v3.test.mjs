// Legacy encounter fixtures preserve in-progress save compatibility; see geode-crown-official.test.mjs for fresh Coroa Fraturada arenas.
import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun,generateRoom,enemyBeat,tick} from '../dist/core.js';
import {GeodePresentation} from '../dist/geode-presentation.js';
import {geodeArticulation} from '../dist/geode-articulation.js';
import {buildBossArena} from '../dist/boss-arena.js';
import {isFloor} from '../dist/cave-layout.js';
import {bossImpactCues,createBossImpactAudio} from '../dist/boss-impact-audio.js';
import {dungeonToolBasis} from '../dist/dungeon-miner.js';
import {MINER_CLIPS} from '../dist/dungeon-miner-data.js';
import {dungeonPickaxeFaces,PICKAXE_METALS} from '../dist/dungeon-pickaxe.js';
import {pickaxePreview} from '../dist/pickaxe-art.js';
import {APPROVED_CRT} from '../dist/screen-finish.js';
import {DUNGEON_NIGHT} from '../dist/dungeon-environment.js';

test('Geode articulation has distinct preparation/release and a still reduced-motion pose',()=>{
 const idle=geodeArticulation({ambient:1}),charge=geodeArticulation({state:'pillar-charge',progress:.95}),hit=geodeArticulation({state:'pillar-impact',age:0});
 assert.ok(charge.left>idle.left+.3);assert.ok(charge.right<idle.right-.4);assert.ok(hit.left<0&&hit.right>0);
 for(const state of ['idle','pillar-charge','pulse-charge','pillar-impact','pulse-impact'])for(let i=0;i<40;i++){
  const args={state,progress:i/39,age:i/39,ambient:i/3};const p=geodeArticulation(args);assert.deepEqual(p,geodeArticulation(args));assert.ok(Object.values(p).every(Number.isFinite));assert.deepEqual(geodeArticulation({...args,soft:true}),{left:0,right:0,lift:0,lean:0,core:0});
 }
});
test('real Geode attack drives anticipation and impact without changing combat',()=>{
 const s=createState(41001);startRun(s);s.run.floor=5;generateRoom(s);delete s.run.room.enemies[0].crown;s.run.room.enemies[0].windup=null;s.run.room.enemies[0].recoverUntil=3;s.run.player={x:9,y:6};const p=new GeodePresentation();
 p.capture(s.run,s.attempts,s.seed);enemyBeat(s,4);const boss=s.run.room.enemies.find(e=>e.bossIndex===0);p.capture(s.run,s.attempts,s.seed);
 const charge=p.sample(boss,{age:1,visualBeat:6.8});assert.equal(charge.state,'pillar-charge');assert.ok(charge.pose.motion.right<-.5);
 s.run.acted=7;tick(s,7);p.accept(s.run.events,2);const impact=p.sample(boss,{age:2.03,visualBeat:7.1});assert.equal(impact.state,'pillar-impact');assert.ok(impact.pose.motion.left<0);assert.equal(s.run.health,70);
});
test('boss arena silhouettes stay outside every traversable tile across seeds/biomes',()=>{
 for(const seed of [41001,712,9187])for(let b=0;b<7;b++){
  const s=createState(seed);s.seals=6;startRun(s);s.run.floor=b*5+5;generateRoom(s);const room=s.run.room,before=JSON.stringify(room),p=buildBossArena(room,b);assert.ok(p.props.length>=4);assert.deepEqual(p,buildBossArena(room,b));
  for(const d of p.props)for(let y=0;y<room.rows;y++)for(let x=0;x<room.cols;x++)if(isFloor(room,x,y)){const px=50+22*x+2*y,py=57.5+16*y;assert.ok(!(d.bounds.left<px+12&&d.bounds.right>px-12&&d.bounds.top<py+8&&d.bounds.bottom>py-8));}
  assert.equal(JSON.stringify(room),before);
 }
});
test('sample bank is bounded, follows the existing effect bus and suppresses duplicate bursts',async()=>{
 let starts=0;const bus={},engine={enabled:true,effectVoices:new Set(),outputFor:effect=>{assert.equal(effect,true);return bus;},ctx:{state:'running',currentTime:0,decodeAudioData:async()=>({duration:.5}),createBufferSource:()=>({playbackRate:{value:0},connect(){},start(){starts++},disconnect(){}}),createGain:()=>({gain:{value:0},connect(v){assert.equal(v,bus)},disconnect(){}})}};
 const audio=createBossImpactAudio(engine,{read:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(2)})});assert.equal(await audio.prepare(),true);const events=[{type:'geodeEruption'},{type:'geodeEruption'}];assert.equal(audio.consume(events),2);assert.equal(audio.consume(events),0);assert.equal(starts,2);engine.enabled=false;engine.ctx.currentTime=2;assert.equal(audio.consume(events),0);
 assert.deepEqual(bossImpactCues([{type:'hit'},{type:'move'},{type:'geodePulse',version:2,bossIndex:0}]),[]);
});
test('unavailable sampled audio fails quietly without taking ownership of synthesized cues',async()=>{
 const audio=createBossImpactAudio({ctx:{decodeAudioData(){}},effectVoices:new Set()},{read:async()=>{throw Error('offline')}});assert.equal(await audio.prepare(),false);assert.equal(audio.status().loaded,0);
});
test('ten force-upgrade tiers share native faces with forge preview; all grip transforms are finite',()=>{
 const colors=new Set();for(let t=0;t<10;t++){const faces=dungeonPickaxeFaces(t);assert.ok(faces.length>8);colors.add(JSON.stringify(PICKAXE_METALS[t]));assert.match(pickaxePreview(t?10*t:1),/forge-native/);assert.match(pickaxePreview(t?10*t:1),/<image/);for(const f of faces)assert.ok(f.points.flat().every(Number.isFinite));}assert.equal(colors.size,10);
 for(const clip of Object.values(MINER_CLIPS))for(const sockets of Object.values(clip.sockets))for(const active of [false,true]){const b=dungeonToolBasis(sockets,active);assert.equal(b.length,4);assert.ok(b.every(Number.isFinite));assert.ok(Math.hypot(b[0],b[1])>0);assert.ok(Math.abs(b[0]*b[3]-b[1]*b[2])>.2,'blade must not collapse in a front/back view');}
});
test('requested finish is exactly half strength and increased cave darkness stays bounded',()=>{assert.equal(APPROVED_CRT.strength,.9/2);assert.ok(DUNGEON_NIGHT.strength>.82&&DUNGEON_NIGHT.strength<1);assert.ok(DUNGEON_NIGHT.playerReveal>DUNGEON_NIGHT.crystalReveal);});
