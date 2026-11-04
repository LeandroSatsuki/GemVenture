import {bindConsumableButton} from './consumable-input.js';
import {expeditionHudMarkup} from './hud-markup.js';
import {rhythmPositions,rhythmWave} from './hud-model.js';
import {createApprovedPulseFeel} from './approved-pulse-feel.js';
import {comboColor} from './gamefeel-v5.js';
import {actionWindowMs} from './core.js';
import {runRailSeconds} from './training-clock.js';

const art=id=>'assets/hud-v5/'+id+'.png';
const icons={rhythm:'assets/refuge-night-v3/swords.png',breath:art('breath'),mining:'assets/approved-art/quartz-b1.png',bomb:art('blast'),heal:art('tonic'),shield:art('ward'),heat:'assets/refuge-night-v3/swords.png',stars:art('star'),free:'assets/approved-art/quartz-b1.png',exit:art('home'),return:art('home'),forge:'assets/forge-v6/pickaxe-v01-256.png',purchase:'assets/forge-v6/pickaxe-v01-256.png',missions:'assets/refuge-night-v3/scroll.png',missionAccept:'assets/refuge-night-v3/scroll.png',done:art('home')};
const summaries={welcome:'Prepare sua próxima aventura.',lift:'Entre no elevador.',liftIntro:'Desça para um treino seguro.',rhythmIntro:'ESPAÇO quando a nota chegar à linha.',rhythm:'Acerte 5 ações seguidas.',breathIntro:'Errar tira fôlego. Acertar recupera.',breath:'Acerte no pulso para recuperar.',miningIntro:'Mire um cristal. Golpeie no pulso.',mining:'Quebre um cristal.',bombIntro:'1 prepara. De novo, usa a bomba.',bomb:'1 quando precisar. Continue no ritmo.',healIntro:'2 prepara. De novo, usa a cura.',heal:'2 quando precisar de vida.',shieldIntro:'3 prepara. De novo, usa o escudo.',shield:'3 quando precisar. Espere o bloqueio.',heatIntro:'Mais calor, mais perigo e saque.',heat:'Observe o calor aumentar.',stars:'Os pontos acendem os marcos da subida.',free:'Complete a sala para abrir a saída.',exit:'Volte pelo elevador.',return:'Ajuda única para a primeira melhoria.',forge:'Abra a Forja.',purchase:'Confira o ganho e o custo na Forja.',missions:'Abra o quadro de Missões.',missionAccept:'Escolha um objetivo e aceite.',done:'Sua aventura continua.'};
const headings={rhythmIntro:'Siga o ritmo',rhythm:'Siga o ritmo',breathIntro:'Recupere o fôlego',breath:'Recupere o fôlego',miningIntro:'Minere no pulso',mining:'Minere no pulso',bombIntro:'Bomba a qualquer momento',bomb:'Bomba a qualquer momento',healIntro:'Recupere a vida',heal:'Recupere a vida',shieldIntro:'Bloqueie o ataque',shield:'Bloqueie o ataque',heatIntro:'Sinta o Abismo',heat:'Sinta o Abismo',stars:'Alcance as estrelas',free:'Explore mais um pouco',exit:'Saída preparada',return:'Treino concluído'};
const labels={rhythm:'Acertos seguidos',breath:'Fôlego recuperado',mining:'Cristal quebrado',bomb:'Bomba usada',heal:'Cura aplicada',shield:'Ataque bloqueado',heat:'Aumento de calor',free:'Carga da sala'};
const lesson=step=>step.replace(/Intro$/,'');
const text=(el,value)=>{const next=String(value??'');if(el.textContent!==next)el.textContent=next;};
function styles(doc){if(doc.getElementById('approvedTrainingStyles'))return;
 // World measures the canvas immediately. Keep its first frame valid before the async sheet arrives.
 const critical=doc.createElement('style');critical.id='approvedTrainingLayout';critical.textContent='.tutor-training.approved-training{position:fixed;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr)}.tutor-training.approved-training[hidden]{display:none!important}.approved-training .gv-stage{position:relative;min-height:0;overflow:hidden}.approved-training canvas.gv-arena{position:absolute;inset:0;width:100%;height:100%;display:block}';doc.head.append(critical);
 const link=doc.createElement('link');link.id='approvedTrainingStyles';link.rel='stylesheet';link.href=new URL('./approved-training-ui.css',import.meta.url).href;link.addEventListener('load',()=>doc.defaultView.dispatchEvent(new doc.defaultView.Event('resize')),{once:true});doc.head.append(link);}

// Display-only projection: ready is owned by the existing controller, never by this view.
export function trainingGoal(model,view){
 const id=lesson(model.step),goal=labels[id];if(!goal||model.step==='exit')return null;
 const max=id==='rhythm'?5:id==='free'?(view?.practice?.goal||8):1;
 const value=id==='rhythm'?(model.ready?5:Math.min(5,view?.consecutive||0)):id==='free'?Math.min(max,view?.practice?.charge||0):Number(!!model.ready);
 return {label:goal,value,max,ready:!!model.ready};
}

export function createApprovedTrainingCoach(root){
 const doc=root.ownerDocument,q=s=>root.querySelector(s);styles(doc);root.classList.add('approved-training-guide');
 const panel=q('.tutor-panel'),heading=q('h2'),paragraph=q('p'),top=q('.tutor-top');
 const row=doc.createElement('div');row.className='gv-coach-top';const icon=doc.createElement('img');icon.className='gv-lesson-icon';icon.alt='';
 const info=doc.createElement('button');info.type='button';info.className='gv-info';info.setAttribute('aria-label','Ver explicação completa');info.setAttribute('aria-expanded','false');info.textContent='i';row.append(icon,heading,info);panel.prepend(row);
 const progress=doc.createElement('div');progress.className='gv-goal';progress.hidden=true;progress.innerHTML='<div class="gv-goal-top"><span></span><b></b></div><div class="gv-meter" role="progressbar" aria-label="Objetivo da etapa" aria-valuemin="0"><i></i></div><div class="gv-pips"><i></i><i></i><i></i><i></i><i></i></div>';paragraph.after(progress);
 const reward=doc.createElement('div');reward.className='gv-rewards';reward.hidden=true;progress.after(reward);
 const note=doc.createElement('p');note.className='gv-note';panel.append(note);const details=doc.createElement('div');details.className='gv-details';details.hidden=true;panel.append(details);
 const primary=q('[data-tutor-next]');primary.classList.add('primary');
 let current=null,options={},lastStep='',expanded=false,rawLive='';
 info.onclick=()=>{expanded=!expanded;details.hidden=!expanded;info.setAttribute('aria-expanded',String(expanded));};
 function goal(view){if(!current)return;const data=trainingGoal(current,view);progress.hidden=!data;if(!data)return;text(progress.querySelector('span'),current.allowContinue?'Sequência · livre':data.label);text(progress.querySelector('b'),data.value+'/'+data.max);const meter=progress.querySelector('.gv-meter');meter.setAttribute('aria-valuenow',data.value);meter.setAttribute('aria-valuemax',data.max);const fill=meter.firstElementChild;fill.style.width=100*data.value/data.max+'%';fill.style.background=data.ready?'#67e3b8':'#35d6f2';const pips=progress.querySelector('.gv-pips');pips.hidden=lesson(current.step)!=='rhythm';[...pips.children].forEach((p,i)=>p.classList.toggle('lit',i<data.value));}
 function live(value){rawLive=String(value||'');const error=/Não foi possível salvar|O salvamento mudou|Recarregue para/.test(rawLive);q('.tutor-live').classList.toggle('training-error',error);q('.tutor-live').setAttribute('role',error?'alert':'status');if(!current)return rawLive;if(/salv|Recarregue|Tente novamente; Pular/i.test(rawLive))return rawLive;if(current.ready)return 'Objetivo cumprido. Pode praticar mais.';if(rawLive.startsWith('Prática ativa.'))return 'Preparado · sem gastar.';if(rawLive.startsWith('Carga da sala:'))return '';if(rawLive.startsWith('ACERTO'))return 'Boa!';if(/Fôlego recarregado/.test(rawLive))return 'Fôlego recarregado no treino.';if(/^Demonstração/.test(rawLive))return 'Queda de fôlego no treino.';if(/^Calor /.test(rawLive))return 'Calor aumentou.';if(/^Fora do pulso/.test(rawLive))return 'Fora do pulso.';return rawLive;}
 function render(model,opts){
  current=model;options=opts;const id=lesson(model.step);root.dataset.training=String(!!opts.training);root.dataset.step=model.step;if(!opts.training){Object.assign(top.style,{left:'',top:'',right:'',bottom:'',width:'',transform:'',maxWidth:''});Object.assign(panel.style,{width:'',right:'',bottom:'',transform:''});}
  if(lastStep!==model.step){lastStep=model.step;expanded=false;info.setAttribute('aria-expanded','false');}
  details.hidden=!expanded;details.textContent=paragraph.textContent;text(heading,headings[model.step]||model.copy.title);text(paragraph,model.allowContinue?'ESPAÇO ou toque na área. Saia quando quiser.':model.step==='done'&&opts.profileInRun?'Retome sua expedição.':summaries[model.step]||model.copy.text);icon.src=icons[id]||icons.rhythm;
  goal(opts.practice);reward.replaceChildren();reward.hidden=true;
  if(model.step==='return'){
   const grant=opts.reward?.grant;const cells=[];if(grant?.coins)cells.push([art('coin'),'Moedas',grant.coins]);(grant?.materials||[]).forEach((n,i)=>{if(n)cells.push(['assets/refuge-night-v3/gem-'+i+'.png',['Quartzo','Rubi','Topázio','Esmeralda'][i],n]);});
   for(const[src,name,n]of cells){const span=doc.createElement('span'),img=doc.createElement('img'),value=doc.createElement('b');img.src=src;img.alt=name;value.textContent=n;span.append(img,value);reward.append(span);}reward.hidden=!cells.length;
   if(opts.reward&&!cells.length)text(paragraph,'Seu perfil já recebeu a ajuda ou já tem o necessário.');
  }
  text(note,id==='shield'?'Escudo bloqueia ataques, não erros de ritmo.':id==='breath'?'Só no treino, zerar recarrega.':['mining','free'].includes(id)?'WASD / setas · mover · toque no minério para mirar.':['bomb','heal','shield'].includes(id)&&model.reading?'Primeiro toque prepara, sem gastar.':model.step==='return'?'Uma vez por perfil. Só o que faltar.':model.step==='stars'?'Demonstração · sem prêmio ao perfil.':'');note.hidden=!note.textContent;
  if(model.copy.practice){primary.hidden=model.step==='exit';primary.disabled=!model.ready&&!model.allowContinue;}else primary.disabled=false;
  q('[data-tutor-pause]').hidden=!opts.training;q('[data-tutor-pause]').disabled=!!model.reading;
  if(opts.training){text(q('[data-tutor-pause]'),opts.paused&&!model.reading?'Retomar · P':'Pausar · P');text(q('[data-tutor-skip]'),'Pular · ESC');}else{text(q('[data-tutor-skip]'),'Pular');}
  return live(rawLive);
 }
 function layout(){
  if(root.hidden||!options.training)return false;
  const surface=doc.querySelector('.tutor-training.approved-training:not([hidden])');if(!surface)return false;
  const win=doc.defaultView,slot=surface.querySelector('[data-training-coach]').getBoundingClientRect(),menu=surface.querySelector('[data-training-menu]').getBoundingClientRect();
  const ps=parseFloat(win.getComputedStyle(panel).zoom)||1,ts=parseFloat(win.getComputedStyle(top).zoom)||1;
  panel.style.width=Math.max(180,(slot.width-12)/ps)+'px';panel.style.maxHeight=Math.max(130,(slot.height-20)/ps)+'px';panel.style.overflowY='auto';
  Object.assign(panel.style,{left:'auto',top:(slot.top+12)/ps+'px',right:6/ps+'px',bottom:'auto',transform:'none'});
  Object.assign(top.style,{left:'auto',right:Math.max(8,win.innerWidth-menu.right)/ts+'px',bottom:'auto',width:'max-content',maxWidth:Math.max(180,menu.width/ts)+'px'});const r=top.getBoundingClientRect();Object.assign(top.style,{top:Math.max(6,menu.top+(menu.height-r.height)/2)/ts+'px',transform:'none'});
  root.querySelectorAll('.tutor-shade,.tutor-ring,.tutor-arrow').forEach(e=>e.hidden=true);
  return true;
 }
 return{render,layout,live,progress({view}){goal(view);}};
}

export function createApprovedTrainingSurface({document:doc,onAction,onExit}){
 styles(doc);const el=doc.createElement('section');el.className='tutor-training approved-training';el.hidden=true;el.setAttribute('aria-label','Treino isolado');
 el.innerHTML='<header class="gv-head"><div class="gv-title"><img src="assets/refuge-night-v3/swords.png" alt=""><b>Treino de ritmo</b></div><div data-training-menu></div><strong data-training-bpm hidden></strong></header><div class="tutor-arena gv-stage"><canvas class="gv-arena" tabindex="0" aria-label="Área de treino. Espaço golpeia, direções movem, 1 bomba, 2 cura, 3 escudo."></canvas><div class="gv-play"><div class="gv-hud"><div class="tutor-vitals gv-vitals"><div class="gv-vital" data-tutor-life><img src="'+art('heart')+'" alt="Vida"><div class="gv-meter life" role="progressbar" aria-label="Vida" aria-valuemin="0"><i></i></div><b>100</b></div><div class="gv-vital" data-tutor-breath><img src="'+art('breath')+'" alt="Fôlego"><div class="gv-meter" role="progressbar" aria-label="Fôlego" aria-valuemin="0"><i></i></div><b>100</b></div><small data-training-protected><img src="'+art('ward')+'" alt="">Fôlego protegido</small><small data-tutor-count-in></small><small data-tutor-resets></small></div><div class="gv-combo"><small>COMBO</small><b data-tutor-combo>0×</b></div><div data-tutor-heat></div><div data-tutor-stars></div></div><div class="gv-console"><footer>'+['blast','tonic','ward'].map((id,i)=>'<button type="button" class="item-button" data-training-item="'+id+'" aria-label="'+['Bomba','Cura','Escudo'][i]+' · '+(i+1)+'"><kbd>'+(i+1)+'</kbd><img src="'+art(id)+'" alt=""><b>0</b></button>').join('')+'</footer><div class="tutor-pulse official-training-pulse" aria-label="Guia visual do ritmo oficial"></div><div class="training-pulse-caption"><kbd>ESPAÇO</kbd> ou toque na área</div><button type="button" class="primary" data-training-exit hidden><img src="'+art('home')+'" alt="">Voltar ao Refúgio</button></div></div><div data-training-coach aria-hidden="true"></div></div>';
 // Consume the production track itself: same five glyphs, 15% strike line and feel nodes.
 const template=doc.createElement('template');template.innerHTML=expeditionHudMarkup();const track=template.content.querySelector('.rail .track');el.querySelector('.tutor-pulse').append(track);
 track.insertAdjacentHTML('afterbegin','<svg class="rhythm-wave" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path data-training-wave/></svg>');
 doc.body.append(el);const q=s=>el.querySelector(s),feel=createApprovedPulseFeel(el);let soft=false,lastStarKey='',lastFeedback=0,lastRun=null;
 const starTrack=doc.createElement('div');starTrack.className='gv-star-ladder';q('[data-tutor-stars]').append(starTrack);
 el.querySelectorAll('[data-training-item]').forEach(b=>bindConsumableButton(b,inputEvent=>onAction({type:'item',item:b.dataset.trainingItem,inputEvent})));q('[data-training-exit]').onclick=onExit;
 return{el,canvas:q('canvas'),q,show(v){el.hidden=!v;if(!v)feel.stop();},
 feedback(accepted,reduced=false){soft=reduced;if(accepted)feel.hit(lastRun?.combo||0,{reduced});lastFeedback=performance.now();q('.tutor-pulse').dataset.feedback=accepted?'hit':'miss';if(!reduced&&!doc.defaultView.matchMedia('(prefers-reduced-motion:reduce)').matches)q('[data-tutor-combo]').animate?.([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:220});},
 update({state,view,maxHealth=100,maxRhythm=100,heat,stars,starData}){
  const r=state.run;if(!r)return;lastRun=r;soft=doc.body.classList.contains('soft-fx');const combo=r.combo||0;el.dataset.soft=String(soft);text(q('[data-tutor-combo]'),combo+'×');q('[data-tutor-combo]').dataset.value=combo;q('[data-tutor-combo]').style.color=comboColor(combo);
  for(const[key,value,max]of [['life',r.health,maxHealth],['breath',r.rhythm,maxRhythm]]){const cell=q('[data-tutor-'+key+']'),meter=cell.querySelector('[role=progressbar]');text(cell.querySelector('b'),Math.ceil(value));meter.setAttribute('aria-valuenow',value);meter.setAttribute('aria-valuemax',max);meter.firstElementChild.style.width=Math.max(0,Math.min(100,value/max*100))+'%';}
  text(q('[data-training-bpm]'),view.bpm+' BPM');q('[data-training-protected]').hidden=view.breathEnabled;text(q('[data-tutor-count-in]'),view.countIn>0?'Entrada · '+view.countIn:'');text(q('[data-tutor-resets]'),view.breathResets?'Fôlego recarregado · '+view.breathResets+'×':'');
  el.querySelectorAll('[data-training-item]').forEach(b=>{const n=r.items?.[b.dataset.trainingItem]||0;text(b.querySelector('b'),n);b.disabled=!n;b.dataset.empty=String(!n);b.dataset.target=String(({bomb:'blast',heal:'tonic',shield:'ward'})[view.lesson]===b.dataset.trainingItem);b.setAttribute('aria-label',({blast:'Bomba',tonic:'Cura',ward:'Escudo'})[b.dataset.trainingItem]+' · '+n+' cargas');});
  const sequence=rhythmPositions(view.phase,view.albumEdition?{albumEdition:view.albumEdition}:null),width=actionWindowMs(state,Math.round(view.phase))/1000/runRailSeconds(r,view.phase)*50;
  q('.perfect-zone').style.width=width+'%';q('.perfect-zone').style.left=(15-width/2)+'%';el.querySelectorAll('.hud-note').forEach((n,i)=>{n.style.left=sequence.positions[i]+'%';n.dataset.beat=sequence.beats[i];n.dataset.tone=((sequence.beats[i]%3)+3)%3;});q('[data-training-wave]').setAttribute('d',rhythmWave(view.phase,soft?8:18));feel.update(combo,{blocked:view.paused,reduced:soft});if(performance.now()-lastFeedback>380)q('.tutor-pulse').dataset.feedback='';
  text(q('[data-tutor-heat]'),view.scene==='heat'?heat:'');q('[data-tutor-heat]').hidden=view.scene!=='heat';q('[data-tutor-stars]').hidden=!stars;
  if(starData){const key=JSON.stringify(starData);if(key!==lastStarKey){lastStarKey=key;starTrack.replaceChildren();const value=doc.createElement('b');value.textContent=r.score.points.toLocaleString('pt-BR');starTrack.append(value);const line=doc.createElement('div');line.className='gv-star-line';const fill=doc.createElement('i');fill.style.height=Math.min(100,r.score.points/starData.target*100)+'%';line.append(fill);starData.marks.forEach((m,i)=>{const img=doc.createElement('img');img.src=art('star');img.alt=Math.round(starData.target*m)+' pontos';img.className=i<starData.earned?'lit':'';img.style.bottom=m*100+'%';line.append(img);});starTrack.append(line);const next=doc.createElement('small');next.textContent=Number.isFinite(starData.goal)?starData.earned+'/5 · próximo '+starData.goal.toLocaleString('pt-BR'):'5/5 · marcos completos';starTrack.append(next);}}
  q('[data-training-exit]').hidden=!r.room.cleared;
 },target(id){return {pulse:q('.tutor-pulse'),breath:q('[data-tutor-breath]'),combo:q('[data-tutor-combo]'),blast:q('[data-training-item=blast]'),tonic:q('[data-training-item=tonic]'),ward:q('[data-training-item=ward]'),heat:q('[data-tutor-heat]'),stars:q('[data-tutor-stars]'),exit:q('[data-training-exit]')}[id];}};
}
