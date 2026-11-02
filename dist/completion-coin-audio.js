// Finite, non-melodic coin trickles. Presentation never grants currency.
export function coinFillPlan({coins,reason,phase='count',duration=.6}={}){
 if(!Number.isFinite(coins)||coins<=0||!['count','transfer'].includes(phase)||!Number.isFinite(duration)||duration<=0)return [];
 const seconds=Math.min(1.2,Math.max(.12,duration)),loss=reason==='death',count=Math.min(loss?6:11,Math.max(2,Math.ceil(seconds*(loss?6:10))));
 const pitches=loss?[1120,1267,1183]:[1643,1979,1823,2131,1733];
 return Array.from({length:count},(_,i)=>{
  const p=i/(count-1),at=(seconds-.09)*(1-(1-p)**.88),frequency=pitches[i%pitches.length];
  return {at,frequency,tail:.075,level:(loss?.022:.035)*(phase==='transfer'?1:.82)*(i===count-1?.8:1)};
 });
}

export function createCoinFillAudio(music,{preferences=()=>({enabled:music.enabled,sfxVolume:1}),visible=()=>true}={}){
 const voices=new Set(),seen=new Set();let disposed=false;
 function cancel(){for(const v of [...voices]){try{v.oscillator.stop();}catch{}v.cleanup();}}
 function play(key,options){
  if(disposed||seen.has(key))return false;seen.add(key);if(seen.size>32)seen.delete(seen.values().next().value);
  cancel();const plan=coinFillPlan(options),ctx=music.ctx,prefs=preferences();
  if(!plan.length||!visible()||prefs.enabled===false||!(prefs.sfxVolume>0)||!music.enabled||!ctx||ctx.state!=='running'||!music.sfxBus)return false;
  // Reserve the entire finite burst before allocation; leave space for other SFX.
  if((music.voices?.size||0)+(music.effectVoices?.size||0)+plan.length*2>64)return false;
  const now=ctx.currentTime;
  for(const tap of plan)for(const [ratio,weight]of [[1,1],[1.487,.27]]){
   const oscillator=ctx.createOscillator(),gain=ctx.createGain(),at=now+tap.at,end=at+tap.tail;
   oscillator.type='sine';oscillator.frequency.setValueAtTime(tap.frequency*ratio,at);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(tap.level*weight,at+.0025);gain.gain.exponentialRampToValueAtTime(.0001,end);
   oscillator.connect(gain);gain.connect(music.sfxBus);let ended=false;
   const voice={oscillator,cleanup(){if(ended)return;ended=true;voices.delete(voice);music.effectVoices?.delete(oscillator);oscillator.disconnect();gain.disconnect();}};
   voices.add(voice);music.effectVoices?.add(oscillator);oscillator.onended=voice.cleanup;oscillator.start(at);oscillator.stop(end+.005);
  }
  return true;
 }
 return {play,cancel,reset(){cancel();seen.clear();},dispose(){cancel();seen.clear();disposed=true;},read:()=>({voices:voices.size,seen:seen.size,disposed})};
}
