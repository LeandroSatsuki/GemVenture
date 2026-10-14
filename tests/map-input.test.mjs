import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {roomSize,reveal,visible,explored} from '../dist/cavern.js';
import {World,project,caveCameraY,abyssCameraY,cameraFollow,bumpOffset} from '../dist/world.js';
import {Effects} from '../dist/effects.js';

function arena(mode='floors'){
 const s=E.createState(712);s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];
 E.startRun(s,mode);const r=s.run,{cols,rows}=roomSize(r.room);
 r.room.nodes=[];r.room.enemies=[];r.room.rocks=[];r.room.terrain=Array(cols*rows).fill(0);
 r.room.charge=0;r.room.cleared=false;r.room.wave=null;r.player={x:12,y:rows-2};
 r.combo=7;r.rhythm=70;r.events=[];reveal(r.room,r.player);
 return s;
}

for(const mode of ['floors','abyss']){
 test(`${mode}: wall, outside, fog, same-cell and stale-target clicks count on the beat`,()=>{
  const s=arena(mode),r=s.run,start={...r.player},before=r.rhythm,points=r.score.points;
  const actions=[{type:'move',x:12,y:r.room.rows-1},{type:'move',x:-20,y:200},
   {type:'move',x:35,y:2},{type:'move',...start},{type:'hit',id:9999},{type:'dodge',dx:0,dy:1}];
  for(const [beat,action] of actions.entries()){
   const result=E.act(s,action,beat);assert.equal(result.ok,true);assert.equal(result.bumped,true);
   assert.equal(r.acted,beat);assert.equal(r.combo,8+beat);assert.deepEqual(r.player,start);
   assert.equal(E.act(s,action,beat).duplicate,true);assert.equal(r.combo,8+beat);
  }
  assert.ok(r.rhythm>=before);assert.equal(r.events.filter(e=>e.type==='perfect').length,actions.length);
  assert.equal(r.events.filter(e=>e.type==='bump').length,actions.length);
  assert.equal(r.events.some(e=>e.type==='hurt'),false);assert.equal(r.score.points,points);
  assert.equal(r.room.charge,0);assert.equal(r.room.cleared,false);
  assert.equal(visible(r.room,{x:35,y:2}),false);assert.equal(explored(r.room,{x:35,y:2}),false);
 });
 test(`${mode}: blocked taps still obey timing, and cannot replay a missed beat`,()=>{
  const s=arena(mode),r=s.run,a={type:'move',x:12,y:999};
  assert.equal(E.act(s,a,.45).miss,true);assert.equal(r.combo,0);assert.ok(r.rhythm<70);
  const breath=r.rhythm;assert.equal(E.act(s,a,0).duplicate,true);assert.equal(r.rhythm,breath);
  assert.equal(E.act(s,a,1).ok,true);assert.equal(r.combo,1);
 });
 test(`${mode}: rocks stay solid and stationary beats cannot mine with Echo`,()=>{
  const s=arena(mode),r=s.run;s.unlocked=['echo'];s.equipped=['echo'];
  r.room.rocks=[{id:900,type:'rock',kind:0,x:13,y:r.player.y,hp:200,maxHp:200}];
  r.room.nodes=[{id:901,type:'crystal',kind:0,x:9,y:r.player.y,hp:200,maxHp:200,value:2,born:0}];
  reveal(r.room,r.player);const before={...r.player};
  for(let beat=0;beat<12;beat++)E.act(s,{type:'move',x:13,y:r.player.y},beat);
  assert.equal(r.combo,19);assert.deepEqual(r.player,before);assert.equal(r.room.rocks[0].hp,200);
  assert.equal(r.room.nodes[0].hp,200);assert.equal(r.score.points,0);assert.equal(r.bag,0);
  assert.equal(r.events.some(e=>['hit','loot','echo','nova'].includes(e.type)),false);
 });
 test(`${mode}: clock resolution accepts wall taps instead of applying a second silence penalty`,()=>{
  const s=arena(mode),r=s.run;r.guardUntil=1000;
  for(let beat=4;beat<9;beat++){
   assert.equal(E.act(s,{type:'dodge',dx:0,dy:1},beat).ok,true);
   const combo=r.combo,breath=r.rhythm;E.tick(s,beat);
   assert.equal(r.combo,combo);assert.ok(r.rhythm>=breath);
  }
  assert.equal(r.events.some(e=>e.type==='hurt'&&e.reason==='silence'),false);
 });
}

test('fog lookup never wraps an outside click into a visible cell on another row',()=>{
 const s=arena(),room=s.run.room;room.explored.fill(1);room.visible.fill(1);
 for(const p of [{x:-1,y:5},{x:room.cols,y:4},{x:2,y:-1},{x:1.5,y:4}]){
  assert.equal(visible(room,p),false);assert.equal(explored(room,p),false);
 }
});
test('invalid commands and paused/recovery states do not consume beats',()=>{
 const s=arena(),r=s.run;
 for(const action of [{type:'move',x:NaN,y:0},{type:'dodge',dx:9,dy:0},{type:'wat'},{type:'item',item:'tonic'}])assert.equal(E.act(s,action,0).ok,false);
 assert.equal(r.combo,7);r.recovery={active:true};assert.equal(E.act(s,{type:'move',x:0,y:0},0).ok,false);assert.equal(r.combo,7);
});
test('bottom edge camera keeps the miner clear of the lower HUD in floors and abyss',()=>{
 const player=project(12,28);
 for(const mode of ['floors','abyss'])for(const height of [620,900])for(const fps of [30,60,144]){
  let camera=400;
  for(let i=0;i<fps*4;i++){
   const next=mode==='floors'?caveCameraY(camera,player.y,height,1/fps):cameraFollow(camera,abyssCameraY(player.y),1/fps);
   assert.ok(Math.abs(next-camera)<=420/fps+1e-8,'no scenery teleport');camera=next;
  }
  assert.ok(player.y-camera>260&&player.y-camera<320,'feet remain in the safe middle');
  assert.equal(caveCameraY(camera,player.y,height,0),camera,'pause freezes camera');
  const canvas={getBoundingClientRect:()=>({left:8,top:46})},scale=.8;
  const hit=World.prototype.pointer.call({canvas,camera:{x:120,y:camera},scale,offsetX:0,offsetY:0},
   {clientX:8+(player.x-120)*scale,clientY:46+(player.y-camera)*scale});
  assert.ok(Math.abs(hit.x-player.x)<1e-7&&Math.abs(hit.y-player.y)<1e-7);
 }
});
test('wall recoil advances then returns, without moving the logical render anchor or camera',()=>{
 const w=Object.assign(Object.create(World.prototype),{player:project(12,28),target:project(12,28),trail:[],route:null,reduced:false,fx:new Effects(),camera:{x:100,y:700}});
 const anchor={...w.player},camera={...w.camera};w.consume([{type:'bump',x:12,y:28,dx:0,dy:1}]);
 w.advanceMovement(.06);assert.ok(bumpOffset(w.bump).y>0);
 const pose=bumpOffset(w.bump);w.advanceMovement(2,true);assert.deepEqual(bumpOffset(w.bump),pose);
 w.advanceMovement(.12);assert.ok(bumpOffset(w.bump).y<0);assert.deepEqual(w.player,anchor);assert.deepEqual(w.camera,camera);
 w.advanceMovement(.1);assert.equal(w.bump,null);assert.deepEqual(bumpOffset(w.bump),{x:0,y:0});
 w.setSoft(true);w.consume([{type:'bump',x:12,y:28,dx:0,dy:1}]);assert.equal(w.bump,null);
 w.setSoft(false);w.consume([{type:'bump',x:12,y:28,dx:0,dy:1}]);w.place({run:{player:{x:3,y:11}}});assert.equal(w.bump,null);
});
