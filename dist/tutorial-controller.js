export const TUTORIAL_VERSION=2;
export const STEP_ORDER=['welcome','lift','liftIntro','rhythmIntro','rhythm','breathIntro','breath','miningIntro','mining','bombIntro','bomb','healIntro','heal','shieldIntro','shield','heatIntro','heat','stars','free','exit','return','forge','purchase','missions','missionAccept','done'];
export const STEP_COPY={
welcome:{title:'Nosso recanto antes da aventura',text:'Aqui você prepara as próximas expedições e volta para guardar suas conquistas. O elevador leva às cavernas; os outros locais podem ser explorados depois.',action:'Conhecer o elevador',target:'world'},
lift:{title:'Vamos descer',text:'Entre no elevador. Você pode explorar os outros locais depois ou pular a orientação.',target:'lift'},
liftIntro:{title:'Sua entrada para as cavernas',text:'O Andar 1 é o começo da exploração. Use Descer para experimentar um treino seguro; seus recursos reais ficam preservados.',action:'Descer para o treino',target:'depart'},
rhythmIntro:{title:'Siga o ritmo',text:'Espaço ou toque na área quando a bolinha chegar ao centro. No começo, seu fôlego está protegido.',action:'Praticar',target:'pulse'},
rhythm:{title:'Encontre o pulso',text:'Acerte cinco ações seguidas. Depois pratique mais ou continue quando quiser.',target:'pulse',practice:true,goal:'Cinco acertos seguidos'},
breathIntro:{title:'Fôlego',text:'Na partida, errar tira fôlego e acertar recupera. Vamos observar uma queda real; neste treino, zerar recarrega o fôlego na mesma sala.',action:'Ver e praticar',target:'breath'},
breath:{title:'Experimente o fôlego',text:'A queda demonstrada é do treino. Acerte no pulso para recuperar. Neste treino, zerar recarrega a reserva para você continuar.',target:'breath',practice:true,goal:'Recuperar fôlego com um acerto'},
miningIntro:{title:'Minere e explore',text:'Mire um cristal e golpeie no pulso. Depois de quebrá-lo, explore e quebre mais pedras antes de continuar.',action:'Explorar',target:'mineral'},
mining:{title:'Explore a sala',text:'Clique nos minérios ou use Espaço no alvo. WASD ou setas movem o personagem.',target:'mineral',practice:true,goal:'Quebrar um cristal'},
bombIntro:{title:'Bomba · 1',text:'Itens podem ser usados a qualquer momento. Aperte 1 para praticar; de novo para usar.',action:'Praticar bomba',target:'blast',shortcut:'Digit1'},
bomb:{title:'Pratique a bomba',text:'Use 1 quando precisar, sem gastar seu golpe no pulso. Ela atinge uma área próxima. Depois explore mais ou continue.',target:'blast',practice:true,goal:'Usar uma bomba'},
healIntro:{title:'Cura · 2',text:'Seu personagem de treino está ferido. Aperte 2 para praticar; de novo para usar uma poção.',action:'Praticar cura',target:'tonic',shortcut:'Digit2'},
heal:{title:'Recupere vida',text:'Use 2 quando precisar. O número no alto mostra sua vida real; a linha perto do personagem mostra a proporção.',target:'tonic',practice:true,goal:'Usar a cura com vida faltando'},
shieldIntro:{title:'Escudo · 3',text:'Aperte 3 para praticar; de novo para usar. O escudo bloqueia ataques, não erros de ritmo.',action:'Praticar escudo',target:'ward',shortcut:'Digit3'},
shield:{title:'Bloqueie o ataque',text:'Use 3 a qualquer momento e veja o ataque ser bloqueado. Depois pratique livremente.',target:'ward',practice:true,goal:'Bloquear um ataque com escudo'},
heatIntro:{title:'Um trecho do Abismo',text:'O calor aumenta perigo e saque. Este trecho é uma demonstração separada, sem mudar a campanha.',action:'Experimentar',target:'heat'},
heat:{title:'Calor em ação',text:'Observe o calor real. Depois da mudança, você decide quando continuar.',target:'heat',practice:true,goal:'Observar um aumento real de calor'},
stars:{title:'Pontos e estrelas',text:'Estrelas vêm de marcos de pontuação e servem ao Relicário. A demonstração não entrega estrelas ao perfil.',action:'Concluir a fase',target:'stars'},
free:{title:'Termine explorando',text:'Complete o objetivo da sala. A saída só aparece depois da conclusão real.',target:'mineral',practice:true,goal:'Concluir a sala'},
exit:{title:'Saída preparada',text:'Use a saída para voltar ao refúgio. A ajuda inicial também fica disponível após voltar da primeira expedição.',target:'exit',practice:true,goal:'Voltar pelo elevador'},
return:{title:'De volta ao Refúgio',text:'A ajuda inicial é uma vez por perfil. Treinar ou voltar da mina não duplica o prêmio.',action:'Conhecer a Forja',target:'world'},
forge:{title:'Forja',text:'Abra a Forja para melhorar sua picareta.',target:'forge'},
purchase:{title:'Sua primeira melhoria',text:'Use Forjar Picareta. Ela aumenta o poder dos golpes. Veja o custo e o ganho antes de confirmar.',target:'purchase'},
missions:{title:'Um objetivo para explorar',text:'Abra o quadro de Missões para escolher um objetivo possível na próxima descida.',target:'missions'},
missionAccept:{title:'Aceite uma missão',text:'Veja o objetivo recomendado e use Aceitar. Não há compra para aceitar uma missão.',target:'mission'},
done:{title:'Pronto para explorar',text:'O Tutorial continua no alto para rever ou retomar. Sua melhoria e missão ficam salvas. Pelo botão Tutorial, escolha qualquer estrutura para conhecer os outros opções do refúgio.',action:'Explorar',target:'tutorial'}
};
export function readTutorialRecord(storage,key){try{const r=JSON.parse(storage?.getItem(key));return r?.version===2&&STEP_ORDER.includes(r.step)&&['active','skipped','completed'].includes(r.status)?r:null;}catch{return null;}}
export function createTutorialController({storage,key='gemventure-tutorial-pilot-v2',fresh=false,onChange=()=>{}}={}){
let record=readTutorialRecord(storage,key),active=false,step=record?.step||'welcome',ready=!!record?.ready,session=0;const seen=new Set();
const persist=status=>{record={version:2,status,step,ready};try{storage?.setItem(key,JSON.stringify(record));}catch{}};
const view=()=>({active,step,ready,copy:{...STEP_COPY[step],...(STEP_COPY[step]?.practice&&ready&&step!=='exit'?{action:'Continuar'}:{})},reading:active&&!STEP_COPY[step]?.practice,status:record?.status||'unseen',gated:active&&fresh&&!['return','forge','purchase','missions','missionAccept','done'].includes(step),session});
const notify=()=>onChange(view());
function go(next){if(!STEP_COPY[next])return;step=next;ready=false;persist('active');notify();}
function start({restart=false}={}){if(active)return;active=true;session++;seen.clear();step=restart||!record||record.status==='completed'?'welcome':record.step;ready=!!record?.ready;if(record?.status==='skipped'&&STEP_COPY[step]?.practice)step='rhythmIntro';persist('active');notify();}
function skip(){if(!active)return;persist('skipped');active=false;notify();}
function next(){if(!active||STEP_COPY[step]?.practice&&!ready)return;if(step==='done'){persist('completed');active=false;notify();return;}go(STEP_ORDER[STEP_ORDER.indexOf(step)+1]);}
const confirm=()=>{if(!ready){ready=true;persist('active');notify();}};
function event(e){if(!active||!e)return;if(e.id!=null){if(seen.has(e.id))return;seen.add(e.id);}
if(step==='lift'&&e.type==='liftOpened')go('liftIntro');
else if(step==='rhythm'&&e.type==='action'&&e.accepted&&e.combo>=5)confirm();
else if(step==='breath'&&e.type==='breathRecovered')confirm();
else if(step==='mining'&&e.type==='mineralCollected')confirm();
else if(step==='bomb'&&e.type==='bomb')confirm();
else if(step==='heal'&&e.type==='healed'&&e.amount>0)confirm();
else if(step==='shield'&&e.type==='shieldBlocked')confirm();
else if(step==='heat'&&e.type==='heatChanged')confirm();
else if(step==='free'&&e.type==='cleared')go('exit');
else if(step==='exit'&&e.type==='returned')go('return');
else if(step==='forge'&&e.type==='forgeOpened')go('purchase');
else if(step==='purchase'&&e.type==='purchaseCommitted')go('missions');
else if(step==='missions'&&e.type==='missionsOpened')go('missionAccept');
else if(step==='missionAccept'&&e.type==='missionAccepted')go('done');}
return{view,start,skip,next,event,go,autoStart(){if(fresh&&!record||record?.status==='active')start();}};
}
