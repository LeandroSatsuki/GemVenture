import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {reveal,sightRange} from '../dist/cavern.js';
import {minibossEnemy,refreshCaveMiniboss} from '../dist/cave-miniboss.js';
import {sentinelStatus,SentinelRewardQueue,SENTINEL_REWARD_MS} from '../dist/sentinel-presentation.js';
function arena(){const s=E.createState(43);E.startRun(s);s.run.floor=2;E.generateRoom(s);const r=s.run,e=minibossEnemy(r),origin={...r.player};assert.ok(e);r.player={x:e.x,y:e.y+1};reveal(r.room,r.player,sightRange(r));refreshCaveMiniboss(r);return {s,r,e,origin};}
function win(){const a=arena();a.e.hp=1;assert.equal(E.act(a.s,{type:'hit',id:a.e.id},0).ok,true);assert.equal(a.r.room.miniboss.state,'defeated');return {...a,events:a.r.events.splice(0)};}
test('unseen proximity never reveals health; actual visibility and engaged/retreated state preserve remaining HP without mutations',()=>{
 const {s,r,e,origin}=arena();r.room.visible.fill(0);assert.deepEqual(sentinelStatus(r),{state:'near'});r.room.miniboss.near=false;assert.equal(sentinelStatus(r),null);
 reveal(r.room,r.player,sightRange(r));refreshCaveMiniboss(r);assert.equal(sentinelStatus(r).state,'visible');E.act(s,{type:'hit',id:e.id},0);assert.equal(sentinelStatus(r).state,'engaged');const hp=e.hp;r.player=origin;refreshCaveMiniboss(r);assert.equal(r.room.miniboss.state,'dormant');assert.equal(e.hp,hp);const before=JSON.stringify(s);sentinelStatus(r);assert.equal(JSON.stringify(s),before);r.room.cleared=true;assert.equal(sentinelStatus(r),null);
});
test('real victory notice uses the confirmed bonus and canonical material kind, does not pay or credit the base again',()=>{
 const {s,r,events}=win(),q=new SentinelRewardQueue(),before=JSON.stringify(s);assert.equal(q.accept(events,s),1);assert.equal(sentinelStatus(r),null);assert.deepEqual(q.peek,{key:1,coins:18,crystals:9,kind:0});q.advance(0);q.advance(500);assert.equal(JSON.stringify(s),before);
});
test('pause/danger preserves duration, duplicate victory is ignored even after expiry, loading never infers a reward',()=>{
 const {s,events}=win(),q=new SentinelRewardQueue();q.setProfile(s);assert.equal(q.peek,null);q.accept(events,s);q.advance(8000,{blocked:true});assert.equal(q.current,null);q.advance(0);q.advance(500);q.advance(9000,{blocked:true});assert.equal(q.remainingMs,SENTINEL_REWARD_MS-500);q.advance(SENTINEL_REWARD_MS);assert.equal(q.peek,null);assert.equal(q.accept(events,s),0);
 const loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);q.setProfile(loaded);assert.equal(q.peek,null);
});
test('future, mismatched or unpaid victory events are rejected; pending presentation stays bounded across encounters',()=>{
 const {s,r,events}=win(),q=new SentinelRewardQueue(),m=r.room.miniboss,correct=events.find(e=>e.type==='minibossDefeated');
 assert.equal(q.accept([{...correct,id:m.enemyId+1},{...correct,coins:999}],s),0);m.rewardClaimed=false;assert.equal(q.accept(events,s),0);m.rewardClaimed=true;assert.equal(q.accept(events,s),1);
 for(let i=0;i<20;i++){r.room.miniboss={...m,enemyId:m.enemyId+i+1};q.accept([{...correct,id:r.room.miniboss.enemyId}],s);}assert.equal(q.pendingCount,4);q.setProfile(E.createState(43));assert.equal(q.pendingCount,0);
});
