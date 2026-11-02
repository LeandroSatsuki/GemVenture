import test from 'node:test';import assert from 'node:assert/strict';
import {createHudLayoutPreferences,normalizeHudLayout,HUD_LAYOUT_KEY,hudPlacement,HUD_WIDGETS} from '../dist/hud-layout.js';
test('default layout is empty, opening does not write and unknown or unsafe data is discarded',()=>{
 const writes=[],p=createHudLayoutPreferences({storage:{getItem:()=>null,setItem:(...x)=>writes.push(x)}});assert.deepEqual(p.getState().current,{});assert.equal(writes.length,0);
 assert.deepEqual(normalizeHudLayout({evil:{x:2},life:{x:Infinity,y:0,scale:9,hidden:'true'},items:{x:-2,y:8,scale:.1,hidden:true}}),{life:{scale:1.75,hidden:false},items:{x:0,y:1,scale:.65,hidden:true}});
 assert.equal(HUD_WIDGETS.length,15);
});
test('named presets and the applied organization persist independently of the game save',()=>{
 const map=new Map([['gemventure-save-v2','player']]),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)},p=createHudLayoutPreferences({storage}),draft={life:{x:.3,y:.4,scale:.8,hidden:false}};
 const result=p.savePreset(' Meu HUD ',draft);assert.ok(result.ok);assert.deepEqual(p.getState().current,{});draft.life.x=.9;assert.equal(p.getState().presets[0].widgets.life.x,.3);
 p.apply(p.getState().presets[0].widgets);const q=createHudLayoutPreferences({storage});assert.equal(q.getState().current.life.x,.3);assert.equal(q.getState().presets[0].name,'Meu HUD');assert.equal(map.get('gemventure-save-v2'),'player');assert.ok(map.has(HUD_LAYOUT_KEY));
 p.apply({});assert.equal(p.getState().presets.length,1);assert.ok(p.deletePreset(result.id));assert.equal(p.getState().presets.length,0);
});
test('updating a preset keeps its ID and the limit does not delete existing layouts',()=>{
 const p=createHudLayoutPreferences();for(let i=0;i<8;i++)assert.ok(p.savePreset('HUD '+i,{}).ok);const id=p.getState().presets[0].id;assert.ok(p.savePreset('Renomeado',{pulse:{hidden:true}},id).ok);assert.equal(p.getState().presets[0].id,id);assert.equal(p.savePreset('Nono',{}).reason,'limit');assert.equal(p.getState().presets.length,8);
});
test('failed storage keeps the chosen layout in session and snapshot edits cannot mutate it',()=>{
 const p=createHudLayoutPreferences({storage:{getItem:()=>null,setItem(){throw Error('full');}}});p.apply({combo:{hidden:true}});assert.equal(p.getState().persisted,false);const s=p.getState();delete s.current.combo;assert.equal(p.getState().current.combo.hidden,true);
});
test('resizing the viewport clamps visible bounds without changing saved normalized positions',()=>{
 const entry={x:1,y:0,scale:1.5},before=structuredClone(entry);for(const width of [640,853,1280]){const r=hudPlacement({width,height:480,baseWidth:190,baseHeight:60,centerX:100,centerY:40,entry});assert.ok(r.cx+190*r.scale/2<=width-6);assert.ok(r.cy-60*r.scale/2>=6);}assert.deepEqual(entry,before);
 const r=hudPlacement({width:640,height:480,baseWidth:190,baseHeight:600,centerX:100,centerY:240,entry:{x:.5,y:.5,scale:1.75}});assert.ok(600*r.scale<=468);
});
