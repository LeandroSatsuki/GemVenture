const{autoUpdater}=require('electron-updater');
function createUpdater({app,dialog,getWindow,onChange}){
 let available=null,downloaded=false,busy=false,failure=null;
 autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;autoUpdater.allowPrerelease=false;
 autoUpdater.on('update-available',info=>{available=info;failure=null;onChange();});
 autoUpdater.on('update-downloaded',()=>{downloaded=true;busy=false;onChange();});
 autoUpdater.on('error',error=>{failure=error;busy=false;onChange();});
 const ask=options=>dialog.showMessageBox(getWindow(),{type:'info',title:'GemVenture',noLink:true,...options});
 async function check(manual=false){
  if(!app.isPackaged){if(manual)await ask({message:'Atualizações disponíveis na versão instalada.',buttons:['OK']});return;}
  if(busy)return;
  if(downloaded){const result=await ask({message:'Atualização pronta.',detail:'Volte ao refúgio e salve antes de reiniciar o jogo.',buttons:['Agora não','Instalar e reiniciar'],defaultId:0,cancelId:0});if(result.response===1)autoUpdater.quitAndInstall(false,true);return;}
  if(available&&manual){const result=await ask({message:'GemVenture '+available.version+' disponível.',detail:'A atualização será baixada do GitHub. Sua partida fica guardada neste computador.',buttons:['Agora não','Baixar atualização'],defaultId:0,cancelId:0});if(result.response===1){busy=true;onChange();try{await autoUpdater.downloadUpdate();}catch(error){failure=error;busy=false;onChange();}}return;}
  busy=true;onChange();try{const result=await autoUpdater.checkForUpdates();busy=false;onChange();if(manual){if(result?.isUpdateAvailable||available)return check(true);await ask({message:'Você já está na versão mais recente.',buttons:['OK']});}}catch(error){busy=false;failure=error;onChange();if(manual)await ask({message:'Não foi possível verificar atualizações.',detail:'Tente novamente mais tarde ou consulte a página do jogo no GitHub.',buttons:['OK']});}
 }
 return{check,label:()=>downloaded?'Instalar atualização…':busy?'Verificando / baixando atualização…':available?'Atualizar para '+available.version+'…':failure?'Tentar verificar atualizações…':'Verificar atualizações…'};
}
module.exports={createUpdater};
