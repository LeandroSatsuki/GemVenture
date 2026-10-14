import {blessingEffects} from './pillars.js';
import {offerAbyssCards} from './abyss-cards.js';
import {BIOME_COUNT,FLOORS_PER_BIOME} from './campaign.js';
import {environment} from './cavern.js';
import {createAbyssLayout,shiftAbyssLayout,isFloor} from './cave-layout.js';
import {initCeiling} from './cave-ceiling.js';
import {progressionEffects} from './progression-effects.js';
import {depthDifficulty} from './balance.js';
import {reveal,sightRange} from './cavern.js';
// Run spice is deterministic and uses the same beat clock as combat.
export const isAbyss=r=>r?.mode==='abyss';
export const musicFloor=r=>isAbyss(r)?16:(r?.floor||1);
export const MUTATORS=[
 {id:'normal',name:'FLUXO',hint:'SIGA O PULSO',loot:1,damage:1},
 {id:'glass',name:'VIDRO',hint:'SAQUE +80% · DANO +50%',loot:1.8,damage:1.5},
 {id:'swarm',name:'ENXAME',hint:'MAIS BICHOS · MAIS SAQUE',loot:1.6,damage:1},
 {id:'sonic',name:'SÔNICO',hint:'GOLPES ECOAM · RITMO DUPLO',loot:1.3,damage:1.15}
];
export const BOOSTS=[
 {id:'giant',name:'PICARETA TITÃ',hint:'DANO ×3 · ÁREA',color:'#ece910'},
 {id:'lightning',name:'TEMPESTADE',hint:'RAIOS AUTOMÁTICOS',color:'#5ee9e9'},
 {id:'fire',name:'PASSO DE FOGO',hint:'ALCANCE ×2 · RASTRO',color:'#ef6e10'},
 {id:'magnet',name:'IMÃ TOTAL',hint:'PUXA CRISTAIS · SAQUE +35%',color:'#f94e6d'},
 {id:'shield',name:'BOLHA DOURADA',hint:'BLOQUEIA DANO · MANTENHA O RITMO',color:'#ece910'},
 {id:'wings',name:'ASAS DE CRISTAL',hint:'VOE SOBRE PEDRAS E TERRENOS',color:'#5ee9e9'}
];
const roll=seed=>{let n=seed|0;return()=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return((n^n>>>16)>>>0)/4294967296;};};
export const activeBoost=(r,id,beat=Math.max(0,r?.beat||0,r?.acted||0))=>(r?.frenzy?.buffs?.[id]??-1)>=beat;
export function sectionMutator(r,section=isAbyss(r)?(r.abyss?.section||1):r.floor){
 if(section===1||!isAbyss(r)&&section<=4||r.room.bossFloor)return MUTATORS[0];
 return MUTATORS[1+Math.floor(roll(r.room.seed+section*719)()*3)];
}
export function heatState(r){
 if(!r?.frenzy||r.room.bossFloor)return{heat:0,loot:1,damage:1};
 const depth=isAbyss(r)?r.abyss.section:r.floor;
 const heat=Math.min(100,Math.max(0,depth-1)*3+Math.max(0,r.beat-64)/6);
 const m=MUTATORS.find(m=>m.id===r.frenzy.mutator)||MUTATORS[0];
 const depthLoot=isAbyss(r)?1+Math.log2(Math.max(1,depth))*.1:1;
 const opening=isAbyss(r)&&depth===1;
 return{heat,loot:Math.min(3.5,(1+heat/250)*m.loot*(activeBoost(r,'magnet')?1.35:1)*depthLoot),damage:(1+heat/120)*m.damage*(opening?.65:1)};
}
export function initFrenzy(r){
 if(!r.spiceVersion)return;
 r.frenzy={mutator:'normal',buffs:{},quest:null,nextQuest:r.beat+25,comboReward:0,swarmKills:0,lastBeat:-1};
 r.frenzy.mutator=sectionMutator(r).id;
}
function emit(r,type,data={}){r.events.push({type,...data});}
export function grantBoost(r,beat){
 const f=r.frenzy,id=BOOSTS[(Math.floor(beat/16)+r.floor+f.comboReward)%BOOSTS.length].id;
 f.buffs[id]=beat+16;const b=BOOSTS.find(b=>b.id===id);
 emit(r,'boost',{id,name:b.name,color:b.color,...r.player});
}
export function recordFrenzy(s,target,award){
 const r=s.run,f=r?.frenzy;if(!f)return;
 if(target.type==='enemy'){f.swarmKills++;if(isAbyss(r)&&f.swarmKills%8===0)grantBoost(r,Math.max(r.acted,r.beat));}
 const q=f.quest;if(!q||q.done||Math.max(r.acted,r.beat)>q.until)return;
 if(q.kind==='hunt'&&target.type==='enemy'&&r.combo>0&&r.acted>=r.beat)q.progress++;
 if(q.kind==='vein'&&target.id===q.target)q.progress=q.goal;
 if(q.progress>=q.goal&&award){q.done=true;r.materials[isAbyss(r)?1:0]+=Math.round(15*(1+(progressionEffects(s).questYield||0)));award(s,350,Math.max(r.acted,r.beat));emit(r,'challengeWin',{name:'DESAFIO FEITO'});if(isAbyss(r))grantBoost(r,Math.max(r.acted,r.beat));}
}
export function initAbyss(r){
 r.mode='abyss';r.abyss={section:1,rows:0,lastShift:0,checkpoint:null,secured:0,cardSection:1,cardChoice:null};
 r.room.wave=null;r.room.bossFloor=false;r.room.quota=Number.MAX_SAFE_INTEGER;
 r.room.explored=Array(r.room.cols*r.room.rows).fill(0);r.room.visible=null;r.room.minBeats=0;r.player={x:20,y:15};
 createAbyssLayout(r.room);
 r.room.rocks=r.room.rocks.filter(n=>isFloor(r.room,n.x,n.y)&&(Math.abs(n.x-20)>3||Math.abs(n.y-15)>3));
 r.room.nodes=r.room.nodes.filter(n=>isFloor(r.room,n.x,n.y));initCeiling(r.room);
 r.room.enemies=[];
 r.room.nodes.slice(0,4).forEach((n,i)=>{const x=18+i*2,y=16,overlap=r.room.nodes.find(other=>other!==n&&other.x===x&&other.y===y);if(overlap){overlap.x=n.x;overlap.y=n.y;}n.x=x;n.y=y;});
 r.score.target=60000;reveal(r.room,r.player,sightRange(r));
}
function shiftWorld(r,beat,api,random){
 const room=r.room,{cols,rows}=room;
 for(const list of ['nodes','rocks','enemies','hazards']){
  for(const n of room[list]){
   n.y--;if(n.windup){n.windup.y--;if(n.windup.tiles)for(const p of n.windup.tiles)p.y--;}
  }
  room[list]=room[list].filter(n=>n.y>=1&&(n.hp===undefined||n.hp>0));
 }
 r.player.y--;shiftAbyssLayout(room,r.abyss.rows,r.player);
 if(room.ceiling){for(const p of room.ceiling.falls)p.y--;room.ceiling.falls=room.ceiling.falls.filter(p=>isFloor(room,p.x,p.y));}
 for(const p of r.frenzy.meteors||[])p.y--;
 room.terrain=room.terrain.slice(cols).concat(Array(cols).fill(0));
 if(room.explored)room.explored=room.explored.slice(cols).concat(Array(cols).fill(0));
 room.scoredTiles=(room.scoredTiles||[]).filter(n=>n>=cols).map(n=>n-cols);
 const y=rows-3;
 for(let i=0;i<5;i++){const x=2+Math.floor(random()*(cols-4));if(!isFloor(room,x,y)||Math.abs(x-r.player.x)<2)continue;if(!room.rocks.some(n=>n.x===x&&n.y===y))room.rocks.push({id:room.nextId++,type:'rock',kind:i%3,x,y,hp:8+r.abyss.section,maxHp:8+r.abyss.section,value:3});}
 for(let i=0;i<3;i++){const n=api.spawnCrystal(safeState(r),random);if(n){const x=4+Math.floor(random()*(cols-8));if(api.walkable(room,x,y)&&!room.nodes.some(other=>other!==n&&other.hp>0&&other.x===x&&other.y===y)){n.x=x;n.y=y;}}}
 // New strip carries biome hazards but always leaves a route through it.
 const terrain=environment(r.floor).terrain;
 for(let x=2;x<cols-2;x++)if(isFloor(room,x,y)&&Math.abs(x-r.player.x)>2&&random()<.18)room.terrain[y*cols+x]=terrain;
 r.abyss.rows++;r.abyss.lastShift=beat;room.environmentWarning=null;
 if(r.player.y<5){r.player.y=5;if(room.floorMask)room.floorMask[5*cols+r.player.x]=1;room.rocks=room.rocks.filter(n=>n.x!==r.player.x||n.y!==5);emit(r,'squeeze',{...r.player});}
 emit(r,'scroll',{rows:1});
}
// The spawn hook only needs run; progression stays in the owning state.
const safeState=r=>({run:r});
export function rescueAvailable(r){
 if(!r)return false;
 if(isAbyss(r))return !!r.abyss.checkpoint&&!r.abyss.checkpoint.used&&r.beat<=r.abyss.checkpoint.until;
 return r.room.cleared&&r.floor%5===0&&r.rescuedFloor!==r.floor;
}
export function secureCargo(s){
 const r=s.run;if(!rescueAvailable(r))return false;
 if(isAbyss(r))r.abyss.checkpoint.used=true;else r.rescuedFloor=r.floor;
 const coins=r.bag,materials=[...r.materials];s.bank+=coins;s.totalGems+=coins;materials.forEach((n,i)=>s.materials[i]+=n);
 r.secured??={coins:0,materials:[0,0,0,0]};r.secured.coins+=coins;materials.forEach((n,i)=>r.secured.materials[i]+=n);
 r.bag=0;r.materials=[0,0,0,0];if(progressionEffects(s).rescueTonic)r.items.tonic=Math.min(9,r.items.tonic+1);
 // Only unsent cargo is eligible for salvage and return presentation.
 for(const c of r.loot.crystals){c.count=0;c.gems=0;}for(const id of ['rocks','enemies'])r.loot[id]={count:0,gems:0};
 r.room.floorStart={...r.room.floorStart,bag:0,materials:[0,0,0,0]};
 emit(r,'cargo',{coins,materials});return true;
}
export function skipRescue(r){if(!rescueAvailable(r))return false;if(isAbyss(r))r.abyss.checkpoint.used=true;else r.rescuedFloor=r.floor;return true;}
// Deadline follows the shared musical clock, including saves and scrolling.
export function expireRareVeins(r,beat){
 const q=r.frenzy?.quest;
 for(const n of r.room.nodes){
  if(!n.rare)continue;
  n.rareUntil??=q?.kind==='vein'&&q.target===n.id?q.until:Math.max(0,r.beat)+48;
  if(beat>n.rareUntil)n.hp=0;
 }
 r.room.nodes=r.room.nodes.filter(n=>!n.rare||n.hp>0);
}
export function frenzyTick(s,beat,api){
 const r=s.run,f=r?.frenzy;if(!f||r.room.cleared||r.recovery?.active||r.rest?.active||r.abyss?.cardChoice||beat<=f.lastBeat)return;
 f.lastBeat=beat;const random=roll(r.room.seed+beat*6971),a=r.abyss;
 if(isAbyss(r)){
  if(beat>0&&beat%4===0){const squeezed=r.player.y<=5;shiftWorld(r,beat,api,random);s.abyssBest=Math.max(s.abyssBest||0,a.rows*5);if(squeezed){api.lose(s,a.section===1?6:14,'attack');if(!s.run)return;}}
  if(beat%96===88){const m=sectionMutator(r,a.section+1);f.pendingSection={name:m.name,until:beat+8};emit(r,'sectionWarning',{name:m.name,hint:m.hint});}
  if(beat>0&&beat%96===0){
   a.section++;if(r.room.hedgehog)r.room.hedgehog.biome=(a.section-1)%BIOME_COUNT;if(r.room.ceiling){r.room.ceiling.landed=0;r.room.ceiling.stock=Math.max(36,r.room.rocks.filter(n=>n.hp>0).length);}if(blessingEffects(r).floorShield){r.guardUntil=Math.max(r.guardUntil,beat+blessingEffects(r).floorShield-3);emit(r,'shield',{...r.player});}r.floor=1+((a.section-1)%BIOME_COUNT)*FLOORS_PER_BIOME;r.room.scoreLimit+=4000;
   f.mutator=sectionMutator(r).id;f.pendingSection=null;
   emit(r,'section',{section:a.section,name:sectionMutator(r).name});
   offerAbyssCards(s);
   if(a.section%3===0){a.checkpoint={section:a.section,until:beat+24,used:false};emit(r,'checkpoint');}
  }
  // First section teaches mining and dodging before full waves and meteors arrive.
  const opening=a.section===1;
  if(beat>=(opening?16:8)&&beat%(opening?16:8)===0){
   const count=opening?(beat<48?2:3):Math.min(12,4+Math.floor(a.section/2)+(f.mutator==='swarm'?4:0));
   for(let i=0;i<count&&r.room.enemies.length<48;i++){
    const p={x:i%2?Math.min(r.room.cols-3,r.player.x+9):Math.max(2,r.player.x-9),y:Math.max(7,Math.min(25,r.player.y+Math.floor(random()*9)-4))};
    if(api.walkable(r.room,p.x,p.y)){api.spawnEnemy(s,random,p);const e=r.room.enemies.at(-1);e.hp=Math.max(1,Math.round(e.hp*(opening?.75:1)));e.maxHp=e.hp;}
   }
   emit(r,'horde',{number:Math.floor(beat/8),count});
  }
  if(!opening&&beat>0&&beat%32===28){
   f.meteors=Array.from({length:5},(_,i)=>({x:Math.max(2,Math.min(39,r.player.x+i*2-4)),y:Math.max(6,Math.min(26,r.player.y+(i%2?3:1))),due:beat+4}));
   emit(r,'meteorWarning',{name:'CHUVA DE METEOROS'});
  }
  if(f.meteors?.[0]?.due===beat){
   for(const p of f.meteors){emit(r,'meteor',{...p});if(Math.abs(r.player.x-p.x)+Math.abs(r.player.y-p.y)<=1&&r.guardUntil<beat)api.lose(s,18*heatState(r).damage,'attack');if(!s.run)return;
    for(const n of [...r.room.nodes,...r.room.enemies,...r.room.rocks])if(n.hp>0&&Math.abs(n.x-p.x)+Math.abs(n.y-p.y)<=2)api.damageTarget(s,n,api.power(s)*4,true);
   }f.meteors=[];
  }
  if(beat%192===184){f.invaderAt=beat+8;emit(r,'invaderWarning',{name:'TITÃ CHEGANDO'});}
  if(beat>0&&beat%192===0){const p={x:Math.max(3,r.player.x-7),y:Math.min(25,r.player.y+4)};if(api.walkable(r.room,p.x,p.y)){api.spawnEnemy(s,random,p);const e=r.room.enemies.at(-1);e.kind=2;e.elite=true;e.hp=e.maxHp=Math.round(80*depthDifficulty(r).health);emit(r,'invader',{...p,name:'TITÃ DO ABISMO'});}}
  if(r.combo>0&&r.combo%20===0&&r.acted===beat){f.comboReward++;grantBoost(r,beat);}
  if(activeBoost(r,'lightning',beat)&&beat%2===0){for(const n of [...r.room.enemies,...r.room.nodes].filter(n=>n.hp>0).sort((x,y)=>Math.abs(x.x-r.player.x)+Math.abs(x.y-r.player.y)-Math.abs(y.x-r.player.x)-Math.abs(y.y-r.player.y)).slice(0,6)){api.damageTarget(s,n,api.power(s)*2,true);emit(r,'echo',{from:r.player,x:n.x,y:n.y});}}
  if(activeBoost(r,'magnet',beat)&&beat%2===0){for(const n of r.room.nodes.filter(n=>n.hp>0).slice(0,24)){const dx=Math.sign(r.player.x-n.x),dy=Math.sign(r.player.y-n.y);if(Math.abs(n.x-r.player.x)+Math.abs(n.y-r.player.y)>2&&api.walkable(r.room,n.x+dx,n.y+dy)){n.x+=dx;n.y+=dy;}}}
 }
 let q=f.quest;
 if(q&&!q.done&&q.progress>=q.goal){q.done=true;r.materials[isAbyss(r)?1:0]+=Math.round(15*(1+(progressionEffects(s).questYield||0)));api.awardScore(s,350,beat);emit(r,'challengeWin',{name:'DESAFIO FEITO'});if(isAbyss(r))grantBoost(r,beat);}
 if(q&&!q.done&&beat>q.until){q.done=true;emit(r,'challengeEnd');}
 if(beat>=f.nextQuest){
  const kind=Math.floor(beat/64)%2?'hunt':'vein';q=f.quest={kind,name:kind==='hunt'?'CAÇA NO PULSO':'VEIO RARO',goal:kind==='hunt'?6:1,progress:0,until:beat+48,done:false};
  if(kind==='vein'){const n=api.spawnCrystal(s,random,2);if(n){n.rare=true;n.rareUntil=q.until;n.explosive=isAbyss(r);n.value*=3;q.target=n.id;const p={x:Math.min(r.room.cols-3,r.player.x+3),y:Math.min(r.room.rows-3,r.player.y+2)};if(api.walkable(r.room,p.x,p.y)){n.x=p.x;n.y=p.y;}}else q.done=true;}
  f.nextQuest=beat+72;emit(r,'challenge',{name:q.name});
 }
}
export function validFrenzy(r){
 if(!r.frenzy)return !isAbyss(r);
 const f=r.frenzy;
 if(!MUTATORS.some(m=>m.id===f.mutator)||!f.buffs||Object.entries(f.buffs).some(([id,n])=>!BOOSTS.some(b=>b.id===id)||!Number.isSafeInteger(n)||n<0))return false;
 if(!Number.isFinite(f.nextQuest)||!Number.isFinite(f.lastBeat)||!Number.isInteger(f.comboReward)||f.comboReward<0)return false;
 if(f.quest&&(!['hunt','vein'].includes(f.quest.kind)||!Number.isFinite(f.quest.until)||!Number.isInteger(f.quest.progress)||f.quest.progress<0||!Number.isInteger(f.quest.goal)||f.quest.goal<1))return false;
 if(f.quest?.collected!==undefined&&(!Number.isSafeInteger(f.quest.collected)||f.quest.collected<0))return false;
 if(r.room?.nodes?.some(n=>n.rareUntil!==undefined&&(!Number.isSafeInteger(n.rareUntil)||n.rareUntil<0)))return false;
 if(r.room?.nodes?.some(n=>(n.yieldFraction!==undefined&&(!Number.isFinite(n.yieldFraction)||n.yieldFraction<0))||(n.yieldPaid!==undefined&&(!Number.isSafeInteger(n.yieldPaid)||n.yieldPaid<0||n.yieldPaid!==Math.floor((n.yieldFraction||0)+1e-8)))))return false;
 if(f.meteors&&(!Array.isArray(f.meteors)||f.meteors.length>5||f.meteors.some(m=>![m.x,m.y,m.due].every(Number.isFinite))))return false;
 if(isAbyss(r)){const a=r.abyss;if(!a||!Number.isSafeInteger(a.section)||a.section<1||!Number.isSafeInteger(a.rows)||a.rows<0||!Number.isFinite(a.lastShift))return false;if(a.checkpoint&&(!Number.isInteger(a.checkpoint.section)||!Number.isFinite(a.checkpoint.until)||typeof a.checkpoint.used!=='boolean'))return false;}
 return true;
}

