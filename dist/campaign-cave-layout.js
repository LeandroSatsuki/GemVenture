import {BOSS_ARENA_SPACE,bossArenaCorners,campaignBossHome} from './boss-arena-space.js';
import {EXPEDITION_SPEC,createExpedition,createResourcePlan,expeditionDistances} from './campaign-cave-expedition.js';
export const CAMPAIGN_CAVE_VERSION=1;
export const isCampaignCave=room=>room?.campaignCave?.version===CAMPAIGN_CAVE_VERSION;
const inside=(r,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0&&x<r.cols-1&&y<r.rows-1&&r.floorMask[y*r.cols+x]===1;
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function finalizeCampaignCave(run,biome){
 if(run.mode==='abyss')return;
 const room=run.room;
 if(room.bossFloor){
  const {cols,rows,version}=BOSS_ARENA_SPACE,cx=Math.floor(cols/2),cy=Math.floor(rows/2),dx=cx-10,dy=cy-7;
  room.cols=cols;room.rows=rows;room.floorMask=Array.from({length:cols*rows},(_,i)=>+(i%cols>0&&i%cols<cols-1&&Math.floor(i/cols)>0&&Math.floor(i/cols)<rows-1));
  for(const [x,y]of bossArenaCorners(cols,rows))room.floorMask[y*cols+x]=0;
  room.terrain=Array(cols*rows).fill(0);room.explored=null;room.visible=null;room.exit={x:cols-3,y:2};run.player={x:4,y:rows-4};
  room.layout={version:1,style:'ARENA',rooms:[{x:cx,y:cy,rx:cx-1,ry:cy-1,kind:'boss'}],protectedTiles:room.floorMask.flatMap((v,i)=>v?[i]:[]),burrow:{x:cx-2,y:0}};
  room.hedgehog={...room.hedgehog,x:cx-2,y:0,biome};room.campaignCave={version:1,biome,arena:true,arenaRevision:version,bossHomeRevision:1};
  const boss=room.enemies.find(n=>n.boss);
  for(const n of room.nodes){n.x+=dx;n.y+=dy;}
  for(const n of room.enemies){n.x+=dx;n.y+=dy-1;}
  if(boss){boss.arenaHome=campaignBossHome(room);Object.assign(boss,boss.arenaHome);boss.arenaSize={cols,rows};}
  const occupied=new Set([...room.nodes,...room.enemies].filter(n=>inside(room,n.x,n.y)).map(n=>n.y*cols+n.x));
  for(const node of room.nodes)if(!inside(room,node.x,node.y)||boss&&distance(node,boss)<=2){occupied.delete(node.y*cols+node.x);const choices=[];for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(inside(room,x,y)&&!occupied.has(y*cols+x)&&(!boss||distance({x,y},boss)>2))choices.push({x,y,d:distance({x,y},node)});choices.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);if(!choices.length)throw Error('Campaign arena relocation exhausted');const {x,y}=choices[0];Object.assign(node,{x,y});occupied.add(y*cols+x);}
  return;
 }
 const world=createExpedition(room.seed,biome),original=[...room.nodes,...room.rocks],plan=createResourcePlan(world,{nodes:room.nodes,rocks:room.rocks});
 for(const [i,p]of plan.all.entries())Object.assign(original[i],{x:p.x,y:p.y});
 room.cols=world.cols;room.rows=world.rows;room.floorMask=Array.from(world.floorMask);room.terrain=Array.from(world.terrain);room.exit={...world.exit};room.hedgehog={...world.hedgehog};run.player={...world.spawn};
 room.layout={version:EXPEDITION_SPEC.layoutVersion,style:'EXPEDITION',seed:room.seed,spawn:{...world.spawn},rooms:world.rooms,connections:world.links,protectedTiles:Array.from(world.protected.entries()).filter(([,v])=>v).map(([i])=>i),reservedTiles:[...world.reserved],burrow:{x:world.hedgehog.x,y:world.hedgehog.y},burrowDistance:world.burrowDistance};
 room.campaignCave={version:1,biome,arena:false,...(run.floor<5?{departureVersion:2}:{})};room.explored=Array(room.cols*room.rows).fill(0);
 // Preserve the existing three starter veins, their IDs/HP/values and counts.
 const occupied=new Set(original.map(n=>n.y*room.cols+n.x));
 for(const node of room.nodes.slice(0,3)){occupied.delete(node.y*room.cols+node.x);const choices=[];for(let y=run.player.y-4;y<=run.player.y+4;y++)for(let x=run.player.x-4;x<=run.player.x+7;x++){const d=distance({x,y},run.player),i=y*room.cols+x;if(d>=2&&d<=6&&inside(room,x,y)&&!occupied.has(i)&&!world.reserved.has(i))choices.push({x,y,d:d+(x<run.player.x?2:0)});}choices.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);if(choices.length){node.x=choices[0].x;node.y=choices[0].y;}occupied.add(node.y*room.cols+node.x);}
 const reachable=expeditionDistances(world,run.player,new Set(room.rocks.map(n=>n.y*room.cols+n.x))).dist;
 for(const enemy of room.enemies){const choices=[];for(let y=run.player.y-16;y<=run.player.y+16;y++)for(let x=run.player.x-16;x<=run.player.x+16;x++){const i=y*room.cols+x,d=reachable[i];if(d>=7&&d<=20&&inside(room,x,y)&&!occupied.has(i))choices.push({x,y,d});}choices.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);if(!choices.length)throw Error('No campaign opening enemy location');const p=choices[(enemy.id*17)%choices.length];Object.assign(enemy,{x:p.x,y:p.y});occupied.add(p.y*room.cols+p.x);}
}
// Spatial adaptation only: existing wave count, cadence, health and rewards stay
// in core. Encounters must not begin hundreds of cells away in the enlarged map.
export function campaignEnemySpawn(room,player,random){
 const blocked=new Set(room.rocks.filter(n=>n.hp==null||n.hp>0).map(n=>n.y*room.cols+n.x)),queue=[{...player,d:0}],seen=new Set([player.y*room.cols+player.x]),choices=[];
 for(let at=0;at<queue.length;at++){const p=queue[at];if(p.d>=7&&distance(p,room.exit)>2&&![...room.nodes,...room.enemies].some(n=>n.hp>0&&distance(n,p)<2))choices.push(p);if(p.d>=24)continue;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,i=y*room.cols+x;if(inside(room,x,y)&&!blocked.has(i)&&!seen.has(i)){seen.add(i);queue.push({x,y,d:p.d+1});}}}
 if(!choices.length)return null;const p=choices[Math.floor(random()*choices.length)];return {x:p.x,y:p.y};
}
