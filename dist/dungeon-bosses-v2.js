import {creatureBuilder,paintCreatureMesh} from './dungeon-creature-mesh.js';
import {rabbitDirection} from './dungeon-rabbit.js';
const wood=['#ed9353','#9c3824','#591d35'],leaf=['#a2e66f','#5dae27','#1d3926'],bone=['#ffffe0','#c4ccc7','#8394a6'],dark=['#5c627d','#374252','#161928'],red=['#f27f72','#ce2029','#591d35'],gold=['#ffd95a','#e97c07','#9c3824'];
export function bossMeshV2(index,{direction='down',time=0,windup=null,beat=0,soft=false,includeHidden=false}={}){
 const m=creatureBuilder({direction,time,soft,includeHidden}),{box,front}=m;
 const charge=windup?Math.max(0,Math.min(1,(beat-(windup.startedBeat??windup.beat-3))/Math.max(1,windup.beat-(windup.startedBeat??windup.beat-3)))):0;
 const arm=(side)=>p=>{const a=side*(charge*.72+(soft?0:Math.sin(time*1.7+side)*.035)),x=p[0]-side*21,z=p[2]-35;return[side*21+x*Math.cos(a)-z*Math.sin(a),p[1]+charge*3,35+x*Math.sin(a)+z*Math.cos(a)];};
 if(index===1){
  box('trunk',0,0,5,29,25,43,wood,2.5);for(const s of [-1,1]){box('root-'+s,s*15,8,0,21,19,9,wood,2);box('branch-'+s,s*25,0,23,23,13,13,wood,2,arm(s));}
  for(const [x,y,z,w,h]of [[0,-3,47,43,22],[-24,0,39,23,18],[24,-1,42,24,17]])box('crown',x,y,z,w,27,h,leaf,3);
  for(const x of [-6,6])front('eyes',x,35,4,5,'#161928',12.6);
  front('mouth',0,26,6,2,'#591d35',12.7);
 }else if(index===2){
  box('skull',0,0,47,35,29,24,bone,3);for(const x of [-7,7])front('eye-socket',x,61,8,6,'#161928',14.6);
  front('nose',0,55,4,4,'#374252',14.7);for(const x of [-10,-3,4,11])box('jaw-tooth',x,8,42,5,11,8,bone,.8);
  box('spine',0,-4,14,9,10,32,dark,1);for(const z of [24,33,41]){box('rib-left',-9,5,z,14,10,5,bone,1);box('rib-right',9,5,z,14,10,5,bone,1);}
  box('pelvis',0,1,11,25,18,9,bone,1.5);for(const side of [-1,1]){box('leg',side*8,0,3,8,9,12,bone,1);box('foot',side*11,9,0,15,22,7,bone,1.5);box('shoulder',side*24,0,39,17,19,12,bone,2,arm(side));box('upper-arm',side*28,0,26,8,10,15,bone,1,arm(side));box('forearm',side*31,4,11,10,12,17,bone,1,arm(side));box('fist',side*32,8,6,14,18,12,bone,1.5,arm(side));}
 }else if(index===3){
  box('robe',0,-2,4,35,28,32,red,2.5);box('hood',0,-1,34,38,30,26,red,3);
  front('hood-opening',0,54,25,15,'#161928',14.2);for(const x of [-6,6])front('eyes',x,49,5,3,'#ffd95a',14.4);
  for(const side of [-1,1]){box('sleeve',side*26,0,26,20,18,15,red,2,arm(side));box('hand',side*33,8,25,11,12,10,gold,1.5,arm(side));box('robe-hem',side*12,8,0,12,20,20,red,1.5);}
  box('brooch',0,14,26,9,5,9,gold,1);box('crown-band',0,-1,60,27,19,5,gold,1);for(const x of [-10,0,10])box('crown-point',x,-1,64,7,9,x===0?12:8,gold,1);
 }else if(index===4){
  box('stem',0,0,7,28,24,37,bone,3);for(const s of [-1,1]){box('root',s*16,6,0,23,17,9,bone,2);box('arm',s*26,2,22,26,12,11,bone,2,arm(s));}
  box('cap-rim',0,-2,40,71,49,9,bone,3);box('cap',0,-2,47,70,48,15,red,5);box('cap-crown',0,-2,59,44,33,9,red,4);
  for(const [x,y,w,z]of [[-18,3,14,62],[11,8,12,62],[0,-7,18,68]])box('cap-spot',x,y,z,w,10,1.2,bone,.4);
  for(const x of [-6,6])front('eyes',x,32,4,7,'#161928',12.3);
 }else if(index===5){
  box('body',0,-5,0,47,34,26,wood,4);box('head',0,6,17,31,27,25,wood,3);
  for(const s of [-1,1]){box('arm',s*27,1,5,23,22,20,wood,3,arm(s));for(let i=0;i<3;i++)box('claw',s*25+(i-1)*6,17,0,5,15,8,bone,1,arm(s));front('eyes',s*7,35,5,4,'#161928',19.7);}
  box('muzzle',0,21,17,16,13,14,['#e77988','#ba4a54','#591d35'],2);box('nose',0,28,24,8,5,5,dark,1);for(const x of [-3,3])box('tooth',x,25,13,5,4,7,bone,.7);
  box('crown-band',0,4,42,25,18,4,gold,1);for(const x of [-9,0,9])box('crown-point',x,4,45,6,8,x===0?10:7,gold,1);
 }else return [];
 // Face markings belong to the visible front plane, never the side of the head.
 for(const f of m.faces)if(/eyes|socket|nose|mouth|hood-opening/.test(f.id))f.depth+=60;
 return m.finish();
}
export function paintBossV2(c,n,x,y,width,time,{beat=0,soft=false,player}={}){
 if(![1,2,3,4,5].includes(n.bossIndex))return false;
 const direction=rabbitDirection(n,player),faces=bossMeshV2(n.bossIndex,{direction,time,windup:n.windup,beat,soft});paintCreatureMesh(c,faces,x,y,width/83,{emissionIndex:[2,5].includes(n.bossIndex)?n.bossIndex:null});return true;
}
