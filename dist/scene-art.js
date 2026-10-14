import {P,BIOME_ART,GEM_RAMPS} from './palette.js';
import {PACK_PARTS} from './pack-art.js';

// Seed changes proportions, never construction, silhouette identity or materials.
function place(name,m){return PACK_PARTS[name].map(shape=>{const b=shape.matrix||[1,0,0,1,0,0];return {...shape,matrix:Object.freeze([m[0]*b[0]+m[2]*b[1],m[1]*b[0]+m[3]*b[1],m[0]*b[2]+m[2]*b[3],m[1]*b[2]+m[3]*b[3],m[0]*b[4]+m[2]*b[5]+m[4],m[1]*b[4]+m[3]*b[5]+m[5]])};});}
// Round authored polygons once. Open strokes and hand-drawn curves stay intact.
export function softenPolygon(d,radius=2.2){return d.replace(/M[^M]+/g,part=>{
 if(!/^[MLZ\s\d.,eE+-]+$/.test(part)||!part.trim().endsWith('Z'))return part;
 const n=part.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi)?.map(Number)||[];
 if(n.length<6||n.length%2)return part;
 const v=[];for(let i=0;i<n.length;i+=2)v.push([n[i],n[i+1]]);
 const f=n=>Number(n.toFixed(3)),p=v.map((p,i)=>{const a=v[(i+v.length-1)%v.length],b=v[(i+1)%v.length],da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]),r=Math.min(radius,da*.25,db*.25);return {p,in:[p[0]+(a[0]-p[0])*r/(da||1),p[1]+(a[1]-p[1])*r/(da||1)],out:[p[0]+(b[0]-p[0])*r/(db||1),p[1]+(b[1]-p[1])*r/(db||1)]};});
 return 'M '+p[0].out.map(f).join(' ')+' '+p.slice(1).concat(p[0]).map(p=>'L '+p.in.map(f).join(' ')+' Q '+p.p.map(f).join(' ')+' '+p.out.map(f).join(' ')).join(' ')+' Z ';
});}

export function sceneShapes(type,{variant=0,biome=0,j=0}={}){
 const s=[],b=BIOME_ART[biome];let layer='base';
 const path=(d,fill,outline=true)=>s.push({type:'path',d,fill,layer,stroke:outline?P.ink:null}),rect=(x,y,width,height,fill,radius=0,outline=false)=>s.push({type:'rect',x,y,width,height,radius,fill,layer,stroke:outline?P.ink:null}),ellipse=(cx,cy,rx,ry,fill,outline=false)=>s.push({type:'ellipse',cx,cy,rx,ry,fill,layer,stroke:outline?P.ink:null});
 const shadow=(rx=38)=>ellipse(50,96,rx,5,P.ink);
 const gem=(x,y,w,h,colors=GEM_RAMPS[0])=>{path('M '+x+' '+(y-h)+' L '+(x-w)+' '+(y-h*.68)+' L '+(x-w)+' '+(y-7)+' L '+x+' '+(y+1)+' L '+(x+w)+' '+(y-7)+' L '+(x+w)+' '+(y-h*.68)+' Z',colors[0]);path('M '+x+' '+(y-h)+' L '+(x+w)+' '+(y-h*.68)+' L '+(x+w)+' '+(y-7)+' L '+x+' '+(y+1)+' Z',colors[1],false);};
 if(type==='rabbit'){
  shadow(31);
  path('M 25 61 Q 14 43 21 17 Q 29 8 37 22 L 43 56 Z M 57 55 L 64 20 Q 73 7 81 17 Q 88 40 75 63 Z',P.white);
  path('M 28 52 Q 22 33 27 21 Q 32 18 35 31 L 39 54 Z M 64 53 L 69 29 Q 74 18 78 22 Q 83 36 72 54 Z',P.blush,false);
  path('M 19 81 Q 18 57 39 52 Q 61 46 77 61 Q 87 76 77 94 Q 66 103 40 101 Q 20 99 19 81 Z',P.white);
  path('M 66 54 Q 81 62 82 78 Q 82 100 53 101 L 39 101 Q 68 92 67 71 Z',P.silver,false);
  ellipse(39,75,6,7,P.ink);ellipse(65,75,6,7,P.ink);ellipse(37,72,2,2,P.white);ellipse(63,72,2,2,P.white);
  path('M 43 84 Q 51 80 60 84 Q 57 92 51 94 Q 45 92 43 84 Z',P.rose);ellipse(51,83,4,3,P.blush);
 }else if(type==='crystal'){
  shadow(36);const ramp=GEM_RAMPS[variant];
  path('M 11 88 Q 12 77 28 77 L 76 77 Q 90 79 90 91 Q 84 101 68 101 L 31 101 Q 14 99 11 88 Z',b.rock);
  path('M 76 77 Q 90 79 90 91 Q 84 101 68 101 L 31 101 Q 17 100 13 94 L 69 94 Q 82 92 76 77 Z',b.shade,false);
  gem(27,89,11,42+j,ramp);gem(73,88,11,34-j,ramp);gem(49,92,16,68+j,ramp);rect(40,44,4,17,P.white,2);
 }else if(type==='potion'){
  shadow(25);path('M 37 16 L 63 16 L 63 40 Q 79 50 79 70 L 79 88 Q 79 100 65 100 L 35 100 Q 21 100 21 88 L 21 70 Q 21 50 37 40 Z',P.silver);
  path('M 62 17 L 63 40 Q 79 50 79 70 L 79 88 Q 79 100 65 100 L 46 100 Q 66 91 66 72 L 58 44 Z',P.steel,false);
  path('M 28 65 Q 49 69 72 65 L 72 86 Q 72 94 61 94 L 39 94 Q 28 94 28 86 Z',P.pink);
  path('M 60 67 L 72 65 L 72 86 Q 72 94 61 94 L 43 94 Q 61 84 60 67 Z',P.rose,false);
  rect(34,11,32,17,P.clay,4,true);rect(55,14,9,12,P.wood,3);rect(44,74,13,4,P.white,1);rect(49,69,4,14,P.white,1);rect(29,53,5,11,P.white,2);
 }else if(type==='shield'){
  shadow(30);path('M 50 13 Q 66 24 83 26 L 82 62 Q 80 85 50 101 Q 20 85 18 62 L 17 26 Q 34 24 50 13 Z',P.steel);
  path('M 50 13 Q 66 24 83 26 L 82 62 Q 80 85 50 101 L 50 89 Q 72 68 70 34 Z',P.slate,false);
  path('M 50 27 Q 63 34 71 35 L 71 61 Q 70 76 50 88 Q 30 76 29 61 L 29 35 Q 39 33 50 27 Z',P.cyan);
  path('M 50 27 Q 63 34 71 35 L 71 61 Q 70 76 50 88 Z',P.blue,false);path('M 50 43 L 61 57 L 50 74 L 39 57 Z',P.lemon);
 }else if(type==='miner'){
  shadow(26);rect(19,58,17,30,P.orange,7,true);rect(20,62,9,17,P.red,3);
  s.push(...place('minerBody',[2.1,0,0,2.1,16.4,-33]));rect(39,76,24,6,P.ink,2);rect(48,76,7,6,P.gold,2);
  s.push(...place('minerHelmet',[1,0,0,1,18,-6]));rect(31,62,4,12,P.clay,2);rect(66,62,4,12,P.clay,2);
  if(variant){const c=[P.cyan,P.cyan,P.lemon,P.pink][variant];rect(38,72,5,4,c,2);rect(59,72,5,4,c,2);}
 }else if(type==='forge'){
  shadow(44);
  // Shared village view: a front plane, one right side and a visible roof top.
  path('M 70 47 L 87 39 L 87 91 L 70 96 Z',P.ochre);
  rect(14,45,59,50,P.sand,6,true);
  rect(69,7,13,34,P.steel,3,true);rect(67,5,17,8,P.slate,3,true);
  path('M 7 42 L 24 19 L 72 19 L 91 37 L 74 45 L 13 45 Z',P.orange);
  path('M 72 19 L 91 37 L 74 45 L 61 42 Z',P.red,false);
  rect(7,41,67,8,P.wood,3,true);path('M 74 41 L 92 35 L 93 42 L 74 49 Z',P.wood);
  path('M 22 94 L 22 71 Q 22 55 38 55 Q 54 55 54 71 L 54 94 Z',P.wood);path('M 28 94 L 28 72 Q 28 62 38 62 Q 48 62 48 72 L 48 94 Z',P.ink);
  rect(57,56,12,16,P.wood,3,true);rect(60,59,6,10,P.gold,2);rect(10,92,64,10,P.steel,4,true);path('M 74 92 L 90 86 L 90 96 L 74 102 Z',P.slate);
  path('M 60 83 L 81 83 Q 91 83 93 76 L 93 88 L 81 91 L 81 96 L 86 99 L 58 99 L 63 95 L 63 90 L 58 88 Z',P.slate);rect(56,80,28,7,P.steel,2,true);
  layer='accent';path('M 30 90 Q 26 81 34 74 Q 33 82 38 81 Q 45 73 42 67 Q 54 80 46 90 Z',P.orange,false);path('M 36 90 Q 31 85 39 78 Q 46 85 42 90 Z',P.yellow,false);
 }else if(type==='gramophone'){
  shadow(42);
  path('M 54 70 Q 65 51 48 39 L 42 42 Q 56 56 47 67 Z',P.gold);
  path('M 49 40 Q 34 47 15 37 Q 4 31 7 18 Q 11 4 32 6 Q 46 7 53 18 Q 57 28 49 40 Z',P.gold);
  path('M 37 8 Q 50 14 53 20 Q 57 29 49 40 Q 37 46 24 40 Q 47 40 44 25 Q 43 15 37 8 Z',P.ochre,false);
  ellipse(27,24,18,13,P.bark,true);ellipse(27,22,13,8,P.maroon);
  rect(10,66,80,31,P.clay,10,true);rect(77,69,11,26,P.wood,5);
  ellipse(50,67,39,13,P.ochre,true);ellipse(55,67,26,9,P.ink,true);ellipse(55,67,19,6,P.slate);ellipse(55,67,10,4,P.pink);ellipse(55,67,3,2,P.lemon);
  rect(17,87,65,5,P.wood,2);ellipse(84,79,4,4,P.gold,true);
  layer='accent';path('M 78 53 Q 89 53 86 62 L 73 70',P.gold,false);ellipse(76,70,5,3,P.sand);ellipse(79,42,3,3,P.cyan);
 }else if(type==='lift'){
  shadow(43);path('M 21 37 Q 21 23 37 23 L 66 23 Q 81 23 81 37 L 81 95 L 21 95 Z',P.ink);
  path('M 75 25 L 87 19 L 94 24 L 87 96 L 75 96 Z',P.wood);
  rect(13,24,13,72,P.clay,4,true);rect(74,24,13,72,P.clay,4,true);rect(21,25,5,68,P.wood,2);rect(82,25,5,68,P.wood,2);
  path('M 8 20 L 18 13 L 85 13 L 92 20 Z',P.ochre);
  rect(8,20,84,13,P.clay,4,true);rect(9,29,82,5,P.wood,2);ellipse(50,16,11,11,P.wood,true);ellipse(50,16,5,5,P.sand,true);
  rect(47,25,6,40,P.sand,2);rect(34,63,33,28,P.clay,3,true);rect(57,64,8,27,P.wood,2);rect(33,67,35,5,P.ochre,2);rect(33,83,35,6,P.ochre,2);
  rect(41,73,3,10,P.wood,1);rect(52,73,3,10,P.wood,1);rect(10,94,80,8,P.wood,3,true);rect(14,91,72,5,P.clay,2);
  rect(87,55,6,23,P.wood,2,true);ellipse(90,55,6,6,P.gold,true);rect(81,75,16,5,P.clay,2,true);
 }else if(type==='well'){
  shadow(41);path('M 11 75 L 11 88 Q 11 102 50 102 Q 89 102 89 88 L 89 75 Z',P.steel);path('M 50 79 L 89 75 L 89 88 Q 89 102 50 102 Z',P.slate,false);
  ellipse(50,75,39,15,P.steel,true);ellipse(50,75,28,8,P.ink);ellipse(50,74,24,5,P.blue);ellipse(45,74,14,3,P.cyan);
  path('M 26 91 L 26 99 M 51 92 L 51 102 M 74 90 L 74 99',P.slate);
  rect(8,55,13,25,P.slate,5,true);rect(79,55,13,25,P.slate,5,true);gem(14.5,59,6,19);gem(85.5,59,6,19);
  layer='accent';gem(50,57,15,42);rect(42,27,4,15,P.white,2);
 }else if(type==='board'){
  shadow(42);rect(16,45,11,54,P.clay,3,true);path('M 74 43 L 88 36 L 88 95 L 74 99 Z',P.wood);rect(74,45,11,54,P.clay,3,true);rect(23,46,4,51,P.wood,1);rect(81,46,4,51,P.wood,1);
  path('M 10 30 L 77 30 L 91 23 L 91 76 L 77 83 L 10 83 Z',P.wood);
  rect(10,29,70,53,P.clay,4,true);rect(16,36,59,39,P.wood,3);rect(7,79,73,8,P.ochre,3,true);
  path('M 6 29 L 23 13 L 76 13 L 94 27 L 79 31 L 10 31 Z',P.orange);path('M 76 13 L 94 27 L 79 31 L 67 28 Z',P.red,false);rect(6,28,74,7,P.wood,3,true);
  rect(20,42,27,28,P.sand,3,true);rect(25,48,17,4,P.clay,2);rect(25,57,12,4,P.clay,2);ellipse(34,43,3,3,P.pink,true);
  rect(53,43,18,23,P.lemon,3,true);ellipse(62,44,3,3,P.cyan,true);gem(62,62,4,10,[P.yellow,P.gold]);
 }else if(type==='shrine'){
  shadow(38);rect(15,88,70,12,P.slate,5,true);ellipse(50,86,33,10,P.steel,true);rect(37,56,26,28,P.blue,6,true);rect(53,59,8,26,P.deepBlue,3);ellipse(50,57,18,6,P.steel,true);
  layer='accent';const points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?15:32;points.push([50+Math.cos(a)*r,35+Math.sin(a)*r]);}path('M '+points.map(p=>p.map(n=>+n.toFixed(2)).join(' ')).join(' L ')+' Z',P.yellow);
  path('M 50 3 L 59.4 22.9 L 80.4 25.1 L 64.3 39.6 L 68.8 60.9 L 50 50 Z',P.gold,false);ellipse(41,28,3,5,P.lemon);
 }else if(type==='tree'){
  shadow(44);path('M 26 98 Q 35 91 37 75 L 40 38 L 59 38 L 62 75 Q 65 91 77 97 Q 66 101 58 93 Q 55 102 48 102 Q 42 99 41 92 Q 31 102 26 98 Z',P.clay);
  path('M 53 39 L 59 38 L 62 75 Q 65 91 77 97 Q 66 101 58 93 Q 55 102 48 102 L 48 83 Q 56 65 53 39 Z',P.wood,false);
  path('M 41 59 Q 26 51 25 35 L 33 35 Q 34 47 45 50 Z M 56 54 Q 72 45 73 32 L 80 33 Q 80 53 59 64 Z',P.clay);gem(49,90,7,20);
  layer='accent';
  path('M 11 39 Q 11 30 20 30 L 26 30 L 26 24 Q 26 16 35 16 L 65 16 Q 74 16 74 24 L 74 30 L 82 30 Q 91 30 91 39 L 91 59 Q 91 70 80 70 L 21 70 Q 11 70 11 59 Z',P.green);
  path('M 72 17 Q 74 19 74 24 L 74 30 L 82 30 Q 91 30 91 39 L 91 59 Q 91 70 80 70 L 21 70 Q 49 66 68 53 Q 81 43 72 17 Z',P.forest,false);
  path('M 13 38 Q 15 32 23 32 L 29 32 L 29 25 Q 29 20 36 20 L 64 20 Q 70 20 70 25 L 70 32 L 79 32 Q 86 32 88 38 L 76 45 L 24 45 Z',P.lime,false);
 }else if(type==='rock'){
  shadow(39);path('M 10 80 Q 12 61 26 50 Q '+(40+j)+' 39 62 45 Q 82 49 89 73 Q 96 94 75 99 L 29 99 Q 7 96 10 80 Z',b.rock);
  path('M 65 46 Q 82 49 89 73 Q 96 94 75 99 L 29 99 Q 14 99 11 90 Q 50 100 69 83 Q 78 71 65 46 Z',b.shade,false);
  if(variant)path('M 43 48 L 40 63 L 50 71 L 47 86 L 55 72 L 47 60 L 49 49 Z',P.ink,false);
  if(variant>1)path('M 16 76 L 30 79 L 37 92 L 33 77 L 22 70 Z',P.ink,false);
 }else if(type==='molehill'){
  shadow(42);path('M 7 91 Q 18 '+(46+j)+' 49 48 Q 79 47 94 91 Q 89 102 72 101 L 28 101 Q 12 101 7 91 Z',P.clay);path('M 64 51 Q 85 59 94 91 Q 89 102 72 101 L 28 101 L 15 96 Q 71 99 74 81 Z',P.wood,false);
  path('M 26 90 Q 28 63 49 63 Q 73 63 77 90 Z',P.bark);path('M 35 89 Q 37 73 51 73 Q 65 73 68 89 Z',P.coal,false);gem(20,85,7,22,[P.yellow,P.gold]);gem(81,86,6,17,[P.yellow,P.gold]);
 }else if(type==='mushroom'){
  shadow(28);path('M 40 56 L 61 56 L 63 84 Q 71 101 49 101 Q 29 101 38 84 Z',P.sand);path('M 54 57 L 61 56 L 63 84 Q 71 101 49 101 L 44 97 Q 61 95 55 82 Z',P.ochre,false);
  path('M 10 61 Q 20 '+(18+j)+' 49 21 Q 79 18 91 61 Q 88 74 51 76 Q 14 74 10 61 Z',P.pink);path('M 69 25 Q 83 34 91 61 Q 88 74 51 76 Q 14 74 10 61 Q 48 76 76 54 Z',P.rose,false);ellipse(33,44,8,5,P.lemon);ellipse(59,34,6,4,P.lemon);
 }else if(type==='crate'){
  shadow(37);rect(15,39,70,61,P.clay,7,true);rect(70,42,13,56,P.wood,5);rect(15,39,70,13,P.ochre,5,true);rect(21,48,9,46,P.ochre,2);rect(61,49,9,45,P.ochre,2);path('M 26 85 L 59 55 L 64 62 L 32 93 Z',P.ochre);rect(43,48,15,17,P.ink,3);rect(48,52,5,8,P.gold,2);
 }else return null;
 return s;
}
