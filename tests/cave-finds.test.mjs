import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as E from '../dist/core.js';
import {reveal,sightRange} from '../dist/cavern.js';
import {runBeatTime} from '../dist/training-clock.js';
import {createFindState,chestReward,comboGuardRemaining,useCaveFind,validCaveFinds,FIND_RULES} from '../dist/cave-finds.js';
import {calculateFloorScore} from '../dist/stars.js';
import {generateAsset,assetToSvg} from '../dist/art-kit.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function start(seed=43){const s=E.createState(seed);E.startRun(s);return s;}
function arena(){const s=start();rectangularRoom(s);s.run.room.quota=99999;s.run.room.wave=null;return s;}
function prop(s,kind,x=4,y=11,number=kind==='chest'?3:0){const r=s.run,p={id:'find:'+r.room.seed+':'+number,type:'caveFind',kind,x,y,number,hp:1,maxHp:1,used:false,...(kind==='chest'?{reward:chestReward(r.room.seed,r.floor,number)}:{})};r.room.caveFinds??=[];r.room.caveFinds.push(p);return p;}
function approach(s,p){const n=[[0,1],[1,0],[-1,0],[0,-1]].map(([x,y])=>({x:p.x+x,y:p.y+y})).find(n=>E.walkable(s.run.room,n.x,n.y));assert.ok(n);s.run.player=n;reveal(s.run.room,n,sightRange(s.run));}
test('chests always pay their exact base crystal once, without coin/XP/charge/score awards or opening a menu',()=>{
 const s=arena(),r=s.run,p=prop(s,'chest'),before={coins:r.bag,bank:s.bank,materials:[...r.materials],xp:s.experience.xp,charge:r.room.charge,score:r.score.points};
 assert.equal(E.act(s,{type:'hit',id:p.id},0).ok,true);assert.equal(p.used,true);assert.equal(p.hp,0);assert.equal(r.materials[p.reward.kind],before.materials[p.reward.kind]+p.reward.amount);assert.equal(r.bag,before.coins);assert.equal(s.bank,before.bank);assert.equal(s.experience.xp,before.xp);assert.equal(r.room.charge,before.charge);assert.equal(r.score.points,before.score);assert.ok(!r.rest&&!r.recovery&&!r.room.cleared);assert.equal(r.events.filter(e=>e.type==='findUsed').length,1);
 E.act(s,{type:'hit',id:p.id},0);E.act(s,{type:'hit',id:p.id},1);assert.equal(r.materials[p.reward.kind],before.materials[p.reward.kind]+p.reward.amount);
});
test('missed rhythm, nonarrival and duplicates never open a chest or consume a mushroom',()=>{
 const s=arena(),r=s.run,p=prop(s,'heal');r.health=30;assert.equal(E.act(s,{type:'hit',id:p.id},.4).miss,true);assert.equal(p.used,false);assert.equal(r.health,30);assert.equal(E.act(s,{type:'hit',id:p.id},0).duplicate,true);assert.equal(p.used,false);
 r.player={x:20,y:20};E.act(s,{type:'hit',id:p.id},1);assert.equal(p.used,false);assert.equal(r.health,30);
});
test('green mushrooms heal a fixed capped 20 HP, do not trigger healing cards, and remain if life is full',()=>{
 const s=arena(),r=s.run,p=prop(s,'heal');r.cards={candy:16,vampire:16};E.act(s,{type:'hit',id:p.id},0);assert.equal(p.used,false);assert.equal(r.health,E.maxHealth(s));assert.ok(r.events.some(e=>e.type==='proc'&&e.id==='find-full'));
 r.health=45;E.act(s,{type:'hit',id:p.id},1);assert.equal(r.health,65);assert.equal(p.used,true);assert.equal(r.rhythm,100);assert.equal(r.score.points,0);const q=prop(s,'heal',3,12,1);r.health=E.maxHealth(s)-4;E.act(s,{type:'hit',id:q.id},2);assert.equal(r.health,E.maxHealth(s));assert.equal(r.events.findLast(e=>e.type==='heal').value,4);
});
test('combo protection lasts ten musical seconds, retains counters, and errors still cost breath without perfect events or free points',()=>{
 const s=arena(),r=s.run,p=prop(s,'combo');E.act(s,{type:'hit',id:p.id},0);close(comboGuardRemaining(r,0),10);r.combo=17;r.cardHits=5;r.novaSpent=2;const points=r.score.points;r.events=[];
 E.act(s,{type:'move',...r.player},18.4);assert.ok(runBeatTime(r,18.4)<10);assert.equal(r.combo,17);assert.equal(r.cardHits,5);assert.equal(r.novaSpent,2);assert.ok(r.rhythm<100);assert.equal(r.score.points,points);assert.equal(r.events.some(e=>e.type==='perfect'),false);
 E.act(s,{type:'move',...r.player},20.4);assert.ok(runBeatTime(r,20.4)>10);assert.equal(r.combo,0);assert.equal(r.cardHits,0);assert.equal(r.novaSpent,0);
});
test('protected silence drains breath, cannot farm points and expires by shared clock; repeated ticks do not advance it',()=>{
 const s=arena(),r=s.run;prop(s,'combo');r.findState={version:1,elapsed:0,comboUntil:10};r.combo=9;r.events=[];
 E.tick(s,4);close(r.findState.elapsed,runBeatTime(r,4));assert.equal(r.combo,9);const left=comboGuardRemaining(r,4);E.tick(s,4);close(comboGuardRemaining(r,4),left);assert.equal(r.score.points,0);
 for(let beat=5;beat<=20;beat++)E.tick(s,beat);assert.ok(s.run);assert.equal(r.combo,0);assert.equal(r.score.points,0);assert.ok(r.rhythm<100);assert.equal(r.events.some(e=>e.type==='perfect'),false);
});
test('combo protection preserves sequence on creature damage while taking the full normal health loss; it does not prevent death',()=>{
 const s=arena(),r=s.run;r.findState={version:1,elapsed:0,comboUntil:10};r.combo=8;r.acted=4;r.room.enemies=[{id:99,type:'enemy',kind:0,x:4,y:11,hp:10,maxHp:10,stunUntil:-1,windup:{x:3,y:11,beat:4,radius:0,kind:'acid'}}];E.tick(s,4);close(r.health,92.16);assert.equal(r.combo,8);
 const t=arena();t.run.findState={version:1,elapsed:0,comboUntil:10};t.run.rhythm=1;E.act(t,{type:'move',...t.run.player},1.4);assert.equal(t.run,null);
});
test('remaining combo time survives floor transitions and saves, never adds to inventory or orb slots, and ends with the run',()=>{
 const s=start(),r=s.run,p=r.room.caveFinds.find(p=>p.kind==='combo');approach(s,p);E.act(s,{type:'hit',id:p.id},0);r.acted=4;E.tick(s,4);const remaining=comboGuardRemaining(r,4),orbs=JSON.stringify(r.orbs),items=JSON.stringify(r.items);
 r.floor=2;E.generateRoom(s);close(comboGuardRemaining(r,0),remaining);assert.equal(JSON.stringify(r.orbs),orbs);assert.equal(JSON.stringify(r.items),items);const loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);close(comboGuardRemaining(loaded.run,0),remaining);
 E.finishRun(s);E.startRun(s);assert.deepEqual(s.run.findState,createFindState());
});
test('a floor cleared by an action settles the pending fraction of time before descent instead of refreshing the combo guard',()=>{
 const s=start(),r=s.run,p=r.room.caveFinds.find(p=>p.kind==='combo');approach(s,p);E.act(s,{type:'hit',id:p.id},0);r.room.charge=r.room.quota;r.room.minBeats=0;r.combo=r.room.goal-1;r.player={x:r.room.exit.x,y:r.room.exit.y+1};reveal(r.room,r.player,sightRange(r));E.act(s,{type:'move',...r.room.exit},4);assert.equal(r.room.cleared,true);const expected=10-runBeatTime(r,4);close(comboGuardRemaining(r,4),expected);assert.ok(E.chooseCard(s,r.cardOffer[0]));assert.ok(E.descend(s));close(comboGuardRemaining(r,0),expected);
});
test('explosive mushrooms hit nearby visible creatures only and never hurt the player, mine rocks, open chests or chain mushrooms',()=>{
 const s=arena(),r=s.run,p=prop(s,'blast'),chest=prop(s,'chest',5,11,3),combo=prop(s,'combo',4,12,1);r.room.nodes=[{id:9,type:'crystal',kind:0,x:5,y:12,hp:10,maxHp:10,value:1}];r.room.rocks=[{id:10,type:'rock',kind:0,x:6,y:11,hp:10,maxHp:10,value:1}];r.room.enemies=[{id:20,type:'enemy',kind:0,x:5,y:11,hp:30,maxHp:30,stunUntil:-1},{id:21,type:'enemy',kind:0,x:12,y:11,hp:30,maxHp:30,stunUntil:-1}];const health=r.health;
 E.act(s,{type:'hit',id:p.id},0);assert.equal(r.room.enemies[0].hp,22);assert.equal(r.room.enemies[1].hp,30);assert.equal(r.health,health);assert.equal(r.room.nodes[0].hp,10);assert.equal(r.room.rocks[0].hp,10);assert.equal(chest.used,false);assert.equal(combo.used,false);assert.equal(r.events.filter(e=>e.type==='findUsed').length,1);
});
test('local bombs consume visible nearby mushrooms once but leave chests, distant and hidden mushrooms intact',()=>{
 const s=arena(),r=s.run,heal=prop(s,'heal',4,11,0),combo=prop(s,'combo',3,12,1),far=prop(s,'blast',14,11,2),chest=prop(s,'chest',4,12,3);r.health=40;r.items.blast=2;
 const hidden=prop(s,'heal',3,10,4);r.room.explored=Array(r.room.cols*r.room.rows).fill(1);r.room.visible=Array(r.room.cols*r.room.rows).fill(1);r.room.visible[hidden.y*r.room.cols+hidden.x]=0;
 E.act(s,{type:'item',item:'blast'},0);assert.equal(r.health,60);assert.equal(heal.used,true);assert.equal(combo.used,true);assert.equal(far.used,false);assert.equal(hidden.used,false);assert.equal(chest.used,false);assert.equal(r.events.filter(e=>e.type==='findUsed').length,2);
 E.act(s,{type:'item',item:'blast'},0);assert.equal(r.health,60);assert.equal(r.items.blast,0);
});
test('global nova, global thunder and fire trails do not consume undiscovered or stocked finds',()=>{
 const s=arena(),r=s.run,heal=prop(s,'heal',6,11,0),combo=prop(s,'combo',3,12,1);r.health=40;s.unlocked=['fury','thunder'];s.equipped=['fury','thunder'];r.combo=30;r.room.enemies=[{id:20,type:'enemy',kind:0,x:4,y:11,hp:1000,maxHp:1000,stunUntil:-1}];E.act(s,{type:'hit',id:20},0);assert.ok(r.events.some(e=>e.type==='nova'));assert.equal(heal.used,false);assert.equal(combo.used,false);r.frenzy??={buffs:{}};r.frenzy.buffs??={};r.frenzy.buffs.fire=99;E.act(s,{type:'move',x:7,y:11},1);assert.ok(r.events.some(e=>e.type==='firetrail'));assert.equal(heal.used,false);assert.equal(combo.used,false);
});
test('rare disc chance is additional, fixed by the saved chest, milestone-gated and never replaces guaranteed crystals',()=>{
 let seed=1;for(;seed<100000;seed++){const roomSeed=Math.floor(E.rng(seed+977+6*113)()*1e9);if(chestReward(roomSeed,6,3).record)break;}assert.ok(seed<100000);
 const s=start(seed);s.seals=1;s.best=6;s.run.floor=6;E.generateRoom(s);const r=s.run,p=r.room.caveFinds.find(p=>p.kind==='chest'&&p.number===3);assert.ok(p.reward.record);const before=[...r.materials],record=p.reward.record;approach(s,p);E.act(s,{type:'hit',id:p.id},0);assert.equal(r.materials[p.reward.kind],before[p.reward.kind]+p.reward.amount);assert.ok(s.records.owned.includes(record));assert.equal(r.events.filter(e=>e.type==='recordDrop').length,1);
 const loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);E.act(loaded,{type:'hit',id:p.id},1);assert.equal(loaded.records.owned.filter(id=>id===record).length,1);assert.equal(loaded.run.materials[p.reward.kind],r.materials[p.reward.kind]);
 for(let n=0;n<1000;n++)assert.equal(chestReward(n,1,3).record,null);
});
test('saved depletion and rewards roundtrip; old saves do not reroll props and malformed rewards, positions or timers are rejected',()=>{
 const s=start(),r=s.run,p=r.room.caveFinds.find(p=>p.kind==='chest');approach(s,p);E.act(s,{type:'hit',id:p.id},0);const raw=JSON.stringify(s),loaded=E.restoreState(raw);assert.ok(loaded);assert.deepEqual(loaded.run.room.caveFinds,r.room.caveFinds);
 for(const change of [x=>x.run.room.caveFinds.find(p=>p.kind==='chest').reward.amount++,x=>x.run.room.caveFinds[0].x=-1,x=>x.run.room.caveFinds.push(x.run.room.caveFinds[0]),x=>x.run.findState.elapsed= -1,x=>x.run.findState.comboUntil=1000,x=>x.run.room.caveFinds[0].hp=9]){const x=JSON.parse(raw);change(x);assert.equal(E.restoreState(JSON.stringify(x)),null);}
 const old=JSON.parse(raw);delete old.run.room.caveFinds;delete old.run.findState;const migrated=E.restoreState(JSON.stringify(old));assert.ok(migrated);assert.equal(migrated.run.room.caveFinds,undefined);assert.equal(migrated.run.findState,undefined);
});
test('new props never contribute HP or reward values to the star target, and opening them never charges the lift',()=>{
 const s=start(),r=s.run,target=calculateFloorScore(r.room),quota=r.room.quota,charge=r.room.charge;r.room.caveFinds.forEach(p=>{p.maxHp=100000;p.value=100000;});assert.equal(calculateFloorScore(r.room),target);assert.equal(r.room.quota,quota);assert.equal(r.room.charge,charge);
});
test('common campaign rooms receive a sparse finite mix; bosses and Abyss do not receive new props',()=>{
 for(const floor of [1,2,6,11,16,21,26,31,5,10,25,35]){const s=start(71);s.run.floor=floor;E.generateRoom(s);if(floor%5===0)assert.equal(s.run.room.caveFinds,undefined);else{assert.ok(validCaveFinds(s.run));assert.ok(s.run.room.caveFinds.length<=5);for(const kind of ['chest','heal','combo','blast'])assert.ok(s.run.room.caveFinds.some(p=>p.kind===kind));for(const p of s.run.room.caveFinds)assert.ok(E.pathTo(s.run.room,s.run.player,p).length);}}
 const s=start();E.finishRun(s);s.descent.bosses??={};s.run=null;const r={mode:'abyss',room:{bossFloor:false},player:{x:0,y:0}};assert.equal(comboGuardRemaining(r,0),0);
});
test('new cached cave silhouettes use the native palette, finite geometry and consistent grounding',()=>{
 const palette=new Set(JSON.parse(readFileSync(new URL('../dist/assets/dungeon-actors-v1/palette.json',import.meta.url),'utf8')).colors);
 for(const type of ['cave-chest','cave-mushroom'])for(const variant of [0,1,2,3]){const a=generateAsset(type,{seed:43,variant});assert.deepEqual(a.anchor,{x:50,y:96});assert.ok(a.shapes.length>0&&a.shapes.length<=150);for(const p of a.shapes){assert.ok(palette.has(p.fill));assert.ok(p.matrix.every(Number.isFinite));}assert.doesNotMatch(assetToSvg(a),/NaN|undefined|Infinity/);assert.equal(JSON.stringify(generateAsset(type,{seed:43,variant})),JSON.stringify(a));}
});
