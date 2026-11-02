import {sceneBeatPhase,albumClock} from '../dist/album-clock.js';
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {sampleComboDisco,COMBO_DISCO} from '../dist/combo-disco.js';import {ALL_TRACKS,trackBeatTime,trackBeatPhase,trackIndexForFloor,beatPhase} from '../dist/score.js';import {Music} from '../dist/audio.js';
const sample=(beat,rest={})=>sampleComboDisco({combo:150,player:{x:300,y:400},seed:41001,beat,...rest});
test('continuous group pulses follow musical phase without re-randomizing at a beat boundary',()=>{
 for(const beat of [0,1,31,32,35,63,64,127,159,160,400]){const at=sample(beat),mid=sample(beat+.5),next=sample(beat+.001);assert.equal(at.pulse,1);assert.equal(mid.pulse,0);assert.equal(sample(beat+.9).pulse,0,'release ends before the next beat; no premature flash');assert.equal(at.beatIndex,beat);assert.deepEqual(at,sample(beat,{time:999999}));for(let i=0;i<at.spots.length;i++)assert.ok(Math.hypot(at.spots[i].x-next.spots[i].x,at.spots[i].y-next.spots[i].y)<.1);}
});
test('layout is seeded, continuous and translated with the miner',()=>{
 const a=sample(12.1),b=sample(13.1);assert.notDeepEqual(a.spots,b.spots);assert.deepEqual(a,sample(12.1));assert.notDeepEqual(a.spots,sample(12.1,{seed:55}).spots);const moved=sample(12.1,{player:{x:340,y:420}});for(let i=0;i<a.spots.length;i++){assert.equal(moved.spots[i].x-a.spots[i].x,20);assert.ok(Math.abs(moved.spots[i].y-a.spots[i].y-10)<1e-10);}assert.ok(new Set(a.spots.map(p=>p.color)).size>=2);
});
test('every campaign/boss tempo and phrase acceleration shares the audio scheduler beat clock',()=>{
 for(let track=0;track<ALL_TRACKS.length;track++){const audio=new Music(),played=[];audio.enabled=true;audio.ctx={state:'running',currentTime:10};audio.tone=(...args)=>played.push(args);audio.noise=()=>{};
  for(const beat of [4,31,32,34,36,96,100,128,159,160]){const seconds=trackBeatTime(track,beat),phase=trackBeatPhase(track,seconds),frame=sample(phase);assert.equal(frame.beatIndex,beat);assert.equal(frame.pulse,1);const before=played.length;audio.update(seconds,track);assert.ok(played.length>before);assert.ok(played.slice(before).some(v=>Math.abs(v[4]-10)<1e-7));assert.equal(sample(trackBeatPhase(track,trackBeatTime(track,beat+.5))).pulse,0);}
 }
 const slow=trackBeatTime(trackIndexForFloor(1),1),fast=trackBeatTime(trackIndexForFloor(16),1);assert.ok(fast<slow);assert.ok(trackBeatTime(0,37)-trackBeatTime(0,36)<trackBeatTime(0,5)-trackBeatTime(0,4));
});
test('approved stage budget saturates and quiet mode retains four static marks without flashes',()=>{
 const low=sample(8,{combo:5}),high=sample(8,{combo:500});assert.equal(low.spots.length,4);assert.equal(high.spots.length,18);assert.equal(high.accents.length,0);assert.deepEqual(high,sample(8,{combo:100000}));for(const beat of [8,8.1,8.4,8.8])for(const p of sample(beat,{combo:500}).spots){assert.ok([p.x,p.y,p.scale,p.alpha].every(Number.isFinite));assert.ok(p.alpha>=0&&p.alpha<=.8);assert.ok(COMBO_DISCO.colors.includes(p.color));}const soft=sample(8,{soft:true});assert.equal(soft.spots.length,4);assert.deepEqual(soft.accents,[]);assert.equal(soft.pulse,0);assert.deepEqual(soft.spots,sample(500,{soft:true}).spots);assert.equal(sampleComboDisco({combo:4}),null);
});

test('World uses the music clock and room seed, freezes it on pause/hidden and resets it on a new room',async()=>{
 const world=await readFile(new URL('../dist/world.js',import.meta.url),'utf8'),line=world.split(/\r?\n/).find(s=>s.includes('this.discoContext!==context'));assert.ok(line);assert.match(line,/sceneBeatPhase\(s.run,time\)/);assert.match(line,/!paused&&!ambientHidden/);assert.match(line,/seed:s.run.room.seed/);
 const execute=new Function('s','paused','ambientHidden','time','sceneBeatPhase','musicFloor','sampleComboDisco',line),state={attempts:1,run:{floor:1,combo:150,room:{seed:41001,cleared:false}}},view={player:{x:300,y:400},reduced:false,motionPreference:{matches:false}};const step=(time,paused=false,hidden=false)=>execute.call(view,state,paused,hidden,time,sceneBeatPhase,r=>r.floor,sampleComboDisco);
 step(.7);const frozen=view.comboDisco;step(50,true);assert.deepEqual(view.comboDisco,frozen);step(90,false,true);assert.deepEqual(view.comboDisco,frozen);step(1.1);assert.notDeepEqual(view.comboDisco,frozen);state.run.room.seed=55;step(0,true);assert.equal(view.comboDisco.beatIndex,0);assert.equal(view.comboDisco.pulse,1);
 state.run.combo=49;step(2);state.run.combo=50;step(2.01);assert.equal(view.comboDisco.entry.at,50);const entry=structuredClone(view.comboDisco.entry);step(80,true);assert.deepEqual(view.comboDisco.entry,entry);
 const second={...view,discoContext:null,discoBeat:null,comboRewardMemory:null};execute.call(second,state,false,false,2.01,sceneBeatPhase,r=>r.floor,sampleComboDisco);assert.equal(second.comboDisco.entry,null);assert.notEqual(second.comboRewardMemory,view.comboRewardMemory);
 state.run.albumEdition='GV059-L05-02';step(albumClock(state.run.albumEdition).time(11));assert.ok(Math.abs(view.discoBeat-11)<1e-8);
 state.run=null;step(3);assert.equal(view.comboRewardMemory,null);assert.equal(view.discoBeat,null);assert.equal(view.comboDisco,null);

});
