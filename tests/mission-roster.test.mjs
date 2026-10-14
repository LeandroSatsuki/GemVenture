import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import * as Q from '../dist/missions.js';
import {missionSlots,nextMissionSlot,upgradeBuilding} from '../dist/village.js';

function contract(template,goal=5,remaining=120){return{id:'test-'+template,template,tier:'common',goal,progress:0,remaining,duration:240,status:'active'};}
function roster(){const s=E.createState(713);s.village.missions=150;s.mission=contract('miner');s.extraMissions=[contract('quartz'),contract('hunter'),contract('combo'),contract('beats')];return s;}

test('one initial slot, another each thirty levels, at most five through level 150',()=>{
 const s=E.createState();
 for(const [level,count,next] of [[1,1,30],[29,1,30],[30,2,60],[59,2,60],[60,3,90],[89,3,90],[90,4,120],[119,4,120],[120,5,null],[149,5,null],[150,5,null]]){
  s.village.missions=level;assert.equal(missionSlots(s),count);assert.equal(nextMissionSlot(s),next);
 }
 s.village.missions=29;s.bank=1e8;s.materials.fill(1e6);assert.ok(Q.acceptMission(s,Q.missionOffers(s)[0].id));
 const before=structuredClone(Q.missionList(s));assert.ok(upgradeBuilding(s,'missions'));assert.equal(missionSlots(s),2);assert.deepEqual(Q.missionList(s),before);
});

test('every level accepts only its capacity; renewed offers exclude all saved contracts and reject stale clicks',()=>{
 for(let level=1;level<=150;level++){
  const s=E.createState(level);s.village.missions=level;
  for(let i=0;i<missionSlots(s);i++){
   const offers=Q.missionOffers(s),offer=offers[0],previous=structuredClone(Q.missionList(s));
   assert.ok(Q.acceptMission(s,offer.id));assert.deepEqual(Q.missionList(s).slice(0,i),previous);
   assert.equal(Q.acceptMission(s,offer.id),false,'double click cannot accept stale offer');
   const current=Q.missionList(s);assert.equal(current.length,i+1);assert.notEqual(current[i].reward,offer.reward);
   assert.ok(Q.missionOffers(s).every(o=>!current.some(m=>m.template===o.template)));
  }
  assert.equal(Q.acceptMission(s,Q.missionOffers(s)[0].id),false);
  const copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.deepEqual(Q.missionList(copy),Q.missionList(s));assert.deepEqual(Q.missionOffers(copy),Q.missionOffers(s));
 }
});

test('shared actions advance relevant contracts in both modes; clocks pause at death and reload',()=>{
 for(const mode of ['floors','abyss']){
  const s=roster();s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];assert.ok(E.startRun(s,mode));
  Q.recordMission(s,'mine',2,0);Q.recordMission(s,'kill',1,1);Q.recordMission(s,'combo',3);Q.recordMission(s,'combo',2);Q.recordMission(s,'beat',1);
  assert.deepEqual(Q.missionList(s).map(m=>m.progress),[2,2,1,3,1]);
  Q.tickMission(s,10);assert.ok(Q.missionList(s).every(m=>m.remaining===110));
  s.run.room.cleared=true;Q.tickMission(s,10);assert.ok(Q.missionList(s).every(m=>m.remaining===110));s.run.room.cleared=false;
  E.finishRun(s,'death');const before=structuredClone(Q.missionList(s));Q.tickMission(s,1e6);Q.recordMission(s,'mine',999,0);assert.deepEqual(Q.missionList(s),before);
  const copy=E.restoreState(JSON.stringify(s));assert.ok(copy);assert.deepEqual(Q.missionList(copy),before);E.startRun(copy,mode);Q.recordMission(copy,'mine',3,0);
  assert.deepEqual(Q.missionList(copy).map(m=>m.status),['ready','ready','active','active','active']);
  Q.tickMission(copy,10);assert.deepEqual(Q.missionList(copy).map(m=>m.remaining),[110,110,100,100,100]);
 }
});

test('each delivery pays only its contract once and rerolls without collecting other completed missions',()=>{
 const s=roster();for(const m of Q.missionList(s)){m.progress=m.goal;m.status='ready';}
 const ids=Q.missionList(s).map(m=>m.id),before=Q.missionOffers(s);E.startRun(s);assert.equal(Q.claimMission(s,ids[2]),false);E.finishRun(s);
 const bank=s.bank,essence=s.essence;assert.ok(Q.claimMission(s,ids[2]));assert.equal(s.bank,bank+200);assert.equal(s.essence,essence+1);assert.equal(s.missionsCompleted,1);
 assert.equal(Q.missionList(s).length,4);assert.ok(Q.missionList(s).every(m=>m.status==='ready'));assert.notDeepEqual(Q.missionOffers(s),before);
 assert.equal(Q.claimMission(s,ids[2]),false);const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(Q.claimMission(t,ids[2]),false);
 for(const id of ids.filter(id=>id!==ids[2]))assert.ok(Q.claimMission(t,id));
 assert.equal(t.bank,bank+1000);assert.equal(t.essence,essence+5);assert.equal(t.missionsCompleted,5);assert.equal(t.mission,null);assert.deepEqual(t.extraMissions,[]);
});

test('expired contracts free capacity, deadlines are independent and removing a contract preserves the others',()=>{
 const s=roster();s.mission.remaining=.1;E.startRun(s);Q.tickMission(s,1);assert.equal(s.mission.status,'expired');assert.ok(s.extraMissions.every(m=>m.status==='active'));
 E.finishRun(s);const others=structuredClone(s.extraMissions);assert.ok(Q.acceptMission(s,Q.missionOffers(s)[0].id));assert.deepEqual(Q.missionList(s).slice(0,4),others);
 const second=Q.missionList(s)[1],offers=structuredClone(Q.missionOffers(s));assert.ok(Q.abandonMission(s,second.id));assert.equal(Q.missionList(s).length,4);assert.deepEqual(Q.missionOffers(s),offers);
 s.mission.status='ready';s.mission.progress=s.mission.goal;assert.equal(Q.abandonMission(s,s.mission.id),false);
});

test('old single-contract saves migrate; invalid or duplicate rosters and reroll counters are rejected',()=>{
 const old=E.createState(74);old.mission=contract('miner');delete old.extraMissions;delete old.missionRoll;
 const migrated=E.restoreState(JSON.stringify(old));assert.deepEqual(migrated.mission,old.mission);assert.deepEqual(migrated.extraMissions,[]);assert.equal(migrated.missionRoll,0);
 const s=roster();assert.ok(E.restoreState(JSON.stringify(s)));
 for(const change of [x=>x.extraMissions.push(contract('points')),x=>x.extraMissions[0]={...x.mission},x=>x.extraMissions[0].id=x.mission.id,x=>x.extraMissions[0].remaining=-1,x=>x.missionRoll=-1,x=>x.missionRoll=1.5,x=>x.extraMissions=null,x=>x.village.missions=1]){
  const invalid=structuredClone(s);change(invalid);assert.equal(E.restoreState(JSON.stringify(invalid)),null);
 }
});
