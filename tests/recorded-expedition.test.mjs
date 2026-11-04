import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createState,startRun,restoreState,act,actionWindowMs} from '../dist/core.js';
import {buyAlbum,equipAlbumEdition} from '../dist/album-collection.js';
import {equipRecord,restoreRecords} from '../dist/records.js';
import {MUSIC_ALBUMS} from '../dist/music-albums.js';
import {albumClock,hasAlbumClock} from '../dist/album-clock.js';
import {runBeatTime,runBeatPhase,runSavedMusicElapsed,runTrack} from '../dist/training-clock.js';
import {beatTime} from '../dist/score.js';
import {rhythmPositions} from '../dist/hud-model.js';
import {attachRecordedExpedition} from '../dist/recorded-expedition.js';
const edition='GV059-L05-02';
test('owned edition can be selected, persists through restore and becomes the new run clock; legacy selection clears it',()=>{
 const s=createState(37);s.stars=40;assert.equal(equipAlbumEdition(s,edition),false);buyAlbum(s,'dos88-city-stomper');assert.ok(equipAlbumEdition(s,edition));assert.equal(s.stars,37);
 const restored=restoreState(JSON.stringify(s));assert.equal(restored.records.albumActive,edition);assert.ok(startRun(restored));assert.equal(restored.run.albumEdition,edition);assert.ok(hasAlbumClock(restored.run));assert.equal(runTrack(restored.run).name,'City Stomper');assert.equal(equipAlbumEdition(restored,'GV059-L05-01'),false);restored.run.elapsed=13.25;restored.run.musicClock=2;const resumed=restoreState(JSON.stringify(restored));assert.equal(runSavedMusicElapsed(resumed.run),13.25);
 assert.ok(equipRecord(s,'pulse'));assert.equal(s.records.albumActive,undefined);assert.ok(startRun(s));assert.equal(s.run.albumEdition,undefined);assert.equal(runBeatTime(s.run,12),beatTime(1,12));
 const training={floor:1,albumEdition:edition,trainingClock:{version:1,bpm:80}};assert.equal(hasAlbumClock(training),false);assert.equal(runBeatTime(training,12),9);
});
test('invalid, unowned or cross-album saved editions are rejected without charging or changing ownership',()=>{
 const s=createState(8),before=structuredClone(s.records);for(const id of [edition,'missing',null])assert.equal(equipAlbumEdition(s,id),false);assert.deepEqual(s.records,before);
 assert.equal(restoreRecords({...s.records,albumActive:edition}),null);s.records.albumOwned=['dos88-city-stomper'];assert.equal(restoreRecords({...s.records,albumActive:'GV059-L04-01'}),null);assert.equal(restoreRecords({...s.records,albumActive:'missing'}),null);
 startRun(s);s.run.albumEdition=edition;s.records.albumOwned=[];assert.equal(restoreState(JSON.stringify(s)),null);
});
test('every approved timestamp remains exact across intro, loop seam and later cycles; inverse clock preserves irregular pairs',async()=>{
 for(const a of MUSIC_ALBUMS)for(const e of a.editions){
  const map=JSON.parse(await readFile(new URL('../dist/'+e.mapUrl,import.meta.url))),c=albumClock(e.id),r={floor:1,albumEdition:e.id};assert.equal(c.count,map.events.length);
  for(const cycle of [0,1,7])for(let i=0;i<c.count;i++){
   const p=4+cycle*c.count+i,t=c.start+cycle*map.duration+map.events[i].time;assert.ok(Math.abs(runBeatTime(r,p)-t)<1e-9);assert.ok(Math.abs(runBeatPhase(r,t)-p)<1e-8);
   assert.ok(Math.abs(runBeatPhase(r,runBeatTime(r,p+.49))-(p+.49))<1e-8);
  }
  for(const p of [-1,0,3.8,4])assert.ok(Math.abs(runBeatPhase(r,runBeatTime(r,p))-p)<1e-8);
 }
 const r={albumEdition:'GV059-L04-06'},c=albumClock(r.albumEdition),gap=c.times;assert.ok(gap.some((t,i)=>i>1&&Math.abs(t-gap[i-1]-(gap[1]-gap[0]))>.08));
 const at=gap.findIndex((t,i)=>i>1&&Math.abs(t-gap[i-1]-(gap[1]-gap[0]))>.08),positions=rhythmPositions(at+2.4,r).positions;assert.ok(positions.slice(2).some((p,i)=>Math.abs((p-positions[i+1])-(positions[1]-positions[0]))>.1));
});
test('native timing judge accepts a mapped hit and rejects one outside the real time window',()=>{
 const s=createState(38);s.stars=20;buyAlbum(s,'dos88-city-stomper');equipAlbumEdition(s,edition);startRun(s);const c=albumClock(edition),node=s.run.room.nodes.find(n=>n.hp>0);s.run.player={x:node.x,y:node.y+1};s.run.room.explored.fill(1);
 const result=act(s,{type:'hit',id:node.id},4);assert.ok(result.ok);assert.equal(s.run.acted,4);
 const t=runBeatTime(s.run,8)+actionWindowMs(s,8)/1000+.025,p=c.phase(t);const missed=act(s,{type:'hit',id:node.id},p);assert.equal(missed.miss,true);
});
function rig(){
 const sources=[],calls=[];const ctx={currentTime:10,state:'running',decodeAudioData:async()=>({duration:30}),createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),createBufferSource(){const s={connect(){},disconnect(){this.disconnected=true;},start(at,offset){this.at=at;this.offset=offset;},stop(){this.stopped=true;}};sources.push(s);return s;}};
 const music={ctx,enabled:true,master:{gain:{setTargetAtTime(){}}},voices:new Set(),update(){calls.push('synth');},silence(){calls.push('silence');},tone(){calls.push('intro');}},audio=attachRecordedExpedition(music,{fetchAudio:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)})});return{sources,calls,music,audio};
}
test('recorded transport shares the run offset, loops at the map boundary, stops on pause and resumes without added synth',async()=>{
 const q=rig(),clock=albumClock(edition);await q.audio.prepare(edition);const elapsed=clock.start+clock.duration-.04;q.music.update(elapsed,0,{albumEdition:edition});assert.equal(q.sources.length,1);assert.equal(q.sources[0].loopEnd,clock.duration);assert.ok(Math.abs(q.sources[0].offset-(clock.duration-.04))<1e-8);assert.equal(q.music.voices.size,1);assert.equal(q.calls.includes('synth'),false);
 q.music.ctx.currentTime+=.1;q.music.update(elapsed+.1,0,{albumEdition:edition});assert.equal(q.sources.length,1);q.music.silence();assert.ok(q.sources[0].stopped&&q.sources[0].disconnected);assert.equal(q.music.voices.size,0);
 q.music.ctx.currentTime+=10;q.music.update(elapsed+.1,0,{albumEdition:edition});assert.ok(Math.abs(q.sources[1].offset-.06)<1e-8);assert.equal(q.calls.includes('synth'),false);q.music.update(0,0,{});assert.equal(q.calls.at(-1),'synth');q.audio.dispose();assert.equal(q.music.voices.size,0);
});
test('load failure cannot start a wrong track or synth substitute; disposal ignores a late decode',async()=>{
 const q=rig();q.audio.dispose();const failed=attachRecordedExpedition(q.music,{fetchAudio:async()=>({ok:false})});assert.equal(await failed.prepare(edition),false);assert.equal(failed.getState().status,'error');assert.equal(q.sources.length,0);failed.dispose();
 let release;const r=rig();r.audio.dispose();const late=attachRecordedExpedition(r.music,{fetchAudio:()=>new Promise(resolve=>{release=resolve;})});const loading=late.prepare(edition);late.dispose();release({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});assert.equal(await loading,false);assert.equal(r.sources.length,0);
});
