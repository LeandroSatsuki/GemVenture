// Kenney Impact Sounds 1.0 / CC0. Small decoded bank; existing AudioContext and
// SFX bus own volume, mute and pause. A missing file leaves synthesized cues.
export const BOSS_SAMPLES=Object.freeze({stone:'impactMining_000.ogg',crystal:'impactGlass_medium_000.ogg',slam:'impactPunch_heavy_000.ogg'});
export function bossImpactCues(events){
 const out=[];
 for(const e of events){
  if(e.type==='geodeEruption')out.push({id:'stone',gain:.62,rate:.82},{id:'crystal',gain:.19,rate:.9});
  else if(e.type==='geodePulse'&&e.version===1&&e.bossIndex===0)out.push({id:'stone',gain:.65,rate:.66});
  else if(e.type==='carrotSlam')out.push({id:'slam',gain:.55,rate:.8});
  else if(e.type==='emerge'||e.type==='rockfall')out.push({id:'stone',gain:.4,rate:.9});
 }
 return [...new Map(out.map(c=>[c.id,c])).values()].slice(0,2);
}
export function createBossImpactAudio(engine,{read=url=>fetch(url)}={}){
 let promise=null,context=null;const buffers=new Map(),last=new Map();
 function prepare(){
  if(!engine.ctx?.decodeAudioData)return Promise.resolve(false);
  if(context!==engine.ctx){context=engine.ctx;promise=null;buffers.clear();}
  return promise??=Promise.all(Object.entries(BOSS_SAMPLES).map(async([id,file])=>{try{const response=await read('./assets/audio/boss-impact/'+file);if(!response.ok)return;const decoded=await context.decodeAudioData(await response.arrayBuffer());buffers.set(id,decoded);}catch{}})).then(()=>buffers.size===3);
 }
 function consume(events){
  if(!engine.enabled||engine.ctx?.state!=='running')return 0;
  void prepare();let played=0;const ctx=engine.ctx,now=ctx.currentTime;
  for(const cue of bossImpactCues(events)){
   const buffer=buffers.get(cue.id);if(!buffer||now-(last.get(cue.id)??-Infinity)<.18||engine.effectVoices.size>=16)continue;
   last.set(cue.id,now);const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.playbackRate.value=cue.rate;gain.gain.value=cue.gain;
   source.connect(gain);gain.connect(engine.outputFor?.(true)??engine.master);engine.effectVoices.add(source);
   source.onended=()=>{engine.effectVoices.delete(source);source.disconnect();gain.disconnect();};source.start(now);played++;
  }return played;
 }
 function play(id,{gain:level=.4,rate=1,at=engine.ctx?.currentTime}={}){
  const ctx=engine.ctx,buffer=buffers.get(id);if(!engine.enabled||ctx?.state!=='running'||!buffer||engine.effectVoices.size>=16)return false;
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.playbackRate.value=Math.max(.5,Math.min(1.6,rate));gain.gain.value=Math.max(0,Math.min(.8,level));source.connect(gain);gain.connect(engine.outputFor?.(true)??engine.master);engine.effectVoices.add(source);
  source.onended=()=>{engine.effectVoices.delete(source);source.disconnect();gain.disconnect();};source.start(Math.max(ctx.currentTime,at));return true;
 }
 return {prepare,consume,play,status:()=>({loaded:buffers.size})};
}
