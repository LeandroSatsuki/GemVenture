import {effectBeat} from './action-effect-clock.js';
import {recordAccountAward} from './account-score.js';
import {recordMission} from './missions.js';
import {TOTAL_FLOORS} from './campaign.js';
export const STAR_MARKS=Object.freeze([.15,.3,.5,.7,.85]);
export const LEGACY_STAR_MARKS=[.5,.7,.9,1.1,1.3];
export const SCORE_BEATS=256;
export const scoreBeats=run=>run?.mode==='abyss'?Infinity:(run?.room?.scoreBeats??SCORE_BEATS);
export const scoreMultiplier=combo=>1+Math.min(8,Math.floor(Math.max(0,combo)/5))*.25;
export const starMarks=()=>STAR_MARKS;
export function createScore(){return{version:3,points:0,earned:0,target:3000,totalPoints:0,awarded:0};}
// The initial population fixes the maximum mining/combat budget, at maximum
// combo. Replenishment cannot increase it. Rhythm/traversal compensate early
// low-combo hits; a finite beat window rewards efficient play.
export function calculateFloorScore(room){
 const objects=[...(room.rocks||[]),...(room.nodes||[]),...(room.enemies||[]).filter(e=>!e.miniboss)];
 const raw=objects.reduce((n,o)=>n+2*(o.maxHp||o.hp||0)+(o.type==='rock'?15:o.type==='enemy'?60:[30,60,100,40][o.kind]||30),0);
 return Math.max(1000,Math.round((raw*3+300)/50)*50);
}
export const floorScoreLimit=run=>run.room.scoreLimit??calculateFloorScore(run.room);
export function beginFloorScore(run){
 const old=run.score||createScore(),target=calculateFloorScore(run.room);
 run.score={...createScore(),target,totalPoints:old.totalPoints??old.points??0,awarded:old.awarded||0};
 run.room.scoreLimit=target;run.room.scoreSpent=0;
 run.room.scoreBeats=(run.room.bossFloor?384:256)+Math.floor((run.floor-1)/5)*32;
 run.room.floorStart.points=0;run.room.floorStart.stars=0;
}
export function migrateFloorScore(run){
 if(run.score?.version===3)return;
 const old=run.score||createScore(),points=Math.max(0,old.points-(run.room.floorStart?.points||0));
 const target=run.room.scoreLimit||calculateFloorScore(run.room);
 run.score={...createScore(),target,points:Math.min(target,points),totalPoints:old.points||0};
 run.score.earned=STAR_MARKS.filter(mark=>run.score.points>=Math.round(target*mark)).length;
 run.room.floorStart??={};run.room.floorStart.points=0;run.room.floorStart.stars=0;
 run.room.scoreSpent=run.score.points;
}
export function validFloorStars(value){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([f,n])=>/^[1-9]\d*$/.test(f)&&+f<=TOTAL_FLOORS&&Number.isInteger(n)&&n>=0&&n<=5);}
export function scoreProgress(run){const q=run.score,next=STAR_MARKS[q.earned],goal=Math.round(q.target*(next??STAR_MARKS[4]));return{goal,percent:Math.round(q.points/q.target*100),fill:Math.max(0,Math.min(1,q.points/(q.target*STAR_MARKS[4]))),multiplier:scoreMultiplier(run.combo)};}
export function awardScore(s,base,beat=effectBeat(s.run,s.run?.beat),source='gameplay'){
 const r=s.run;if(!r||r.room.cleared||base<=0||!Number.isFinite(base)||beat>=scoreBeats(r))return 0;
 r.score??=createScore();if(r.score.version!==3)migrateFloorScore(r);
 const used=r.room.scoreSpent||0,amount=Math.min(Math.round(base*scoreMultiplier(r.combo)),Math.max(0,floorScoreLimit(r)-used));
 if(amount<=0)return 0;r.room.scoreSpent=used+amount;
 r.score.points+=amount;r.score.totalPoints+=amount;
 recordAccountAward(s,{runId:s.accountScore?.current?.id,mode:r.mode||'floors',amount,rawTotal:r.score.totalPoints,beat,acted:r.acted,source});
 recordMission(s,'points',amount);r.events.push({type:'score',value:amount});
 r.score.earned=STAR_MARKS.filter(mark=>r.score.points>=Math.round(r.score.target*mark)).length;
 if(r.mode!=='abyss'&&!r.trainingClock){
  s.floorStars??={};const previous=s.floorStars[r.floor]||0,delta=Math.max(0,r.score.earned-previous);
  if(delta){s.floorStars[r.floor]=r.score.earned;const offset=Math.min(delta,s.legacyStarCredit||0),credit=delta-offset;s.legacyStarCredit=Math.max(0,(s.legacyStarCredit||0)-offset);s.stars=(s.stars||0)+credit;r.score.awarded+=credit;s.journey??={};s.journey.earnedStars=(s.journey.earnedStars||0)+credit;r.events.push({type:'star',number:r.score.earned,value:delta});}
 }
 return amount;
}
export const STAR_UPGRADES=[
 {id:'supplies',name:'Kit de resgate',text:'+1 cura ao começar.',icon:'tonic',cost:2,max:3},
 {id:'charge',name:'Elevador solar',text:'+1 carga em cada andar.',icon:'lift',cost:2,max:3},
 {id:'yield',name:'Lapidação astral',text:'+5% de gemas nos cristais.',icon:'fortune',cost:3,max:3}
];
export const starCost=(s,u)=>u.cost*(1+(s.starUpgrades?.[u.id]||0));
export function buyStarUpgrade(s,id){const u=STAR_UPGRADES.find(u=>u.id===id);if(s.run||!u)return false;const level=s.starUpgrades?.[id]||0,cost=starCost(s,u);if(level>=u.max||s.stars<cost)return false;s.stars-=cost;s.starUpgrades??={supplies:0,charge:0,yield:0};s.starUpgrades[id]=level+1;return true;}
