import test from 'node:test';
import assert from 'node:assert/strict';
import {ChestOpeningPresentation} from '../dist/chest-opening-presentation.js';
import {ChestTreasureVfx} from '../dist/chest-treasure-vfx.js';
import {Effects} from '../dist/effects.js';
import {createApprovedSceneryEmission} from '../dist/approved-scenery-emission.js';
const project=(x,y)=>({x:100+x*44+y*4,y:115+y*32});
function fixture(used=false){const find={id:'treasure',type:'caveFind',kind:'chest',used,x:4,y:5},room={cols:21,rows:15,visible:new Uint8Array(315).fill(1),caveFinds:[find]},opening=new ChestOpeningPresentation();opening.setContext(room);const fx=new ChestTreasureVfx();fx.setContext(room,opening);return{find,room,opening,fx,event:{type:'findUsed',kind:'chest',id:find.id,x:4,y:5}};}
test('treasure follows the confirmed lid, deduplicates, pauses and expires without changing domain',()=>{
 const f=fixture();assert.equal(f.fx.accept([f.event],10),0);f.find.used=true;f.opening.accept([f.event],10);assert.equal(f.fx.accept([f.event],10),1);assert.equal(f.fx.accept([f.event],10),0);assert.equal(f.fx.sample(10.03).length,0);
 const before=JSON.stringify(f.room),a=f.fx.sample(10.2);assert.equal(a[0].sparks.length,4);assert.deepEqual(f.fx.sample(10.2),a);assert.equal(JSON.stringify(f.room),before);assert.equal(f.fx.sample(11).length,0);
});
test('restored, stale and replaced scenes do not replay treasure',()=>{
 const loaded=fixture(true);assert.equal(loaded.fx.accept([loaded.event],10),0);assert.equal(loaded.fx.sample(10).length,0);
 const f=fixture();f.find.used=true;f.opening.accept([f.event],0);f.opening.sample(f.find,{age:1});assert.equal(f.fx.accept([f.event],1),0);f.fx.setContext(null,null);assert.equal(f.fx.sample(1).length,0);
});
test('soft treasure has one stationary glint',()=>{
 const f=fixture();f.find.used=true;f.opening.accept([f.event],0);f.fx.accept([f.event],0);const a=f.fx.sample(.2,{soft:true}),b=f.fx.sample(.4,{soft:true});assert.equal(a[0].sparks.length,1);assert.equal(a[0].sparks[0].x,b[0].sparks[0].x);assert.equal(a[0].sparks[0].y,b[0].sparks[0].y);
});
test('accepted treasure replaces only paired visual confetti and keeps the real amount and shake',()=>{
 const f=fixture();f.find.used=true;f.opening.accept([f.event],0);f.fx.accept([f.event],0);
 const events=[{type:'loot',x:4,y:5,value:12,color:'#efc363'},f.event,{type:'proc',id:'find-chest',x:4,y:5,color:'#efc363'}],before=JSON.stringify(events),effects=new Effects();
 effects.consume(events,project,project(3,5),null,{treasureCoordinates:f.fx.acceptedCoordinates(events,0)});
 assert.equal(effects.particles.length,0);assert.equal(effects.rings.length,0);assert.equal(effects.sprites.items.length,0);assert.equal(effects.labels[0].text,'+12 ◇');assert.equal(effects.shake,1.2);assert.equal(JSON.stringify(events),before);
 effects.consume([{type:'loot',x:6,y:5,value:3,color:'#efc363'}],project,project(3,5),null,{treasureCoordinates:new Set(['4,5'])});assert.ok(effects.particles.length>0);assert.equal(effects.labels[1].text,'+3 ◇');
});
test('treasure uses the existing scene emission buffer and later native occlusion',()=>{
 const ctx=new Proxy({canvas:{width:640,height:480},getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0})},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)}),made=[];
 const makeCanvas=(width,height)=>{const canvas={width,height,getContext:()=>ctx};made.push(canvas);return canvas;},world={canvas:ctx.canvas},scene={biome:0,images:new Map()},emission=createApprovedSceneryEmission(world,scene,{makeCanvas});
 emission.begin();emission.capture(ctx,'chest-treasure',{paint:()=>1});assert.equal(emission.status().draws,1);emission.capture(ctx,'occluder',[{},0,0]);assert.equal(emission.status().occlusions,1);emission.begin();assert.equal(emission.status().draws,0);emission.capture(ctx,'chest-treasure',{paint:()=>1});assert.equal(made.length,1);emission.dispose();assert.equal(made[0].width,1);assert.equal(made[0].height,1);assert.ok(emission.status().canvasBytes<=4);
});
