// Only an explicit start/retry loads audio. A stale completion cannot start a
// different lesson, resume a paused session or reopen a closed tutorial.
export function createTrainingAudioGate({transport,enableSound,soundEnabled,onChange=()=>{}}){
 let generation=0,state={status:'idle',editionId:null},pending=null;
 const change=(status,editionId)=>{state={status,editionId};onChange(state);};
 function cancel(){generation++;pending=null;change('idle',null);}
 function ready(id){return !id||!soundEnabled()||!!transport?.ready(id);}
 function prepare(id){
  if(!id){cancel();return Promise.resolve(true);}
  if(pending&&state.editionId===id)return pending;
  const ticket=++generation;change('loading',id);
  pending=Promise.resolve().then(async()=>{try{
   // Choosing mute remains valid: the same timestamps drive visual practice.
   if(soundEnabled()&&!await enableSound())throw Error('audio-unavailable');
   if(ticket!==generation)return false;
   if(soundEnabled()&&(!await transport?.prepare(id)||!transport.ready(id)))throw Error('audio-load');
   if(ticket!==generation)return false;
   change('ready',id);return true;
  }catch{if(ticket===generation)change('error',id);return false;}
  finally{if(ticket===generation)pending=null;}});return pending;
 }
 return {prepare,cancel,ready,get state(){return {...state};}};
}
