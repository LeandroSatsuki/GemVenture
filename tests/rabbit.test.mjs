import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {BOSSES,RABBIT_HOLES,carrotTiles,createBoss,planBossAttack,hitRabbitChild,refreshRabbitChildren,bossDamage,livingBoss} from '../dist/bosses.js';
import {TOTAL_FLOORS,BIOME_COUNT} from '../dist/campaign.js';
import {environment} from '../dist/cavern.js';
import {floorMinerals} from '../dist/materials.js';
import {generateAsset} from '../dist/art-kit.js';

function arena(){const s=E.createState(611);s.seals=6;E.startRun(s);s.run.floor=35;E.generateRoom(s);s.run.guardUntil=100;return s;}

test('the underground garden adds five floors, distinct ore and a readable rabbit arena',()=>{
 assert.equal(TOTAL_FLOORS,35);assert.equal(BIOME_COUNT,7);assert.equal(environment(31).terrain,6);assert.equal(floorMinerals(31).weights.length,4);
 const s=arena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 assert.equal(b.bossIndex,6);assert.equal(b.maxHp,BOSSES[6].hp);assert.equal(children.length,3);
 assert.deepEqual(children.map(e=>({x:e.x,y:e.y})),RABBIT_HOLES);
 for(const child of children)assert.ok(E.pathTo(r.room,r.player,{x:child.x-1,y:child.y}).length);
 assert.ok(generateAsset('boss',{variant:6}).shapes.length<=30);assert.ok(generateAsset('rabbit',{biome:6}).shapes.length<=30);
 assert.equal(r.room.cleared,false);assert.equal(E.descend(s),false);
});

test('carrot warns for three beats and locks its lane before the player dodges',()=>{
 const b=createBoss(35,1),w=planBossAttack(b,{x:17,y:8},4);
 assert.equal(w.direction,'right');assert.equal(w.beat,7);assert.deepEqual(w.tiles,carrotTiles(b,'right'));
 assert.ok(w.tiles.some(p=>p.x===17&&p.y===7));assert.ok(!w.tiles.some(p=>p.x===17&&p.y===10));
 assert.deepEqual(planBossAttack(b,{x:4,y:7},4).tiles,carrotTiles(b,'left'));
 const s=arena();E.enemyBeat(s,4);assert.ok(E.restoreState(JSON.stringify(s)));
 const corrupt=structuredClone(s);livingBoss(corrupt.run.room).windup.tiles=[];assert.equal(E.restoreState(JSON.stringify(corrupt)),null);
});

test('three head strikes stun the rabbit, open a damage window, then reset the puzzle',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 assert.equal(E.bossExitReady(r),false);assert.equal(b.exposedUntil,-1);
 const hp=b.hp;r.player={x:9,y:7};E.act(s,{type:'hit',id:b.id},3);assert.equal(b.hp,hp);
 for(let i=0;i<3;i++){const child=children[i];r.player={x:child.x-1,y:child.y};assert.equal(E.act(s,{type:'hit',id:child.id},4+i).ok,true);assert.equal(child.hp,1);assert.equal(child.stunned,true);assert.equal(b.exposedUntil>=0,i===2);}
 assert.equal(b.windup,null);assert.equal(b.rabbitWindowUntil,16);
 const saved=E.restoreState(JSON.stringify(s));assert.ok(saved);assert.equal(saved.run.room.enemies.filter(e=>e.rabbitChild!==undefined&&e.stunned).length,3);
 r.player={x:9,y:7};E.act(s,{type:'hit',id:b.id},7);assert.ok(b.hp<hp);
 r.acted=17;E.tick(s,17);assert.equal(children.filter(e=>e.stunned).length,0);assert.equal(b.exposedUntil,-1);
 assert.equal(hitRabbitChild(r.room,children[0],18).hit,true);
 refreshRabbitChildren(r.room,b,39);assert.equal(children[0].stunned,false);
 assert.equal(bossDamage(b,100,40),0);
});

test('the last floor remains locked until the rabbit is defeated',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 for(let i=0;i<3;i++){const child=children[i];r.player={x:child.x-1,y:child.y};E.act(s,{type:'hit',id:child.id},4+i);}
 b.hp=1;r.player={x:9,y:7};E.act(s,{type:'hit',id:b.id},7);
 assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,true);assert.ok(s.descent.bosses.includes(35));assert.equal(E.descend(s),false);
});
