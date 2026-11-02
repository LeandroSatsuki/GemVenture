import {paintVfxEmission} from './vfx-emission.js';
import {createWallPyres} from './cave-wall-pyres-runtime.js';
import {paintWallPyre} from './cave-wall-pyres-art.js';
import {createApprovedSceneryEmission} from './approved-scenery-emission.js';
import {createFossilFissures} from './fossil-fissures.js';
import {SoftCaveMask,FIELD_PRESENTATION,visionPresentationScale,mineralVisualPoint} from './cave-field-presentation.js';
// Approved Geode R4 presentation, integrated with scene lifetime and video preferences.
import {createRootEmission} from './root-emission.js';
import {createLiquidAmbience} from './liquid-ambience.js';
import {createExplorationLightingMasks,CAVE_LIGHT_MASK_SPEC,lightingVisible} from './cave-lighting-masks.js';
import {sampleGeodeParticleLights,PARTICLE_LIGHT_SPEC} from './geode-particle-light.js';
export const PILOT_SPEC=Object.freeze({version:4,seed:712,maxLights:4,mistRibbons:6,maxSurfaceMasks:96,maxCrystalVariants:12,lightRadius:84,outerReach:1.24,playerRadius:68,crystalRadius:48,crystalHaloRadius:42,crystalGroundRadius:58});
const project=(x,y)=>[50+22*x+2*y,57.5+16*y];
const clamp=x=>Math.max(0,Math.min(1,x));
const hash=n=>{n=Math.imul(n^(n>>>16),0x45d9f3b);return ((n^(n>>>16))>>>0)/4294967296;};
const polygon=(p,points)=>{p.moveTo(...points[0]);for(const q of points.slice(1))p.lineTo(...q);p.closePath();};
const valid=(room,x,y)=>x>=0&&y>=0&&x<(room.cols||21)&&y<(room.rows||15)&&room.floorMask[y*(room.cols||21)+x]===1;
const luminance=rgb=>rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
const atLuminance=(rgb,target)=>{const scale=target/Math.max(1,luminance(rgb));return rgb.map(n=>Math.max(0,Math.min(255,Math.round(n*scale))));};
export function createBiomeLightingProfile(material){
 const parse=value=>{if(!/^#[0-9a-f]{6}$/i.test(value||''))throw TypeError('Missing canonical biome lighting color');return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16));};
 const rgb=parse(material?.light),rock=parse(material?.rock?.at(-1));
 return {accent:material.light,rgb,surface:rgb.map(n=>Math.round(n*.85+255*.15)),mist:rgb.map((n,i)=>Math.round(n*.55+[140,151,164][i]*.45)),shadow:rgb.map((n,i)=>n*.60+rock[i]*.40)};
}
function tile(path,x,y){const [u,v]=project(x,y);polygon(path,[[u-12,v-8],[u+10,v-8],[u+12,v+8],[u-10,v+8]]);}
function rowPath(cells){
 const p=new Path2D();let start=null,last=null;
 const flush=()=>{if(!start)return;const [ax,ay]=project(start.x,start.y),[bx,by]=project(last.x,last.y);polygon(p,[[ax-12,ay-8],[bx+10,by-8],[bx+12,by+8],[ax-10,ay+8]]);};
 for(const q of cells){if(!last||q.y!==last.y||q.x!==last.x+1){flush();start=q;}last=q;}flush();return p;
}
export function floorLineClear(room,a,b){
 const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*4));
 for(let i=0;i<=steps;i++){const t=i/steps;if(!valid(room,Math.round(a.x+(b.x-a.x)*t),Math.round(a.y+(b.y-a.y)*t)))return false;}return true;
}
export function buildArenaMasks(room,props){
 const cells=[];for(let y=0;y<(room.rows||15);y++)for(let x=0;x<(room.cols||21);x++)if(valid(room,x,y))cells.push({x,y});const floor=rowPath(cells);
 const sources=props.slice(0,4).map(p=>{
  const origin=cells.reduce((best,q)=>Math.hypot(q.x-p.grid.x,q.y-p.grid.y)<Math.hypot(best.x-p.grid.x,best.y-p.grid.y)?q:best,cells[0]);
  const path=rowPath(cells.filter(q=>floorLineClear(room,origin,q)));
  const [x,y]=project(p.grid.x,p.grid.y);return {x,y,origin,path,flame:{x:p.brazier.x,y:p.brazier.y-16},phase:p.brazier.phase||0};
 });return {floor,cells,sources};
}
function radial(makeCanvas,color,width=256,height=160){
 const canvas=makeCanvas(width,height),c=canvas.getContext('2d');c.save();c.scale(1,height/width);
 const g=c.createRadialGradient(width/2,width/2,0,width/2,width/2,width/2);
 g.addColorStop(0,color+'c4');g.addColorStop(.30,color+'80');g.addColorStop(.65,color+'25');g.addColorStop(1,color+'00');
 c.fillStyle=g;c.fillRect(0,0,width,width);c.restore();return canvas;
}
function mistTexture(makeCanvas,seed,color){
 const w=384,h=96,canvas=makeCanvas(w,h),c=canvas.getContext('2d'),im=c.createImageData(w,h);
 // Seeded broad bands; never a frame-random, screen-attached noise overlay.
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,s=u*u*(3-2*u),t=v*v*(3-2*v),n=(a,b)=>hash(seed^Math.imul(a+31,71933)^Math.imul(b+17,193939));return (n(ix,iy)*(1-s)+n(ix+1,iy)*s)*(1-t)+(n(ix,iy+1)*(1-s)+n(ix+1,iy+1)*s)*t;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1),center=.5+Math.sin(u*7+seed)*.09+Math.sin(u*17+1.4)*.045;
  const edge=Math.sin(u*Math.PI)**1.3,band=Math.exp(-(((v-center)/.22)**2)),n=noise(u*5,v*3)*.75+noise(u*11+3,v*7)*.25;
  const i=(y*w+x)*4;im.data[i]=color[0];im.data[i+1]=color[1];im.data[i+2]=color[2];im.data[i+3]=Math.round(clamp((n-.20)*1.2)*edge*band*150);
 }c.putImageData(im,0,0);return canvas;
}
const EMISSION=[{body:[40,124,184],top:[47,191,205],color:[53,237,255],hex:'#35edff'},{body:[206,32,41],top:[242,127,114],color:[255,87,72],hex:'#ff5748'},{body:[233,124,7],top:[255,217,90],color:[255,207,48],hex:'#ffcf30'},{body:[93,174,39],top:[162,230,111],color:[141,255,61],hex:'#8dff3d'}];
function emissiveVariant(makeCanvas,image,kind,gain){
 const w=image.width,h=image.height,mask=makeCanvas(w,h),m=mask.getContext('2d');m.drawImage(image,0,0);const pixels=m.getImageData(0,0,w,h),p=EMISSION[kind];
 const d=pixels.data;
 for(let i=0;i<d.length;i+=4){const a=d[i+3];if(!a)continue;
  const tr=d[i]-p.top[0],tg=d[i+1]-p.top[1],tb=d[i+2]-p.top[2],br=d[i]-p.body[0],bg=d[i+1]-p.body[1],bb=d[i+2]-p.body[2];
  // Outside each color radius the original clamped contribution is exactly
  // zero. Keep the original distance calculation for contributing pixels.
  const top=tr*tr+tg*tg+tb*tb>=900?0:clamp(1-Math.hypot(tr,tg,tb)/30),body=br*br+bg*bg+bb*bb>=484?0:clamp(1-Math.hypot(br,bg,bb)/22);
  d[i]=p.color[0];d[i+1]=p.color[1];d[i+2]=p.color[2];d[i+3]=Math.round(a*clamp(top*.96+body*.28));
 }
 m.putImageData(pixels,0,0);const output=makeCanvas(w,h),c=output.getContext('2d');c.drawImage(image,0,0);
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(1,.92*gain);c.shadowBlur=14;c.shadowColor=p.hex;c.drawImage(mask,0,0);c.shadowBlur=0;c.globalAlpha=Math.min(1,.64*gain);c.drawImage(mask,0,0);c.restore();return {canvas:output,mask};
}
export function installGeodeAmbience(world,{scene=world.campaignScene,makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},settings={}}={}){
 const room=scene?.room;
 if(!room?.floorMask||!scene.images||!scene.data?.material)throw Error('Cave lighting requires a warmed cave scene');
 const arena=!!room.bossFloor,legacy=!!scene.legacy;
 const options={lights:true,crystals:true,mist:true,particleGlow:true,liquidGlow:true,strength:1,darkness:1,shadowOpacity:.96,neonIntensity:1,playerIntensity:1,playerRadiusScale:1,crystalRadiusScale:1,debug:false,...settings},originalImages=scene.images;
 let bossMasks=null,masks=arena?buildArenaMasks(room,scene.data.arena?.props||[]):null;
 scene.images=new Map(originalImages);
 const originals={ground:scene.paintGround,wall:scene.paintWall,pillar:scene.paintPillar,night:world.sightHalo,powerShapes:world.powerShapes};
 // Environmental light follows the active biome material. Crystal emission and
 // its local colored spill retain the independently authored crystal colors.
 const profile=createBiomeLightingProfile(scene.data.material);
 const playerVisibility=new SoftCaveMask(()=>makeCanvas(1,1)),playerNight=makeCanvas(1,1);
 const light=radial(makeCanvas,profile.accent),gemLights=EMISSION.map(p=>radial(makeCanvas,p.hex,128,80)),gemHalos=EMISSION.map(p=>radial(makeCanvas,p.hex,192,192)),fog=mistTexture(makeCanvas,room.seed,profile.mist),surfaceMasks=new Map(),variants=new Map();
 const pyres=createWallPyres(),emission=createApprovedSceneryEmission(world,scene,{makeCanvas});
 const liquids=createLiquidAmbience(room,{makeCanvas}),roots=createRootEmission(room,{makeCanvas}),fissures=createFossilFissures(room,{makeCanvas});
 const particleTextures=new Map([[profile.accent,radial(makeCanvas,profile.accent,PARTICLE_LIGHT_SPEC.textureSize,PARTICLE_LIGHT_SPEC.textureSize)]]),night=makeCanvas(1,1);let dead=false,frames=0,stamp=0,soft=false,particleLights=[];
 const active=()=>!dead&&(options.lights||options.crystals||options.mist||options.debug||options.darkness>0);
 const intensity=()=>options.strength*(soft?1:.965+.035*Math.sin(stamp*1.7));
 const neonIntensity=()=>options.neonIntensity*(soft?1:.965+.035*Math.sin(stamp*1.7));
 const visibleNode=n=>n.hp>0&&(arena||!scene.view||Math.abs(project(n.x,n.y)[0]-scene.view.center[0])<scene.view.width/2+128&&Math.abs(project(n.x,n.y)[1]-scene.view.center[1])<scene.view.height/2+128);
 const crystals=()=>room.nodes.filter(n=>n.type==='crystal'&&n.kind<4&&visibleNode(n)).slice(0,arena?64:CAVE_LIGHT_MASK_SPEC.maxCrystalLights);
 function beginFrame(){emission.begin();const view=scene.view||{center:[world.camera.x/2+world.viewWidth/4,world.camera.y/2+world.viewHeight/4],width:world.viewWidth/2,height:world.viewHeight/2};pyres.prepare(room,{view,depth:scene.metrics?.depth||0,biome:scene.biome,material:scene.data.material});}
 function updateImages(){
  const gain=Math.round(options.neonIntensity*100)/100;
  for(let kind=0;kind<4;kind++){const key='crystal-body-'+kind,image=originalImages.get(key);if(!image)continue;
   if(!options.crystals||gain<=0){scene.images.set(key,image);continue;}
   const id=kind+':'+gain;
   if(!variants.has(id)){while(variants.size>=PILOT_SPEC.maxCrystalVariants){const oldest=variants.keys().next().value,old=variants.get(oldest);old.canvas.width=old.mask.width=1;variants.delete(oldest);}variants.set(id,emissiveVariant(makeCanvas,image,kind,gain));}
   const item=variants.get(id);variants.delete(id);variants.set(id,item);scene.images.set(key,item.canvas);
  }
 }
 updateImages();
 function protectPlayer(c,item,player){const x=player.x/2,y=player.y/2;if(item.visualDepth>(player.y-115)/32&&x+52>item.x&&x-52<item.x+item.w&&y+40>item.y&&y-80<item.y+item.h){const p=new Path2D();p.rect(item.x-1,item.y-1,item.w+2,item.h+2);p.rect(x-52,y-80,104,120);c.clip(p,'evenodd');}}
 function surfaceLight(item){
  if(surfaceMasks.has(item.canvas))return surfaceMasks.get(item.canvas);
  if(surfaceMasks.size>=PILOT_SPEC.maxSurfaceMasks)return null;
  const image=item.canvas;if(!image||!item.w||!item.h)return null;
  const canvas=makeCanvas(image.width,image.height),c=canvas.getContext('2d');c.drawImage(image,0,0);const im=c.getImageData(0,0,canvas.width,canvas.height),d=im.data;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
   const wx=item.x+x/canvas.width*item.w,wy=item.y+y/canvas.height*item.h;let energy=0;
   for(const s of masks.sources){const dist=Math.hypot((wx-s.flame.x)/82,(wy-s.flame.y)/90);energy+=clamp(1-dist)**1.8;}
   const i=(y*canvas.width+x)*4,a=d[i+3],luminance=(d[i]+d[i+1]+d[i+2])/765;
   d[i]=profile.surface[0];d[i+1]=profile.surface[1];d[i+2]=profile.surface[2];d[i+3]=Math.round(a*clamp(energy*.46)*( .45+luminance*.55));
  }c.putImageData(im,0,0);surfaceMasks.set(item.canvas,canvas);return canvas;
 }
 function paintSurface(c,item,player){if(!options.lights||!masks?.sources.length)return;const im=surfaceLight(item);if(!im)return;c.save();protectPlayer(c,item,player);c.globalCompositeOperation='screen';c.globalAlpha*=Math.min(1,intensity());c.drawImage(im,item.x,item.y,item.w,item.h);c.restore();}
 function ground(c,time,reduced){
  stamp=Math.max(0,Number(time)||0);soft=!!reduced;if(!arena){const view=scene.view||{center:[world.camera.x/2+world.viewWidth/4,world.camera.y/2+world.viewHeight/4],width:world.viewWidth/2,height:world.viewHeight/2};masks=createExplorationLightingMasks(room,view,masks,{depth:scene.metrics?.depth||0});}particleLights=options.particleGlow&&options.neonIntensity>0?sampleGeodeParticleLights(world,{scene,time:stamp,soft,fallbackColor:profile.accent}):[];if(!arena)particleLights=particleLights.filter(p=>masks.contains(p.x,p.y));liquids.update(masks,{depth:scene.metrics?.depth||0,time:stamp,soft});roots.update(masks);fissures.update(masks,{depth:scene.metrics?.depth||0,time:stamp,soft});bossMasks=arena?createExplorationLightingMasks(room,scene.view||{center:[world.camera.x/2+world.viewWidth/4,world.camera.y/2+world.viewHeight/4],width:world.viewWidth/2,height:world.viewHeight/2},bossMasks,{depth:scene.metrics?.depth||0}):masks;originals.ground?.(c,time,reduced);if(!active())return;frames++;
  c.save();c.clip(masks.floor);c.globalCompositeOperation='screen';
  const gain=intensity(),duck=1-Math.min(.40,(world.comboDisco?.energy||0)*.40);
  if(options.lights)for(const s of masks.sources){c.save();c.clip(s.path);c.globalAlpha*=Math.min(1,.60*gain*duck);const r=PILOT_SPEC.lightRadius;c.drawImage(light,s.x-r,s.y-r*.60,r*2,r*1.20);c.restore();}
  if(options.crystals&&options.neonIntensity>0)for(const n of crystals()){const [x,y]=mineralVisualPoint(n,project,world),r=PILOT_SPEC.crystalGroundRadius*options.crystalRadiusScale,h=PILOT_SPEC.crystalHaloRadius*options.crystalRadiusScale,neon=neonIntensity();c.save();if(!arena)c.clip(masks.sourcePath(n));c.globalAlpha*=Math.min(1,.66*neon*duck);c.drawImage(gemLights[n.kind],x-r,y-r*.53,r*2,r*1.06);c.globalAlpha=Math.min(1,.56*neon*duck);c.drawImage(gemHalos[n.kind],x-h,y-18-h,h*2,h*2);c.restore();}
  if(options.liquidGlow){liquids.paintGround(c,masks,{gain:options.neonIntensity,duck});roots.paintGround(c,masks,{gain:options.neonIntensity,duck});fissures.paintGround(c,masks,{gain:options.neonIntensity,duck});fissures.paintParticles(c,masks,{gain:options.neonIntensity,duck});}
  if(options.mist){
   const t=soft?0:stamp,positions=arena?[[3,4],[20,4],[3,10],[21,11],[7,16],[18,16]]:masks.fogAnchors.map(p=>[p.x,p.y]);
   for(let i=0;i<positions.length;i++){const [gx,gy]=positions[i],[x,y]=project(gx,gy),phase=hash(arena?room.seed+i*71933:room.seed+gx*977+(gy+(masks.depth||0))*157)*6.283,dx=Math.sin(t*.09+phase)*11,dy=Math.cos(t*.07+phase)*3;
    c.save();c.globalAlpha*=.16*options.strength*duck*(soft?.8:1);c.drawImage(fog,x-85+dx,y-13+dy,170+i%2*28,26+i%3*3);c.restore();
   }
  }
  if(options.debug){c.globalCompositeOperation='source-over';c.globalAlpha=.16;for(const s of masks.sources){c.fillStyle='#5ee9e9';c.fill(s.path);}c.globalAlpha=1;c.fillStyle='#ffd95a';for(const s of masks.sources){c.beginPath();c.arc(s.x,s.y,3,0,Math.PI*2);c.fill();}}
  c.restore();
 }
 scene.paintGround=ground;
 scene.paintWall=(c,item,player)=>{originals.wall?.(c,item,player);if(active())paintSurface(c,item,player);};
 scene.paintPillar=(c,item,player,args)=>{originals.pillar?.(c,item,player,args);if(active())paintSurface(c,item,player);};
 // R2: low ambient fill, compact readability around the miner and actual emitters.
 // This is presentation only; logical visibility/range and attack timing are unchanged.
 world.sightHalo=function(c,run){
  if(legacy)ground(c,world.ambientAge||0,world.reduced||!!world.motionPreference?.matches);
  if(dead||(!options.lights&&!options.crystals&&!options.darkness)){originals.night?.call(this,c,run);return;}
  const transform=c.getTransform(),viewport={x:-transform.e/transform.a,y:-transform.f/transform.d,w:c.canvas.width/transform.a,h:c.canvas.height/transform.d},w=Math.ceil(viewport.w)+8,h=Math.ceil(viewport.h)+8;
  const dark=Math.max(0,Math.min(1.15,Number(options.darkness)||0));
  const baseAmbient=dark?[Math.max(3,Math.round(18-(dark-.8)*40)),Math.max(6,Math.round(26-(dark-.8)*50)),Math.max(16,Math.round(42-(dark-.8)*65))]:[36,84,115];
  const ambient=atLuminance(profile.shadow,luminance(baseAmbient));
  if(night.width!==w)night.width=w;if(night.height!==h)night.height=h;const m=night.getContext('2d');m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,w,h);m.globalAlpha=1;m.globalCompositeOperation='source-over';m.fillStyle='rgb('+ambient.join(',')+')';m.fillRect(0,0,w,h);m.globalCompositeOperation='destination-out';
  // R3: keep the exact R2 peak and inner core. Let the middle falloff reach
  // slightly farther, followed by a very weak skirt; ambient fill is untouched.
  const hole=(x,y,r,power,target=m)=>{power=clamp(power);const reach=dark?PILOT_SPEC.outerReach:1,outer=r*reach,g=target.createRadialGradient(x,y,dark?0:r*.45,x,y,outer);g.addColorStop(0,'rgba(0,0,0,'+power+')');if(dark){g.addColorStop(.18/reach,'rgba(0,0,0,'+(power*.92)+')');g.addColorStop(.50/reach,'rgba(0,0,0,'+(power*.56)+')');g.addColorStop(.85/reach,'rgba(0,0,0,'+(power*.16)+')');g.addColorStop(1/reach,'rgba(0,0,0,'+(power*.055)+')');}else g.addColorStop(.65,'rgba(0,0,0,'+(power*.85)+')');g.addColorStop(1,'rgba(0,0,0,0)');target.fillStyle=g;target.fillRect(x-outer,y-outer,outer*2,outer*2);};
  const playerX=this.player.x/2-viewport.x+4,playerY=this.player.y/2-viewport.y-8,playerRadius=(dark?PILOT_SPEC.playerRadius:95)*visionPresentationScale(run)*options.playerRadiusScale,playerPower=Math.min(1,(dark?.52:.84)*options.playerIntensity);
  if(!arena){const gy=(this.player.y-115)/32,gx=(this.player.x-100-gy*4)/44;
   playerVisibility.prepare([{path:masks.sourcePath({x:gx,y:gy},true),alpha:1}],viewport,{feather:FIELD_PRESENTATION.lightFeather,strict:true});
   if(playerNight.width!==w)playerNight.width=w;if(playerNight.height!==h)playerNight.height=h;const pc=playerNight.getContext('2d');pc.setTransform(1,0,0,1,0,0);pc.globalAlpha=1;pc.globalCompositeOperation='source-over';pc.clearRect(0,0,w,h);hole(playerX,playerY,playerRadius,playerPower,pc);
   pc.save();pc.globalCompositeOperation='destination-in';pc.translate(-viewport.x+4,-viewport.y+4);playerVisibility.paint(pc);pc.restore();pc.globalCompositeOperation='source-over';m.drawImage(playerNight,0,0);
  }else hole(playerX,playerY,playerRadius,playerPower);
  for(let i=0;i<masks.sources.length;i++){const s=masks.sources[i],p=scene.data.arena.props[i];hole(p.brazier.x-viewport.x+4,p.brazier.y-viewport.y-15,dark?30:38,dark?.98:.78);
   if(options.lights){m.save();m.translate(-viewport.x+4,-viewport.y+4);m.clip(s.path);m.translate(viewport.x-4,viewport.y-4);hole(s.x-viewport.x+4,s.y-viewport.y+4,dark?76:100,(dark?.76:.40)*options.strength);m.restore();}
  }
  if(options.crystals&&options.neonIntensity>0){m.save();m.translate(-viewport.x+4,-viewport.y+4);m.clip(masks.floor);m.translate(viewport.x-4,viewport.y-4);for(const n of crystals()){const [x,y]=mineralVisualPoint(n,project,world);if(!arena){m.save();m.translate(-viewport.x+4,-viewport.y+4);m.clip(masks.sourcePath(n,true));m.translate(viewport.x-4,viewport.y-4);}hole(x-viewport.x+4,y-viewport.y-(dark?15:7),(dark?PILOT_SPEC.crystalRadius:47)*options.crystalRadiusScale,Math.min(1,(dark?.98:.32)*options.neonIntensity));if(!arena)m.restore();}m.restore();}
  if(options.liquidGlow){liquids.paintNight(m,viewport,hole,masks,{gain:options.neonIntensity});roots.paintNight(m,viewport,masks,{gain:options.neonIntensity});fissures.paintNight(m,viewport,masks,{gain:options.neonIntensity});}
  if(particleLights.length){m.save();m.translate(-viewport.x+4,-viewport.y+4);m.clip(masks.floor);m.translate(viewport.x-4,viewport.y-4);for(const p of particleLights)hole(p.x-viewport.x+4,p.y-viewport.y+4,p.radius,PARTICLE_LIGHT_SPEC.nightReveal*options.neonIntensity*p.alpha);m.restore();}
  if(dark){
   emission.paintBossNight(m,viewport,hole,bossMasks,{strength:options.strength});if(legacy){const boss=room.enemies.find(n=>n.boss&&n.hp>0&&lightingVisible(room,n.x,n.y));if(boss){const [x,y]=project(boss.x,boss.y);hole(x-viewport.x+4,y-viewport.y-25,44,.54);}}
   const b=scene.surface?.burrowData?.()?.plan;if(b)hole(b.cx-viewport.x+4,b.cy-viewport.y-46,40,.30);
  }
  m.globalCompositeOperation='source-over';c.save();scene.clipFog?.(c);c.globalCompositeOperation='multiply';c.globalAlpha*=options.shadowOpacity;c.drawImage(night,viewport.x-4,viewport.y-4);c.restore();
 };
 // Boss arenas have explored=null, so World intentionally skips sightHalo there.
 // Reuse the unconditional late world pass, before finish/crisp information.
 world.powerShapes=function(c,run,time){
  if(!run.room.explored&&(options.darkness>0||options.lights||options.crystals)&&!dead)this.sightHalo(c,run);
  if(!dead&&particleLights.length){c.save();c.clip(masks.floor);c.globalCompositeOperation='screen';const gain=PARTICLE_LIGHT_SPEC.alpha*options.neonIntensity*(1-Math.min(.5,world.comboDisco?.energy||0));for(const p of particleLights){
   let texture=particleTextures.get(p.color);if(!texture){if(particleTextures.size>=PARTICLE_LIGHT_SPEC.maxColors)texture=particleTextures.get(profile.accent);else{texture=radial(makeCanvas,p.color,PARTICLE_LIGHT_SPEC.textureSize,PARTICLE_LIGHT_SPEC.textureSize);particleTextures.set(p.color,texture);}}
   c.globalAlpha=Math.min(.14,gain*p.alpha);c.drawImage(texture,p.x-p.radius,p.y-p.radius,p.radius*2,p.radius*2);
  }c.restore();}
  if(!dead&&options.neonIntensity>0&&particleLights.some(p=>p.emissive)){c.save();c.clip(masks.floor);paintVfxEmission(c,particleLights.filter(p=>p.emissive),{soft,strength:options.neonIntensity,core:true});c.restore();}
  if(!dead&&options.liquidGlow)liquids.paintParticles(c,{gain:options.neonIntensity,duck:1-Math.min(.4,(world.comboDisco?.energy||0)*.4)});
  const result=originals.powerShapes?.call(this,c,run,time);
  if(!dead)emission.paint(c,masks,{gain:options.neonIntensity,bossMasks,ambientGain:options.strength,lights:options.lights,duck:1-Math.min(.6,world.comboDisco?.energy||0)});
  return result;
 };
 function stats(){const canvases=[light,...gemLights,...gemHalos,fog,night,playerNight,...particleTextures.values(),...surfaceMasks.values(),...[...variants.values()].flatMap(v=>[v.canvas,v.mask])];return {frames,pyres:pyres.status(),selectiveEmission:emission.status(),liquids:liquids.status(),roots:roots.status(),fissures:fissures.status(),surfaceMasks:surfaceMasks.size,crystalVariants:variants.size,lights:masks?.sources.length||0,maskStatus:masks?.status?.()||null,particleLights:particleLights.length,particleTextures:particleTextures.size,mistRibbons:options.mist?6:0,playerVisibility:playerVisibility.status(),canvasBytes:emission.status().canvasBytes+canvases.reduce((n,c)=>n+c.width*c.height*4,0)+playerVisibility.status().bytes+liquids.status().canvasBytes+roots.status().canvasBytes+fissures.status().canvasBytes,biomeLighting:profile,settings:{...options},time:stamp,soft};}
 const bounded=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
 return {ready:emission.ready,beginFrame,decorations:()=>pyres.prepare(room,{view:scene.view||{center:[world.camera.x/2+world.viewWidth/4,world.camera.y/2+world.viewHeight/4],width:world.viewWidth/2,height:world.viewHeight/2},depth:scene.metrics?.depth||0,biome:scene.biome,material:scene.data.material}).map(item=>({...item,type:'wallPyre',x:item.grid.x,y:item.grid.y})),paintDecoration(c,item){const args={time:world.ambientAge||0,soft:world.reduced||!!world.motionPreference?.matches,player:world.player};paintWallPyre(c,item,args);emission.capture(c,'wall-pyre',{item,...args});},set(values){Object.assign(options,values);options.strength=bounded(options.strength,0,2,1);options.darkness=bounded(options.darkness,0,1.15,1);options.shadowOpacity=bounded(options.shadowOpacity,0,1,.96);options.neonIntensity=bounded(options.neonIntensity,0,2.5,1);options.playerIntensity=bounded(options.playerIntensity,0,2,1);options.playerRadiusScale=bounded(options.playerRadiusScale,.5,2,1);options.crystalRadiusScale=bounded(options.crystalRadiusScale,.5,2,1);updateImages();},status:stats,get masks(){return masks;},
  dispose(){if(dead)return;dead=true;pyres.dispose();emission.dispose();liquids.dispose();roots.dispose();fissures.dispose();scene.paintGround=originals.ground;scene.paintWall=originals.wall;scene.paintPillar=originals.pillar;world.sightHalo=originals.night;world.powerShapes=originals.powerShapes;scene.images=originalImages;playerVisibility.reset();for(const c of [light,...gemLights,...gemHalos,fog,night,playerNight,...particleTextures.values(),...surfaceMasks.values(),...[...variants.values()].flatMap(v=>[v.canvas,v.mask])])c.width=c.height=1;surfaceMasks.clear();variants.clear();particleTextures.clear();particleLights=[];}
 };
}
