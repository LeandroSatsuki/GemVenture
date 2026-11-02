import {questResourceReward,validQuestReward,grantQuestCollectibles} from './mission-rewards.js';
import {recordPetBank,recordPetProgress} from './pet-bonds.js';
import {depthLimit} from './campaign.js';
import {buildingLevel,MISSION_BUILDING_CAP,missionSlots} from './village.js';
import {missionRecordDrop} from './records.js';
export const MISSION_VERSION=3;
export const MISSION_MAX_SECONDS=7200;
export const MISSION_TIERS={common:{name:'COMUM',scale:1,time:240,gems:200,color:'#5ee9e9'},rare:{name:'RARA',scale:1.4,time:300,gems:500,color:'#2890dc'},gold:{name:'DOURADA',scale:1.8,time:360,gems:1100,color:'#e8ff75'}};
export const MISSION_TYPES=[
 {id:'miner',name:'Febre de cristais',metric:'mine',goal:15,verb:'Quebre cristais',icon:'gem'},
 {id:'quartz',name:'Brilho azul',metric:'mine',kind:0,goal:8,verb:'Quebre quartzos',icon:'gem'},
 {id:'prism',name:'Tesouro rubro',metric:'mine',kind:1,goal:6,verb:'Quebre rubis',icon:'fortune'},
 {id:'geode',name:'Casca dura',metric:'mine',kind:2,goal:4,verb:'Quebre topázios',icon:'shatter'},
 {id:'vital',name:'Jardim de gemas',metric:'mine',kind:3,goal:6,verb:'Quebre esmeraldas',icon:'harvest'},
 {id:'rocks',name:'Abra caminho',metric:'rock',goal:12,verb:'Quebre rochas',icon:'force'},
 {id:'brute',name:'Pedreira pesada',metric:'rock',kind:2,goal:5,verb:'Quebre rochas brutas',icon:'stun'},
 {id:'hunter',name:'Limpa-caverna',metric:'kill',goal:8,verb:'Derrote criaturas',icon:'hunter'},
 {id:'slime',name:'Faxina pegajosa',metric:'kill',kind:0,goal:6,verb:'Derrote gosmas',icon:'tonic'},
 {id:'bats',name:'Silêncio nas asas',metric:'kill',kind:1,goal:4,verb:'Derrote morcegos',icon:'ward'},
 {id:'guardians',name:'Quebra-gigantes',metric:'kill',kind:2,goal:3,minFloor:10,verb:'Derrote guardiões',icon:'blast'},
 {id:'beats',name:'No compasso',metric:'beat',goal:60,verb:'Acerte pulsos',icon:'ear'},
 {id:'combo',name:'Não para!',metric:'combo',goal:30,verb:'Alcance o combo',icon:'flow'},
 {id:'points',name:'Chuva de pontos',metric:'points',goal:3500,verb:'Ganhe pontos',icon:'fortune'},
 {id:'floors',name:'Portas abertas',metric:'clear',goal:3,verb:'Complete andares',icon:'lift'},
 {id:'items',name:'Mochila esperta',metric:'item',goal:5,verb:'Use consumíveis',icon:'empty'},
 {id:'bombs',name:'Festa explosiva',metric:'item',eventMetric:'bombEffect',kind:'blast',goal:3,verb:'Acerte alvos ou ative objetos com bombas',icon:'blast'},
 {id:'cures',name:'Fôlego de sobra',metric:'item',eventMetric:'healed',kind:'tonic',goal:3,verb:'Recupere vida com Pulso vital',icon:'tonic'},
 {id:'depth4',name:'Primeira fronteira',metric:'floor',goal:5,fixed:true,verb:'Alcance o andar',icon:'lift'},
 {id:'depth8',name:'Além da floresta',metric:'floor',goal:10,fixed:true,minFloor:10,verb:'Alcance o andar',icon:'tree'}
];
function random(seed){let n=seed>>>0;return()=>{n=Math.imul(n,1664525)+1013904223|0;return(n>>>0)/4294967296;};}
export function missionOdds(s){
 const n=Math.max(0,Math.min(MISSION_BUILDING_CAP,buildingLevel(s,'missions'))-1),early=Math.min(9,n),tail=1-Math.exp(-Math.max(0,n-9)/65),lucky=s.unlocked.includes('questluck');
 return{gold:.05+early*.008+.128*tail+(lucky?.05:0),rare:.25+early*.012+.092*tail+(lucky?.1:0)};
}
export function missionScale(def,level){
 const n=Math.max(0,Math.min(MISSION_BUILDING_CAP,level)-1);
 if(def.fixed)return 1;
 if(def.metric==='combo')return 1+.012*n;
 if(['clear','item'].includes(def.metric))return 1+.018*n+.0001*n*n;
 return 1+.03*n+.00035*n*n;
}
// Active-play budgets, not real-world deadlines. Collection and floor missions
// can span several descents; rhythm budgets never demand faster-than-music inputs.
const MISSION_PACE={mine:12,rock:10,kill:14,beat:.8,combo:2.2,points:.08,clear:240,item:45,floor:50};
const MISSION_PAY={beat:.35,combo:.45,clear:2.5,item:1.25};
export function missionTerms(template,tier,level){
 const def=MISSION_TYPES.find(d=>d.id===template),t=MISSION_TIERS[tier];
 if(!def||!t||!Number.isInteger(level)||level<1||level>MISSION_BUILDING_CAP)return null;
 const scale=missionScale(def,level),goal=def.fixed?def.goal:Math.ceil(def.goal*t.scale*scale);
 const pace=MISSION_PACE[def.metric]*(def.kind!==undefined&&def.metric!=='item'?1.5:1);
 const speed=['beat','combo','floor'].includes(def.metric)?1:1+.006*(level-1);
 const duration=Math.min(MISSION_MAX_SECONDS,Math.ceil(Math.max(t.time,60+goal*pace/speed)/30)*30);
 const early=Math.min(level,10),growth=(1+.08*(early-1))*(scale/missionScale(def,early))**.9;
 const reward={gems:Math.round(t.gems*growth*(MISSION_PAY[def.metric]||1)),...questResourceReward(template,tier,growth)};
 return{goal,duration,reward};
}
export function missionReward(m){
 if(m.version===MISSION_VERSION)return {...m.reward,materials:[...m.reward.materials]};
 if(m.version===2)return {gems:m.reward.gems};
 // Already accepted legacy contracts keep their promised payout.
 const t=MISSION_TIERS[m.tier],n=(m.rewardLevel||1)-1;return{gems:Math.round(t.gems*(1+n*.08))};
}
export function missionOffers(s){
 const level=buildingLevel(s,'missions'),count=Math.min(6,3+Math.floor((level-1)/3)),key=MISSION_VERSION+':'+(s.missionRoll||0)+':'+s.missionsCompleted+':'+level;
 if(s.missionBoard?.key===key&&s.missionBoard.offers.length===count){
  for(const offer of s.missionBoard.offers)if(offer.template==='combo')offer.goal=Math.max(offer.goal,missionTerms('combo',offer.tier,offer.rewardLevel||level).goal);
  return s.missionBoard.offers;
 }
 // Introductory depth contracts retire before they become instant checkpoint payouts.
 const occupied=new Set(missionList(s).filter(m=>m.status!=='expired').map(m=>m.template));
 const rand=random(s.seed+(s.missionRoll||0)*31337+s.missionsCompleted*7919),pool=MISSION_TYPES.filter(m=>(m.minFloor||5)<=depthLimit(s)&&(!m.fixed||level<=10)&&!occupied.has(m.id)),odds=missionOdds(s),offers=[];
 const available=Math.min(count,pool.length);
 for(let i=0;i<available;i++){
  const def=pool.splice(Math.floor(rand()*pool.length),1)[0],roll=rand(),tier=roll<odds.gold?'gold':roll<odds.gold+odds.rare?'rare':'common',terms=missionTerms(def.id,tier,level);
  offers.push({id:key+':'+i,version:MISSION_VERSION,rewardLevel:level,rewardSeed:s.seed>>>0,template:def.id,tier,goal:terms.goal,reward:terms.reward,progress:0,remaining:terms.duration,duration:terms.duration,status:'active'});
 }
 s.missionBoard={key,offers};return offers;
}
// Keep the original first-contract field so old saves retain their exact terms.
export function missionList(s){return [...(s.mission?[s.mission]:[]),...(s.extraMissions||[])];}
function setMissions(s,list){s.mission=list[0]||null;s.extraMissions=list.slice(1);}
function refreshOffers(s){s.missionRoll=((s.missionRoll||0)+1)>>>0;s.missionBoard={key:'',offers:[]};missionOffers(s);}
export function acceptMission(s,id){
 if(s.run)return false;const current=missionList(s).filter(m=>m.status!=='expired');
 if(current.length>=missionSlots(s))return false;
 const offer=missionOffers(s).find(m=>m.id===id);if(!offer||current.some(m=>m.template===offer.template))return false;
 setMissions(s,[...current,{...offer,...(offer.reward?{reward:structuredClone(offer.reward)}:{})}]);refreshOffers(s);return true;
}
export function recordMission(s,metric,amount=1,kind){
 if(!s.run||!Number.isFinite(amount)||amount<=0)return;
 for(const m of missionList(s)){
  if(m.status!=='active')continue;const def=MISSION_TYPES.find(d=>d.id===m.template);
  if((def.eventMetric||def.metric)!==metric||def.kind!==undefined&&def.kind!==kind)continue;
  m.progress=Math.min(m.goal,['combo','floor'].includes(metric)?Math.max(m.progress,amount):m.progress+amount);
  if(m.progress>=m.goal){m.status='ready';s.run.events.push({type:'missionReady',name:def.name});}
 }
}
export function tickMission(s,seconds){
 if(!s.run||s.run.room.cleared||!Number.isFinite(seconds)||seconds<=0)return;
 for(const m of missionList(s))if(m.status==='active'){
  m.remaining=Math.max(0,m.remaining-seconds);if(m.remaining===0){m.status='expired';s.run.events.push({type:'missionExpired'});}
 }
}
export function claimMission(s,id){
 const list=missionList(s),m=id===undefined?list[0]:list.find(m=>m.id===id);
 if(s.run||!m||m.status!=='ready')return false;
 const t=missionReward(m);s.bank+=t.gems;s.totalGems+=t.gems;s.missionsCompleted++;
 if(t.materials){t.materials.forEach((n,i)=>s.materials[i]+=n);recordPetBank(s,t.materials);}else recordPetProgress(s);
 if(m.version===3)grantQuestCollectibles(s,m);else missionRecordDrop(s,m);
 setMissions(s,list.filter(x=>x!==m));refreshOffers(s);return true;
}
export function abandonMission(s,id){
 const list=missionList(s),m=id===undefined?list[0]:list.find(m=>m.id===id);
 if(s.run||!m||m.status==='ready')return false;setMissions(s,list.filter(x=>x!==m));return true;
}
export function validMissionRoster(s){
 if(!Array.isArray(s.extraMissions)||s.extraMissions.length>4||!Number.isInteger(s.missionRoll)||s.missionRoll<0||s.missionRoll>0xffffffff)return false;
 const list=missionList(s);
 return list.length<=missionSlots(s)&&list.every(validMission)&&new Set(list.map(m=>m.template)).size===list.length&&new Set(list.map(m=>m.id)).size===list.length;
}
export function validMission(m){
 if(!m||!MISSION_TYPES.some(d=>d.id===m.template)||!Object.hasOwn(MISSION_TIERS,m.tier)||!['active','ready','expired'].includes(m.status)||!Number.isInteger(m.goal)||m.goal<=0||m.goal>100000||!(m.template==='cures'?Number.isFinite(m.progress):Number.isInteger(m.progress))||m.progress<0||m.progress>m.goal||!Number.isFinite(m.remaining)||m.remaining<0)return false;
 if(m.version===undefined)return (m.rewardLevel===undefined||Number.isInteger(m.rewardLevel)&&m.rewardLevel>=1&&m.rewardLevel<=10)&&m.remaining<=360;
 if(![2,MISSION_VERSION].includes(m.version)||!Number.isInteger(m.rewardLevel)||m.rewardLevel<1||m.rewardLevel>MISSION_BUILDING_CAP||!Number.isInteger(m.duration)||m.duration<1||m.duration>MISSION_MAX_SECONDS||m.remaining>m.duration)return false;
 if(m.version===3&&(!Number.isInteger(m.rewardSeed)||m.rewardSeed<0||m.rewardSeed>0xffffffff||!validQuestReward(m.reward)||m.collectiblesResolved!==undefined))return false;
 return !!m.reward&&Number.isSafeInteger(m.reward.gems)&&m.reward.gems>0&&m.reward.gems<=100000;
}
