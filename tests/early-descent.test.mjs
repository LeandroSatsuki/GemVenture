import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {caveObjective,caveExcursion,stairObjective} from '../dist/cave-descent.js';
import {reveal,sightRange} from '../dist/cavern.js';
function start(seed=43,floor=1){const s=E.createState(seed);s.seals=6;E.startRun(s);if(floor!==1){s.run.floor=floor;E.generateRoom(s);}return s;}
function nearestPath(r){return r.room.layout.rooms.filter(h=>h.kind==='main'&&h.id!==0).map(h=>E.pathTo(r.room,r.player,h)).filter(p=>p.length).sort((a,b)=>a.length-b.length)[0];}
test('full charge in the opening chamber never unlocks departure, even with elapsed time or full visibility',()=>{
 const s=start(),r=s.run;r.room.charge=r.room.quota;r.room.explored.fill(1);r.beat=1000;r.acted=1000;
 assert.deepEqual(caveExcursion(r),{active:true,value:1,goal:2,ready:false});assert.equal(E.completeCaveFloor(s),false);assert.equal(stairObjective(r),'EXPLORE OUTRA SALA');
 r.room.scoredTiles.push(r.player.y*r.room.cols+r.player.x);assert.equal(caveObjective(r).ready,false);
});
test('real rhythmic movement to a second main hall unlocks a charged floor and survives reload',()=>{
 const s=start(),r=s.run;r.room.charge=r.room.quota;
 // Geometry fixture: remove actors so the test measures traversal, not fighting skill.
 r.room.enemies=[];let beat=0;
 for(const step of nearestPath(r)){reveal(r.room,r.player,sightRange(r));const action=E.act(s,{type:'move',...step},beat++);assert.ok(action.ok);if(caveObjective(r).ready)break;}
 assert.equal(caveExcursion(r).value,2);assert.equal(r.room.cleared,false);assert.equal(r.room.stairDeparted,undefined);
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(caveObjective(t.run).ready,true);assert.ok(E.completeCaveFloor(t));const saved=JSON.stringify(t);assert.equal(E.completeCaveFloor(t),false);assert.equal(JSON.stringify(t),saved);
});
test('exploration can precede charge; side rooms and corridor tiles do not qualify',()=>{
 const s=start(),r=s.run,side=r.room.layout.rooms.find(h=>h.kind==='side');r.room.scoredTiles.push(side.y*r.room.cols+side.x);assert.equal(caveExcursion(r).ready,false);
 const h=r.room.layout.rooms.find(h=>h.kind==='main'&&h.id===1);r.room.scoredTiles.push(h.y*r.room.cols+h.x);assert.equal(caveExcursion(r).ready,true);assert.equal(caveObjective(r).ready,false);assert.equal(stairObjective(r),'MINERE CRISTAIS');r.room.charge=r.room.quota;assert.equal(caveObjective(r).ready,true);
});
test('old active saves retain charge-only access; their next opening floor uses the new rule',()=>{
 const s=start();delete s.run.room.campaignCave.departureVersion;s.run.room.charge=s.run.room.quota;const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.ok(E.completeCaveFloor(t));assert.ok(E.chooseCard(t,t.run.cardOffer[0]));assert.ok(E.descend(t));assert.equal(t.run.room.campaignCave.departureVersion,2);assert.equal(caveExcursion(t.run).value,1);
});
test('first four floors require excursion; boss, later biomes, training and Abyss are unchanged',()=>{
 for(const floor of [1,2,3,4,5,6]){const s=start(43,floor),r=s.run;assert.equal(caveExcursion(r).active,floor<5);if(floor===5){r.room.charge=999;assert.equal(caveObjective(r).ready,false);}if(floor===6){r.room.charge=r.room.quota;assert.equal(caveObjective(r).ready,true);}}
 for(const mode of ['training','abyss']){const s=start();if(mode==='training')s.run.trainingClock={};else s.run.mode='abyss';assert.equal(caveExcursion(s.run).active,false);}
});
test('multiple seeds have a reachable second hall without finding the remote hole',()=>{
 for(let seed=1;seed<=24;seed++){const r=start(seed).run,path=nearestPath(r);assert.ok(path?.length>0);const exit=E.pathTo(r.room,r.player,r.room.exit);assert.ok(path.length<exit.length);assert.equal(caveExcursion(r).ready,false);for(const p of path)r.room.scoredTiles.push(p.y*r.room.cols+p.x);assert.equal(caveExcursion(r).ready,true);}
});
