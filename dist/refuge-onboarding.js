import {createApprovedIntroView,findIntroTarget,introTargetClicked} from './approved-intro-view.js';
import {cleanMinerName,reliquaryUnlocked,earnedStars} from './refuge-journey.js';
const lobby=id=>'#refugeLobby [data-refuge-action="'+id+'"]';
export const REFUGE_TOUR=Object.freeze([
 {id:'hello',title:'Uma picareta, uma música… e nós!',text:'Oi! Este recanto estava quietinho até você chegar. Lá embaixo, até as pedras têm ritmo. Antes da primeira descoberta: como posso chamar você?',name:true},
 {id:'story',title:'Prazer! Vamos nessa?',text:'Eu levo a picareta; você me ajuda a ouvir o pulso. A gente desce, encontra tesouros e volta aqui para ficar mais forte. Sem pressa: vou mostrar o caminho.'},
 {id:'missions',target:lobby('missions'),click:true,title:'Uma missão antes de descer',text:'Clique em MISSÕES. Escolha um objetivo para a próxima viagem. Ele dá uma recompensa extra pelo que já vamos fazer na caverna.'},
 {id:'mission-read',target:'#dialogBody',title:'Um objetivo de cada vez',text:'Leia o objetivo, o prazo e a recompensa. Aceitar é grátis. Você pode escolher agora ou depois; lembre de conferir antes de cada descida.'},
 {id:'mine',close:true,target:lobby('lift'),click:true,title:'Este é o caminho para a mina',text:'Clique em MINA. O elevador mostra os andares que já podemos visitar.'},
 {id:'mine-read',target:'#dialogBody',title:'Preparar, ouvir, minerar',text:'Aqui você escolhe o destino. O treino de ritmo fica no botão Tutorial e usa uma partida separada: seus recursos ficam seguros. Vamos conhecer o restante antes de descer.'},
 {id:'forge',close:true,target:lobby('forge'),click:true,title:'Nossa oficina',text:'Clique em FORJA. Os materiais da caverna viram melhorias que ficam com a gente.'},
 {id:'pickaxe',target:'[data-forge="pickaxe"]',click:true,title:'A picareta',text:'Clique na picareta para ver sua melhoria. Mais poder de mineração ajuda a quebrar as pedras com menos golpes. O ritmo da música continua o mesmo.'},
 {id:'pickaxe-read',target:'#forgeAction',title:'Veja antes de comprar',text:'O painel mostra ganho e custo. Contribuir deposita recursos; forjar conclui o projeto. Neste passeio não precisamos gastar nada.'},
 {id:'life',target:'[data-forge="vigor"]',click:true,title:'Nossa vitalidade',text:'Clique em VIDA. Essa melhoria aumenta quanto dano conseguimos aguentar antes de precisar voltar.'},
 {id:'strength',target:'[data-forge="anvil"]',click:true,title:'Força na bigorna',text:'Clique na BIGORNA. A força aumenta o poder da picareta para minerar e enfrentar criaturas. Confira o ganho da melhoria no painel.'},
 {id:'potions',target:'[data-forge="tonic"]',click:true,title:'Uma ajuda na mochila',text:'Clique em POÇÕES. Essa melhoria faz nossas poções recuperarem mais vida. Dentro da mina, usar uma poção também acompanha o pulso.'},
 {id:'vault',target:'[data-forge="vault"]',click:true,title:'Guardar parte da descoberta',text:'Clique no COFRE. Ele ajuda a conservar mais da mochila se a expedição terminar mal. O painel mostra a proteção atual.'},
 {id:'tree',close:true,target:lobby('tree'),click:true,title:'A árvore guarda nossa experiência',text:'Clique em ÁRVORE. Ao subir de nível, ganhamos pontos para aprender talentos.'},
 {id:'tree-read',target:'#dialogBody',title:'Um talento por vez',text:'Selecione um talento para ler o que muda. As conexões mostram o caminho até os próximos. Não precisa decidir tudo agora.'},
 {id:'relic',close:true,target:lobby('stars'),title:'Trinta estrelas abrem o Relicário',text:'As estrelas vêm da nossa pontuação nas expedições. Ao conquistar as primeiras 30, o Relicário abre. Eu aviso quando chegar a hora. Gastar estrelas depois não fecha a porta.'},
 {id:'records',target:lobby('records'),click:true,title:'Uma trilha para cada descoberta',text:'Clique na VITROLA. Aqui ficam os discos e as músicas que podemos conseguir durante a jornada.'},
 {id:'records-read',target:'#dialogBody',title:'Ouça antes de escolher',text:'Cada disco ou álbum mostra como obter e o preço, quando houver. A música do refúgio tem controles próprios na tela inicial.'},
 {id:'done',close:true,target:lobby('missions'),title:'Prontos para a primeira descoberta',text:'O refúgio está apresentado. Quando quiser praticar, abra Tutorial e escolha Treino de ritmo.'}
]);
export function mountRefugeOnboarding({document,profile,save,update,closeDialog,onActive,autoUnlock=true,createView=createApprovedIntroView}){
 let active=false,index=0,unlock=false,unlockStep=0,scheduled=false;const win=document.defaultView;
 const ui=createView({document,onNext:next,onSkip:skip,profile}),form=ui.form;
 function skip(){const s=profile();if(unlock)s.journey.relicIntroDone=true;else{s.journey.tourDone=true;s.journey.tourStep=null;}save();stop();}
 const unlockSteps=[
 {id:'relic-unlocked',target:lobby('stars'),click:true,title:'O Relicário acordou!',text:'Conquistamos 30 estrelas! Clique em RELICÁRIO para ver as relíquias que podem ajudar nas próximas descidas.'},
 {id:'relic-collection',target:'#dialogBody',title:'Nossa coleção de relíquias',text:'Cada relíquia tem um efeito. Abra uma para ler o que ela muda. Ter uma relíquia na coleção não basta: precisamos equipá-la para usar seu poder.'},
 {id:'relic-cost',target:'#dialogBody',title:'Escolha com calma',text:'As estrelas são a moeda daqui. Confira o preço antes de fazer uma escolha. Não precisa gastar agora. O Relicário continuará aberto mesmo depois de usarmos nossas estrelas.'}
 ];
 const entry=()=>unlock?unlockSteps[unlockStep]:REFUGE_TOUR[index];
 function render(){const e=entry();document.body.classList.toggle('refuge-introduction',active);if(!active){ui.render({active:false});return;}
  if((e.target?.startsWith('[data-forge=')||e.target==='#forgeAction')&&!findIntroTarget(document,e.target))findIntroTarget(document,lobby('forge'))?.click();
  ui.render({active:true,entry:e,index:unlock?unlockStep:index,total:unlock?unlockSteps.length:REFUGE_TOUR.length,last:unlock?unlockStep===unlockSteps.length-1:index===REFUGE_TOUR.length-1},{target:()=>findIntroTarget(document,e.target)});
 }
 function remember(){const s=profile();s.journey.tourStep=entry().id;save();}
 function next({fromTarget=false}={}){if(!active)return;const s=profile(),e=entry();if(e.click&&!fromTarget)return;if(e.name){const name=cleanMinerName(form.elements.minerName.value);if(!name){ui.live('Escolha um nome para continuarmos.');form.elements.minerName.focus();return;}s.journey.name=name;update();}
  if(unlock){if(unlockStep<unlockSteps.length-1){unlockStep++;render();return;}s.journey.relicIntroDone=true;save();stop();return;}
  if(index===REFUGE_TOUR.length-1){s.journey.tourDone=true;s.journey.tourStep=null;save();stop();return;}
  index++;if(entry().close)closeDialog();remember();render();}
 function stop(){active=false;onActive(false);render();}
 function start({restart=false}={}){if(profile().run)return;closeDialog();unlock=false;active=true;index=restart?0:Math.max(0,REFUGE_TOUR.findIndex(x=>x.id===profile().journey.tourStep));if(!restart){const resume=entry().id;const context={'mission-read':'missions','mine-read':'mine',pickaxe:'forge','pickaxe-read':'forge',life:'forge',strength:'forge',potions:'forge',vault:'forge','tree-read':'tree','records-read':'records'}[resume];if(context)index=REFUGE_TOUR.findIndex(x=>x.id===context);}onActive(true);remember();form.elements.minerName.value=profile().journey.name;render();if(entry().name)form.elements.minerName.focus();}
 document.addEventListener('click',e=>{if(!active||!entry().click||!introTargetClicked(e,entry().target))return;if(scheduled)return;scheduled=true;const expected=entry().id;win.requestAnimationFrame(()=>{scheduled=false;if(active&&entry().id===expected)next({fromTarget:true});});},true);
 return {start,stop,get active(){return active;},frame(){if(active){ui.layout();return;}const s=profile();if(autoUnlock&&!s.run&&!document.querySelector('dialog[open]')&&s.journey.tourDone&&!s.journey.relicIntroDone&&reliquaryUnlocked(s)){unlock=true;unlockStep=0;active=true;onActive(true);render();}},get step(){return active?entry().id:null;}};
}
