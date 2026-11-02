import {UI_PERCENT} from './ui-display.js';
import {bindSettingsPanels} from './settings-panels.js';
export function createMenuController({root,services,profile,onStart,exit,focusGame=()=>{},directEntry=false,onCloseSettings=()=>{},canResume=()=>false}){
 const doc=root.ownerDocument,$=id=>root.querySelector('#'+id),shell=$('menuShell'),main=$('menuMain'),settings=$('gameSettings');let mode='menu',busy=false,disposed=false,exitBusy=false,returnFocus=null,sampleAnimation=null;
 const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);return()=>target.removeEventListener(event,fn,options);},cleanups=[];
 const panels=bindSettingsPanels(settings,{services,onChange:()=>refresh()});
 function focus(element){element?.focus?.({preventScroll:true});}
 function refresh(){const s=services.audio.controller.getState(),p=s.preferences;$('settingsSoundEnabled').checked=p.enabled;for(const [id,key,out]of [['settingsMusicVolume','musicVolume','settingsMusicValue'],['settingsSfxVolume','sfxVolume','settingsSfxValue']]){const n=Math.round(p[key]*100);$(id).value=String(n);$(out).textContent=n+'%';$(id).setAttribute('aria-valuetext',n+'%');}
  const soft=services.visual.getMode()==='soft';$('settingsVisualEffects').checked=!soft;$('settingsVisualSoft').checked=soft;doc.body.classList.toggle('soft-fx',soft);
  sampleAnimation?.cancel();sampleAnimation=null;
  if($('settingsSoundValue'))$('settingsSoundValue').textContent=p.enabled?'Ligado':'Desligado';
  if($('settingsAudioPanel'))$('settingsAudioPanel').dataset.muted=String(!p.enabled);
  if($('settingsPreviewTitle'))$('settingsPreviewTitle').textContent=soft?'Menos movimento':'Mais impacto';
  if($('settingsPreviewCopy'))$('settingsPreviewCopy').textContent=soft?'Leitura preservada':'Brilho e movimento';
  if(services.ui&&$('settingsUiScale')){const n=services.ui.getState().percent;$('settingsUiScale').value=String(n);$('settingsUiScale').setAttribute('aria-valuetext',n+'%');$('settingsUiValue').textContent=n+'%';$('settingsUiPreview').style.fontSize=(18*n/100)+'px';}
  panels.refresh();
  if($('settingsApply'))$('settingsApply').hidden=!canResume();
  const status=$('settingsAudioStatus'),unsaved=!panels.persisted()||!s.persisted||!services.visual.getState().persisted||(services.ui&&!services.ui.getState().persisted);
  status.dataset.error=String(unsaved);
  status.textContent=unsaved?'Não foi possível salvar. Ajustes ativos nesta sessão.':!p.enabled?'Som desligado · volumes mantidos':s.error?'Áudio indisponível · tente outra interação':s.ready?'Som ligado':'Som ligado · aguardando interação';
 }
 function show(){if(disposed)return;panels.close();mode='menu';shell.hidden=false;settings.hidden=true;main.hidden=false;main.inert=false;$('menuNotice').textContent='';$('menuStart').textContent=profile().label;refresh();focus($('menuStart'));}
 function openSettings(){if(busy||disposed)return;returnFocus=$('menuSettings');mode='settings';shell.hidden=false;main.inert=true;main.hidden=true;settings.hidden=false;panels.open();refresh();focus(panels.focusTarget()||$('settingsSoundEnabled'));}
 function closeSettings({resume=false}={}){if(mode!=='settings')return;panels.close();releaseUiScale();sampleAnimation?.cancel();sampleAnimation=null;if(directEntry){mode='game';settings.hidden=true;shell.hidden=true;onCloseSettings({resume});focusGame();return;}mode='menu';settings.hidden=true;main.hidden=false;main.inert=false;focus(returnFocus);}
 async function start(){if(busy||disposed||mode!=='menu')return;busy=true;$('menuStart').disabled=true;$('menuSettings').disabled=true;$('menuExit').disabled=true;$('menuNotice').textContent='Abrindo o jogo…';void services.audio.controller.unlock();
  try{await onStart();if(disposed)return;mode='game';shell.hidden=true;focusGame();}catch{$('menuNotice').textContent='Não foi possível abrir o jogo. Recarregue a página para tentar novamente.';focus($('menuNotice'));}finally{busy=false;$('menuSettings').disabled=false;$('menuExit').disabled=false;if(mode==='game')$('menuStart').disabled=false;}
 }
 async function leave(){if(busy||exitBusy||mode!=='menu')return;exitBusy=true;services.audio.engine.silence();try{const result=await exit();$('menuNotice').textContent=result.message??'Para sair, feche esta aba ou janela.';}catch{$('menuNotice').textContent='Para sair, feche esta aba ou janela. Sua partida não será apagada.';}finally{exitBusy=false;focus($('menuExit'));}}
 cleanups.push(listen($('menuStart'),'click',start),listen($('menuSettings'),'click',openSettings),listen($('settingsBack'),'click',closeSettings),listen($('menuExit'),'click',leave));
 if($('settingsApply'))cleanups.push(listen($('settingsApply'),'click',()=>closeSettings({resume:true})));
 if($('settingsClose'))cleanups.push(listen($('settingsClose'),'click',closeSettings));
 cleanups.push(listen($('settingsSoundEnabled'),'change',()=>{const enabled=$('settingsSoundEnabled').checked;services.audio.controller.set({enabled});if(enabled)void services.audio.controller.unlock();}));
 for(const [id,key]of [['settingsMusicVolume','musicVolume'],['settingsSfxVolume','sfxVolume']])cleanups.push(listen($(id),'input',()=>{services.audio.controller.set({[key]:Number($(id).value)/100});void services.audio.controller.unlock();}));
 for(const id of ['settingsVisualEffects','settingsVisualSoft'])cleanups.push(listen($(id),'change',()=>{if(!$(id).checked)return;services.visual.setMode($(id).value);refresh();if($(id).value==='intense'&&!doc.defaultView?.matchMedia?.('(prefers-reduced-motion:reduce)').matches)sampleAnimation=$('settingsEffectSample')?.animate?.([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});}));
 function releaseUiScale(){if(!settings.dataset?.uiScaleLock)return;delete settings.dataset.uiScaleLock;doc.dispatchEvent(new doc.defaultView.Event('gemventure-ui-unlock'));}
 if(services.ui&&$('settingsUiScale')){const range=$('settingsUiScale');cleanups.push(listen(range,'pointerdown',()=>{settings.dataset.uiScaleLock=doc.defaultView.getComputedStyle(settings).zoom;}),listen(range,'input',()=>services.ui.setPercent(range.value)),listen(doc,'pointerup',releaseUiScale,true),listen(doc,'pointercancel',releaseUiScale,true),listen(range,'keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))settings.dataset.uiScaleLock=doc.defaultView.getComputedStyle(settings).zoom;}),listen(range,'keyup',releaseUiScale),listen(range,'blur',releaseUiScale),listen($('settingsUiReset'),'click',()=>services.ui.setPercent(UI_PERCENT.default)),services.ui.subscribe(refresh));}
 cleanups.push(services.audio.subscribe(refresh),services.visual.subscribe(refresh));
 // Menu events never reach game document listeners after the menu is reopened.
 for(const type of ['click','pointerdown','pointerup','pointercancel','keyup'])cleanups.push(listen(shell,type,e=>e.stopPropagation()));
 cleanups.push(listen(shell,'keydown',e=>{if(shell.hidden)return;if(e.key==='Escape'){e.preventDefault();closeSettings();}if(e.key==='Tab'){const host=mode==='settings'?settings:main,buttons=[...host.querySelectorAll('button,input,[tabindex="0"]')].filter(b=>!b.disabled&&!b.hidden&&!b.closest?.('[hidden]')&&!b.closest?.('[inert]')&&b.getAttribute?.('tabindex')!=='-1'),i=buttons.indexOf(doc.activeElement);if(buttons.length&&(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===buttons.length-1)){e.preventDefault();focus(buttons[e.shiftKey?buttons.length-1:0]);}}e.stopPropagation();}));
 if(directEntry){mode='game';shell.hidden=true;main.hidden=true;refresh();}else show();return{show,openSettings,refresh,getState:()=>({mode,busy,disposed}),dispose(){if(disposed)return;disposed=true;panels.dispose();releaseUiScale();sampleAnimation?.cancel();sampleAnimation=null;for(const fn of cleanups)fn();}};
}
