import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {MUSIC_ALBUMS,ALBUM_TIERS} from '../dist/music-albums.js';
import {albumClock} from '../dist/album-clock.js';
import {trainingMusicOptions,canTrainEdition} from '../dist/training-music.js';
import {runBeatTime,runBeatPhase,runBeatDuration,runRailSeconds,runTrack,runMusicCue,hasTrainingClock} from '../dist/training-clock.js';
import {rhythmPositions} from '../dist/hud-model.js';
import {createTraining,trainingView,advanceTraining,actTraining,setTrainingPaused,setTrainingBpm,setTrainingBreath,exportTraining,restoreTraining,finishTraining} from '../dist/tutorial-training.js';
const editions=MUSIC_ALBUMS.flatMap(a=>a.editions),first=editions[0].id;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
function until(s,time){while(time-trainingView(s).elapsed>1e-8)advanceTraining(s,Math.min(.25,time-trainingView(s).elapsed));}
test('picker reads only owned live album editions, keeps free BPM, never changes account or equipped song',()=>{
 const p=E.createState(56),before=JSON.stringify(p);assert.deepEqual(trainingMusicOptions(p),[{id:'',label:'BPM livre'}]);assert.equal(JSON.stringify(p),before);
 const a=MUSIC_ALBUMS[0];p.records.albumOwned=[a.id];const owned=JSON.stringify(p),options=trainingMusicOptions(p);
 assert.deepEqual(options.slice(1),a.editions.map(e=>({id:e.id,label:a.title+' · '+ALBUM_TIERS[e.tier]})));
 assert.equal(canTrainEdition(p,first),true);assert.equal(canTrainEdition(p,'removed-edition'),false);assert.equal(JSON.stringify(p),owned);
});
test('every live edition trains on the same timestamps, variable intervals and loop seam as expedition',()=>{
 for(const edition of editions){const s=createTraining({albumEdition:edition.id}),r=s.state.run,c=albumClock(edition.id);
  assert.equal(hasTrainingClock(r),true);assert.equal(trainingView(s).phase,0);assert.equal(trainingView(s).countIn,4);
  for(const phase of [0,1,3.9,4,4.25,5,c.count+3.75,c.count+4,c.count*2+8.1]){
   near(runBeatTime(r,phase),c.time(phase));near(runBeatPhase(r,c.time(phase)),phase);
   near(runBeatDuration(r,phase),c.time(Math.floor(phase)+1)-c.time(Math.floor(phase)));near(runRailSeconds(r,phase),c.intro);
   near(runMusicCue(r,phase).bpm,60/runBeatDuration(r,phase));
   const rail=rhythmPositions(phase,{albumEdition:edition.id});rail.beats.forEach((b,i)=>near(rail.positions[i],15+(c.time(b)-c.time(phase))/c.intro*25));
  }
  assert.equal(runTrack(r).edition.id,edition.id);assert.throws(()=>setTrainingBpm(s,80));assert.throws(()=>setTrainingBreath(s,true));
 }
});
test('real native hits and misses use recorded timing and never punish protected rhythm practice',()=>{
 for(const edition of editions){const s=createTraining({albumEdition:edition.id}),r=s.state.run,c=albumClock(edition.id),health=r.health,rhythm=r.rhythm;
  setTrainingPaused(s,false);
  for(let b=4;b<11;b++){until(s,c.time(b));assert.equal(actTraining(s,{type:'hit'}).result.ok,true);}
  assert.equal(s.practicedFive,true);until(s,c.time(12.49));const miss=actTraining(s,{type:'hit'}),outside=(c.time(12.49)-c.time(12))*1000>E.actionWindowMs(s.state,12);assert.equal(!!miss.result.miss,outside);if(outside)assert.ok(miss.events.some(e=>e.type==='trainingTimingMiss'&&e.protected));
  until(s,c.time(30.8));assert.equal(r.health,health);assert.equal(r.rhythm,rhythm);assert.ok(s.state.run);assert.equal(s.paused,false);
 }
});
test('recorded checkpoint replays the same timeline paused, requires current ownership, does not enter main saves',()=>{
 const profile=E.createState(56);profile.records.albumOwned=[MUSIC_ALBUMS[0].id];const before=JSON.stringify(profile);
 const s=createTraining({albumEdition:first}),c=albumClock(first);setTrainingPaused(s,false);until(s,c.time(4));actTraining(s,{type:'hit'});until(s,c.time(6.37));setTrainingPaused(s,true);
 const phase=trainingView(s).phase;advanceTraining(s,.2);near(trainingView(s).phase,phase);
 const checkpoint=exportTraining(s);assert.equal(restoreTraining(checkpoint),null);
 const restored=restoreTraining(checkpoint,{ownsEdition:id=>canTrainEdition(profile,id)});assert.ok(restored);assert.equal(trainingView(restored).paused,true);near(trainingView(restored).phase,phase);assert.deepEqual(restored.state.run,s.state.run);
 setTrainingPaused(restored,false);near(trainingView(restored).phase,phase);assert.equal(trainingView(restored).countIn,0);
 assert.equal(restoreTraining({...checkpoint,albumEdition:'removed-edition'},{ownsEdition:()=>true}),null);assert.equal(E.restoreState(JSON.stringify(s.state)),null);
 assert.equal(finishTraining(restored,{skipped:true}).rewardsTransferred,false);assert.equal(JSON.stringify(profile),before);
});
test('legacy BPM checkpoint is unchanged, remains pauseable and replayable with no ownership',()=>{
 const s=createTraining({bpm:80});setTrainingPaused(s,false);advanceTraining(s,.25);setTrainingPaused(s,true);setTrainingBpm(s,120);const raw=exportTraining(s);assert.equal(raw.albumEdition,undefined);const copy=restoreTraining(raw);assert.ok(copy);near(trainingView(copy).phase,trainingView(s).phase);assert.equal(trainingView(copy).bpm,120);
});
