// Legacy encounter fixtures preserve in-progress save compatibility; see geode-crown-official.test.mjs for fresh Coroa Fraturada arenas.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {createBoss,planBossAttack,livingBoss,geodeKnockback,validGeodeBoss} from '../dist/bosses.js';
import {World,project} from '../dist/world.js';
import {Effects} from '../dist/effects.js';
import {eventSoundCues} from '../dist/sound-design.js';

function arena(){const s=E.createState(712);E.startRun(s);s.run.floor=5;E.generateRoom(s);delete livingBoss(s.run.room).crown;livingBoss(s.run.room).windup=null;livingBoss(s.run.room).recoverUntil=3;Object.assign(livingBoss(s.run.room),{x:10,y:6});s.run.player={x:9,y:6};s.run.combo=12;s.run.rhythm=60;E.enemyBeat(s,4);s.run.events=[];return s;}
function strike(s){s.run.acted=7;E.tick(s,7);}
test('Geode locks the player position for three pulses and signals a distinct crystal attack',()=>{
 const b=createBoss(5,0),player={x:9,y:6},w=planBossAttack(b,player,4);player.x=18;
 assert.equal(w.x,9);assert.equal(w.y,6);assert.equal(w.beat,7);assert.equal(w.attack,'CRISTAL GIGANTE');
 assert.equal(w.knockback,3);assert.equal(w.tiles.length,13);
 b.windup=w;assert.equal(validGeodeBoss(b),true);
 b.hp=b.maxHp/2;b.phase=2;assert.ok(planBossAttack(b,{x:9,y:6},4).damage>w.damage);
});
test('a hit deals health damage, knocks back along valid cells and breaks rhythm once',()=>{
 const s=arena(),r=s.run;strike(s);
 assert.equal(r.health,70);assert.equal(r.rhythm,50);assert.equal(r.combo,0);assert.deepEqual(r.player,{x:6,y:6});
 const recoil=r.events.find(e=>e.type==='knockback');assert.equal(recoil.path.length,3);assert.deepEqual(recoil.to,r.player);
 assert.equal(r.events.filter(e=>e.type==='geodeEruption').length,1);assert.equal(livingBoss(r.room).windup,null);
 assert.deepEqual(livingBoss(r.room).geodePillars,[{x:9,y:6,born:7,until:9}]);
 assert.equal(r.room.cleared,false);assert.equal(E.descend(s),false);
 assert.equal(E.act(s,{type:'move',x:6,y:7},8).ok,true,'next on-beat action still works');
 r.acted=8;E.tick(s,8);assert.equal(r.health,70);assert.ok(r.rhythm>=50);
 assert.equal(r.events.filter(e=>e.type==='knockback').length,1,'remaining pillar never hits twice');
});
test('leaving the locked marker preserves the combo, while guard and shield absorb the whole attack',()=>{
 for(const defense of ['dodge','guard','shield']){
  const s=arena(),r=s.run;if(defense==='dodge')r.player={x:9,y:10};
  else if(defense==='guard')r.guardUntil=7;else r.frenzy.buffs.shield=9;
  const before={...r.player};strike(s);
  assert.equal(r.health,100,defense);assert.equal(r.rhythm,60,defense);assert.equal(r.combo,12,defense);
  assert.deepEqual(r.player,before);assert.equal(r.events.some(e=>e.type==='knockback'),false);
  assert.equal(r.events.some(e=>e.type==='geodeEruption'),true);
 }
});
test('ice still weakens the crystal hit, and expired ice does not reduce it',()=>{
 for(const until of [6,8]){const s=arena(),b=livingBoss(s.run.room);b.chill={until,reduction:.25};strike(s);assert.equal(s.run.health,until===8?77.5:70);assert.equal(s.run.rhythm,50);}
});
test('recoil stops at walls, rocks and living actors instead of crossing them',()=>{
 const s=arena(),room=s.run.room,b=livingBoss(room);
 for(const p of [{x:1,y:6},{x:19,y:6},{x:10,y:13},{x:10,y:1}]){
  const recoil=geodeKnockback(room,p,p,b);assert.ok(recoil.path.every(t=>E.pathTo(room,p,t).length));
  assert.ok(recoil.path.length<=3);
 }
 room.rocks=[{x:7,y:6,hp:10}];let recoil=geodeKnockback(room,{x:9,y:6},{x:9,y:6},b);
 assert.deepEqual(recoil.path,[{x:8,y:6}]);
 room.rocks=[];room.enemies.push({x:8,y:6,hp:10});recoil=geodeKnockback(room,{x:9,y:6},{x:9,y:6},b);assert.equal(recoil.path.length,0);
});
test('telegraph and pillar survive saving, malformed replacements fail and legacy warnings remain valid',()=>{
 const s=arena(),copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.deepEqual(livingBoss(copy.run.room).windup,livingBoss(s.run.room).windup);
 strike(s);const landed=E.restoreState(JSON.stringify(s));assert.ok(landed);assert.deepEqual(livingBoss(landed.run.room).geodePillars,livingBoss(s.run.room).geodePillars);
 for(const corrupt of [b=>{b.windup.beat++;},b=>{b.windup.tiles=[];},b=>{b.geodePillars=[{x:-1,y:6,born:7,until:9}];}]){const bad=arena();corrupt(livingBoss(bad.run.room));assert.equal(E.restoreState(JSON.stringify(bad)),null);}
 const legacy=arena(),b=livingBoss(legacy.run.room);delete b.windup.geode;delete b.windup.startedBeat;delete b.windup.knockback;delete b.windup.rhythmDamage;b.windup.attack='ESTILHAÇOS';assert.ok(E.restoreState(JSON.stringify(legacy)));
});
test('revival closes the attack without immediately draining the other reserve or repeating the hit',()=>{
 const s=arena();s.relics=['phoenix'];s.run.health=1;strike(s);const r=s.run;
 assert.ok(r.recovery.active);assert.equal(r.health,30);assert.equal(r.rhythm,60);assert.equal(livingBoss(r.room).windup,null);
 E.resumeRecovery(s);r.acted=8;E.tick(s,8);assert.equal(r.health,30);assert.equal(r.events.filter(e=>e.type==='geodeEruption').length,1);
});
test('recoil interrupts a blink, freezes while paused and leaves the camera alone',()=>{
 const w=Object.assign(Object.create(World.prototype),{player:project(9,6),target:project(9,6),trail:[],route:null,reduced:false,fx:new Effects(),camera:{x:100,y:100}});
 w.consume([{type:'dash',to:{x:9,y:8},path:[{x:9,y:7},{x:9,y:8}]}]);w.advanceMovement(.03);const visible={...w.player},camera={...w.camera};
 w.consume([{type:'knockback',from:{x:9,y:6},to:{x:6,y:6},path:[{x:8,y:6},{x:7,y:6},{x:6,y:6}],dx:-1,dy:0}]);
 assert.deepEqual(w.route.points[0],visible);w.advanceMovement(1,true);assert.deepEqual(w.player,visible);
 w.advanceMovement(.3);assert.deepEqual(w.player,project(6,6));assert.deepEqual(w.camera,camera);
 assert.ok(eventSoundCues([{type:'geodeEruption'}]).includes('geodeEruption'));
});
