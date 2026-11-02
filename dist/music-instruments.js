// Small reusable WebAudio voices. Nodes are disconnected on completion; there
// are no per-frame effects, large samples or indefinitely running oscillators.
export function playInstrument(m,event,at){
 const {kind,freq,duration,level,color,pan=0}=event,ctx=m.ctx;
 if(m.voices.size+m.effectVoices.size>78)return;
 if(kind==='kick'){m.tone(155,duration,'sine',level,at,42,.004);return;}
 if(kind==='snare'){m.tone(185,.085,'triangle',level*.65,at,70,.003);m.noise(duration,level,at,1200);return;}
 if(kind==='hat'||kind==='crash'){m.noise(duration,level,at,event.cutoff||4700);return;}
 if(kind==='tom'){m.tone(freq,.14,'sine',level,at,freq*.4,.004);return;}
 if(kind==='cue'){m.tone(freq,duration,'sine',level,at);m.tone(freq*2,.09,'triangle',.045,at);return;}
 if(kind==='vocal'){m.vocal(freq,duration,at,level);return;}
 // Also allows the event scheduler to be inspected without a live audio device.
 if(!ctx.createBiquadFilter){m.tone(freq,duration,kind==='guitar'?'sawtooth':'triangle',level,at);return;}
 const oscillators=[],nodes=[],gain=ctx.createGain(),filter=ctx.createBiquadFilter();nodes.push(gain,filter);
 filter.type='lowpass';filter.frequency.setValueAtTime(kind==='guitar'?2600:kind==='bass'?900:4200,at);
 let entry=filter,attack=.005,sustain=.14;
 const oscillator=(f,type='sine',detune=0)=>{
  const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,at);o.detune.value=detune;o.connect(entry);oscillators.push(o);return o;
 };
 if(kind==='guitar'){
  m.driveCurves??={};const amount=color==='metal'?16:7;
  if(!m.driveCurves[amount]){const c=new Float32Array(512);for(let i=0;i<c.length;i++)c[i]=Math.tanh(amount*(i*2/(c.length-1)-1));m.driveCurves[amount]=c;}
  const drive=ctx.createWaveShaper();drive.curve=m.driveCurves[amount];drive.oversample='2x';drive.connect(filter);nodes.push(drive);entry=drive;
  oscillator(freq,'sawtooth',-4);oscillator(freq*1.4983,'sawtooth',4);
  filter.frequency.exponentialRampToValueAtTime(850,at+duration);sustain=.3;
 }else if(kind==='acid'){
  filter.Q.value=8;const cutoff=Math.min(6500,freq*(event.accent?28:16)*(1+event.brightness));
  filter.frequency.setValueAtTime(cutoff,at);filter.frequency.exponentialRampToValueAtTime(Math.max(110,freq*2),at+duration);
  oscillator(freq,'sawtooth');sustain=.05;
 }else if(kind==='sing'){
  const vowel={a:[800,1150,2900],i:[350,2200,3000],o:[450,800,2830],u:[325,700,2530]}[event.vowel]||[800,1150,2900];
  const split=ctx.createGain();split.gain.value=.4;nodes.push(split);
  for(const f of vowel){const band=ctx.createBiquadFilter();band.type='bandpass';band.Q.value=6;band.frequency.setValueAtTime(f,at);split.connect(band);band.connect(filter);nodes.push(band);}
  entry=split;const voice=oscillator(freq,'sawtooth'),vibrato=ctx.createOscillator(),depth=ctx.createGain();
  vibrato.type='sine';vibrato.frequency.setValueAtTime(5.5,at);depth.gain.value=freq*.008;vibrato.connect(depth);depth.connect(voice.frequency);oscillators.push(vibrato);nodes.push(depth);
  filter.frequency.value=6200;attack=.022;sustain=.55;
 }else if(kind==='bass'){
  oscillator(freq,color==='chip'?'square':color==='reese'?'sawtooth':color==='sub'||color==='soft'?'sine':'triangle',color==='reese'?-7:0);
  if(color==='reese')oscillator(freq,'sawtooth',7);
  if(color==='slap'){filter.frequency.setValueAtTime(3600,at);filter.frequency.exponentialRampToValueAtTime(350,at+duration);oscillator(freq*2,'sine');}
 }else if(kind==='pluck'||kind==='keys'){
  const o=oscillator(freq,color==='wood'?'sine':color==='clav'?'square':'sine');
  if(color==='bell'||color==='bright'){
   const mod=ctx.createOscillator(),depth=ctx.createGain();mod.frequency.setValueAtTime(freq*2,at);
   depth.gain.setValueAtTime(freq*(color==='bright'?1.1:1.8),at);depth.gain.exponentialRampToValueAtTime(1,at+duration);
   mod.connect(depth);depth.connect(o.frequency);oscillators.push(mod);nodes.push(depth);
  }else if(color==='wood')oscillator(freq*3,'sine');
  filter.frequency.value=color==='clav'?1800:kind==='pluck'?3800:2800;
 }else{
  // A soft detuned pad differs from a short square disco lead, even at one BPM.
  oscillator(freq,kind==='pad'?'triangle':color==='disco'||color==='chip'?'square':'sawtooth',color==='chip'?0:-6);
  if(kind==='pad')oscillator(freq,'triangle',6);
  if(color==='supersaw')oscillator(freq,'sawtooth',6);
  filter.frequency.value=kind==='pad'?1200:color==='chip'?6200:color==='brass'?2700:2100;attack=kind==='pad'?Math.min(.22,duration*.15):color==='chip'?.004:.025;sustain=kind==='pad'?.65:color==='brass'?.65:.35;
 }
 filter.connect(gain);let output=gain;
 if(pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=pan;gain.connect(p);nodes.push(p);output=p;}
 output.connect(typeof m.outputFor==='function'?m.outputFor(false):m.master);
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level,at+Math.min(duration*.25,attack));
 gain.gain.exponentialRampToValueAtTime(Math.max(.0001,level*sustain),at+duration*.55);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 let remaining=oscillators.length;
 for(const o of oscillators){m.voices.add(o);o.start(at);o.stop(at+duration+.02);o.onended=()=>{m.voices.delete(o);o.disconnect();if(--remaining===0)for(const n of nodes)n.disconnect();};}
}
