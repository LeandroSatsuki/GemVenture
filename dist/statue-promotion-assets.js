import {STATUE_PROMOTION_ART} from './statue-promotion-vfx-manifest.js';
export const STATUE_PROMOTION_EMBEDDED=Object.freeze({});

// Only supplied, registered caches. Preparation never runs inside the painter.
export function createStatuePromotionAssets({makeImage=()=>new Image()}={}){
 const images=new Map(),descriptors=new Map(),failed=new Set();let pending=null;
 function loadAll(){
  if(pending)return pending;
  const jobs=STATUE_PROMOTION_ART.flatMap(stage=>Object.entries(stage.roles).map(([role,spec])=>({stage,role,spec})));let next=0;
  const load=job=>new Promise(resolve=>{
   let image;try{image=makeImage();}catch{failed.add(job.spec.file);resolve();return;}
   image.onerror=()=>{failed.add(job.spec.file);resolve();};image.onload=()=>{
    if(image.naturalWidth===job.spec.width&&image.naturalHeight===job.spec.height)images.set(job.spec.file,image);else failed.add(job.spec.file);resolve();
   };image.src=STATUE_PROMOTION_EMBEDDED[job.spec.file]||job.spec.file;
  });
  pending=Promise.all(Array.from({length:2},async()=>{while(next<jobs.length)await load(jobs[next++]);})).then(()=>{
   for(const stage of STATUE_PROMOTION_ART){
    const roles=Object.fromEntries(Object.entries(stage.roles).map(([role,spec])=>[role,images.get(spec.file)||null]));
    if(roles.full)descriptors.set(stage.tier,Object.freeze({tier:stage.tier,id:stage.id,frame:stage.frame,...roles,separationVerified:stage.separationVerified&&!!roles.figure&&!!roles.pedestal&&!!roles.shine&&!!roles.cracks,accent:stage.accent}));
   }
   return status();
  });return pending;
 }
 function status(){return {loaded:images.size,stages:descriptors.size,failed:[...failed],pixels:[...images.values()].reduce((sum,image)=>sum+image.width*image.height,0),maximumImages:35};}
 return Object.freeze({loadAll,get:tier=>descriptors.get(tier)||null,status});
}
