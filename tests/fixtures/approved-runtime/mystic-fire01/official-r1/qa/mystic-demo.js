import * as E from '../../../../../../dist/core.js';
import {mysticApproach,mysticFireAt,mysticOpen} from '../../../../../../dist/mystic-mechanic.js';
// QA uses only ordinary inputs and basic movement, never changes player stats.
export function mysticDemoAction(s,b,beat){const r=s.run,p=r.player,m=b.mirage,d=q=>Math.abs(q.x-b.x)+Math.abs(q.y-b.y),danger=q=>mysticFireAt(b,q,beat)||!!(m.shot&&beat>=m.shot.due&&m.shot.tiles.some(t=>t.x===q.x&&t.y===q.y));if(b.hp<=0)return{type:'move',...r.room.exit};
 const attack=m.phase===1&&['hunt','open'].includes(m.state)||m.phase===2&&mysticOpen(b,beat);
 if(attack&&d(p)<=2&&!danger(p))return{type:'hit',id:b.id};
 let goal=p;if(m.phase===1&&['reveal','hunt','open'].includes(m.state)||m.phase===2&&m.state==='exhausted')goal=mysticApproach(b,p,r.room,E.walkable,E.pathTo);
 const candidates=[];for(let y=Math.max(1,p.y-4);y<=Math.min(r.room.rows-2,p.y+4);y++)for(let x=Math.max(1,p.x-4);x<=Math.min(r.room.cols-2,p.x+4);x++){const q={x,y};if(!E.walkable(r.room,x,y)||danger(q))continue;const path=E.pathTo(r.room,p,q);if(path.length>E.movement(s)||!path.length&&(x!==p.x||y!==p.y))continue;candidates.push({q,cost:Math.abs(q.x-goal.x)+Math.abs(q.y-goal.y)+path.length*.1+(mysticFireAt(b,q,beat+1)?3:0)});}candidates.sort((a,z)=>a.cost-z.cost);return{type:'move',...(candidates[0]?.q||p)};}
