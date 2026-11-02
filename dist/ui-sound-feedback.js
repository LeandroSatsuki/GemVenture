// One short, authored response to a confirmed semantic result. UI stays
// immediate, centred and on the existing SFX bus; it never changes BeatClock.
export const UI_SOUND_PROFILES=Object.freeze({
 open:{cooldown:.1,notes:[[392,.07,'sine',.043,0],[784,.075,'sine',.024,.025]]},
 close:{cooldown:.1,notes:[[392,.075,'sine',.036,0,294]]},
 select:{cooldown:.08,notes:[[660,.05,'sine',.026,0]]},
 set:{cooldown:.15,notes:[[392,.07,'triangle',.045,0],[587.33,.09,'sine',.042,.04]]},
 unset:{cooldown:.15,notes:[[587.33,.055,'sine',.034,0],[392,.075,'sine',.038,.035]]},
 refund:{cooldown:.15,notes:[[523.25,.06,'sine',.035,0],[392,.08,'sine',.04,.04]]},
 deny:{cooldown:.3,notes:[[294,.12,'triangle',.041,0,246.94]]},
 reward:{cooldown:.6,notes:[[523.25,.11,'sine',.069,0],[659.25,.13,'sine',.061,.07],[783.99,.17,'sine',.061,.15]]}
});

export function createTreeSoundFeedback(music,{preferences=()=>({enabled:true,sfxVolume:1}),onEmission=()=>{}}={}){
 const last=new Map();let opened=false,disposed=false;
 function emit(kind,detail={}){
  const profile=UI_SOUND_PROFILES[kind];if(!profile||disposed)return false;
  const ctx=music.ctx,prefs=preferences();
  if(!music.enabled||!ctx||ctx.state!=='running'||prefs.enabled===false||prefs.sfxVolume===0)return false;
  const at=ctx.currentTime;
  if(at-(last.get(kind)??-Infinity)<profile.cooldown)return false;
  const voices=(music.voices?.size||0)+(music.effectVoices?.size||0);
  if(voices+profile.notes.length>64)return false;
  last.set(kind,at);
  for(const [freq,duration,wave,level,delay,slide]of profile.notes)
   music.tone(freq,duration,wave,level,at+delay,slide,.006,true);
  onEmission({kind,at,notes:profile.notes.length,bus:'SFX',...detail});return true;
 }
 return {
  emit,
  setOpen(value){if(disposed||value===opened)return false;opened=value;return emit(value?'open':'close');},
  read:()=>({opened,disposed}),
  dispose(){disposed=true;last.clear();}
 };
}
