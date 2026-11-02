import test from 'node:test';
import assert from 'node:assert/strict';
import {syncGeodeAmbience,releaseGeodeAmbience,supportsGeodeAmbience} from '../dist/geode-lighting-runtime.js';
import {createVideoPreferences} from '../dist/video-preferences.js';
const arena=()=>({room:{bossFloor:true},biome:0,images:new Map(),surface:{},data:{material:{light:'#2fbfcd'},arena:{props:[{}]}}});
test('cave lighting edits once per frame and releases on scene change',()=>{
 const preferences=createVideoPreferences(),world={campaignScene:null};let installs=0,sets=0,disposals=0,settings;
 const install=(_world,options)=>{installs++;settings=options.settings;return {set(next){sets++;settings=next;},dispose(){disposals++;}};};
 const sync=()=>syncGeodeAmbience(world,{preferences,install});
 assert.equal(sync(),null);world.campaignScene=arena();const adapter=sync();assert.equal(installs,1);assert.equal(settings.shadowOpacity,.68);assert.equal(sync(),adapter);assert.equal(sets,0);
 preferences.set({escuridao_pct:0});preferences.set({luz_personagem_pct:0});sync();assert.equal(sets,1);assert.equal(settings.shadowOpacity,0);assert.equal(settings.playerIntensity,0);
 world.campaignScene=arena();sync();assert.equal(disposals,1);assert.equal(installs,2);world.campaignScene=null;assert.equal(sync(),null);assert.equal(disposals,2);releaseGeodeAmbience(world);assert.equal(disposals,2);
});
test('all seven common caves and arenas, Abismo and legacy presentation can consume the same preferences',()=>{
 for(let biome=0;biome<7;biome++){assert(supportsGeodeAmbience({...arena(),biome}));assert(supportsGeodeAmbience({...arena(),biome,room:{bossFloor:false}}));}
 assert(supportsGeodeAmbience({...arena(),surface:null,room:{abyssCave:{version:1}}}));
 const preferences=createVideoPreferences(),world={campaignScene:null},room={floorMask:[1]};let received;
 syncGeodeAmbience(world,{run:{floor:11,room},preferences,install:(_w,options)=>{received=options;return{dispose(){}};}});assert(received.scene.legacy);assert.equal(received.scene.biome,2);assert.equal(received.settings.shadowOpacity,.68);releaseGeodeAmbience(world);
 for(const patch of [{biome:7},{images:null},{surface:null},{error:'asset missing'},{disposed:true},{data:{}}])assert.equal(supportsGeodeAmbience({...arena(),...patch}),false);
});
