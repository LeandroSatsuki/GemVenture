import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const root=resolve(process.argv[2]||'.');
const load=(base,name)=>import(pathToFileURL(resolve(base,'dist',name)).href);
const [{RECORDS},{arrangementStep},{ALL_TRACKS,scoreStep,trackBeatTime}]=await Promise.all([
 load(root,'records.js'),load(root,'music-arrangements.js'),load(root,'score.js')]);
const baseline=process.argv[3]?await load(resolve(process.argv[3]),'music-arrangements.js'):null;
const changed=new Set(['pixel','dusk','iron']),report=[];
const voices=e=>['guitar','pad','snare','sing','cue','vocal'].includes(e.kind)||['bell','bright','slap','wood','reese','supersaw'].includes(e.color)?2:1;
for(const record of RECORDS){
 let maxVoices=0,steps=0;
 for(let track=0;track<ALL_TRACKS.length;track++)for(const combo of [0,75]){
  let endings=[];
  for(let step=0;step<1284;step++){
   const at=trackBeatTime(track,step/4),events=arrangementStep(record,track,step,{combo});
   assert.equal(events.filter(e=>e.kind==='kick').length,step%4===0?1:0,`${record.id} anchor`);
   const cues=scoreStep(track,step).filter(e=>e.kind==='cue');
   assert.deepEqual(events.filter(e=>e.kind==='cue'),cues.map(e=>({...e,duration:.17,level:.17})),`${record.id} cue`);
   for(const e of events){
    assert.ok(Number.isFinite(e.freq)&&e.freq>0&&Number.isFinite(e.duration)&&e.duration>0&&e.duration<4&&Number.isFinite(e.level)&&e.level>0&&e.level<1,`${record.id} event`);
    const start=at+(e.delayBeats?trackBeatTime(track,step/4+e.delayBeats)-at:0);
    for(let n=0;n<voices(e);n++)endings.push(start+e.duration+.03);
   }
   endings=endings.filter(end=>end>at);maxVoices=Math.max(maxVoices,endings.length);
   if(baseline&&!changed.has(record.id))assert.deepEqual(events,baseline.arrangementStep(record,track,step,{combo}),`${record.id} preserved`);
   steps++;
  }
 }
 assert.ok(maxVoices<65,`${record.id} musical voices ${maxVoices}`);
 report.push({id:record.id,steps,maxVoices,baselinePreserved:baseline&&!changed.has(record.id)?true:null});
}
console.log(JSON.stringify({status:'pass',tracks:ALL_TRACKS.length,combos:[0,75],cycles:2,voiceEvidence:'conservative event estimate; not native WebAudio',records:report},null,2));
