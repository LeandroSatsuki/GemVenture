import {P} from './palette.js';

// Art only. Exact cells are supplied by the mechanic; never choose targets,
// change collision, resize at an arena edge, or infer stun from a painted shape.
const cache=new Map(),MAX_CACHE=16;
const directions={right:[1,0,0,1],left:[-1,0,0,-1],down:[0,1,-1,0],up:[0,-1,1,0]};
export function carrotTelegraphCacheStatus(){return {entries:cache.size,limit:MAX_CACHE};}
export function carrotCellLoops(tiles){
 if(!Array.isArray(tiles)||!tiles.length||tiles.length>80||tiles.some(p=>!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)))return null;
 const ids=[...new Set(tiles.map(p=>p.x+','+p.y))].sort(),key=ids.join(';');if(cache.has(key))return cache.get(key);
 const edges=new Map(),pk=p=>p.join(',');for(const id of ids){const[x,y]=id.split(',').map(Number),v=[[x-.5,y-.5],[x+.5,y-.5],[x+.5,y+.5],[x-.5,y+.5]];for(let i=0;i<4;i++){const a=v[i],b=v[(i+1)%4],ab=pk(a)+'>'+pk(b),ba=pk(b)+'>'+pk(a);if(edges.has(ba))edges.delete(ba);else edges.set(ab,[a,b]);}}
 const loops=[];while(edges.size){let edge=edges.values().next().value,start=pk(edge[0]),loop=[edge[0]],closed=false;for(let n=0;n<400;n++){edges.delete(pk(edge[0])+'>'+pk(edge[1]));loop.push(edge[1]);if(pk(edge[1])===start){closed=true;break;}const end=pk(edge[1]);edge=[...edges.values()].find(e=>pk(e[0])===end);if(!edge)break;}if(!closed)return null;loops.push(loop);}
 if(cache.size>=MAX_CACHE)cache.delete(cache.keys().next().value);cache.set(key,loops);return loops;
}
function path(c,loops){c.beginPath();for(const loop of loops){loop.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}}
export function paintCarrotTelegraph(c,w,{project}={}){
 if(!w||!directions[w.direction]||!w.center||![w.center.x,w.center.y].every(Number.isFinite)||typeof project!=='function')return false;const raw=carrotCellLoops(w.tiles);if(!raw)return false;const loops=raw.map(loop=>loop.map(([x,y])=>project({x,y}))),center=project(w.center);if([...loops.flat(),center].some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;
 c.save();path(c,loops);c.clip();c.fillStyle='#f06c1a';c.globalAlpha=.07;c.fill();c.globalAlpha=w.soft?.8:.68+Math.pow(1-(w.beat||0)%1,3)*.2;c.strokeStyle='#ed9353';c.lineWidth=2;path(c,loops);c.stroke();const count=Math.max(0,Math.min(3,Math.ceil(w.remaining??3)));for(let i=0;i<3;i++){c.globalAlpha=i<count?1:.18;c.fillStyle='#ffd95a';c.fillRect(center.x-7+i*5,center.y-2,3,3);}c.restore();return true;
}
