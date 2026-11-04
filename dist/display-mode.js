export const DISPLAY_MODES=Object.freeze([{id:'fullscreen',label:'Tela cheia'},{id:'windowed',label:'Janela'},{id:'borderless',label:'Janela sem bordas'}].map(Object.freeze));
const valid=mode=>DISPLAY_MODES.some(m=>m.id===mode);
export function createDisplayModeController({desktop=globalThis.gemventureDesktop?.display,document:doc=globalThis.document}={}){
 let disposed=false,ready=!desktop,pending=false,error=null,persisted=true,mode=doc?.fullscreenElement?'fullscreen':'windowed',transitionUntil=0;const listeners=new Set();
 const state=()=>({mode,ready,pending,error,persisted,native:!!desktop,modes:desktop?DISPLAY_MODES.map(m=>m.id):['fullscreen','windowed']});const emit=()=>{for(const fn of listeners)fn(state());};
 function accept(value){if(disposed||!valid(value?.mode))return;if(pending||value.pending||mode!==value.mode)transitionUntil=Date.now()+180;mode=value.mode;pending=!!value.pending;persisted=value.persisted!==false;error=value.error||null;ready=true;emit();}
 const off=desktop?.subscribe?.(accept)||(()=>{}),fullscreen=()=>{if(!desktop&&!disposed){mode=doc?.fullscreenElement?'fullscreen':'windowed';emit();}};if(!desktop)doc?.addEventListener?.('fullscreenchange',fullscreen);
 async function refresh(){if(disposed)return state();if(desktop)try{accept(await desktop.getState());}catch{ready=true;error='Não foi possível consultar o modo de tela.';emit();}else fullscreen();return state();}
 async function setMode(next){if(!valid(next)||next==='borderless'&&!desktop)throw TypeError('Modo disponível no aplicativo Windows.');if(disposed||pending)throw Error('Aguarde a troca de tela.');pending=true;error=null;emit();try{if(desktop)accept(await desktop.setMode(next));else{if(next==='fullscreen'&&!doc.fullscreenElement)await doc.documentElement.requestFullscreen();if(next==='windowed'&&doc.fullscreenElement)await doc.exitFullscreen();mode=doc.fullscreenElement?'fullscreen':'windowed';}}catch(e){error=e.message||'Não foi possível mudar a tela.';throw e;}finally{pending=false;emit();}return state();}
 return{getState:state,isTransitioning:()=>!!desktop&&(pending||Date.now()<transitionUntil),refresh,setMode,async toggle(){if(desktop&&!ready)await refresh();return setMode(mode==='fullscreen'?'windowed':'fullscreen');},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},dispose(){if(disposed)return;disposed=true;off();doc?.removeEventListener?.('fullscreenchange',fullscreen);listeners.clear();}};
}
let singleton;export const getDisplayModeController=()=>singleton??=createDisplayModeController();

// Reparenting a WebContentsView briefly emits hidden/visible in Chromium.
// Coalesce only the native app's transient visibility events. A real minimize
// still reaches the existing pause/save handler; browser behavior is unchanged.
export function bindDisplayVisibility(doc,onChange,{native=!!globalThis.gemventureDesktop?.display,delay=80,transitioning=()=>getDisplayModeController().isTransitioning(),setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let stable=doc.hidden,timer=null,disposed=false;
 const flush=()=>{timer=null;if(disposed)return;if(doc.hidden&&transitioning()){timer=setTimer(flush,delay);return;}if(doc.hidden===stable)return;stable=doc.hidden;onChange();};
 const changed=()=>{if(!native){onChange();return;}if(timer!==null){clearTimer(timer);timer=null;}if(!transitioning()){flush();return;}timer=setTimer(flush,delay);};
 doc.addEventListener('visibilitychange',changed);
 return()=>{disposed=true;if(timer!==null)clearTimer(timer);doc.removeEventListener('visibilitychange',changed);};
}
