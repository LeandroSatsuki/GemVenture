// QA-only: uses real navigation, action limits and the same wave danger schedule.
import {setGeodeCollisionPhase} from '../../dist/geode-collision.js';
import * as E from '../../dist/core.js';import{crownApproach}from'../../dist/geode-crown.js';import{inRear,waveDangerAt}from'../../dist/geode-fan.js';
export function demoAction(s,b,beat){const r=s.run;setGeodeCollisionPhase(r.room,beat);const danger=waveDangerAt(r.room,b,beat),next=waveDangerAt(r.room,b,beat+1),unsafe=p=>danger.some(t=>t.x===p.x&&t.y===p.y)||inRear(b,p),limit=E.movement(s),hit={type:'hit',id:b.id,crownSide:b.crown.side};
 let goal=crownApproach(b,r.player,b.crown.side);
 if(b.crown.stage==='open'||b.crown.stage==='recover'){
  const candidates=[['W',-2,0],['E',2,0],['S',0,2]].map(([side,dx,dy])=>({side,x:b.x+dx,y:b.y+dy}));
  const reachable=candidates.filter(p=>E.walkable(r.room,p.x,p.y)).map(p=>({p,path:E.pathTo(r.room,r.player,p)})).filter(o=>o.path.length||o.p.x===r.player.x&&o.p.y===r.player.y).sort((a,z)=>a.path.length-z.path.length);
  if(reachable[0]){goal=reachable[0].p;hit.crownSide=goal.side;}
 }
 const route=E.pathTo(r.room,r.player,goal),end=route.slice(0,limit).at(-1)||r.player;if(!unsafe(end))return hit;
 if(!unsafe(r.player))return{type:'move',...r.player};
 const options=[];for(let y=1;y<r.room.rows-1;y++)for(let x=1;x<r.room.cols-1;x++){const p={x,y};if(unsafe(p)||!E.walkable(r.room,x,y))continue;const path=E.pathTo(r.room,r.player,p);if(path.length&&path.length<=limit)options.push({p,path,future:next.some(n=>n.x===x&&n.y===y),toGoal:Math.abs(x-goal.x)+Math.abs(y-goal.y)});}options.sort((a,z)=>Number(a.future)-Number(z.future)||a.toGoal-z.toGoal||a.path.length-z.path.length);return options[0]?{type:'move',...options[0].p}:hit;
}
