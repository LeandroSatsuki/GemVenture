import {BUBBLE_PCM} from './ui-bubble-bank.js';

import {eventButton,buttonSoundRole} from './ui-button-sound-map.js';
export {IMPORTANT_UI_BUTTONS} from './ui-button-sound-map.js';
export function createBubbleFeedback(music,{preferences=()=>({enabled:true,sfxVolume:1}),visible=()=>true}={}){
 let context=null,voice=null,lastHover=-Infinity,lastClick=-Infinity,hoverUntil=-Infinity,disposed=false;
 const buffers=new Map();
 function stop(){if(!voice)return;const old=voice;voice=null;try{old.gain.gain.cancelScheduledValues(old.context.currentTime);old.gain.gain.setTargetAtTime(0,old.context.currentTime,.002);old.source.stop(old.context.currentTime+.012);}catch{}}
 function emit(kind='hover'){
  const prefs=preferences(),ctx=music.ctx;
  if(disposed||!visible()||!prefs.enabled||prefs.sfxVolume<=0||!music.enabled||!ctx||ctx.state!=='running'||!music.sfxBus)return false;
  if((music.voices?.size||0)+(music.effectVoices?.size||0)>=80)return false;
  if(context!==ctx){stop();context=ctx;buffers.clear();lastHover=lastClick=hoverUntil=-Infinity;}
  const now=ctx.currentTime,hover=kind==='hover';
  if(hover&&(now<hoverUntil||now-lastHover<.1)||!hover&&now-lastClick<.075)return false;
  if(hover)lastHover=now;else{lastClick=now;hoverUntil=now+.15;}
  const id=hover?'hover':'click',sample=BUBBLE_PCM[id];
  if(!buffers.has(id)){const bytes=atob(sample.pcm16),buffer=ctx.createBuffer(1,bytes.length/2,sample.rate),out=buffer.getChannelData(0);for(let i=0;i<out.length;i++){let n=bytes.charCodeAt(i*2)|(bytes.charCodeAt(i*2+1)<<8);out[i]=(n>32767?n-65536:n)/32768;}buffers.set(id,buffer);}
  stop();const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffers.get(id);source.playbackRate.value=kind==='primary'?.92:1;gain.gain.value=hover?.5:kind==='primary'?.85:.65;source.connect(gain);gain.connect(music.sfxBus);
  const current={source,gain,context:ctx};voice=current;music.effectVoices?.add(source);
  source.onended=()=>{music.effectVoices?.delete(source);source.disconnect();gain.disconnect();if(voice===current)voice=null;};source.start();return true;
 }
 return {emit,stop,dispose(){stop();disposed=true;buffers.clear();}};
}

export function installBubbleFeedback(document,music,options={}){
 const feedback=createBubbleFeedback(music,{...options,visible:()=>!document.hidden}),cleanups=[],captured=new WeakMap();
 let lastButton=null,lastAt=-Infinity,activeEvent=null;
 const target=eventButton;
 function role(event){return buttonSoundRole(target(event),event);}
 function handles(event){if(captured.has(event))return captured.get(event);return !['silent','owned'].includes(role(event));}
 function listen(type,fn,capture=false){document.addEventListener(type,fn,capture);cleanups.push(()=>document.removeEventListener(type,fn,capture));}
 function hover(event){if(role(event)!=='primary')return;const b=target(event);if(event.type==='pointerover'&&event.relatedTarget&&b.contains(event.relatedTarget))return;const now=performance.now();if(b===lastButton&&now-lastAt<120)return;lastButton=b;lastAt=now;feedback.emit('hover');}
 listen('pointerover',hover);listen('focusin',hover);
 listen('click',event=>{
  const kind=role(event),handled=!['silent','owned'].includes(kind);captured.set(event,handled);activeEvent=event;
  queueMicrotask(()=>{if(activeEvent===event)activeEvent=null;if(event.isTrusted&&handled&&kind!=='domain'&&!event.defaultPrevented)feedback.emit(kind);});
 },true);
 listen('visibilitychange',()=>{if(document.hidden)feedback.stop();});
 return {handles,command(){if(activeEvent&&handles(activeEvent))return false;return music.sfx?.('ui')??false;},dispose(){cleanups.forEach(f=>f());feedback.dispose();}};
}
