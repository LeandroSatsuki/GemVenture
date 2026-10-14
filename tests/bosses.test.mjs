import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {BOSSES,isBossFloor,createBoss,livingBoss,planBossAttack,bossStep,finishBossAttack,bossDamage} from '../dist/bosses.js';
import {TRACKS,BOSS_TRACKS,trackForFloor,trackIndexForFloor,beatSeconds,scoreStep} from '../dist/score.js';
import {Music} from '../dist/audio.js';
function arena(floor=5){const s=E.createState(712);s.seals=3;E.startRun(s);s.run.floor=floor;E.generateRoom(s);return s;}
test('one themed boss ends each five-floor biome, with an open reachable arena',()=>{
 for(let floor=1;floor<=20;floor++){assert.equal(isBossFloor(floor),floor%5===0);if(!isBossFloor(floor))continue;const s=arena(floor),b=livingBoss(s.run.room);assert.equal(b.bossIndex,floor/5-1);assert.equal(b.maxHp,BOSSES[b.bossIndex].hp);assert.equal(s.run.room.enemies.length,1);assert.ok(E.pathTo(s.run.room,s.run.player,{x:b.x-1,y:b.y}).length);assert.equal(s.run.room.rocks.length,0);}
});
test('charge and combo cannot bypass a boss; death unlocks the elevator and pays once',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room);r.room.charge=999;r.combo=100;
 E.act(s,{type:'move',x:4,y:11},0);assert.equal(r.room.cleared,false);assert.equal(E.descend(s),false);
 r.player={x:b.x-1,y:b.y};b.hp=1;E.act(s,{type:'hit',id:b.id},1);
 assert.equal(r.room.bossDefeated,true);assert.equal(r.room.cleared,true);assert.equal(s.essence,3);assert.equal(r.loot.enemies.gems,180);assert.equal(r.events.filter(e=>e.type==='bossDefeated').length,1);
 E.act(s,{type:'hit',id:b.id},2);E.tick(s,3);assert.equal(s.essence,3);assert.equal(r.loot.enemies.gems,180);
 E.chooseCard(s,r.cardOffer[0]);assert.ok(E.descend(s));assert.equal(s.run.floor,6);assert.equal(s.run.room.bossFloor,undefined);
});
test('all four attacks have different geometry, advance on beats and expose the boss afterward',()=>{
 const player={x:8,y:9},patterns=[];
 for(const floor of [5,10,15,20]){const b=createBoss(floor,1);assert.equal(bossStep(b,player,3),null);const w=bossStep(b,player,4);assert.ok(w.beat>=6);assert.ok(w.tiles.length>0&&w.tiles.length<247);patterns.push(JSON.stringify(w.tiles));assert.equal(bossStep(b,player,5),null);finishBossAttack(b,w.beat);assert.equal(b.exposedUntil,w.beat+4);assert.equal(bossStep(b,player,w.beat+4),null);assert.ok(bossStep(b,player,w.beat+5));}
 assert.equal(new Set(patterns).size,4);
});
test('mystic safe seals are reachable at base speed from every tile before the attack',()=>{
 const b=createBoss(20,1);for(let y=1;y<14;y++)for(let x=1;x<20;x++){const w=planBossAttack(b,{x,y},4),safe=w.safe;const steps=Math.max(0,Math.abs(x-safe.x)-2)+Math.max(0,Math.abs(y-safe.y)-2);assert.ok(steps<=8,x+','+y);assert.equal(w.tiles.some(t=>t.x===safe.x&&t.y===safe.y),false);}
 b.cycle=1;assert.equal(planBossAttack(b,{x:8,y:9},4).attack,'RUPTURA RÚNICA');
});
test('armor reduces damage, exposure rewards attacks and stacked procs share a pulse ceiling',()=>{
 const b=createBoss(5,1);assert.equal(bossDamage(b,10,0),2);finishBossAttack(b,1);assert.equal(bossDamage(b,10,2),10);assert.equal(bossDamage(b,10000,2),2);assert.equal(bossDamage(b,10000,2),0);assert.equal(bossDamage(b,10000,3),12);
 const s=arena(),boss=livingBoss(s.run.room);s.equipped=['stun'];s.run.cards={ice:8};s.run.player={x:9,y:6};s.run.cardHits=4;const w=bossStep(boss,s.run.player,4);E.act(s,{type:'hit',id:boss.id},4);assert.equal(boss.windup,w);assert.equal(boss.stunUntil,-1);
});
test('marked attacks deal damage only on the resolution beat, safe tiles and shields work',()=>{
 const s=arena(),b=livingBoss(s.run.room);s.run.player={x:9,y:6};E.enemyBeat(s,4);const due=b.windup.beat;for(let beat=4;beat<=due;beat++){s.run.acted=beat;E.tick(s,beat);if(beat<due)assert.equal(s.run.health,100);}assert.equal(s.run.health,70);assert.equal(b.windup,null);assert.equal(b.exposedUntil,due+4);
 for(const shield of [false,true]){const t=arena(20),boss=livingBoss(t.run.room);E.enemyBeat(t,4);if(shield)t.run.guardUntil=6;else t.run.player={...boss.windup.safe};t.run.acted=6;E.tick(t,6);assert.equal(t.run.health,100);}
});
test('boss health, telegraphs, damage budget and cycle survive reload; no regular reinforcements spawn',()=>{
 const s=arena(10),b=livingBoss(s.run.room);E.enemyBeat(s,4);bossDamage(b,10,4);const copy=E.restoreState(JSON.stringify(s));assert.deepEqual(livingBoss(copy.run.room),b);
 copy.run.guardUntil=100;for(let beat=4;beat<40;beat++){copy.run.acted=beat;E.tick(copy,beat);}assert.equal(copy.run.room.enemies.length,1);
 b.hp=b.maxHp/2;finishBossAttack(b,4);b.recoverUntil=4;const w=bossStep(b,{x:8,y:9},5);assert.equal(b.phase,2);assert.ok(w.damage>BOSSES[1].damage);
});
test('boss scores are distinct, slower than exploration and share the exact gameplay tempo',()=>{
 assert.deepEqual(BOSS_TRACKS.map(t=>t.bpm),[92,100,108,116,104,108,112]);assert.equal(new Set(BOSS_TRACKS.map(t=>JSON.stringify(t.melody))).size,7);
 for(let i=0;i<BOSS_TRACKS.length;i++){const floor=(i+1)*5;assert.equal(trackForFloor(floor),BOSS_TRACKS[i]);assert.ok(BOSS_TRACKS[i].bpm<TRACKS[i].bpm);assert.equal(beatSeconds(floor),60/BOSS_TRACKS[i].bpm);for(let step=0;step<128;step++)assert.equal(scoreStep(trackIndexForFloor(floor),step).some(e=>e.kind==='kick'),step%4===0);assert.ok(scoreStep(trackIndexForFloor(floor),0).some(e=>e.kind==='chord'));}
 const m=new Music(),notes=[];m.enabled=true;m.ctx={state:'running',currentTime:1};m.tone=(...a)=>notes.push(a);m.noise=()=>{};m.update(0,7);assert.equal(m.track,7);assert.ok(notes.some(n=>n[1]>1));const count=notes.length;m.update(0,7);assert.equal(notes.length,count);
});
