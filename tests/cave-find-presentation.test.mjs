import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {approvedCaveFindTip,placeApprovedCaveFindTip} from '../dist/approved-cave-find-tip.js';
import {caveGuardView} from '../dist/cave-find-hud.js';
import {chestReward,comboGuardRemaining,FIND_RULES} from '../dist/cave-finds.js';

test('chest presentation uses the saved cut gem and exact amount without leaking an optional rare disc',()=>{
 for(const floor of [1,6,11,16,21,26,31]){
  const reward=chestReward(81,floor,3),find={kind:'chest',reward:{...reward,record:'secret-unrevealed-record'}};
  const before=JSON.stringify(find),html=approvedCaveFindTip({floor},find);
  assert.match(html,new RegExp('gem-'+reward.kind+'\\.png'));assert.ok(html.includes('+'+reward.amount));
  assert.doesNotMatch(html,/secret|record|<button|saldo|necessário/i);assert.equal(JSON.stringify(find),before);
 }
 assert.equal(approvedCaveFindTip({}, {kind:'heal'}),'');
 assert.equal(approvedCaveFindTip({}, {kind:'combo'}),'');
 assert.equal(approvedCaveFindTip({}, {kind:'chest',used:true}),'');
});
test('protection presentation follows the real owner clock, remains stable when phase is frozen and hides on clear/expiry',()=>{
 const s=E.createState(43);E.startRun(s);const run=s.run;run.beat=0;
 run.findState={version:1,elapsed:2,comboUntil:2+FIND_RULES.comboSeconds};
 const before=JSON.stringify(run),a=caveGuardView(run,run.beat),b=caveGuardView(run,run.beat+.5);
 assert.equal(a.hidden,false);assert.equal(a.fraction,1);assert.equal(a.label,'10 s');
 assert.equal(b.seconds,comboGuardRemaining(run,run.beat+.5));assert.ok(b.seconds<a.seconds);
 assert.deepEqual(caveGuardView(run,run.beat+.5),b);assert.equal(JSON.stringify(run),before);
 run.findState.comboUntil=run.findState.elapsed;assert.equal(caveGuardView(run,run.beat).hidden,true);
 run.findState.comboUntil=20;run.room.cleared=true;assert.equal(caveGuardView(run,run.beat).hidden,true);
 assert.equal(caveGuardView(null).hidden,true);
});

test('leaving the clean HUD respects its owner restoring the hint; chest mounting never replaces the original return anchor',()=>{
 const parent=()=>({isConnected:true,append(node){node.parentNode=this;},insertBefore(node){node.parentNode=this;}});
 const legacy=parent(),hud=parent(),refuge=parent(),classes=new Set();
 const tip={parentNode:legacy,nextSibling:null,ownerDocument:{querySelector:()=>hud},classList:{toggle(name,on){on?classes.add(name):classes.delete(name);}}};
 placeApprovedCaveFindTip(tip,{kind:'chest'});assert.equal(tip.parentNode,hud);
 placeApprovedCaveFindTip(tip,{kind:'chest'});placeApprovedCaveFindTip(tip,null);assert.equal(tip.parentNode,legacy);
 placeApprovedCaveFindTip(tip,{kind:'chest'});refuge.append(tip);placeApprovedCaveFindTip(tip,null);
 assert.equal(tip.parentNode,refuge);assert.equal(classes.has('approved-cave-find-tip'),false);
});
