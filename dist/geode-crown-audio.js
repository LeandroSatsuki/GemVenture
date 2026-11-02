// Native Kenney CC0 stone impacts + short synthesized low end and a moving air crest.
// All voices use the existing SFX bus and AudioContext clock; pause cancels scheduled tails.
function whoosh(music,at){const ctx=music.ctx;if(!ctx.createBufferSource||!ctx.createBiquadFilter||!music.effectVoices){music.noise(.22,.10,at,650);return;}if(music.effectVoices.size>=24)return;if(!music.noiseBuffer)music.noise(.001,.0001,at,1000);
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=music.noiseBuffer;filter.type='bandpass';filter.Q.value=.8;filter.frequency.setValueAtTime(380,at);filter.frequency.linearRampToValueAtTime(1900,at+.07);filter.frequency.exponentialRampToValueAtTime(240,at+.28);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.16,at+.022);gain.gain.exponentialRampToValueAtTime(.0001,at+.30);source.connect(filter);filter.connect(gain);gain.connect(music.outputFor(true));music.effectVoices.add(source);source.onended=()=>{music.effectVoices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+.31);
}
export function createCrownAudio(music){const heard=new Set();let lastWaveBeat=-Infinity;return{reset(){heard.clear();lastWaveBeat=-Infinity;},consume(events){for(const e of events){if(!['geodeCrownFracture','geodeCrownSlam','geodeCrownRearPulse','geodeCrownWaveStep'].includes(e.type)||heard.has(e.id)||!music.enabled||!music.ctx)continue;heard.add(e.id);while(heard.size>24)heard.delete(heard.values().next().value);const at=music.ctx.currentTime,previous=music.effectChannel;music.effectChannel=true;try{
 if(e.type==='geodeCrownWaveStep'){if(lastWaveBeat===e.beat)continue;lastWaveBeat=e.beat;whoosh(music,at);music.bossImpactAudio?.play?.('stone',{gain:.16,rate:1.2-(e.ring||0)*.07,at:at+.025});continue;}
 if(e.type==='geodeCrownRearPulse'){music.noise(.08,.18,at,200);music.tone(150,.12,'sine',.25,at,65,.004,true);continue;}
 if(e.type==='geodeCrownSlam'){
  music.bossImpactAudio?.play?.('slam',{gain:.68,rate:.72,at});music.bossImpactAudio?.play?.('stone',{gain:.53,rate:.78,at:at+.006});
  // Three quieter falling chips, with different mass and spacing.
  for(let i=0;i<3;i++)music.bossImpactAudio?.play?.('stone',{gain:.16-i*.035,rate:1.4-i*.23,at:at+.09+i*.075});
  music.noise(.10,.20,at,180);music.tone(90,.24,'sine',.28,at,32,.002,true);music.tone(145,.12,'triangle',.16,at,58,.002,true);continue;
 }
 music.noise(.15,.28,at,1450);music.tone(210,.13,'triangle',.35,at,70,.002,true);for(let i=0;i<3;i++)music.tone(1480+i*310,.13+i*.035,'sine',.22,at+i*.025,780+i*140,.003,true);
 }finally{music.effectChannel=previous;}}}};}
