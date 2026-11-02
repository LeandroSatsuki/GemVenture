import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun,generateRoom,act,tick,restoreState,finishRun,power,movement} from '../dist/core.js';
import {sightRange} from '../dist/cavern.js';
import {createRunOrbs,orbStrikeBonus,orbIncoming,advanceRunOrbs,validRunOrbs} from '../dist/run-orbs.js';
import {placeCaveZag} from '../dist/cave-zag.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function fresh(seed=1){const s=createState(seed);assert.equal(startRun(s),true);return s;}
test('orbs survive a floor change, do not refresh cooldown on change, and disappear at the end of the run',()=>{
 const s=fresh(),r=s.run;r.orbs.red='impact';r.orbs.blue='stride';r.orbs.yellow='brace';r.orbs.guardCooldown=7;r.orbs.spent=9;r.floor=2;generateRoom(s);assert.equal(r.orbs.red,'impact');assert.equal(r.orbs.guardCooldown,7);assert.equal(r.orbs.spent,9);r.acted=0;tick(s,0);assert.equal(r.orbs.guardCooldown,6);
 const bank=s.bank;finishRun(s,'return');assert.equal(s.run,null);assert.equal(startRun(s),true);assert.deepEqual(s.run.orbs,createRunOrbs());assert.ok(s.zag);assert.equal(s.bank,bank);
});
test('red powers add bounded direct creature damage; base power, mining and card proc values remain unchanged',()=>{
 for(const id of ['impact','pulse']){
  const s=fresh(),r=s.run;rectangularRoom(s);r.room.quota=99999;const base=power(s);r.orbs.red=id;
  const enemy={id:100,type:'enemy',kind:0,x:r.player.x+1,y:r.player.y,hp:1000,maxHp:1000,stunUntil:-1};r.room.enemies=[enemy];
  for(let beat=0;beat<4;beat++)assert.equal(act(s,{type:'hit',id:enemy.id},beat).ok,true);
  close(power(s),base);close(1000-enemy.hp,base*(id==='impact'?4.4:4.25));
  const ore={id:101,type:'crystal',kind:0,x:r.player.x,y:r.player.y+1,hp:1000,maxHp:1000,value:1};r.room.nodes=[ore];act(s,{type:'hit',id:ore.id},4);close(1000-ore.hp,base);
 }
 const run={mode:'floors',orbs:createRunOrbs()};run.orbs.red='impact';close(orbStrikeBonus(run,100,{type:'enemy',hp:10}),10);close(orbStrikeBonus(run,100,{type:'rock',hp:10}),0);
});
test('yellow protection cannot create immunity, healing or damage amplification; recharge uses musical beats only',()=>{
 const run={mode:'floors',orbs:createRunOrbs()};run.orbs.yellow='shelter';close(orbIncoming(run,100,true),92);close(orbIncoming(run,100,false),100);
 run.orbs.yellow='brace';close(orbIncoming(run,100,true),80);assert.equal(run.orbs.guardCooldown,12);close(orbIncoming(run,100,true),100);advanceRunOrbs(run,11);close(orbIncoming(run,100,true),100);advanceRunOrbs(run,1);close(orbIncoming(run,100,true),80);close(orbIncoming(run,0,true),0);
 const s=fresh(),r=s.run;rectangularRoom(s);r.orbs.yellow='shelter';r.acted=4;r.room.enemies=[{id:9,type:'enemy',kind:0,x:4,y:11,hp:10,maxHp:10,stunUntil:-1,windup:{x:3,y:11,beat:4,radius:0,kind:'acid'}}];const health=r.health;tick(s,4);close(health-r.health,7.84*.92);
});
test('blue movement and sight respect purchased progression; disabled modes do not receive run powers',()=>{
 const s=fresh(),r=s.run,m=movement(s),vision=sightRange(r);r.orbs.blue='stride';assert.equal(movement(s),m+1);r.orbs.blue='lantern';assert.equal(sightRange(r),vision+2);assert.equal(movement(s),m);r.mode='abyss';assert.equal(sightRange(r),vision);assert.equal(placeCaveZag(r),null);r.mode='floors';r.trainingClock={};assert.equal(sightRange(r),vision);
});

test('retired commerce does not weaken validation of already equipped run powers',()=>{
 for(const mutate of[r=>r.orbs.red='lantern',r=>r.orbs.guardCooldown=13,r=>r.orbs.spent=-1]){const s=fresh();mutate(s.run);assert.equal(restoreState(JSON.stringify(s)),null);}
 assert.equal(validRunOrbs({...createRunOrbs(),pulseHits:4}),false);
});
