import {installButtonFeedback} from './button-feedback.js';
import {installGlobalFinish} from './global-screen-finish.js';
import {installUiDisplay} from './ui-display.js';
import {getAppServices} from './app-services.js';
import {readMenuProfile} from './menu-profile.js';
import {createMenuController} from './menu-controller.js';
import {createExitAdapter} from './platform-exit.js';
import {entryLoading,entryLoaded,entryFailed} from './entry-loading.js';
const services=getAppServices(),surfaces=[...document.querySelectorAll('[data-game-surface]')];let game=null;
function visible(value){for(const element of surfaces){element.hidden=!value;element.inert=!value;}document.body.classList.toggle('application-menu-open',!value);}
installGlobalFinish();
installUiDisplay(document,services.ui);
const buttonFeedback=installButtonFeedback(document,{soft:()=>services.visual.getMode()==='soft'});services.visual.subscribe(()=>buttonFeedback?.syncMode());
services.audio.controller.bindGestures(document,{ignore:e=>!!e.target?.closest?.('.audio-preference,#sound,#minerSound')});
const menu=createMenuController({root:document.getElementById('menuHost'),services,profile:()=>readMenuProfile({storage:services.storage}),exit:createExitAdapter(),directEntry:true,onStart:()=>{},focusGame:()=>document.getElementById('world')?.focus({preventScroll:true}),canResume:()=>game?.canResumeFromSettings?.()===true,onCloseSettings:({resume=false}={})=>{document.body.classList.remove('application-settings-open');visible(true);game?.setApplicationMenu(false,{resume});}});
document.getElementById('openApplicationMenu').addEventListener('click',()=>{if(!game||game.setApplicationMenu(true)!==true)return;for(const el of surfaces)el.inert=true;document.body.classList.add('application-settings-open');menu.openSettings();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)services.audio.engine.silence();});
async function enter(){try{
 visible(false);entryLoading(0);
 const {prepareGameArt}=await import('./game-art-ready.js');
 await prepareGameArt((_label,{completed,total})=>entryLoading(Math.floor(completed/total*85)));
 entryLoading(90);visible(true);game=await import('./run.js');
 // A fresh session always arrives in the refuge; a live saved expedition is
 // preserved by run.js rather than silently discarded here.
 visible(true);game.setApplicationMenu(false);entryLoading(98);
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 entryLoading(100);entryLoaded();document.documentElement.dataset.entryPending='false';document.dispatchEvent(new CustomEvent('gemventure-entry-ready'));
 }catch(error){visible(false);entryFailed();console.error('Game entry failed',error);}}
void enter();
