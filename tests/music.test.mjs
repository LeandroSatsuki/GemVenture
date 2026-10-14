import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_TRACKS,beatTime,beatPhase,beatDuration,trackBeatTime,trackBeatPhase,trackCue,musicCue,timingGraceMs,savedMusicElapsed,scoreStep} from '../dist/score.js';
import {Music} from '../dist/audio.js';
import {createState,startRun,act,tick,actionWindowMs,restoreState} from '../dist/core.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b);
function arena(){const s=createState(71);startRun(s);Object.assign(s.run.room,{explored:null,visible:null,wave:null,terrain:Array(s.run.room.cols*s.run.room.rows).fill(0),nodes:[],rocks:[],enemies:[],quota:9999});s.run.player={x:4,y:7};return s;}
test('musical time is invertible and continuous across ramps, loops and long expeditions',()=>{
 for(let i=0;i<8;i++)for(const phase of [-.1,0,.25,27.999,28,31.999,32,32.25,35,36,64,96,128,159.999,160,160.1,192,320,16003.7]){
  const seconds=trackBeatTime(i,phase);near(trackBeatPhase(i,seconds),phase);
  assert.ok(trackBeatTime(i,phase+.001)>seconds);
 }
});
test('exploration tempo stays within gentle bounds and bosses keep their original pulse',()=>{
 for(const floor of [1,6,11,16]){
  const base=60/beatDuration(floor,0);
  for(let b=0;b<320;b++){const bpm=60/beatDuration(floor,b);assert.ok(bpm>=base*.97-1e-7&&bpm<=base*1.04+1e-7);if(b)assert.ok(Math.abs(bpm-60/beatDuration(floor,b-1))<=base*.011);}
  near(60/beatDuration(floor,40),base*1.04);near(60/beatDuration(floor,104),base*.97);
 }
 for(const floor of [5,10,15,20])for(let b=0;b<320;b++)near(beatDuration(floor,b),beatDuration(floor,0));
});
test('every change has four audible warning beats and a readable countdown',()=>{
 for(const index of [0,1,2,3,4,7])for(const boundary of [32,64,96,128,192]){
  for(let b=boundary-4;b<boundary;b++){
   const cue=trackCue(index,b);assert.equal(cue.warning,true);assert.equal(cue.count,boundary-b);
   assert.equal(scoreStep(index,b*4).filter(e=>e.kind==='cue').length,1);
  }
  assert.equal(trackCue(index,boundary-5).warning,false);
  assert.equal(trackCue(index,boundary).changing,true);
 }
 assert.equal(musicCue(1,28).label,'ACELERA');assert.equal(musicCue(1,60).label,'DESACELERA');assert.equal(musicCue(5,28).label,'VIRADA');
});
test('arrangements change density without dropping or adding required kicks',()=>{
 for(let i=0;i<8;i++){
  for(let step=0;step<640;step++)assert.equal(scoreStep(i,step).filter(e=>e.kind==='kick').length,step%4===0?1:0);
  const count=section=>Array.from({length:128},(_,k)=>scoreStep(i,section*128+k).length).reduce((a,b)=>a+b,0);
  assert.ok(count(1)>count(3),'impulse must sound fuller than respite');
 }
});
test('old cadence survives the gentle ramp; grace is bounded and does not allow double actions',()=>{
 for(const boundary of [32,64,96,128]){
  const s=arena(),floor=s.run.floor,oldDuration=beatDuration(floor,boundary-1),start=beatTime(floor,boundary);
  for(let k=0;k<8;k++){
   const phase=beatPhase(floor,start+k*oldDuration);
   const result=act(s,{type:'move',x:5+k%2,y:7},phase);
   assert.equal(result.ok,true,'old cadence '+boundary+'+'+k);
   assert.equal(act(s,{type:'move',x:5,y:7},phase).duplicate,true);
  }
  assert.equal(s.run.combo,8);assert.equal(s.run.rhythm,100);
  assert.equal(timingGraceMs(floor,boundary+8),0);
  assert.equal(act(s,{type:'move',x:5,y:7},boundary+10.48).miss,true);
 }
 assert.equal(timingGraceMs(5,32),0);
});
test('new tempo inputs, one-time enemy turns and mission time share the same clock',()=>{
 const s=arena();s.run.room.enemies=[{id:90,type:'enemy',kind:0,x:20,y:7,hp:200,maxHp:200,stunUntil:-1,windup:null}];
 s.mission={id:'clock',template:'miner',tier:'common',goal:999,progress:0,remaining:100,duration:100,status:'active'};
 let duration=0;
 for(let b=30;b<=39;b++){
  act(s,{type:'move',x:5+b%2,y:7},beatPhase(1,beatTime(1,b)));
  tick(s,b);duration+=beatDuration(1,b-1);const enemy=structuredClone(s.run.room.enemies[0]);tick(s,b);assert.deepEqual(s.run.room.enemies[0],enemy);
 }
 near(s.mission.remaining,100-duration);assert.equal(s.run.combo,10);
});
test('reload migration preserves beat position and the new clock is not converted twice',()=>{
 const s=arena();s.run.elapsed=70*60/116;s.run.clockBpm=116;
 const restored=restoreState(JSON.stringify(s)),elapsed=savedMusicElapsed(restored.run);
 near(beatPhase(1,elapsed),70);restored.run.elapsed=elapsed;restored.run.musicClock=2;
 near(savedMusicElapsed(restoreState(JSON.stringify(restored)).run),elapsed);
});
test('scheduler places every kick on the shared variable clock exactly once',()=>{
 for(const index of [0,3,7]){
  const music=new Music(),kicks=[];music.enabled=true;music.ctx={state:'running',currentTime:0};
  music.tone=(f,d,t,g,at)=>{if(f===155)kicks.push(at);};music.noise=()=>{};
  const end=trackBeatTime(index,160);
  for(let elapsed=0;elapsed<end;elapsed+=.025){music.ctx.currentTime=elapsed;music.update(elapsed,index);music.update(elapsed,index);}
  assert.equal(kicks.length,161);kicks.forEach((at,b)=>near(at,trackBeatTime(index,b)));
  music.silence();music.ctx.currentTime=200;music.update(trackBeatTime(index,35.9),index);
  assert.ok(kicks.at(-1)>=200);
 }
});
