import {paintVfxEmission} from './vfx-emission.js';
import {P} from './palette.js';

// One local decorative pulse. The existing Effects.age is its only clock.
export const HEAL_VFX_SPEC=Object.freeze({duration:.54,maxBurst:.84,fadeIn:.055,fadeOut:.18,crosses:3,travel:8,maxWidth:31,maxHeight:45});
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const points=Object.freeze([Object.freeze({x:-12,y:-13,size:2.5,delay:0}),Object.freeze({x:12,y:-19,size:2.8,delay:.035}),Object.freeze({x:0,y:-33,size:2.2,delay:.07})]);
const clamp=n=>Math.max(0,Math.min(1,n));
export function createPlayerHeal(){
 let start=-Infinity,end=-Infinity,seen=new WeakSet(),body=null;
 const clear=()=>{start=end=-Infinity;seen=new WeakSet();body=null;};
 function consume(events,time){
  if(!finite(time)||time<0)return 0;let accepted=0;
  for(const event of events){if(!event||event.type!=='heal'||!finite(event.value)||event.value<=0||seen.has(event))continue;seen.add(event);accepted++;}
  if(!accepted)return 0;
  if(time>=end){start=time;end=time+HEAL_VFX_SPEC.duration;}
  else end=Math.min(start+HEAL_VFX_SPEC.maxBurst,Math.max(end,time+HEAL_VFX_SPEC.duration));
  return accepted;
 }
 function sample(time,{soft=false}={}){
  if(!finite(time)||time<start||time>=end)return null;
  const age=time-start,alpha=clamp(age/HEAL_VFX_SPEC.fadeIn)*clamp((end-time)/HEAL_VFX_SPEC.fadeOut);
  const symbols=(soft?[{x:12,y:-22,size:2.8,delay:0}]:points).map(p=>{const phase=clamp((age-p.delay)/.45);return{x:p.x,y:p.y-(soft?0:phase*HEAL_VFX_SPEC.travel),size:p.size,alpha:alpha*(age>=p.delay?1:0)};});
  return{alpha,age,end,start,symbols,soft:!!soft};
 }
 function draw(c,bodyWorld,time,options={}){
  if(!bodyWorld||![bodyWorld.x,bodyWorld.y].every(finite))return false;const frame=sample(time,options);if(!frame||frame.alpha<=0)return false;
  body={...bodyWorld};c.save();c.translate(bodyWorld.x/2,bodyWorld.y/2);
  paintVfxEmission(c,frame.symbols.map(p=>({x:p.x,y:p.y,radius:p.size+4,alpha:p.alpha,color:P.lime})),{soft:!!options.soft});
  for(const p of frame.symbols){if(p.alpha<=0)continue;const s=p.size;c.save();c.translate(p.x,p.y);c.globalAlpha*=p.alpha;
   c.fillStyle=P.green;c.fillRect(-s*.28,-s+1,s*.56,2*s);c.fillRect(-s,-s*.28+1,2*s,s*.56);
   c.fillStyle=P.lime;c.fillRect(-s*.28,-s,s*.56,2*s);c.fillRect(-s,-s*.28,2*s,s*.56);c.restore();
  }
  c.restore();return true;
 }
 function emissionSources(time,{soft=false}={}){const f=body&&sample(time,{soft});return f?f.symbols.map(p=>({x:body.x/2+p.x,y:body.y/2+p.y,radius:8,alpha:p.alpha,color:P.lime})):[];}
 return Object.freeze({clear,consume,sample,draw,emissionSources});
}
