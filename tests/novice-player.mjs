import * as E from '../dist/core.js';
import {visible} from '../dist/cavern.js';

// A bounded, imperfect player, not the old perfect-timing lookahead optimizer.
// It sees revealed targets, reacts to nearby warnings, occasionally misses a
// beat/attack warning and uses earned consumables. No cloned future simulation.
export function playNoviceFloor(s,{maxBeats=480,mistakes=true}={}){
 const random=E.rng(s.seed+s.attempts*773),stats={beats:0,misses:0,hitsTaken:0,damageTaken:0,cleared:false};
 for(let beat=0;beat<maxBeats&&s.run&&!s.run.room.cleared;beat++){
  const r=s.run;r.events=[];if(r.recovery?.active)E.resumeRecovery(s);E.enemyBeat(s,beat);
  const near=list=>list.filter(n=>n.hp>0&&visible(r.room,n)).sort((a,b)=>E.distance(a,r.player)-E.distance(b,r.player));
  const threats=r.room.enemies.filter(e=>e.hp>0&&e.windup&&e.windup.beat<=beat+1);
  const unsafe=p=>threats.some(e=>E.dangerTiles(e.windup).some(t=>E.distance(t,p)===0))||r.room.hazards.some(h=>h.until>=beat&&E.distance(h,p)===0);
  let action;
  if(r.health<55&&r.items.tonic)action={type:'item',item:'tonic'};
  else if(unsafe(r.player)&&random()>.1){
   const escapes=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({dx,dy,p:{x:r.player.x+dx,y:r.player.y+dy}})).filter(x=>E.walkable(r.room,x.p.x,x.p.y)&&!unsafe(x.p));
   if(escapes.length)action={type:'move',...escapes[Math.floor(random()*escapes.length)].p};
   else if(r.items.ward)action={type:'item',item:'ward'};
  }
  const enemies=near(r.room.enemies),nodes=near(r.room.nodes),close=enemies.filter(e=>E.distance(e,r.player)<=3);
  if(!action&&r.items.blast&&close.length>=2)action={type:'item',item:'blast'};
  const target=close[0]||nodes[0]||enemies[0];
  if(!action&&target)action={type:'hit',id:target.id};
  if(!action){
   const destinations=[];
   for(const [dx,dy]of [[4,0],[0,-4],[-4,0],[0,4]]){const p={x:r.player.x+dx,y:r.player.y+dy};if(E.walkable(r.room,p.x,p.y)&&E.pathTo(r.room,r.player,p).length)destinations.push(p);}
   action=destinations.length?{type:'move',...destinations[Math.floor(random()*destinations.length)]}:{type:'move',...r.player};
  }
  const miss=mistakes&&beat>=8&&random()<.07;
  const result=E.act(s,action,beat+(miss?.4:0));if(result.miss)stats.misses++;
  E.tick(s,beat);stats.beats++;
  for(const event of r.events)if(event.type==='hurt'&&event.reserve==='health'){stats.hitsTaken++;stats.damageTaken+=event.amount;}
 }
 stats.cleared=!!s.run?.room.cleared;stats.alive=!!s.run;stats.health=s.run?.health||0;
 stats.coins=s.run?.bag??s.lastResult?.kept??0;stats.materials=[...(s.run?.materials||s.lastResult?.keptMaterials||[0,0,0,0])];
 return stats;
}
