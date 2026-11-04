import {validTrainingEdition} from './training-music.js';
// Disposable native simulation. Never pass a player profile into this module.
import * as E from './core.js';
import {createLayout,locateHedgehog} from './cave-layout.js';
import {initCeiling} from './cave-ceiling.js';
import {reveal,sightRange} from './cavern.js';
import {heatState,initFrenzy} from './frenzy.js';
import {awardScore,scoreProgress} from './stars.js';
import {TRAINING_BPMS,validTrainingBpm,runBeatTime,runBeatPhase} from './training-clock.js';
import {beatTime} from './score.js';
import {musicFloor} from './frenzy.js';
export {TRAINING_BPMS};
const VERSION=2,SCENES=['rhythm','mining','bomb','heal','shield','heat','stars','exit','practice'];
const sessions=new WeakSet();
const LIMIT=8192;
const copy=value=>JSON.parse(JSON.stringify(value));
function check(s){if(!s||s.version!==VERSION||!s.state||!Array.isArray(s.history))throw TypeError('Sessão de treino inválida.');}
function remember(s,entry){const last=s.history.at(-1);if(entry.op==='advance'&&last?.op==='advance'&&last.dt+entry.dt<=.25){last.dt+=entry.dt;return;}if(s.history.length>=LIMIT){s.checkpointUnavailable=true;return;}s.history.push(entry);}
const run=s=>s.state.run||s.lastRun;
const phase=s=>runBeatPhase(run(s),s.elapsed);
export function trainingView(s){check(s);const p=phase(s),r=run(s);return {version:VERSION,bpm:s.bpm,albumEdition:s.albumEdition,elapsed:s.elapsed,phase:p,worldTime:beatTime(musicFloor(r),p),beat:Math.round(p),paused:s.paused,consecutive:s.consecutive,practicedFive:s.practicedFive,scene:s.scene,lesson:s.lesson,breathEnabled:s.breathEnabled,firstBreathLossSeen:s.firstBreathLossSeen,breathResets:s.breathResets||0,countIn:Math.max(0,(r.trainingClock?.silenceStart||0)-Math.ceil(p)),complete:s.complete,closed:s.closed,practice:s.scene==='practice'?{charge:r.room.charge,goal:8,crystals:r.loot.crystals.reduce((sum,c)=>sum+c.count,0),rocks:r.loot.rocks.count,usedBlast:s.usedItems.blast,usedTonic:s.usedItems.tonic,usedWard:s.usedItems.ward,blockedShield:s.blockedShield,readyForExit:r.room.charge>=8}:null};}
function collect(s,r,extras=[]){const events=r.events.splice(0),resets=events.filter(e=>e.type==='trainingBreathReset');if(resets.length)s.breathResets=(s.breathResets||0)+resets.length;const miss=events.find(e=>(e.type==='hurt'&&e.reserve==='rhythm')||e.type==='trainingProtectedMiss');if(miss){s.consecutive=0;const protectedMiss=miss.type==='trainingProtectedMiss',firstLoss=!protectedMiss&&!s.firstBreathLossSeen;if(firstLoss){s.firstBreathLossSeen=true;if(!resets.length)s.paused=true;}extras.push({type:'trainingTimingMiss',early:phase(s)<Math.round(phase(s)),reason:miss.reason,protected:protectedMiss,firstLoss,reset:resets.length>0});}if(events.some(e=>e.type==='shieldBlock'))s.blockedShield=true;return [...events,...extras];}
export function createTraining({seed=56,bpm=100,albumEdition=null}={}){
 if(!Number.isSafeInteger(seed)||seed<0||seed>2147483647||!validTrainingBpm(bpm))throw TypeError('Use 80, 100 ou 120 BPM.');
 if(albumEdition!==null&&!validTrainingEdition(albumEdition))throw TypeError('Música indisponível para treino.');
 const state=E.createState(seed);if(!E.startRun(state))throw Error('Não foi possível iniciar treino.');
 const s={version:VERSION,seed,bpm,albumEdition,initialBpm:bpm,elapsed:0,paused:true,consecutive:0,practicedFive:false,scene:'rhythm',lesson:'rhythm',breathEnabled:false,firstBreathLossSeen:false,usedItems:{blast:0,tonic:0,ward:0},blockedShield:false,lessonsPrepared:[],complete:false,closed:false,state,lastRun:state.run,history:[]};sessions.add(s);
 prepareTrainingScene(s,'rhythm');s.history=[];return s;
}
export function setTrainingBpm(s,bpm){check(s);if(!s.paused||s.closed||s.albumEdition)throw Error('BPM livre disponível com o treino pausado, sem música gravada.');if(!validTrainingBpm(bpm))throw TypeError('Use 80, 100 ou 120 BPM.');const p=phase(s);remember(s,{op:'bpm',bpm});s.bpm=bpm;s.elapsed=p*60/bpm;run(s).trainingClock.bpm=bpm;return trainingView(s);}
export function setTrainingPaused(s,paused){check(s);if(typeof paused!=='boolean')throw TypeError('Pausa inválida.');if(s.closed)return trainingView(s);if(s.paused!==paused){remember(s,{op:'pause',paused});if(!paused&&!s.albumEdition)run(s).trainingClock.silenceStart=Math.max(run(s).trainingClock.silenceStart||0,Math.ceil(phase(s))+4);s.paused=paused;}return trainingView(s);}
export function prepareTrainingScene(s,id){
 check(s);if(!s.paused||s.closed)throw Error('Pause antes de preparar uma cena.');if(!SCENES.includes(id))throw TypeError('Cena de treino desconhecida.');remember(s,{op:'scene',id});
 const r=s.state.run;if(!r)throw Error('Treino encerrado.');const p=id==='heat'?64:s.albumEdition?Math.max(0,Math.ceil(phase(s)-1e-9)):Math.max(4,Math.ceil(phase(s)-1e-9));r.trainingClock={version:1,bpm:s.bpm,...(s.albumEdition?{albumEdition:s.albumEdition}:{})};s.elapsed=runBeatTime(r,p);s.scene=id;s.complete=false;s.consecutive=0;
 r.mode=id==='heat'?'abyss':'floors';r.abyss=id==='heat'?{section:1,rows:0,lastShift:64,checkpoint:null,secured:0,cardSection:1,cardChoice:null}:undefined;
 r.floor=1;r.trainingClock={...r.trainingClock,silenceStart:s.albumEdition?4:p+4,breathEnabled:s.breathEnabled};r.beat=p-1;r.acted=-1;r.missed=-1;r.enemyBeat=p-1;r.guardUntil=-1;r.recovery=null;r.rest=null;r.cardOffer=[];r.cardChosen=false;r.cards={};r.combo=0;r.cardHits=0;r.events=[];r.items={blast:0,tonic:0,ward:0};r.health=id==='heal'?50:Math.max(50,r.health);r.rhythm=100;r.player={x:8,y:8};s.lesson=id;
 const room=r.room={cols:21,rows:15,seed:s.seed,openingMining:1,rocks:[],nodes:[],enemies:[],nextId:1000,quota:9999,minBeats:0,goal:0,charge:0,cleared:false,bossFloor:false,hazards:[],scoreLimit:3000,scoreSpent:0,scoredTiles:[],exit:{x:18,y:2},terrain:Array(315).fill(0),explored:Array(315).fill(0),floorStart:{materials:[...r.materials],bag:r.bag,points:r.score.points,stars:r.score.earned}};
 createLayout(room,E.rng(s.seed),0,true);locateHedgehog(room,0);initCeiling(room);r.frenzy=null;
 const entity=(type,kind,x,y,hp,value)=>({id:room.nextId++,type,kind,x,y,hp,maxHp:hp,value,born:p});
 const targets={};
 if(id==='practice'){
  for(const [i,p]of [[9,8],[10,8],[11,8],[12,8],[9,10],[10,10],[11,10],[12,10],[6,8],[5,8],[6,10],[5,10]].entries())room.nodes.push(entity('crystal',i%4,p[0],p[1],2,3));
  for(const [i,p]of [[7,7],[8,6],[10,6],[12,6],[7,11],[9,12],[11,12],[13,11]].entries())room.rocks.push(entity('rock',i%3,p[0],p[1],i%3===2?3:2,E.ROCKS[i%3].value));
  r.items={blast:3,tonic:3,ward:3};targets.mineralId=room.nodes[0].id;targets.exit={...room.exit};s.lesson='rhythm';
 }
 if(['mining','bomb','exit'].includes(id)){
  const node=entity('crystal',0,9,8,2,3);room.nodes.push(node);targets.mineralId=node.id;
  if(id!=='exit')for(const [kind,x,y,hp]of [[0,7,8,2],[1,8,6,2],[2,10,7,3]])room.rocks.push(entity('rock',kind,x,y,hp,E.ROCKS[kind].value));
 }
 if(id==='bomb'){r.items.blast=1;targets.item='blast';room.nodes.push(entity('crystal',1,8,10,2,3));}
 if(id==='heal'){r.items.tonic=1;targets.item='tonic';}
 if(id==='shield'){
  r.items.ward=1;targets.item='ward';const enemy=entity('enemy',1,8,5,6,0);enemy.stunUntil=-1;enemy.windup={x:8,y:8,tiles:[{x:8,y:8}],beat:p+4,radius:0,kind:'dash'};room.enemies.push(enemy);targets.enemyId=enemy.id;
 }
 if(id==='heat'){r.beat=64;r.enemyBeat=64;r.acted=64;initFrenzy(r);r.frenzy.lastBeat=64;r.frenzy.nextQuest=9999;}
 if(id==='exit'){room.quota=1;room.goal=0;targets.exit={...room.exit};}
 reveal(room,r.player,sightRange(r));
 const extras=[{type:'trainingScene',id,sandbox:true}];
 if(id==='stars'){
  // Explicitly prefilled demonstration; only the last point is a native award.
  r.score={version:2,points:999,earned:0,target:20000};room.scoreSpent=999;r.acted=p;
  awardScore(s.state,1,p,'training-demo');extras.push({type:'trainingStarDemo',prefilled:999,awarded:1,goal:scoreProgress(r).goal,sandbox:true});
 }
 s.lastRun=r;s.heat=heatState(r);return {events:collect(s,r,extras),view:trainingView(s),targets};
}
export function advanceTraining(s,dt){
 check(s);if(s.paused||s.closed||!s.state.run||!Number.isFinite(dt)||dt<=0||dt>.25)return {events:[],view:trainingView(s)};
 remember(s,{op:'advance',dt});s.elapsed+=dt;const r=s.state.run,events=[],p=phase(s);
 // Close an input beat only after its entire early/late window. No valid late
 // press is turned into a silence penalty before it can reach core.act.
 const end=Math.floor(p-.5+1e-9);
 for(let beat=r.beat+1;beat<=end&&s.state.run&&!r.room.cleared;beat++){
  E.tick(s.state,beat);const emitted=collect(s,r);events.push(...emitted);
  if(emitted.some(e=>e.type==='shieldBlock'))r.room.enemies=[];
  const now=heatState(r);if(s.scene==='heat'&&now.heat>s.heat.heat){events.push({type:'trainingHeatChanged',before:{...s.heat},after:{...now},sandbox:true});s.heat=now;}
  if(s.paused)break;
 }
 s.lastRun=r;return {events,view:trainingView(s)};
}
function actionCopy(action){
 if(!action||!['hit','move','dodge','item'].includes(action.type))return null;
 if(action.type==='item')return ['blast','tonic','ward'].includes(action.item)?{type:'item',item:action.item}:null;
 if(action.type==='move')return [action.x,action.y].every(Number.isInteger)?{type:'move',x:action.x,y:action.y}:null;
 if(action.type==='dodge')return [action.dx,action.dy].every(Number.isInteger)&&Math.abs(action.dx)+Math.abs(action.dy)===1?{type:'dodge',dx:action.dx,dy:action.dy}:null;
 return action.id===undefined?{type:'hit'}:Number.isSafeInteger(action.id)&&action.id>=0?{type:'hit',id:action.id}:null;
}
export function actTraining(s,action){
 check(s);const normalized=actionCopy(action);if(s.paused||s.closed||!s.state.run||!normalized)return {result:{ok:false},events:[],view:trainingView(s)};
 const r=s.state.run,native=s.scene==='rhythm'&&normalized.type==='hit'&&normalized.id===undefined?{type:'move',...r.player}:normalized,result=E.act(s.state,{...native,inputEvent:action.inputEvent},phase(s)),extra=[];
 // Rejected duplicate DOM events must not become fresh activations on replay.
 if(!(normalized.type==='item'&&result.duplicate))remember(s,{op:'act',action:normalized});
 if(result.ok){if(normalized.type==='item')s.usedItems[normalized.item]++;else s.consecutive++;if(s.consecutive>=5&&!s.practicedFive){s.practicedFive=true;extra.push({type:'trainingFiveAccepted'});}}
 if(result.ok&&(s.scene==='shield'||s.scene==='practice'&&s.lesson==='shield')&&normalized.type==='item'&&normalized.item==='ward'){
  // Rearm a real attack on the accepted shield beat, even if the player waited
  // or missed the initial demonstration. The native tick resolves the block.
  const enemy=r.room.enemies[0]??{id:r.room.nextId++,type:'enemy',kind:1,x:8,y:5,hp:6,maxHp:6,stunUntil:-1};
  enemy.windup={...r.player,tiles:[{...r.player}],beat:Math.round(phase(s)),radius:0,kind:'dash'};r.room.enemies=[enemy];
 }
 const events=collect(s,r,extra);s.lastRun=r;return {result,events,view:trainingView(s)};
}
export function finishTraining(s,{skipped=false}={}){
 check(s);if(typeof skipped!=='boolean')throw TypeError('Encerramento inválido.');if(s.closed)return {complete:s.complete,skipped:s.skipped,rewardsTransferred:false};
 if(!skipped&&!((s.scene==='exit'||s.scene==='practice'&&s.lesson==='exit')&&s.state.run?.room.cleared))return {complete:false,skipped:false,rewardsTransferred:false};
 remember(s,{op:'finish',skipped});s.complete=!skipped;s.skipped=skipped;s.paused=true;s.closed=true;
 // Native result/return exists only on this disposable account. Keep a frozen
 // completed run for the host's final reading frame, with all actions disabled.
 const r=s.state.run;if(r){E.finishRun(s.state,skipped?'retreat':'return');s.state.run=r;r.events=[];}
 return {complete:s.complete,skipped,rewardsTransferred:false};
}
export function exportTraining(s){check(s);return s.checkpointUnavailable?null:{version:VERSION,seed:s.seed,initialBpm:s.initialBpm,...(s.albumEdition?{albumEdition:s.albumEdition}:{}),history:copy(s.history)};}
export function restoreTraining(raw,{ownsEdition=()=>false}={}){
 try{
  if(!raw||raw.version!==VERSION||!Number.isSafeInteger(raw.seed)||raw.seed<0||raw.seed>2147483647||!validTrainingBpm(raw.initialBpm)||!Array.isArray(raw.history)||raw.history.length>LIMIT||JSON.stringify(raw).length>1000000)return null;
  if(raw.albumEdition!==undefined&&(!validTrainingEdition(raw.albumEdition)||!ownsEdition(raw.albumEdition)))return null;
  const s=createTraining({seed:raw.seed,bpm:raw.initialBpm??100,albumEdition:raw.albumEdition??null});
  for(const entry of raw.history){if(!entry||typeof entry!=='object')return null;
   if(entry.op==='pause')setTrainingPaused(s,entry.paused);
   else if(entry.op==='bpm')setTrainingBpm(s,entry.bpm);
   else if(entry.op==='scene')prepareTrainingScene(s,entry.id);
   else if(entry.op==='lesson')configureTrainingLesson(s,entry.id);
   else if(entry.op==='breath')setTrainingBreath(s,entry.enabled);
   else if(entry.op==='demo')demonstrateTrainingBreath(s);
   else if(entry.op==='advance'){if(s.paused||s.closed||!Number.isFinite(entry.dt)||entry.dt<=0||entry.dt>.25)return null;advanceTraining(s,entry.dt);}
   else if(entry.op==='act'){if(s.paused||s.closed||!actionCopy(entry.action))return null;actTraining(s,entry.action);}
   else if(entry.op==='finish')finishTraining(s,{skipped:entry.skipped});
   else return null;
  }
  s.paused=true;run(s).events=[];return s;
 }catch{return null;}
}
export function isCompletedTraining(s){return sessions.has(s)&&s.complete===true&&s.closed===true&&!s.skipped&&run(s)?.room.cleared===true&&s.state.lastResult?.reason==='return';}
export function setTrainingBreath(s,enabled){check(s);if(!s.paused||s.closed)throw Error('Pause para explicar o fôlego.');if(typeof enabled!=='boolean'||enabled&&s.albumEdition)throw TypeError('Treino com música mantém o fôlego protegido.');remember(s,{op:'breath',enabled});s.breathEnabled=enabled;run(s).trainingClock.breathEnabled=enabled;return trainingView(s);}
export function demonstrateTrainingBreath(s){
 check(s);if(!s.paused||s.closed||!s.breathEnabled||!s.state.run||s.state.run.room.cleared)throw Error('Explique e ative o fôlego antes da demonstração.');
 remember(s,{op:'demo'});const r=s.state.run,beat=Math.max(Math.ceil(phase(s)),r.acted,r.missed,r.beat)+1;r.rhythm=100;const before=r.rhythm;s.elapsed=(beat+.4)*60/s.bpm;r.beat=beat-1;r.enemyBeat=Math.max(r.enemyBeat,beat-1);
 const result=E.act(s.state,{type:'move',...r.player},phase(s));if(!result.miss)throw Error('Demonstração não produziu erro real.');
 s.paused=true;return {result,events:collect(s,r,[{type:'trainingBreathDemo',before,after:r.rhythm,sandbox:true}]),view:trainingView(s)};
}
export function configureTrainingLesson(s,id){
 check(s);if(!s.paused||s.closed||s.scene!=='practice'||!['rhythm','mining','bomb','heal','shield','breath','exit'].includes(id))throw Error('Prepare a sala prática e pause antes da lição.');
 remember(s,{op:'lesson',id});const r=s.state.run,first=!s.lessonsPrepared.includes(id);if(first)s.lessonsPrepared.push(id);s.lesson=id;
 if(id==='bomb')r.items.blast=Math.max(r.items.blast,3);
 if(id==='heal'){if(first)r.health=50;r.items.tonic=Math.max(r.items.tonic,3);}
 if(id==='shield')r.items.ward=Math.max(r.items.ward,3);
 if(id==='exit'){r.room.quota=8;r.room.goal=0;r.room.minBeats=0;}
 const target=r.room.nodes.find(n=>n.hp>0);return {events:[{type:'trainingLesson',id,sandbox:true}],view:trainingView(s),targets:{mineralId:target?.id,exit:{...r.room.exit},...(id==='bomb'?{item:'blast'}:id==='heal'?{item:'tonic'}:id==='shield'?{item:'ward'}:{})}};
}
