import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {enableGeodeCrown,validCrown} from '../dist/geode-crown.js';
import {solidGeodeWaveCells,geodeWaveBlocks,geodeBodyBlocks,setGeodeCollisionPhase,escapeGeodeWave} from '../dist/geode-collision.js';
function setup(){
 const s=E.createState(41001);s.seals=6;E.startRun(s);s.run.floor=5;E.generateRoom(s);
 const b=s.run.room.enemies[0];b.y=3;enableGeodeCrown(b);
 Object.assign(b.crown,{stage:'fracture',started:6,until:10,waves:[{at:6,x:b.x,y:b.y,look:'S',aim:{x:0,y:1},serial:1}]});b.windup=null;
 s.run.player={x:b.x,y:b.y+3};s.run.beat=6;s.run.acted=6;setGeodeCollisionPhase(s.run.room,7);return{s,b,room:s.run.room};
}
test('wave cells block only from their own birth until their visual expiry',()=>{
 const{s,b,room}=setup(),p={x:b.x,y:b.y+2};
 for(const [phase,blocked] of [[6.99,false],[7,true],[7.3,true],[7.719,true],[7.72,false],[8,false]]){
  setGeodeCollisionPhase(room,phase);assert.equal(geodeWaveBlocks(room,p.x,p.y),blocked,`${phase}`);assert.equal(E.walkable(room,p.x,p.y),!blocked);
 }
 assert.ok(solidGeodeWaveCells(room,7).length>0);assert.equal(s.run.health,100);
});
test('dodge cannot enter a raised crest, including with flight or movement buffs',()=>{
 for(const flying of [false,true]){const{s,b,room}=setup(),before={...s.run.player};if(flying)s.run.frenzy={buffs:{wings:99,fire:99}};
  const result=E.act(s,{type:'dodge',dx:0,dy:-1},7);assert.equal(result.ok,true);assert.deepEqual(s.run.player,before);assert.equal(s.run.combo,1);assert.equal(s.run.health,100);
  assert.ok(geodeWaveBlocks(room,b.x,b.y+2));
 }
});
test('pathfinding goes around a raised wave rather than crossing its cells',()=>{
 const{s,b,room}=setup();s.run.player={x:b.x-3,y:b.y+2};const to={x:b.x+3,y:b.y+2},path=E.pathTo(room,s.run.player,to);
 assert.ok(path.length>6);assert.ok(path.every(p=>!geodeWaveBlocks(room,p.x,p.y)&&!geodeBodyBlocks(room,p.x,p.y)));
 E.act(s,{type:'move',...to},7);const travel=s.run.events.find(e=>e.type==='dash').path;
 assert.ok(travel.length>0);assert.ok(travel.every(p=>!geodeWaveBlocks(room,p.x,p.y)&&!geodeBodyBlocks(room,p.x,p.y)));
});
test('an eruption under the player deals the original single hit and nudges to an adjacent clear cell',()=>{
 const{s,b,room}=setup();s.run.player={x:b.x,y:b.y+2};const from={...s.run.player};
 E.act(s,{type:'move',...from},7);E.tick(s,7);
 assert.equal(s.run.health,82);assert.equal(s.run.events.filter(e=>e.type==='geodeCrownWaveHit').length,1);
 assert.equal(Math.abs(s.run.player.x-from.x)+Math.abs(s.run.player.y-from.y),1);assert.equal(E.walkable(room,s.run.player.x,s.run.player.y),true);
 const recoil=s.run.events.find(e=>e.type==='knockback');assert.deepEqual(recoil.path,[s.run.player]);
 E.tick(s,7);assert.equal(s.run.health,82);
});
test('a shield prevents damage but does not let the actor stand on the crest',()=>{
 const{s,b,room}=setup();s.run.guardUntil=99;s.run.player={x:b.x,y:b.y+2};E.act(s,{type:'move',...s.run.player},7);E.tick(s,7);
 assert.equal(s.run.health,100);assert.equal(E.walkable(room,s.run.player.x,s.run.player.y),true);assert.ok(s.run.events.some(e=>e.type==='shieldBlock'));
});
test('every exposed crest cell has a clear adjacent escape, in all three views and overlapping waves',()=>{
 for(const look of ['S','SE','SW'])for(const overlap of [false,true]){const{s,b,room}=setup();b.crown.waves=[{at:6,x:b.x,y:b.y,look,serial:1}];if(overlap)b.crown.waves.push({at:9,x:b.x,y:b.y,look:look==='SE'?'SW':'SE',serial:2});
  for(let phase=6;phase<15;phase++){setGeodeCollisionPhase(room,phase);for(const p of solidGeodeWaveCells(room))if(!geodeBodyBlocks(room,p.x,p.y)){const to=escapeGeodeWave(room,p,b);assert.ok(to,`${look} ${overlap} ${phase} ${p.x},${p.y}`);assert.ok(E.walkable(room,to.x,to.y));}}
 }
});
test('save restoration reconstructs collision from the musical schedule without new save fields',()=>{
 const{s,b}=setup();s.run.player={x:b.x-3,y:b.y+3};E.act(s,{type:'move',...s.run.player},7);E.tick(s,7);assert.ok(validCrown(b));
 const json=JSON.stringify(s),restored=E.restoreState(json);assert.ok(restored);assert.equal(json.includes('collisionPhase'),false);
 assert.equal(E.walkable(restored.run.room,b.x,b.y+2),false);setGeodeCollisionPhase(restored.run.room,7.72);assert.equal(E.walkable(restored.run.room,b.x,b.y+2),true);
});
test('saving after input but before hazard resolution restores the accepted beat collision',()=>{
 const{s,b}=setup();s.run.player={x:b.x-3,y:b.y+3};E.act(s,{type:'move',...s.run.player},7);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.run.acted,7);assert.equal(restored.run.beat,6);
 assert.equal(E.walkable(restored.run.room,b.x,b.y+2),false);
 E.tick(restored,7);assert.equal(restored.run.health,100);
});
test('dead bosses leave no wave collision and no fake rocks are inserted',()=>{
 const{s,b,room}=setup(),rocks=structuredClone(room.rocks);assert.ok(solidGeodeWaveCells(room).length);b.hp=0;assert.equal(solidGeodeWaveCells(room).length,0);assert.deepEqual(room.rocks,rocks);
});
test('after retreating from a wave the player can approach and damage an exposed boss from its outside edge',()=>{
 const{s,b}=setup();Object.assign(b.crown,{stage:'open',started:7,until:11,broken:3,waves:[]});b.exposedUntil=10;
 s.run.player={x:b.x+4,y:b.y+2};const before=b.hp;E.act(s,{type:'hit',id:b.id,crownSide:'E'},8);
 assert.ok(b.hp<before);assert.deepEqual(s.run.player,{x:b.x+2,y:b.y});
});
