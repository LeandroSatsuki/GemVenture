import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
test('the initial relic card may stack with thirty-five floor rewards and survive saving',()=>{const s=E.createState();s.relics=['echo'];E.startRun(s);s.run.cards={popcorn:36};assert.equal(E.restoreState(JSON.stringify(s)).run.cards.popcorn,36);s.relics=[];assert.equal(E.restoreState(JSON.stringify(s)),null);});
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {grantXP,nextLevelXP,makeOffering,BLESSINGS,RELICS,buyRelic,skillPointCost} from '../dist/pillars.js';
function run(){const s=E.createState(712);E.startRun(s);rectangularRoom(s);s.run.room.explored=null;s.run.room.visible=null;s.run.room.terrain=Array((s.run.room.cols||21)*(s.run.room.rows||15)).fill(0);s.run.room.wave=null;s.run.room.rocks=[];s.run.room.enemies=[];s.run.room.quota=999;return s;}
test('XP levels grant skill points once; learning consumes points and no materials or currency',()=>{
 const s=run(),need=nextLevelXP(1);grantXP(s,need-1);assert.equal(s.experience.points,0);grantXP(s,1);assert.equal(s.experience.level,2);assert.equal(s.experience.points,1);E.finishRun(s,'death');const saved=E.restoreState(JSON.stringify(s));assert.equal(saved.experience.points,1);const bank=saved.bank,materials=[...saved.materials];assert.ok(E.learn(saved,'force'));assert.equal(saved.experience.points,0);assert.equal(saved.bank,bank);assert.deepEqual(saved.materials,materials);assert.equal(E.learn(saved,'force'),false);assert.equal(E.learn(saved,'ear'),false);
});
test('destroying an object earns permanent XP once while duplicate input and dead targets do not',()=>{
 const s=run();s.run.room.nodes=[{id:999,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:10,born:0}];E.act(s,{type:'hit',id:999},0);assert.equal(s.experience.xp,8);E.act(s,{type:'hit',id:999},0);E.act(s,{type:'hit',id:999},1);assert.equal(s.experience.xp,8);E.finishRun(s,'death');assert.equal(s.experience.xp,8);
});
test('retired well cannot spend resources or prepare another blessing',()=>{
 for(let kind=0;kind<4;kind++){const s=E.createState(12);s.materials=[60,70,80,90];const before=JSON.stringify(s);assert.equal(makeOffering(s,kind),null);assert.equal(JSON.stringify(s),before);assert.ok(E.restoreState(before));}
});
test('blessings apply both their reward and actual downside',()=>{
 const glass=E.createState();glass.pendingBlessing='glass';E.startRun(glass);assert.equal(glass.run.health,75);assert.equal(E.maxHealth(glass),75);assert.ok(E.restoreState(JSON.stringify(glass)));const normal=run(),fury=run();fury.run.blessing='fury';assert.equal(E.power(fury),E.power(normal)+2);for(const s of [normal,fury])E.act(s,{type:'hit',id:9999},.45);assert.ok(fury.run.rhythm<normal.run.rhythm);
 const hunger=run();hunger.run.blessing='hunger';grantXP(hunger,20);assert.equal(hunger.experience.xp,40);for(const s of [normal,hunger]){s.run.health=100;s.run.room.enemies=[{id:88,type:'enemy',kind:2,x:4,y:11,hp:10,maxHp:10,stunUntil:-1,windup:{x:3,y:11,beat:5,radius:1}}];s.run.acted=5;E.tick(s,5);}assert.ok(hunger.run.health<normal.run.health);
});
test('relics have one-time prices and modify run rules; old star improvements remain active',()=>{
 const s=E.createState();s.stars=100;s.starUpgrades.supplies=2;for(const relic of RELICS){const stars=s.stars;assert.ok(buyRelic(s,relic.id));assert.equal(s.stars,stars-relic.cost);assert.equal(buyRelic(s,relic.id),false);}E.startRun(s);assert.equal(s.run.guardUntil,8);assert.equal(s.run.items.tonic,2);assert.equal(Object.keys(s.run.cards).length,1);assert.ok(E.restoreState(JSON.stringify(s)));s.run.rhythm=1;E.act(s,{type:'hit',id:99999},.45);assert.equal(s.run.rhythm,30);assert.ok(s.run.relicRevived);const copy=E.restoreState(JSON.stringify(s));E.resumeRecovery(copy);copy.run.rhythm=1;E.act(copy,{type:'hit',id:99999},1.45);assert.equal(copy.run,null);assert.equal(copy.relics.length,3);E.startRun(copy);assert.equal(copy.run.relicRevived,false);
});
test('pulse build changes critical hits rather than adding forge damage; purchased legacy force survives migration',()=>{
 const s=run();s.equipped=['force'];s.unlocked=['force'];assert.equal(E.power(s),1);s.run.room.nodes=[{id:999,type:'crystal',kind:0,x:4,y:11,hp:100,maxHp:100,value:10,born:0}];for(let beat=0;beat<5;beat++)E.act(s,{type:'hit',id:999},beat);assert.equal(s.run.room.nodes[0].hp,94);assert.ok(s.run.events.some(e=>e.type==='proc'&&e.id==='force'));
 delete s.experience;delete s.legacyForce;const migrated=E.restoreState(JSON.stringify(s));assert.equal(E.power(migrated),2);assert.deepEqual(migrated.unlocked,['force']);assert.equal(E.restoreState(JSON.stringify(migrated)).legacyForce,1);
});
test('thunder hits a row once per floor, keeps boss damage limits and rearms only on descent',()=>{
 const s=run();s.equipped=['thunder'];s.run.room.nodes=[{id:998,type:'crystal',kind:0,x:4,y:11,hp:100,maxHp:100,value:10,born:0},{id:999,type:'crystal',kind:0,x:9,y:11,hp:100,maxHp:100,value:10,born:0}];E.act(s,{type:'hit',id:998},0);assert.equal(s.run.room.nodes[1].hp,96);E.act(s,{type:'hit',id:998},1);assert.equal(s.run.room.nodes[1].hp,96);assert.ok(E.restoreState(JSON.stringify(s)).run.thunderSpent);s.run.room.cleared=true;s.run.cardOffer=['muscle'];E.chooseCard(s,'muscle');E.descend(s);assert.equal(s.run.thunderSpent,false);
});
