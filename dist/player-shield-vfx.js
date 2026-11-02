import {paintVfxEmission} from './vfx-emission.js';
import {createFamilyPainter} from './vfx-family.js';
import {P} from './palette.js';
// Decorative state only. `active` is supplied by World's existing protection predicate.
export const SHIELD_VFX_SPEC=Object.freeze({entry:.24,block:.22,exit:.20,rx:28*Math.sqrt(3)/2,ry:28,centerY:-17,maxWidth:65,maxHeight:65});
const finite=Number.isFinite,clamp=n=>Math.max(0,Math.min(1,n));
function shell(c,rx,ry){c.beginPath();[[0,-ry],[rx*.65,-ry*.82],[rx,-ry*.3],[rx*.86,ry*.48],[0,ry],[-rx*.86,ry*.48],[-rx,-ry*.3],[-rx*.65,-ry*.82]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function createPlayerShield(){
 const painter=createFamilyPainter(P);let emission=[],emissionAt=-Infinity;
 let wasActive=false,initialized=false,pendingEntry=false,pendingBlock=false,start=-Infinity,blockAt=-Infinity,exitAt=-Infinity,seen=new WeakSet();
 function clear(){emission=[];emissionAt=-Infinity;wasActive=initialized=pendingEntry=pendingBlock=false;start=blockAt=exitAt=-Infinity;seen=new WeakSet();}
 function consume(events){let count=0;for(const e of events){if(!e||typeof e!=='object'||seen.has(e))continue;if(e.type==='shield'||e.type==='boost'&&e.id==='shield'){seen.add(e);pendingEntry=true;count++;}else if(e.type==='shieldBlock'){seen.add(e);pendingBlock=true;count++;}}return count;}
 function sample({active=false,time,soft=false}={}){
  if(!finite(time)||time<0)return null;active=!!active;
  if(active&&((initialized&&!wasActive)||pendingEntry))start=time;
  if(active&&pendingBlock)blockAt=time;
  if(!active&&wasActive)exitAt=time;
  pendingEntry=pendingBlock=false;initialized=true;wasActive=active;
  if(!active&&(time<exitAt||time>=exitAt+SHIELD_VFX_SPEC.exit))return null;
  const entry=active?1-clamp((time-start)/SHIELD_VFX_SPEC.entry):0,block=active?1-clamp((time-blockAt)/SHIELD_VFX_SPEC.block):0,exit=active?0:clamp((time-exitAt)/SHIELD_VFX_SPEC.exit);
  return{active,entry,block,exit,soft:!!soft,scale:soft?1:active?1-entry*.15-block*.045:1-exit*.12,alpha:active?(soft?.65:.65+.065*Math.sin(time*Math.PI*2/2.8)):Math.max(0,1-exit)*.48};
 }
 function draw(c,bodyWorld,options){
  emission=[];
  if(!bodyWorld||!finite(bodyWorld.x)||!finite(bodyWorld.y))return false;
  const f=sample(options);if(!f||f.alpha<=0)return false;
  emissionAt=options.time;emission=[[-18,-28],[18,-28],[-18,-5],[18,-5],[0,-42],[0,8]].map(([x,y])=>({x:x*f.scale+bodyWorld.x/2,y:y*f.scale+bodyWorld.y/2,radius:6,alpha:f.alpha*.75,color:P.cyan}));paintVfxEmission(c,emission,{soft:f.soft});
  const age=f.active?.16*(1-f.entry):1.8+f.exit*.23;
  c.save();try{c.translate(bodyWorld.x/2,bodyWorld.y/2);painter.draw(c,'shield',age,{soft:f.soft,activeLength:f.active?1000000:1.8,blockAge:f.block>0?.24*(1-f.block):Infinity});}finally{c.restore();}return true;
 }
 return Object.freeze({clear,consume,sample,draw,emissionSources:time=>time>=emissionAt&&time-emissionAt<=.06?emission:[]});
}
