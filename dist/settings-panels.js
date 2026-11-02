import {getVideoPreferences,VIDEO_CONTROLS} from './video-preferences.js';
import {getBossHelpPreferences} from './boss-help-preferences.js';
import {getHudLayoutPreferences} from './hud-layout.js';
import {DEFAULT_AUDIO} from './audio-settings.js';

// Presentation bindings only; the existing owners retain values, persistence and effects.
export function bindSettingsPanels(settings,{services,onChange=()=>{},video,help,hud,editHud}={}){
 const $=selector=>settings.querySelector?.(selector);
 if(!$('#settingsVideoPanel'))return {open(){},close(){},refresh(){},dispose(){},persisted:()=>true,focusTarget:()=>null};
 const preferences=video??getVideoPreferences(),tabs=[...settings.querySelectorAll('[data-settings-tab]')],cleanups=[];
 const helpInput=$('#settingsBossHelp'),helpPreferences=helpInput?(help??getBossHelpPreferences()):null;
 const hudButton=$('#settingsEditHud'),hudPreferences=hudButton?(hud??getHudLayoutPreferences()):null;let editor=null,editorEpoch=0;
 let selected='video',unsubscribe=null,unsubscribeHelp=null,unsubscribeHud=null,disposed=false;
 const listen=(node,type,fn)=>{node.addEventListener(type,fn);cleanups.push(()=>node.removeEventListener(type,fn));};
 function refresh(){
  if(disposed)return;const state=preferences.getState();if(helpInput)helpInput.checked=helpPreferences.getState().enabled;
  for(const {key} of VIDEO_CONTROLS){const input=$('[data-video-key="'+key+'"]');input.value=String(state[key]);input.setAttribute('aria-valuetext',state[key]+'%');$('#'+input.getAttribute('aria-controls')).textContent=state[key]+'%';}
  for(const input of settings.querySelectorAll('[data-video-layer]'))input.checked=state.camadas[input.dataset.videoLayer];
  if($('#settingsCamera')){$('#settingsCamera').value=String(state.distancia_camera_pct);$('#settingsCamera').setAttribute('aria-valuetext',state.distancia_camera_pct+'%');$('#settingsCameraValue').textContent=state.distancia_camera_pct+'%';}
 }
 function select(tab,{focus=false,notify=true}={}){
  selected=tab.dataset.settingsTab;
  for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.setAttribute('tabindex',active?'0':'-1');$('#'+item.getAttribute('aria-controls')).hidden=!active;}
  for(const button of settings.querySelectorAll('[data-settings-reset]'))button.hidden=button.dataset.settingsReset!==selected;
  if(focus)tab.focus({preventScroll:true});if(notify)onChange();
 }
 for(const tab of tabs){
  listen(tab,'click',()=>select(tab));
  listen(tab,'keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length;select(tabs[next],{focus:true});});
 }
 for(const {key} of VIDEO_CONTROLS){const input=$('[data-video-key="'+key+'"]');listen(input,'input',()=>preferences.set({[key]:Number(input.value)}));}
 for(const input of settings.querySelectorAll('[data-video-layer]'))listen(input,'change',()=>preferences.set({camadas:{[input.dataset.videoLayer]:input.checked}}));
 if(helpInput)listen(helpInput,'change',()=>helpPreferences.setEnabled(helpInput.checked));
 if($('#settingsCamera')){listen($('#settingsCamera'),'input',()=>preferences.set({distancia_camera_pct:Number($('#settingsCamera').value)}));listen($('#settingsCameraReset'),'click',()=>preferences.resetCamera());}
 if(hudButton)listen(hudButton,'click',async()=>{const epoch=++editorEpoch;hudButton.disabled=true;try{const open=editHud??(await import('./hud-editor.js')).openHudEditor;if(disposed||epoch!==editorEpoch)return;editor=await open({document:settings.ownerDocument,preferences:hudPreferences,onApply:()=>{$('#settingsClose')?.click();},onClose:()=>hudButton.focus?.()});if(disposed||epoch!==editorEpoch)editor?.close?.();}catch{hudButton.textContent='Tentar abrir editor';}finally{hudButton.disabled=false;}});
 listen($('#settingsVideoReset'),'click',()=>preferences.reset());
 listen($('#settingsAudioReset'),'click',()=>{services.audio.controller.set({enabled:DEFAULT_AUDIO.enabled,musicVolume:DEFAULT_AUDIO.musicVolume,sfxVolume:DEFAULT_AUDIO.sfxVolume});void services.audio.controller.unlock();});
 // UI reset remains bound by menu-controller to its original global service.
 select(tabs.find(tab=>tab.dataset.settingsTab===selected),{notify:false});
 return {
  open(){if(disposed)return;if(!unsubscribe)unsubscribe=preferences.subscribe(()=>{refresh();onChange();});if(helpPreferences&&!unsubscribeHelp)unsubscribeHelp=helpPreferences.subscribe(()=>{refresh();onChange();});if(hudPreferences&&!unsubscribeHud)unsubscribeHud=hudPreferences.subscribe(()=>{refresh();onChange();});refresh();},
  close(){editorEpoch++;editor?.close?.();editor=null;unsubscribe?.();unsubscribe=null;unsubscribeHelp?.();unsubscribeHelp=null;unsubscribeHud?.();unsubscribeHud=null;},refresh,
  persisted:()=>preferences.getStatus().persisted&&(!helpPreferences||helpPreferences.getStatus().persisted)&&(!hudPreferences||hudPreferences.getStatus().persisted),
  focusTarget:()=>tabs.find(tab=>tab.dataset.settingsTab===selected),
  dispose(){if(disposed)return;disposed=true;editorEpoch++;editor?.close?.();unsubscribeHud?.();unsubscribeHud=null;unsubscribe?.();unsubscribe=null;unsubscribeHelp?.();unsubscribeHelp=null;for(const off of cleanups)off();}
 };
}
