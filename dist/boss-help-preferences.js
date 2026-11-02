// Optional presentation help, kept separate from the player's save and progression.
export const BOSS_HELP_STORAGE_KEY='gemventure-boss-help-v1';
export function createBossHelpPreferences({storage=null}={}){
 let enabled=false,persisted=!!storage;const listeners=new Set();
 try{const raw=storage?.getItem(BOSS_HELP_STORAGE_KEY);if(raw){const saved=JSON.parse(raw);enabled=saved?.version===1&&saved.enabled===true;}}catch{persisted=false;}
 const snapshot=()=>({enabled});
 return {getState:snapshot,getStatus:()=>({persisted}),
  setEnabled(value){if(typeof value!=='boolean')return snapshot();enabled=value;
   try{storage?.setItem(BOSS_HELP_STORAGE_KEY,JSON.stringify({version:1,enabled}));persisted=!!storage;}catch{persisted=false;}
   for(const fn of listeners)fn(snapshot());return snapshot();
  },subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
}
let singleton;
export function getBossHelpPreferences(){
 if(!singleton){let storage=null;try{storage=globalThis.localStorage??null;}catch{}singleton=createBossHelpPreferences({storage});}
 return singleton;
}
