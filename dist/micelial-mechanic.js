import {isFloor} from './cave-layout.js';
import {campaignBossHome} from './boss-arena-space.js';
export const MICELIAL_RULES=Object.freeze({version:1,start:4,turnPeriod:32,reverseWarning:2,speed1:.30,speed2:.40,radius:6.1,inner:1.8,thickness:.38,sporeWarning:2,sporeLife:4,sporePeriod:8,sporeCap:2,damage:8,gapLife:2});
const R=MICELIAL_RULES,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),tau=Math.PI*2;
export const micelialActive=b=>b?.boss===true&&b.bossIndex===4&&b.mycelium?.version===1;
export const micelialBoss=room=>room.enemies.find(b=>micelialActive(b)&&b.hp>0);
export function enableMicelial(b,room){if(!b?.boss||b.bossIndex!==4)throw Error('Micelial only');Object.assign(b,campaignBossHome(room));b.windup=null;b.spiralTiles=[];b.phase=1;b.mycelium={version:1,anchorBeat:4,anchorAngle:0,lastBegin:-1,lastResolved:-1,phase:1,serial:0,hitAt:-100,breakAt:-100,nextRelease:8,spores:[],gaps:[],lastContact:-1};return b;}
function signedTime(beat){const t=Math.max(0,beat-4),cycle=Math.floor(t/32),u=t%32;return cycle%2?32-u:u;}
export function micelialAngle(b,beat){const m=b.mycelium,speed=m.phase===2?R.speed2:R.speed1;return m.anchorAngle+(signedTime(beat)-signedTime(m.anchorBeat))*speed;}
export const micelialDirection=beat=>Math.floor(Math.max(0,beat-4)/32)%2?-1:1;
export const micelialReverseWarning=beat=>beat>=4&&(beat-4)%32>=30;
export function micelialCurve(b,beat){const angle=micelialAngle(b,beat),out=[];for(let radius=R.inner;radius<=R.radius+.001;radius+=.1){const theta=angle+radius*.38;out.push({x:b.x+Math.cos(theta)*radius,y:b.y+Math.sin(theta)*radius});}return out;}
function segmentDistance(p,a,z){const dx=z.x-a.x,dy=z.y-a.y,u=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return dist(p,{x:a.x+u*dx,y:a.y+u*dy});}
export function sporePoint(b,s,beat){const u=Math.max(0,Math.min(1,(beat-s.born)/4)),a=s.angle+s.curve*u,r=1.4+5*u;return{x:b.x+Math.cos(a)*r,y:b.y+Math.sin(a)*r};}
export const micelialGapAt=(b,p,beat)=>b.mycelium.gaps.some(g=>beat>=g.born&&beat<g.until&&dist(p,g)<2.1);
const sweeps=new WeakMap();
function sweptSegments(b,beat){const key=[beat,b.mycelium.phase,b.mycelium.anchorBeat,b.mycelium.anchorAngle].join(':');let cache=sweeps.get(b);if(!cache){cache=new Map();sweeps.set(b,cache);}if(cache.has(key))return cache.get(key);const segments=[];for(let t=beat-1;t<=beat+.001;t+=.1){const points=micelialCurve(b,Math.max(4,t));for(let i=1;i<points.length;i++)segments.push([points[i-1],points[i]]);}if(cache.size>=3)cache.delete(cache.keys().next().value);cache.set(key,segments);return segments;}
export function micelialDanger(b,p,beat){if(beat<4||b.hp<=0||micelialGapAt(b,p,beat))return false;const radius=dist(b,p);if(radius>=R.inner-.4&&radius<=R.radius+.4&&sweptSegments(b,beat).some(([a,z])=>segmentDistance(p,a,z)<=R.thickness))return true;
 return b.mycelium.spores.some(s=>beat>=s.born&&beat<s.until&&segmentDistance(p,sporePoint(b,s,Math.max(s.born,beat-1)),sporePoint(b,s,beat))<.65);}
function emit(s,b,type,beat,data={}){s.run.events.push({type,id:`micelial:${s.run.room.seed}:${b.id}:${++b.mycelium.serial}`,sourceId:b.id,beat,x:b.x,y:b.y,...data});}
const stopped=s=>!s.run||s.run.room.cleared||s.run.recovery?.active||s.run.rest?.active||s.run.abyss?.cardChoice;
function begin(s,b,beat){const m=b.mycelium;if(beat<=m.lastBegin)return;m.lastBegin=beat;if(b.hp<=b.maxHp/2&&m.phase===1){m.anchorAngle=micelialAngle(b,beat);m.anchorBeat=beat;m.phase=b.phase=2;emit(s,b,'micelialPhase',beat);}
 m.spores=m.spores.filter(q=>beat<q.until);m.gaps=m.gaps.filter(q=>beat<q.until);
 if(beat===m.nextRelease-2)emit(s,b,'micelialPrepare',beat);
 if(micelialReverseWarning(beat)&&Number.isInteger((beat-4)%32)&&((beat-4)%32===30))emit(s,b,'micelialReverse',beat);
 if(beat>=m.nextRelease){if(!micelialReverseWarning(beat)&&m.spores.length===0){const angle=micelialAngle(b,beat)+Math.PI/2;for(let i=0;i<2;i++)m.spores.push({born:beat,until:beat+4,angle:angle+i*Math.PI,curve:(i?1:-1)*.45});emit(s,b,'micelialRelease',beat);}m.nextRelease=beat+8;}}
function resolve(s,b,beat,cb){const m=b.mycelium;if(beat<=m.lastResolved)return;m.lastResolved=beat;if(micelialDanger(b,s.run.player,beat)&&!cb.airborne?.(beat)&&m.lastContact!==beat){m.lastContact=beat;emit(s,b,'micelialContact',beat);cb.contact(b,R.damage,beat);}}
export function micelialAdvance(s,beat,cb){if(stopped(s))return;const b=micelialBoss(s.run.room);if(!b)return;for(let at=b.mycelium.lastResolved+1;at<beat;at++){begin(s,b,at);resolve(s,b,at,cb);if(stopped(s))return;}begin(s,b,beat);}
export function micelialResolve(s,beat,cb){if(stopped(s))return;const b=micelialBoss(s.run.room);if(b)resolve(s,b,beat,cb);}
export function micelialHit(s,target,damage,beat){if(damage<=0)return;const b=micelialActive(target)?target:s.run.room.enemies.find(n=>micelialActive(n)&&n.id===target.summon);if(!b)return;const m=b.mycelium;m.hitAt=beat;if(target!==b)target.micelialHitAt=beat;if(target!==b&&target.hp===0){m.breakAt=beat;m.gaps.push({x:target.x,y:target.y,born:beat,until:beat+2});m.gaps=m.gaps.slice(-4);m.spores=m.spores.filter(q=>dist(sporePoint(b,q,beat),target)>2.1);emit(s,b,'micelialBreak',beat,{x:target.x,y:target.y});}else emit(s,b,'micelialHit',beat,{x:target.x,y:target.y});if(b.hp===0){m.spores=[];m.gaps=[];b.spiralTiles=[];}}
export function validMicelial(b,room){if(b.mycelium===undefined)return true;if(!micelialActive(b))return false;const m=b.mycelium,int=Number.isSafeInteger,p=q=>Number.isFinite(q.x)&&Number.isFinite(q.y)&&isFloor(room,Math.round(q.x),Math.round(q.y));if(room.enemies.some(n=>n.summon===b.id&&n.micelialHitAt!==undefined&&(!int(n.micelialHitAt)||Math.abs(n.micelialHitAt)>1e7)))return false;return b.windup===null&&[1,2].includes(m.phase)&&b.phase===m.phase&&['anchorBeat','lastBegin','lastResolved','serial','hitAt','breakAt','nextRelease','lastContact'].every(k=>int(m[k]))&&Number.isFinite(m.anchorAngle)&&m.lastResolved<=m.lastBegin&&m.serial>=0&&m.serial<1e7&&Array.isArray(m.spores)&&m.spores.length<=2&&m.spores.every(q=>int(q.born)&&int(q.until)&&q.until-q.born===4&&Number.isFinite(q.angle)&&Math.abs(q.curve)===.45)&&Array.isArray(m.gaps)&&m.gaps.length<=4&&m.gaps.every(g=>p(g)&&int(g.born)&&g.until===g.born+2);}
