import {bossArenaSize} from './boss-arena-space.js';
// Rabbit-only mechanics/events. No renderer, timer, RNG, save access or economy formula.
import {P} from './palette.js';
import {playerActionId} from './player-action-resolution.js';
export const RABBIT_MECHANIC_VERSION=2;
export const RABBIT_BAIT_RADIUS=2;
const DIRECTIONS={right:{ux:1,uy:0,vx:0,vy:1},left:{ux:-1,uy:0,vx:0,vy:-1},down:{ux:0,uy:1,vx:-1,vy:0},up:{ux:0,uy:-1,vx:1,vy:0}};
const WIDTHS=Object.freeze([1,2,2,2,1,1,0]);
export function rabbitAimedTiles(target,direction,arena=target.arenaSize||{cols:21,rows:15}){
 const d=DIRECTIONS[direction];if(!d)throw new RangeError('Invalid carrot orientation');const out=[];
 for(let u=-3;u<=3;u++)for(let v=-WIDTHS[u+3];v<=WIDTHS[u+3];v++){const x=target.x+u*d.ux+v*d.vx,y=target.y+u*d.uy+v*d.vy;if(x>=1&&x<arena.cols-1&&y>=1&&y<arena.rows-1)out.push({x,y});}return out;
}
export function rabbitPlayerAttack(boss,player,beat,damage){
 const dx=player.x-boss.x,dy=player.y-boss.y,direction=Math.abs(dx)>=Math.abs(dy)?(dx>=0?'right':'left'):(dy>=0?'down':'up'),aim={x:player.x,y:player.y};
 return {...aim,aim:{...aim},direction,tiles:rabbitAimedTiles(aim,direction,boss.arenaSize),rabbit:true,rabbitAim:2,baitRadius:RABBIT_BAIT_RADIUS,startedBeat:beat,beat:beat+3,radius:0,kind:'boss',attack:'CENOURA GIGANTE',hint:'ATRAIA E DESVIE',damage};
}
export function selectRabbitBait(kids,w){
 return kids.filter(c=>!c.stunned&&Math.abs(c.x-w.x)+Math.abs(c.y-w.y)<=RABBIT_BAIT_RADIUS&&w.tiles.some(p=>p.x===c.x&&p.y===c.y)).sort((a,b)=>(Math.abs(a.x-w.x)+Math.abs(a.y-w.y))-(Math.abs(b.x-w.x)+Math.abs(b.y-w.y))||a.rabbitChild-b.rabbitChild).slice(0,1);
}
export const rabbitMechanicActive=b=>b?.boss===true&&b.bossIndex===6&&b.rabbitMechanic===RABBIT_MECHANIC_VERSION;
const children=(room,b)=>room.enemies.filter(e=>e.parentBoss===b.id&&e.rabbitChild!==undefined);
const point=e=>({id:e.id,x:e.x,y:e.y});
function publish(s,b,type,beat,data={}){
 if(!s.run||!rabbitMechanicActive(b))return;
 const r=s.run,id=type+':'+JSON.stringify([2,s.seed,s.attempts,r.mode||'floors',r.floor,r.room.seed,b.id,beat,data.childId??null]);
 r.events.push({type,version:2,id,sourceId:b.id,beat,...data});
}
export function rabbitCarrotImpact(s,b,w,beat,award){
 if(!rabbitMechanicActive(b)||b.hp<=0||b.rabbitMutiny)return false;
 const r=s.run,kids=children(r.room,b),hits=selectRabbitBait(kids,w);
 const completes=hits.length&&kids.length===3&&kids.every(e=>e.stunned||hits.includes(e));
 publish(s,b,'rabbitCarrotImpact',beat,{direction:w.direction,target:{x:w.x,y:w.y},origin:point(b),baitRadius:RABBIT_BAIT_RADIUS,startedBeat:w.startedBeat,scheduledBeat:w.beat,tiles:w.tiles.map(p=>({...p})),childrenHit:hits.map(e=>e.id)});
 for(const child of hits){child.stunned=true;child.stunUntil=completes?beat+11:beat+20;award(s,80,beat);r.events.push({type:'rabbitStun',x:child.x,y:child.y,color:P.lemon});publish(s,b,'rabbitChildStunned',beat,{childId:child.id,rabbitChild:child.rabbitChild,x:child.x,y:child.y,baitTarget:{x:w.x,y:w.y},baitDistance:Math.abs(child.x-w.x)+Math.abs(child.y-w.y),cause:'carrot-bait',until:child.stunUntil});}
 if(completes){
  const m=b.rabbitMutiny={version:2,startedBeat:beat,impactBeat:beat+1,impactApplied:false,childIds:kids.map(e=>e.id)};
  b.windup=null;b.rabbitWindowUntil=-1;b.exposedUntil=-1;b.stunUntil=m.impactBeat;b.recoverUntil=m.impactBeat;
  for(const c of kids)c.stunUntil=m.impactBeat+10;
  publish(s,b,'rabbitMutiny',beat,{startedBeat:m.startedBeat,impactBeat:m.impactBeat,children:kids.map(point),target:point(b)});
 }
 return true;
}
export function refreshRabbitMutiny(room,b,beat){
 if(!rabbitMechanicActive(b)||b.hp<=0)return null;
 const kids=children(room,b),m=b.rabbitMutiny;let impact=false,expired=false,windowUntil=null;
 if(m&&!m.impactApplied&&beat>=m.impactBeat){
  m.impactApplied=true;impact=true;b.rabbitWindowUntil=m.impactBeat+10;windowUntil=b.rabbitWindowUntil;
  b.exposedUntil=b.rabbitWindowUntil;b.stunUntil=b.rabbitWindowUntil;b.recoverUntil=b.rabbitWindowUntil;
  for(const c of kids)c.stunUntil=b.rabbitWindowUntil;
 }
 if(b.rabbitWindowUntil>=0&&beat>b.rabbitWindowUntil){
  expired=true;b.rabbitWindowUntil=-1;b.exposedUntil=-1;b.rabbitMutiny=null;
  for(const c of kids){c.stunned=false;c.stunUntil=-1;}
 }else if(!m)for(const c of kids)if(c.stunned&&beat>c.stunUntil){c.stunned=false;c.stunUntil=-1;}
 return {impact,expired,windowUntil,mutiny:m?{...m,childIds:[...m.childIds]}:null};
}
export function rabbitRefreshEvents(s,b,result,beat){
 if(!result||!rabbitMechanicActive(b))return;
 if(result.impact){publish(s,b,'rabbitMutinyImpact',beat,{scheduledBeat:result.mutiny.impactBeat,startedBeat:result.mutiny.startedBeat,children:children(s.run.room,b).map(point),target:point(b),windowUntil:result.windowUntil,late:beat>result.mutiny.impactBeat});if(!result.expired)s.run.events.push({type:'bossOpen',name:'COELHO TONTO!'});}
 if(result.expired)publish(s,b,'rabbitCycleReset',beat);
}
export function rabbitBaitWarning(s,b,w,beat){
 if(!rabbitMechanicActive(b))return;
 publish(s,b,'rabbitBaitWarning',beat,{startedBeat:w.startedBeat,impactBeat:w.beat,direction:w.direction,target:{x:w.x,y:w.y},baitRadius:RABBIT_BAIT_RADIUS,shape:'carrot-7x5-v2',tiles:w.tiles.map(p=>({...p})),origin:point(b)});
}
export function rabbitStrikeHint(s,child,beat){
 const b=s.run.room.enemies.find(e=>e.id===child.parentBoss);publish(s,b,'rabbitLureHint',beat,{childId:child.id,x:child.x,y:child.y,text:'USE A CENOURA'});
}
export function rabbitPrimaryHit(s,b,damage,visual,beat){
 if(!rabbitMechanicActive(b)||!visual||damage<=0)return;
 publish(s,b,'rabbitBossHit',beat,{x:b.x,y:b.y,actualDamage:damage,hp:b.hp,windowUntil:b.rabbitWindowUntil,actionId:playerActionId(s,s.run,beat)});
}
export function validRabbitMechanic(b,room,baseDamage){
 if(b.rabbitMechanic===undefined)return true;
 if(!rabbitMechanicActive(b))return false;
 const w=b.windup,m=b.rabbitMutiny,kids=children(room,b),arena=bossArenaSize(b);
 if(![b.rabbitWindowUntil,b.exposedUntil,b.stunUntil,b.recoverUntil].every(Number.isSafeInteger)||kids.some(c=>c.stunned?c.stunUntil<0:c.stunUntil!==-1))return false;
 if(w&&(w.rabbit!==true||w.rabbitAim!==2||w.baitRadius!==2||!Number.isInteger(w.x)||!Number.isInteger(w.y)||w.x<1||w.x>=arena.cols-1||w.y<1||w.y>=arena.rows-1||w.aim?.x!==w.x||w.aim?.y!==w.y||!Number.isSafeInteger(w.startedBeat)||w.startedBeat<4||w.beat!==w.startedBeat+3||w.damage!==Math.round(baseDamage*(b.phase===2?1.2:1))||w.radius!==0||w.kind!=='boss'))return false;
 if(m==null)return b.rabbitWindowUntil===-1&&b.exposedUntil===-1;
 if(m.version!==2||!Number.isSafeInteger(m.startedBeat)||m.startedBeat<4||m.impactBeat!==m.startedBeat+1||typeof m.impactApplied!=='boolean'||!Array.isArray(m.childIds)||m.childIds.length!==3||JSON.stringify(m.childIds)!==JSON.stringify(kids.map(c=>c.id))||kids.some(c=>!c.stunned)||w)return false;
 const until=m.impactApplied?m.impactBeat+10:m.impactBeat;
 return b.rabbitWindowUntil===(m.impactApplied?until:-1)&&b.exposedUntil===(m.impactApplied?until:-1)&&b.stunUntil===until&&b.recoverUntil===until&&kids.every(c=>c.stunUntil===m.impactBeat+10);
}
