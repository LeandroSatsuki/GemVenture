import {paintVfxEmission} from './vfx-emission.js';
import {CRYSTAL_VEIN_RAMPS} from './crystal-veins.js';
import {P} from './palette.js';
const q=n=>Math.round(n*2)/2,clamp=n=>Math.max(0,Math.min(1,n));
export const MINING_SPEC=Object.freeze({hit:.3,break:.62,maxEvents:12,hitShards:4,breakShards:7,recoil:.11});
export function miningFrame(event,age,{soft=false}={}){
 const duration=event.breaking?MINING_SPEC.break:MINING_SPEC.hit;
 if(!Number.isFinite(age)||age<0||age>=duration)return null;
 return {age,phase:age/duration,alpha:clamp((duration-age)/.15),duration,soft,count:soft?(event.breaking?3:2):event.breaking?7:4};
}
export function miningShardFrame(e,f){
 const direction=Math.atan2(e.dy,e.dx),ramp=CRYSTAL_VEIN_RAMPS[e.kind%4],out=[],soft=f.soft;
 for(let i=0;i<f.count;i++){
  const lane=(i-(f.count-1)/2)/(f.count-1||1),variation=Math.sin((e.seed+1)*13+i*4.3),angle=direction+lane*(e.breaking?4.8:2.05)+variation*.12;
  const speed=soft?e.breaking?10:4:e.breaking?34+(i%3)*11:40+(i%2)*12,travel=(soft?0:e.breaking?6:2)*(1-Math.exp(-f.age*35))+speed*f.age;
  const x=Math.cos(angle)*travel,y=Math.sin(angle)*travel+(e.breaking?60:36)*f.age*f.age,radius=(e.breaking?2.1+(i%3)*.4:1.05+(i%2)*.25)*(1-f.phase*.45);
  out.push({x,y,radius,height:radius*(1.3+(i%2)*.35),color:i%3===0?ramp[3]:ramp[0],shade:ramp[2]});
 }return out;
}
function miningEmissionFrame(e,f){
 const color=CRYSTAL_VEIN_RAMPS[e.kind%4][3],out=miningShardFrame(e,f).map(p=>({x:p.x,y:p.y,radius:4+p.radius,alpha:f.alpha,color,kind:'mining-fragment'}));
 const flash=Math.max(0,1-f.age/(e.breaking?.2:.16));if(flash>0)out.push({x:0,y:0,radius:e.breaking?13:8,alpha:flash,color,kind:'mining-contact'});return out;
}
export function createMiningPainter(){
 let items=[],seen=new WeakSet(),serial=0;
 function clear(){items=[];seen=new WeakSet();serial=0;}
 function consume(events,project,player,time,{projected=false}={}){
  const loot=new Set(events.filter(e=>e.type==='loot').map(e=>e.x+','+e.y));let added=0;
  for(const e of events){if(e.type!=='hit'||!e.mineral||seen.has(e)||!Number.isFinite(e.damage)||e.damage<=0)continue;seen.add(e);
   const point=project(e.x,e.y),from=projected?player:project(player.x,player.y),dx=point.x-from.x,dy=point.y-from.y,length=Math.hypot(dx,dy)||1;
   const breaking=loot.has(e.x+','+e.y);
   items.push({id:e.mineral.id,kind:e.mineral.kind,x:point.x/2,y:point.y/2-(breaking?8:14),dx:dx/length,dy:dy/length,breaking,at:time,seed:serial++});added++;
  }
  if(items.length>MINING_SPEC.maxEvents)items.splice(0,items.length-MINING_SPEC.maxEvents);return added;
 }
 function scroll(dx=2,dy=16){for(const e of items){e.x-=dx;e.y-=dy;}}
 function update(time){items=items.filter(e=>miningFrame(e,time-e.at));}
 function poly(c,points,color,alpha=1){
  c.save();try{c.globalAlpha*=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();c.fill();}finally{c.restore();}
 }
 function shard(c,x,y,w,h,color,shade){
  poly(c,[[x,y-h],[x+w,y-h*.2],[x+w*.45,y+h],[x-w*.5,y+h*.65],[x-w,y]],color);
  poly(c,[[x,y-h],[x+w,y-h*.2],[x+w*.45,y+h],[x,y+h*.3]],shade);
 }
 function emissionSources(time,{soft=false}={}){return items.flatMap(e=>{const f=miningFrame(e,time-e.at,{soft});return f?miningEmissionFrame(e,f).map(p=>({...p,x:p.x+e.x,y:p.y+e.y})):[];});}
 function drawWithEmission(c,time,options={}){if(options.glow!==false)paintVfxEmission(c,emissionSources(time,{soft:!!options.soft}),{soft:!!options.soft});return draw(c,time,options);}
 function draw(c,time,{soft=false,glow=true}={}){
  for(const e of items){const f=miningFrame(e,time-e.at,{soft});if(!f)continue;
   const ramp=CRYSTAL_VEIN_RAMPS[e.kind%4];
   c.save();try{
    c.translate(e.x,e.y);c.globalCompositeOperation='source-over';c.globalAlpha*=f.alpha;
    const spark=Math.sqrt(clamp(1-f.age/(e.breaking?.18:.16))),size=(e.breaking?7.5:4)*(soft?.7:1)*(1+(1-spark)*.2);
    if(spark>0){
     const points=[[0,-size],[size*.32,-size*.2],[size,0],[size*.22,size*.2],[0,size*.65],[-size*.22,size*.2],[-size,0],[-size*.32,-size*.2]];
     if(glow){c.save();c.globalAlpha*=spark*(soft?.07:.12);c.strokeStyle=ramp[3];c.lineWidth=2.5;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();c.stroke();c.restore();}
     poly(c,points,ramp[3],spark);
     poly(c,[[0,-size*.75],[size*.25,0],[0,size*.45],[-size*.25,0]],P.lemon,spark*.9);
    }
    const direction=Math.atan2(e.dy,e.dx);
    for(let i=0;i<f.count;i++){
     const lane=(i-(f.count-1)/2)/(f.count-1||1),variation=Math.sin((e.seed+1)*13+i*4.3);
     const angle=direction+lane*(e.breaking?4.8:2.05)+variation*.12;
     const speed=soft?e.breaking?10:4:e.breaking?34+(i%3)*11:40+(i%2)*12;
     const travel=(soft?0:e.breaking?6:2)*(1-Math.exp(-f.age*35))+speed*f.age;
     const x=Math.cos(angle)*travel,y=Math.sin(angle)*travel+(e.breaking?60:36)*f.age*f.age;
     const radius=(e.breaking?2.1+(i%3)*.4:1.05+(i%2)*.25)*(1-f.phase*.45);
     shard(c,x,y,radius,radius*(1.3+(i%2)*.35),i%3===0?ramp[3]:ramp[0],ramp[2]);
    }
    if(e.breaking&&!soft&&f.age<.32)for(const side of [-1,1]){
     const a=clamp(1-f.age/.32),x=side*(8+f.age*25),y=-3-f.age*12;
     poly(c,[[x,y-2*a],[x+a,y],[x,y+2*a],[x-a,y]],ramp[3],a);
    }
   }finally{c.restore();}
  }
 }
 function pose(id,time,{soft=false}={}){
  if(soft)return null;const e=items.findLast(e=>e.id===id),age=e?time-e.at:Infinity;
  if(!e||e.breaking||age<.012||age>MINING_SPEC.recoil)return null;
  return {dx:Math.sign(e.dx)*.5,dy:Math.sign(e.dy)*.5};
 }
 return Object.freeze({clear,consume,draw:drawWithEmission,pose,scroll,update,emissionSources,status:time=>({queued:items.length,active:items.filter(e=>miningFrame(e,time-e.at)).length,breaks:items.filter(e=>e.breaking).length})});
}

// One contact per mineral per synchronous packet. Loot closes that contact;
// scroll separates coordinate epochs. Domain events and rewards are never changed.
export function prepareMiningPacket(events){
 const pending=new Map(),groups=[];
 for(const e of events){
  if(e.type==='scroll'){pending.clear();continue;}
  const key=e.x+','+e.y;
  if(e.type==='hit'&&e.mineral&&Number.isInteger(e.mineral.kind)&&e.mineral.kind>=0&&e.mineral.kind<4&&e.mineral.id!=null&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.damage)&&e.damage>0){
   let group=pending.get(key);
   if(!group||group.id!==e.mineral.id){group={id:e.mineral.id,last:e,loot:null};groups.push(group);pending.set(key,group);}else group.last=e;
  }else if(e.type==='loot'&&pending.has(key)){const group=pending.get(key);group.loot=e;pending.delete(key);}
 }
 return {contacts:new Map(groups.map(g=>[g.last,g.loot])),loots:new Set(groups.filter(g=>g.loot).map(g=>g.loot))};
}
