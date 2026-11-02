import {CAVE_REFERENCE} from './cave-reference.js';

export const CAVE_DEFAULTS=Object.freeze({seed:57025,unitsPerPixel:.01,bevelPx:3,outlinePx:3.8,closedBackDepthPx:145,portalDepthPx:306});
// Frozen authoring frame. Editing the viewing camera NEVER relifts geometry.
export const AUTHORING_VIEW=Object.freeze({azimuthDeg:45,elevationDeg:32,frameWidth:1567,frameHeight:1004});
const rad=v=>v*Math.PI/180;
const key=p=>p.join(',');
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>a.map(v=>v/(Math.hypot(...a)||1));
function normal(v){let n=[0,0,0];v.forEach((p,i)=>{const q=v[(i+1)%v.length];n[0]+=(p[1]-q[1])*(p[2]+q[2]);n[1]+=(p[2]-q[2])*(p[0]+q[0]);n[2]+=(p[0]-q[0])*(p[1]+q[1]);});return unit(n);}
export function authoringBasis(){const a=rad(AUTHORING_VIEW.azimuthDeg),e=rad(AUTHORING_VIEW.elevationDeg);return {right:[Math.cos(a),0,-Math.sin(a)],up:[-Math.sin(a)*Math.sin(e),Math.cos(e),-Math.cos(a)*Math.sin(e)],toward:[Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]};}
function world(p,d,options){const b=authoringBasis(),v=[p[0]-AUTHORING_VIEW.frameWidth/2,AUTHORING_VIEW.frameHeight/2-p[1],d];return b.right.map((_,i)=>options.unitsPerPixel*(v[0]*b.right[i]+v[1]*b.up[i]+v[2]*b.toward[i]));}
function planeDepth(a,da,b,db,c,dc){const det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(det)<1e-6)throw Error('Degenerate plane anchors');const x=((db-da)*(c[1]-a[1])-(dc-da)*(b[1]-a[1]))/det,y=((b[0]-a[0])*(dc-da)-(c[0]-a[0])*(db-da))/det;return p=>da+x*(p[0]-a[0])+y*(p[1]-a[1]);}
function boundaryOf(faces){const es=new Map();for(const f of faces)for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length],k=[key(a),key(b)].sort().join('|');const e=es.get(k);if(e)e.count++;else es.set(k,{a,b,count:1});}return [...es.values()].filter(e=>e.count===1).map(e=>[e.a,e.b]);}
function closedLoops(edges){const remaining=[...edges],loops=[];while(remaining.length){const [a,b]=remaining.shift(),loop=[a,b];for(let limit=0;key(loop.at(-1))!==key(loop[0])&&limit<100;limit++){const k=key(loop.at(-1)),i=remaining.findIndex(([p,q])=>key(p)===k||key(q)===k);if(i<0)throw Error('Open authored rock boundary at '+k);const [p,q]=remaining.splice(i,1)[0];loop.push(key(p)===k?q:p);}if(key(loop.at(-1))!==key(loop[0]))throw Error('Unclosed rock ring');loop.pop();loops.push(loop);}return loops;}
function planarError(vertices,indices){const v=indices.map(i=>vertices[i]),n=normal(v);return Math.max(...v.map(p=>Math.abs(dot(sub(p,v[0]),n))));}
// Deterministic ear clipping, only for a measured face whose boundary cannot
// lie on one 3D plane. It adds NO vertices, jitter or triangle outline strokes.
function planePatches(vertices,face){
 if(planarError(vertices,face.indices)<1e-8)return [face];
 const pts=face.indices.map(i=>vertices[i]),n=normal(pts),axis=n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs))),xy=pts.map(p=>p.filter((_,i)=>i!==axis));
 const area=xy.reduce((s,p,i)=>{const q=xy[(i+1)%xy.length];return s+p[0]*q[1]-q[0]*p[1];},0),sign=Math.sign(area),remaining=xy.map((_,i)=>i),out=[];
 const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 while(remaining.length>3){let found=false;for(let k=0;k<remaining.length;k++){
  const a=remaining[(k+remaining.length-1)%remaining.length],b=remaining[k],c=remaining[(k+1)%remaining.length];
  if(sign*turn(xy[a],xy[b],xy[c])<1e-9)continue;
  if(remaining.some(j=>j!==a&&j!==b&&j!==c&&[turn(xy[a],xy[b],xy[j]),turn(xy[b],xy[c],xy[j]),turn(xy[c],xy[a],xy[j])].every(v=>sign*v>=-1e-9)))continue;
  out.push({...face,indices:[a,b,c].map(i=>face.indices[i]),planarSubdivision:true});remaining.splice(k,1);found=true;break;
 }if(!found)throw Error('Cannot decompose authored face into planar patches');}
 out.push({...face,indices:remaining.map(i=>face.indices[i]),planarSubdivision:true});return out;
}

// Exported numeric topology is deliberately independent of Three and rendering.
// No PRNG is used: seed is identity metadata only for this measured variant.
export function buildCavePlan({reference=CAVE_REFERENCE,...overrides}={}){
 const options={...CAVE_DEFAULTS,...overrides};
 for(const k of ['unitsPerPixel','closedBackDepthPx','portalDepthPx'])if(!Number.isFinite(options[k])||options[k]<=0)throw RangeError(k+' must be positive');
 if(!Number.isFinite(options.bevelPx)||options.bevelPx<0||options.bevelPx>12)throw RangeError('bevelPx must be 0..12');
 const rocks=reference.rocks.map(r=>{
  const T=r.right[0],L=r.left[0],R=r.top[(r.top.findIndex(p=>key(p)===key(T))+r.top.length-1)%r.top.length];
  const common=r.left.filter(p=>r.right.some(q=>key(q)===key(p))&&!r.top.some(q=>key(q)===key(p)));
  const B=common.sort((a,b)=>b[1]-a[1])[0];if(!B)throw Error(r.id+': missing lower plane junction');
  const top=p=>r.depth+(p[1]-T[1])/Math.tan(rad(AUTHORING_VIEW.elevationDeg));
  const bd=r.depth-(B[1]-T[1])*Math.tan(rad(AUTHORING_VIEW.elevationDeg));
  const left=planeDepth(L,top(L),T,top(T),B,bd),right=planeDepth(T,top(T),R,top(R),B,bd);
  const depths=new Map();for(const [profile,fn]of [[r.top,top],[r.left,left],[r.right,right]])for(const p of profile)if(!depths.has(key(p)))depths.set(key(p),fn(p));
  const points=new Map(),vertices=[];
  function vertex(p,d=depths.get(key(p))){const k=key(p)+':'+d.toFixed(7);if(points.has(k))return points.get(k);const i=vertices.length;vertices.push(world(p,d,options));points.set(k,i);return i;}
  const faces=[['top',r.top],['left',r.left],['right',r.right]].map(([role,profile])=>({role,indices:profile.map(p=>vertex(p))}));
  if(options.bevelPx>0){
   const inner=insetConvex(r.top,options.bevelPx),innerIds=inner.map(p=>vertex(p,top(p)+1.8));
   const outerIds=faces[0].indices;faces[0]={role:'top',indices:innerIds};
   for(let i=0;i<outerIds.length;i++){const j=(i+1)%outerIds.length;faces.push({role:'top',indices:[outerIds[i],outerIds[j],innerIds[j],innerIds[i]],bevel:true});}
  }
  const edges=boundaryOf([r.top,r.left,r.right]),loops=closedLoops(edges),backDepth=Math.min(...depths.values())-options.closedBackDepthPx;
  for(const [a,b]of edges)faces.push({role:'hidden-side',indices:[vertex(a),vertex(b),vertex(b,backDepth),vertex(a,backDepth)]});
  for(const loop of loops)faces.push({role:'hidden-back',indices:[...loop].reverse().map(p=>vertex(p,backDepth))});
  const bounds=[0,1,2].map(i=>[Math.min(...vertices.map(p=>p[i])),Math.max(...vertices.map(p=>p[i]))]);
  const outlines=edges.map(([a,b])=>[vertex(a),vertex(b)]);
  return {id:r.id,name:r.name,vertices,faces:faces.flatMap(f=>planePatches(vertices,f)),outlines,profiles:{top:r.top,left:r.left,right:r.right},depths:Object.fromEntries(depths),neighbors:r.neighbors,center:bounds.map(([a,b])=>(a+b)/2),dimensions:bounds.map(([a,b])=>b-a),bevelPx:options.bevelPx,backDepth,estimated:true};
 });
 const p=reference.portal,depthScale=options.portalDepthPx/306;
 const rings=[p.mouth,p.inner,p.back].map((ring,j)=>ring.map(v=>world(v,[p.mouthDepth,p.innerDepth,p.backDepth][j]*depthScale,options)));
 const vertices=rings.flat(),n=p.mouth.length,faces=[];
 for(let k=0;k<2;k++)for(let i=0;i<n;i++){const j=(i+1)%n;faces.push({role:i===n-1?'interior-floor':i<4?'interior-left':i<7?'interior-ceiling':'interior-right',indices:[k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i]});}
 faces.push({role:'interior-back',indices:Array.from({length:n},(_,i)=>2*n+i)});
 return {version:'GV-CAVE-GEOMETRY-V01',seed:options.seed,options,authoringView:AUTHORING_VIEW,rocks,portal:{vertices,faces:faces.flatMap(f=>planePatches(vertices,f)),rings,openFront:true},source:reference.source};
}

function triangulateFace(THREE,vertices,ids){const v=ids.map(i=>vertices[i]),n=normal(v),u=unit(sub(v[1],v[0])),w=cross(n,u),flat=v.map(p=>{const d=sub(p,v[0]);return new THREE.Vector2(dot(d,u),dot(d,w));});return THREE.ShapeUtils.triangulateShape(flat,[]).map(t=>t.map(i=>ids[i]));}
function surfaceMesh(THREE,vertices,faces,materials){const positions=[],groups=[];let cursor=0;for(const f of faces){const triangles=triangulateFace(THREE,vertices,f.indices),start=cursor;for(const t of triangles){for(const i of t)positions.push(...vertices[i]);cursor+=3;}groups.push({start,count:cursor-start,role:f.role});}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();const keys=Object.keys(materials);for(const g of groups)geometry.addGroup(g.start,g.count,keys.indexOf(g.role));const mesh=new THREE.Mesh(geometry,Object.values(materials));mesh.userData.faceGroups=groups;return mesh;}
function insetConvex(profile,amount){
 const area=profile.reduce((s,p,i)=>{const q=profile[(i+1)%profile.length];return s+p[0]*q[1]-q[0]*p[1];},0),sgn=Math.sign(area);
 const edges=profile.map((p,i)=>{const q=profile[(i+1)%profile.length],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy);return {p:[p[0]-sgn*dy/l*amount,p[1]+sgn*dx/l*amount],d:[dx,dy]};});
 return profile.map((p,i)=>{const a=edges[(i+edges.length-1)%edges.length],b=edges[i],det=a.d[0]*b.d[1]-a.d[1]*b.d[0];if(Math.abs(det)<1e-8)return b.p;const t=((b.p[0]-a.p[0])*b.d[1]-(b.p[1]-a.p[1])*b.d[0])/det;const q=[a.p[0]+a.d[0]*t,a.p[1]+a.d[1]*t];return Math.hypot(q[0]-p[0],q[1]-p[1])>amount*5?b.p:q;});
}
const DEFAULT_PALETTE={ink:'#180d2f',slate:'#353658',steel:'#8b97b6'};
export function createCaveMaterials(THREE,{palette=DEFAULT_PALETTE}={}){
 const make=(color)=>new THREE.MeshLambertMaterial({color,flatShading:true,side:THREE.DoubleSide});
 // Named game colors reused as material inputs; illumination supplies face contrast.
 return {top:make(palette.steel),left:make(palette.steel),right:make(palette.steel),'hidden-side':make(palette.slate),'hidden-back':make(palette.slate),'interior-left':make(palette.slate),'interior-right':make(palette.slate),'interior-ceiling':make(palette.slate),'interior-floor':make(palette.slate),'interior-back':make(palette.ink)};
}

export function createCaveFormation(THREE,{plan=buildCavePlan(),palette=DEFAULT_PALETTE,materials=createCaveMaterials(THREE,{palette}),outlines=true}={}){
 const root=new THREE.Group();root.name='gemventure-cave-rock-formation';root.userData={version:plan.version,seed:plan.seed,source:plan.source,excludedObjects:[],geometryOnly:true};
 const basis=authoringBasis(),toward=new THREE.Vector3(...basis.toward);
 const outlineMaterial=new THREE.MeshBasicMaterial({color:palette.ink});
 const frameMaterials=createCaveMaterials(THREE,{palette:{...palette,steel:palette.slate}});
 for(const r of plan.rocks){const group=new THREE.Group();group.name=r.id;group.userData={center:r.center,dimensions:r.dimensions,neighbors:r.neighbors,estimated:true};
  const frame=['arch-left','jamb-left','jamb-right'].includes(r.id);
  const mesh=surfaceMesh(THREE,r.vertices,r.faces,frame?frameMaterials:materials);mesh.name=r.id+'-solid';group.add(mesh);
  // Thin real 3D tubes on authored perimeter edges; no triangle wireframe.
  if(outlines)for(const [a,b]of r.outlines){const va=new THREE.Vector3(...r.vertices[a]),vb=new THREE.Vector3(...r.vertices[b]);va.addScaledVector(toward,.008);vb.addScaledVector(toward,.008);const edge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(va,vb),1,plan.options.outlinePx*plan.options.unitsPerPixel/2,5,false),outlineMaterial);edge.name='rock-outline';group.add(edge);}
  root.add(group);
 }
 const interior=surfaceMesh(THREE,plan.portal.vertices,plan.portal.faces,materials);interior.name='recessed-cave-interior';interior.userData.openFront=true;root.add(interior);
 root.userData.dispose=()=>{const geometries=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());};
 return root;
}

export function createCaveCamera(THREE,{width=1567,height=1004,azimuthDeg=AUTHORING_VIEW.azimuthDeg,elevationDeg=AUTHORING_VIEW.elevationDeg,zoom=1,target=[0,0,0],unitsPerPixel=.01}={}){
 const fullH=AUTHORING_VIEW.frameHeight*unitsPerPixel,fullW=fullH*width/height;
 const camera=new THREE.OrthographicCamera(-fullW/2,fullW/2,fullH/2,-fullH/2,.1,200);
 const a=rad(azimuthDeg),e=rad(elevationDeg);camera.position.set(target[0]+80*Math.sin(a)*Math.cos(e),target[1]+80*Math.sin(e),target[2]+80*Math.cos(a)*Math.cos(e));camera.lookAt(...target);camera.zoom=zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();return camera;
}

export function addCaveLighting(THREE,scene,{ambient=1,keyIntensity=3,ambientColor=0x8da6ff,keyColor=0xc5d4ff,keyDirection={right:6,up:12,toward:6}}={}){
 const b=authoringBasis(),fill=new THREE.AmbientLight(ambientColor,ambient),keyLight=new THREE.DirectionalLight(keyColor,keyIntensity);
 keyLight.position.set(...b.right.map((_,i)=>b.right[i]*keyDirection.right+b.up[i]*keyDirection.up+b.toward[i]*keyDirection.toward));scene.add(fill,keyLight);return {fill,key:keyLight};
}
