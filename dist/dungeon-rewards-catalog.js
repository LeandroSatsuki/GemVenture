// Proposed consumer projection only. Does not roll, grant, equip, persist or rebalance anything.
import {MATERIALS} from './materials.js';
import {TOTAL_FLOORS,FLOORS_PER_BIOME,biomeIndex} from './campaign.js';
import {isBossFloor} from './bosses.js';
import {RECORDS} from './records.js';
import {CARDS,cardCount,cardLimit} from './cards.js';
import {createScore,floorScoreLimit,starMarks,scoreBeats} from './stars.js';
import {progressionEffects} from './progression-effects.js';
import {liftPresentationModel} from './expedition-map.js';

const origin=(module,symbol,predicate)=>({module,symbol,predicate});
const callAsset=(module,exportName,args,method)=>({kind:'existing-module-art',module,export:exportName,args,...(method?{method}:{})});
const materialAsset=index=>callAsset('collected-gems.js','collectedGemSvg',[index]);
const itemAsset=id=>callAsset('approved-interface-icons.js','approvedConsumableGlyph',[id]);
const ordinaryAsset=id=>callAsset('ui-art.js','glyph',[id]);
function entry(id,name,acquisition,asset,condition,sources){return{id,name,acquisition,asset,condition,sources,guaranteedPerAttempt:false,
 delivery:acquisition==='rare-valid-clear'?'gameplay-roll':acquisition==='choice-after-clear'?'offer-and-player-choice':'conditional-rule',
 guaranteedAfterValidClear:acquisition==='valid-clear'||acquisition==='experience'};}

export function floorRewardCatalog(s,floor,{context='next-attempt'}={}){
 if(!Number.isSafeInteger(floor)||floor<1||floor>TOTAL_FLOORS||!['next-attempt','active-floor'].includes(context))return null;
 const active=context==='active-floor',run=active?s.run:null;
 if(active&&(!run||run.mode!=='floors'||run.floor!==floor||run.room?.cleared||run.trainingClock!==undefined))return{scope:'floor',floor,context,available:false,reason:'not-active-campaign-floor',entries:[],excluded:[]};
 // progressionEffects assigns visionBonus when run exists: inspect a non-running shallow view.
 const effects=progressionEffects({...s,run:null}),boss=isBossFloor(floor),entries=[],excluded=[];
 for(let i=0;i<MATERIALS.length;i++)entries.push(entry('material-'+i,MATERIALS[i].name,'collect',materialAsset(i),'Minerar cristais desta cor',[
  origin('core.js','generateRoom/spawnCrystal','Initial generation includes the material families; procedural growth/rare veins can replenish'),origin('core.js','collectCrystal','Credits run.materials[target.kind] only on a successful collection')]));
 entries[0].sources.push(origin('frenzy.js','recordFrenzy/frenzyTick','Campaign real-time challenge completion credits Quartz'));
 entries.push(entry('coins','Moedas','collect',ordinaryAsset('coin'),'Quebrar pedras ou derrotar criaturas',[origin('core.js','damageTarget','Rock/enemy/boss death credits run.bag; return retention is separate')]));
 for(const record of RECORDS)if(record.floor===floor){
  if(s.records.owned.includes(record.id)){excluded.push({id:'record-'+record.id,reason:'already-owned'});continue;}
  entries.push(entry('record-'+record.id,record.name,'rare-valid-clear',{kind:'existing-css-art',module:'records-view.js',stylesheet:'records.css',selector:'.record-cover',recordId:record.id,color:record.color},'Concluir este andar; disco raro ainda não possuído',[origin('records.js','floorRecordDrop','Matching floor, unowned record and gameplay roll; catalog never calls the roll')]));
 }
 const score=run?.score??createScore(),scoreRun=run??{floor,room:{},score,beat:0,acted:0},next=starMarks(scoreRun)[score.earned],remaining=score.version>=2?Math.max(0,floorScoreLimit(scoreRun)-(scoreRun.room.scoreSpent||0)):Infinity;
 const canScore=Math.max(scoreRun.beat||0,scoreRun.acted||0)<scoreBeats(scoreRun);
 if(next!==undefined&&canScore&&score.points+remaining>=Math.round(score.target*next))entries.push(entry('stars','Estrelas','score',ordinaryAsset('star'),'Melhorar seu recorde neste andar; até cinco estrelas únicas',[origin('stars.js','awardScore','Credits only improvements to the saved floor rating; replaying never duplicates stars')]));
 else excluded.push({id:'stars',reason:'no-reachable-remaining-score-milestone'});
 entries.push(entry('xp','Experiência','experience',callAsset('approved-interface-entry.js','approvedInterfaceIcons',['scholar'],'astral'),'Minerar, derrotar criaturas ou concluir o andar',[origin('pillars.js','grantXP','XP gain/level progress, not a physical item drop')]));
 const cardsRun=run??{cards:{}};
 for(const card of CARDS){if(cardCount(cardsRun,card.id)>=cardLimit(card,s)){excluded.push({id:'card-'+card.id,reason:'active-card-limit'});continue;}entries.push(entry('card-'+card.id,card.name,'choice-after-clear',callAsset('approved-interface-icons.js','approvedCardArt',[card.id]),'Aparecer na oferta ao concluir e ser escolhida; temporária',[origin('cards.js','cardOffer/cardLimit','Eligible current pool; offer selects alternatives, never grants the whole list')]));}
 return{scope:'floor',floor,biome:biomeIndex(floor),context,available:true,entries,excluded,
  groups:{collectible:entries.filter(e=>['collect','valid-clear','rare-valid-clear'].includes(e.acquisition)).map(e=>e.id),earned:entries.filter(e=>['score','experience'].includes(e.acquisition)).map(e=>e.id),choices:entries.filter(e=>e.acquisition==='choice-after-clear').map(e=>e.id)}};
}

export function selectedDungeonRewards(s,requestedFloor=1,{scope='floor',context='next-attempt'}={}){
 const selected=liftPresentationModel(s,requestedFloor).selectedFloor;
 if(scope==='floor')return floorRewardCatalog(s,selected,{context});
 if(scope!=='biome'||context!=='next-attempt')return null;
 const biome=biomeIndex(selected),first=biome*FLOORS_PER_BIOME+1,byId=new Map();
 for(let floor=first;floor<first+FLOORS_PER_BIOME;floor++){const catalog=floorRewardCatalog(s,floor,{context});for(const item of catalog.entries){let row=byId.get(item.id);if(!row){row={...item,eligibleFloors:[],conditionsByFloor:[]};byId.set(item.id,row);}row.eligibleFloors.push(floor);row.conditionsByFloor.push({floor,condition:item.condition,sources:item.sources});}}
 return{scope:'biome',biome,selectedFloor:selected,context,available:true,entries:[...byId.values()]};
}
