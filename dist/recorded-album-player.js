import {RECORDED_MUSIC_GAIN} from './recorded-music-levels.js';
// Uses the existing context and music bus. Album listening never equips a record.
export function createRecordedAlbumPlayer({audio,editionById,fetchAudio=globalThis.fetch}){
 const music=audio.engine,home=music.home,silence=music.silence,stopPreview=music.stopPreview,cache=new Map(),listeners=new Set();
 let status='idle',edition=null,buffer=null,source=null,gain=null,offset=0,started=0,epoch=0,abort=null,error=null,disposed=false,previewSeconds=null;
 const elapsed=()=>buffer?(offset+(source?Math.max(0,music.ctx.currentTime-started):0))%buffer.duration:0;
 const state=()=>({status,editionId:edition?.id??null,elapsed:elapsed(),duration:buffer?.duration||edition?.duration||0,error,previewSeconds});
 const emit=()=>{for(const fn of listeners)fn(state());};
 function detach(){if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}gain?.disconnect();gain=null;}
 function stop(){epoch++;abort?.abort();abort=null;detach();status='idle';edition=null;buffer=null;offset=0;error=null;previewSeconds=null;emit();}
 function start(){
  gain=music.ctx.createGain();gain.gain.value=RECORDED_MUSIC_GAIN; // Matches the standard legacy music level through the existing scene gain.
  music.master.gain.setTargetAtTime(.2,music.ctx.currentTime,.015);gain.connect(music.outputFor?.()||music.master);
  source=music.ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.loopEnd=buffer.duration;source.connect(gain);started=music.ctx.currentTime;source.start(0,offset%buffer.duration);if(previewSeconds){const current=source;source.onended=()=>{if(source===current)stop();};source.stop(started+previewSeconds);}status='playing';emit();
 }
 async function play(id,{previewSeconds:limit=null}={}){
  if(disposed)return false;const next=editionById(id);if(!next)return false;
  const resume=limit===null&&status==='paused'&&edition?.id===id&&!previewSeconds,savedOffset=resume?offset:0;stop();const request=++epoch;edition=next;offset=savedOffset;previewSeconds=limit===5?5:null;status='loading';error=null;silence.call(music,false);emit();
  try{
   if(!audio.controller.getState().preferences.enabled)throw Error('Ative o som nas Configurações para ouvir.');
   if(!await audio.controller.unlock())throw Error('Não foi possível ativar o áudio.');
   if(disposed||request!==epoch)return false;
   buffer=cache.get(id);
   if(!buffer){abort=new AbortController();const response=await fetchAudio(next.audioUrl,{signal:abort.signal});if(!response.ok)throw Error('Não foi possível carregar esta música.');const bytes=await response.arrayBuffer();if(disposed||request!==epoch)return false;const decoded=await music.ctx.decodeAudioData(bytes);if(disposed||request!==epoch)return false;buffer=decoded;cache.set(id,buffer);while(cache.size>2)cache.delete(cache.keys().next().value);}
   if(disposed||request!==epoch||!audio.controller.getState().preferences.enabled){if(request===epoch)stop();return false;}abort=null;start();return true;
  }catch(e){if(request!==epoch||disposed)return false;detach();abort=null;status='error';error=e.message;emit();return false;}
 }
 function pause(){if(!source)return;offset=elapsed();detach();status='paused';emit();}
 function seek(value){if(!buffer||previewSeconds||!Number.isFinite(value))return;const playing=status==='playing';offset=Math.max(0,Math.min(value,buffer.duration-1/buffer.sampleRate));detach();if(playing)start();else emit();}
 const wrappedHome=function(...args){if(['loading','playing','paused'].includes(status))return;return home.apply(this,args);};
 const wrappedSilence=function(...args){stop();return silence.apply(this,args);};
 const wrappedStopPreview=function(...args){stop();return stopPreview.apply(this,args);};
 music.home=wrappedHome;music.silence=wrappedSilence;music.stopPreview=wrappedStopPreview;
 const unsubscribe=audio.subscribe?.(s=>{if(!s.preferences.enabled)stop();})||(()=>{});
 return {play,pause,seek,stop,getState:state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},dispose(){if(disposed)return;stop();disposed=true;cache.clear();unsubscribe();listeners.clear();if(music.home===wrappedHome)music.home=home;if(music.silence===wrappedSilence)music.silence=silence;if(music.stopPreview===wrappedStopPreview)music.stopPreview=stopPreview;}};
}
