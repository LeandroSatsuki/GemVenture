// Authored connected tiles, in the game's skewed cave camera. Presentation
// rounds only inside the logical cells; simulation terrain is never edited.
export const TERRAIN_SPEC=Object.freeze({tile:[22,16],density:4,variants:4,cacheLimit:192,waterHighlights:8,lavaBubbles:6,spores:8,maxSporeRise:28,maxBubbleRise:7});
export const TERRAIN_COLORS={1:['#276d91','#68a9be','#234e68'],2:['#3d3038','#786252','#251e29'],3:['#b54928','#f3a347','#74332b'],4:['#4a216f','#a46fd1','#2e1b47'],5:['#533b34','#8c6247','#3b2d30'],6:['#33452e','#718052','#24352b']};
const terrainDirs=[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8]],terrainDiags=[[1,-1,16,3],[1,1,32,6],[-1,1,64,12],[-1,-1,128,9]];
const terrainProject=(x,y)=>[50+22*x+2*y,57.5+16*y],terrainHash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967296;};
export function normalizeTerrainMask(mask){for(const [,,bit,required]of terrainDiags)if((mask&required)!==required)mask&=~bit;return mask;}
function terrainGeometry(mask){
 const corner=(a,b,diagonal)=>!(mask&a)&&!(mask&b)?{rx:7.4,ry:5.5,inner:false}:(mask&a)&&(mask&b)&&!(mask&diagonal)?{rx:1,ry:1,inner:true}:{rx:0,ry:0,inner:false};
 return {l:-11+((mask&8)?-.5:1),r:11-((mask&2)?-.5:1),t:-8+((mask&1)?-.5:1),b:8-((mask&4)?-.5:1),nw:corner(1,8,128),ne:corner(1,2,16),se:corner(4,2,32),sw:corner(4,8,64)};
}
export function traceTerrainTile(path,mask,x=0,y=0){
 const p=(u,v)=>[x+u+v/8,y+v],{l,r,t,b,nw,ne,se,sw}=terrainGeometry(mask);
 path.moveTo(...p(l+nw.rx,t));path.lineTo(...p(r-ne.rx,t));path.quadraticCurveTo(...p(ne.inner?r-ne.rx:r,ne.inner?t+ne.ry:t),...p(r,t+ne.ry));path.lineTo(...p(r,b-se.ry));path.quadraticCurveTo(...p(se.inner?r-se.rx:r,se.inner?b-se.ry:b),...p(r-se.rx,b));path.lineTo(...p(l+sw.rx,b));path.quadraticCurveTo(...p(sw.inner?l+sw.rx:l,sw.inner?b-sw.ry:b),...p(l,b-sw.ry));path.lineTo(...p(l,t+nw.ry));path.quadraticCurveTo(...p(nw.inner?l+nw.rx:l,nw.inner?t+nw.ry:t),...p(l+nw.rx,t));path.closePath();
}
function terrainRim(c,mask){
 const p=(u,v)=>[u+v/8,v],{l,r,t,b,nw,ne,se,sw}=terrainGeometry(mask);c.beginPath();
 if(!(mask&1)){c.moveTo(...p(l+nw.rx,t));c.lineTo(...p(r-ne.rx,t));}if(!(mask&2)){c.moveTo(...p(r,t+ne.ry));c.lineTo(...p(r,b-se.ry));}if(!(mask&4)){c.moveTo(...p(r-se.rx,b));c.lineTo(...p(l+sw.rx,b));}if(!(mask&8)){c.moveTo(...p(l,b-sw.ry));c.lineTo(...p(l,t+nw.ry));}
 if(nw.rx){c.moveTo(...p(l,t+nw.ry));c.quadraticCurveTo(...p(nw.inner?l+nw.rx:l,nw.inner?t+nw.ry:t),...p(l+nw.rx,t));}if(ne.rx){c.moveTo(...p(r-ne.rx,t));c.quadraticCurveTo(...p(ne.inner?r-ne.rx:r,ne.inner?t+ne.ry:t),...p(r,t+ne.ry));}if(se.rx){c.moveTo(...p(r,b-se.ry));c.quadraticCurveTo(...p(se.inner?r-se.rx:r,se.inner?b-se.ry:b),...p(r-se.rx,b));}if(sw.rx){c.moveTo(...p(l+sw.rx,b));c.quadraticCurveTo(...p(sw.inner?l+sw.rx:l,sw.inner?b-sw.ry:b),...p(l,b-sw.ry));}
}
export function buildTerrainPlan(room){
 const groups=new Map(),{cols,rows}=room,same=(x,y,t)=>x>=0&&y>=0&&x<cols&&y<rows&&room.floorMask[y*cols+x]&&room.terrain?.[y*cols+x]===t;
 for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++){
  const index=y*cols+x,type=room.terrain?.[index]||0;if(!type||!room.floorMask[index])continue;
  if(!groups.has(type))groups.set(type,{type,path:new Path2D(),coveragePath:new Path2D(),cells:[]});const group=groups.get(type),[px,py]=terrainProject(x,y);let mask=0;
  for(const [dx,dy,bit]of [...terrainDirs,...terrainDiags])if(same(x+dx,y+dy,type))mask|=bit;mask=normalizeTerrainMask(mask);
  traceTerrainTile(group.path,mask,px,py);const q=group.coveragePath;q.moveTo(px-12,py-8);q.lineTo(px+10,py-8);q.lineTo(px+12,py+8);q.lineTo(px-10,py+8);q.closePath();
  group.cells.push({x,y,index,px,py,mask,variant:Math.floor(terrainHash(room.seed+index*157)*4),priority:terrainHash(room.seed+index*691),phase:terrainHash(room.seed+index*31)});
 }
 for(const group of groups.values()){
  const count=group.type===1?8:group.type===3?6:group.type===4?8:0;
  group.emitters=[...group.cells].sort((a,b)=>a.priority-b.priority).filter((cell,i,all)=>!all.slice(0,i).some(other=>Math.abs(other.x-cell.x)+Math.abs(other.y-cell.y)<3)).slice(0,count);
 }
 return {groups:[...groups.values()],count:[...groups.values()].reduce((n,g)=>n+g.cells.length,0)};
}
function terrainPoly(c,points,fill){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();}
function paintTerrainTile(c,type,mask,variant){
 const [base,accent,bank]=TERRAIN_COLORS[type],path=new Path2D();traceTerrainTile(path,mask);c.save();c.clip(path);c.fillStyle=base;c.fill(path);
 if(type===1){
  // Broad submerged tonal masses, no hatch marks or per-tile borders.
  if(variant===3){c.globalAlpha=.08;c.fillStyle='#448eac';c.beginPath();c.ellipse(2,1,5,2.3,-.15,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  terrainRim(c,mask);c.strokeStyle=bank;c.lineWidth=2.4;c.stroke();terrainRim(c,mask);c.strokeStyle='#43849d';c.lineWidth=.65;c.globalAlpha=.4;c.stroke();c.globalAlpha=1;
 }else if(type===3){
  if(variant===3){c.globalAlpha=.24;c.fillStyle='#d05b2c';c.beginPath();c.ellipse(1,1,5,2.5,-.15,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  terrainRim(c,mask);c.strokeStyle=bank;c.lineWidth=2.8;c.stroke();terrainRim(c,mask);c.strokeStyle='#db7938';c.lineWidth=.65;c.stroke();
 }else if(type===2){
  c.save();if(variant&1)c.scale(-1,1);if(variant&2)c.scale(1,-1);
  terrainPoly(c,[[-12,-5],[-4,-2],[-1,-4],[2,-2],[5,0],[12,3],[12,4],[4,2],[0,-.6],[-5,-.7],[-12,-3.6]],bank);
  terrainPoly(c,[[-1,-2],[1,-1],[4,-7],[2,-8],[2,-4]],bank);terrainPoly(c,[[4,1],[5,2],[2,7],[.5,8],[1,4]],bank);
  terrainPoly(c,[[-10,-4.3],[-4,-1.4],[-1,-2],[4,1.2],[5,.6],[0,-3],[-4,-2.5]],'#746052');
  if(variant===2)terrainPoly(c,[[6,-4],[8,-4.6],[9,-3.2],[7.1,-2.8]],'#8c7d67');c.restore();
 }else if(type===4){
  // A connected violet liquid film; no repeated solid spore mounds per tile.
  if(variant===3){c.globalAlpha=.16;c.fillStyle='#7335a5';c.beginPath();c.ellipse(2,1,6,2.7,-.15,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  terrainRim(c,mask);c.strokeStyle=bank;c.lineWidth=2.3;c.stroke();terrainRim(c,mask);c.strokeStyle=accent;c.lineWidth=.7;c.globalAlpha=.46;c.stroke();c.globalAlpha=1;
 }else if(type===5){
  c.save();if(variant&1)c.scale(-1,1);for(const [x,y,w]of [[-5,-2,4],[3,2,5],[7,-3,2]]){terrainPoly(c,[[x-w/2,y],[x,y-1.5],[x+w/2,y-.6],[x+w/2,y+.8],[x,y+1.6]],bank);terrainPoly(c,[[x-w/2,y-.4],[x,y-1.8],[x+w/2,y-1],[x,y+.5]],accent);}c.restore();
 }else if(type===6){
  c.save();if(variant&1)c.scale(-1,1);terrainPoly(c,[[-13,5],[-6,1],[-1,0],[4,-4],[13,-5],[13,-2],[5,-1],[0,3],[-5,4],[-12,7]],'#293429');terrainPoly(c,[[-13,4],[-6,.2],[-1,-.8],[4,-4.8],[13,-5.8],[13,-4.2],[4,-3.2],[0,1.4],[-5,2.6],[-12,5.8]],accent);terrainPoly(c,[[-2,.5],[1,-.5],[3,6],[1.4,8],[.5,4]],'#556443');c.restore();
 }
 c.restore();
}
export function createTerrainPainter(makeCanvas){
 const cache=new Map();let peak=0;
 function tile(type,mask,variant){const key=[type,mask,variant].join(':');if(cache.has(key))return cache.get(key);const canvas=makeCanvas(104,80),c=canvas.getContext('2d');c.setTransform(4,0,0,4,52,40);paintTerrainTile(c,type,mask,variant);if(cache.size>=192)cache.delete(cache.keys().next().value);cache.set(key,canvas);peak=Math.max(peak,cache.size);return canvas;}
 const prepareTerrain=plan=>{for(const group of plan.groups)group.sprites=group.cells.map(cell=>({...cell,canvas:tile(group.type,cell.mask,cell.variant)}));return plan;};
 const paintTerrainLayer=(c,plan)=>{for(const group of plan.groups){if(!group.sprites)prepareTerrain(plan);for(const cell of group.sprites)c.drawImage(cell.canvas,cell.px-13,cell.py-10,26,20);}};
 return {prepareTerrain,paintTerrainLayer,terrainCacheStatus:()=>({entries:cache.size,peak,limit:192,density:4})};
}
export function sampleTerrainMotion(plan,time=0,soft=false){
 const samples=[];if(soft)return samples;
 for(const group of plan.groups)for(const cell of group.emitters){const period=group.type===1?5.4:group.type===3?3.4:4.6,u=((time/period+cell.phase)%1+1)%1;
  if(group.type===1){samples.push({type:1,x:cell.px+Math.sin(u*Math.PI*2)*1.8,y:cell.py-1+Math.sin(u*Math.PI*2)*1.2,r:4.2+Math.sin(u*Math.PI)*2.3,alpha:.19+.08*Math.sin(u*Math.PI)});}
  else if(group.type===3&&u<.77){const a=u/.77;samples.push({type:3,x:cell.px,y:cell.py,r:1.3+Math.sin(Math.min(1,a/.75)*Math.PI/2)*2.4,lift:Math.sin(a*Math.PI)*2.2,pop:a>.83?((a-.83)/.17):0});}
  else if(group.type===4&&u<.82){const a=u/.82;samples.push({type:4,x:cell.px+Math.sin(a*3.7+cell.phase*5)*2.3,y:cell.py-a*24,r:1.25+Math.sin(a*Math.PI)*.65,pop:a>.76?(a-.76)/.24:0});}
 }
 return samples;
}
export function paintTerrainMotion(c,plan,{time=0,soft=false}={}){
 for(const p of sampleTerrainMotion(plan,time,soft)){
  c.save();
  if(p.type===1){const group=plan.groups.find(g=>g.type===1);c.clip(group.path);c.globalAlpha=p.alpha;c.fillStyle='#a1cbd0';c.beginPath();c.moveTo(p.x-p.r,p.y);c.bezierCurveTo(p.x-p.r*.5,p.y-2.7,p.x+p.r*.5,p.y-2.7,p.x+p.r,p.y);c.bezierCurveTo(p.x+p.r*.3,p.y+1.6,p.x-p.r*.4,p.y+1.3,p.x-p.r,p.y);c.fill();c.globalAlpha=p.alpha*.60;c.beginPath();c.ellipse(p.x+2,p.y+3.6,p.r*.44,1.05,-.15,0,Math.PI*2);c.fill();}
  else if(p.type===3){
   if(!p.pop){c.fillStyle='#79352b';c.beginPath();c.ellipse(p.x,p.y+.4,p.r+1,p.r*.50,0,0,Math.PI*2);c.fill();c.fillStyle='#e27831';c.beginPath();c.ellipse(p.x,p.y-p.lift,p.r,p.r*.8,0,0,Math.PI*2);c.fill();c.fillStyle='#f4b155';c.beginPath();c.ellipse(p.x-p.r*.27,p.y-p.lift-p.r*.23,p.r*.43,p.r*.30,-.35,0,Math.PI*2);c.fill();}
   else{c.globalAlpha=1-p.pop;for(let i=0;i<4;i++){const a=i*Math.PI/2+.3,x=p.x+Math.cos(a)*p.pop*5,y=p.y-1-p.pop*4+Math.sin(a)*p.pop*1.5;c.fillStyle=i%2?'#e27831':'#f4b155';c.beginPath();c.ellipse(x,y,.7,.6,0,0,Math.PI*2);c.fill();}}
  }else{
   c.fillStyle='#c789bc';c.globalAlpha=p.pop?1-p.pop:.62;
   if(!p.pop){c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();c.fillStyle='#e4b5d2';c.beginPath();c.arc(p.x-.4,p.y-.5,p.r*.36,0,Math.PI*2);c.fill();}
   else for(let i=0;i<4;i++){const a=i*Math.PI/2,x=p.x+Math.cos(a)*p.pop*4,y=p.y+Math.sin(a)*p.pop*3;c.beginPath();c.arc(x,y,.65,0,Math.PI*2);c.fill();}
  }
  c.restore();
 }
}
