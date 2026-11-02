import {creatureBuilder,paintCreatureMesh} from './dungeon-creature-mesh.js';
import {DUNGEON_MATERIALS,volumeBuilder} from './dungeon-volumes.js';
export function paintHedgehogV2(c,x,y,{mood={},ambient=0,reduced=false,biome=0,phase=0}={}){
 const m=creatureBuilder({time:ambient,soft:reduced}),{box,front}=m,tuck=Math.max(0,Math.min(1,mood.tuck||0)),body=['#5c627d','#3f2966','#222347'],skin=['#f7bf6f','#ed9353','#913f39'],gem=DUNGEON_MATERIALS[biome].gem;
 box('back',0,-7,4,67,42,37,body,7);
 for(const [xx,yy,zz,w,h]of [[-24,-4,18,24,26],[24,-4,18,24,26],[-13,-16,30,22,26],[13,-15,32,23,26],[0,-7,41,23,24]])box('crystal',xx,yy,zz,w,19,h,gem,4);
 box('face',0,15,6-tuck*3,34,23,29,skin,5);for(const s of [-1,1]){box('ear',s*18,9,29-tuck*3,11,9,11,skin,2);const lift=reduced?0:Math.max(0,Math.sin((phase+s)*Math.PI))*2*(1-tuck);box('paw',s*(22-6*tuck),23,1+lift,17,18,11,skin,3);}
 const blink=reduced?0:Math.max(0,1-Math.abs((ambient%7.3)-7.1)/.13),eyeH=5*(1-blink*.85)*(1-tuck*.5);
 for(const s of [-1,1])front('eyes',s*8,26-tuck*3,4,eyeH,'#161928',26.7);
 box('muzzle',0,27,9-tuck*2,19,9,12,skin,3);box('nose',0,32,17-tuck*2,7,4,5,body,1);for(const f of m.faces)if(f.id==='eyes')f.depth+=90;
 paintCreatureMesh(c,m.finish(),x,y-3,1.55);return true;
}
export function paintBurrowFrameV2(c,x,y,biome){
 const b=DUNGEON_MATERIALS[biome],v=volumeBuilder({castShadow:false});
 // Broad irregular wall masses frame the arch instead of a detached oval rim.
 for(const q of [[-61,1,0,24,24,60],[-48,-5,49,28,25,29],[-27,-9,70,28,25,24],[0,-11,80,32,25,23],[29,-7,69,30,24,26],[51,-1,43,28,25,34],[63,3,0,24,25,51]])v.prism(...q,b.rock,2,4);
 c.save();c.translate(x-50,y-88);for(const s of v.shapes){c.fillStyle=s.fill;c.fill(new Path2D(s.d));}c.restore();
}
