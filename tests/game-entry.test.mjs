import {installUiDisplay} from '../dist/ui-display.js';
import {installButtonFeedback} from '../dist/button-feedback.js';
import {createVisualPreferences} from '../dist/app-services.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
const entrySource=readFileSync(new URL('../dist/menu-entry.js',import.meta.url),'utf8')
 .replace(/^import .*;\r?\n/gm,'').replace(/import\(/g,'loadModule(');

function entry({art=Promise.resolve(),run=Promise.resolve({setApplicationMenu(){}})}={}){
 const surfaces=[{hidden:true,inert:true},{hidden:true,inert:true}],imports=[],classes=new Map(),events=[];
 const context={installUiDisplay,installButtonFeedback,console:{error(){}},document:{querySelectorAll:()=>surfaces,body:{classList:{toggle:(key,value)=>classes.set(key,value)}},getElementById:()=>({addEventListener(){},focus(){}}),addEventListener(){},documentElement:{dataset:{}},dispatchEvent(){}},requestAnimationFrame:fn=>fn(),CustomEvent:class{},entryLoading:value=>events.push(value),entryLoaded:()=>events.push('loaded'),entryFailed:()=>events.push('failed'),installGlobalFinish(){},readMenuProfile(){},createExitAdapter(){},getAppServices:()=>({visual:createVisualPreferences(),audio:{controller:{bindGestures(){}},engine:{silence(){}}}}),createMenuController:args=>{assert.equal(args.directEntry,true);return {openSettings(){}};},loadModule:async path=>{imports.push(path);if(path==='./game-art-ready.js')return {prepareGameArt:()=>art};if(path==='./run.js')return run;throw Error(path);}};
 vm.runInNewContext(entrySource,context);return {surfaces,imports,classes,events};
}
test('direct entry waits for art, initializes visible canvas dimensions, then reveals game without menu',async()=>{
 const art=deferred(),run=deferred(),game=entry({art:art.promise,run:run.promise});await flush();assert.ok(game.surfaces.every(s=>s.hidden&&s.inert));assert.deepEqual(game.imports,['./game-art-ready.js']);art.resolve();await flush();assert.ok(game.surfaces.every(s=>!s.hidden&&!s.inert));assert.deepEqual(game.imports,['./game-art-ready.js','./run.js']);const states=[];run.resolve({setApplicationMenu:v=>states.push(v)});await flush();assert.deepEqual(states,[false]);assert.equal(game.events.at(-1),'loaded');assert.equal(game.classes.get('application-menu-open'),false);
});
test('art failure retains loading screen retry and never imports game',async()=>{const art=deferred(),game=entry({art:art.promise});await flush();art.reject(Error('decode'));await flush();assert.equal(game.events.at(-1),'failed');assert.deepEqual(game.imports,['./game-art-ready.js']);assert.ok(game.surfaces.every(s=>s.hidden&&s.inert));});
test('module failure hides partial game and exposes loading retry',async()=>{const run=deferred(),game=entry({run:run.promise});await flush();run.reject(Error('module'));await flush();assert.equal(game.events.at(-1),'failed');assert.ok(game.surfaces.every(s=>s.hidden&&s.inert));});

const artSource=readFileSync(new URL('../dist/game-art-ready.js',import.meta.url),'utf8')
 .replace(/^import .*;\r?\n/gm,'').replace('export function','function')+'\nglobalThis.prepare=prepareGameArt;';
const loaders=['loadVillageArt','loadApprovedArt','loadWallArt','loadCavePlayerArt','loadHedgehogArt','loadNightRefugeArt','loadDungeonMiner','loadDungeonPickaxes'];
for(const delayed of loaders)test('startup waits for '+delayed+' and caches the whole preparation',async()=>{
 const pending=deferred(),calls=new Map(),context={minerOutfitKey:()=>'duck-pink'};
 for(const name of loaders)context[name]=()=>{calls.set(name,(calls.get(name)||0)+1);return name===delayed?pending.promise:Promise.resolve();};
 vm.runInNewContext(artSource,context);
 const ready=context.prepare();assert.equal(context.prepare(),ready);
 let finished=false;ready.then(()=>{finished=true;});await flush();
 assert.equal(finished,false,'one incomplete family must not reveal transient fallbacks');
 pending.resolve(true);await ready;
 assert.equal(context.prepare(),ready);
 for(const name of loaders)assert.equal(calls.get(name),1);
 assert.equal(finished,true,'successfully prepared families allow entry');
});

test('explicit failed art family rejects preparation rather than pretending entry is ready',async()=>{const context={minerOutfitKey:()=>'duck-pink'};for(const name of loaders)context[name]=async()=>true;context.loadApprovedArt=async()=>false;vm.runInNewContext(artSource,context);await assert.rejects(context.prepare(),/indisponível/);});
