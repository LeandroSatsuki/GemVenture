import test from 'node:test';
import assert from 'node:assert/strict';
import {createBubbleFeedback,installBubbleFeedback} from '../dist/ui-bubble-feedback.js';

function instrument(){
 const sources=[],gains=[],bus={name:'existing SFX bus'},master={name:'master'};
 const param=()=>({value:0,cancelScheduledValues(){},setTargetAtTime(){}});
 const ctx={state:'running',currentTime:1,createBuffer(ch,n,rate){assert.equal(ch,1);assert.equal(rate,24000);const data=new Float32Array(n);return {getChannelData:()=>data,data};},
  createGain(){const g={gain:param(),connections:[],connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;}};gains.push(g);return g;},
  createBufferSource(){const s={playbackRate:param(),connections:[],connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;}};
 const music={ctx,enabled:true,sfxBus:bus,master,voices:new Set(),effectVoices:new Set()};return {music,ctx,sources,gains,bus,master};
}
test('bubble cues use existing SFX graph and do not change its clock or preferences',()=>{
 const a=instrument(),prefs={enabled:true,sfxVolume:.4},original=JSON.stringify(prefs),fx=createBubbleFeedback(a.music,{preferences:()=>prefs});
 assert.ok(fx.emit('hover'));assert.equal(a.ctx.currentTime,1);assert.deepEqual(a.gains[0].connections,[a.bus]);assert.notEqual(a.gains[0].connections[0],a.master);assert.equal(a.music.effectVoices.size,1);
 assert.ok(a.sources[0].buffer.data.some(x=>x!==0));assert.ok(a.sources[0].buffer.data.every(Number.isFinite));assert.equal(JSON.stringify(prefs),original);
 a.ctx.currentTime+=.2;assert.ok(fx.emit('primary'));assert.equal(a.sources.at(-1).playbackRate.value,.92);assert.ok(a.sources[0].stopped);
 for(const source of a.sources)source.onended();assert.equal(a.music.effectVoices.size,0);assert.ok(a.sources.every(s=>s.disconnected));assert.ok(a.gains.every(s=>s.disconnected));
});
test('mute, zero SFX volume, hidden page and a full voice budget never bypass the mixer',()=>{
 const a=instrument();let prefs={enabled:false,sfxVolume:1},visible=true;const fx=createBubbleFeedback(a.music,{preferences:()=>prefs,visible:()=>visible});
 assert.equal(fx.emit(),false);prefs={enabled:true,sfxVolume:0};assert.equal(fx.emit(),false);prefs.sfxVolume=1;visible=false;assert.equal(fx.emit(),false);visible=true;
 a.music.voices=new Set(Array.from({length:80},()=>({})));assert.equal(fx.emit(),false);a.music.voices.clear();a.music.sfxBus=null;assert.equal(fx.emit(),false);assert.equal(a.sources.length,0);
});
test('fast input cannot stack bubbles or let hover interrupt a primary click; disposal stays silent',()=>{
 const a=instrument(),fx=createBubbleFeedback(a.music);assert.ok(fx.emit('primary'));a.ctx.currentTime+=.02;assert.equal(fx.emit('hover'),false);assert.equal(fx.emit('click'),false);
 a.ctx.currentTime+=.2;assert.ok(fx.emit('hover'));assert.equal(fx.emit('hover'),false);fx.dispose();assert.equal(fx.emit('primary'),false);assert.ok(a.sources.at(-1).stopped);
});
test('composed shadow events preserve the clicked identity when a UI remounts and respect canceled commands',async()=>{
 const a=instrument(),handlers=new Map(),doc={hidden:false,addEventListener(n,fn){handlers.set(n,fn);},removeEventListener(){}};
 const api=installBubbleFeedback(doc,a.music),button={tagName:'BUTTON',disabled:false,matches:s=>s.startsWith('.primary'),closest:()=>null},event={isTrusted:true,defaultPrevented:false,target:{closest:()=>null},composedPath:()=>[{},button,{},doc]};
 handlers.get('click')(event);button.matches=()=>false;assert.equal(api.handles(event),true,'generic beep remains suppressed after the clicked node changes');await Promise.resolve();assert.equal(a.sources.length,1);
 a.ctx.currentTime+=.2;button.matches=s=>s.startsWith('.primary');const canceled={...event};handlers.get('click')(canceled);canceled.defaultPrevented=true;await Promise.resolve();assert.equal(a.sources.length,1);
 doc.hidden=true;handlers.get('visibilitychange')();assert.ok(a.sources[0].stopped);api.dispose();
});

test('secondary clicks stay silent on hover, emit once after remount, and suppress the legacy command beep',async()=>{
 const a=instrument(),handlers=new Map(),doc={hidden:false,addEventListener(n,fn){handlers.set(n,fn);},removeEventListener(){}};let legacy=0;a.music.sfx=()=>{legacy++;return true;};
 const api=installBubbleFeedback(doc,a.music),button={tagName:'BUTTON',disabled:false,matches:()=>false,closest:()=>null},event={isTrusted:true,defaultPrevented:false,target:button,composedPath:()=>[button,doc]};
 handlers.get('pointerover')({...event,type:'pointerover'});assert.equal(a.sources.length,0);
 handlers.get('click')(event);button.disabled=true;assert.equal(api.command(),false);await Promise.resolve();assert.equal(a.sources.length,1);assert.equal(a.sources[0].playbackRate.value,1);assert.equal(legacy,0);
 assert.equal(api.command(),true);assert.equal(legacy,1);api.dispose();
});

test('domain-owned descent does not get a second input sound and canceled secondary clicks remain silent',async()=>{
 const a=instrument(),handlers=new Map(),doc={hidden:false,addEventListener(n,fn){handlers.set(n,fn);},removeEventListener(){}};
 const api=installBubbleFeedback(doc,a.music),b={tagName:'BUTTON',disabled:false,matches:s=>s.startsWith('#descend'),closest:()=>null},e={isTrusted:true,defaultPrevented:false,target:b,composedPath:()=>[b,doc]};
 handlers.get('click')(e);await Promise.resolve();assert.equal(a.sources.length,0);
 b.matches=()=>false;const canceled={...e};handlers.get('click')(canceled);canceled.defaultPrevented=true;await Promise.resolve();assert.equal(a.sources.length,0);api.dispose();
});
