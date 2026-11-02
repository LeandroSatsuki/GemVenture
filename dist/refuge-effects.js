import {P} from './palette.js';

// Canvas coordinates are LOCAL 1000x620 units. The integrator owns camera/layout.
export const REFUGE_EFFECT_LIMITS=Object.freeze({waterGleams:42,softGleams:21,maxAnchors:8,maskSize:64,maxMasks:2,maxShoreCache:1});
export const REFUGE_MOTION=Object.freeze({crystalAmplitude:1.6,crystalPeriod:4.8,wheelPeriod:20,wheelStart:14.5,wheelDuration:2.5,discPeriod:18,discStart:8,discDuration:4});
const TAU=Math.PI*2,unit=n=>Math.max(0,Math.min(1,n)),finite=(n,f=0)=>Number.isFinite(n)?n:f;
const modulo=(n,d)=>((n%d)+d)%d,smooth5=t=>t*t*t*(t*(t*6-15)+10);
const fixed=Object.freeze({dx:0,dy:0,scaleX:1,scaleY:1,angle:0});
const roles=new Set(['crystal','flame','wheel','disc']);
// GV013: one full mesh turn, then rest; caller supplies the existing visual clock.
export const REFUGE_STAR_MOTION=Object.freeze({period:18,start:6,duration:2});
export function sampleRefugeStarTurn({time=0,soft=false,reduced=false}={}){
 if(soft||reduced)return 0;
 const t=Math.max(0,finite(time)),u=unit((modulo(t,REFUGE_STAR_MOTION.period)-REFUGE_STAR_MOTION.start)/REFUGE_STAR_MOTION.duration);
 return smooth5(u);
}
// GV014: source-normalized decorative pose; one existing visual clock, no events/resources.
export const REFUGE_DRILL_MOTION=Object.freeze({period:19,start:9,descent:.6,contact:.3,return:1.1,active:2});
export function sampleRefugeDrillMotion({time=0,soft=false,reduced=false}={}){
 if(soft||reduced)return {phase:0,depth:0};
 const elapsed=modulo(Math.max(0,finite(time)),REFUGE_DRILL_MOTION.period)-REFUGE_DRILL_MOTION.start,ease=u=>unit(smooth5(unit(u)));
 const depth=elapsed<0||elapsed>=2?0:elapsed<.6?ease(elapsed/.6):elapsed<.9?1:1-ease((elapsed-.9)/1.1);
 return {phase:ease(elapsed/2),depth};
}
const masks=new Map();let shoreCache=null,waterPaths=null;
const gleams=Object.freeze(Array.from({length:REFUGE_EFFECT_LIMITS.waterGleams},(_,i)=>Object.freeze({
 x:((i%6)+.25+((i*29)%53)/100)/6,y:(Math.floor(i/6)+.22+((i*17)%47)/100)/7,
 length:12+(i*7)%15,phase:i*2.39996323
})));
const rgba=(hex,a)=>`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;

// Optional clock adapter. Call advance once per game frame; sharing the result
// between water/light/layers prevents multiple advances and pause catch-up.
export function createRefugeClock(initial=0){
 let time=Math.max(0,finite(initial));
 return Object.freeze({get time(){return time;},advance(dt,{paused=false,hidden=false}={}){
  if(!paused&&!hidden)time+=Math.max(0,Math.min(.1,finite(dt)));return time;
 }});
}

function shoreGeometry(source,width,height){
 if(!source||typeof Path2D==='undefined'||typeof source==='string'&&source.length>8192)return null;
 if(shoreCache?.source===source&&shoreCache.width===width&&shoreCache.height===height)return shoreCache;
 try{const path=new Path2D(source),outside=new Path2D();outside.rect(0,0,width,height);outside.addPath(path);
  shoreCache={source,width,height,path,outside};return shoreCache;
 }catch{return null;}
}
function preparedWaterPaths(){
 if(waterPaths||typeof Path2D==='undefined')return waterPaths;
 const swell=new Path2D('M-100 0 C140 -22 280 24 500 0 C720 -24 860 22 1100 0 L1100 40 C860 62 720 16 500 40 C280 64 140 18 -100 40 Z');
 const gleam=new Path2D('M-12 0 Q-6 -1.6 0 0 T12 0');
 waterPaths={swell,gleam};return waterPaths;
}

// Can draw before terrain, or after it with background=false. shorePath is the actual shoreline silhouette
// (SVG string or a stable Path2D), never a guessed ellipse around the village.
// `time` must be a visual/game clock that stops while paused/hidden. `paused`
// is intentionally not a second clock: a pure painter cannot infer pause entry.
export function paintRefugeWater(c,{time=0,reduced=false,soft=false,paused=false,width=1000,height=620,shorePath,background=true}={}){
 if(!c||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>4096||height>4096)return 0;
 const t=reduced?0:finite(time),alpha=c.globalAlpha,paths=preparedWaterPaths(),shore=shoreGeometry(shorePath,width,height);
 c.save();c.globalCompositeOperation='source-over';if(shore)c.clip(shore.outside,'evenodd');
 if(background){c.fillStyle=P.blue;c.fillRect(0,0,width,height);}
 c.fillStyle=P.deepBlue;c.globalAlpha=alpha*(soft?.018:.03);
 if(paths){for(let i=0;i<3;i++){c.save();c.translate(0,height*[.13,.49,.84][i]+(reduced?0:Math.sin(t*.23+i)*2));c.scale(width/1000,[.72,1.15,.9][i]);c.fill(paths.swell);c.restore();}}
 c.strokeStyle=P.cyan;c.lineWidth=1.25;c.lineCap='round';
 const count=soft?REFUGE_EFFECT_LIMITS.softGleams:REFUGE_EFFECT_LIMITS.waterGleams;
 for(let i=0;i<count;i++){
  const g=gleams[soft?i*2:i];c.globalAlpha=alpha*(soft?.08:.13)*(reduced?1:.8+.2*Math.sin(t*.55+g.phase));
  c.save();c.translate(g.x*width+(reduced?0:Math.sin(t*.27+g.phase)*2.5),g.y*height);c.scale(g.length/24,1);
  if(paths)c.stroke(paths.gleam);else{c.beginPath();c.moveTo(-12,0);c.quadraticCurveTo(0,-1.6,12,0);c.stroke();}c.restore();
 }
 if(shore){const level=reduced?1:.86+.14*Math.sin(t*.65),strength=alpha*(soft?.6:1)*level;
  c.lineJoin='round';c.strokeStyle=P.deepBlue;c.lineWidth=14;c.globalAlpha=strength*.08;c.stroke(shore.path);
  c.strokeStyle=P.cyan;c.lineWidth=5;c.globalAlpha=strength*.08;c.stroke(shore.path);
  c.strokeStyle=P.sand;c.lineWidth=2.3;c.globalAlpha=strength*.18;c.stroke(shore.path);
 }
 c.restore();return count;
}

function lightMask(kind,makeCanvas){
 if(masks.has(kind))return masks.get(kind);
 if(kind!=='fire'&&kind!=='crystal')return null;
 const canvas=makeCanvas?.()??(typeof document!=='undefined'?document.createElement('canvas'):null);if(!canvas)return null;
 canvas.width=canvas.height=REFUGE_EFFECT_LIMITS.maskSize;const c=canvas.getContext('2d');if(!c)return null;
 const fire=kind==='fire',core=fire?P.sand:P.cyan,edge=fire?P.orange:P.blue,peak=fire?.23:.15;
 const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,rgba(core,peak));g.addColorStop(.2,rgba(core,peak*.78));g.addColorStop(.55,rgba(edge,peak*.23));g.addColorStop(1,rgba(edge,0));
 c.fillStyle=g;c.fillRect(0,0,64,64);masks.set(kind,canvas);return canvas;
}
// Call AFTER terrain and BEFORE the player, station art, labels and HUD.
// Anchors are exact emitter/ground points, NOT building contact coordinates.
export function paintRefugeLight(c,{time=0,reduced=false,soft=false,paused=false,anchors=[],makeCanvas}={}){
 if(!c||!Array.isArray(anchors))return 0;
 const t=reduced?0:finite(time),alpha=c.globalAlpha;let count=0;
 c.save();c.globalCompositeOperation='source-over';
 for(let i=0;i<Math.min(anchors.length,REFUGE_EFFECT_LIMITS.maxAnchors);i++){
  const a=anchors[i];if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.enabled===false)continue;
  const kind=a.kind;if(kind!=='fire'&&kind!=='crystal')continue;const mask=lightMask(kind,makeCanvas);if(!mask)continue;
  const fire=kind==='fire',r=Math.max(4,Math.min(fire?28:14,finite(a.radius,fire?24:11)));
  const level=reduced?1:fire?.8+.12*Math.sin(t*1.8)+.08*Math.sin(t*3.1+.7):.86+.14*Math.sin(t*.9);
  c.globalAlpha=alpha*level*(soft?.55:1);const ry=r*(fire?.48:.65);
  c.drawImage(mask,a.x-r,a.y-ry,r*2,ry*2);count++;
 }c.restore();return count;
}

// Decorative motion only. It never selects roulette rewards or starts playback.
// Unknown/solid roles return the identity pose: no floating buildings.
export function sampleRefugePose(role,{time=0,reduced=false,soft=false,paused=false,phaseSeconds=0}={}){
 if(reduced||!roles.has(role))return fixed;
 const t=finite(time)+finite(phaseSeconds),amount=soft?.5:1;
 if(role==='crystal')return {dx:0,dy:Math.sin(t*TAU/REFUGE_MOTION.crystalPeriod)*REFUGE_MOTION.crystalAmplitude*amount,scaleX:1,scaleY:1,angle:Math.sin(t*TAU/6.4)*.012*amount};
 if(role==='flame')return {dx:0,dy:0,scaleX:1+(Math.sin(t*1.8)*.012+Math.sin(t*3.1+.7)*.006)*amount,scaleY:1+(Math.sin(t*2.1)*.014+Math.sin(t*3.8)*.006)*amount,angle:Math.sin(t*1.2)*.006*amount};
 const wheel=role==='wheel',period=wheel?REFUGE_MOTION.wheelPeriod:REFUGE_MOTION.discPeriod,start=wheel?REFUGE_MOTION.wheelStart:REFUGE_MOTION.discStart,duration=wheel?REFUGE_MOTION.wheelDuration:REFUGE_MOTION.discDuration;
 const u=unit((modulo(t,period)-start)/duration);
 return {dx:0,dy:0,scaleX:1,scaleY:1,angle:TAU*smooth5(u)};
}

// Consume a NATIVE isolated layer, with pixel anchor and pivot from its manifest.
// Never clips/recolors a composite PNG. Rejected unless its role is movable.
// x/y locates layer.anchor; width scales the full source canvas (not alpha bounds).
export function paintRefugeLayer(c,layer,{x,y,width,scale=1,time=0,reduced=false,soft=false,paused=false,phaseSeconds=0}={}){
 if(!c||!layer?.image||!roles.has(layer.role)||![x,y].every(Number.isFinite))return false;
 const image=layer.image,w=finite(layer.sourceWidth,image.naturalWidth??image.width),h=finite(layer.sourceHeight,image.naturalHeight??image.height),a=layer.anchor,p=layer.pivot;
 if(!a||!p||![w,h,a.x,a.y,p.x,p.y].every(Number.isFinite)||w<=0||h<=0)return false;
 const s=Number.isFinite(width)?width/w:scale;if(!Number.isFinite(s)||s<=0)return false;
 const pose=sampleRefugePose(layer.role,{time,reduced,soft,paused,phaseSeconds});
 const flatten=layer.role==='wheel'||layer.role==='disc'?Math.max(.35,Math.min(1,finite(layer.planeScaleY,1))):1;
 c.save();c.translate(x+(p.x-a.x)*s+pose.dx,y+(p.y-a.y)*s+pose.dy);c.scale(s*pose.scaleX,s*pose.scaleY);
 c.scale(1,flatten);c.rotate(pose.angle);c.scale(1,1/flatten);c.drawImage(image,-p.x,-p.y,w,h);c.restore();return true;
}
export function refugeEffectsCacheInfo(){return {masks:masks.size,maxMasks:2,maskBytes:masks.size*64*64*4,shoreEntries:shoreCache?1:0,maxShoreEntries:1,waterPaths:waterPaths?2:0};}
