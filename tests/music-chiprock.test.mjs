import test from 'node:test';
import assert from 'node:assert/strict';
import {arrangementStep} from '../dist/music-arrangements.js';
import {recordById} from '../dist/records.js';
import {trackBeatTime} from '../dist/score.js';
import {chiprockStep} from '../dist/music-chiprock.js';

for(const id of ['pixel','dusk','iron']){
 test(`${id}: five developed sections with an identifiable lead, even at zero combo`,()=>{
  const cells=Array.from({length:5},(_,s)=>Array.from({length:128},(_,q)=>arrangementStep(recordById(id),0,s*128+q,{combo:0})).flat());
  for(const events of cells)assert.ok(events.some(e=>e.role==='signature'));
  const melodic=events=>events.filter(e=>e.role==='signature').map(e=>[e.freq,e.duration]);
  assert.notDeepEqual(melodic(cells[0]),melodic(cells[1]));
  assert.notDeepEqual(melodic(cells[0]),melodic(cells[2]));
  assert.ok(cells[3].length<cells[1].length,'bridge actually reduces activity');
  assert.ok(cells[4].some(e=>e.role==='riff'),'return includes rock support');
  assert.ok(cells[0].some(e=>e.role==='signature'&&e.duration>.4),'lead has breathing room');
 });
 test(`${id}: accompaniment answers in lead rests and loops without stranded notes`,()=>{
  const record=recordById(id);let leadEnd=0;
  for(let step=0;step<1280;step++){
   const events=arrangementStep(record,0,step,{combo:75});
   const at=trackBeatTime(0,step/4);
   if(events.some(e=>e.role==='answer'))assert.ok(leadEnd<at,'response follows release of lead');
   for(const e of events.filter(e=>e.role==='signature'))leadEnd=at+e.duration;
   if(step>=624&&step<640)for(const e of events.filter(e=>e.role==='signature'))
    assert.ok(trackBeatTime(0,step/4)+e.duration<trackBeatTime(0,160)+.01);
  }
  // Harmony follows the biome's longer cycle; the authored motif loops at 40 bars.
  const notes=step=>chiprockStep(id,step,{root:130.813,beat:.5}).filter(e=>e.role==='signature').map(e=>e.freq);
  for(let step=0;step<16;step++)assert.deepEqual(notes(step),notes(640+step));
 });
}

test('essential timing, bass and lead remain centered while supporting music occupies both sides',()=>{
 for(const id of ['pixel','dusk','iron']){
  const events=Array.from({length:640},(_,step)=>arrangementStep(recordById(id),0,step)).flat();
  for(const event of events){
   assert.ok(Math.abs(event.pan||0)<=.45);
   if(['kick','snare','cue','bass'].includes(event.kind)||event.role==='signature')assert.equal(event.pan||0,0);
  }
  assert.ok(events.some(e=>e.pan<=-.28)&&events.some(e=>e.pan>=.28));
 }
});
