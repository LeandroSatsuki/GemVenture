import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {BOSSES,RABBIT_HOLES,rabbitHoles,rabbitChildren,carrotTiles,createBoss,planBossAttack,hitRabbitChild,refreshRabbitChildren,bossDamage,livingBoss} from '../dist/bosses.js';
import {TOTAL_FLOORS,BIOME_COUNT} from '../dist/campaign.js';
import {environment} from '../dist/cavern.js';
import {floorMinerals} from '../dist/materials.js';
import {generateAsset} from '../dist/art-kit.js';

function legacyArena(){const s=arena();rectangularRoom(s,{cols:21,rows:15});const b=createBoss(35,s.run.room.nextId++);s.run.room.enemies=[b];rabbitChildren(s.run.room,b);return s;}
function arena(){const s=E.createState(611);s.seals=6;E.startRun(s);s.run.floor=35;E.generateRoom(s);s.run.guardUntil=100;return s;}

test('the underground garden adds five floors, distinct ore and a readable rabbit arena',()=>{
 assert.equal(TOTAL_FLOORS,35);assert.equal(BIOME_COUNT,7);assert.equal(environment(31).terrain,6);assert.equal(floorMinerals(31).weights.length,4);
 const s=arena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 assert.equal(b.bossIndex,6);assert.equal(b.maxHp,BOSSES[6].hp);assert.equal(children.length,3);
 assert.deepEqual(children.map(e=>({x:e.x,y:e.y})),rabbitHoles(b));
 for(const child of children)assert.ok(E.pathTo(r.room,r.player,{x:child.x-1,y:child.y}).length);
 assert.ok(generateAsset('boss',{variant:6}).shapes.length<=30);assert.ok(generateAsset('rabbit',{biome:6}).shapes.length<=30);
 assert.equal(r.room.cleared,false);assert.equal(E.descend(s),false);
});

test('carrot warns for three beats and locks its lane before the player dodges',()=>{
 const b=createBoss(35,1);delete b.rabbitMechanic;const w=planBossAttack(b,{x:17,y:8},4);
 assert.equal(w.direction,'right');assert.equal(w.beat,7);assert.deepEqual(w.tiles,carrotTiles(b,'right'));
 assert.ok(w.tiles.some(p=>p.x===17&&p.y===7));assert.ok(!w.tiles.some(p=>p.x===17&&p.y===10));
 assert.deepEqual(planBossAttack(b,{x:4,y:7},4).tiles,carrotTiles(b,'left'));
 const s=arena();E.enemyBeat(s,4);assert.ok(E.restoreState(JSON.stringify(s)));
 const corrupt=structuredClone(s);livingBoss(corrupt.run.room).windup.tiles=[];assert.equal(E.restoreState(JSON.stringify(corrupt)),null);
});

test('legacy saved encounter keeps three direct head strikes and damage window',()=>{
 const s=legacyArena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 delete b.rabbitMechanic; // Explicit untagged legacy-save fixture; new encounters use carrot bait.
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

test('legacy encounter still requires actual rabbit death before the last floor clears',()=>{
 const s=legacyArena(),r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);
 delete b.rabbitMechanic; // Explicit untagged legacy-save fixture; new encounters use carrot bait.
 for(let i=0;i<3;i++){const child=children[i];r.player={x:child.x-1,y:child.y};E.act(s,{type:'hit',id:child.id},4+i);}
 b.hp=1;r.player={x:9,y:7};E.act(s,{type:'hit',id:b.id},7);
 assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,true);assert.ok(s.descent.bosses.includes(35));assert.equal(E.descend(s),false);
});


test('new rabbit requires carrot bait, schedules a real mutiny and opens only on its impact',()=>{
 const s=E.createState(611);s.seals=6;s.best=35;s.descent.stops=[1,35];assert.ok(E.startRun(s,'floors',35));
 const r=s.run,b=livingBoss(r.room),children=r.room.enemies.filter(e=>e.rabbitChild!==undefined);assert.equal(b.rabbitMechanic,2);
 r.player={x:children[0].x-1,y:children[0].y};assert.ok(E.act(s,{type:'hit',id:children[0].id},0).ok);assert.equal(children[0].stunned,false);assert.equal(children[0].hp,1);assert.ok(r.events.some(e=>e.type==='rabbitLureHint'));
 // Fresh controlled QA positioning, then ordinary actions; no guard or HP changes.
 const t=E.createState(611);t.seals=6;t.best=35;t.descent.stops=[1,35];E.startRun(t,'floors',35);t.run.player={x:6,y:10};for(let n=0;n<=3;n++)E.tick(t,n);
 const boss=livingBoss(t.run.room),steps=[[4,'d',0,1],[5,'m',14,7],[6,'m',14,7],[7,'m',14,7],[8,'m',14,7],[9,'d',0,1],[10,'m',9,12],[11,'m',9,12],[12,'m',9,12],[13,'m',9,12],[14,'d',1,0],[15,'m',9,7],[16,'m',9,7],[17,'h'],[18,'h'],[19,'h']],events=[];
 for(const [beat,type,x,y]of steps){t.run.events=[];E.enemyBeat(t,beat);const action=type==='d'?{type:'dodge',dx:x,dy:y}:type==='m'?{type:'move',x:x+2,y:y+3}:{type:'hit',id:boss.id};assert.ok(E.act(t,action,beat).ok);E.tick(t,beat);events.push(...t.run.events);if(beat===17){assert.equal(boss.exposedUntil,-1);assert.ok(E.restoreState(JSON.stringify(t)));}if(beat===18){assert.equal(boss.rabbitWindowUntil,28);assert.ok(E.restoreState(JSON.stringify(t)));}}
 assert.equal(t.run.health,100);assert.equal(boss.hp,1078);assert.deepEqual(events.filter(e=>e.type==='rabbitChildStunned').map(e=>e.beat),[7,12,17]);assert.deepEqual(events.filter(e=>e.type==='rabbitMutiny').map(e=>e.beat),[17]);assert.deepEqual(events.filter(e=>e.type==='rabbitMutinyImpact').map(e=>e.beat),[18]);assert.deepEqual(events.filter(e=>e.type==='rabbitBossHit').map(e=>e.beat),[19]);assert.equal(t.run.room.cleared,false);
});
