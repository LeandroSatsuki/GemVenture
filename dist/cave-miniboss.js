import {biomeIndex,FLOORS_PER_BIOME} from './campaign.js';
import {openingBalance} from './balance.js';
import {biomeMineral,MATERIALS} from './materials.js';
import {creatureFor} from './creatures.js';
import {isFloor} from './cave-layout.js';
import {clearSight,visible} from './cavern.js';
import {inZagArea} from './cave-zag.js';
import {P} from './palette.js';

export const MINIBOSS_RULES=Object.freeze({version:1,firstFloor:2,health:2.5,warningRange:10,leash:6,attackRange:5,windup:2,recovery:3});
const dist=(a,b)=>b?Math.abs(a.x-b.x)+Math.abs(a.y-b.y):Infinity;
const hash=n=>{n=Math.imul(n^(n>>>16),0x45d9f3b);return(n^(n>>>16))>>>0;};
export const minibossEligible=run=>!!run&&run.mode!=='abyss'&&!run.trainingClock&&run.floor>=MINIBOSS_RULES.firstFloor&&run.floor%FLOORS_PER_BIOME!==0&&!!run.room?.campaignCave&&!run.room.bossFloor;
export const minibossHealth=run=>Math.round(Math.round((12+Math.floor(run.floor*2.2))*openingBalance(run).enemyHealth)*MINIBOSS_RULES.health);
export const minibossReward=floor=>({version:1,coins:18+8*biomeIndex(floor),kind:biomeMineral(floor),crystals:9+3*biomeIndex(floor)});
export const minibossEnemy=run=>run?.room?.enemies?.find(e=>e.miniboss===true&&e.id===run.room.miniboss?.enemyId);
export function minibossTip(run,enemy){const r=run.room.miniboss?.reward;return '<strong style="color:'+P.gold+'">SENTINELA DO VEIO</strong><span>'+Math.ceil(enemy.hp)+' / '+enemy.maxHp+' · OPCIONAL</span><small>Golpeie para enfrentar · afaste-se para recuar'+(r?' · Bônus: '+r.coins+' moedas + '+r.crystals+' cristais':'')+'</small>';}
export const reservedByMiniboss=(room,p)=>!!room.miniboss&&dist(room.miniboss.home,p)<=2;
function distances(room,start){const cols=room.cols,blocked=new Set(room.rocks.filter(p=>p.hp==null||p.hp>0).map(p=>p.y*cols+p.x)),out=new Int32Array(cols*room.rows).fill(-1),queue=[start];out[start.y*cols+start.x]=0;
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy},at=n.y*cols+n.x;if(isFloor(room,n.x,n.y)&&!blocked.has(at)&&out[at]<0){out[at]=out[p.y*cols+p.x]+1;queue.push(n);}}}return out;}
export function placeCaveMiniboss(run){
 if(!minibossEligible(run))return;
 const room=run.room,d=distances(room,run.player),occupied=[...room.nodes,...room.rocks,...room.enemies].filter(n=>n.hp==null||n.hp>0),choices=[];
 for(const hall of room.layout.rooms)for(const dy of [-4,-2,0,2,4])for(const dx of [-4,-2,0,2,4]){
  const p={x:hall.x+dx,y:hall.y+dy},steps=d[p.y*room.cols+p.x];if(steps<45||steps>190||dist(p,room.exit)<12||dist(p,room.hedgehog)<14||occupied.some(n=>dist(n,p)<3)||(room.caveFinds||[]).some(n=>dist(n,p)<6))continue;
  let free=true;for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const q={x:p.x+x,y:p.y+y};if(!isFloor(room,q.x,q.y)||d[q.y*room.cols+q.x]<0||inZagArea(room,q)||room.terrain?.[q.y*room.cols+q.x]===3)free=false;}
  if(free)choices.push({...p,steps,key:hash(room.seed^((p.y*room.cols+p.x)*977)^0x6e1b055)});
 }
 choices.sort((a,b)=>a.steps-b.steps||a.key-b.key);const near=choices.slice(0,32);if(!near.length)return;const home=near[hash(room.seed^0x6e1b055)%near.length],id=room.nextId++,hp=minibossHealth(run);
 room.enemies.push({id,type:'enemy',kind:2,species:creatureFor(run.floor,2).id,x:home.x,y:home.y,hp,maxHp:hp,miniboss:true,windup:null,stunUntil:-1,recoverUntil:-1});
 room.miniboss={version:1,enemyId:id,home:{x:home.x,y:home.y},state:'dormant',near:false,warned:false,engagedAt:-1,rewardClaimed:false,reward:minibossReward(run.floor)};
 const safe=new Set(room.layout.protectedTiles||[]);for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)safe.add((home.y+y)*room.cols+home.x+x);room.layout.protectedTiles=[...safe];
}
function inside(run){const m=run.room.miniboss;return !!m&&dist(run.player,m.home)<=MINIBOSS_RULES.leash&&clearSight(run.room,m.home,run.player);}
export function refreshCaveMiniboss(run){
 const m=run.room.miniboss,e=minibossEnemy(run);if(!m||!e||e.hp<=0||run.room.cleared){if(m)m.near=false;return;}
 if(m.state==='engaged'&&!inside(run)){m.state='dormant';m.engagedAt=-1;e.windup=null;e.recoverUntil=Math.max(0,run.acted,run.beat)+1;run.events.push({type:'minibossRetreated',id:e.id});}
 m.near=dist(run.player,m.home)<=MINIBOSS_RULES.warningRange&&clearSight(run.room,m.home,run.player);
 if(m.near&&!m.warned){m.warned=true;run.events.push({type:'minibossNearby',id:e.id});}
}
export function allowMinibossDamage(run,enemy,primary=false){
 if(!enemy.miniboss)return true;refreshCaveMiniboss(run);const m=run.room.miniboss;
 if(!m||m.enemyId!==enemy.id||m.rewardClaimed||!inside(run)||!visible(run.room,enemy))return false;
 if(m.state==='dormant'){if(!primary)return false;m.state='engaged';m.engagedAt=Math.max(0,run.acted,run.beat);run.events.push({type:'minibossEngaged',id:enemy.id});}
 return m.state==='engaged';
}
export function stepCaveMiniboss(run,enemy,beat){
 refreshCaveMiniboss(run);const m=run.room.miniboss;if(!m||m.state!=='engaged'||enemy.hp<=0||enemy.windup||beat<=enemy.stunUntil||beat<=(enemy.recoverUntil??-1)||dist(enemy,run.player)>MINIBOSS_RULES.attackRange)return;
 const target={...run.player},tiles=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if(isFloor(run.room,target.x+x,target.y+y))tiles.push({x:target.x+x,y:target.y+y});
 enemy.windup={...target,tiles,beat:beat+MINIBOSS_RULES.windup,radius:1,kind:'slam'};run.events.push({type:'danger',...target});
}
export function minibossBlocksClear(run){refreshCaveMiniboss(run);return run.room.miniboss?.state==='engaged'&&(minibossEnemy(run)?.hp||0)>0;}
export function closeMinibossFloor(run){const m=run.room.miniboss;if(!m)return;m.near=false;if(m.state!=='defeated'){m.state='ignored';m.engagedAt=-1;}const e=minibossEnemy(run);if(e)e.windup=null;}
export function rewardCaveMiniboss(state,enemy){
 const run=state.run,m=run?.room.miniboss;if(!m||!enemy.miniboss||m.enemyId!==enemy.id||enemy.hp>0||m.state!=='engaged'||m.rewardClaimed)return false;
 m.rewardClaimed=true;m.state='defeated';m.near=false;enemy.windup=null;const reward=m.reward;run.bag+=reward.coins;run.materials[reward.kind]+=reward.crystals;run.loot.enemies.gems+=reward.coins;run.loot.crystals[reward.kind].gems+=reward.crystals;
 run.events.push({type:'loot',x:enemy.x,y:enemy.y,value:reward.crystals,color:MATERIALS[reward.kind].color,heavy:true},{type:'minibossDefeated',id:enemy.id,coins:reward.coins,crystals:reward.crystals},{type:'proc',id:'miniboss-reward',name:'+'+reward.coins+' MOEDAS · +'+reward.crystals+' CRISTAIS',color:P.gold,x:enemy.x,y:enemy.y});return true;
}
export function validCaveMiniboss(run){
 const m=run.room.miniboss,flagged=run.room.enemies.filter(e=>e.miniboss!==undefined);if(m===undefined)return flagged.length===0;
 if(!minibossEligible(run)||!m||m.version!==1||!Number.isInteger(m.enemyId)||m.enemyId<0||!isFloor(run.room,m.home?.x,m.home?.y)||!['dormant','engaged','defeated','ignored'].includes(m.state)||typeof m.near!=='boolean'||typeof m.warned!=='boolean'||typeof m.rewardClaimed!=='boolean'||!Number.isInteger(m.engagedAt)||m.engagedAt< -1||m.engagedAt>1e9)return false;
 const reward=minibossReward(run.floor);if(!m.reward||Object.keys(reward).some(k=>m.reward[k]!==reward[k]))return false;
 if(m.state==='defeated'){if(!m.rewardClaimed||m.near||flagged.some(e=>e.id!==m.enemyId||e.hp!==0||e.miniboss!==true))return false;return flagged.length<=1;}
 if(m.rewardClaimed)return false;if(m.state==='ignored')return !!run.room.cleared&&flagged.length===0&&!m.near;
 if(run.room.cleared||flagged.length!==1)return false;const e=flagged[0];if(e.id!==m.enemyId||e.miniboss!==true||e.boss||e.elite||e.kind!==2||e.type!=='enemy'||e.x!==m.home.x||e.y!==m.home.y||e.maxHp!==minibossHealth(run)||e.hp<=0||e.hp>e.maxHp||m.state==='engaged'&&m.engagedAt<0||m.state==='dormant'&&(m.engagedAt!==-1||e.windup))return false;
 if([...run.room.nodes,...run.room.rocks,...run.room.enemies].some(n=>n!==e&&n.id===e.id))return false;
 if(e.windup){const w=e.windup;if(w.kind!=='slam'||w.radius!==1||!Number.isInteger(w.beat)||w.beat<0||!isFloor(run.room,w.x,w.y)||!Array.isArray(w.tiles)||!w.tiles.length||w.tiles.length>9||new Set(w.tiles.map(p=>p.x+','+p.y)).size!==w.tiles.length||w.tiles.some(p=>!isFloor(run.room,p.x,p.y)||Math.abs(p.x-w.x)>1||Math.abs(p.y-w.y)>1))return false;}
 return true;
}
