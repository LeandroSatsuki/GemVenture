import {RECORDED_MUSIC_GAIN} from './recorded-music-levels.js';
import {editionById} from './music-albums.js';
import {albumClock} from './album-clock.js';

// The run clock remains authoritative. A paused/interrupted recording is restarted
// at the exact offset of that clock, on the existing AudioContext and music bus.
export function attachRecordedExpedition(music,{fetchAudio=globalThis.fetch}={}){
 const update=music.update,silence=music.silence,cache=new Map();let source=null,gain=null,context=null,pending=null,requested=null,status='idle',error=null,anchor=0,step=-1,serial=0,disposed=false;
 const stop=()=>{if(source){source.onended=null;try{source.stop();}catch{}music.voices.delete(source);source.disconnect();source=null;}gain?.disconnect();gain=null;step=-1;};
 const ready=id=>context===music.ctx&&cache.has(id);
 async function prepare(id){
  if(disposed||!editionById(id)||!music.ctx?.decodeAudioData)return false;
  if(context!==music.ctx){serial++;stop();cache.clear();pending=null;context=music.ctx;status='idle';requested=null;}
  if(ready(id)){requested=id;status=source?.edition===id?'playing':'ready';return true;}if(pending&&requested===id)return pending;
  const request=++serial,ctx=context;requested=id;status='loading';error=null;
  pending=(async()=>{try{
   const response=await fetchAudio(editionById(id).audioUrl);if(!response.ok)throw Error('Não foi possível carregar a música selecionada.');
   const bytes=await response.arrayBuffer(),buffer=await ctx.decodeAudioData(bytes);
   if(disposed||request!==serial||ctx!==music.ctx)return false;
   if(buffer.duration+.001<albumClock(id).duration)throw Error('A música está incompleta. Tente continuar novamente.');
   cache.set(id,buffer);while(cache.size>2)cache.delete(cache.keys().next().value);status='ready';return true;
  }catch(e){if(request===serial){status='error';error=e.message;}return false;}finally{if(request===serial)pending=null;}})();return pending;
 }
 music.silence=function(...args){stop();return silence.apply(this,args);};
 music.update=function(elapsed,track,mood={}){
  const id=mood.albumEdition,clock=albumClock(id);
  if(!clock){stop();return update.call(this,elapsed,track,mood);}
  if(!this.enabled||this.ctx?.state!=='running'){stop();return;}
  if(!ready(id)){stop();void prepare(id);return;}
  const now=this.ctx.currentTime;
  if(source&&(source.edition!==id||Math.abs(now-anchor-elapsed)>.06))stop();
  this.master?.gain.setTargetAtTime(.2,now,.015);
  if(!source){
   const remaining=clock.start-elapsed,offset=remaining>0?0:((elapsed-clock.start)%clock.duration+clock.duration)%clock.duration;
   gain=this.ctx.createGain();gain.gain.value=RECORDED_MUSIC_GAIN;gain.connect(this.outputFor?.()||this.master);
   source=this.ctx.createBufferSource();source.edition=id;source.buffer=cache.get(id);source.loop=true;source.loopStart=0;source.loopEnd=clock.duration;source.connect(gain);anchor=now-elapsed;source.start(now+Math.max(0,remaining),offset);this.voices.add(source);status='playing';
  }
  // Four preparation cues only; no synthetic percussion over the recording.
  const first=Math.floor(elapsed/clock.intro),last=Math.min(3,Math.floor((elapsed+.12)/clock.intro));
  if(step<first-1)step=first-1;
  for(let b=step+1;b<=last;b++){const at=now+b*clock.intro-elapsed;if(at>=now)this.tone(b===3?880:660,.045,'sine',.045,at);}
  step=Math.max(step,last);
 };
 return {prepare,ready,stop,getState:()=>({editionId:requested,status,error,playing:!!source,anchor,voices:source?1:0}),dispose(){if(disposed)return;disposed=true;serial++;stop();cache.clear();music.update=update;music.silence=silence;}};
}
