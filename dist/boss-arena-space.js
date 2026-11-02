// One bounded spatial revision, separate from encounter timing and rewards.
export const BOSS_ARENA_SPACE=Object.freeze({version:3,cols:25,rows:19,zoom:.92});
export const expandedBossArena=room=>room?.campaignCave?.arena===true&&[2,3].includes(room.campaignCave.arenaRevision);
export function bossArenaSize(boss){return boss?.arenaSize||{cols:21,rows:15};}
export function bossArenaCenter(boss){const {cols,rows}=bossArenaSize(boss);return {x:Math.floor(cols/2),y:Math.floor(rows/2)+(boss?.arenaSize?1:0)};}
export function validBossArenaSize(boss){const a=boss?.arenaSize;return a===undefined||!!a&&((a.cols===23&&a.rows===17)||(a.cols===25&&a.rows===19))&&Object.keys(a).length===2;}
export function validBossArenaContext(room,boss){if(!validBossArenaSize(boss))return false;const a=boss.arenaSize;if(expandedBossArena(room)?(!a||a.cols!==room.cols||a.rows!==room.rows):a!==undefined)return false;const w=boss.windup?.arenaSize;return w===undefined||!!a&&w?.cols===a.cols&&w?.rows===a.rows&&Object.keys(w).length===2;}
export function bossArenaCorners(cols,rows){const r=cols-2,b=rows-2;return [[1,1],[2,1],[1,2],[r,1],[r-1,1],[r,2],[1,b],[2,b],[1,b-1],[r,b],[r-1,b],[r,b-1]];}
export function bossArenaArt(room,original){
 if(!expandedBossArena(room))return original;
 const props=original.props.map(p=>{const gx=p.grid.x>10?p.grid.x+room.cols-21:p.grid.x,gy=p.grid.y>7?p.grid.y+room.rows-15:p.grid.y,dx=(gx-p.grid.x)*22+(gy-p.grid.y)*2,dy=(gy-p.grid.y)*16;return {...p,grid:{x:gx,y:gy},offset:[p.offset[0]+dx,p.offset[1]+dy],bounds:{...p.bounds,x:p.bounds.x+dx,y:p.bounds.y+dy},visualDepth:gy,brazier:{...p.brazier,x:p.brazier.x+dx,y:p.brazier.y+dy}};});
 return {...original,props};
}
export function bossArenaPavingTransform(room){const sx=(room.cols-2)/19,sy=(room.rows-2)/13,cx=50+22*Math.floor(room.cols/2)+2*Math.floor(room.rows/2),cy=57.5+16*Math.floor(room.rows/2);return {sx,sy,x:cx-284*sx,y:cy-169.5*sy};}

export function validExpandedBossRoom(room){const revision=room?.campaignCave?.arenaRevision;return expandedBossArena(room)&&(revision===2?room.cols===23&&room.rows===17:room.cols===25&&room.rows===19);}
export function bossArenaCamera(room){const x=Math.floor(room.cols/2),y=Math.floor(room.rows/2);return {x:100+44*x+4*y,y:115+32*y+21};}
