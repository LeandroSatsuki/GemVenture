import {crystalVeinShapes} from './crystal-veins.js';
// Cosmos/cave-v1 solids. Projection matches a world tile: (44,0),(4,32),(0,-1).
export const DUNGEON_MATERIALS=Object.freeze([
 {rock:['#8394a6','#5c627d','#374252'],gem:['#2fbfcd','#287cb8','#245473'],floor:'#1c2945',light:'#2fbfcd',kind:'crystal'},
 {rock:['#5acc9a','#288a3f','#005a41'],gem:['#c5e848','#568c20','#456130'],floor:'#003441',light:'#a2e66f',kind:'spore'},
 {rock:['#f7bf6f','#ed9353','#913f39'],gem:['#f7bf6f','#e97c07','#9c3824'],floor:'#543545',light:'#ffd95a',kind:'fossil'},
 {rock:['#5c627d','#3f2966','#222347'],gem:['#f27f72','#ce2029','#591d35'],floor:'#271b3b',light:'#f06c1a',kind:'magma'},
 {rock:['#9cbab0','#5d7585','#245473'],gem:['#db5ebe','#a346bd','#3f2966'],floor:'#132233',light:'#db5ebe',kind:'mycelium'},
 {rock:['#ed9353','#c75a4a','#913f39'],gem:['#f7bf6f','#e97c07','#9c3824'],floor:'#3d2839',light:'#f7bf6f',kind:'amber'},
 {rock:['#9cbab0','#456130','#1d3926'],gem:['#a2e66f','#5dae27','#1d3926'],floor:'#1d3926',light:'#a2e66f',kind:'roots'}
]);
export const projectDungeon=([x,y,z])=>[50+x+y/11,88+y*8/11-z];
const ink='#161928',glint='#ffffe0';
export function volumeBuilder({castShadow=true}={}){
 const shapes=[],shadows=[];
 const path=(points,fill,stroke=null)=>{shapes.push({type:'path',d:points.map((p,i)=>(i?'L':'M')+p.map(v=>+v.toFixed(3)).join(' ')).join(' ')+' Z',fill,stroke,layer:'base',hardEdges:true});};
 const prism=(x,y,z,w,d,h,ramp,bevel=2,cut=3)=>{
  const ring=(inset,height)=>{const a=w/2-inset,b=d/2-inset,k=Math.max(.3,cut-inset*.3);return [[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]].map(([u,v])=>[x+u,y+v,z+height]);};
  const rings=[ring(bevel,0),ring(0,bevel),ring(0,h-bevel),ring(bevel,h)];
  // Contact/projection follows the footprint and the height, not a universal disc.
  const bottom=rings[0].map(p=>projectDungeon([p[0],p[1],0])),shadow=rings[3].map(p=>projectDungeon([p[0]+(z+h)*.24,p[1]+(z+h)*.12,0]));
  const before=shapes.length;path([...bottom.slice(3,7),...shadow.slice(3,7).reverse()], '#132233');const cast=shapes.splice(before);if(castShadow)shadows.push(...cast);
  for(let level=0;level<3;level++)for(let i=0;i<8;i++){
   const j=(i+1)%8,a=rings[level][i],b=rings[level][j],nx=b[1]-a[1],ny=a[0]-b[0];
   if(-nx/11+ny<=0)continue;
   const color=level===2?(nx<0?glint:ramp[0]):level===0?ramp[2]:nx<0?ramp[1]:ramp[2];
   path([a,b,rings[level+1][j],rings[level+1][i]].map(projectDungeon),color);
  }
  path(rings[3].map(projectDungeon),ramp[0]);
  // Only short upper-left bevel highlights, no white outline around the solid.
  const top=rings[3],p=top[6],q=top[7];path([p,q,[q[0]+.65,q[1],q[2]],[p[0]+.65,p[1],p[2]]].map(projectDungeon),glint);
 };
 const crystal=(x,y,z,w,d,h,ramp,lean=0)=>{
  // Broad octagonal root and a separate, faceted crown; bevels are real surfaces.
  const outline=[[-.34,-.5],[.34,-.5],[.5,-.34],[.5,.34],[.34,.5],[-.34,.5],[-.5,.34],[-.5,-.34]];
  const ring=(scale,zz)=>outline.map(([u,v])=>[x+u*w*scale+lean*zz/h,y+v*d*scale,z+zz]);
  const bottom=ring(.92,0),belt=ring(1,2.2),shoulder=ring(.96,h*.67),tip=ring(.18,h),rings=[bottom,belt,shoulder,tip];
  if(castShadow){const start=shapes.length;path([...bottom.slice(2,7),...tip.slice(2,7).reverse().map(p=>[p[0]+h*.2,p[1]+h*.12,0])].map(projectDungeon),'#132233');shadows.push(...shapes.splice(start));}
  for(let level=0;level<3;level++)for(let i=0;i<8;i++){
   const j=(i+1)%8,a=rings[level][i],b=rings[level][j],nx=b[1]-a[1],ny=a[0]-b[0];if(-nx/11+ny<=0)continue;
   // Broad facets keep the mineral hue; ivory is reserved for the tiny bevel glint.
   const color=level===0?ramp[2]:level===2?(nx<0?ramp[0]:ramp[1]):nx<0?ramp[1]:ramp[2];
   path([a,b,rings[level+1][j],rings[level+1][i]].map(projectDungeon),color);
  }
  path(tip.map(projectDungeon),ramp[0]);
  const mix=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t),a=shoulder[5],b=shoulder[6];
  path([mix(a,b,.55),mix(a,b,.85),mix(tip[6],b,.8),mix(a,b,.55).map((v,i)=>i===2?v-2:v)].map(projectDungeon),glint);
 };
 return {get shapes(){return [...shadows,...shapes];},path,prism,crystal};
}
export function dungeonMineralShapes(type,{variant=0,biome=0,j=0}={}){
 if(type==='crystal')return crystalVeinShapes({variant,biome,j});
 const b=DUNGEON_MATERIALS[biome],v=volumeBuilder(),k=variant%3;
 if(type==='rock'){
  // Porous: low terraced slab with recessed pockets. Compact: one broad
  // dense body. Brute: tall split angular blocks. Their gameplay kind is stable.
  const groups=[[[0,3,0,66,39,13],[-6,-3,12,55,31,11],[7,-5,22,35,25,8]],[[0,0,0,61,42,39],[-25,14,0,18,16,12]],[[-18,-3,0,32,32,47],[15,-9,0,31,31,57],[17,18,0,37,24,22]]];
  for(const g of groups[k])v.prism(g[0],g[1],g[2],g[3],g[4],g[5]+j*.4,b.rock,k===2?1.3:2.1,k===1?9:4);
  if(k===0)for(const [x,y,z,w,d]of [[-20,2,23,8,6],[8,1,30,7,5],[18,2,30,6,4]]){
   v.path([[x-w/2,y,z],[x,y-d/2,z],[x+w/2,y,z],[x+w/3,y+d/2,z],[x-w/3,y+d/2,z]].map(projectDungeon),b.rock[2]);
   v.path([[x-w/3,y+d/2,z],[x+w/3,y+d/2,z],[x+w/4,y+d/2,z+1]].map(projectDungeon),b.rock[0]);
  }
  const [ax,ay,az]=[[7,-5,30],[-8,-2,39],[-18,-3,47]][k],top=az+j*.4;
  if(biome===2){v.prism(ax,ay,top,13,9,3,['#c4ccc7','#8394a6','#5c627d'],.7,2);v.prism(ax+3,ay+1,top+2,5,5,3,b.rock,.4,1);}
  else if(biome===5){v.prism(ax,ay,top,13,12,6,b.gem,1,2);}
  else if(biome===1||biome===4||biome===6){v.prism(ax,ay,top,19,13,5,b.gem,1,2);}
 }
 return v.shapes;
}
export function dungeonDecorationShapes(type,{biome=0}={}){
 const b=DUNGEON_MATERIALS[biome],v=volumeBuilder({castShadow:type!=='lantern'}),wood=['#ed9353','#9c3824','#591d35'];
 if(type==='lift'){
  const steel=['#8394a6','#5c627d','#374252'];
  v.prism(0,0,0,82,54,9,steel,2,5);
  for(const x of [-32,32]){v.prism(x,-11,8,15,18,67,wood,2,2);v.prism(x,-11,18,17,20,7,steel,1,2);v.prism(x,-11,61,17,20,7,steel,1,2);}
  v.prism(0,-11,73,86,21,13,wood,2,3);
  for(const x of [-21,21])v.prism(x,-10,9,3,4,62,steel,.5,.5);
  v.prism(0,-10,59,20,17,12,['#ffffe0','#ffd95a','#e97c07'],1,2);
  v.prism(0,7,9,47,35,5,wood,1,3);
 }else if(type==='lantern'){
  // Flush wall bracket: no projected ground shadow from the luminous window.
  v.path([[43,80],[61,78],[67,72],[50,74]],'#132233');
  v.prism(0,-8,8,13,8,38,b.rock,1,2);v.prism(0,-2,34,9,21,7,wood,1,2);
  v.prism(0,0,35,29,24,7,b.rock,1,3);v.prism(0,0,42,20,18,24,[glint,b.light,b.light],2,2);
  v.prism(0,0,66,29,24,7,b.rock,2,3);
  for(const x of [-10,10])v.prism(x,7,42,3,3,24,wood,.5,.5);
 }else if(type==='fossil'){
  const bone=['#c4ccc7','#8394a6','#5c627d'];v.prism(0,0,0,44,29,28,bone,3,5);v.prism(0,13,0,28,12,8,bone,1,2);
  v.path([[36,69],[44,69],[44,78],[36,78]],ink);v.path([[56,69],[64,69],[64,78],[56,78]],ink);
  for(const x of [-8,0,8])v.prism(x,21,1,5,4,6,bone,.5,1);
 }else if(type==='mushroom'){
  for(const [x,y,h,s]of [[-15,0,24,1],[18,9,15,.7]]){v.prism(x,y,0,12*s,12*s,h,['#c4ccc7','#8394a6','#5c627d'],1,2);v.prism(x,y,h,32*s,28*s,13,b.gem,2,3);v.prism(x-6,y-5,h+13,7,6,2,['#ffffe0','#c4ccc7','#8394a6'],.4,1);}
 }else if(type==='bush'||type==='molehill'){
  const ramp=type==='bush'?['#5acc9a','#288a3f','#005a41']:b.rock;
  for(const g of [[0,-5,0,32,25,33],[-21,10,0,23,23,22],[20,11,0,23,23,18]])v.prism(...g,ramp,2,3);
 }else if(type==='lava'){
  for(const g of [[-17,1,0,28,24,26],[12,-3,0,32,28,37],[23,13,0,19,20,15]])v.prism(...g,b.rock,2,3);
  v.prism(8,12,14,9,6,18,['#ffd95a','#f06c1a','#ce2029'],1,2);
 }else return null;
 return v.shapes;
}
