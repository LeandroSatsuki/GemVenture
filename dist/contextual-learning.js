import {firstUpgradeGoal} from './first-hour.js';
import {hasCampaignReturn,tutorialRewardView} from './tutorial-reward.js';
import {LearningPath,LEARNING_TOPICS,topicById,learningAccount} from './learning-path.js';
import {createLearningView} from './learning-view.js';
import {expeditionBriefing,isExpeditionTopic} from './expedition-briefing.js';
import {cleanMinerName} from './refuge-journey.js';

export function mountContextualLearning({document:doc,storage,profile,fresh=false,saveProfile,update,onTraining,onGuide,onOpen,onEnableSound,onDisableSound=()=>{},onInitialHelp=()=>({ok:true,status:'unavailable'}),createView=createLearningView}){
 const account=learningAccount(profile()),key='gemventure-learning-v1:'+account;let raw=null;try{raw=JSON.parse(storage?.getItem(key)||'null');}catch{}
 const path=new LearningPath(profile(),raw,{fresh}),future=raw?.version>1&&raw.accountId===account;let current=null,suspended=null,context={},lastOffer=-Infinity,lastCheck=-Infinity,openQueue=[],busy=false,helpResult=null,helpAttempted=false;
 if(future)path.record.paused=true;
 function syncNotice(){const b=doc.getElementById?.('tutorialButton');if(!b)return;const label=path.record.guideOpened?'Tutorial':'Tutorial · Novo';if(b.textContent!==label)b.textContent=label;}
 function acknowledgeGuide(){path.record.guideOpened=true;persist();}
 function persist(){syncNotice();if(future)return;try{storage?.setItem(key,JSON.stringify(path.record));}catch{}}
 function hide(){current=null;ui.render(null);}
 function suspendForGameplay(){if(current?.kind==='lesson'&&!current.pageBound&&!current.foundation&&!topicById(current.topic)?.pages.length)suspended={model:{...current},run:profile().run};current=null;ui.render(null);}
 function show(model){current={...model,page:context.page,pageBound:!!context.dialogOpen||!!context.inMenu};ui.render(current);}
 function lesson(id,{invite=false,replay=false}={}){if(suspended?.model.topic===id)suspended=null;const t=topicById(id);if(!t||!t.eligible(profile()))return false;show({kind:'lesson',topic:id,index:0,total:t.steps.length,title:invite?t.name:t.steps[0].title,text:invite?'Uma novidade para sua próxima aventura.':t.steps[0].text,image:t.image,target:invite?null:t.steps[0].target,primary:invite?'Mostrar':t.steps.length>1?'Próximo':'Entendi',invite,replay,manual:replay,...(id==='forge'&&profile().level===1?goalModel():{})});return true;}
 function catalog(){acknowledgeGuide();help(true);show({kind:'catalog',manual:true,briefingAvailable:!profile().run,title:'Aprenda no seu ritmo',text:'Consulte uma dica ou volte ao treino.',image:'assets/refuge-night-v3/swords.png',paused:path.record.paused,resume:path.record.phase!=='done',topics:LEARNING_TOPICS.map(t=>({id:t.id,name:t.name,image:t.image,available:t.eligible(profile()),requirement:t.requirement,seen:path.record.seen.includes(t.id)}))});}
 function briefing(mode='floors'){if(profile().run)return false;acknowledgeGuide();const steps=expeditionBriefing(profile(),mode);show({kind:'briefing',manual:true,steps,index:0,total:steps.length,...steps[0],primary:'Próximo',secondary:'Pular guia'});return true;}
 function help(retry=false){if((helpAttempted&&!retry)||!hasCampaignReturn(profile())||!tutorialRewardView(profile()).eligible)return;helpAttempted=true;helpResult=onInitialHelp();}
 function goalModel(){return {goal:firstUpgradeGoal(profile()),helpError:helpResult&&!helpResult.ok?(helpResult.requiresReload?'Recarregue para conferir o salvamento antes de receber a ajuda.':'A ajuda ainda não foi salva. Você pode tentar novamente.'):null,retryHelp:!!helpResult&&!helpResult.ok&&!helpResult.requiresReload};}
 function expedition(){show({kind:'lesson',foundation:'expedition',topic:'expedition',title:'Sua primeira expedição',text:'Mire um cristal e golpeie no pulso com ESPAÇO. Explore com WASD e volte com a mochila.',image:'assets/refuge-night-v3/gem-0.png',primary:'Iniciar expedição',secondary:'Explorar refúgio'});}
 function foundation(){const r=path.record;const models={welcome:{kind:'welcome',title:'Como posso chamar você?',text:'Eu levo a picareta. Você sente o pulso.',name:profile().journey.name,image:'assets/refuge-night-v4/miner-front.png',primary:'Vamos nessa'},sound:{kind:'sound',title:'Ouça o pulso',text:'O som ajuda a sentir quando agir.',image:'assets/refuge-v1/gramophone.png',primary:'Ligar som e treinar'},practice:{kind:'lesson',title:'Treine sem pressa',text:'ESPAÇO ou toque na área. Você decide quando ir para a mina.',image:'assets/refuge-night-v3/swords.png',primary:'Treinar'},return:{kind:'lesson',title:'Seu próximo passo',text:'Confira a primeira melhoria na Forja. Você decide quando comprar.',image:'assets/forge-v6/pickaxe-v01-256.png',primary:'Ver Forja',...goalModel()}};const m=models[r.phase];if(m)show({...m,foundation:r.phase});else if(r.phase==='expedition')expedition();else if(r.phase==='upgrade')lesson('forge',{invite:context.page!=='forge'});}
 function later(){if(!current)return;const c=current;if(c.kind==='briefing'){hide();lastOffer=context.now||0;return;}if(['welcome','sound','practice'].includes(c.foundation)){path.record.phase='expedition';persist();expedition();return;}if(c.foundation==='expedition'){path.record.phase='play';hide();persist();return;}if(c.foundation==='return'){path.record.phase='upgrade';path.defer('forge');hide();persist();return;}if(c.topic&&!c.replay)path.defer(c.topic);if(c.foundation||c.topic==='expedition'&&path.record.phase==='expedition'){path.record.paused=true;}hide();persist();lastOffer=context.now||0;}
 function practice(){hide();if(['welcome','sound','practice'].includes(path.record.phase))path.practiceStarted();persist();onTraining({express:true});}
 async function primary(value,options={}){
  if(!current||busy&&!options.silent)return;const c=current,r=path.record;
  if(c.kind==='briefing'){path.seen(c.topic);persist();const index=c.index+1;if(index<c.steps.length)show({...c,...c.steps[index],index,primary:index===c.steps.length-1?'Concluir':'Próximo'});else{hide();lastOffer=context.now||0;}return;}
  if(c.kind==='welcome'){const name=cleanMinerName(value);if(!name){ui.error('Escolha um nome para continuarmos.');return;}const s=profile(),old=s.journey.name;s.journey.name=name;if(!saveProfile()){s.journey.name=old;ui.error('Não foi possível salvar o nome. Tente novamente ou use Depois.');return;}update();r.phase='sound';persist();foundation();return;}
  if(c.kind==='sound'){if(!options.silent){busy=true;let ok=false;try{ok=await onEnableSound();}catch{}finally{busy=false;}if(current!==c)return;if(!ok){ui.error('Som indisponível. Você pode treinar sem som.');return;}}else onDisableSound();practice();return;}
  if(c.foundation==='practice'){practice();return;}
  if(c.foundation==='expedition'){path.seen('expedition');r.phase='play';persist();hide();onOpen('lift');return;}
  if(c.foundation==='return'){r.phase='upgrade';persist();hide();onOpen('forge','pickaxe');lesson('forge');return;}
  const t=topicById(c.topic);if(!t)return;
  if(c.invite){hide();if(t.open){if(!profile().run)onOpen(t.open,t.project);opened(t.open);lesson(t.id,{replay:c.replay});}else lesson(t.id,{replay:c.replay});return;}
  if(c.index<t.steps.length-1){const index=c.index+1,step=t.steps[index];show({...c,index,title:step.title,text:step.text,target:step.target,primary:index===t.steps.length-1?'Entendi':'Próximo'});return;}
  path.seen(t.id);if(t.id==='expedition'&&r.phase==='expedition'){r.phase='play';persist();hide();onOpen('lift');return;}hide();persist();lastOffer=context.now||0;
 }
 const ui=createView({document:doc,onPrimary:primary,onLater:later,onSkipTraining:()=>{path.record.phase='expedition';persist();expedition();},onRetryHelp:()=>{help(true);if(current)show({...current,...goalModel()});},onPick:id=>{const t=topicById(id);lesson(id,{invite:!!t?.open&&!profile().run&&!t.pages.includes(context.page),replay:true});},onTraining:practice,onBriefing:()=>briefing(),onGuide:()=>{hide();onGuide();},onResume:()=>{path.record.paused=false;persist();hide();if(path.record.phase==='play')lesson('expedition',{invite:true,replay:true});else foundation();},onToggle:()=>{path.record.paused=!path.record.paused;persist();catalog();}});
 function opened(page){path.opened(page,profile());if(!openQueue.includes(page))openQueue.push(page);persist();}
 const click=e=>{const nodes=e.composedPath?.()||[e.target],project=nodes.find(n=>n?.dataset?.forge)?.dataset.forge;if(project){opened('forge:'+project);}const building=nodes.find(n=>n?.id==='building-trigger');if(building)opened('forge:structure');};doc.addEventListener('click',click,true);
 function tick(ctx){context=ctx;if(suspended&&suspended.run!==profile().run)suspended=null;if(!ctx.loading&&!ctx.returning&&!ctx.training&&!ctx.legacy&&!ctx.inMenu)help();if(ctx.now-lastCheck>=250){lastCheck=ctx.now;if(path.observe(profile()))persist();}
  if(ctx.returning||ctx.descending){suspended=null;if(current)hide();return;}
  if(ctx.loading){suspendForGameplay();return;}
  if(ctx.resuming||ctx.inMenu&&current&&!topicById(current.topic)?.pages.includes('settings')){suspendForGameplay();return;}
  if(suspended&&!current&&!ctx.inMenu&&!ctx.hidden&&!ctx.training&&!ctx.legacy&&!ctx.dialogOpen&&(!profile().run||ctx.paused||ctx.cleared||ctx.safeChoice)){const model=suspended.model;suspended=null;show(model);return;}
  if(current?.kind==='lesson'&&current.topic&&!current.invite){if(!current.pageBound&&(ctx.dialogOpen||ctx.inMenu)){current.page=ctx.page;current.pageBound=true;}else if(current.pageBound&&(!(ctx.dialogOpen||ctx.inMenu)||current.page!==ctx.page)){hide();lastOffer=ctx.now;return;}}
  if(current?.goal){const model=goalModel();if(JSON.stringify(model.goal)!==JSON.stringify(current.goal)||model.helpError!==current.helpError)show({...current,...model});}
  if(current){if(current.topic&&topicById(current.topic)?.pages.includes(current.page)&&current.page!==ctx.page&&!topicById(current.topic).pages.includes(ctx.page)){hide();lastOffer=ctx.now;}else ui.layout();return;}if(ctx.training||ctx.legacy||ctx.hidden)return;if(ctx.inMenu&&ctx.page!=='settings')return;
  // A real expedition never offers lessons automatically, including pause,
  // floor completion, cards, camp, recovery, and Settings opened from pause.
  if(profile().run)return;
  if(ctx.now-lastOffer<900)return;
  const r=path.record;if(!r.paused&&['welcome','sound','practice','expedition','return'].includes(r.phase)&&!profile().run&&!ctx.dialogOpen){foundation();return;}
  if(!r.paused&&r.phase==='upgrade'&&!r.seen.includes('forge')&&!r.deferred.includes('forge')&&!profile().run&&!ctx.dialogOpen){foundation();return;}
  if(r.paused)return;
  const pages=openQueue.splice(0),pending=r.pending.filter(id=>!isExpeditionTopic(id));let id=pending.find(id=>topicById(id)?.pages.some(p=>p===ctx.page||pages.includes(p)&&p.startsWith(ctx.page+':')));
  if(!id&&!ctx.inMenu&&!ctx.dialogOpen&&!profile().run&&r.phase==='done')id=pending.find(id=>topicById(id)?.eligible(profile()));
  if(id){const t=topicById(id);lesson(id,{invite:!!t.open&&!t.pages.includes(ctx.page)});lastOffer=ctx.now;}
 }
 persist();return {tick,opened,catalog,briefing,suspendForGameplay,events(events){if(path.events(events,profile()))persist();},get active(){return ui.active;},get record(){return path.record;},get guideUnread(){return !path.record.guideOpened;},get resumeExpress(){return path.record.phase==='practice'&&path.record.milestones.practiceStarted&&!path.record.milestones.practiceVisited;},trainingFinished(){path.practiceFinished();persist();lastOffer=-Infinity;},layout:()=>ui.layout(),hide,dispose(){doc.removeEventListener('click',click,true);ui.dispose();}};
}
