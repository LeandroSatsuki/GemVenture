import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {createBoss,livingBoss,bossStep,finishBossAttack,bossDamage,spiralTiles} from '../dist/bosses.js';
import {forgeEffects,forgeProject,pickStrength} from '../dist/forge.js';
import {pickRecipe,wellRecipe} from '../dist/materials.js';
import {environment} from '../dist/cavern.js';
import {canEnterAbyss} from '../dist/descent-progress.js';
import {prepareVeteran,playFloor} from './player-bot.mjs';
import {World} from '../dist/world.js';

function arena(){const s=E.createState(712);s.seals=4;E.startRun(s);s.run.floor=25;E.generateRoom(s);return s;}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≈ ${b}`);

test('every biome and arena can resolve all backdrop assets through the real canvas renderer',()=>{
 const savedPath=globalThis.Path2D;globalThis.Path2D=class{ellipse(){} roundRect(){} rect(){} addPath(){} moveTo(){} lineTo(){} closePath(){}};
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{})});
 const world={cache:{},background:()=>ctx};
 try{for(const floor of [1,5,6,10,11,15,16,20,21,25,26,30]){const s=arena();s.run.floor=floor;E.generateRoom(s);assert.doesNotThrow(()=>World.prototype.cave.call(world,s),'floor '+floor);}}
 finally{if(savedPath===undefined)delete globalThis.Path2D;else globalThis.Path2D=savedPath;}
});

test('all six forge paths reach 100, retain fractional gains and refuse further payments',()=>{
 const s=E.createState();s.bank=1e9;s.materials=[1e9,1e9,1e9,1e9];
 let cost=0,lastPower=1;
 for(let level=1;level<100;level++){assert.ok(E.upgradeCost(s)>cost);cost=E.upgradeCost(s);const recipe=pickRecipe(s);assert.ok(recipe.every(Number.isSafeInteger));assert.ok(E.purchaseUpgrade(s));assert.ok(E.power(s)>lastPower);if(level===1)near(E.power(s),1.16);lastPower=E.power(s);}
 for(let level=0;level<100;level++){const health=E.maxHealth(s);assert.ok(wellRecipe(s).every(Number.isSafeInteger));assert.ok(E.purchaseCore(s));assert.equal(E.maxHealth(s),health+(level<10?4:level<30?3:level<60?2:1));}
 const wallet=[s.bank,...s.materials];assert.equal(E.purchaseUpgrade(s),false);assert.equal(E.purchaseCore(s),false);assert.deepEqual([s.bank,...s.materials],wallet);
 for(const id of ['anvil','armor','tonic','vault'])s.forge.levels[id]=100;
 near(E.power(s),pickStrength(100)*1.5);near(forgeEffects(s).armor,.3);assert.equal(E.maxHealth(s),300);near(E.tonicHealing(s),40);near(E.salvageRetention(s),.75);s.unlocked.push('caravan');near(E.salvageRetention(s),.85);
 assert.deepEqual(E.restoreState(JSON.stringify(s)),s);
 for(const field of ['level','core']){const bad=structuredClone(s);bad[field]=101;assert.equal(E.restoreState(JSON.stringify(bad)),null);}
});

test('old capped forge saves preserve every purchased benefit and partial deposit exactly once',()=>{
 const s=E.createState();s.level=12;s.core=6;delete s.forge.version;delete s.forge.legacy;
 for(const id of ['anvil','armor','tonic','vault'])s.forge.levels[id]=3;
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);near(E.power(t),15);assert.equal(E.maxHealth(t),178);assert.equal(t.forge.legacy.vigor,54);near(forgeEffects(t).armor,.15);near(E.tonicHealing(t),40);near(E.salvageRetention(t),.8);
 assert.deepEqual(E.restoreState(JSON.stringify(t)),t);assert.equal(forgeProject(t,'armor').complete,false);
 const partial=structuredClone(s);partial.forge.levels.anvil=1;partial.forge.invested.anvil=333;partial.forge.materials.anvil=[20,10,5,0];
 const p=E.restoreState(JSON.stringify(partial));assert.equal(p.forge.invested.anvil,333);assert.deepEqual(p.forge.materials.anvil,[20,10,5,0]);near(E.power(p),13);
});

test('new seal opens five mushroom floors without relocking an already earned abyss gate',()=>{
 const s=E.createState();s.seals=3;s.best=20;s.stars=25;s.bank=800;s.descent.bosses=[20];s.descent.gate=[1500,1200,1000,800];
 assert.ok(canEnterAbyss(s));assert.ok(E.purchaseSeal(s));assert.equal(E.depthLimit(s),25);assert.equal(s.stars,25);assert.ok(canEnterAbyss(s));
 E.startRun(s);for(let floor=21;floor<=25;floor++){s.run.floor=floor;E.generateRoom(s);assert.equal(E.biomeIndex(floor),4);assert.equal(environment(floor).terrain,4);assert.equal(!!s.run.room.bossFloor,floor===25);assert.ok(E.restoreState(JSON.stringify(s)));}
});

test('micelial sovereign remains intangible; only eight destroyed nuclei clear the arena',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room);assert.deepEqual([b.x,b.y],[12,9]);assert.equal(r.room.enemies.filter(e=>e.summon===b.id).length,4);
 r.player={x:b.x-1,y:b.y};assert.equal(E.act(s,{type:'hit',id:b.id},0).intangible,true);assert.equal(r.combo,1);assert.equal(r.score.points,0);assert.equal(b.hp,720);assert.equal(bossDamage(b,100000,1),0);
 s.level=100;s.forge.levels.anvil=100;let beat=1,kills=0;
 for(;kills<8;){const n=r.room.enemies.find(e=>e.summon===b.id&&e.hp>0);if(!n){r.acted=beat;E.tick(s,beat++);continue;}r.player={x:n.x-1,y:n.y};while(n.hp>0)E.act(s,{type:'hit',id:n.id},beat++);kills++;assert.equal(b.hp,720-kills*90);E.act(s,{type:'hit',id:n.id},beat++);assert.equal(b.hp,720-kills*90);if(kills<8)assert.equal(r.room.cleared,false);}
 assert.equal(r.room.cleared,false);assert.equal(r.room.bossDefeated,true);r.player={x:r.room.exit.x,y:r.room.exit.y+1};E.act(s,{type:'move',...r.room.exit},beat++);assert.equal(r.room.cleared,true);assert.equal(r.events.filter(e=>e.type==='bossDefeated').length,1);assert.ok(s.descent.bosses.includes(25));
 assert.ok(E.chooseCard(s,r.cardOffer[0]));assert.equal(E.descend(s),false);E.finishRun(s,'victory');assert.equal(s.lastResult.reason,'victory');
});

test('spiral reverses after warnings, stays intangible and always offers a reachable dodge',()=>{
 const b=createBoss(25,1);let beat=4;const directions=new Set();
 for(let cycle=0;cycle<34;cycle++){const w=bossStep(b,{x:5,y:7},beat);assert.ok(w);assert.equal(w.beat,beat+1);directions.add(b.spiralDirection);if(cycle%16>=12)assert.match(w.hint,/VAI INVERTER/);if(cycle===16)assert.equal(b.spiralDirection,-1);
  for(const tile of w.tiles){const safe=[];for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const p={x:tile.x+dx,y:tile.y+dy};if(Math.abs(dx)+Math.abs(dy)<=4&&p.x>=1&&p.x<=19&&p.y>=1&&p.y<=13&&!w.tiles.some(t=>t.x===p.x&&t.y===p.y))safe.push(p);}assert.ok(safe.length);}
  finishBossAttack(b,w.beat);assert.equal(b.exposedUntil,-1);assert.equal(bossDamage(b,999,w.beat),0);beat=w.beat+1;
 }
 assert.equal(directions.size,2);assert.deepEqual(spiralTiles(0),spiralTiles(Math.PI*2));
});

test('legacy spiral damages only on its announced beat; save restores its direction and nuclei',()=>{
 for(const evade of [false,true]){const s=arena(),r=s.run,b=livingBoss(r.room);delete b.mycelium;b.y=10;E.enemyBeat(s,4);r.player={...b.windup.tiles[0]};r.acted=4;E.tick(s,4);assert.equal(r.health,100);
  if(evade){const safe={x:r.player.x-1,y:r.player.y};while(b.windup.tiles.some(p=>p.x===safe.x&&p.y===safe.y))safe.x--;E.act(s,{type:'move',...safe},5);}else r.acted=5;
  E.tick(s,5);assert.equal(r.health,evade?100:64);assert.equal(r.events.some(e=>e.type==='bossOpen'),false);
  const copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.deepEqual(livingBoss(copy.run.room),b);
  const bad=structuredClone(s);livingBoss(bad.run.room).spiralDirection=3;assert.equal(E.restoreState(JSON.stringify(bad)),null);
 }
});

test('an equipped player can defeat the new boss using real attacks, items and rhythm dodges',()=>{
 const s=arena();prepareVeteran(s);s.seals=4;s.level=35;s.core=30;s.run.health=E.maxHealth(s);s.run.items={tonic:3,ward:2,blast:2};s.run.cards={muscle:4,shell:2,elastic:1};
 // Start beside the boss so the trial must also exercise an explicit escape.
 const boss=livingBoss(s.run.room);s.run.player={x:boss.x-1,y:boss.y};
 let dodges=0;playFloor(s,(_,beat,action)=>{if(action.type==='dodge'||action.type==='move')dodges++;});assert.ok(s.run,'survives');assert.ok(s.run.room.cleared,'boss defeated');assert.ok(dodges>0);assert.ok(s.run.health>0);
});
