import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {isAbyss,musicFloor,heatState,BOOSTS,activeBoost,sectionMutator,rescueAvailable,secureCargo,skipRescue} from '../dist/frenzy.js';
import {beatTime,beatPhase} from '../dist/score.js';
import {awardScore} from '../dist/stars.js';
import {Music} from '../dist/audio.js';
import {abyssCameraY,project} from '../dist/world.js';
test('abyss keeps the miner below the overlay even when pushed to the upstream edge',()=>{
 for(const y of [5,8,12,15])for(const phase of [28,29,31.9]){
  const p=project(20,y);assert.ok(p.y-abyssCameraY(p.y,phase,28)>=238);
 }
});
test('abyss introduction spaces smaller waves and postpones meteors without changing its clock',()=>{
 const s=run(),r=s.run;assert.equal(r.room.enemies.length,0);assert.equal(heatState(r).damage,.65);
 for(let b=0;b<16;b++)advance(s,b);assert.ok(!r.events.some(e=>e.type==='horde'));
 advance(s,16);assert.equal(r.events.find(e=>e.type==='horde').count,2);
 r.events=[];advance(s,48);assert.equal(r.events.find(e=>e.type==='horde').count,3);
 advance(s,92);assert.ok(!r.events.some(e=>e.type==='meteorWarning'));assert.equal(musicFloor(r),16);
 advance(s,96);assert.ok(heatState(r).damage>=1);assert.ok(r.events.filter(e=>e.type==='horde').at(-1).count>=5);assert.equal(musicFloor(r),16);
 const restored=E.restoreState(JSON.stringify(s));assert.equal(restored.run.abyss.section,2);
});
test('refuge music has slow sine notes, long envelopes, lower gain and no percussion',()=>{
 const music=new Music(),notes=[],gains=[];music.enabled=true;music.ctx={state:'running',currentTime:10};music.master={gain:{setTargetAtTime:(...a)=>gains.push(a)}};music.tone=(...a)=>notes.push(a);music.noise=()=>assert.fail('No percussion at refuge');
 for(let t=0;t<12;t+=.05)music.home(t);
 assert.ok(notes.length>4&&notes.length<18);assert.ok(notes.every(n=>n[2]==='sine'&&n[1]>=2.3&&n[3]<=.05&&n[6]>=.35));assert.equal(gains[0][0],.14);assert.equal(music.track,'home');
});
test('sonic adds audible subdivisions without changing the shared input beat clock',()=>{
 const notes=[];const music=new Music();music.enabled=true;music.ctx={state:'running',currentTime:10};music.tone=(...a)=>notes.push(a);music.noise=()=>{};
 music.update(beatTime(16,1.5),3,{sonic:true});assert.ok(notes.some(n=>n[0]===92));assert.ok(notes.every(n=>Number.isFinite(n[4])));assert.equal(music.track,3);
});
function run(mode='abyss'){const s=E.createState(712);s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];E.startRun(s,mode);return s;}
function advance(s,beat){if(s.run.abyss?.cardChoice)E.advanceAbyssCards(s,4);s.run.acted=beat;s.run.health=E.maxHealth(s);s.run.rhythm=100;s.run.guardUntil=beat+8;E.tick(s,beat);}
test('abyss streams many strips with bounded entities, no clear screen, no camp and a stable musical clock',()=>{
 const s=run(),room=s.run.room;
 for(let b=0;b<2400;b++)advance(s,b);
 assert.equal(s.run.room,room);assert.equal(s.run.room.cleared,false);assert.equal(s.run.abyss.section,25);assert.equal(s.run.abyss.rows,599);assert.equal(E.campNeeded(s),false);assert.equal(E.descend(s),false);
 assert.equal(musicFloor(s.run),16);assert.ok(Math.abs(beatPhase(16,beatTime(16,959.4))-959.4)<1e-8);
 assert.ok(room.nodes.length<200);assert.ok(room.rocks.length<200);assert.ok(room.enemies.length<=49);assert.ok(E.restoreState(JSON.stringify(s)));
 assert.equal(s.abyssBest,2995);const saved=E.restoreState(JSON.stringify(s));E.finishRun(saved,'death');assert.equal(saved.abyssBest,2995);
});
test('normal rooms still clear tactically while abyss cannot clear by charge or score',()=>{
 for(const mode of ['floors','abyss']){const s=run(mode),r=s.run;r.room.charge=r.room.quota;r.room.minBeats=0;r.combo=20;r.room.rocks=[];r.room.explored=null;E.act(s,{type:'dodge',dx:1,dy:0},0);assert.equal(r.room.cleared,mode==='floors');}
});
test('heat raises rewards and danger together, glass adds bounded bonus loot and sonic is deterministic',()=>{
 const infinite=run();infinite.run.beat=900;const first=heatState(infinite.run).loot;infinite.run.abyss.section=25;assert.ok(heatState(infinite.run).loot>first&&heatState(infinite.run).loot<=3.5);
 const s=run('floors'),r=s.run;assert.equal(heatState(r).loot,1);r.beat=400;const hot=heatState(r);assert.ok(hot.loot>1&&hot.damage>1);r.frenzy.mutator='glass';assert.equal(heatState(r).loot,hot.loot*1.8);assert.equal(heatState(r).damage,hot.damage*1.5);assert.deepEqual(sectionMutator(r,7),sectionMutator(r,7));
});
test('live vein challenge is paid at destruction, once, even on the last hit of a floor',()=>{
 const s=run('floors'),r=s.run;r.room.rocks=[];r.room.explored=null;r.room.enemies=[];r.room.minBeats=0;r.room.charge=r.room.quota;r.combo=3;
 const n={id:999,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:5,born:0};r.room.nodes=[n];r.frenzy.quest={kind:'vein',name:'VEIA',target:999,goal:1,progress:0,until:48,done:false};
 E.act(s,{type:'hit',id:999},0);assert.ok(r.frenzy.quest.done);assert.ok(r.room.cleared);assert.ok(r.materials[0]>=18);const before=r.materials[0];E.act(s,{type:'hit',id:999},0);assert.equal(r.materials[0],before);
});
test('missed live challenges expire without payout and reload cannot restart their deadline',()=>{
 const s=run();advance(s,24);const q=s.run.frenzy.quest;assert.ok(q);const t=E.restoreState(JSON.stringify(s));assert.equal(t.run.frenzy.quest.until,q.until);const bag=[...t.run.materials];advance(t,q.until+1);assert.ok(t.run.frenzy.quest.done);assert.deepEqual(t.run.materials,bag);
});
test('milestone cargo goes to base immediately and cannot be paid again on death or reload',()=>{
 const s=run(),r=s.run;r.bag=100;r.materials=[10,20,30,40];r.abyss.checkpoint={section:3,until:40,used:false};r.beat=30;
 assert.ok(rescueAvailable(r));assert.ok(secureCargo(s));assert.equal(s.bank,130);assert.deepEqual(s.materials,[10,20,30,40]);assert.equal(secureCargo(s),false);
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(secureCargo(t),false);E.finishRun(t,'death');assert.equal(t.bank,130);assert.deepEqual(t.materials,[10,20,30,40]);
});
test('standard boss checkpoints preserve choice and expired or skipped abyss rescues reject payment',()=>{
 const s=run('floors');s.run.floor=5;s.run.room.cleared=true;s.run.bag=30;assert.ok(secureCargo(s));assert.equal(s.run.bag,0);
 const t=run();t.run.abyss.checkpoint={section:3,until:10,used:false};t.run.beat=11;assert.equal(secureCargo(t),false);t.run.beat=5;assert.ok(skipRescue(t.run));assert.equal(secureCargo(t),false);
});
test('temporary powers actually change damage and movement then expire; combo grants them during play',()=>{
 const s=run(),r=s.run;const base=E.power(s),move=E.movement(s);r.frenzy.buffs={giant:8,fire:8};assert.equal(E.power(s),base*3);assert.equal(E.movement(s),move*2);r.beat=9;r.acted=9;assert.equal(E.power(s),base);assert.equal(E.movement(s),move);
 r.combo=20;advance(s,20);assert.ok(BOOSTS.some(b=>activeBoost(r,b.id)));assert.ok(r.events.some(e=>e.type==='boost'));
});
test('abyss resurrection preserves combo without automatic intermission',()=>{
 const s=run(),r=s.run;s.unlocked=['revive'];s.equipped=['revive'];r.combo=27;r.rhythm=1;E.act(s,{type:'hit',id:99999},.45);assert.equal(r.rhythm,30);assert.equal(r.combo,27);assert.equal(r.recovery,null);assert.ok(r.guardUntil>=7);assert.ok(r.events.some(e=>e.type==='abyssRevive'));
});
test('meteor and section warnings precede impact; invaders have readable cross attacks',()=>{
 const s=run();advance(s,88);assert.ok(s.run.events.some(e=>e.type==='sectionWarning'));advance(s,96);assert.equal(s.run.abyss.section,2);advance(s,124);assert.ok(s.run.events.some(e=>e.type==='meteorWarning'));assert.equal(s.run.frenzy.meteors[0].due,128);advance(s,128);assert.ok(s.run.events.some(e=>e.type==='meteor'));
 const r=s.run;r.room.enemies=[{id:888,type:'enemy',kind:2,elite:true,x:r.player.x+2,y:r.player.y,hp:100,maxHp:100,stunUntil:-1}];E.enemyBeat(s,132);assert.equal(r.room.enemies[0].windup.beat,135);assert.ok(r.room.enemies[0].windup.tiles.length>=10);
});
test('stars remain capped per run and biome gates spend prestige instead of mining currency',()=>{
 const s=run();s.run.room.scoreLimit=1000000;awardScore(s,999999,0);assert.equal(s.stars,5);awardScore(s,999999,1);assert.equal(s.stars,5);E.finishRun(s);s.best=5;const bank=s.bank;assert.ok(E.purchaseSeal(s));assert.equal(s.stars,2);assert.equal(s.bank,bank);
});
test('invalid mode and malformed endless state are rejected without losing valid old saves',()=>{
 const s=E.createState();assert.equal(E.startRun(s,'unknown'),false);E.startRun(s);const old=JSON.parse(JSON.stringify(s));delete old.run.mode;delete old.run.frenzy;delete old.run.spiceVersion;assert.ok(E.restoreState(JSON.stringify(old)));
 const a=run();a.run.abyss.section=-1;assert.equal(E.restoreState(JSON.stringify(a)),null);a.run.abyss.section=1;a.run.frenzy.buffs={giant:Infinity};assert.equal(E.restoreState(JSON.stringify(a)),null);
});

