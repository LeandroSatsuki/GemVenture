import {restoreState} from './core.js';
// Parse/validate a fresh value only. Do not retain a migrated state, settle AFK, or write storage.
export function readMenuProfile({storage,restore=restoreState}={}){
 let unavailable=false;
 for(const key of ['gemventure-save-v2','gemventure-save-v1']){
  try{const raw=storage?.getItem(key);if(raw&&restore(raw))return{valid:true,label:'Continuar',key,storageAvailable:true};}catch{unavailable=true;}
 }
 return {valid:false,label:'Jogar',key:null,storageAvailable:!!storage&&!unavailable};
}
