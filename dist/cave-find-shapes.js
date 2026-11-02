import {volumeBuilder,projectDungeon} from './dungeon-volumes.js';
// Native cave camera/materials, registered in art-kit's bounded sprite cache.
export function caveFindShapes(type,{variant=0}={}){
 if(!['cave-chest','cave-mushroom'].includes(type))return null;
 const v=volumeBuilder(),wood=['#ed9353','#9c3824','#591d35'],gold=['#ffd95a','#e97c07','#9c3824'],stem=['#c4ccc7','#8394a6','#5c627d'],white=['#ffffe0','#c4ccc7','#8394a6'];
 if(type==='cave-chest'){
  v.prism(0,0,0,65,42,29,wood,3,5);
  if(variant%2){v.prism(0,-17,27,65,9,32,wood,2,4);v.path([[25,72],[71,75],[78,83],[31,80]],'#161928');}
  else v.prism(0,0,28,68,44,17,wood,5,10);
  for(const x of [-21,21])v.prism(x,1,0,6,43,variant%2?30:44,gold,1,1);
  if(!(variant%2))v.prism(0,20,18,13,5,17,gold,1,2);
 }else{
  const kind=variant%3,ramp=kind===0?['#a2e66f','#5dae27','#288a3f']:kind===1?['#2fbfcd','#287cb8','#245473']:['#ffd95a','#f06c1a','#ce2029'];
  if(kind===1)for(const x of [-12,12])v.prism(x,0,0,12,12,27,stem,2,3);else v.prism(0,0,0,17,16,kind===2?20:28,stem,3,5);
  const z=kind===2?19:26;v.prism(0,0,z,kind===1?66:54,kind===1?28:40,13,ramp,4,kind===2?3:13);
  if(kind===0){v.prism(0,10,z+9,7,20,3,white,.5,1);v.prism(0,10,z+10,20,6,3,white,.5,1);}
  else if(kind===1)for(const x of [-9,9])v.prism(x,9,z+10,5,13,3,white,.5,1);
  else v.path([[0,-7],[3,0],[11,1],[5,5],[8,13],[0,9],[-8,13],[-5,5],[-11,1],[-3,0]].map(([x,y])=>projectDungeon([x,y,z+15])),'#ffffe0');
 }
 return v.shapes.map(s=>({...s,matrix:[1,0,0,1,0,8]}));
}
