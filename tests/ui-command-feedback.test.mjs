import test from 'node:test';
import assert from 'node:assert/strict';
import {captureControlFocus,restoreControlFocus,restoreDialogOpener,repeatedUIActivation,installCommandFeedback} from '../dist/ui-command-feedback.js';
import {createState,startRun,finishRun} from '../dist/core.js';
import {retreatSummary} from '../dist/expedition-summary.js';
import {recordsMarkup} from '../dist/records-view.js';
import {petsMarkup} from '../dist/pets-view.js';
import {journeyAbyssCardsMarkup} from '../dist/rebrand-journey-choices.js';
import {RECORDS} from '../dist/records.js';
import {SKILLS} from '../dist/core.js';
import {compactTalentNetwork} from '../dist/compact-talents.js';
import {talentPurchaseState} from '../dist/talent-view.js';
const control=(id='',data={})=>({id,dataset:{...data},tagName:'BUTTON',disabled:false,isConnected:true,hidden:false,selected:false,focusCount:0,getClientRects(){return this.hidden?[]:[{}];},closest(selector){return selector==='button,summary'||selector==='button'?this:this.hidden?this:null;},matches(){return true;},getAttribute(name){return name==='aria-pressed'?String(this.selected):null;},focus(){this.focusCount++;},querySelector(){return null;}});
const rootWith=(nodes,active=nodes[0])=>({ownerDocument:{activeElement:active},contains:node=>nodes.includes(node),querySelectorAll:()=>nodes});
test('focus follows the same command after a panel refresh, without scrolling',()=>{
 const before=control('forgeAction'),snapshot=captureControlFocus(rootWith([before]));before.isConnected=false;
 const replacement=control('forgeAction'),root=rootWith([control('close'),replacement]);
 assert.equal(restoreControlFocus(root,snapshot),true);assert.equal(replacement.focusCount,1);assert.equal(root.ownerDocument.activeElement.focusCount,0);
});
test('focus recovers a data-keyed control, and falls back when it becomes unavailable',()=>{
 const original=control('',{recordFilter:'OWNED'}),snapshot=captureControlFocus(rootWith([original]));original.isConnected=false;
 const another=control('',{recordFilter:'TODOS'}),replacement=control('',{recordFilter:'OWNED'});replacement.selected=true;
 restoreControlFocus(rootWith([another,replacement]),snapshot);assert.equal(replacement.focusCount,1);
 replacement.disabled=true;restoreControlFocus(rootWith([another,replacement]),snapshot);assert.equal(another.focusCount,1);
});
test('closing restores the opener, or the world if that opener is no longer visible',()=>{
 const opener=control('mine'),world=control('world');restoreDialogOpener(opener,world);assert.equal(opener.focusCount,1);
 opener.hidden=true;restoreDialogOpener(opener,world);assert.equal(world.focusCount,1);
});
test('holding Enter or Space suppresses repeated UI transactions without blocking gameplay keys',()=>{
 assert.equal(repeatedUIActivation({repeat:true,code:'Enter',target:control()}),true);
 assert.equal(repeatedUIActivation({repeat:true,code:'Space',target:{closest:()=>null}}),false);
 assert.equal(repeatedUIActivation({repeat:false,code:'Enter',target:control()}),false);
});
test('cancelled or interrupted presses cannot leave a button visually stuck',()=>{
 const handlers={},windows={},doc={addEventListener:(name,fn)=>handlers[name]=fn,defaultView:{addEventListener:(name,fn)=>windows[name]=fn}};
 installCommandFeedback(doc,{reduced:()=>true});const button=control();
 handlers.pointerdown({button:0,target:button});assert.equal(button.dataset.uiPressed,'true');handlers.pointercancel();assert.equal(button.dataset.uiPressed,undefined);
 handlers.keydown({code:'Space',target:button,repeat:false});windows.blur();assert.equal(button.dataset.uiPressed,undefined);
 button.disabled=true;handlers.pointerdown({button:0,target:button});assert.equal(button.dataset.uiPressed,undefined);
});
test('owned filter shows precisely the saved collection and never mutates the save',()=>{
 const state=createState(41);state.records.owned=[RECORDS[0].id,RECORDS[2].id];const before=JSON.stringify(state),html=recordsMarkup(state,'OWNED');
 const displayed=[...html.matchAll(/data-record-card="([^"]+)"/g)].map(match=>match[1]);
 assert.deepEqual(displayed,state.records.owned);assert.match(html,/Nas expedições/);assert.equal(JSON.stringify(state),before);
});
test('pet filters only advertise rarities represented by the actual catalogue; authored names remain intact',()=>{
 const state=createState(42),before=JSON.stringify(state),html=petsMarkup(state);
 for(const tier of ['all','comum','incomum','raro','epico','lendario'])assert.match(html,new RegExp('data-pet-filter="'+tier+'"'));
 assert.match(html,/Combo 100/);assert.match(html,/Abraço de Geleia/);assert.match(html,/Pingô/);assert.equal(JSON.stringify(state),before);
});
test('timed cards expose numerical benefit without changing identity or selection hooks',()=>{
 const html=journeyAbyssCardsMarkup([{id:'lucky',name:'Golpe de sorte',role:'DANO',text:'Golpes críticos',detail:'10 → 20% de chance · dano ×2',level:1,color:'#ffe000'}]);
 assert.match(html,/data-abyss-card="lucky"/);assert.match(html,/class="abyss-card-detail">10 → 20% de chance · dano ×2/);assert.match(html,/<kbd>1<\/kbd>/);assert.match(html,/NÍVEL 2/);
});
test('withdrawal preview matches actual settled amounts, including fractional opening rewards',()=>{
 for(const attempts of [0,8])for(const bag of [1,7,23,181]){
  const state=createState(43);state.attempts=attempts;startRun(state);state.run.bag=bag;state.run.materials=[1,7,11,23];
  const before=JSON.stringify(state),preview=retreatSummary(state);assert.equal(JSON.stringify(state),before);
  finishRun(state,'retreat');assert.equal(preview.coins,state.lastResult.kept);assert.equal(preview.lostCoins,state.lastResult.lost);assert.deepEqual(preview.materials,state.lastResult.keptMaterials);
 }
});
test('every talent branch can be inspected even before a neighbour is learned',()=>{
 const state=createState(44),before=JSON.stringify(state);let locked=0,available=0;
 for(const node of compactTalentNetwork(SKILLS).nodes){
  const view=talentPurchaseState(state,node);
  if(!view.connected||view.max){assert.equal(view.cost,null);locked++;}
  else{assert.ok(Number.isFinite(view.cost)&&view.cost>=0);available++;}
 }
 assert.ok(locked>0&&available>0);assert.equal(JSON.stringify(state),before);
});
