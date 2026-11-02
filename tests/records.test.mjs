import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState} from '../dist/core.js';
import {RECORDS,buyRecord,equipRecord,floorRecordDrop,missionRecordDrop} from '../dist/records.js';
import {recordsMarkup} from '../dist/records-view.js';
import {Music} from '../dist/audio.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';
import {claimMission,missionOffers} from '../dist/missions.js';

test('old saves gain the starter disc; malformed collections cannot erase or duplicate purchases',()=>{
 const old=createState(71);delete old.records;
 const restored=restoreState(JSON.stringify(old));assert.deepEqual(restored.records,{owned:['pulse'],active:'pulse'});
 const invalid=createState(71);invalid.records={owned:['pulse','pulse'],active:'pulse'};
 assert.equal(restoreState(JSON.stringify(invalid)),null);
});

test('records spend stars once and equip only in the village',()=>{
 const s=createState(11),disc=RECORDS.find(r=>r.id==='iron');
 s.stars=disc.cost-1;assert.equal(buyRecord(s,disc.id),false);
 s.stars++;assert.equal(buyRecord(s,disc.id),true);assert.equal(s.stars,0);
 assert.equal(buyRecord(s,disc.id),false);assert.equal(s.records.active,disc.id);
 assert.equal(equipRecord(s,'pulse'),true);s.run={};assert.equal(equipRecord(s,disc.id),false);
});

test('a boss-floor disc has a deterministic rare roll and never drops twice',()=>{
 const s=createState(27);let winningSeed;
 for(let seed=0;seed<10000;seed++){const probe=createState(27);if(floorRecordDrop(probe,5,seed)){winningSeed=seed;break;}}
 assert.notEqual(winningSeed,undefined);
 const first=floorRecordDrop(s,5,winningSeed);assert.equal(first.id,'iron');
 assert.equal(floorRecordDrop(s,5,winningSeed),null);
 assert.equal(floorRecordDrop(s,4,winningSeed),null);
 assert.equal(restoreState(JSON.stringify(s)).records.owned.includes('iron'),true);
});

test('mission disc roll is rare, tied to delivery, and does not reroll an owned disc',()=>{
 const s=createState(19);let winningId;
 for(let i=0;i<10000;i++){
  const probe=createState(19),mission={id:'gold:'+i,tier:'gold'};
  if(missionRecordDrop(probe,mission)){winningId=mission.id;break;}
 }
 assert.ok(winningId);
 const disc=missionRecordDrop(s,{id:winningId,tier:'gold'});
 assert.ok(disc);assert.equal(missionRecordDrop(s,{id:winningId,tier:'gold'}),null);
 const offer=missionOffers(s)[0];s.mission={...offer,status:'ready',progress:offer.goal};
 assert.equal(claimMission(s,offer.id),true);
 assert.equal(s.mission,null);
 assert.ok(s.bank>30);
});
test('every disc can be previewed without buying or equipping it',()=>{
 const s=createState(42),before=structuredClone(s.records),stars=s.stars,html=recordsMarkup(s);
 assert.equal((html.match(/data-record-preview=/g)||[]).length,RECORDS.length);
 assert.match(html,/data-record-preview="iron"[^>]*>▶ OUVIR 5s/);
 assert.deepEqual(s.records,before);assert.equal(s.stars,stars);
 assert.match(recordsMarkup(s,'ROCK','iron'),/previewing/);
 assert.match(recordsMarkup(s,'ROCK','iron'),/■ PARAR/);
});
test('five-second preview plays the chosen arrangement and restores the equipped disc',()=>{
 const m=new Music(),notes=[];m.enabled=true;m.ctx=homeAudioContext(10);m.master={gain:{setTargetAtTime(){}}};m.tone=(...args)=>notes.push(args);m.noise=()=>{};
 assert.equal(m.previewRecord('missing'),false);assert.equal(m.previewRecord('iron'),true);
 assert.equal(m.record.id,'pulse');assert.equal(m.preview.until,15);
 m.home(0,true);assert.equal(m.track,3);assert.equal(m.record.id,'pulse');assert.ok(notes.some(n=>n[2]==='sawtooth'));
 m.ctx.currentTime=14.9;m.home(0,true);assert.equal(m.preview.record.id,'iron');
 m.ctx.currentTime=15;m.home(0,true);assert.equal(m.preview,null);assert.equal(m.track,'home');assert.equal(m.record.id,'pulse');
 assert.equal(m.previewRecord('aria'),true);m.silence();assert.equal(m.preview,null);
});
