import test from 'node:test';
import assert from 'node:assert/strict';
import {createState} from '../dist/core.js';
import {createAccountScore,initializeAccountScore,beginAccountRun,recordAccountAward,endAccountRun,accountScoreView,THRESHOLDS} from '../dist/account-score.js';
import {statuePresentation} from '../dist/approved-statue-ui.js';
import {approvedLiftView} from '../dist/approved-lift-ui.js';
import {MISSION_TYPES} from '../dist/missions.js';
import {OBJECTIVE_ART,missionObjectiveArt} from '../dist/hud-art.js';
test('statue presentation reads all seven genuine score tiers without claiming promotions or mutating profile',()=>{
 for(const total of [...THRESHOLDS,29999,31000,12480000]){
  const s=createState(712);s.accountScore=createAccountScore({id:'statue-qa-0001'});s.run={mode:'floors',score:{points:0}};beginAccountRun(s);if(total)recordAccountAward(s,{runId:s.accountScore.current.id,mode:'floors',source:'gameplay',amount:total,rawTotal:total,beat:8,acted:8});endAccountRun(s);s.run=null;
  const before=JSON.stringify(s),v=accountScoreView(s),p=statuePresentation(v);assert.equal(p.total,total);assert.equal(p.stage,v.tier+1);assert.equal(p.fill,v.fill);assert.equal(p.max,v.next===null);assert.match(p.portrait,/statue-family-v1/);assert.equal(JSON.stringify(s),before);assert.equal(s.accountScore.ackTier,0);
 }
 assert.equal(statuePresentation(null),null);
});
test('approved lift uses real discovery, costs, stops, gate and preparedness without changing player state',()=>{
 for(const best of [0,1,5,20,35])for(const selected of [1,2,5,20,35]){
  const s=createState(712);s.best=best;s.seals=Math.min(6,Math.floor(best/5));s.materials=[0,12,400,5000];const before=JSON.stringify(s),v=approvedLiftView(s,selected);
  assert.equal(JSON.stringify(s),before);assert.equal(v.actions.depart.enabled,v.floors.find(f=>f.actionValue===v.floor).canStart);assert.deepEqual(v.abyss.materials.map(m=>m.available),s.materials);assert.equal(v.selected.rewards.available,v.selected.reached);
 }
});
test('each live mission uses its own canonical objective family rather than a generic HUD icon',()=>{
 for(const m of MISSION_TYPES){assert.ok(OBJECTIVE_ART[m.id],m.id);assert.match(missionObjectiveArt(m.id),/<img src="assets\//);}
 assert.match(missionObjectiveArt('guardians'),/golem/);
});
