const {app,BrowserWindow,Menu,protocol,net,session,shell,dialog}=require('electron');
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url'),{assetPath}=require('./asset-path.cjs');
const {createUpdater}=require('./updater.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'gemventure',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,codeCache:true}}]);
app.setName('GemVenture');app.setAppUserModelId('io.itch.leandrosatsuki.gemventure');
// Packaged data and development data never share a save directory.
if(!app.isPackaged)app.setPath('userData',path.join(app.getPath('appData'),'GemVenture-desktop-development'));
const locked=app.requestSingleInstanceLock();let window,updates;
if(!locked)app.quit();else{
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
 app.whenReady().then(async()=>{
  const root=path.join(__dirname,'game');if(!fs.existsSync(path.join(root,'index.html')))throw Error('Execute npm run prepare:game antes de abrir.');
  protocol.handle('gemventure',async request=>{try{return await net.fetch(pathToFileURL(assetPath(root,request.url)).href,{headers:request.headers});}catch{return new Response('Not found',{status:404});}});
  session.defaultSession.setPermissionRequestHandler((_w,_permission,callback)=>callback(false));
  session.defaultSession.setPermissionCheckHandler(()=>false);
  session.defaultSession.webRequest.onHeadersReceived((details,callback)=>{const headers={...details.responseHeaders};if(details.url.startsWith('gemventure://game/'))headers['Content-Security-Policy']=["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' data: blob:; font-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"];callback({responseHeaders:headers});});
  window=new BrowserWindow({width:1440,height:900,minWidth:960,minHeight:600,backgroundColor:'#080f21',show:false,title:'GemVenture',icon:path.join(__dirname,'icon.png'),webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  window.webContents.setWindowOpenHandler(({url})=>{openExternal(url);return{action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('gemventure://game/')){event.preventDefault();openExternal(url);}});
  const rebuildMenu=()=>Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'GemVenture',submenu:[{label:'v'+app.getVersion(),enabled:false},{label:updates?.label()||'Verificar atualizações…',click:()=>updates?.check(true)},{type:'separator'},{role:'quit',label:'Sair'}]},{label:'Exibir',submenu:[{role:'togglefullscreen',label:'Tela cheia'},{role:'resetZoom',label:'Tamanho original'}]}]));
  updates=createUpdater({app,dialog,getWindow:()=>window,onChange:rebuildMenu});rebuildMenu();
  window.once('ready-to-show',()=>window.show());await window.loadURL('gemventure://game/index.html');
  updates.check(false);
 }).catch(error=>{dialog.showErrorBox('GemVenture',error.message);app.quit();});
 app.on('window-all-closed',()=>app.quit());
}
function openExternal(value){try{const url=new URL(value);if(url.protocol==='https:')void shell.openExternal(url.href);}catch{}}
