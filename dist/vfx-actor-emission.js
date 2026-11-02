import {strikeDirt,RABBIT_MATERIALS} from './rabbit-polished.js';
// Read the actual approved dirt geometry; the rabbit painter/rig stays intact.
export function rabbitDirtEmission(p,{soft=false}={}){
 if(!p?.context||!p.carrot||!Number.isFinite(p.phase)||typeof p.project!=='function')return[];
 const q=p.project(p.carrot.target.x,p.carrot.target.y);
 return strikeDirt(p.carrot,p.phase,soft).map(v=>({x:q.x/2+v.x+v.y/11,y:q.y/2+v.y*8/11-v.z,radius:Math.min(7,v.size*1.5),alpha:v.alpha*.38,color:RABBIT_MATERIALS.soil[0],kind:'rabbit-dirt'}));
}
