import test from 'node:test';
import assert from 'node:assert/strict';
import {Music} from '../dist/audio.js';
import {SOUND_CUES,eventSoundCues} from '../dist/sound-design.js';

test('chain reactions prioritize danger and rewards, with at most three distinct cues',()=>{
 const events=Array.from({length:200},()=>({type:'loot',heavy:true}));
 events.push({type:'hurt',reason:'attack'},{type:'missionReady'},{type:'heal'},{type:'proc'});
 assert.deepEqual(eventSoundCues(events),['mission','hurt','heal']);
 assert.deepEqual(eventSoundCues([{type:'hurt',reason:'silence'}]),['miss']);
 assert.deepEqual(eventSoundCues([{type:'heal'},{type:'shield'},{type:'card'}]),['heal','shield','card']);
});
test('sound effects obey mute, audio suspension, cooldown and voice budget',()=>{
 const m=new Music(),notes=[];m.ctx={currentTime:1,state:'running'};m.tone=(...a)=>notes.push(a);
 assert.equal(m.sfx('claim'),false);assert.equal(notes.length,0);
 m.enabled=true;assert.ok(m.sfx('pick'));assert.equal(notes.length,2);assert.equal(m.sfx('pick'),false);
 m.ctx.currentTime+=.17;assert.ok(m.sfx('pick'));assert.equal(m.step,-1);
 m.ctx.state='suspended';assert.equal(m.sfx('warning'),false);
 m.ctx.state='running';m.voices=new Set(Array.from({length:81},(_,i)=>i));assert.equal(m.sfx('claim'),false);
});
test('all cues use short quiet envelopes and valid scheduled notes',()=>{
 for(const [id,pattern] of Object.entries(SOUND_CUES)){
  assert.ok(pattern.length<=4,id);
  for(const [hz,duration,wave,gain,delay,slide]of pattern){
   assert.ok(hz>0&&duration>0&&duration<=.6&&gain>0&&gain<=.13&&delay>=0,id);
   assert.ok(['sine','triangle'].includes(wave));if(slide)assert.ok(slide>0);
  }
 }
 const m=new Music(),notes=[];m.enabled=true;m.ctx={currentTime:7,state:'running'};m.tone=(...a)=>notes.push(a);
 m.events([{type:'missionReady'}]);assert.ok(notes.every(n=>n[4]>=7));assert.equal(m.step,-1);
});
test('changing musical scene preserves a reward cue, while mute stops both buses',()=>{
 const m=new Music();let musicStops=0,effectStops=0;
 m.voices.add({stop:()=>musicStops++});m.effectVoices.add({stop:()=>effectStops++});
 m.silence(false);assert.equal(musicStops,1);assert.equal(effectStops,0);assert.equal(m.effectVoices.size,1);
 m.stop();assert.equal(effectStops,1);assert.equal(m.effectVoices.size,0);
});

test('mining arcade groove varies its phrase, avoids duplicate beats and obeys mute, suspension and voice limits',()=>{
 const m=new Music(),notes=[],noises=[];m.ctx={state:'running',currentTime:0};m.master={gain:{setTargetAtTime:()=>{}}};m.tone=(...a)=>notes.push(a);m.noise=(...a)=>noises.push(a);
 m.mining(0);assert.equal(notes.length,0);m.enabled=true;m.mining(0);assert.ok(notes.length>0);const first=notes.length;m.mining(0);assert.equal(notes.length,first);
 for(let i=1;i<256;i++){m.ctx.currentTime=i/8;m.mining(i/8);}assert.ok(notes.every(n=>n[3]<=.13));assert.ok(noises.every(n=>n[1]<=.028));assert.ok(new Set(notes.map(n=>n[0])).size>10);assert.equal(m.track,'mining');
 const count=notes.length;m.ctx.state='suspended';m.mining(40);assert.equal(notes.length,count);m.ctx.state='running';m.voices=new Set(Array.from({length:71},(_,i)=>i));m.mining(40);assert.equal(notes.length,count);m.enabled=false;m.mining(40);assert.equal(notes.length,count);
});
