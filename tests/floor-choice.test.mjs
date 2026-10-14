import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {ChoiceGuard} from '../dist/choice-guard.js';
function cleared(){const s=E.createState(712);E.startRun(s);s.run.room.cleared=true;s.run.cardOffer=['muscle','ice','ember'];return s;}
test('floor transitions preserve exact health, including boss floors and near-death runs',()=>{
 for(const floor of [1,4,5,9,10,14,15,19])for(const hp of [1,22.4,89,100]){const s=cleared();s.seals=3;s.run.floor=floor;s.run.room.bossDefeated=floor%5===0;s.run.health=hp;E.chooseCard(s,'muscle');if(E.campNeeded(s)){E.enterCamp(s);E.leaveCamp(s);}assert.ok(E.descend(s));assert.equal(s.run.health,hp);assert.equal(E.restoreState(JSON.stringify(s)).run.health,hp);}
 const s=cleared();s.run.rhythm=1;E.chooseCard(s,'muscle');E.descend(s);E.act(s,{type:'hit',id:9999},.45);assert.equal(s.run,null);
});
test('tonics and healing skills still restore health inside a floor',()=>{
 const s=cleared();s.run.room.cleared=false;s.run.health=20;s.run.items.tonic=1;E.act(s,{type:'item',item:'tonic'},0);assert.equal(s.run.health,45);
 s.equipped=['breath'];s.run.rhythm=70;s.run.combo=7;s.run.room.rocks=[];E.act(s,{type:'move',x:2,y:11},1);assert.equal(s.run.health,45);assert.equal(s.run.rhythm,75);
});
test('floor summary shows only that floor and never pays rewards a second time',()=>{
 const s=cleared();s.run.bag=80;s.run.loot.essence=1;s.run.score.points=321;s.run.score.earned=1;
 assert.deepEqual(E.floorRewards(s),{gems:80,essence:1,points:321,stars:1});
 E.chooseCard(s,'muscle');E.descend(s);assert.deepEqual(E.floorRewards(s),{gems:0,essence:0,points:0,stars:0});
 s.run.bag+=25;s.run.loot.essence++;s.run.score.points+=51;const before=s.bank;
 const restored=E.restoreState(JSON.stringify(s));assert.deepEqual(E.floorRewards(restored),{gems:25,essence:1,points:51,stars:0});E.floorRewards(s);assert.equal(s.bank,before);
 delete s.run.room.floorStart;assert.equal(E.floorRewards(s),null);
});
test('held mining input must be released and quiet before choices become available',()=>{
 const g=new ChoiceGuard();g.press('Space',0);g.lock(0);assert.equal(g.ready(2000),false);g.release('Space',2100);assert.equal(g.ready(2499),false);assert.equal(g.ready(2500),true);
});
test('repeated clicks extend the guard and a confirmed card starts a fresh descent guard',()=>{
 const g=new ChoiceGuard();g.lock(0);for(let t=100;t<=1500;t+=100){g.press('p1',t);g.release('p1',t+10);assert.equal(g.ready(t+20),false);}
 assert.equal(g.ready(1910),true);g.press('p1',2000);assert.equal(g.ready(2000),true);g.release('p1',2010);g.lock(2010,900);assert.equal(g.ready(2500),false);assert.equal(g.ready(2910),true);
});
test('multiple held inputs and return confirmation have independent protection',()=>{
 const floor=new ChoiceGuard(),confirm=new ChoiceGuard();floor.lock(0);floor.press('p1',10);floor.press('Enter',20);floor.release('p1',100);assert.equal(floor.ready(1500),false);floor.release('Enter',1500);assert.equal(floor.ready(1900),true);
 confirm.lock(2000,750);assert.equal(confirm.ready(2700),false);assert.equal(floor.ready(2700),true);assert.equal(confirm.ready(2750),true);
});
