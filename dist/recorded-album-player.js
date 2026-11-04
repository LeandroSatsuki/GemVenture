import {loadRecordedAudio} from './recorded-audio-loader.js';
import {RECORDED_MUSIC_GAIN} from './recorded-music-levels.js';
// Uses the existing context and music bus. Album listening never equips a record.
export function createRecordedAlbumPlayer({audio,editionById,fetchAudio=globalThis.fetch}){
 const music=audio.engine,home=music.home,silence=music.silence,stopPreview=music.stopPreview,listeners=new Set();
 let status='idle',edition=null,buffer=null,source=null,gain=null,offset=0,started=0,epoch=0,abort=null,error=null,disposed=false,previewSeconds=null;
 const duration=()=>Math.min(buffer?.duration||Infinity,edition?.duration||Infinity);
 const elapsed=()=>buffer?(offset+(source?Math.max(0,music.ctx.currentTime-started):0))%duration():0;
 const state=()=>({status,editionId:edition?.id??null,elapsed:elapsed(),duration:buffer?duration():edition?.duration||0,error,previewSeconds});
 const emit=()=>{for(const fn of listeners)fn(state());};
 function detach(){if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}gain?.disconnect();gain=null;}
 function stop(){epoch++;abort?.abort();abort=null;detach();status='idle';edition=null;buffer=null;offset=0;error=null;previewSeconds=null;emit();}
 function start(){
  gain=music.ctx.createGain();gain.gain.value=RECORDED_MUSIC_GAIN; // Matches the standard legacy music level through the existing scene gain.
  music.master.gain.setTargetAtTime(.2,music.ctx.currentTime,.015);gain.connect(music.outputFor?.()||music.master);
  source=music.ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.loopEnd=duration();source.connect(gain);started=music.ctx.currentTime;source.start(0,offset%duration());if(previewSeconds){const current=source;source.onended=()=>{if(source===current)stop();};source.stop(started+previewSeconds);}status='playing';emit();
 }
 async function play(id,{previewSeconds:limit=null}={}){
  if(disposed)return false;const next=editionById(id);if(!next)return false;
  const resume=limit===null&&status==='paused'&&edition?.id===id&&!previewSeconds,savedOffset=resume?offset:0;stop();const request=++epoch;edition=next;offset=savedOffset;previewSeconds=limit===5?5:null;status='loading';error=null;silence.call(music,false);emit();
  try{
   if(!audio.controller.getState().preferences.enabled)throw Error('Ative o som nas Configurações para ouvir.');
   let timer;try{if(!await Promise.race([audio.controller.unlock(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Toque em Ouvir novamente para ativar o áudio.')),4000);})]))throw Error('Não foi possível ativar o áudio.');}finally{clearTimeout(timer);}
   if(disposed||request!==epoch)return false;
   abort=new AbortController();const decoded=await loadRecordedAudio(music.ctx,next,{fetchAudio,signal:abort.signal});
   if(disposed||request!==epoch||!audio.controller.getState().preferences.enabled){if(request===epoch)stop();return false;}buffer=decoded;if(music.ctx.state!=='running')throw Error('Toque em Ouvir novamente para retomar o áudio.');abort=null;start();return true;
  }catch(e){if(request!==epoch||disposed)return false;detach();abort=null;status='error';error=e.message;emit();return false;}
 }
 function pause(){if(!source)return;offset=elapsed();detach();status='paused';emit();}
 function seek(value){if(!buffer||previewSeconds||!Number.isFinite(value))return;const playing=status==='playing';offset=Math.max(0,Math.min(value,duration()-1/buffer.sampleRate));detach();if(playing)start();else emit();}
 const wrappedHome=function(...args){if(['loading','playing','paused'].includes(status))return;return home.apply(this,args);};
 const wrappedSilence=function(...args){stop();return silence.apply(this,args);};
 const wrappedStopPreview=function(...args){stop();return stopPreview.apply(this,args);};
 music.home=wrappedHome;music.silence=wrappedSilence;music.stopPreview=wrappedStopPreview;
 const unsubscribe=audio.subscribe?.(s=>{if(!s.preferences.enabled)stop();})||(()=>{});
 async function prepare(id){const next=editionById(id);if(disposed||!next||!music.ctx||!audio.controller.getState().preferences.enabled)return false;try{await loadRecordedAudio(music.ctx,next,{fetchAudio});return !disposed;}catch{return false;}}
 return {play,prepare,pause,seek,stop,getState:state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},dispose(){if(disposed)return;stop();disposed=true;unsubscribe();listeners.clear();if(music.home===wrappedHome)music.home=home;if(music.silence===wrappedSilence)music.silence=silence;if(music.stopPreview===wrappedStopPreview)music.stopPreview=stopPreview;}};
}
