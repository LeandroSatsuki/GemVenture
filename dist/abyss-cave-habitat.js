import {hedgehogVisible} from './hedgehog.js';
import {isAbyssCave} from './abyss-cave-layout.js';

export const ABYSS_HEDGEHOG_HOME=Object.freeze({
 name:'REFÚGIO DOS VEIOS',
 summary:'Abriga-se na parede e cultiva os cristais do veio.',
 reason:'O ouriço busca abrigo da pressão do Abismo nos paredões ricos em cristais. Uma picaretada no pulso desperta a brotação ao redor da toca.'
});
export const hedgehogHabitat=room=>isAbyssCave(room)?ABYSS_HEDGEHOG_HOME:null;
export function clipBurrowFog(c,room,view){
 if(!isAbyssCave(room)||!room.hedgehog?.x||!hedgehogVisible(room))return false;
 const h=room.hedgehog,x=50+22*h.x+2*h.y,y=57.5+16*h.y,path=new Path2D();
 path.rect(view.center[0]-view.width/2-200,view.center[1]-view.height/2-200,view.width+400,view.height+400);
 // Same fixed opening as the host. Visibility still comes from the native
 // approach cells; this mask never reveals floor or changes exploration.
 path.moveTo(x-65,y-43);path.bezierCurveTo(x-65,y-73,x-35,y-97,x,y-97);path.bezierCurveTo(x+35,y-97,x+65,y-73,x+65,y-43);path.lineTo(x+65,y-7);path.quadraticCurveTo(x+65,y+11,x+47,y+11);path.lineTo(x-47,y+11);path.quadraticCurveTo(x-65,y+11,x-65,y-7);path.closePath();c.clip(path,'evenodd');return true;
}
export function paintBurrowHabitat(c,x,y,material){
 // Small mineral inclusions stay embedded in the wall plane. No collectible
 // silhouette, loose rock pile, new collision or extra resource is introduced.
 c.save();
 for(const [dx,dy,flip]of [[-86,-43,-1],[83,-74,1]]){c.save();c.translate(x+dx,y+dy);c.scale(flip,1);c.fillStyle=material.gem[2];c.beginPath();c.moveTo(-4,3);c.lineTo(-1,-5);c.lineTo(2,-3);c.lineTo(4,3);c.lineTo(0,6);c.closePath();c.fill();c.globalAlpha=.4;c.fillStyle=material.gem[1];c.beginPath();c.moveTo(-4,3);c.lineTo(-1,-5);c.lineTo(0,1);c.lineTo(0,6);c.closePath();c.fill();c.restore();}c.restore();
}
