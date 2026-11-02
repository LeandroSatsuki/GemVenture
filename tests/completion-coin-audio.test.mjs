import test from 'node:test';import assert from 'node:assert/strict';
import {coinFillPlan,createCoinFillAudio} from '../dist/completion-coin-audio.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';
function rig(){const ctx=homeAudioContext(1),music={ctx,enabled:true,sfxBus:ctx.createGain(),voices:new Set(),effectVoices:new Set(),step:123,track:2};let visible=true;const prefs={enabled:true,sfxVolume:1},audio=createCoinFillAudio(music,{preferences:()=>prefs,visible:()=>visible});return {music,ctx,prefs,audio,hide:()=>{visible=false;}};}
test('zero, lost-only and malformed payouts are silent; loss coin trickles are subdued without a fanfare',()=>{
 for(const coins of [0,-1,NaN,Infinity,undefined])assert.deepEqual(coinFillPlan({coins}),[]);
 const normal=coinFillPlan({coins:125,phase:'transfer',duration:1.1}),loss=coinFillPlan({coins:25,reason:'death',phase:'transfer',duration:1.1});
 assert.ok(loss.length<normal.length);assert.ok(Math.max(...loss.map(n=>n.level))<Math.min(...normal.map(n=>n.level)));assert.ok(Math.max(...loss.map(n=>n.frequency))<Math.min(...normal.map(n=>n.frequency)));
 for(const duration of [.18,.25,.6,1.1,999])for(const note of coinFillPlan({coins:1,duration})){assert.ok(note.at>=0);assert.ok(note.at+note.tail+.005<=Math.min(1.2,Math.max(.12,duration)));}
});
test('coin voices use existing SFX bus, stay bounded, end and disconnect without touching the clock or result',()=>{
 const {music,ctx,audio}=rig(),result={coins:280,reason:'return',phase:'transfer',duration:1.1},before=structuredClone(result);assert.ok(audio.play('transfer',result));assert.ok(music.effectVoices.size<=22);assert.equal(music.voices.size,0);
 for(const node of ctx.nodes)assert.equal(node.connections[0].connections[0],music.sfxBus);
 assert.equal(music.step,123);assert.equal(music.track,2);assert.deepEqual(result,before);ctx.advance(3);assert.equal(audio.read().voices,0);assert.equal(music.effectVoices.size,0);assert.ok(ctx.nodes.every(n=>n.disconnected));
});
test('mute, zero SFX, hidden page, suspended context and full budget allocate no coin voices',()=>{
 for(const alter of [r=>r.prefs.enabled=false,r=>r.prefs.sfxVolume=0,r=>r.hide(),r=>r.music.enabled=false,r=>r.ctx.state='suspended',r=>r.music.voices=new Set(Array.from({length:60},()=>({})))]){const r=rig();alter(r);assert.equal(r.audio.play('x',{coins:100}),false);assert.equal(r.ctx.nodes.length,0);}
});
test('pagination and transfer replace the previous burst; duplicate, canceled and hidden cues do not replay',()=>{
 const {audio,music,ctx,hide}=rig();assert.ok(audio.play('count-0',{coins:10}));assert.equal(audio.play('count-0',{coins:10}),false);assert.ok(audio.play('count-1',{coins:10}));assert.ok(music.effectVoices.size<=22);assert.ok(ctx.nodes.slice(0,12).every(n=>n.disconnected));
 audio.cancel();assert.equal(audio.read().voices,0);assert.equal(audio.play('count-1',{coins:10}),false);hide();assert.equal(audio.play('transfer',{coins:10}),false);audio.dispose();assert.equal(audio.play('other',{coins:10}),false);
});
