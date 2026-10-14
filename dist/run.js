import {settleMiner} from './miner.js';
import {MinerGame} from './miner-view.js';
import {TalentView} from './talent-view.js';
import {applyDialogUI} from './ui-labels.js';
import {astralMarkup} from './astral-view.js';
import {rollAstral,chooseAstral,equipAstral} from './astral.js';
import {invalidateProgression} from './progression-effects.js';
import {ZagGame} from './zag-view.js';
import {settleZag,zagRoundState} from './zag.js';
import {updatePickaxeCursor} from './pickaxe-cursor.js';
import {upgradeBuilding,missionSlots,nextMissionSlot} from './village.js';
import {buildingMarkup} from './village-view.js';
import {floorAddress,canEnterAbyss,canStartAt,depositGate,unlockStop} from './descent-progress.js';
import {liftScreenMarkup} from './lift-view.js';
import {isAbyss,musicFloor,heatState,MUTATORS,BOOSTS,activeBoost,rescueAvailable,secureCargo,skipRescue} from './frenzy.js';
import {visible,environment,terrainAt} from './cavern.js';
import {makeOffering,buyRelic,skillPointCost} from './pillars.js';
import {wellMarkup,relicMarkup,experienceMarkup} from './pillar-view.js';
import {MATERIALS,wellRecipe,canPayMaterials} from './materials.js';
import {expeditionMap,gemIcon} from './expedition-map.js';
import {FORGE_PROJECTS,forgeProject,depositForge,craftForge} from './forge.js';
import {GEAR_ITEMS,rollGear,chooseGearTrait,discardGearRoll,upgradeGearTrait,clearGearTrait} from './gear.js';
import {recipeMarkup,forgeMarkup,forgeDepositAmount} from './forge-view.js';
import {ChoiceGuard} from './choice-guard.js';
import {ABYSS_CHOICE_SECONDS,abyssCardDefinition} from './abyss-cards.js';
import {chooseAbyssCard,advanceAbyssCards} from './core.js';
import {BOSSES,livingBoss} from './bosses.js';
import {MISSION_TYPES,MISSION_TIERS,missionOffers,missionOdds,missionReward,missionList,acceptMission,claimMission,abandonMission} from './missions.js';
import {scoreProgress,starMarks,floorScoreLimit,STAR_MARKS,SCORE_BEATS,scoreBeats,STAR_UPGRADES,starCost,buyStarUpgrade,scoreMultiplier} from './stars.js';
import {TOTAL_FLOORS,FLOORS_PER_BIOME} from './campaign.js';
import {creatureFor} from './creatures.js';
import {canRebuild,campNeeded,enterCamp,leaveCamp,buyCamp,CAMP_OFFERS,resumeRecovery,tonicHealing,salvageRetention,floorRewards,RANKED_SKILLS,skillRank,skillText,skillUpgradeCost,upgradeSkill,movement,furyThreshold,ROCKS,chooseCard,ENEMIES,ITEMS,enemyBeat,BIOMES,CRYSTALS,SKILLS,SEALS,createState,restoreState,startRun,finishRun,act,tick,descend,biomeIndex,depthLimit,maxRhythm,maxHealth,windowMs,actionWindowMs,power,crystalValue,upgradeCost,coreCost,purchaseUpgrade,purchaseCore,purchaseSeal,canLearn,learn,equip,distance} from './core.js';
import {World,project,unproject,HOTSPOTS} from './world.js';
import {comboTier,comboTitle} from './effects.js';
import {trackForFloor,beatDuration,beatTime,beatPhase,musicCue,savedMusicElapsed,trackIndexForFloor} from './score.js';
import {glyph} from './ui-art.js';
import {CARDS,cardCount,activeCards,cardDetail} from './cards.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {ReturnScreen} from './return-screen.js';
import {Music} from './audio.js';
import {RECORDS,currentRecord,buyRecord,equipRecord} from './records.js';
import {recordsMarkup} from './records-view.js';
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=glyph(el.dataset.icon));
const $=id=>document.getElementById(id),KEY='gemventure-save-v2';
let s;try{s=restoreState(localStorage.getItem(KEY))||restoreState(localStorage.getItem('gemventure-save-v1'));}catch{}s=s||createState();settleZag(s,Date.now(),true);const minerWelcome=settleMiner(s,Date.now());
const world=new World($('world')),music=new Music();music.setRecord(s.records.active);let elapsed=savedMusicElapsed(s.run),lastFrame=performance.now(),paused=!!s.run&&!s.run.room.cleared,hidden=document.hidden,selected=null,hover=null,dialogKind='',skillSelected='ear',toastTimer,baseTimer,feedbackTimer=0;world.place(s);
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled&&b.id!=='sound'&&!b.matches('[data-mission],[data-claim-mission],.item-button,#confirmCard,#descend'))music.sfx('ui');});
let liftFloor,departureFloor=1,liftMode='floors';let forgeSelected='pickaxe',forgeBusy=false,gearPieceSelected='pickaxe',gearIndexSelected=0,gearKindSelected=1,gearClearConfirm=false;
let burstAnimation,pendingBurst=null,hitHistory=[],cardRenderKey='',offerRenderKey='',pendingCard=null,choiceScreen='';
const zagGame=new ZagGame({state:s,music,onSave:save,onUpdate:update,open:body=>openDialog('ZAG · TRILHA DA FORTUNA',body,'zag'),close:closeDialog,soft:()=>world.reduced});
const minerGame=new MinerGame({state:s,music,onSave:save,onUpdate:update,open:body=>openDialog('BROCA AFK',body,'miner'),soft:()=>world.reduced,onSound:()=>$('sound').onclick(),welcome:minerWelcome});
const floorGuard=new ChoiceGuard(),returnGuard=new ChoiceGuard(),abyssGuard=new ChoiceGuard();
let abyssChoiceKey='',abyssChoiceSaved=0;
function trackChoiceInput(kind,id){const now=performance.now();floorGuard[kind](id,now);returnGuard[kind](id,now);abyssGuard[kind](id,now);}
document.addEventListener('pointerdown',e=>trackChoiceInput('press','p'+e.pointerId),true);
document.addEventListener('pointerup',e=>trackChoiceInput('release','p'+e.pointerId),true);
document.addEventListener('pointercancel',e=>trackChoiceInput('release','p'+e.pointerId),true);
document.addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code)){trackChoiceInput('press',e.code);if((s.run?.room.cleared&&!floorGuard.ready(performance.now()))||(dialogKind==='safe-return'&&!returnGuard.ready(performance.now()))){e.preventDefault();e.stopImmediatePropagation();}}},true);
document.addEventListener('keyup',e=>trackChoiceInput('release',e.code),true);
window.addEventListener('blur',()=>{floorGuard.held.clear();returnGuard.held.clear();abyssGuard.held.clear();if(s.run?.abyss?.cardChoice){paused=true;music.silence();update();save();}});
function guardChoices(){
 const ready=floorGuard.ready(performance.now()),clear=!!s.run?.room.cleared;
 if(clear){$('choiceGuard').textContent=ready?'': 'SOLTE OS CONTROLES…';$('cardOffers').querySelectorAll('button').forEach(b=>b.disabled=!ready);$('confirmCard').disabled=!ready||!pendingCard;$('descend').disabled=!ready||!s.run.cardChosen;$('floorRescue').disabled=!ready||!s.run.cardChosen;$('safeReturn').disabled=!ready||!s.run.cardChosen;}
 if($('confirmSafeReturn'))$('confirmSafeReturn').disabled=!returnGuard.ready(performance.now());
}

const returns=new ReturnScreen({music,soft:()=>world.reduced,onSave:save,onFinish:()=>{music.silence();update();save();if(missionList(s).some(m=>m.status==='ready')){showMissions();music.sfx('mission');}}});
const phaseAt=(seconds=elapsed)=>beatPhase(musicFloor(s.run),seconds);
const beatLength=()=>beatDuration(musicFloor(s.run),phaseAt());
function updateMusicCue(){
 if(!s.run||s.run.rest?.active){$('musicCue').hidden=true;return;}
 const r=s.run,phase=phaseAt(),cue=musicCue(musicFloor(r),phase),show=!!r&&!r.room.cleared&&(cue.warning||cue.changing);
 $('musicCue').hidden=!show;
 if(show){$('musicCue').dataset.direction=cue.direction>0?'up':'down';$('musicCueLabel').textContent=cue.label;$('musicCueCount').textContent=cue.warning?cue.count:'♫';$('musicCue').dataset.pulse=phase%1<.18?'on':'off';}
 const label=Math.round(cue.bpm)+' BPM';
 if($('bpmLabel').textContent!==label){$('bpmLabel').textContent=label;$('trackTempo').textContent=label;}
 if(r){const width=actionWindowMs(s,Math.round(phase))/1000/beatLength()*50;$('perfectZone').style.height=width+'%';$('perfectZone').style.top=(75-width/2)+'%';}
}
try{const mode=localStorage.getItem('gemventure-fx');if(mode)world.setSoft(mode==='soft');}catch{}
function effectsMode(){document.body.classList.toggle('soft-fx',world.reduced);$('effects').setAttribute('aria-pressed',String(!world.reduced));$('effects').title=world.reduced?'Efeitos suaves':'Efeitos intensos';$('effects').setAttribute('aria-label',world.reduced?'Ativar efeitos intensos':'Ativar efeitos suaves');}
effectsMode();$('effects').onclick=()=>{world.setSoft(!world.reduced);effectsMode();try{localStorage.setItem('gemventure-fx',world.reduced?'soft':'intense');}catch{}toast(world.reduced?'Efeitos suaves ativados.':'Efeitos intensos ativados.');};
function celebrate(combo,nova=false){$('burstCaption').textContent=nova?'RUPTURA!':combo===50?currentRecord(s).genre+' ACESO!':comboTitle(combo);$('burstNumber').innerHTML=combo+'<span>×</span>';$('burstDetail').textContent=nova?'ONDA DE RUPTURA':'COMBO!';$('comboBurst').dataset.tier=comboTier(combo);burstAnimation?.cancel();burstAnimation=$('comboBurst').animate(world.reduced?[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.8},{opacity:0}]:[{opacity:0,transform:'translateX(20px) scale(.35) rotate(-12deg)'},{opacity:1,transform:'translateX(0) scale(1.28) rotate(-6deg)',offset:.08},{opacity:1,transform:'scale(1) rotate(-4deg)',offset:.28},{opacity:1,transform:'scale(1.2) rotate(3deg)',offset:.45},{opacity:1,transform:'scale(1) rotate(-4deg)',offset:.65},{opacity:0,transform:'translateX(12px) scale(.9) rotate(-4deg)'}],{duration:beatLength()*2800,easing:'ease-out'});music.milestone(combo);}

const blocked=()=>paused||hidden||$('dialog').open||returns.active||!!s.run?.recovery?.active||!!s.run?.rest?.active||!!s.run?.abyss?.cardChoice;
const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
function save(){settleMiner(s,Date.now());if(s.run){s.run.elapsed=elapsed;s.run.clockBpm=trackForFloor(musicFloor(s.run)).bpm;s.run.musicClock=2;}try{localStorage.setItem(KEY,JSON.stringify(s));$('saved').textContent='SALVO LOCALMENTE';}catch{$('saved').textContent='SALVAMENTO INDISPONÍVEL';}}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function feedback(t){$('message').textContent=t;feedbackTimer=elapsed+1.2;}
function update(){updatePickaxeCursor(s.level);const r=s.run;const track=trackForFloor(musicFloor(r));$('trackName').textContent=track.name;$('trackStyle').textContent=track.style;$('trackTempo').textContent=track.bpm+' BPM';$('bpmLabel').textContent=track.bpm+' BPM';$('stage').dataset.mode=r?'run':'base';$('stage').dataset.tier=comboTier(r?.combo||0);const balances=returns.balances(s);$('bank').textContent=fmt(balances.bank);$('essence').textContent=fmt(balances.essence);$('stars').textContent=fmt(s.stars);$('experienceHud').innerHTML=experienceMarkup(s);$('materialWallet').innerHTML=MATERIALS.map((m,i)=>'<div style="--mineral:'+m.color+'" title="'+m.use+'">'+gemIcon(i)+'<b id="material-'+i+'">'+fmt(balances.materials?.[i]??s.materials[i])+'</b><span>'+m.name+'</span></div>').join('');updateScoreHUD();updateMissionHUD();updateBossHUD();$('record').textContent=s.best?`${s.best*25} m`:'—';$('sceneTitle').textContent=r?(r.room.bossFloor?BOSSES[biomeIndex(r.floor)].title:BIOMES[biomeIndex(r.floor)].name):'REFÚGIO';$('sceneEyebrow').textContent=r?`EXPEDIÇÃO ${String(s.attempts).padStart(2,'0')} · ${track.style}`:'VILA';$('locationLabel').textContent=r?'CAVERNA VIVA · '+(r.room.cleared?'ESTABILIZADA':'EM EXPLORAÇÃO'):'REFÚGIO';$('floorLabel').textContent=r?`ANDAR ${String(r.floor).padStart(2,'0')}`:'SUPERFÍCIE';for(const id of ['explorationHud','breathHud','runHud','objective','runControls','runHints','extract','itemBar','runCards'])$(id).hidden=!r;$('controlDeck').hidden=!r;$('villageActions').hidden=!!r;$('world').tabIndex=r?0:-1;$('world').setAttribute('aria-label',r?'Caverna. Clique para minerar. Espaço golpeia, WASD esquiva, Tab abre habilidades.':'Vila do Refúgio. Escolha uma construção.');if(!r)updateVillage();updateDepthLift();const wasClear=$('clearBanner').hidden;$('clearBanner').hidden=!r?.room.cleared;$('pauseCover').hidden=!r||!paused;
 $('slots').textContent=`${s.equipped.length} / 5`;$('equippedSlots').innerHTML=Array.from({length:5},(_,i)=>{const skill=SKILLS.find(k=>k.id===s.equipped[i]);return`<button class="skill-slot ${skill?'':'empty'}" aria-label="${skill?skill.name:'Espaço de habilidade vazio'}" title="${skill?skill.name+': '+skillText(s,skill.id):'Escolha uma habilidade na árvore'}">${glyph(skill?.id||'empty')}<span>${skill?skill.name:'LIVRE'}</span><small>${skill?'AUTO':'TAB'}</small></button>`;}).join('');$('equippedSlots').querySelectorAll('button').forEach(b=>b.onclick=()=>showTree());$('footerState').textContent=r?`FORÇA ${power(s)} · MOVIMENTO ${movement(s)} · TAB HABILIDADES`:`EXPEDIÇÕES ${s.attempts} · MELHOR SEQUÊNCIA ${s.bestCombo} · ${s.unlocked.length}/${SKILLS.length} HABILIDADES`;
 updateCardUI();updateAbyssChoice();if(wasClear&&!$('clearBanner').hidden)queueMicrotask(()=>$('clearBanner').focus({preventScroll:true}));
 if(r){$('explorationHud').hidden=!r.room.wave;if(r.room.wave){$('explorationHud').textContent=environment(r.floor).name+' · '+(r.beat>=256?'HORDA ENFURECIDA':'ONDA '+r.room.wave.number)+(terrainAt(r.room,r.player)===1?' · ÁGUA · PASSO LENTO':'');}updateItems();$('hpLabel').textContent=`${Math.ceil(r.health)} / ${maxHealth(s)}`;$('breathLabel').textContent=`${Math.ceil(r.rhythm)} / ${maxRhythm(s)}`;$('breathBar').style.width=`${r.rhythm/maxRhythm(s)*100}%`;$('breathHud').dataset.low=r.rhythm<=30;$('breathMeter').setAttribute('aria-valuenow',Math.ceil(r.rhythm));$('breathHint').textContent=r.rhythm<=30?'SEM FÔLEGO! ACERTE O PULSO':'ACERTE O PULSO';$('combo').innerHTML=`${r.combo}<span>×</span>`;$('comboHint').textContent=comboTitle(r.combo);$('railMultiplier').textContent='×'+scoreMultiplier(r.combo).toFixed(2);const nova=s.equipped.includes('fury'),threshold=furyThreshold(s),charge=Math.max(0,Math.min(threshold,r.combo-(r.novaSpent||0)*threshold));$('novaMeter').hidden=!nova;$('novaHint').hidden=!nova;$('novaFill').style.width=(charge/threshold*100)+'%';$('novaHint').textContent=charge>=threshold?'RUPTURA PRONTA · GOLPEIE':'RUPTURA · '+charge+'/'+threshold;$('charge').textContent=`${Math.min(r.room.charge,r.room.quota)} / ${r.room.quota}`;$('chargeBar').style.width=`${Math.min(100,r.room.charge/r.room.quota*100)}%`;$('goal').textContent=r.room.charge>=r.room.quota&&Math.max(r.acted,r.beat)<(r.room.minBeats||0)?'ESTABILIZANDO '+Math.round(Math.max(0,r.acted,r.beat)/r.room.minBeats*100)+'%':`${Math.min(r.combo,r.room.goal)} / ${r.room.goal}`;$('bagLabel').textContent=`MOCHILA · ${r.bag} MOEDAS · ${r.materials.reduce((a,b)=>a+b,0)} CRISTAIS`;const canDescend=r.floor<depthLimit(s)&&r.floor<TOTAL_FLOORS;$('descend').hidden=!canDescend;$('clearTitle').textContent=!r.cardChosen?'ESCOLHA UMA CARTA':r.floor===TOTAL_FLOORS?'BIOMA CONQUISTADO!':canDescend?'CONTINUAR OU VOLTAR?':'NOVO BIOMA!';$('clearSubtitle').textContent=!r.cardChosen?`VIDA ${Math.ceil(r.health)} / ${maxHealth(s)}`:r.floor===TOTAL_FLOORS?'Volte à base com tudo o que conquistou.':canDescend?`VIDA MANTIDA · ${Math.ceil(r.health)} / ${maxHealth(s)}`:`Volte à base e construa o ${SEALS[s.seals]?.name.toLowerCase()}.`;const width=windowMs(s)/1000/beatLength()*50;$('perfectZone').style.height=width+'%';$('perfectZone').style.top=(75-width/2)+'%';}updateTip();updateFrenzyHUD();const disc=currentRecord(s);$('trackName').textContent=disc.name;$('trackStyle').textContent=disc.genre;$('stage').classList.toggle('disco-on',!!r&&r.combo>=50&&!r.room.cleared);$('stage').style.setProperty('--record-accent',disc.color);}
function updateItems(){for(const item of ITEMS){const b=$('item-'+item.id),count=s.run?.items?.[item.id]||0,desc=item.id==='tonic'?'Recupera '+tonicHealing(s)+' de vida.':item.desc;b.querySelector('b').textContent=count;b.disabled=!count||!!s.run?.room.cleared;b.title=item.name+' · '+desc+' · '+item.source;b.setAttribute('aria-label',item.name+', '+count+' disponíveis. '+desc);}}
$('itemBar').innerHTML=ITEMS.map(i=>`<button class="item-button" id="item-${i.id}" style="color:${i.color}"><kbd>${i.key}</kbd>${glyph(i.id)}<span>${{blast:'BOMBA',tonic:'CURAR',ward:'ESCUDO'}[i.id]}</span><b>0</b></button>`).join('');for(const item of ITEMS)$('item-'+item.id).onclick=()=>{perform({type:'item',item:item.id});$('world').focus({preventScroll:true});};
function updateTip(){const r=s.run,n=r?[...r.room.nodes,...r.room.enemies,...r.room.rocks].find(n=>n.id===(hover??selected)&&n.hp>0&&visible(r.room,n)):null;$('targetTip').hidden=!n||!!r?.room.cleared;if(n){const rock=n.type==='rock',crystal=n.type==='crystal',d=n.boss?BOSSES[n.bossIndex]:rock?ROCKS[n.kind]:crystal?CRYSTALS[n.kind]:creatureFor(r.floor,n.kind);$('targetTip').innerHTML=`<strong style="color:${d.color||'#c5cddb'}">${n.rabbitChild!==undefined?'FILHOTE':n.summon!==undefined?'NÚCLEO MICELIAL':n.rare?'VEIO RARO':d.name}</strong><span>${n.rabbitChild!==undefined?n.stunned?'TONTO ✦':'ACERTE A CABEÇA':`<b>${Math.ceil(n.hp)}/${Math.ceil(n.maxHp)}</b> · ${n.bossIndex===6&&r.beat>n.exposedUntil?'ACERTE OS 3 FILHOTES':n.bossIndex===4?'INTANGÍVEL · QUEBRE OS NÚCLEOS':n.bossIndex===5&&n.windup?'SUBMERSO · DESVIE':n.summon!==undefined?'QUEBRE PARA FERIR O CHEFE':rock?'QUEBRE PARA PASSAR':crystal?(n.rare?'BATA E COLETE':'+'+crystalValue(s,n)+' CRISTAIS'):n.windup?'⚠ DESVIE!':'⚒ ATAQUE'}`}</span>`;}}

function chooseNext(){const r=s.run;if(!r)return;const options=[...r.room.nodes,...r.room.enemies].filter(n=>n.hp>0&&n.bossIndex!==4&&!(n.bossIndex===5&&n.windup)&&!(n.bossIndex===6&&r.beat>n.exposedUntil)&&!(n.rabbitChild!==undefined&&n.stunned)&&visible(s.run.room,n)).sort((a,b)=>distance(a,r.player)-distance(b,r.player));selected=options[0]?.id??null;}
function processEvents(){const r=s.run;if(!r)return;const events=r.events.splice(0);processFrenzyEvents(events);world.consume(events);music.events(events);if(events.some(e=>e.type==='nova'||e.type==='bossDefeated'))music.boom(true);else if(events.some(e=>['wave','bomb'].includes(e.type)))music.boom(false);for(const e of events){if(e.type==='waveWarning'){feedback('HORDA CHEGANDO!');toast('PREPARE-SE · ONDA '+e.number);}if(e.type==='horde'){feedback('ONDA '+e.number+' · '+e.count+' CRIATURAS!');music.boom(false);}if(e.type==='levelUp'){music.reward();toast('NÍVEL '+e.level+' · +1 PONTO!');}if(e.type==='bossWarning')feedback(e.hint);if(e.type==='bossOpen')feedback('ATAQUE AGORA!');if(e.type==='bossDefeated'){music.boom(true);toast('CHEFE DERROTADO!');}if(e.type==='missionReady'){toast('MISSÃO PRONTA · RECEBA NA VILA');}if(e.type==='missionExpired')toast('MISSÃO EXPIRADA');if(e.type==='recordDrop'){music.sfx('recordDrop');toast('DISCO RARO · '+e.name);feedback('♫ DISCO NOVO!');}if(e.type==='star')celebrateStar(e.number);if(e.type==='proc'){showProc(e);}if(e.type==='perfect'){hitHistory.push(true);hitHistory=hitHistory.slice(-8);drawHitHistory();}if(e.type==='hurt'){hitHistory.push(false);hitHistory=hitHistory.slice(-8);drawHitHistory();}if(e.type==='perfect'){$('timing').textContent=`NO PULSO · sequência ${e.combo}`;if(!r.room.bossFloor)feedback('PERFEITO!');music.hit(true);if(!world.reduced)$('combo').animate([{transform:'scale(1.22)',filter:'brightness(1.7)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:240});if(e.combo%5===0)pendingBurst={combo:e.combo,at:beatTime(musicFloor(r),r.acted)};}if(e.type==='hurt'){if(e.reason!=='attack')flashBreath();feedback(e.reason==='idle'?'MOVA OU GOLPEIE!':e.reason==='attack'?`ATINGIDO · −${e.amount}`:`FÔLEGO −${e.amount}`);$('timing').textContent=e.reason==='silence'?'VOLTE AO PULSO':'TENTE NO PULSO';}if(e.type==='clear'){music.reward();feedback('ELEVADOR PRONTO!');}if(e.type==='nova'){pendingBurst={combo:r.combo,nova:true,at:beatTime(musicFloor(r),r.acted)};feedback('RUPTURA!');}if(e.type==='item'){const item=ITEMS.find(i=>i.id===e.item);feedback('+'+e.amount+' '+item.name.toUpperCase());if(!world.reduced)$('item-'+e.item).animate([{transform:'scale(1.3)',filter:'brightness(2)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:300});}if(e.type==='revive')toast('NOVA CHANCE!');if(e.type==='recovery'){music.silence();showRest();}}}
function protectRhythm(gap){if(gap<=.5||!s.run||blocked()||s.run.room.cleared)return false;paused=true;music.silence();$('pauseTitle').textContent='VAMOS CONTINUAR?';$('pauseText').textContent='COMBO PRESERVADO';update();save();return true;}
function perform(action){if(protectRhythm((performance.now()-lastFrame)/1000))return;if(!s.run||blocked()||s.run.room.cleared)return;const result=act(s,action,phaseAt(elapsed+(performance.now()-lastFrame)/1000));if(result.intangible)feedback(result.buried?'SUBMERSO · DESVIE!':'QUEBRE OS NÚCLEOS!');if(!s.run){onReturn();return;}processEvents();if(![...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks].some(n=>n.id===selected&&n.hp>0&&visible(s.run.room,n)))chooseNext();update();save();}
function begin(mode='floors',floor=1){hitHistory=[];drawHitHistory();cardRenderKey='';offerRenderKey='';pendingBurst=null;burstAnimation?.cancel();closeDialog();if(!startRun(s,mode,floor))return;elapsed=0;paused=false;selected=null;chooseNext();world.place(s);music.silence();feedback('PREPARE-SE!');music.sfx('descend');update();save();$('world').focus({preventScroll:true});$('scoreHud').scrollIntoView({block:'start',behavior:'instant'});}
function onReturn(){document.querySelectorAll('.star-flight').forEach(n=>n.remove());pendingBurst=null;burstAnimation?.cancel();paused=false;elapsed=0;selected=null;hover=null;feedback('');music.silence();world.place(s);showResult();update();save();music.sfx(s.lastResult?.reason==='death'?'death':'claim');}
function returnSafe(){
 if(!s.run?.room.cleared||!s.run.cardChosen||!floorGuard.ready(performance.now()))return;
 returnGuard.lock(performance.now(),750);
 openDialog('VOLTAR À BASE',`<h2>VOLTAR PRA CASA?</h2><p>SALVAR <b>${fmt(s.run.bag)} MOEDAS</b> E ENCERRAR?</p><div class="return-confirm"><button class="primary" id="stayInMine">FICAR NA MINA</button><button class="secondary" id="confirmSafeReturn" disabled>SIM, VOLTAR À BASE</button></div>`,'safe-return');
 $('stayInMine').onclick=closeDialog;
 $('confirmSafeReturn').onclick=()=>{if(!returnGuard.ready(performance.now())||!s.run?.room.cleared)return;finishRun(s,s.run.floor===TOTAL_FLOORS?'victory':'return');closeDialog();onReturn();};
 $('stayInMine').focus();
}
function nextFloor(){if(!floorGuard.ready(performance.now()))return;if(campNeeded(s)&&enterCamp(s)){save();showRest();return;}if(descend(s)){hitHistory=[];drawHitHistory();offerRenderKey='';burstAnimation?.cancel();pendingBurst=null;elapsed=0;selected=null;chooseNext();music.silence();world.place(s);processEvents();music.sfx('descend');feedback(s.run.room.bossFloor?BOSSES[biomeIndex(s.run.floor)].name:`ANDAR ${s.run.floor}!`);update();save();$('world').focus({preventScroll:true});$('scoreHud').scrollIntoView({block:'start',behavior:'instant'});}}
function extract(){if(!s.run)return;if(s.run.room.cleared)returnSafe();else{openDialog('RETIRADA DE EMERGÊNCIA',`<h2>EXTRAÇÃO DE EMERGÊNCIA</h2><p>ENCERRAR A DESCIDA?</p><p><b>${Math.floor(s.run.bag*salvageRetention(s))} MOEDAS SALVAS · ${Math.round(salvageRetention(s)*100)}% DO SAQUE</b></p><div class="shop-items"><button class="primary" id="confirmRetreat">RESGATAR E VOLTAR</button><button class="secondary" id="keepGoing">CONTINUAR</button></div>`,'retreat');$('confirmRetreat').onclick=()=>{finishRun(s,'retreat');closeDialog();onReturn();};$('keepGoing').onclick=closeDialog;}}
function openDialog(label,body,kind=''){
 const dialog=$('dialog'),keepUpgrade=dialog.open&&kind===dialogKind&&!!dialog.querySelector('.building-upgrade[open]');
 if(!dialog.open||kind!==dialogKind||!['zag','records'].includes(kind))music.silence();
 dialogKind=kind;$('dialogLabel').textContent=label;
 for(const [type,className]of Object.entries({zag:'zag-dialog',missions:'missions-dialog',tree:'tree-dialog',forge:'forge-dialog',lift:'map-dialog',well:'wish-dialog',stars:'relic-dialog',records:'records-dialog',miner:'miner-dialog'}))dialog.classList.toggle(className,kind===type);
 $('dialogBody').innerHTML=body;applyDialogUI(dialog,kind);
 if(keepUpgrade){const upgrade=dialog.querySelector('.building-upgrade');if(upgrade)upgrade.open=true;}
 if(!dialog.open)dialog.showModal();
}
function closeDialog(){if(dialogKind==='miner')minerGame.leave();if(dialogKind==='zag')zagGame.leave();if(dialogKind==='records')stopRecordPreview();if($('dialog').open)$('dialog').close();}
$('close').onclick=closeDialog;$('dialog').addEventListener('cancel',e=>{if(dialogKind==='zag'){e.preventDefault();closeDialog();}});$('dialog').addEventListener('close',()=>{if(dialogKind==='miner')minerGame.leave();if(dialogKind==='zag')zagGame.leave();if(dialogKind==='records')stopRecordPreview();dialogKind='';lastFrame=performance.now();$('world').focus({preventScroll:true});});
function showResult(){if(s.lastResult&&!s.lastResult.presented)returns.show(s);}
const talentView=new TalentView();
function showTree(id=skillSelected){
 if(returns.active)return;skillSelected=id;
 openDialog(s.run&&!canRebuild(s)?'SUA BUILD · PAUSADO':'CONSTELAÇÃO DE TALENTOS',talentView.markup(s,id),'tree');
 talentView.bind($('dialogBody'),s,selected=>{save();update();music.reward();showTree(selected);});
}
function bindBuilding(refresh){$('dialogBody').querySelectorAll('[data-building]').forEach(b=>{b.disabled=b.disabled||forgeBusy;b.onclick=()=>{if(!forgeBusy&&upgradeBuilding(s,b.dataset.building)){save();update();music.sfx('claim');refresh();toast('CONSTRUÇÃO MELHORADA!');}};});}
function showForge(id=forgeSelected){
 if(s.run||returns.active)return;
 forgeSelected=typeof id==='string'&&(id==='pickaxe'||id==='vigor'||FORGE_PROJECTS.some(p=>p.id===id))?id:'pickaxe';
 if(s.forge.gear.pending){gearPieceSelected=s.forge.gear.pending.piece;gearIndexSelected=s.forge.gear.pending.index;gearKindSelected=s.forge.gear.pending.kind;}
 openDialog('FORJA DO REFÚGIO',forgeMarkup(s,forgeSelected,forgeSelected==='vigor'?coreCost(s):upgradeCost(s),forgeSelected==='vigor'?maxHealth(s):power(s),forgeBusy,gearPieceSelected,gearIndexSelected,gearKindSelected,gearClearConfirm),'forge');
 $('dialogBody').querySelectorAll('[data-forge]').forEach(b=>b.onclick=()=>{if(!forgeBusy){gearClearConfirm=false;showForge(b.dataset.forge);}});
 if($('forgeAction'))$('forgeAction').onclick=workForge;bindBuilding(()=>showForge(forgeSelected));
 $('dialogBody').querySelectorAll('[data-gear-piece]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearPieceSelected=b.dataset.gearPiece;gearIndexSelected=0;gearKindSelected=GEAR_ITEMS.find(x=>x.id===gearPieceSelected).colors[0];gearClearConfirm=false;showForge('armor');});
 $('dialogBody').querySelectorAll('[data-gear-slot]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearIndexSelected=Number(b.dataset.gearSlot);gearClearConfirm=false;showForge('armor');});
 $('dialogBody').querySelectorAll('[data-gear-kind]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearKindSelected=Number(b.dataset.gearKind);gearClearConfirm=false;showForge('armor');});
 if($('gearRoll'))$('gearRoll').onclick=()=>{if(!rollGear(s,gearPieceSelected,gearIndexSelected,gearKindSelected))return;gearClearConfirm=false;save();update();music.sfx('claim');showForge('armor');};
 $('dialogBody').querySelectorAll('[data-gear-offer]').forEach(b=>b.onclick=()=>{const option=Number(b.dataset.gearOffer),rare=s.forge.gear.pending?.options[option]?.rank>1;if(chooseGearTrait(s,option)){save();update();showForge('armor');if(rare){music.reward();toast('ATRIBUTO RARO!');}else music.sfx('claim');}});
 if($('gearKeep'))$('gearKeep').onclick=()=>{if(discardGearRoll(s)){save();update();showForge('armor');}};
 if($('gearUpgrade'))$('gearUpgrade').onclick=()=>{const result=upgradeGearTrait(s,gearPieceSelected,gearIndexSelected);if(!result)return;save();update();showForge('armor');if(result.success){music.reward();toast(result.critical?'APRIMORAMENTO CRÍTICO!':'ATRIBUTO APRIMORADO!');}else{music.sfx('ui');toast('SEM AUMENTO');}};
 if($('gearClear'))$('gearClear').onclick=()=>{if(!gearClearConfirm){gearClearConfirm=true;showForge('armor');return;}if(clearGearTrait(s,gearPieceSelected,gearIndexSelected)){gearClearConfirm=false;save();update();music.sfx('ui');showForge('armor');}};
}
async function workForge(){
 if(forgeBusy||s.run||dialogKind!=='forge')return;
 const id=forgeSelected,p=['pickaxe','vigor'].includes(id)?null:forgeProject(s,id),build=['pickaxe','vigor'].includes(id)||p?.ready;
 let done,paid=0;
 if(id==='pickaxe')done=purchaseUpgrade(s);else if(id==='vigor')done=purchaseCore(s);
 else if(p?.ready)done=craftForge(s,id);
 else if(p){paid=depositForge(s,id,forgeDepositAmount(s,p));done=paid>0;}
 if(!done)return;
 // Save the paid resources or completed benefit before playing any animation.
 forgeBusy=true;save();update();showForge(id);
 const scene=$('forgeScene'),reduced=world.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.classList.add(build?'forge-crafting':'forge-feeding');
 if(build)music.forge(performance.now()/1000);else music.loot(1);
 await new Promise(resolve=>setTimeout(resolve,reduced?180:build?950:1100));
 forgeBusy=false;
 if(dialogKind==='forge'&&scene.isConnected){showForge(id);if(build){const result=$('forgeCelebration');result.classList.add('show');result.innerHTML=glyph(p?.icon||'force')+'<strong>FORJADO!</strong><span>'+(p?p.reward(p.level+1):id==='vigor'?'VIDA MÁXIMA · '+maxHealth(s):'PICARETA · NÍVEL '+s.level)+'</span>';setTimeout(()=>result.classList.remove('show'),2200);}}
 if(build){music.reward();toast(p?p.name.toUpperCase()+' · NÍVEL '+(p.level+1):id==='vigor'?'VIDA MÁXIMA · '+maxHealth(s):'PICARETA · NÍVEL '+s.level);}
}
let wellSelected=3;
function showWell(reveal=false){if(s.run||returns.active)return;openDialog('POÇO DOS DESEJOS',wellMarkup(s,reveal,wellSelected),'well');bindBuilding(()=>showWell());$('dialogBody').querySelectorAll('[data-wish-kind]').forEach(b=>b.onclick=()=>{wellSelected=Number(b.dataset.wishKind);music.sfx('ui');showWell();});$('dialogBody').querySelectorAll('[data-offering]').forEach(button=>button.onclick=()=>{const blessing=makeOffering(s,Number(button.dataset.offering));if(blessing){save();update();music.sfx('heal');showWell(true);toast(blessing.name+'!');}});if($('wellDone'))$('wellDone').onclick=closeDialog;}
let recordFilter='TODOS',recordPreviewId=null,recordPreviewTimer=null;
function stopRecordPreview(){if(recordPreviewTimer!==null)clearTimeout(recordPreviewTimer);recordPreviewTimer=null;recordPreviewId=null;music.stopPreview();}
function showRecords(filter=recordFilter){
 if(s.run||returns.active)return;if(filter!==recordFilter)stopRecordPreview();recordFilter=filter;
 openDialog('VITROLA',recordsMarkup(s,filter,recordPreviewId),'records');
 $('dialogBody').querySelectorAll('[data-record-filter]').forEach(b=>b.onclick=()=>showRecords(b.dataset.recordFilter));
 $('dialogBody').querySelectorAll('[data-record-preview]').forEach(b=>b.onclick=async()=>{
  const id=b.dataset.recordPreview;
  if(recordPreviewId===id){stopRecordPreview();showRecords();return;}
  stopRecordPreview();
  if(!music.enabled){if(!await music.enable()){toast('ÁUDIO INDISPONÍVEL');return;}$('sound').innerHTML='♫ <span>Som ligado</span>';$('sound').setAttribute('aria-label','Desativar música');}
  if(dialogKind!=='records'||!music.previewRecord(id))return;
  recordPreviewId=id;showRecords();
  recordPreviewTimer=setTimeout(()=>{stopRecordPreview();if(dialogKind==='records')showRecords();},5000);
 });
 $('dialogBody').querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.record,owned=s.records.owned.includes(id);
  if(owned?equipRecord(s,id):buyRecord(s,id)){
   stopRecordPreview();music.setRecord(id);save();update();showRecords();music.sfx(owned?'recordEquip':'recordBuy');
   toast((owned?'TOCANDO · ':'DISCO NOVO · ')+RECORDS.find(r=>r.id===id).name);
  }
 });
}
function showLift(mode=liftMode){
 if(s.run||returns.active)return;if(!canStartAt(s,departureFloor))departureFloor=1;
 const sameMode=mode===liftMode;liftMode=mode;
 const openPanels=dialogKind==='lift'&&sameMode?[...$('dialogBody').querySelectorAll('details[id][open]')].map(d=>d.id):[],scrollTop=dialogKind==='lift'&&sameMode?($('dialogBody').querySelector('.lift-pane')?.scrollTop||0):0;
 openDialog('ELEVADOR',liftScreenMarkup(s,departureFloor,liftMode),'lift');
 for(const id of openPanels)if($(id))$(id).open=true;$('dialogBody').querySelector('.lift-pane').scrollTop=scrollTop;
 if($('buySeal'))$('buySeal').onclick=()=>{if(purchaseSeal(s)){save();update();showLift();music.sfx('claim');toast('NOVO BIOMA ABERTO!');}};
 $('dialogBody').querySelectorAll('[data-lift-mode]').forEach(b=>b.onclick=()=>showLift(b.dataset.liftMode));
 if($('departureFloor'))$('departureFloor').onchange=e=>{departureFloor=Number(e.target.value);showLift();$('departureFloor').focus({preventScroll:true});};
 if($('liftStart'))$('liftStart').onclick=()=>begin('floors',departureFloor);
 if($('abyssStart'))$('abyssStart').onclick=()=>{if(canEnterAbyss(s))begin('abyss');};
 $('dialogBody').querySelectorAll('[data-gate]').forEach(b=>b.onclick=()=>{const open=canEnterAbyss(s),paid=depositGate(s,Number(b.dataset.gate));if(paid){save();update();showLift();music.sfx(canEnterAbyss(s)&&!open?'claim':'crystal');$('dialogBody').querySelector('.gate-art').animate(world.reduced?[{opacity:.6},{opacity:1}]:[{filter:'brightness(2)',transform:'scale(1.06)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:450});if(canEnterAbyss(s)&&!open)toast('ABISMO LIBERADO!');}});
 $('dialogBody').querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>{const floor=Number(b.dataset.stop);if(unlockStop(s,floor)){departureFloor=floor;save();update();showLift();music.sfx('claim');toast('PARADA '+floorAddress(floor).code+' ATIVADA!');}});
 $('dialogBody').querySelectorAll('[data-depart]').forEach(b=>b.onclick=()=>begin('floors',Number(b.dataset.depart)));
}
function showHelp(){openDialog('COMO JOGAR',`<h2>SIGA O PULSO</h2><div class="help-grid"><div><strong>RITMO</strong><p>Clique ou ESPAÇO na batida.<br>Erro tira FÔLEGO.</p></div><div><strong>MOVIMENTO</strong><p>WASD ou clique no chão.<br>Ataques tiram VIDA.</p></div><div><strong>ITENS</strong><p>1 BOMBA · 2 CURA · 3 ESCUDO</p></div></div><p><kbd>P</kbd> pausa · <kbd>E</kbd> resgate · <kbd>TAB</kbd> habilidades · <kbd>Q</kbd> alvo</p><details class="mission-rules"><summary>PROGRESSÃO</summary><p>Vida ou fôlego zerou: fim da descida. Cartas duram só a tentativa.</p><p>Elevador pronto guarda todo o saque. Resgate e morte guardam apenas parte.</p><p>Forja: força. Árvore: builds. Poço: sorte. Estrelas: relíquias.</p></details><button class="primary" id="helpDone">JOGAR</button>`,'help');$('helpDone').onclick=closeDialog;}

function pause(){if(!s.run)return;paused=!paused;music.silence();$('pauseTitle').textContent='PAUSA';$('pauseText').textContent='';update();}
$('descend').onclick=nextFloor;$('safeReturn').onclick=returnSafe;$('extract').onclick=extract;$('inspectSkills').onclick=()=>showTree();$('help').onclick=showHelp;$('pause').onclick=pause;$('resume').onclick=()=>{paused=false;lastFrame=performance.now();update();$('world').focus({preventScroll:true});$('scoreHud').scrollIntoView({block:'start',behavior:'instant'});};
$('sound').onclick=async()=>{if(music.enabled){if(recordPreviewId){stopRecordPreview();if(dialogKind==='records')showRecords();}music.stop();$('sound').innerHTML='♫ <span>Som desligado</span>';$('sound').setAttribute('aria-label','Ativar música');}else if(await music.enable()){$('sound').innerHTML='♫ <span>Som ligado</span>';$('sound').setAttribute('aria-label','Desativar música');toast('SOM LIGADO');}};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Use o modo de tela cheia do seu navegador.');}};
function showZag(){if(!s.run&&!returns.active)zagGame.open();}
function visitVillage(id){if(s.run||returns.active)return;const h=HOTSPOTS.find(h=>h.id===id);if(!h)return;const point={forge:[197,218],tree:[305,225],lift:[557,225],well:[171,302],missions:[340,314],stars:[582,313],zag:[490,346],records:[494,218],miner:[205,349]}[id];world.target={x:point[0]*2,y:point[1]*2};({forge:showForge,tree:()=>showTree(),lift:()=>showLift('floors'),well:showWell,missions:showMissions,stars:showStars,zag:showZag,records:showRecords,miner:()=>minerGame.show()}[id])();}
$('villageActions').innerHTML=HOTSPOTS.map(h=>'<button class="village-building" data-village="'+h.id+'" aria-label="'+h.name+'"><span>'+h.name+'</span>'+(h.id==='missions'?'<b id="villageMissionBadge" hidden></b>':h.id==='zag'?'<b id="villageZagBadge"></b>':'')+'</button>').join('');
function showVillagePlace(id){const h=HOTSPOTS.find(h=>h.id===id),name=$('villagePlaceName');name.textContent=h?.name||'';name.hidden=!h||!!s.run;world.villageHover=h?.id||null;}
$('villageActions').querySelectorAll('button').forEach(b=>{b.onclick=()=>{showVillagePlace(null);visitVillage(b.dataset.village);};b.onpointerenter=b.onfocus=()=>showVillagePlace(b.dataset.village);b.onpointerleave=b.onblur=()=>showVillagePlace(null);});
function positionVillage(){if(s.run)return;for(const h of HOTSPOTS){const b=$('villageActions').querySelector('[data-village="'+h.id+'"]'),top=h.y-h.h/2;b.style.left=($('world').offsetLeft+world.offsetX+(h.x-h.w/2)*world.scale)+'px';b.style.top=($('world').offsetTop+world.offsetY+top*world.scale)+'px';b.style.width=h.w*world.scale+'px';b.style.height=(h.h*world.scale)+'px';}}
function updateVillage(){const zagBadge=$('villageZagBadge');zagBadge.textContent=s.zag.dice+s.zag.hand.length?(s.zag.dice+s.zag.hand.length)+' DADOS':s.zag.passes+' PASSES';zagBadge.hidden=s.zag.passes===0&&s.zag.dice===0&&s.zag.hand.length===0;const badge=$('villageMissionBadge'),list=missionList(s),ready=list.filter(m=>m.status==='ready').length,active=list.filter(m=>m.status==='active').length;badge.hidden=!list.length;badge.textContent=ready?ready+' RECOMPENSA'+(ready>1?'S':'')+'!':active?active+' / '+missionSlots(s)+' MISSÕES':'NOVA MISSÃO';badge.dataset.ready=String(ready>0);positionVillage();}
function screenTarget(point){if(!s.run)return null;return [...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks].filter(n=>n.hp>0&&!(n.bossIndex===5&&n.windup)&&!(n.bossIndex===6&&s.run.beat>n.exposedUntil)&&!(n.rabbitChild!==undefined&&n.stunned)&&visible(s.run.room,n)).map(n=>{const p=project(n.x,n.y);return{n,d:Math.hypot(p.x-point.x,p.y-19-point.y)-(n.type==='enemy'?8:0)};}).sort((a,b)=>a.d-b.d).find(x=>x.d<(x.n.boss?70:36))?.n;}
$('world').addEventListener('pointermove',e=>{const p=world.pointer(e);hover=screenTarget(p)?.id??null;updateTip();});$('world').addEventListener('pointerleave',()=>{hover=null;updateTip();});
$('world').addEventListener('pointerdown',e=>{if(e.button!==0||$('dialog').open||returns.active)return;$('world').focus({preventScroll:true});const p=world.pointer(e);if(!s.run){const h=HOTSPOTS.find(h=>Math.hypot(h.x-p.x,h.y-p.y)<110);world.target={x:p.x,y:p.y};if(h){clearTimeout(baseTimer);baseTimer=setTimeout(()=>visitVillage(h.id),170);}return;}if(paused)return;if(s.run.room.cleared){const gate=project(s.run.room.exit?.x||18,s.run.room.exit?.y||2);if(Math.hypot(p.x-gate.x,p.y-gate.y)<75){if(s.run.floor<depthLimit(s)&&s.run.floor<TOTAL_FLOORS)nextFloor();else returnSafe();}return;}const target=screenTarget(p);if(target){selected=target.id;perform({type:'hit',id:target.id});}else{const tile=unproject(p.x,p.y);perform({type:'move',...tile});}});
document.addEventListener('keydown',e=>{if($('dialog').open||returns.active||e.repeat)return;if(s.run?.abyss?.cardChoice){const i=['Digit1','Digit2','Digit3'].indexOf(e.code);if(i>=0){e.preventDefault();pickAbyssCard(s.run.abyss.cardChoice.offers[i]);}return;}if(e.code==='Tab'&&!e.shiftKey&&!s.run?.room.cleared&&(e.target===$('world')||e.target===document.body)){e.preventDefault();showTree();return;}if(s.run?.room.cleared){if(e.code==='Tab'){const buttons=[...$('clearBanner').querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled&&b.offsetParent!==null);const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}return;}if(['KeyP','Escape'].includes(e.code)&&s.run){e.preventDefault();pause();return;}if(!s.run)return;const isGame=e.target===$('world')||e.target===document.body;if(!isGame)return;if(e.code==='Space'){e.preventDefault();perform({type:'hit',id:selected});}const dirs={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};if(dirs[e.code]){e.preventDefault();const [dx,dy]=dirs[e.code];perform({type:'dodge',dx,dy});}if(e.code==='KeyQ'){e.preventDefault();const targets=[...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks].filter(n=>n.hp>0);selected=targets[(targets.findIndex(n=>n.id===selected)+1)%targets.length]?.id;updateTip();}if(e.code==='KeyE')extract();if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();perform({type:'item',item:ITEMS[Number(e.code.at(-1))-1].id});}});
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden&&recordPreviewId){stopRecordPreview();if(dialogKind==='records')showRecords();}if(hidden&&s.zag.active&&!zagGame.automatic)zagGame.finish(true);if(hidden&&s.run){paused=true;update();}music.silence();lastFrame=performance.now();save();});window.addEventListener('pagehide',()=>{stopRecordPreview();zagGame.leave();save();});let minerSavedAt=Date.now();setInterval(()=>{const result=settleMiner(s,Date.now());if(result.steps&&dialogKind==='miner')minerGame.earned(result);if(result.gain.some(n=>n>0))update();if(Date.now()-minerSavedAt>=15000&&s.miner.enabled){save();minerSavedAt=Date.now();}},1000);new ResizeObserver(()=>{world.resize();positionVillage();}).observe($('world'));
function frame(now){zagGame.frame();minerGame.frame(now);if((s.run?.recovery?.active||s.run?.rest?.active)&&!$('dialog').open)showRest();guardChoices();const wallDelta=Math.max(0,(now-lastFrame)/1000);lastFrame=now;const choosing=!!s.run?.abyss?.cardChoice;protectRhythm(wallDelta);updateAbyssChoice(wallDelta);if(s.run&&!choosing&&!blocked()&&!s.run.room.cleared){elapsed+=wallDelta;const pulse=Math.floor(phaseAt());if(pulse>(s.run.enemyBeat??-1)){for(let b=Math.max(4,(s.run.enemyBeat??-1)+1);b<=pulse;b++)enemyBeat(s,b);processEvents();}let resolved=false;while(s.run&&!s.run.recovery?.active&&!s.run.rest?.active&&!s.run.abyss?.cardChoice&&!s.run.room.cleared&&elapsed>=beatTime(musicFloor(s.run),s.run.beat+1)+actionWindowMs(s,s.run.beat+1)/1000){tick(s,s.run.beat+1);resolved=true;}if(resolved){if(!s.run)onReturn();else{processEvents();update();save();}}if(s.run&&feedbackTimer<elapsed)$('message').textContent=s.run?.beat<4?'PREPARE-SE!':'';}
 if(pendingBurst&&!blocked()&&(elapsed>=pendingBurst.at||s.run?.room.cleared)){celebrate(pendingBurst.combo,pendingBurst.nova);pendingBurst=null;}updateMusicCue();const phase=phaseAt();document.querySelectorAll('.note').forEach((n,i)=>n.style.top=`${75+(phase-(Math.floor(phase)+i-1))*25}%`);const beatOn=Math.abs(phase-Math.round(phase))<.13;$('beatLamp').style.opacity=beatOn?'1':'.2';$('stage').dataset.beat=beatOn?'on':'off';const itemBeat=s.run&&!blocked()&&!s.run.room.cleared&&beatOn?'on':'off';if($('itemBar').dataset.beat!==itemBeat)$('itemBar').dataset.beat=itemBeat;if(dialogKind!=='miner')world.draw(s,s.run?elapsed:now/1000,wallDelta,selected,hover,blocked());requestAnimationFrame(frame);}
setInterval(()=>{if(dialogKind==='miner'&&!hidden){music.mining(performance.now()/1000);return;}if(dialogKind==='zag'&&!hidden){music.zag(performance.now()/1000);return;}if((!s.run||s.run?.rest?.active)&&!returns.active&&!hidden){music.home(performance.now()/1000,dialogKind==='records');return;}if(!blocked()&&!s.run?.room.cleared){if(s.run)music.update(elapsed+(performance.now()-lastFrame)/1000,trackIndexForFloor(musicFloor(s.run)),{abyss:isAbyss(s.run),sonic:s.run.frenzy?.mutator==='sonic',combo:s.run.combo});else music.home(performance.now()/1000,dialogKind==='records');}},25);
if(!s.run&&s.lastResult&&!s.lastResult.presented)showResult();update();if(s.run){chooseNext();$('pauseTitle').textContent='CONTINUAR?';$('pauseText').textContent='EXPEDIÇÃO SALVA';}save();requestAnimationFrame(frame);
function drawHitHistory(){$('hitHistory').innerHTML=Array.from({length:8},(_,i)=>{const hit=hitHistory[i-(8-hitHistory.length)];return '<i class="'+(hit===true?'hit':hit===false?'miss':'waiting')+'">'+(hit===true?'✦':hit===false?'×':'·')+'</i>';}).join('');}
const lastCardProc=new Map();
let breathAnimation;
function flashBreath(){const node=$('breathHud');breathAnimation?.cancel();breathAnimation=node.animate(world.reduced?[{outlineColor:'#f94e6d',outlineWidth:'3px',outlineStyle:'solid'},{outlineColor:'#5ee9e9',outlineWidth:'0px',outlineStyle:'solid'}]:[{transform:'translateX(0)',background:'#720d0d',borderColor:'#f94e6d'},{transform:'translateX(-5px)',background:'#720d0d',borderColor:'#f94e6d',offset:.15},{transform:'translateX(5px)',background:'#053239',borderColor:'#5ee9e9',offset:.35},{transform:'translateX(-3px)',background:'#720d0d',borderColor:'#f94e6d',offset:.55},{transform:'translateX(0)',background:'#053239',borderColor:'#5ee9e9'}],{duration:600,easing:'ease-out'});}
function showProc(e){const now=performance.now();if(now-(lastCardProc.get(e.id)||-Infinity)<650)return;lastCardProc.set(e.id,now);const node=document.createElement('div'),card=CARDS.find(c=>c.id===e.id);node.className='proc-label';node.style.color=e.color;node.innerHTML=glyph(card?.icon||'gem')+'<span>'+e.name+'!</span>';$('procFeed').append(node);while($('procFeed').children.length>2)$('procFeed').firstElementChild.remove();setTimeout(()=>node.remove(),2100);}
function updateCardUI(){const r=s.run;$('runCards').hidden=!r||!activeCards(r).length;const key=JSON.stringify([r?.cards||{},r?.cardRevives||0]);if(key!==cardRenderKey||!r){cardRenderKey=key;$('runCards').innerHTML=''+(!r||!activeCards(r).length?'<p class="cards-empty">'+(isAbyss(r)?'SEM CARTAS':'SEM CARTAS')+'</p>':activeCards(r).map(c=>'<article class="card-chip" style="--card:'+c.color+'" title="'+c.text+' '+cardDetail(c,cardCount(r,c.id),power(s),0,s)+'">'+glyph(c.icon)+'<div><strong>'+c.name+' <b>'+(c.id==='revival'?Math.max(0,cardCount(r,c.id)-(r.cardRevives||0))+' VIDAS':'NV. '+cardCount(r,c.id))+'</b></strong></div></article>').join(''));}
 if(!r?.room.cleared){choiceScreen='';pendingCard=null;return;}const screen=s.attempts+':'+r.floor;if(choiceScreen!==screen){choiceScreen=screen;pendingCard=null;floorGuard.lock(performance.now());}renderFloorLoot();const offerKey=r.floor+'-'+(r.cardOffer||[]).join(',')+'-'+r.cardChosen;if(offerKey===offerRenderKey)return;offerRenderKey=offerKey;
 $('confirmCard').hidden=r.cardChosen;if(!pendingCard)$('confirmCard').textContent='ESCOLHA UMA CARTA';$('cardOffers').hidden=r.cardChosen;$('chosenCard').hidden=!r.cardChosen;$('floorActions').hidden=!r.cardChosen;$('safeReturn').disabled=!r.cardChosen;$('descend').disabled=!r.cardChosen;
 if(!r.cardChosen){$('cardOffers').innerHTML=(r.cardOffer||[]).map((id,i)=>{const c=CARDS.find(c=>c.id===id),level=cardCount(r,id),detail=cardDetail(c,level+1,power(s),level,s);return '<button class="gem-card" data-card="'+id+'" style="--card:'+c.color+'"><span class="card-role">'+c.role+'</span><span class="card-art">'+assetToSvg(generateAsset('crystal',{seed:r.room.seed+i,variant:[0,2,1][i]}))+'<i>'+glyph(c.icon)+'</i></span><strong>'+c.name+'</strong><p>'+c.text+'</p><span class="card-detail">'+detail+'</span><small>'+(level?'MELHORAR · NÍVEL '+(level+1):'NOVO PODER')+'</small></button>';}).join('');$('cardOffers').querySelectorAll('button').forEach(button=>button.onclick=()=>{if(!floorGuard.ready(performance.now()))return;pendingCard=button.dataset.card;for(const other of $('cardOffers').querySelectorAll('button')){other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button));}$('confirmCard').textContent='ESCOLHER · '+CARDS.find(c=>c.id===pendingCard).name;guardChoices();});
 }else{$('chosenCard').innerHTML='<span>✦</span> CARTA EQUIPADA!';}guardChoices();
}
drawHitHistory();
function updateScoreHUD(){const r=s.run;$('scoreHud').hidden=!r;if(!r)return;const q=r.score,p=scoreProgress(r),marks=starMarks(r);$('scoreValue').textContent=fmt(q.points);$('scoreMultiplier').textContent='×'+p.multiplier.toFixed(2)+' COMBO';$('scoreNext').textContent=q.earned===5?'TODAS CONQUISTADAS':'PRÓXIMA ★ '+fmt(p.goal);$('scoreTarget').textContent=q.earned+' / 5 ★';$('scoreFill').style.setProperty('--score-fill',p.fill*100+'%');$('starProgress').setAttribute('aria-orientation',document.body.classList.contains('immersive-run')?'vertical':'horizontal');$('starProgress').setAttribute('aria-valuenow',Math.round(p.fill*100));const left=Math.max(0,floorScoreLimit(r)-(r.room.scoreSpent||0));$('scoreWindow').textContent=r.room.cleared?'PONTOS GUARDADOS · SIGA A DESCIDA':q.version===2?(left?'NESTA SALA · +'+fmt(left)+' PONTOS DISPONÍVEIS':'SALA PONTUADA · AVANCE'):'PONTOS GUARDADOS NA DESCIDA';$('earnedStars').setAttribute('aria-label',q.earned+' de 5 estrelas');for(let i=1;i<=5;i++){const slot=$('starSlot'+i);slot.classList.toggle('lit',i<=q.earned);slot.style.setProperty('--star-mark',marks[i-1]/marks[4]*100+'%');slot.title=fmt(Math.round(q.target*marks[i-1]))+' PONTOS';}}
function celebrateStar(number){
 const slot=$('starSlot'+number);slot.classList.add('lit');music.reward();
 slot.animate(world.reduced?[{opacity:.4},{opacity:1}]:[{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-160%) scale(1.8)',offset:.45},{transform:'translate(-50%,-50%) scale(1)'}],{duration:850,easing:'ease-out'});
 const node=document.createElement('div');node.className='star-flight';node.innerHTML='<b>★</b><strong>+'+number+'ª ESTRELA!</strong>';$('starAnnouncements').append(node);
 const dest=slot.getBoundingClientRect(),origin=node.getBoundingClientRect(),dx=dest.left+dest.width/2-origin.left-origin.width/2,dy=dest.top+dest.height/2-origin.top-origin.height/2;
 const animation=node.animate(world.reduced?[{opacity:0},{opacity:1,offset:.2},{opacity:0}]:[{opacity:0,transform:'scale(.3)'},{opacity:1,transform:'scale(1.2)',offset:.2},{opacity:1,transform:'scale(1)',offset:.55},{opacity:0,transform:'translate('+dx+'px,'+dy+'px) scale(.2)'}],{duration:1300,easing:'ease-out'});
 animation.finished.then(()=>node.remove(),()=>node.remove());
}
function showStars(){
 if(s.run||returns.active)return;
 openDialog('RELICÁRIO ANCESTRAL',astralMarkup(s)+'<details class="astral-legacy"><summary>RELÍQUIAS FUNDADORAS</summary>'+relicMarkup(s)+'</details>','stars');
 $('dialogBody').scrollTop=0;
 const commit=fn=>{if(fn()){invalidateProgression(s);save();update();music.reward();showStars();}};
 if($('rollAstral'))$('rollAstral').onclick=()=>commit(()=>rollAstral(s));
 $('dialogBody').querySelectorAll('[data-choose-astral]').forEach(b=>b.onclick=()=>commit(()=>chooseAstral(s,b.dataset.chooseAstral)));
 $('dialogBody').querySelectorAll('[data-equip-astral]').forEach(b=>b.onclick=()=>commit(()=>equipAstral(s,b.dataset.equipAstral)));
 $('dialogBody').querySelectorAll('[data-relic]').forEach(b=>b.onclick=()=>commit(()=>buyRelic(s,b.dataset.relic)));
}
function missionTimeLeft(m){const seconds=Math.ceil(m.remaining),minutes=Math.floor(seconds/60);return seconds>=3600?Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'min':minutes+':'+String(seconds%60).padStart(2,'0');}
function showMissionReceipt(reward,record=null){
 openDialog('MISSÃO ENTREGUE','<div class="mission-receipt"><span class="receipt-check">✓</span><h2>RECOMPENSA RECEBIDA!</h2><div class="receipt-rewards"><div><strong>◇ +'+fmt(reward.gems)+'</strong><span>MOEDAS</span></div><div><strong>✦ +'+reward.essence+'</strong><span>ESSÊNCIAS</span></div></div>'+(record?'<div class="record-receipt">♫ DISCO RARO · '+record.name+'</div>':'')+'<button class="primary" id="receiptDone">FECHOU!</button><button class="secondary" id="moreMissions">NOVA MISSÃO →</button></div>','missions');
 $('receiptDone').onclick=()=>{closeDialog();for(const id of ['bank','essence'])$(id).animate(world.reduced?[{opacity:.5},{opacity:1}]:[{transform:'scale(1.35)',color:'#e8ff75'},{transform:'scale(1)'}],{duration:550});};
 $('moreMissions').onclick=showMissions;
}
function updateMissionHUD(){const list=missionList(s),m=list.find(m=>m.status==='active')||list.find(m=>m.status==='ready')||list[0],ready=list.filter(m=>m.status==='ready').length;$('missionHud').hidden=!m||!s.run;if(!m)return;const def=MISSION_TYPES.find(d=>d.id===m.template),tier=MISSION_TIERS[m.tier];$('missionHud').style.setProperty('--mission',tier.color);$('missionTier').textContent=list.length>1?list.filter(m=>m.status!=='expired').length+' MISSÕES'+(ready?' · '+ready+' PRONTAS':''):tier.name;$('missionName').textContent=def.name;$('missionTask').textContent=def.verb;$('missionProgress').textContent=fmt(m.progress)+' / '+fmt(m.goal);$('missionTime').textContent=m.status==='ready'?'✓ ENTREGAR NA BASE':m.status==='expired'?'PRAZO ENCERRADO':missionTimeLeft(m)+(s.run&&!s.run.room.cleared&&!blocked()?'':' · PAUSADA');}
function finishAbyssChoice(id,automatic){
 $('abyssCardDialog').close();abyssChoiceKey='';abyssGuard.reset();lastFrame=performance.now();
 processEvents();update();save();if(id.startsWith('abyss-'))music.sfx('card');toast((automatic?'SORTEOU · ':'PODER · ')+abyssCardDefinition(id).name.toUpperCase());$('world').focus({preventScroll:true});
}
function pickAbyssCard(id){
 if(paused||hidden||!$('abyssCardDialog').open||!abyssGuard.ready(performance.now()))return;
 if(chooseAbyssCard(s,id))finishAbyssChoice(id,false);
}
function updateAbyssChoice(delta=0){
 const r=s.run,c=r?.abyss?.cardChoice,dialog=$('abyssCardDialog');
 if(!c||paused||hidden||$('dialog').open||returns.active){if(dialog.open)dialog.close();if(!c)abyssChoiceKey='';return;}
 const key=s.attempts+':'+c.section;
 if(!dialog.open){
  if(key!==abyssChoiceKey){abyssChoiceKey=key;abyssChoiceSaved=c.remaining;
   $('abyssCardOffers').innerHTML=c.offers.map((id,i)=>{const d=abyssCardDefinition(id),level=cardCount(r,id),instant=id.startsWith('abyss-');return '<button class="abyss-card" data-abyss-card="'+id+'" style="--card:'+d.color+'" disabled><kbd>'+(i+1)+'</kbd><small>'+d.role+'</small><i>'+glyph(d.icon)+'</i><strong>'+d.name+'</strong><span>'+d.text+'</span><b>'+(instant?'EFEITO IMEDIATO':level?'NÍVEL '+(level+1):'NOVO PODER')+'</b></button>';}).join('');
   $('abyssCardOffers').querySelectorAll('button').forEach(b=>b.onclick=()=>pickAbyssCard(b.dataset.abyssCard));
  }
  abyssGuard.lock(performance.now(),350);music.silence();dialog.showModal();delta=0;
 }
 const id=advanceAbyssCards(s,delta);if(id){finishAbyssChoice(id,true);return;}
 const ready=abyssGuard.ready(performance.now());$('abyssCardOffers').querySelectorAll('button').forEach(b=>b.disabled=!ready);
 $('abyssCardFill').style.transform='scaleX('+(c.remaining/ABYSS_CHOICE_SECONDS)+')';$('abyssCardTimer').setAttribute('aria-valuenow',c.remaining.toFixed(1));$('abyssCardSeconds').textContent=Math.ceil(c.remaining)+'s';dialog.dataset.urgent=String(c.remaining<=1);
 $('abyssCardHint').textContent=ready?'CLIQUE OU USE 1 · 2 · 3':'SOLTE OS CONTROLES…';
 if(abyssChoiceSaved-c.remaining>=.25){abyssChoiceSaved=c.remaining;save();}
}
$('abyssCardDialog').addEventListener('cancel',e=>e.preventDefault());
function showMissions(){
 if(s.run||returns.active)return;
 const list=missionList(s),used=list.filter(m=>m.status!=='expired').length,slots=missionSlots(s),nextSlot=nextMissionSlot(s),offers=missionOffers(s).filter(o=>!list.some(m=>m.status!=='expired'&&m.template===o.template)),odds=missionOdds(s);save();
 const row=(mission,active=false)=>{
  const def=MISSION_TYPES.find(d=>d.id===mission.template),tier=MISSION_TIERS[mission.tier],reward=missionReward(mission),ready=mission.status==='ready',expired=mission.status==='expired';
  const amount='<b>'+fmt(mission.goal)+'</b>',objective=/^(Quebre|Derrote|Acerte|Ganhe|Complete|Use) /.test(def.verb)?def.verb.replace(/^(\S+) /,'$1 '+amount+' '):def.verb+' '+amount;
  const status=ready?'✓ CONCLUÍDA':expired?'PRAZO ENCERRADO':missionTimeLeft(mission)+(active?' · PAUSADA NA VILA':' DE EXPLORAÇÃO');
  const key=encodeURIComponent(mission.id),action=!active?'<button class="primary" data-mission="'+key+'">ACEITAR →</button>':ready?'<button class="primary" data-claim-mission="'+key+'">RECEBER ✦</button>':expired?'<button class="secondary" data-abandon-mission="'+key+'">LIMPAR</button>':'<strong class="mission-running">EM ANDAMENTO</strong>';
  return '<li class="mission-row" style="--mission:'+tier.color+'"><i aria-hidden="true">'+glyph(def.icon)+'</i><div class="mission-copy"><span class="mission-rarity">'+'NV. '+(mission.rewardLevel||1)+' · '+tier.name+'</span><h3>'+objective+'</h3><span class="mission-deadline">'+status+'</span>'+(active?'<div class="mission-progress" role="progressbar" aria-label="Progresso da missão" aria-valuemin="0" aria-valuemax="'+mission.goal+'" aria-valuenow="'+mission.progress+'"><i style="width:'+Math.min(100,mission.progress/mission.goal*100)+'%"></i></div><strong class="mission-count">'+fmt(mission.progress)+' / '+fmt(mission.goal)+'</strong>':'')+'</div><div class="mission-reward"><strong>◇ '+fmt(reward.gems)+'</strong><span>MOEDAS</span><b>✦ '+reward.essence+' ESSÊNCIAS</b><small title="Pequena chance ao entregar">♫ DISCO RARO?</small></div><div class="mission-action">'+action+'</div></li>';
 };
 openDialog('QUADRO DE MISSÕES','<div class="mission-heading"><h2>MISSÕES <b>'+used+' / '+slots+'</b></h2><p>'+(nextSlot?'PRÓXIMA VAGA · NV. '+nextSlot:'5 VAGAS LIBERADAS')+'</p></div>'+buildingMarkup(s,'missions')+(list.length?'<h3 class="mission-section-title">SUAS MISSÕES</h3><ul class="mission-list" aria-label="Missões aceitas">'+list.map(m=>row(m,true)).join('')+'</ul>':'')+(used<slots?'<h3 class="mission-section-title">ESCOLHA SUA MISSÃO</h3><ul class="mission-list" aria-label="Missões disponíveis">'+offers.map(o=>row(o)).join('')+'</ul>':'<p class="mission-full">VAGAS CHEIAS · CONCLUA E RECEBA</p>')+(list.some(m=>m.status==='active')?'<details class="mission-options"><summary>TROCAR MISSÃO</summary>'+list.filter(m=>m.status==='active').map(m=>'<button class="secondary" data-abandon-mission="'+encodeURIComponent(m.id)+'">ABANDONAR · '+MISSION_TYPES.find(d=>d.id===m.template).name+'</button>').join('')+'</details>':'')+'<details class="mission-rules"><summary>CHANCES E REGRAS</summary><p>Raras: '+Math.round(odds.rare*100)+'% · Douradas: '+Math.round(odds.gold*100)+'%.</p><p>'+(s.unlocked.includes('questluck')?'OLHO DE OURO ATIVO.':'OLHO DE OURO aumenta as chances na árvore.')+'</p><p>Mais vagas nos níveis 30, 60, 90 e 120. Máximo de cinco.</p><p>Aceitar e entregar sorteia novas ofertas. Missões aceitas continuam guardadas.</p><p>O prazo só corre na caverna. Progresso continua após a morte. Receba na vila.</p></details>','missions');
 $('dialogBody').querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{if(acceptMission(s,decodeURIComponent(b.dataset.mission))){save();update();closeDialog();music.sfx('accept');toast('MISSÃO ACEITA!');}});
 bindBuilding(showMissions);
 $('dialogBody').querySelectorAll('[data-claim-mission]').forEach(b=>b.onclick=()=>{const id=decodeURIComponent(b.dataset.claimMission),m=missionList(s).find(m=>m.id===id);if(!m)return;const reward=missionReward(m),owned=new Set(s.records.owned);if(claimMission(s,id)){const disc=RECORDS.find(r=>s.records.owned.includes(r.id)&&!owned.has(r.id));save();update();showMissionReceipt(reward,disc);music.sfx(disc?'recordDrop':'claim');}});
 $('dialogBody').querySelectorAll('[data-abandon-mission]').forEach(b=>b.onclick=()=>{if(abandonMission(s,decodeURIComponent(b.dataset.abandonMission))){save();update();showMissions();}});
}
function updateBossHUD(){
 const r=s.run,boss=r?livingBoss(r.room):null,hud=$('bossHud');
 hud.hidden=!boss;hud.dataset.spore=String(boss?.bossIndex===4);$('objective').classList.toggle('boss-objective',!!r?.room.bossFloor);
 if(r?.room.bossFloor){$('charge').textContent=r.room.bossDefeated?'✓':'BOSS';$('chargeBar').style.width=(r.room.bossDefeated?100:0)+'%';$('goal').textContent='DERROTE O CHEFE';}
 if(!boss)return;const d=BOSSES[boss.bossIndex],beat=Math.floor(phaseAt()),open=beat<=boss.exposedUntil;
 hud.style.setProperty('--boss',d.color);$('bossName').textContent=d.name;$('bossHP').textContent=Math.ceil(boss.hp)+' / '+boss.maxHp;$('bossFill').style.width=boss.hp/boss.maxHp*100+'%';
 $('bossAttack').textContent=boss.windup?boss.windup.attack:boss.bossIndex===4?'QUEBRE OS NÚCLEOS':boss.bossIndex===6&&!open?'ACERTE OS 3 FILHOTES':open?'ATAQUE AGORA!':'PREPARE-SE';
 $('bossInstruction').textContent=boss.bossIndex===4?(boss.windup?.hint||'SIGA O GIRO · QUEBRE OS NÚCLEOS'):boss.windup?boss.windup.hint+' · '+Math.max(0,boss.windup.beat-beat)+' PULSOS':open?'VULNERÁVEL · '+Math.max(0,boss.exposedUntil-beat+1)+' PULSOS':boss.bossIndex===6?'ATORDOE OS FILHOTES':'ARMADURA ATIVA';
 $('bossPhase').textContent=boss.hp<=boss.maxHp/2?'FASE 2 · FÚRIA':'FASE 1';hud.dataset.open=String(open);
}
$('confirmCard').onclick=()=>{if(!pendingCard||!floorGuard.ready(performance.now()))return;if(chooseCard(s,pendingCard)){pendingCard=null;floorGuard.lock(performance.now(),900);processEvents();update();save();$('clearBanner').focus({preventScroll:true});}};
function renderFloorLoot(){const r=s.run,q=floorRewards(s);$('floorLoot').innerHTML=q?'<span class="floor-loot-label">NESTE ANDAR</span>'+[['◇',q.gems,'MOEDAS'],['✦',q.essence,'ESSÊNCIAS'],['★',q.stars,'ESTRELAS'],['♫',q.points,'PONTOS']].map(([icon,value,label])=>'<div><strong>'+icon+' +'+fmt(value)+'</strong><small>'+label+'</small></div>').join(''):'<span class="floor-loot-label">MOCHILA ATUAL</span><div><strong>◇ '+fmt(r.bag)+'</strong><small>MOEDAS</small></div>';if(r?.room.recordDrop){const disc=RECORDS.find(d=>d.id===r.room.recordDrop);if(disc)$('floorLoot').innerHTML+='<div class="floor-record-drop">♫ '+disc.name+'</div>';}if(r)$('floorLoot').innerHTML+='<div class="floor-materials">'+MATERIALS.map((m,i)=>{const n=r.materials[i]-(r.room.floorStart?.materials?.[i]||0);return n>0?'<span style="color:'+m.color+'">'+gemIcon(i)+'<b>+'+fmt(n)+'</b></span>':'';}).join('')+'</div>';}





function updateDepthLift(){
 const r=s.run;$('depthLift').hidden=!r;if(!r)return;
 if(!$('liftPortrait').firstElementChild)$('liftPortrait').innerHTML=assetToSvg(generateAsset('miner',{seed:7}));
 if(liftFloor!==r.floor){const previous=liftFloor;liftFloor=r.floor;if(previous!==undefined&&!world.reduced)$('liftCabin').animate([{transform:'translateY(-34px)'},{transform:'translateY(0)'}],{duration:1100,easing:'ease-out'});}
 const address=floorAddress(r.floor);
 $('liftCurrent').textContent=address.step+' / 5';
 $('liftCode').textContent=address.code;
 $('liftBiome').textContent=BIOMES[biomeIndex(r.floor)].name;
 $('liftBoss').textContent=address.boss?'⚔ CHEFE':address.nextBoss?'CHEFE A SEGUIR':'';
 $('liftBoss').dataset.warning=String(address.boss||address.nextBoss);
 $('liftStops').innerHTML=Array.from({length:5},(_,i)=>'<i class="'+(i<address.step?'reached':'')+' '+(i===4?'boss-stop':'')+'"></i>').join('');
}
function showRest(){
 const r=s.run;if(!r)return;const recovery=!!r.recovery?.active;if(!recovery&&!r.rest?.active)return;
 const campArt='<svg viewBox="0 0 500 150" role="img" aria-label="Abrigo com fogueira"><path d="M0 130L60 74L150 92L210 48L285 70L350 25L430 80L500 55V150H0Z" fill="#353658"/><ellipse cx="250" cy="132" rx="118" ry="13" fill="#180d2f"/><path d="M210 126L287 139M287 124L213 141" stroke="#b66831" stroke-width="12"/><path class="camp-flame" d="M250 134Q204 112 246 63Q239 89 258 81Q280 101 271 119Q262 138 250 134Z" fill="#ef6e10"/><path d="M251 128Q231 117 252 98Q271 119 251 128Z" fill="#ece910"/><path d="M345 119V99H400L388 109H370V125Z" fill="#8b97b6"/><path d="M353 127H390" stroke="#686b72" stroke-width="10"/></svg>';
 const cards=recovery?'':CAMP_OFFERS.map(o=>'<article><h3>'+o.name+'</h3><strong>'+o.text+'</strong><p>'+gemIcon(o.material)+o.cost+' '+MATERIALS[o.material].name+'</p><button class="primary" data-camp="'+o.id+'" '+(r.rest.bought.includes(o.id)||r.materials[o.material]<o.cost||(o.id==='heal'?r.health>=maxHealth(s):r.items[o.id]>7)?'disabled':'')+'>'+(r.rest.bought.includes(o.id)?'PRONTO':'PREPARAR')+'</button></article>').join('');
 openDialog(recovery?'NOVA CHANCE':'FOGUEIRA', '<div class="camp-scene">'+campArt+'</div><div class="rest-heading"><h2>'+(recovery?'VOCÊ VOLTOU!':'RESPIRE.')+'</h2><p>'+(recovery?'COMBO MANTIDO':'TEMPO PARADO')+'</p><strong>♥ '+Math.ceil(r.health)+' · ϟ '+Math.ceil(r.rhythm)+' · COMBO '+r.combo+'×</strong></div><div class="camp-offers">'+cards+'</div><div class="rest-actions"><button class="secondary" id="restBuild">AJUSTAR BUILD</button><button class="primary" id="restContinue">'+(recovery?'VOLTAR À LUTA':'CONTINUAR DESCIDA')+'</button></div>','rest');
 $('dialogBody').querySelectorAll('[data-camp]').forEach(b=>b.onclick=()=>{if(buyCamp(s,b.dataset.camp)){music.forge(performance.now()/1000);save();update();showRest();}});
 $('restBuild').onclick=()=>showTree(recovery?'guard':'revive');
 $('restContinue').onclick=()=>{if(recovery){resumeRecovery(s);closeDialog();paused=false;lastFrame=performance.now();save();update();}else if(leaveCamp(s)){closeDialog();save();nextFloor();}};
}





function updateFrenzyHUD(){
 const r=s.run,abyss=isAbyss(r),f=r?.frenzy,rest=!r||!!r.rest?.active;
 document.body.classList.toggle('resting',rest);document.body.classList.toggle('abyss-mode',abyss);
 document.body.classList.toggle('immersive-run',!!r&&!rest);
 document.body.classList.toggle('immersive-base',!r);
 document.body.classList.toggle('floor-complete',!!r?.room.cleared);
 $('breathHud').hidden=!r||rest||r.room.cleared;
 $('frenzyHud').hidden=!f;$('boostHud').hidden=!abyss;$('rescueHud').hidden=!abyss||!rescueAvailable(r);$('floorRescue').hidden=abyss||!rescueAvailable(r);
 if(rest){$('trackName').textContent='LUZ DA FOGUEIRA';$('trackStyle').textContent='REFÚGIO · AMBIENTE';$('trackTempo').textContent='CALMO';}
 if(!f)return;
 const heat=heatState(r),m=MUTATORS.find(m=>m.id===f.mutator),q=f.quest;
 $('heatValue').textContent=Math.round(heat.heat)+'%';$('heatFill').style.width=heat.heat+'%';$('heatLoot').textContent='SAQUE ×'+heat.loot.toFixed(1);
 $('mutatorName').textContent=f.pendingSection?'A SEGUIR · '+f.pendingSection.name:m.name;$('mutatorHint').textContent=f.invaderAt>r.beat?'TITÃ CHEGANDO!':m.hint;
 $('liveQuest').hidden=!q||q.done;
 if(q&&!q.done){$('questName').textContent=q.name;$('questCount').textContent=(q.kind==='vein'?(q.collected?'+'+q.collected+' ◇':'BATA E COLETE'):q.progress+'/'+q.goal)+' · '+Math.max(0,Math.ceil((q.until-r.beat)*beatLength()))+'s';}
 $('boostHud').innerHTML=BOOSTS.filter(b=>activeBoost(r,b.id)).map(b=>{const seconds=Math.max(0,Math.ceil((f.buffs[b.id]-r.beat)*beatLength()));return '<div class="boost-node active" style="--boost:'+b.color+'" role="img" aria-label="'+b.name+' · '+b.hint+' · '+seconds+' segundos" title="'+b.name+' · '+b.hint+'"><b>'+glyph({giant:'force',lightning:'chain',fire:'dash',magnet:'magnet',shield:'guard',wings:'wings'}[b.id])+'</b><small>'+seconds+'s</small></div>';}).join('');
 if(abyss){
  $('record').textContent=(s.abyssBest||0)+' m';$('runCards').hidden=!Object.keys(r.cards).length;
  $('objective').hidden=true;$('sceneTitle').textContent='ABISMO INFINITO';$('locationLabel').textContent='DESCIDA CONTÍNUA';
  $('liftCurrent').textContent=(r.abyss.rows*5)+' M ↓';$('liftCode').textContent='ABISMO ∞';$('liftBoss').textContent='';$('liftStops').innerHTML='';$('explorationHud').hidden=false;$('explorationHud').textContent='∞ '+BIOMES[biomeIndex(r.floor)].name.toUpperCase()+' · CONTINUE DESCENDO';
  $('scoreWindow').textContent='ALTO COMBO + TITÃS · CHANCE DE ESTRELA';
  $('rescueTimer').textContent=rescueAvailable(r)?Math.max(0,Math.ceil((r.abyss.checkpoint.until-r.beat)*beatLength()))+'s':'';
 }
}
function processFrenzyEvents(events){
 for(const e of events){
  if(e.type==='sectionWarning'){feedback('A SEGUIR · '+e.name);toast(e.hint);}
  if(e.type==='section'){feedback(e.name+'!');}
  if(e.type==='boost'){music.milestone(20);}
  if(e.type==='challenge'){toast(e.name+' · DESAFIO RÁPIDO');}
  if(e.type==='challengeWin'){music.reward();toast(e.name);}
  if(e.type==='meteorWarning'||e.type==='invaderWarning')feedback(e.name+'!');
  if(e.type==='invader')feedback(e.name+'!');
  if(e.type==='checkpoint')toast('RESGATE ABERTO · ENVIE OU ARRISQUE');
  if(e.type==='cargo'){music.loot(3);toast('SAQUE GUARDADO NA BASE!');}
  if(e.type==='abyssRevive'){feedback('NOVA CHANCE · COMBO MANTIDO!');music.reward();}
  if(e.type==='squeeze')feedback('DESÇA! O ABISMO ESTÁ FECHANDO!');
 }
}
function rescueNow(){if(!isAbyss(s.run)&&!floorGuard.ready(performance.now()))return;if(secureCargo(s)){processEvents();update();save();$('world').focus({preventScroll:true});}}
$('sendCargo').onclick=rescueNow;$('floorRescue').onclick=rescueNow;
$('riskCargo').onclick=()=>{if(skipRescue(s.run)){update();save();$('world').focus({preventScroll:true});}};
