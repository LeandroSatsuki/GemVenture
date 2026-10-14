import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {livingBoss} from '../dist/bosses.js';
import {blessingEffects,WISH_FAMILIES,makeOffering} from '../dist/pillars.js';
import {ZAG_MINING_GOAL,redeemZagGear,zagTile,moveZag,settleZag,autoZagStep,planZagTurn,upgradeZagModule,adjustZagDie,dealZag,spinZag,restoreZag} from '../dist/zag.js';
const arena=()=>{const s=E.createState(712);s.seals=5;E.startRun(s);s.run.floor=5;E.generateRoom(s);return s;};
test('a missing boss marker cannot clear a room or unlock descent with a live boss',()=>{
 const s=arena(),r=s.run;delete r.room.bossFloor;r.room.charge=999;r.combo=99;
 E.act(s,{type:'move',x:4,y:11},0);assert.equal(r.room.cleared,false);assert.ok(livingBoss(r.room));
 r.room.cleared=true;r.cardChosen=true;r.room.bossDefeated=true;assert.equal(E.descend(s),false);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.run.room.cleared,false);assert.equal(restored.run.room.bossDefeated,false);assert.equal(restored.run.cardChosen,false);assert.ok(livingBoss(restored.run.room));
});
test('missing boss data repairs the arena without discarding carried resources',()=>{
 const s=arena(),r=s.run;r.bag=173;r.materials=[4,8,12,16];r.health=62;r.room.enemies=[];delete r.room.bossFloor;delete r.room.bossDefeated;
 const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.ok(livingBoss(t.run.room));assert.equal(t.run.bag,173);assert.equal(t.run.health,62);assert.deepEqual(t.run.materials,r.materials);
});
test('a saved legitimate boss victory remains cleared and permits descent',()=>{
 const s=arena(),r=s.run,b=livingBoss(r.room);r.player={x:b.x-1,y:b.y};b.hp=1;E.act(s,{type:'hit',id:b.id},0);assert.ok(r.room.cleared);E.chooseCard(s,r.cardOffer[0]);
 const t=E.restoreState(JSON.stringify(s));assert.ok(t.run.room.cleared);assert.equal(E.descend(t),true);
});
test('well offers three different surprises per crystal and preserves every outcome on reload',()=>{
 for(let kind=0;kind<4;kind++){const seen=new Set();for(let seed=0;seed<100;seed++){const s=E.createState(seed);s.materials=[100,100,100,100];const b=makeOffering(s,kind);seen.add(b.id);const copy=E.restoreState(JSON.stringify(s));assert.equal(copy.pendingBlessing,b.id);}assert.deepEqual([...seen].sort(),[...WISH_FAMILIES[kind].ids].sort());}
});
test('floor shield renews on descent without healing and life wish raises max health',()=>{
 const s=E.createState();s.pendingBlessing='floorward';s.pendingBlessingRoll={version:1,tier:2,risk:0};E.startRun(s);assert.equal(s.run.guardUntil,10);s.run.health=48;s.run.room.cleared=true;s.run.cardChosen=true;assert.ok(E.descend(s));assert.equal(s.run.guardUntil,10);assert.equal(s.run.health,48);
 const v=E.createState();v.pendingBlessing='vitalwish';v.pendingBlessingRoll={version:1,tier:2,risk:2};E.startRun(v);assert.equal(v.run.health,140);assert.equal(blessingEffects(v.run).loot,.6);
});
test('explosive wish damages adjacent enemies without recursive procs; healing wish restores life on kills',()=>{
 const s=E.createState(42);E.startRun(s);const r=s.run;r.blessing='blastwish';r.blessingRoll={version:1,tier:2,risk:0};r.room.rocks=[];r.room.nodes=[];r.room.explored=null;r.room.visible=null;r.room.quota=999;
 const enemy=(id,x)=>({id,type:'enemy',kind:0,x,y:11,hp:1000,maxHp:1000,stunUntil:-1});r.room.enemies=[enemy(998,4),enemy(999,5)];
 for(let i=0;i<60;i++)E.act(s,{type:'hit',id:998},i);assert.ok(r.room.enemies[1].hp<1000);assert.ok(r.events.filter(e=>e.id==='well-blast').length>0);assert.ok(r.events.filter(e=>e.id==='well-blast').length<=60);
 r.blessing='mendingwish';r.blessingRoll={version:1,tier:2,risk:0};r.health=20;r.room.enemies[0].hp=1;E.act(s,{type:'hit',id:998},61);assert.equal(r.health,30);
});
test('version 3 passes and proportional mining progress migrate once to the reduced drop rate',()=>{
 const s=E.createState();s.zag.version=3;s.zag.mined=6;s.zag.passes=17;const a=E.restoreState(JSON.stringify(s));assert.equal(a.zag.version,4);assert.equal(a.zag.passes,17);assert.equal(a.zag.mined,ZAG_MINING_GOAL/2);assert.equal(E.restoreState(JSON.stringify(a)).zag.mined,30);
});
test('exclusive sigils form a collection, duplicates pay fragments, upgrades affect only Zag',()=>{
 const s=E.createState(712),z=s.zag;z.route='greed';
 const land=p=>{z.position=p-1;z.hand=[1];moveZag(s,0,100);return settleZag(s,10000);};
 const positions=[0,1,2].map(sigil=>{for(let p=1;p<1000;p++){const t=zagTile(s.seed,p,'greed');if(t.type==='rune'&&t.sigil===sigil)return p;}throw Error('missing sigil');});
 const first=land(positions[0]);assert.equal(first.sigil,0);z.guard=1;const duplicate=land(positions[0]);assert.equal(duplicate.parts,2);assert.ok(duplicate.blocked);
 land(positions[1]);const last=land(positions[2]);assert.ok(last.collection);assert.equal(z.gears,1);assert.deepEqual(z.sigils,[]);assert.equal(z.collections,1);
 const bank=s.bank,forge=structuredClone(s.forge);assert.ok(upgradeZagModule(s,'precision'));assert.equal(z.gears,0);assert.equal(upgradeZagModule(s,'precision'),false);assert.equal(s.bank,bank);assert.deepEqual(s.forge,forge);
 z.hand=[];z.dice=3;dealZag(s,()=>.5);assert.equal(z.adjustments,1);assert.ok(adjustZagDie(s,0,1));assert.equal(z.hand[0],5);assert.equal(adjustZagDie(s,0,1),false);assert.ok(E.restoreState(JSON.stringify(s)));
 for(const field of [{modules:{treasure:4,protection:0,precision:0}},{sigils:[0,0]},{bonusDice:3},{adjustments:4}])assert.equal(restoreZag({...z,...field}),null);
});
test('automatic play uses visible rewards, stops without currency, and never spends tools or village resources',()=>{
 const s=E.createState(712),z=s.zag;z.passes=1;z.tools={jump:7,magnet:8,invert:9};s.materials=[300,400,500,600];const tools={...z.tools};let now=1000,actions=0;
 while(autoZagStep(s,now,()=>.7)){settleZag(s,now+10000);now+=11000;if(++actions>50)assert.fail('AFK produced an infinite dice loop');}
 assert.ok(actions>3);assert.equal(z.passes,0);assert.equal(z.dice,0);assert.deepEqual(z.hand,[]);assert.equal(z.active,null);assert.deepEqual(z.tools,tools);assert.ok(s.materials.every((n,i)=>n>=[300,400,500,600][i]));assert.equal(planZagTurn(s),null);assert.ok(E.restoreState(JSON.stringify(s)));
 const b=E.createState();b.zag.hand=[2,4,6];const before=JSON.stringify(b);assert.ok(planZagTurn(b));assert.equal(JSON.stringify(b),before);
});
test('bonus dice have a finite budget per paid pass; exhausted die tiles produce fragments',()=>{
 const s=E.createState(712),z=s.zag;z.passes=1;spinZag(s,10,()=>0);settleZag(s,3000);assert.equal(z.bonusDice,2);
 let p=1;while(zagTile(s.seed,p).type!=='dice')p++;
 for(let i=0;i<4;i++){z.position=p-1;z.hand=[1];moveZag(s,0,10000);const before=z.dice,result=settleZag(s,20000);assert.equal(z.dice-before,i<2?1:0);if(i>=2)assert.equal(result.parts,1);}
 assert.equal(z.bonusDice,0);
});
test('upgrading precision benefits the current hand once; completed collections still buy finite tools',()=>{
 const s=E.createState();s.zag.hand=[2,4,6];s.zag.gears=2;assert.ok(upgradeZagModule(s,'precision'));assert.equal(s.zag.adjustments,1);assert.ok(redeemZagGear(s));assert.deepEqual(s.zag.tools,{jump:1,magnet:1,invert:1});assert.equal(s.zag.gears,0);assert.equal(redeemZagGear(s),false);assert.ok(E.restoreState(JSON.stringify(s)));
});
test('several seeds of AFK remain finite and preserve earned currencies through reloads',()=>{
 for(let seed=1;seed<=32;seed++){
  const s=E.createState(seed);s.zag.passes=4;let rng=seed,actions=0,moves=0,time=1000;
  const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  while(autoZagStep(s,time,random)){if(s.zag.active?.type==='move')moves++;settleZag(s,time+10000);time+=11000;if(++actions>90)assert.fail('unbounded AFK');if(actions%7===0)assert.ok(E.restoreState(JSON.stringify(s)));}
  assert.ok(moves<=32);assert.equal(s.zag.passes,0);assert.equal(s.zag.dice,0);assert.equal(s.zag.hand.length,0);assert.equal(s.zag.satchel.reduce((a,b)=>a+b,0),0);
 }
});
