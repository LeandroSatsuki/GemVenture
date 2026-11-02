import {P} from './palette.js';

// Authoring contract only. The live game does not import this preview module.
export const TERRAIN_GRID=Object.freeze({columns:8,rows:8,cell:256,width:2048,height:2048});
export const TERRAIN_FOOTPRINT=Object.freeze({origin:[32,120],u:[176,0],v:[16,128],anchor:[128,184],wallHeight:76});
export const TERRAIN_BITS=Object.freeze({N:1,E:2,S:4,W:8,NE:16,SE:32,SW:64,NW:128});
export const TERRAIN_MATERIALS=Object.freeze([
 {id:'pedra',name:'PEDRA',base:P.gray,top:P.steel,shadow:P.slate,role:'Grutas · ruínas · paredões'},
 {id:'terra',name:'TERRA',base:P.clay,top:P.ochre,shadow:P.wood,role:'Tocas · caminhos · barrancos'},
 {id:'grama',name:'GRAMA',base:P.green,top:P.lime,shadow:P.forest,role:'Vila · floresta · ilhas'},
 {id:'agua',name:'ÁGUA',base:P.blue,top:P.cyan,shadow:P.deepBlue,role:'Lagos · rios · margens'},
 {id:'lava',name:'LAVA',base:P.orange,top:P.yellow,shadow:P.red,role:'Manto · canais · fissuras'},
 {id:'madeira',name:'MADEIRA',base:P.clay,top:P.sand,shadow:P.wood,role:'Passarelas · pontes · pisos'},
 {id:'alvenaria',name:'ALVENARIA',base:P.rust,top:P.clay,shadow:P.bark,role:'Muros · bases · construções'}
].map(Object.freeze));
export function terrainGenerationPrompt(id){
 const m=TERRAIN_MATERIALS.find(m=>m.id===id);if(!m)throw new RangeError('Unknown terrain material');
 const subjects={pedra:'Quiet broad gray stone surfaces and continuous rock cliffs. A few shallow broad cracks; no ores, jewels or piles of mineable boulders.',terra:'Warm compact earthen paths and layered solid dirt banks. Very few broad rounded embedded stones; no scattered gravel noise.',grama:'A continuous low green grass surface and thick earth banks with a thin grass cap. Broad clean masses; no dense individual blades, flowers or bushes.',agua:'Deep blue water with a few broad cyan ripple shapes, quiet stone shorelines and falling-water planes. No white specular streaks, foam noise or glossy photorealistic reflections.',lava:'Opaque warm orange-red magma with a few broad yellow channels and dark solid crust. Charred edges and falling magma planes. No bloom, glare, sparks or light outside the silhouette.',madeira:'Broad warm wooden planks, solid timber edges and simple rustic wooden stairs. A few broad joints, no fine grain noise, nails or technological metal.',alvenaria:'Rustic warm stone-brick masonry and broad paving blocks. Very few large bricks, consistent wall height, broad clean mortar joints, no tiny damaged fragments.'};
 return `Create one Gemventure terrain spritesheet for the ${m.name} material family. The supplied material-template PNG is the GEOMETRY reference. The approved blue slime is the STYLE and elevated orthographic camera reference only; never depict the creature, eyes or its crystal.\n\nSTRICT ATLAS CONTRACT: 2048 x 2048 transparent PNG, 8 columns and 8 rows, 256 x 256 per cell. Preserve every stencil's alpha coverage, cell position, scale and ground anchor. Do not reinterpret, rotate the camera, respace or redraw the connection silhouettes. Paint within the existing masks. No headings, labels, grid lines, margins inside the stencil, scenery backdrop or drop shadow outside modules.\n\nMATERIAL: ${subjects[id]} Colors from Gemventure's family: base ${m.base}, lighter broad plane ${m.top}, one shadow family ${m.shadow}; dark-purple silhouette contour ${P.ink} only where structurally needed. Match the approved softened geometric masses, broad matte bevel faces and restrained detail. Do not force extra highlights or perfectly harsh posterization that destroys the approved bevels. No bloom, glossy wet plastic, tiny facets, random spikes or photorealistic texture.\n\nPERSPECTIVE: fixed elevated near-front orthographic view, near-horizontal U axis, V depth shifting slightly right. Never symmetrical diamond isometry. Floors are flat continuous surfaces; no extruded pedestal under each floor tile. NO dark outlines or perimeter bevel around connected interior floor cells. Volumetric walls and separate props can have the approved bold outer silhouette.\n\nSLOTS, zero-based in reading order: 00–46 are the supplied 47 connection masks, including reentrant corners. 47–50 are vertical faces N/E/S/W. 51–54 are terminations N/E/S/W. 55–58 are stairs N/E/S/W for solid materials, or four water/magma surface-flow motifs for liquids. 59–62 are quiet full-surface variants A/B/C/D. 63 is a sparse matching overlay accent. Keep all anchor points unchanged. Liquid edges remain fixed; the four motifs are animation source frames, not permission to move the shoreline.\n\nExactly one material family, all geometry faithful to the supplied stencil, truly transparent empty pixels and clean antialiased coverage. The atlas will be checked against its masks; attractive shapes alone are not sufficient.\n`;
}

// A diagonal matters only if both cardinal neighbors exist. Exactly 47 cases.
export function normalizeTerrainMask(mask){
 let result=mask&15;
 for(const [bit,a,b]of [[16,1,2],[32,2,4],[64,4,8],[128,8,1]])if((mask&bit)&&(mask&a)&&(mask&b))result|=bit;
 return result;
}
export const TERRAIN_MASKS=Object.freeze([...new Set(Array.from({length:256},(_,mask)=>normalizeTerrainMask(mask)))].sort((a,b)=>a-b));
export function terrainMaskAt(map,x,y){
 const value=map[y]?.[x];if(!value)return 0;let mask=0;
 for(const [dx,dy,bit]of [[0,-1,1],[1,0,2],[0,1,4],[-1,0,8],[1,-1,16],[1,1,32],[-1,1,64],[-1,-1,128]])if(map[y+dy]?.[x+dx]===value)mask|=bit;
 return normalizeTerrainMask(mask);
}
export const terrainSlot=mask=>TERRAIN_MASKS.indexOf(normalizeTerrainMask(mask));
const rotate=([x,y],turn)=>turn===1?[1-y,x]:turn===2?[1-x,1-y]:turn===3?[y,1-x]:[x,y];
export function terrainPolygon(mask){
 mask=normalizeTerrainMask(mask);const inset=.22,radius=.1,points=[];
 for(const [turn,a,b,diagonal]of [[0,1,2,16],[1,2,4,32],[2,4,8,64],[3,8,1,128]]){
  const first=!!(mask&a),second=!!(mask&b);let corner;
  if(first&&second&&!(mask&diagonal))corner=Array.from({length:9},(_,i)=>{const angle=Math.PI-i*Math.PI/16;return [1+Math.cos(angle)*inset,Math.sin(angle)*inset];});
  else if(!first&&!second)corner=Array.from({length:9},(_,i)=>{const angle=-Math.PI/2+i*Math.PI/16;return [1-inset-radius+Math.cos(angle)*radius,inset+radius+Math.sin(angle)*radius];});
  else corner=[[second?1:1-inset,first?0:inset]];
  points.push(...corner.map(p=>rotate(p,turn)));
 }return points;
}
export function projectTerrainPoint([u,v],z=0){const {origin,u:axisU,v:axisV}=TERRAIN_FOOTPRINT;return [origin[0]+axisU[0]*u+axisV[0]*v,origin[1]+axisU[1]*u+axisV[1]*v-z];}
export const terrainPolygonPath=mask=>terrainPolygon(mask).map((p,i)=>(i?'L':'M')+projectTerrainPoint(p).map(n=>Number(n.toFixed(4))).join(' ')).join(' ')+'Z';
const extras=[
 ...['N','L','S','O'].map(direction=>({kind:'wall',direction,label:'FACE '+direction})),
 ...['N','L','S','O'].map(direction=>({kind:'cap',direction,label:'TERMINAÇÃO '+direction})),
 ...['N','L','S','O'].map(direction=>({kind:'stairs',direction,label:'ESCADA '+direction})),
 ...['A','B','C','D'].map(direction=>({kind:'variant',direction,label:'PISO '+direction})),
 {kind:'overlay',label:'ACENTO / MOVIMENTO'}
];
export const TERRAIN_SLOTS=Object.freeze([...TERRAIN_MASKS.map(mask=>({kind:'mask',mask,label:'MÁSCARA '+mask})),...extras].map((slot,id)=>Object.freeze({...slot,id,row:Math.floor(id/8),column:id%8,frame:{x:id%8*256,y:Math.floor(id/8)*256,width:256,height:256}})));
function prismSvg(x,y,w,h,height,labels){
 const floor=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],low=floor.map(p=>projectTerrainPoint(p)),top=floor.map(p=>projectTerrainPoint(p,height));
 const poly=(points,color)=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${labels?color:P.white}"/>`;
 return poly([top[1],low[1],low[2],top[2]],P.slate)+poly([top[2],low[2],low[3],top[3]],P.gray)+poly(top,P.steel);
}
export function terrainGuideSvg({labels=false,material='pedra'}={}){
 const cells=TERRAIN_SLOTS.map(slot=>{
  let shape;
  if(slot.kind==='mask')shape=`<path d="${terrainPolygonPath(slot.mask)}" fill="${labels?P.cyan:P.white}"/>`;
  else if(slot.kind==='variant')shape=`<path d="${terrainPolygonPath(255)}" fill="${labels?P.steel:P.white}"/>`;
  else{
   const direction=['N','L','S','O'].indexOf(slot.direction),line=[[[32,120],[208,120]],[[208,120],[224,248]],[[224,248],[48,248]],[[48,248],[32,120]]][Math.max(0,direction)];
   if(slot.kind==='wall'||slot.kind==='cap'){const a=line[0],b=line[1],width=slot.kind==='cap'?.28:1,end=[a[0]+(b[0]-a[0])*width,a[1]+(b[1]-a[1])*width],h=TERRAIN_FOOTPRINT.wallHeight;shape=`<polygon points="${[a,end,[end[0],end[1]-h],[a[0],a[1]-h]].map(p=>p.join(',')).join(' ')}" fill="${labels?P.steel:P.white}"/>`;}
   else if(slot.kind==='stairs'&&['agua','lava'].includes(material))shape=`<path d="${terrainPolygonPath(255)}" fill="${labels?P.blue:P.white}"/>`;
   else if(slot.kind==='stairs'){shape=Array.from({length:4},(_,i)=>{const horizontal=direction===1||direction===3,u=horizontal?i/4:0,v=horizontal?0:i/4,h=(direction===0||direction===3?4-i:i+1)*18;return prismSvg(u,v,horizontal?.25:1,horizontal?1:.25,h,labels);}).join('');}
   else shape=`<ellipse cx="128" cy="184" rx="42" ry="20" fill="${labels?P.lemon:P.white}"/>`;
  }
  return `<g transform="translate(${slot.column*256} ${slot.row*256})">${labels?`<rect width="256" height="256" fill="none" stroke="${P.slate}"/><text x="12" y="22" fill="${P.lemon}" font-family="sans-serif" font-size="13">${String(slot.id).padStart(2,'0')} · ${slot.label}</text>`:''}${shape}${labels?`<circle cx="128" cy="184" r="3" fill="${P.pink}"/>`:''}</g>`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048">${labels?`<rect width="2048" height="2048" fill="${P.ink}"/>`:''}${cells}</svg>`;
}
