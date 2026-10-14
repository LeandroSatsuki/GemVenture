import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {TOTAL_FLOORS,BIOME_COUNT} from '../dist/campaign.js';
import {livingBoss,bossStep,bossDamage,createBoss} from '../dist/bosses.js';
import {floorMinerals} from '../dist/materials.js';
import {environment,travelPath} from '../dist/cavern.js';
import {generateAsset,assetToSvg} from '../dist/art-kit.js';
import {floorPicture} from '../dist/expedition-map.js';
import {canEnterAbyss} from '../dist/descent-progress.js';
import {beatTime,beatPhase,isBossTrack,trackIndexForFloor} from '../dist/score.js';
import {eventSoundCues} from '../dist/sound-design.js';
import {prepareVeteran,playFloor} from './player-bot.mjs';

function arena(){const s=E.createState(712);s.seals=5;E.startRun(s);s.run.floor=30;s.best=30;E.generateRoom(s);return s;}

test('amber adds five floors and a prestige seal, preserving existing saves and abyss access',()=>{
 assert.equal(TOTAL_FLOORS,35);assert.equal(BIOME_COUNT,7);
 const s=E.createState();s.seals=4;s.best=25;s.stars=35;s.descent.bosses=[20,25];s.descent.gate=[1500,1200,1000,800];
 assert.ok(E.restoreState(JSON.stringify(s)));assert.ok(canEnterAbyss(s));assert.ok(E.purchaseSeal(s));assert.equal(s.stars,0);assert.equal(E.depthLimit(s),30);assert.ok(canEnterAbyss(s));
 E.startRun(s);for(let floor=26;floor<=30;floor++){s.run.floor=floor;E.generateRoom(s);assert.equal(E.biomeIndex(floor),5);assert.equal(environment(floor).terrain,5);assert.equal(!!s.run.room.bossFloor,floor===30);assert.ok(E.restoreState(JSON.stringify(s)),`save floor ${floor}`);}
 assert.equal(floorMinerals(26).focus,2);assert.ok(floorMinerals(26).weights[1]<10);
 assert.match(floorPicture(5,30,true),/REI DAS TOCAS/);assert.doesNotMatch(floorPicture(5,26),/undefined|NaN/);
 const normal=E.createState();normal.seals=4;normal.best=25;normal.lastResult={floor:25,reason:'victory'};assert.ok(E.restoreState(JSON.stringify(normal)),'old final completion remains loadable');
});

test('soft earth slows travel, never burns the player; amber creatures and art are distinct',()=>{
 const s=arena(),r=s.run;r.floor=26;E.generateRoom(s);r.room.enemies=[];r.room.wave=null;r.room.rocks=[];
 r.room.terrain.fill(5);const from={x:3,y:11},path=[{x:4,y:11},{x:5,y:11},{x:6,y:11},{x:7,y:11}];
 assert.deepEqual(travelPath(r.room,path,4,from),path.slice(0,2));
 for(let beat=4;beat<=8;beat++){r.acted=beat;E.tick(s,beat);}assert.equal(r.health,100);assert.equal(r.room.environmentWarning,null);
 assert.notDeepEqual(generateAsset('boss',{variant:5}).shapes,generateAsset('boss',{variant:0}).shapes);
 assert.doesNotMatch(assetToSvg(generateAsset('molehill',{biome:5})),/undefined|NaN/);
});

test('burrow locks the target, grants three warning beats and blocks all damage sources',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room);r.player={x:10,y:10};E.enemyBeat(s,4);const w=structuredClone(b.windup);
 assert.equal(w.beat,7);assert.equal(w.startedBeat,4);assert.deepEqual([w.x,w.y],[10,10]);
 r.player={x:16,y:12};E.enemyBeat(s,5);assert.deepEqual(b.windup,w);
 const points=r.score.points,combo=r.combo;assert.equal(E.act(s,{type:'hit',id:b.id},5).buried,true);assert.equal(r.combo,combo+1);assert.equal(r.score.points,points);
 assert.equal(bossDamage(b,99999,5),0);b.burn={start:3,until:8,damage:99999};r.acted=5;E.tick(s,5);assert.equal(b.hp,960);
 r.player={x:b.x-1,y:b.y};r.items.blast=1;E.act(s,{type:'item',item:'blast'},6);assert.equal(b.hp,960);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.deepEqual(livingBoss(restored.run.room),b);
 for(const mutate of [q=>q.windup.beat=99,q=>q.windup.from.x=1,q=>q.windup.tiles=[],q=>q.windup.pattern='ring']){const bad=structuredClone(s);mutate(livingBoss(bad.run.room));assert.equal(E.restoreState(JSON.stringify(bad)),null);}
});

test('emergence hits only the marked tile set on its beat, then opens four attack pulses',()=>{
 for(const evade of [false,true]){const s=arena(),r=s.run,b=livingBoss(r.room);r.player={x:10,y:10};E.enemyBeat(s,4);
  for(let beat=4;beat<7;beat++){r.acted=beat;E.tick(s,beat);}assert.equal(r.health,100);
  if(evade)E.act(s,{type:'move',x:13,y:10},7);else r.acted=7;
  E.tick(s,7);assert.equal(r.health,evade?100:58);assert.deepEqual([b.x,b.y],[10,10]);assert.equal(b.windup,null);assert.equal(b.exposedUntil,11);
  assert.equal(r.events.filter(e=>e.type==='emerge').length,1);assert.ok(eventSoundCues(r.events).includes('emerge'));
  assert.ok(E.restoreState(JSON.stringify(s)));assert.equal(bossDamage(b,1e5,8),80);assert.equal(bossDamage(b,1e5,8),0);
  assert.equal(bossStep(b,r.player,11),null);assert.ok(bossStep(b,r.player,12));
 }
});

test('phase two alternates eruption and a ring with a genuinely safe center; every warning can be escaped',()=>{
 for(const phase of [1,2])for(const cycle of [0,1])for(let y=1;y<14;y++)for(let x=1;x<20;x++){
  const b=createBoss(30,1);b.hp=phase===1?960:400;b.cycle=cycle;const w=bossStep(b,{x,y},4),hit=(px,py)=>w.tiles.some(p=>p.x===px&&p.y===py);
  assert.equal(w.pattern,phase===2&&cycle===1?'ring':'burst');
  if(w.pattern==='ring'){assert.equal(hit(w.x,w.y),false);assert.deepEqual(w.safe,{x:w.x,y:w.y});}
  let reachable=false;for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(Math.abs(dx)+Math.abs(dy)<=4&&x+dx>=1&&x+dx<=19&&y+dy>=1&&y+dy<=13&&!hit(x+dx,y+dy))reachable=true;
  assert.ok(reachable,`safe base move from ${x},${y}`);
 }
 const s=arena(),r=s.run,b=livingBoss(r.room);b.hp=400;b.cycle=1;r.player={x:10,y:10};E.enemyBeat(s,4);r.acted=7;E.tick(s,7);assert.equal(r.health,100);assert.ok(E.restoreState(JSON.stringify(s)));
});

test('new boss and exploration music preserve previous IDs and exact rhythmic clocks',()=>{
 assert.deepEqual([1,6,11,16,21,26].map(trackIndexForFloor),[0,1,2,3,8,10]);assert.deepEqual([5,10,15,20,25,30].map(trackIndexForFloor),[4,5,6,7,9,11]);
 assert.equal(isBossTrack(10),false);assert.equal(isBossTrack(11),true);
 for(const phase of [0,4,7.5,32,111,160,1024])assert.ok(Math.abs(beatPhase(30,beatTime(30,phase))-phase)<1e-8);
 assert.ok(eventSoundCues([{type:'burrow'},{type:'bossWarning'}]).includes('burrow'));
});

test('equipped rhythm player can learn, dodge and defeat the mole; rewards and final exit occur once',()=>{
 const s=arena();prepareVeteran(s);s.seals=5;s.level=55;s.core=50;s.forge.levels.anvil=50;s.forge.levels.armor=40;s.run.health=E.maxHealth(s);s.run.items={tonic:3,ward:2,blast:2};s.run.cards={muscle:4,shell:2,elastic:1};
 let burrows=0,emerges=0,beats=0;playFloor(s,(_,beat)=>{beats=beat;burrows+=s.run?.events.filter(e=>e.type==='burrow').length||0;emerges+=s.run?.events.filter(e=>e.type==='emerge').length||0;});
 assert.ok(s.run,'survived');assert.ok(s.run.room.cleared,'defeated');assert.ok(burrows>=2&&emerges>=2,'used the attack cycle');assert.ok(beats<400);assert.ok(s.descent.bosses.includes(30));
 const bag=s.run.bag;E.tick(s,beats+1);assert.equal(s.run.bag,bag);assert.ok(E.chooseCard(s,s.run.cardOffer[0]));assert.equal(E.descend(s),false);E.finishRun(s,'victory');assert.equal(s.lastResult.floor,30);assert.ok(E.restoreState(JSON.stringify(s)));
});
