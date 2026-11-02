import {campaignCaveProfile} from './campaign-cave-profile.js';
import {orbVision} from './run-orbs.js';
import {validExpandedBossRoom} from './boss-arena-space.js';
import {biomeIndex} from './campaign.js';
import {isFloor,wallAt,validateLayout} from './cave-layout.js';
import {validCeiling} from './cave-ceiling.js';
import {openingWave} from './balance.js';
import {validGeodeBoss} from './bosses.js';
export {isFloor,wallAt} from './cave-layout.js';
export const CAVERN_COLS=42;
export const CAVERN_ROWS=30;
export const SIGHT=5;
export const sightRange=run=>(SIGHT+Math.min(3,Math.max(0,Math.floor(run?.cards?.lantern||0))))*(1+Math.min(.675,Math.max(0,run?.visionBonus||0)))+(run?.petId==='fagulhito'&&!run.trainingClock?1:0)+orbVision(run);
// World projection is skewed: measure in its screen plane, not grid squares.
export const sightDistance=(dx,dy)=>Math.hypot(dx+dy/11,dy*8/11);
export const roomSize=room=>({cols:room?.cols||21,rows:room?.rows||15});
export const ENVIRONMENTS=[
 {name:'GRUTAS ROCHOSAS',hint:'ABRA SEU CAMINHO',rocks:175,terrain:0},
 {name:'ÁGUAS DA FLORESTA',hint:'ÁGUA: PASSO LENTO',rocks:85,terrain:1},
 {name:'FÓSSEIS INSTÁVEIS',hint:'SAIA DAS RACHADURAS',rocks:130,terrain:2},
 {name:'FISSURAS DO MANTO',hint:'LAVA: DESVIE',rocks:95,terrain:3},
 {name:'GRUTA DOS MICÉLIOS',hint:'ESPOROS: SAIA DO BRILHO',rocks:110,terrain:4},
 {name:'TOCAS DE ÂMBAR',hint:'TERRA FOFA: PASSO LENTO',rocks:145,terrain:5},
 {name:'HORTAS SUBTERRÂNEAS',hint:'RAÍZES: PASSO LENTO',rocks:120,terrain:6}
];
export const environment=floor=>ENVIRONMENTS[biomeIndex(floor)];
export const terrainAt=(room,p)=>room.terrain?.[p.y*roomSize(room).cols+p.x]||0;
export function clearSight(room,from,to){const steps=Math.max(Math.abs(to.x-from.x),Math.abs(to.y-from.y));for(let i=1;i<steps;i++){const x=Math.round(from.x+(to.x-from.x)*i/steps),y=Math.round(from.y+(to.y-from.y)*i/steps);if(wallAt(room,x,y)||room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===x&&n.y===y))return false;}return true;}
export function travelPath(room,path,budget,from){const out=[];let previous=from;for(const p of path){const cost=[1,5,6].includes(terrainAt(room,p))||[1,5,6].includes(terrainAt(room,previous))?2:1;if(budget<cost)break;budget-=cost;out.push(p);previous=p;}return out;}
export function reveal(room,player,radius=SIGHT){if(!room.explored)return;room.sightRadius=radius;const {cols,rows}=roomSize(room),reach=Math.ceil(radius*1.4),blocked=new Set(room.rocks.filter(n=>n.hp==null||n.hp>0).map(n=>n.x+','+n.y));room.visible=Array(cols*rows).fill(0);for(let y=Math.max(0,player.y-reach);y<Math.min(rows,player.y+reach+1);y++)for(let x=Math.max(0,player.x-reach);x<Math.min(cols,player.x+reach+1);x++){if(sightDistance(x-player.x,y-player.y)>radius)continue;const steps=Math.max(Math.abs(x-player.x),Math.abs(y-player.y));let clear=true;for(let i=1;i<steps;i++){const px=Math.round(player.x+(x-player.x)*i/steps),py=Math.round(player.y+(y-player.y)*i/steps);if(wallAt(room,px,py)||blocked.has(px+','+py)){clear=false;break;}}if(clear){room.visible[y*cols+x]=1;room.explored[y*cols+x]=1;}}}
const inRoom=(room,p)=>{const {cols,rows}=roomSize(room);return Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<cols&&p.y<rows;};
export const visible=(room,p)=>inRoom(room,p)&&(!room.explored||!!room.visible?.[p.y*roomSize(room).cols+p.x]);
export const explored=(room,p)=>inRoom(room,p)&&(!room.explored||!!room.explored[p.y*roomSize(room).cols+p.x]);
export function terrainMap(room,random,player,floor){const {cols,rows}=roomSize(room),type=environment(floor).terrain,map=Array(cols*rows).fill(0);if(!type)return map;for(let k=0;k<14;k++){const cx=3+Math.floor(random()*(cols-6)),cy=3+Math.floor(random()*(rows-6)),radius=1+Math.floor(random()*3);for(let y=cy-radius;y<=cy+radius;y++)for(let x=cx-radius;x<=cx+radius;x++)if(isFloor(room,x,y)&&Math.hypot(x-cx,y-cy)<=radius&&Math.abs(x-player.x)+Math.abs(y-player.y)>6)map[y*cols+x]=type;}return map;}
export function wavePlan(floor,number){return openingWave(floor,number)||{count:Math.min(16,3+number*2+biomeIndex(floor)*2),cap:Math.min(40,18+biomeIndex(floor)*6),interval:24,warning:4};}
export function validCavern(room){if(room.campaignCave!==undefined){const c=room.campaignCave;if(!c||c.version!==1||!Number.isInteger(c.biome)||c.biome<0||c.biome>6||typeof c.arena!=='boolean'||!Array.isArray(room.floorMask)||(c.arena?(c.arenaRevision!==undefined?(!validExpandedBossRoom(room)||room.bossFloor!==true):(room.cols!==21||room.rows!==15||room.bossFloor!==true)):!campaignCaveProfile(room)))return false;}if(!validateLayout(room)||!validCeiling(room))return false;if(Array.isArray(room.enemies)&&room.enemies.some(e=>e.boss&&e.bossIndex===0&&!validGeodeBoss(e)))return false;if(room.cols==null&&room.rows==null)return true;if(![[21,15],[42,30]].some(([x,y])=>room.cols===x&&room.rows===y)&&!(validExpandedBossRoom(room))&&!campaignCaveProfile(room))return false;const n=room.cols*room.rows;return (!room.explored||(Array.isArray(room.explored)&&room.explored.length===n&&room.explored.every(v=>v===0||v===1)))&&(!room.terrain||(Array.isArray(room.terrain)&&room.terrain.length===n&&room.terrain.every(v=>Number.isInteger(v)&&v>=0&&v<=6)))&&(!room.wave||(Number.isInteger(room.wave.number)&&room.wave.number>=0&&Number.isInteger(room.wave.next)&&room.wave.next>=0));}
