import {sampleCrownR2} from './refuge-motion-policy.js';
import {sampleEchoCrown} from './echo-tree-rig.js';
import {P} from './palette.js';
import {createAlphaPlane,createAlphaMask,transformedAlphaContains,multiplyAffine} from './refuge-picking.js';
import {REFUGE_ART_ROOT,REFUGE_EMBEDDED,REFUGE_ASSETS,REFUGE_COMPOSITIONS} from './refuge-art-manifest.js';
import {sampleRefugePose,REFUGE_MOTION,sampleRefugeStarTurn,sampleRefugeDrillMotion} from './refuge-effects.js';
import {paintFountainWater,paintCrystalAccents} from './refuge-local-fx.js';
import {buildVolumeFrames,drawVolumeFrame} from './refuge-volumes.js';
const assets=new Map(REFUGE_ASSETS.map(a=>[a.id,a])),sprites=new Map(),stills=new Map(),boundsCache=new Map(),failed=new Set();let loading=null;
const volumeCaches=new Map();
export const REFUGE_ART_LIMITS=Object.freeze({assets:64,cacheSide:512,stills:16,concurrentDecodes:2});
export function refugeAssetUrl(spec){return REFUGE_EMBEDDED[spec.id]||REFUGE_ART_ROOT+spec.file;}
export function refugeArtStatus(){return {expected:REFUGE_ASSETS.length,ready:sprites.size,failed:[...failed],stills:stills.size,cachePixels:[...sprites.values()].reduce((n,s)=>n+s.image.width*s.image.height,0),volumeCaches:volumeCaches.size,volumeBytes:[...volumeCaches.values()].reduce((n,s)=>n+s.bytes,0)};}
export function loadRefugeArt(){
 if(loading||typeof Image==='undefined'||typeof document==='undefined')return loading;
 const pending=REFUGE_ASSETS.slice(0,REFUGE_ART_LIMITS.assets);let next=0;
 const load=spec=>new Promise(resolve=>{
  const image=new Image();image.onerror=()=>{failed.add(spec.id);resolve();};image.onload=()=>{
   try{
    if(image.naturalWidth!==spec.size[0]||image.naturalHeight!==spec.size[1])throw Error('Asset dimensions changed');
    const [x,y,right,bottom]=spec.bounds,width=right-x,height=bottom-y;
    if(![x,y,right,bottom].every(Number.isFinite)||width<=0||height<=0||x<0||y<0||right>spec.size[0]||bottom>spec.size[1])throw Error('Invalid alpha bounds');
    const side=Math.max(64,Math.min(REFUGE_ART_LIMITS.cacheSide,spec.cacheSide||REFUGE_ART_LIMITS.cacheSide)),k=Math.min(1,side/Math.max(width,height));
    const small=document.createElement('canvas');small.width=Math.ceil(width*k);small.height=Math.ceil(height*k);small.getContext('2d').drawImage(image,x,y,width,height,0,0,small.width,small.height);
    const plane=createAlphaPlane(small.getContext('2d').getImageData(0,0,small.width,small.height).data,small.width,small.height);
    sprites.set(spec.id,{image:small,spec,kx:small.width/width,ky:small.height/height,plane,mask:createAlphaMask(plane,()=>document.createElement('canvas'))});
   }catch{failed.add(spec.id);}resolve();
  };image.src=refugeAssetUrl(spec);
 });
 loading=Promise.all(Array.from({length:Math.min(REFUGE_ART_LIMITS.concurrentDecodes,pending.length)},async()=>{while(next<pending.length)await load(pending[next++]);})).then(()=>prepareVolumes());
 return loading;
}
function prepareVolumes(){
 if(typeof document==='undefined'||typeof document.createElement('canvas').getContext('2d')?.beginPath!=='function')return;
 for(const group of Object.values(REFUGE_COMPOSITIONS)){const v=group.volume;if(!v||volumeCaches.has(v.kind)||!sprites.has(v.baseAsset))continue;const cache=buildVolumeFrames(v.kind,{size:v.cacheSize||128,count:v.cacheFrames||32});cache.planes=cache.frames.map(frame=>createAlphaPlane(frame.getContext('2d').getImageData(0,0,frame.width,frame.height).data,frame.width,frame.height,{side:frame.width}));cache.masks=cache.planes.map(p=>createAlphaMask(p,()=>document.createElement('canvas')));volumeCaches.set(v.kind,cache);}
}
function echoCrownPose(layer,time,reduced,scale,interaction={}){const p=interaction.motionR2?sampleCrownR2(layer.echoCrown,time,reduced,interaction.motionR2.crownBoost):sampleEchoCrown(layer.echoCrown,time,reduced);return {dx:p.dx*scale,dy:p.dy*scale,scaleX:1,scaleY:1,angle:0};}
function role(layer){if(layer.motion==='echo-crown')return 'echo-crown';if(layer.motion==='none')return null;if(['crystal','flame','wheel','disc','star','drill'].includes(layer.motion))return layer.motion;return /crystal/.test(layer.asset)?'crystal':/wheel/.test(layer.asset)?'wheel':/disc/.test(layer.asset)?'disc':/flame|fire/.test(layer.asset)?'flame':null;}
function anchor(spec,layer){return layer.anchor==='pivot'?spec.pivot:spec.groundAnchor;}
export function refugeArtBounds(type){
 if(boundsCache.has(type))return boundsCache.get(type);
 const group=REFUGE_COMPOSITIONS[type];if(!group)return null;let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(const l of group.layers){const a=assets.get(l.asset),b=a.bounds,p=anchor(a,l),s=l.width/(b[2]-b[0]);left=Math.min(left,l.at[0]+(b[0]-p[0])*s);right=Math.max(right,l.at[0]+(b[2]-p[0])*s);top=Math.min(top,l.at[1]+(b[1]-p[1])*s);bottom=Math.max(bottom,l.at[1]+(b[3]-p[1])*s);}
 if(group.volume){const v=group.volume,l=group.layers.find(l=>l.asset===v.baseAsset),a=assets.get(l.asset),p=anchor(a,l),s=l.width/(a.bounds[2]-a.bounds[0]),r=v.widthSourcePx*.6;left=Math.min(left,l.at[0]+(v.sourcePivot[0]-p[0]-r)*s);right=Math.max(right,l.at[0]+(v.sourcePivot[0]-p[0]+r)*s);top=Math.min(top,l.at[1]+(v.sourcePivot[1]-p[1]-r-(v.hoverSourcePx||0))*s);bottom=Math.max(bottom,l.at[1]+(v.sourcePivot[1]-p[1]+r)*s);}
 const bounds=Object.freeze({left,top,right,bottom,width:right-left,height:bottom-top});boundsCache.set(type,bounds);return bounds;
}
function volumeMotion(v,time,reduced,interaction={}){
 if(interaction.motionR2&&v.kind==='drill')return interaction.motionR2.drill;
 if(interaction.motionR2&&v.kind==='star'){const p=interaction.motionR2.star;return {...p,dy:p.stable?0:Math.sin(time*Math.PI*2/5.2)*12};}
 if(v.kind==='drill'){const pose=sampleRefugeDrillMotion({time,soft:interaction.drillSoft??reduced,reduced:interaction.drillReduced??reduced});return {phase:pose.phase,dy:pose.depth*(v.strokeSourcePx||0),stable:!!((interaction.drillSoft??reduced)||(interaction.drillReduced??reduced))};}
 const stable=v.kind==='star'?!!((interaction.starSoft??reduced)||(interaction.starReduced??reduced)):reduced;
 return {phase:v.kind==='star'?sampleRefugeStarTurn({time,reduced:stable}):(reduced?0:time/v.periodSeconds),dy:stable?0:Math.sin(time*Math.PI*2/5.2)*(v.hoverSourcePx||0),stable};
}
function groupVolume(c,group,scale,x,y,time,reduced,interaction={}){
 const v=group.volume,cache=volumeCaches.get(v.kind);if(!cache)return;
 const l=group.layers.find(l=>l.asset===v.baseAsset),spec=assets.get(l.asset),a=anchor(spec,l),s=l.width*scale/(spec.bounds[2]-spec.bounds[0]),motion=volumeMotion(v,time,reduced,interaction),phase=motion.phase;
 const px=x+l.at[0]*scale+(v.sourcePivot[0]-a[0])*s,py=y+l.at[1]*scale+(v.sourcePivot[1]-a[1])*s+motion.dy*s,width=v.widthSourcePx*s;
 drawVolumeFrame(c,cache,px,py,width,phase);
 if(v.kind==='star')paintCrystalAccents(c,{x:px,y:py,width,time,reduced:motion.stable,groundAnchor:{x:.5,y:.5},points:[{x:.5,y:.18,radius:.028},{x:.5,y:.58,radius:.020}],kind:'star'});
}
function sourcePolygon(c,points,s,x,y,anchor){
 c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(x+(px-anchor[0])*s,y+(py-anchor[1])*s):c.moveTo(x+(px-anchor[0])*s,y+(py-anchor[1])*s));c.closePath();
}
function fountainEffects(c,group,scale,x,y,time,reduced,front=false){
 const fx=group.effects,layer=group.layers.find(l=>l.asset===fx.asset),native=sprites.get(fx.asset);if(!native)return;
 const {spec,image}=native,[bx,by,right,bottom]=spec.bounds,a=anchor(spec,layer),s=layer.width*scale/(right-bx),px=x+layer.at[0]*scale,py=y+layer.at[1]*scale;
 const n=fx.anchors,config={x:px,y:py,width:spec.size[0]*s,time,reduced,groundAnchor:{x:n.groundAnchor[0],y:n.groundAnchor[1]},spout:{x:n.spout[0],y:n.spout[1]},crestY:n.crestY,basin:n.basin};
 c.save();sourcePolygon(c,fx.sourcePixels.basinInnerPolygon,s,px,py,a);c.clip();
 const outside=new Path2D();outside.rect(-1000,-1000,3000,3000);
 const protect=new Path2D();fx.sourcePixels.pedestalPolygon.forEach(([vx,vy],i)=>i?protect.lineTo(px+(vx-a[0])*s,py+(vy-a[1])*s):protect.moveTo(px+(vx-a[0])*s,py+(vy-a[1])*s));protect.closePath();outside.addPath(protect);c.clip(outside,'evenodd');
 if(!front){c.fillStyle=P.blue;c.beginPath();c.ellipse(px+(fx.sourcePixels.basin.x-a[0])*s,py+(fx.sourcePixels.basin.y-a[1])*s,fx.sourcePixels.basin.rx*s,fx.sourcePixels.basin.ry*s,0,0,Math.PI*2);c.fill();}
 else paintFountainWater(c,{...config,layer:'front'});c.restore();
 if(!front){paintFountainWater(c,{...config,layer:'back'});return;}
 // Original front faces retain their exact color and perspective above the moving water.
 for(const polygon of [fx.sourcePixels.frontLipPolygon,fx.sourcePixels.pedestalPolygon]){c.save();sourcePolygon(c,polygon,s,px,py,a);c.clip();c.drawImage(image,px+(bx-a[0])*s,py+(by-a[1])*s,(right-bx)*s,(bottom-by)*s);c.restore();}
 const nozzleTopY=(Math.min(...fx.sourcePixels.pedestalPolygon.map(p=>p[1]))-25)/spec.size[0];
 paintFountainWater(c,{...config,layer:'nozzle',nozzleTopY});
}
function layerGeometry(group,layer,index,scale,x,y,time,reduced,interaction){
 const native=sprites.get(layer.asset);if(!native)return null;
 const {spec,image,kx,ky,plane,mask}=native,[bx,by,right]=spec.bounds,a=anchor(spec,layer),motion=role(layer),p=motion==='flame'?a:spec.pivot,s=layer.width*scale/(right-bx),px=x+layer.at[0]*scale,py=y+layer.at[1]*scale;
 if(!motion)return {image,plane,mask,m:[s/kx,0,0,s/ky,px+(bx-a[0])*s,py+(by-a[1])*s]};
 let pose=motion==='echo-crown'?echoCrownPose(layer,time,reduced,scale,interaction):motion==='wheel'?{dx:0,dy:0,scaleX:1,scaleY:1,angle:reduced?0:(interaction.wheelAngle??0)}:{...sampleRefugePose(motion,{time:time+(layer.phaseSeconds??index*.61),reduced})};
 if(motion==='crystal'&&!reduced&&Number.isFinite(layer.amplitudeMax))pose.dy=Math.sin((time+(layer.phaseSeconds??index*.61))*Math.PI*2/REFUGE_MOTION.crystalPeriod)*layer.amplitudeMax*scale;
 if(motion==='flame'&&!reduced)pose={...pose,scaleX:1+Math.sin(time*4.6)*.04,scaleY:1+Math.sin(time*5.2)*.08+Math.sin(time*8.3)*.025,angle:Math.sin(time*3.4)*.012};
 const co=Math.cos(pose.angle),si=Math.sin(pose.angle);
 let m=[1,0,0,1,px+(p[0]-a[0])*s+pose.dx,py+(p[1]-a[1])*s+pose.dy];
 if(layer.projection)m=multiplyAffine(m,layer.projection);
 m=multiplyAffine(m,[co*pose.scaleX,si*pose.scaleX,-si*pose.scaleY,co*pose.scaleY,0,0]);
 return {image,plane,mask,m:multiplyAffine(m,[s/kx,0,0,s/ky,(bx-p[0])*s,(by-p[1])*s])};
}
function volumeGeometry(group,scale,x,y,time,reduced,interaction={}){
 const v=group.volume,cache=v&&volumeCaches.get(v.kind);if(!cache)return null;
 const l=group.layers.find(l=>l.asset===v.baseAsset),spec=assets.get(l.asset),a=anchor(spec,l),s=l.width*scale/(spec.bounds[2]-spec.bounds[0]),motion=volumeMotion(v,time,reduced,interaction),phase=motion.phase;
 const px=x+l.at[0]*scale+(v.sourcePivot[0]-a[0])*s,py=y+l.at[1]*scale+(v.sourcePivot[1]-a[1])*s+motion.dy*s,width=v.widthSourcePx*s,k=width/cache.sourceWidth,i=((Math.floor(phase*cache.count)%cache.count)+cache.count)%cache.count;
 return {image:cache.frames[i],plane:cache.planes[i],mask:cache.masks[i],m:[k,0,0,k,px-cache.pivot[0]*k,py-cache.pivot[1]*k]};
}
function paintPartMask(c,part){c.save();c.transform(...part.m);c.drawImage(part.mask,0,0,part.plane.sourceWidth,part.plane.sourceHeight);c.restore();}
export function drawRefugeArtMask(c,type,x,y,width,time=0,reduced=false,interaction={}){
 const group=REFUGE_COMPOSITIONS[type];if(!refugeArtReady(type))return false;const scale=width/refugeArtBounds(type).width;
 group.layers.forEach((l,i)=>paintPartMask(c,layerGeometry(group,l,i,scale,x,y,time,reduced,interaction)));const volume=volumeGeometry(group,scale,x,y,time,reduced,interaction);if(volume)paintPartMask(c,volume);return true;
}
export function refugeArtReady(type){const group=REFUGE_COMPOSITIONS[type];return !!group&&group.layers.every(l=>sprites.has(l.asset));}
export function refugeArtContains(type,x,y,width,px,py,time=0,reduced=false,interaction={}){
 const group=REFUGE_COMPOSITIONS[type];if(!refugeArtReady(type))return false;const scale=width/refugeArtBounds(type).width,volume=volumeGeometry(group,scale,x,y,time,reduced,interaction);
 if(volume&&transformedAlphaContains(volume.plane,volume.m,px,py))return true;
 for(let i=group.layers.length-1;i>=0;i--){const part=layerGeometry(group,group.layers[i],i,scale,x,y,time,reduced,interaction);if(part&&transformedAlphaContains(part.plane,part.m,px,py))return true;}
 return false;
}
export function drawRefugeArt(c,type,x,y,width,time=0,reduced=false,interaction={}){
 const group=REFUGE_COMPOSITIONS[type];if(!group||!group.layers.every(l=>sprites.has(l.asset)))return false;
 const scale=width/refugeArtBounds(type).width;
 for(const [index,layer]of group.layers.entries()){
  const {spec,image,kx,ky}=sprites.get(layer.asset),[bx,by,right,bottom]=spec.bounds,a=anchor(spec,layer),motion=role(layer),p=motion==='flame'?a:spec.pivot;
  const partWidth=layer.width*scale,s=partWidth/(right-bx),px=x+layer.at[0]*scale,py=y+layer.at[1]*scale;
  if(motion){
   let pose=motion==='echo-crown'?echoCrownPose(layer,time,reduced,scale,interaction):motion==='wheel'?{dx:0,dy:0,scaleX:1,scaleY:1,angle:reduced?0:(interaction.wheelAngle??0)}:{...sampleRefugePose(motion,{time:time+(layer.phaseSeconds??index*.61),reduced})};
   if(motion==='crystal'&&!reduced&&Number.isFinite(layer.amplitudeMax)){pose.dy=Math.sin((time+(layer.phaseSeconds??index*.61))*Math.PI*2/REFUGE_MOTION.crystalPeriod)*layer.amplitudeMax*scale;}
   if(motion==='flame'&&!reduced)pose={...pose,scaleX:1+Math.sin(time*4.6)*.04,scaleY:1+Math.sin(time*5.2)*.08+Math.sin(time*8.3)*.025,angle:Math.sin(time*3.4)*.012};
   c.save();c.translate(px+(p[0]-a[0])*s+pose.dx,py+(p[1]-a[1])*s+pose.dy);
   if(layer.projection)c.transform(...layer.projection);c.rotate(pose.angle);c.scale(pose.scaleX,pose.scaleY);
   c.drawImage(image,(bx-p[0])*s,(by-p[1])*s,(right-bx)*s,(bottom-by)*s);c.restore();
  }
  else c.drawImage(image,px+(bx-a[0])*s,py+(by-a[1])*s,(right-bx)*s,(bottom-by)*s);
  if(index===0&&group.effects?.kind==='fountain')fountainEffects(c,group,scale,x,y,time,reduced);
 }
 if(group.effects?.kind==='fountain')fountainEffects(c,group,scale,x,y,time,reduced,true);
 if(group.volume)groupVolume(c,group,scale,x,y,time,reduced,interaction);
 return true;
}
export function refugeArtUrl(type){
 if(stills.has(type))return stills.get(type);const group=REFUGE_COMPOSITIONS[type];if(!group||!group.layers.every(l=>sprites.has(l.asset))||typeof document==='undefined')return null;
 const {left,top,right,bottom,width}=refugeArtBounds(type);
 const image=document.createElement('canvas'),k=3;image.width=Math.ceil((right-left+2)*k);image.height=Math.ceil((bottom-top+2)*k);const c=image.getContext('2d');c.scale(k,k);c.translate(1-left,1-top);drawRefugeArt(c,type,0,0,width,0,true);
 const url=image.toDataURL('image/png');if(stills.size<REFUGE_ART_LIMITS.stills)stills.set(type,url);return url;
}
