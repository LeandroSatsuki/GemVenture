import {crownActive} from '../dist/geode-crown.js';
import {demoAction as crownDemoAction} from './helpers/geode-crown-demo.mjs';
import {usesStairs} from '../dist/cave-descent.js';
import {visible} from '../dist/cavern.js';
import * as E from '../dist/core.js';
import {mysticActive} from '../dist/mystic-mechanic.js';
import {mysticDemoAction} from '../asset-work/mystic-fire01/official-r1/qa/mystic-demo.js';
// A rhythm-perfect player who reacts to telegraphs and uses earned items.
export function prepareVeteran(s){
 s.seals=3;s.level=12;s.core=6;s.unlocked=['force','harvest','breath','ear','stun','chain','fury'];s.equipped=['force','harvest','breath','ear','fury'];s.skillRanks={force:3,breath:3,fury:3};
}
export function playFloor(s,onBeat){
 for(let beat=0;beat<600&&s.run&&!s.run.room.cleared;beat++){
  if(s.run.recovery?.active)E.resumeRecovery(s);s.run.events=[];E.enemyBeat(s,beat);
  const r=s.run,boss=r.room.enemies.find(e=>e.boss&&e.hp>0);
  // The crown requires three explicit flank fractures before direct damage.
  if(crownActive(boss)){const action=crownDemoAction(s,boss,beat);E.act(s,action,beat);if(s.run)E.tick(s,beat);if(onBeat)onBeat(s,beat,action);continue;}
  // The approved mirage/head encounter has explicit windows; generic greedy damage cannot discover them.
  if(mysticActive(boss)){const action=mysticDemoAction(s,boss,beat);E.act(s,action,beat);if(s.run)E.tick(s,beat);if(onBeat)onBeat(s,beat,action);continue;}
  // Keep mining choices available even when a horde is nearer than the crystals.
  const nearby=list=>list.filter(n=>n.hp>0&&visible(r.room,n)).sort((a,b)=>E.distance(a,r.player)-E.distance(b,r.player)).slice(0,3);
  const targets=[...new Set([...nearby(r.room.nodes),...nearby(r.room.enemies.filter(e=>e.bossIndex!==4)),...(boss&&boss.bossIndex!==4?[boss]:[])])];
  const leaving=usesStairs(r)&&(!boss&&(r.room.bossFloor||r.score.earned>=2||beat>=160));const exitPath=leaving?E.pathTo(r.room,r.player,r.room.exit):[];const exitStep=exitPath.slice(0,E.movement(s)).reverse().find(p=>!r.room.explored||r.room.explored[p.y*r.room.cols+p.x]);
  const objective=leaving?r.room.exit:(boss?.bossIndex===4?nearby(r.room.enemies.filter(e=>e.summon!==undefined))[0]:boss)||nearby(r.room.nodes)[0];
  const actions=[...(exitStep?[{type:'move',...exitStep}]:[]),...[[2,2],[2,-2],[-2,2],[-2,-2]].filter(([dx,dy])=>E.walkable(r.room,r.player.x+dx,r.player.y+dy)).map(([dx,dy])=>({type:'move',x:r.player.x+dx,y:r.player.y+dy})),...targets.map(n=>({type:'hit',id:n.id})),...[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({type:'dodge',dx,dy})),...['tonic','blast','ward'].filter(item=>r.items[item]>0).map(item=>({type:'item',item}))];
  let best,highest=-Infinity;
  for(const action of actions){
   const trial=cloneTrial(s);trial.run.events=[];
   E.act(trial,action,beat);if(trial.run)E.tick(trial,beat);
   const v=trial.run;
   const bossDamage=boss&&v?boss.hp-(v.room.enemies.find(e=>e.id===boss.id)?.hp||0):0;
   // During a boss fight, the objective is boss damage, never elevator charge.
   const approach=v&&objective?(leaving?exitPath.length-E.pathTo(v.room,v.player,v.room.exit).length:E.distance(objective,r.player)-E.distance(objective,v.player)):0;
   const mining=v?v.events.filter(e=>e.type==='hit'&&r.room.nodes.some(n=>n.id!==undefined&&n.x===e.x&&n.y===e.y)).reduce((sum,e)=>sum+e.damage,0):0;
   const discovery=v?.room.explored?v.room.explored.reduce((sum,n,i)=>sum+(n&&!r.room.explored[i]?1:0),0):0;
   const rating=!v?-1e8:(v.room.cleared?10000:0)+approach*(leaving?70:5)+discovery*.45+mining*3+(v.health-r.health)*12+(v.rhythm-r.rhythm)*3+(boss?bossDamage*8:(v.room.charge-r.room.charge)*35)+((v.bag-r.bag)+v.materials.reduce((sum,n,i)=>sum+n-r.materials[i],0))*.2+(v.combo-r.combo)*4+v.events.filter(e=>e.type==='hit').reduce((sum,e)=>sum+e.damage,0)-(action.type==='item'?8:0);
   if(rating>highest){highest=rating;best=action;}
  }
  E.act(s,best,beat);if(s.run)E.tick(s,beat);if(onBeat)onBeat(s,beat,best);
 }
}

// Trial actions mutate actors and visibility, not campaign topology/materials.
// Share these immutable large inputs; retain private copies of explored/visible.
function cloneTrial(s){if(!s.run.room.campaignCave)return structuredClone(s);const {floorMask,terrain,layout,explored,visible,...room}=s.run.room,copy=structuredClone({...s,run:{...s.run,room}});Object.assign(copy.run.room,{floorMask,terrain,layout,explored:explored?.slice()??explored,visible:visible?.slice()??visible});return copy;}
