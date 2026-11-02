import {captureSceneryEmission} from './scenery-emission-bridge.js';
// GV006 art-only runtime recipe. Original PNGs are never modified.
// Consumer supplies the existing hedgehogMood/BPM values; this module emits no events.
export const HEDGEHOG_RASTER_FRAME=Object.freeze({width:1448,height:1086,anchor:[732,949],scale:96/1058});
export const HEDGEHOG_RASTER_REGIONS=Object.freeze({
 face:[[642,578],[673,550],[744,529],[782,565],[798,601],[1006,682],[1138,615],[1140,553],[1176,547],[1217,587],[1218,642],[1189,678],[1156,699],[1152,788],[1091,861],[1072,920],[874,943],[814,923],[751,815],[734,695],[691,694],[654,671],[637,647]],
 left:[[666,840],[693,813],[744,792],[779,787],[817,798],[850,827],[871,856],[879,899],[877,933],[850,954],[713,962],[674,951],[655,934],[655,908]],
 right:[[1060,907],[1083,857],[1115,806],[1144,778],[1177,782],[1207,799],[1236,826],[1246,864],[1234,900],[1212,932],[1170,945],[1083,945],[1054,929]],
 eyeLeft:[[853,680],[925,680],[925,785],[853,785]],
 eyeRight:[[1040,682],[1110,682],[1110,785],[1040,785]]
});
const PIVOTS={body:[732,858],face:[975,821],left:[770,889],right:[1150,882],eyeLeft:[890,731],eyeRight:[1077,734]};
const ramps=[[94,233,233],[71,246,65],[236,233,16],[249,78,109],[249,78,109],[236,233,16],[71,246,65]];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
// 1/3 source cache resolution: 483×362, sufficient for ~194 screen pixels at ordinary2× World scale.
export function createHedgehogRasterRig({master,backing,eyeBacking,createCanvas}){
 const F=HEDGEHOG_RASTER_FRAME,R=HEDGEHOG_RASTER_REGIONS,d=1/3,w=Math.ceil(F.width*d),h=Math.ceil(F.height*d),newCanvas=()=>createCanvas(w,h);
 const canvas=()=>{const q=newCanvas();q.getContext('2d').scale(d,d);return q;};
 function source(q,img){q.getContext('2d').drawImage(img,0,0,F.width,F.height);}
 function region(img,points){const q=canvas(),c=q.getContext('2d');c.save();path(c,points);c.clip();source(q,img);c.restore();return q;}
 const base=canvas();source(base,master);const under=canvas();source(under,backing);const eyeUnder=canvas();source(eyeUnder,eyeBacking);
 const face=region(master,R.face),left=region(master,R.left),right=region(master,R.right),eyeLeft=region(master,R.eyeLeft),eyeRight=region(master,R.eyeRight);
 const raw=q=>q.getContext('2d').getImageData(0,0,w,h),original=raw(base),back=raw(under),cleanEyes=raw(eyeUnder),faceData=raw(face),leftData=raw(left),rightData=raw(right),el=raw(eyeLeft),er=raw(eyeRight);
 const body=newCanvas(),fill=newCanvas(),bodyData=raw(base),fillData=raw(under);
 for(let i=0;i<bodyData.data.length;i+=4){const m=Math.max(faceData.data[i+3],leftData.data[i+3],rightData.data[i+3])/255;bodyData.data[i+3]=Math.round(bodyData.data[i+3]*(1-m));fillData.data[i+3]=Math.round(fillData.data[i+3]*m);faceData.data[i+3]=Math.round(faceData.data[i+3]*(1-Math.max(leftData.data[i+3],rightData.data[i+3])/255));const eye=Math.max(el.data[i+3],er.data[i+3])/255;if(eye>0){for(let ch=0;ch<3;ch++)faceData.data[i+ch]=Math.round(faceData.data[i+ch]*(1-eye)+cleanEyes.data[i+ch]*eye);}}
 for(const pixels of [el,er])for(let i=0;i<pixels.data.length;i+=4)if(pixels.data[i]>100||pixels.data[i+1]>80||pixels.data[i+2]>160)pixels.data[i+3]=0;eyeLeft.getContext('2d').resetTransform();eyeRight.getContext('2d').resetTransform();eyeLeft.getContext('2d').putImageData(el,0,0);eyeRight.getContext('2d').putImageData(er,0,0);
 body.getContext('2d').putImageData(bodyData,0,0);fill.getContext('2d').putImageData(fillData,0,0);face.getContext('2d').resetTransform();face.getContext('2d').putImageData(faceData,0,0);
 const parts={fill,body,face,left,right,eyeLeft,eyeRight};
 // Crystals are a semantic color mask evaluated once from the approved master.
 // Only cyan material changes. Neutral back, face, outline and paws stay shared.
 const crystals=newCanvas(),cc=crystals.getContext('2d');cc.drawImage(body,0,0);const pixels=cc.getImageData(0,0,w,h);let crystalPixels=0;
 for(let i=0;i<pixels.data.length;i+=4){const [r,g,b]=pixels.data.subarray(i,i+3);if(!(g>90&&b>100&&g>r*1.28&&b>r*1.28)){pixels.data[i+3]=0;}else crystalPixels++;}cc.putImageData(pixels,0,0);
 const variants=new Map([[0,crystals]]);
 // Luminance-based facet retention instead of multiplying cyan into unrelated hues.
 function recolor(biome){if(!biome)return crystals;const key='lum'+biome;if(variants.has(key))return variants.get(key);const v=newCanvas(),vc=v.getContext('2d'),p=vc.createImageData(w,h),target=ramps[biome];for(let i=0;i<p.data.length;i+=4){if(!pixels.data[i+3])continue;const l=(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722)/255;const t=clamp((l-.30)/.55,0,1);for(let ch=0;ch<3;ch++)p.data[i+ch]=Math.round(target[ch]*(.45+.55*t)+(255-target[ch])*.25*Math.max(0,(t-.65)/.35));p.data[i+3]=pixels.data[i+3];}vc.putImageData(p,0,0);variants.set(key,v);return v;}
 function drawPart(c,key,dx=0,dy=0,sx=1,sy=1,angle=0){const p=PIVOTS[key]||PIVOTS.body;c.save();c.translate(p[0]+dx,p[1]+dy);c.rotate(angle);c.scale(sx,sy);c.drawImage(parts[key],-p[0],-p[1],F.width,F.height);c.restore();}
 function draw(c,x,y,{phase=0,mood={tuck:0},ambient=0,reduced=false,biome=0,emissionArch=null}={}){
  const tuck=clamp(mood.tuck||0,0,1),breathe=reduced?0:Math.sin(ambient*1.65)*(1-tuck),blink=reduced?0:Math.max(0,1-Math.abs((ambient%6.8)-6.65)/.15);
  const baseTransform=c.getTransform();c.save();c.translate(x,y);c.scale(F.scale,F.scale);c.translate(-F.anchor[0],-F.anchor[1]);
  // Root fixed. Squash is subtle; no camera movement or source-anchor drift.
  c.translate(PIVOTS.body[0],PIVOTS.body[1]);c.scale(1+breathe*.002,1+breathe*.006-tuck*.018);c.translate(-PIVOTS.body[0],-PIVOTS.body[1]);
  drawPart(c,'fill');drawPart(c,'body');if(biome>0)c.drawImage(recolor(clamp(Math.trunc(biome),0,6)),0,0,F.width,F.height);
  captureSceneryEmission(c,'legacy-hedgehog',{image:recolor(clamp(Math.trunc(biome),0,6)),x,y,width:F.width,height:F.height,baseTransform,arch:emissionArch});
  const faceY=tuck*19;drawPart(c,'face',0,faceY,1,1-tuck*.03);
  for(const [key,sign]of [['eyeLeft',1],['eyeRight',-1]]){drawPart(c,key,0,faceY,1,Math.max(.08,1-blink*.92-tuck*.35),sign*tuck*.14);}
  for(const [key,offset,sign]of [['left',0,1],['right',1,-1]]){const beat=((phase+offset)%2+2)%2,lift=reduced||beat>=1?0:Math.sin(Math.PI*beat)**2*17*(1-tuck);drawPart(c,key,sign*tuck*14,tuck*10-lift,1-tuck*.04,1-tuck*.04);}
  c.restore();return true;
 }
 return {draw,parts,crystalVariant:recolor,cache:{width:w,height:h,baseCanvases:8,maxCanvases:14,maxPixels:w*h*14,crystalPixels},frame:F};
}





