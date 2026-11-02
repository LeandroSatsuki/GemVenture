import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {grantXP,nextLevelXP} from '../dist/pillars.js';
import {LevelProgressNotice,LEVEL_NOTICE_MS} from '../dist/level-progress-notice.js';

function earned(amount=1000){const s=E.createState(43);E.startRun(s);s.experience.xp=130;grantXP(s,amount);return {s,events:s.run.events.splice(0).filter(e=>e.type==='levelUp')};}
test('real multi-level grant is one notice; points are confirmed gains, not unspent balance or pickaxe tier',()=>{
 const {s,events}=earned(),q=new LevelProgressNotice();s.experience.points+=12;const before=JSON.stringify(s);
 assert.equal(q.accept(events,s),5);assert.deepEqual(q.view(s),{serial:1,points:5,level:6,xp:80,max:300,ratio:80/300});assert.equal(JSON.stringify(s),before);
});
test('cosmetic lifetime freezes during pause or danger, aggregates new batches and never replays duplicates',()=>{
 const {s,events}=earned(35),q=new LevelProgressNotice();assert.equal(q.accept([...events,...events],s),1);
 q.advance(700);q.advance(9000,{blocked:true});assert.equal(q.remainingMs,LEVEL_NOTICE_MS-700);
 grantXP(s,200);const more=s.run.events.splice(0);assert.equal(q.accept(more,s),1);assert.equal(q.view(s).points,2);assert.equal(q.remainingMs,LEVEL_NOTICE_MS);
 q.advance(LEVEL_NOTICE_MS);assert.equal(q.view(s),null);assert.equal(q.accept([...events,...more],s),0);
});
test('deferred notice reads current XP without inventing a previous snapshot or mutating progression',()=>{
 const {s,events}=earned(35),q=new LevelProgressNotice();q.accept(events,s);grantXP(s,20);const before=JSON.stringify(s),view=q.view(s);
 assert.equal(view.level,2);assert.equal(view.xp,35);assert.equal(view.max,nextLevelXP(2));assert.equal(view.points,1);assert.equal(JSON.stringify(s),before);
});
test('loading a profile never infers a gain; malformed and future events are rejected and profile replacement clears presentation',()=>{
 const {s,events}=earned(),loaded=E.restoreState(JSON.stringify(s)),q=new LevelProgressNotice();assert.ok(loaded);q.setProfile(loaded);assert.equal(q.view(loaded),null);
 assert.equal(q.accept([{type:'levelUp',level:1},{type:'levelUp',level:7},{type:'levelUp',level:2.5},{type:'levelUp',level:NaN},{type:'star',level:2},null],loaded),0);
 q.accept(events,s);q.setProfile(loaded);assert.equal(q.pending,false);assert.equal(q.remainingMs,0);
});
test('large and unordered confirmed batches remain a single bounded aggregate',()=>{
 const s=E.createState(43);s.experience.level=1001;const events=Array.from({length:1000},(_,i)=>({type:'levelUp',level:1001-i})),q=new LevelProgressNotice();
 assert.equal(q.accept(events,s),1000);assert.equal(q.view(s).points,1000);assert.equal(q.view(s).level,1001);assert.equal(q.accept(events,s),0);q.advance(9999);assert.equal(q.pending,false);
});
