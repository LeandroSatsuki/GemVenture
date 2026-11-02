import {rectangularRoom} from './helpers/rectangular-room.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {depositEquipment} from '../dist/forge.js';
import {pickRecipe} from '../dist/materials.js';
import {commitFirstReturnReward,commitTutorialReward,commitTutorialUpgrade,tutorialRewardView} from '../dist/tutorial-reward.js';
import {firstUpgradeGoal} from '../dist/first-hour.js';
import {LearningPath} from '../dist/learning-path.js';
import {mountContextualLearning} from '../dist/contextual-learning.js';
import {createTraining,prepareTrainingScene,setTrainingPaused,advanceTraining,actTraining,finishTraining,isCompletedTraining,exportTraining,restoreTraining} from '../dist/tutorial-training.js';
const KEY='gemventure-save-v2';
function storageFor(s){const data=new Map([[KEY,JSON.stringify(s)]]);let fault='';return {data,get fault(){return fault},set fault(v){fault=v},getItem(k){if(fault==='read')throw Error('read');return data.get(k)||null;},setItem(k,v){if(fault==='backup'&&k!==KEY||fault==='write'&&k===KEY)throw Error('write');data.set(k,v);if(fault==='after'&&k===KEY)throw Error('after');}};}
const claim=(s,storage)=>commitFirstReturnReward(s,{storage,expectedRaw:JSON.stringify(s)});
function returned(seed=76,reason='retreat'){const s=E.createState(seed);E.startRun(s);E.finishRun(s,reason);s.lastResult.presented=true;return s;}
function completedTraining(){const t=createTraining();const {targets}=prepareTrainingScene(t,'exit');setTrainingPaused(t,false);for(let i=0;i<12&&!t.state.run.room.cleared;i++){if(i)for(let j=0;j<3;j++)advanceTraining(t,.2);actTraining(t,{type:'hit',id:targets.mineralId});}assert.equal(t.state.run.room.cleared,true);assert.equal(finishTraining(t).complete,true);assert.equal(isCompletedTraining(t),true);return t;}
test('one shared receipt funds only the live first upgrade gap including deposited coins',()=>{
 const s=returned();depositEquipment(s,'pickaxe',20);const bank=s.bank,funded=s.forge.funds.pickaxe;s.materials=[1,1,0,0];const store=storageFor(s),view=tutorialRewardView(s),out=claim(s,store);
 assert.equal(out.ok,true);assert.equal(out.grant.coins,Math.max(0,E.upgradeCost(s)-bank-funded));assert.deepEqual(out.grant.materials,pickRecipe(s).map((v,i)=>Math.max(0,v-[1,1,0,0][i])));assert.equal(s.forge.funds.pickaxe,funded);assert.equal(firstUpgradeGoal(s).ready,true);
 const once=JSON.stringify(s);assert.equal(claim(s,store).status,'already-claimed');assert.equal(JSON.stringify(s),once);assert.ok(view.eligible);
 const restored=E.restoreState(store.getItem(KEY));assert.ok(restored);assert.equal(claim(restored,store).status,'already-claimed');
 const buy=commitTutorialUpgrade(restored,{storage:store,expectedRaw:JSON.stringify(restored)});assert.equal(buy.ok,true);assert.equal(restored.level,2);assert.equal(restored.forge.funds.pickaxe,0);assert.equal(store.getItem(KEY),JSON.stringify(restored));
});
test('short practice, skipped practice and full course share the same campaign benefit',()=>{
 for(const route of ['short','skip','full']){const s=returned();const store=storageFor(s);if(route==='short'){const t=createTraining();setTrainingPaused(t,false);assert.equal(actTraining(t,{type:'hit'}).result.ok,true);finishTraining(t,{skipped:true});assert.equal(commitTutorialReward(s,t,{storage:store,expectedRaw:JSON.stringify(s)}).ok,false);}if(route==='full'){const t=completedTraining();assert.equal(commitTutorialReward(s,t,{storage:store,expectedRaw:JSON.stringify(s)}).ok,true);}assert.equal(claim(s,store).ok,true);assert.equal(s.bank,E.upgradeCost(s));assert.deepEqual(s.materials,pickRecipe(s));assert.equal(s.tutorialIntro.reward.targetLevel,2);}
});
test('full course after first return, repeated course and interrupted checkpoint never double the grant',()=>{
 const s=returned(),store=storageFor(s);claim(s,store);const before=JSON.stringify(s),t=completedTraining();for(let i=0;i<3;i++)assert.equal(commitTutorialReward(s,t,{storage:store,expectedRaw:JSON.stringify(s)}).status,'already-claimed');assert.equal(JSON.stringify(s),before);
 const interrupted=createTraining();setTrainingPaused(interrupted,false);actTraining(interrupted,{type:'hit'});const restored=restoreTraining(exportTraining(interrupted));assert.ok(restored);assert.equal(isCompletedTraining(restored),false);
});
test('safe return, retreat and death qualify after collection without requiring a floor clear',()=>{
 for(const reason of ['return','retreat','death']){const s=returned(22,reason),store=storageFor(s);s.lastResult.presented=false;store.data.set(KEY,JSON.stringify(s));assert.equal(claim(s,store).ok,false);s.lastResult.presented=true;store.data.set(KEY,JSON.stringify(s));assert.equal(claim(s,store).ok,true);}
 const s=E.createState(11),store=storageFor(s);assert.equal(claim(s,store).ok,false);E.startRun(s);store.data.set(KEY,JSON.stringify(s));assert.equal(claim(s,store).reason,'return-required');
});
test('pre-funded, already upgraded, legacy, foreign receipt and future data cannot manufacture extra credit',()=>{
 const funded=returned();funded.bank=100;funded.materials=[10,10,10,10];const store=storageFor(funded);assert.equal(claim(funded,store).status,'funded');assert.equal(funded.bank,100);funded.bank=0;store.data.set(KEY,JSON.stringify(funded));assert.equal(claim(funded,store).status,'already-claimed');assert.equal(funded.bank,0);
 const upgraded=returned();upgraded.level=2;const upStore=storageFor(upgraded),before=JSON.stringify(upgraded);assert.equal(claim(upgraded,upStore).status,'already-upgraded');assert.equal(JSON.stringify(upgraded),before);
 const old=returned();delete old.tutorialIntro;const migrated=E.restoreState(JSON.stringify(old)),oldStore=storageFor(migrated);assert.equal(claim(migrated,oldStore).status,'veteran');
 const future=returned();future.tutorialIntro={version:99,custom:'keep'};const futureStore=storageFor(future);assert.equal(claim(future,futureStore).ok,false);assert.equal(future.tutorialIntro.custom,'keep');
 const wrong=returned();wrong.tutorialIntro=structuredClone(funded.tutorialIntro);assert.equal(claim(wrong,storageFor(wrong)).ok,false);
});
test('failed backup or write changes nothing; retry/reload and throw-after-write apply exactly once',()=>{
 for(const fault of ['backup','write']){const s=returned(),store=storageFor(s),before=JSON.stringify(s);store.fault=fault;assert.equal(claim(s,store).ok,false);assert.equal(JSON.stringify(s),before);assert.equal(store.getItem(KEY),before);store.fault='';assert.equal(claim(s,store).ok,true);assert.equal(claim(s,store).status,'already-claimed');}
 const s=returned(),store=storageFor(s);store.fault='after';const out=claim(s,store);assert.equal(out.ok,true);assert.equal(out.recoveredWrite,true);store.fault='';const reload=E.restoreState(store.getItem(KEY));assert.equal(claim(reload,store).status,'already-claimed');
 const conflict=returned(),storage=storageFor(conflict),foreign=JSON.stringify({...conflict,bank:99});storage.data.set(KEY,foreign);assert.equal(claim(conflict,storage).requiresReload,true);assert.equal(storage.getItem(KEY),foreign);assert.equal(conflict.tutorialIntro.reward,null);
});
test('goal reads current gain, cost and each shortage, with no profile mutation or forced purchase',()=>{
 const s=returned(),before=JSON.stringify(s),goal=firstUpgradeGoal(s);assert.equal(goal.cost,E.upgradeCost(s));assert.deepEqual(goal.recipe,pickRecipe(s));assert.equal(goal.after,E.power({...s,level:2}));assert.equal(goal.gain,goal.after-goal.before);assert.ok(goal.lines.some(s=>s.includes('Falta:')));assert.equal(JSON.stringify(s),before);
});
test('milestones recover a first returned run without the former clear gate',()=>{
 const s=E.createState(12),path=new LearningPath(s,null,{fresh:true});path.record.phase='sound';E.startRun(s);path.observe(s);assert.equal(path.record.phase,'play');assert.equal(path.record.milestones.firstExpedition,true);E.finishRun(s,'retreat');path.observe(s);assert.equal(path.record.milestones.firstReturn,false);s.lastResult.presented=true;path.observe(s);assert.equal(path.record.phase,'return');assert.equal(path.record.milestones.firstReturn,true);assert.equal(path.record.milestones.firstClear,false);
});
function flow({s=E.createState(21),fresh=true,raw=null}={}){const storage=storageFor(s),calls=[];if(raw)storage.data.set('gemventure-learning-v1:'+s.accountScore.id,JSON.stringify(raw));let model,ui;const api=mountContextualLearning({document:{addEventListener(){},removeEventListener(){}},storage,profile:()=>s,fresh,saveProfile:()=>{storage.setItem(KEY,JSON.stringify(s));return true;},update(){},onTraining:()=>calls.push('training'),onGuide:()=>calls.push('guide'),onOpen:(id,project)=>calls.push([id,project]),onEnableSound:async()=>true,onInitialHelp:()=>claim(s,storage),createView:opts=>{ui=opts;return {render:m=>model=m,layout(){},error(){},get active(){return !!model},dispose(){}};}});let now=0;return {s,storage,calls,api,get ui(){return ui},get model(){return model},tick(extra={}){api.tick({now:now+=1000,dialogOpen:false,...extra});}};}
test('skipping introduction exposes expedition/refuge choice; guide and training remain available',async()=>{
 const a=flow();a.tick();a.ui.onLater();assert.equal(a.model.primary,'Iniciar expedição');assert.equal(a.model.secondary,'Explorar refúgio');a.ui.onLater();a.tick();assert.equal(a.model,null);assert.equal(a.api.record.phase,'play');a.api.catalog();a.ui.onGuide();assert.ok(a.calls.includes('guide'));a.api.catalog();a.ui.onTraining();assert.ok(a.calls.includes('training'));a.api.trainingFinished();a.tick();a.api.catalog();a.ui.onResume();await a.ui.onPrimary();await a.ui.onPrimary();await a.ui.onPrimary();assert.ok(a.calls.some(c=>Array.isArray(c)&&c[0]==='lift'));
});
test('return help ignores training route and hint preferences, retry is explicit and goal is optional',async()=>{
 const a=flow();a.tick();a.ui.onLater();await a.ui.onPrimary();E.startRun(a.s);a.api.record.paused=true;a.tick();E.finishRun(a.s,'death');a.s.lastResult.presented=true;a.storage.data.set(KEY,JSON.stringify(a.s));a.storage.fault='write';a.tick();assert.equal(a.s.tutorialIntro.reward,null);a.storage.fault='';a.api.catalog();assert.ok(a.s.tutorialIntro.reward);a.ui.onToggle();a.ui.onResume();assert.equal(a.model.foundation,'return');assert.equal(a.model.goal.ready,true);const level=a.s.level;a.ui.onLater();a.tick();assert.equal(a.s.level,level);assert.equal(a.model,null);a.api.catalog();a.ui.onPick('forge');assert.ok(a.model.goal);assert.equal(a.model.goal.cost,E.upgradeCost(a.s));
});

test('first campaign action and mineral are recorded from native events, not lesson clicks',()=>{
 const s=E.createState(56),p=new LearningPath(s,null,{fresh:true});E.startRun(s);p.observe(s);
 const n=[...s.run.room.nodes].sort((a,b)=>Math.abs(a.x-s.run.player.x)+Math.abs(a.y-s.run.player.y)-Math.abs(b.x-s.run.player.x)-Math.abs(b.y-s.run.player.y))[0];
 for(let beat=0;beat<40&&!p.record.milestones.firstMineral;beat++){E.act(s,{type:'hit',id:n.id},beat);p.events(s.run.events.splice(0),s);}
 assert.equal(p.record.milestones.firstAction,true);assert.equal(p.record.milestones.firstMineral,true);assert.ok(s.run.materials.some(n=>n>0));
});
test('lost learning storage recovers an eligible fresh return while legacy saves stay out of the introduction',()=>{
 const s=returned(),p=new LearningPath(s,null,{fresh:false});assert.equal(p.record.phase,'return');delete s.tutorialIntro;const legacy=E.restoreState(JSON.stringify(s));assert.equal(new LearningPath(legacy,null,{fresh:false}).record.phase,'done');
});
test('deferring forge guidance does not turn off unrelated contextual hints',async()=>{
 const a=flow();a.tick();a.ui.onLater();await a.ui.onPrimary();E.startRun(a.s);a.tick();E.finishRun(a.s);a.s.lastResult.presented=true;a.storage.data.set(KEY,JSON.stringify(a.s));a.tick();await a.ui.onPrimary();a.ui.onLater();assert.equal(a.api.record.paused,false);assert.ok(a.api.record.deferred.includes('forge'));a.tick();assert.equal(a.model,null);
});

test('first mineral requires collected crystals: coin loot alone is not mining progress',()=>{
 const s=E.createState(56),p=new LearningPath(s,null,{fresh:true});E.startRun(s);rectangularRoom(s);s.run.room.quota=99999;s.run.room.wave=null;
 s.run.room.rocks=[{id:999,type:'rock',kind:0,x:4,y:11,hp:1,maxHp:1,value:2}];E.act(s,{type:'hit',id:999},0);p.events(s.run.events.splice(0),s);
 assert.ok(s.run.bag>0);assert.equal(s.run.materials.some(n=>n>0),false);assert.equal(p.record.milestones.firstAction,true);assert.equal(p.record.milestones.firstMineral,false);
 s.run.room.nodes=[{id:998,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:2,born:0}];E.act(s,{type:'hit',id:998},1);p.events(s.run.events.splice(0),s);
 assert.equal(p.record.milestones.firstMineral,true);assert.ok(s.run.materials.some(n=>n>0));
});
test('free-time items never masquerade as the first rhythmic action; blast minerals still count as collection',()=>{
 const s=E.createState(57),p=new LearningPath(s,null,{fresh:true});E.startRun(s);rectangularRoom(s);s.run.room.quota=99999;s.run.room.wave=null;s.run.items={blast:1,tonic:1,ward:1};
 for(const item of ['tonic','ward']){E.act(s,{type:'item',item},.4);p.events(s.run.events.splice(0),s);}
 assert.equal(p.record.milestones.firstAction,false);assert.equal(p.record.milestones.firstMineral,false);
 s.run.room.nodes=[{id:998,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:2,born:0}];E.act(s,{type:'item',item:'blast'},.4);p.events(s.run.events.splice(0),s);
 assert.equal(p.record.milestones.firstAction,false);assert.equal(p.record.milestones.firstMineral,true);
 E.act(s,{type:'move',x:3,y:10},1);p.events(s.run.events.splice(0),s);assert.equal(p.record.milestones.firstAction,true);
});
