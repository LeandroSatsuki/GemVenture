import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenuController} from '../dist/menu-controller.js';

function fixture({directEntry=true,reduced=false,persisted=true,resumable=false}={}){
 const nodes=new Map(),classes=new Set(),audioSubscribers=new Set(),visualSubscribers=new Set();
 const doc={body:{classList:{toggle:(id,v)=>v?classes.add(id):classes.delete(id)}},defaultView:{matchMedia:()=>({matches:reduced})}};
 class Node extends EventTarget{constructor(id){super();this.id=id;this.dataset={};this.hidden=false;this.disabled=false;this.attrs={};this.value='';this.animations=[];}setAttribute(k,v){this.attrs[k]=v;}focus(){doc.activeElement=this;}querySelectorAll(){return [...nodes.values()].filter(n=>n.id.startsWith('settings'));}animate(frames,options){const a={frames,options,cancelled:false,cancel(){this.cancelled=true;}};this.animations.push(a);return a;}}
 for(const id of ['menuShell','menuMain','gameSettings','menuNotice','menuStart','menuSettings','menuExit','settingsBack','settingsApply','settingsClose','settingsSoundEnabled','settingsMusicVolume','settingsMusicValue','settingsSfxVolume','settingsSfxValue','settingsVisualEffects','settingsVisualSoft','settingsAudioStatus','settingsSoundValue','settingsAudioPanel','settingsPreviewTitle','settingsPreviewCopy','settingsEffectSample'])nodes.set(id,new Node(id));
 nodes.get('settingsVisualEffects').value='intense';nodes.get('settingsVisualSoft').value='soft';
 const preferences={enabled:true,musicVolume:.37,sfxVolume:.82};let visual='intense',closed=0,resumeIntent=false,focusGame=0,unlocks=0;
 const services={audio:{controller:{getState:()=>({preferences,persisted,ready:true}),set:patch=>{Object.assign(preferences,patch);for(const fn of audioSubscribers)fn();},unlock:async()=>{unlocks++;}},subscribe:fn=>{audioSubscribers.add(fn);return()=>audioSubscribers.delete(fn);},engine:{silence(){}}},visual:{getMode:()=>visual,getState:()=>({persisted}),setMode:value=>{visual=value;for(const fn of visualSubscribers)fn();},subscribe:fn=>{visualSubscribers.add(fn);return()=>visualSubscribers.delete(fn);}}};
 const controller=createMenuController({root:{ownerDocument:doc,querySelector:selector=>nodes.get(selector.slice(1))},services,profile:()=>({label:'Continuar'}),onStart:async()=>{},exit:async()=>({}),directEntry,canResume:()=>resumable,onCloseSettings:({resume})=>{closed++;resumeIntent=resume},focusGame:()=>focusGame++});
 const node=id=>nodes.get(id),event=(id,type)=>node(id).dispatchEvent(new Event(type));
 return {get resumeIntent(){return resumeIntent;},controller,node,event,preferences,doc,classes,audioSubscribers,visualSubscribers,get closed(){return closed;},get focusGame(){return focusGame;},get unlocks(){return unlocks;},get visual(){return visual;}};
}
test('approved presentation reads real preferences and closes through existing game lifecycle',()=>{
 const f=fixture();f.controller.openSettings();assert.equal(f.node('settingsMusicValue').textContent,'37%');assert.equal(f.node('settingsSfxVolume').value,'82');
 assert.equal(f.doc.activeElement.id,'settingsSoundEnabled');f.event('settingsClose','click');assert.equal(f.closed,1);assert.equal(f.focusGame,1);assert.equal(f.node('menuShell').hidden,true);
});
test('music/SFX remain independent and mute keeps both selected volumes',()=>{
 const f=fixture();f.controller.openSettings();f.node('settingsMusicVolume').value='19';f.event('settingsMusicVolume','input');
 assert.equal(f.preferences.musicVolume,.19);assert.equal(f.preferences.sfxVolume,.82);
 f.node('settingsSoundEnabled').checked=false;f.event('settingsSoundEnabled','change');assert.equal(f.node('settingsSoundValue').textContent,'Desligado');assert.equal(f.preferences.musicVolume,.19);
 f.node('settingsSoundEnabled').checked=true;f.event('settingsSoundEnabled','change');assert.equal(f.preferences.musicVolume,.19);assert.equal(f.unlocks,2);
});
test('visual modes stay exclusive; selecting full gives one bounded sample, soft/reduced cancel it',()=>{
 const f=fixture();f.controller.openSettings();f.node('settingsVisualSoft').checked=true;f.event('settingsVisualSoft','change');assert.equal(f.visual,'soft');assert.equal(f.node('settingsVisualEffects').checked,false);assert.ok(f.classes.has('soft-fx'));
 f.node('settingsVisualEffects').checked=true;f.event('settingsVisualEffects','change');const [a]=f.node('settingsEffectSample').animations;assert.equal(a.options.duration,180);
 f.event('settingsBack','click');assert.ok(a.cancelled);f.controller.dispose();assert.equal(f.audioSubscribers.size,0);assert.equal(f.visualSubscribers.size,0);
 const r=fixture({reduced:true});r.node('settingsVisualEffects').checked=true;r.event('settingsVisualEffects','change');assert.equal(r.node('settingsEffectSample').animations.length,0);
});
test('failed persistence stays visible and non-direct navigation restores menu focus',()=>{
 const f=fixture({directEntry:false,persisted:false});f.controller.openSettings();assert.match(f.node('settingsAudioStatus').textContent,/ativos nesta sessão/);assert.equal(f.node('settingsAudioStatus').dataset.error,'true');
 f.event('settingsBack','click');assert.equal(f.controller.getState().mode,'menu');assert.equal(f.doc.activeElement.id,'menuSettings');assert.equal(f.node('menuMain').inert,false);
});

test("pause settings keep changes, apply with explicit resume intent and ordinary close stays paused",()=>{const f=fixture({resumable:true});f.controller.openSettings();assert.equal(f.node("settingsApply").hidden,false);f.node("settingsMusicVolume").value="22";f.event("settingsMusicVolume","input");f.event("settingsApply","click");assert.equal(f.preferences.musicVolume,.22);assert.equal(f.resumeIntent,true);f.controller.openSettings();f.event("settingsClose","click");assert.equal(f.resumeIntent,false);f.controller.dispose();const home=fixture();home.controller.openSettings();assert.equal(home.node("settingsApply").hidden,true);home.controller.dispose();});
