import test from 'node:test';import assert from 'node:assert/strict';
import {createTrainingAudioGate} from '../dist/training-audio-gate.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
function fixture(){const loads=[],decoded=new Set(),states=[];let audible=true,unlock=true;const gate=createTrainingAudioGate({transport:{prepare:id=>{const d=deferred();loads.push({id,...d});return d.promise.then(ok=>{if(ok)decoded.add(id);return ok;});},ready:id=>decoded.has(id)},enableSound:async()=>unlock,soundEnabled:()=>audible,onChange:s=>states.push({...s})});return {gate,loads,decoded,states,mute:()=>audible=false,sound:()=>audible=true,lock:()=>unlock=false};}
test('audio waits for unlock and decode; duplicate starts share one request; readiness is checked',async()=>{const f=fixture(),a=f.gate.prepare('a'),b=f.gate.prepare('a');assert.equal(a,b);assert.equal(f.gate.state.status,'loading');assert.equal(f.gate.ready('a'),false);await flush();assert.equal(f.loads.length,1);f.loads[0].resolve(true);assert.equal(await a,true);assert.equal(f.gate.state.status,'ready');assert.equal(f.gate.ready('a'),true);});
test('failure is explicit; only a user retry reloads; context loss invalidates cached readiness',async()=>{const f=fixture(),a=f.gate.prepare('a');await flush();f.loads[0].reject(Error('offline'));assert.equal(await a,false);assert.equal(f.gate.state.status,'error');assert.equal(f.loads.length,1);const b=f.gate.prepare('a');await flush();f.loads[1].resolve(true);assert.equal(await b,true);f.decoded.clear();assert.equal(f.gate.ready('a'),false);});
test('exit, pause or hidden cancellation prevents late completion from resuming a training session',async()=>{const f=fixture(),a=f.gate.prepare('a');await flush();f.gate.cancel();f.loads[0].resolve(true);assert.equal(await a,false);assert.equal(f.gate.state.status,'idle');});
test('switching music discards stale result even when the earlier decode finishes last',async()=>{const f=fixture(),a=f.gate.prepare('a');await flush();f.gate.cancel();const b=f.gate.prepare('b');await flush();f.loads[1].resolve(true);assert.equal(await b,true);f.loads[0].resolve(true);assert.equal(await a,false);assert.deepEqual(f.gate.state,{status:'ready',editionId:'b'});});
test('deliberately muted visual practice loads no audio; switching sound on needs a real preparation',async()=>{const f=fixture();f.mute();assert.equal(await f.gate.prepare('a'),true);assert.equal(f.loads.length,0);assert.equal(f.gate.ready('a'),true);f.sound();assert.equal(f.gate.ready('a'),false);const p=f.gate.prepare('a');await flush();assert.equal(f.loads.length,1);f.loads[0].resolve(true);assert.equal(await p,true);});
test('failed unlock and unavailable transport never declare audible practice ready',async()=>{const f=fixture();f.lock();assert.equal(await f.gate.prepare('a'),false);assert.equal(f.loads.length,0);assert.equal(f.gate.state.status,'error');const gate=createTrainingAudioGate({enableSound:async()=>true,soundEnabled:()=>true});assert.equal(await gate.prepare('a'),false);assert.equal(gate.state.status,'error');});

// Execute the production host with stubbed presentation, not a browser. Domain,
// tutorial controller, ownership and audio gate are the real modules.
import {readFileSync} from 'node:fs';
import * as training from '../dist/tutorial-training.js';
import * as controller from '../dist/tutorial-controller.js';
import * as musicOptions from '../dist/training-music.js';
import * as core from '../dist/core.js';
import {MUSIC_ALBUMS} from '../dist/music-albums.js';
import {albumClock} from '../dist/album-clock.js';
function hostFixture(){
 const p=core.createState(5901);p.attempts=1;p.records.albumOwned=[MUSIC_ALBUMS[0].id];const before=JSON.stringify(p),values=new Map(),listeners=new Map(),loads=[],decoded=new Set();
 let callbacks,learningCallbacks,model,opts,frame,now=0,audible=true,updates=[];
 const node=()=>({dataset:{},style:{},hidden:false,classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},before(){},querySelector:()=>node(),getBoundingClientRect:()=>({left:0,top:0,width:900,height:600})});
 const doc={hidden:false,body:node(),documentElement:{dataset:{entryPending:'true'}},getElementById:()=>node(),createElement:()=>node(),querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(id,fn)=>listeners.set(id,fn),defaultView:{addEventListener(){},location:{reload(){}}}};
 const music={ctx:{state:'running'},silence(){},events(){},update:(elapsed,track,mood)=>updates.push({elapsed,track,mood})};
 class World{constructor(){this.camera={x:0,y:0};this.offsetX=0;this.offsetY=0;this.scale=1;}setSoft(){}place(){}resize(){}consume(){}draw(){}}
 const modules={...training,...controller,...musicOptions,...core,createTrainingAudioGate,World,project:(x,y)=>({x,y}),unproject:(x,y)=>({x,y}),
 createTrainingSurface:()=>({canvas:node(),show(){},feedback(){},target:()=>node(),update:data=>frame=data}),
 createTutorialView:options=>{callbacks=options;return {root:node(),render:(v,o)=>{model=v;opts=o;},live(){},layout(){},progress(){},contains:()=>false};},
 createHubGuide:()=>({hide(){},layout(){},active:false}),mountRefugeOnboarding:()=>({stop(){},frame(){},active:false}),
 mountContextualLearning:options=>{learningCallbacks=options;return {trainingFinished(){},hide(){},layout(){},opened(){},tick(){},events(){},active:false};}};
 let source=readFileSync(new URL('../dist/tutorial-runtime.js',import.meta.url),'utf8');
 const names=[...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*'[^']+';/g)].flatMap(m=>m[1].split(',').map(s=>s.trim()));
 source=source.replace(/import\s*\{[^}]+\}\s*from\s*'[^']+';/g,'').replace('export function mountTutorial','function mountTutorial');
 const mount=Function(...names,'requestAnimationFrame','performance',source+'\nreturn mountTutorial;')(...names.map(n=>modules[n]??(()=>{})),()=>{}, {now:()=>now});
 const runtime=mount({document:doc,storage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)},fresh:false,profile:()=>p,world:new World(),music,
 recordedAudio:{ready:id=>decoded.has(id),prepare:id=>{const d=deferred();loads.push({id,...d});return d.promise.then(ok=>{if(ok)decoded.add(id);return ok;});}},
 soundState:()=>audible,onSound:()=>audible=!audible,onEnableSound:async()=>true,closeDialog(){},update(){},toast(){},onRestoreClock(){},modeBpm:()=>100,saveProfile:()=>true,readFailed:()=>false,onUnsafeStorage(){},openPlace(){},openLift(){}});
 learningCallbacks.onTraining();return {runtime,p,before,values,loads,listeners,doc,get callbacks(){return callbacks;},get model(){return model;},get opts(){return opts;},get frame(){return frame;},get updates(){return updates;},advance(ms){now+=ms;runtime.frame(now);},select(){callbacks.onMusic(MUSIC_ALBUMS[0].editions[0].id);}};
}
test('host freezes during loading, then uses the recorded clock and audio mood; pause and exit stop progression',async()=>{
 const h=hostFixture();h.select();const id=h.opts.albumEdition,c=albumClock(id);assert.equal(h.model.step,'rhythmIntro');h.callbacks.onNext();await flush();assert.equal(h.opts.audioStatus,'loading');h.advance(100);h.advance(100);assert.equal(h.frame.view.elapsed,0);assert.equal(h.updates.length,0);
 h.loads[0].resolve(true);await flush();assert.equal(h.model.step,'rhythm');h.advance(100);h.advance(100);assert.ok(h.frame.view.elapsed>0);assert.deepEqual(h.updates.at(-1).mood,{albumEdition:id});assert.ok(Math.abs(h.frame.view.phase-c.phase(h.frame.view.elapsed))<1e-9);
 h.callbacks.onPause();h.advance(100);const stopped=h.frame.view.elapsed;h.advance(100);assert.equal(h.frame.view.elapsed,stopped);assert.equal(h.opts.paused,true);
 h.callbacks.onSkip();assert.equal(h.runtime.training,false);assert.equal(h.values.has('gemventure-tutorial-training-v2'),false);assert.equal(JSON.stringify(h.p),h.before);
});
test('host cancels pending start on exit or track change; failed loading allows explicit retry and free BPM fallback',async()=>{
 const h=hostFixture();h.select();h.callbacks.onNext();await flush();h.callbacks.onMusic('');h.loads[0].resolve(true);await flush();assert.equal(h.model.step,'rhythmIntro');assert.equal(h.opts.albumEdition,'');assert.equal(h.opts.audioStatus,'idle');
 h.select();h.callbacks.onNext();await flush();h.loads[1].resolve(false);await flush();assert.equal(h.opts.audioStatus,'error');assert.equal(h.model.step,'rhythmIntro');h.advance(100);assert.equal(h.frame.view.elapsed,0);
 h.callbacks.onNext();await flush();assert.equal(h.loads.length,3);h.callbacks.onSkip();h.loads[2].resolve(true);await flush();assert.equal(h.runtime.training,false);assert.equal(JSON.stringify(h.p),h.before);
});
test('switching and repeating a song resets the goal without rejecting accepted hits from a previous take',async()=>{
 const h=hostFixture();
 for(let take=0;take<2;take++){
  h.select();h.callbacks.onNext();await flush();h.loads.at(-1).resolve(true);await flush();h.advance(1);
  const c=albumClock(h.opts.albumEdition);
  for(let beat=4;beat<9;beat++){
   while(c.time(beat)-h.frame.view.elapsed>1e-8)h.advance(Math.min(200,(c.time(beat)-h.frame.view.elapsed)*1000));
   h.listeners.get('keydown')({code:'Space',repeat:false,target:{tagName:'CANVAS',closest:()=>null},preventDefault(){},stopImmediatePropagation(){}});
  }
  assert.equal(h.model.ready,true);assert.equal(h.opts.practice.consecutive,5);
 }
 h.callbacks.onSkip();assert.equal(JSON.stringify(h.p),h.before);
});
