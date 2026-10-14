import {P,GEM_RAMPS} from './palette.js';
import {CREATURE_COLORS} from './creatures.js';

// Animation is applied to cached bodies in the renderer; seeds never animate.
function seedOffset(seed){let t=(Number(seed)>>>0)+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.round(((t^t>>>14)>>>0)/4294967296*8)-4;}
export function creatureShapes(type,{biome=0,variant=0,seed=1}={}){
 if(!['slime','gardener','hedgehog','bat','golem'].includes(type))throw new RangeError('Unknown creature art: '+type);
 biome=(Number(biome)>>>0)%CREATURE_COLORS.length;variant=(Number(variant)>>>0)%4;
 const shapes=[],j=seedOffset(seed),kind=Math.max(0,['slime','bat','golem'].indexOf(type)),hedgehog=type==='gardener'||type==='hedgehog';let layer='base',part='shadow';
 const colors=hedgehog?[P.sand,P.ochre]:CREATURE_COLORS[biome][kind];
 const [main,shade]=type==='golem'&&biome===1?[colors[1],colors[0]]:colors;
 const path=(d,fill,outline=true)=>shapes.push({type:'path',d,fill,layer,part,stroke:outline?P.ink:null}),ellipse=(cx,cy,rx,ry,fill,outline=false)=>shapes.push({type:'ellipse',cx,cy,rx,ry,fill,layer,part,stroke:outline?P.ink:null}),rect=(x,y,width,height,fill,radius=0,outline=false)=>shapes.push({type:'rect',x,y,width,height,radius,fill,layer,part,stroke:outline?P.ink:null});
 ellipse(50,96,type==='bat'?25:type==='golem'?40:34,5,P.ink);
 if(hedgehog){
  const back=[[P.clay,P.wood],[P.green,P.forest],[P.ochre,P.clay],[P.rose,P.plum],[P.plum,P.aubergine],[P.wood,P.bark],[P.ochre,P.wood]][biome],ramp=GEM_RAMPS[[0,3,2,1,1,2,3][biome]];
  // A seated spectator: broad soft quills, forward muzzle and large resting paws.
  // Render parts share one skeleton; their small motions never regenerate geometry.
  part='body';
  path('M 9 79 Q 6 68 13 61 Q 7 50 19 43 Q 17 31 31 30 Q 38 18 51 25 Q 64 18 73 31 Q 86 31 86 44 Q 98 49 91 63 Q 98 77 89 89 Q 81 100 65 101 L 30 100 Q 8 98 9 79 Z',back[0]);
  path('M 70 29 Q 73 29 73 31 Q 86 31 86 44 Q 98 49 91 63 Q 98 77 89 89 Q 81 100 65 101 L 30 100 Q 17 100 11 91 Q 68 104 79 77 Q 85 51 70 29 Z',back[1],false);
  part='crystals';
  for(const [x,y,w,h]of [[22,65,8,32+j*.3],[41,50,10,38],[64,54,10,34-j*.3],[81,71,8,29]]){
   path('M '+x+' '+(y-h)+' L '+(x-w)+' '+(y-h*.7)+' L '+(x-w)+' '+(y-6)+' L '+x+' '+(y+1)+' L '+(x+w)+' '+(y-6)+' L '+(x+w)+' '+(y-h*.7)+' Z',ramp[0]);
   path('M '+x+' '+(y-h)+' L '+(x+w)+' '+(y-h*.7)+' L '+(x+w)+' '+(y-6)+' L '+x+' '+(y+1)+' Z',ramp[1],false);
  }
  path('M 35 29 Q 37 25 38 27 L 38 37 Q 36 40 35 37 Z M 58 36 Q 60 32 61 34 L 61 42 Q 59 45 58 42 Z',P.white,false);
  part='face';
  path('M 22 71 Q 12 69 15 58 Q 17 49 26 52 Q 34 54 31 68 Z M 70 68 Q 67 54 76 52 Q 85 49 87 59 Q 90 69 80 73 Z',main);
  path('M 20 64 Q 16 57 23 57 Q 28 57 27 66 Z M 75 65 Q 73 57 79 57 Q 85 57 82 66 Z',P.blush,false);
  path('M 23 73 Q 25 61 38 60 Q 48 53 61 61 Q 75 60 80 74 Q 84 89 69 97 Q 52 104 34 96 Q 18 89 23 73 Z',main);
  path('M 68 62 Q 77 64 80 74 Q 84 89 69 97 Q 52 104 34 96 L 29 92 Q 70 100 72 80 Z',shade,false);
  part='eyes';
  path('M 32 72 Q 35 67 39 72 L 40 78 Q 38 83 34 79 Z M 62 73 Q 65 68 69 73 L 68 79 Q 64 83 62 78 Z',P.ink,false);
  path('M 34 72 Q 36 70 37 73 Q 37 76 35 75 Z M 64 73 Q 66 71 67 74 Q 67 77 65 76 Z',P.white,false);
  part='face';
  path('M 35 84 Q 37 77 50 78 Q 64 77 68 84 Q 67 92 57 98 Q 50 102 44 96 Q 35 90 35 84 Z',main);
  path('M 59 79 Q 65 79 68 84 Q 67 92 57 98 Q 50 102 44 96 L 43 94 Q 62 93 59 79 Z',shade,false);
  path('M 43 85 Q 49 81 58 85 Q 61 87 56 91 Q 50 95 45 90 Q 40 87 43 85 Z',P.wood);
  ellipse(47,85,3,1.5,P.sand);
  path('M 50 94 Q 53 95 57 93 Q 55 99 50 96 Z',P.wood,false);
  path('M 28 84 Q 31 81 35 84 Q 33 88 29 87 Z M 69 84 Q 72 81 76 84 Q 74 88 70 87 Z',P.blush,false);
  layer='accent';part='paw-left';
  path('M 14 88 Q 18 83 26 84 Q 35 84 37 92 Q 40 103 24 103 Q 8 103 11 96 Z',main);
  path('M 30 85 Q 36 87 37 92 Q 40 103 24 103 Q 16 103 12 100 Q 33 103 30 85 Z',shade,false);
  path('M 17 94 Q 19 91 20 94 L 20 98 Q 18 100 17 98 Z M 24 95 Q 26 92 27 95 L 27 99 Q 25 101 24 99 Z',P.wood,false);
  part='paw-right';
  path('M 67 88 Q 71 83 79 84 Q 88 84 90 92 Q 93 103 77 103 Q 61 103 64 96 Z',main);
  path('M 83 85 Q 89 87 90 92 Q 93 103 77 103 Q 69 103 65 100 Q 86 103 83 85 Z',shade,false);
  path('M 70 94 Q 72 91 73 94 L 73 98 Q 71 100 70 98 Z M 77 95 Q 79 92 80 95 L 80 99 Q 78 101 77 99 Z',P.wood,false);
  return shapes;
 }
 part='body';
 if(type==='slime'){
  path('M 13 80 Q 16 73 18 62 Q 22 '+(37+j)+' 49 37 Q 78 36 82 62 Q 84 75 90 82 Q 96 97 76 98 L 28 98 Q 7 98 13 80 Z',main);
  path('M 65 40 Q 79 45 82 62 Q 84 75 90 82 Q 96 97 76 98 L 28 98 Q 13 98 12 89 Q 70 104 73 73 Z',shade,false);
  path('M 27 58 Q 28 49 38 48 L 37 52 Q 32 52 31 60 Z',P.white,false);
  rect(34,66,8,11,P.ink,4);rect(58,66,8,11,P.ink,4);rect(36,67,3,4,P.white,1);rect(60,67,3,4,P.white,1);
  path('M 43 83 Q 50 88 57 83 Q 54 93 48 91 Z',P.ink,false);
 }else if(type==='bat'){
  path('M 42 53 Q 24 '+(28+j)+' 6 31 Q 2 46 10 72 Q 19 64 27 80 Q 35 72 43 79 Z M 58 53 Q 76 '+(28-j)+' 94 31 Q 98 46 90 72 Q 81 64 73 80 Q 65 72 57 79 Z',main);
  path('M 9 42 Q 10 57 10 72 Q 19 64 27 80 Q 35 72 43 79 L 37 68 Q 26 65 24 53 Z M 91 42 Q 90 57 90 72 Q 81 64 73 80 Q 65 72 57 79 L 63 68 Q 74 65 76 53 Z',shade,false);
  path('M 34 53 Q 27 28 33 26 L 46 41 L 54 41 L 67 26 Q 73 28 66 53 Q 79 82 50 92 Q 21 82 34 53 Z',main);
  path('M 65 28 Q 73 28 66 53 Q 79 82 50 92 L 40 88 Q 66 77 59 54 Z',shade,false);
  rect(35,60,11,10,P.ink,4);rect(54,60,11,10,P.ink,4);rect(38,61,5,5,P.lemon,2);rect(57,61,5,5,P.lemon,2);
  path('M 42 77 Q 50 82 58 77 Q 57 86 50 86 Q 43 86 42 77 Z',P.ink,false);rect(44,78,4,5,P.white,1);rect(52,78,4,5,P.white,1);
 }else{
  rect(22,80,23,19,main,7,true);rect(55,80,23,19,main,7,true);rect(36,83,8,14,shade,3);rect(69,83,8,14,shade,3);
  path('M 25 55 Q 22 32 '+(48+j)+' 32 Q 76 30 77 53 L 75 79 Q 72 94 52 94 Q 29 93 26 80 Z',main);
  path('M 65 35 Q 76 40 77 53 L 75 79 Q 72 94 52 94 L 43 92 Q 66 83 64 59 Z',shade,false);
  rect(7,57,27,31,main,10,true);rect(66,57,27,31,main,10,true);path('M 27 60 Q 34 61 34 70 L 34 78 Q 34 89 22 88 L 13 87 L 13 82 Q 29 83 27 60 Z M 85 58 Q 93 59 93 68 L 93 79 Q 93 88 82 88 L 73 87 L 73 82 Q 87 84 85 58 Z',shade,false);
  path('M 34 54 Q 40 54 46 57 L 45 65 L 35 64 Z M 54 57 Q 61 54 67 54 L 66 64 L 55 65 Z',P.ink,false);rect(37,58,6,4,P.lemon,2);rect(57,58,6,4,P.lemon,2);
  path('M 43 76 L 50 70 L 57 76 L 50 84 Z',P.ink,false);path('M 46 76 L 50 73 L 54 76 L 50 81 Z',[P.cyan,P.lime,P.sand,P.yellow,P.pink,P.yellow,P.orange][biome],false);
 }
 // A single large, biome-specific crest avoids unreadable miniature ornament.
 if(biome===0){
  path('M 50 14 L 60 26 L 59 39 L 50 44 L 41 39 L 40 26 Z',P.cyan);path('M 50 14 L 60 26 L 59 39 L 50 44 Z',P.blue,false);
 }else if(biome===1){
  path('M 49 43 Q 27 38 29 22 Q 46 22 49 36 Q 55 18 72 21 Q 69 40 49 43 Z',P.lime);path('M 49 43 Q 51 30 72 21 Q 69 40 49 43 Z',P.green,false);
 }else if(biome===2){
  path('M 35 43 Q 20 38 24 22 Q 27 19 30 25 Q 30 34 42 36 Z M 58 36 Q 70 34 70 25 Q 73 19 76 22 Q 80 38 65 43 Z',P.sand);path('M 25 24 Q 26 35 40 38 L 35 43 Q 20 38 24 22 Z M 74 24 Q 80 38 65 43 L 60 39 Q 73 35 74 24 Z',P.ochre,false);
 }else if(biome===3){
  path('M 34 42 Q 28 31 39 24 Q 39 34 46 33 Q 53 22 51 12 Q 66 20 62 35 Q 68 32 70 27 Q 75 45 59 46 Z',P.orange);path('M 44 42 Q 39 34 48 30 Q 48 36 53 36 L 57 27 Q 65 44 53 46 Z',P.yellow,false);
 }else if(biome===5){
  path('M 29 43 Q 24 28 34 23 Q 40 25 42 35 Q 48 14 53 20 L 60 35 Q 72 21 76 30 L 72 44 Z',P.ochre);path('M 52 21 L 60 35 Q 72 21 76 30 L 72 44 L 51 43 Z',P.clay,false);path('M 46 33 L 51 24 L 56 33 L 51 42 Z',P.yellow);
 }else if(biome===6){
  path('M 43 35 Q 34 22 38 17 Q 48 20 50 33 Q 55 17 66 20 Q 66 30 55 37 Z',P.lime);
  path('M 50 33 Q 57 24 66 20 Q 66 30 55 37 Z',P.green,false);
  path('M 46 36 Q 54 34 60 38 Q 59 47 49 49 Q 43 44 46 36 Z',P.orange);
 }else{
  path('M 24 39 Q 29 17 48 18 Q 70 15 77 39 Q 69 49 50 48 Q 29 48 24 39 Z',P.pink);path('M 61 21 Q 71 23 77 39 Q 69 49 50 48 Q 29 48 24 39 Q 58 49 67 34 Z',P.rose,false);ellipse(40,29,5,4,P.lemon);ellipse(58,26,4,3,P.lemon);
 }
 return shapes;
}
