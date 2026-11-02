import {stairReady} from '../dist/cave-descent.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Core from '../dist/core.js';
import {closeMinibossFloor} from '../dist/cave-miniboss.js';
import {arrivalPlan,presentationSlots,bossExitPlan} from '../dist/cave-arrival-plan.js';
import {createCaveArrivalPresentation,CAVE_ARRIVAL_PLACEMENT,CAVE_ARRIVAL_EDGE} from '../dist/cave-arrival-presentation.js';
function state(seed=712,floor=1){const s=Core.createState(seed);s.seals=6;Core.startRun(s);s.run.floor=floor;Core.generateRoom(s);return s;}
function drawing(){return new Proxy({events:[]},{get:(target,key)=>key in target?target[key]:(...args)=>target.events.push([key,...args])});}
function paths(fn){const previous=globalThis.Path2D;globalThis.Path2D=class{constructor(){this.paths=[];}rect(...args){this.paths.push(['rect',...args]);}addPath(p){this.paths.push(['addPath',p]);}};try{return fn();}finally{if(previous===undefined)delete globalThis.Path2D;else globalThis.Path2D=previous;}}
test('one noninteractive arrival stays at seeded entry across movement, clear and serialized synthetic reload',()=>{
 for(let bi=0;bi<7;bi++)for(const seed of [1,7,712,713]){
  const s=state(seed,bi*5+1),before=JSON.stringify(s),a=arrivalPlan(s.run);assert.ok(a.enabled);assert.equal(a.collision,false);assert.equal(a.interactive,false);assert.deepEqual(a.exit,s.run.room.exit);assert.deepEqual(a.spawn,s.run.room.layout.spawn);assert.equal(a.mount.x+1,a.doorstep.x);assert.equal(a.mount.y,a.spawn.y);assert.deepEqual(a.mountHalf,{x:50+22*a.mount.x+2*a.mount.y,y:57.5+16*a.mount.y});assert.equal(JSON.stringify(s),before);
  s.run.player.x+=2;s.run.player.y+=1;assert.deepEqual(arrivalPlan(s.run).mountHalf,a.mountHalf);
  closeMinibossFloor(s.run);s.run.room.enemies=[];s.run.room.cleared=true;const saved=Core.restoreState(JSON.stringify(s));assert.ok(saved);assert.deepEqual(arrivalPlan(saved.run).mountHalf,a.mountHalf);
  const slots=presentationSlots(saved.run);assert.equal(slots.filter(v=>v.role==='arrival-lift').length,1);assert.equal(slots.filter(v=>v.role==='legacy-exit-lift').length,0);assert.equal(slots.find(v=>v.role==='exit-stair').usesPhysicalStep,true);assert.deepEqual(slots.find(v=>v.role==='exit-stair').at,s.run.room.exit);
 }
});
test('legacy rectangles keep their real exit; bosses have exit-only roles and Abyss stays excluded',()=>{
 for(let bi=0;bi<7;bi++){
  const s=state(712,bi*5+1);s.run.room={cols:21,rows:15,seed:712,exit:{x:18,y:2},cleared:true};assert.ok(arrivalPlan(s.run).enabled);assert.deepEqual(arrivalPlan(s.run).exit,{x:18,y:2});
  const boss=state(712,bi*5+5);assert.equal(arrivalPlan(boss.run).enabled,false);assert.deepEqual(presentationSlots(boss.run),[{role:'exit-stair',at:{...boss.run.room.exit},locked:true,usesPhysicalStep:true}]);assert.equal(bossExitPlan(boss.run).kind,'boss-exit-only');
 }
 const run=state().run;run.mode='abyss';assert.deepEqual(presentationSlots(run),[]);delete run.mode;run.room.cols=43;assert.equal(arrivalPlan(run).reason,'unknown-room-geometry');run.room.cols=42;run.room.rows=30;delete run.room.campaignCave;delete run.room.layout;run.room.floorMask=Array.from({length:1260},(_,i)=>+(i%42>0&&i%42<41&&Math.floor(i/42)>0&&Math.floor(i/42)<29));run.room.floorMask[11*42+1]=0;assert.equal(arrivalPlan(run).reason,'entry-geometry-not-compatible');assert.equal(presentationSlots(run)[0].role,'legacy-exit-lift');
});
test('slow layers keep one procedural arrival and invalidate cache once after all layers become ready',async()=>{
 let release,ready=false,loads=0,painted=0,fallbacks=0;
 const deferred=new Promise(resolve=>release=resolve),api=createCaveArrivalPresentation({assets:{load(){loads++;return deferred;},status:()=>({ready,failed:[]}),paint(){painted++;}},paintFallback(c,p){assert.deepEqual(p,CAVE_ARRIVAL_PLACEMENT);fallbacks++;}}),s=state();s.run.room.explored[s.run.room.exit.y*s.run.room.cols+s.run.room.exit.x]=1;const original=JSON.stringify(s);
 assert.equal(api.status().phase,'cold');const a=api.load(),b=api.load();assert.equal(a,b);await Promise.resolve();assert.equal(loads,1);assert.equal(api.revision(),0);
 paths(()=>{const c=drawing(),ground={actual:true};assert.ok(api.paint(c,s.run,ground));assert.equal(fallbacks,1);assert.equal(painted,0);assert.ok(c.events.some(v=>v[0]==='fill'),'ground opening is drawn even before clear');assert.equal(c.events.some(v=>v[0]==='clip'&&v[2]==='evenodd'),true);assert.equal(c.events.filter(v=>v[0]==='lineTo').some(v=>v[1]===83.6875&&v[2]===239),true);});
 ready=true;release();assert.equal(await a,true);assert.equal(api.revision(),1);assert.equal(api.status().phase,'ready');assert.equal(await api.load(),true);assert.equal(loads,1);assert.equal(api.revision(),1);
 paths(()=>{const c=drawing();s.run.room.cleared=true;assert.ok(api.paint(c,s.run,{}));assert.equal(painted,1);assert.equal(fallbacks,1);assert.ok(c.events.some(v=>v[0]==='fill'),'arrival and stair remain painted');s.run.room.cleared=false;});assert.equal(JSON.stringify(s),original);
});
test('rejection, incomplete layers and synchronous errors resolve to a stable fallback without retries',async()=>{
 for(const kind of ['reject','partial','throw','status-error']){
  let calls=0,fallbacks=0;const api=createCaveArrivalPresentation({assets:{load(){calls++;if(kind==='throw')throw Error('decode');return kind==='reject'?Promise.reject(Error('decode')):Promise.resolve();},status(){if(kind==='status-error')throw Error('status');return{ready:false,failed:['cabin']};}},paintFallback(){fallbacks++;}});
  assert.equal(await api.load(),false);assert.equal(await api.load(),false);assert.equal(calls,1);assert.equal(api.revision(),0);
  paths(()=>{assert.ok(api.paint(drawing(),state().run,{}));assert.ok(api.paint(drawing(),state().run,{}));});assert.equal(fallbacks,2);
 }
});
test('painting needs the actual World ground and skips all cabin work outside the compatible scope',()=>{
 let draws=0;const api=createCaveArrivalPresentation({assets:{load:()=>Promise.resolve(),status:()=>({ready:false,failed:[]})},paintFallback(){draws++;}}),s=state();assert.throws(()=>api.paint(drawing(),s.run),/current World ground/);
 paths(()=>{const incompatible=state().run;incompatible.room.cols=43;assert.equal(api.paint(drawing(),incompatible,{}),false);const abyss=state().run;abyss.mode='abyss';assert.equal(api.paint(drawing(),abyss,{}),true);});assert.equal(draws,0);assert.deepEqual(CAVE_ARRIVAL_EDGE,[[82,230],[82.5625,230],[83.6875,239],[82,239]]);
});

test('boss arenas never expose a cabin even when an old caller requests the revoked opt-in',()=>{
 for(const floor of [5,10,15,20,25,30,35])for(const seed of [1,7,19,712]){
  const s=state(seed,floor),before=JSON.stringify(s);assert.deepEqual(arrivalPlan(s.run),{enabled:false,reason:'outside-common-floor-scope'});assert.equal(arrivalPlan(s.run,{allowAuditedBoss:true}).enabled,false);assert.deepEqual(presentationSlots(s.run),[{role:'exit-stair',at:{...s.run.room.exit},locked:true,usesPhysicalStep:true}]);assert.equal(bossExitPlan(s.run).kind,'boss-exit-only');assert.deepEqual(bossExitPlan(s.run).exit,s.run.room.exit);assert.equal(Core.bossExitReady(s.run),false);assert.equal(Core.descend(s),false);assert.equal(JSON.stringify(s),before);
 }
 for(const floor of [1,6,11,16,21,26,31]){const s=state(712,floor);assert.ok(arrivalPlan(s.run).enabled);assert.equal(bossExitPlan(s.run),null);assert.equal(presentationSlots(s.run).filter(v=>v.role==='arrival-lift').length,1);}
});
test('cold, ready and failed raster states never paint a boss cabin or its support',async()=>{
 for(const failure of [false,true]){
  let release,ready=false,fallbacks=0,rasters=0;const pending=new Promise(resolve=>release=resolve),api=createCaveArrivalPresentation({assets:{load:()=>pending,status:()=>({ready,failed:failure?['cabin']:[]}),paint(){rasters++;}},paintFallback(){fallbacks++;}}),loading=api.load();await Promise.resolve();
  for(const floor of [5,10,15,20,25,30,35]){const s=state(712,floor),before=JSON.stringify(s),c=drawing();assert.ok(api.paint(c,s.run));assert.equal(c.events.filter(v=>v[0]==='rect').length,0);assert.ok(c.events.some(v=>v[0]==='fill'),'stair paints its ground opening');assert.equal(JSON.stringify(s),before);}
  ready=!failure;release();assert.equal(await loading,!failure);
  for(const floor of [5,10,15,20,25,30,35]){const s=state(712,floor),before=JSON.stringify(s),c=drawing();assert.ok(api.paint(c,s.run));assert.equal(c.events.filter(v=>v[0]==='rect').length,0);assert.ok(c.events.some(v=>v[0]==='fill'),'stair paints its ground opening');assert.equal(JSON.stringify(s),before);}
  assert.equal(fallbacks,0);assert.equal(rasters,0);
 }
});
test('cleared boss keeps only the real exit marker while card and final-floor gates remain authoritative',()=>{
 let fallback=0,raster=0;const api=createCaveArrivalPresentation({assets:{load:()=>Promise.resolve(),status:()=>({ready:false,failed:[]}),paint(){raster++;}},paintFallback(){fallback++;}});
 for(const floor of [5,10,15,20,25,30,35]){const s=state(712,floor);s.run.room.enemies.forEach(e=>e.hp=0);s.run.room.bossDefeated=true;s.run.room.cleared=true;const before=JSON.stringify(s),c=drawing();assert.ok(api.paint(c,s.run));assert.ok(c.events.some(v=>v[0]==='fill'),'stair paints its ground opening');assert.equal(c.events.filter(v=>v[0]==='rect').length,0);assert.equal(JSON.stringify(s),before);assert.deepEqual(presentationSlots(s.run),[{role:'exit-stair',at:{...s.run.room.exit},locked:false,usesPhysicalStep:true}]);assert.equal(Core.descend(s),false);}
 assert.equal(fallback,0);assert.equal(raster,0);
});

test('restored stale boss flags cannot enable advance or paint an active exit before victory',()=>{
 for(const floor of [5,10,15,20,25,30,35]){
  const stale=state(712,floor);stale.run.room.cleared=true;stale.run.cardChosen=true;stale.run.room.charge=99999;stale.run.combo=999;
  assert.equal(Core.bossExitReady(stale.run),false);assert.equal(Core.descend(stale),false);
  const restored=Core.restoreState(JSON.stringify(stale));assert.ok(restored);assert.equal(restored.run.room.cleared,false);assert.equal(Core.bossExitReady(restored.run),false);assert.equal(Core.descend(restored),false);const before=JSON.stringify(restored);
  const api=createCaveArrivalPresentation({assets:{load:()=>Promise.resolve(),status:()=>({ready:false,failed:[]})},paintFallback(){}});paths(()=>{const c=drawing();assert.ok(api.paint(c,restored.run,{}));assert.equal(stairReady(restored.run),false);});assert.equal(JSON.stringify(restored),before);
 }
});
