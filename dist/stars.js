import {recordMission} from './missions.js';
export const STAR_MARKS=[.05,.175,.375,.625,1];
export const LEGACY_STAR_MARKS=[.5,.7,.9,1.1,1.3];
export const SCORE_BEATS=64;
export const scoreBeats=run=>run?.score?.version===2?Infinity:run?.room?.cols>21?128:SCORE_BEATS;
export const scoreMultiplier=combo=>1+Math.min(8,Math.floor(Math.max(0,combo)/5))*.25;
export const starMarks=run=>run.score.version===2?STAR_MARKS:LEGACY_STAR_MARKS;
export function createScore(){return{version:2,points:0,earned:0,target:20000};}
export const floorScoreLimit=run=>run.room.scoreLimit??(3000+Math.floor((run.floor-1)/5)*750);
export function scoreProgress(run){const q=run.score,marks=starMarks(run),next=marks[q.earned],goal=next?Math.round(q.target*next):Math.round(q.target*marks[4]);return{goal,percent:Math.round(q.points/q.target*100),fill:Math.max(0,Math.min(1,q.points/(q.target*marks[4]))),multiplier:scoreMultiplier(run.combo)};}
export function awardScore(s,base,beat=s.run?.beat){
 const r=s.run;if(!r||r.room.cleared||base<=0||!Number.isFinite(base)||beat>=scoreBeats(r))return 0;
 r.score??=createScore();let amount=Math.round(base*scoreMultiplier(r.combo));
 if(r.score.version===2){const used=r.room.scoreSpent||0;amount=Math.min(amount,Math.max(0,floorScoreLimit(r)-used));r.room.scoreSpent=used+amount;}
 if(amount<=0)return 0;
 r.score.points+=amount;recordMission(s,'points',amount);r.events.push({type:'score',value:amount});
 const marks=starMarks(r);while(r.score.earned<5&&r.score.points>=Math.round(r.score.target*marks[r.score.earned])){r.score.earned++;s.stars=(s.stars||0)+1;r.events.push({type:'star',number:r.score.earned});}return amount;
}
export const STAR_UPGRADES=[
 {id:'supplies',name:'Kit de resgate',text:'+1 cura ao começar.',icon:'tonic',cost:12,max:3},
 {id:'charge',name:'Elevador solar',text:'+1 carga em cada andar.',icon:'lift',cost:18,max:3},
 {id:'yield',name:'Lapidação astral',text:'+5% de gemas nos cristais.',icon:'fortune',cost:20,max:3}
];
export const starCost=(s,u)=>u.cost*(1+(s.starUpgrades?.[u.id]||0));
export function buyStarUpgrade(s,id){const u=STAR_UPGRADES.find(u=>u.id===id);if(s.run||!u)return false;const level=s.starUpgrades?.[id]||0,cost=starCost(s,u);if(level>=u.max||s.stars<cost)return false;s.stars-=cost;s.starUpgrades??={supplies:0,charge:0,yield:0};s.starUpgrades[id]=level+1;return true;}
