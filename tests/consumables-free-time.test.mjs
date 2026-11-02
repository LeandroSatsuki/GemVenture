import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {rectangularRoom} from './helpers/rectangular-room.mjs';
import {missionTerms,validMission} from '../dist/missions.js';
import {bindConsumableButton} from '../dist/consumable-input.js';
import {createTraining,actTraining,setTrainingPaused,prepareTrainingScene,configureTrainingLesson,advanceTraining,exportTraining,restoreTraining} from '../dist/tutorial-training.js';
function arena(){const s=E.createState(2201);E.startRun(s);rectangularRoom(s,{player:{x:5,y:7}});Object.assign(s.run.room,{quota:99999,wave:null,minBeats:0});s.run.items={blast:9,tonic:9,ward:9};s.run.combo=7;s.run.rhythm=70;return s;}
const use=(s,item,phase,inputEvent)=>E.act(s,{type:'item',item,inputEvent},phase);
const rhythm=r=>Object.fromEntries(['beat','acted','missed','combo','peak','rhythm','cardHits','novaSpent','enemyBeat'].map(k=>[k,r[k]]));
const assignment=template=>({id:template,template,tier:'common',goal:100,progress:0,remaining:120,duration:240,status:'active'});
const enemy=(x=6,y=7)=>({id:80,type:'enemy',kind:0,x,y,hp:100,maxHp:100,stunUntil:-1,windup:null});
const crystal=(x=6,y=7)=>({id:90,type:'crystal',kind:0,x,y,hp:100,maxHp:100,value:5,born:0});
for(const item of ['blast','tonic','ward'])for(const phase of [3.6,4,4.4])test(`${item} immediate at phase ${phase}; no rhythmic state, accuracy score or mission`,()=>{
 const s=arena(),r=s.run;s.mission=assignment('beats');r.health=20;const before=rhythm(r),score=r.score.points,health=r.health;
 assert.equal(use(s,item,phase).ok,true);assert.equal(r.items[item],8);assert.deepEqual(rhythm(r),before);assert.equal(r.score.points,score);assert.equal(s.mission.progress,0);
 assert.equal(r.events.some(e=>['hurt','perfect','dash'].includes(e.type)),false);assert.equal(r.events.filter(e=>e.type==='consumableUsed').length,1);
 if(item==='tonic')assert.equal(r.health,Math.min(E.maxHealth(s),health+E.tonicHealing(s)));
 if(item==='ward')assert.equal(r.guardUntil,phase+3);
});
for(const item of ['blast','tonic','ward'])for(const type of ['move','hit'])for(const itemFirst of [true,false])test(`${item} + ${type}, item first=${itemFirst}, independent action IDs`,()=>{
 const s=arena(),r=s.run;r.room.nodes=[crystal()];const action=type==='hit'?{type,id:90}:{type,x:5,y:8};
 if(itemFirst)assert.equal(use(s,item,4.4).ok,true);
 assert.equal(E.act(s,action,4).ok,true);
 if(!itemFirst)assert.equal(use(s,item,4.4).ok,true);
 assert.equal(r.acted,4);assert.equal(r.combo,8);assert.equal(r.items[item],8);
 const events=r.events.filter(e=>e.type==='playerActionResolved');assert.equal(events.length,2);assert.equal(new Set(events.map(e=>e.id)).size,2);assert.equal(r.events.filter(e=>e.type==='perfect').length,1);
 if(type==='move')assert.deepEqual(r.player,{x:5,y:8});else assert.ok(r.room.nodes[0].hp<100);
});
test('item works even on an already missed beat; the next rhythmic hit still obeys timing',()=>{
 const s=arena();E.act(s,{type:'move',...s.run.player},4.4);assert.equal(s.run.missed,4);const before=rhythm(s.run);
 assert.equal(use(s,'tonic',4.4).ok,true);assert.deepEqual(rhythm(s.run),before);assert.equal(E.act(s,{type:'move',...s.run.player},5.4).miss,true);
});
test('same input event and repeat consume once; distinct presses in the same phase have no cooldown',()=>{
 const s=arena(),input={};assert.equal(use(s,'tonic',4.4,input).ok,true);assert.equal(use(s,'tonic',4.4,input).duplicate,true);assert.equal(use(s,'tonic',4.4,{repeat:true}).duplicate,true);assert.equal(s.run.items.tonic,8);
 assert.equal(use(s,'tonic',4.4,{}).ok,true);assert.equal(use(s,'tonic',4.4,{}).ok,true);assert.equal(s.run.items.tonic,6);
});
test('button Enter/Space repeats and native keyup do not duplicate charge; click event forwarding deduplicates',()=>{
 const s=arena(),button={disabled:false},activate=input=>use(s,'tonic',4.4,input);bindConsumableButton(button,activate);
 const key=(code,repeat=false)=>({code,repeat,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}});
 const enter=key('Enter');button.onkeydown(enter);assert.ok(enter.prevented&&enter.stopped);for(let i=0;i<12;i++)button.onkeydown(key('Enter',true));button.onkeyup(key('Enter'));
 assert.equal(s.run.items.tonic,8);button.onkeydown(key('Space'));button.onkeyup(key('Space'));assert.equal(s.run.items.tonic,7);
 const click={};button.onclick(click);button.onclick(click);assert.equal(s.run.items.tonic,6);button.disabled=true;button.onclick({});assert.equal(s.run.items.tonic,6);
});
for(const mode of ['empty','cleared','recovery','rest','choice','ended'])test(`blocked ${mode}: no effects or charges`,()=>{
 const s=arena(),r=s.run;
 if(mode==='empty')r.items={blast:0,tonic:0,ward:0};if(mode==='cleared')r.room.cleared=true;if(mode==='recovery')r.recovery={active:true};if(mode==='rest')r.rest={active:true};if(mode==='choice')r.abyss={cardChoice:{offers:[]}};if(mode==='ended')s.run=null;
 const before=JSON.stringify(r);for(const item of ['blast','tonic','ward'])assert.equal(use(s,item,4.4).ok,false);assert.equal(JSON.stringify(r),before);
});
test('enemy clock continues and fractional shield duration blocks only the existing three-pulse interval',()=>{
 const s=arena(),r=s.run,e=enemy(12);r.room.enemies=[e];use(s,'ward',4.4);assert.equal(r.guardUntil,7.4);E.enemyBeat(s,4);assert.equal(e.x,11);E.enemyBeat(s,5);assert.equal(e.x,10);
 for(const beat of [6,7,8]){e.windup={...r.player,beat,radius:0,kind:'acid'};E.act(s,{type:'move',...r.player},beat);const health=r.health;E.tick(s,beat);if(beat<8)assert.equal(r.health,health);else assert.ok(r.health<health);}
});
test('empty bomb counts activation only; valid damage and interactive activation each count one effective bomb',()=>{
 const s=arena(),r=s.run;s.mission=assignment('items');s.extraMissions=[assignment('bombs'),assignment('cures')];const [bombs,cures]=s.extraMissions;
 use(s,'blast',4.4);assert.equal(s.mission.progress,1);assert.equal(bombs.progress,0);
 r.room.nodes=[crystal()];r.room.rocks=[{id:91,type:'rock',kind:0,x:7,y:7,hp:100,maxHp:100}];use(s,'blast',4.4);assert.equal(s.mission.progress,2);assert.equal(bombs.progress,1);assert.ok(r.room.nodes[0].hp<100&&r.room.rocks[0].hp<100);
 r.room.nodes=[];r.room.rocks=[];r.room.caveFinds=[{id:'find:'+r.room.seed+':0',type:'caveFind',number:0,kind:'combo',x:6,y:7,hp:1,maxHp:1,used:false}];use(s,'blast',4.4);assert.equal(bombs.progress,2);assert.equal(r.room.caveFinds[0].used,true);use(s,'blast',4.4);assert.equal(bombs.progress,2);assert.equal(cures.progress,0);
});
test('full health consumes potion; partial actual healing alone advances cure mission and survives save',()=>{
 const s=E.createState(91);E.startRun(s);const r=s.run;r.items.tonic=3;s.mission=assignment('cures');
 use(s,'tonic',4.4);assert.equal(s.mission.progress,0);assert.equal(r.items.tonic,2);assert.equal(r.events.findLast(e=>e.type==='heal').value,0);
 r.health=E.maxHealth(s)-1.25;use(s,'tonic',4.4);assert.equal(s.mission.progress,1.25);assert.equal(r.events.findLast(e=>e.type==='heal').value,1.25);assert.ok(validMission(s.mission));
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.mission.progress,1.25);assert.equal(restored.run.items.tonic,1);assert.equal(restored.run.events.length,0);
});
test('readiness emitted once; existing terms and progress are retained',()=>{
 const s=arena();s.mission={...assignment('bombs'),goal:1};s.run.room.nodes=[crystal()];use(s,'blast',4.4);use(s,'blast',4.4);assert.equal(s.mission.status,'ready');assert.equal(s.run.events.filter(e=>e.type==='missionReady').length,1);
 for(const id of ['items','bombs','cures'])assert.equal(missionTerms(id,'common',1).reward.gems,250);
});
test('blast retains Manhattan radius, boss invulnerability and shared damage ceiling',()=>{
 const s=arena(),r=s.run;r.room.nodes=[crystal(8,7),{...crystal(8,8),id:91}];use(s,'blast',4.4);assert.equal(r.room.nodes[0].hp,97);assert.equal(r.room.nodes[1].hp,100);
 for(const bossIndex of [4,5,6]){const t=arena(),boss={...enemy(),boss:true,bossIndex,exposedUntil:-1,...(bossIndex===5?{windup:{}}:{})};t.run.room.enemies=[boss];t.mission=assignment('bombs');use(t,'blast',4.4);assert.equal(boss.hp,100);assert.equal(t.mission.progress,0);}
 const t=arena(),boss={...enemy(),boss:true,bossIndex:1,exposedUntil:20};t.run.room.enemies=[boss];t.run.items.blast=9;for(let i=0;i<9;i++)use(t,'blast',4.4,{});assert.equal(boss.hp,91);assert.equal(boss.damageTaken,9);assert.equal(E.act(t,{type:'hit',id:boss.id},4).ok,true);assert.equal(boss.hp,91);
});
test('bomb uses current combat beat, not stale last action, and cannot reopen expired star scoring',()=>{
 const s=arena(),r=s.run;r.acted=4;r.beat=4;r.room.scoreBeats=5;r.room.nodes=[crystal()];use(s,'blast',9.4);assert.equal(r.score.points,0);assert.deepEqual([r.acted,r.beat],[4,4]);assert.ok(r.room.nodes[0].hp<100);
 const t=arena(),boss={...enemy(),boss:true,bossIndex:6,exposedUntil:5};t.run.room.enemies=[boss];t.run.acted=4;t.run.beat=4;use(t,'blast',9.4);assert.equal(boss.hp,100);
});
test('training pause blocks use; accepted consumables do not advance the five-hit lesson and replay once',()=>{
 const t=createTraining();prepareTrainingScene(t,'practice');configureTrainingLesson(t,'heal');const before=t.state.run.items.tonic;
 assert.equal(actTraining(t,{type:'item',item:'tonic'}).result.ok,false);assert.equal(t.state.run.items.tonic,before);
 setTrainingPaused(t,false);advanceTraining(t,.24);const input={};assert.equal(actTraining(t,{type:'item',item:'tonic',inputEvent:input}).result.ok,true);assert.equal(actTraining(t,{type:'item',item:'tonic',inputEvent:input}).result.duplicate,true);assert.equal(t.consecutive,0);assert.equal(t.practicedFive,false);
 const restored=restoreTraining(exportTraining(t));assert.ok(restored);assert.equal(restored.state.run.items.tonic,t.state.run.items.tonic);assert.equal(restored.state.run.health,t.state.run.health);assert.equal(restored.consecutive,0);
});
