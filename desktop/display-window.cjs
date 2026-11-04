const fs=require('node:fs'),path=require('node:path');
const DISPLAY_MODES=Object.freeze(['fullscreen','windowed','borderless']);
const validMode=mode=>DISPLAY_MODES.includes(mode);
function readDisplayMode(file){try{const p=JSON.parse(fs.readFileSync(file,'utf8'));if(p.version===1&&validMode(p.mode))return p.mode;}catch{}return 'windowed';}
function writeDisplayMode(file,mode){if(!validMode(mode))throw TypeError('Invalid display mode');try{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify({version:1,mode}));fs.renameSync(file+'.tmp',file);return true;}catch{return false;}}
// The native frame can change, but the existing WebContentsView is reparented:
// no page reload, new session, AudioContext, or player-save round trip.
function createDisplayWindow({BaseWindow,view,screen,icon,initialMode='windowed',saveMode=()=>true,onClose=()=>{},transitionMs=4000}){
 let current=null,mode=validMode(initialMode)?initialMode:'windowed',busy=false,disposed=false,persisted=true,error=null;
 const listeners=new Set(),state=()=>({mode,modes:[...DISPLAY_MODES],pending:busy,persisted,error,maximized:!!current?.isMaximized()});
 const emit=()=>{for(const listener of listeners)listener(state());};
 function resize(win){if(current!==win||win.isDestroyed())return;const{width,height}=win.getContentBounds();view.setBounds({x:0,y:0,width:Math.max(1,width),height:Math.max(1,height)});}
 function enterFullscreen(win){return new Promise((resolve,reject)=>{let timer;const clean=()=>{clearTimeout(timer);win.removeListener('enter-full-screen',entered);win.removeListener('closed',closed);};const entered=()=>{clean();resolve();},closed=()=>{clean();reject(Error('A janela foi fechada.'));};win.once('enter-full-screen',entered);win.once('closed',closed);timer=setTimeout(()=>{clean();if(!win.isDestroyed()&&win.isFullScreen())resolve();else reject(Error('Não foi possível ativar a tela cheia.'));},transitionMs);try{win.setFullScreen(true);}catch(e){clean();reject(e);}});}
 async function setMode(next,{startup=false}={}){
  if(!validMode(next))throw TypeError('Invalid display mode');if(disposed)throw Error('Display closed');if(busy)throw Error('Aguarde a troca de tela.');if(current&&next===mode)return state();
  busy=true;error=null;emit();const old=current,previous=mode;
  try{
   const display=old?screen.getDisplayMatching(old.getBounds()):screen.getPrimaryDisplay(),area=display.workArea,bounds=display.bounds;
   const width=Math.min(1440,area.width),height=Math.min(900,area.height),borderless=next==='borderless';
   const win=new BaseWindow({title:'GemVenture',icon,show:false,backgroundColor:'#080f21',frame:!borderless,thickFrame:!borderless,autoHideMenuBar:true,minWidth:Math.min(960,area.width),minHeight:Math.min(600,area.height),...(borderless?bounds:{x:area.x+Math.round((area.width-width)/2),y:area.y+Math.round((area.height-height)/2),width,height})});
   // Show the replacement before attachment. Chromium still emits a transient
   // visibility pair on reparent; the renderer coalesces it in display-mode.js.
   if(startup&&next==='windowed')win.maximize();win.show();
   if(old&&!old.isDestroyed())old.contentView.removeChildView(view);current=win;win.contentView.addChildView(view);resize(win);
   win.on('resize',()=>resize(win));win.on('enter-full-screen',()=>resize(win));win.on('leave-full-screen',()=>resize(win));
   win.on('focus',()=>{if(current===win&&borderless)win.setAlwaysOnTop(true);});win.on('blur',()=>{if(!win.isDestroyed())win.setAlwaysOnTop(false);});
   win.on('closed',()=>{if(current!==win)return;current=null;disposed=true;if(!view.webContents.isDestroyed())view.webContents.close();onClose();});
   if(old&&!old.isDestroyed())old.close();
   if(next==='fullscreen')await enterFullscreen(win);if(disposed)throw Error('Display closed');
   mode=next;if(borderless){win.setBounds(bounds);win.setAlwaysOnTop(win.isFocused());}win.setMenuBarVisibility(next==='windowed');resize(win);view.webContents.focus();persisted=saveMode(next)!==false;
  }catch(e){error=e.message;if(current===old)mode=previous;else if(current&&!current.isDestroyed()){mode=next==='borderless'?'borderless':current.isFullScreen()?'fullscreen':'windowed';}throw e;
  }finally{busy=false;emit();}
  return state();
 }
 function displayChanged(){if(!disposed&&current&&!current.isDestroyed()&&mode==='borderless'){current.setBounds(screen.getDisplayMatching(current.getBounds()).bounds);resize(current);}}
 screen.on?.('display-metrics-changed',displayChanged);screen.on?.('display-removed',displayChanged);
 return{get window(){return current;},getState:state,start:()=>setMode(mode,{startup:true}),setMode,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},dispose(){if(disposed)return;disposed=true;screen.removeListener?.('display-metrics-changed',displayChanged);screen.removeListener?.('display-removed',displayChanged);listeners.clear();if(!view.webContents.isDestroyed())view.webContents.close();}};
}
function bindDisplayIpc({ipcMain,view,manager}){
 const allowed=event=>{let url;try{url=new URL(event.senderFrame?.url);}catch{}if(event.sender!==view.webContents||event.senderFrame!==view.webContents.mainFrame||url?.protocol!=='gemventure:'||url.host!=='game'||url.username||url.password)throw Error('Display request rejected');};
 ipcMain.handle('gemventure:display:state',event=>{allowed(event);return manager.getState();});
 ipcMain.handle('gemventure:display:set',(event,mode)=>{allowed(event);if(!validMode(mode))throw TypeError('Invalid display mode');return manager.setMode(mode);});
 const unsubscribe=manager.subscribe(state=>{if(!view.webContents.isDestroyed())view.webContents.send('gemventure:display:changed',state);});
 return()=>{unsubscribe();ipcMain.removeHandler('gemventure:display:state');ipcMain.removeHandler('gemventure:display:set');};
}
module.exports={DISPLAY_MODES,validMode,readDisplayMode,writeDisplayMode,createDisplayWindow,bindDisplayIpc};
