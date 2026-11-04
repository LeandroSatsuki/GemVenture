const{contextBridge,ipcRenderer}=require('electron');
// Narrow, validated display settings only. No general send/invoke/fs/Node API.
const modes=Object.freeze(['fullscreen','windowed','borderless']);
contextBridge.exposeInMainWorld('gemventureDesktop',Object.freeze({display:Object.freeze({
 getState:()=>ipcRenderer.invoke('gemventure:display:state'),
 setMode(mode){if(!modes.includes(mode))return Promise.reject(TypeError('Invalid display mode'));return ipcRenderer.invoke('gemventure:display:set',mode);},
 subscribe(fn){if(typeof fn!=='function')throw TypeError('Listener required');const listener=(_event,state)=>fn(state);ipcRenderer.on('gemventure:display:changed',listener);return()=>ipcRenderer.removeListener('gemventure:display:changed',listener);}
})}));
