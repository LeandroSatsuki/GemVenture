import test from 'node:test';
import assert from 'node:assert/strict';
import {RECORDS,restoreRecords,recordById} from '../dist/records.js';
import {arrangementStep,ARRANGEMENTS} from '../dist/music-arrangements.js';
import {ALL_TRACKS,trackBeatTime,trackIndexForFloor} from '../dist/score.js';
import {Music} from '../dist/audio.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';
import {playInstrument} from '../dist/music-instruments.js';

test('all collectible discs have distinct scores, including techno, rock and new vocal arrangements',()=>{
 const signatures=RECORDS.map(r=>JSON.stringify(Array.from({length:128},(_,i)=>arrangementStep(r,0,i))));
 assert.equal(new Set(signatures).size,RECORDS.length);
 assert.equal(ARRANGEMENTS.circuit.family,'techno');assert.equal(ARRANGEMENTS.iron.family,'rock');
 assert.ok(Array.from({length:16},(_,i)=>arrangementStep(recordById('circuit'),0,i)).flat().some(e=>e.kind==='acid'));
 assert.ok(arrangementStep(recordById('iron'),0,0).some(e=>e.kind==='guitar'));
 assert.deepEqual(restoreRecords({owned:['pulse','iron'],active:'iron'}),{owned:['pulse','iron'],active:'iron'});
});
test('each genre preserves exactly one beat anchor and every tempo warning across all biomes',()=>{
 for(const record of RECORDS)for(let track=0;track<ALL_TRACKS.length;track++)for(let step=0;step<640;step++){
  const events=arrangementStep(record,track,step,{combo:75});
  assert.equal(events.filter(e=>e.kind==='kick').length,step%4===0?1:0);
  if(step>=112&&step<=124&&step%4===0&&track===0)assert.equal(events.filter(e=>e.kind==='cue').length,1);
  for(const e of events){assert.ok(Number.isFinite(e.freq)&&e.freq>0);assert.ok(e.duration>0&&e.duration<4);assert.ok(e.level>0&&e.level<1);}
 }
});
test('biome harmony gives different phrases even to regions sharing a base key',()=>{
 const signatures=Array.from({length:7},(_,biome)=>JSON.stringify(Array.from({length:128},(_,step)=>arrangementStep(recordById('pulse'),trackIndexForFloor(biome*5+1),step))));
 assert.equal(new Set(signatures).size,7);
 const normalized=track=>Array.from({length:128},(_,step)=>arrangementStep(recordById('pulse'),track,step).map(e=>[e.kind,e.freq]));
 assert.notDeepEqual(normalized(0),normalized(12));
});
test('previewing techno and rock for five seconds leaves the equipped disc intact',()=>{
 for(const id of ['circuit','iron','dusk','voice','rush','pixel','swing','turbo']){
  const m=new Music(),notes=[];m.enabled=true;m.ctx=homeAudioContext(2);m.master={gain:{setTargetAtTime(){}}};m.tone=(...a)=>notes.push(a);m.noise=()=>{};
  assert.ok(m.previewRecord(id));m.home(0);assert.equal(m.track,recordById(id).previewTrack);assert.ok(notes.length);
  assert.equal(m.record.id,'pulse');m.ctx.currentTime=7;m.home(0);assert.equal(m.preview,null);assert.equal(m.track,'home');
 }
});
test('dense arrangements stay within a bounded number of simultaneous voices on a long run',()=>{
 for(const record of RECORDS){
  const endings=[],polyphony=[];
  for(let step=0;step<1280;step++){
   const at=trackBeatTime(3,step/4);while(endings.length&&endings[0]<at)endings.shift();
   for(const e of arrangementStep(record,3,step,{combo:200,abyss:true})){
    const voices=['guitar','pad','snare','sing'].includes(e.kind)||['bell','bright','slap','wood','reese','supersaw'].includes(e.color)?2:1;
    for(let i=0;i<voices;i++)endings.push(at+e.duration+.03);
   }
   endings.sort((a,b)=>a-b);polyphony.push(endings.length);
  }
  assert.ok(Math.max(...polyphony)<65,record.id+' polyphony '+Math.max(...polyphony));
 }
});
test('instrument nodes disconnect after playback and refuse work at the voice limit',()=>{
 const made=[],parameter=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>{const n={gain:parameter(),frequency:parameter(),detune:parameter(),Q:parameter(),pan:parameter(),connect(){},disconnect(){this.disconnected=true;},start(){},stop(){}};made.push(n);return n;};
 const m=new Music();m.enabled=true;m.master=node();m.ctx={createGain:node,createBiquadFilter:node,createOscillator:node,createWaveShaper:node,createStereoPanner:node};
 playInstrument(m,{kind:'guitar',freq:110,duration:.2,level:.1,color:'rock',pan:.2},0);
 assert.equal(m.voices.size,2);for(const o of [...m.voices])o.onended();assert.equal(m.voices.size,0);assert.ok(made.slice(1).every(n=>n.disconnected));
 playInstrument(m,{kind:'sing',freq:260,duration:.25,level:.1,vowel:'i'},1);
 assert.equal(m.voices.size,2);assert.equal(made.filter(n=>n.type==='bandpass').length,3);
 for(const o of [...m.voices])o.onended();assert.equal(m.voices.size,0);assert.ok(made.slice(1).every(n=>n.disconnected));
 m.voices=new Set(Array.from({length:79},()=>({})));const count=made.length;
 playInstrument(m,{kind:'guitar',freq:110,duration:.2,level:.1},1);assert.equal(made.length,count);
});
test('swing delays its offbeat chords without moving any required beat',()=>{
 const m=new Music(),notes=[];m.enabled=true;m.record=recordById('swing');m.ctx={currentTime:0,state:'running'};m.tone=(...a)=>notes.push(a);m.noise=()=>{};
 for(let elapsed=0;elapsed<2;elapsed+=.025){m.ctx.currentTime=elapsed;m.update(elapsed,0);}
 const kicks=notes.filter(n=>n[0]===155);kicks.forEach((n,i)=>assert.ok(Math.abs(n[4]-trackBeatTime(0,i))<1e-8));
 assert.ok(notes.some(n=>n[0]===ALL_TRACKS[0].root*2&&Math.abs(n[4]-trackBeatTime(0,2/3))<1e-8));
});
