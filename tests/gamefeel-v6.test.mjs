import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import * as E from '../dist/core.js';
import {validateLayout,isFloor} from '../dist/cave-layout.js';import {occludingWallPlan} from '../dist/cave-wall-occlusion.js';import {spinningStarSvg} from '../dist/gamefeel-v5.js';import {sampleLobbyIdle} from '../dist/player-appearance.js';import {outfitMarkup} from '../dist/miner-outfit.js';
const fresh=()=>{const s=E.createState(41001);E.startRun(s);return s;};
test('restored consumables are earned in combat, not added to the permanent wallet',()=>{
 for(const [kind,item,amount]of [[0,'tonic',1],[1,'ward',1],[2,'blast',2]]){const s=fresh();rectangularRoom(s);const r=s.run;r.room.floorMask=undefined;r.room.nodes=[];r.room.rocks=[];r.room.effects=[];r.room.hazards=[];r.room.seen=Array(r.room.cols*r.room.rows).fill(true);r.items={tonic:0,blast:0,ward:0};r.room.enemies=[{id:'drop-test',type:'enemy',kind,x:4,y:11,hp:1,maxHp:1,stunUntil:999}];r.player={x:3,y:11};assert.ok(E.act(s,{type:'hit',id:'drop-test'},0).ok);assert.equal(r.items[item],amount);assert.ok(r.events.some(e=>e.type==='item'&&e.item===item));}
});
test('star rotates in screen plane with constant projected face area, never edge-on',()=>{
 const areas=[];for(let f=0;f<48;f++){const s=spinningStarSvg(f);const faces=[...s.matchAll(/points="([^"]+)"/g)];const a=faces.map(m=>{const p=m[1].split(' ').map(q=>q.split(',').map(Number));return Math.abs(p.reduce((sum,v,i)=>sum+v[0]*p[(i+1)%p.length][1]-v[1]*p[(i+1)%p.length][0],0))/2;});areas.push(Math.max(...a));}assert.ok(Math.max(...areas)/Math.min(...areas)<1.01);
});
test('approved expedition chambers and protected corridors are reproducible without changing existing saves',()=>{
 for(let seed=1;seed<=70;seed++){const a=E.createState(seed),b=E.createState(seed);E.startRun(a);E.startRun(b);assert.deepEqual(a.run.room.floorMask,b.run.room.floorMask);assert.ok(validateLayout(a.run.room));assert.equal(a.run.room.layout.rooms.filter(r=>r.kind==='main').length,15);assert.ok(a.run.room.layout.protectedTiles.length>200);for(const f of occludingWallPlan(a.run.room))assert.equal(f.height,30);const saved=E.restoreState(JSON.stringify(a));assert.deepEqual(saved.run.room.floorMask,a.run.room.floorMask);}
});
test('new dances are chosen with no consecutive gestures, clothing tabs expose one category',()=>{
 const seen=new Set(),list=[];for(let t=0;t<600;t+=.2){const p=sampleLobbyIdle(t,false,'idle',1234);seen.add(p.name);if(p.name!=='idle'&&list.at(-1)?.start!==Math.round((t-p.time)*100))list.push({name:p.name,start:Math.round((t-p.time)*100)});}for(const id of ['step','sway','look','sit','wave','jamal'])assert.ok(seen.has(id));for(let i=1;i<list.length;i++)assert.notEqual(list[i].name,list[i-1].name);
 const s=E.createState(1),markup=outfitMarkup(s,'shirt');assert.ok(markup.includes('data-outfit-item="pink"'));assert.ok(!markup.includes('data-outfit-item="duck"'));assert.equal((markup.match(/role="tab"/g)||[]).length,5);
});
