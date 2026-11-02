import {mountHudHitRegions} from './hud-hit-regions.js';
import {bindConsumableButton} from './consumable-input.js';
import {tempoCue,mountTempoCue} from './tempo-cue.js';
import {orbPauseMarkup} from './approved-orb-presentation.js';
import {usesStairs,stairReady,stairGuided,stairObjective,stairHint,caveObjective,pressureCaption} from './cave-descent.js';
import {createHudLayoutPresenter} from './hud-layout-presenter.js';
import {prepareBossHud,updateBossPresentation} from './boss-hud.js';
import {updateMinibossHud} from './cave-miniboss-hud.js';
import {updateCaveFindHud} from './cave-find-hud.js';
import {updateOrbHud} from './run-orb-hud.js';
import {syncCombo,clearComboFeedback} from './gamefeel-v5.js';
import {expeditionHudMarkup} from './hud-markup.js';
import {hudView,rhythmPositions,rhythmWave} from './hud-model.js';
import {missionObjectiveArt} from './hud-art.js';
import {ITEMS,power,pathTo} from './core.js';
import {activeCards,cardCount} from './cards.js';
import {pauseCardSummary} from './approved-pause-summary.js';
import {hudArt} from './hud-art.js';
import {createApprovedPulseFeel} from './approved-pulse-feel.js';
import {isAbyss} from './frenzy.js';
import {glyph} from './ui-art.js';
import {releaseCaveHudLayout} from './cave-hud-layout.js';
const number=n=>new Intl.NumberFormat('pt-BR').format(n);
const timeLeft=m=>{const seconds=Math.ceil(m.remaining),minutes=Math.floor(seconds/60);return seconds>=3600?Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'min':minutes+':'+String(seconds%60).padStart(2,'0');};
// Scroll the focused status rail without forwarding navigation keys to gameplay.
export function scrollBuffRegion(event){
 const node=event.currentTarget;if(event.target!==node||event.altKey||event.ctrlKey||event.metaKey||node.scrollHeight<=node.clientHeight+1)return;
 const max=Math.max(0,node.scrollHeight-node.clientHeight),step=44,page=Math.max(step,node.clientHeight-step),top=node.scrollTop;
 const target={ArrowDown:top+step,ArrowUp:top-step,PageDown:top+page,PageUp:top-page,Home:0,End:max}[event.key];
 if(target===undefined)return;event.preventDefault();event.stopPropagation();node.scrollTo({top:Math.max(0,Math.min(max,target)),behavior:'instant'});
}
export function createExpeditionHud({document:doc,actions={}}={}){
 const hudLayout=createHudLayoutPresenter();
 let root=null,active=false,last=null,feel=null,showTempo=null,hitRegions=null,pauseTab='cards';const pauseAnchors=new Map();const anchors=new Map(),legacy=new Map();
 const old=id=>doc.getElementById(id),field=id=>active?root?.querySelector('[data-hud-field="'+id+'"]'):null;
 function adopt(id,parent){const node=old(id);if(!node||!parent)return;if(!anchors.has(node)){const marker=doc.createComment('hud-v5-origin:'+id);node.before(marker);anchors.set(node,marker);}parent.append(node);}
 function mount(){if(root)return;if(doc.head&&!doc.head.querySelector('link[data-cave-stairs]')){const css=doc.createElement('link');css.rel='stylesheet';css.href=new URL('./cave-descent-hud.css',import.meta.url).href;css.dataset.caveStairs='';doc.head.append(css);}root=doc.createElement('div');if(!doc.getElementById('hudLayoutStyles')){const css=doc.createElement('link');css.id='hudLayoutStyles';css.rel='stylesheet';css.href=new URL('./hud-layout.css',import.meta.url).href;doc.head.append(css);}root.id='hud5Root';root.hidden=true;root.innerHTML=expeditionHudMarkup();old('stage').append(root);showTempo=mountTempoCue(doc,root.querySelector('[data-hud-field=bpmLabel]'));prepareBossHud(doc,old('bossHud'));root.querySelector('[data-hud-field=scoreNext]').hidden=true;
  const track=root.querySelector('.track');track.insertAdjacentHTML('afterbegin','<svg class="rhythm-wave" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path data-hud-field="wavePath"/></svg>');
  const left=doc.createElement('div');left.className='hud5-left';
  const critical=doc.createElement('div');critical.className='hud5-critical';critical.setAttribute('aria-label','Objetivo, perigos e resgate');
  const abyss=doc.createElement('div');abyss.className='hud5-abyss-critical';critical.append(abyss);
  const details=doc.createElement('div');details.className='hud5-details';details.tabIndex=0;details.setAttribute('role','region');details.setAttribute('aria-label','Situação da expedição');left.append(details,critical);const buffs=doc.createElement('div');buffs.className='hud5-buffs';buffs.tabIndex=0;buffs.setAttribute('role','region');buffs.setAttribute('aria-label','Poderes ativos');buffs.addEventListener('keydown',scrollBuffRegion);const cards=doc.createElement('section');cards.className='hud5-cards';cards.tabIndex=0;cards.setAttribute('role','region');cards.setAttribute('aria-label','Cartas ativas');cards.addEventListener('keydown',scrollBuffRegion);left.insertBefore(buffs,critical);root.querySelector('.hud').append(left,cards);feel=createApprovedPulseFeel(root);
  const cover=old('pauseCover'),tabs=doc.createElement('nav'),content=doc.createElement('section');tabs.className='approved-pause-tabs';tabs.setAttribute('aria-label','Informações na pausa');content.className='approved-pause-content';
  for(const [id,label]of [['cards','Cartas'],['details','Expedição']]){const button=doc.createElement('button');button.type='button';button.textContent=label;button.dataset.pauseTab=id;button.onclick=()=>{pauseTab=id;renderPause(last?.profile);};tabs.append(button);}
  const window=doc.createElement('div');window.className='approved-pause-window';const head=doc.createElement('header');head.className='approved-pause-head';const footer=doc.createElement('footer');footer.className='approved-pause-footer';
  for(const id of ['pauseTitle','pauseText','resume']){const node=old(id),marker=doc.createComment('approved-pause-origin:'+id);node.before(marker);pauseAnchors.set(node,marker);}
  const close=doc.createElement('button');close.type='button';close.className='approved-pause-close';close.setAttribute('aria-label','Voltar à expedição');close.textContent='×';close.onclick=()=>old('resume').click();const learn=doc.createElement('button');learn.type='button';learn.textContent=actions.learningNotice?.()?'Tutorial · Novo':'Tutorial';learn.dataset.learningNotice='';learn.setAttribute('aria-label','Consultar tutorial');learn.onclick=()=>{actions.learn?.();learn.textContent='Tutorial';};head.append(old('pauseTitle'),learn,close);
  const retreat=doc.createElement('button');retreat.type='button';retreat.className='approved-pause-retreat';retreat.textContent='Voltar ao refúgio';retreat.onclick=()=>actions.extract?.();const settings=doc.createElement('button');settings.type='button';settings.textContent='Configurações';settings.onclick=()=>old('openApplicationMenu')?.click();footer.append(retreat,settings,old('resume'));window.append(head,old('pauseText'),tabs,content,footer);cover.append(window);
  root.querySelector('[data-hud-field="pause"]').onclick=()=>actions.pause?.();
  root.querySelector('[data-hud-field="settings"]').onclick=e=>{e.stopPropagation();const menu=old('openApplicationMenu');if(menu&&!menu.disabled)menu.click();};
  root.querySelector('[data-hud-field="extract"]').onclick=()=>{if(!field('extract').disabled)actions.extract?.();};
  for(const item of ITEMS)bindConsumableButton(root.querySelector('[data-hud-field="item-'+item.id+'"]'),event=>actions.item?.(item.id,event));
  hitRegions=mountHudHitRegions(root);
 }
 function mode(enabled){mount();if(enabled===active)return;if(!enabled){hudLayout.clear();showTempo?.(null);root.style.removeProperty('--boss-mission-offset');clearComboFeedback(root);feel?.stop();}active=enabled;root.hidden=!enabled;doc.body.classList.toggle('hud-v5',enabled);doc.body.classList.toggle('hud-v3',enabled);doc.body.classList.toggle('hud-clean-v5',enabled);
  if(enabled){
   releaseCaveHudLayout(doc);adopt('bossHud',root);
   for(const id of ['runHud','scoreHud','breathHud','missionHud','runControls','controlDeck','explorationHud']){const node=old(id);if(!node)continue;legacy.set(node,{aria:node.getAttribute('aria-hidden'),inert:node.hasAttribute('inert')});node.classList.add('hud5-legacy');node.setAttribute('aria-hidden','true');node.setAttribute('inert','');}
   const critical=root.querySelector('.hud5-critical'),abyss=root.querySelector('.hud5-abyss-critical'),details=root.querySelector('.hud5-details');
   for(const id of ['objective','musicCue','message','toast'])adopt(id,critical);const objective=old('objective');if(objective&&!objective.querySelector('[data-hud-field=sequenceMeter]')){const bar=doc.createElement('div');bar.className='meter approved-sequence';bar.dataset.hudField='sequenceMeter';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','Sequência necessária');bar.innerHTML='<i data-hud-field="sequenceFill"></i>';objective.insertBefore(bar,old('bagLabel'));old('charge')?.previousElementSibling&&(old('charge').previousElementSibling.textContent='Carga');old('goal')?.previousElementSibling&&(old('goal').previousElementSibling.textContent='Sequência');}adopt('procFeed',root.querySelector('.hud5-buffs'));
   for(const id of ['depthLift','targetTip'])adopt(id,details);adopt('runCards',root.querySelector('.hud5-cards'));adopt('boostHud',root.querySelector('.hud5-buffs'));adopt('frenzyHud',details);
   for(const id of ['liveQuest','rescueHud'])adopt(id,abyss);
   // Preserve the actual IDs/animation targets while changing their presentation axis.
   const stars=field('earnedStars');stars.innerHTML='';for(let i=1;i<=5;i++){const anchor=doc.createElement('span');anchor.className='hud5-star-anchor';anchor.dataset.star=String(i);stars.append(anchor);const node=old('starSlot'+i);if(node){adopt(node.id,anchor);node.classList.add('hud5-star');node.innerHTML=glyph('star');}}
   for(const id of ['novaMeter','novaHint'])adopt(id,root.querySelector('.combo'));
  }else{
   root.querySelector('[data-hud-field=sequenceMeter]')?.remove();for(const[node,marker]of anchors){if(marker.parentNode){marker.parentNode.insertBefore(node,marker);marker.remove();}}anchors.clear();
   for(const[node,state]of legacy){node.classList.remove('hud5-legacy');if(state.aria===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',state.aria);if(!state.inert)node.removeAttribute('inert');}legacy.clear();
  }
 }
 function renderPause(profile){
  if(!profile?.run)return;const notice=old('pauseCover').querySelector('[data-learning-notice]');if(notice)notice.textContent=actions.learningNotice?.()?'Tutorial · Novo':'Tutorial';const cover=old('pauseCover'),body=cover.querySelector('.approved-pause-content');if(!body)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  cover.querySelectorAll('[data-pause-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pauseTab===pauseTab)));
  body.innerHTML=pauseTab==='cards'?(pauseCardSummary(profile).map(c=>
   '<article class="pause-card-row" data-card="'+c.id+'"><span class="pause-card-icon" aria-hidden="true">'+c.icon+'</span><strong class="pause-card-name">'+esc(c.name)+'</strong><b class="pause-card-level" aria-label="Nível '+c.level+'">'+c.level+'</b><span class="pause-card-effect">'+esc(c.effect)+'</span></article>').join('')||'<p>Sem cartas nesta descida.</p>'):
   '<div class="pause-facts">'+[['coin','Moedas na base',number(profile.bank)],['star','Estrelas',number(profile.stars)],['record','Recorde',old('record')?.textContent||'—']].map(([icon,label,value])=>'<div class="pause-fact" role="group" aria-label="'+esc(label)+': '+esc(value)+'">'+hudArt(icon)+'<strong>'+esc(value)+'</strong></div>').join('')+'</div>'+orbPauseMarkup(profile.run);
 }

 function meter(name,bar,value,max,fill,vertical=false){const node=field(name);node.setAttribute('aria-valuemin','0');node.setAttribute('aria-valuemax',String(max));node.setAttribute('aria-valuenow',String(Math.max(0,Math.min(max,Math.ceil(value)))));const part=field(bar);part.style.width=vertical?'100%':fill*100+'%';if(vertical)part.style.height=fill*100+'%';}
 function updateCompletion(objective,r,blocked,hint){
  let box=objective.querySelector('[data-cave-completion]');
  if(!box){box=doc.createElement('section');box.dataset.caveCompletion='';box.innerHTML='<div class="cave-charge-value"><span>Carga</span><strong data-charge-value></strong></div><div class="meter cave-charge-meter" role="progressbar" aria-label="Carga para descer"><i></i></div><div class="cave-charge-value" data-excursion hidden><span>Salas</span><strong></strong></div><button type="button" class="primary cave-complete" hidden>DESCER ↓</button><small class="cave-hole-hint" hidden></small>';objective.querySelector('small').after(box);const button=box.querySelector('button');button.onclick=()=>{if(!button.disabled)actions.completeFloor?.();};}
  const q=caveObjective(r),bar=box.querySelector('[role=progressbar]'),value=box.querySelector('[data-charge-value]'),button=box.querySelector('button'),nav=box.querySelector('.cave-hole-hint');box.hidden=!q.active;box.dataset.ready=String(q.ready);
  box.querySelector('.cave-charge-value').hidden=q.boss;bar.hidden=q.boss;value.textContent=number(q.value)+' / '+number(q.goal);bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(q.goal));bar.setAttribute('aria-valuenow',String(q.value));bar.querySelector('i').style.width=q.fill*100+'%';
  const excursion=box.querySelector('[data-excursion]');excursion.hidden=!q.excursion.active;excursion.querySelector('strong').textContent=q.excursion.value+' / '+q.excursion.goal;
  button.hidden=!q.ready;button.disabled=blocked||!q.ready;button.setAttribute('aria-label','Concluir andar e escolher carta');nav.textContent=hint;nav.hidden=!hint||q.boss;
 }
 function update({profile:s,elapsed=0,blocked=false,tutorial=false,wallet=null}={}){
  mode(!!s?.run);root.hidden=!!tutorial||!active;last={profile:s,elapsed,blocked,tutorial,wallet};if(!active||tutorial)return;updateOrbHud(root,s.run);updateCaveFindHud(root,s.run);updateMinibossHud(root,s.run);
  const r=s.run,v=hudView(s,elapsed),balances=wallet||s;
  const objective=old('objective'),stairs=usesStairs(r),exit=r.room.exit,known=exit&&(!r.room.explored||r.room.explored[exit.y*r.room.cols+exit.x]),route=stairs&&stairReady(r)&&(known||stairGuided(r))?pathTo(r.room,r.player,exit):[],stairLabel=stairs?stairObjective(r,route[Math.min(3,route.length-1)]||exit):'';if(objective){const title=objective.querySelector('small');if(stairs)objective.dataset.stairway='true';else delete objective.dataset.stairway;for(const node of objective.children)if(!node.hasAttribute('data-cave-alerts')&&!node.hasAttribute('data-cave-completion'))node.hidden=stairs&&node!==title;title.textContent=stairs?stairLabel:'↓ ELEVADOR';if(stairs||objective.querySelector('[data-cave-completion]'))updateCompletion(objective,r,blocked,stairs?stairHint(r,route[Math.min(3,route.length-1)]||exit):'');let notice=objective.querySelector('[data-stair-pressure]');if(stairs&&!notice){notice=doc.createElement('p');notice.dataset.stairPressure='';objective.append(notice);}if(notice){notice.textContent=stairs?pressureCaption(r):'';notice.hidden=!stairs||!notice.textContent;}if(stairs)objective.hidden=!!r.room.cleared;}
 const activeCardTotal=activeCards(r).length;root.querySelector('.hud5-cards').hidden=!activeCardTotal||!!r.room.cleared;old('frenzyHud').hidden=!isAbyss(r);if(field('sequenceMeter'))meter('sequenceMeter','sequenceFill',Math.min(r.combo,r.room.goal),r.room.goal,Math.max(0,Math.min(1,r.combo/Math.max(1,r.room.goal))));
  field('hpLabel').textContent=Math.ceil(v.hp.value)+' / '+v.hp.max;meter('hpMeter','hpBar',v.hp.value,v.hp.max,v.hp.ratio);
  field('breathLabel').textContent=Math.ceil(v.breath.value)+' / '+v.breath.max;meter('breathMeter','breathBar',v.breath.value,v.breath.max,v.breath.ratio);field('breathHud').dataset.low=String(v.breath.low);field('breathHint').textContent=old('breathHint')?.textContent||'ACERTE O PULSO';
  field('bank').textContent=number(balances.bank);field('walletStars').textContent=number(s.stars);field('record').textContent=old('record')?.textContent||(isAbyss(r)?(s.abyssBest||0)+' m':s.best?s.best*25+' m':'—');
  field('combo').textContent=r.combo+'×';syncCombo(root,r.combo,{phase:v.phase,blocked,reduced:doc.body.classList.contains('soft-fx')});field('railMultiplier').textContent='×'+v.score.multiplier.toFixed(2);field('trackName').textContent=v.trackName;
  field('explorationValue').textContent=v.exploration.percent+'%';meter('explorationMeter','explorationBar',v.exploration.percent,100,v.exploration.fill);root.querySelector('.exploration').setAttribute('aria-label',isAbyss(r)?'Exploração da janela atual do Abismo':'Exploração do piso revelado');
  field('missionHud').hidden=!v.mission;field('missionHud').dataset.ready=String(v.mission?.status==='ready');if(v.mission){const m=v.mission;if(field('missionIcon').dataset.key!==m.template){field('missionIcon').innerHTML=missionObjectiveArt(m.template);field('missionIcon').dataset.key=m.template;}field('missionTier').textContent=old('missionTier')?.textContent||'MISSÃO ACEITA';field('missionName').textContent='';field('missionTask').textContent=m.definition.verb;field('missionProgress').textContent=m.progress+' / '+m.goal;field('missionHud').title=m.status==='ready'?'Missão pronta para entregar':m.definition.verb;field('missionTime').textContent=old('missionTime')?.textContent||(m.status==='ready'?'✓ ENTREGAR NA BASE':m.status==='expired'?'PRAZO ENCERRADO':timeLeft(m)+(blocked?' · PAUSADA':''));}
  for(const item of ITEMS){const button=field('item-'+item.id),original=old('item-'+item.id),count=r.items[item.id]||0;button.querySelector('.quantity').textContent=count;button.disabled=blocked||original?.disabled||!count||r.room.cleared;button.dataset.ready=String(count>0);button.title=original?.title||item.name;button.setAttribute('aria-label',original?.getAttribute('aria-label')||item.name);}
  field('scoreValue').textContent=number(r.score.points);meter('scoreMeter','scoreFill',v.score.fill*100,100,v.score.fill,true);field('scoreNext').textContent=usesStairs(r)&&Math.max(r.beat,r.acted)>=r.room.scoreBeats?'PONTUAÇÃO ENCERRADA':r.score.earned===5?'5 / 5 · TODAS CONQUISTADAS':'PRÓXIMA ESTRELA · '+number(v.score.goal)+' PONTOS';
  const key=v.marks.join(',');if(field('scoreMarks').dataset.key!==key){field('scoreMarks').innerHTML=v.marks.map(mark=>'<i style="bottom:'+mark/v.marks[4]*100+'%">'+number(Math.round(r.score.target*mark))+'</i>').join('');field('scoreMarks').dataset.key=key;}
  field('earnedStars').setAttribute('aria-label',r.score.earned+' de 5 estrelas');for(let i=1;i<=5;i++){const slot=old('starSlot'+i);if(slot){slot.classList.toggle('lit',i<=r.score.earned);slot.parentElement.style.bottom=v.marks[i-1]/v.marks[4]*100+'%';slot.title=number(Math.round(r.score.target*v.marks[i-1]))+' PONTOS';}}
  field('extract').disabled=blocked;field('extract').setAttribute('aria-label','Voltar pra casa · E');field('settings').disabled=!!old('openApplicationMenu')?.disabled;field('pause').disabled=!!r.recovery?.active||!!r.rest?.active||!!r.abyss?.cardChoice;
  field('runPlace').textContent=isAbyss(r)?'Abismo':'Andar '+r.floor;field('runDepth').textContent=number(isAbyss(r)?(r.abyss?.rows||0)*5:r.floor*25)+' m';
  field('runGoal').textContent=usesStairs(r)?stairLabel:isAbyss(r)?'SOBREVIVA · APROFUNDE A DESCIDA':r.room.cleared?'✓ ELEVADOR LIBERADO':r.room.bossFloor?'DERROTE O GUARDIÃO':'CARGA '+(old('charge')?.textContent||'')+' · '+(old('goal')?.textContent?.startsWith('ESTABILIZANDO')?old('goal').textContent:'SEQUÊNCIA '+(old('goal')?.textContent||''));
  field('runBag').textContent='Mochila · '+number(r.bag)+' ● · '+number(r.materials.reduce((sum,n)=>sum+n,0))+' ◇';
  field('place').textContent=isAbyss(r)?'ABISMO · EXPLORAÇÃO DA JANELA ATUAL':'ANDAR '+r.floor;root.querySelector('.hud5-abyss-critical').hidden=!isAbyss(r);feel?.update(r.combo,{blocked,reduced:doc.body.classList.contains('soft-fx')});if(!old('pauseCover').hidden)renderPause(s);
 }
 function frame({profile,phase,beatSeconds,windowMs,bpm,blocked=false,tutorial=false,reduced=false}={}){
  if(root.dataset&&root.dataset.feedbackHeld!==String(blocked||doc.hidden))root.dataset.feedbackHeld=String(blocked||doc.hidden);
  if(!profile?.run){mode(false);return;}if(!active)update({profile,blocked,tutorial});root.hidden=!!tutorial;if(tutorial)return;
  showTempo?.(tempoCue(profile.run,phase,{blocked,tutorial}));
  updateCaveFindHud(root,profile.run,phase);updateMinibossHud(root,profile.run);updateBossPresentation(root,profile.run);syncCombo(root,profile.run.combo,{phase,reduced,blocked});feel?.update(profile.run.combo,{blocked,reduced});
  const sequence=rhythmPositions(phase,profile.run),width=beatSeconds>0?windowMs/1000/beatSeconds*50:0;field('perfectZone').style.width=width+'%';field('perfectZone').style.left=(15-width/2)+'%';
  root.querySelectorAll('.hud-note').forEach((n,i)=>{n.style.left=sequence.positions[i]+'%';n.dataset.beat=String(sequence.beats[i]);n.dataset.tone=String(((sequence.beats[i]%3)+3)%3);});field('wavePath').setAttribute('d',rhythmWave(phase,reduced?8:18));field('bpmLabel').textContent=Math.round(bpm)+' BPM';field('timing').textContent=old('timing')?.textContent||'SIGA O PULSO';field('extract').disabled=blocked;hudLayout.frame(root);
 }
 return {update,frame,field,confirmHit(combo){feel?.hit(combo,{reduced:doc.body.classList.contains('soft-fx')});},get active(){return active;},get root(){return root;},destroy(){mode(false);hitRegions?.dispose();hitRegions=null;hudLayout.dispose();feel?.destroy();for(const[node,marker]of pauseAnchors){marker.replaceWith(node);}pauseAnchors.clear();doc.querySelector('.approved-pause-window')?.remove();root?.remove();root=null;last=null;}};
}
