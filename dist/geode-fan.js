import {isFloor} from './cave-layout.js';
import {SLAM} from './geode-slam-contract.js';
export const FAN=Object.freeze({inner:1,outer:7,halfAngle:Math.PI/3,step:1,crestLife:.72,rearDamage:4,rearPush:2,rearRadius:7});
export function facing(look){if(look&&typeof look==='object'){const n=Math.hypot(look.x,look.y);if(n>0)return{x:look.x/n,y:look.y/n};}const x=look==='SW'?-1:look==='SE'?1:0,n=Math.hypot(x,1);return{x:x/n,y:1/n};}
export function combatLook(b,beat){const s=b.crown.slam;return s&&beat>=s.at&&beat<s.at+SLAM.hold+SLAM.recovery?s.look:b.crown.look;}
export function inRear(b,p){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy);return dy<0&&d<=FAN.rearRadius;}
export function aimAtPlayer(b,p){const dx=p.x-b.x,dy=p.y-b.y;if(dy<0||!dx&&!dy)return null;const n=Math.hypot(dx,dy);return{aim:{x:dx/n,y:dy/n},look:dx<-.414*dy?'SW':dx>.414*dy?'SE':'S'};}
// A cell belongs to exactly one shell. The same plan drives warning, damage and art.
export function fanTiles(room,b,look){const f=facing(b.aim||look),out=[];for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++){const dx=x-b.x,dy=y-b.y,r=Math.hypot(dx,dy);if(dy<0||r<FAN.inner||r>=FAN.outer||!isFloor(room,x,y)||(dx*f.x+dy*f.y)/r<.5-1e-9)continue;out.push({x,y,ring:Math.floor(r)-FAN.inner});}return out;}
export function wavePillars(room,b,beat){return(b.crown.waves||[]).flatMap(w=>fanTiles(room,w,w.look).map(p=>({...p,born:w.at+p.ring*FAN.step,until:w.at+p.ring*FAN.step+FAN.crestLife,crownPillar:true,crownWave:true,look:w.look}))).filter(p=>p.until>beat);}
export function waveDangerAt(room,b,beat){const plans=[...(b.crown.waves||[])];if(b.windup?.crown)plans.push({at:b.windup.beat,x:b.x,y:b.y,aim:b.windup.aim,look:b.windup.waveLook});return plans.flatMap(w=>fanTiles(room,w,w.look).filter(p=>w.at+p.ring*FAN.step===beat));}
