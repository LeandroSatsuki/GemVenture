import test from 'node:test';
import assert from 'node:assert/strict';
import {createBossHelpPreferences,BOSS_HELP_STORAGE_KEY} from '../dist/boss-help-preferences.js';
import {bossHelpCaption,bossHelpAnchor,paintBossHelpBubble,bubbleLines,bossBubblePlacement,bossHelpObstacles} from '../dist/boss-help-view.js';
import * as E from '../dist/core.js';

test('boss help starts off and reads only its independent preference key',()=>{
 const reads=[],writes=[],storage={getItem:k=>(reads.push(k),null),setItem:(...v)=>writes.push(v)};
 const p=createBossHelpPreferences({storage});assert.equal(p.getState().enabled,false);assert.deepEqual(reads,[BOSS_HELP_STORAGE_KEY]);assert.equal(writes.length,0);
});
test('explicit choice persists, restores, isolates the save and notifies only current subscribers',()=>{
 const saved=new Map([['gemventure-save-v2','unchanged']]),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},p=createBossHelpPreferences({storage});
 let calls=0;const off=p.subscribe(()=>calls++);p.setEnabled(true);assert.equal(calls,1);assert.equal(createBossHelpPreferences({storage}).getState().enabled,true);
 off();p.setEnabled(false);assert.equal(calls,1);assert.equal(createBossHelpPreferences({storage}).getState().enabled,false);assert.equal(saved.get('gemventure-save-v2'),'unchanged');
 const state=p.getState();state.enabled=true;assert.equal(p.getState().enabled,false);
});
test('malformed or future preferences do not silently enable assistance',()=>{
 for(const raw of ['broken','null','{"version":1,"enabled":"true"}','{"version":2,"enabled":true}'])assert.equal(createBossHelpPreferences({storage:{getItem:()=>raw}}).getState().enabled,false);
});
test('storage failure keeps the explicit session choice and reports it unsaved',()=>{
 const p=createBossHelpPreferences({storage:{getItem:()=>null,setItem(){throw Error('full');}}});p.setEnabled(true);assert.equal(p.getState().enabled,true);assert.equal(p.getStatus().persisted,false);p.setEnabled('false');assert.equal(p.getState().enabled,true);
});
test('all seven actual boss rooms are silent by default and help does not mutate combat',()=>{
 for(let i=1;i<=7;i++){
  const s=E.createState(43);E.startRun(s);s.run.floor=i*5;E.generateRoom(s);const b=s.run.room.enemies.find(e=>e.boss),before=structuredClone(s.run);
  assert.equal(bossHelpCaption(b,s.run,4),null);bossHelpCaption(b,s.run,4,{enabled:true});assert.deepEqual(s.run,before);
 }
});
test('current warning and vulnerability determine the optional instruction with no stale queue',()=>{
 const s=E.createState(43);E.startRun(s);s.run.floor=5;E.generateRoom(s);const b=s.run.room.enemies.find(e=>e.boss);
 delete b.crown;
 b.windup={hint:'Saia da marca'};assert.equal(bossHelpCaption(b,s.run,8,{enabled:true,attackCaption:'Saia da marca · 2'}),'Saia da marca · 2');
 b.windup=null;b.exposedUntil=10;assert.equal(bossHelpCaption(b,s.run,9,{enabled:true}),'Ataque agora!');assert.equal(bossHelpCaption(b,s.run,11,{enabled:true}),null);assert.equal(bossHelpCaption(b,s.run,9,{enabled:false}),null);
 b.hp=0;assert.equal(bossHelpCaption(b,s.run,9,{enabled:true}),null);
});
test('new and legacy rabbit mechanics keep their distinct actual instructions',()=>{
 const run={room:{cleared:false}},b={boss:true,bossIndex:6,hp:10,exposedUntil:-1,rabbitMechanic:2};
 assert.match(bossHelpCaption(b,run,5,{enabled:true}),/Atraia/);delete b.rabbitMechanic;assert.match(bossHelpCaption(b,run,5,{enabled:true}),/Atordoe/);
});
test('Mystic help stays quiet in rest and never identifies the real copy by its anchor',()=>{
 const s=E.createState(43);E.startRun(s);s.run.floor=20;E.generateRoom(s);const b=s.run.room.enemies.find(e=>e.boss),anchor=bossHelpAnchor(b,s.run.room);
 assert.equal(bossHelpCaption(b,s.run,0,{enabled:true}),null);b.mirage.state='hunt';b.mirage.deadline=20;assert.match(bossHelpCaption(b,s.run,12,{enabled:true}),/VERDADEIRO/);
 b.x+=4;b.y-=2;assert.deepEqual(bossHelpAnchor(b,s.run.room),anchor);
});
test('micelial reversal uses the existing musical phase and clearing suppresses help',()=>{
 const s=E.createState(43);E.startRun(s);s.run.floor=25;E.generateRoom(s);const b=s.run.room.enemies.find(e=>e.boss);
 assert.match(bossHelpCaption(b,s.run,4,{enabled:true}),/núcleos/);assert.match(bossHelpCaption(b,s.run,34,{enabled:true}),/mudar/);s.run.room.cleared=true;assert.equal(bossHelpCaption(b,s.run,34,{enabled:true}),null);
});
test('bubble wraps full instructions and restores the drawing context without animation',()=>{
 const texts=[];let saves=0,restores=0;const c=new Proxy({save:()=>saves++,restore:()=>restores++,measureText:t=>({width:t.length*5}),fillText:t=>texts.push(t)},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const text='Salte sobre o rastro de fogo';paintBossHelpBubble(c,{x:100,y:100,text,bounds:{left:0,right:400,top:0,bottom:300}});assert.equal(texts.join(' '),text);assert.equal(saves,1);assert.equal(restores,1);
 assert.ok(bubbleLines(c,text,70).every(t=>c.measureText(t).width<=70));paintBossHelpBubble(c,{text:null});assert.equal(saves,1);
});
test('bubble moves away from a right-hand mission and yields when every area is occupied',()=>{
 const data={x:240,y:200,width:172,height:44,bounds:{left:0,top:0,right:500,bottom:500}};
 const pos=bossBubblePlacement({...data,avoid:[{left:280,right:500,top:150,bottom:300}]});assert.ok(pos.left+data.width<280);
 assert.equal(bossBubblePlacement({...data,avoid:[{left:0,right:500,top:0,bottom:500}]}),null);
});
test('HUD obstacles use physical element bounds converted through the actual world camera',()=>{
 const doc={querySelectorAll:()=>[{getBoundingClientRect:()=>({width:80,height:40,left:110,right:190,top:70,bottom:110})},{getBoundingClientRect:()=>({width:0,height:0})}]};
 const result=bossHelpObstacles(doc,{getBoundingClientRect:()=>({left:10,top:20})},{camera:{x:200,y:100},scale:2,offsetX:20,offsetY:10});
 assert.deepEqual(result,[{left:120,right:140,top:60,bottom:70}]);
});
