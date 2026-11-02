import test from 'node:test';
import assert from 'node:assert/strict';
import {VIDEO_DEFAULTS,VIDEO_STORAGE_KEY,createVideoPreferences,normalizeVideoPreferences,toGeodeLightingOptions} from '../dist/video-preferences.js';
function storage(initial){const data=new Map(initial),writes=[];return {data,writes,getItem:key=>data.get(key)??null,setItem(key,value){data.set(key,value);writes.push(key);}};}
test('approved percentages are defaults without writing or reading a player save',()=>{
 const s=storage([['gemventure-save-v2','player data']]),p=createVideoPreferences({storage:s});
 assert.deepEqual(p.getState(),VIDEO_DEFAULTS);assert.equal(s.writes.length,0);
 assert.deepEqual(toGeodeLightingOptions(p.getState()),{lights:true,crystals:true,mist:true,strength:1.03,neonIntensity:1.06,playerIntensity:2,playerRadiusScale:2,crystalRadiusScale:1.44,shadowOpacity:.68,darkness:1});
 p.set({escuridao_pct:0});assert.deepEqual(s.writes,[VIDEO_STORAGE_KEY]);assert.equal(s.data.get('gemventure-save-v2'),'player data');
});
test('partial edits preserve other controls and layers, survive reload and reset to human defaults',()=>{
 const s=storage(),p=createVideoPreferences({storage:s});let updates=0;const off=p.subscribe(()=>updates++);
 p.set({luz_ambiente_pct:127,camadas:{nevoa:false}});assert.equal(p.getState().camadas.cristais,true);assert.equal(p.getState().alcance_personagem_pct,200);
 const reload=createVideoPreferences({storage:s});assert.equal(reload.getState().luz_ambiente_pct,127);assert.equal(reload.getState().camadas.nevoa,false);
 p.reset();assert.deepEqual(p.getState(),VIDEO_DEFAULTS);assert.equal(updates,2);off();p.set({luz_ambiente_pct:0});assert.equal(updates,2);
 const detached=p.getState();detached.camadas.nevoa=false;assert.equal(p.getState().camadas.nevoa,true);
});
test('bad, legacy, future and unavailable storage fall back safely without disabling session edits',()=>{
 for(const raw of ['bad json','null','[]',JSON.stringify({schemaVersion:100,settings:{escuridao_pct:0}})])assert.deepEqual(createVideoPreferences({storage:storage([[VIDEO_STORAGE_KEY,raw]])}).getState(),VIDEO_DEFAULTS);
 const p=createVideoPreferences({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('quota');}}});p.set({escuridao_pct:41});assert.equal(p.getState().escuridao_pct,41);assert.equal(p.getStatus().persisted,false);
});
test('bounded numeric input accepts zero, rejects empty/null/booleans and preserves the existing motion preference',()=>{
 const p=normalizeVideoPreferences({luz_ambiente_pct:'0',neon_cristais_pct:999,luz_personagem_pct:-10,alcance_personagem_pct:999,alcance_cristais_pct:0,escuridao_pct:NaN,movimento_suave:false,camadas:{nevoa:'false'}});
 assert.equal(p.luz_ambiente_pct,0);assert.equal(p.neon_cristais_pct,250);assert.equal(p.luz_personagem_pct,0);assert.equal(p.alcance_personagem_pct,200);assert.equal(p.alcance_cristais_pct,50);assert.equal(p.escuridao_pct,68);assert.equal(p.camadas.nevoa,true);assert.equal('movimento_suave' in p,false);
 for(const value of ['',null,true,{},Infinity])assert.equal(normalizeVideoPreferences({escuridao_pct:value}).escuridao_pct,68);
});
