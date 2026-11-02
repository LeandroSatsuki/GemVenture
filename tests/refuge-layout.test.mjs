import test from 'node:test';
import assert from 'node:assert/strict';
import {REFUGE_SIZE,REFUGE_SPAWN,REFUGE_STATIONS,REFUGE_HOTSPOTS,REFUGE_PROPS} from '../dist/refuge-scene.js';
import {refugeLandContains} from '../dist/refuge-terrain.js';
import {BASE_SIZE,HOTSPOTS,World} from '../dist/world.js';
import {resourceWalletMarkup,updateResourceWallet} from '../dist/refuge-hud.js';
import {sampleRefugePose,createRefugeClock} from '../dist/refuge-effects.js';

test('expanded refuge shares ground anchors, hit areas and approach targets for every existing station',()=>{
 assert.deepEqual(REFUGE_STATIONS.map(s=>s.id).sort(),['forge','tree','lift','well','missions','stars','zag','records','miner'].sort());
 assert.deepEqual(HOTSPOTS,REFUGE_HOTSPOTS);assert.deepEqual(BASE_SIZE,{width:1400,height:800});assert.ok(REFUGE_SIZE.width>BASE_SIZE.width&&REFUGE_SIZE.height>BASE_SIZE.height);
 for(const s of REFUGE_STATIONS){
  const prop=REFUGE_PROPS.find(p=>p[0]===s.type),hit=HOTSPOTS.find(h=>h.id===s.id);assert.deepEqual(prop.slice(1),[s.x,s.artY,s.width]);
  assert.ok(Math.abs(s.x*2-hit.x)<=hit.w/2);assert.ok(s.artY*2>=hit.y-hit.h/2&&s.artY*2<=hit.y+hit.h/2);
  assert.ok(refugeLandContains(s.approach.x,s.approach.y,15.5));assert.ok(s.approach.y>s.y,'approach stays in front of the solid base');
  assert.ok(s.x-s.width/2>70&&s.x+s.width/2<935&&s.y<555,'stations stay inside the coast');
 }
 assert.ok(REFUGE_SPAWN.x>400&&REFUGE_SPAWN.x<600);
});

test('refuge camera and pointer use the expanded frame while legacy caves retain their own frame',()=>{
 const previous=globalThis.devicePixelRatio;globalThis.devicePixelRatio=1;
 try{
  for(const [width,height]of [[1440,900],[800,600],[390,844]])for(const inRefuge of [true,false]){
   const state={canvas:{getBoundingClientRect:()=>({left:12,top:8,width,height})},wide:false,inRefuge,camera:{x:0,y:0}};World.prototype.resize.call(state);
   const size=inRefuge?REFUGE_SIZE:BASE_SIZE;assert.equal(state.scale,Math.min(width/size.width,height/size.height));
   for(const h of HOTSPOTS){const p=World.prototype.pointer.call(state,{clientX:12+state.offsetX+h.x*state.scale,clientY:8+state.offsetY+h.y*state.scale});assert.ok(Math.abs(p.x-h.x)<1e-7&&Math.abs(p.y-h.y)<1e-7);}
  }
 }finally{if(previous===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=previous;}
});

test('resource balances show zero, compact large amounts and retain exact names and quantities for focus',()=>{
 const values=[0,4,10000,1234567],before=JSON.stringify(values),html=resourceWalletMarkup(values);
 assert.match(html,/id="material-0">0</);assert.match(html,/id="material-1">4</);assert.equal((html.match(/class="resource-balance"/g)||[]).length,4);
 assert.equal((html.match(/tabindex="0"/g)||[]).length,4);assert.match(html,/Quartzo: 0/);assert.match(html,/Topázio: 10\.000/);assert.match(html,/1\.234\.567/);assert.equal(JSON.stringify(values),before);
 const element={innerHTML:'',children:[]};assert.equal(updateResourceWallet(element,values),true);assert.equal(updateResourceWallet(element,[...values]),false);assert.equal(updateResourceWallet(element,[2,4,10000,1234567]),true);assert.match(element.innerHTML,/id="material-0">2</);
});

test('solid refuge layers stay planted, the crystal moves alone and paused or hidden time cannot advance',()=>{
 for(const time of [0,.3,6,17])for(const role of ['base','tree','well','roulette-base'])assert.deepEqual(sampleRefugePose(role,{time}),{dx:0,dy:0,scaleX:1,scaleY:1,angle:0});
 assert.notEqual(sampleRefugePose('crystal',{time:1}).dy,0);assert.deepEqual(sampleRefugePose('crystal',{time:1,reduced:true}),sampleRefugePose('base',{time:1}));
 const clock=createRefugeClock(2);clock.advance(.05);const current=clock.time;clock.advance(100,{paused:true});clock.advance(100,{hidden:true});assert.equal(clock.time,current);clock.advance(100);assert.ok(clock.time<=current+.100001);
});
