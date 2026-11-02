import {paintVfxEmission} from './vfx-emission.js';
export const FIRE_SPEC=Object.freeze({frames:24,variants:3,cellWidth:128,cellHeight:192,logicalWidth:32,logicalHeight:48,maxCells:128,maxEmbers:24,maxLights:16,topologyCache:6});
export const FIRE_COLORS=Object.freeze({edge:'#591d35',red:'#ce2029',outer:'#9c3824',body:'#e97c07',core:'#ffd95a'});
export const FIRE_LOOK=Object.freeze({bodyAlpha:.65,secondaryAlpha:.43,coreAlpha:.5,floorAlpha:.012,coalAlpha:.025,baseRadius:4,cyclesPerBeat:.5,sparkCyclesPerBeat:.4});
const C=FIRE_COLORS,TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,n)),hash=(x,y)=>((Math.imul(x+71,374761393)^Math.imul(y+37,668265263))>>>0),key=p=>p.x+','+p.y;
export function fireCells(b,beat){
 if(!b?.mirage||b.hp<=0||!Number.isFinite(beat))return [];
 const seen=new Set();return b.mirage.fire.filter(f=>Number.isInteger(f.x)&&Number.isInteger(f.y)&&Number.isFinite(f.born)&&Number.isFinite(f.activeAt)&&Number.isFinite(f.until)&&beat>=f.born&&beat<f.until).slice(0,FIRE_SPEC.maxCells).filter(f=>{const k=key(f);if(seen.has(k))return false;seen.add(k);return true;});
}
export function fireTopology(cells){
 const occupied=new Set(cells.map(key)),edges=[];let lookups=0;
 for(const f of cells)for(const [dx,dy,a,z]of [[0,-1,[-.5,-.5],[.5,-.5]],[1,0,[.5,-.5],[.5,.5]],[0,1,[.5,.5],[-.5,.5]],[-1,0,[-.5,.5],[-.5,-.5]]]){
  lookups++;if(!occupied.has((f.x+dx)+','+(f.y+dy)))edges.push([[f.x+a[0],f.y+a[1]],[f.x+z[0],f.y+z[1]]]);
 }
 return {edges,lookups};
}
export function fireSample(f,beat,soft=false){
 if(beat<f.born||beat>=f.until)return null;
 const warm=beat<f.activeAt,seed=hash(f.x,f.y),phase=((beat*FIRE_LOOK.cyclesPerBeat+seed%97/97)%1+1)%1;
 return {warm,variant:seed%3,frame:soft?8:Math.floor(phase*24),alpha:warm?.4:.48+.12*clamp((f.until-beat)/.55),width:soft?21:23+(seed%5),height:soft?24:27+(seed%6),seed};
}
function tongue(c,x,y,w,h,bend,color){
 c.fillStyle=color;c.beginPath();c.moveTo(x-w*.5,y);
 c.bezierCurveTo(x-w*.8,y-h*.25,x-w*.12+bend,y-h*.53,x+bend,y-h);
 c.bezierCurveTo(x+w*.45+bend,y-h*.69,x+w*.08,y-h*.55,x+w*.45,y-h*.28);
 c.bezierCurveTo(x+w*.8,y-h*.06,x+w*.28,y+1,x-w*.5,y);c.fill();
}
// Periodic authored silhouettes are baked once. Nothing reads/writes pixels during playback.
export function bakeFlameFrame(c,frame,variant){
 const t=frame/24*TAU,v=variant*.9,sw=Math.sin(t+v),rise=Math.sin(t*2-v),curl=Math.sin(t*3+v),drift=Math.sin(t*2+v+1.7);
 c.save();
 // Short low tongues spread along the ground; the tall wisps stay narrow and separate.
 c.globalAlpha=.12;tongue(c,16,45,28,22+sw*2,sw*2,C.body);
 c.globalAlpha=.38;
 tongue(c,8,45,10,11+rise*2,-3+sw,C.body);
 tongue(c,24,45,10,10-rise*2,3+curl,C.core);
 c.globalAlpha=FIRE_LOOK.bodyAlpha;
 tongue(c,11,44,12,23+rise*4,-4+sw*2,C.body);
 tongue(c,20,44,12,31-sw*3,3+curl*2,C.body);
 // Independently moving inner sheet: visible through the main body, baked into the same frame.
 c.globalAlpha=FIRE_LOOK.secondaryAlpha;
 tongue(c,15+drift*1.5,44,13,28+drift*4,-drift*3,C.core);
 tongue(c,22,44,7,18-rise*3,4+drift*2,C.body);
 c.globalAlpha=FIRE_LOOK.coreAlpha;
 tongue(c,14.5,44,9,19+rise*2,-1+sw*2,C.core);
 // Thin luminous ends preserve definition without whitening the whole fire.
 c.globalAlpha=.95;c.strokeStyle=C.core;c.lineWidth=.8;c.lineCap='round';
 for(const [x,y,bend]of [[7+sw*2,21-rise*4,-1],[23+curl*2,13+sw*3,1]]){c.beginPath();c.moveTo(x-bend*.8,y+4);c.quadraticCurveTo(x-bend,y+1.5,x,y);c.stroke();}
 // A small detached lick has an independent rise/erosion envelope; the loop wraps invisibly.
 const u=((frame/24+variant*.27)%1+1)%1,fade=Math.sin(u*Math.PI)**2;
 if(fade>.04){c.globalAlpha=fade*.48;tongue(c,11+sw*3,22-u*13,3.8*fade,6.5*fade,-1,C.body);}
 c.restore();
}
// Shared projected positions for visible sparks/tips and their local light: never separate emitters.
export function fireAccents(f,beat,soft=false){
 const s=fireSample(f,beat,soft);if(!s||s.warm)return{tips:[],sparks:[]};
 const t=s.frame/24*TAU,v=s.variant*.9,sw=Math.sin(t+v),rise=Math.sin(t*2-v),curl=Math.sin(t*3+v),sx=s.width/32,sy=s.height/48;
 const at=(x,y)=>({x:(x-16)*sx,y:(y-45)*sy});
 const tips=[[7+sw*2,21-rise*4],[23+curl*2,13+sw*3]].map(([x,y])=>({...at(x,y),alpha:soft?.48:.88,color:C.core,radius:soft?3.5:6.2,kind:'mystic-tip'}));
 const sparks=soft?[]:Array.from({length:2},(_,j)=>{const u=((beat*FIRE_LOOK.sparkCyclesPerBeat+s.seed%31/31+j*.47)%1+1)%1;return{x:(j?3.5:-3)+Math.sin(u*5+s.seed+j)*3,y:-5-u*(25+j*5),alpha:Math.sin(u*Math.PI)**2*.95,size:j?.65:.85,radius:5,color:j?C.body:C.core,kind:'mystic-spark'};});
 return{tips,sparks};
}
export function fireLightSources(b,beat,project,soft=false){
 const active=fireCells(b,beat).filter(f=>beat>=f.activeAt),stride=Math.max(1,Math.ceil(active.length/12)),slots=active.filter((_,i)=>i%stride===0&&i/stride<12),selected=Array.from({length:Math.min(8,slots.length)},(_,i)=>slots[Math.floor(i*slots.length/Math.min(8,slots.length))]),sources=[];
 for(const [i,f]of selected.entries()){
  const p=project(f.x,f.y),accent=fireAccents(f,beat,soft),tip=accent.tips[hash(f.x,f.y)%2],spark=accent.sparks[0];
  sources.push({x:p.x/2,y:p.y/2-2,radius:soft?15:18,revealRadius:soft?25:32,power:soft?.5:.61+.035*Math.sin(beat*Math.PI+(hash(f.x,f.y)%7)),alpha:soft?.58:.86,color:C.body,kind:'mystic-floor'});
  const q=soft||i%2===0?tip:spark;sources.push({...q,x:p.x/2+q.x,y:p.y/2+q.y});
 }
 return sources;
}
export function createMysticFire({makeCanvas=()=>typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null}={}){
 let atlas=null,bakes=0;const topology=new Map();
 const stats={atlasBuilds:0,topologyBuilds:0,topologyHits:0,liveCells:0,actors:0,embers:0,lights:0};
 function prepare(){if(atlas)return true;const image=makeCanvas();if(!image)return false;image.width=FIRE_SPEC.cellWidth*8;image.height=FIRE_SPEC.cellHeight*9;const g=image.getContext('2d');if(!g)return false;
  for(let v=0;v<3;v++)for(let f=0;f<24;f++){const i=v*24+f;g.save();g.translate(i%8*128,Math.floor(i/8)*192);g.scale(4,4);bakeFlameFrame(g,f,v);g.restore();bakes++;}atlas=image;stats.atlasBuilds++;return true;
 }
 function topo(cells){const k=cells.map(key).sort().join(';');if(topology.has(k)){stats.topologyHits++;return topology.get(k);}const plan=fireTopology(cells);if(topology.size>=6)topology.delete(topology.keys().next().value);topology.set(k,plan);stats.topologyBuilds++;return plan;}
 function cellsPath(c,cells,project){c.beginPath();for(const f of cells){for(const [i,[dx,dy]]of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].entries()){const p=project(f.x+dx,f.y+dy);i?c.lineTo(p.x/2,p.y/2):c.moveTo(p.x/2,p.y/2);}c.closePath();}}
 function edgePath(c,plan,project){c.beginPath();for(const[a,b]of plan.edges){const p=project(...a),q=project(...b);c.moveTo(p.x/2,p.y/2);c.lineTo(q.x/2,q.y/2);}}
 function floor(c,b,beat,project,soft=false){
  const cells=fireCells(b,beat);stats.liveCells=cells.length;stats.actors=0;stats.embers=0;stats.lights=0;
  for(const warm of [true,false]){const group=cells.filter(f=>(beat<f.activeAt)===warm);if(!group.length)continue;const plan=topo(group);c.save();try{
   cellsPath(c,group,project);c.globalAlpha=warm?.16:FIRE_LOOK.floorAlpha;c.fillStyle=warm?C.body:C.edge;c.fill();c.clip();
   if(!warm){c.globalAlpha=FIRE_LOOK.coalAlpha;c.fillStyle=C.red;for(const f of group){const p=project(f.x,f.y),seed=hash(f.x,f.y);c.beginPath();c.ellipse(p.x/2,p.y/2,FIRE_LOOK.baseRadius+(seed%3)*.2,1.5,-.07,0,TAU);c.fill();}c.globalAlpha=soft?.08:.07+.015*Math.pow(1-((beat%1+1)%1),3);c.strokeStyle=C.core;c.lineWidth=.65;for(const f of group){const p=project(f.x,f.y),seed=hash(f.x,f.y);c.beginPath();c.moveTo(p.x/2-7,p.y/2+1);c.quadraticCurveTo(p.x/2-2,p.y/2-2-seed%2,p.x/2+7,p.y/2-1);c.stroke();}}
  }finally{c.restore();}if(warm){c.save();c.strokeStyle=C.body;c.globalAlpha=.78;c.lineWidth=1.25;c.lineJoin='round';edgePath(c,plan,project);c.stroke();c.restore();}}
 }
 function entities(b,beat){const active=fireCells(b,beat).filter(f=>beat>=f.activeAt),stride=Math.max(1,Math.ceil(active.length/12));return active.map((f,i)=>({type:'mysticFire',x:f.x,y:f.y,visualDepth:f.y+.02,fire:f,sparkSlot:i%stride===0&&i/stride<12}));}
 function actor(c,n,beat,project,soft=false,playerWorld=null){
  const f=n.fire,s=fireSample(f,beat,soft);if(!s||s.warm)return;stats.actors++;const p=project(f.x,f.y),x=p.x/2,y=p.y/2;
  const near=playerWorld&&Math.hypot(playerWorld.x/2-x,(playerWorld.y/2-y)*1.3)<19;
  c.save();try{c.globalCompositeOperation='screen';c.globalAlpha=s.alpha*(near?.38:.95);if(prepare()){const i=s.variant*24+s.frame;c.drawImage(atlas,i%8*128,Math.floor(i/8)*192,128,192,x-s.width/2,y-s.height*.9375,s.width,s.height);}else{c.translate(x-16,y-45);bakeFlameFrame(c,s.frame,s.variant);}
   if(!soft&&n.sparkSlot&&stats.embers<24){for(const q of fireAccents(f,beat,soft).sparks){if(stats.embers>=24)break;c.globalAlpha=q.alpha;c.fillStyle=q.color;c.beginPath();c.ellipse(x+q.x,y+q.y,q.size,q.size*1.4,-.3,0,TAU);c.fill();stats.embers++;}}
  }finally{c.restore();}
 }
 function emission(c,b,beat,project,soft=false){
  const sources=fireLightSources(b,beat,project,soft);
  stats.lights=sources.length;const drawn=paintVfxEmission(c,sources,{soft});
  // Selective luminous cores after cave darkening. No white fill and no full-screen bloom.
  c.save();c.globalCompositeOperation='screen';for(const q of sources){if(q.kind==='mystic-floor')continue;c.globalAlpha=q.alpha*(soft?.45:.95);c.fillStyle=q.color;c.beginPath();c.ellipse(q.x,q.y,q.kind==='mystic-tip'?.55:.75,q.kind==='mystic-tip'?1:.85,-.2,0,TAU);c.fill();if(q.kind==='mystic-tip'){c.strokeStyle=q.color;c.lineWidth=.7;c.lineCap='round';c.beginPath();c.moveTo(q.x+.6,q.y+3);c.quadraticCurveTo(q.x-.4,q.y+1.5,q.x,q.y);c.stroke();}}c.restore();return drawn;
 }
 function clear(){topology.clear();stats.liveCells=stats.actors=stats.embers=stats.lights=0;}
 function dispose(){clear();if(atlas){atlas.width=atlas.height=1;atlas=null;}}
 return {prepare,floor,entities,actor,emission,lightSources:fireLightSources,clear,dispose,status:()=>({...stats,bakedFrames:bakes,atlasReady:!!atlas,atlasBytes:atlas?atlas.width*atlas.height*4:0,topologyEntries:topology.size})};
}
export const mysticFire=createMysticFire();
