import {isFloor} from './cave-layout.js';
import {openingRockHp} from './opening-mining.js';
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function initCeiling(room){room.ceiling={falls:[],next:24,landed:0,budget:12,stock:room.rocks.length};}
function safeLanding(r,p){
 const room=r.room,cols=room.cols||21;
 if(distance(r.player,p)<2||distance(room.exit||{x:0,y:0},p)<3||room.layout?.protectedTiles?.includes(p.y*cols+p.x))return false;
 if([...room.nodes,...room.enemies].some(n=>n.hp>0&&distance(n,p)<2))return false;
 // A free 3x3 ring prevents a boulder from sealing a narrow passage or isolating a tile.
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(!isFloor(room,p.x+dx,p.y+dy)||room.rocks.some(n=>(n.hp==null||n.hp>0)&&n.x===p.x+dx&&n.y===p.y+dy))return false;
 return true;
}
export function ceilingTick(r,beat,random){
 if(r.room.bossFloor||r.room.cleared||r.recovery?.active||r.rest?.active||r.abyss?.cardChoice)return;
 const room=r.room;room.ceiling??={falls:[],next:beat+24,landed:0,budget:12,stock:room.rocks.filter(n=>n.hp>0).length};
 const ceiling=room.ceiling;
 for(const p of ceiling.falls.filter(p=>p.due<=beat)){
  if(safeLanding(r,p)){
   const hp=openingRockHp(r,2,24+Math.floor((r.floor-1)*.8));
   room.rocks.push({id:room.nextId++,type:'rock',kind:2,x:p.x,y:p.y,hp,maxHp:hp,value:1,falling:true});ceiling.landed++;
   r.events.push({type:'rockfall',x:p.x,y:p.y});
  }else r.events.push({type:'rockfallDust',x:p.x,y:p.y});
 }
 ceiling.falls=ceiling.falls.filter(p=>p.due>beat);
 if(beat<ceiling.next||ceiling.landed+ceiling.falls.length>=ceiling.budget)return;
 ceiling.next=beat+24;
 const live=room.rocks.filter(n=>n.hp>0).length;
 if(live>=ceiling.stock*.65)return;
 const cols=room.cols||21,rows=room.rows||15;
 for(let attempt=0;attempt<96&&ceiling.falls.length<3&&ceiling.landed+ceiling.falls.length<ceiling.budget;attempt++){
  const local=room.campaignCave?.version===1;const p={x:local?Math.max(2,Math.min(cols-3,r.player.x-9+Math.floor(random()*19))):2+Math.floor(random()*(cols-4)),y:local?Math.max(2,Math.min(rows-3,r.player.y-9+Math.floor(random()*19))):2+Math.floor(random()*(rows-4)),born:beat,due:beat+3,kind:2};
  if(safeLanding(r,p)&&distance(r.player,p)<=9&&!ceiling.falls.some(q=>distance(p,q)<4)){
   ceiling.falls.push(p);r.events.push({type:'ceilingWarning',...p});
  }
 }
}
export function validCeiling(room){
 const c=room.ceiling;if(c===undefined)return true;
 return !!c&&Number.isSafeInteger(c.next)&&c.next>=0&&Number.isSafeInteger(c.landed)&&c.landed>=0&&c.landed<=12&&c.budget===12&&Number.isSafeInteger(c.stock)&&c.stock>=0&&c.stock<=200&&Array.isArray(c.falls)&&c.falls.length<=3&&c.falls.every(p=>Number.isSafeInteger(p.born)&&p.born>=0&&p.due===p.born+3&&p.kind===2&&isFloor(room,p.x,p.y));
}
