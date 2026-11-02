// Video presentation only. This key never reads or rewrites a player save.
export const VIDEO_STORAGE_KEY='gemventure-video-v1';
export const CAMERA_CONTROL=Object.freeze({key:'distancia_camera_pct',label:'Distância da câmera',min:70,max:150,step:5});
export const cameraDistanceScale=value=>100/Math.max(70,Math.min(150,Number(value)||100));
export const VIDEO_DEFAULTS=Object.freeze({
 revisao:'GEODE-R4-TUNING-1',distancia_camera_pct:100,luz_ambiente_pct:103,neon_cristais_pct:106,
 luz_personagem_pct:200,alcance_personagem_pct:200,alcance_cristais_pct:144,
 escuridao_pct:68,camadas:Object.freeze({braseiros:true,cristais:true,nevoa:true})
});
export const VIDEO_CONTROLS=Object.freeze([
 {key:'luz_ambiente_pct',label:'Luz do ambiente',min:0,max:200,step:1},
 {key:'neon_cristais_pct',label:'Brilho neon',min:0,max:250,step:1},
 {key:'luz_personagem_pct',label:'Luz do personagem',min:0,max:200,step:1},
 {key:'alcance_personagem_pct',label:'Alcance da luz do personagem',min:50,max:200,step:1},
 {key:'alcance_cristais_pct',label:'Alcance da luz dos cristais',min:50,max:200,step:1},
 {key:'escuridao_pct',label:'Escuridão',min:0,max:100,step:1}
].map(Object.freeze));
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const numeric=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value));
export function normalizeVideoPreferences(input,fallback=VIDEO_DEFAULTS){
 const source=record(input),base=record(fallback),next={revisao:VIDEO_DEFAULTS.revisao};
 for(const {key,min,max} of [...VIDEO_CONTROLS,CAMERA_CONTROL]){const value=numeric(source[key])?Number(source[key]):numeric(base[key])?Number(base[key]):VIDEO_DEFAULTS[key];next[key]=Math.max(min,Math.min(max,Math.round(value)));}
 const layers=record(source.camadas),previous=record(base.camadas);next.camadas={};
 for(const key of Object.keys(VIDEO_DEFAULTS.camadas))next.camadas[key]=typeof layers[key]==='boolean'?layers[key]:typeof previous[key]==='boolean'?previous[key]:VIDEO_DEFAULTS.camadas[key];
 return next;
}
export function toGeodeLightingOptions(settings){
 const p=normalizeVideoPreferences(settings);
 return {lights:p.camadas.braseiros,crystals:p.camadas.cristais,mist:p.camadas.nevoa,
  strength:p.luz_ambiente_pct/100,neonIntensity:p.neon_cristais_pct/100,
  playerIntensity:p.luz_personagem_pct/100,playerRadiusScale:p.alcance_personagem_pct/100,
  crystalRadiusScale:p.alcance_cristais_pct/100,shadowOpacity:p.escuridao_pct/100,darkness:1};
}
export function createVideoPreferences({storage=null}={}){
 let state=normalizeVideoPreferences(VIDEO_DEFAULTS),persisted=!!storage,revision=0;const listeners=new Set();
 try{const raw=storage?.getItem(VIDEO_STORAGE_KEY);if(raw){const saved=JSON.parse(raw);if(saved?.schemaVersion===1)state=normalizeVideoPreferences(saved.settings);}}catch{persisted=false;}
 const snapshot=()=>({...state,camadas:{...state.camadas}});
 function commit(next){
  state=next;revision++;
  try{storage?.setItem(VIDEO_STORAGE_KEY,JSON.stringify({schemaVersion:1,settings:state}));persisted=!!storage;}catch{persisted=false;}
  for(const fn of listeners)fn(snapshot());return snapshot();
 }
 return {getState:snapshot,getRevision:()=>revision,getStatus:()=>({persisted}),
  set:patch=>commit(normalizeVideoPreferences(patch,state)),reset:()=>commit({...normalizeVideoPreferences(VIDEO_DEFAULTS),distancia_camera_pct:state.distancia_camera_pct}),resetCamera:()=>commit({...state,distancia_camera_pct:100}),
  subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
}
let singleton;
export function getVideoPreferences(){
 if(!singleton){let storage=null;try{storage=globalThis.localStorage??null;}catch{}singleton=createVideoPreferences({storage});}
 return singleton;
}
