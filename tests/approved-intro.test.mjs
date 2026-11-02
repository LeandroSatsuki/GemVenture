import test from 'node:test';
import assert from 'node:assert/strict';
import {createState} from '../dist/core.js';
import {mountRefugeOnboarding,REFUGE_TOUR} from '../dist/refuge-onboarding.js';
import {introTargetClicked} from '../dist/approved-intro-view.js';
function harness(){
 const state=createState(712),events={},queue=[],name={value:'',focus(){}},view={form:{elements:{minerName:name}},render(model){this.model=model;},layout(){},live(value){this.error=value;}};let hooks,saves=0;
 const target=selector=>({getClientRects:()=>[{}],closest:()=>null,matches:s=>s===selector,click(){}});
 const document={body:{classList:{toggle(){}}},querySelector:()=>null,querySelectorAll:s=>s==='.approved-service-host'?[]:[target(s)],addEventListener:(type,fn)=>events[type]=fn,defaultView:{requestAnimationFrame:fn=>queue.push(fn)}};
 const api=mountRefugeOnboarding({document,profile:()=>state,save:()=>saves++,update(){},closeDialog(){},onActive(){},createView:options=>{hooks=options;return view;}});
 return {state,view,api,name,get hooks(){return hooks;},get saves(){return saves;},click(){const selector=view.model.entry.target;events.click({target:{closest:()=>null},composedPath:()=>[target(selector),{}]});while(queue.length)queue.shift()();}};
}
test('approved tour preserves every ordered interaction, name sanitation and optional spending',()=>{
 const h=harness(),bank=h.state.bank,materials=JSON.stringify(h.state.materials),stars=h.state.stars;h.api.start();h.hooks.onNext();assert.equal(h.api.step,'hello');assert.match(h.view.error,/nome/);
 h.name.value='  <Luna>  ';h.hooks.onNext();assert.equal(h.state.journey.name,'Luna');const visited=['hello'];
 while(h.api.active){visited.push(h.api.step);if(h.view.model.entry.click){const before=h.api.step;h.hooks.onNext();assert.equal(h.api.step,before,'required targets cannot be bypassed by Next');h.click();}else h.hooks.onNext();}
 assert.deepEqual(visited,REFUGE_TOUR.map(x=>x.id));assert.equal(h.state.journey.tourDone,true);assert.equal(h.state.journey.tourStep,null);assert.equal(h.state.bank,bank);assert.equal(JSON.stringify(h.state.materials),materials);assert.equal(h.state.stars,stars);
});
test('actual Shadow DOM click path is accepted even when the document target is the host',()=>{
 const real={matches:selector=>selector==='[data-forge="vigor"]'},host={closest:()=>null};assert.equal(introTargetClicked({target:host,composedPath:()=>[real,host]},'[data-forge="vigor"]'),true);assert.equal(introTargetClicked({target:host,composedPath:()=>[real,host]},'[data-forge="anvil"]'),false);
});
test('skipping the unlocked Reliquary introduction does not reopen it or spend stars',()=>{
 const h=harness();h.state.journey.tourDone=true;h.state.journey.relicIntroDone=false;h.state.stars=30;h.state.floorStars=Object.fromEntries([1,2,3,4,5,6].map(n=>[n,5]));h.api.frame();assert.equal(h.api.step,'relic-unlocked');h.hooks.onSkip();assert.equal(h.state.journey.relicIntroDone,true);assert.equal(h.state.stars,30);h.api.frame();assert.equal(h.api.active,false);
});
test('a saved tour resumes at the actual structure before returning to its controls',()=>{
 const h=harness();h.state.journey.tourStep='strength';h.api.start();assert.equal(h.api.step,'forge');assert.equal(h.state.journey.tourStep,'forge');h.hooks.onSkip();assert.equal(h.state.journey.tourDone,true);
});
