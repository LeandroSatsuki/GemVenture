// A host may inject its explicit close hook. Browser fallback never closes the app/window.
export function createExitAdapter({closeApplication}={}){
 return async()=>{if(typeof closeApplication==='function'){try{const result=await closeApplication();if(result===true||result?.exited===true)return{exited:true,message:'Saindo…'};}catch{}}
  return {exited:false,message:'Para sair, feche esta aba ou janela. Sua partida não será apagada.'};};
}
