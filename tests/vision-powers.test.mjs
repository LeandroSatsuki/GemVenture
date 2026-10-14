import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {sightRange,sightDistance,reveal,visible} from '../dist/cavern.js';
import {cardOffer,cardDetail,CARDS} from '../dist/cards.js';
function arena(){const s=E.createState(321);s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];E.startRun(s,'abyss');const r=s.run;r.room.rocks=[];r.room.nodes=[];r.room.enemies=[];r.room.terrain.fill(0);r.player={x:20,y:15};reveal(r.room,r.player);return s;}
test('sight is circular in projected space, grows with lanterns and survives reload',()=>{
 assert.equal(sightDistance(4,0),4);assert.equal(sightDistance(-.5,5.5),4);
 const s=arena(),r=s.run;assert.equal(sightRange(r),5);assert.equal(visible(r.room,{x:26,y:15}),false);
 r.cards.lantern=2;reveal(r.room,r.player,sightRange(r));assert.equal(visible(r.room,{x:26,y:15}),true);
 const restored=E.restoreState(JSON.stringify(s));assert.equal(sightRange(restored.run),7);assert.equal(visible(restored.run.room,{x:26,y:15}),true);
 r.cards.lantern=3;assert.equal(sightRange(r),8);for(let i=0;i<100;i++)assert.ok(!cardOffer(E.rng(i),r,s).includes('lantern'));
 assert.match(cardDetail(CARDS.find(c=>c.id==='lantern'),2),/40%/);
});
test('abyss exploration rebases with the world and old saves acquire sight without losing resources',()=>{
 const s=arena(),r=s.run;r.room.explored[10*r.room.cols+10]=1;r.acted=4;r.guardUntil=10;E.tick(s,4);
 assert.equal(r.room.explored[9*r.room.cols+10],1);assert.ok(visible(r.room,r.player));
 r.room.explored=null;r.room.visible=null;r.materials=[9,8,7,6];const t=E.restoreState(JSON.stringify(s));assert.ok(t.run.room.visible);assert.deepEqual(t.run.materials,[9,8,7,6]);
});
test('wings fly over intact rocks and water, expire onto free ground and preserve their timer on reload',()=>{
 const s=arena(),r=s.run;r.player={x:3,y:11};r.room.rocks=Array.from({length:4},(_,i)=>({id:900+i,x:4+i,y:11,type:'rock',kind:0,hp:20,maxHp:20,value:2}));r.room.terrain[11*r.room.cols+4]=1;
 r.frenzy.buffs.wings=4;reveal(r.room,r.player);E.act(s,{type:'dodge',dx:1,dy:0},0);assert.equal(r.player.x,7);assert.ok(r.room.rocks.every(n=>n.hp===20));
 const restored=E.restoreState(JSON.stringify(s));assert.equal(restored.run.frenzy.buffs.wings,4);E.settleFlight(restored.run,5);assert.ok(E.walkable(restored.run.room,restored.run.player.x,restored.run.player.y));assert.equal(restored.run.airborne,false);
});
test('golden bubble blocks attacks, but never removes rhythm penalties or outlives the timer',()=>{
 const s=arena(),r=s.run;r.frenzy.buffs.shield=6;r.room.enemies=[{id:900,type:'enemy',kind:2,x:20,y:16,hp:30,maxHp:30,stunUntil:-1,windup:{...r.player,beat:4,radius:0}}];
 r.acted=4;E.tick(s,4);assert.equal(r.health,100);assert.ok(r.events.some(e=>e.type==='shieldBlock'));
 const breath=r.rhythm;E.act(s,{type:'dodge',dx:1,dy:0},5.45);assert.ok(r.rhythm<breath);
 r.room.enemies[0].windup={...r.player,beat:7,radius:0};r.acted=7;E.tick(s,7);assert.ok(r.health<100);
});
