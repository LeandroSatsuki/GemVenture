import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {CARDS,cardOffer,cardValues,cardLimit,cardDetail} from '../dist/cards.js';
import {createLoot,returnRewards} from '../dist/rewards.js';
function arena(cards={}){const s=E.createState(71);E.startRun(s);Object.assign(s.run,{cards,health:40});Object.assign(s.run.room,{explored:null,visible:null,floorMask:null,layout:null,wave:null,terrain:Array((s.run.room.cols||21)*(s.run.room.rows||15)).fill(0),rocks:[],enemies:[],nodes:[],quota:999});return s;}
function target(s,type='crystal',kind=0,x=4,y=11,hp=100){const n={id:s.run.room.nextId++,type,kind,x,y,hp,maxHp:hp,value:10,born:0,stunUntil:-1,windup:null};s.run.room[type==='rock'?'rocks':type==='enemy'?'enemies':'nodes'].push(n);return n;}
const hit=(s,n,beat)=>E.act(s,{type:'hit',id:n.id},beat);
const triggered=(s,id)=>s.run.events.some(e=>e.type==='proc'&&e.id===id);

test('late healing duplicates grow slowly, preserve the first two copies and preview the real amount',()=>{
 for(const [id,base] of [['candy',4],['vampire',8],['secondwind',2]]){
  assert.equal(cardValues(id,0).heal,0);assert.equal(cardValues(id,1).heal,base);assert.equal(cardValues(id,2).heal,base*2);
  let last=base*2;for(let rank=3;rank<=16;rank++){const heal=cardValues(id,rank).heal;assert.ok(heal>last);assert.ok(heal-last<base);last=heal;}
  assert.ok(last<base*4);assert.ok(cardDetail(CARDS.find(c=>c.id===id),16).includes(last.toLocaleString('pt-BR')));
 }
 const candy=arena({candy:16});hit(candy,target(candy,'crystal',0,3,11,1),0);assert.equal(candy.run.health,55.8);
 const vampire=arena({vampire:16});hit(vampire,target(vampire,'enemy',0,3,11,1),0);assert.equal(vampire.run.health,75.6);
 const wind=arena({secondwind:16});wind.run.health=20;hit(wind,target(wind,'enemy',0,3,11,1000),0);assert.equal(wind.run.health,27.9);
});
test('twenty-one distinct cards yield reproducible three-card offers',()=>{assert.equal(CARDS.length,21);assert.equal(new Set(CARDS.map(c=>c.id)).size,21);for(let i=0;i<80;i++){const a=cardOffer(E.rng(i));assert.deepEqual(a,cardOffer(E.rng(i)));assert.equal(new Set(a).size,3);assert.ok(a.every(id=>CARDS.some(c=>c.id===id)));}});
test('floor reward is chosen once, duplicates stack, saves retain cards, extraction resets them',()=>{const s=arena();assert.equal(E.chooseCard(s,'muscle'),false);for(let floor=0;floor<2;floor++){s.run.room.minBeats=0;s.run.room.charge=999;for(let b=0;b<s.run.room.goal;b++)E.act(s,{type:'move',x:b%2?3:2,y:11},b);s.run.cardOffer=['muscle','ice','ember'];assert.equal(E.descend(s),false);assert.equal(E.chooseCard(s,'greed'),false);assert.ok(E.chooseCard(s,'muscle'));assert.equal(E.chooseCard(s,'ice'),false);assert.equal(E.restoreState(JSON.stringify(s)).run.cards.muscle,floor+1);assert.ok(E.descend(s));}assert.equal(E.power(s),3);E.finishRun(s);assert.equal(s.run,null);E.startRun(s);assert.deepEqual(s.run.cards,{});});
test('all crystal and rock kinds withstand multiple ordinary hits even at high power',()=>{for(const [type,defs]of [['crystal',E.CRYSTALS],['rock',E.ROCKS]])for(let kind=0;kind<defs.length;kind++){const s=arena();s.level=12;const n=target(s,type,kind,4,11,defs[kind].hp);let hits=0;while(n.hp>0&&hits<30)hit(s,n,hits++);assert.ok(hits>=defs[kind].minHits,type+kind);const bag=s.run.bag;hit(s,n,hits);assert.equal(s.run.bag,bag);if(type==='rock')assert.ok(E.walkable(s.run.room,n.x,n.y));}});
test('rocks block routes until mined; dash animation gets each legal step',()=>{const s=arena();const rock=target(s,'rock',2,4,11,18),n=target(s,'crystal',0,7,11);assert.equal(E.walkable(s.run.room,4,11),false);hit(s,n,0);const route=s.run.events.find(e=>e.type==='dash');let from=route.from;for(const step of route.path){assert.equal(E.distance(from,step),1);assert.ok(E.walkable(s.run.room,step.x,step.y));from=step;}assert.deepEqual(from,route.to);s.level=12;for(let i=1;i<15&&rock.hp>0;i++)hit(s,rock,i);assert.equal(rock.hp,0);assert.ok(E.walkable(s.run.room,4,11));assert.equal(s.run.loot.rocks.count,1);});
test('passive strength, timing and skates stack with explicit caps',()=>{const s=arena({muscle:3,elastic:10,skates:10});assert.equal(E.power(s),4);assert.equal(E.windowMs(s),189);E.act(s,{type:'dodge',dx:1,dy:0},0);assert.equal(s.run.player.x,10);E.act(s,{type:'move',x:18,y:11},1);assert.equal(s.run.player.x,18);});
test('wealth, candy and battery combine on crystal breaks',()=>{const s=arena({pockets:2,greed:2,candy:2,battery:2});s.level=12;const n=target(s,'crystal',2,4,11,18);for(let b=0;n.hp>0;b++)hit(s,n,b);const value=9;assert.equal(s.run.materials[2],value);assert.equal(s.run.bag,0);assert.equal(s.run.room.charge,5);assert.ok(triggered(s,'candy'));assert.ok(s.run.health>=44);});
test('burn ticks only on subsequent beats, expires and cannot pay duplicate loot',()=>{const s=arena({ember:2}),n=target(s);hit(s,n,0);assert.equal(n.hp,99);E.tick(s,0);assert.equal(n.hp,99);for(let b=1;b<=4;b++)E.tick(s,b);assert.equal(n.hp,87);assert.ok(triggered(s,'ember'));});
test('automatic attack effects are deterministic, trigger without counting hits and never trigger on movement',()=>{
 for(const id of ['popcorn','ricochet','laser','echohit','ice']){
  const play=()=>{const s=arena({[id]:2}),n=target(s,'enemy',0,4,11,10000),other=target(s,'enemy',0,3,10,10000);
   E.act(s,{type:'move',x:2,y:11},0);assert.equal(triggered(s,id),false);
   for(let beat=1;beat<=80;beat++)hit(s,n,beat);
   const procs=s.run.events.filter(e=>e.type==='proc'&&e.id===id);assert.ok(procs.length>10,id);assert.ok(procs.length<=80);
   if(id==='ice'){assert.ok(Math.abs(n.chill.reduction-.3)<1e-9);assert.ok(n.stunUntil>0);}else if(id==='echohit')assert.ok(n.hp<9920);else assert.ok(other.hp<10000,id);
   return {hp:n.hp,other:other.hp,procs:procs.length};};
  assert.deepEqual(play(),play(),id);
 }
});
test('lucky criticals occur deterministically and increase damage',()=>{const s=arena({lucky:5}),n=target(s,'enemy');for(let b=0;b<20;b++)hit(s,n,b);assert.ok(triggered(s,'lucky'));assert.ok(n.hp<80);});
test('kills heal visibly, drop bonus bombs by chance and respect the inventory cap',()=>{
 const s=arena({vampire:2,bombgift:2});hit(s,target(s,'enemy',0,4,11,1),0);assert.equal(s.run.health,60);assert.ok(triggered(s,'vampire'));
 for(let b=1;b<30;b++)hit(s,target(s,'enemy',0,4,11,1),b);
 assert.equal(s.run.health,100);assert.equal(s.run.items.blast,9);assert.ok(triggered(s,'bombgift'));assert.equal(s.run.killCount,30);
});
test('last breath heals only enemy hits below forty percent health, never movement or mining',()=>{
 const s=arena({secondwind:2}),n=target(s,'enemy');s.run.health=30;hit(s,n,0);assert.equal(s.run.health,34);
 assert.ok(s.run.events.some(e=>e.type==='proc'&&e.name==='VIDA +4'));
 E.act(s,{type:'move',x:2,y:11},1);assert.equal(s.run.health,34);
 hit(s,target(s),2);assert.equal(s.run.health,34);s.run.health=40;hit(s,n,3);assert.equal(s.run.health,40);
 s.run.health=39;hit(s,n,4);assert.equal(s.run.health,43);hit(s,n,5);assert.equal(s.run.health,43);
});
test('armor reduces enemy damage, revival copies are consumed once each, death removes cards',()=>{const s=arena({shell:2,revival:2});const n=target(s,'enemy');n.windup={x:3,y:11,beat:4,radius:0};s.run.acted=4;E.tick(s,4);assert.ok(Math.abs(s.run.health-34.512)<.001);assert.ok(triggered(s,'shell'));for(let b=5;b<=7;b++){s.run.rhythm=1;E.act(s,{type:'move',x:3,y:11},b+.45);if(b<7){assert.equal(s.run.rhythm,30);E.resumeRecovery(s);}}assert.equal(s.run,null);assert.equal(s.deaths,1);});
test('gardener card speeds crystal generation without exceeding one per two beats',()=>{const s=arena({sprouts:9});E.tick(s,1);assert.equal(s.run.room.nodes.length,0);E.tick(s,2);assert.equal(s.run.room.nodes.length,1);E.tick(s,3);assert.equal(s.run.room.nodes.length,1);});
test('return groups preserve the exact saved gem sum and essence separately, including old saves',()=>{const loot=createLoot();loot.crystals=[{count:2,gems:11},{count:2,gems:33},{count:2,gems:71},{count:1,gems:7}];loot.rocks={count:3,gems:13};loot.enemies={count:2,gems:8};loot.essence=3;for(const kept of [0,71,143]){const groups=returnRewards(loot,143,kept);assert.equal(groups.filter(g=>g.destination==='bank').reduce((sum,g)=>sum+g.value,0),kept);assert.equal(groups.find(g=>g.destination==='essence').value,3);}assert.equal(returnRewards(null,31,15)[0].value,15);});
test('offers always include survival and offense and exclude capped upgrades, including skill synergy',()=>{
 const s=arena({lucky:3,shell:4,elastic:5,skates:3,sprouts:2,bombgift:3});s.equipped=['dash','seed'];s.skillRanks={dash:3};
 for(let i=0;i<100;i++){const offer=cardOffer(E.rng(i),s.run,s);assert.equal(offer.length,3);assert.equal(new Set(offer).size,3);
 const cards=offer.map(id=>CARDS.find(c=>c.id===id));assert.ok(cards.some(c=>c.group==='survival'));assert.ok(cards.some(c=>c.group==='attack'));
 assert.ok(cards.every(c=>(s.run.cards[c.id]||0)<cardLimit(c,s)));}
});
test('ice weakens boss attacks without canceling telegraphs; expired ice has no effect',()=>{
 const s=arena({ice:1,shell:1});s.run.floor=5;E.generateRoom(s);const r=s.run,b=r.room.enemies[0];r.player={x:9,y:6};
 let beat=0;while(!b.chill&&beat<40){hit(s,b,beat++);}assert.ok(b.chill);assert.equal(b.stunUntil,-1);
 const attackBeat=Math.max(4,beat);b.chill.until=attackBeat;b.windup={x:9,y:6,radius:0,beat:attackBeat,damage:40};r.health=100;r.acted=attackBeat;E.tick(s,attackBeat);
 assert.equal(r.health,74.5);assert.ok(b.exposedUntil>attackBeat);
 b.windup={x:9,y:6,radius:0,beat:attackBeat+1,damage:40};r.acted=attackBeat+1;E.tick(s,attackBeat+1);assert.equal(r.health,40.5);
});
test('damaging procs scale with pickaxe strength and never recurse or duplicate a dead target reward',()=>{
 const a=cardValues('popcorn',1,1),b=cardValues('popcorn',1,12);assert.ok(b.damage>a.damage);
 const s=arena({popcorn:5,ricochet:5,echohit:5,ember:5}),n=target(s,'enemy',0,4,11,1),other=target(s,'enemy',0,3,10,1);
 hit(s,n,0);assert.equal(s.run.loot.enemies.count,2);assert.equal(s.run.killCount,2);const bag=s.run.bag;
 hit(s,n,1);E.tick(s,2);assert.equal(s.run.bag,bag);assert.equal(other.hp,0);
});
