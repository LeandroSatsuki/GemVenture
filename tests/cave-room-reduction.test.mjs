import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {inflateSync} from 'node:zlib';import vm from 'node:vm';
import * as E from '../dist/core.js';import {createExpedition,EXPEDITION_SPEC,expeditionDistances} from '../dist/campaign-cave-expedition.js';import {campaignCaveProfile} from '../dist/campaign-cave-profile.js';import {arrivalPlan} from '../dist/cave-arrival-plan.js';import {CAMPAIGN_GEOMETRY_WORKER_SOURCE,buildCampaignGeometry} from '../dist/campaign-cave-geometry.js';
function game(floor=1){const s=E.createState(712);s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);return s;}
test('new caves have exactly 40 percent fewer rooms, preserving large halls and connected side chambers across 700 samples',()=>{
 assert.equal(EXPEDITION_SPEC.halls+EXPEDITION_SPEC.sideHalls,30*.6);assert.equal(EXPEDITION_SPEC.cols*EXPEDITION_SPEC.rows,192*144*.625);
 for(let biome=0;biome<7;biome++)for(let seed=0;seed<100;seed++){const w=createExpedition(seed,biome),{dist,visited}=expeditionDistances(w,w.spawn);assert.equal(w.rooms.length,18);assert.equal(w.rooms.filter(r=>r.kind==='main').length,15);assert.equal(w.rooms.filter(r=>r.kind==='side').length,3);assert.ok(w.rooms.every(r=>dist[r.y*w.cols+r.x]>=0));assert.equal(visited,w.floorMask.reduce((a,b)=>a+b,0));assert.ok(w.rooms.filter(r=>r.kind==='main').every(r=>r.rx>=10&&r.rx<=13&&r.ry>=9&&r.ry<=12));assert.ok(w.burrowDistance>=180);}
});
test('new profile saves restore depletion and the arrival under their explicit generation version',()=>{
 for(const floor of [1,6,11,16,21,26,31]){const s=game(floor);assert.equal(s.run.room.layout.version,3);assert.ok(campaignCaveProfile(s.run.room));s.run.room.nodes[0].hp=1;s.run.room.nodes.pop();const before=JSON.parse(JSON.stringify(s.run.room)),restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.deepEqual(restored.run.room,before);assert.ok(arrivalPlan(restored.run).enabled);}
});
test('a real synthetic 30-room legacy save restores its original map without regeneration',async()=>{
 const fixture=JSON.parse(await readFile(new URL('./fixtures/cave-expedition-legacy-v2.json',import.meta.url),'utf8')),state=JSON.parse(inflateSync(Buffer.from(fixture.data,'base64'))),old=state.run.room;
 assert.equal(old.layout.version,2);assert.equal(old.layout.rooms.length,30);const restored=E.restoreState(JSON.stringify(state));assert.ok(restored);assert.deepEqual(restored.run.room,old);assert.equal(restored.run.room.cols,192);assert.equal(restored.run.room.rows,144);assert.ok(arrivalPlan(restored.run).enabled);
 const altered=JSON.parse(JSON.stringify(state));altered.run.room.layout.version=3;assert.equal(E.restoreState(JSON.stringify(altered)),null);
});
test('profile size/count mismatches are rejected instead of truncating an existing save',()=>{
 for(const mutate of [r=>r.cols=192,r=>r.layout.version=2,r=>r.layout.rooms.pop(),r=>r.layout.rooms[1].kind='side',r=>r.layout.connections[0].to=23]){const s=game();mutate(s.run.room);assert.equal(E.restoreState(JSON.stringify(s)),null);}
});
test('worker and synchronous geometry consumers use the actual smaller mask, with legacy compatibility',()=>{
 for(let biome=0;biome<7;biome++){const room=createExpedition(712,biome),expected=buildCampaignGeometry(room);let reply;const self={postMessage:value=>{reply=value;}};vm.runInNewContext(CAMPAIGN_GEOMETRY_WORKER_SOURCE,{self,performance});self.onmessage({data:room});assert.equal(reply.ok,true);assert.equal(reply.groups.count,expected.count);assert.equal(JSON.stringify([...reply.groups.byChunk]),JSON.stringify([...expected.byChunk]));}
});
