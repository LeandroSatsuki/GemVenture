import {captureSceneryEmission} from './scenery-emission-bridge.js';
export const BOSS_EMISSION_SPEC=Object.freeze({maxSources:8,maxCachedMeshes:48,maxRasterMasks:3,maxAtlasFrames:12,density:3,maxSide:512,bodyRadius:96,bodyPower:.58});
export const BOSS_EMISSION_PROFILES=Object.freeze([
 {part:'cristais azuis',color:'#35edff'},
 {part:'contornos da copa e seiva',color:'#64ff58'},
 {part:'olhos e coluna',color:'#ffd95a'},
 {part:'coroa',color:'#ffe46b'},
 {part:'marcas do chapéu',color:'#fff1a6'},
 {part:'coroa',color:'#ffd95a'},
 {part:'cenoura',color:'#ff9438'}
].map(Object.freeze));
export function bossFaceEmission(index,face){const id=face.id;
 if(index===1)return id==='sap-fissure'?1:id.startsWith('crown-')&&face.normal?.[2]>.06&&face.normal[2]<.96?.52:0;
 if(index===2)return id==='eye-socket'?1:id==='spine'?.32:0;
 if(index===3||index===5)return id.startsWith('crown-')?1:0;
 if(index===4)return id.startsWith('spot-')?1:0;
 if(index===6)return id.startsWith('carrot-')?1:0;
 return 0;
}
const spriteMeshes=new WeakMap(),point=([a,b,z])=>[a+b/11,b*8/11-z];
const affine=(t,x,y,s)=>[t.a*s,t.b*s,t.c*s,t.d*s,t.a*x+t.c*y+t.e,t.b*x+t.d*y+t.f];
// Called after an actual current mesh draw. Cached painters retain only the
// native pose data; the scene owns all optional glow pixels and their lifetime.
export function recordBossMeshEmission(c,index,faces,x,y,scale){
 const data={index,faces,matrix:[scale,0,0,scale,x,y],anchor:{x,y},alpha:c.globalAlpha,cache:false};
 if(captureSceneryEmission(c,'boss-mesh',data))return;
 const transform=typeof c.getTransform==='function'?c.getTransform():null;if(!transform||!['a','b','c','d','e','f'].every(k=>Number.isFinite(transform[k])))return;
 spriteMeshes.set(c.canvas,{index,faces,matrix:affine(transform,x,y,scale),alpha:c.globalAlpha});
}
export function captureCachedBossEmission(c,image,x,y,w,h,anchorX,anchorY){
 const m=spriteMeshes.get(image);if(!m||image.width<=1||image.height<=1)return;
 const [a,b,d,e,f,g]=m.matrix,sx=w/image.width,sy=h/image.height;
 captureSceneryEmission(c,'occluder',[image,x,y,w,h]);
 captureSceneryEmission(c,'boss-mesh',{index:m.index,faces:m.faces,matrix:[a*sx,b*sy,d*sx,e*sy,x+f*sx,y+g*sy],anchor:{x:anchorX,y:anchorY},alpha:m.alpha*c.globalAlpha,cache:true});
}
function trace(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...point(p)):c.moveTo(...point(p)));c.closePath();}
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const release=v=>{if(v)for(const c of[v.canvas,v.raw])c.width=c.height=1;};
export function createBossEmissionMaterials(makeCanvas){
 const cached=new WeakMap(),resident=new Map(),dynamic=new Map(),rasters=new Map(),frames=new Map(),imageIds=new WeakMap();let dead=false,nextImageId=0;
 function render(faces,index,prior=null){
  const selected=faces.filter(f=>bossFaceEmission(index,f)>0),vertices=selected.flatMap(f=>f.points.map(point));if(!vertices.length)return null;
  const x=Math.floor(Math.min(...vertices.map(p=>p[0])))-4,y=Math.floor(Math.min(...vertices.map(p=>p[1])))-4,w=Math.ceil(Math.max(...vertices.map(p=>p[0])))-x+4,h=Math.ceil(Math.max(...vertices.map(p=>p[1])))-y+4,d=Math.min(BOSS_EMISSION_SPEC.density,BOSS_EMISSION_SPEC.maxSide/Math.max(w,h)),pw=Math.ceil(w*d),ph=Math.ceil(h*d),v=prior||{raw:makeCanvas(pw,ph),canvas:makeCanvas(pw,ph)};
  for(const q of[v.raw,v.canvas]){if(q.width!==pw)q.width=pw;if(q.height!==ph)q.height=ph;}
  const c=v.raw.getContext('2d');c.resetTransform();c.clearRect(0,0,pw,ph);c.setTransform(d,0,0,d,-x*d,-y*d);c.lineJoin='round';const color=rgb(BOSS_EMISSION_PROFILES[index].color);
  for(const f of faces){const gain=bossFaceEmission(index,f);trace(c,f.points);c.globalCompositeOperation=gain?'source-over':'destination-out';c.globalAlpha=gain?Math.min(1,gain*(.64+rgb(f.fill).reduce((a,b)=>a+b,0)/765*.30)):1;if(gain){const l=rgb(f.fill).reduce((a,b)=>a+b,0)/765,white=Math.max(0,l-.55)*.40;c.fillStyle='rgb('+color.map(n=>Math.round(n+(255-n)*white)).join(',')+')';}else c.fillStyle='#000000';c.fill();c.strokeStyle=c.fillStyle;c.lineWidth=.22;c.stroke();}
  const g=v.canvas.getContext('2d');g.resetTransform();g.clearRect(0,0,pw,ph);g.shadowColor=BOSS_EMISSION_PROFILES[index].color;g.shadowBlur=2.2*d;g.globalAlpha=.90;g.drawImage(v.raw,0,0);g.shadowBlur=0;g.globalAlpha=.32;g.drawImage(v.raw,0,0);g.globalAlpha=1;Object.assign(v,{x,y,w,h,index,selectedFaces:selected.length,totalFaces:faces.length});return v;
 }
 function mesh(faces,index,stable=false){if(dead||!BOSS_EMISSION_PROFILES[index])return null;if(!stable){const old=dynamic.get(index),v=render(faces,index,old);if(v)dynamic.set(index,v);return v;}if(cached.has(faces)){const v=cached.get(faces);resident.delete(v);resident.set(v,faces);return v;}const v=render(faces,index);if(!v)return null;while(resident.size>=BOSS_EMISSION_SPEC.maxCachedMeshes){const old=resident.keys().next().value;cached.delete(resident.get(old));resident.delete(old);release(old);}cached.set(faces,v);resident.set(v,faces);return v;}
 function buildRaster(image,rect=null){const raw=makeCanvas(rect?rect[2]:image.width,rect?rect[3]:image.height),c=raw.getContext('2d');if(rect)c.drawImage(image,...rect,0,0,raw.width,raw.height);else c.drawImage(image,0,0);const im=c.getImageData(0,0,raw.width,raw.height);let pixels=0;
  for(let i=0;i<im.data.length;i+=4){const r=im.data[i],g=im.data[i+1],b=im.data[i+2],selected=rect?b>115&&b>r*1.60&&g>r*1.45:b>115&&b>r*1.24&&g>r*1.12;if(!selected)im.data[i+3]=0;else{pixels++;const t=(r+g+b)/765;im.data[i]=Math.round(35+t*85);im.data[i+1]=Math.round(185+t*60);im.data[i+2]=255;im.data[i+3]=Math.round(im.data[i+3]*.90);}}c.putImageData(im,0,0);const canvas=makeCanvas(raw.width,raw.height),g=canvas.getContext('2d');g.shadowColor=BOSS_EMISSION_PROFILES[0].color;g.shadowBlur=7;g.globalAlpha=.9;g.drawImage(raw,0,0);g.shadowBlur=0;g.globalAlpha=.34;g.drawImage(raw,0,0);return {raw,canvas,pixels};
 }
 function raster(image){if(dead)return null;if(rasters.has(image))return rasters.get(image);const v=buildRaster(image);while(rasters.size>=BOSS_EMISSION_SPEC.maxRasterMasks){const k=rasters.keys().next().value;release(rasters.get(k));rasters.delete(k);}rasters.set(image,v);return v;
 }
 function atlas(image,rect){if(dead||!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[2]<=0||rect[3]<=0||rect[2]>512||rect[3]>512)return null;if(!imageIds.has(image))imageIds.set(image,++nextImageId);const key=[imageIds.get(image),...rect].join(':');if(frames.has(key)){const v=frames.get(key);frames.delete(key);frames.set(key,v);return v;}const v=buildRaster(image,rect);while(frames.size>=BOSS_EMISSION_SPEC.maxAtlasFrames){const key=frames.keys().next().value;release(frames.get(key));frames.delete(key);}frames.set(key,v);return v;}
 function status(){const values=[...resident.keys(),...dynamic.values(),...rasters.values(),...frames.values()];return{cachedMeshes:resident.size,dynamicMeshes:dynamic.size,rasterMasks:rasters.size,atlasFrames:frames.size,canvasBytes:values.reduce((n,v)=>n+(v.raw.width*v.raw.height+v.canvas.width*v.canvas.height)*4,0)};}
 return {mesh,raster,atlas,status,dispose(){if(dead)return;dead=true;for(const v of resident.keys()){cached.delete(resident.get(v));release(v);}for(const v of dynamic.values())release(v);for(const v of rasters.values())release(v);for(const v of frames.values())release(v);frames.clear();resident.clear();dynamic.clear();rasters.clear();}};
}
