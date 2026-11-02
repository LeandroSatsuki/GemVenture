// Read-only projection of the EXISTING audio route. Never calls audio methods.
// audioRoute must describe the actual scheduled bus, not infer it from preview UI.
export function readGramophonePlayback({music,audioRoute='silent',refugeVisible=false,hidden=false}={}){
  if(!refugeVisible||hidden)return {playing:false,source:'none',reason:'not-visible'};
  if(audioRoute!=='home')return {playing:false,source:'none',reason:'other-audio-route'};
  if(!music?.enabled||music.ctx?.state!=='running')return {playing:false,source:'none',reason:'audio-disabled-or-suspended'};
  const preview=music.preview,now=music.ctx.currentTime;
  const previewActive=!!preview&&Number.isFinite(now)&&Number.isFinite(preview.until)&&now<preview.until;
  if(music.recordedHomePlaying===false&&!previewActive)return {playing:false,source:'none',reason:'track-loading-or-paused'};
  return {playing:true,source:previewActive?'preview':'home',reason:'existing-home-route'};
}
