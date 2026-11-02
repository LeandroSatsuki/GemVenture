import {attachRecordedHomeTrack} from './recorded-home-track.js';
import {createUiPreferences} from './ui-display.js';
import {Music} from './audio.js';
import {attachAudioMix} from './audio-mix.js';
import {createAudioController} from './audio-settings.js';
export function safeStorage(host=globalThis){try{return host.localStorage??null;}catch{return null;}}
export function createVisualPreferences({storage,preferReduced=false}={}){
 let mode=preferReduced?'soft':'intense',persisted=true;const listeners=new Set();
 try{const stored=storage?.getItem('gemventure-fx');if(['soft','intense'].includes(stored))mode=stored;}catch{persisted=false;}
 return {getMode:()=>mode,getState:()=>({mode,persisted}),subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},setMode(next){if(!['soft','intense'].includes(next))throw new TypeError('Invalid visual mode');mode=next;try{storage?.setItem('gemventure-fx',mode);persisted=!!storage;}catch{persisted=false;}for(const fn of listeners)fn(mode);return mode;}};
}
export function createAppServices({engine=new Music(),storage=safeStorage(),preferReduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}){
 attachRecordedHomeTrack(engine);const listeners=new Set(),mix=attachAudioMix(engine),controller=createAudioController({engine,storage,applyMix:mix.apply,onChange:state=>{for(const fn of listeners)fn(state);}});
 return {audio:{engine,controller,mix,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}},visual:createVisualPreferences({storage,preferReduced}),ui:createUiPreferences({storage}),storage};
}
let singleton;
export function getAppServices(){return singleton??=createAppServices();}
