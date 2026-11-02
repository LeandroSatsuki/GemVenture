import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {initAbyss} from '../dist/frenzy.js';
import {World,project} from '../dist/world.js';
import {Effects} from '../dist/effects.js';
import {fireRingFrame} from '../dist/power-vfx.js';

function arena(cards={}){
 const s=E.createState(71);E.startRun(s);rectangularRoom(s);Object.assign(s.run,{cards,health:40});
 Object.assign(s.run.room,{explored:null,visible:null,floorMask:null,layout:null,wave:null,terrain:Array(s.run.room.cols*s.run.room.rows).fill(0),rocks:[],enemies:[],nodes:[],quota:999});
 for(const [x,y]of [[4,11],[3,10]])s.run.room.nodes.push({id:s.run.room.nextId++,type:'crystal',kind:0,x,y,hp:10000,maxHp:10000,value:10,born:0});
 return s;
}
function context(){
 const stack=[],paths=[];let path=[];
 const c=new Proxy({globalAlpha:1,globalCompositeOperation:'source-over',
  save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},
  beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},
  fill(){paths.push(path);},stroke(){paths.push(path);},
 },{get:(o,k)=>k in o?o[k]:(()=>{})});return {c,paths,stack};
}
test('ricochet card and all echo emitters use tapered rays anchored to the actual source',()=>{
 const s=arena({ricochet:1});E.act(s,{type:'hit',id:s.run.room.nodes[0].id},0);
 const echo=s.run.events.find(e=>e.type==='echo');assert.ok(echo);assert.deepEqual(echo.from,{...s.run.room.nodes[0]});
 const before=JSON.stringify(s),fx=new Effects();fx.consume([echo],project,project(3,11));
 assert.equal(fx.beams.length,1);assert.equal(fx.beams[0].style,'lightning');
 const p=project(echo.from.x,echo.from.y);assert.deepEqual(fx.beams[0].from,{x:p.x/2,y:p.y/2-8});
 fx.update(.1);const r=context();fx.draw(r.c,0,false,false);assert.equal(r.stack.length,0);assert.equal(r.c.globalAlpha,1);
 assert.equal(JSON.stringify(s),before);
});
test('laser card keeps its four grid arms and does not reuse the generic wave explosion',()=>{
 const s=arena({laser:1});let wave;
 for(let beat=0;beat<40&&!wave;beat++){
  s.run.events=[];E.act(s,{type:'hit',id:s.run.room.nodes[0].id},beat);wave=s.run.events.find(e=>e.type==='wave'&&e.source==='laser');
 }
 assert.ok(wave);assert.equal(wave.range,5);
 const fx=new Effects(),before=JSON.stringify(s);fx.consume([{type:'proc',id:'laser',...s.run.player},wave],project,project(s.run.player.x,s.run.player.y));
 assert.equal(fx.beams.length,4);assert.ok(fx.beams.every(b=>b.style==='lightning'));assert.equal(fx.rings.length,0);assert.equal(fx.sprites.items.length,0);
 assert.equal(JSON.stringify(s),before);
 const legacy=new Effects();legacy.consume([{type:'wave',x:3,y:11}],project,project(3,11));assert.ok(legacy.rings.length>0);
});
test('burn status from ember card follows the target and expires without granting a player aura',()=>{
 const s=arena({ember:1});E.act(s,{type:'hit',id:s.run.room.nodes[0].id},0);assert.ok(s.run.room.nodes[0].burn);
 const calls=[],w={player:project(3,11),reduced:false,fx:{latestLightningAge:()=>Infinity},powerVfx:{draw(){},drawBurn(c,p){calls.push(p);}}};
 const before=JSON.stringify(s);World.prototype.drawPowerVfx.call(w,{},s.run,0,'front');assert.equal(calls.length,1);assert.equal(JSON.stringify(s),before);
 s.run.beat=5;calls.length=0;World.prototype.drawPowerVfx.call(w,{},s.run,1,'front');assert.equal(calls.length,0);
});
test('recovery cards report the actual heal and shield through the existing effect consumers',()=>{
 for(const id of ['abyss-heal','abyss-ward']){
  const s=arena();initAbyss(s.run);s.run.abyss.section=2;s.run.events=[];
  s.run.abyss.cardChoice={section:2,offers:['abyss-heal','abyss-ward','abyss-breath'],remaining:4,autoIndex:0};
  assert.ok(E.chooseAbyssCard(s,id));const fx=new Effects();fx.consume(s.run.events,project,project(20,15));
  if(id==='abyss-heal'){assert.equal(s.run.events.find(e=>e.type==='heal').value,25);assert.equal(s.run.health,65);assert.ok(fx.playerHeal.sample(.1));}
  else{assert.ok(s.run.events.some(e=>e.type==='shield'));assert.ok(s.run.guardUntil>=7);assert.ok(fx.playerShield.sample({active:true,time:0}));}
 }
});
test('ray cap, scroll, pause, trail cleanup and reduced-motion fire are bounded',()=>{
 const fx=new Effects(),events=Array.from({length:20},(_,i)=>({type:'echo',from:{x:3,y:11},x:4+i%3,y:11}));
 fx.consume(events,project,project(3,11));assert.equal(fx.beams.length,12);
 const x=fx.beams[0].from.x;fx.consume([{type:'scroll'}],project,project(3,11));assert.equal(fx.beams[0].from.x,x-2);assert.equal(events[0].from.x,3);
 const life=fx.beams[0].life;fx.update(0);assert.equal(fx.beams[0].life,life);
 fx.consume(Array.from({length:60},()=>({type:'firetrail',x:3,y:11})),project,project(3,11));assert.equal(fx.fireMarks.length,24);
 fx.update(1);assert.equal(fx.fireMarks.length,0);assert.equal(fx.beams.length,0);
 assert.deepEqual(fireRingFrame(0,{soft:true}),fireRingFrame(99,{soft:true}));fx.clear();assert.equal(fx.buffAccents.length,0);
});
