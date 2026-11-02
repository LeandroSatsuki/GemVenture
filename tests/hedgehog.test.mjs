import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {HEDGEHOG_ID,HEDGEHOG_RULES,hedgehogMood,hedgehogHitTest,hedgehogApproaches} from '../dist/hedgehog.js';
import {locateHedgehog,isFloor} from '../dist/cave-layout.js';
import {project} from '../dist/world.js';
import {eventSoundCues} from '../dist/sound-design.js';

function arena(mode='floors'){
 const s=E.createState(712);s.seals=6;s.best=35;s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];E.startRun(s,mode);if(mode!=='abyss')rectangularRoom(s);const r=s.run,room=r.room;
 room.floorMask=Array.from({length:room.cols*room.rows},(_,i)=>+(i%room.cols>0&&i%room.cols<room.cols-1&&Math.floor(i/room.cols)>0&&Math.floor(i/room.cols)<room.rows-1));
 room.terrain=Array(room.cols*room.rows).fill(0);room.wave=null;room.rocks=[];room.nodes=[];room.enemies=[];room.charge=0;room.quota=99999;room.minBeats=999;room.cleared=false;delete room.explored;delete room.visible;
 room.hedgehog={x:7,y:0,facing:1,biome:0,pulseBeat:-1};r.player={x:7,y:1};r.events=[];return s;
}
const strike=(s,beat)=>E.act(s,{type:'hit',id:HEDGEHOG_ID},beat);

test('one on-beat pickaxe contact makes three ordinary crystals, without direct payout or enemy damage',()=>{
 const s=arena(),r=s.run,before={health:r.health,bag:r.bag,materials:[...r.materials],xp:s.experience.xp};const result=strike(s,0);
 assert.equal(result.ok,true);assert.equal(result.spawned,3);assert.equal(r.combo,1);assert.equal(r.room.hedgehogGrowth.hits,1);assert.equal(r.room.nodes.length,3);
 assert.deepEqual({health:r.health,bag:r.bag,materials:r.materials,xp:s.experience.xp},before);assert.equal(r.room.charge,0);assert.equal(r.room.enemies.length,0);
 for(const n of r.room.nodes){assert.equal(n.type,'crystal');assert.equal(n.hp,2);assert.equal(n.maxHp,2);assert.equal(n.value,3);assert.ok(isFloor(r.room,n.x,n.y));assert.ok(E.pathTo(r.room,r.player,n).length);}
 assert.equal(r.events.filter(e=>e.type==='hedgehogHit').length,1);assert.equal(r.events.filter(e=>e.type==='sprout').length,3);assert.equal(r.events.filter(e=>e.type==='kill'||e.type==='loot'||e.type==='bump').length,0);
 assert.deepEqual(eventSoundCues(r.events),['hedgehog']);const snapshot=JSON.stringify(r.room.hedgehogGrowth);assert.equal(strike(s,0).duplicate,true);assert.equal(JSON.stringify(r.room.hedgehogGrowth),snapshot);
});

test('misses cannot trigger a reaction; cooldown, per-room budget and capacity bound extra resources',()=>{
 const s=arena();assert.equal(strike(s,.5).miss,true);assert.equal(s.run.room.hedgehogGrowth,undefined);assert.equal(s.run.room.nodes.length,0);
 const a=arena();for(const [beat,count]of [[0,3],[1,0],[6,3],[12,3],[18,0],[30,0]])assert.equal(strike(a,beat).spawned,count);
 assert.equal(a.run.room.nodes.length,HEDGEHOG_RULES.budget);assert.equal(a.run.room.hedgehogGrowth.spawned,9);assert.equal(a.run.room.hedgehogGrowth.hits,6);
 const b=arena();b.run.room.nodes=Array.from({length:63},(_,i)=>({id:1000+i,type:'crystal',kind:0,x:20+i%10,y:15+Math.floor(i/10),hp:5,maxHp:5,born:0}));assert.equal(strike(b,0).spawned,1);assert.equal(b.run.room.nodes.length,64);assert.equal(b.run.room.hedgehogGrowth.spawned,1);
 const c=arena();c.run.room.nodes=Array.from({length:180},(_,i)=>({id:1000+i,type:'crystal',kind:0,x:20,y:15,hp:0,maxHp:5,born:0}));assert.equal(strike(c,0).spawned,0);assert.equal(c.run.room.nodes.length,180);
});

test('approach uses regular movement and blocked approaches still count rhythm without growing crystals',()=>{
 const s=arena(),r=s.run;r.player={x:25,y:10};const before={...r.player};const first=strike(s,0);assert.equal(first.approaching,true);assert.equal(r.room.hedgehogGrowth,undefined);assert.ok(E.distance(before,r.player)<=E.movement(s));
 for(let beat=1;beat<20&&!r.room.hedgehogGrowth;beat++)assert.equal(strike(s,beat).ok,true);
 assert.equal(r.room.hedgehogGrowth.hits,1);assert.ok(hedgehogApproaches(r.room).some(p=>E.distance(p,r.player)===0));
 const b=arena();b.run.player={x:7,y:3};b.run.room.rocks=hedgehogApproaches(b.run.room).map((p,id)=>({...p,id:2000+id,hp:20,maxHp:20,kind:0,type:'rock'}));const blocked=strike(b,0);assert.equal(blocked.ok,true);assert.equal(blocked.blocked,true);assert.equal(b.run.combo,1);assert.equal(b.run.room.hedgehogGrowth,undefined);assert.equal(b.run.room.nodes.length,0);
});

test('save/reload preserves spent growth and cooldown; legacy saves migrate without granting free crystals',()=>{
 const s=arena();strike(s,0);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.deepEqual(restored.run.room.hedgehogGrowth,s.run.room.hedgehogGrowth);assert.equal(strike(restored,1).spawned,0);assert.equal(strike(restored,6).spawned,3);
 const legacy=structuredClone(s);delete legacy.run.room.hedgehogGrowth;assert.ok(E.restoreState(JSON.stringify(legacy)));assert.equal(E.restoreState(JSON.stringify(legacy)).run.room.nodes.length,3);
 for(const bad of [{spawned:10},{spawned:-1},{nextBloomBeat:-4},{hits:1.5},{lastHitBeat:null},{window:-1}]){const raw=structuredClone(s);Object.assign(raw.run.room.hedgehogGrowth,bad);assert.equal(E.restoreState(JSON.stringify(raw)),null);}
});

test('abyss burrow relocation cannot refresh rewards; only entering the next section renews its budget',()=>{
 const s=arena('abyss'),r=s.run;for(const beat of [0,6,12])strike(s,beat);assert.equal(r.room.hedgehogGrowth.spawned,9);
 locateHedgehog(r.room,0);r.player=hedgehogApproaches(r.room)[0];assert.equal(strike(s,18).spawned,0);assert.equal(r.room.hedgehogGrowth.spawned,9);
 r.abyss.section++;assert.equal(strike(s,24).spawned,3);assert.equal(r.room.hedgehogGrowth.window,1);assert.equal(r.room.hedgehogGrowth.spawned,3);
});

test('hit region stays in the wall; hidden spectator cannot be selected and no click changes cave collision',()=>{
 const s=arena(),r=s.run,h=r.room.hedgehog,p=project(h.x,h.y),mask=[...r.room.floorMask];assert.equal(hedgehogHitTest(r.room,{x:p.x,y:p.y-100},project)?.id,HEDGEHOG_ID);assert.equal(hedgehogHitTest(r.room,project(h.x,h.y+2),project),null);strike(s,0);assert.deepEqual(r.room.floorMask,mask);assert.equal(h.hp,undefined);
 r.room.explored=Array(r.room.cols*r.room.rows).fill(0);r.room.visible=[...r.room.explored];assert.equal(hedgehogHitTest(r.room,{x:p.x,y:p.y-100},project),null);assert.equal(strike(s,6).hidden,true);
});

test('sad/recovery poses follow the musical phase, return to dance, and support reduced motion',()=>{
 const g={lastHitBeat:8};assert.equal(hedgehogMood(g,7.9).state,'dance');assert.equal(hedgehogMood(g,8).contact,true);assert.equal(hedgehogMood(g,8.5).state,'sad');assert.equal(hedgehogMood(g,8.5).tuck,1);assert.equal(hedgehogMood(g,10.5).state,'recover');assert.equal(hedgehogMood(g,10.5).tuck,.5);assert.equal(hedgehogMood(g,11).state,'dance');assert.equal(hedgehogMood(g,8.5,true).tuck,1);assert.equal(hedgehogMood(undefined,0).tuck,0);assert.deepEqual(hedgehogMood(g,8.5),hedgehogMood(g,8.5),'pause retains the same pose');
});

test('area explosions cannot strike the spectator or bypass a living boss',()=>{
 const s=arena(),r=s.run;r.items.blast=1;E.act(s,{type:'item',item:'blast'},0);assert.equal(r.room.hedgehogGrowth,undefined);assert.equal(r.room.nodes.length,0);
 r.floor=5;E.generateRoom(s);r.room.rocks=[];const boss=r.room.enemies.find(e=>e.boss),hp=boss.hp;r.player=hedgehogApproaches(r.room)[0];delete r.room.explored;delete r.room.visible;strike(s,6);assert.equal(boss.hp,hp);assert.equal(r.room.bossDefeated,false);assert.equal(r.room.cleared,false);
});
