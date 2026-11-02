import test from 'node:test';
import assert from 'node:assert/strict';
import {World,caveEdges,HOTSPOTS,project,caveCameraY} from '../dist/world.js';
import {createState,startRun,generateRoom} from '../dist/core.js';
import {REFUGE_SIZE} from '../dist/refuge-scene.js';
import {isFloor} from '../dist/cavern.js';

test('wall contours frame only non-walkable boundaries across chamber layouts',()=>{
 for(const seed of [7,712,991])for(const floor of [1,6,11,16,21,26]){
  const s=createState(seed);startRun(s);s.run.floor=floor;generateRoom(s);const room=s.run.room;
  const edges=caveEdges(room);let expected=0;
  for(let y=0;y<room.rows;y++)for(let x=0;x<room.cols;x++)if(isFloor(room,x,y))for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])if(!isFloor(room,x+dx,y+dy))expected++;
  assert.equal(edges.length,expected);
  for(const e of edges){assert.ok(isFloor(room,e.x,e.y));assert.ok([...e.a,...e.b].every(Number.isFinite));}
  assert.deepEqual(caveEdges(room,4,8),edges.filter(e=>e.y>=4&&e.y<=8));
 }
});

test('village semantic targets remain unique and contained in the enlarged world',()=>{
 for(const h of HOTSPOTS){assert.ok(h.x-h.w/2>0&&h.x+h.w/2<REFUGE_SIZE.width);assert.ok(h.y-h.h/2>0&&h.y+h.h/2<REFUGE_SIZE.height&&h.labelY<REFUGE_SIZE.height);}
 assert.equal(new Set(HOTSPOTS.map(h=>h.id)).size,10,'semantic keyboard targets remain unique; pointers use visible alpha instead of overlapping rectangles');
});

test('creature visuals settle continuously, freeze while paused and honor reduced motion',()=>{
 const world={creaturePos:new Map(),reduced:false},actor={id:1,type:'enemy',x:4,y:5};
 const before={...World.prototype.actorPosition.call(world,actor,.016)};
 actor.x=5;const goal=project(5,5),p=World.prototype.actorPosition.call(world,actor,.016);
 assert.ok(p.x>before.x&&p.x<goal.x);const frozen={...p};
 assert.deepEqual(World.prototype.actorPosition.call(world,actor,0),frozen);
 world.reduced=true;const reduced=World.prototype.actorPosition.call(world,actor,.016);assert.deepEqual({x:reduced.x,y:reduced.y},goal);assert.equal(reduced.direction,'right');
 actor.x=10;actor.boss=true;const boss=World.prototype.actorPosition.call(world,actor,.016);assert.deepEqual({x:boss.x,y:boss.y},project(10,5));
});

test('northern spectator burrows fit above the cave without snapping the camera',()=>{
 const player=project(7,1),height=620;
 const legacy=caveCameraY(0,player.y,height,0,true);
 const padded=caveCameraY(0,player.y,height,0,true,-150);
 assert.equal(legacy,0);assert.ok(padded<0&&padded>=-150);
 const step=caveCameraY(0,player.y,height,.016,false,-150);
 assert.ok(step<0&&step>padded);assert.ok(Math.abs(step)<=420*.016);
 assert.equal(caveCameraY(step,player.y,height,0,false,-150),step,'a paused camera remains still');
 assert.equal(caveCameraY(200,project(7,15).y,height,0,true,-150),caveCameraY(200,project(7,15).y,height,0,true),'ordinary cave movement is unchanged');
});
