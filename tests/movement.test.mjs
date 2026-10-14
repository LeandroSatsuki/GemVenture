import test from 'node:test';
import assert from 'node:assert/strict';
import {World,project,dashPoint,hopPose,cameraAxis,cameraFollow} from '../dist/world.js';
import {Effects} from '../dist/effects.js';
const dash={type:'dash',from:{x:3,y:8},to:{x:5,y:6},path:[{x:4,y:8},{x:5,y:8},{x:5,y:7},{x:5,y:6}]};
function world(soft=false){return Object.assign(Object.create(World.prototype),{player:project(3,8),target:project(3,8),trail:[],route:null,reduced:soft,fx:new Effects()});}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≈ ${b}`);

test('teleport follows walkable corners and finishes before the next rhythm action',()=>{
 const w=world();w.consume([dash]);const route=w.route;
 assert.deepEqual(dashPoint(route,88/route.length),project(5,8));
 w.advanceMovement(.04);const expected=hopPose(route,.04);assert.deepEqual(w.player,{x:expected.x,y:expected.y});assert.ok(w.hop>0);
 assert.ok(w.trail.length>0);w.advanceMovement(.26);assert.deepEqual(w.player,w.target);assert.equal(w.route,null);
 assert.ok(w.trail.length>0);w.advanceMovement(.4);assert.equal(w.trail.length,0);
});
test('afterimages have the same positions and opacity at different frame rates',()=>{
 const a=world(),b=world();a.consume([dash]);b.consume([dash]);a.advanceMovement(.1);for(let i=0;i<10;i++)b.advanceMovement(.01);
 near(a.player.x,b.player.x);near(a.player.y,b.player.y);assert.equal(a.trail.length,b.trail.length);
 a.trail.forEach((p,i)=>{near(p.x,b.trail[i].x);near(p.y,b.trail[i].y);near(p.life,b.trail[i].life);});
});
test('abyss scrolling translates the live route and afterimages without cancelling the dash',()=>{
 const w=world();w.consume([dash]);w.advanceMovement(.04);const before=structuredClone({player:w.player,target:w.target,route:w.route,trail:w.trail});
 w.consume([{type:'scroll'}]);assert.ok(w.route);assert.equal(w.trail.length,before.trail.length);
 for(const key of ['player','target'])assert.deepEqual(w[key],{x:before[key].x-4,y:before[key].y-32});
 w.route.points.forEach((p,i)=>assert.deepEqual(p,{x:before.route.points[i].x-4,y:before.route.points[i].y-32}));
 w.trail.forEach((p,i)=>assert.deepEqual(p,{...before.trail[i],x:before.trail[i].x-4,y:before.trail[i].y-32}));
 w.advanceMovement(.26);assert.deepEqual(w.player,w.target);
});
test('soft effects retain a fading ground trail without animated displacement',()=>{
 const w=world(true);w.consume([dash]);assert.deepEqual(w.player,w.target);assert.equal(w.route,null);assert.ok(w.trail.length>0);
 w.advanceMovement(.1);assert.ok(w.trail.every(p=>p.life<.32));w.advanceMovement(.3);assert.equal(w.trail.length,0);
});
test('pause freezes movement and trail; new floor clears both; stationary hits leave no trail',()=>{
 const w=world();w.consume([dash]);w.advanceMovement(.05);const before=JSON.stringify([w.player,w.route,w.trail]);
 w.advanceMovement(2,true);assert.equal(JSON.stringify([w.player,w.route,w.trail]),before);
 w.place({run:{player:{x:2,y:2}}});assert.equal(w.route,null);assert.equal(w.trail.length,0);
 w.consume([{type:'dash',from:{x:2,y:2},to:{x:2,y:2},path:[]}]);w.advanceMovement(.1);assert.equal(w.trail.length,0);
});
test('repeated dashes have a fixed afterimage budget and no obsolete effects after a stall',()=>{
 const w=world();for(let i=0;i<100;i++){w.consume([dash]);w.advanceMovement(.02);assert.ok(w.trail.length<=24);}
 w.advanceMovement(3);assert.equal(w.route,null);assert.equal(w.trail.length,0);assert.deepEqual(w.player,w.target);
});

test('camera holds short central movements, settles without overshoot and stays inside the cave',()=>{
 assert.equal(cameraAxis(200,500,600,2400,1/60),200);
 let camera=200;
 for(let i=0;i<180;i++){const next=cameraAxis(camera,850,600,2400,1/60);assert.ok(next>=camera&&next<=478);camera=next;}
 assert.ok(Math.abs(camera-478)<.05);
 assert.equal(cameraAxis(0,20,600,2400,.1),0);
 assert.equal(cameraAxis(0,100,600,400,.1),0);
 assert.equal(cameraAxis(400,2300,600,2400,0),400,'pause does not pan');
 assert.equal(cameraAxis(0,2300,600,2400,0,true),1800,'floor entry snaps once');
 const jump=cameraAxis(0,1500,600,2400,1/60);assert.ok(jump<=7,'long dash cannot snap the scenery');
});

test('each route tile has a landing and a hop, independent of camera height',()=>{
 const w=world();w.consume([dash]);const route=w.route,duration=hopPose(route,0).duration;
 for(let i=0;i<4;i++){const pose=hopPose(route,duration*i/4);near(pose.hop,0);near(pose.x,route.points[i].x);near(pose.y,route.points[i].y);assert.ok(hopPose(route,duration*(i+.5)/4).hop>8);}
 w.advanceMovement(.03);const before={...w.player};w.consume([dash]);assert.deepEqual(w.route.points[0],before,'interrupting a blink starts from its visible position');
});

test('abyss rebasing keeps the miner, trail and scenery in the same screen position',()=>{
 const w=world();w.camera={x:100,y:200};w.consume([dash]);w.advanceMovement(.04);
 const before={x:w.player.x-w.camera.x,y:w.player.y-w.camera.y};w.consume([{type:'scroll'}]);
 assert.deepEqual({x:w.player.x-w.camera.x,y:w.player.y-w.camera.y},before);
 assert.equal(cameraFollow(w.camera.y,500,0),w.camera.y,'paused camera stays fixed');
 assert.ok(Math.abs(cameraFollow(w.camera.y,1000,1/60)-w.camera.y)<=7);
});

test('camera smoothing is independent of frame rate for a fixed focus outside the quiet band',()=>{
 let a=200,b=200;for(let i=0;i<30;i++)a=cameraAxis(a,700,600,2400,1/30);for(let i=0;i<144;i++)b=cameraAxis(b,700,600,2400,1/144);near(a,b);
});

test('exploration geometry and minimap are reused until visibility changes, including floor reset',()=>{
 const oldPath=globalThis.Path2D,oldDocument=globalThis.document;let paths=0,paint=0;
 globalThis.Path2D=class{constructor(){paths++;}moveTo(){}lineTo(){}closePath(){}};
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){paint++;}})})};
 try{
  const w=world(),room={cols:42,rows:30,visible:Array(1260).fill(0),explored:Array(1260).fill(0)};room.visible[5]=1;room.explored[5]=1;
  w.prepareFog(room);const original=w.fogPaths,painted=paint;
  for(let i=0;i<10000;i++)w.prepareFog(room);
  assert.equal(paths,2);assert.equal(paint,painted);assert.equal(w.fogPaths,original);
  room.visible=[...room.visible];room.explored[6]=1;w.prepareFog(room);assert.equal(paths,4);assert.notEqual(w.fogPaths,original);
  w.place({run:{player:{x:2,y:2}}});w.prepareFog(room);assert.equal(paths,6);
 }finally{globalThis.Path2D=oldPath;globalThis.document=oldDocument;}
});
