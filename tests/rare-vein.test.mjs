import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';

function setup(rare=true){
 const s=E.createState(712);E.startRun(s);const r=s.run;
 r.room.rocks=[];r.room.enemies=[];r.room.explored=null;r.room.visible=null;r.room.quota=1000;
 r.player={x:3,y:11};r.frenzy.nextQuest=1000;
 const n={id:999,type:'crystal',kind:2,x:4,y:11,hp:26,maxHp:26,value:105,born:0,rare,rareUntil:48};
 r.room.nodes=[n];r.frenzy.quest={kind:'vein',name:'VEIO RARO',target:999,goal:1,progress:0,until:48,done:false};
 return s;
}
test('rare vein pays on every damaging hit, with immediate loot feedback and no premature break rewards',()=>{
 const s=setup(),r=s.run,n=r.room.nodes[0];
 for(let b=0;b<3;b++){
  const before=r.materials[2],hp=n.hp;r.events=[];assert.ok(E.act(s,{type:'hit',id:999},b).ok);
  assert.ok(n.hp<hp&&n.hp>0);assert.ok(r.materials[2]>before);
  assert.equal(r.events.filter(e=>e.type==='loot').length,1);
  assert.equal(r.events.find(e=>e.type==='loot').value,r.materials[2]-before);
 }
 assert.equal(r.loot.crystals[2].gems,r.materials[2]);assert.equal(r.loot.crystals[2].count,0);
 assert.equal(r.room.charge,0);assert.equal(r.items.blast,0);assert.equal(r.frenzy.quest.done,false);
 assert.equal(r.frenzy.quest.collected,r.materials[2]);
 const before=r.materials[2];E.act(s,{type:'hit',id:999},2);E.act(s,{type:'hit',id:999},3.45);assert.equal(r.materials[2],before);
});
test('deadline removes an unfinished vein, preserves its harvested material and prevents late hit or burn rewards',()=>{
 const s=setup(),r=s.run,n=r.room.nodes[0];n.rareUntil=r.frenzy.quest.until=4;
 E.act(s,{type:'hit',id:999},0);const gathered=r.materials[2];n.burn={start:0,until:10,damage:999};
 r.acted=5;r.guardUntil=20;E.tick(s,5);
 assert.ok(!r.room.nodes.some(n=>n.id===999));assert.equal(r.materials[2],gathered);assert.ok(r.frenzy.quest.done);
 assert.equal(r.loot.crystals[2].count,0);assert.equal(r.items.blast,0);assert.equal(r.materials[0],0);
 E.act(s,{type:'hit',id:999},6);assert.equal(r.materials[2],gathered);
 const late=setup();late.run.room.nodes[0].rareUntil=1;E.act(late,{type:'hit',id:999},2);assert.equal(late.run.materials[2],0);
});
test('breaking a rare vein awards the challenge once without paying the full crystal again',()=>{
 const s=setup(),r=s.run,n=r.room.nodes[0];let paid=0,hits=0;
 for(let b=0;n.hp>0&&b<40;b++){
  r.events=[];E.act(s,{type:'hit',id:999},b);const drops=r.events.filter(e=>e.type==='loot');
  assert.equal(drops.length,1);paid+=drops[0].value;hits++;
 }
 assert.ok(hits>1);assert.equal(n.hp,0);assert.equal(r.materials[2],paid);
 assert.equal(r.loot.crystals[2].gems,paid);assert.equal(r.loot.crystals[2].count,1);
 assert.equal(r.items.blast,1);assert.equal(r.materials[0],15);assert.ok(r.frenzy.quest.done);
 const before=[...r.materials];E.act(s,{type:'hit',id:999},45);assert.deepEqual(r.materials,before);
});
test('blast payout is based on actual removed durability, not overkill damage',()=>{
 const s=setup(),r=s.run;r.room.nodes[0].hp=1;r.items.blast=1;s.level=12;
 E.act(s,{type:'item',item:'blast'},0);
 assert.ok(r.materials[2]>0&&r.materials[2]<10);assert.equal(r.loot.crystals[2].count,1);
});
test('partial harvest and deadline survive reload; old rare veins inherit their active challenge deadline',()=>{
 const s=setup();E.act(s,{type:'hit',id:999},0);const t=E.restoreState(JSON.stringify(s));assert.ok(t);
 assert.equal(t.run.materials[2],s.run.materials[2]);assert.equal(t.run.frenzy.quest.collected,s.run.frenzy.quest.collected);
 assert.equal(t.run.room.nodes[0].rareUntil,48);const before=t.run.materials[2];E.act(t,{type:'hit',id:999},1);assert.ok(t.run.materials[2]>before);
 delete t.run.room.nodes[0].rareUntil;t.run.frenzy.quest.until=3;t.run.acted=4;E.tick(t,4);
 assert.ok(!t.run.room.nodes.some(n=>n.id===999));
 const bad=setup();bad.run.room.nodes[0].rareUntil=-1;assert.equal(E.restoreState(JSON.stringify(bad)),null);
});
test('ordinary crystals still pay only on destruction',()=>{
 const s=setup(false),r=s.run;E.act(s,{type:'hit',id:999},0);assert.equal(r.materials[2],0);assert.equal(r.loot.crystals[2].gems,0);
});
