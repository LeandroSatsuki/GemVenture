import test from 'node:test';
import assert from 'node:assert/strict';
import {Music} from '../dist/audio.js';
import {attachAudioMix} from '../dist/audio-mix.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';
import {createTreeSoundFeedback,UI_SOUND_PROFILES} from '../dist/ui-sound-feedback.js';

function rig(){
 const music=new Music();music.ctx=homeAudioContext(2);music.master=music.ctx.createGain();music.enabled=true;
 const mix=attachAudioMix(music),prefs={enabled:true,musicVolume:1,sfxVolume:1};mix.apply(prefs);
 const emissions=[],feedback=createTreeSoundFeedback(music,{preferences:()=>prefs,onEmission:e=>emissions.push(e)});
 return {music,mix,prefs,emissions,feedback};
}
test('all UI notes use the SFX bus and end/disconnect, including Music volume zero',()=>{
 const {music,mix,prefs,feedback}=rig();prefs.musicVolume=0;mix.apply(prefs);
 for(const kind of Object.keys(UI_SOUND_PROFILES)){
  music.ctx.advance(music.ctx.currentTime+1);assert.equal(feedback.emit(kind),true);
  assert.equal(music.voices.size,0);assert.equal(music.effectVoices.size,UI_SOUND_PROFILES[kind].notes.length);
  for(const voice of music.effectVoices){assert.equal(voice.connections[0].connections[0],music.sfxBus);assert.ok(voice.endAt>voice.startAt);}
  music.ctx.advance(music.ctx.currentTime+1);assert.equal(music.effectVoices.size,0);
 }
 assert.ok(music.ctx.nodes.every(n=>n.disconnected));
});
test('mute, SFX zero, stopped/suspended audio and disposed feedback allocate no notes',()=>{
 const {music,prefs,feedback}=rig();const count=()=>music.ctx.nodes.length;
 for(const change of [()=>{prefs.enabled=false},()=>{prefs.enabled=true;prefs.sfxVolume=0},()=>{prefs.sfxVolume=1;music.enabled=false},()=>{music.enabled=true;music.ctx.state='suspended'}]){
  change();const before=count();assert.equal(feedback.emit('reward'),false);assert.equal(count(),before);
 }
 music.ctx.state='running';feedback.dispose();assert.equal(feedback.emit('set'),false);
});
test('a real open/close transition emits once; no-op rebuilding cannot duplicate it',()=>{
 const {feedback,emissions,music}=rig();
 feedback.setOpen(false);feedback.setOpen(true);feedback.setOpen(true);
 music.ctx.advance(2.2);feedback.setOpen(false);feedback.setOpen(false);
 assert.deepEqual(emissions.map(e=>e.kind),['open','close']);
});
test('30 repeated selections remain bounded; same-cue bursts are suppressed without a queued tail',()=>{
 const {music,feedback,emissions}=rig();let peak=0;
 for(let i=0;i<30;i++){
  music.ctx.advance(2+i*.15);assert.equal(feedback.emit('select'),true);assert.equal(feedback.emit('select'),false);peak=Math.max(peak,music.effectVoices.size);
 }
 music.ctx.advance(20);assert.equal(music.effectVoices.size,0);assert.equal(emissions.length,30);assert.equal(peak,1);
});
test('UI budget reserves room for other sounds and never touches the beat scheduler',()=>{
 const {music,feedback}=rig();music.step=123;music.track=0;
 music.voices=new Set(Array.from({length:63},()=>({})));assert.equal(feedback.emit('reward'),false);
 assert.equal(music.step,123);assert.equal(music.track,0);assert.equal(music.effectVoices.size,0);
});
