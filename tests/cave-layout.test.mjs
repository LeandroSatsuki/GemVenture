import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {isFloor,wallAt,validateLayout,createLayout,locateHedgehog,createAbyssLayout,shiftAbyssLayout} from '../dist/cave-layout.js';
import {ceilingTick,initCeiling} from '../dist/cave-ceiling.js';
import {reveal,visible} from '../dist/cavern.js';
import {hedgehogVisible} from '../dist/hedgehog.js';
function game(seed=712,floor=1){const s=E.createState(seed);s.seals=5;E.startRun(s);s.run.floor=floor;E.generateRoom(s);return s;}
test('240 seeded caves have connected architecture, reachable rewards, safe entry and different silhouettes',()=>{
 const fingerprints=new Set();
 for(let seed=1;seed<=40;seed++)for(const floor of [1,6,11,16,21,26]){
  const s=game(seed,floor),r=s.run,room=r.room;
  assert.ok(validateLayout(room),`layout ${seed}/${floor}`);
  assert.ok(E.pathTo(room,r.player,room.exit).length,`exit ${seed}/${floor}`);
  assert.ok(room.nodes.length>=18);
  assert.equal(new Set(room.nodes.map(n=>n.x+','+n.y)).size,room.nodes.length,'one initial crystal per tile');
  for(const n of [...room.nodes,...room.enemies])assert.ok(isFloor(room,n.x,n.y)&&E.pathTo(room,r.player,n).length,`target ${seed}/${floor}`);
  for(const rock of room.rocks)assert.ok(isFloor(room,rock.x,rock.y)&&!room.layout.protectedTiles.includes(rock.y*room.cols+rock.x));
  assert.ok(room.floorMask.filter(Boolean).length<room.cols*room.rows*.85);
  assert.ok(room.floorMask.filter(Boolean).length>room.cols*room.rows*.28);
  fingerprints.add(room.floorMask.join(''));
  assert.equal(room.gardener,undefined);assert.ok(wallAt(room,room.hedgehog.x,room.hedgehog.y));
  assert.ok(isFloor(room,room.hedgehog.x,room.hedgehog.y+1));
  assert.equal(Array.from({length:7},(_,i)=>wallAt(room,room.hedgehog.x+i-3,room.hedgehog.y)).filter(Boolean).length,7,'giant burrow has seven wall cells');
  assert.ok(Array.from({length:7},(_,i)=>isFloor(room,room.hedgehog.x+i-3,room.hedgehog.y+1)).filter(Boolean).length>=5,'wide floor in front of the burrow');
 }
 assert.equal(fingerprints.size,240);
});
test('giant wall spectator placement never changes the map, population, rewards or target lists',()=>{
 for(const floor of [1,6,11,16,21,26,5,30]){
  const s=game(712,floor),r=s.run,room=r.room,before=JSON.stringify({floorMask:room.floorMask,layout:room.layout,nodes:room.nodes,rocks:room.rocks,enemies:room.enemies});
  locateHedgehog(room,Math.floor((floor-1)/5));
  assert.equal(JSON.stringify({floorMask:room.floorMask,layout:room.layout,nodes:room.nodes,rocks:room.rocks,enemies:room.enemies}),before);
  assert.ok(wallAt(room,room.hedgehog.x,room.hedgehog.y));assert.equal(room.hedgehog.hp,undefined);assert.equal(room.hedgehog.id,undefined);
  assert.ok(![...room.nodes,...room.rocks,...room.enemies].includes(room.hedgehog));
  const saved=JSON.stringify(room.hedgehog),bag=r.bag;E.act(s,{type:'hit',id:'hedgehog'},0);assert.equal(JSON.stringify(room.hedgehog),saved);assert.equal(r.bag,bag);
 }
});
test('broad internal rear walls are preferred when they fit; rectangular and streaming rooms retain a safe wall spectator',()=>{
 const room={cols:42,rows:30,seed:71,floorMask:Array(1260).fill(0)};
 for(let y=1;y<29;y++)for(let x=1;x<41;x++)if(y<6||y>11||x===20)room.floorMask[y*42+x]=1;
 const internal=locateHedgehog(room);assert.equal(internal.y,11);assert.ok(internal.x>=3&&internal.x<39);
 const legacy={cols:21,rows:15},boss=game(712,5).run.room;
 for(const r of [legacy,boss]){const h=locateHedgehog(r);assert.equal(h.y,0);assert.ok(isFloor(r,h.x,h.y+1));}
 createAbyssLayout(room);
 let present=0,offscreen=0;for(let depth=0;depth<100;depth++){shiftAbyssLayout(room,depth,{x:20,y:15});const h=room.hedgehog;if(h.x===0){offscreen++;assert.equal(hedgehogVisible(room),false);}else{present++;assert.ok(wallAt(room,h.x,h.y));assert.ok(isFloor(room,h.x,h.y+1));}assert.ok(validateLayout(room));}assert.ok(present>0&&offscreen>0);
});
test('architecture is deterministic and approved boss arenas reserve only the twelve pillar corner cells in the enlarged room',()=>{
 const a={cols:42,rows:30},b={cols:42,rows:30};createLayout(a,E.rng(42),2);createLayout(b,E.rng(42),2);assert.deepEqual(a,b);
 for(const floor of [5,10,15,20,25,30]){const s=game(19,floor),room=s.run.room;assert.ok(validateLayout(room));assert.equal(room.layout.style,'ARENA');const reserved=new Set(['1,1','2,1','1,2','23,1','22,1','23,2','1,17','2,17','1,16','23,17','22,17','23,16']);for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)assert.equal(isFloor(room,x,y),!reserved.has(x+','+y));assert.equal(room.floorMask.filter(Boolean).length,379);assert.equal(room.ceiling.stock,0);}
});
test('walls block movement and vision, while a wall strike still keeps the rhythm',()=>{
 const s=game(),r=s.run,room=r.room;room.rocks=[];room.nodes=[];room.enemies=[];
 const p=room.layout.rooms.find(p=>E.pathTo(room,r.player,p).length);assert.ok(p);
 const wall=[];for(let y=2;y<room.rows-2;y++)for(let x=2;x<room.cols-2;x++)if(wallAt(room,x,y)&&isFloor(room,x-1,y)&&wallAt(room,x+1,y))wall.push({x,y});
 assert.ok(wall.length);const target=wall[0];r.player={x:target.x-1,y:target.y};reveal(room,r.player);
 assert.equal(visible(room,{x:target.x+1,y:target.y}),false);assert.deepEqual(E.pathTo(room,r.player,target),[]);
 const before={...r.player};assert.ok(E.act(s,{type:'move',...target},0).ok);assert.deepEqual(r.player,before);assert.equal(r.combo,1);
});
test('ordinary creatures cannot begin a melee attack through a solid wall',()=>{
 const s=game(19,5),r=s.run,room=r.room;room.bossFloor=false;room.enemies=[];room.rocks=[];room.floorMask[7*room.cols+10]=0;r.player={x:11,y:7};
 const e={id:999,type:'enemy',kind:0,x:9,y:7,hp:20,maxHp:20,windup:null,stunUntil:-1};room.enemies=[e];E.enemyBeat(s,4);
 assert.equal(e.windup,null);assert.ok(isFloor(room,e.x,e.y));assert.notDeepEqual({x:e.x,y:e.y},{x:10,y:7});
});
function fallGame(){const s=game();rectangularRoom(s);s.run.room.rocks=[];s.run.room.nodes=[];s.run.room.enemies=[];s.run.room.ceiling.stock=100;s.run.player={x:8,y:15};const room=s.run.room;room.floorMask=room.floorMask.map((_,i)=>+(i%room.cols>0&&i%room.cols<room.cols-1&&Math.floor(i/room.cols)>0&&Math.floor(i/room.cols)<room.rows-1));room.layout.protectedTiles=[];return s;}
test('ceiling rocks announce three beats ahead, never block passages and cannot farm unlimited value',()=>{
 const s=fallGame(),r=s.run,room=r.room;
 ceilingTick(r,24,E.rng(17));assert.ok(room.ceiling.falls.length>0);const fall={...room.ceiling.falls[0]};assert.equal(fall.due,27);
 ceilingTick(r,26,E.rng(18));assert.equal(room.rocks.length,0);
 ceilingTick(r,27,E.rng(18));assert.ok(room.rocks.some(n=>n.falling&&n.kind===2&&n.hp===3&&n.maxHp===3&&n.value===1));
 for(let beat=48;beat<2000;beat+=24){room.rocks=[];ceilingTick(r,beat,E.rng(beat));ceilingTick(r,beat+3,E.rng(beat));}
 assert.ok(room.ceiling.landed<=12);assert.ok(room.rocks.every(n=>!room.layout.protectedTiles.includes(n.y*room.cols+n.x)));assert.ok(E.pathTo(room,r.player,room.exit).length);
});
test('a miner entering a falling-rock marker gets dust instead of damage or imprisonment',()=>{
 const s=fallGame(),r=s.run;ceilingTick(r,24,E.rng(17));const p=r.room.ceiling.falls[0];assert.ok(p);r.player={x:p.x,y:p.y};const hp=r.health;
 ceilingTick(r,27,E.rng(18));assert.equal(r.health,hp);assert.ok(E.walkable(r.room,p.x,p.y));assert.ok(r.events.some(e=>e.type==='rockfallDust'&&e.x===p.x&&e.y===p.y));
});
test('ceiling telegraphs pause with cards and survive saves without resetting; invalid masks are rejected',()=>{
 const s=fallGame(),r=s.run;ceilingTick(r,24,E.rng(17));r.beat=24;const saved=E.restoreState(JSON.stringify(s));assert.ok(saved);assert.deepEqual(saved.run.room.ceiling,r.room.ceiling);
 const due=r.room.ceiling.falls.map(p=>p.due);r.abyss={cardChoice:{}};ceilingTick(r,100,E.rng(9));assert.deepEqual(r.room.ceiling.falls.map(p=>p.due),due);delete r.abyss;
 const raw=JSON.parse(JSON.stringify(s));raw.run.room.floorMask[0]=1;assert.equal(E.restoreState(JSON.stringify(raw)),null);
 const legacy=JSON.parse(JSON.stringify(s));delete legacy.run.room.floorMask;delete legacy.run.room.layout;delete legacy.run.room.hedgehog;delete legacy.run.room.ceiling;legacy.run.room.gardener={x:10,y:7};assert.ok(E.restoreState(JSON.stringify(legacy)).run.room.hedgehog);
});
