import test from 'node:test';import assert from 'node:assert/strict';
import {createState,CAMP_OFFERS,buyCamp,maxHealth,resumeRecovery} from '../dist/core.js';
import {restServiceView} from '../dist/approved-rest-ui.js';
const profile=()=>{const s=createState(712);s.run={floor:10,rest:{active:true,bought:[]},recovery:null,health:43,rhythm:76,combo:147,materials:[8,28,32,40],items:{blast:3,ward:1,tonic:2}};return s;};
test('rest purchase availability agrees with domain funds, healing, capacity and one-purchase guards',()=>{
 for(const o of CAMP_OFFERS)for(const health of [30,98,100])for(const count of [0,7,8,9])for(const amount of [0,o.cost-1,o.cost])for(const bought of [false,true]){
  const s=profile();s.run.health=health;s.run.items.ward=count;s.run.items.blast=count;s.run.materials[o.material]=amount;if(bought)s.run.rest.bought=[o.id];
  const before=structuredClone(s.run),view=restServiceView(s),offer=view.offers.find(x=>x.id===o.id),draft=structuredClone(s),accepted=buyCamp(draft,o.id);
  assert.equal(offer.available,accepted,JSON.stringify({id:o.id,health,count,amount,bought}));assert.deepEqual(s.run,before);
  if(accepted){assert.equal(draft.run.materials[o.material],amount-o.cost);assert.equal(o.id==='heal'?draft.run.health:draft.run.items[o.id],offer.after);}
 }
});
test('three preparations spend run fragments once, keep the bank and reject repeat purchase',()=>{
 const s=profile(),bank=s.bank;for(const o of CAMP_OFFERS){assert.ok(buyCamp(s,o.id));assert.equal(buyCamp(s,o.id),false);}
 assert.deepEqual(s.run.materials,[8,3,7,10]);assert.equal(s.run.health,78);assert.equal(s.run.items.ward,3);assert.equal(s.run.items.blast,5);assert.equal(s.bank,bank);assert.ok(restServiceView(s).offers.every(o=>o.bought&&!o.available));
});
test('recovery is not a shop or an extra heal and keeps native combo and four-pulse protection',()=>{
 const s=profile();s.run.rest=null;s.run.recovery={active:true,reserve:'health'};s.run.health=30;s.run.acted=12;s.run.beat=11;
 const v=restServiceView(s);assert.equal(v.recovery,true);assert.deepEqual(v.offers,[]);assert.equal(v.health,30);assert.equal(v.combo,147);assert.equal(v.maxHealth,maxHealth(s));assert.equal(v.canRebuild,true);
 assert.ok(resumeRecovery(s));assert.equal(s.run.combo,147);assert.equal(s.run.health,30);assert.equal(s.run.guardUntil,16);assert.equal(restServiceView(s),null);
});
