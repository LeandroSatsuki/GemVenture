import{createMysticSfx}from'./mystic-sfx.js';
import{createRabbitPolishedSfx}from'./rabbit-polished-sfx.js';
import{createMicelialSfx}from'./micelial-sfx.js';
import {createMatriarchSfx} from './matriarch-sfx.js';
import {createBossImpactAudio} from './boss-impact-audio.js';
import {ALL_TRACKS as TRACKS,trackBeatPhase,trackBeatTime} from './score.js';
import {SOUND_CUES,eventSoundCues} from './sound-design.js';
import {recordById} from './records.js';
import {arrangementStep} from './music-arrangements.js';
import {playInstrument} from './music-instruments.js';
import {validTrainingBpm} from './training-clock.js';
export const BPM=116;
export const BEAT=60/BPM;
// Scheduled notes run on the audio thread. Keep enough overlap for a brief
// render/GC stall; phase/time mapping and the gameplay judgment stay unchanged.
const MUSIC_SCHEDULE_AHEAD=.24;
// GV-023 approved refuge composition. Combat transport and preferences stay independent.
const HOME_BEAT=60/64;
// Same home subdivision clock; no voices, preferences or AudioContext created.
export function nextHomePulseDelay(elapsed,minimum=.72){if(!Number.isFinite(elapsed)||elapsed<0||!Number.isFinite(minimum)||minimum<0)return .8;const step=HOME_BEAT/2;return Math.ceil((elapsed+minimum)/step)*step-elapsed;}
const HOME_LIMITS=Object.freeze({voices:32,master:.14,nearMaster:.17,lookahead:.12});
const midi=n=>440*2**((n-69)/12);
const CHORDS=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,53,59]];
const THEMES=[[67,null,64,69,67,null,62,64],[64,null,67,72,71,null,67,64],[65,null,69,67,64,null,60,64],[62,null,67,71,69,null,67,null]];
function homeStep(step,{near=false,groove='house'}={}){
 if(!Number.isSafeInteger(step)||step<0)return [];
 const q=step%16,bar=Math.floor(step/16),phrase=Math.floor(bar/4),chord=CHORDS[bar%4],events=[];
 if(q===0)for(const note of chord.slice(0,3))events.push({role:'pad',freq:midi(note),duration:HOME_BEAT*8.4,attack:.42,hold:HOME_BEAT*5.5,level:.039,wave:'sine'});
 if(q===0||q===8)events.push({role:'bass',freq:midi(chord[0]-12),duration:HOME_BEAT*2.4,attack:.075,hold:HOME_BEAT*.8,level:.075,wave:'sine'});
 if(q%2===0){const note=THEMES[bar%4][q/2];if(note!==null)events.push({role:'keys',freq:midi(note+(phrase%2&&q===12?12:0)),duration:HOME_BEAT*.82,attack:.025,hold:.24,level:.105,wave:groove==='rock'?'triangle':'sine'});}
 if(q===13&&bar%2===1)events.push({role:'answer',freq:midi(chord[2]+24),duration:.65,attack:.055,hold:.12,level:.038,wave:'sine'});
 if(near&&q===6)events.push({role:'near',freq:midi(chord[2]+12),duration:.8,attack:.07,hold:.18,level:.04,wave:'triangle'});
 return events;
}
function playHomeVoice(music,event,at){
 if(!music.enabled||!music.ctx||music.ctx.state!=='running'||music.voices.size+music.effectVoices.size>=HOME_LIMITS.voices)return false;
 const ctx=music.ctx,o=ctx.createOscillator(),g=ctx.createGain(),end=at+event.duration,hold=Math.min(at+event.hold,end-.08),attack=Math.min(at+event.attack,hold);
 o.type=event.wave;o.frequency.setValueAtTime(event.freq,at);
 g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(event.level,attack);g.gain.setValueAtTime(event.level,hold);g.gain.exponentialRampToValueAtTime(.0001,end);
 o.connect(g);g.connect(music.outputFor?.()??music.master);o.start(at);o.stop(end+.02);music.voices.add(o);
 o.onended=()=>{music.voices.delete(o);o.disconnect();g.disconnect();};return true;
}
function createHomeScene(music){
 return function home(elapsed,nearGramophone=false){
  if(!music.enabled||!music.ctx||music.ctx.state!=='running'||!Number.isFinite(elapsed)||elapsed<0)return;
  if(music.preview){const preview=music.preview;if(music.ctx.currentTime<preview.until){const equipped=music.record;music.record=preview.record;try{music.update(music.ctx.currentTime-preview.startedAt,preview.record.previewTrack);}finally{music.record=equipped;}return;}music.stopPreview();}
  const now=music.ctx.currentTime;
  if(music.track!=='home'){
   music.silence(false);music.track='home';
   // A short quiet welcome sounds on entry; the main phrase still uses the existing 64 BPM grid.
   for(const [i,note]of [60,67,64].entries())playHomeVoice(music,{freq:midi(note),duration:1.2,attack:.06,hold:.35,level:i?.036:.055,wave:'sine'},now+i*.105);
  }
  music.master.gain.setTargetAtTime(nearGramophone?HOME_LIMITS.nearMaster:HOME_LIMITS.master,now,1.2);
  const half=HOME_BEAT/2,first=Math.floor(elapsed/half),last=Math.floor((elapsed+HOME_LIMITS.lookahead)/half);
  if(music.step<first-2)music.step=first-1;
  for(let i=music.step+1;i<=last;i++){const at=now+i*half-elapsed;if(at<now-1e-7)continue;for(const event of homeStep(i,{near:nearGramophone,groove:music.record.groove})){const time=Math.max(now,at);if(event.role==='near'&&music.record.groove==='opera'){if(music.voices.size+music.effectVoices.size<HOME_LIMITS.voices)music.vocal(event.freq,event.duration,time,.07);}else playHomeVoice(music,event,time);}}
  music.step=last;
 };
}

export class Music{
 constructor(){this.enabled=false;this.ctx=null;this.step=-1;this.voices=new Set();this.effectVoices=new Set();this.record=recordById('pulse');this.bossImpactAudio=createBossImpactAudio(this);}
 setRecord(id){const next=recordById(id)||recordById('pulse');if(this.record.id===next.id)return;this.record=next;this.silence(false);}
 previewRecord(id){
  const record=recordById(id);
  if(!record||!this.enabled||!this.ctx||this.ctx.state!=='running')return false;
  this.silence(false);
  this.preview={record,startedAt:this.ctx.currentTime,until:this.ctx.currentTime+5};
  // Prime the real arrangement inside the accepted click, including its first beat.
  // A hub/tutorial frame is not required before the five-second sample can sound.
  this.home(0,true);
  return true;
 }
 stopPreview(){if(!this.preview)return;this.preview=null;this.silence(false);}
 async enable(){if(!this.ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=.2;this.master.connect(this.ctx.destination);}try{await this.ctx.resume();this.enabled=true;this.step=-1;void this.bossImpactAudio.prepare();return true;}catch{return false;}}
 stop(){this.enabled=false;this.silence();}
 sfx(id){
  if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!SOUND_CUES[id])return false;
  const t=this.ctx.currentTime;this.lastSfx??={};
  const gap=['pick','crystal','kill','proc'].includes(id)?.16:id==='ui'?.08:.3;
  if(t-(this.lastSfx[id]??-Infinity)<gap||this.voices.size+this.effectVoices.size>80)return false;
  this.lastSfx[id]=t;
  for(const [freq,duration,type,gain,delay,slide]of SOUND_CUES[id])this.tone(freq,duration,type,gain,t+delay,slide,.008,true);
  return true;
 }
 events(events){(this.mysticSfx??=createMysticSfx(this)).accept(events);(this.rabbitPolishedSfx??=createRabbitPolishedSfx(this)).accept(events);(this.micelialSfx??=createMicelialSfx(this)).accept(events);(this.matriarchSfx??=createMatriarchSfx(this)).accept(events);this.bossImpactAudio.consume(events);for(const cue of eventSoundCues(events))this.sfx(cue);}
 silence(effects=true,preservePreview=false){for(const group of effects?[this.voices,this.effectVoices]:[this.voices]){for(const voice of group){try{voice.stop();}catch{}}group.clear();}this.step=-1;if(!preservePreview)this.preview=null;}
 tone(freq,duration,type,volume,at,slide,attack=.008,effect=false){if(!this.enabled||!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);if(slide)o.frequency.exponentialRampToValueAtTime(slide,at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+Math.min(duration*.4,attack));g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(this.outputFor(effect));o.start(at);o.stop(at+duration+.02);const group=(effect||this.effectChannel)?this.effectVoices:this.voices;group.add(o);o.onended=()=>{group.delete(o);o.disconnect();g.disconnect();};}
 update(elapsed,biome,mood={}){
  if(!this.enabled||this.ctx.state!=='running')return;
  const track=TRACKS[biome]||TRACKS[0];this.master?.gain.setTargetAtTime(.2,this.ctx.currentTime,.5);
  if(this.track!==biome){this.silence(false,true);this.track=biome;}
  const trainingBpm=validTrainingBpm(mood.trainingBpm)?mood.trainingBpm:null;
   if(this.trainingBpm!==trainingBpm){this.silence(false,true);this.trainingBpm=trainingBpm;}
   const phaseAt=trainingBpm?t=>t*trainingBpm/60:t=>trackBeatPhase(biome,t);
   const timeAt=trainingBpm?b=>b*60/trainingBpm:b=>trackBeatTime(biome,b);
   const now=this.ctx.currentTime,first=Math.floor(phaseAt(elapsed)*4);
  if(this.step<first-2)this.step=first-1;
  const max=Math.floor(phaseAt(elapsed+MUSIC_SCHEDULE_AHEAD)*4);
  for(let i=this.step+1;i<=max;i++){
   const at=now+timeAt(i/4)-elapsed;if(at<now-1e-7)continue;
   if(mood.sonic&&i%4===2)this.tone(92,.09,'sine',.15,at,44);if(mood.abyss&&i%8===6)this.tone(track.root*4,.1,'triangle',.025,at);
   for(const event of arrangementStep(this.record,biome,i,mood)){const delay=event.delayBeats?timeAt(i/4+event.delayBeats)-timeAt(i/4):0;playInstrument(this,event,at+delay);}
  }
  this.step=max;
 }
 // Wordless, original formant-like cry: two filtered harmonics, short enough to
 // read as a crowd/aria accent without masking the timing cue.
 vocal(freq,duration,at,level=.15){if(!this.enabled||this.voices.size>65)return;const ctx=this.ctx,o=ctx.createOscillator(),g=ctx.createGain(),a=ctx.createBiquadFilter(),b=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(freq,at);o.frequency.linearRampToValueAtTime(freq*1.055,at+duration*.5);a.type=b.type='bandpass';a.frequency.value=700;b.frequency.value=1150;a.Q.value=b.Q.value=7;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(level,at+Math.min(.06,duration*.2));g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(a);o.connect(b);a.connect(g);b.connect(g);g.connect(this.outputFor());o.start(at);o.stop(at+duration+.02);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();a.disconnect();b.disconnect();g.disconnect();};}
 noise(duration,volume,at,cutoff){if(!this.enabled)return;if(!this.noiseBuffer){this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const a=this.noiseBuffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}const source=this.ctx.createBufferSource(),g=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();source.buffer=this.noiseBuffer;filter.type='highpass';filter.frequency.value=cutoff;g.gain.setValueAtTime(volume,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(filter);filter.connect(g);g.connect(this.outputFor());source.start(at);source.stop(at+duration);const group=this.effectChannel?this.effectVoices:this.voices;group.add(source);source.onended=()=>{group.delete(source);source.disconnect();filter.disconnect();g.disconnect();};}
 milestone(combo){if(!this.enabled)return;const t=this.ctx.currentTime,root=(TRACKS[this.track||0]?.root||130.813)*4;[0,7,12].forEach((n,i)=>this.tone(root*2**(n/12),.14,'triangle',.1,t+i*.025));}

 forge(elapsed){if(!this.enabled)return 0;const beat=60/64,wait=(Math.ceil(elapsed/beat)*beat-elapsed),at=this.ctx.currentTime+wait;for(let i=0;i<3;i++){const t=at+i*beat/2;this.tone(880+i*220,.16,'triangle',.2,t);this.tone(147,.12,'sine',.2,t,50);this.noise(.05,.06,t,2200);}return wait*1000;}
 hit(perfect){if(!this.enabled)return;const t=this.ctx.currentTime;this.tone(perfect?1046.5:392,.075,'triangle',perfect?.24:.13,t);if(perfect)this.tone(1567.98,.15,'sine',.12,t+.04);}
 boom(nova=false){if(!this.enabled)return;const t=this.ctx.currentTime;if(t-(this.lastBoom??-1)<.14)return;this.lastBoom=t;this.tone(nova?150:210,nova?.48:.18,'sine',nova?.48:.22,t,nova?28:55);this.tone(nova?783.99:1567.98,nova?.5:.16,'triangle',.09,t+.012);if(nova)[523.25,659.25,1046.5].forEach((f,i)=>this.tone(f,.4,'sine',.08,t+i*.045));}
 reward(){if(!this.enabled)return;[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,.25,'sine',.18,this.ctx.currentTime+i*.085));}
 loot(index=0){if(!this.enabled)return;const f=523.25*2**([0,4,7,12][index%4]/12);this.tone(f,.16,'triangle',.12,this.ctx.currentTime);this.tone(f*2,.22,'sine',.045,this.ctx.currentTime+.025);}
 mining(elapsed){
  if(!this.enabled||this.ctx.state!=='running'||this.voices.size+this.effectVoices.size>70)return;
  if(this.track!=='mining'){this.silence(false);this.track='mining';}
  this.master.gain.setTargetAtTime(.12,this.ctx.currentTime,1.2);
  const step=Math.floor(elapsed*8);if(this.step===step)return;this.step=step;
  const at=this.ctx.currentTime,bar=Math.floor(step/32)%8,root=[130.81,130.81,155.56,116.54,130.81,174.61,155.56,116.54][bar],notes=[0,7,12,15,12,7,10,7],phase=step%32;
  // Original 120 BPM arcade groove. Contacts supply percussion accents;
  // cascades never accelerate the transport or allocate a voice per fragment.
  if(step%4===0){this.tone(125,.13,'sine',.13,at,38);this.tone(root/2,.22,'triangle',.055,at);}
  if(step%8===4){this.noise(.08,.028,at,1700);this.tone(185,.07,'triangle',.025,at,90);}
  if(step%2===0)this.noise(.025,.012,at,4800);
  if(step%4===2)this.tone(root*2**(notes[Math.floor(step/4)%8]/12)*2,.16,'triangle',.045,at);
  if(bar>=4&&step%2===1)this.tone(root*2**(notes[Math.floor(step/2)%8]/12)*4,.08,'sine',.014,at);
  if(phase===30&&bar%2===1){this.tone(root*4,.12,'triangle',.035,at);this.tone(root*6,.13,'sine',.02,at+.08);}
 }
 zag(elapsed){
  if(!this.enabled||this.ctx.state!=='running')return;
  if(this.track!=='zag'){this.silence(false);this.track='zag';}
  this.master.gain.setTargetAtTime(.13,this.ctx.currentTime,1.2);
  const step=Math.floor(Math.max(0,elapsed)*72/60*2);
  if(this.step===step)return;
  this.step=step;
  const at=this.ctx.currentTime,chords=[[130.81,164.81,196,246.94],[146.83,174.61,220,261.63],[123.47,146.83,185,220],[130.81,164.81,196,246.94]],chord=chords[Math.floor(step/16)%4],beat=step%16;
  // A four-chord lounge loop: soft bass, warm keys and a short call-and-response.
  // All phrases share the same 72 BPM pulse; no action or AFK state speeds it up.
  if(beat===0)for(const f of chord)this.tone(f,3.8,'sine',.022,at,undefined,.32);
  if(beat%4===0)this.tone(chord[0]/2,1,'sine',.046,at,undefined,.055);
  if(beat%8===6)this.tone(chord[2]/2,.48,'triangle',.018,at,undefined,.04);
  const motif={2:2,5:3,7:1,10:2,13:0,15:3};
  if(Object.hasOwn(motif,beat))this.tone(chord[motif[beat]]*2,beat===7?.43:.32,beat===15?'sine':'triangle',.026,at,undefined,.016);
  if(beat===3||beat===11)this.tone(chord[1]*2,.13,'sine',.014,at,undefined,.012);
 }
 zagReward(result,elapsed){
  if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
  const total=a=>(a||[]).reduce((n,x)=>n+x,0),loss=total(result.lost)+total(result.fee)>0;
  const beat=60/72/2,wait=Math.max(0,Math.ceil(elapsed/beat)*beat-elapsed),at=this.ctx.currentTime+wait;
  const notes=loss?[392,329.63,261.63]:result.collection||result.type==='cache'?[523.25,659.25,783.99,1046.5]:result.type==='bank'||total(result.banked)>0?[392,523.25,659.25,783.99]:[392,523.25,659.25];
  for(let i=0;i<notes.length;i++)this.tone(notes[i],loss?.22:.3,i===0?'triangle':'sine',loss?.047:.065,at+i*(loss?.13:.105),undefined,.018,true);
  if(!loss&&notes.length===4)this.tone(261.63,.65,'sine',.032,at+.1,undefined,.08,true);
 }
 home(elapsed,nearGramophone=false){return (this.homeScene??=createHomeScene(this))(elapsed,nearGramophone);}
}
