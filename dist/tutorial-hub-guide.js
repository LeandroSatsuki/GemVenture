import {upgradeCost} from './core.js';
import {pickRecipe,MATERIALS} from './materials.js';
import {ASTRAL_COST,ASTRAL_SLOTS} from './astral.js';
import {missionSlots} from './village.js';
import {accountScoreView} from './account-score.js';
import {createApprovedGuideView} from './approved-guide-view.js';
import {approvedGuidePresentation} from './approved-guide-model.js';
const number=n=>Number.isFinite(n)?n.toLocaleString('pt-BR'):'—';
export const HUB_GUIDES=Object.freeze([
{id:'lift',title:'Elevador',text:'É a entrada das expedições: escolha o destino e desça para explorar e minerar. O painel mostra andares, paradas e Abismo disponíveis.',status:s=>s.run?'A expedição atual está preservada.':'A primeira descida começa no Andar 1.'},
{id:'forge',title:'Forja',text:'Melhore a picareta e prepare seus equipamentos. Cada projeto mostra o ganho, os materiais e o preço antes da compra.',status:s=>'Picareta: '+number(upgradeCost(s))+' moedas · '+pickRecipe(s).map((n,i)=>n?number(n)+' '+MATERIALS[i].name:'').filter(Boolean).join(' · ')},
{id:'missions',title:'Quadro de Missões',text:'Aceite um objetivo para cumprir durante as descidas e volte para receber a recompensa. Aceitar não custa recursos; o prazo fica pausado no refúgio.',status:s=>'Vagas atuais: '+number(missionSlots(s))+'. Veja objetivos e recompensas nas ofertas reais.'},
{id:'tree',title:'Árvore de Ecos',text:'Distribua pontos em talentos para escolher suas melhorias. As conexões indicam o que pode ser aprendido; cada nó mostra o custo e o efeito.',status:s=>'Pontos de habilidade disponíveis: '+number(s.experience.points)+'.'},
{id:'stars',title:'Relicário',text:'Use estrelas das descidas para escolher relíquias permanentes e equipar seus efeitos. Abra o painel para conferir sua coleção e as opções atuais.',status:s=>number(ASTRAL_COST)+' estrelas por escolha · até '+number(ASTRAL_SLOTS)+' equipadas · saldo '+number(s.stars)+'.'},
{id:'records',title:'Vitrola',text:'Escolha a trilha entre os discos da coleção e ouça uma prévia. Novos discos mostram sua origem e o preço em estrelas antes da compra.',status:s=>'Discos na coleção: '+number(s.records.owned.length)+' · estrelas '+number(s.stars)+'.'},
{id:'statue',title:'Estátua de Pontuação',text:'Acompanhe a pontuação acumulada e a evolução da estátua pelas expedições. Consultar esse progresso não consome recursos.',status:s=>{const v=accountScoreView(s);return v?'Total: '+number(v.total)+' pontos'+(v.next===null?' · último elo.':' · próximo elo em '+number(v.next)+' pontos.'):'O painel mostra a pontuação registrada no perfil.';}}
]);
export function hubGuideModel(profile,id){const entry=HUB_GUIDES.find(g=>g.id===id);return entry?{id:entry.id,title:entry.title,text:entry.text,status:entry.status(profile)}:null;}
export function createHubGuide({document,storage,profile,isTraining,onTraining,onTour,onOpen,closeDialog,createView=createApprovedGuideView}){
 const KEY='gemventure-hub-guide-v1',accountId=profile().accountScore.id;let seen=new Set(),mode=null,selected='lift',expanded=false;
 try{const raw=JSON.parse(storage?.getItem(KEY));if(raw?.version===1&&raw.accountId===accountId&&Array.isArray(raw.seen))seen=new Set(raw.seen.filter(id=>HUB_GUIDES.some(g=>g.id===id)));}catch{}
 function remember(id){if(!HUB_GUIDES.some(g=>g.id===id))return;seen.add(id);try{storage?.setItem(KEY,JSON.stringify({version:1,accountId,seen:[...seen]}));}catch{}}
 function paint(){const p=profile(),model=approvedGuidePresentation(p,hubGuideModel(p,selected));if(model)ui.show({...model,expanded});}
 function hide(){const wasActive=mode!==null;mode=null;ui.hide();if(wasActive)document.getElementById('tutorialButton')?.focus({preventScroll:true});}
 const ui=createView({document,onPick:id=>{if(mode===null||isTraining()||!HUB_GUIDES.some(g=>g.id===id))return;selected=id;expanded=false;remember(id);paint();},onToggle:()=>{if(mode===null)return;expanded=!expanded;paint();},onAction:()=>{if(mode===null)return;const id=selected;remember(id);hide();if(!profile().run)onOpen(id);},onExit:hide,onRoute:id=>{if(mode===null||isTraining()||!['tour','training'].includes(id)||id==='tour'&&profile().run)return;hide();if(id==='tour')onTour();else onTraining();}});
 function show(id){if(isTraining()||!HUB_GUIDES.some(g=>g.id===id))return false;closeDialog();mode='place';selected=id;expanded=false;remember(id);paint();return true;}
 function catalog(){if(isTraining())return;closeDialog();mode='catalog';selected='lift';expanded=false;paint();}
 return {catalog,show,hide,see:remember,get active(){return mode!==null;},intercept(){return false;},layout:()=>ui.layout(),seen:()=>[...seen],ui};
}
