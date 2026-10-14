import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {awardScore,scoreProgress} from '../dist/stars.js';
import {expeditionMap} from '../dist/expedition-map.js';
test('shared horde pursuit preserves the shortest legal step for each creature',()=>{
 for(const seed of [4,82,712]){const s=E.createState(seed);E.startRun(s);const r=s.run;
 r.room.enemies=r.room.nodes.filter(n=>E.distance(n,r.player)>6).map((n,i)=>({id:900+i,type:'enemy',kind:0,x:n.x,y:n.y,hp:40,maxHp:40,stunUntil:-1,windup:null}));
 const expected=r.room.enemies.map(e=>E.pathTo(r.room,e,r.player)[0]);E.enemyBeat(s,4);
 r.room.enemies.forEach((e,i)=>assert.deepEqual({x:e.x,y:e.y},expected[i]));
 }
});
function state(){const s=E.createState(712);s.seals=3;E.startRun(s);return s;}
test('star milestones are independent of unlocked depth and progress never resets at a star',()=>{
 const a=E.createState(712),b=state();E.startRun(a);assert.equal(a.run.score.target,b.run.score.target);
 awardScore(a,999,0);const before=scoreProgress(a.run).fill;awardScore(a,1,1);assert.equal(a.stars,1);assert.ok(scoreProgress(a.run).fill>before);assert.equal(scoreProgress(a.run).fill,.05);
});
test('one room cannot farm all stars and its spent budget survives reload',()=>{
 const s=state();awardScore(s,100000,900);assert.equal(s.run.score.points,3000);assert.equal(s.stars,1);
 const saved=E.restoreState(JSON.stringify(s));assert.ok(saved);assert.equal(awardScore(saved,100000,901),0);assert.equal(saved.run.score.points,3000);
});
test('walking the same route stops paying, while opening new routes still pays',()=>{
 const s=state(),r=s.run;Object.assign(r.room,{explored:null,visible:null,rocks:[],enemies:[],terrain:[]});
 E.act(s,{type:'move',x:2,y:11},0);E.act(s,{type:'move',x:3,y:11},1);const points=r.score.points;
 E.act(s,{type:'move',x:2,y:11},2);E.act(s,{type:'move',x:3,y:11},3);assert.equal(r.score.points,points);
 E.act(s,{type:'move',x:3,y:10},4);assert.ok(r.score.points>points);
});
test('mining charge alone cannot end the larger room before its survival phase',()=>{
 const s=state(),r=s.run;r.room.charge=r.room.quota;r.room.enemies=[];r.room.wave=null;r.room.rocks=[];r.room.explored=null;r.room.visible=null;
 for(let b=0;b<96;b++)E.act(s,{type:'move',x:b%2?3:2,y:11},b);
 assert.equal(r.room.cleared,false);E.act(s,{type:'move',x:2,y:11},96);assert.equal(r.room.cleared,true);
 assert.equal(r.room.quota,18);
});
test('revival preserves combo, pauses combat, permits a build change and consumes its life once',()=>{
 const s=state();s.unlocked=['revive','guard'];s.equipped=['revive'];const r=s.run;r.combo=23;r.rhythm=1;
 E.act(s,{type:'hit',id:999999},4.45);assert.equal(r.combo,23);assert.equal(r.rhythm,30);assert.ok(r.recovery.active);assert.equal(r.revived,true);
 const frozen=JSON.stringify(r);E.tick(s,10);E.enemyBeat(s,10);E.act(s,{type:'dodge',dx:1,dy:0},10);assert.equal(JSON.stringify(r),frozen);
 assert.ok(E.equip(s,'guard'));assert.ok(E.restoreState(JSON.stringify(s)).run.recovery.active);assert.ok(E.resumeRecovery(s));assert.equal(E.resumeRecovery(s),false);
 r.rhythm=1;E.act(s,{type:'hit',id:999999},11.45);assert.equal(s.run,null);
});
test('camp gates descent every ten floors, allows one paid preparation per offer and does not heal on entry',()=>{
 const s=state(),r=s.run;r.floor=10;r.room.bossDefeated=true;r.room.enemies=[];r.room.cleared=true;r.cardChosen=true;r.health=40;r.materials=[0,60,60,60];
 assert.equal(E.descend(s),false);assert.ok(E.enterCamp(s));assert.equal(r.health,40);assert.ok(E.buyCamp(s,'heal'));assert.equal(r.health,75);assert.equal(r.materials[3],30);
 assert.equal(E.buyCamp(s,'heal'),false);assert.ok(E.buyCamp(s,'ward'));assert.equal(r.items.ward,2);assert.equal(r.materials[2],35);
 r.items.blast=8;assert.equal(E.buyCamp(s,'blast'),false);assert.equal(r.materials[1],60);r.items.blast=7;assert.ok(E.buyCamp(s,'blast'));assert.equal(r.items.blast,9);assert.equal(r.materials[1],35);
 assert.ok(E.restoreState(JSON.stringify(s)).run.rest.active);assert.equal(E.descend(s),false);assert.ok(E.leaveCamp(s));assert.ok(E.descend(s));assert.equal(r.floor,11);assert.equal(r.health,75);
 assert.equal(E.enterCamp(s),false);assert.equal(E.buyCamp(s,'blast'),false);
});
test('discovery map hides unvisited floors, future bosses and the total depth',()=>{
 const s=E.createState();s.best=3;const html=expeditionMap(s);assert.doesNotMatch(html,/20 ANDARES|4 BIOMAS|MÍSTICO|Místico|ANDAR 20|1 →/);assert.match(html,/PROFUNDEZAS DESCONHECIDAS/);assert.equal((html.match(/class="map-floor /g)||[]).length,5);assert.equal((html.match(/class="map-floor map-undiscovered"/g)||[]).length,2);assert.doesNotMatch(html,/Rei Geodo|Matriarca/);
});
test('legacy star migration keeps points and earned currency without paying on reload',()=>{
 const s=state();s.run.score={points:1600,earned:1,target:36000};s.stars=9;const t=E.restoreState(JSON.stringify(s));
 assert.equal(t.stars,9);assert.equal(t.run.score.points,1600);assert.equal(t.run.score.earned,1);assert.equal(t.run.score.target,20000);
 assert.equal(E.restoreState(JSON.stringify(t)).stars,9);
});
