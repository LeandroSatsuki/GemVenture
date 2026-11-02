export const AUDIO_KEY='gemventure-audio-v1';
export const DEFAULT_AUDIO=Object.freeze({version:1,enabled:true,musicVolume:1,sfxVolume:1});
const validVolume=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1;
export function loadAudioPreferences(storage){
 try{
  const raw=JSON.parse(storage?.getItem(AUDIO_KEY)??'null');
  if(!raw||raw.version!==1)return {...DEFAULT_AUDIO};
  return {version:1,enabled:typeof raw.enabled==='boolean'?raw.enabled:true,
   musicVolume:validVolume(raw.musicVolume)?raw.musicVolume:1,
   sfxVolume:validVolume(raw.sfxVolume)?raw.sfxVolume:1};
 }catch{return {...DEFAULT_AUDIO};}
}

// One controller for the existing Music instance. Preferences are independent
// of AudioContext availability, scene transport, and the gameplay save.
export function createAudioController({engine,storage,applyMix=()=>{},onChange=()=>{}}){
 let preferences=loadAudioPreferences(storage),pending=null,disposed=false,error=null,persisted=true;
 const bindings=new Map();
 const state=()=>({preferences:{...preferences},context:engine.ctx?.state||'not-created',
  ready:preferences.enabled&&engine.ctx?.state==='running',pending:!!pending,error,persisted,disposed});
 const apply=()=>{applyMix({...preferences});onChange(state());};
 function set(patch){
  if(disposed)return false;
  for(const [key,value]of Object.entries(patch)){
   if(key==='enabled'?typeof value!=='boolean':!['musicVolume','sfxVolume'].includes(key)||!validVolume(value))throw new TypeError('Invalid audio preference: '+key);
  }
  preferences={...preferences,...patch};
  try{storage?.setItem(AUDIO_KEY,JSON.stringify(preferences));persisted=!!storage;}catch{persisted=false;}
  // Apply zero gain before stopping so an asynchronous resume cannot leak audio.
  apply();if(!preferences.enabled)engine.stop();return true;
 }
 function unlock(){
  if(disposed||!preferences.enabled)return Promise.resolve(false);
  if(engine.ctx?.state==='running'&&engine.enabled){error=null;apply();return Promise.resolve(true);}
  if(pending){
   // A resume requested outside activation may remain pending. Retry resume
   // synchronously inside the new gesture without allocating another context.
   try{const retry=engine.ctx?.resume?.();retry?.catch?.(()=>{});}catch{}
   return pending;
  }
  let attempt;
  try{attempt=engine.enable();applyMix({...preferences});}catch(e){error='unavailable';onChange(state());return Promise.resolve(false);}
  pending=Promise.resolve(attempt).then(ok=>{
   if(disposed||!preferences.enabled){engine.stop();return false;}
   const ready=!!ok&&engine.ctx?.state==='running';error=ready?null:'blocked';return ready;
  },()=>{error='blocked';return false;}).finally(()=>{pending=null;if(!disposed)apply();});
  onChange(state());return pending;
 }
 function bindGestures(target,{ignore=()=>false}={}){
  if(disposed||bindings.has(target))return false;
  const listener=event=>{
   if(!event.isTrusted||ignore(event)||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
   if(event.type==='keydown'&&['Shift','Control','Alt','Meta','Escape'].includes(event.key))return;
   void unlock();
  };
  target.addEventListener('pointerup',listener,true);target.addEventListener('keydown',listener,true);
  bindings.set(target,listener);return true;
 }
 function dispose(){
  if(disposed)return;disposed=true;
  for(const [target,listener]of bindings){target.removeEventListener('pointerup',listener,true);target.removeEventListener('keydown',listener,true);}bindings.clear();
  applyMix({...preferences,enabled:false});engine.stop();
 }
 apply();return {getState:state,set,unlock,bindGestures,dispose};
}
