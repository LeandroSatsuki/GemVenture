import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {offerAbyssCards,advanceAbyssChoice,ABYSS_RECOVERY_CARDS} from '../dist/abyss-cards.js';
import {CARDS,cardLimit} from '../dist/cards.js';
function run(seed=712){const s=E.createState(seed);s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];E.startRun(s,'abyss');return s;}
function milestone(s){const r=s.run;r.acted=96;r.combo=34;r.guardUntil=110;E.tick(s,96);assert.ok(r.abyss.cardChoice);return r.abyss.cardChoice;}

test('new sections offer three distinct cards once, never during the opening or normal floors',()=>{
 const s=run();assert.equal(offerAbyssCards(s),false);const c=milestone(s);assert.equal(c.remaining,4);assert.equal(c.section,2);assert.equal(new Set(c.offers).size,3);assert.ok(!c.offers.includes('battery'));assert.equal(offerAbyssCards(s),false);
 assert.ok(E.chooseAbyssCard(s,c.offers[0]));assert.equal(offerAbyssCards(s),false);assert.equal(s.run.room.cleared,false);assert.equal(E.descend(s),false);
 const floors=E.createState();E.startRun(floors);assert.equal(offerAbyssCards(floors),false);assert.equal(E.chooseAbyssCard(floors,c.offers[0]),false);
});
test('manual choice applies its real effect once and late clicks cannot select another card',()=>{
 const s=run(),r=s.run;milestone(s);r.abyss.cardChoice.offers=['muscle','lantern','candy'];const damage=E.power(s),health=r.health;
 assert.equal(E.chooseAbyssCard(s,'lucky'),false);assert.ok(E.chooseAbyssCard(s,'muscle'));assert.equal(E.power(s),damage+1);assert.equal(r.health,health);assert.equal(r.cards.muscle,1);assert.equal(r.abyss.cardChoice,null);assert.equal(E.chooseAbyssCard(s,'lantern'),false);assert.equal(E.advanceAbyssCards(s,4),null);
 assert.equal(r.combo,34);assert.equal(r.events.filter(e=>e.type==='abyssCardChosen').length,1);
});
test('four visible seconds choose exactly one random offered card, with no payment before the deadline',()=>{
 const outcomes=new Set();for(let seed=1;seed<=30;seed++){
  const s=run(seed),r=s.run;const c=milestone(s),id=c.offers[c.autoIndex];outcomes.add(c.autoIndex);
  assert.equal(E.advanceAbyssCards(s,3.75),null);assert.equal(c.remaining,.25);assert.deepEqual(r.cards,{});
  assert.equal(E.advanceAbyssCards(s,.25),id);assert.equal(r.cards[id],1);assert.equal(r.abyss.cardChoice,null);assert.equal(E.advanceAbyssCards(s,5),null);
  assert.ok(r.events.some(e=>e.type==='abyssCardChosen'&&e.automatic));
 }
 assert.equal(outcomes.size,3);
});
test('choice freezes enemies, world, mission deadline and rhythm; combat continues on the same clock',()=>{
 const s=run(),r=s.run;s.mission={id:'clock',template:'miner',tier:'common',goal:999,progress:0,remaining:120,status:'active'};milestone(s);
 const before=JSON.stringify({beat:r.beat,enemyBeat:r.enemyBeat,health:r.health,rhythm:r.rhythm,combo:r.combo,rows:r.abyss.rows,room:r.room,mission:s.mission});
 E.tick(s,97);E.enemyBeat(s,97);assert.equal(E.act(s,{type:'dodge',dx:1,dy:0},97).ok,false);E.advanceAbyssCards(s,2);
 assert.equal(JSON.stringify({beat:r.beat,enemyBeat:r.enemyBeat,health:r.health,rhythm:r.rhythm,combo:r.combo,rows:r.abyss.rows,room:r.room,mission:s.mission}),before);
 E.advanceAbyssCards(s,2);r.acted=97;r.guardUntil=110;E.tick(s,97);assert.equal(r.beat,97);assert.equal(r.combo,34);assert.ok(s.mission.remaining<120);
});
test('save and reload retain offers, remaining time and random outcome; death discards the choice',()=>{
 const s=run();const c=milestone(s);E.advanceAbyssCards(s,1.5);const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.deepEqual(t.run.abyss.cardChoice,c);assert.equal(E.advanceAbyssCards(t,2.5),c.offers[c.autoIndex]);assert.ok(E.restoreState(JSON.stringify(t)));
 E.finishRun(s,'death');assert.equal(E.advanceAbyssCards(s,4),null);E.startRun(s,'abyss');assert.deepEqual(s.run.cards,{});assert.equal(s.run.abyss.cardChoice,null);
 const old=run();delete old.run.abyss.cardSection;delete old.run.abyss.cardChoice;assert.ok(E.restoreState(JSON.stringify(old)));
});
test('invalid choice states are rejected and a late manual pick cannot override the auto result',()=>{
 const s=run();milestone(s);for(const change of [c=>c.remaining=-1,c=>c.remaining=4.1,c=>c.autoIndex=3,c=>c.offers=['unknown','muscle','lantern'],c=>c.offers=['muscle','muscle','lantern'],c=>c.section=99]){
  const t=structuredClone(s);change(t.run.abyss.cardChoice);assert.equal(E.restoreState(JSON.stringify(t)),null);
 }
 const c=s.run.abyss.cardChoice;advanceAbyssChoice(s.run,4);assert.equal(E.chooseAbyssCard(s,c.offers[0]),false);assert.equal(E.advanceAbyssCards(s,0),c.offers[c.autoIndex]);
});
test('an arbitrarily long descent never exceeds card caps and retains three choices after every cap',()=>{
 const s=run(),r=s.run;for(let section=2;section<=350;section++){
  r.abyss.section=section;assert.ok(offerAbyssCards(s));assert.equal(r.abyss.cardChoice.offers.length,3);assert.ok(E.advanceAbyssCards(s,4));
  assert.ok(CARDS.every(c=>(r.cards[c.id]||0)<=cardLimit(c,s)));
 }
 for(const c of CARDS)r.cards[c.id]=cardLimit(c,s);r.abyss.section++;assert.ok(offerAbyssCards(s));assert.deepEqual(r.abyss.cardChoice.offers,ABYSS_RECOVERY_CARDS.map(c=>c.id));r.health=10;assert.ok(E.chooseAbyssCard(s,'abyss-heal'));assert.equal(r.health,35);assert.ok(E.restoreState(JSON.stringify(s)));
});
