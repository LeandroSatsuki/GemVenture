import {FLOORS_PER_BIOME,TOTAL_FLOORS,depthLimit} from './campaign.js';
import {scoreBeats} from './stars.js';

// Campaign-only contract. Legacy rooms, training and the continuous Abyss keep
// their existing flow. Time is musical time and never advances in presentation.
export const usesStairs=r=>!!r&&r.mode!=='abyss'&&!r.trainingClock&&r.room?.campaignCave?.version===1;
export const stairReady=r=>usesStairs(r)&&(r.floor%FLOORS_PER_BIOME!==0||r.room.bossDefeated===true&&!r.room.enemies.some(e=>e.boss&&e.hp>0));
const atExit=(r,p)=>p?.x===r.room.exit?.x&&p?.y===r.room.exit?.y;
export function stopAtStair(r,path){const index=stairReady(r)?path.findIndex(p=>atExit(r,p)):-1;return index<0?path:path.slice(0,index+1);}
export const steppedOnStair=(r,path)=>stairReady(r)&&path.length>0&&atExit(r,path.at(-1))&&atExit(r,r.player);
export const autoContinueStair=s=>usesStairs(s?.run)&&!!s.run.room.cleared&&s.run.cardChosen&&!s.run.rest?.active&&s.run.floor<Math.min(TOTAL_FLOORS,depthLimit(s));

export function cavePressure(r,beat=Math.max(0,r?.beat??0,r?.acted??0)){
 const active=usesStairs(r)&&r.floor%FLOORS_PER_BIOME!==0&&!r.room.cleared;
 const start=active?Math.max(scoreBeats(r),r.floor===1?384:0):Infinity;
 const stage=active&&beat>=start?Math.min(3,1+Math.floor((beat-start)/64)):0;
 return{active,start,stage,warning:active&&stage===0&&beat>=start-16,remaining:Math.max(0,start-beat),damage:1+stage*.25,interval:[1,.85,.7,.6][stage]};
}
export function announceCavePressure(r,previous,beat){
 const before=cavePressure(r,previous),now=cavePressure(r,beat);if(!now.active)return;
 if(now.stage>before.stage)r.events.push({type:'cavePressure',stage:now.stage});
 else if(now.warning&&!before.warning)r.events.push({type:'cavePressureWarning',beats:now.remaining});
}
export function stairBearing(r,next=r.room.exit){const dx=(next.x-r.player.x)*22+(next.y-r.player.y)*2,dy=(next.y-r.player.y)*16;return ['→','↘','↓','↙','←','↖','↑','↗'][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];}
export const stairGuided=r=>usesStairs(r)&&Math.max(0,r.beat,r.acted)>=(r.floor===1?128:scoreBeats(r));
export function stairHint(r,next=r.room.exit){
 if(r.room.cleared)return '↓ DESCENDO';
 if(!stairReady(r))return 'DERROTE O CHEFE';
 const p=r.room.exit,known=!r.room.explored||r.room.explored[p.y*r.room.cols+p.x];
 return known||stairGuided(r)?stairBearing(r,next)+' BURACO · ATALHO':'';
}
export function pressureCaption(r){const q=cavePressure(r);return q.stage?'INIMIGOS: DANO +'+q.stage*25+'%':q.warning?'PERIGO EM '+q.remaining+' PULSOS':'';}

// New opening floors pair mining with a short excursion; saved older rooms
// retain their departure contract. Use actual traversed tiles, never fog/sight.
const excursionCache=new WeakMap();
export function caveExcursion(r){
 const room=r?.room,active=usesStairs(r)&&r.floor>=1&&r.floor<5&&room.campaignCave.departureVersion===2;
 if(!active)return {active:false,value:0,goal:0,ready:true};
 const tiles=room.scoredTiles||[],cached=excursionCache.get(room);
 if(cached?.tiles===tiles&&cached.length===tiles.length)return cached.result;
 const halls=room.layout.rooms.filter(h=>h.kind==='main'),spawn=room.layout.spawn;
 const entrance=halls.reduce((a,b)=>Math.hypot(a.x-spawn.x,a.y-spawn.y)<Math.hypot(b.x-spawn.x,b.y-spawn.y)?a:b);
 const reached=tiles.some(i=>{const x=i%room.cols,y=Math.floor(i/room.cols);return room.floorMask[i]&&halls.some(h=>h!==entrance&&Math.abs(x-h.x)<=h.rx-2&&Math.abs(y-h.y)<=h.ry-2);});
 const result={active:true,value:reached?2:1,goal:2,ready:reached};
 excursionCache.set(room,{tiles,length:tiles.length,result});return result;
}

// Readiness never closes
// exploration, resets combo, advances time or changes the score budget.
export function caveObjective(r){
 const active=usesStairs(r),boss=active&&r.floor%FLOORS_PER_BIOME===0,goal=Math.max(1,r?.room?.quota||1),value=Math.max(0,Math.min(goal,r?.room?.charge||0));
 const excursion=caveExcursion(r),ready=active&&!r.room.cleared&&(boss?stairReady(r):value>=goal&&excursion.ready);
 return{active,boss,goal,value,fill:value/goal,ready,excursion};
}
export function stairObjective(r){
 if(r.room.cleared)return r.room.stairDeparted?'↓ DESCENDO':'✓ ANDAR CONCLUÍDO';
 const q=caveObjective(r);return q.boss?(q.ready?'CHEFE DERROTADO':'DERROTE O CHEFE'):q.ready?'DESCIDA LIBERADA':q.value>=q.goal&&!q.excursion.ready?'EXPLORE OUTRA SALA':'MINERE CRISTAIS';
}
