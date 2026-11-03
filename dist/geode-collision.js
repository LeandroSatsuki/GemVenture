import {crownActive} from './geode-crown.js';
import {GEODE_BODY,geodeBodyContains} from './geode-body.js';
import {isFloor} from './cave-layout.js';
import {wavePillars} from './geode-fan.js';
// Derived collision clock: never serialized and never advanced by a render callback.
const clocks=new WeakMap();
export function setGeodeCollisionPhase(room,phase){if(room&&Number.isFinite(phase))clocks.set(room,phase);return room;}
export function geodeCollisionPhase(room){return clocks.get(room)??Math.max(-1,...(room.enemies||[]).filter(crownActive).map(b=>b.crown.lastHazardBeat??-1));}
export function solidGeodeWaveCells(room,phase=geodeCollisionPhase(room)){
 const cells=new Map();
 for(const b of room.enemies||[])if(crownActive(b)&&b.hp>0)for(const p of wavePillars(room,b,phase)){
  // Future shells are warned, not solid. Geometry and collision share born/until.
  if(p.born<=phase&&phase<p.until)cells.set(p.x+','+p.y,{x:p.x,y:p.y});
 }
 return [...cells.values()];
}
export function geodeWaveBlocks(room,x,y){return solidGeodeWaveCells(room).some(p=>p.x===x&&p.y===y);}
export function solidGeodeObstacles(room){return [...solidGeodeCells(room),...solidGeodeWaveCells(room)];}
export function geodeObstacleBlocks(room,x,y){return geodeBodyBlocks(room,x,y)||geodeWaveBlocks(room,x,y);}
// A crest erupting under an actor nudges them one clear cell, never through a wall,
// the boss, or another crest. It adds no damage and uses the existing recoil event.
export function escapeGeodeWave(room,player,boss){
 if(!geodeWaveBlocks(room,player.x,player.y))return null;
 const dx=player.x-boss.x,dy=player.y-boss.y;
 const out=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:player.x+x,y:player.y+y,away:x*dx+y*dy}))
  .filter(p=>isFloor(room,p.x,p.y)&&!geodeObstacleBlocks(room,p.x,p.y)&&!room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===p.x&&n.y===p.y))
  .sort((a,b)=>b.away-a.away||b.y-a.y||a.x-b.x);
 return out[0]?{x:out[0].x,y:out[0].y}:null;
}
export function solidGeodeCells(room){return(room.enemies||[]).filter(b=>crownActive(b)&&b.hp>0).flatMap(b=>{const cells=[];for(let dy=-GEODE_BODY.halfSize;dy<=GEODE_BODY.halfSize;dy++)for(let dx=-GEODE_BODY.halfSize;dx<=GEODE_BODY.halfSize;dx++)if(geodeBodyContains(b,b.x+dx,b.y+dy))cells.push({x:b.x+dx,y:b.y+dy});return cells;});}
export function geodeBodyBlocks(room,x,y){return(room.enemies||[]).some(b=>crownActive(b)&&b.hp>0&&geodeBodyContains(b,x,y));}
export const geodeContactReach=target=>crownActive(target)?GEODE_BODY.reach:1;
export function escapeGeodeBody(room,player){if(!geodeBodyBlocks(room,player.x,player.y))return null;const b=(room.enemies||[]).find(b=>crownActive(b)&&b.hp>0&&geodeBodyContains(b,player.x,player.y)),out=[];for(let y=b.y-2;y<=b.y+2;y++)for(let x=b.x-2;x<=b.x+2;x++){if(!isFloor(room,x,y)||geodeObstacleBlocks(room,x,y)||room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===x&&n.y===y))continue;out.push({x,y,d:Math.abs(x-player.x)+Math.abs(y-player.y),rear:y<b.y});}out.sort((a,b)=>a.d-b.d||Number(a.rear)-Number(b.rear)||b.y-a.y||a.x-b.x);return out[0]?{x:out[0].x,y:out[0].y}:null;}
