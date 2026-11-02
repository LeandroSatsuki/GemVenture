import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun} from '../dist/core.js';
import {createHubGuide,HUB_GUIDES,hubGuideModel} from '../dist/tutorial-hub-guide.js';
import {approvedGuidePresentation} from '../dist/approved-guide-model.js';
import {createAccountScore,beginAccountRun,recordAccountAward,endAccountRun} from '../dist/account-score.js';
import {MUSIC_ALBUMS} from '../dist/music-albums.js';
import {installBubbleFeedback} from '../dist/ui-bubble-feedback.js';
function harness({raw=null,training=false}={}){
 const state=createState(712),saved=new Map(raw?[['gemventure-hub-guide-v1',JSON.stringify(raw)]]:[]),calls=[],view={show(model){this.model=model;},hide(){this.hidden=true;},layout(){},root:{}};let hooks,focus=0;
 const api=createHubGuide({document:{getElementById:()=>({focus(){focus++;}})},storage:{getItem:key=>saved.get(key),setItem:(key,v)=>saved.set(key,v)},profile:()=>state,isTraining:()=>training,onTraining:()=>calls.push('training'),onTour:()=>calls.push('tour'),onOpen:id=>calls.push(id),closeDialog:()=>{},createView:args=>{hooks=args;return view;}});
 return {state,saved,calls,view,api,get hooks(){return hooks;},get focus(){return focus;}};
}
test('guide reads live profile data and canonical statue tiers without writing progression',()=>{
 const s=createState(712);s.stars=23;s.experience.points=7;s.records.albumOwned=[MUSIC_ALBUMS[0].id];const before=JSON.stringify(s);
 for(const g of HUB_GUIDES)assert.ok(approvedGuidePresentation(s,hubGuideModel(s,g.id)));
 assert.match(approvedGuidePresentation(s,hubGuideModel(s,'tree')).context,/7 pontos/);assert.match(approvedGuidePresentation(s,hubGuideModel(s,'records')).context,/1 álbum/);assert.match(approvedGuidePresentation(s,hubGuideModel(s,'stars')).status,/saldo 23/);assert.equal(JSON.stringify(s),before);
 s.accountScore=createAccountScore({id:'guide-test-001'});s.run={mode:'floors',score:{points:0}};beginAccountRun(s);recordAccountAward(s,{runId:s.accountScore.current.id,mode:'floors',source:'gameplay',amount:30000,rawTotal:30000,beat:8,acted:8});endAccountRun(s);s.run=null;
 const score=approvedGuidePresentation(s,hubGuideModel(s,'statue'));assert.match(score.image,/elo-02-silver/);assert.match(score.context,/30\.000 pontos/);
});
test('all nine guide routes preserve callbacks, closing and seen/account storage without financial effects',()=>{
 const h=harness(),before=JSON.stringify(h.state);h.api.catalog();assert.equal(h.api.active,true);assert.deepEqual(h.api.seen(),[],'default preview is not an explicit visit');
 for(const g of HUB_GUIDES){h.hooks.onPick(g.id);assert.equal(h.view.model.id,g.id);h.hooks.onToggle();assert.equal(h.view.model.expanded,true);h.hooks.onAction();assert.equal(h.api.active,false);h.api.catalog();}
 for(const id of ['tour','training']){h.hooks.onRoute(id);h.api.catalog();}
 assert.deepEqual(h.calls,[...HUB_GUIDES.map(g=>g.id),'tour','training']);assert.equal(JSON.stringify(h.state),before);assert.deepEqual(h.api.seen().sort(),HUB_GUIDES.map(g=>g.id).sort());
 const stored=JSON.parse(h.saved.get('gemventure-hub-guide-v1'));assert.equal(stored.accountId,h.state.accountScore.id);assert.equal(stored.version,1);h.api.hide();const focus=h.focus;h.api.hide();assert.equal(h.focus,focus,'inactive hide must not steal focus from tour/training');
});
test('guide consults during a run but cannot open a structure or start a refuge tour',()=>{
 const h=harness();startRun(h.state);const before=JSON.stringify(h.state);h.api.catalog();h.hooks.onPick('forge');assert.equal(h.view.model.inRun,true);h.hooks.onRoute('tour');assert.deepEqual(h.calls,[]);h.hooks.onAction();assert.equal(h.api.active,false);assert.deepEqual(h.calls,[]);assert.equal(JSON.stringify(h.state),before);
 h.api.catalog();h.hooks.onRoute('training');assert.deepEqual(h.calls,['training']);assert.equal(JSON.stringify(h.state),before);
});
test('training gating, invalid routes and other-account guide history do not leak actions',()=>{
 const h=harness({raw:{version:1,accountId:'other-account',seen:['forge','well','zag']}});assert.deepEqual(h.api.seen(),[]);h.api.catalog();h.hooks.onPick('well');assert.equal(h.view.model.id,'lift');h.hooks.onRoute('unknown');assert.deepEqual(h.calls,[]);assert.equal(h.api.show('zag'),false);h.api.hide();h.hooks.onAction();assert.deepEqual(h.calls,[]);
 const active=harness({training:true});active.api.catalog();assert.equal(active.api.active,false);assert.equal(active.api.show('forge'),false);assert.deepEqual(active.calls,[]);
});
test('secondary Guide and ordinary buttons share clicks while disabled controls remain silent',()=>{
 const doc={hidden:false,addEventListener(){},removeEventListener(){}},api=installBubbleFeedback(doc,{enabled:false}),button={tagName:'BUTTON',disabled:false,matches:()=>false,closest:()=>null},host={id:'hubGuideOverlay',classList:{contains:name=>name==='approved-guide'}},event={target:button,composedPath:()=>[button,{},host,doc]};
 assert.equal(api.handles(event),true);button.disabled=true;assert.equal(api.handles(event),false);button.disabled=false;assert.equal(api.handles({...event,composedPath:()=>[button,{},doc]}),true);api.dispose();
});
