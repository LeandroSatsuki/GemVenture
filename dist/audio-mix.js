// User multipliers BEFORE the existing scene master. At 1/1, the approved
// home/combat/miner/Zag gain levels remain unchanged. One AudioContext only.
const attachments=new WeakMap();
export function attachAudioMix(engine){
 if(attachments.has(engine))return attachments.get(engine);
 let preferences={enabled:true,musicVolume:1,sfxVolume:1},ctx=null,musicBus=null,sfxBus=null,disposed=false;
 const original=new Map();
 function ensure(){
  if(!engine.ctx||!engine.master)return false;
  if(ctx===engine.ctx)return true;
  ctx=engine.ctx;musicBus=ctx.createGain();sfxBus=ctx.createGain();
  musicBus.gain.value=0;sfxBus.gain.value=0;
  musicBus.connect(engine.master);sfxBus.connect(engine.master);
  engine.musicBus=musicBus;engine.sfxBus=sfxBus;return true;
 }
 function apply(next){
  preferences={...next};if(disposed||!ensure())return;
  for(const [bus,value]of [[musicBus,next.musicVolume],[sfxBus,next.sfxVolume]]){
   const level=next.enabled?value:0;
   bus.gain.cancelScheduledValues(ctx.currentTime);
   if(!next.enabled)bus.gain.setValueAtTime(0,ctx.currentTime);
   else bus.gain.setTargetAtTime(level,ctx.currentTime,.015);
  }
 }
 engine.outputFor=effect=>{if(!ensure())return engine.master;return effect||engine.effectChannel?sfxBus:musicBus;};
 // Explicit synchronous SFX entry points, not inferred from note shape or pitch.
 for(const name of ['sfx','events','milestone','forge','hit','boom','reward','loot','zagReward']){
  if(typeof engine[name]!=='function')continue;const method=engine[name];original.set(name,method);
  engine[name]=function(...args){const previous=this.effectChannel;this.effectChannel=true;try{return method.apply(this,args);}finally{this.effectChannel=previous;}};
 }
 const api={apply,refresh:()=>apply(preferences),dispose(){
  if(disposed)return;disposed=true;
  for(const [name,method]of original)engine[name]=method;
  musicBus?.disconnect();sfxBus?.disconnect();delete engine.outputFor;delete engine.musicBus;delete engine.sfxBus;attachments.delete(engine);
 }};attachments.set(engine,api);return api;
}
