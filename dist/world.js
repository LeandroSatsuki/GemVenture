import {isAbyss,musicFloor,activeBoost} from './frenzy.js';
import {roomSize,visible,terrainAt,environment,isFloor} from './cavern.js';
import {BOSSES} from './bosses.js';
import {CRYSTALS,biomeIndex,rng,COLS,ROWS,dangerTiles,maxHealth} from './core.js';
import {beatPhase} from './score.js';
import {Effects} from './effects.js';
import {P,BIOME_ART} from './palette.js';
import {drawAsset,ART_ACCENT_PIVOTS,HEDGEHOG_PART_PIVOTS} from './art-kit.js';
import {pickaxeTier} from './pickaxe-style.js';
import {currentRecord} from './records.js';
import {FLOW_PROPS,loadVillageArt,flowSprite,flowIdle,paintFlowVillage} from './flow-village.js';
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
export const HOTSPOTS=[
 {id:'miner',name:'MINERADORA',x:410,y:612,w:124,h:150,labelY:686},
 {id:'forge',name:'FORJA',x:302,y:260,w:240,h:270,labelY:412},
 {id:'tree',name:'ÁRVORE DE ECOS',x:686,y:215,w:270,h:310,labelY:382},
 {id:'lift',name:'ELEVADOR',x:1080,y:265,w:190,h:250,labelY:414},
 {id:'well',name:'POÇO DOS DESEJOS',x:248,y:515,w:190,h:220,labelY:646},
 {id:'missions',name:'MISSÕES',x:568,y:530,w:190,h:230,labelY:655},
 {id:'stars',name:'RELICÁRIO',x:1082,y:542,w:160,h:218,labelY:663},
 {id:'zag',name:'ZAG',x:886,y:535,w:216,h:260,labelY:680},
 {id:'records',name:'VITROLA',x:904,y:298,w:152,h:190,labelY:414}
];
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function label(c,text,x,y,color=P.silver,size=8){c.font='700 '+size+"px 'Trebuchet MS','Segoe UI',sans-serif";c.textAlign='center';c.lineWidth=2;c.strokeStyle=P.ink;c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
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
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.cache=document.createElement('canvas');this.cache.width=1200;this.cache.height=760;this.fx=new Effects();this.player={x:465,y:450};this.target={...this.player};this.camera={x:0,y:0};this.wide=false;this.trail=[];this.flash=0;this.swing=0;this.key='';this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.fx.setSoft(this.reduced);this.resize();loadVillageArt();}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=r.width*d;this.canvas.height=r.height*d;this.scale=this.wide?Math.min(r.height/620,r.width/400):Math.min(r.width/BASE_SIZE.width,r.height/BASE_SIZE.height);this.viewWidth=r.width/this.scale;this.viewHeight=r.height/this.scale;this.offsetX=this.wide?0:(r.width-BASE_SIZE.width*this.scale)/2;this.offsetY=this.wide?0:(r.height-BASE_SIZE.height*this.scale)/2;this.dpr=d;}
 pointer(e){const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left-this.offsetX)/this.scale+this.camera.x,y:(e.clientY-r.top-this.offsetY)/this.scale+this.camera.y};}
 place(s){this.player=s.run?project(s.run.player.x,s.run.player.y):{x:465,y:450};this.target={...this.player};this.hop=0;this.bump=null;this.fx.clear();this.route=null;this.trail=[];this.key='';this.cameraReset=true;this.fogVisible=null;this.creaturePos=new Map();}
 background(){const c=this.cache.getContext('2d');c.setTransform(2,0,0,2,0,0);c.fillStyle=P.ink;c.fillRect(0,0,this.cache.width/2,this.cache.height/2);return c;}
 base(){this.cache.width=BASE_SIZE.width;this.cache.height=BASE_SIZE.height;const c=this.background();paintFlowVillage(c);}

 cave(s){const {cols,rows}=roomSize(s.run.room);const width=cols>21?2400:1200,height=rows>15?1520:760;if(this.cache.width!==width)this.cache.width=width;if(this.cache.height!==height)this.cache.height=height;const c=this.background(),run=s.run,bi=biomeIndex(run.floor),b=BIOME_ART[bi],r=rng(run.room.seed),pt=(x,y)=>{const q=project(x,y);return[q.x/2,q.y/2]};
  if(isAbyss(run))return;
  const ground=new Path2D();
  for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(isFloor(run.room,x,y)){const [px,py]=pt(x,y);ground.moveTo(px-12,py-8);ground.lineTo(px+10,py-8);ground.lineTo(px+12,py+8);ground.lineTo(px-10,py+8);ground.closePath();}
  c.fillStyle=b.floor;c.fill(ground);
  // Sparse, clipped patches keep the route quieter than rewards and creatures.
  c.save();c.clip(ground);
  for(let i=0;i<(cols>21?32:8);i++){const [x,y]=pt(2+Math.floor(r()*(cols-4)),2+Math.floor(r()*(rows-4)));c.globalAlpha=.26;ellipse(c,x,y,14+r()*14,5+r()*6,b.patch);}c.globalAlpha=1;
  for(let ty=1;ty<rows-1;ty++)for(let tx=1;tx<cols-1;tx++){
   if(!isFloor(run.room,tx,ty))continue;const type=terrainAt(run.room,{x:tx,y:ty});if(!type)continue;
   const [px,py]=pt(tx,ty),color=type===1?P.deepBlue:type===2?P.clay:type===4?P.plum:type===5?P.bark:type===6?P.wood:P.rust;
   floorCell(c,tx,ty,color);
   if((tx*3+ty)%4===0){c.strokeStyle=type===1?P.cyan:type===2?P.sand:type===4?P.pink:type===5?P.ochre:type===6?P.lime:P.orange;c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.moveTo(px-5,py);c.quadraticCurveTo(px,py+2,px+5,py);c.stroke();c.globalAlpha=1;}
  }
  c.restore();paintWalls(c,run.room,bi);
  const decoration=['lantern','mushroom','fossil','lava','mushroom','molehill','bush'][bi];
  // Small edge clusters leave chamber centers clear for the fight.
  for(const [i,room]of (run.room.layout?.rooms||[]).entries()){
   const tx=room.x-room.rx+1,ty=room.y;
   if(!isFloor(run.room,tx,ty)&&isFloor(run.room,tx+1,ty)){const [x,y]=pt(tx,ty);drawAsset(c,decoration,x,y,18,{seed:run.room.seed+i,biome:bi});}
  }
  if(run.room.bossFloor){const [ax,ay]=pt(10,bi===4||bi===6?7:6);ellipse(c,ax,ay,128,66,b.shade);c.strokeStyle=b.accent;c.globalAlpha=.5;c.lineWidth=2;c.beginPath();c.ellipse(ax,ay,120,59,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
  const [x,y]=pt(run.room.exit?.x||18,run.room.exit?.y||2);drawAsset(c,'lift',x,y+5,49,{variant:run.room.cleared?1:0});
 }

 // Only visible streamed rows are painted. Absolute row seeds keep the same
 // decoration attached to each world cell when its local coordinates change.
 abyssFloor(c,r){
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
  const goal=project(n.x,n.y);if(n.type!=='enemy'||n.boss||n.id==null)return goal;
  this.creaturePos??=new Map();let p=this.creaturePos.get(n.id);
  if(!p||Math.hypot(goal.x-p.x,goal.y-p.y)>100){p={...goal};this.creaturePos.set(n.id,p);}
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
  const phase=beatPhase(musicFloor(r),time),bi=biomeIndex(r.floor);
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
 consume(events){this.fx.consume(events,project,this.target);for(const e of events){if(e.type==='scroll'){for(const p of [this.player,this.target,...(this.route?.points||[]),...this.trail,...(this.creaturePos?.values()||[]),...(this.camera?[this.camera]:[])]){p.x-=4;p.y-=32;}}if(e.type==='bump'){const dx=e.dx*44+e.dy*4,dy=e.dy*32,length=Math.hypot(dx,dy)||1;this.swing=1;this.bump=this.reduced?null:{x:dx/length,y:dy/length,elapsed:0};}if(e.type==='dash'){this.target=project(e.to.x,e.to.y);this.swing=1;if(e.path?.length){this.bump=null;const points=[{...this.player},...e.path.map(p=>project(p.x,p.y))];this.route={points,elapsed:0,sample:0,length:points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0)};if(this.reduced){for(let d=0;d<this.route.length;d+=20)this.trail.push({...dashPoint(this.route,d/this.route.length),life:.32});this.trail=this.trail.slice(-24);this.player={...this.target};this.route=null;this.hop=0;}}}if(e.type==='carrotSlam')this.rabbitImpact={direction:e.direction,age:0};if(e.type==='hurt'&&e.reason==='attack')this.flash=.6;}}
 advanceMovement(dt,paused=false){
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
 drawTrail(c){c.save();for(const tr of this.trail){const fade=Math.max(0,tr.life/.32),x=tr.x/2,y=tr.y/2;
  if(!this.reduced){c.globalAlpha=fade*.3;this.miner(c,tr.x,tr.y-(tr.hop||0));}
  c.globalAlpha=fade*(this.reduced?.28:.65);ellipse(c,x,y+1,9,3,P.blue);ellipse(c,x,y,5,1.5,P.cyan);
 }c.restore();}
 miner(c,x,y){x/=2;y/=2;drawAsset(c,'miner',x,y,31,{variant:this.armorTier||0});c.save();c.translate(x+10,y-9);c.rotate(-.3-this.swing);drawAsset(c,'pickaxe',1,6,this.giant?39:21,{variant:this.pickTier||0});c.restore();}
 health(c,s){const offset=bumpOffset(this.bump),hp=s.run.health,max=maxHealth(s),ratio=Math.max(0,Math.min(1,hp/max)),x=(this.player.x+offset.x)/2,y=(this.player.y+offset.y)/2+10,color=ratio<=.3?P.pink:ratio<=.6?P.lemon:P.lime;
  c.save();c.globalAlpha=1;c.fillStyle=P.ink;c.fillRect(x-22,y-2,44,17);c.strokeStyle=color;c.lineWidth=1.2;c.strokeRect(x-21,y-1,42,7);c.fillStyle=P.slate;c.fillRect(x-19,y+1,38,3);c.fillStyle=color;c.fillRect(x-19,y+1,38*ratio,3);label(c,'♥ '+Math.ceil(hp)+' / '+max,x,y+13,P.white,7);c.restore();
 }
 draw(s,time,dt,selected,hover,paused){
  this.giant=activeBoost(s.run,'giant');this.pickTier=pickaxeTier(s.level);this.armorTier=Math.min(3,Math.ceil((s.forge?.levels?.armor||0)/34));const key=s.run?[s.attempts,s.run.floor,s.run.room.seed,s.run.room.cleared].join('-'):'base';if(key!==this.key){this.key=key;this.creaturePos=new Map();s.run?this.cave(s):this.base();}
  if(s.run)this.target=project(s.run.player.x,s.run.player.y);
  this.advanceMovement(dt,paused);
  const wide=!!s.run&&roomSize(s.run.room).cols>21;if(this.wide!==wide){this.wide=wide;this.resize();this.cameraReset=true;}if(wide){const dim=roomSize(s.run.room),bounds=project(dim.cols,dim.rows),step=paused?0:dt,abyss=isAbyss(s.run);this.camera={x:cameraAxis(this.camera.x,this.player.x,this.viewWidth,bounds.x,step,this.cameraReset),y:abyss?(this.cameraReset?abyssCameraY(this.player.y):cameraFollow(this.camera.y,abyssCameraY(this.player.y),step)):caveCameraY(this.camera.y,this.player.y,this.viewHeight,step,this.cameraReset,(s.run.room.hedgehog?.y??8)<6?-150:0)};}else this.camera={x:0,y:0};this.cameraReset=false;
  const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle=P.ink;c.fillRect(0,0,this.canvas.width/this.dpr,this.canvas.height/this.dpr);c.translate(this.offsetX,this.offsetY);c.scale(this.scale*2,this.scale*2);c.imageSmoothingEnabled=true;c.translate(-this.camera.x/2,-this.camera.y/2);
  this.fx.update(paused?0:dt);if(!this.reduced&&!paused){const shake=this.fx.shake*(this.route?.1:.25);c.translate(Math.sin(this.fx.age*87)*shake,Math.cos(this.fx.age*103)*shake*.6);}c.drawImage(this.cache,0,0,this.cache.width/2,this.cache.height/2);if(isAbyss(s.run))this.abyssFloor(c,s.run);this.ambientAge=(this.ambientAge||0)+(paused?0:Math.min(dt,.05));const t=this.ambientAge;
  if(s.run&&s.run.combo>=50&&!this.reduced&&!s.run.room.cleared){const phase=beatPhase(musicFloor(s.run),time),pulse=Math.max(0,1-(phase%1)*2.6),color=currentRecord(s).color;c.save();c.globalAlpha=.075+.075*pulse;const cx=this.camera.x/2+this.viewWidth/4,cy=this.camera.y/2+this.viewHeight/4;for(let i=-1;i<=1;i++)ellipse(c,cx+i*155,cy+(i%2)*83,105+22*pulse,42+8*pulse,i===0?color:i<0?P.cyan:P.pink);c.restore();}
  this.drawTrail(c);
  if(s.run){const r=s.run,bi=biomeIndex(r.floor);
   for(const h of r.room.hazards||[]){const p=project(h.x,h.y);ellipse(c,p.x/2,p.y/2,13,7,P.green);ellipse(c,p.x/2,p.y/2,9,4,P.lime);label(c,'!',p.x/2,p.y/2+3,P.ink,9);}
   for(const e of r.room.enemies)if(e.windup)for(const tile of dangerTiles(e.windup)){const p=project(tile.x,tile.y);c.globalAlpha=.5;poly(c,[[p.x/2-12,p.y/2-8],[p.x/2+10,p.y/2-8],[p.x/2+12,p.y/2+8],[p.x/2-10,p.y/2+8]],P.red);c.globalAlpha=1;}
   for(const boss of r.room.enemies.filter(e=>e.boss&&e.windup?.safe)){const safe=boss.windup.safe,radius=boss.bossIndex===5?1:2;for(let y=safe.y-radius;y<=safe.y+radius;y++)for(let x=safe.x-radius;x<=safe.x+radius;x++){const p=project(x,y);c.fillStyle=P.deepTeal;c.fillRect(p.x/2-11,p.y/2-8,22,16);}}
   for(const boss of r.room.enemies.filter(e=>e.bossIndex===4&&e.hp>0)){for(const tile of boss.spiralTiles||[]){const p=project(tile.x,tile.y);drawAsset(c,'rock',p.x/2,p.y/2,24,{seed:tile.x*31+tile.y,biome:4});}const p=project(boss.x,boss.y);label(c,boss.spiralDirection===-1?'↶':'↻',p.x/2,p.y/2-66,P.lemon,26);}
   if(r.room.bossFloor&&bi===6){for(const n of r.room.enemies.filter(e=>e.boss||e.rabbitChild!==undefined)){const p=project(n.x,n.y),x=p.x/2,y=p.y/2;ellipse(c,x,y-1,n.boss?43:22,n.boss?19:10,P.wood);ellipse(c,x,y-3,n.boss?34:16,n.boss?13:7,P.ink);c.strokeStyle=n.boss?P.orange:P.lime;c.lineWidth=2;c.beginPath();c.ellipse(x,y-2,n.boss?43:22,n.boss?19:10,0,0,Math.PI*2);c.stroke();}}
   const liveActorIds=new Set(r.room.enemies.filter(n=>n.hp>0).map(n=>n.id));for(const id of this.creaturePos.keys())if(!liveActorIds.has(id))this.creaturePos.delete(id);
   const onScreen=n=>{if(n.hp!=null&&n.hp<=0||!visible(r.room,n))return false;const p=project(n.x,n.y);return p.x>=this.camera.x-150&&p.x<=this.camera.x+this.viewWidth+150&&p.y>=this.camera.y-40&&p.y<=this.camera.y+this.viewHeight+180;};
   const entities=[...r.room.rocks.filter(onScreen).map(n=>({...n,type:'rock'})),...r.room.nodes.filter(onScreen),...r.room.enemies.filter(onScreen),{type:'player',x:0,y:(this.player.y-115)/32}].sort((a,b)=>a.y-b.y);
   for(const n of entities){if(n.type!=='player'&&!visible(r.room,n))continue;if(n.type==='player'){const offset=bumpOffset(this.bump);this.miner(c,this.player.x+offset.x,this.player.y+offset.y-(this.hop||0)-(activeBoost(r,'wings')?14:0));continue;}const p=this.actorPosition(n,paused?0:dt),x=p.x/2,y=p.y/2,bob=this.reduced?0:(Math.sin(t*4+(n.id||0))*.5+.5)*2;
    const seed=r.room.seed+(n.id??n.x*29+n.y);
    if(n.type==='rock'){drawAsset(c,'rock',x,y,29+(n.kind||0)*3,{seed,biome:bi,variant:n.kind||0});if(n.hp<n.maxHp||n.id===selected||n.id===hover){label(c,''+Math.ceil(n.hp),x,y+11,P.silver,7);c.fillStyle=P.ink;c.fillRect(x-11,y+4,22,3);c.fillStyle=P.silver;c.fillRect(x-11,y+4,22*n.hp/n.maxHp,2);}}
    else if(n.type==='crystal'){if(n.rare){ellipse(c,x,y-13,24,17,P.deepTeal);label(c,'VEIO RARO',x,y-40,P.lemon,11);}drawAsset(c,'crystal',x,y,n.kind===2?36:30,{seed,variant:n.kind});label(c,''+Math.ceil(n.hp),x,y+11,CRYSTALS[n.kind].color,7);}
    else if(n.summon!==undefined){drawAsset(c,'mushroom',x,y-bob,38,{seed,biome:4});label(c,'NÚCLEO',x,y-38,P.lemon,9);label(c,''+Math.ceil(n.hp),x,y+11,P.pink,9);}
    else if(n.rabbitChild!==undefined){c.save();c.translate(x,y);if(n.stunned)c.rotate(Math.sin(t*7+n.id)*.13);drawAsset(c,'rabbit',0,n.stunned?2:-bob,42,{seed,biome:6});c.restore();if(n.stunned){for(let i=0;i<3;i++){const a=t*3+i*Math.PI*2/3;label(c,'✦',x+Math.cos(a)*15,y-42+Math.sin(a)*6,P.lemon,11);}}else label(c,'ACERTE',x,y-40,P.lemon,9);}
    else if(n.boss){if(n.bossIndex===5)this.mole(c,n,r,time,seed);else if(n.bossIndex===6){const open=r.beat<=n.exposedUntil;drawAsset(c,'boss',x,y-bob+(open?Math.sin(t*10)*2:0),92,{seed,variant:6});if(n.windup){const a={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[n.windup.direction]||0;c.save();c.translate(x,y-23);c.rotate(a);c.fillStyle=P.orange;c.strokeStyle=P.ink;c.lineWidth=2;c.beginPath();c.moveTo(18,-10);c.quadraticCurveTo(52,-12,67,0);c.quadraticCurveTo(52,12,18,10);c.closePath();c.fill();c.stroke();ellipse(c,14,0,7,12,P.lime);c.restore();}label(c,open?'TONTO · ATAQUE!':'ACERTE OS 3',x,y+20,open?P.cyan:P.lemon,11);if(open)for(const [i,dx,dy]of [[0,-47,-50],[1,47,-50],[2,0,-105]])label(c,'✦',x+dx+Math.sin(t*3+i)*3,y+dy+Math.cos(t*3+i)*3,P.lemon,16);}else{c.globalAlpha=n.bossIndex===4?.6:1;drawAsset(c,'boss',x,y-bob,75,{seed,variant:n.bossIndex});c.globalAlpha=1;label(c,n.bossIndex===4?'INTANGÍVEL':r.beat<=n.exposedUntil?'VULNERÁVEL':'ARMADURA',x,y+16,r.beat<=n.exposedUntil?P.cyan:P.lemon,10);}}
    else{c.save();c.translate(x,y);if(!this.reduced){const sway=Math.sin(t*5+(n.id||0))*.025;c.scale(1+sway,1-sway);}drawAsset(c,['slime','bat','golem'][n.kind],0,n.kind===1?-bob:0,n.elite?65:n.kind===1?39:32,{seed,biome:bi});c.restore();c.fillStyle=P.ink;c.fillRect(x-10,y+6,20,3);c.fillStyle=P.pink;c.fillRect(x-10,y+6,20*n.hp/n.maxHp,2);if(n.elite)label(c,'TITÃ',x,y-55,P.pink,13);if(n.stunUntil>=0&&n.stunUntil>=r.beat)label(c,'✦',x,y-28,P.lemon,10);}
    if(n.id!=null&&(n.id===selected||n.id===hover)){c.strokeStyle=n.type==='enemy'?P.pink:P.cyan;c.lineWidth=1;for(const [dx,dy,sx,sy]of [[-18,-29,1,1],[18,-29,-1,1],[-18,8,1,-1],[18,8,-1,-1]]){c.beginPath();c.moveTo(x+dx,y+dy+sy*5);c.lineTo(x+dx,y+dy);c.lineTo(x+dx+sx*5,y+dy);c.stroke();}}
   }
   if(r.room.cleared){const p=project(r.room.exit?.x||18,r.room.exit?.y||2);label(c,'↓ ABERTO',p.x/2,p.y/2+23,P.cyan,7);}
  }else{
   for(const [type,x,y,width]of [...FLOW_PROPS,['player',this.player.x/2,this.player.y/2,31]].sort((a,b)=>a[2]-b[2])){
    if(type==='player')flowSprite(c,'miner',x,y,width);else{const active={stars:'shrine',missions:'board',records:'gramophone',miner:'miningMachine'}[this.villageHover]||this.villageHover;flowIdle(c,type,x,y,width,t,this.reduced,active===type||active==='zag'&&type==='roulette');}
   }
  }
  if(isAbyss(s.run)){const r=s.run,p=this.player,phase=beatPhase(musicFloor(r),time),pulse=Math.max(0,1-phase%1*3);
   if(!this.reduced){c.strokeStyle=P.pink;c.globalAlpha=.12+pulse*.16;c.lineWidth=3;c.strokeRect(this.camera.x/2+2,this.camera.y/2+2,415,275);c.globalAlpha=1;}
   for(const [id,color] of [['lightning',P.cyan],['magnet',P.pink],['fire',P.orange]])if(activeBoost(r,id)){c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.ellipse(p.x/2,p.y/2-8,32+pulse*8,20+pulse*5,0,0,Math.PI*2);c.stroke();}
  }
  if(this.rabbitImpact){const impact=this.rabbitImpact;impact.age+=paused?0:dt;const from=project(10,7),to=project(impact.direction==='right'?19:impact.direction==='left'?1:10,impact.direction==='down'?13:impact.direction==='up'?1:7),fade=Math.max(0,1-impact.age/.3);if(fade){c.save();c.globalAlpha=fade*.6;c.lineCap='round';c.strokeStyle=P.clay;c.lineWidth=24;c.beginPath();c.moveTo(from.x/2,from.y/2-12);c.lineTo(to.x/2,to.y/2-12);c.stroke();c.strokeStyle=P.orange;c.lineWidth=16;c.stroke();c.strokeStyle=P.lemon;c.lineWidth=3;c.stroke();c.restore();}else this.rabbitImpact=null;}
  this.swing=Math.max(0,this.swing-dt*7);this.fx.draw(c,s.run?.combo||0);
  // Attack warnings stay readable above the largest explosions.
  if(s.run)for(const e of s.run.room.enemies)if(e.hp>0&&e.windup){
   if(e.boss){zoneOutline(c,dangerTiles(e.windup),P.lemon);if(e.windup.safe){const safe=e.windup.safe,tiles=[],radius=e.bossIndex===5?1:2;for(let y=safe.y-radius;y<=safe.y+radius;y++)for(let x=safe.x-radius;x<=safe.x+radius;x++)tiles.push({x,y});zoneOutline(c,tiles,P.cyan);const p=project(safe.x,safe.y);label(c,'SEGURO',p.x/2,p.y/2,P.cyan,12);}if(e.bossIndex===5&&!e.windup.safe){const p=project(e.windup.x,e.windup.y);label(c,'SAIA! '+Math.max(0,e.windup.beat-s.run.beat),p.x/2,p.y/2-25,P.lemon,15);}}
   else for(const tile of dangerTiles(e.windup)){const p=project(tile.x,tile.y);c.strokeStyle=P.lemon;c.lineWidth=1.5;c.strokeRect(p.x/2-10,p.y/2-6,20,14);label(c,e.kind===1?'»':'!',p.x/2,p.y/2+5,P.lemon,13);}
  }
  if(!this.reduced)for(let i=0;i<7;i++){const x=(i*81+Math.sin(t*.4+i)*7)%530+35,y=65+(i*47+Math.cos(t*.3+i)*10)%235;c.globalAlpha=.3+Math.sin(t+i)*.15;ellipse(c,x,y,.8,.8,P.cyan);}c.globalAlpha=1;
  if(s.run?.room.explored){this.prepareFog(s.run.room);for(let i=0;i<2;i++){c.globalAlpha=i?.24:.42;c.fillStyle=P.ink;c.fill(this.fogPaths[i]);}c.globalAlpha=1;const hazard=s.run.room.environmentWarning;if(hazard){const p=project(s.run.player.x,s.run.player.y);label(c,hazard.type===3?'LAVA!':'SAIA!',p.x/2,p.y/2-35,P.lemon,12);}}
  if(s.run?.room.explored)this.sightHalo(c,s.run);if(s.run){this.hedgehogBurrow(c,s.run,time);this.powerShapes(c,s.run,time);this.ceilingWarnings(c,s.run,time);}
  if(s.run){for(const m of s.run.frenzy?.meteors||[]){const p=project(m.x,m.y);c.strokeStyle=P.lemon;c.lineWidth=3;c.beginPath();c.arc(p.x/2,p.y/2,20,0,Math.PI*2);c.stroke();label(c,'☄ '+Math.max(0,m.due-s.run.beat),p.x/2,p.y/2-24,P.lemon,15);}this.health(c,s);for(const boss of s.run.room.enemies)if(boss.boss&&boss.hp>0&&visible(s.run.room,boss)){const p=project(boss.x,boss.y),x=p.x/2,y=p.y/2,color=BOSSES[boss.bossIndex].color;label(c,BOSSES[boss.bossIndex].name.toUpperCase(),x,y-79,color,10);c.fillStyle=P.ink;c.fillRect(x-37,y-71,74,8);c.fillStyle=color;c.fillRect(x-35,y-69,70*Math.max(0,boss.hp/boss.maxHp),4);if(boss.windup)label(c,boss.bossIndex===5?'SUBMERSO':boss.windup.attack,x,y-53,P.lemon,8);}}
  if(this.flash>0&&!this.reduced){c.globalAlpha=this.flash*.15;c.fillStyle=P.red;c.fillRect(this.camera.x/2,this.camera.y/2,this.canvas.width/this.dpr/this.scale/2,this.canvas.height/this.dpr/this.scale/2);c.globalAlpha=1;this.flash=Math.max(0,this.flash-dt*2);}
  if(s.run?.room.explored&&!isAbyss(s.run))this.minimap(c,s);
 }
 hedgehogBurrow(c,r,time){
  const h=r.room.hedgehog;if(!h||(!visible(r.room,h)&&!visible(r.room,{x:h.x,y:h.y+1})))return;
  const p=project(h.x,h.y),x=p.x/2,y=p.y/2,bi=biomeIndex(r.floor),b=BIOME_ART[bi];
  // A giant spectator embedded in the cliff. Its silhouette can never cover a walkable tile.
  c.save();c.beginPath();c.rect(x-85,y-124,170,140);
  for(let gy=h.y-8;gy<=h.y+1;gy++)for(let gx=h.x-4;gx<=h.x+4;gx++)if(isFloor(r.room,gx,gy)){
   const q=project(gx,gy);c.moveTo(q.x/2-12,q.y/2-8);c.lineTo(q.x/2+10,q.y/2-8);c.lineTo(q.x/2+12,q.y/2+8);c.lineTo(q.x/2-10,q.y/2+8);c.closePath();
  }
  c.clip('evenodd');ellipse(c,x,y-45,74,59,b.shade);ellipse(c,x,y-43,65,54,P.ink);
  c.strokeStyle=b.rock;c.lineWidth=4;c.lineCap='round';c.beginPath();c.ellipse(x,y-45,71,56,0,Math.PI*1.02,Math.PI*1.91);c.stroke();
  c.save();c.beginPath();c.ellipse(x,y-43,65,54,0,0,Math.PI*2);c.clip();
  this.hedgehogPose(c,r,x,y+5,time);c.restore();
  ellipse(c,x,y+9,56,5,b.shade);c.restore();
 }
 hedgehogPose(c,r,x,y,time){
  const h=r.room.hedgehog,width=128,k=width/100,t=this.ambientAge||0,options={seed:r.room.seed+h.x*29+h.y,biome:biomeIndex(r.floor)};
  const breath=this.reduced?0:Math.sin(t*1.65),phase=beatPhase(musicFloor(r),time),blinkTime=t%6.8;
  const blink=this.reduced||blinkTime<6.5?0:Math.sin((blinkTime-6.5)/.3*Math.PI);
  const gazeX=this.reduced?0:Math.max(-1.2,Math.min(1.2,(this.player.x/2-x)/220)),gazeY=this.reduced?0:.5;
  const part=(layer,dx=0,dy=0,sx=1,sy=1)=>{const pivot=HEDGEHOG_PART_PIVOTS[layer]||[50,96],px=x+(pivot[0]-50)*k,py=y+(pivot[1]-96)*k;c.save();c.translate(px+dx,py+dy);c.scale(sx,sy);c.translate(-px,-py);drawAsset(c,'hedgehog',x,y,width,{...options,layer});c.restore();};
  part('shadow');part('body',0,0,1+breath*.004,1+breath*.014);part('crystals',0,-breath*.85);part('face',0,-breath*.45);
  part('eyes',gazeX,gazeY-breath*.45,1,1-blink*.94);
  for(const [i,layer]of ['paw-left','paw-right'].entries()){const beat=(phase+i)%2,lift=this.reduced||beat>=1?0:Math.sin(Math.PI*beat)**2*4;part(layer,0,-lift,1,1-lift*.009);}
  const growth=this.reduced?0:Math.max(0,1-(phase-(h.pulseBeat??-10))/2);
  if(growth>0){c.save();c.globalAlpha=growth*.65;for(const [i,dx]of [-24,0,24].entries()){const py=y-73-i%2*15-growth*5;c.strokeStyle=BIOME_ART[options.biome].accent;c.lineWidth=1.5;c.beginPath();c.moveTo(x+dx-3,py);c.lineTo(x+dx+3,py);c.moveTo(x+dx,py-3);c.lineTo(x+dx,py+3);c.stroke();}c.restore();}
 }
 mole(c,b,r,time,seed){
  const phase=beatPhase(musicFloor(r),time),w=b.windup,p=project(b.x,b.y),x=p.x/2,y=p.y/2;
  ellipse(c,x,y+2,26,11,P.bark);ellipse(c,x,y+1,20,7,P.coal);
  if(w){
   const u=Math.max(0,Math.min(1,(phase-w.startedBeat)/3)),to=project(w.x,w.y),sink=Math.max(0,Math.min(1,(phase-w.startedBeat)/.45));
   // Six bounded dirt ripples, no particles or fresh cached assets per frame.
   for(let i=0;i<6;i++){const f=Math.max(0,u-i*.055),tx=x+(to.x/2-x)*f,ty=y+(to.y/2-y)*f;c.globalAlpha=(1-i/7)*.85;ellipse(c,tx,ty,13-i,5,P.ochre);ellipse(c,tx,ty+2,11-i,3,P.clay);}c.globalAlpha=1;
   if(sink<1){c.globalAlpha=1-sink;drawAsset(c,'boss',x,y+sink*12,75*(1-sink*.55),{seed,variant:5});c.globalAlpha=1;}
   const a=Math.max(0,1-phase%1*2);c.strokeStyle=P.yellow;c.lineWidth=2;c.beginPath();c.ellipse(to.x/2,to.y/2,19+a*5,9+a*3,0,0,Math.PI*2);c.stroke();
  }else{
   const u=b.emergedAt===undefined?1:Math.max(0,Math.min(1,(phase-b.emergedAt)/.5));
   drawAsset(c,'boss',x,y-(this.reduced?0:Math.sin(u*Math.PI)*13),75,{seed,variant:5});
   label(c,'ATAQUE!',x,y+18,P.cyan,12);
  }
 }
 powerShapes(c,r,time){
  const x=this.player.x/2,y=this.player.y/2-12,soft=this.reduced,pulse=soft?0:Math.sin(time*5),has=id=>activeBoost(r,id);
  c.save();c.lineJoin='round';c.lineCap='round';
  if(has('shield')||(r.guardUntil>=0&&r.guardUntil>=Math.max(r.beat,r.acted))){
   c.globalAlpha=.12;c.fillStyle=P.yellow;c.beginPath();c.ellipse(x,y,29,34,0,0,Math.PI*2);c.fill();c.globalAlpha=.85;c.strokeStyle=P.lemon;c.lineWidth=2.3;c.stroke();
   c.beginPath();c.arc(x,y,22,-2.4,-1.2);c.stroke();
  }
  if(has('wings')){const lift=soft?0:pulse*3;c.globalAlpha=.95;
   for(const side of [-1,1])poly(c,[[x+side*9,y-8],[x+side*36,y-24-lift],[x+side*31,y-7],[x+side*24,y-10],[x+side*23,y],[x+side*15,y-3]],P.cyan);
   for(const side of [-1,1])poly(c,[[x+side*12,y-9],[x+side*31,y-21-lift],[x+side*22,y-9]],P.white);
  }
  if(has('lightning')){c.strokeStyle=P.cyan;c.lineWidth=2.5;for(let i=0;i<3;i++){const a=i*Math.PI*2/3+(soft?0:time*.7),px=x+Math.cos(a)*35,py=y+Math.sin(a)*30;c.beginPath();c.moveTo(px+4,py-9);c.lineTo(px-5,py+1);c.lineTo(px+3,py);c.lineTo(px-3,py+9);c.stroke();}}
  if(has('magnet')){c.save();c.translate(x,y-39);c.lineWidth=5;c.strokeStyle=P.pink;c.beginPath();c.arc(0,0,8,0,Math.PI);c.moveTo(-8,0);c.lineTo(-8,-7);c.moveTo(8,0);c.lineTo(8,-7);c.stroke();c.strokeStyle=P.white;c.lineWidth=3;c.beginPath();c.moveTo(-8,-7);c.lineTo(-8,-3);c.moveTo(8,-7);c.lineTo(8,-3);c.stroke();c.restore();
   for(let i=0;i<3;i++){const f=soft?.45:(time*.8+i/3)%1,a=i*2.1;c.globalAlpha=1-f;const px=x+Math.cos(a)*(46-32*f),py=y+Math.sin(a)*(30-20*f);poly(c,[[px,py-4],[px+3,py],[px,py+4],[px-3,py]],P.cyan);}c.globalAlpha=1;
  }
  if(has('fire')){for(const side of [-1,1])poly(c,[[x+side*9-5,y+18],[x+side*9-3,y+8],[x+side*9,y+13],[x+side*9+3,y+5-pulse*2],[x+side*9+6,y+18]],P.orange);}
  c.restore();
 }
 sightHalo(c,r){
  const radius=(r.room.sightRadius||5)*22,x=this.player.x/2,y=this.player.y/2-8;
  const light=c.createRadialGradient(x,y,radius*.55,x,y,radius);
  light.addColorStop(0,'#180d2f00');light.addColorStop(.6,'#180d2f66');light.addColorStop(1,'#180d2f');
  c.save();c.fillStyle=light;c.fillRect(this.camera.x/2-4,this.camera.y/2-4,this.viewWidth/2+8,this.viewHeight/2+8);c.restore();
 }
 prepareFog(room){
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
  c.fillStyle=P.wood;c.fill();c.strokeStyle=P.bark;c.lineWidth=2;c.stroke();
  label(c,'EXPLORADO '+progress+'%',x+width/2,y-8,P.sand,12);
  c.drawImage(this.mapCache,x,y);
  c.fillStyle=P.lemon;c.fillRect(x+s.run.player.x*3-1,y+s.run.player.y*3-1,5,5);
  c.fillStyle=P.bark;c.fillRect(x,y+height+9,width,9);
  c.fillStyle=progress===100?P.lemon:P.green;c.fillRect(x,y+height+9,width*progress/100,9);
  c.restore();
 }
}
