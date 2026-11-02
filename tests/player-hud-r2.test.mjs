import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun,act} from '../dist/core.js';
import {Effects} from '../dist/effects.js';
import {createFamilyPainter} from '../dist/vfx-family.js';
import {P} from '../dist/palette.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';

function recording(){
 const fills=[],rects=[],stack=[];let path=[];
 const c=new Proxy({globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},beginPath(){path=[];},moveTo(x,y){path.push([x,y]);},lineTo(x,y){path.push([x,y]);},fill(){fills.push({color:this.fillStyle,points:path});},fillRect(...r){rects.push(r);}}, {get:(o,k)=>k in o?o[k]:(()=>{})});
 return{c,fills,rects,stack};
}
test('critical adds two satellites and a larger dominant star without altering buff accents',()=>{
 const painter=createFamilyPainter(P),stars=kind=>{const q=recording();painter.draw(q.c,kind,.14,{tier:1});assert.equal(q.stack.length,0);return q.fills.filter(p=>p.color===P.lemon&&p.points.length===8);};
 const old=stars('combo'),critical=stars('critical');assert.equal(old.length,3);assert.equal(critical.length,5);
 const height=p=>Math.max(...p.points.map(v=>v[1]))-Math.min(...p.points.map(v=>v[1]));
 assert.ok(Math.max(...critical.map(height))>Math.max(...old.map(height)));
 const soft=recording();painter.draw(soft.c,'critical',.14,{soft:true});assert.equal(soft.fills.filter(p=>p.color===P.lemon&&p.points.length===8).length,1);
});
test('green luck is faceted loot and healing keeps its cross silhouette',()=>{
 const painter=createFamilyPainter(P),luck=recording(),heal=recording();painter.draw(luck.c,'luck',.14);painter.draw(heal.c,'heal',.14);
 assert.equal(luck.fills.filter(p=>p.color===P.lime&&p.points.length===4).length,2);assert.equal(luck.rects.length,0);assert.ok(heal.rects.length>0);
 const soft=recording();painter.draw(soft.c,'luck',.14,{soft:true});assert.equal(soft.fills.filter(p=>p.color===P.lime&&p.points.length===4).length,1);
});
test('native green luck keeps its doubled loot and cannot trigger healing or the old aura',()=>{
 let s,event;
 for(let seed=1;seed<=40&&!event;seed++){
  s=createState(seed);startRun(s);rectangularRoom(s);const r=s.run;r.blessing='luckywish';r.blessingLevel=10;r.events=[];r.room.quota=9999;r.room.enemies=[];r.room.rocks=[];
  r.room.nodes=[{id:1,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:10,born:0}];
  assert.ok(act(s,{type:'hit',id:1},0).ok);event=r.events.find(e=>e.type==='proc'&&e.id==='well-luck');
 }
 assert.ok(event);const before=JSON.stringify(s),f=new Effects(),project=(x,y)=>({x:x*20,y:y*20});
 f.consume([event],project,{x:60,y:220});assert.equal(JSON.stringify(s),before);assert.equal(f.buffAccents.length,1);assert.equal(f.buffAccents[0].kind,'luck');
 assert.equal(f.playerHeal.sample(0),null);assert.equal(f.sprites.items.length+f.rings.length+f.particles.length,0);
 f.consume([event],project,{x:60,y:220});assert.equal(f.buffAccents.length,1);
 f.consume([{type:'heal',value:4,x:3,y:11}],project,{x:60,y:220});assert.ok(f.playerHeal.sample(.1));assert.equal(f.buffAccents.length,1);
 f.consume([{type:'scroll'}],project,{x:60,y:220});assert.deepEqual([f.buffAccents[0].x,f.buffAccents[0].y],[28,94]);f.update(.7);assert.equal(f.buffAccents.length,0);
});
