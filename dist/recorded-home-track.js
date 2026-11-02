import {LOBBY_TRACK} from './lobby-track.js';
// One decoded buffer on the existing music bus. Preview, combat, pause and mute
// still use Music.silence(); an interrupted track resumes at its real offset.
export function attachRecordedHomeTrack(music){
 music.recordedHomePlaying=false;music.recordedHomeStatus="paused";
 const originalHome=music.home,originalSilence=music.silence;let buffer=null,pending=null,source=null,offset=0,started=0,failed=false;
 const pause=()=>{if(source){offset=(offset+Math.max(0,music.ctx.currentTime-started))%(buffer?.duration||1);source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}music.recordedHomePlaying=false;music.recordedHomeStatus="paused";};
 music.silence=function(...args){pause();return originalSilence.apply(this,args);};
 music.home=function(time,nearGramophone=false){
  if(nearGramophone||this.preview){pause();return originalHome.call(this,time,nearGramophone);}
  if(!this.enabled||this.ctx?.state!=='running'){pause();return;}
  if(failed)return; // No surprise replacement track after a failed decode.
  if(!buffer){music.recordedHomeStatus='loading';pending??=fetch(LOBBY_TRACK.url).then(r=>{if(!r.ok)throw Error('Track unavailable');return r.arrayBuffer();}).then(bytes=>this.ctx.decodeAudioData(bytes)).then(decoded=>{buffer=decoded;music.recordedHomeStatus='ready';},error=>{failed=true;music.recordedHomeStatus='unavailable';console.warn('Hub music unavailable:',error.message);});return;}
  if(source)return;
  originalSilence.call(this,false);this.track='home';source=this.ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(this.outputFor?.()||this.master);started=this.ctx.currentTime;source.start(0,offset);this.recordedHomePlaying=true;this.recordedHomeStatus="playing";
 };
 return {pause,get playing(){return !!source;},get failed(){return failed;}};
}
