import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,restoreState,startRun,finishRun,act} from '../dist/core.js';
import {createZag,restoreZag,spinZag,dealZag,moveZag,chooseZagRoute,zagDestination,craftZagTool,useZagTool,investZag,withdrawZag,bankZag,settleZag,zagTile,zagRoundState,recordZagCrystal,ZAG_WHEEL} from '../dist/zag.js';
import {zagMarkup,boardPoint,zagBoardBase,zagRewardDisplay} from '../dist/zag-view.js';
import {Music} from '../dist/audio.js';
import {homeAudioContext} from './fixtures/home-audio.mjs';
const now=100000;
function base(){const s=createState(712);s.zag.passes=5;s.materials=[1000,1000,1000,1000];return s;}
function rollZag(s,now,random){if(s.run||s.zag.active)return false;if(!s.zag.hand.length&&!dealZag(s,random))return false;return moveZag(s,0,now);}
function land(s,position){s.zag.hand=[];s.zag.position=position-1;s.zag.dice=1;assert.ok(rollZag(s,now,()=>0));return settleZag(s,now+5000);}
function find(s,type){for(let p=1;p<300;p++)if(zagTile(s.seed,p,s.zag.route).type===type)return p;throw Error('missing tile');}
test('old saves migrate passes and refund an unfinished drill once without changing other resources',()=>{
 const s=base();delete s.zag;assert.deepEqual(restoreState(JSON.stringify(s)).zag,createZag());
 s.zag={version:1,passes:7,mined:9,rounds:2,best:3,history:[],active:{id:2,kind:1,stake:100,startedAt:now,crash:3}};
 const b=restoreState(JSON.stringify(s));assert.ok(b);assert.equal(b.zag.version,4);assert.equal(b.zag.passes,8);assert.equal(b.zag.mined,45);assert.equal(b.materials[1],1100);assert.equal(b.zag.active,null);
 assert.equal(restoreState(JSON.stringify(b)).materials[1],1100);
 s.zag.active=null;assert.equal(restoreState(JSON.stringify(s)).zag.passes,7);
});
test('malformed saved actions, balances and histories are rejected',()=>{
 for(const z of [{passes:-1},{mined:60},{dice:-1},{position:Infinity},{satchel:[1,2,3]},{guard:2},{luck:4},{history:[{}]},{active:{type:'move',id:0,from:0,steps:9,startedAt:0}},{active:{type:'spin',id:0,from:0,prize:8,startedAt:0}}])assert.equal(restoreZag({...createZag(),...z}),null);
});
test('one pass per 60 destroyed Abyss crystals, no duplicate credit, progress survives death and reload',()=>{
 const s=base();startRun(s);const target={id:999,type:'crystal',hp:0,x:4,y:11};
 assert.equal(recordZagCrystal(s,target),false);assert.equal(s.zag.mined,0);
 s.run.mode='abyss';s.run.abyss={rows:0};
 for(let i=0;i<60;i++){const t={...target,id:i};recordZagCrystal(s,t);recordZagCrystal(s,t);}
 assert.equal(s.zag.passes,6);assert.equal(s.zag.mined,0);assert.equal(s.run.zagPasses,1);assert.equal(s.run.events.filter(e=>e.id==='zag-pass').length,1);
 finishRun(s,'death');assert.equal(s.lastResult.zagPasses,1);assert.equal(restoreState(JSON.stringify(s)).zag.passes,6);
});
test('real mining awards the pass through damage and never for partial hits or normal floors',()=>{
 const s=base();s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];assert.ok(startRun(s,'abyss'));s.zag.mined=59;
 const r=s.run;r.player={x:20,y:15};r.room.rocks=[];r.room.enemies=[];r.room.nodes=[{id:999,type:'crystal',kind:0,x:21,y:15,hp:2,maxHp:6,value:5}];
 act(s,{type:'hit',id:999},0);assert.equal(s.zag.passes,5);act(s,{type:'hit',id:999},1);assert.equal(s.zag.passes,6);act(s,{type:'hit',id:999},2);assert.equal(s.zag.passes,6);
 assert.ok(restoreState(JSON.stringify(s)));
});

test('spinning consumes one pass only, rejects overlaps and invalid randomness atomically',()=>{
 const s=base();assert.ok(spinZag(s,now,()=>0));assert.equal(s.zag.passes,4);assert.deepEqual(s.materials,[1000,1000,1000,1000]);assert.equal(startRun(s),false);assert.equal(spinZag(s,now),false);assert.equal(rollZag(s,now),false);assert.equal(bankZag(s),false);assert.equal(settleZag(s,now+100),null);
 for(const value of [-1,1,NaN,Infinity]){const b=base(),before=JSON.stringify(b);assert.equal(spinZag(b,now,()=>value),false);assert.equal(JSON.stringify(b),before);}
 const b=base();b.zag.passes=0;assert.equal(spinZag(b),false);assert.equal(rollZag(b),false);b.zag.passes=1;startRun(b);assert.equal(spinZag(b),false);
});
test('all eight equal roulette sectors pay their published dice and separate crystal colors',()=>{
 for(let i=0;i<8;i++){const s=base();spinZag(s,now,()=>(i+.5)/8);const r=settleZag(s,now+3000);assert.equal(s.zag.dice,ZAG_WHEEL[i].dice);assert.equal(r.dice,ZAG_WHEEL[i].dice);assert.equal(s.zag.satchel.reduce((a,b)=>a+b),ZAG_WHEEL[i].amount||0);if(ZAG_WHEEL[i].amount)assert.equal(s.zag.satchel[ZAG_WHEEL[i].kind],ZAG_WHEEL[i].amount);assert.ok(restoreState(JSON.stringify(s)));}
});
test('reload and early close settle the same drawn prize once, with no second debit or payout',()=>{
 for(const type of ['spin','move']){const s=base();s.zag.dice=2;(type==='spin'?spinZag:rollZag)(s,now,()=>.7);const b=restoreState(JSON.stringify(s));assert.deepEqual(b.zag.active,s.zag.active);const pending={...b.zag.active};assert.ok(settleZag(b,now+1,true));if(type==='move')assert.equal(b.zag.position,pending.from+pending.steps);const saved=JSON.stringify(b);assert.equal(settleZag(b,now+10000,true),null);assert.equal(JSON.stringify(b),saved);assert.ok(restoreState(saved));}
});
test('die moves one to six spaces on a descending continuous path',()=>{
 for(let i=0;i<6;i++){const s=base();s.zag.dice=5;assert.ok(rollZag(s,now,()=>(i+.5)/6));assert.equal(s.zag.dice,2);assert.equal(zagRoundState(s,now).step,0);settleZag(s,now+5000);assert.equal(s.zag.position,i+1);}
 for(let p=0;p<100;p++){const a=boardPoint(p,0),b=boardPoint(p+1,0);assert.ok(b.y>=a.y);assert.ok(Math.abs(a.x-b.x)<=300);}
});
test('crossed coffers bank rewards once even when landing past the coffer',()=>{
 const s=base();s.zag.position=10;s.zag.dice=1;s.zag.satchel=[1,2,3,4];rollZag(s,now,()=>.4);const r=settleZag(s,now+5000);assert.equal(s.zag.position,13);assert.deepEqual(r.banked,[31,32,33,34]);assert.deepEqual(s.materials,[1031,1032,1033,1034]);const saved=JSON.stringify(s);assert.equal(settleZag(s,now+6000),null);assert.equal(JSON.stringify(s),saved);
});
test('trap only loses a quarter of carried loot; shield absorbs it once',()=>{
 const s=base();s.zag.route='greed';const p=find(s,'trap');s.zag.satchel=[40,20,8,0];let r=land(s,p);assert.deepEqual(r.lost,[10,5,2,0]);assert.deepEqual(s.zag.satchel,[30,15,6,0]);assert.deepEqual(s.materials,[1000,1000,1000,1000]);
 s.zag.guard=1;r=land(s,p);assert.equal(r.blocked,true);assert.equal(s.zag.guard,0);assert.deepEqual(r.lost,[0,0,0,0]);
});
test('bonus houses grant useful effects; doubled treasure consumes one luck charge',()=>{
 const s=base();land(s,find(s,'guard'));assert.equal(s.zag.guard,1);land(s,find(s,'luck'));assert.equal(s.zag.luck,1);
 const p=find(s,'cache'),tile=zagTile(s.seed,p),r=land(s,p);assert.deepEqual(r.gained,[tile.amount*2,tile.amount*2,tile.amount*2,tile.amount*2]);assert.equal(s.zag.luck,0);
 s.zag.bonusDice=1;land(s,find(s,'dice'));assert.equal(s.zag.dice,1);
});
test('manual banking keeps colors separate and cannot be collected twice',()=>{
 const s=base();s.zag.satchel=[10,20,30,40];assert.ok(bankZag(s));assert.deepEqual(s.materials,[1010,1020,1030,1040]);assert.deepEqual(s.zag.satchel,[0,0,0,0]);assert.equal(bankZag(s),false);assert.ok(restoreState(JSON.stringify(s)));
});
test('deep paths regenerate deterministically without storing an ever growing board',()=>{
 const s=base();s.zag.position=1000000;s.zag.dice=100;
 for(let i=0;i<100;i++){rollZag(s,now,()=>.9);settleZag(s,now+5000);}
 assert.equal(s.zag.position,1000600);assert.equal(s.zag.history.length,6);assert.ok(JSON.stringify(s.zag).length<5500);assert.deepEqual(zagTile(s.seed,1000601),zagTile(s.seed,1000601));assert.ok(restoreState(JSON.stringify(s)));
 const html=zagMarkup(s);assert.ok((html.match(/class="zag-tile"/g)||[]).length<=45);assert.match(html,/TRILHA DA FORTUNA/);assert.match(html,/GUARDAR NA VILA/);assert.doesNotMatch(html,/SAQUEAR!|BROCA DA FORTUNA/);
 const boardStart=zagBoardBase(s.zag.position),continued=zagMarkup(s,0,false,null,boardStart);assert.equal(boardStart,s.zag.position-3);assert.match(continued,new RegExp('data-position="'+(s.zag.position-1)+'"'));assert.match(continued,new RegExp('data-position="'+(s.zag.position+8)+'"'));
});
test('Zag cues obey mute and return to gentle village music',()=>{
 const m=new Music(),notes=[];m.ctx=homeAudioContext(1);m.master={gain:{setTargetAtTime(){}}};m.tone=(...args)=>notes.push(args);
 m.zag(0);assert.equal(notes.length,0);m.enabled=true;m.zag(0);assert.equal(m.track,'zag');const first=notes.length;m.zag(0);assert.equal(notes.length,first);m.zag(2);assert.ok(notes.length>first);m.home(0);assert.equal(m.track,'home');
});
test('a hand spends reserve once; every unused die and chosen route survive reload',()=>{
 const s=base();s.zag.dice=5;let i=0;const rolls=[.2,.5,.9];assert.ok(dealZag(s,()=>rolls[i++]));assert.deepEqual(s.zag.hand,[2,4,6]);assert.equal(s.zag.dice,2);assert.equal(dealZag(s),false);
 chooseZagRoute(s,'greed');const destination=zagDestination(s,1);assert.equal(destination.position,4);assert.deepEqual(destination,{steps:4,position:4,...zagTile(s.seed,4,'greed')});
 assert.ok(moveZag(s,1,now));assert.deepEqual(s.zag.hand,[2,6]);const b=restoreState(JSON.stringify(s));assert.ok(b);settleZag(b,now+5000);assert.equal(b.zag.position,4);assert.equal(b.zag.route,'greed');assert.deepEqual(b.zag.hand,[2,6]);assert.equal(b.zag.dice,2);
});
test('safe routes contain no taxes; greedy routes reveal hazards and triple base rewards',()=>{
 const s=base();let dangers=0;
 for(let p=1;p<120;p++){const safe=zagTile(s.seed,p,'safe'),greed=zagTile(s.seed,p,'greed');assert.ok(!['trap','audit'].includes(safe.type));if(['trap','audit'].includes(greed.type))dangers++;if(greed.type==='xp')assert.ok(greed.amount>=150);}
 assert.ok(dangers>15);assert.equal(chooseZagRoute(s,'unknown'),false);
});
test('earned fragments craft finite tools; inversion and jump alter the preview before committing',()=>{
 const s=base();s.zag.fragments=6;s.zag.hand=[2,4,6];assert.ok(craftZagTool(s,'invert'));assert.ok(craftZagTool(s,'jump'));assert.equal(s.zag.fragments,0);assert.equal(craftZagTool(s,'magnet'),false);
 assert.ok(useZagTool(s,'invert',0));assert.equal(s.zag.hand[0],5);assert.ok(useZagTool(s,'jump',0));assert.equal(zagDestination(s,0).steps,7);assert.equal(useZagTool(s,'jump',0),false);
 const b=restoreState(JSON.stringify(s));assert.ok(moveZag(b,0,now));settleZag(b,now+5000);assert.equal(b.zag.position,7);assert.equal(b.zag.jump,0);assert.equal(b.zag.tools.invert,0);
});
test('magnet swaps rather than duplicates houses, persists at the first swapped cell, rejects coffers',()=>{
 const s=base();s.zag.tools.magnet=2;s.zag.hand=[1];const source=zagTile(s.seed,3,'safe'),original=zagTile(s.seed,1,'safe');
 assert.ok(useZagTool(s,'magnet',0));assert.equal(zagDestination(s,0).type,source.type);assert.equal(useZagTool(s,'magnet',0),false);moveZag(s,0,now);settleZag(s,now+5000);
 const b=restoreState(JSON.stringify(s));assert.ok(b);b.zag.hand=[2];assert.equal(zagDestination(b,0).type,original.type);moveZag(b,0,now);settleZag(b,now+5000);assert.equal(b.zag.swap,null);
 b.zag.position=11;b.zag.hand=[1];assert.equal(useZagTool(b,'magnet',0),false);
});
test('coffer deposits are deliberate, compound once per crossed layer, and withdraw without duplicate credit',()=>{
 const s=base();assert.equal(investZag(s,0,100),false);s.zag.position=12;assert.ok(investZag(s,1,100));assert.equal(s.materials[1],900);assert.equal(s.zag.investment[1],100);
 s.zag.position=23;s.zag.hand=[1];moveZag(s,0,now);const r=settleZag(s,now+5000);assert.equal(s.zag.investment[1],105);assert.equal(r.interest[1],5);
 s.zag.position=35;s.zag.hand=[1];moveZag(s,0,now);settleZag(s,now+5000);assert.equal(s.zag.investment[1],110);
 const b=restoreState(JSON.stringify(s)),before=b.materials[1];assert.ok(withdrawZag(b));assert.equal(b.materials[1],before+110);assert.equal(withdrawZag(b),false);
 b.zag.investment[0]=9990;assert.equal(investZag(b,0,25),false);
});
test('audit charges only the investment and a shield prevents exactly one tax',()=>{
 const s=base();s.zag.route='greed';s.zag.investment=[100,200,0,0];s.zag.satchel=[40,40,40,40];const p=find(s,'audit'),before=[...s.materials];let r=land(s,p);assert.deepEqual(r.fee,[10,20,0,0]);assert.deepEqual(s.materials,before);assert.deepEqual(s.zag.satchel,[40,40,40,40]);s.zag.guard=1;r=land(s,p);assert.equal(r.blocked,true);assert.deepEqual(r.fee,[0,0,0,0]);
});
test('XP houses progress the real skill tree without adding a competing currency',()=>{
 const s=base();s.zag.route='greed';const p=find(s,'xp');const r=land(s,p);assert.ok(r.xp>=150);assert.ok(s.experience.level>=2);assert.ok(s.experience.points>=1);assert.ok(restoreState(JSON.stringify(s)));
});
test('version two board saves retain all balances when tactical systems are introduced',()=>{
 const s=base();s.zag={version:2,passes:4,mined:3,rounds:0,position:17,dice:8,satchel:[1,2,3,4],guard:1,luck:2,active:null,result:null,history:[]};const b=restoreState(JSON.stringify(s));assert.ok(b);assert.equal(b.zag.version,4);assert.equal(b.zag.position,17);assert.equal(b.zag.dice,8);assert.deepEqual(b.zag.hand,[]);assert.deepEqual(b.zag.satchel,[1,2,3,4]);
});
test('Zag lounge keeps its quiet pulse while adding a changing melody',()=>{
 const m=new Music(),notes=[],gains=[];m.enabled=true;m.ctx={state:'running',currentTime:0};m.master={gain:{setTargetAtTime:v=>gains.push(v)}};m.tone=(...a)=>notes.push(a);
 for(let t=0;t<28;t+=.42)m.zag(t);
 assert.ok(notes.some(n=>n[2]==='triangle'));assert.ok(notes.some(n=>n[2]==='sine'));
 assert.ok(notes.every(n=>n[3]<=.046&&n[5]===undefined));assert.ok(gains.every(v=>v===.13));
 assert.ok(new Set(notes.filter(n=>n[2]==='triangle').map(n=>n[0])).size>=6);
});
test('Zag reward feedback reports the real colored payout, saved crystals, and losses',()=>{
 const s=base(),cache=land(s,find(s,'cache')),reward=zagRewardDisplay(cache);
 assert.equal(reward.tone,'jackpot');assert.equal(reward.tokens.filter(t=>t.kind==='gain').length,4);
 assert.equal(reward.hero,'+'+cache.gained.reduce((a,b)=>a+b,0)+' CRISTAIS');
 const bank=bankZag(s),saved=zagRewardDisplay(bank);
 assert.equal(saved.tone,'bank');assert.equal(saved.tokens.filter(t=>t.kind==='bank').length,4);
 assert.equal(saved.hero,'+'+bank.banked.reduce((a,b)=>a+b,0)+' GUARDADOS');
 s.zag.satchel=[40,40,40,40];s.zag.route='greed';const trap=land(s,find(s,'trap')),loss=zagRewardDisplay(trap);
 assert.equal(loss.tone,'loss');assert.equal(loss.tokens.filter(t=>t.kind==='loss').length,4);
});
test('Zag reward melody lands on the lounge pulse and stays silent when muted',()=>{
 const m=new Music(),notes=[];m.ctx={state:'running',currentTime:10};m.tone=(...a)=>notes.push(a);
 const r={type:'cache',gained:[10,10,10,10],lost:[0,0,0,0],fee:[0,0,0,0],banked:[0,0,0,0]};
 m.zagReward(r,2.1);assert.equal(notes.length,0);m.enabled=true;m.zagReward(r,2.1);
 assert.ok(notes.length>=4);assert.ok(notes.every(n=>n[4]>=10&&n[4]<10.8));
 notes.length=0;m.zagReward({...r,type:'trap',lost:[2,0,0,0]},2.1);
 assert.deepEqual(notes.map(n=>n[0]),[392,329.63,261.63]);
});
