// Same ground-anchor / width convention as drawAsset(ctx,type,x,y,width,options).
// Cache is explicit and disposed, never keyed by time, seed jitter or RAF.
import {createCaveCamera,createCaveFormation,buildCavePlan,addCaveLighting} from './cave-geometry.js';
export function createCaveCanvasAsset(THREE,{size=1567,palette,plan=buildCavePlan()}={}){
 if(!Number.isInteger(size)||size<128||size>2048)throw RangeError('size must be 128..2048');
 const height=Math.round(size*1004/1567),renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(size,height);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),formation=createCaveFormation(THREE,{plan,palette}),camera=createCaveCamera(THREE,{width:size,height});scene.add(formation);addCaveLighting(THREE,scene);
 renderer.render(scene,camera);
 const canvas=document.createElement('canvas');canvas.width=size;canvas.height=height;canvas.getContext('2d').drawImage(renderer.domElement,0,0);
 // Threshold anchor is the center of the actual mouth, not the island/stairs.
 const anchor={x:768/1567,y:618/1004};
 return {canvas,width:size,height,anchor,plan,draw(ctx,x,y,width){if(![x,y,width].every(Number.isFinite)||width<=0)return;const h=width*height/size;ctx.drawImage(canvas,x-width*anchor.x,y-h*anchor.y,width,h);},dispose(){formation.userData.dispose();renderer.dispose();canvas.width=canvas.height=0;}};
}
