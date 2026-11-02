import {captureSceneryEmission} from './scenery-emission-bridge.js';
import {P} from './palette.js';
import {visible} from './cavern.js';
import {getVideoPreferences} from './video-preferences.js';
import {paintVfxEmission} from './vfx-emission.js';
export const TREASURE_SPEC=Object.freeze({duration:.92,maxOpenings:2,normalSparks:4,softSparks:1,maxRise:18});
const clamp=x=>Math.max(0,Math.min(1,x));
export class ChestTreasureVfx{
 constructor(){this.setContext(null,null);}
 setContext(room,presentation){this.room=room;this.presentation=presentation;this.entries=[];this.seen=new Set((room?.caveFinds||[]).filter(f=>f.used).map(f=>f.id));}
 accept(events,age){let accepted=0;if(!Number.isFinite(age)||!this.presentation)return 0;
  for(const e of events){if(e?.type!=='findUsed'||e.kind!=='chest'||this.seen.has(e.id))continue;const find=this.room?.caveFinds?.find(f=>f.id===e.id&&f.kind==='chest'&&f.used);if(!find||e.x!==find.x||e.y!==find.y)continue;
   // A real accepted opening is still in its opening phase here. Loaded/open
   // chests and late packets cannot create a second reward presentation.
   const frame=this.presentation.sample(find,{age,soft:false});if(frame.phase!=='opening')continue;this.seen.add(e.id);this.entries.push({find,started:age});accepted++;
  }this.entries=this.entries.slice(-TREASURE_SPEC.maxOpenings);return accepted;
 }
 acceptedCoordinates(events,age){return new Set(events.filter(e=>e?.type==='findUsed'&&e.kind==='chest'&&this.entries.some(p=>p.find.id===e.id&&p.started===age)).map(e=>e.x+','+e.y));}
 paintActor(c,find,options){if(!this.sample(options.age,{soft:options.soft}).some(p=>p.find===find))return;captureSceneryEmission(c,'chest-treasure',{paint:q=>this.draw(q,{...options,onlyFind:find.id})});}
 sample(age,{soft=false}={}){const out=[];if(!Number.isFinite(age))return out;
  this.entries=this.entries.filter(e=>age-e.started<TREASURE_SPEC.duration);
  for(const e of this.entries){const t=age-e.started;if(t<0||!this.room?.caveFinds?.includes(e.find)||!visible(this.room,e.find))continue;const lid=this.presentation.sample(e.find,{age,soft}),opening=clamp((lid.progress-.15)/.5),fade=clamp((TREASURE_SPEC.duration-t)/.28),alpha=opening*fade;if(alpha<=0)continue;
   const sparks=Array.from({length:soft?1:4},(_,i)=>{const u=clamp((t-.06-i*.055)/.65);return{x:soft?0:(i-1.5)*3+(i%2?1:-1)*u*2,y:-13.5-(soft?3:u*TREASURE_SPEC.maxRise),size:soft?1.1:1.1+(i%2)*.35,alpha:alpha*(soft?.5:Math.sin(u*Math.PI))};});out.push({find:e.find,t,opening,alpha,soft,sparks});
  }return out;
 }
 draw(c,{age,soft=false,project,masks,onlyFind=null}={}){const gain=getVideoPreferences().getState().neon_cristais_pct/100;if(gain<=0)return 0;let count=0;
  for(const f of this.sample(age,{soft})){if(onlyFind!==null&&f.find.id!==onlyFind)continue;const q=project(f.find.x,f.find.y),x=q.x/2,y=q.y/2;c.save();try{if(masks?.floor)c.clip(masks.floor);const path=masks?.sourcePath?.(f.find,true);if(path)c.clip(path);c.translate(x,y);c.globalCompositeOperation='screen';
   if(!soft){const h=12+f.opening*12,w=3+f.opening*5;c.globalAlpha=Math.min(.18,gain*f.alpha*.16);c.fillStyle=P.gold;c.beginPath();c.moveTo(-3.5,-13.5);c.lineTo(-w,-13.5-h);c.lineTo(w,-13.5-h);c.lineTo(3.5,-13.5);c.closePath();c.fill();}
   paintVfxEmission(c,f.sparks.map(p=>({...p,radius:5,color:P.gold})),{soft,strength:gain});
   for(const p of f.sparks){if(p.alpha<=0)continue;c.globalAlpha=Math.min(.9,p.alpha*gain);c.fillStyle=P.lemon;c.beginPath();c.moveTo(p.x,p.y-p.size*1.6);c.lineTo(p.x+p.size*.25,p.y-p.size*.25);c.lineTo(p.x+p.size,p.y);c.lineTo(p.x+p.size*.25,p.y+p.size*.25);c.lineTo(p.x,p.y+p.size*1.6);c.lineTo(p.x-p.size*.25,p.y+p.size*.25);c.lineTo(p.x-p.size,p.y);c.lineTo(p.x-p.size*.25,p.y-p.size*.25);c.closePath();c.fill();}count++;
  }finally{c.restore();}}return count;
 }
}
