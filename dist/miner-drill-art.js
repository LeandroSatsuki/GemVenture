// GV-020 CP1: code-native solid geometry, isolated from game runtime.
// Geometry/preparation is independent of time. Prepare/cache outside drawing.
export const DRILL_FRAME=Object.freeze({width:100,height:110,axis:[50,96]});
export const DRILL_CAMERA=Object.freeze({yaw:24*Math.PI/180,elevation:40*Math.PI/180,meaning:'Pilot projection chosen by comparison to approved volumes; not a calibrated canonical camera angle'});
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function normal(p){const n=cross(sub(p[1],p[0]),sub(p[2],p[0])),l=Math.hypot(...n)||1;return n.map(v=>v/l);}
function ringBox(hx,hy,z,b){return [[-hx+b,-hy,z],[hx-b,-hy,z],[hx,-hy+b,z],[hx,hy-b,z],[hx-b,hy,z],[-hx+b,hy,z],[-hx,hy-b,z],[-hx,-hy+b,z]];}
function addRingSolid(faces,rings,part,material){
 faces.push({p:[...rings[0]].reverse(),part,material,bevel:false});
 faces.push({p:rings.at(-1),part,material,bevel:false});
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<rings[k].length;i++){const j=(i+1)%rings[k].length;faces.push({p:[rings[k][i],rings[k][j],rings[k+1][j],rings[k+1][i]],part,material,bevel:k===0||k===rings.length-2});}
}
function addBeveledBox(faces,{hx,hy,z0,z1,bevel=2,part,material,offset=[0,0,0]}){
 const rings=[ringBox(hx-bevel,Math.max(1,hy-bevel),z0,1),ringBox(hx,hy,z0+bevel,bevel),ringBox(hx,hy,z1-bevel,bevel),ringBox(hx-bevel,Math.max(1,hy-bevel),z1,1)].map(r=>r.map(p=>p.map((v,i)=>v+offset[i])));
 addRingSolid(faces,rings,part,material);
}
export function createDrillMesh(){
 const faces=[];
 // A short chamfered head with a broad front and genuinely narrower side.
 addBeveledBox(faces,{hx:26,hy:12,z0:42,z1:60,bevel:2.7,part:1,material:'metal'});
 // Elliptical collar is authored geometry, never anisotropic bitmap scaling.
 const collar=[];for(const [rx,ry,z]of [[29.6,9.6,39],[31,11,40.4],[31,11,42.6],[29.6,9.6,44]]){const r=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;r.push([Math.cos(a)*rx,Math.sin(a)*ry,z]);}collar.push(r);}addRingSolid(faces,collar,2,'metal');
 const N=10,top=[];for(let i=0;i<N;i++){const a=i*Math.PI*2/N;top.push([18*Math.cos(a),10*Math.sin(a),39]);}
 faces.push({p:top,part:3,material:'metal',bevel:false});
 for(let i=0;i<N;i++){const j=(i+1)%N;faces.push({p:[[0,0,0],top[j],top[i]],part:3,material:'bit',bevel:false});}
 // Two broad solid helical lands follow the conical surface. No texture noise.
 const turns=1.8,segments=42,zMin=4,zMax=37,bandHeight=3.4;
 const onCone=(z,angle)=>{const r=z/39;return [Math.cos(angle)*(18*r+.38),Math.sin(angle)*(10*r+.38),z];};
 for(let i=0;i<segments;i++){const t=i/segments,u=(i+1)/segments,z=zMin+(zMax-zMin)*t,zz=zMin+(zMax-zMin)*u,a=t*turns*Math.PI*2+.45,aa=u*turns*Math.PI*2+.45;faces.push({p:[onCone(z,a),onCone(zz,aa),onCone(Math.min(39,zz+bandHeight),aa),onCone(Math.min(39,z+bandHeight),a)],part:3,material:'flute',bevel:false,doubleSided:true});}
 // Small functional inset on the front; no light emission or bloom.
 addBeveledBox(faces,{hx:10,hy:.75,z0:48,z1:53,bevel:.55,part:4,material:'indicator',offset:[-2,12.25,0]});
 return {faces,parts:{1:'body',2:'collar',3:'bit with helical lands',4:'front inset'},axisTip:[0,0,0]};
}
export function projectDrillPoint([x,y,z],camera=DRILL_CAMERA){const sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw),se=Math.sin(camera.elevation),ce=Math.cos(camera.elevation);return {x:cy*x-sy*y,y:se*(sy*x+cy*y)-ce*z,depth:ce*(sy*x+cy*y)+se*z};}
function colour(face,n,P){
 if(face.material==='indicator')return n[0]>.25?P.blue:P.cyan;
 if(face.material==='flute')return n[0]>.35?P.steel:P.silver;
 if(face.material==='bit')return n[0]>.30?P.slate:P.steel;
 if(n[2]>.95)return P.silver;
 if(face.bevel&&n[2]>.3&&n[0]<.5)return P.steel;
 return n[0]>.35?P.slate:P.steel;
}
const rgba=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
export function rasterizeDrill(mesh,P,{scale=4,onlyPart=null,outline=1.25,camera=DRILL_CAMERA}={}){
 if(!Number.isFinite(scale)||scale<=0||scale>8)throw Error('Invalid preparation scale');
 const width=Math.ceil(DRILL_FRAME.width*scale),height=Math.ceil(DRILL_FRAME.height*scale),npx=width*height,depth=new Float32Array(npx).fill(-Infinity),ids=new Uint8Array(npx),pixels=new Uint8ClampedArray(npx*4),view=[Math.cos(camera.elevation)*Math.sin(camera.yaw),Math.cos(camera.elevation)*Math.cos(camera.yaw),Math.sin(camera.elevation)];
 let triangles=0,visibleFaces=0;const usedColours=new Set();
 for(const face of mesh.faces){if(onlyPart&&face.part!==onlyPart)continue;const n=normal(face.p);if(!face.doubleSided&&dot(n,view)<=0)continue;visibleFaces++;const fill=colour(face,n,P);usedColours.add(fill);const col=rgba(fill),pp=face.p.map(v=>{const p=projectDrillPoint(v,camera);return [(p.x+DRILL_FRAME.axis[0])*scale,(p.y+DRILL_FRAME.axis[1])*scale,p.depth];});
  for(let k=1;k<pp.length-1;k++){
   const [a,b,c]=[pp[0],pp[k],pp[k+1]],area=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(area)<1e-8)continue;triangles++;
   const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const xx=x+.5,yy=y+.5,wa=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/area,wb=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/area,wc=1-wa-wb;if(wa<-.0001||wb<-.0001||wc<-.0001)continue;const z=wa*a[2]+wb*b[2]+wc*c[2],i=y*width+x;if(z>depth[i]){depth[i]=z;ids[i]=face.part;pixels.set(col,i*4);}}
  }
 }
 // Outline the visible union and independent-piece overlaps, never hidden edges
 // or every face of the same block. All work happens during cache preparation.
 const data=new Uint8ClampedArray(pixels),ink=rgba(P.ink),radius=Math.ceil(outline*scale),insideRadius=Math.max(1,Math.round(.52*scale));
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(ids[i]){let boundary=false;for(const [dx,dy]of [[insideRadius,0],[-insideRadius,0],[0,insideRadius],[0,-insideRadius]]){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<width&&yy>=0&&yy<height&&ids[yy*width+xx]&&ids[yy*width+xx]!==ids[i])boundary=true;}if(boundary)data.set(ink,i*4);continue;}
  let neighbour=false;for(let dy=-radius;dy<=radius&&!neighbour;dy++)for(let dx=-radius;dx<=radius;dx++){if(dx*dx+dy*dy>radius*radius)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&xx<width&&yy>=0&&yy<height&&ids[yy*width+xx]){neighbour=true;break;}}if(neighbour)data.set(ink,i*4);
 }
 let left=width,top=height,right=0,bottom=0,lastXs=[];for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);if(y+1>bottom){bottom=y+1;lastXs=[x];}else if(y+1===bottom)lastXs.push(x);}
 const tipAnchor=onlyPart?null:[lastXs.reduce((s,x)=>s+x+.5,0)/lastXs.length,bottom];
 return {width,height,data,bounds:[left,top,right,bottom],tipAnchor,usedColours:[...usedColours,P.ink],stats:{faces:mesh.faces.length,visibleFaces,triangles,scale,onlyPart},scale};
}
export function drawPreparedDrill(c,cache,tipX,tipY,{tilt=0,scale=1}={}){
 // Existing minerFlight tilt is applied exactly once about the visible tip.
 // No geometry, canvas, cache-key growth, pixel read or recolour in drawing.
 c.save();c.translate(tipX,tipY);c.rotate(tilt);c.drawImage(cache.image,-cache.tip[0]*scale,-cache.tip[1]*scale,cache.width*scale,cache.height*scale);c.restore();
}
