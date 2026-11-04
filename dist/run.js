import {getDisplayModeController,bindDisplayVisibility} from './display-mode.js';
import {createSaveSnapshot} from './save-snapshot.js';
const saveSnapshot=createSaveSnapshot();
import {createResumeFlow} from './resume-flow.js';
import {beginResumeRhythm,clearResumeRhythm,resumeRhythmRemaining} from './resume-rhythm.js';
import {createResumeView} from './resume-view.js';
import {crownActive,crownCaption,crownApproach} from './geode-crown.js';
import {createCrownAudio} from './geode-crown-audio.js';
import {bindConsumableButton} from './consumable-input.js';
import {activeCatalogItem} from './record-catalog.js';
import{mysticActive,mysticCopy,mysticTargets,mysticOpen,mysticCaption}from'./mystic-mechanic.js';
import{micelialActive}from'./micelial-mechanic.js';
import {holeClickTarget} from './cave-hole-descent.js';
import {usesStairs,autoContinueStair,cavePressure} from './cave-descent.js';

import {caveFindTargets} from './cave-finds.js';
import {approvedCaveFindTip,placeApprovedCaveFindTip} from './approved-cave-find-tip.js';
import {rootTargets,rootTarget,rootActive,rootOpen,rootCaption} from './matriarch-mechanic.js';
import {cardHudMarkup} from './card-hud.js';
import {installBubbleFeedback} from './ui-bubble-feedback.js';
import {mountApprovedHelp} from './approved-help-ui.js';
import {mountApprovedStatue} from './approved-statue-ui.js';
import {mountApprovedLift} from './approved-lift-ui.js';
import {mountApprovedExpeditionCards} from './approved-expedition-cards-ui.js';
import {mountApprovedWithdrawal} from './approved-return-ui.js';
import {mountApprovedRest} from './approved-rest-ui.js';
import {confirmButtonResult} from './button-feedback.js';
import {createTreeSoundFeedback} from './ui-sound-feedback.js';
import {mountApprovedPets} from './approved-pets-ui.js';
import {mountApprovedWardrobe} from './approved-wardrobe-ui.js';
import {mountApprovedMissions} from './approved-missions-ui.js';
import {petArtSpec} from './pet-art-catalog.js';
import {bindPetPreviews} from './pet-art-runtime.js';
import {pulseCombo,flyStar,flyCombo} from './gamefeel-v5.js';
import {APPROVED_CARD_RASTERS} from './approved-card-raster.js';
import {drawPlayerPortrait} from './player-appearance.js';
import {setMinerOutfit} from './miner-outfit.js';
import {createExpeditionHud} from './expedition-hud-view.js';
import {createDiscoveryNotices} from './approved-discoveries-ui.js';
import {createLevelProgressNotice} from './approved-level-progress-ui.js';
import {createSentinelReward} from './approved-sentinel-reward-ui.js';
import {worldSentinelEvents} from './sentinel-world-rewards.js';
import {createCaveAlerts} from './approved-cave-alerts-ui.js';
import {reliquaryUnlocked} from './refuge-journey.js';
import {collectedGemSvg} from './collected-gems.js';
import {installGlobalFinish} from './global-screen-finish.js';
import {decorateForge,releaseForgePresentation} from './forge-layout.js';
import {mountApprovedForge} from './approved-forge-ui.js';
import {mountApprovedTree} from './approved-tree-ui.js';
import {createRefugeLobby,wardrobeMarkup} from './refuge-lobby.js';
import {normalizeForgeProjectId,renderForgePresentation} from './forge-presentation.js';
import {decorateReliquary,releaseReliquaryPresentation} from './reliquary-layout.js';
import {withWalletStars} from './shared-ui-art.js';
import {mountTutorial} from './tutorial-runtime.js';
import {createStatuePromotionController} from './statue-promotion-controller.js';
import {nextHomePulseDelay} from './audio.js';
import {statueMaterial,statueFamilyUrl} from './statue-family.js';
import {accountScoreView} from './account-score.js';
import {statueScoreMarkup} from './statue-view.js';
import {refugeArtUrl} from './refuge-art.js';
import {approvedArtSvg} from './approved-art.js';
import {chosenCardView} from './chosen-card-view.js';
import {decoratePostChoiceFromState} from './post-choice-consumer.js';
import {decorateDescentChoice} from './descent-shell.js';
import {journeyFloorCardsMarkup,journeyAbyssCardsMarkup} from './rebrand-journey-choices.js';
import {missionBoardMarkup,missionReceiptMarkup} from './rebrand-missions.js';
import {notesEligible} from './refuge-motion-policy.js';
import {observeRefugeMusic} from './refuge-music-route.js';
import {getAppServices} from './app-services.js';
import {pickFlowVillage as pickRefugeGroundTarget} from './flow-village.js';
// Automatic miner retired from the active lobby; historical save fields remain intact.
import {MinerGame} from './miner-view.js';
import {TalentView} from './talent-view.js';
import {applyDialogUI,cancelDialogUI} from './ui-labels.js';
import {mountApprovedReliquary} from './approved-reliquary-ui.js';

import {invalidateProgression} from './progression-effects.js';
import {petsMarkup} from './pets-view.js';
import {bindPetsSelection} from './pets-selection.js';
import {petsServiceView} from './pets-service.js';
import {commitPetAction} from './pets-transaction.js';
import {petsAccessAllowed} from './pets-access.js';
import {ZagGame} from './zag-view.js';
import {settleZag,zagRoundState} from './zag.js';
import {updatePickaxeCursor} from './pickaxe-cursor.js';
import {upgradeBuilding,missionSlots,nextMissionSlot,buildingLevel,MISSION_BUILDING_CAP} from './village.js';
import {buildingMarkup} from './village-view.js';
import {floorRecordsMarkup} from './floor-records-view.js';
import {floorAddress,canEnterAbyss,depositGate,unlockStop} from './descent-progress.js';
import {liftScreenMarkup,bindLiftNavigation} from './lift-view.js';
import {REFUGE_STATIONS} from './refuge-scene.js';
import {updateResourceWallet} from './refuge-hud.js';
import {isAbyss,musicFloor,heatState,MUTATORS,BOOSTS,activeBoost,rescueAvailable,secureCargo,skipRescue} from './frenzy.js';
import {visible,environment,terrainAt} from './cavern.js';
import {makeOffering,buyRelic,skillPointCost} from './pillars.js';
import {relicMarkup,experienceMarkup} from './pillar-view.js';
import {MATERIALS,canPayMaterials} from './materials.js';
import {expeditionMap,gemIcon} from './expedition-map.js';
import {FORGE_PROJECTS,forgeProject,depositForge,craftForge} from './forge.js';
import {GEAR_ITEMS,rollGear,chooseGearTrait,discardGearRoll,upgradeGearTrait,clearGearTrait} from './gear.js';
import {recipeMarkup,forgeMarkup,forgeDepositAmount} from './forge-view.js';
import {retreatSummary} from './expedition-summary.js';
import {ChoiceGuard} from './choice-guard.js';
import {captureControlFocus,restoreControlFocus,restoreDialogOpener,installCommandFeedback,showCommandResult} from './ui-command-feedback.js';
import {ABYSS_CHOICE_SECONDS,abyssCardDefinition} from './abyss-cards.js';
import {chooseAbyssCard,advanceAbyssCards} from './core.js';
import {BOSSES,livingBoss} from './bosses.js';
import {commitMissionClaim} from './mission-claim.js';
import {MISSION_TYPES,MISSION_TIERS,missionOffers,missionOdds,missionReward,missionList,acceptMission,claimMission,abandonMission} from './missions.js';
import {scoreProgress,starMarks,floorScoreLimit,STAR_MARKS,SCORE_BEATS,scoreBeats,STAR_UPGRADES,starCost,buyStarUpgrade,scoreMultiplier} from './stars.js';
import {TOTAL_FLOORS,FLOORS_PER_BIOME} from './campaign.js';
import {creatureFor} from './creatures.js';
import {canRebuild,campNeeded,enterCamp,leaveCamp,buyCamp,CAMP_OFFERS,resumeRecovery,tonicHealing,salvageRetention,floorRewards,RANKED_SKILLS,skillRank,skillText,skillUpgradeCost,upgradeSkill,movement,furyThreshold,ROCKS,chooseCard,completeCaveFloor,ENEMIES,ITEMS,enemyBeat,BIOMES,CRYSTALS,SKILLS,SEALS,createState,restoreState,startRun,finishRun,act,tick,descend,biomeIndex,depthLimit,maxRhythm,maxHealth,windowMs,actionWindowMs,power,crystalValue,upgradeCost,coreCost,purchaseUpgrade,purchaseCore,purchaseSeal,canLearn,learn,equip,distance} from './core.js';
import {World,project,unproject,HOTSPOTS} from './world.js';
import {hedgehogHabitat} from './abyss-cave-habitat.js';
import {HEDGEHOG_ID,hedgehogHitTest,hedgehogTarget,hedgehogStatus} from './hedgehog.js';
import {comboTier,comboTitle} from './effects.js';
import {trackForFloor,beatDuration,beatTime,beatPhase,musicCue,savedMusicElapsed,trackIndexForFloor} from './score.js';
import {glyph} from './ui-art.js';
import {approvedInterfaceIcons as icons} from './approved-interface-entry.js';
import {approvedSkillSlotGlyph} from './approved-talent-icons.js';
import {approvedConsumableGlyph,approvedForgeFeedbackGlyph} from './approved-interface-icons.js';
import {CARDS,cardCount,activeCards,cardDetail} from './cards.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {ReturnScreen} from './return-screen.js';

import {RECORDS,currentRecord,buyRecord,equipRecord} from './records.js';
import {runBeatTime,runBeatPhase,runRailSeconds,runMusicCue,runSavedMusicElapsed,runTrack} from './training-clock.js';
import {attachRecordedExpedition} from './recorded-expedition.js';
import {buyAlbum,equipAlbumEdition} from './album-collection.js';
import {mountApprovedRecords} from './approved-records-ui.js';
const appServices=getAppServices();let applicationMenuOpen=false;
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=glyph(el.dataset.icon));
let approvedChoices=null;
const $=id=>approvedChoices?.field(id)||document.getElementById(id),KEY='gemventure-save-v2';
const resumeFlow=createResumeFlow(),resumeView=createResumeView(document);
let tutorial=null,hadStoredProfile=false;
let s,statuePresentation,saveReadFailed=false;try{const primary=localStorage.getItem(KEY);if(primary!==null){hadStoredProfile=true;s=restoreState(primary);saveReadFailed=!s;}else{const legacy=localStorage.getItem('gemventure-save-v1');if(legacy!==null){hadStoredProfile=true;s=restoreState(legacy);saveReadFailed=!s;}}}catch{saveReadFailed=true;}s=s||createState();settleZag(s,Date.now(),true);const minerWelcome={gain:[0,0,0,0],passes:0};
const world=new World($('world')),music=appServices.audio.engine,refugeMusic=observeRefugeMusic(music);music.setRecord(s.records.active);const crownAudio=createCrownAudio(music);const expeditionMusic=attachRecordedExpedition(music);let elapsed=runSavedMusicElapsed(s.run),lastFrame=performance.now(),paused=!!s.run&&!s.run.room.cleared,hidden=document.hidden,selected=null,hover=null,dialogKind='',skillSelected='ear',toastTimer,feedbackTimer=0;world.place(s);
const treeSound=createTreeSoundFeedback(music,{preferences:()=>appServices.audio.controller.getState().preferences});
const bubbleUI=installBubbleFeedback(document,music,{preferences:()=>appServices.audio.controller.getState().preferences});
statuePresentation=createStatuePromotionController({profile:()=>s,save,align:nextHomePulseDelay,onAccent:()=>{if(music.enabled&&music.ctx?.state==='running'&&!blocked())music.milestone(0);}});world.statuePresentation=statuePresentation;statuePresentation.prepare();
installCommandFeedback(document,{reduced:()=>world.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches});
let liftFloor,liftBrowseFloor=1,liftMode='floors';let forgeSelected='pickaxe',forgeBusy=false,gearPieceSelected='pickaxe',gearIndexSelected=0,gearKindSelected=1,gearClearConfirm=false;
let burstAnimation,pendingBurst=null,hitHistory=[],cardRenderKey='',offerRenderKey='',pendingCard=null,choiceScreen='';
const zagGame=new ZagGame({state:s,music,onSave:save,onUpdate:update,open:body=>openDialog('ZAG · TRILHA DA FORTUNA',body,'zag'),close:closeDialog,soft:()=>world.reduced});
const minerGame=new MinerGame({state:s,music,audioEnabled:()=>appServices.audio.controller.getState().preferences.enabled,onSave:save,onUpdate:update,open:body=>openDialog('BROCA AFK',body,'miner'),soft:()=>world.reduced,onSound:()=>$('sound').onclick(),welcome:minerWelcome});
const floorGuard=new ChoiceGuard(),returnGuard=new ChoiceGuard(),abyssGuard=new ChoiceGuard();
approvedChoices=mountApprovedExpeditionCards(document,{softMode:()=>world.reduced,onCommand:()=>bubbleUI.command()});
let abyssChoiceKey='',abyssChoiceSaved=0;
function trackChoiceInput(kind,id){if(applicationMenuOpen)return;const now=performance.now();floorGuard[kind](id,now);returnGuard[kind](id,now);abyssGuard[kind](id,now);}
document.addEventListener('pointerdown',e=>trackChoiceInput('press','p'+e.pointerId),true);
document.addEventListener('pointerup',e=>trackChoiceInput('release','p'+e.pointerId),true);
document.addEventListener('pointercancel',e=>trackChoiceInput('release','p'+e.pointerId),true);
document.addEventListener('keydown',e=>{if(applicationMenuOpen)return;if(['Space','Enter'].includes(e.code)){trackChoiceInput('press',e.code);if((s.run?.room.cleared&&!floorGuard.ready(performance.now()))||(dialogKind==='safe-return'&&!returnGuard.ready(performance.now()))){e.preventDefault();e.stopImmediatePropagation();}}},true);
document.addEventListener('keyup',e=>trackChoiceInput('release',e.code),true);
window.addEventListener('blur',()=>{if(applicationMenuOpen)return;floorGuard.held.clear();returnGuard.held.clear();abyssGuard.held.clear();if(s.run?.abyss?.cardChoice){paused=true;music.silence();update();save();}});
function guardChoices(){if(world.holeDescentPending)return;
 const ready=floorGuard.ready(performance.now()),clear=!!s.run?.room.cleared;
 if(clear){$('choiceGuard').textContent=ready?'': 'SOLTE OS CONTROLES…';$('cardOffers').querySelectorAll('button').forEach(b=>b.disabled=!ready);$('confirmCard').disabled=!ready||!pendingCard;$('descend').disabled=!ready||!s.run.cardChosen;$('floorRescue').disabled=!ready||!s.run.cardChosen;$('safeReturn').disabled=!ready||!s.run.cardChosen;}
 if($('confirmSafeReturn'))$('confirmSafeReturn').disabled=!returnGuard.ready(performance.now());approvedChoices?.focusReady();
}

const returns=new ReturnScreen({music,audioPreferences:()=>appServices.audio.controller.getState().preferences,soft:()=>world.reduced,onSave:save,onFinish:()=>{music.silence();update();save();if(missionList(s).some(m=>m.status==='ready')){showMissions();music.sfx('mission');}}});
const phaseAt=(seconds=elapsed)=>runBeatPhase(s.run,seconds);
const beatLength=()=>runRailSeconds(s.run,phaseAt());
let lobbyMusicPaused=false;
world.lobbyEnabled=true;
const expeditionHud=createExpeditionHud({document,actions:{extract:()=>extract(),completeFloor:()=>{if(blocked()||world.holeDescentPending||!completeCaveFloor(s,phaseAt()))return;processEvents();update();save();$('clearBanner').focus({preventScroll:true});},pause:()=>pause(),learn:()=>tutorial?.learning.catalog(),learningNotice:()=>!!tutorial?.learning.guideUnread,item:(id,inputEvent)=>{perform({type:'item',item:id,inputEvent});$('world').focus({preventScroll:true});}}});
const discoveryNotices=createDiscoveryNotices({document});
const levelNotice=createLevelProgressNotice({document});
const sentinelReward=createSentinelReward({document});
const caveAlerts=createCaveAlerts({document,onLayout:()=>discoveryNotices.invalidateLayout()});
const nightLobby=createRefugeLobby({document,onAction:openLobbyAction,onMusic:toggleLobbyMusic});
function toggleLobbyMusic(command='toggle'){
 if(s.run||applicationMenuOpen||returns.active)return;
 if(command!=='toggle')return;
 const playing=refugeMusic.read({refugeVisible:true,hidden}).playing;
 if(playing&&!lobbyMusicPaused){lobbyMusicPaused=true;music.silence();}
 else{lobbyMusicPaused=false;appServices.audio.controller.set({enabled:true});void appServices.audio.controller.unlock();}
 nightLobby.update(s,{visible:!s.run,balances:returns.balances(s),paused:lobbyMusicPaused});
}
function openLobbyAction(id){
 if(s.run||applicationMenuOpen||returns.active||$('dialog').open)return;
 if(id==='wardrobe'){showWardrobe();return;}
 if(id==='shop'){openDialog('LOJA','<section class="nl-collection-menu gv-r2"><h2>LOJA</h2><p>Em breve.</p><p>Novidades para suas próximas aventuras.</p></section>','shop');return;}
 if(['collection','miner','zag','well'].includes(id))return;
 visitVillage(id,true);
}
let wardrobeUi={};
function showWardrobe(tab='miner',message='',slot='hat'){
 if(s.run||applicationMenuOpen||returns.active||$('dialog').open&&dialogKind!=='wardrobe')return;
 if(tab!=='pets'){
  const profile=s;openDialog('MINERADOR','','wardrobe');
  approvedServiceCleanup=mountApprovedWardrobe($('dialog'),profile,{
   initialUi:{...wardrobeUi,...(arguments.length>=3?{category:slot}:{})},onUiState:ui=>{wardrobeUi=ui;},
   onEquip:(outfitSlot,item)=>{
    if(saveReadFailed)return {ok:false,message:'Salvamento indisponível. Visual anterior mantido.'};
    if(s!==profile||s.run||applicationMenuOpen||returns.active||!$('dialog').open||dialogKind!=='wardrobe')return {ok:false,message:'Volte ao refúgio para trocar de roupa.'};
    const draft=structuredClone(s);if(!setMinerOutfit(draft,outfitSlot,item))return {ok:false};
    try{localStorage.setItem(KEY,JSON.stringify(draft));}catch{return {ok:false,message:'Não foi possível salvar. Visual anterior preservado.'};}
    s.homeCollection.outfit=draft.homeCollection.outfit;update();return {ok:true};
   },
   onPets:()=>{closeDialog();showPets();},onNavigate:id=>{closeDialog();visitVillage(id,true);},
   onClose:closeDialog,onCommand:()=>bubbleUI.command(),softMode:()=>world.reduced
  });return;
 }
 openDialog('MINERADOR',wardrobeMarkup(s,tab,slot),'wardrobe');bindPetPreviews($('dialogBody'));$('wardrobeStatus').textContent=message;
 $('dialogBody').querySelectorAll('[data-outfit-tab]').forEach(b=>b.onclick=()=>showWardrobe('miner','',b.dataset.outfitTab));
 $('dialogBody').querySelectorAll('[data-outfit-slot]').forEach(b=>b.onclick=()=>{
  if(saveReadFailed||s.run)return;const draft=structuredClone(s);
  if(!setMinerOutfit(draft,b.dataset.outfitSlot,b.dataset.outfitItem))return;
  try{localStorage.setItem(KEY,JSON.stringify(draft));}catch{$('wardrobeStatus').textContent='Não foi possível salvar. Visual anterior preservado.';return;}
  s.homeCollection.outfit=draft.homeCollection.outfit;update();showWardrobe('miner','',b.dataset.outfitSlot);
 });
 $('dialogBody').querySelectorAll('[data-wardrobe-tab]').forEach(b=>b.onclick=()=>{if(b.dataset.wardrobeTab==='pets'){closeDialog();showPets();}else showWardrobe('miner');});
 $('dialogBody').querySelectorAll('[data-wardrobe-open]').forEach(b=>b.onclick=()=>{closeDialog();visitVillage(b.dataset.wardrobeOpen,true);});
 $('dialogBody').querySelectorAll('[data-wardrobe-pet]').forEach(b=>b.onclick=()=>{
  if(s.run||dialogKind!=='wardrobe'||!$('dialog').open)return;
  if(saveReadFailed){$('wardrobeStatus').textContent='Salvamento indisponível. Recarregue antes de equipar.';return;}
  const id=b.dataset.wardrobePet,action=petsServiceView(s).activePet===id?'remove':'equip';
  const result=commitPetAction({profile:s,action,id,persist:draft=>{localStorage.setItem(KEY,JSON.stringify(draft));return true;},install:installPetDraft,readProfile:()=>s});
  if(!result.ok){$('wardrobeStatus').textContent='Não foi possível salvar. Sua seleção anterior foi preservada.';return;}
  invalidateProgression(s);statuePresentation?.afterSave(s,true);update();music.sfx('accept');showWardrobe('pets',action==='remove'?'Companheiro desequipado.':'Companheiro equipado.');
  $('dialogBody').querySelector('[data-wardrobe-pet="'+id+'"]')?.focus({preventScroll:true});
 });
}
function updateMusicCue(){
 if(!s.run||s.run.rest?.active){$('musicCue').hidden=true;return;}
 const r=s.run,phase=phaseAt(),cue=runMusicCue(r,phase),show=!!r&&!r.room.cleared&&(cue.warning||cue.changing);
 $('musicCue').hidden=!show;
 if(show){$('musicCue').dataset.direction=cue.direction>0?'up':'down';$('musicCueLabel').textContent=cue.label;$('musicCueCount').textContent=cue.warning?cue.count:'♫';$('musicCue').dataset.pulse=phase%1<.18?'on':'off';}
 const label=Math.round(cue.bpm)+' BPM';
 if($('bpmLabel').textContent!==label){$('bpmLabel').textContent=label;$('trackTempo').textContent=label;}
 if(r){const width=actionWindowMs(s,Math.round(phase))/1000/beatLength()*50;$('perfectZone').style.height=width+'%';$('perfectZone').style.top=(75-width/2)+'%';}
}
world.setSoft(appServices.visual.getMode()==='soft');appServices.visual.subscribe(mode=>{world.setSoft(mode==='soft');effectsMode();});
function effectsMode(){approvedChoices?.cardFeel.clear();approvedChoices?.refresh(s);document.body.classList.toggle('soft-fx',world.reduced);$('effects').setAttribute('aria-pressed',String(!world.reduced));$('effects').title=world.reduced?'Efeitos suaves':'Efeitos intensos';$('effects').setAttribute('aria-label',world.reduced?'Ativar efeitos intensos':'Ativar efeitos suaves');}
effectsMode();$('effects').onclick=()=>{appServices.visual.setMode(world.reduced?'intense':'soft');toast(world.reduced?'Efeitos suaves ativados.':'Efeitos intensos ativados.');};
function celebrate(combo,nova=false){$('burstCaption').textContent=nova?'RUPTURA!':combo===50?currentRecord(s).genre+' ACESO!':comboTitle(combo);$('burstNumber').innerHTML=combo+'<span>×</span>';$('burstDetail').textContent=nova?'ONDA DE RUPTURA':'COMBO!';$('comboBurst').dataset.tier=comboTier(combo);burstAnimation?.cancel();burstAnimation=flyCombo({document,root:expeditionHud.root,container:$('stage'),source:$('comboBurst'),slot:expeditionHud.field('combo')||$('combo'),combo,reduced:world.reduced});music.milestone(combo);}

const albumLoading=()=>!!s.run?.albumEdition&&appServices.audio.controller.getState().preferences.enabled&&!expeditionMusic.ready(s.run.albumEdition);
function prepareExpeditionMusic(){
 const id=s.run?.albumEdition;if(!id||!appServices.audio.controller.getState().preferences.enabled||expeditionMusic.ready(id))return;
 if(!music.ctx){void appServices.audio.controller.unlock();return;}
 const state=expeditionMusic.getState();if(state.editionId===id&&(state.status==='loading'||state.status==='error'&&paused))return;
 void expeditionMusic.prepare(id).then(ok=>{lastFrame=performance.now();if(!ok&&s.run?.albumEdition===id){paused=true;toast('Não foi possível carregar a música. Continue para tentar novamente.');update();}});
}
const blocked=()=>albumLoading()||!!tutorial?.active||applicationMenuOpen||world.campaignLoading||paused||hidden||$('dialog').open||returns.active||!!s.run?.recovery?.active||!!s.run?.rest?.active||!!s.run?.abyss?.cardChoice;
const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
function save(){if(applicationMenuOpen)return false;if(saveReadFailed){const status=$('saved');status.textContent='SAVE NÃO CARREGADO · SESSÃO TEMPORÁRIA';status.classList.add('save-warning');return false;}if(s.run){s.run.elapsed=elapsed;s.run.clockBpm=runTrack(s.run).bpm;s.run.musicClock=2;}try{localStorage.setItem(KEY,saveSnapshot.serialize(s));}catch{const status=$('saved');status.textContent='SALVAMENTO INDISPONÍVEL';status.classList.add('save-warning');return false;}const status=$('saved');status.textContent='SALVO LOCALMENTE';status.classList.remove('save-warning');statuePresentation?.afterSave(s,true);return true;}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function feedback(t){$('message').textContent=t;feedbackTimer=elapsed+1.2;}
let finishMode=null;
function syncPausePresentation(){const cover=$('pauseCover'),wasHidden=cover.hidden;cover.hidden=!s.run||!paused||resumeFlow.active||applicationMenuOpen||!!tutorial?.active;cover.inert=cover.hidden;if(wasHidden&&!cover.hidden)$('resume')?.focus({preventScroll:true});}
function update(){const clearPresentation=!s.run||dialogKind==='lift';if(clearPresentation!==finishMode){finishMode=clearPresentation;installGlobalFinish()?.setEnabled(!clearPresentation);}syncApplicationMenuAvailability();syncPetsAccess();updatePickaxeCursor(s.level);const r=s.run;const track=runTrack(r);$('trackName').textContent=track.name;$('trackStyle').textContent=track.style;$('trackTempo').textContent=track.bpm+' BPM';$('bpmLabel').textContent=track.bpm+' BPM';$('stage').dataset.mode=r?'run':'base';nightLobby.update(s,{visible:!r&&!applicationMenuOpen,balances:returns.balances(s),paused:lobbyMusicPaused});$('villageActions').inert=world.lobbyEnabled&&!r;$('stage').dataset.tier=comboTier(r?.combo||0);const balances=returns.balances(s);$('bank').textContent=fmt(balances.bank);$('stars').textContent=fmt(s.stars);$('experienceHud').innerHTML=experienceMarkup(s);updateResourceWallet($('materialWallet'),balances.materials??s.materials);updateScoreHUD();updateMissionHUD();updateBossHUD();$('record').textContent=s.best?`${s.best*25} m`:'—';$('sceneIdentity').hidden=!r;$('sceneTitle').textContent=r?(r.room.bossFloor?BOSSES[biomeIndex(r.floor)].title:BIOMES[biomeIndex(r.floor)].name):'REFÚGIO';$('sceneEyebrow').textContent=r?`EXPEDIÇÃO ${String(s.attempts).padStart(2,'0')} · ${track.style}`:'REFÚGIO';$('locationLabel').textContent=r?'CAVERNA VIVA · '+(r.room.cleared?'ESTABILIZADA':'EM EXPLORAÇÃO'):'REFÚGIO';$('floorLabel').textContent=r?`ANDAR ${String(r.floor).padStart(2,'0')}`:'SUPERFÍCIE';for(const id of ['explorationHud','breathHud','runHud','objective','runControls','runHints','extract','itemBar','runCards'])$(id).hidden=!r;$('controlDeck').hidden=!r;$('villageActions').hidden=!!r;$('world').tabIndex=r?0:-1;$('world').setAttribute('aria-label',r?'Caverna. Clique para minerar. Espaço golpeia, WASD esquiva, Tab abre habilidades. 1, 2 e 3 usam itens a qualquer momento.':'Refúgio Mágico. Use os botões para preparar sua expedição.');if(!r)updateVillage();updateDepthLift();const wasClear=$('clearBanner').hidden;$('clearBanner').hidden=!r?.room.cleared||world.holeDescentPending;syncPausePresentation();
 $('slots').textContent=`${s.equipped.length} / 5`;$('equippedSlots').innerHTML=Array.from({length:5},(_,i)=>{const skill=SKILLS.find(k=>k.id===s.equipped[i]);return`<button class="skill-slot ${skill?'':'empty'}" aria-label="${skill?skill.name:'Espaço de habilidade vazio'}" title="${skill?skill.name+': '+skillText(s,skill.id):'Escolha uma habilidade na árvore'}">${approvedSkillSlotGlyph(skill?.id ?? null)}<span>${skill?skill.name:'LIVRE'}</span><small>${skill?'AUTO':'TAB'}</small></button>`;}).join('');$('equippedSlots').querySelectorAll('button').forEach(b=>b.onclick=()=>showTree());$('footerState').textContent=r?`FORÇA ${power(s)} · MOVIMENTO ${movement(s)} · TAB HABILIDADES`:`EXPEDIÇÕES ${s.attempts} · MELHOR SEQUÊNCIA ${s.bestCombo} · ${s.unlocked.length}/${SKILLS.length} HABILIDADES`;
 updateCardUI();updateAbyssChoice();if(wasClear&&!$('clearBanner').hidden)queueMicrotask(()=>$('clearBanner').focus({preventScroll:true}));
 if(r){$('explorationHud').hidden=!r.room.wave;if(r.room.wave){$('explorationHud').textContent=environment(r.floor).name+' · '+(cavePressure(r).stage?'PERIGO '+cavePressure(r).stage:'ONDA '+r.room.wave.number)+(terrainAt(r.room,r.player)===1?' · ÁGUA · PASSO LENTO':'');}updateItems();$('hpLabel').textContent=`${Math.ceil(r.health)} / ${maxHealth(s)}`;$('breathLabel').textContent=`${Math.ceil(r.rhythm)} / ${maxRhythm(s)}`;$('breathBar').style.width=`${r.rhythm/maxRhythm(s)*100}%`;$('breathHud').dataset.low=r.rhythm<=30;$('breathMeter').setAttribute('aria-valuenow',Math.ceil(r.rhythm));$('breathHint').textContent=r.rhythm<=30?'SEM FÔLEGO! ACERTE O PULSO':'ACERTE O PULSO';$('combo').innerHTML=`${r.combo}<span>×</span>`;$('comboHint').textContent=comboTitle(r.combo);$('railMultiplier').textContent='×'+scoreMultiplier(r.combo).toFixed(2);const nova=s.equipped.includes('fury'),threshold=furyThreshold(s),charge=Math.max(0,Math.min(threshold,r.combo-(r.novaSpent||0)*threshold));$('novaMeter').hidden=!nova;$('novaHint').hidden=!nova;$('novaFill').style.width=(charge/threshold*100)+'%';$('novaHint').textContent=charge>=threshold?'RUPTURA PRONTA · GOLPEIE':'RUPTURA · '+charge+'/'+threshold;$('charge').textContent=`${Math.min(r.room.charge,r.room.quota)} / ${r.room.quota}`;$('chargeBar').style.width=`${Math.min(100,r.room.charge/r.room.quota*100)}%`;$('goal').textContent=r.room.charge>=r.room.quota&&Math.max(r.acted,r.beat)<(r.room.minBeats||0)?'ESTABILIZANDO '+Math.round(Math.max(0,r.acted,r.beat)/r.room.minBeats*100)+'%':`${Math.min(r.combo,r.room.goal)} / ${r.room.goal}`;$('bagLabel').textContent=`MOCHILA · ${r.bag} MOEDAS · ${r.materials.reduce((a,b)=>a+b,0)} CRISTAIS`;const canDescend=r.floor<depthLimit(s)&&r.floor<TOTAL_FLOORS;$('descend').hidden=!canDescend;$('clearTitle').textContent=!r.cardChosen?'ESCOLHA UMA CARTA':r.floor===TOTAL_FLOORS?'BIOMA CONQUISTADO!':canDescend?'CONTINUAR OU VOLTAR?':'NOVO BIOMA!';$('clearSubtitle').innerHTML=!r.cardChosen?`VIDA ${Math.ceil(r.health)} / ${maxHealth(s)}`:r.floor===TOTAL_FLOORS?'Volte à base com tudo o que conquistou.':canDescend?`<span class="ui-run-fact"><small>VIDA</small><strong>${Math.ceil(r.health)} / ${maxHealth(s)}</strong></span><span class="ui-run-fact"><small>MOCHILA · MOEDAS</small><strong>${fmt(r.bag)}</strong></span><span class="ui-run-fact"><small>CRISTAIS</small><strong>${r.materials.reduce((sum,n)=>sum+n,0)}</strong></span><span class="ui-run-fact"><small>PRÓXIMO ANDAR</small><strong>${r.floor+1}</strong></span>`:`Volte à base e construa o ${SEALS[s.seals]?.name.toLowerCase()}.`;const width=windowMs(s)/1000/beatLength()*50;$('perfectZone').style.height=width+'%';$('perfectZone').style.top=(75-width/2)+'%';}updateTip();updateFrenzyHUD();const disc=currentRecord(s);$('trackName').textContent=r?.albumEdition?runTrack(r).name:disc.name;$('trackStyle').textContent=r?.albumEdition?runTrack(r).style:disc.genre;$('stage').classList.toggle('disco-on',!!r&&r.combo>=50&&!r.room.cleared);$('stage').style.setProperty('--record-accent',disc.color);expeditionHud.update({profile:s,elapsed,blocked:blocked(),tutorial:!!tutorial?.training,wallet:balances});const postChoiceView=chosenCardView(s),postChoiceDefinition=postChoiceView.status==='chosen'&&s.run?.mode!=='abyss'?CARDS.find(c=>c.id===postChoiceView.id):null;decoratePostChoiceFromState($('clearBanner'),s,postChoiceDefinition?cardDetail(postChoiceDefinition,cardCount(s.run,postChoiceDefinition.id),power(s),0,s):'');approvedChoices.refresh(s);}
function updateItems(){for(const item of ITEMS){const b=$('item-'+item.id),count=s.run?.items?.[item.id]||0,desc=item.id==='tonic'?'Recupera '+tonicHealing(s)+' de vida.':item.desc;b.querySelector('b').textContent=count;b.disabled=!count||!!s.run?.room.cleared;b.title=item.name+' · '+desc+' · '+item.source;b.setAttribute('aria-label',item.name+', '+count+' disponíveis. '+desc);}}
$('itemBar').innerHTML=ITEMS.map(i=>`<button class="item-button" id="item-${i.id}" style="color:${i.color}"><kbd>${i.key}</kbd>${approvedConsumableGlyph(i.id)}<span>${{blast:'BOMBA',tonic:'CURAR',ward:'ESCUDO'}[i.id]}</span><b>0</b></button>`).join('');for(const item of ITEMS)bindConsumableButton($('item-'+item.id),inputEvent=>{perform({type:'item',item:item.id,inputEvent});$('world').focus({preventScroll:true});});
function updateTip(){const r=s.run;const find=r&&caveFindTargets(r.room).find(n=>n.id===(hover??selected)&&visible(r.room,n));placeApprovedCaveFindTip($('targetTip'),find);if(find){const tip=approvedCaveFindTip(r,find);$('targetTip').hidden=!!r.room.cleared||!tip;$('targetTip').innerHTML=tip;return;}if(r&&(hover??selected)===HEDGEHOG_ID&&hedgehogTarget(r.room)){const status=hedgehogStatus(r),habitat=hedgehogHabitat(r.room);$('targetTip').hidden=!!r.room.cleared;$('targetTip').innerHTML='<strong>OURIÇO</strong><span>'+({ready:'BATA PARA BROTAR',cooldown:'DESCANSANDO',rest:'DESCANSANDO',full:'SEM ESPAÇO'}[status])+'</span>'+(habitat?'<small>'+habitat.summary+'</small>':'');return;}const n=r?[...r.room.nodes,...r.room.enemies,...r.room.rocks,...rootTargets(r.room),...mysticTargets(r.room)].find(n=>n.id===(hover??selected)&&n.hp>0&&visible(r.room,n)):null;$('targetTip').hidden=!n||rootTarget(n)||!!r?.room.cleared;if(crownActive(n)){$('targetTip').innerHTML='<strong>REI GEODO</strong><span>'+crownCaption(n,Math.max(r.acted,r.beat))+'</span>';return;}if(mysticActive(n)||mysticCopy(n)){$('targetTip').innerHTML='<strong>BOSS MÍSTICO</strong><span>'+mysticCaption(r.room.enemies.find(mysticActive),Math.max(r.acted,r.beat))+'</span>';return;}if(n?.miniboss){$('targetTip').hidden=true;return;}if(n?.summon!==undefined&&r.room.enemies.some(b=>b.id===n.summon&&micelialActive(b))){$('targetTip').innerHTML='<strong>NÚCLEO</strong><span>'+Math.ceil(n.hp)+' / '+Math.ceil(n.maxHp)+'</span>';return;}if(n){const rock=n.type==='rock',crystal=n.type==='crystal',d=n.boss?BOSSES[n.bossIndex]:rock?ROCKS[n.kind]:crystal?CRYSTALS[n.kind]:creatureFor(r.floor,n.kind);$('targetTip').innerHTML=`<strong style="color:${d.color||'#c5cddb'}">${n.rabbitChild!==undefined?'FILHOTE':n.summon!==undefined?'NÚCLEO MICELIAL':n.rare?'VEIO RARO':d.name}</strong><span>${n.rabbitChild!==undefined?n.stunned?'TONTO ✦':'ACERTE A CABEÇA':`<b>${Math.ceil(n.hp)}/${Math.ceil(n.maxHp)}</b> · ${n.bossIndex===6&&r.beat>n.exposedUntil?'ACERTE OS 3 FILHOTES':n.bossIndex===4?'INTANGÍVEL · QUEBRE OS NÚCLEOS':n.bossIndex===5&&n.windup?'SUBMERSO · DESVIE':n.summon!==undefined?'QUEBRE PARA FERIR O CHEFE':rock?'QUEBRE PARA PASSAR':crystal?(n.rare?'BATA E COLETE':'+'+crystalValue(s,n)+' CRISTAIS'):n.windup?'⚠ DESVIE!':'⚒ ATAQUE'}`}</span>`;}}

function chooseNext(){const r=s.run;if(!r)return;const options=[...r.room.nodes,...r.room.enemies,...rootTargets(r.room),...mysticTargets(r.room),...caveFindTargets(r.room)].filter(n=>n.hp>0&&n.bossIndex!==4&&!(n.bossIndex===5&&n.windup)&&!(n.bossIndex===6&&r.beat>n.exposedUntil)&&!(n.rabbitChild!==undefined&&n.stunned)&&visible(s.run.room,n)).sort((a,b)=>distance(a,r.player)-distance(b,r.player));selected=options[0]?.id??null;}
function processEvents(){const r=s.run;if(!r)return;const events=r.events.splice(0);if(events.some(e=>e.type==="mysticAppear"))selected=null;caveAlerts.accept(events,r);discoveryNotices.accept(events,s);levelNotice.accept(events,s);sentinelReward.accept(events,s);processFrenzyEvents(events);tutorial?.events(events);world.consume(worldSentinelEvents(events,r));if(events.some(e=>e.type==='clear')&&usesStairs(r))world.beginHoleDescent(r);music.events(events);crownAudio.consume(events);if(events.some(e=>e.type==='nova'||e.type==='bossDefeated'))music.boom(true);else if(events.some(e=>['wave','bomb'].includes(e.type)))music.boom(false);for(const e of events){if(e.type==='cavePressureWarning')music.sfx('warning');if(e.type==='cavePressure')music.sfx('warning');if(e.type==='minibossNearby')music.sfx('warning');if(e.type==='minibossDefeated')music.sfx('claim');if(e.type==='horde')music.boom(false);if(e.type==='levelUp')music.reward();if(e.type==='bossWarning')feedback(e.hint);if(e.type==='bossOpen')feedback('ATAQUE AGORA!');if(e.type==='bossDefeated'){music.boom(true);toast('CHEFE DERROTADO!');}if(e.type==='missionReady'){toast('MISSÃO PRONTA · RECEBA NO REFÚGIO');}if(e.type==='missionExpired')toast('MISSÃO EXPIRADA');if(e.type==='recordDrop')music.sfx('recordDrop');if(e.type==='star')celebrateStar(e.number);if(e.type==='proc'){showProc(e);}if(e.type==='perfect'){hitHistory.push(true);hitHistory=hitHistory.slice(-8);drawHitHistory();}if(e.type==='hurt'){hitHistory.push(false);hitHistory=hitHistory.slice(-8);drawHitHistory();}if(e.type==='perfect'){expeditionHud.confirmHit(e.combo);pulseCombo(expeditionHud.root,e.combo,world.reduced);$('timing').textContent=`NO PULSO · sequência ${e.combo}`;if(!r.room.bossFloor)feedback('PERFEITO!');music.hit(true);if(!world.reduced)$('combo').animate([{transform:'scale(1.22)',filter:'brightness(1.7)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:240});if(e.combo%5===0)pendingBurst={combo:e.combo,at:runBeatTime(r,r.acted)};}if(e.type==='hurt'){if(e.reason!=='attack')flashBreath();feedback(e.reason==='idle'?'MOVA OU GOLPEIE!':e.reason==='attack'?`ATINGIDO · −${e.amount}`:`FÔLEGO −${e.amount}`);$('timing').textContent=e.reason==='silence'?'VOLTE AO PULSO':'TENTE NO PULSO';}if(e.type==='clear'&&!world.holeDescentPending){music.reward();feedback(usesStairs(r)?r.room.stairDeparted?'DESCENDO!':'ANDAR CONCLUÍDO!':'ELEVADOR PRONTO!');}if(e.type==='nova'){pendingBurst={combo:r.combo,nova:true,at:runBeatTime(r,r.acted)};feedback('RUPTURA!');}if(e.type==='item'){const item=ITEMS.find(i=>i.id===e.item);feedback('+'+e.amount+' '+item.name.toUpperCase());if(!world.reduced)$('item-'+e.item).animate([{transform:'scale(1.3)',filter:'brightness(2)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:300});}if(e.type==='revive')toast('NOVA CHANCE!');if(e.type==='recovery'){music.silence();showRest();}}}
function protectRhythm(gap){if(gap<=.5||!s.run||blocked()||s.run.room.cleared)return false;paused=true;music.silence();$('pauseTitle').textContent='VAMOS CONTINUAR?';$('pauseText').textContent='COMBO PRESERVADO';update();save();return true;}
function perform(action){if(protectRhythm((performance.now()-lastFrame)/1000))return;if(!s.run||blocked()||s.run.room.cleared)return;const result=act(s,action,phaseAt(elapsed+(performance.now()-lastFrame)/1000));if(result.intangible)feedback(result.mystic?'CABEÇA INTANGÍVEL · DESVIE':result.buried?'SUBMERSO · DESVIE!':'QUEBRE OS NÚCLEOS!');if(!s.run){onReturn();return;}processEvents();if(!(selected===HEDGEHOG_ID&&hedgehogTarget(s.run.room))&&![...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks,...rootTargets(s.run.room),...mysticTargets(s.run.room),...caveFindTargets(s.run.room)].some(n=>n.id===selected&&n.hp>0&&visible(s.run.room,n)))chooseNext();update();save();}
function begin(mode='floors',floor=1){resumeFlow.cancel();resumeView.render(0);clearResumeRhythm(s.run);approvedChoices.cardFeel.clear();hitHistory=[];drawHitHistory();cardRenderKey='';offerRenderKey='';pendingBurst=null;burstAnimation?.cancel();closeDialog();if(!startRun(s,mode,floor))return;elapsed=0;paused=false;selected=null;chooseNext();world.place(s);music.silence();feedback('PREPARE-SE!');music.sfx('descend');update();save();$('world').focus({preventScroll:true});$('scoreHud').scrollIntoView({block:'start',behavior:'instant'});}
function onReturn(){resumeFlow.cancel();resumeView.render(0);discoveryNotices.accept(s.lastResult?.petEvents||[],s);document.querySelectorAll('.star-flight').forEach(n=>n.remove());pendingBurst=null;burstAnimation?.cancel();paused=false;elapsed=0;selected=null;hover=null;feedback('');music.silence();world.place(s);showResult();update();save();music.sfx(s.lastResult?.reason==='death'?'death':'ascend');}
function returnSafe(){if(world.holeDescentPending)return;
 if(!s.run?.room.cleared||!s.run.cardChosen||!floorGuard.ready(performance.now()))return;
 returnGuard.lock(performance.now(),750);
 openDialog('VOLTAR À BASE','','safe-return');
 dialogOpener=$('safeReturn');approvedServiceCleanup=approvedChoices.mountSafeReturn($('dialog'),s);
 $('stayInMine').onclick=closeDialog;
 $('confirmSafeReturn').onclick=()=>{if(!returnGuard.ready(performance.now())||!s.run?.room.cleared)return;finishRun(s,s.run.floor===TOTAL_FLOORS?'victory':'return');closeDialog();onReturn();};
 $('stayInMine').focus();
}
function nextFloor(){if(world.holeDescentPending||!floorGuard.ready(performance.now()))return;if(campNeeded(s)&&enterCamp(s)){save();showRest();return;}const cardId=s.run?.cardChosenId,cardVisual=approvedChoices.cardFeel.captureChosen(cardId);if(descend(s)){approvedChoices.cardFeel.clear();hitHistory=[];drawHitHistory();offerRenderKey='';burstAnimation?.cancel();pendingBurst=null;elapsed=0;selected=null;chooseNext();music.silence();world.place(s);processEvents();music.sfx('descend');feedback(s.run.room.bossFloor?BOSSES[biomeIndex(s.run.floor)].name:`ANDAR ${s.run.floor}!`);update();save();if(cardId)approvedChoices.cardFeel.depart(cardId,cardVisual);$('world').focus({preventScroll:true});$('scoreHud').scrollIntoView({block:'start',behavior:'instant'});}}
function extract(){
 if(!s.run)return;if(s.run.room.cleared){returnSafe();return;}
 openDialog('RETIRADA DE EMERGÊNCIA','','retreat');
 approvedServiceCleanup=mountApprovedWithdrawal($('dialog'),s,{onCancel:closeDialog,onConfirm:()=>{if(!s.run||s.run.room.cleared||!finishRun(s,'retreat'))return;closeDialog();onReturn();}});
}
let dialogOpener=null;
let approvedServiceCleanup=null;
function openDialog(label,body,kind=''){
 approvedServiceCleanup?.();approvedServiceCleanup=null;
 if(!s.run)world.cancelRefugeMovement();
 const dialog=$('dialog'),refresh=dialog.open&&kind===dialogKind,focus=refresh?captureControlFocus(dialog):null,keepUpgrade=refresh&&!!dialog.querySelector('.building-upgrade[open]');
 if(!dialog.open)dialogOpener=document.activeElement;
 if(!dialog.open||kind!==dialogKind||!['zag','records'].includes(kind))music.silence(kind!=='tree');
 dialog.inert=false;dialog.dataset.service=kind;dialogKind=kind;if(kind==='lift'){finishMode=true;installGlobalFinish()?.setEnabled(false);}if(kind!=='forge')releaseForgePresentation(dialog);if(kind!=='stars')releaseReliquaryPresentation(dialog);$('dialogLabel').textContent=label;
 for(const [type,className]of Object.entries({zag:'zag-dialog',missions:'missions-dialog',tree:'tree-dialog',forge:'forge-dialog',lift:'map-dialog',stars:'relic-dialog',records:'records-dialog',miner:'miner-dialog',statue:'statue-dialog',pets:'pets-dialog',wardrobe:'wardrobe-dialog',shop:'shop-dialog',collection:'collection-dialog'}))dialog.classList.toggle(className,kind===type);
 const approvedService=['tree','forge','records','stars','missions'].includes(kind)||(['wardrobe','pets','rest','retreat','safe-return','statue','lift','help'].includes(kind)&&body==='');
 dialog.classList.toggle('approved-ui-dialog',approvedService);
 $('dialogBody').innerHTML=body;if(!approvedService)applyDialogUI(dialog,kind);else cancelDialogUI(dialog);
 if(keepUpgrade){const upgrade=dialog.querySelector('.building-upgrade');if(upgrade)upgrade.open=true;}
 if(!dialog.open)dialog.showModal();queueMicrotask(()=>{if(dialog.open&&dialogKind===kind)tutorial?.opened(kind);});
 if(focus)queueMicrotask(()=>{if(dialog.open&&dialogKind===kind&&(!document.activeElement||document.activeElement===document.body||document.activeElement===dialog))restoreControlFocus(dialog,focus);});
}
function closeDialog(){approvedServiceCleanup?.();approvedServiceCleanup=null;cancelDialogUI($('dialog'));if(dialogKind==='miner')minerGame.leave();if(dialogKind==='zag')zagGame.leave();if(dialogKind==='records')stopRecordPreview();$('dialog').inert=true;if($('dialog').open)$('dialog').close();}
$('close').onclick=closeDialog;$('dialog').addEventListener('cancel',e=>{if(dialogKind==='zag'){e.preventDefault();closeDialog();}});$('dialog').addEventListener('close',()=>{if($('dialog').open)return;$('dialog').inert=true;if(dialogKind==='tree')treeSound.setOpen(false);approvedServiceCleanup?.();approvedServiceCleanup=null;if(dialogKind==='miner')minerGame.leave();if(dialogKind==='zag')zagGame.leave();if(dialogKind==='records')stopRecordPreview();const returnToPets=dialogKind==='pets';$('dialogBody').replaceChildren();dialogKind='';lastFrame=performance.now();syncPetsAccess();restoreDialogOpener(dialogOpener,returnToPets&&petsHostEligible()?$('openPets'):$('world'));dialogOpener=null;});
function showResult(){if(s.lastResult&&!s.lastResult.presented)returns.show(s);}
const talentView=new TalentView();
function showTree(id=skillSelected){
 if(returns.active)return;skillSelected=id;
 openDialog('ÁRVORE DOS ECOS','','tree');
 approvedServiceCleanup=mountApprovedTree($('dialog'),s,{initialId:id,onSelect:selected=>{skillSelected=selected;},onChange:()=>{save();update();},onFeedback:(kind,detail)=>treeSound.emit(kind,detail),onClose:closeDialog,softMode:()=>world.reduced});
 treeSound.setOpen(true);
}
function bindBuilding(refresh){$('dialogBody').querySelectorAll('[data-building]').forEach(b=>{b.disabled=b.disabled||forgeBusy;b.onclick=()=>{if(!forgeBusy&&upgradeBuilding(s,b.dataset.building)){save();update();music.sfx('claim');refresh();confirmButtonResult(document,'building');toast('CONSTRUÇÃO MELHORADA!');}};});}
function showForge(id=forgeSelected){
 if(s.run||returns.active)return;forgeSelected=normalizeForgeProjectId(id);
 openDialog('FORJA','','forge');
 approvedServiceCleanup=mountApprovedForge($('dialog'),s,{initialId:forgeSelected,onSelect:selected=>{forgeSelected=selected;},onChange:kind=>{save();update();if(kind==='craft')music.forge(performance.now()/1000);else if(kind==='building')music.sfx('claim');else music.loot(1);},onClose:closeDialog,beforeAction:()=>tutorial?.controller.view().active&&tutorial.controller.view().step==='purchase'&&tutorial.purchase(),softMode:()=>world.reduced});
 tutorial?.opened('forge');
}
// Retained renderer for historical equipment/gear consumers; domain data is untouched.
function showForgeLegacy(id=forgeSelected){
 if(s.run||returns.active)return;
 forgeSelected=normalizeForgeProjectId(id);
 if(s.forge.gear.pending){gearPieceSelected=s.forge.gear.pending.piece;gearIndexSelected=s.forge.gear.pending.index;gearKindSelected=s.forge.gear.pending.kind;}
 const presentation=renderForgePresentation(s,forgeSelected,{forgeMarkup,coreCost,upgradeCost,maxHealth,power},forgeBusy);
 openDialog('FORJA DO REFÚGIO',presentation.html,'forge');
 $('dialogBody').querySelectorAll('[data-forge]').forEach(b=>b.onclick=()=>{if(!forgeBusy){gearClearConfirm=false;showForge(b.dataset.forge);}});
 if($('forgeAction'))$('forgeAction').onclick=workForge;bindBuilding(()=>showForge(forgeSelected));
 decorateForge($('dialog'),{assetBase:'assets/forge-v6',portraitSrc:null});$('dialogLabel').textContent='FORJA';
 tutorial?.opened('forge');
 $('dialogBody').querySelectorAll('[data-gear-piece]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearPieceSelected=b.dataset.gearPiece;gearIndexSelected=0;gearKindSelected=GEAR_ITEMS.find(x=>x.id===gearPieceSelected).colors[0];gearClearConfirm=false;showForge('armor');});
 $('dialogBody').querySelectorAll('[data-gear-slot]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearIndexSelected=Number(b.dataset.gearSlot);gearClearConfirm=false;showForge('armor');});
 $('dialogBody').querySelectorAll('[data-gear-kind]').forEach(b=>b.onclick=()=>{if(s.forge.gear.pending)return;gearKindSelected=Number(b.dataset.gearKind);gearClearConfirm=false;showForge('armor');});
 if($('gearRoll'))$('gearRoll').onclick=()=>{if(!rollGear(s,gearPieceSelected,gearIndexSelected,gearKindSelected))return;gearClearConfirm=false;save();update();music.sfx('claim');showForge('armor');};
 $('dialogBody').querySelectorAll('[data-gear-offer]').forEach(b=>b.onclick=()=>{const option=Number(b.dataset.gearOffer),rare=s.forge.gear.pending?.options[option]?.rank>1;if(chooseGearTrait(s,option)){save();update();showForge('armor');if(rare){music.reward();toast('ATRIBUTO RARO!');}else music.sfx('claim');}});
 if($('gearKeep'))$('gearKeep').onclick=()=>{if(discardGearRoll(s)){save();update();showForge('armor');}};
 if($('gearUpgrade'))$('gearUpgrade').onclick=()=>{const result=upgradeGearTrait(s,gearPieceSelected,gearIndexSelected);if(!result)return;save();update();showForge('armor');if(result.success){music.reward();toast(result.critical?'APRIMORAMENTO CRÍTICO!':'ATRIBUTO APRIMORADO!');}else{music.sfx('ui');toast('SEM AUMENTO');}};
 if($('gearClear'))$('gearClear').onclick=()=>{if(!gearClearConfirm){gearClearConfirm=true;showForge('armor');return;}if(clearGearTrait(s,gearPieceSelected,gearIndexSelected)){gearClearConfirm=false;save();update();music.sfx('ui');showForge('armor');}};
}
function workForge(event){
 if(forgeBusy||s.run||dialogKind!=='forge'||event?.detail>1)return;
 if(tutorial?.controller.view().active&&tutorial.controller.view().step==='purchase'&&tutorial.purchase())return;
 const id=forgeSelected,p=['pickaxe','vigor'].includes(id)?null:forgeProject(s,id),build=['pickaxe','vigor'].includes(id)||p?.ready;
 const before={bank:s.bank,materials:[...s.materials]};let done;
 // Lock only the synchronous transaction. Cosmetic feedback never delays input.
 forgeBusy=true;
 try{
  if(id==='pickaxe')done=purchaseUpgrade(s);else if(id==='vigor')done=purchaseCore(s);
  else if(p?.ready)done=craftForge(s,id);
  else if(p)done=depositForge(s,id,forgeDepositAmount(s,p))>0;
  if(!done)return;
  save();update();
 }finally{forgeBusy=false;}
 showForge(id);
 const scene=$('forgeScene'),result=$('forgeCelebration');
 scene?.classList.add(build?'forge-crafting':'forge-feeding');
 const detail=build?(p?p.reward(p.level+1):id==='vigor'?'VIDA MÁXIMA · '+maxHealth(s):'PICARETA · NÍVEL '+s.level):'Depositado: '+fmt(before.bank-s.bank)+' moedas · '+fmt(before.materials.reduce((total,n,i)=>total+n-s.materials[i],0))+' cristais';
 showCommandResult(scene,(build?'✓ MELHORIA APLICADA · ':'✓ ')+detail);
 if(build){
  music.forge(performance.now()/1000);
  result.classList.add('show');result.innerHTML=approvedForgeFeedbackGlyph(id)+'<strong>FORJADO!</strong><span>'+detail+'</span>';
  setTimeout(()=>{result.classList.remove('show');scene?.classList.remove('forge-crafting');},1200);
 }else{music.loot(1);setTimeout(()=>scene?.classList.remove('forge-feeding'),450);}
}
let recordFilter='TODOS',recordSelected=null,recordPreviewId=null,recordPreviewTimer=null,recordPreviewEpoch=0,recordsUI=null;
function stopRecordPreview(complete=false){
 recordPreviewEpoch++;if(recordPreviewTimer!==null)clearTimeout(recordPreviewTimer);recordPreviewTimer=null;recordPreviewId=null;music.stopPreview();recordsUI?.setPreview(null,complete);
}
function showRecords(filter=recordFilter){
 if(s.run||returns.active)return;recordFilter=filter;
 openDialog('VITROLA','','records');
 recordsUI=mountApprovedRecords($('dialog'),s,{
  initialId:recordSelected||activeCatalogItem(s).id,initialFilter:recordFilter,softMode:()=>world.reduced,
  onSelect:id=>{stopRecordPreview();recordSelected=id;},
  onFilter:value=>{stopRecordPreview();recordFilter=value;},
  onPreview:async id=>{
   if(recordPreviewId===id){stopRecordPreview();return;}
   stopRecordPreview();const request=recordPreviewEpoch;
   if(!appServices.audio.controller.getState().preferences.enabled){toast('Ative o som nas Configurações para ouvir a prévia.');return;}
   recordPreviewId=id;recordsUI.setPreview(id,null,'loading');
   let unlockTimer,unlocked=appServices.audio.controller.getState().ready;
   try{if(!unlocked)unlocked=await Promise.race([appServices.audio.controller.unlock(),new Promise(resolve=>{unlockTimer=setTimeout(()=>resolve(false),4000);})]);}catch{unlocked=false;}finally{clearTimeout(unlockTimer);}
   if(request!==recordPreviewEpoch)return;
   if(!unlocked){stopRecordPreview();toast('Toque em Ouvir novamente para ativar o áudio.');return;}
   if(request!==recordPreviewEpoch||dialogKind!=='records'||!recordsUI||document.hidden||s.run||returns.active||!appServices.audio.controller.getState().preferences.enabled)return;
   try{if(!music.previewRecord(id)){stopRecordPreview();toast('Não foi possível iniciar a prévia. Tente novamente.');return;}}catch{stopRecordPreview();toast('Não foi possível iniciar a prévia. Tente novamente.');return;}
   recordPreviewId=id;const started=music.ctx.currentTime;
   recordsUI.setPreview(id,()=>Math.max(0,music.ctx.currentTime-started));
   recordPreviewTimer=setTimeout(()=>stopRecordPreview(true),5000);
  },
  onApply:id=>{
   if(s.run||returns.active)return false;
   const owned=s.records.owned.includes(id);
   if(!(owned?equipRecord(s,id):buyRecord(s,id)))return false;
   stopRecordPreview();music.setRecord(id);save();update();music.sfx(owned?'recordEquip':'recordBuy');
   toast((owned?'SELECIONADO · ':'DISCO NOVO · ')+RECORDS.find(r=>r.id===id).name);return true;
  },onApplyAlbum:(id,edition)=>{
   if(returns.active||!equipAlbumEdition(s,edition))return false;
   stopRecordPreview();save();update();music.sfx('recordEquip');toast('MÚSICA SELECIONADA PARA JOGAR');return true;
  },onBuyAlbum:(id,edition)=>{
   if(s.run||returns.active||!buyAlbum(s,id))return false;
   equipAlbumEdition(s,edition);stopRecordPreview();save();update();music.sfx('recordBuy');toast('ÁLBUM ADQUIRIDO · SELECIONADO PARA JOGAR');return true;
  },onClose:closeDialog
 });
 approvedServiceCleanup=()=>{recordsUI?.dispose();recordsUI=null;stopRecordPreview();};
}

let approvedLiftUi={};
function showLift(mode=liftMode){
 if(s.run||returns.active)return;const changed=mode!==liftMode;liftMode=mode;if(changed)approvedLiftUi={};
 openDialog('ELEVADOR','','lift');
 const training=!!tutorial?.controller.view().active&&['lift','liftIntro'].includes(tutorial.controller.view().step);
 approvedServiceCleanup=mountApprovedLift($('dialog'),{getProfile:()=>s,selected:liftBrowseFloor,initialMode:liftMode,ui:approvedLiftUi,onSelect:floor=>{liftBrowseFloor=floor;},onMode:mode=>{liftMode=mode;},onClose:closeDialog,training,guideUnread:!!tutorial?.learning.guideUnread,onGuide:mode=>tutorial?.learning.briefing(mode),onTraining:()=>tutorial.departTraining(),onAction:(action,value)=>{
  if(s.run||returns.active||!$('dialog').open||dialogKind!=='lift')return false;
  if(action==='depart'){begin('floors',value);return true;}
  if(action==='abyss'){if(!canEnterAbyss(s))return false;begin('abyss');return true;}
  const wasOpen=canEnterAbyss(s),result=action==='gate'?depositGate(s,value):action==='stop'?unlockStop(s,value):action==='seal'?purchaseSeal(s):false;
  if(!result)return false;save();update();music.sfx(action==='gate'?(canEnterAbyss(s)&&!wasOpen?'claim':'crystal'):'claim');if(action==='seal')toast('NOVO BIOMA ABERTO!');if(action==='gate'&&!wasOpen&&canEnterAbyss(s))toast('ABISMO LIBERADO!');return result;
 }});
 if(training)tutorial.opened('lift');
}
function showLiftLegacy(mode=liftMode){
 if(s.run||returns.active)return;
 const sameMode=mode===liftMode;liftMode=mode;
 const openPanels=dialogKind==='lift'&&sameMode?[...$('dialogBody').querySelectorAll('details[id][open]')].map(d=>d.id):[],scrollTop=dialogKind==='lift'&&sameMode?(($('dialogBody').querySelector('.gv-v2-abyss')||$('dialogBody').querySelector('.gv-v2-scroll'))?.scrollTop||0):0;
 const biomeScrollLeft=dialogKind==='lift'?($('dialogBody').querySelector('.gv-v2-biome-track')?.scrollLeft||0):0;
 openDialog('ELEVADOR',liftScreenMarkup(s,liftBrowseFloor,liftMode),'lift');
 if(tutorial?.controller.view().active&&['lift','liftIntro'].includes(tutorial.controller.view().step)){tutorial.opened('lift');$('dialogBody').querySelectorAll('[data-depart]').forEach(b=>b.onclick=()=>tutorial.departTraining());return;}
 for(const id of openPanels)if($(id))$(id).open=true;($('dialogBody').querySelector('.gv-v2-abyss')||$('dialogBody').querySelector('.gv-v2-scroll')).scrollTop=scrollTop;
 const biomeNav=$('dialogBody').querySelector('.gv-v2-biome-track');if(biomeNav)biomeNav.scrollLeft=biomeScrollLeft;
 if($('floorRecords'))$('floorRecords').onclick=()=>{openDialog('DESEMPENHO POR ANDAR',floorRecordsMarkup(s),'floor-records');$('backToLift').onclick=()=>showLift('floors');};
 if($('buySeal'))$('buySeal').onclick=()=>{if(purchaseSeal(s)){liftBrowseFloor=s.seals*FLOORS_PER_BIOME+1;save();update();showLift();confirmButtonResult(document,'craft');music.sfx('claim');toast('NOVO BIOMA ABERTO!');}};
 $('dialogBody').querySelectorAll('[data-lift-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.liftMode;showLift(mode);$('dialogBody').querySelector('[data-lift-mode="'+mode+'"]')?.focus({preventScroll:true});});
 bindLiftNavigation($('dialogBody'),(floor,selector)=>{liftBrowseFloor=floor;showLift();const button=$('dialogBody').querySelector(selector);button?.focus({preventScroll:true});button?.scrollIntoView({block:'nearest',inline:'nearest'});});
 if($('abyssStart'))$('abyssStart').onclick=()=>{if(canEnterAbyss(s))begin('abyss');};
 $('dialogBody').querySelectorAll('[data-gate]').forEach(b=>b.onclick=()=>{const open=canEnterAbyss(s),paid=depositGate(s,Number(b.dataset.gate));if(paid){save();update();showLift();confirmButtonResult(document,'deposit');music.sfx(canEnterAbyss(s)&&!open?'claim':'crystal');$('dialogBody').querySelector('.gv-v2-survival-art .r2-gate-hero, .gate-art').animate(world.reduced?[{opacity:.6},{opacity:1}]:[{filter:'brightness(2)',transform:'scale(1.06)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:450});if(canEnterAbyss(s)&&!open)toast('ABISMO LIBERADO!');}});
 $('dialogBody').querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>{const floor=Number(b.dataset.stop);if(unlockStop(s,floor)){liftBrowseFloor=floor;save();update();showLift();confirmButtonResult(document,'craft');$('dialogBody').querySelector('[data-depart="'+floor+'"]')?.focus({preventScroll:true});music.sfx('claim');toast('PARADA '+floorAddress(floor).code+' ATIVADA!');}});
 $('dialogBody').querySelectorAll('[data-depart]').forEach(b=>b.onclick=()=>begin('floors',Number(b.dataset.depart)));
}
function showHelp(){
 openDialog('COMO JOGAR','','help');
 approvedServiceCleanup=mountApprovedHelp($('dialog'),{onClose:closeDialog,softMode:()=>world.reduced});
}

export function canResumeFromSettings(){return !!s.run&&!s.run.room.cleared&&!s.run.recovery?.active&&!s.run.rest?.active&&!s.run.abyss?.cardChoice;}
function requestResume(){if(!canResumeFromSettings()||applicationMenuOpen||$('dialog').open||hidden)return false;void appServices.audio.controller.unlock();tutorial?.learning?.suspendForGameplay?.();paused=true;resumeFlow.start(performance.now(),s.run);music.silence();lastFrame=performance.now();update();resumeView.render(3);$('world').focus({preventScroll:true});return true;}
function pause(){if(!s.run)return;if(paused&&!resumeFlow.active){requestResume();return;}resumeFlow.cancel();clearResumeRhythm(s.run);resumeView.render(0);paused=true;music.silence();$('pauseTitle').textContent='PAUSA';$('pauseText').textContent='';update();}
function advanceResume(now){const was=resumeFlow.active;const done=resumeFlow.frame(now,{run:s.run,interrupted:hidden||applicationMenuOpen||!canResumeFromSettings()||$('dialog').open,waiting:albumLoading()||world.campaignLoading});if(done){paused=false;lastFrame=now;const phase=phaseAt();beginResumeRhythm(s.run,phase,Math.max(phase+3,phaseAt(elapsed+2)));update();}else if(was&&!resumeFlow.active){paused=!!s.run;update();}resumeView.render(resumeFlow.number,applicationMenuOpen||paused?0:resumeRhythmRemaining(s.run,phaseAt()));} 
$('descend').onclick=nextFloor;$('safeReturn').onclick=returnSafe;$('extract').onclick=extract;$('inspectSkills').onclick=()=>showTree();$('help').onclick=showHelp;$('pause').onclick=pause;$('resume').onclick=requestResume;
$('sound').onclick=()=>{const controller=appServices.audio.controller,next=!controller.getState().preferences.enabled;controller.set({enabled:next});if(next)void controller.unlock();else if(recordPreviewId){stopRecordPreview();}};
function syncSound(state){const on=state.preferences.enabled;$('sound').innerHTML='♫ <span>Som '+(on?'ligado':'desligado')+'</span>';$('sound').setAttribute('aria-label',on?'Desativar som':'Ativar som');$('sound').setAttribute('aria-pressed',String(on));}
appServices.audio.subscribe(syncSound);syncSound(appServices.audio.controller.getState());
$('fullscreen').onclick=async()=>{try{await getDisplayModeController().toggle();}catch{toast('Não foi possível mudar a tela. Confira Configurações → Vídeo.');}};
function showZag(){if(!s.run&&!returns.active)zagGame.open();}
function showStatue(){if(s.run||returns.active||$('dialog').open)return;openDialog('PONTUAÇÃO','','statue');approvedServiceCleanup=mountApprovedStatue($('dialog'),accountScoreView(s),{onClose:closeDialog});}
function petsHostEligible(){return petsAccessAllowed({run:!!s.run,menu:applicationMenuOpen,returning:returns.active,tutorial:!!tutorial?.controller?.view().active,dialogOpen:$('dialog').open,dialogKind});}
function syncPetsAccess(){const button=$('openPets');if(!button)return;button.hidden=!!s.run||applicationMenuOpen||returns.active;button.disabled=!petsHostEligible();}
function installPetDraft(draft){
 const previous=s;try{s=draft;minerGame.s=draft;zagGame.state=draft;return s===draft&&minerGame.s===draft&&zagGame.state===draft;}
 catch{s=previous;minerGame.s=previous;zagGame.state=previous;return false;}
}
let petsUi={};
function showPets(options={}){
 if(!petsHostEligible())return;
 if(!options.legacy){
  openDialog('PETS','','pets');
  approvedServiceCleanup=mountApprovedPets($('dialog'),{
   getProfile:()=>s,initialUi:petsUi,onUiState:ui=>{petsUi=ui;},readOnly:()=>saveReadFailed,
   onAction:(action,id)=>{
    if(!petsHostEligible()||!$('dialog').open||dialogKind!=='pets')return {ok:false,message:'Volte ao refúgio para cuidar dos pets.'};
    if(saveReadFailed)return {ok:false,message:'Salvamento indisponível. Recarregue.'};
    const result=commitPetAction({profile:s,action,id,persist:draft=>{localStorage.setItem(KEY,JSON.stringify(draft));return true;},install:installPetDraft,readProfile:()=>s});
    if(!result.ok){if(result.persisted)saveReadFailed=true;return {ok:false,message:result.persisted?'Recarregue para confirmar seus dados.':'Não foi possível salvar. Sua seleção anterior foi preservada.'};}
    invalidateProgression(s);statuePresentation?.afterSave(s,true);update();music.sfx('accept');return {ok:true};
   },onClose:closeDialog,onCommand:()=>bubbleUI.command(),softMode:()=>world.reduced
  });return;
 }
 const view=petsServiceView(s);openDialog('PETS',petsMarkup(s),'pets');bindPetsSelection($('dialogBody'),{reset:!options.focusKey});bindPetPreviews($('dialogBody'));
 if($('petsStatus'))$('petsStatus').textContent=saveReadFailed?'Salvamento indisponível. Recarregue.':options.message||'';
 const act=(action,id,focusKey)=>{
  if(!petsHostEligible()||!$('dialog').open||dialogKind!=='pets')return;
  if(saveReadFailed){if($('petsStatus'))$('petsStatus').textContent='Salvamento indisponível. Recarregue.';return;}
  if(action==='equip'&&petsServiceView(s).activePet===id)action='remove';
  const result=commitPetAction({profile:s,action,id,persist:draft=>{localStorage.setItem(KEY,JSON.stringify(draft));return true;},install:installPetDraft,readProfile:()=>s});
  if(!result.ok){if(result.persisted)saveReadFailed=true;if($('petsStatus'))$('petsStatus').textContent=result.persisted?'Recarregue para confirmar seus dados.':'Não foi possível salvar. Nada foi confirmado.';return;}
  invalidateProgression(s);statuePresentation?.afterSave(s,true);update();music.sfx('accept');
  showPets({message:action==='care'?'CARINHO FEITO':action==='remove'?'DESEQUIPADO':'EQUIPADO',focusKey});
 };
 if(view.supported){$('dialogBody').querySelectorAll('[data-pet-equip]').forEach(b=>b.onclick=()=>{if(!b.disabled)act('equip',b.dataset.petEquip,b.dataset.petActionKey);});$('dialogBody').querySelectorAll('[data-pet-care]').forEach(b=>b.onclick=()=>{if(!b.disabled)act('care',b.dataset.petCare,b.dataset.petActionKey);});}
 const focus=options.focusKey?[...$('dialogBody').querySelectorAll('button')].find(b=>b.dataset.petActionKey===options.focusKey&&!b.disabled):null;(focus||$('petsTitle'))?.focus({preventScroll:true});
}

$('openPets').onclick=()=>{if(petsHostEligible()&&(!tutorial||tutorial.visit('pets')))showPets();};
function visitVillage(id,arrived=false){if(world.lobbyEnabled&&['miner','zag','well'].includes(id))return;if(tutorial&&!tutorial.visit(id))return;if(s.run||returns.active||$('dialog').open)return;const h=HOTSPOTS.find(h=>h.id===id);if(!h)return;if(!arrived&&!world.lobbyEnabled){world.moveInRefuge(null,id);return;}({forge:showForge,tree:()=>showTree(),lift:()=>showLift('floors'),missions:showMissions,stars:showStars,zag:showZag,records:showRecords,miner:()=>minerGame.show(),statue:showStatue}[id])();}
$('villageActions').innerHTML=HOTSPOTS.map(h=>'<button class="village-building" data-village="'+h.id+'" aria-label="'+h.name+'"><span>'+h.name+'</span>'+(h.id==='missions'?'<b id="villageMissionBadge" hidden></b>':h.id==='zag'?'<b id="villageZagBadge"></b>':'')+'</button>').join('');
function showVillagePlace(id){const h=HOTSPOTS.find(h=>h.id===id),name=$('villagePlaceName');name.textContent=h?.name||'';name.hidden=!h||!!s.run;world.villageHover=h?.id||null;}
let villageInput='pointer';
document.addEventListener('keydown',e=>{if(e.key==='Tab')villageInput='keyboard';});
function refugePointerPart(p){return pickRefugeGroundTarget(p.x/2,p.y/2,world.refugePaintTime??0,world.reduced,world.refugeInteraction??{});}
$('villageActions').querySelectorAll('button').forEach(b=>{b.onclick=()=>{showVillagePlace(null);visitVillage(b.dataset.village);};b.onfocus=()=>{villageInput='keyboard';showVillagePlace(b.dataset.village);};b.onblur=()=>showVillagePlace(null);});
function positionVillage(){if(s.run)return;if(!world.inRefuge||world.wide){world.inRefuge=true;world.wide=false;world.resize();}for(const h of HOTSPOTS){const b=$('villageActions').querySelector('[data-village="'+h.id+'"]'),top=h.y-h.h/2;b.style.left=($('world').offsetLeft+world.offsetX+(h.x-h.w/2)*world.scale)+'px';b.style.top=($('world').offsetTop+world.offsetY+top*world.scale)+'px';b.style.width=h.w*world.scale+'px';b.style.height=(h.h*world.scale)+'px';}}
function updateVillage(){const zagBadge=$('villageZagBadge');zagBadge.textContent=s.zag.dice+s.zag.hand.length?(s.zag.dice+s.zag.hand.length)+' DADOS':s.zag.passes+' PASSES';zagBadge.hidden=s.zag.passes===0&&s.zag.dice===0&&s.zag.hand.length===0;const badge=$('villageMissionBadge'),list=missionList(s),ready=list.filter(m=>m.status==='ready').length,active=list.filter(m=>m.status==='active').length;badge.hidden=!list.length;badge.textContent=ready?ready+' RECOMPENSA'+(ready>1?'S':'')+'!':active?active+' / '+missionSlots(s)+' MISSÕES':'NOVA MISSÃO';badge.dataset.ready=String(ready>0);positionVillage();}
function crownGroundTarget(point){const b=s.run?.room.enemies.find(n=>crownActive(n)&&n.hp>0);if(!b||!visible(s.run.room,b))return null;const p=crownApproach(b,s.run.player,b.crown.side),q=project(p.x,p.y);return Math.hypot(point.x-q.x,point.y-q.y)<28?{type:'hit',id:b.id,crownSide:b.crown.side}:null;}
function screenTarget(point){if(!s.run)return null;return [...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks,...rootTargets(s.run.room),...mysticTargets(s.run.room),...caveFindTargets(s.run.room)].filter(n=>n.hp>0&&!(n.bossIndex===5&&n.windup)&&!(n.bossIndex===6&&s.run.beat>n.exposedUntil)&&!(n.rabbitChild!==undefined&&n.stunned)&&visible(s.run.room,n)).map(n=>{const p=project(n.x,n.y);return{n,d:Math.hypot(p.x-point.x,p.y-((rootTarget(n)||mysticActive(n)||mysticCopy(n))?52:n.miniboss?38:19)-point.y)-(n.type==='enemy'?8:0)};}).sort((a,b)=>a.d-b.d).find(x=>x.d<(x.n.miniboss?52:(x.n.boss||mysticCopy(x.n))?70:36))?.n||hedgehogHitTest(s.run.room,point,project);}
$('world').addEventListener('pointermove',e=>{if(!s.run&&world.lobbyEnabled)return;const p=world.pointer(e);if(!s.run){villageInput='pointer';showVillagePlace(refugePointerPart(p)?.id??null);return;}hover=screenTarget(p)?.id??null;updateTip();});$('world').addEventListener('pointerleave',()=>{if(!s.run&&villageInput==='pointer')showVillagePlace(null);hover=null;updateTip();});
$('world').addEventListener('pointerdown',e=>{if(!s.run&&world.lobbyEnabled)return;if(e.button!==0||$('dialog').open||returns.active)return;$('world').focus({preventScroll:true});const p=world.pointer(e);if(!s.run){const place=pickRefugeGroundTarget(p.x/2,p.y/2,world.refugePaintTime??0,world.reduced,world.refugeInteraction??{});if(place)visitVillage(place.id);else world.moveInRefuge(p);return;}if(paused||world.holeDescentPending)return;if(s.run.room.cleared){const gate=project(s.run.room.exit?.x||18,s.run.room.exit?.y||2);if(Math.hypot(p.x-gate.x,p.y-gate.y)<75){if(s.run.floor<depthLimit(s)&&s.run.floor<TOTAL_FLOORS)nextFloor();else returnSafe();}return;}const fissure=crownGroundTarget(p);if(fissure){selected=fissure.id;perform(fissure);return;}const hole=holeClickTarget(s.run,p,project);if(hole){perform({type:'move',...hole});return;}const target=screenTarget(p);if(target){selected=target.id;perform({type:'hit',id:target.id});}else{const tile=unproject(p.x,p.y);perform({type:'move',...tile});}});
document.addEventListener('keydown',e=>{if(applicationMenuOpen||$('dialog').open||returns.active||e.repeat)return;if(s.run?.abyss?.cardChoice){const i=['Digit1','Digit2','Digit3'].indexOf(e.code);if(i>=0){e.preventDefault();pickAbyssCard(s.run.abyss.cardChoice.offers[i]);}return;}if(e.code==='Tab'&&!e.shiftKey&&!s.run?.room.cleared&&(e.target===$('world')||e.target===document.body)){e.preventDefault();showTree();return;}if(s.run?.room.cleared){if(e.code==='Tab'){const buttons=(approvedChoices?.floorButtons()||[...$('clearBanner').querySelectorAll('button')]).filter(b=>!b.hidden&&!b.disabled&&b.offsetParent!==null);const i=buttons.indexOf(approvedChoices?.floorActive()||document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}return;}if(['KeyP','Escape'].includes(e.code)&&s.run){e.preventDefault();pause();return;}if(!s.run)return;const isGame=e.target===$('world')||e.target===document.body;if(!isGame)return;if(e.code==='Space'){e.preventDefault();perform({type:'hit',id:selected});}const dirs={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};if(dirs[e.code]){e.preventDefault();const [dx,dy]=dirs[e.code];perform({type:'dodge',dx,dy});}if(e.code==='KeyQ'){e.preventDefault();const targets=[...s.run.room.nodes,...s.run.room.enemies,...s.run.room.rocks,...rootTargets(s.run.room),...mysticTargets(s.run.room),...caveFindTargets(s.run.room)].filter(n=>n.hp>0).sort((a,b)=>s.run.room.enemies.some(mysticActive)?a.y-b.y||a.x-b.x:0);selected=targets[(targets.findIndex(n=>n.id===selected)+1)%targets.length]?.id;updateTip();}if(e.code==='KeyE')extract();if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();perform({type:'item',item:ITEMS[Number(e.code.at(-1))-1].id,inputEvent:e});}});
bindDisplayVisibility(document,()=>{hidden=document.hidden;statuePresentation?.suspend({paused:blocked(),hidden});if(applicationMenuOpen){music.silence();lastFrame=performance.now();return;}if(hidden&&recordPreviewId){stopRecordPreview();}if(hidden&&s.zag.active&&!zagGame.automatic)zagGame.finish(true);if(hidden&&s.run){paused=true;update();}music.silence();lastFrame=performance.now();save();});window.addEventListener('pagehide',()=>{statuePresentation?.cancel();if(applicationMenuOpen)return;stopRecordPreview();zagGame.leave();save();});let minerSavedAt=Date.now();setInterval(()=>{if(applicationMenuOpen||tutorial?.active)return;if(Date.now()-minerSavedAt>=15000&&statuePresentation?.needsSaveRetry()){save();minerSavedAt=Date.now();}},1000);new ResizeObserver(()=>{world.resize();positionVillage();}).observe($('world'));
function frame(now){prepareExpeditionMusic();syncApplicationMenuAvailability();tutorial?.tick(now,{inMenu:applicationMenuOpen,hidden,loading:world.campaignLoading,returning:returns.active,descending:!!world.holeDescentPending,paused,resuming:resumeFlow.active,cleared:!!s.run?.room.cleared,safeChoice:!!s.run?.abyss?.cardChoice,dialogOpen:$('dialog').open,page:applicationMenuOpen?'settings':dialogKind});advanceResume(now);syncPausePresentation();const caveAlertState=caveAlerts.frame(expeditionHud.root,s.run,phaseAt(),{now,blocked:blocked()||!!world.holeDescentPending,soft:world.reduced||!!world.motionPreference?.matches});discoveryNotices.frame(now,{profile:s,blocked:blocked()||!!s.run?.room.cleared||!!world.holeDescentPending||caveAlertState.attention,soft:world.reduced||!!world.motionPreference?.matches});sentinelReward.frame(now,{profile:s,hudRoot:expeditionHud.root,blocked:blocked()||!!s.run?.room.cleared||!!world.holeDescentPending||caveAlertState.attention||discoveryNotices.hasPending,soft:world.reduced||!!world.motionPreference?.matches});levelNotice.frame(now,{profile:s,blocked:blocked()||!!s.run?.room.cleared||!!world.holeDescentPending||caveAlertState.attention||discoveryNotices.hasPending||sentinelReward.pending,soft:world.reduced||!!world.motionPreference?.matches});{const phase=phaseAt();expeditionHud.frame({profile:s,phase,beatSeconds:beatLength(),windowMs:s.run?actionWindowMs(s,Math.round(phase)):0,bpm:runMusicCue(s.run,phase).bpm,blocked:blocked(),tutorial:!!tutorial?.training,reduced:world.reduced});}nightLobby.frame({playing:!lobbyMusicPaused&&world.refugePlayback?.playing===true,hidden,reduced:world.reduced||world.motionPreference.matches,time:world.lobbyScene?.time||0});if(tutorial?.active&&!applicationMenuOpen){const delta=Math.max(0,Math.min(.05,(now-lastFrame)/1000));lastFrame=now;if(!tutorial.frame(now)){world.draw(s,s.run?elapsed:now/1000,s.run?0:delta,selected,hover,!!s.run);if(!s.run){const arrived=world.takeRefugeArrival();if(arrived)visitVillage(arrived,true);}}requestAnimationFrame(frame);return;}if(applicationMenuOpen){statuePresentation.suspend({paused:true,hidden});lastFrame=now;requestAnimationFrame(frame);return;}zagGame.frame();minerGame.frame(now);if((s.run?.recovery?.active||s.run?.rest?.active)&&!$('dialog').open)showRest();guardChoices();if(autoContinueStair(s)&&!blocked()&&floorGuard.ready(performance.now()))nextFloor();const wallDelta=Math.max(0,(now-lastFrame)/1000);lastFrame=now;const choosing=!!s.run?.abyss?.cardChoice;protectRhythm(wallDelta);updateAbyssChoice(wallDelta);if(s.run&&!choosing&&!blocked()&&!s.run.room.cleared){elapsed+=wallDelta;const pulse=Math.floor(phaseAt());if(pulse>(s.run.enemyBeat??-1)){for(let b=Math.max(4,(s.run.enemyBeat??-1)+1);b<=pulse;b++)enemyBeat(s,b);processEvents();}let resolved=false;while(s.run&&!s.run.recovery?.active&&!s.run.rest?.active&&!s.run.abyss?.cardChoice&&!s.run.room.cleared&&elapsed>=runBeatTime(s.run,s.run.beat+1)+actionWindowMs(s,s.run.beat+1)/1000){tick(s,s.run.beat+1);resolved=true;}if(resolved){if(!s.run)onReturn();else{processEvents();update();save();}}if(s.run&&feedbackTimer<elapsed)$('message').textContent=s.run?.beat<4?'PREPARE-SE!':'';}
 if(pendingBurst&&!blocked()&&(elapsed>=pendingBurst.at||s.run?.room.cleared)){celebrate(pendingBurst.combo,pendingBurst.nova);pendingBurst=null;}if(s.run?.albumEdition&&(blocked()||s.run.room.cleared))expeditionMusic.stop();updateMusicCue();const phase=phaseAt();document.querySelectorAll('.note').forEach((n,i)=>n.style.top=`${75+(phase-(Math.floor(phase)+i-1))*25}%`);const beatOn=Math.abs(phase-Math.round(phase))<.13;$('beatLamp').style.opacity=beatOn?'1':'.2';$('stage').dataset.beat=beatOn?'on':'off';const itemBeat=s.run&&!blocked()&&!s.run.room.cleared&&beatOn?'on':'off';if($('itemBar').dataset.beat!==itemBeat)$('itemBar').dataset.beat=itemBeat;world.refugeAudioState=appServices.audio.controller.getState();world.refugePlayback=refugeMusic.read({refugeVisible:!s.run&&!returns.active,hidden});const refugeNotesEligible=notesEligible(world.refugePlayback,world.refugeAudioState)&&!world.motionPreference?.matches;statuePresentation.step(wallDelta,{eligible:!s.run&&!returns.active&&!world.refugeMovement?.travel,paused:blocked(),hidden,soft:world.reduced,reduced:!!world.motionPreference?.matches,audio:world.refugePlayback.playing===true&&world.refugePlayback.source==='home',now:now/1000});if(dialogKind!=='miner')world.draw(s,s.run?elapsed:now/1000,wallDelta,selected,hover,blocked());else if(!hidden&&world.canvas?.isConnected&&(world.refugeNoteCount||0)>0&&!refugeNotesEligible)world.draw(s,s.run?elapsed:now/1000,0,selected,hover,true);if(s.run&&world.takeHoleDescentCompletion()){music.reward();feedback('DESCIDA CONCLUÍDA');update();save();}statuePresentation.afterPaint();if(!s.run&&!blocked()){const arrived=world.takeRefugeArrival();if(arrived)visitVillage(arrived,true);}requestAnimationFrame(frame);}
setInterval(()=>{
 // Explicit listening owns its five-second clock even while a tutorial bubble
 // is open. Only the unrelated ambient/combat dispatch yields to that bubble.
 if(!applicationMenuOpen&&!hidden&&!s.run&&!returns.active&&dialogKind==='records'&&music.preview){music.home(performance.now()/1000,true);return;}
 if(applicationMenuOpen||tutorial?.active)return;if(!s.run&&lobbyMusicPaused&&dialogKind!=='records')return;if(dialogKind==='miner'&&!hidden){music.mining(performance.now()/1000);return;}if(dialogKind==='zag'&&!hidden){music.zag(performance.now()/1000);return;}if((!s.run||s.run?.rest?.active)&&!returns.active&&!hidden){music.home(performance.now()/1000,dialogKind==='records');return;}if(!blocked()&&!s.run?.room.cleared){if(s.run)music.update(elapsed+(performance.now()-lastFrame)/1000,trackIndexForFloor(musicFloor(s.run)),{albumEdition:s.run.albumEdition,abyss:isAbyss(s.run),sonic:s.run.frenzy?.mutator==='sonic',combo:s.run.combo});else music.home(performance.now()/1000,dialogKind==='records');}},25);
tutorial=mountTutorial({document,storage:appServices.storage,fresh:!hadStoredProfile&&!saveReadFailed,profile:()=>s,world,music,recordedAudio:expeditionMusic,soundState:()=>appServices.audio.controller.getState().preferences.enabled,onSound:()=>$('sound').onclick(),closeDialog,update,toast,onRestoreClock:()=>{lastFrame=performance.now();},saveProfile:save,readFailed:()=>saveReadFailed,openPlace:id=>visitVillage(id),openLift:()=>showLift(),onUnsafeStorage:()=>{saveReadFailed=true;toast('O salvamento mudou. Recarregue antes de continuar.');},onEnableSound:async()=>{appServices.audio.controller.set({enabled:true});return await appServices.audio.controller.unlock();},onLearningOpen:(id,project)=>{if(s.run||returns.active)return;if(id==='forge'&&project)showForge(project);else if(id==='pets')showPets();else if(id==='wardrobe')showWardrobe();else if(id==='abyss')showLift('abyss');else visitVillage(id,true);},modeBpm:()=>Math.round(runMusicCue(s.run,phaseAt()).bpm)});
if(!s.run&&s.lastResult&&!s.lastResult.presented)showResult();update();if(s.run){chooseNext();$('pauseTitle').textContent='CONTINUAR?';$('pauseText').textContent='EXPEDIÇÃO SALVA';}save();requestAnimationFrame(frame);
function drawHitHistory(){$('hitHistory').innerHTML=Array.from({length:8},(_,i)=>{const hit=hitHistory[i-(8-hitHistory.length)];return '<i class="'+(hit===true?'hit':hit===false?'miss':'waiting')+'">'+(hit===true?'✦':hit===false?'×':'·')+'</i>';}).join('');}
const lastCardProc=new Map();
let breathAnimation;
function flashBreath(){const node=expeditionHud.field('breathHud')||$('breathHud');breathAnimation?.cancel();breathAnimation=node.animate(world.reduced?[{outlineColor:'#f94e6d',outlineWidth:'3px',outlineStyle:'solid'},{outlineColor:'#5ee9e9',outlineWidth:'0px',outlineStyle:'solid'}]:[{transform:'translateX(0)',background:'#720d0d',borderColor:'#f94e6d'},{transform:'translateX(-5px)',background:'#720d0d',borderColor:'#f94e6d',offset:.15},{transform:'translateX(5px)',background:'#053239',borderColor:'#5ee9e9',offset:.35},{transform:'translateX(-3px)',background:'#720d0d',borderColor:'#f94e6d',offset:.55},{transform:'translateX(0)',background:'#053239',borderColor:'#5ee9e9'}],{duration:600,easing:'ease-out'});}
function showProc(e){if(['find-heal','find-combo','find-blast','find-full','miniboss-reward'].includes(e.id))return;const now=performance.now();if(now-(lastCardProc.get(e.id)||-Infinity)<650)return;lastCardProc.set(e.id,now);const node=document.createElement('div'),card=CARDS.find(c=>c.id===e.id);node.className='proc-label';node.style.color=e.color;const pet=e.id?.startsWith('pet-')?petArtSpec(e.id.slice(4)):null;node.innerHTML=(pet?'<img src="'+pet.views.presentation.clips.pose.url+'" alt="">':APPROVED_CARD_RASTERS[e.id]?'<img src="'+APPROVED_CARD_RASTERS[e.id]+'" alt="">':glyph(card?.icon||'gem'))+'<span>'+e.name+'</span>';$('procFeed').append(node);while($('procFeed').children.length>2)$('procFeed').firstElementChild.remove();setTimeout(()=>node.remove(),2100);}
function updateCardUI(){const r=s.run;if(!r||r.mode==='abyss')decorateDescentChoice($('clearBanner'),r);$('runCards').hidden=!r||!activeCards(r).length;const key=JSON.stringify([r?.cards||{},r?.cardRevives||0]);if(key!==cardRenderKey||!r){cardRenderKey=key;$('runCards').innerHTML=cardHudMarkup(s);}
 if(!r?.room.cleared){if(choiceScreen)approvedChoices.cardFeel.clear();choiceScreen='';pendingCard=null;return;}const screen=s.attempts+':'+r.floor;if(choiceScreen!==screen){choiceScreen=screen;pendingCard=null;floorGuard.lock(performance.now());}renderFloorLoot();decorateDescentChoice($('clearBanner'),r);const offerKey=r.floor+'-'+(r.cardOffer||[]).join(',')+'-'+r.cardChosen;if(offerKey===offerRenderKey)return;offerRenderKey=offerKey;
 $('confirmCard').hidden=r.cardChosen;if(!pendingCard)$('confirmCard').textContent='Escolher';$('cardOffers').hidden=r.cardChosen;$('chosenCard').hidden=!r.cardChosen;$('floorActions').hidden=!r.cardChosen;$('safeReturn').disabled=!r.cardChosen;$('descend').disabled=!r.cardChosen;
 if(!r.cardChosen){$('cardOffers').innerHTML=approvedChoices.floorOffers((r.cardOffer||[]).map(id=>{const c=CARDS.find(c=>c.id===id),level=cardCount(r,id);return{id:c.id,name:c.name,text:c.text,role:c.role,color:c.color,level,detail:cardDetail(c,level+1,power(s),level,s)};}));approvedChoices.cardFeel.appear();$('cardOffers').querySelectorAll('button').forEach(button=>button.onclick=()=>{if(!floorGuard.ready(performance.now()))return;pendingCard=button.dataset.card;for(const other of $('cardOffers').querySelectorAll('button')){other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button));}$('confirmCard').textContent='Escolher · '+CARDS.find(c=>c.id===pendingCard).name;approvedChoices.cardFeel.select(pendingCard);guardChoices();});
 }else{$('chosenCard').innerHTML='<span>✦</span> CARTA EQUIPADA!';}guardChoices();
}
drawHitHistory();
function updateScoreHUD(){const r=s.run;$('scoreHud').hidden=!r;if(!r)return;const q=r.score,p=scoreProgress(r),marks=starMarks(r);$('scoreValue').textContent=fmt(q.points);$('scoreMultiplier').textContent='×'+p.multiplier.toFixed(2)+' COMBO';$('scoreNext').textContent=q.earned===5?'TODAS CONQUISTADAS':'PRÓXIMA ★ '+fmt(p.goal);$('scoreTarget').textContent=q.earned+' / 5 ★';$('scoreFill').style.setProperty('--score-fill',p.fill*100+'%');$('starProgress').setAttribute('aria-orientation',document.body.classList.contains('immersive-run')?'vertical':'horizontal');$('starProgress').setAttribute('aria-valuenow',Math.round(p.fill*100));const left=Math.max(0,floorScoreLimit(r)-(r.room.scoreSpent||0));$('scoreWindow').textContent=r.room.cleared?'PONTOS GUARDADOS · SIGA A DESCIDA':q.version>=2?(left?'NESTA SALA · +'+fmt(left)+' PONTOS DISPONÍVEIS':'SALA PONTUADA · AVANCE'):'PONTOS GUARDADOS NA DESCIDA';$('earnedStars').setAttribute('aria-label',q.earned+' de 5 estrelas');for(let i=1;i<=5;i++){const slot=$('starSlot'+i);slot.classList.toggle('lit',i<=q.earned);slot.style.setProperty('--star-mark',marks[i-1]/marks[4]*100+'%');slot.title=fmt(Math.round(q.target*marks[i-1]))+' PONTOS';}}
function celebrateStar(number){
 const slot=$('starSlot'+number);slot.classList.add('lit');music.reward();
 slot.animate(world.reduced?[{opacity:.4},{opacity:1}]:[{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-160%) scale(1.8)',offset:.45},{transform:'translate(-50%,-50%) scale(1)'}],{duration:850,easing:'ease-out'});
 flyStar({document,slot,container:$('starAnnouncements'),reduced:world.reduced});
}
let reliquaryUi={};
function showStars(){
 if(s.run||returns.active)return;if(!reliquaryUnlocked(s)){toast('Conquiste suas primeiras 30 estrelas para abrir o Relicário.');return;}
 openDialog('RELICÁRIO','','stars');
 approvedServiceCleanup=mountApprovedReliquary($('dialog'),s,{initialUi:reliquaryUi,onUiState:next=>{reliquaryUi=next;},onChange:()=>{invalidateProgression(s);save();update();music.reward();},onClose:closeDialog,onCommand:()=>bubbleUI.command(),beforeAction:()=>!!s.run||returns.active||!reliquaryUnlocked(s),softMode:()=>world.reduced});
}
function missionTimeLeft(m){const seconds=Math.ceil(m.remaining),minutes=Math.floor(seconds/60);return seconds>=3600?Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'min':minutes+':'+String(seconds%60).padStart(2,'0');}
function showMissionReceipt(reward,record=null){
 openDialog('MISSÃO ENTREGUE',missionReceiptMarkup({reward,record}),'missions');
 $('receiptDone').onclick=()=>{closeDialog();for(const id of ['bank'])$(id).animate(world.reduced?[{opacity:.5},{opacity:1}]:[{transform:'scale(1.35)',color:'#e8ff75'},{transform:'scale(1)'}],{duration:550});};
 $('moreMissions').onclick=showMissions;
 $('dialogBody').scrollTop=0;$('receiptDone').focus({preventScroll:true});
}

function updateMissionHUD(){const list=missionList(s),m=list.find(m=>m.status==='active')||list.find(m=>m.status==='ready')||list[0],ready=list.filter(m=>m.status==='ready').length;$('missionHud').hidden=!m||!s.run;if(!m)return;const def=MISSION_TYPES.find(d=>d.id===m.template),tier=MISSION_TIERS[m.tier];$('missionHud').style.setProperty('--mission',tier.color);$('missionTier').textContent=list.length>1?list.filter(m=>m.status!=='expired').length+' MISSÕES'+(ready?' · '+ready+' PRONTAS':''):tier.name;$('missionName').textContent=def.name;$('missionTask').textContent=def.verb;$('missionProgress').textContent=fmt(m.progress)+' / '+fmt(m.goal);$('missionTime').textContent=m.status==='ready'?'✓ ENTREGAR NA BASE':m.status==='expired'?'PRAZO ENCERRADO':missionTimeLeft(m)+(s.run&&!s.run.room.cleared&&!blocked()?'':' · PAUSADA');}
function finishAbyssChoice(id,automatic,cardVisual){
 $('abyssCardDialog').close();abyssChoiceKey='';abyssGuard.reset();lastFrame=performance.now();
 processEvents();update();save();if(id.startsWith('abyss-'))music.sfx('card');approvedChoices.announceAbyss(s,id,automatic);approvedChoices.cardFeel.confirm(id,cardVisual?.get(id));$('world').focus({preventScroll:true});
}
function pickAbyssCard(id){
 if(paused||hidden||!$('abyssCardDialog').open||!abyssGuard.ready(performance.now())||!approvedChoices.abyssReady())return;
 const cardVisual=approvedChoices.cardFeel.capture();if(chooseAbyssCard(s,id))finishAbyssChoice(id,false,cardVisual);
}
function updateAbyssChoice(delta=0){
 const r=s.run,c=r?.abyss?.cardChoice,dialog=$('abyssCardDialog');
 if(!c||paused||hidden||$('dialog').open||returns.active){if(dialog.open)dialog.close();if(!c)abyssChoiceKey='';return;}
 const key=s.attempts+':'+c.section;
 if(!dialog.open){
  if(key!==abyssChoiceKey){abyssChoiceKey=key;abyssChoiceSaved=c.remaining;
   $('abyssCardOffers').innerHTML=approvedChoices.abyssOffers(c.offers.map(id=>{const d=abyssCardDefinition(id);return{id:d.id,name:d.name,text:d.text,detail:id.startsWith('abyss-')?'':cardDetail(d,cardCount(r,id)+1,power(s),cardCount(r,id),s),role:d.role,color:d.color,level:cardCount(r,id),instant:id.startsWith('abyss-')};}),s);
   $('abyssCardOffers').querySelectorAll('button').forEach(b=>b.onclick=()=>pickAbyssCard(b.dataset.abyssCard));
  }
  abyssGuard.lock(performance.now(),350);music.silence();dialog.showModal();approvedChoices.cardFeel.appear();delta=0;
 }
 if(!approvedChoices.abyssReady())delta=0;
 const cardVisual=c.remaining<=delta?approvedChoices.cardFeel.capture():null;const id=advanceAbyssCards(s,delta);if(id){finishAbyssChoice(id,true,cardVisual);return;}
 const ready=abyssGuard.ready(performance.now());$('abyssCardOffers').querySelectorAll('button').forEach(b=>b.disabled=!ready);
 $('abyssCardFill').style.transform='scaleX('+(c.remaining/ABYSS_CHOICE_SECONDS)+')';$('abyssCardTimer').setAttribute('aria-valuenow',c.remaining.toFixed(1));$('abyssCardSeconds').textContent=Math.ceil(c.remaining);dialog.dataset.urgent=String(c.remaining<=1);approvedChoices.field('abyssChoiceWindow').dataset.urgent=dialog.dataset.urgent;
 $('abyssCardHint').textContent=ready?'Escolha automática ao zerar':'Solte os controles…';
 if(abyssChoiceSaved-c.remaining>=.25){abyssChoiceSaved=c.remaining;save();}
}
$('abyssCardDialog').addEventListener('cancel',e=>e.preventDefault());
function missionBoardViewModel(s,view){const card=m=>{const def=MISSION_TYPES.find(d=>d.id===m.template);return{id:m.id,template:m.template,name:def.name,verb:def.verb,tierName:MISSION_TIERS[m.tier].name,status:m.status,rewardLevel:m.rewardLevel||1,goal:m.goal,progress:m.progress,timeText:missionTimeLeft(m),reward:missionReward(m)};};return{bank:s.bank,level:buildingLevel(s,'missions'),cap:MISSION_BUILDING_CAP,used:view.used,slots:view.slots,nextSlot:view.nextSlot,active:view.list.map(card),offers:view.offers.map(card),odds:view.odds,questLuck:s.unlocked.includes('questluck'),buildingHtml:buildingMarkup(s,'missions')};}

function captureMissionPresentation(){if(dialogKind!=='missions')return null;const body=$('dialogBody'),node=document.activeElement?.closest?.('button'),attribute=['data-mission','data-claim-mission','data-abandon-mission','data-building'].find(a=>node?.hasAttribute(a));return{top:body.scrollTop||0,attribute,value:attribute?node.getAttribute(attribute):null};}function restoreMissionPresentation(previous){if(!previous)return;const body=$('dialogBody');body.scrollTop=previous.top;const target=previous.attribute?[...body.querySelectorAll('button['+previous.attribute+']')].find(b=>b.getAttribute(previous.attribute)===previous.value&&!b.disabled):null;const focus=target||body.querySelector('.r2-missions-top');focus?.focus({preventScroll:true});focus?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});}

let missionUi={};
function showMissions(){
 if(s.run||returns.active)return;missionOffers(s);save();
 openDialog('MISSÕES','','missions');
 const unavailable=()=>!!s.run||returns.active;
 approvedServiceCleanup=mountApprovedMissions($('dialog'),s,{
  initialUi:missionUi,onUiState:next=>{missionUi=next;},onClose:closeDialog,onCommand:()=>bubbleUI.command(),softMode:()=>world.reduced,
  onAccept:id=>{if(unavailable()||!acceptMission(s,id))return false;const persisted=save();update();closeDialog();music.sfx('accept');toast(persisted?'MISSÃO ACEITA!':'MISSÃO NESTA SESSÃO · SALVE PARA CONTINUAR');tutorial?.missionAccepted(persisted);return true;},
  onClaim:id=>{if(unavailable()||saveReadFailed)return false;const owned=new Set(s.records.owned),result=commitMissionClaim({profile:s,id,storage:localStorage,key:KEY});if(!result.ok){if(result.requiresReload)saveReadFailed=true;toast(result.requiresReload?'RECARREGUE PARA CONFERIR O SAVE':'NÃO FOI POSSÍVEL SALVAR · TENTE RECEBER NOVAMENTE');return false;}update();music.sfx(s.records.owned.some(id=>!owned.has(id))?'recordDrop':'claim');return true;},
  onAbandon:id=>{if(unavailable()||!abandonMission(s,id))return false;save();update();return true;},
  onUpgrade:()=>{if(unavailable()||forgeBusy||!upgradeBuilding(s,'missions'))return false;save();update();music.sfx('claim');toast('CONSTRUÇÃO MELHORADA!');return true;},
  onBoard:()=>{missionOffers(s);save();tutorial?.opened('missions');},
  onReceiptDone:()=>{closeDialog();for(const id of ['bank','lobby-bank'])$(id)?.animate(world.reduced?[{opacity:.5},{opacity:1}]:[{transform:'scale(1.35)',color:'#e8ff75'},{transform:'scale(1)'}],{duration:550});}
 });
 tutorial?.opened('missions');
}


function updateBossHUD(){
 const r=s.run,boss=r?livingBoss(r.room):null,hud=$('bossHud');
 hud.hidden=!boss;hud.dataset.spore=String(boss?.bossIndex===4);$('objective').classList.toggle('boss-objective',!!r?.room.bossFloor);
 if(r?.room.bossFloor){$('charge').textContent=r.room.bossDefeated?'✓':'BOSS';$('chargeBar').style.width=(r.room.bossDefeated?100:0)+'%';$('goal').textContent='DERROTE O CHEFE';}
 if(!boss)return;const d=BOSSES[boss.bossIndex],beat=Math.floor(phaseAt()),open=mysticActive(boss)?mysticOpen(boss,beat):rootActive(boss)?rootOpen(boss,beat):beat<=boss.exposedUntil;
 hud.style.setProperty('--boss',d.color);$('bossName').textContent=d.name;$('bossHP').textContent=Math.ceil(boss.hp)+' / '+boss.maxHp;$('bossFill').style.width=boss.hp/boss.maxHp*100+'%';
 $('bossAttack').textContent=mysticActive(boss)?'MIRAGENS DO MANTO':micelialActive(boss)?'NÚCLEOS':rootActive(boss)?(open?'CASCA ABERTA':'SEIVA E CIPÓ'):boss.windup?boss.windup.attack:boss.bossIndex===4?'QUEBRE OS NÚCLEOS':boss.bossIndex===6&&!open?'ACERTE OS 3 FILHOTES':open?'ATAQUE AGORA!':'PREPARE-SE';
 $('bossInstruction').textContent=mysticActive(boss)?mysticCaption(boss,beat):micelialActive(boss)?'':rootActive(boss)?rootCaption(boss,beat):boss.bossIndex===4?(boss.windup?.hint||'SIGA O GIRO · QUEBRE OS NÚCLEOS'):boss.windup?(boss.windup.safe?'':boss.windup.hint+' · ')+Math.max(0,boss.windup.beat-beat)+' PULSOS':open?'VULNERÁVEL · '+Math.max(0,boss.exposedUntil-beat+1)+' PULSOS':boss.bossIndex===6?'ATORDOE OS FILHOTES':'ARMADURA ATIVA';
 $('bossPhase').textContent=boss.hp<=boss.maxHp/2?'FASE 2 · FÚRIA':'FASE 1';hud.dataset.open=String(open);
}
$('confirmCard').onclick=()=>{if(world.holeDescentPending||!pendingCard||!floorGuard.ready(performance.now()))return;const id=pendingCard,cardVisual=approvedChoices.cardFeel.capture();if(chooseCard(s,id)){pendingCard=null;floorGuard.lock(performance.now(),900);processEvents();update();save();approvedChoices.cardFeel.confirm(id,cardVisual.get(id));$('clearBanner').focus({preventScroll:true});}};
function renderFloorLoot(){approvedChoices.renderLoot(s);}





function updateDepthLift(){
 const r=s.run;$('depthLift').hidden=!r;if(!r)return;
 if(!$('liftPortrait').querySelector('canvas'))$('liftPortrait').innerHTML='<canvas width=128 height=128 aria-label=Minerador></canvas>';drawPlayerPortrait($('liftPortrait').firstElementChild,s);
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
 openDialog(recovery?'NOVA CHANCE':'FOGUEIRA','','rest');
 approvedServiceCleanup=mountApprovedRest($('dialog'),s,{
  onChange:()=>{music.forge(performance.now()/1000);save();update();},
  onTalents:()=>showTree(recovery?'guard':'revive'),
  onContinue:()=>{if(recovery){if(!resumeRecovery(s))return;closeDialog();paused=false;lastFrame=performance.now();save();update();$('world').focus({preventScroll:true});}else if(leaveCamp(s)){closeDialog();save();nextFloor();}},
  onClose:closeDialog,softMode:()=>world.reduced
 });
}

function updateFrenzyHUD(){
 const r=s.run,abyss=isAbyss(r),f=r?.frenzy,rest=!r||!!r.rest?.active;
 document.body.classList.toggle('resting',rest);document.body.classList.toggle('abyss-mode',abyss);
 document.body.classList.toggle('immersive-run',!!r&&!rest);
 document.body.classList.toggle('immersive-base',!r);
 document.body.classList.toggle('floor-complete',!!r?.room.cleared&&!world.holeDescentPending);
 $('breathHud').hidden=!r||rest||r.room.cleared;
 $('frenzyHud').hidden=!f;$('boostHud').hidden=!abyss;$('rescueHud').hidden=!abyss||!rescueAvailable(r);$('floorRescue').hidden=abyss||!rescueAvailable(r);
 if(rest){$('trackName').textContent='LUZ DA FOGUEIRA';$('trackStyle').textContent='REFÚGIO · AMBIENTE';$('trackTempo').textContent='CALMO';}
 if(!f)return;
 const heat=heatState(r),m=MUTATORS.find(m=>m.id===f.mutator),q=f.quest;
 $('heatValue').textContent=Math.round(heat.heat)+'%';$('heatFill').style.width=heat.heat+'%';$('heatLoot').textContent='SAQUE ×'+heat.loot.toFixed(1);
 $('mutatorName').textContent=f.pendingSection?'A SEGUIR · '+f.pendingSection.name:m.name;$('mutatorHint').textContent=f.invaderAt>r.beat?'TITÃ CHEGANDO!':m.hint;
 $('liveQuest').hidden=!q||q.done;
 if(q&&!q.done){$('questName').textContent=q.name;$('questCount').textContent=(q.kind==='vein'?(q.collected?'+'+q.collected+' ◇':'BATA E COLETE'):q.progress+'/'+q.goal)+' · '+Math.max(0,Math.ceil((q.until-r.beat)*beatLength()))+'s';}
 $('boostHud').innerHTML=BOOSTS.filter(b=>activeBoost(r,b.id)).map(b=>{const seconds=Math.max(0,Math.ceil((f.buffs[b.id]-r.beat)*beatLength()));return '<div class="boost-node active" style="--boost:'+b.color+'" role="img" aria-label="'+b.name+' · '+b.hint+' · '+seconds+' segundos" title="'+b.name+' · '+b.hint+'"><b>'+icons.boost(b.id)+'</b><small>'+seconds+'s</small></div>';}).join('');
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

// App presentation pause: never reset the rhythm clock or replay hidden frames.
function canOpenApplicationMenu(){return !returns.active&&!returns.settling;}
function syncApplicationMenuAvailability(){const button=$('openApplicationMenu');if(!button)return;const available=canOpenApplicationMenu();button.disabled=!available;button.setAttribute('aria-disabled',String(!available));button.title=available?'Configurações':'Aguarde a entrega das recompensas.';}
export function setApplicationMenu(open,{resume=false}={}){if(open&&!canOpenApplicationMenu()){syncApplicationMenuAvailability();return false;}if(open===applicationMenuOpen)return true;if(open){resumeFlow.cancel();resumeView.render(0);if(canResumeFromSettings()){paused=true;clearResumeRhythm(s.run);}closeDialog();stopRecordPreview();save();}applicationMenuOpen=open;statuePresentation?.suspend({paused:blocked(),hidden});music.silence();lastFrame=performance.now();if(!open){world.resize();if(resume)requestResume();else update();}return true;}

