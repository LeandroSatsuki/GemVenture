import {MINION_EFFECTS,MINION_VFX_EMBEDDED} from './minion-vfx-manifest.js';
import {drawMinionEffect,minionEmission} from './minion-effects-player.js';

export const MINION_VFX_LIMITS=Object.freeze({atlases:12,bytesPerAtlas:384*288*4,normal:48,soft:16});
const specs=new Map(MINION_EFFECTS.map(s=>[s.kind+':'+s.biome,s]));
const atlases=new Map(),failed=new Set();let chain=Promise.resolve(),context='',generation=0;
const fileFor=(spec,soft)=>soft?spec.softFile:spec.normalFile;
const specFor=(kind,biome)=>specs.get(kind+':'+biome);
function atlas(spec,soft){const file=fileFor(spec,soft),image=atlases.get(file);if(image){atlases.delete(file);atlases.set(file,image);}return image;}
function decode(file){
 if(atlases.has(file)||failed.has(file)||typeof Image==='undefined')return Promise.resolve();
 while(atlases.size>=MINION_VFX_LIMITS.atlases)atlases.delete(atlases.keys().next().value);
 // A single sequential decoder and twelve retained sheets; never recolor or read pixels.
 return new Promise(resolve=>{const image=new Image();image.onerror=()=>{failed.add(file);resolve();};image.onload=()=>{
  if(image.naturalWidth===384&&image.naturalHeight===288){while(atlases.size>=MINION_VFX_LIMITS.atlases)atlases.delete(atlases.keys().next().value);atlases.set(file,image);}else failed.add(file);resolve();
 };image.src=MINION_VFX_EMBEDDED[file]||'assets/minion-vfx/'+file;});
}
export function loadMinionEffects(biome=0,soft=false){
 const key=biome+':'+!!soft;if(key===context)return chain;context=key;const token=++generation;
 const files=[...new Set(MINION_EFFECTS.filter(s=>s.biome===biome).map(s=>fileFor(s,soft)))];
 chain=chain.then(async()=>{for(const file of files){if(token!==generation)break;await decode(file);}return minionVfxStatus();});return chain;
}
export function minionVfxStatus(){return {ready:atlases.size,files:[...atlases.keys()],failed:[...failed],bytes:atlases.size*MINION_VFX_LIMITS.bytesPerAtlas};}

// Visual data only. It cannot create hazards, issue loot, or hold a dead actor alive.
export class MinionEffects{
 constructor(){this.soft=false;this.biome=0;this.clear();}
 clear(){this.items=[];this.seen=new Set();this.age=0;this.hazardLights=[];}
 setContext(biome,soft=this.soft){this.biome=biome;this.soft=!!soft;return loadMinionEffects(biome,this.soft);}
 setSoft(soft){this.soft=!!soft;this.items=this.items.slice(-MINION_VFX_LIMITS[this.soft?'soft':'normal']);loadMinionEffects(this.biome,this.soft);}
 readyDeath(event){
  const m=event.minion;if(!m||!Number.isInteger(m.id)||![0,1,2].includes(m.kind)||!Number.isInteger(m.biome)||m.biome<0||m.biome>6||![event.x,event.y].every(Number.isFinite))return false;
  const kinds=m.kind===0?['slime-residue','slime-splash']:m.kind===1?['bat-poof']:['geode-death'];return kinds.every(kind=>{const spec=specFor(kind,m.biome);return spec&&atlas(spec,this.soft);});
 }
 death(event,project){
  if(!this.readyDeath(event))return false;const m=event.minion;
  const key=m.biome+':'+m.id;if(this.seen.has(key))return true;
  const kinds=m.kind===0?['slime-residue','slime-splash']:m.kind===1?['bat-poof']:['geode-death'];
  const layers=kinds.map(kind=>specFor(kind,m.biome));if(!layers.every(spec=>spec&&atlas(spec,this.soft)))return false;
  const p=project(event.x,event.y);this.seen.add(key);if(this.seen.size>96)this.seen.delete(this.seen.values().next().value);
  for(const spec of layers)this.items.push({spec,x:p.x/2,y:p.y/2,age:0});
  const cap=MINION_VFX_LIMITS[this.soft?'soft':'normal'];while(this.items.length>cap){const residue=this.items.findIndex(i=>i.spec.kind==='slime-residue');this.items.splice(residue<0?0:residue,1);}return true;
 }
 scroll(dx,dy){for(const item of this.items){item.x-=dx;item.y-=dy;}}
 update(dt){if(!Number.isFinite(dt)||dt<=0)return;this.age+=dt;this.hazardLights=[];for(const item of this.items)item.age+=dt;this.items=this.items.filter(i=>i.age<i.spec.clipSeconds);}
 emissionSources({soft=this.soft,limit=24}={}){return[...this.items.flatMap(item=>minionEmission(item.spec,{...item,soft})),...this.hazardLights].slice(0,limit);}
 draw(c){for(const item of this.items){const image=atlas(item.spec,this.soft);if(image)drawMinionEffect(c,item.spec,image,{...item,soft:this.soft});}}
 drawHazard(c,h,project,beat,roomBiome=this.biome){
  // Legacy saves have no cosmetic metadata; their existing damaging cells still own the effect.
  if(h.until<beat)return false;const biome=h.biome??roomBiome,spec=specFor('slime-offensive',biome),image=spec&&atlas(spec,this.soft);if(!image)return false;
  const p=project(h.x,h.y),x=p.x/2,y=p.y/2;
  c.save();c.beginPath();c.moveTo(x-12,y-8);c.lineTo(x+10,y-8);c.lineTo(x+12,y+8);c.lineTo(x-10,y+8);c.closePath();c.clip();
  const drawn=drawMinionEffect(c,spec,image,{x,y,age:this.age,soft:this.soft});c.restore();if(drawn&&this.hazardLights.length<12)this.hazardLights.push(...minionEmission(spec,{x,y,age:this.age,soft:this.soft}));return drawn;
 }
}
