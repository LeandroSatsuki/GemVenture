import {isFloor} from './cave-layout.js';
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),point=(room,p)=>p.y*room.cols+p.x;
const mix=n=>{n=Math.imul(n^(n>>>16),0x45d9f3b);return(n^(n>>>16))>>>0;};
const enabled=run=>run.mode!=='abyss'&&!run.trainingClock&&!run.room.bossFloor&&!!run.room.campaignCave&&!run.room.campaignCave.arena;
export const inZagArea=(room,p)=>!!room.caveZag&&Math.abs(p.x-room.caveZag.x)<=1&&Math.abs(p.y-room.caveZag.y)<=1;
function reachable(room,start){const blocked=new Set(room.rocks.filter(n=>n.hp==null||n.hp>0).map(n=>point(room,n))),dist=new Int32Array(room.cols*room.rows).fill(-1),q=[start];dist[point(room,start)]=0;for(let i=0;i<q.length;i++)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const p={x:q[i].x+dx,y:q[i].y+dy},id=point(room,p);if(isFloor(room,p.x,p.y)&&!blocked.has(id)&&dist[id]<0){dist[id]=dist[point(room,q[i])]+1;q.push(p);}}return dist;}
export function placeCaveZag(run){
 const room=run.room;if(!enabled(run))return null;const seed=mix(room.seed^0x5a61b);if(run.floor!==1&&seed%4===0)return null;
 const dist=reachable(room,run.player),occupied=new Set([...room.nodes,...room.rocks,...room.enemies].filter(n=>n.hp==null||n.hp>0).map(n=>point(room,n))),candidates=[];
 // Keep Zag's established seeded location and silhouette clearance. Only a
 // small NPC neighborhood remains reserved; there are no display pads.
 for(const hall of room.layout.rooms.filter(h=>h.kind==='main'))for(const dy of[-4,0,4])for(const dx of[-4,0,4]){const p={x:hall.x+dx,y:hall.y+dy},d=dist[point(room,p)];if(d<7||d>90||distance(p,room.exit)<8||distance(p,room.hedgehog)<16)continue;let clear=true;for(let y=-1;y<=3;y++)for(let x=-4;x<=4;x++){const t={x:p.x+x,y:p.y+y};if(!isFloor(room,t.x,t.y)||occupied.has(point(room,t))||dist[point(room,t)]<0)clear=false;}if(clear)candidates.push({...p,d,hall:hall.id,key:mix(seed^point(room,p))});}
 candidates.sort((a,b)=>a.d-b.d||a.key-b.key);const byHall=[...new Map([...candidates].reverse().map(p=>[p.hall,p])).values()].sort((a,b)=>a.d-b.d||a.key-b.key),other=byHall.filter(p=>p.hall!==0),nearest=run.floor===1?candidates.slice(0,1):(other.length?other:byHall).slice(0,4);if(!nearest.length)return null;
 const p=nearest[seed%nearest.length],zag=room.caveZag={version:1,x:p.x,y:p.y};const reserved=new Set(room.layout.protectedTiles||[]);for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)reserved.add(point(room,{x:p.x+x,y:p.y+y}));room.layout.protectedTiles=[...reserved];return zag;
}
// Retired shop data is read only once on load. No stock, prices or purchase
// behavior survives migration; already equipped run powers remain separate.
export function migrateCaveZag(run){const room=run.room;if(room.zagShop===undefined)return;const old=room.zagShop;if(room.caveZag===undefined&&enabled(run)&&Number.isInteger(old?.x)&&Number.isInteger(old?.y)&&isFloor(room,old.x,old.y))room.caveZag={version:1,x:old.x,y:old.y};delete room.zagShop;}
export function validCaveZag(run){const zag=run.room.caveZag;return zag===undefined||enabled(run)&&zag?.version===1&&Number.isInteger(zag.x)&&Number.isInteger(zag.y)&&isFloor(run.room,zag.x,zag.y)&&Object.keys(zag).every(k=>['version','x','y'].includes(k));}
