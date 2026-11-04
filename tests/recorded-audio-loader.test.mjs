import test from 'node:test';import assert from 'node:assert/strict';
import {loadRecordedAudio,recordedAudioReady} from '../dist/recorded-audio-loader.js';
import {createRecordedAlbumPlayer} from '../dist/recorded-album-player.js';
const edition={id:'a',audioUrl:'a.mp3',duration:20};
const response=()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
const context=()=>({decodeAudioData:async()=>({duration:20,sampleRate:48000,numberOfChannels:2,length:960000})});
test('simultaneous consumers share download/decode; reuse is scoped to context and URL',async()=>{
 let requests=0,decodes=0;const ctx=context(),fetchAudio=async()=>{requests++;return response();};ctx.decodeAudioData=async()=>{decodes++;return{duration:20};};
 const [a,b]=await Promise.all([loadRecordedAudio(ctx,edition,{fetchAudio}),loadRecordedAudio(ctx,edition,{fetchAudio})]);assert.equal(a,b);assert.equal(requests,1);assert.equal(decodes,1);assert.ok(recordedAudioReady(ctx,edition,fetchAudio));
 assert.equal(await loadRecordedAudio(ctx,{...edition,id:'renamed'},{fetchAudio}),a);assert.equal(requests,1);
 await loadRecordedAudio(context(),edition,{fetchAudio});assert.equal(requests,2);
});
test('timeout releases pending entry and ignores a late file; another click can retry',async()=>{
 let release,requests=0;const ctx=context(),fetchAudio=()=>{requests++;return requests===1?new Promise(r=>{release=r;}):Promise.resolve(response());};
 await assert.rejects(loadRecordedAudio(ctx,edition,{fetchAudio,timeoutMs:15}),/demorou/);await loadRecordedAudio(ctx,edition,{fetchAudio});release(response());await new Promise(r=>setTimeout(r,0));assert.equal(requests,2);assert.ok(recordedAudioReady(ctx,edition,fetchAudio));
});
test('canceling one listener does not cancel another consumer or start canceled playback',async()=>{
 let release;const ctx=context(),fetchAudio=()=>new Promise(r=>{release=r;}),abort=new AbortController();
 const a=loadRecordedAudio(ctx,edition,{fetchAudio,signal:abort.signal}),b=loadRecordedAudio(ctx,edition,{fetchAudio});abort.abort();await assert.rejects(a,{name:'AbortError'});release(response());assert.equal((await b).duration,20);
});
test('truncated and undecodable downloads do not become cached successful music',async()=>{
 const ctx=context(),fetchAudio=async()=>response();ctx.decodeAudioData=async()=>({duration:10});await assert.rejects(loadRecordedAudio(ctx,edition,{fetchAudio}),/incompleto/);assert.equal(recordedAudioReady(ctx,edition,fetchAudio),false);ctx.decodeAudioData=async()=>{throw Error('decode');};await assert.rejects(loadRecordedAudio(ctx,edition,{fetchAudio}),/decode/);ctx.decodeAudioData=context().decodeAudioData;assert.equal((await loadRecordedAudio(ctx,edition,{fetchAudio})).duration,20);
});
test('decoded LRU has a memory budget instead of keeping the entire library',async()=>{
 let requests=0;const ctx=context(),fetchAudio=async()=>{requests++;return response();};ctx.decodeAudioData=async()=>({duration:20,length:4*1024*1024,numberOfChannels:2});
 await loadRecordedAudio(ctx,edition,{fetchAudio});await loadRecordedAudio(ctx,{...edition,audioUrl:'b.mp3'},{fetchAudio});assert.equal(recordedAudioReady(ctx,edition,fetchAudio),false);await loadRecordedAudio(ctx,edition,{fetchAudio});assert.equal(requests,3);
});
test('closing and reopening the vitrola keeps the prepared recording; a new context cannot reuse it',async()=>{
 let requests=0;const fetchAudio=async()=>{requests++;return response();},ctx={...context(),state:'running',currentTime:0,createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),createBufferSource:()=>({connect(){},disconnect(){},start(){},stop(){}})},engine={ctx,master:{gain:{setTargetAtTime(){}}},home(){},silence(){},stopPreview(){}},audio={engine,controller:{getState:()=>({preferences:{enabled:true}}),unlock:async()=>true}},options={audio,editionById:()=>edition,fetchAudio};
 let player=createRecordedAlbumPlayer(options);assert.ok(await player.prepare('a'));assert.equal(player.getState().status,'idle');assert.ok(await player.play('a'));player.dispose();player=createRecordedAlbumPlayer(options);assert.ok(await player.play('a'));assert.equal(requests,1);player.dispose();
});
