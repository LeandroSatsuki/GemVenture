import test from 'node:test';import assert from 'node:assert/strict';
import {buttonIdentity,resolveButton,confirmationPlan,installButtonFeedback,confirmButtonResult} from '../dist/button-feedback.js';
test('rebuilding an upgrade button preserves its command identity but not old presentation flags',()=>{
 const original={id:'',dataset:{upgrade:'drill',level:'1',cost:'400',gvHeld:'true',gvButton:'true',uiPressed:'true'},isConnected:false};
 const next={id:'',dataset:{upgrade:'drill',level:'2',cost:'800'}},other={id:'',dataset:{upgrade:'luck'}};
 const identity=buttonIdentity(original);assert.deepEqual(identity,{id:'',data:[['upgrade','drill']]});assert.equal(resolveButton({querySelectorAll:()=>[other,next]},original,identity),next);
});
test('a consumed offer never substitutes another purchase or a stale card as confirmation target',()=>{
 const original={id:'',dataset:{choose:'first'},isConnected:false};
 assert.equal(resolveButton({querySelectorAll:()=>[{id:'',dataset:{choose:'second'}}]},original,buttonIdentity(original)),null);
 assert.equal(resolveButton({querySelectorAll:()=>[{id:''}]},null,{id:'',data:[]}),null);
});
test('persistent IDs locate the updated disabled completion button without replaying its command',()=>{
 const original={id:'forgeAction',dataset:{},isConnected:false},complete={id:'forgeAction',disabled:true};
 assert.equal(resolveButton({querySelectorAll:()=>[complete]},original,buttonIdentity(original)),complete);
});
test('input, navigation, rejection and unavailable actions cannot request a reward response',()=>{
 for(const kind of ['press','select','open','close','deny','disabled','failed',''])assert.equal(confirmationPlan(kind),null);
 for(const kind of ['deposit','craft','building','set','unset','refund'])assert.equal(confirmationPlan(kind,{accepted:false}),null);
});
test('soft mode preserves accepted confirmations without travelling glints',()=>{
 for(const kind of ['deposit','craft','building','set','unset','refund']){const plan=confirmationPlan(kind,{soft:true});assert.ok(plan.duration>0);assert.equal(plan.glints,0);}
 assert.equal(confirmationPlan('deposit').glints,0);assert.equal(confirmationPlan('craft').glints,4);
});
test('non-browser tools and unmounted consumers remain presentation-free',()=>{
 assert.equal(installButtonFeedback({}),null);assert.equal(confirmButtonResult({nodeType:9},'craft'),false);
});
