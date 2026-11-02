import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createState,restoreState,startRun} from '../dist/core.js';
import {earnedStars,reliquaryUnlocked,cleanMinerName} from '../dist/refuge-journey.js';
import {awardScore} from '../dist/stars.js';import {REFUGE_TOUR} from '../dist/refuge-onboarding.js';
import {bossMeshV2} from '../dist/dungeon-bosses-v2.js';
import {attachRecordedHomeTrack} from '../dist/recorded-home-track.js';
test('name and journey persist without changing balances; invalid name markup is removed',()=>{
 const s=createState(41001);s.journey.name=cleanMinerName('  Lumi <3>  ');s.journey.tourStep='mine';s.journey.earnedStars=35;
 const copy=restoreState(JSON.stringify(s));assert.equal(copy.journey.name,'Lumi 3');assert.equal(copy.journey.earnedStars,35);assert.equal(copy.bank,s.bank);assert.equal(copy.journey.tourStep,'mine');assert.equal(cleanMinerName('x'.repeat(80)).length,24);
});
test('reliquary opens at 30 cumulative stars and stays open after spending or reload',()=>{
 const s=createState(41001);s.stars=29;assert.equal(reliquaryUnlocked(s),false);s.journey.earnedStars=30;s.stars=0;assert.equal(reliquaryUnlocked(s),true);assert.equal(reliquaryUnlocked(restoreState(JSON.stringify(s))),true);
 const legacy=createState(41001);delete legacy.journey;legacy.seals=3;legacy.stars=4;assert.equal(earnedStars(legacy),30);assert.equal(reliquaryUnlocked(legacy),true);
});
test('score awards advance cumulative stars exactly once',()=>{const s=createState(41001);startRun(s);awardScore(s,Math.round(s.run.score.target*.15),0);assert.equal(s.stars,1);assert.equal(s.journey.earnedStars,1);awardScore(s,0,0);assert.equal(s.journey.earnedStars,1);});
test('onboarding uses real lobby and forge controls, no old island coordinates or automatic purchases',()=>{
 assert.equal(new Set(REFUGE_TOUR.map(x=>x.id)).size,REFUGE_TOUR.length);assert.ok(REFUGE_TOUR.findIndex(x=>x.id==='missions')<REFUGE_TOUR.findIndex(x=>x.id==='mine'));
 for(const s of REFUGE_TOUR){assert.doesNotMatch(s.text,/ilha|Zag|fonte da sorte/i);if(s.click)assert.ok(s.target.startsWith('#refugeLobby')||s.target.startsWith('[data-forge='));}assert.equal(REFUGE_TOUR.filter(x=>x.name).length,1);
});
test('new boss geometry is finite, repeatable, distinct and directional with rigid arm pieces',()=>{
 const signatures=new Set();for(let i=1;i<=5;i++)for(const direction of ['down','left','up','right']){
  const a=bossMeshV2(i,{direction,soft:true}),b=bossMeshV2(i,{direction,soft:true});assert.deepEqual(a,b);assert.ok(a.length>20);signatures.add(JSON.stringify(a));
  for(const f of a){assert.ok(f.points.flat().every(Number.isFinite));assert.ok(f.normal.every(Number.isFinite));assert.ok(f.points.length>=3);}
  // Rotation is orthonormal: no arm vertex is stretched during preparation.
  const full=bossMeshV2(i,{direction,soft:true,includeHidden:true}),wind=bossMeshV2(i,{direction,soft:true,includeHidden:true,windup:{startedBeat:0,beat:3},beat:3});
  for(const f of full.filter(x=>/arm|branch|sleeve/.test(x.id))){const length=p=>Math.hypot(...p[1].map((v,k)=>v-p[0][k]));const candidates=wind.filter(x=>x.id===f.id);if(candidates.length)assert.ok(candidates.some(g=>Math.abs(length(g.points)-length(f.points))<1e-5));}
 }assert.equal(signatures.size,20);
});
test('recording shares the existing bus and resumes after pause without a second active source',async()=>{
 const saved=globalThis.fetch;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(2)});let starts=[],stops=0;const bus={};
 const music={enabled:true,ctx:{state:'running',currentTime:0,decodeAudioData:async()=>({duration:90}),createBufferSource:()=>({connect(target){assert.equal(target,bus);},start(_when,offset){starts.push(offset)},stop(){stops++},disconnect(){}})},outputFor:()=>bus,home(){},silence(){}};
 try{const ctl=attachRecordedHomeTrack(music);music.home(0);await new Promise(r=>setImmediate(r));music.home(0);music.home(1);assert.equal(starts.length,1);music.ctx.currentTime=12;music.silence();assert.equal(stops,1);assert.equal(ctl.playing,false);music.ctx.currentTime=20;music.home(20);assert.deepEqual(starts,[0,12]);}finally{globalThis.fetch=saved;}
});
test('refinement ships only current icon resources and native boss previews',async()=>{
 const {missionArt}=await import('../dist/missions-assets.js');for(const path of Object.values(missionArt))assert.ok((await readFile(new URL('../dist/'+path,import.meta.url))).length>0,path);
 for(let i=1;i<=5;i++)assert.match(await readFile(new URL('../dist/assets/dungeon-refinement-v2/boss-'+i+'.svg',import.meta.url),'utf8'),/<path/);
});


test('all biome liquids and native fire respect Canvas arity and finite coordinates',async()=>{
 const {generateRoom}=await import('../dist/core.js'),{paintDungeonEnvironment}=await import('../dist/dungeon-environment.js'),{paintVoxelExplosion}=await import('../dist/dungeon-fx.js');
 const saved=globalThis.Path2D;let draws=0;
 const method=name=>(...args)=>{if(name==='ellipse')assert.ok(args.length>=7,'ellipse requires start and end angles');for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),name);draws++;};
 globalThis.Path2D=class{constructor(){return new Proxy(this,{get:(_t,k)=>method(k)});}};
 const c=new Proxy({globalAlpha:1,createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:method(k)});
 try{for(let b=0;b<7;b++){const s=createState(41001);s.seals=6;startRun(s);s.run.floor=b*5+1;generateRoom(s);for(const soft of [false,true])paintDungeonEnvironment(c,s.run.room,b,2.75,{soft});}for(let i=0;i<30;i++)paintVoxelExplosion(c,20,30,i/60);assert.ok(draws>100);}finally{globalThis.Path2D=saved;}
});
