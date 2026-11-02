import test from 'node:test';
import assert from 'node:assert/strict';
import {MinerGame} from '../dist/miner-view.js';
import {VfxSprites} from '../dist/vfx-assets.js';
import {createState} from '../dist/core.js';
import {minerFlight} from '../dist/miner.js';

function view(){
 const c=new Proxy({globalAlpha:1},{get:(target,key)=>key in target?target[key]:()=>{}});
 const v=Object.create(MinerGame.prototype);Object.assign(v,{s:createState(42),ctx:c,soft:()=>false,queue:[],particles:[],popups:[],rings:[],beams:[],cameraY:0,vfxPaint:0,vfx:new VfxSprites(),music:{sfx(){},loot(){}},receipt(){},burst(){}});return v;
}
test('sprite explosions survive rendering until their own duration expires',()=>{
 const v=view();v.playEvent({type:'bomb',row:1,col:3,kind:0},1000);assert.equal(v.vfx.items.length,1);
 v.draw(1016,minerFlight(v.s.miner,.5));assert.equal(v.vfx.items.length,1);
 v.draw(1049,minerFlight(v.s.miner,.6));assert.equal(v.vfx.items.length,1);assert.ok(v.vfx.items[0].age>0);
 v.vfx.update(2);assert.equal(v.vfx.items.length,0);
});
test('cascade overload retains contact and actual prize, without changing authoritative balances',()=>{
 const previousDocument=globalThis.document;globalThis.document={hidden:false};try{
 const v=view();v.active=true;v.stats=()=>{};v.syncCollection();v.s.miner.crystals[1]+=2;v.s.materials[1]+=2;const before=JSON.stringify(v.s);
 v.earned({events:[{id:1,impactId:1,impact:true,destroyed:true,contact:{row:1,col:3,pointCol:2.91,normal:{x:0,y:-1},offsetY:-22},step:1,from:3,to:4,type:'bomb',kind:0,count:500,gravel:123,crystal:1,crystalAmount:2,cells:Array.from({length:500},(_,i)=>({row:1+i%7,col:i%7,depth:i%5,type:'stone',kind:i%4})),effects:[{id:'1:3:1',row:1,col:3,depth:0,type:'bomb',kind:1}]}]});
 assert.ok(v.queue.length<=320);assert.ok(v.queue.some(q=>q.event.type==='contact'));assert.equal(v.queue.some(q=>q.event.type==='prize'),false);assert.equal(v.collection.status().unannounced[1],2);assert.ok(v.queue.some(q=>q.event.type==='bomb'&&q.event.kind===1));assert.ok(v.queue.every(q=>q.event.batchId===1));assert.equal(JSON.stringify(v.s),before);
 }finally{globalThis.document=previousDocument;}
});
test('returning after a hidden interval resumes at the tool, without flying the whole scene across old effects',()=>{
 const previousDocument=globalThis.document;globalThis.document={hidden:false};try{
  const v=view();Object.assign(v,{active:true,canvas:{isConnected:true},lastPaint:1000,lastStat:0,cameraY:-10000,stats(){}});v.s.miner.steps=30;v.s.miner.tipRow=30;v.s.miner.carry=10000;v.draw=()=>{};v.queue=[{at:1001,event:{type:'bomb',row:2,col:3}}];v.particles=[{y:2}];
  v.frame(5000);assert.equal(v.queue.length,0);assert.equal(v.particles.length,0);assert.ok(v.cameraY>=30*58&&v.cameraY<=31*58);
 }finally{globalThis.document=previousDocument;}
});
