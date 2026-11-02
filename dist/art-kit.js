import {paintSoftShadowShape} from './soft-ground-shadow.js';
import {captureSceneryEmission} from './scenery-emission-bridge.js';
import {caveFindShapes} from './cave-find-shapes.js';
import {bossShapes} from './boss-art.js';
import {creatureShapes} from './creature-art.js';
import {sceneShapes,softenPolygon} from './scene-art.js';
import {P,GEM_RAMPS,BIOME_ART} from './palette.js';
import {PICKAXE_STYLES} from './pickaxe-style.js';
import {drawApprovedArt} from './approved-art.js';

// The generator owns silhouette, proportions, light direction and materials.
// Seeds vary large shapes only. No texture noise, gradients or random colors.
export const ART_TYPES=Object.freeze(['boss','rabbit','crystal','rock','miner','pickaxe','zag','drill','ticket','gardener','hedgehog','slime','bat','golem','tree','bush','molehill','mushroom','fossil','lava','forge','board','shrine','lift','well','gramophone','tent','roulette','crate','lantern','campfire','potion','shield','cave-chest','cave-mushroom']);
export const ART_ACCENT_PIVOTS=Object.freeze({well:Object.freeze([50,36]),shrine:Object.freeze([50,35]),tree:Object.freeze([50,58]),forge:Object.freeze([38,88]),zag:Object.freeze([77,80]),gramophone:Object.freeze([75,58]),roulette:Object.freeze([50,45]),hedgehog:Object.freeze([51,94]),gardener:Object.freeze([51,94])});
export const HEDGEHOG_PART_PIVOTS=Object.freeze({shadow:Object.freeze([50,96]),body:Object.freeze([50,89]),crystals:Object.freeze([50,55]),face:Object.freeze([50,78]),eyes:Object.freeze([50,76]),'paw-left':Object.freeze([25,90]),'paw-right':Object.freeze([77,90])});
const DRAW_LAYERS=new Set(['base','accent',...Object.keys(HEDGEHOG_PART_PIVOTS)]);
export const ART_RULES=Object.freeze({width:100,height:110,anchorX:50,anchorY:96,outline:2.8,light:'top-left',maxShapes:30,palette:'HEPT32'});
function random(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const cache=new Map(),paths=new Map(),shapePaths=new WeakMap(),sprites=new Map();
// Bounded raster cache: reuse the procedural art, including every teleport ghost.
const SPRITE_LIMIT=256;
export function generateAsset(type,{seed=1,variant=0,biome=0}={}){
 if(!ART_TYPES.includes(type))throw new RangeError('Unknown art family: '+type);
 seed=Number(seed)>>>0;variant=type==='pickaxe'?Math.max(0,Math.min(9,Math.floor(Number(variant)||0))):(Number(variant)>>>0)%(type==='boss'?BIOME_ART.length:4);biome=(Number(biome)>>>0)%BIOME_ART.length;
 const key=type+':'+seed+':'+variant+':'+biome;if(cache.has(key))return cache.get(key);
 const s=[],r=random(seed),j=Math.round(r()*8)-4,b=BIOME_ART[biome];
 const path=(d,fill,outline=true)=>s.push({type:'path',d,fill,stroke:outline?P.ink:null});
 const ellipse=(cx,cy,rx,ry,fill,outline=false)=>s.push({type:'ellipse',cx,cy,rx,ry,fill,stroke:outline?P.ink:null});
 const rect=(x,y,width,height,fill,radius=0,outline=false)=>s.push({type:'rect',x,y,width,height,radius,fill,stroke:outline?P.ink:null});
 const shadow=(rx=32)=>ellipse(50,96,rx,7,P.ink);
 const eyes=(y=65,space=12)=>{rect(50-space-3,y,5,8,P.ink,2);rect(50+space-2,y,5,8,P.ink,2);};
 const crystal=(x,y,w,h,colors)=>{const [base,shade]=colors;path(`M ${x} ${y-h} L ${x-w} ${y-h*.65} L ${x-w*.8} ${y-4} L ${x} ${y+3} L ${x+w*.8} ${y-4} L ${x+w} ${y-h*.65} Z`,base);path(`M ${x} ${y-h} L ${x+w} ${y-h*.65} L ${x+w*.8} ${y-4} L ${x} ${y+3} Z`,shade,false);path(`M ${x-w*.55} ${y-h*.62} L ${x-w*.35} ${y-h*.25}`,P.white,false);};
 const composed=caveFindShapes(type,{variant,biome,j})||sceneShapes(type,{variant,biome,j});
 if(composed)s.push(...composed);
 else if(type==='boss')s.push(...bossShapes(variant));
 else if(['slime','gardener','hedgehog','bat','golem'].includes(type))s.push(...creatureShapes(type,{seed,variant,biome}));
 else if(type==='zag'){
  shadow(36);rect(22,67,55,30,P.plum,8,true);rect(32,85,14,14,P.ink,3);rect(55,85,14,14,P.ink,3);
  path('M 27 43 Q 10 29 5 33 Q 5 51 16 58 L 29 61 Z M 73 43 Q 90 29 95 33 Q 95 51 84 58 L 71 61 Z',P.lime);
  path('M 13 40 Q 13 51 27 54 L 23 46 Z M 87 40 Q 87 51 73 54 L 77 46 Z',P.green,false);
  rect(24,25,52,49,P.lime,16,true);path('M 64 29 Q 85 65 58 76 L 50 68 L 63 53 Z',P.green,false);
  path('M 24 30 Q 26 14 31 13 L 64 13 Q 70 14 76 30 Z',P.plum);rect(18,27,65,8,P.pink,3,true);ellipse(50,26,6,6,P.yellow,true);
  rect(33,43,9,10,variant===1?P.white:P.lemon,2,true);rect(58,43,9,10,variant===1?P.white:P.lemon,2,true);
  path(variant===2?'M 34 59 Q 50 85 68 57 Z':'M 33 59 Q 53 69 69 55 L 65 68 L 43 71 Z',P.ink);rect(42,61,7,7,P.white,1);rect(56,60,6,7,P.yellow,1);
  path('M 34 75 L 50 92 L 68 74 L 62 89 L 50 97 L 38 87 Z',P.gold);ellipse(50,86,6,6,P.lemon,true);
  rect(15,76,18,13,P.lime,5,true);rect(68,76,18,13,P.lime,5,true);s[s.length-1].layer='accent';
 }else if(type==='drill'){
  path('M 28 35 Q 19 20 25 9 Q 32 21 38 22 Q 45 17 43 5 Q 55 17 48 35 Z M 57 34 Q 52 16 62 7 Q 64 21 71 22 Q 78 18 81 12 Q 83 29 74 38 Z',P.orange);path('M 34 33 Q 31 23 35 21 Q 41 30 43 18 Q 48 28 44 35 Z M 61 34 Q 62 22 65 23 Q 70 33 74 25 Q 77 34 71 36 Z',P.lemon,false);
  rect(17,32,15,38,P.plum,4,true);rect(69,32,15,38,P.plum,4,true);rect(23,28,54,39,P.cyan,8,true);rect(62,32,13,31,P.blue,4);rect(30,38,32,8,P.ink,3);rect(34,40,20,4,P.lemon,1);
  path('M 26 64 L 74 64 L 50 105 Z',P.silver);path('M 61 64 L 74 64 L 50 105 Z',P.steel,false);
  path('M 30 72 L 68 76 L 63 83 L 35 79 Z M 40 87 L 59 89 L 55 95 L 45 94 Z',P.slate,false);
 }else if(type==='ticket'){
  path('M 12 30 L 88 30 L 88 48 Q 73 55 88 62 L 88 81 L 12 81 L 12 62 Q 27 55 12 48 Z',P.yellow);rect(25,36,50,39,P.gold,3);path('M 50 39 L 56 49 L 67 51 L 59 59 L 60 70 L 50 65 L 40 70 L 41 59 L 33 51 L 44 49 Z',P.plum);rect(16,35,4,10,P.lemon,1);rect(80,66,4,10,P.lemon,1);
 }else if(type==='pickaxe'){
  const style=PICKAXE_STYLES[variant],edge=variant>=6?6:variant>=2?3:0;
  path('M 45 94 L 34 87 L 62 24 L 72 29 Z',style.handle);path('M 53 76 L 63 46 L 68 48 L 56 79 Z',style.shade,false);
  path(`M 13 40 Q 42 ${6-edge} 76 26 L ${90+edge} ${45+edge} Q 62 30 44 35 Z`,style.metal);path(`M 44 35 Q 64 28 ${90+edge} ${45+edge} L 76 26 L 66 23 L 69 32 Z`,style.shade,false);
  if(variant>=1)path('M 38 78 L 48 83 L 45 89 L 35 84 Z',style.metal);
  if(variant>=2)crystal(61,38,5,16,[style.metal,style.shade]);
  if(variant>=4)path('M 24 30 Q 28 19 34 18 L 43 16 Q 42 24 35 28 Z',style.metal);
  if(variant>=6)path('M 53 59 L 61 53 L 57 66 L 49 72 Z',P.cyan,false);
  if(variant>=8)path('M 47 22 Q 44 11 47 9 L 53 14 L 58 6 Q 63 9 62 20 Z',style.metal);
  if(variant===9){path('M 66 42 L 79 49 L 65 53 L 60 66 L 57 51 L 45 47 L 60 46 Z',P.lemon);path('M 28 89 L 39 81 L 47 94 L 36 100 Z',P.cyan);}
 }else if(type==='bush'){
  shadow(34);
  path('M 17 72 Q 17 64 25 64 L 70 64 Q 85 64 85 76 L 85 89 Q 85 99 73 99 L 29 99 Q 17 99 17 88 Z',P.forest);
  path(`M 15 74 Q 15 66 22 64 L 22 ${58+j*.25} Q 22 52 30 52 L 68 52 Q 77 52 77 60 Q 87 61 87 71 L 87 80 Q 85 89 76 89 L 26 89 Q 15 86 15 74 Z`,P.green);
  path('M 23 65 Q 23 58 31 58 L 67 58 Q 72 58 72 64 L 72 71 L 23 71 Z',P.lime,false);
 }else if(type==='fossil'){
  shadow(36);path('M 14 82 Q 47 47 86 73 Q 89 78 82 82 Q 46 62 20 91 Q 12 93 14 82 Z',P.sand);path('M 20 86 Q 47 60 82 78 L 82 82 Q 46 62 20 91 Z',P.ochre,false);
  for(let i=0;i<4;i++)path(`M ${28+i*13} 73 Q ${19+i*13} 49 ${33+i*13} 47 L ${37+i*13} 51 Q ${28+i*13} 58 ${34+i*13} 72 Z`,P.sand);
 }else if(type==='lava'){
  ellipse(50,88,44,14,P.maroon);path(`M 9 88 Q 11 76 32 76 Q 47 ${65+j} 65 72 Q 85 70 92 84 Q 96 99 56 100 Q 21 100 9 88 Z`,P.orange);path('M 23 85 Q 27 77 43 80 Q 58 73 73 80 Q 79 89 56 92 Q 31 94 23 85 Z',P.yellow,false);
 }else if(type==='tent'){
  shadow(43);path('M 8 94 Q 24 61 46 29 Q 49 24 52 29 Q 72 61 93 94 Q 53 101 8 94 Z',P.orange);path('M 52 29 Q 72 61 93 94 Q 82 97 70 97 Q 65 62 52 29 Z',P.red,false);path('M 28 96 Q 39 66 49 49 Q 59 66 70 96 Z',P.ink);path('M 49 49 Q 59 66 70 96 L 54 94 Z',P.maroon,false);rect(6,94,89,4,P.clay,1);
 }else if(type==='roulette'){
  shadow(37);rect(35,72,30,22,P.wood,6,true);rect(42,68,16,23,P.gold,4);rect(25,91,50,6,P.clay,3,true);
  const start=s.length,colors=[P.cyan,P.pink,P.lemon,P.green,P.orange,P.blue,P.lime,P.gold];
  ellipse(50,45,35,35,P.gold,true);ellipse(50,45,31,31,P.ink);
  for(let i=0;i<8;i++){const a=(-90+i*45)*Math.PI/180,b=a+Math.PI/4;path(`M 50 45 L ${50+29*Math.cos(a)} ${45+29*Math.sin(a)} A 29 29 0 0 1 ${50+29*Math.cos(b)} ${45+29*Math.sin(b)} Z`,colors[i]);}
  ellipse(50,45,10,10,P.ink,true);ellipse(50,45,6,6,P.lemon);ellipse(47,42,2,2,P.white);
  for(let i=start;i<s.length;i++)s[i].layer='accent';
 }else if(type==='lantern'){
  shadow(20);rect(46,42,8,55,P.wood,3,true);rect(45,42,4,51,P.clay,2);rect(31,24,38,35,P.gold,7,true);rect(39,30,21,22,P.lemon,4);path('M 29 25 Q 33 14 39 14 L 62 14 Q 68 14 72 25 Z',P.slate);rect(31,57,38,7,P.slate,3);ellipse(50,13,6,7,P.slate,true);ellipse(50,13,2,3,P.ink);
 }else if(type==='campfire'){
  shadow(35);path('M 17 88 L 23 80 L 84 93 L 79 102 Z',P.clay);path('M 19 94 L 77 81 L 82 89 L 25 103 Z',P.wood);
  path(`M 25 83 Q 19 66 34 51 Q 30 65 40 65 Q 60 ${26+j} 53 23 Q 85 56 73 82 Q 69 96 49 97 Q 32 96 25 83 Z`,P.orange);path('M 41 89 Q 31 76 47 59 Q 45 70 52 72 Q 58 64 60 59 Q 70 81 59 91 Q 51 98 41 89 Z',P.yellow,false);
 }
 const asset=Object.freeze({type,seed,variant,biome,visualKey:type+':'+j+':'+variant+':'+biome,width:100,height:110,anchor:Object.freeze({x:50,y:96}),shapes:Object.freeze(s.map(shape=>Object.freeze({...shape,...(shape.type==='path'&&!shape.hardEdges?{d:softenPolygon(shape.d,type==='boss'?3.5:2.2)}:{}),layer:shape.layer||'base'})))});
 if(cache.size>=512)cache.delete(cache.keys().next().value);cache.set(key,asset);return asset;
}
function shapePath(s){if(shapePaths.has(s))return shapePaths.get(s);let p;if(s.type==='path'){if(!paths.has(s.d)){if(paths.size>=2048)paths.delete(paths.keys().next().value);paths.set(s.d,new Path2D(s.d));}p=paths.get(s.d);}else{p=new Path2D();if(s.type==='ellipse')p.ellipse(s.cx,s.cy,s.rx,s.ry,0,0,Math.PI*2);else p.roundRect(s.x,s.y,s.width,s.height,s.radius);}shapePaths.set(s,p);return p;}
function paintAsset(ctx,a,layer='all',omitGroundShadow=false){ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=ART_RULES.outline;for(const s of a.shapes){if(omitGroundShadow&&a.type==='miner'&&s===a.shapes[0])continue;if(layer!=='all'&&s.layer!==layer&&s.part!==layer)continue;const p=shapePath(s);if(s.matrix){ctx.save();ctx.transform(...s.matrix);}const softShadow=paintSoftShadowShape(ctx,s);if(s.fill&&!softShadow){ctx.fillStyle=s.fill;ctx.fill(p);}if(s.stroke&&!softShadow){ctx.lineWidth=s.strokeWidth??ART_RULES.outline;ctx.strokeStyle=s.stroke;ctx.stroke(p);}if(s.matrix)ctx.restore();}}
export function drawAsset(ctx,type,x,y,width=32,options={}){if(!['rock','crystal'].includes(type)&&!options.procedural&&drawApprovedArt(ctx,type,x,y,width,options))return;const a=generateAsset(type,options),scale=width/a.width,layer=DRAW_LAYERS.has(options.layer)?options.layer:'all',omitGroundShadow=type==='miner'&&options.omitGroundShadow===true;
 // Large art-studio previews retain vector quality; gameplay uses a crisp 2× sprite.
 if((width<=120||((type==='hedgehog'||type==='gardener')&&width<=160))&&typeof document!=='undefined'){
  // Seeds with identical geometry share pixels. Recycle evicted canvases instead
  // of creating hundreds of GPU-backed surfaces every frame in a dense room.
  const density=['rock','crystal','lantern','fossil','mushroom','bush','molehill','lava'].includes(type)?2:width>50?2:1,key=a.visualKey+':'+density+':'+layer+(omitGroundShadow?':no-ground-shadow':'');
  let sprite=sprites.get(key);if(sprite){sprites.delete(key);sprites.set(key,sprite);}else{if(sprites.size>=SPRITE_LIMIT){const oldest=sprites.keys().next().value;sprite=sprites.get(oldest);sprites.delete(oldest);}else sprite=document.createElement('canvas');sprite.width=108*density;sprite.height=118*density;const c=sprite.getContext('2d');c.scale(density,density);c.translate(4,4);paintAsset(c,a,layer,omitGroundShadow);sprites.set(key,sprite);}
  ctx.drawImage(sprite,x-(a.anchor.x+4)*scale,y-(a.anchor.y+4)*scale,108*scale,118*scale);if(type==='mushroom'||type==='cave-mushroom')captureSceneryEmission(ctx,'mushroom',{a,type,x,y,width,options});return;
 }
 ctx.save();ctx.translate(x-a.anchor.x*scale,y-a.anchor.y*scale);ctx.scale(scale,scale);paintAsset(ctx,a,layer,omitGroundShadow);ctx.restore();if(type==='mushroom'||type==='cave-mushroom')captureSceneryEmission(ctx,'mushroom',{a,type,x,y,width,options});
}
export function assetSvgBody(a){return a.shapes.map(s=>{const style=`${s.matrix?'transform="matrix('+s.matrix.join(' ')+')" ':''}fill="${s.fill||'none'}" stroke="${s.stroke||'none'}" stroke-width="${s.strokeWidth??ART_RULES.outline}" stroke-linejoin="round" stroke-linecap="round"`;if(s.type==='path')return `<path d="${s.d}" ${style}/>`;if(s.type==='ellipse')return `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" ${style}/>`;return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" rx="${s.radius}" ${style}/>`;}).join('');}
export function assetToSvg(a){return `<svg xmlns="http://www.w3.org/2000/svg" width="${a.width}" height="${a.height}" viewBox="0 0 ${a.width} ${a.height}" role="img" aria-label="Gemventure ${a.type}">${assetSvgBody(a)}</svg>`;}

// The existing bounded LRU owns both miner variants.
drawAsset.supportsGroundShadowControl=true;
