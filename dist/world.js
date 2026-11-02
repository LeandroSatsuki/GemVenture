import {sceneBeatPhase,sceneBeatTime} from './album-clock.js';
import{mysticActive,mysticTargets}from'./mystic-mechanic.js';
import{paintMysticCombat,paintMysticGround}from'./mystic-presentation.js';
import{mysticFire}from'./mystic-fire.js';
import{paintMysticBeamWarning}from'./mystic-beam.js';
import {sceneEntityVisible,sceneryBurrowVisible} from './scenery-visibility.js';
import{micelialActive}from'./micelial-mechanic.js';
import{paintMicelial,paintMicelialGround,paintMicelialNucleus}from'./micelial-art.js';
import {SoftCaveMask,paintMovementReach} from './cave-field-presentation.js';
import {CaveHoleDescent} from './cave-hole-descent.js';
import {crownActive,crownCaption} from './geode-crown.js';
import {wavePillars} from './geode-fan.js';
import {densifyWaveCrests,crestVisible} from './geode-polish.js';
import {loadGeodeCrownArt,resetCrownPresentation,acceptCrownEvents,paintCrownArt,paintCrownGround,paintCrownAir,paintCrownGhost,paintCrownPillar} from './geode-crown-art.js';
import {syncGeodeAmbience,releaseGeodeAmbience,ambientDecorations,paintAmbientDecoration} from './geode-lighting-runtime.js';
import {rootActive} from './matriarch-mechanic.js';
import {arenaVisualOffset} from './matriarch-arena.js';
import {paintMatriarch,rootSceneEntities,paintSapRoot,paintSummonBush,paintVineGround,paintVineWrap,paintSapArc} from './matriarch-art.js';
import {caveZagEntity,paintCaveZag} from './cave-zag-art.js';
import {paintCaveMiniboss} from './cave-miniboss-art.js';
import {caveFindEntities,paintCaveFind,paintComboGuard} from './cave-find-art.js';
import {isCaveFind} from './cave-finds.js';
import {ChestOpeningPresentation} from './chest-opening-presentation.js';
import {ChestTreasureVfx} from './chest-treasure-vfx.js';
import {expandedBossArena,BOSS_ARENA_SPACE,bossArenaCamera} from './boss-arena-space.js';
import {isAbyssCave} from './abyss-cave-layout.js';
import {createAbyssScene} from './abyss-cave-scene.js';
import {campaignFog,campaignDiscoGround} from './campaign-cave-fog.js';
import {isCampaignCave} from './campaign-cave-layout.js';
import {campaignCaveScene,paintCampaignMineral,paintCampaignNight} from './campaign-cave-runtime.js';
import {AttackReadability} from './attack-readability.js';
import {createPowerPainter} from './power-vfx.js';
import {paintCaveWallShadows,paintCaveMist} from './cave-depth.js';
import {sampleComboDisco,paintComboDiscoFloor,paintComboDiscoWall} from './combo-disco.js';
import {minerOutfitKey} from './miner-outfit.js';
import {occludingWallPlan,paintOccludingWall,wallOcclusion} from './cave-wall-occlusion.js';
import {paintBossArena} from './boss-arena.js';
import {paintBossV2} from './dungeon-bosses-v2.js';
import {paintBurrowFrameV2} from './dungeon-hedgehog-v2.js';
import {paintVoxelFlame} from './dungeon-fx.js';
import {loadBossMotion,paintBossMotion} from './dungeon-boss-motion.js';
import {PetFollower} from './pet-follower.js';
import {paintPetFollower} from './pet-follower-art.js';
import {equippedPet} from './home-collection.js';
import {RabbitPresentation} from './rabbit-presentation.js';
import {beatTime as rabbitBeatTime} from './score.js';
import {accountScoreView} from './account-score.js';
import {paintGeodePulseWarning,paintGeodePulseCount} from './geode-vfx.js';
import {GeodePresentation} from './geode-presentation.js';
import {loadGeodeArt,paintGeodeArt} from './geode-art.js';
import {paintGeodeContactShadow} from './geode-rig.js';
import {paintCaveAtmosphere} from './cave-atmosphere.js';
import {loadCaveArrivalArt,caveArrivalArtRevision,paintCaveArrival} from './cave-arrival-presentation.js';
import {paintRareOre} from './rare-ore-vfx.js';
import {drawDungeonCreature,prepareDungeonCreatures} from './dungeon-creatures.js';
import {paintDungeonEnvironment,paintDungeonNight,paintDungeonMotes} from './dungeon-environment.js';
import {DUNGEON_MATERIALS} from './dungeon-volumes.js';
import {drawCaveMineral} from './cave-mineral-treatment.js';
import {getVideoPreferences,cameraDistanceScale} from './video-preferences.js';
import {getBossHelpPreferences} from './boss-help-preferences.js';
import {bossHelpCaption,bossHelpAnchor,bossHelpObstacles,paintBossHelpBubble} from './boss-help-view.js';
import {paintPlayerHealth,paintBossHealth} from './canvas-health-ui.js';
import {crystalWingCache,paintWingsBehind,WING_ENVELOPE} from './crystal-wings.js';
import {sampleCrystalWingFrame} from './crystal-wing-frame.js';
import {RefugeFacing} from './refuge-facing.js';
import {drawRefugePlayer} from './refuge-player.js';
import {CavePlayerPresentation,caveActionContext,caveFrontTarget,caveFacingFromWorld} from './cave-player-presentation.js';
import {loadCavePlayerArt,cavePlayerArtStatus,prepareCavePlayerTier,cavePlayerToolStatus,drawCavePlayer} from './cave-player-art.js';
import {createRefugeController,canonicalApproach} from './refuge-runtime.js';
import {loadWallArt,wallArtRevision,usesWallArt,paintWallArt} from './cave-wall-art.js';
import {loadApprovedArt,approvedArtRevision,approvedArtAvailable,approvedArtSpec,approvedArtRect} from './approved-art.js';
import {isAbyss,musicFloor,activeBoost} from './frenzy.js';
import {roomSize,visible,terrainAt,environment,isFloor} from './cavern.js';
import {BOSSES} from './bosses.js';
import {CRYSTALS,biomeIndex,rng,COLS,ROWS,dangerTiles,maxHealth} from './core.js';
import {beatPhase} from './score.js';
import {Effects} from './effects.js';
import {hedgehogMood,hedgehogVisible} from './hedgehog.js';
import {loadHedgehogArt,drawHedgehogArt,traceHedgehogArch} from './hedgehog-presentation.js';
import {P,BIOME_ART} from './palette.js';
import {createWorldFinish} from './world-finish.js';
import {beginCrispFrame,paintCrisp,flushCrispFrame,crispCanvasFor} from './crisp-layer.js';
import {RefugeLobbyScene} from './refuge-lobby-scene.js';
import {buildCaveScenery,paintCaveScenery} from './cave-scenery.js';
import {caveBiomeProfile} from './cave-biome-art.js';
import {paintCaveFloorSurface} from './cave-floor-art.js';
import {drawAsset,ART_ACCENT_PIVOTS,HEDGEHOG_PART_PIVOTS} from './art-kit.js';
import {pickaxeTier} from './pickaxe-style.js';
import {currentRecord} from './records.js';
import {FLOW_PROPS,loadVillageArt,flowSprite,flowIdle,paintFlowVillage} from './flow-village.js';
import {clipRefugeBank} from './refuge-terrain.js';
import {createMotionPolicy} from './refuge-motion-policy.js';
import {createCloudCache,cloudPoses,paintClouds} from './refuge-clouds.js';
import {refugeCloudGuards} from './refuge-cloud-guards.js';
import {REFUGE_SIZE,REFUGE_SPAWN,REFUGE_HOTSPOTS,REFUGE_SHORE,REFUGE_LIGHTS} from './refuge-scene.js';
import {paintRefugeWater,paintRefugeLight} from './refuge-effects.js';
export const project=(x,y)=>({x:100+x*44+y*4,y:115+y*32});
export const unproject=(x,y)=>{const ty=(y-115)/32;return{x:Math.round((x-100-ty*4)/44),y:Math.round(ty)};};
// Sample the actual walkable route, including corners, rather than cutting across rocks.
export function dashPoint(route,progress){let remaining=route.length*Math.max(0,Math.min(1,progress));for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],length=Math.hypot(b.x-a.x,b.y-a.y);if(remaining<=length||i===route.points.length-1){const f=length?Math.min(1,remaining/length):1;return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}remaining-=length;}return {...route.points[0]};}
// The ground position follows each walkable cell; only the sprite hops vertically.
export function hopPose(route,time){
 const steps=route.points.length-1,duration=Math.min(.3,Math.max(.1,steps*.065)),progress=Math.min(1,Math.max(0,time/duration))*steps,index=Math.min(steps-1,Math.floor(progress)),phase=progress-index;
 const a=route.points[index],b=route.points[index+1],u=phase*phase*(3-2*phase);
 return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,hop:Math.sin(Math.PI*phase)*9,done:time>=duration,duration};
}
// No hard safety snap during play: even a long blink cannot teleport the scenery.
export function cameraFollow(current,goal,dt){const step=Math.max(0,Math.min(.1,dt)),error=goal-current,distance=Math.abs(error),threshold=420/4.5,linearTime=Math.max(0,(distance-threshold)/420),remaining=step<=linearTime?distance-420*step:Math.min(distance,threshold)*Math.exp(-4.5*(step-linearTime));return goal-Math.sign(error)*remaining;}
export const abyssCameraY=playerY=>Math.max(0,playerY-290);
// Keep the miner in the clear middle of the viewport, including the bottom wall.
// The cave may leave some dark margin below it instead of pinning the miner under HUD.
export function caveCameraY(current,player,height,dt,snap=false,minimum=0){
 const focus=Math.min(290,height*.46),band=Math.min(24,height*.04);
 const goal=Math.max(minimum,Math.max(player-focus-band,Math.min(player-focus+band,current)));
 return snap?Math.max(minimum,player-focus):cameraFollow(current,goal,dt);
}
// A short contact/recoil moves only the sprite, never the camera or logical cell.
export function bumpOffset(bump){
 if(!bump)return{x:0,y:0};const t=Math.max(0,Math.min(1,bump.elapsed/.24)),wave=Math.sin(t*Math.PI*2)*(1-t)*12;
 return{x:bump.x*wave,y:bump.y*wave};
}
// A quiet central band absorbs short steps. Initial room placement alone snaps.
export function cameraAxis(current,player,size,bound,dt,snap=false){
 const max=Math.max(0,bound-size),center=size*.5,band=size*.12;
 const goal=Math.max(0,Math.min(max,Math.max(player-center-band,Math.min(player-center+band,current))));
 if(snap)return Math.max(0,Math.min(max,player-center));
 if(dt<=0)return current;
 return cameraFollow(current,goal,dt);
}
export const BASE_SIZE=Object.freeze({width:1400,height:800});
export const HOTSPOTS=REFUGE_HOTSPOTS;
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}

// Reserve the measured mineral HP label only while composing common threat marks.
// The danger tile, red telegraph, mineral and its label never move.
function clipThreatToMineralHp(c,r,x,y){
 const font=c.font,align=c.textAlign;c.font='700 7px "Trebuchet MS","Segoe UI",sans-serif';c.textAlign='center';
 const m=c.getTransform(),det=m.a*m.d-m.b*m.c;if(!Number.isFinite(det)||Math.abs(det)<1e-12){c.font=font;c.textAlign=align;return 0;}
 const a=m.d/det,b=-m.b/det,d=m.a/det,k=-m.c/det,e=(m.c*m.f-m.d*m.e)/det,f=(m.b*m.e-m.a*m.f)/det,w=c.canvas.width,h=c.canvas.height;let count=0;
 for(const n of r.room.nodes){if(n.type!=='crystal'||!Number.isFinite(n.hp)||n.hp<=0||!visible(r.room,n))continue;const p=project(n.x,n.y),nx=p.x/2,ny=p.y/2,text=String(Math.ceil(n.hp)),t=c.measureText(text),left=nx-(Number.isFinite(t.actualBoundingBoxLeft)?t.actualBoundingBoxLeft:t.width/2)-2,right=nx+(Number.isFinite(t.actualBoundingBoxRight)?t.actualBoundingBoxRight:t.width/2)+2,top=ny+11-(Number.isFinite(t.actualBoundingBoxAscent)?t.actualBoundingBoxAscent:7)-2,bottom=ny+11+(Number.isFinite(t.actualBoundingBoxDescent)?t.actualBoundingBoxDescent:2)+2;
  if(right<x-12||left>x+12||bottom<y-12||top>y+10)continue;
  c.beginPath();c.moveTo(e,f);c.lineTo(a*w+e,b*w+f);c.lineTo(a*w+k*h+e,b*w+d*h+f);c.lineTo(k*h+e,d*h+f);c.closePath();c.rect(left,top,right-left,bottom-top);c.clip('evenodd');count++;
 }
 c.font=font;c.textAlign=align;return count;
}

function label(c,text,x,y,color=P.silver,size=8){paintCrisp(c,c=>{c.font='700 '+size+"px 'Trebuchet MS','Segoe UI',sans-serif";c.textAlign='center';c.lineWidth=2;c.strokeStyle=P.ink;c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);});}
function zoneOutline(c,tiles,color){const set=new Set(tiles.map(t=>t.x+','+t.y));c.strokeStyle=color;c.lineWidth=2;c.beginPath();for(const tile of tiles){const p=project(tile.x,tile.y),x=p.x/2,y=p.y/2;for(const [dx,dy,a,b]of [[0,-1,[-12,-8],[10,-8]],[1,0,[10,-8],[12,8]],[0,1,[12,8],[-10,8]],[-1,0,[-10,8],[-12,-8]]])if(!set.has((tile.x+dx)+','+(tile.y+dy))){c.moveTo(x+a[0],y+a[1]);c.lineTo(x+b[0],y+b[1]);}}c.stroke();}

// Connected edges read as a cliff, never a pile of breakable rocks.
export function caveEdges(room,first=0,last=(room.rows||15)-1){
 const {cols,rows}=roomSize(room),edges=[];
 for(let y=Math.max(0,first);y<=Math.min(rows-1,last);y++)for(let x=0;x<cols;x++)if(isFloor(room,x,y)){
  const p=project(x,y),px=p.x/2,py=p.y/2;
  for(const [dx,dy,a,b]of [[0,-1,[-12,-8],[10,-8]],[1,0,[10,-8],[12,8]],[0,1,[12,8],[-10,8]],[-1,0,[-10,8],[-12,-8]]])
   if(!isFloor(room,x+dx,y+dy))edges.push({x,y,dy,a:[px+a[0],py+a[1]],b:[px+b[0],py+b[1]]});
 }
 return edges;
}
function paintWalls(c,room,bi,first=0,last=(room.rows||15)-1){
 const b=BIOME_ART[bi],edges=caveEdges(room,first,last);
 c.save();c.lineJoin='round';c.lineCap='round';
 // Northern cliff faces sit behind the walkable ground, with one solid shade.
 for(const e of edges)if(e.dy===-1)poly(c,[e.a,e.b,[e.b[0],e.b[1]-10],[e.a[0],e.a[1]-10]],b.shade);
 c.beginPath();for(const e of edges){c.moveTo(...e.a);c.lineTo(...e.b);}c.lineWidth=5;c.strokeStyle=b.edge;c.stroke();
 c.beginPath();for(const e of edges)if(e.dy===-1){c.moveTo(e.a[0],e.a[1]-10);c.lineTo(e.b[0],e.b[1]-10);}c.lineWidth=4;c.strokeStyle=b.rock;c.stroke();c.restore();
}
function floorCell(c,x,y,color){const p=project(x,y);poly(c,[[p.x/2-12,p.y/2-8],[p.x/2+10,p.y/2-8],[p.x/2+12,p.y/2+8],[p.x/2-10,p.y/2+8]],color);}

export class World{
 constructor(canvas){this.powerVfx=createPowerPainter(P);this.rabbitPresentation=new RabbitPresentation();this.geodePresentation=new GeodePresentation();void loadGeodeArt();void loadGeodeCrownArt();void loadBossMotion();this.canvas=canvas;canvas.addEventListener?.('gemventure-preview-capture',()=>{if(this.previewFrame){const f=this.previewFrame;this.draw(f.profile,f.time,0,f.selected,f.hover,true);}});this.ctx=canvas.getContext('2d');this.cache=document.createElement('canvas');this.cache.width=1200;this.cache.height=760;this.fx=new Effects();this.player={x:REFUGE_SPAWN.x*2,y:REFUGE_SPAWN.y*2};this.inRefuge=true;this.target={...this.player};this.camera={x:0,y:0};this.wide=false;this.trail=[];this.flash=0;this.swing=0;this.key='';this.motionPreference=matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.motionPreference.matches;this.fx.setSoft(this.reduced);this.resize();loadVillageArt();loadWallArt();void loadCaveArrivalArt();loadCavePlayerArt();this.crystalWingCache=crystalWingCache;this.crystalWingCache.load();}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=r.width*d;this.canvas.height=r.height*d;const frame=this.inRefuge?REFUGE_SIZE:BASE_SIZE;this.scale=this.wide?Math.min(r.height/620,r.width/400):Math.min(r.width/frame.width,r.height/frame.height);this.cameraDistance=getVideoPreferences().getState().distancia_camera_pct;if(!this.inRefuge)this.scale*=(this.bossZoom||1)*cameraDistanceScale(this.cameraDistance);this.viewWidth=r.width/this.scale;this.viewHeight=r.height/this.scale;this.offsetX=this.wide?0:(r.width-frame.width*this.scale)/2;this.offsetY=this.wide?0:(r.height-frame.height*this.scale)/2;this.dpr=d;}
 pointer(e){const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left-this.offsetX)/this.scale+this.camera.x,y:(e.clientY-r.top-this.offsetY)/this.scale+this.camera.y};}
 moveInRefuge(destination,station=null){
  if(!this.refugeMode)return {ok:false,reason:'not-refuge'};
  const point=station?canonicalApproach(station):destination&&{x:destination.x/2,y:destination.y/2};if(!point)return {ok:false,reason:'unknown-place'};
  this.refugeMovement??=createRefugeController(hopPose,Math.hypot(project(1,0).x-project(0,0).x,project(1,0).y-project(0,0).y)/2);
  const result=this.refugeMovement.request(this.player,point,{station,reduced:this.reduced});if(result.ok)this.target={...result.points.at(-1)};return result;
 }
 takeRefugeArrival(){return this.refugeMovement?.takeArrival()||null;}
 cancelRefugeMovement(){this.refugeMovement?.cancel();this.target={...this.player};this.trail=[];this.hop=0;}
 place(s){resetCrownPresentation();this.crownBoss=s.run?.room?.enemies?.find(crownActive)||null;this.chestOpening??=new ChestOpeningPresentation();this.chestOpening.setContext(s.run?.room);this.chestTreasure??=new ChestTreasureVfx();this.chestTreasure.setContext(s.run?.room,this.chestOpening);this.fogField?.reset();this.holeDescent??=new CaveHoleDescent();this.holeDescent.reset();releaseGeodeAmbience(this);if(this.campaignScene?.room!==s.run?.room){this.campaignScene?.dispose();this.campaignScene=null;}this.campaignFog=null;this.campaignLoading=isCampaignCave(s.run?.room)||isAbyssCave(s.run?.room);this.attackReadability??=new AttackReadability();this.attackReadability.clear();this.petFollower?.reset();this.petFollowerPose=null;this.petRouteSinceFrame=null;this.rabbitImpact=null;this.rabbitPresentation??=new RabbitPresentation();this.rabbitPresentation.place(s);this.geodePresentation??=new GeodePresentation();this.geodePresentation.reset();this.geodePresentation.capture(s.run,s.attempts,s.seed);this.caveToolTier=pickaxeTier(s.level);prepareCavePlayerTier(this.caveToolTier);this.crystalWingFrame=null;this.crystalWingEntryAt=null;this.crystalWingPendingEntry=false;this.crystalWingDeadline=null;this.crystalWingLanding=false;this.refugeMode=!s.run;this.refugeMovement=null;this.refugeFacing=new RefugeFacing();this.cavePlayer??=new CavePlayerPresentation();this.cavePlayer.reset(caveActionContext(s));this.cavePicture=null;this.player=s.run?project(s.run.player.x,s.run.player.y):{x:REFUGE_SPAWN.x*2,y:REFUGE_SPAWN.y*2};this.target={...this.player};this.hop=0;this.bump=null;this.fx.clear();this.comboRewardMemory={};this.discoContext=null;this.discoBeat=null;this.route=null;this.trail=[];this.key='';this.cameraReset=true;this.fogVisible=null;this.creaturePos=new Map();if(s.run)void prepareDungeonCreatures(biomeIndex(s.run.floor));}
 background(){const c=this.cache.getContext('2d');c.setTransform(2,0,0,2,0,0);c.fillStyle=P.ink;c.fillRect(0,0,this.cache.width/2,this.cache.height/2);return c;}
 base(){this.cache.width=REFUGE_SIZE.width;this.cache.height=REFUGE_SIZE.height;const c=this.background();paintFlowVillage(c);}

 cave(s){releaseGeodeAmbience(this);if(isAbyss(s.run)&&isAbyssCave(s.run.room)){if(this.campaignScene?.room===s.run.room&&this.campaignScene.biome===biomeIndex(s.run.floor))return;this.campaignScene?.dispose();this.campaignScene=createAbyssScene(s.run,biomeIndex(s.run.floor));this.cache.width=this.cache.height=1;return;}if(isCampaignCave(s.run.room)){if(this.campaignScene?.room!==s.run.room)this.campaignScene?.dispose();this.campaignScene=campaignCaveScene(s.run.room,biomeIndex(s.run.floor));this.cache.width=1;this.cache.height=1;return;}this.campaignScene?.dispose();this.campaignScene=null;this.campaignLoading=false;const {cols,rows}=roomSize(s.run.room);const width=cols>21?2400:1200,height=rows>15?1520:760;if(this.cache.width!==width)this.cache.width=width;if(this.cache.height!==height)this.cache.height=height;const c=this.background(),run=s.run,bi=biomeIndex(run.floor),b=BIOME_ART[bi],r=rng(run.room.seed),pt=(x,y)=>{const q=project(x,y);return[q.x/2,q.y/2]};
  if(isAbyss(run))return;
  const scenery=caveBiomeProfile(bi)&&(bi===0||usesWallArt(run.room,bi))&&!run.room.bossFloor?buildCaveScenery(run.room,{biome:bi}):null;
  const ground=new Path2D();
  for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(isFloor(run.room,x,y)){const [px,py]=pt(x,y);ground.moveTo(px-12,py-8);ground.lineTo(px+10,py-8);ground.lineTo(px+12,py+8);ground.lineTo(px-10,py+8);ground.closePath();}
  c.fillStyle=DUNGEON_MATERIALS[bi].floor;c.fill(ground);
  // Sparse, clipped patches keep the route quieter than rewards and creatures.
  c.save();c.clip(ground);
  if(scenery){paintCaveScenery(c,scenery,{projectPoint:pt});paintCaveFloorSurface(c,run.room,bi);}
  else for(let i=0;i<(cols>21?32:8);i++){const [x,y]=pt(2+Math.floor(r()*(cols-4)),2+Math.floor(r()*(rows-4)));c.globalAlpha=.26;ellipse(c,x,y,14+r()*14,5+r()*6,b.patch);}c.globalAlpha=1;
  c.restore();
  if(run.room.bossFloor)paintBossArena(c,run.room,bi,ground);
  if(!paintCaveArrival(c,run,ground)){const [x,y]=pt(run.room.exit?.x||18,run.room.exit?.y||2);drawAsset(c,'lift',x,y+5,49,{variant:run.room.cleared?1:0});}
 }

 // Only visible streamed rows are painted. Absolute row seeds keep the same
 // decoration attached to each world cell when its local coordinates change.
 abyssFloor(c,r){
  if(this.campaignScene&&isAbyssCave(r.room))return;
  const bi=biomeIndex(r.floor),b=BIOME_ART[bi],{cols,rows}=r.room;
  const first=Math.max(1,Math.floor((this.camera.y-160)/32)),last=Math.min(rows-2,Math.ceil((this.camera.y+this.viewHeight-80)/32));
  for(let y=first;y<=last;y++)for(let x=0;x<cols;x++){
   if(!isFloor(r.room,x,y))continue;const p=project(x,y);if(p.x<this.camera.x-60||p.x>this.camera.x+this.viewWidth+60)continue;
   floorCell(c,x,y,b.floor);const px=p.x/2,py=p.y/2,row=y+r.abyss.rows,type=terrainAt(r.room,{x,y});
   if(type){floorCell(c,x,y,type===1?P.deepBlue:type===2?P.clay:type===4?P.plum:type===5?P.bark:type===6?P.wood:P.rust);if((row+x)%4===0){c.strokeStyle=type===1?P.cyan:type===2?P.sand:type===4?P.pink:type===5?P.ochre:type===6?P.lime:P.orange;c.lineWidth=1;c.beginPath();c.moveTo(px-5,py);c.quadraticCurveTo(px,py+2,px+5,py);c.stroke();}}
   else if((row*41+x*13)%23===0){c.globalAlpha=.22;ellipse(c,px,py,10,4,b.patch);c.globalAlpha=1;}
  }
  paintWalls(c,r.room,bi,first,last);
 }

 // Enemy movement settles between beats; logic and attack markers keep their exact cells.
 actorPosition(n,dt){
  const goal=project(n.x,n.y),attackTravel=this.attackReadability?.travel(n);if(attackTravel)return attackTravel;if(n.type!=='enemy'||n.boss||n.id==null)return goal;
  this.creaturePos??=new Map();let p=this.creaturePos.get(n.id);
  if(!p||Math.hypot(goal.x-p.x,goal.y-p.y)>100){p={...goal};this.creaturePos.set(n.id,p);}
  const targetKey=n.x+':'+n.y;if(p.targetKey!==targetKey){p.direction=caveFacingFromWorld(p,goal,p.direction||'down');p.targetKey=targetKey;p.moveAt=this.ambientAge||0;}
  p.motionProgress=Math.min(1,Math.max(0,((this.ambientAge||0)-(p.moveAt||0))/.28));p.moving=p.motionProgress<1;
  const u=this.reduced?1:1-Math.exp(-Math.max(0,dt)*22);p.x+=(goal.x-p.x)*u;p.y+=(goal.y-p.y)*u;return p;
 }
 // Static foundations, independently animated accents; no time in sprite-cache keys.
 ambientAsset(c,type,x,y,width,time,options={}){
  const pivots=ART_ACCENT_PIVOTS;
  const roulettePointer=()=>{if(type!=='roulette')return;poly(c,[[x-width*.085,y-width*.97],[x+width*.085,y-width*.97],[x,y-width*.79]],P.red);c.strokeStyle=P.ink;c.lineWidth=2;c.stroke();};
  if(!pivots[type]||this.reduced){drawAsset(c,type,x,y,width,options);roulettePointer();return;}
  const [px,py]=pivots[type],scale=width/100,pivotX=x+(px-50)*scale,pivotY=y+(py-96)*scale;
  drawAsset(c,type,x,y,width,{...options,layer:'base'});
  c.save();c.translate(pivotX,pivotY);
  if(type==='well')c.translate(0,Math.sin(time*1.3)*3);
  if(type==='tree')c.rotate(Math.sin(time*.7)*.013);
  if(type==='shrine'){const phase=time%12,turn=phase>9?(phase-9)/3:0;c.scale(turn?Math.cos(turn*Math.PI*2):1,1);c.translate(0,Math.sin(time*.9)*1.2);}
  if(type==='forge')c.scale(1+Math.sin(time*2.3)*.035,1+Math.sin(time*3)*.05);
  if(type==='zag'){const gesture=time%10>7?Math.sin((time%10-7)*Math.PI*2/3):0;c.rotate(gesture*.24);}
  if(type==='gramophone')c.rotate(Math.sin(time*1.2)*.08);
  if(type==='roulette'){const phase=time%12,u=Math.max(0,Math.min(1,(phase-7.5)/1.35));c.rotate((u*u*(3-2*u))*Math.PI*4);}
  if(type==='hedgehog')c.translate(0,-Math.max(0,Math.sin((options.beat||0)*Math.PI*2))*2);
  c.translate(-pivotX,-pivotY);drawAsset(c,type,x,y,width,{...options,layer:'accent'});c.restore();roulettePointer();
  if(type==='well'||type==='shrine'){
   const color=type==='well'?P.cyan:P.lemon;
   for(let i=0;i<3;i++){const f=(time*.19+i/3)%1;c.globalAlpha=Math.sin(f*Math.PI)*.65;ellipse(c,x+(i-1)*width*.23,y-width*(.25+f*.6),1.3,1.3,color);}c.globalAlpha=1;
  }
 }
 ceilingWarnings(c,r,time){
  const phase=sceneBeatPhase(r,time),bi=biomeIndex(r.floor);
  for(const fall of r.room.ceiling?.falls||[]){
   if(!visible(r.room,fall))continue;const p=project(fall.x,fall.y),x=p.x/2,y=p.y/2,remaining=Math.max(0,fall.due-phase);
   c.save();c.strokeStyle=P.lemon;c.fillStyle=P.ink;c.lineWidth=2;c.beginPath();c.ellipse(x,y,16,9,0,0,Math.PI*2);c.fill();c.stroke();
   for(let i=0;i<3;i++){c.fillStyle=remaining>i?P.lemon:P.slate;c.beginPath();c.arc(x+(i-1)*7,y-1,2.1,0,Math.PI*2);c.fill();}
   if(!this.reduced&&remaining<.65){const u=1-remaining/.65;drawAsset(c,'rock',x,y-(1-u*u)*70,35,{seed:fall.x*71+fall.y,variant:2,biome:bi});}
   else{c.strokeStyle=P.sand;c.lineWidth=1;for(let i=0;i<3;i++){const f=(phase*.8+i/3)%1;c.globalAlpha=.25+f*.5;c.beginPath();c.moveTo(x+(i-1)*8,y-18-f*16);c.lineTo(x+(i-1)*8,y-15-f*16);c.stroke();}}
   c.restore();
  }
 }
 setSoft(value){this.reduced=value;this.fx.setSoft(value);this.trail=[];this.bump=null;}
 get holeDescentPending(){return !!this.holeDescent?.pending;}
 beginHoleDescent(run){this.holeDescent??=new CaveHoleDescent();return this.holeDescent.begin(run,project);}
 takeHoleDescentCompletion(){return this.holeDescent?.takeCompletion()||false;}
 consume(events){acceptCrownEvents(events,this.crownBoss,this.geodeVisualBeat||0);this.chestOpening?.accept(events,this.ambientAge||0);this.chestTreasure?.accept(events,this.ambientAge||0);const treasureCoordinates=this.chestTreasure?.acceptedCoordinates(events,this.ambientAge||0);const attackPlan=this.attackReadability?.accept(events);const rabbitPlan=this.rabbitPresentation?.queue(events)||null;this.geodePresentation?.accept(events,this.ambientAge||0);this.cavePlayer??=new CavePlayerPresentation();this.fx.consume(attackPlan?.events||events,project,this.target,rabbitPlan,{treasureCoordinates});if(attackPlan)this.fx.shake=Math.max(this.fx.shake,attackPlan.shake);for(const e of events){if(e.type==='boost'&&e.id==='wings')this.crystalWingPendingEntry=true;if(e.type==='scroll'){this.petFollower?.shift(-4,-32);for(const p of [this.player,this.target,...(this.route?.points||[]),...this.trail,...(this.creaturePos?.values()||[]),...(this.camera?[this.camera]:[])]){p.x-=4;p.y-=32;}}if(e.type==='bump'){const dx=e.dx*44+e.dy*4,dy=e.dy*32,length=Math.hypot(dx,dy)||1;this.bump=this.reduced?null:{x:dx/length,y:dy/length,elapsed:0};}if(e.type==='knockback')this.recoil(e);if(e.type==='dash'){this.target=project(e.to.x,e.to.y);if(e.path?.length){this.bump=null;const points=[{...this.player},...e.path.map(p=>project(p.x,p.y))];this.route={points,elapsed:0,sample:0,length:points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)};this.petRouteSinceFrame=points;this.cavePlayer.onRoute(this.route,e.actionId);if(this.reduced){for(let d=0;d<this.route.length;d+=20)this.trail.push({...dashPoint(this.route,d/this.route.length),life:.32});this.trail=this.trail.slice(-24);this.player={...this.target};this.route=null;this.hop=0;}}}if(e.type==='carrotSlam'&&!rabbitPlan?.full.has(e))this.rabbitImpact={direction:e.direction,age:0};if(e.type==='hurt'&&e.reason==='attack')this.flash=.6;}this.cavePlayer.accept(events,this.route);}
 recoil(e){
  if(e.path?.length)this.petRouteSinceFrame=[{...this.player},...e.path.map(p=>project(p.x,p.y))];
  this.target=project(e.to.x,e.to.y);this.route=null;this.hop=0;this.bump=null;
  if(this.reduced){this.player={...this.target};return;}
  if(!e.path?.length){this.bump={x:e.dx,y:e.dy,elapsed:0};return;}
  const points=[{...this.player},...e.path.map(p=>project(p.x,p.y))];
  this.route={points,elapsed:0,sample:0,length:points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)};
 }
 advanceMovement(dt,paused=false){
  if(this.refugeMode){if(!this.refugeMovement)return;const travel=this.refugeMovement.travel,from={...this.player},pose=this.refugeMovement.advance(dt,{paused,reduced:this.reduced});if(pose){this.refugeFacing??=new RefugeFacing();this.refugeFacing.observe(travel,from,pose,this.refugeMovement.trail);this.player={x:pose.x,y:pose.y};this.hop=pose.hop;}this.trail=this.refugeMovement.trail;return;}
  if(paused)return;dt=Math.max(0,dt);
  if(this.bump){this.bump.elapsed+=dt;if(this.bump.elapsed>=.24)this.bump=null;}
  for(const tr of this.trail)tr.life-=dt;this.trail=this.trail.filter(tr=>tr.life>0);
  if(this.route){const route=this.route;route.elapsed+=dt;const pose=hopPose(route,route.elapsed),duration=pose.duration;
   // Fixed-time samples keep the same afterimages at low and high frame rates.
   while(route.sample*.032<Math.min(route.elapsed,duration)){const time=route.sample++*.032,life=.22-(route.elapsed-time),p=hopPose(route,time);if(life>0)this.trail.push({x:p.x,y:p.y,hop:p.hop,life});}
   this.player={x:pose.x,y:pose.y};this.hop=pose.hop;if(pose.done){this.route=null;this.hop=0;}
  }else{this.hop=0;const speed=this.reduced?1:1-Math.exp(-dt*16);this.player.x+=(this.target.x-this.player.x)*speed;this.player.y+=(this.target.y-this.player.y)*speed;}
  this.trail=this.trail.slice(-24);
 }
 drawTrail(c){if(this.holeDescent?.falling)return;c.save();for(const tr of this.trail){const fade=Math.max(0,tr.life/.32),x=tr.x/2,y=tr.y/2;
  if(!this.reduced){c.globalAlpha=fade*.3;if(this.refugeMode){if(!drawRefugePlayer(c,tr.x/2,(tr.y-(tr.hop||0))/2,this.refugeFacing?.trailView(tr)||'front-left'))flowSprite(c,'miner',tr.x/2,(tr.y-(tr.hop||0))/2,31);}else this.miner(c,tr.x,tr.y-(tr.hop||0),this.cavePlayer?.trailPicture(tr));}
  c.globalAlpha=fade*(this.reduced?.28:.65);ellipse(c,x,y+1,9,3,P.blue);ellipse(c,x,y,5,1.5,P.cyan);
 }c.restore();}
 miner(c,x,y,picture=this.cavePicture,layer="all",fixedGroundShadow=false){x/=2;y/=2;if(drawCavePlayer(c,x,y,picture,layer,{drawGroundShadow:!fixedGroundShadow}))return;if(layer==="front")return;drawAsset(c,'miner',x,y,31,{variant:picture?.armorTier??this.armorTier??0,omitGroundShadow:fixedGroundShadow});c.save();c.translate(x+10,y-9);c.rotate(-.3-(picture?.legacySwing||0));drawAsset(c,'pickaxe',1,6,picture?.toolWidth||(this.giant?39:21),{variant:picture?.pickTier??this.pickTier??0});c.restore();}
 health(c,s){const offset=bumpOffset(this.bump),hp=s.run.health,max=maxHealth(s),ratio=Math.max(0,Math.min(1,hp/max)),x=(this.player.x+offset.x)/2,y=(this.player.y+offset.y)/2+10,color=ratio<=.3?P.pink:ratio<=.6?P.lemon:P.lime;
  c.fillStyle=P.ink;c.fillRect(x-14,y,28,3);c.fillStyle=ratio<=.3?P.red:ratio<=.6?P.lemon:P.green;c.fillRect(x-13,y+1,26*ratio,1);
 }
 draw(s,time,dt,selected,hover,paused){
  this.previewFrame={profile:s,time,selected,hover};if(this.canvas.dataset)this.canvas.dataset.gvSceneReady='false';
  this.bossHelpEnabled=getBossHelpPreferences().getState().enabled;
  if(this.cameraDistance!==getVideoPreferences().getState().distancia_camera_pct)this.resize();
  if(!s.run&&this.lobbyEnabled){releaseGeodeAmbience(this);
   if(!this.inRefuge||this.wide){this.inRefuge=true;this.wide=false;this.resize();}
   if(this.mysticFireOwned){mysticFire.dispose();this.mysticFireOwned=false;}this.refugeMode=true;this.refugePaintTime=time;this.refugeNoteCount=0;
   const c=this.ctx;beginCrispFrame(c);c.setTransform(this.dpr,0,0,this.dpr,0,0);
   this.lobbyScene??=new RefugeLobbyScene();this.lobbyScene.draw(c,s,this.canvas.width/this.dpr,this.canvas.height/this.dpr,dt,{paused:document.hidden||!!document.getElementById('dialog')?.open,reduced:this.reduced||this.motionPreference.matches});
   // The lobby uses clean native pixels; cave lighting/finish remain unchanged.
   flushCrispFrame(c);if(this.canvas.dataset)this.canvas.dataset.gvSceneReady='true';return;
  }
  const hasMysticFire=!!s.run?.room.enemies.some(b=>mysticActive(b)&&b.hp>0);if(this.mysticFireOwned&&!hasMysticFire)mysticFire.dispose();this.mysticFireOwned=hasMysticFire;
  let gramophoneNoteCount=0;this.geodePresentation??=new GeodePresentation();this.geodePresentation.capture(s.run,s.attempts,s.seed);loadApprovedArt();void loadHedgehogArt();this.giant=activeBoost(s.run,'giant');this.pickTier=pickaxeTier(s.level);if(s.run&&this.caveToolTier!==this.pickTier){this.caveToolTier=this.pickTier;prepareCavePlayerTier(this.pickTier);}this.armorTier=Math.min(3,Math.ceil((s.forge?.levels?.armor||0)/34));const key=s.run?[s.attempts,s.run.floor,s.run.room.seed,s.run.room.cleared,wallArtRevision(),approvedArtRevision(),caveArrivalArtRevision()].join('-'):'base';if(key!==this.key){this.key=key;this.creaturePos=new Map();s.run?this.cave(s):this.base();}
  this.refugeMode=!s.run;if(s.run)this.target=project(s.run.player.x,s.run.player.y);
  const previousRefugeTravel=this.refugeMovement?.travel,previousCaveRoute=this.route;this.advanceMovement(dt,paused);if(s.run){this.cavePlayer??=new CavePlayerPresentation();this.cavePicture=this.cavePlayer.sample(s,time,{paused,route:this.route,previousRoute:previousCaveRoute,trail:this.trail,sampleHop:hopPose,soft:this.reduced,pickTier:this.pickTier,armorTier:this.armorTier,giant:this.giant,assetsReady:cavePlayerArtStatus().bodyReady,toolStatus:cavePlayerToolStatus(this.pickTier)});this.cavePicture={...this.cavePicture,outfitKey:minerOutfitKey(s)};}
  if(this.inRefuge!==!s.run){this.inRefuge=!s.run;this.resize();}
  const zoom=expandedBossArena(s.run?.room)?BOSS_ARENA_SPACE.zoom:1;if(this.bossZoom!==zoom){this.bossZoom=zoom;this.resize();}const wide=!!s.run&&!s.run.room.bossFloor&&roomSize(s.run.room).cols>21;if(this.wide!==wide){this.wide=wide;this.resize();this.cameraReset=true;}if(wide){const dim=roomSize(s.run.room),bounds=project(dim.cols,dim.rows),step=paused?0:dt,abyss=isAbyss(s.run);this.camera={x:cameraAxis(this.camera.x,this.player.x,this.viewWidth,bounds.x,step,this.cameraReset),y:abyss?(this.cameraReset?abyssCameraY(this.player.y):cameraFollow(this.camera.y,abyssCameraY(this.player.y),step)):caveCameraY(this.camera.y,this.player.y,this.viewHeight,step,this.cameraReset,(s.run.room.hedgehog?.y??8)<6?-150:0)};}else this.camera=isCampaignCave(s.run?.room)?{x:(expandedBossArena(s.run.room)?bossArenaCamera(s.run.room).x:568)-BASE_SIZE.width/2,y:(expandedBossArena(s.run.room)?bossArenaCamera(s.run.room).y:s.run.room.bossFloor?360:164)-BASE_SIZE.height/2}:{x:0,y:0};this.cameraReset=false;
  if(this.campaignScene){const view={width:this.viewWidth/2,height:this.viewHeight/2,zoom:1,center:[this.camera.x/2+this.viewWidth/4,this.camera.y/2+this.viewHeight/4]},target=s.run.player,py=(this.player.y-115)/32,px=(this.player.x-100-py*4)/44;this.campaignLoading=!this.campaignScene.prepare(view,this.player,{x:Math.sign(target.x-px),y:Math.sign(target.y-py)});if(this.campaignLoading){const loading=this.ctx;loading.setTransform(this.dpr,0,0,this.dpr,0,0);loading.fillStyle='#111624';loading.fillRect(0,0,this.canvas.width/this.dpr,this.canvas.height/this.dpr);loading.fillStyle='#d8e4e3';loading.font='18px Segoe UI';loading.textAlign='center';loading.fillText(this.campaignScene.error?'NÃO FOI POSSÍVEL CARREGAR A CAVERNA':'PREPARANDO CAVERNA…',this.canvas.width/this.dpr/2,this.canvas.height/this.dpr/2);loading.textAlign='left';return;}}
  this.holeDescent?.step(dt,{moving:!!this.route||Math.hypot(this.player.x-this.target.x,this.player.y-this.target.y)>.8,paused:paused||document.hidden,soft:this.reduced||!!this.motionPreference?.matches});
  syncGeodeAmbience(this,{run:s.run})?.beginFrame?.();
  const c=this.ctx,crispReady=beginCrispFrame(c);c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle=s.run?P.ink:P.blue;c.fillRect(0,0,this.canvas.width/this.dpr,this.canvas.height/this.dpr);c.translate(this.offsetX,this.offsetY);c.scale(this.scale*2,this.scale*2);c.imageSmoothingEnabled=true;c.translate(-this.camera.x/2,-this.camera.y/2);
  this.fx.update(paused||document.hidden?0:dt);if(!this.reduced&&!paused){const shake=this.fx.shake*(this.route?.1:.25);c.translate(Math.sin(this.fx.age*87)*shake,Math.cos(this.fx.age*103)*shake*.6);}c.drawImage(this.cache,0,0,this.cache.width/2,this.cache.height/2);if(isAbyss(s.run))this.abyssFloor(c,s.run);const ambientHidden=typeof document!=='undefined'&&!!document.hidden;this.ambientAge=(this.ambientAge||0)+(paused||ambientHidden?0:Math.max(0,Math.min(dt,.05)));const t=this.ambientAge;this.rabbitPresentation?.beginFrame(s,{time:t,musicTime:time,visualBeat:s.run?sceneBeatPhase(s.run,time):0,beatTime:b=>sceneBeatTime(s.run,b),project,soft:this.reduced||!!this.motionPreference?.matches,paused:paused||ambientHidden});if(s.run)this.attackReadability?.sync(s,{project,visualBeat:sceneBeatPhase(s.run,time),time:t,paused:paused||ambientHidden,soft:this.reduced||!!this.motionPreference?.matches});

  this.petFollower??=new PetFollower();
  const petRoom=s.run?.room,petScene=s.run?'run:'+s.seed+':'+s.attempts+':'+s.run.floor+':'+petRoom.seed:'refuge:'+s.seed;
  const petCanStand=p=>{if(!petRoom)return this.refugeMovement?.nav.safe({x:p.x/2,y:p.y/2})??false;const tile=unproject(p.x,p.y);return isFloor(petRoom,tile.x,tile.y)&&!petRoom.rocks.some(n=>n.hp>0&&n.x===tile.x&&n.y===tile.y);};
  this.petFollowerPose=this.petFollower.sample({id:equippedPet(s)?.id,scene:petScene,player:this.player,route:previousRefugeTravel?.points||this.petRouteSinceFrame||previousCaveRoute?.points,dt,paused:paused||ambientHidden,reduced:this.reduced||!!this.motionPreference?.matches,canStand:petCanStand});this.petRouteSinceFrame=null;
  if(!s.run){this.refugeMotion??=createMotionPolicy();this.refugePose=this.refugeMotion.sample({time:t,activeId:this.villageHover,paused,hidden:ambientHidden,soft:this.reduced,reduced:!!this.motionPreference?.matches,playback:this.refugePlayback,audioState:this.refugeAudioState});this.refugeCloudCache??=createCloudCache(()=>document.createElement('canvas'));this.refugeCloudPoses=cloudPoses({time:t,soft:this.reduced,reduced:!!this.motionPreference?.matches,guards:refugeCloudGuards({x:this.player.x/2,y:(this.player.y-(this.hop||0))/2})});}
  if(!s.run){const still=this.reduced||!!this.motionPreference?.matches;c.save();clipRefugeBank(c,REFUGE_SHORE);paintRefugeWater(c,{time:t,reduced:still,paused,shorePath:REFUGE_SHORE,background:false});c.restore();paintRefugeLight(c,{time:t,reduced:still,paused,anchors:REFUGE_LIGHTS});}
  if(s.run){const context=s.attempts+':'+s.run.floor+':'+s.run.room.seed;if(this.discoContext!==context)this.comboRewardMemory={};this.comboRewardMemory??={};if(this.discoContext!==context||this.discoBeat==null||!paused&&!ambientHidden)this.discoBeat=sceneBeatPhase(s.run,time);this.discoContext=context;this.comboDisco=sampleComboDisco({memory:this.comboRewardMemory,combo:s.run.combo,seed:s.run.room.seed,player:this.player,beat:this.discoBeat,soft:this.reduced||!!this.motionPreference?.matches,cleared:s.run.room.cleared});}else{this.comboDisco=null;this.discoContext=null;this.discoBeat=null;this.comboRewardMemory=null;}
  if(s.run&&!this.campaignScene)paintDungeonEnvironment(c,s.run.room,biomeIndex(s.run.floor),t,{soft:this.reduced||!!this.motionPreference?.matches,viewport:{x:this.camera.x/2,y:this.camera.y/2,w:this.viewWidth/2,h:this.viewHeight/2}});
  if(s.run){const bi=biomeIndex(s.run.floor);if(this.campaignScene){this.campaignScene.paintGround(c,t,this.reduced||!!this.motionPreference?.matches);paintCaveArrival(c,s.run,this.campaignScene.arrivalGround);if(this.comboDisco)paintComboDiscoFloor(c,this.comboDisco,s.run.room,campaignDiscoGround(s.run.room,this.player));}else{paintCaveWallShadows(c,s.run.room,bi);paintCaveMist(c,s.run.room,bi,t,{soft:this.reduced||!!this.motionPreference?.matches});paintComboDiscoFloor(c,this.comboDisco,s.run.room);}}
  this.drawTrail(c);
  // Raster blooms sit below actors; attack outlines and health remain above.
  this.fx.sprites.draw(c);this.fx.drawFireFloor(c);if(s.run)this.drawPowerVfx(c,s.run,time,'floor');this.fx.minions.draw(c);
  if(s.run){const r=s.run,bi=biomeIndex(r.floor);this.fx.minions.setContext(bi,this.reduced);this.geodeVisualBeat=this.fx.geodeWarningBeat(sceneBeatPhase(r,time),paused||ambientHidden);const geodeSoft=this.reduced||!!this.motionPreference?.matches;this.fx.drawGeodeFloor(c,{soft:geodeSoft});
   this.rabbitPresentation?.drawFloor(c);
   this.attackReadability?.floor(c);


   for(const boss of r.room.enemies.filter(e=>e.bossIndex===4&&e.hp>0&&!micelialActive(e))){for(const tile of boss.spiralTiles||[]){const p=project(tile.x,tile.y);drawAsset(c,'rock',p.x/2,p.y/2,24,{seed:tile.x*31+tile.y,biome:4});}const p=project(boss.x,boss.y);label(c,boss.spiralDirection===-1?'↶':'↻',p.x/2,p.y/2-66,P.lemon,26);}
   if(r.room.bossFloor&&bi===6){for(const n of r.room.enemies.filter(e=>e.boss||e.rabbitChild!==undefined)){if(approvedArtAvailable(n.boss?'boss':'rabbit',{variant:n.boss?6:0,biome:6}))continue;const p=project(n.x,n.y),x=p.x/2,y=p.y/2;ellipse(c,x,y-1,n.boss?43:22,n.boss?19:10,P.wood);ellipse(c,x,y-3,n.boss?34:16,n.boss?13:7,P.ink);c.strokeStyle=n.boss?P.orange:P.lime;c.lineWidth=2;c.beginPath();c.ellipse(x,y-2,n.boss?43:22,n.boss?19:10,0,0,Math.PI*2);c.stroke();}}
   // Burrow shares the depth queue: after its host wall, before approaching actors.
   const liveActorIds=new Set(r.room.enemies.filter(n=>n.hp>0).map(n=>n.id));for(const id of this.creaturePos.keys())if(!liveActorIds.has(id))this.creaturePos.delete(id);
   const onScreen=n=>{if(n.hp!=null&&n.hp<=0||!crestVisible(r.room,n,sceneEntityVisible))return false;const p=project(n.x,n.y);return p.x>=this.camera.x-150&&p.x<=this.camera.x+this.viewWidth+150&&p.y>=this.camera.y-40&&p.y<=this.camera.y+this.viewHeight+180;};
   const phase=sceneBeatPhase(r,time),pillars=densifyWaveCrests(r.room.enemies.filter(e=>e.bossIndex===0&&e.hp>0).flatMap(e=>(crownActive(e)?wavePillars(r.room,e,phase):e.geodePillars||[]).filter(p=>phase<=p.until).map(p=>({...p,type:'geodePillar'}))));
   const petPose=this.petFollowerPose,petTile=petPose&&unproject(petPose.x,petPose.y),petHidden=petTile&&r.room.enemies.some(e=>e.hp>0&&e.windup&&dangerTiles(e.windup).some(tile=>tile.x===petTile.x&&tile.y===petTile.y));
   const petEntity=petPose?.alpha>0&&!petHidden?[{type:'companion',x:petTile.x,y:petTile.y,visualDepth:(petPose.y-115)/32}]:[];
   const walls=this.campaignScene?this.campaignScene.walls():!isAbyss(r)&&r.room.floorMask?occludingWallPlan(r.room):[];
   for(const b of r.room.enemies)if(rootActive(b)&&b.hp>0)paintVineGround(c,b,r,phase,project,this.reduced,this.player);
   for(const b of r.room.enemies)if(micelialActive(b)&&b.hp>0)paintMicelialGround(c,b,phase,project,this.reduced||!!this.motionPreference?.matches);
   for(const b of r.room.enemies)if(mysticActive(b)&&b.hp>0){paintMysticGround(c,b,phase,project,this.reduced||!!this.motionPreference?.matches,{showFire:false,showBeam:false});paintMysticBeamWarning(c,b,phase,project,this.reduced||!!this.motionPreference?.matches);mysticFire.floor(c,b,phase,project,this.reduced||!!this.motionPreference?.matches);}
   for(const b of r.room.enemies)if(crownActive(b)&&b.hp>0)paintCrownGround(c,b,this.geodeVisualBeat,geodeSoft);paintCrownGhost(c,this.geodeVisualBeat,geodeSoft);
   const entities=[...mysticTargets(r.room),...r.room.enemies.filter(mysticActive).flatMap(b=>mysticFire.entities(b,phase,this.reduced||!!this.motionPreference?.matches)),...ambientDecorations(this),...caveFindEntities(r),...caveZagEntity(r),...walls,...rootSceneEntities(r.room,phase).filter(onScreen),...(this.campaignScene?.props||[]),...(sceneryBurrowVisible(r.room)?[{type:'burrow',x:r.room.hedgehog.x,y:r.room.hedgehog.y,visualDepth:r.room.hedgehog.y+.99}]:[]),...petEntity,...pillars.filter(onScreen),...r.room.rocks.filter(onScreen).map(n=>({...n,type:'rock'})),...r.room.nodes.filter(onScreen),...r.room.enemies.filter(onScreen),{type:'player',x:0,y:(this.player.y-115)/32}].sort((a,b)=>(a.visualDepth??a.y)-(b.visualDepth??b.y));
   const frontTarget=caveFrontTarget(entities.filter(n=>!['wall','campaignWall','campaignPillar','wallPyre','sapArc','sapPresentation','summonBush','mysticFire'].includes(n.type)),this.player,this.cavePicture,project),playerOffset=bumpOffset(this.bump),previousWingActive=this.crystalWingFrame?.active===true,wingActive=activeBoost(r,'wings'),wingDeadline=r.frenzy?.buffs?.wings??null;
   if(this.crystalWingPendingEntry&&wingActive&&(this.crystalWingDeadline!==wingDeadline||!previousWingActive))this.crystalWingEntryAt=t;
   this.crystalWingPendingEntry=false;this.crystalWingDeadline=wingDeadline;if(!wingActive)this.crystalWingEntryAt=null;
   const wingFrame=this.crystalWingFrame=sampleCrystalWingFrame({run:r,activeBoost,player:this.player,hopWorld:this.hop||0,bumpWorld:playerOffset,visualBeat:sceneBeatPhase(r,t),reduced:this.reduced||!!this.motionPreference?.matches,appearanceAgeSeconds:this.crystalWingEntryAt==null?null:Math.max(0,t-this.crystalWingEntryAt)}),playerDraw=wingFrame.bodyWorld;
   this.crystalWingReadyAtFrame=this.crystalWingCache.status().ready;
   this.crystalWingPaintBounds=wingFrame.wings?{left:playerDraw.x/2+WING_ENVELOPE.left,top:playerDraw.y/2+WING_ENVELOPE.top,right:playerDraw.x/2+WING_ENVELOPE.right,bottom:playerDraw.y/2+WING_ENVELOPE.bottom}:null;
   if(previousWingActive&&!wingFrame.active)this.crystalWingLanding=true;if(!this.route&&!this.bump&&!wingFrame.active)this.crystalWingLanding=false;
   const fixedGroundShadow=!!(wingFrame.active||this.crystalWingLanding)&&!!(this.cavePicture?.native?drawCavePlayer.supportsGroundShadowControl:drawAsset.supportsGroundShadowControl);
   for(const n of entities){if(n.type==='mysticFire'){mysticFire.actor(c,n,phase,project,this.reduced||!!this.motionPreference?.matches,this.player);continue;}if(n.type==='mysticCopy'){paintMysticCombat(c,n,r.room.enemies.find(b=>b.id===n.owner),phase,project,this.reduced||!!this.motionPreference?.matches,{showBeam:false});continue;}if(n.type==='wallPyre'){paintAmbientDecoration(this,c,n);continue;}if(n.type==='campaignWall'){this.campaignScene.paintWall(c,n,this.player);if(this.comboDisco)this.campaignScene.paintDisco(c,n,this.player,(c,f)=>paintComboDiscoWall(c,this.comboDisco,f,wallOcclusion(f,this.player)));continue;}if(n.type==='campaignPillar'){this.campaignScene.paintPillar(c,n,this.player,{time:t,soft:this.reduced||!!this.motionPreference?.matches});continue;}if(n.type==='burrow'){this.hedgehogBurrow(c,r,time);continue;}if(n.type==='wall'){paintOccludingWall(c,n,bi,this.player);paintComboDiscoWall(c,this.comboDisco,n,wallOcclusion(n,this.player));continue;}if(!sceneEntityVisible(r.room,n))continue;if(isCaveFind(n)){paintCaveFind(c,n,project,{opening:this.chestOpening?.sample(n,{age:t,soft:this.reduced||!!this.motionPreference?.matches})});this.chestTreasure?.paintActor(c,n,{age:t,soft:this.reduced||!!this.motionPreference?.matches,project});continue;}if(n.type==='caveZag'){paintCaveZag(c,r,phase,{soft:this.reduced||!!this.motionPreference?.matches});continue;}if(n.type==='companion'){paintPetFollower(c,this.petFollowerPose,{time:t});continue;}if(n.type==='sapArc'){paintSapArc(c,n,phase);continue;}if(n.type==='sapPresentation'){const v=project(n.x,n.y);paintSapRoot(c,n.feed,v.x/2,v.y/2,phase,this.reduced,b=>sceneBeatTime(r,b));continue;}if(n.type==='summonBush'){const v=project(n.x,n.y);paintSummonBush(c,n,v.x/2,v.y/2,phase,this.reduced);continue;}if(n.type==='player'){if(this.holeDescent?.paint(c,()=>this.miner(c,0,0,this.cavePicture,'all',true),this.reduced||!!this.motionPreference?.matches))continue;paintComboGuard(c,r,playerDraw,phase,{soft:this.reduced||!!this.motionPreference?.matches});paintVineWrap(c,r,playerDraw,phase,'behind');if(fixedGroundShadow){c.save();c.fillStyle=P.ink;ellipse(c,this.player.x/2,this.player.y/2,26*.31,5*.31,P.ink);c.restore();}if(this.crystalWingReadyAtFrame)paintWingsBehind(c,this.crystalWingCache.image(),wingFrame.wings);this.fx.drawPlayerTitan(c,{bodyWorld:playerDraw,picture:this.cavePicture,active:this.giant,deadline:r.frenzy?.buffs?.giant??null,soft:this.reduced||!!this.motionPreference?.matches});this.miner(c,playerDraw.x,playerDraw.y,this.cavePicture,frontTarget?'body':'all',fixedGroundShadow);paintVineWrap(c,r,playerDraw,phase,'front');this.fx.drawPlayerHeal(c,playerDraw,{soft:this.reduced||!!this.motionPreference?.matches});this.fx.drawPlayerShield(c,playerDraw,{active:activeBoost(r,'shield')||(r.guardUntil>=0&&r.guardUntil>=Math.max(r.beat,r.acted)),soft:this.reduced||!!this.motionPreference?.matches});continue;}const p=this.actorPosition(n,paused?0:dt),x=p.x/2,y=p.y/2,bob=this.reduced?0:(Math.sin(t*4+(n.id||0))*.5+.5)*2;
    const seed=r.room.seed+(n.id??n.x*29+n.y);
    if(n.type==='enemy'&&!n.boss&&n.rabbitChild===undefined&&n.summon===undefined&&approvedArtAvailable(['slime','bat','golem'][n.kind],{biome:bi})){c.save();c.globalAlpha=.4;ellipse(c,x,y+1,n.miniboss?16:n.kind===1?10:n.kind===0?8:12,n.miniboss?5:n.kind===1?3:n.kind===0?2.5:4,P.ink);c.restore();}
    if(n.miniboss)paintCaveMiniboss(c,r,n,x,y);if(n.type==='geodePillar')this.geodePillar(c,n,x,y,phase,seed);
    else if(n.type==='rock'){if(!paintCampaignMineral(c,this.campaignScene,'rock',x,y,29+(n.kind||0)*3,n.kind||0))drawCaveMineral(c,'rock',x,y,29+(n.kind||0)*3,{seed,biome:bi,variant:n.kind||0},'contact');if(n.hp<n.maxHp||n.id===selected||n.id===hover){label(c,''+Math.ceil(n.hp),x,y+11,P.silver,7);paintCrisp(c,c=>{c.fillStyle=P.ink;c.fillRect(x-11,y+4,22,3);c.fillStyle=P.silver;c.fillRect(x-11,y+4,22*n.hp/n.maxHp,2);});}}
    else if(n.type==='crystal'){paintRareOre(c,{node:n,x,y,width:n.kind===2?36:30,time:t,soft:this.reduced||!!this.motionPreference?.matches});c.save();const contactPose=this.fx.mining.pose(n.id,this.fx.age,{soft:this.reduced||!!this.motionPreference?.matches});if(contactPose)c.translate(contactPose.dx,contactPose.dy);if(!paintCampaignMineral(c,this.campaignScene,'crystal',x,y,n.kind===2?36:30,n.kind||0))drawCaveMineral(c,'crystal',x,y,n.kind===2?36:30,{seed,variant:n.kind,biome:bi},'contact');c.restore();label(c,''+Math.ceil(n.hp),x,y+11,CRYSTALS[n.kind].color,7);}
    else if(n.summon!==undefined&&r.room.enemies.some(b=>b.id===n.summon&&micelialActive(b))){paintMicelialNucleus(c,n,x,y,phase,this.reduced||!!this.motionPreference?.matches);}else if(n.summon!==undefined){drawAsset(c,'mushroom',x,y-bob,38,{seed,biome:4});label(c,'NÚCLEO',x,y-38,P.lemon,9);label(c,''+Math.ceil(n.hp),x,y+11,P.pink,9);}
    else if((n.boss||n.rabbitChild!==undefined)&&this.rabbitPresentation?.paintEntity(c,n,{x,y,label})){}
    else if(n.rabbitChild!==undefined){c.save();c.translate(x,y);if(n.stunned)c.rotate(Math.sin(t*7+n.id)*.13);drawAsset(c,'rabbit',0,n.stunned?2:-bob,42,{seed,biome:6});c.restore();if(n.stunned){for(let i=0;i<3;i++){const a=t*3+i*Math.PI*2/3;label(c,'✦',x+Math.cos(a)*15,y-42+Math.sin(a)*6,P.lemon,11);}}}
    else if(n.boss){if(mysticActive(n)){paintMysticCombat(c,n,n,phase,project,this.reduced||!!this.motionPreference?.matches,{showBeam:false});}else if(micelialActive(n)){paintMicelial(c,n,x,y,phase,this.reduced||!!this.motionPreference?.matches);}else if(rootActive(n)){const offset=arenaVisualOffset(r.room,n);paintMatriarch(c,n,x+offset.x,y+offset.y,94,t,phase,this.reduced||!!this.motionPreference?.matches);}else if(crownActive(n)){paintCrownArt(c,n,x,y,this.geodeVisualBeat,this.reduced||!!this.motionPreference?.matches);}else if(n.bossIndex===0){const frame=this.geodePresentation.sample(n,{age:t,ambient:t,visualBeat:this.geodeVisualBeat,soft:this.reduced||!!this.motionPreference?.matches,paused:paused||ambientHidden});if(!paintGeodeArt(c,{x,y,width:75,pose:frame.pose})){paintGeodeContactShadow(c,{x,y,width:75});drawAsset(c,'boss',x,y,75,{seed,variant:0});}}else if(n.bossIndex===5)this.mole(c,n,r,time,seed);else if(n.bossIndex===6){const open=r.beat<=n.exposedUntil;drawAsset(c,'boss',x,y-bob+(open?Math.sin(t*10)*2:0),92,{seed,variant:6});if(n.windup&&!approvedArtAvailable('boss',{variant:6})){const a={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[n.windup.direction]||0;c.save();c.translate(x,y-23);c.rotate(a);c.fillStyle=P.orange;c.strokeStyle=P.ink;c.lineWidth=2;c.beginPath();c.moveTo(18,-10);c.quadraticCurveTo(52,-12,67,0);c.quadraticCurveTo(52,12,18,10);c.closePath();c.fill();c.stroke();ellipse(c,14,0,7,12,P.lime);c.restore();}if(open)for(const [i,dx,dy]of [[0,-47,-50],[1,47,-50],[2,0,-105]])label(c,'✦',x+dx+Math.sin(t*3+i)*3,y+dy+Math.cos(t*3+i)*3,P.lemon,16);}else{c.globalAlpha=n.bossIndex===4?.6:1;const attackPose=this.attackReadability?.bossPose(n);if(!paintBossMotion(c,attackPose?.node||n,x,y,75,t,{beat:attackPose?.beat??this.geodeVisualBeat,soft:this.reduced||!!this.motionPreference?.matches,player:r.player}))drawAsset(c,'boss',x,y-bob,75,{seed,variant:n.bossIndex});c.globalAlpha=1;}}
    else{const attackPose=this.attackReadability?.pose(n);c.save();c.translate(x+(attackPose?.dx||0),y+(attackPose?.dy||0));if(attackPose){c.rotate(attackPose.tilt);c.scale(attackPose.sx,attackPose.sy);}if(!drawDungeonCreature(c,['slime','bat','golem'][n.kind],0,0,n.miniboss?44:n.elite?65:n.kind===1?39:n.kind===0?24:32,{biome:bi,direction:attackPose?.direction||p.direction,time:attackPose?.frozen?0:t,moving:attackPose?.frozen?false:p.moving,progress:(n.kind===1&&attackPose?.frozen)? .25 : p.moving?p.motionProgress:null,soft:this.reduced||!!this.motionPreference?.matches}))drawAsset(c,['slime','bat','golem'][n.kind],0,0,n.miniboss?44:n.elite?65:n.kind===1?39:n.kind===0?24:32,{seed,biome:bi});c.restore();if(!n.miniboss)paintCrisp(c,c=>{c.fillStyle=P.ink;c.fillRect(x-10,y+6,20,3);c.fillStyle=P.pink;c.fillRect(x-10,y+6,20*n.hp/n.maxHp,2);});if(n.elite)label(c,'TITÃ',x,y-55,P.pink,13);if(n.stunUntil>=0&&n.stunUntil>=r.beat)label(c,'✦',x,y-28,P.lemon,10);}
    if(n===frontTarget&&!this.holeDescent?.falling)this.miner(c,playerDraw.x,playerDraw.y,this.cavePicture,'front',fixedGroundShadow);
    if(n.id!=null&&(n.id===selected||n.id===hover)){c.strokeStyle=n.type==='enemy'?P.pink:P.cyan;c.lineWidth=1;for(const [dx,dy,sx,sy]of [[-18,-29,1,1],[18,-29,-1,1],[-18,8,1,-1],[18,8,-1,-1]]){c.beginPath();c.moveTo(x+dx,y+dy+sy*5);c.lineTo(x+dx,y+dy);c.lineTo(x+dx+sx*5,y+dy);c.stroke();}}
   }
   if(r.room.cleared&&!r.room.stairDeparted){const p=project(r.room.exit?.x||18,r.room.exit?.y||2);label(c,'↓ ABERTO',p.x/2,p.y/2+23,P.cyan,7);}
  }else{
   const refugeInteraction=this.refugeInteraction={statuePromotion:this.statuePresentation,statueTier:accountScoreView(s)?.tier??0,starSoft:this.reduced,starReduced:!!this.motionPreference.matches,drillSoft:this.reduced,drillReduced:!!this.motionPreference.matches,liftAssets:this.refugeLiftAssets,gramophonePlaying:this.refugePlayback?.playing===true,soft:this.reduced,reducedMotion:!!this.motionPreference?.matches,motionR2:this.refugePose,wheelAngle:this.refugePose.wheelAngle,player:{x:this.player.x/2,y:(this.player.y-(this.hop||0))/2,width:31,depth:this.player.y/2,view:this.refugeFacing?.view||'front-left'}};this.refugePaintTime=t;
   for(const [type,x,y,width]of [...FLOW_PROPS,...(this.petFollowerPose?.alpha>0?[['companion',this.petFollowerPose.x/2,this.petFollowerPose.y/2,16]]:[]),['player',this.player.x/2,this.player.y/2,31]].sort((a,b)=>a[2]-b[2])){
    if(type==='companion'){paintPetFollower(c,this.petFollowerPose,{time:t});}else if(type==='player'){if(!drawRefugePlayer(c,x,y-(this.hop||0)/2,this.refugeFacing?.view||'front-left')){refugeInteraction.player.view=null;flowSprite(c,'miner',x,y-(this.hop||0)/2,width);}}else{const active={stars:'shrine',missions:'board',records:'gramophone',miner:'miningMachine',statue:'statueCopper'}[this.villageHover]||this.villageHover;flowIdle(c,type,x,y,width,t,this.reduced||!!this.motionPreference?.matches,active===type||active==='zag'&&type==='roulette',refugeInteraction);}
   }paintClouds(c,this.refugeCloudCache,this.refugeCloudPoses,'all');gramophoneNoteCount=refugeInteraction.gramophoneNoteCount||0;
  }
  if(isAbyss(s.run)){const r=s.run,p=this.player,phase=sceneBeatPhase(r,time),pulse=Math.max(0,1-phase%1*3);
   if(!this.reduced){c.strokeStyle=P.pink;c.globalAlpha=.12+pulse*.16;c.lineWidth=3;c.strokeRect(this.camera.x/2+2,this.camera.y/2+2,415,275);c.globalAlpha=1;}
  }
  if(this.rabbitImpact){const impact=this.rabbitImpact;impact.age+=paused?0:dt;const from=project(10,7),to=project(impact.direction==='right'?19:impact.direction==='left'?1:10,impact.direction==='down'?13:impact.direction==='up'?1:7),fade=Math.max(0,1-impact.age/.3);if(fade){c.save();c.globalAlpha=fade*.6;c.lineCap='round';c.strokeStyle=P.clay;c.lineWidth=24;c.beginPath();c.moveTo(from.x/2,from.y/2-12);c.lineTo(to.x/2,to.y/2-12);c.stroke();c.strokeStyle=P.orange;c.lineWidth=16;c.stroke();c.strokeStyle=P.lemon;c.lineWidth=3;c.stroke();c.restore();}else this.rabbitImpact=null;}
  this.swing=Math.max(0,this.swing-dt*7);this.fx.draw(c,s.run?.combo||0,false,true,this.reduced||!!this.motionPreference?.matches);this.fx.drawGeodeChips(c,{soft:this.reduced||!!this.motionPreference?.matches});this.rabbitPresentation?.drawFront(c);
  // Attack warnings and labels stay crisp above the approved CRT.
  paintCrisp(c,c=>{
  if(s.run){this.attackReadability?.crisp(c);for(const b of s.run.room.enemies)if(crownActive(b)&&b.hp>0)paintCrownAir(c,b,this.geodeVisualBeat,this.reduced||!!this.motionPreference?.matches);}});
  if(s.run)paintDungeonMotes(c,{energy:this.comboDisco?.energy||0,biome:biomeIndex(s.run.floor),seed:s.run.room.seed,time:t,soft:this.reduced||!!this.motionPreference?.matches,viewport:{x:this.camera.x/2,y:this.camera.y/2,w:this.viewWidth/2,h:this.viewHeight/2}});
  if(s.run?.room.explored){// Scenery stays visible under the dark ambience; enemy discovery remains native.
  const hazard=s.run.room.environmentWarning;if(hazard){const p=project(s.run.player.x,s.run.player.y);label(c,hazard.type===3?'LAVA!':'SAIA!',p.x/2,p.y/2-35,P.lemon,12);}}
  this.mysticLightTime=time;if(s.run?.room.explored)this.sightHalo(c,s.run);if(s.run&&!this.holeDescent?.pending)paintMovementReach(c,s,this.player,{scale:this.scale*2});if(s.run){this.powerShapes(c,s.run,time);paintCrisp(c,h=>this.ceilingWarnings(h,s.run,time));}
  if(this.flash>0&&!this.reduced){c.globalAlpha=this.flash*.15;c.fillStyle=P.red;c.fillRect(this.camera.x/2,this.camera.y/2,this.canvas.width/this.dpr/this.scale/2,this.canvas.height/this.dpr/this.scale/2);c.globalAlpha=1;this.flash=Math.max(0,this.flash-dt*2);}
  // Air tint belongs to the world, before the existing finish and crisp UI.
  if(s.run)for(const b of s.run.room.enemies)if(mysticActive(b)&&b.hp>0)mysticFire.emission(c,b,sceneBeatPhase(s.run,time),project,this.reduced||!!this.motionPreference?.matches);
  paintCaveAtmosphere(c,s.run,{crispReady});
  this.crtFinish??=createWorldFinish();this.crtFinish.apply(c,{dpr:this.dpr,hud:crispCanvasFor(c)});
  paintCrisp(c,c=>{if(s.run){for(const m of s.run.frenzy?.meteors||[]){const p=project(m.x,m.y);c.strokeStyle=P.lemon;c.lineWidth=3;c.beginPath();c.arc(p.x/2,p.y/2,20,0,Math.PI*2);c.stroke();label(c,'☄ '+Math.max(0,m.due-s.run.beat),p.x/2,p.y/2-24,P.lemon,15);}if(!this.holeDescent?.falling)this.health(c,s);for(const boss of s.run.room.enemies)if(boss.boss&&boss.hp>0&&visible(s.run.room,boss))this.bossHealth(c,boss,s.run,time);}});
  // Map/elevator HUD markers removed at user request; exploration remains in HUD.
  flushCrispFrame(c);if(this.canvas.dataset)this.canvas.dataset.gvSceneReady='true';this.refugeNoteCount=gramophoneNoteCount;this.refugeNotesVisible=gramophoneNoteCount>0;
 }
 bossHealth(c,boss,run,time){
  const p=mysticActive(boss)?project(Math.floor(run.room.cols/2),Math.floor(run.room.rows/2)-5):project(boss.x,boss.y),x=p.x/2,y=p.y/2,color=BOSSES[boss.bossIndex].color,options={variant:boss.bossIndex},spec=approvedArtSpec('boss',options);
  let top=y-71;
  if(spec&&(boss.bossIndex===0||approvedArtAvailable('boss',options))){
   let lift=this.reduced||boss.bossIndex===0?0:2;
   if(boss.bossIndex===5&&!boss.windup&&boss.emergedAt!==undefined&&!this.reduced){const phase=sceneBeatPhase(run,time),u=Math.max(0,Math.min(1,(phase-boss.emergedAt)/.5));lift=Math.sin(u*Math.PI)*13;}
   top=approvedArtRect(spec,x,y-lift,boss.bossIndex===6?92:75).y-10;
  }
  if(crownActive(boss))top=y-84;
  if(boss.bossIndex===6&&boss.rabbitMechanic===2)top=y-94;
  paintBossHealth(c,{showVitals:!this.canvas.ownerDocument?.body?.classList.contains('hud-v5'),x,top:rootActive(boss)?top-12:top,color,ratio:Math.max(0,boss.hp/boss.maxHp),name:BOSSES[boss.bossIndex].name.toUpperCase(),alert:null});this.attackReadability?.bossTicks(c,boss,{x,top});
  const text=bossHelpCaption(boss,run,sceneBeatPhase(run,time),{enabled:this.bossHelpEnabled,attackCaption:this.attackReadability?.bossCaption(boss)});
  if(text){const anchor=bossHelpAnchor(boss,run.room),talk=project(anchor.x,anchor.y);paintBossHelpBubble(c,{x:talk.x/2,y:talk.y/2-35,text,avoid:bossHelpObstacles(this.canvas.ownerDocument,this.canvas,this),bounds:{left:this.camera.x/2,top:this.camera.y/2,right:(this.camera.x+this.viewWidth)/2,bottom:(this.camera.y+this.viewHeight)/2}});}
 }
 geodePillar(c,n,x,y,phase,seed){
  if(n.crownPillar)return paintCrownPillar(c,n,x,y,phase,this.reduced||!!this.motionPreference?.matches);
  const rise=this.reduced?1:Math.min(1,Math.max(0,(phase-n.born)/.35)),fade=Math.min(1,Math.max(0,(n.until-phase)/.45));
  ellipse(c,x,y-5,30,12,P.deepBlue);c.save();c.beginPath();c.rect(x-45,y-88,90,90);c.clip();c.globalAlpha=fade;
  drawAsset(c,'crystal',x,y+(1-rise)*82,78,{seed,variant:0,biome:0});c.restore();
 }
 geodeWarning(c,r,time){
  for(const boss of r.room.enemies)if(boss.hp>0&&boss.bossIndex===0&&boss.windup){
   if(crownActive(boss)||boss.windup.geodePulse)continue;
   const w=boss.windup,p=project(w.x,w.y),x=p.x/2,y=p.y/2,remaining=Math.max(0,w.beat-sceneBeatPhase(r,time));
   c.save();ellipse(c,x,y,19,11,P.ink);c.strokeStyle=P.cyan;c.lineWidth=2;c.beginPath();c.ellipse(x,y,19,11,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<3;i++)ellipse(c,x+(i-1)*8,y,2.5,2.5,remaining>i?P.lemon:P.slate);
   c.restore();
  }
 }
 hedgehogBurrow(c,r,time){
  if(this.campaignScene){this.campaignScene.paintBurrow(c,{phase:sceneBeatPhase(r,time),time:this.ambientAge||0,soft:this.reduced||!!this.motionPreference?.matches});return;}
  const h=r.room.hedgehog;if(!h||!sceneryBurrowVisible(r.room))return;
  const p=project(h.x,h.y),x=p.x/2,y=p.y/2,bi=biomeIndex(r.floor),b=BIOME_ART[bi];
  // A giant spectator embedded in the cliff. Its silhouette can never cover a walkable tile.
  c.save();c.beginPath();c.rect(x-85,y-124,170,140);
  for(let gy=h.y-8;gy<=h.y+1;gy++)for(let gx=h.x-4;gx<=h.x+4;gx++)if(isFloor(r.room,gx,gy)){
   const q=project(gx,gy);c.moveTo(q.x/2-12,q.y/2-8);c.lineTo(q.x/2+10,q.y/2-8);c.lineTo(q.x/2+12,q.y/2+8);c.lineTo(q.x/2-10,q.y/2+8);c.closePath();
  }
  c.clip('evenodd');traceHedgehogArch(c,x,y);c.fillStyle='#071b2b';c.fill();paintBurrowFrameV2(c,x,y,bi);

  c.save();traceHedgehogArch(c,x,y);c.clip();
  this.hedgehogPose(c,r,x,y+5,time);c.restore();
  ellipse(c,x,y+9,56,5,b.shade);c.restore();
 }
 hedgehogPose(c,r,x,y,time){
  const h=r.room.hedgehog,width=128,k=width/100,t=this.ambientAge||0,options={seed:r.room.seed+h.x*29+h.y,biome:biomeIndex(r.floor)};
  const phase=sceneBeatPhase(r,time),mood=hedgehogMood(r.room.hedgehogGrowth,phase,this.reduced);
  if(!drawHedgehogArt(c,x,y,{phase,mood,ambient:t,reduced:this.reduced,biome:options.biome,emissionArch:g=>traceHedgehogArch(g,x,y-5)})){
  // Existing procedural parts remain a load/failure fallback only.
  const breath=this.reduced?0:Math.sin(t*1.65)*(1-mood.tuck),blinkTime=t%6.8;
  const blink=this.reduced||blinkTime<6.5?0:Math.sin((blinkTime-6.5)/.3*Math.PI);
  const gazeX=this.reduced?0:Math.max(-1.2,Math.min(1.2,(this.player.x/2-x)/220)),gazeY=this.reduced?0:.5;
  const part=(layer,dx=0,dy=0,sx=1,sy=1)=>{const pivot=HEDGEHOG_PART_PIVOTS[layer]||[50,96],px=x+(pivot[0]-50)*k,py=y+(pivot[1]-96)*k;c.save();c.translate(px+dx,py+dy);c.scale(sx,sy);c.translate(-px,-py);drawAsset(c,'hedgehog',x,y,width,{...options,layer});c.restore();};
  part('shadow');part('body',0,mood.tuck*5,1+breath*.004,1+breath*.014-mood.tuck*.06);part('crystals',0,-breath*.85+mood.tuck*5);part('face',0,-breath*.45+mood.tuck*5);
  part('eyes',gazeX,gazeY-breath*.45+mood.tuck*6,1,Math.max(.15,1-blink*.94-mood.tuck*.35));
  for(const [i,layer]of ['paw-left','paw-right'].entries()){const beat=(phase+i)%2,lift=this.reduced||beat>=1?0:Math.sin(Math.PI*beat)**2*4*(1-mood.tuck);part(layer,(i? -1:1)*mood.tuck*6,-lift+mood.tuck*7,1,1-lift*.009);}
  }
  const growth=this.reduced?0:Math.max(0,1-(phase-(h.pulseBeat??-10))/2);
  if(growth>0){c.save();c.globalAlpha=growth*.65;for(const [i,dx]of [-24,0,24].entries()){const py=y-73-i%2*15-growth*5;c.strokeStyle=BIOME_ART[options.biome].accent;c.lineWidth=1.5;c.beginPath();c.moveTo(x+dx-3,py);c.lineTo(x+dx+3,py);c.moveTo(x+dx,py-3);c.lineTo(x+dx,py+3);c.stroke();}c.restore();}
 }
 mole(c,b,r,time,seed){
  const phase=sceneBeatPhase(r,time),w=b.windup,p=project(b.x,b.y),x=p.x/2,y=p.y/2;
  if(w||!approvedArtAvailable('boss',{variant:5})){ellipse(c,x,y+2,26,11,P.bark);ellipse(c,x,y+1,20,7,P.coal);}
  if(w){
   const u=Math.max(0,Math.min(1,(phase-w.startedBeat)/3)),to=project(w.x,w.y),sink=Math.max(0,Math.min(1,(phase-w.startedBeat)/.45));
   // Six bounded dirt ripples, no particles or fresh cached assets per frame.
   for(let i=0;i<6;i++){const f=Math.max(0,u-i*.055),tx=x+(to.x/2-x)*f,ty=y+(to.y/2-y)*f;c.globalAlpha=(1-i/7)*.85;ellipse(c,tx,ty,13-i,5,P.ochre);ellipse(c,tx,ty+2,11-i,3,P.clay);}c.globalAlpha=1;
   if(sink<1){c.globalAlpha=1-sink;paintBossV2(c,b,x,y+sink*12,75,time,{beat:phase,soft:this.reduced,player:r.player});c.globalAlpha=1;}
   const a=Math.max(0,1-phase%1*2);c.strokeStyle=P.yellow;c.lineWidth=2;c.beginPath();c.ellipse(to.x/2,to.y/2,19+a*5,9+a*3,0,0,Math.PI*2);c.stroke();
  }else{
   const u=b.emergedAt===undefined?1:Math.max(0,Math.min(1,(phase-b.emergedAt)/.5));
   paintBossV2(c,b,x,y-(this.reduced?0:Math.sin(u*Math.PI)*13),75,time,{beat:phase,soft:this.reduced,player:r.player});
   
  }
 }
 drawPowerVfx(c,r,time,layer){
  const active=Object.fromEntries(['lightning','magnet','fire'].map(id=>[id,activeBoost(r,id)]));
  this.powerVfx.draw(c,{x:this.player.x/2,y:this.player.y/2},active,sceneBeatPhase(r,time),{soft:this.reduced||!!this.motionPreference?.matches,layer,shotAge:this.fx.latestLightningAge()});
  if(layer==='front')for(const n of [...r.room.nodes,...r.room.enemies,...r.room.rocks])if(n.hp>0&&n.burn&&n.burn.until>=Math.max(r.beat,r.acted)&&visible(r.room,n)){
   const p=project(n.x,n.y);this.powerVfx.drawBurn(c,{x:p.x/2,y:p.y/2},sceneBeatPhase(r,time),{soft:this.reduced||!!this.motionPreference?.matches});
  }
 }
 powerShapes(c,r,time){
  const x=this.player.x/2,y=this.player.y/2-12,soft=this.reduced,pulse=soft?0:Math.sin(time*5),has=id=>activeBoost(r,id);
  c.save();c.lineJoin='round';c.lineCap='round';
  if(has('wings')&&!this.crystalWingReadyAtFrame){const lift=soft?0:pulse*3;c.globalAlpha=.95;
   for(const side of [-1,1])poly(c,[[x+side*9,y-8],[x+side*36,y-24-lift],[x+side*31,y-7],[x+side*24,y-10],[x+side*23,y],[x+side*15,y-3]],P.cyan);
   for(const side of [-1,1])poly(c,[[x+side*12,y-9],[x+side*31,y-21-lift],[x+side*22,y-9]],P.white);
  }
  this.drawPowerVfx(c,r,time,'front');
  c.restore();
 }
 sightHalo(c,r){if(this.campaignScene){c.save();this.campaignScene.clipFog?.(c);paintCampaignNight(c,this.campaignScene,r,this.player,{x:this.camera.x/2,y:this.camera.y/2,w:this.viewWidth/2,h:this.viewHeight/2},{lights:r.room.enemies.filter(mysticActive).flatMap(b=>mysticFire.lightSources(b,sceneBeatPhase(r,this.mysticLightTime||0),project,this.reduced||!!this.motionPreference?.matches)).filter(p=>p.kind==='mystic-floor')});c.restore();return;}paintDungeonNight(c,r,this.player,{x:this.camera.x/2,y:this.camera.y/2,w:this.viewWidth/2,h:this.viewHeight/2},biomeIndex(r.floor));}

 prepareFog(room){
  if(isCampaignCave(room)){
   this.campaignFog=campaignFog(room,this.campaignScene.view,this.campaignFog?.room===room?this.campaignFog:null);this.campaignFog.room=room;this.fogPaths=this.campaignFog.paths;
   if(this.fogVisible!==room.visible||this.fogRoom!==room){this.fogRoom=room;this.fogVisible=room.visible;this.mapCache??=document.createElement('canvas');this.mapCache.width=126;this.mapCache.height=90;const m=this.mapCache.getContext('2d');let seen=0,total=0;for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++){const i=y*room.cols+x;if(!room.floorMask[i])continue;total++;if(room.explored[i]){seen++;m.fillStyle=room.visible[i]?P.steel:P.slate;m.fillRect(x*126/room.cols,y*90/room.rows,126/room.cols,90/room.rows);}}this.exploredPercent=Math.round(seen/Math.max(1,total)*100);}return;
  }

  // reveal() replaces visible; exploration and minimap only change with that snapshot.
  if(this.fogVisible===room.visible&&this.fogRoom===room)return;
  this.fogRoom=room;this.fogVisible=room.visible;this.fogPaths=[new Path2D(),new Path2D()];
  const {cols,rows}=roomSize(room);this.mapCache??=document.createElement('canvas');this.mapCache.width=126;this.mapCache.height=90;
  const map=this.mapCache.getContext('2d');let explored=0;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const i=y*cols+x,remembered=!!room.explored[i];
   if(remembered&&isFloor(room,x,y)){explored++;map.fillStyle=room.visible[i]?P.steel:P.slate;map.fillRect(x*3,y*3,3,3);}
   if(room.visible[i])continue;
   const p=project(x,y),path=this.fogPaths[remembered?1:0];path.moveTo(p.x/2-12,p.y/2-9);path.lineTo(p.x/2+11,p.y/2-9);path.lineTo(p.x/2+13,p.y/2+9);path.lineTo(p.x/2-11,p.y/2+9);path.closePath();
  }
  this.exploredPercent=Math.round(explored/(room.floorMask?.reduce((sum,v)=>sum+v,0)||(cols-2)*(rows-2))*100);
 }
 minimap(c,s){
  const width=126,height=90,x=12,y=Math.max(135,this.canvas.height/this.dpr-height-112);
  const progress=Math.max(0,Math.min(100,this.exploredPercent||0));
  c.save();c.setTransform(this.dpr,0,0,this.dpr,0,0);
  c.beginPath();c.roundRect(x-4,y-23,width+8,height+47,7);
  c.fillStyle="#102844";c.fill();c.strokeStyle="#456d96";c.lineWidth=2;c.stroke();
  label(c,'EXPLORADO '+progress+'%',x+width/2,y-8,'#e9f3fa',12);
  c.drawImage(this.mapCache,x,y);
  c.fillStyle=P.lemon;c.fillRect(x+s.run.player.x*(126/roomSize(s.run.room).cols)-1,y+s.run.player.y*(90/roomSize(s.run.room).rows)-1,5,5);
  c.fillStyle="#071323";c.fillRect(x,y+height+9,width,9);
  c.fillStyle=progress===100?"#a2e66f":"#2fbfcd";c.fillRect(x,y+height+9,width*progress/100,9);
  c.restore();
 }
}
