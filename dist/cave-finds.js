import {isFloor} from './cave-layout.js';
import {visible} from './cavern.js';
import {runBeatTime} from './training-clock.js';
import {biomeIndex} from './campaign.js';
import {biomeMineral,MATERIALS} from './materials.js';
import {RECORDS,recordById,grantRecord} from './records.js';
import {inZagArea} from './cave-zag.js';
import {P} from './palette.js';

export const FIND_RULES=Object.freeze({version:1,heal:20,comboSeconds:10,blastRadius:3,recordChance:.0025,maxProps:5});
export const FIND_TYPES=Object.freeze({
 chest:{name:'Baú de cristais',color:P.lemon},
 heal:{name:'Cogumelo vital',color:P.lime},
 combo:{name:'Cogumelo do compasso',color:P.cyan},
 blast:{name:'Cogumelo explosivo',color:P.orange}
});
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const index=(room,p)=>p.y*room.cols+p.x;
const hash=n=>{n=Math.imul(n^(n>>>16),0x45d9f3b);return(n^(n>>>16))>>>0;};
export const findsEnabled=run=>!!run&&run.mode!=='abyss'&&!run.trainingClock;
export const isCaveFind=n=>n?.type==='caveFind';
export const caveFindTargets=room=>(room?.caveFinds||[]).filter(p=>!p.used&&p.hp>0);
export const reservedByFind=(room,p)=>(room.caveFinds||[]).some(n=>distance(n,p)<=1);
export const createFindState=()=>({version:1,elapsed:0,comboUntil:-1});
export function findClock(run,phase=Math.max(0,run?.beat??0,run?.acted??0,run?.missed??0)){
 const elapsed=run?.findState?.elapsed||0;
 if(run.room?.cleared)return elapsed;
 return elapsed+Math.max(0,runBeatTime(run,phase)-runBeatTime(run,Math.max(0,run.beat)));
}
export function advanceFindClock(run,beat){if(findsEnabled(run)&&run.findState)run.findState.elapsed=findClock(run,beat);}
export function settleFindFloor(run,phase){if(findsEnabled(run)&&run.findState)run.findState.elapsed=findClock(run,phase??undefined);}
export const comboGuardRemaining=(run,phase)=>findsEnabled(run)&&run.findState?Math.max(0,Math.min(FIND_RULES.comboSeconds,run.findState.comboUntil-findClock(run,phase))):0;
export const comboGuardActive=(run,phase)=>comboGuardRemaining(run,phase)>1e-8;

// Versioned and independent of ownership: reloading or acquiring another disc
// never redraws the base reward or the optional rare result of an existing chest.
export function chestReward(seed,floor,number){
 const pool=RECORDS.filter(r=>r.floor&&r.floor<=floor),roll=hash(seed^Math.imul(number+1,739391)^0x9ea21)/4294967296;
 return {version:1,kind:biomeMineral(floor),amount:3+biomeIndex(floor),record:pool.length&&roll<FIND_RULES.recordChance?pool[hash(seed^number^0x7af2)%pool.length].id:null};
}
function distances(room,start){
 const blocked=new Set(room.rocks.filter(n=>n.hp==null||n.hp>0).map(n=>index(room,n))),out=new Int32Array(room.cols*room.rows).fill(-1),queue=[start];out[index(room,start)]=0;
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy},id=index(room,n);if(isFloor(room,n.x,n.y)&&out[id]<0&&!blocked.has(id)){out[id]=out[index(room,p)]+1;queue.push(n);}}}return out;
}
export function placeCaveFinds(run){
 if(!findsEnabled(run))return;run.findState??=createFindState();
 const room=run.room;if(room.bossFloor||!room.campaignCave||room.campaignCave.arena)return;
 const dist=distances(room,run.player),occupied=[...room.nodes,...room.rocks,...room.enemies].filter(n=>n.hp==null||n.hp>0),seed=hash(room.seed^0xbaf231),placed=[],usedHalls=new Set();
 const specs=[['heal',10,80],['combo',18,125],['blast',14,110],['chest',24,175]];if(run.floor>1&&seed%3===0)specs.push(['chest',55,240]);
 for(const [number,[kind,min,max]]of specs.entries()){
  const choices=[];
  for(const hall of room.layout.rooms)for(const dy of [-2,0,2])for(const dx of [-2,0,2]){
   const p={x:hall.x+dx,y:hall.y+dy},d=dist[index(room,p)];if(d<min||d>max||distance(p,room.exit)<5||distance(p,room.hedgehog)<14||inZagArea(room,p)||occupied.some(n=>distance(n,p)<2)||placed.some(n=>distance(n,p)<6))continue;
   let safe=true;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const q={x:p.x+x,y:p.y+y};if(!isFloor(room,q.x,q.y)||dist[index(room,q)]<0||inZagArea(room,q))safe=false;}if(!safe)continue;
   choices.push({...p,d,hall:hall.id,key:hash(seed^index(room,p)^Math.imul(number+1,977)),preferred:!usedHalls.has(hall.id)?0:1});
  }
  choices.sort((a,b)=>a.preferred-b.preferred||a.d-b.d||a.key-b.key);const near=choices.filter(p=>p.preferred===(choices[0]?.preferred)).slice(0,kind==='heal'?8:24);if(!near.length)continue;
  const p=near[hash(seed+number)%near.length],find={id:'find:'+room.seed+':'+number,type:'caveFind',kind,x:p.x,y:p.y,hp:1,maxHp:1,used:false,number,...(kind==='chest'?{reward:chestReward(room.seed,run.floor,number)}:{})};placed.push(find);usedHalls.add(p.hall);
 }
 room.caveFinds=placed;const protectedTiles=new Set(room.layout.protectedTiles||[]);for(const p of placed)for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if(isFloor(room,p.x+x,p.y+y))protectedTiles.add((p.y+y)*room.cols+p.x+x);room.layout.protectedTiles=[...protectedTiles];
}
export function caveFindTip(run,find){
 if(find.kind!=='chest')return '';
 const def=FIND_TYPES.chest,effect='BATA · +'+find.reward.amount+' '+MATERIALS[find.reward.kind].name.toUpperCase();
 return '<strong style="color:'+def.color+'">'+def.name.toUpperCase()+'</strong><span>'+effect+'</span>';
}
export function useCaveFind(state,find,phase,callbacks,{area=false}={}){
 const run=state.run;if(!findsEnabled(run)||!isCaveFind(find)||find.used||find.hp<=0||!visible(run.room,find)||!run.room.caveFinds?.includes(find)||(area&&find.kind==='chest'))return false;
 if(find.kind==='heal'&&run.health>=callbacks.maxHealth(state)){
  if(!area)run.events.push({type:'proc',id:'find-full',name:'VIDA CHEIA',color:P.lime,x:find.x,y:find.y});return false;
 }
 if(find.kind==='chest'&&(!Number.isSafeInteger(run.materials?.[find.reward.kind])||run.materials[find.reward.kind]>Number.MAX_SAFE_INTEGER-find.reward.amount))return false;
 // Consume before effects. Local blasts cannot recurse into other finds.
 find.used=true;find.hp=0;run.findState??=createFindState();
 const def=FIND_TYPES[find.kind];let label='';
 if(find.kind==='chest'){
  const reward=find.reward;run.materials[reward.kind]+=reward.amount;if(run.loot?.crystals?.[reward.kind])run.loot.crystals[reward.kind].gems+=reward.amount;
  label='+'+reward.amount+' '+MATERIALS[reward.kind].name.toUpperCase();run.events.push({type:'loot',x:find.x,y:find.y,value:reward.amount,color:MATERIALS[reward.kind].color});
  const record=recordById(reward.record);if(record&&grantRecord(state,record.id))run.events.push({type:'recordDrop',id:record.id,name:record.name});
 }else if(find.kind==='heal'){
  const value=Math.min(FIND_RULES.heal,callbacks.maxHealth(state)-run.health);run.health+=value;label='VIDA +'+value;run.events.push({type:'heal',...run.player,value});
 }else if(find.kind==='combo'){
  run.findState.comboUntil=Math.max(run.findState.comboUntil,findClock(run,phase)+FIND_RULES.comboSeconds);label='COMBO PROTEGIDO · 10 s';
 }else{
  const damage=6+run.floor*2;label='EXPLOSÃO NAS CRIATURAS';run.events.push({type:'bomb',x:find.x,y:find.y,source:'mushroom',radius:FIND_RULES.blastRadius});
  for(const enemy of [...run.room.enemies])if(enemy.hp>0&&enemy.type==='enemy'&&distance(enemy,find)<=FIND_RULES.blastRadius&&visible(run.room,enemy))callbacks.damage(state,enemy,damage);
 }
 run.events.push({type:'findUsed',id:find.id,kind:find.kind,x:find.x,y:find.y,area},{type:'proc',id:'find-'+find.kind,name:label,color:def.color,x:find.x,y:find.y});return true;
}
export function activateFindArea(state,center,radius,phase,callbacks,shape='diamond'){
 const run=state.run;if(!findsEnabled(run))return 0;let activated=0;
 for(const find of [...caveFindTargets(run.room)])if(find.kind!=='chest'&&distance(find,center)<=radius&&(shape!=='cross'||find.x===center.x||find.y===center.y))if(useCaveFind(state,find,phase,callbacks,{area:true}))activated++;
 return activated;
}
export function validCaveFinds(run){
 const state=run.findState,props=run.room?.caveFinds;
 if(state!==undefined&&(!state||state.version!==1||!Number.isFinite(state.elapsed)||state.elapsed<0||state.elapsed>1e9||!Number.isFinite(state.comboUntil)||state.comboUntil< -1||state.comboUntil>state.elapsed+20))return false;
 if(props===undefined)return true;
 if(!findsEnabled(run)||!state||run.room.bossFloor||!run.room.campaignCave||!Array.isArray(props)||props.length>FIND_RULES.maxProps)return false;
 const ids=new Set(),tiles=new Set();return props.every(p=>{
  if(!p||!isCaveFind(p)||!Object.hasOwn(FIND_TYPES,p.kind)||!Number.isInteger(p.number)||p.number<0||p.number>=FIND_RULES.maxProps||p.id!=='find:'+run.room.seed+':'+p.number||ids.has(p.id)||typeof p.used!=='boolean'||p.maxHp!==1||p.hp!==(p.used?0:1)||!isFloor(run.room,p.x,p.y)||tiles.has(index(run.room,p)))return false;
  ids.add(p.id);tiles.add(index(run.room,p));if(p.kind!=='chest')return p.reward===undefined;
  const r=chestReward(run.room.seed,run.floor,p.number);return !!p.reward&&['version','kind','amount','record'].every(k=>p.reward[k]===r[k]);
 });
}
