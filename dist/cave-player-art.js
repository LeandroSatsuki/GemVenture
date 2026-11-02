import {paintDungeonPickaxe} from './dungeon-pickaxe.js';
import {CAVE_PLAYER_FRAME as F,CAVE_PLAYER_POSES as POSES,CAVE_PLAYER_ASSETS as ASSETS,CAVE_PLAYER_ROOT,CAVE_PLAYER_EMBEDDED,CAVE_PLAYER_TOOL as TOOL} from './cave-player-manifest.js';
import {PICKAXE_ART} from './pickaxe-art-manifest.js';
import {drawAsset} from './art-kit.js';
import {P} from './palette.js';
import {drawDungeonMiner} from './dungeon-miner.js';

export const CAVE_PICKAXE_EMBEDDED=Object.freeze({});
const TIER_TIPS=[[158,460],[160,460.5],[161,460.5],[160,460],[162,459.5],[160,460],[162,460],[163,459],[158,459.5],[157,460]];
export const CAVE_BODY_GROUND_OFFSET=1.3175;
export const TITAN_HEAD_OCCLUSION_BOTTOM=-5.5;
export const CAVE_PLAYER_CACHE_LIMITS=Object.freeze({toolImages:10,protectedMasks:4,protectedSide:512,fallbackImages:10,decodeConcurrency:2});
const images=new Map(),tools=new Map(),fallbacks=new Map(),headClips=new Map(),protectedTools=new Map(),failed=new Set(),toolStates=new Map(),maskBuffers=[];
const bodyIds=ASSETS.filter(s=>s.id!=='iron').map(s=>s.id),bodySpec=new Map(ASSETS.map(s=>[s.id,s]));
let loading=null,bodyPrepared=false,activeTier=0,selectionEpoch=0,queuedMask=false,maskVersion=null,maskBuilds=0,toolJobs=0;
const toolQueue=[];
const validTier=tier=>Number.isInteger(tier)&&tier>=0&&tier<PICKAXE_ART.length?tier:0;
// RIGHT retains the already applied Ferro reflection, for every tier.
const RIGHT_TOOL_REFLECTION_AXIS=2*Math.atan2(TOOL.tip[1]-TOOL.grip[1],TOOL.tip[0]-TOOL.grip[0]);
const FALLBACK_GRIP=[48,67],FALLBACK_TIP=[13,40],FALLBACK_PAD=4,FALLBACK_REFERENCE=[108,118];
const defer=fn=>Promise.resolve().then(fn);
const bodyReady=()=>bodyPrepared&&bodyIds.every(id=>images.has(id));
function fallbackRecord(tier){return fallbacks.get(validTier(tier))||null;}
function availableTool(tier,version=null){
 tier=validTier(tier);
 const native=tools.get(tier);
 if(version?.startsWith('procedural:'))return fallbackRecord(tier);
 return native&&(!version||native.version===version)?native:fallbackRecord(tier);
}
export function cavePlayerToolStatus(tier=activeTier){
 tier=validTier(tier);const record=availableTool(tier),state=toolStates.get(tier)||'idle';
 return {tier,id:PICKAXE_ART[tier].id,status:state,ready:tools.has(tier),source:record?.source||'pending',version:record?.version||null,protectedReady:!!record&&maskVersion===tier+'|'+record.version,active:tier===activeTier};
}
export function cavePlayerArtStatus(){
 const bodyCount=bodyIds.filter(id=>images.has(id)).length;
 return {ready:bodyReady(),bodyReady:bodyReady(),loaded:images.size+Math.max(0,tools.size-(tools.has(0)?1:0)),expected:bodyIds.length+PICKAXE_ART.length,
 bodyLoaded:bodyCount,bodyExpected:bodyIds.length,toolLoaded:tools.size,toolExpected:PICKAXE_ART.length,activeTier,activeTool:cavePlayerToolStatus(activeTier),
 protectedToolCaches:protectedTools.size,protectedTier:maskVersion?.split('|')[0]??null,maskVersion,maskBuilds,failed:[...failed],
 cachePixels:[...images.values()].reduce((s,v)=>s+v.image.width*v.image.height,0)+[...tools].filter(([tier])=>tier!==0).reduce((s,[,v])=>s+v.image.width*v.image.height,0)+fallbacks.size*216*236+maskBuffers.length*512*512,
 protectedBytes:maskBuffers.length*512*512*4,queuedToolDecodes:toolQueue.length,activeToolDecodes:toolJobs};
}
function rawTool(c,pose,toolPose,width,record,x=0,y=0){
 if(!record)return;
 c.save();c.translate(x+pose.handAnchorLocal[0],y+pose.handAnchorLocal[1]);c.rotate(toolPose.toolAngleRadians);
 if(pose.direction==='right'){c.rotate(RIGHT_TOOL_REFLECTION_AXIS);c.scale(1,-1);}
 if(record.source==='procedural'){
  const tip=TIER_TIPS[record.tier],dx=tip[0]-TOOL.grip[0],dy=tip[1]-TOOL.grip[1],px=FALLBACK_TIP[0]-FALLBACK_GRIP[0],py=FALLBACK_TIP[1]-FALLBACK_GRIP[1];
  const scale=width*Math.hypot(dx,dy)/(1200*Math.hypot(px,py));
  c.rotate(Math.atan2(dy,dx)-Math.atan2(py,px));
  c.drawImage(record.image,-(FALLBACK_GRIP[0]+FALLBACK_PAD)*scale,-(FALLBACK_GRIP[1]+FALLBACK_PAD)*scale,FALLBACK_REFERENCE[0]*scale,FALLBACK_REFERENCE[1]*scale);
 }else{
  const scale=width/record.reference;
  c.drawImage(record.image,-record.grip[0]*scale,-record.grip[1]*scale,record.size[0]*scale,record.size[1]*scale);
 }
 c.restore();
}
function prepareFallbacks(){
 for(let tier=0;tier<PICKAXE_ART.length;tier++){
  const canvas=document.createElement('canvas');canvas.width=216;canvas.height=236;const c=canvas.getContext('2d');c.scale(2,2);
  // Reuse the existing procedural pickaxe. Its own 100x110 grip is adapted separately.
  drawAsset(c,'pickaxe',54,100,100,{variant:tier});
  fallbacks.set(tier,{tier,id:PICKAXE_ART[tier].id,image:canvas,source:'procedural',version:'procedural:'+tier+':grip-48-67-v1'});
 }
}
function prepareHeadClips(){
 for(const direction of ['down','right'])for(const pose of ['rest','strike']){
  const image=images.get('body-'+direction+'-'+pose)?.image;if(!image)continue;
  const data=image.getContext('2d').getImageData(0,0,image.width,image.height).data,path=new Path2D();path.rect(-128,-128,256,256);
  // A static safety clip for cache transitions/historical trails. Exact alpha masks
  // remain the normal active-tier path. No bitmap reconstruction occurs in draw.
  const last=Math.min(image.height,Math.floor((F.groundAnchor[1]+TITAN_HEAD_OCCLUSION_BOTTOM)*F.density));
  for(let y=0;y<last;y++){let start=-1;for(let x=0;x<=image.width;x++){const on=x<image.width&&data[(y*image.width+x)*4+3]>=(direction==='right'?128:1);
   if(on&&start<0)start=x;if(!on&&start>=0){path.rect(start/F.density-F.groundAnchor[0],y/F.density-F.groundAnchor[1],(x-start)/F.density,1/F.density);start=-1;}
  }}
  headClips.set(direction+'-'+pose,path);
 }
}
function protectedKey(record,bodyPose,toolPose,width=39){return record.tier+'|'+record.version+'|'+bodyPose+'|'+bodySpec.get('body-down-'+bodyPose).sha256+'|'+toolPose+'|'+width;}
function prepareProtectedTools(record){
 if(!bodyReady()||!record)return;
 const epoch=selectionEpoch;if(record.tier!==activeTier)return;
 const next=new Map();let index=0;
 for(const bodyPose of ['rest','strike'])for(const toolPose of ['rest','strike']){
  let canvas=maskBuffers[index];if(!canvas){canvas=document.createElement('canvas');canvas.width=canvas.height=512;maskBuffers[index]=canvas;}index++;
  const c=canvas.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,512,512);c.scale(4,4);c.translate(64,64);
  rawTool(c,POSES['down-'+bodyPose],POSES['down-'+toolPose],39,record);
  const height=F.groundAnchor[1]+TITAN_HEAD_OCCLUSION_BOTTOM,left=(64-F.groundAnchor[0])*4,top=(64-F.groundAnchor[1])*4;
  c.setTransform(1,0,0,1,0,0);c.save();c.beginPath();c.rect(left,top,F.width*4,height*4);c.clip();c.globalCompositeOperation='destination-out';c.drawImage(images.get('body-down-'+bodyPose).image,left,top);c.restore();
  next.set(protectedKey(record,bodyPose,toolPose),canvas);
 }
 if(epoch!==selectionEpoch||record.tier!==activeTier)return;
 protectedTools.clear();for(const [key,value]of next)protectedTools.set(key,value);maskVersion=record.tier+'|'+record.version;maskBuilds++;
}
function queueMaskPreparation(){
 if(queuedMask||!bodyReady())return;
 queuedMask=true;defer(()=>{queuedMask=false;const record=availableTool(activeTier);if(record&&maskVersion!==record.tier+'|'+record.version)prepareProtectedTools(record);});
}
function registerTool(tier,image,spec){
 const record=tier===0?{tier:0,id:PICKAXE_ART[0].id,image,source:'sprite',version:spec.sha256,reference:1200,grip:TOOL.grip,size:TOOL.size}:
 {tier,id:PICKAXE_ART[tier].id,image,source:'sprite',version:spec.sha256,reference:240,grip:[125.4,119],size:[240,264]};
 tools.set(tier,record);toolStates.set(tier,'ready');failed.delete('tool:'+tier);if(tier===activeTier)queueMaskPreparation();
}
function runToolQueue(){
 if(!bodyPrepared)return;
 while(toolJobs<CAVE_PLAYER_CACHE_LIMITS.decodeConcurrency&&toolQueue.length){
  const activeIndex=toolQueue.indexOf(activeTier),tier=toolQueue.splice(activeIndex<0?0:activeIndex,1)[0],record=PICKAXE_ART[tier],spec=tier===0?bodySpec.get('iron'):record.roles.forge;toolJobs++;toolStates.set(tier,'loading');
  const image=new Image();let settled=false;
  const finish=ok=>{if(settled)return;settled=true;image.onload=null;image.onerror=null;toolJobs--;
   if(ok)try{if(tier===0){const scale=512/Math.max(...spec.size),canvas=document.createElement('canvas');canvas.width=Math.ceil(spec.size[0]*scale);canvas.height=Math.ceil(spec.size[1]*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);images.set('iron',{image:canvas,spec});registerTool(0,canvas,spec);}else registerTool(tier,image,spec);}catch{ok=false;}
   if(!ok){toolStates.set(tier,'failed');failed.add('tool:'+tier);if(tier===activeTier)queueMaskPreparation();}
   runToolQueue();
  };
  const size=tier===0?spec.size:[240,264];image.onload=()=>finish(image.naturalWidth===size[0]&&image.naturalHeight===size[1]);image.onerror=()=>finish(false);
  image.src=tier===0?(CAVE_PLAYER_EMBEDDED.iron||CAVE_PLAYER_ROOT+spec.file):(CAVE_PICKAXE_EMBEDDED[record.id]||spec.file);
 }
}
export function prepareCavePlayerTier(tier){
 tier=validTier(tier);
 if(tier!==activeTier){activeTier=tier;selectionEpoch++;maskVersion=null;protectedTools.clear();queueMaskPreparation();}
 if(bodyPrepared){const at=toolQueue.indexOf(tier);if(at>0){toolQueue.splice(at,1);toolQueue.unshift(tier);}defer(runToolQueue);}
 return cavePlayerToolStatus(tier);
}
export function loadCavePlayerArt(){
 if(loading)return loading;
 if(typeof document==='undefined'||typeof Image==='undefined')return Promise.resolve(cavePlayerArtStatus());
 let next=0;const bodies=ASSETS.filter(spec=>spec.id!=='iron');
 const load=spec=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>{try{
   if(image.naturalWidth!==spec.size[0]||image.naturalHeight!==spec.size[1])throw Error('Size mismatch');
   const scale=Math.min(1,512/Math.max(...spec.size)),canvas=document.createElement('canvas');canvas.width=Math.ceil(spec.size[0]*scale);canvas.height=Math.ceil(spec.size[1]*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);images.set(spec.id,{image:canvas,spec});
  }catch{failed.add(spec.id);if(spec.id==='iron')toolStates.set(0,'failed');}resolve();};image.onerror=()=>{failed.add(spec.id);if(spec.id==='iron')toolStates.set(0,'failed');resolve();};image.src=CAVE_PLAYER_EMBEDDED[spec.id]||CAVE_PLAYER_ROOT+spec.file;
 });
 loading=Promise.all(Array.from({length:2},async()=>{while(next<bodies.length)await load(bodies[next++]);})).then(()=>{
  if(bodyIds.every(id=>images.has(id)))try{prepareHeadClips();prepareFallbacks();bodyPrepared=true;queueMaskPreparation();}catch{failed.add('body-preparation');}
  for(let tier=0;tier<PICKAXE_ART.length;tier++){toolStates.set(tier,'queued');toolQueue.push(tier);}runToolQueue();
  return cavePlayerArtStatus();
 });return loading;
}
export function caveRightPlacement(x,y){return {x,y:y+CAVE_BODY_GROUND_OFFSET};}
export function caveToolPolicy(p,protect=true){return p.direction==='up'?'behind-body':protect&&p.giant&&p.direction==='left'?'behind-body':protect&&p.giant&&p.direction==='down'?'behind-head':'front';}
export function drawCavePlayer(c,x,y,picture,layer='all',{protectTitan=true,drawGroundShadow=true}={}){
 if(!picture?.native||!bodyReady())return false;
 if(drawDungeonMiner(c,x,y,picture,layer,({x:gx,y:gy,angle,basis})=>{paintDungeonPickaxe(c,{x:gx,y:gy,angle,basis,tier:picture.pickTier,scale:picture.giant?1.5:1});},drawGroundShadow))return true;
 const dir=picture.direction,pose=POSES[dir+'-'+picture.bodyPose],toolPose=POSES[dir+'-'+picture.toolPose];if(!pose||!toolPose)return false;
 const ground=caveRightPlacement(x,y),left=ground.x-F.groundAnchor[0],top=ground.y-F.groundAnchor[1],body=images.get('body-'+dir+'-'+picture.bodyPose).image,hand=images.get('hand-'+dir+'-'+picture.bodyPose).image,policy=caveToolPolicy(picture,protectTitan),record=availableTool(picture.pickTier,picture.toolVersion);
 const tool=()=>{if(!record)return;if(policy==='behind-head'){
   const cached=protectedTools.get(protectedKey(record,picture.bodyPose,picture.toolPose,picture.toolWidth));
   if(cached)c.drawImage(cached,ground.x-64,ground.y-64,128,128);
   else{c.save();c.translate(ground.x,ground.y);c.clip(headClips.get('down-'+picture.bodyPose),'evenodd');rawTool(c,pose,toolPose,picture.toolWidth,record);c.restore();}
  }else if(protectTitan&&picture.giant&&dir==='right'&&record.source==='procedural'){
   // Only the temporary RIGHT/Titan source: keep its registered grip/tip, but
   // protect the visible helmet/lantern silhouette. Native CP2 RIGHT is unchanged.
   c.save();c.translate(ground.x,ground.y);c.clip(headClips.get('right-'+picture.bodyPose),'evenodd');rawTool(c,pose,toolPose,picture.toolWidth,record);c.restore();
  }else rawTool(c,pose,toolPose,picture.toolWidth,record,ground.x,ground.y);};
 c.save();
 if(layer!=='front'){
  if(drawGroundShadow){c.fillStyle=P.ink;c.beginPath();c.ellipse(x,y,26*.31,5*.31,0,0,Math.PI*2);c.fill();}
  if(policy==='behind-body')tool();c.drawImage(body,left,top,F.width,F.height);
  if(picture.armorTier){c.fillStyle=[null,P.cyan,P.lemon,P.pink][picture.armorTier];for(const [ax,ay]of pose.armorMarkerAnchorsLocal){c.beginPath();c.roundRect(ground.x+ax-.775,ground.y+ay-.62,1.55,1.24,.62);c.fill();}}
 }
 if(layer!=='body'){if(policy!=='behind-body')tool();c.drawImage(hand,left,top,F.width,F.height);}c.restore();return true;
}
drawCavePlayer.supportsGroundShadowControl=true;
