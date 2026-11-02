import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Effects} from '../dist/effects.js';
import {project} from '../dist/world.js';
import {createMiningPainter,prepareMiningPacket,miningFrame} from '../dist/mining-vfx.js';
import {makeFixture,applyFixtureHit} from './fixtures/crystal-contact-fixture.mjs';
import {CRYSTAL_VEIN_RAMPS} from '../dist/crystal-veins.js';
import {P} from '../dist/palette.js';

function canvas(){
 const stack=[],ops=[];
 const c=new Proxy({globalAlpha:.7,globalCompositeOperation:'source-over',
  save(){stack.push({alpha:this.globalAlpha,composite:this.globalCompositeOperation});},
  restore(){const s=stack.pop();assert.ok(s);this.globalAlpha=s.alpha;this.globalCompositeOperation=s.composite;},
  translate(x,y){ops.push(['translate',x,y]);},fill(){ops.push(['fill',this.fillStyle]);},stroke(){ops.push(['stroke',this.strokeStyle]);},
 },{get:(o,k)=>k in o?o[k]:(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));}});
 return {c,stack,ops};
}
const hit=(id=1,kind=0,x=4,y=11)=>({type:'hit',damage:1,x,y,color:P.cyan,mineral:{id,kind}});

test('approved draw and recoil geometry are unchanged from the human-reviewed Crystal P1',()=>{
 const source=readFileSync(new URL('../dist/mining-vfx.js',import.meta.url),'utf8').replaceAll('\r\n','\n');
 const contract=JSON.parse(readFileSync(new URL('./fixtures/crystal-contact-20261031-approved.json',import.meta.url),'utf8'));
 const body=source.slice(source.indexOf(' function draw('),source.indexOf(' return Object.freeze('));
 assert.equal(createHash('sha256').update(body).digest('hex'),contract.approvedDrawAndPoseSHA256);
});

test('24 real mining fixtures preserve domain, hit numbers, payout, native shake and terminal break',()=>{
 for(const biome of [0,3])for(let kind=0;kind<4;kind++)for(const mode of ['sequence','hit','break']){
  const f=makeFixture({biome,kind,mode}),fx=new Effects();let loot=0;
  for(let i=0;i<f.plannedHits;i++){
   const events=applyFixtureHit(f,i),before=JSON.stringify(f.state),packet=JSON.stringify(events);
   const miningHit=events.find(e=>e.type==='hit'&&e.mineral?.id===f.ore.id),oreLoot=events.find(e=>e.type==='loot'&&e.x===f.ore.x&&e.y===f.ore.y);
   fx.consume(events,project,project(f.state.run.player.x,f.state.run.player.y));
   assert.ok(fx.labels.some(l=>l.text===Number(miningHit.damage.toFixed(2)).toLocaleString('pt-BR')));
   if(oreLoot){loot++;assert.ok(fx.labels.some(l=>l.text===`+${oreLoot.value} ◇`));assert.ok(fx.shake>0);}
   assert.equal(fx.mining.status(fx.age).breaks,oreLoot?1:0);
   const r=canvas();fx.draw(r.c,0,false);assert.equal(r.stack.length,0);assert.equal(r.c.globalAlpha,.7);
   assert.equal(JSON.stringify(f.state),before);assert.equal(JSON.stringify(events),packet);
   fx.update(.7);assert.equal(fx.mining.status(fx.age).queued,0);
  }
  assert.equal(loot,mode==='hit'?0:1);
 }
});

test('matching mineral loot replaces old rings/atlas/burst; unrelated rewards and Bomba retain their consumer',()=>{
 const e=hit(),loot={type:'loot',x:4,y:11,value:12,heavy:true,color:P.orange},fx=new Effects();
 fx.consume([e,loot],project,project(3,11));assert.equal(fx.particles.length,0);assert.equal(fx.rings.length,0);assert.equal(fx.sprites.items.length,0);assert.equal(fx.mining.status(0).breaks,1);assert.equal(fx.shake,2.8);
 fx.consume([{type:'bomb',x:3,y:11}],project,project(3,11));assert.ok(fx.particles.length>0);assert.ok(fx.rings.length>0);
 const other=new Effects();other.consume([{...loot,x:5}],project,project(3,11));assert.ok(other.particles.length>0);
});

test('one packet aggregates same-mineral chain contacts without merging new targets or crossing scroll epochs',()=>{
 const a=hit(),b=hit(),loot={type:'loot',x:4,y:11,value:10},fresh=hit(2),fx=new Effects();
 const packet=[a,b,loot,fresh],before=JSON.stringify(packet),prepared=prepareMiningPacket(packet);
 assert.equal(prepared.contacts.size,2);assert.ok(!prepared.contacts.has(a));assert.equal(prepared.contacts.get(b),loot);assert.equal(prepared.contacts.get(fresh),null);
 fx.consume(packet,project,project(3,11));assert.equal(fx.mining.status(0).active,2);assert.equal(fx.mining.status(0).breaks,1);
 fx.consume(packet,project,project(3,11));assert.equal(fx.mining.status(0).active,2);assert.equal(JSON.stringify(packet),before);
 const crossed=prepareMiningPacket([hit(),{type:'scroll'},loot]);assert.equal(crossed.loots.size,0);
});

test('scroll moves retained contacts with the world; pause, expiration and setSoft clear have bounded lifecycle',()=>{
 const fx=new Effects(),e=hit();fx.consume([e],project,project(3,11));fx.update(.04);
 const before=canvas();fx.mining.draw(before.c,fx.age);
 fx.consume([{type:'scroll'}],project,project(3,11));const after=canvas();fx.mining.draw(after.c,fx.age);
 const a=before.ops.find(o=>o[0]==='translate'),b=after.ops.find(o=>o[0]==='translate');assert.equal(b[1],a[1]-2);assert.equal(b[2],a[2]-16);
 const state=fx.mining.status(fx.age);fx.update(0);assert.deepEqual(fx.mining.status(fx.age),state);
 assert.ok(fx.mining.pose(1,fx.age));assert.equal(fx.mining.pose(1,fx.age,{soft:true}),null);
 fx.setSoft(true);assert.equal(fx.mining.status(0).queued,0);
 for(let i=0;i<100;i++)fx.consume([hit(i,i%4)],project,project(3,11));assert.equal(fx.mining.status(0).queued,12);
 fx.update(.7);assert.equal(fx.mining.status(fx.age).queued,0);fx.clear();assert.equal(fx.age,0);
});

test('all four ramps, reduced mode and full motion draw finite bounded geometry at start, peak and tail',()=>{
 const allowed=new Set([...CRYSTAL_VEIN_RAMPS.flat(),P.lemon]);
 for(let kind=0;kind<4;kind++)for(const breaking of [false,true])for(const soft of [false,true])for(const age of [0,.025,.075,.16,.29,.45,.61,.63]){
  const p=createMiningPainter(),h=hit(1,kind);p.consume([h,...(breaking?[{type:'loot',x:4,y:11}]:[])],project,{x:3,y:11},0);
  const r=canvas();p.draw(r.c,age,{soft});assert.equal(r.stack.length,0);assert.equal(r.c.globalAlpha,.7);
  for(const op of r.ops)if(op[0]==='fill'||op[0]==='stroke')assert.ok(allowed.has(op[1]));
  assert.ok(r.ops.filter(o=>o[0]==='fill').length<=18);
  assert.equal(p.pose(1,.04,{soft})===null,soft||breaking);
 }
 assert.equal(miningFrame({breaking:false},.04,{soft:true}).count,2);assert.equal(miningFrame({breaking:true},.04,{soft:true}).count,3);
});

test('invalid/zero-damage contacts and pure loot cannot fabricate a new mining reward',()=>{
 const cases=[{...hit(),damage:0},{...hit(),damage:NaN},{...hit(),mineral:null},{...hit(),x:Infinity},{...hit(),mineral:{id:1,kind:99}},{type:'loot',x:4,y:11}];
 for(const e of cases){const p=prepareMiningPacket([e]);assert.equal(p.contacts.size,0);assert.equal(p.loots.size,0);}
});
