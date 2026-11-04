const{app,BaseWindow,WebContentsView,Menu,protocol,net,session,shell,dialog,screen,ipcMain}=require('electron');
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url'),{assetPath}=require('./asset-path.cjs');
const{createUpdater}=require('./updater.cjs');
const{createDisplayWindow,bindDisplayIpc,readDisplayMode,writeDisplayMode}=require('./display-window.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'gemventure',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,codeCache:true}}]);
app.setName('GemVenture');app.setAppUserModelId('io.itch.leandrosatsuki.gemventure');
if(!app.isPackaged)app.setPath('userData',path.join(app.getPath('appData'),'GemVenture-desktop-development'));
const locked=app.requestSingleInstanceLock();let display,updates,view,releaseIpc;
if(!locked)app.quit();else{
 app.on('second-instance',()=>{const win=display?.window;if(win){if(win.isMinimized())win.restore();win.focus();}});
 app.whenReady().then(async()=>{
  const root=path.join(__dirname,'game');if(!fs.existsSync(path.join(root,'index.html')))throw Error('Execute npm run prepare:game antes de abrir.');
  protocol.handle('gemventure',async request=>{try{return await net.fetch(pathToFileURL(assetPath(root,request.url)).href,{headers:request.headers});}catch{return new Response('Not found',{status:404});}});
  session.defaultSession.setPermissionRequestHandler((_w,_permission,callback)=>callback(false));session.defaultSession.setPermissionCheckHandler(()=>false);
  session.defaultSession.webRequest.onHeadersReceived((details,callback)=>{const headers={...details.responseHeaders};if(details.url.startsWith('gemventure://game/'))headers['Content-Security-Policy']=["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"];callback({responseHeaders:headers});});
  view=new WebContentsView({webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,preload:path.join(__dirname,'preload.cjs')}});view.setBackgroundColor('#080f21');
  view.webContents.setWindowOpenHandler(({url})=>{openExternal(url);return{action:'deny'};});
  view.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('gemventure://game/')){event.preventDefault();openExternal(url);}});
  const preference=path.join(app.getPath('userData'),'display-mode.json');
  display=createDisplayWindow({BaseWindow,view,screen,icon:path.join(__dirname,'icon.png'),initialMode:readDisplayMode(preference),saveMode:mode=>writeDisplayMode(preference,mode)});
  releaseIpc=bindDisplayIpc({ipcMain,view,manager:display});
  const change=mode=>{void display.setMode(mode).catch(error=>dialog.showMessageBox(display.window,{type:'info',title:'GemVenture',message:error.message,buttons:['OK']}));};
  const rebuildMenu=()=>{const state=display.getState(),menu=Menu.buildFromTemplate([{label:'GemVenture',submenu:[{label:'v'+app.getVersion(),enabled:false},{label:updates?.label()||'Verificar atualizações…',click:()=>updates?.check(true)},{type:'separator'},{role:'quit',label:'Sair'}]},{label:'Exibir',submenu:[...[['fullscreen','Tela cheia'],['windowed','Janela'],['borderless','Janela sem bordas']].map(([id,label])=>({label,type:'radio',checked:state.mode===id,enabled:!state.pending,click:()=>change(id)})),{type:'separator'},{label:'Tamanho original',click:()=>view.webContents.setZoomFactor(1)}]}]);Menu.setApplicationMenu(menu);const win=display.window;if(win&&!win.isDestroyed()){win.setMenu(menu);win.setMenuBarVisibility(state.mode==='windowed');}};
  display.subscribe(rebuildMenu);updates=createUpdater({app,dialog,getWindow:()=>display.window,onChange:rebuildMenu});
  view.webContents.on('before-input-event',(event,input)=>{if(input.type==='keyDown'&&input.key==='F11'&&!input.isAutoRepeat){event.preventDefault();change(display.getState().mode==='fullscreen'?'windowed':'fullscreen');}});
  view.webContents.on('destroyed',()=>{const win=display.window;if(win&&!win.isDestroyed())win.close();});
  await display.start();rebuildMenu();await view.webContents.loadURL('gemventure://game/index.html');updates.check(false);
 }).catch(error=>{dialog.showErrorBox('GemVenture',error.message);app.quit();});
 app.on('before-quit',()=>{releaseIpc?.();display?.dispose();});app.on('window-all-closed',()=>app.quit());
}
function openExternal(value){try{const url=new URL(value);if(url.protocol==='https:')void shell.openExternal(url.href);}catch{}}
