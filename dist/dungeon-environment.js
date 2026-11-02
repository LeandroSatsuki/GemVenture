import {visionPresentationScale} from './cave-field-presentation.js';
import {DUNGEON_MATERIALS} from './dungeon-volumes.js';
import {drawAsset} from './art-kit.js';
import {buildWallPlan} from './cave-wall-art.js';
import {terrainMaskAt,terrainPolygon} from './terrain-kit.js';
const plans=new WeakMap(),ink='#161928';
const poly=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
export function dungeonEnvironmentPlan(room,biome){
 const prev=plans.get(room);if(prev?.mask===room.floorMask&&prev.biome===biome)return prev;
 const plan={mask:room.floorMask,biome,lights:[],decor:[],liquids:[]},walls=buildWallPlan(room),b=DUNGEON_MATERIALS[biome];
 for(const f of walls.faces){if(f.role!=='front'||f.height<24||f.b[0]-f.a[0]<45)continue;
  const x=(f.a[0]+f.b[0])/2,y=f.a[1]-3;
  if(plan.lights.some(p=>Math.hypot(p.x-x,p.y-y)<95))continue;
  plan.lights.push({x,y,phase:((Math.round(x)*13+Math.round(y)*29+room.seed)>>>0)%100/13});
  const type=['crystal','mushroom','fossil','lava','mushroom','molehill','bush'][biome];
  if(f.b[0]-f.a[0]>95&&plan.decor.every(d=>Math.hypot(d.x-(f.a[0]+26),d.y-(f.a[1]-f.height-4))>115))plan.decor.push({type,x:f.a[0]+26,y:f.a[1]-f.height-4,width:biome===2?38:34,seed:room.seed+plan.lights.length});
 }
 for(let type=1;type<=6;type++){
  const grid=Array.from({length:room.rows},(_,y)=>Array.from({length:room.cols},(_,x)=>room.terrain?.[y*room.cols+x]===type?1:0));
  const path=new Path2D(),edges=[],ripples=[];
  for(let y=1;y<room.rows-1;y++)for(let x=1;x<room.cols-1;x++)if(grid[y][x]){
   const px=38+22*x+2*y,py=49.5+16*y,mask=terrainMaskAt(grid,x,y);
   terrainPolygon(mask).forEach(([u,v],i)=>{const a=px+22*u+2*v,b=py+16*v;i?path.lineTo(a,b):path.moveTo(a,b);});path.closePath();
   for(const [dx,dy,a,b]of [[0,-1,[px,py],[px+22,py]],[1,0,[px+22,py],[px+24,py+16]],[0,1,[px+24,py+16],[px+2,py+16]],[-1,0,[px+2,py+16],[px,py]]])if(!grid[y+dy]?.[x+dx])edges.push([a,b]);
   if((x*17+y*11+room.seed)%5===0)ripples.push({x:px+9,y:py+8,phase:(x*3+y*7)%13});
  }
  const edgePath=new Path2D();for(const [a,z]of edges){edgePath.moveTo(...a);edgePath.lineTo(...z);}plan.liquids.push({type,path,edges,edgePath,ripples});
 }
 plans.set(room,plan);return plan;
}
export function paintDungeonEnvironment(c,room,biome,time,{soft=false,viewport=null}={}){
 if(!room.floorMask)return;const p=dungeonEnvironmentPlan(room,biome),b=DUNGEON_MATERIALS[biome],t=soft?0:time;
 c.save();c.lineJoin='round';c.lineCap='round';
 const colors=[null,['#183454','#2fbfcd'],['#591d35','#f06c1a'],['#591d35','#f06c1a'],['#3f2966','#db5ebe'],['#9c3824','#ffd95a'],['#005a41','#a2e66f']];
 for(const q of p.liquids){const edgePath=q.edgePath;const [base,lit]=colors[q.type];c.fillStyle=base;c.fill(q.path);c.save();c.clip(q.path);c.translate(0,2);c.strokeStyle='#071b2b';c.lineWidth=4;c.stroke(edgePath);c.restore();c.save();c.clip(q.path);c.strokeStyle=lit;c.lineWidth=.8;
  for(const r of q.ripples){const speed=q.type===5?.3:q.type===4?.55:.8,u=t*speed+r.phase;c.globalAlpha=.4+.1*Math.sin(u);c.fillStyle=lit;c.beginPath();
   if(q.type===2){ // Fossil hazard is a hot liquid, distinct from the ochre rock floor.
    c.globalAlpha=.65;c.beginPath();c.ellipse(r.x,r.y,5+Math.sin(u)*1.5,2,0,0,Math.PI*2);c.fill();c.strokeStyle='#ffd95a';c.beginPath();c.ellipse(r.x-1,r.y-1,2,1,0,0,Math.PI*1.4);c.stroke();c.strokeStyle=lit;
   }else if(q.type===3){ // Molten pools: expanding rings, rigid glowing embers.
    const phase=(u/6.283)%1;c.ellipse(r.x,r.y,2+phase*5,1+phase*2,0,0,Math.PI*2);c.stroke();c.fillRect(r.x+3,r.y-3-phase*4,1.8,1.8);
   }else if(q.type===4){ // Mycelium: small spores drifting above the purple carpet.
    const phase=((u%4)+4)%4/4;c.globalAlpha=(1-phase)*.48;c.fillRect(r.x+Math.sin(u)*3,r.y-phase*8,1.7,1.7);
   }else if(q.type===6){ // Roots are connected branches; leaves pulse without swimming.
    c.moveTo(r.x-7,r.y+3);c.lineTo(r.x,r.y);c.lineTo(r.x+7,r.y-2);c.moveTo(r.x,r.y);c.lineTo(r.x-2,r.y-4);c.stroke();c.fillRect(r.x+4,r.y-3,2,1.3);
   }else{ // Water and amber have distinct cadences and broad, quiet ripples.
    c.moveTo(r.x-6,r.y+Math.sin(u)*1.3);c.quadraticCurveTo(r.x,r.y+2+Math.sin(u)*1.3,r.x+9,r.y+Math.sin(u)*1.3);c.stroke();
   }
  }
  c.restore();c.save();c.clip(q.path);c.translate(-.5,-.7);c.strokeStyle=lit;c.globalAlpha=.48;c.lineWidth=1.2;c.stroke(edgePath);c.restore();c.globalAlpha=.7;c.strokeStyle=ink;c.lineWidth=1.3;c.beginPath();for(const [a,z]of q.edges){c.moveTo(...a);c.lineTo(...z);}c.stroke();c.globalAlpha=1;
 }
 for(const d of p.decor)drawAsset(c,d.type,d.x,d.y,d.width,{biome,variant:biome%4,seed:d.seed});
 for(const light of p.lights){if(viewport&&(light.x<viewport.x-80||light.x>viewport.x+viewport.w+80||light.y<viewport.y-80||light.y>viewport.y+viewport.h+80))continue;
  const {x,y,phase}=light,k=.88+.12*Math.sin(t*1.4+phase),cy=y-12;
  c.save();c.globalCompositeOperation='screen';const glow=c.createRadialGradient(x,cy,1,x,cy,43);glow.addColorStop(0,b.light+'48');glow.addColorStop(.35,b.light+'1d');glow.addColorStop(1,b.light+'00');c.globalAlpha=k;c.fillStyle=glow;c.fillRect(x-43,cy-43,86,86);c.restore();
  drawAsset(c,'lantern',x,y,21,{biome});
  c.fillStyle='#ffffe0';c.globalAlpha=.3*k;c.beginPath();c.ellipse(x,cy,1.8,2.4,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  if(!soft){const travel=(t*.22+phase)%1;c.globalAlpha=(1-travel)*.6;c.fillStyle=b.light;c.fillRect(x+Math.sin(t*.7+phase)*5,cy-8-travel*12,1.1,1.1);c.globalAlpha=1;}
 }
 c.restore();
}

export const DUNGEON_NIGHT=Object.freeze({strength:.90,playerReveal:.84,lanternReveal:.78,crystalReveal:.36});
const nightCanvases=new WeakMap();
// Local light only reveals already visible geometry. Fog-of-war is still owned by cavern.js.
export function paintDungeonNight(c,run,player,viewport,biome){
 if(typeof document==='undefined')return false;
 let mask=nightCanvases.get(c);if(!mask){mask=document.createElement('canvas');nightCanvases.set(c,mask);}
 const w=Math.ceil(viewport.w)+8,h=Math.ceil(viewport.h)+8;if(mask.width!==w)mask.width=w;if(mask.height!==h)mask.height=h;
 const m=mask.getContext('2d');m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,w,h);m.fillStyle=['#245473','#005a41','#543545','#3f2966','#245473','#543545','#1d3926'][biome];m.fillRect(0,0,w,h);m.globalCompositeOperation='destination-out';
 const hole=(x,y,r,power=1)=>{const g=m.createRadialGradient(x,y,r*.45,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+power+')');g.addColorStop(.65,'rgba(0,0,0,'+(power*.85)+')');g.addColorStop(1,'rgba(0,0,0,0)');m.fillStyle=g;m.fillRect(x-r,y-r,r*2,r*2);};
 hole(player.x/2-viewport.x+4,player.y/2-viewport.y-4,95*visionPresentationScale(run),DUNGEON_NIGHT.playerReveal);
 for(const p of dungeonEnvironmentPlan(run.room,biome).lights){const ty=Math.round((p.y+7-57.5)/16),tx=Math.round((p.x-50-ty*2)/22),i=ty*run.room.cols+tx;
 if(run.room.visible&&!run.room.visible[i])continue;hole(p.x-viewport.x+4,p.y-viewport.y-10,38,DUNGEON_NIGHT.lanternReveal);}
 for(const gem of (run.room.crystals||[]).filter(g=>g.hp>0&&(!run.room.visible||run.room.visible[g.y*run.room.cols+g.x])).slice(0,12)){hole(50+gem.x*22+gem.y*2-viewport.x+4,57.5+gem.y*16-viewport.y-11,24,DUNGEON_NIGHT.crystalReveal);}
 m.globalCompositeOperation='source-over';c.save();c.globalCompositeOperation='multiply';c.globalAlpha*=DUNGEON_NIGHT.strength;c.drawImage(mask,viewport.x-4,viewport.y-4);c.restore();return true;
}

// Presentation-only air motes; no room randomness, collision, tint or light changes.
export const DUNGEON_MOTE_SPEC=Object.freeze({count:22,maxCount:36,maxRadius:1.8,alphaMin:.34,alphaMax:.64});
const moteHash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967296;};
export function sampleDungeonMotes({biome=0,seed=0,time=0,energy=0,viewport={x:0,y:0,w:600,h:380},soft=false}={}){
 if(soft||![viewport.x,viewport.y,viewport.w,viewport.h].every(Number.isFinite)||viewport.w<=0||viewport.h<=0)return [];
 const b=(Number(biome)>>>0)%DUNGEON_MATERIALS.length,color=DUNGEON_MATERIALS[b].light,t=Number.isFinite(time)?Math.max(0,time):0,s=Number(seed)>>>0;
 const gain=Math.max(0,Math.min(1,Number.isFinite(energy)?energy:0));
 return Array.from({length:DUNGEON_MOTE_SPEC.count+Math.round(gain*14)},(_,i)=>{const a=moteHash(s^Math.imul(i+1,71933)),p=moteHash(s^Math.imul(i+3,193939)),phase=a*6.283;
  const u=((i*.61803398875+a*.37+Math.sin(t*(.18+p*.14)+phase)*.014)%1+1)%1,v=((i*.41421356237+p*.41+Math.cos(t*(.14+a*.1)+phase)*.018)%1+1)%1;
  return {x:viewport.x+u*viewport.w,y:viewport.y+v*viewport.h,radius:(.85+p*.65)*(1+gain*.2),alpha:(.34+.30*(.5+.5*Math.sin(t*.7+phase)))*(1+gain*.25),color};
 });
}
export function paintDungeonMotes(c,options={}){
 const motes=sampleDungeonMotes(options);if(!motes.length)return false;c.save();c.globalCompositeOperation='screen';const alpha=c.globalAlpha;
 for(const p of motes){c.fillStyle=p.color;c.globalAlpha=alpha*p.alpha*.13;c.beginPath();c.ellipse(p.x,p.y,p.radius*2.4,p.radius*2.4,0,0,Math.PI*2);c.fill();c.globalAlpha=alpha*p.alpha;c.beginPath();c.ellipse(p.x,p.y,p.radius,p.radius,0,0,Math.PI*2);c.fill();}
 c.restore();return true;
}
