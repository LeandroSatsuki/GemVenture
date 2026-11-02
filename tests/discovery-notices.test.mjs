import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {floorRecordDrop,RECORDS} from '../dist/records.js';
import {recordPetProgress} from '../dist/pet-bonds.js';
import {PET_CATALOG} from '../dist/home-collection.js';
import {DiscoveryQueue,discoveryNotice,discoverySlot,DISCOVERY_HOLD_MS} from '../dist/discovery-notices.js';

function earned(){
 const s=E.createState(43);E.startRun(s);let record;
 for(let seed=0;seed<5000&&!record;seed++)record=floorRecordDrop(s,5,seed);
 assert.equal(record?.id,'iron');s.descent.bosses=[10];s.petBonds.progress.safeReturns=10;
 const pets=recordPetProgress(s);assert.ok(pets.some(e=>e.type==='petUnlocked'&&e.id==='slime-friend'));
 return {s,events:[{type:'recordDrop',id:record.id,name:record.name},...pets]};
}
test('real ownership events retain catalog names/art; notices do not pay, equip, select or mutate the profile',()=>{
 const {s,events}=earned(),before=JSON.stringify(s),q=new DiscoveryQueue();assert.equal(q.accept(events,s),2);
 assert.equal(q.peek.name,'Ferro em Brasa');assert.match(q.peek.art,/iron\.webp$/);q.advance(0);q.advance(1000);
 q.advance(DISCOVERY_HOLD_MS);q.advance(0);assert.equal(q.current.name,'Pingô');assert.match(q.current.art,/pingo\/presentation\/pose\.png$/);
 assert.equal(JSON.stringify(s),before);assert.equal(s.records.active,'pulse');assert.equal(s.run.petId,null);
});
test('queue preserves confirmed batch order, freezes during pause/cards and does not replay duplicates after expiry',()=>{
 const {s,events}=earned(),q=new DiscoveryQueue();assert.equal(q.accept(events,s),2);assert.equal(q.accept(events,s),0);
 q.advance(9000,{blocked:true});assert.equal(q.current,null);assert.equal(q.pendingCount,2);
 q.advance(0);q.advance(700);const remaining=q.remainingMs;q.advance(5000,{blocked:true});assert.equal(q.remainingMs,remaining);
 q.advance(remaining);assert.equal(q.current,null);q.advance(0);assert.equal(q.current.kind,'pet');assert.equal(q.remainingMs,3200);
 q.advance(3200);assert.equal(q.peek,null);assert.equal(q.accept(events,s),0);
});
test('restoration never infers discovery from existing ownership; unknown, premature and merely discovered pets are ignored',()=>{
 const {s,events}=earned(),loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);const q=new DiscoveryQueue();q.setProfile(loaded);assert.equal(q.peek,null);
 assert.equal(q.accept([{type:'petDiscovered',id:'bat-friend'},{type:'petUnlocked',id:'bat-friend'},{type:'recordDrop',id:'missing'}],loaded),0);
 assert.equal(discoveryNotice({type:'recordDrop',id:'iron',name:'<script>wrong</script>'},loaded).name,'Ferro em Brasa');
 q.accept(events,s);q.setProfile(loaded);assert.equal(q.peek,null);assert.equal(q.pendingCount,0);
});
test('all current collectibles have canonical presentation; repeated batches remain catalog-bounded',()=>{
 const s=E.createState(43);s.records.owned=RECORDS.map(r=>r.id);s.homeCollection.pets=PET_CATALOG.map(p=>p.id);
 const events=[...RECORDS.map(r=>({type:'recordDrop',id:r.id})),...PET_CATALOG.map(p=>({type:'petUnlocked',id:p.id}))],q=new DiscoveryQueue();
 assert.equal(q.accept(events,s),events.length);for(let i=0;i<100;i++)q.accept(events,s);assert.equal(q.pendingCount,events.length);
 for(const e of events)assert.ok(discoveryNotice(e,s)?.art);
});
test('left-side slot avoids orb, hint, inputs and the action area; crowded layouts defer without covering information',()=>{
 const obstacles=[{left:12,right:228,top:12,bottom:125},{left:12,right:240,top:142,bottom:183},{left:12,right:232,top:196,bottom:301},{left:500,right:900,top:200,bottom:600}];
 const slot=discoverySlot({width:1280,height:720,noticeWidth:312,noticeHeight:88,obstacles});assert.deepEqual(slot,{left:12,top:311});
 assert.equal(discoverySlot({width:320,height:400,noticeWidth:180,noticeHeight:100,obstacles:[{left:0,right:320,top:0,bottom:350}]}),null);
 assert.deepEqual(discoverySlot({width:853,height:480,noticeWidth:230,noticeHeight:90,left:274,obstacles:[{left:32,right:821,top:32,bottom:126},{left:32,right:255,top:142,bottom:480}]}),{left:274,top:136});
 assert.equal(discoverySlot({width:160,height:400,noticeWidth:180,noticeHeight:100}),null);
});
