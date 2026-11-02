import {CRISP_VFX_IDS,paintCrispAsset,crispAssetEmission} from './vfx-crisp-assets.js';
import {paintVfxEmission} from './vfx-emission.js';
import {P,GEM_RAMPS} from './palette.js';
import {paintVoxelExplosion} from './dungeon-fx.js';
import {VFX_SHEETS,VFX_LIMITS} from './vfx-manifest.js';

// Former sheet IDs now dispatch to the approved crisp family. The original
// voxel explosion remains authoritative for the approved orange/red blasts.
const TONES=[...GEM_RAMPS,[P.orange,P.red],[P.steel,P.slate]];
let loading=null;
const toneIndex=color=>color===P.lemon?2:color===P.silver?5:Math.max(0,TONES.findIndex(t=>t.includes(color)));
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export function mapVfxPixels(data,color=P.cyan){
 const [base,shadow]=TONES[toneIndex(color)].map(rgb),light=rgb(P.lemon);
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;
  const value=Math.max(data[i],data[i+1],data[i+2]),shade=value<120?shadow:value>240&&Math.min(data[i],data[i+1],data[i+2])>210?light:base;
  data[i]=shade[0];data[i+1]=shade[1];data[i+2]=shade[2];
 }return data;
}
export function vfxStatus(){return{ready:[...CRISP_VFX_IDS],failed:[],variants:0,maxVariants:VFX_LIMITS.variants,renderer:'crisp-family',retiredRasterSheets:CRISP_VFX_IDS.length};}
export function loadVfxAssets(){return loading??=Promise.resolve(vfxStatus());}
export function drawVfxAsset(c,id,x,y,age,{color=P.cyan,size,duration,opacity=1,soft=false,flatten=1,bombRed=false}={}){
 if(id==='explosion'&&[P.orange,P.red].includes(color))return paintVoxelExplosion(c,x,y,age,{size:size??90,duration:duration??.65,opacity,soft,red:bombRed});
 if(!CRISP_VFX_IDS.includes(id))return false;
 paintVfxEmission(c,crispAssetEmission(id,x,y,age,{color,size,duration,opacity,soft,flatten}),{soft});
 return paintCrispAsset(c,id,x,y,age,{color,size,duration,opacity,soft,flatten});
}
export class VfxSprites{
 constructor(){this.soft=false;this.clear();loadVfxAssets();}
 clear(){this.items=[];}
 setSoft(value){this.soft=!!value;this.clear();}
 play(id,x,y,options={}){
  const spec=VFX_SHEETS[id];if(!spec||![x,y].every(Number.isFinite)||!Number.isFinite(options.duration??spec.duration)||(options.duration??spec.duration)<=0)return false;
  // Reduced motion keeps short local impacts, without large animated auras.
  // Soft mode keeps one stationary facet instead of suppressing confirmation.
  this.items.push({id,x,y,age:0,...options,duration:options.duration??spec.duration});
  const cap=this.soft?VFX_LIMITS.softActive:VFX_LIMITS.active;
  if(this.items.length>cap)this.items.splice(0,this.items.length-cap);return true;
 }
 scroll(dx,dy){for(const item of this.items){item.x-=dx;item.y-=dy;}}
 update(dt){if(!Number.isFinite(dt)||dt<=0)return;for(const item of this.items)item.age+=dt;this.items=this.items.filter(item=>item.age<item.duration);}
 draw(c){for(const item of this.items){if(item.id==='explosion'&&[P.orange,P.red].includes(item.color))paintVfxEmission(c,[{x:item.x,y:item.y-8,radius:Math.min(16,(item.size||48)*.18),alpha:Math.min(1,(1-item.age/item.duration)*3)*(item.opacity??1),color:item.color||P.cyan}],{soft:this.soft});drawVfxAsset(c,item.id,item.x,item.y,item.age,{...item,soft:this.soft});}}
}

// Decorative canvas over a reward, never a hit target. Removal stops its loop.
export function vfxOverlay(host,id,{color=P.yellow,soft=false,size=160}={}){
 if(!host||!VFX_SHEETS[id])return;
 loadVfxAssets();const canvas=document.createElement('canvas');canvas.className='vfx-overlay';
 canvas.width=canvas.height=size;canvas.setAttribute('aria-hidden','true');
 Object.assign(canvas.style,{position:'absolute',left:'50%',top:'50%',width:size+'px',height:size+'px',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:'0'});
 host.querySelectorAll('.vfx-overlay').forEach(el=>el.remove());host.prepend(canvas);
 const c=canvas.getContext('2d'),duration=VFX_SHEETS[id].duration;let age=0,last=null;
 function frame(now){if(!canvas.isConnected)return;
  if(last!==null&&!document.hidden)age+=(now-last)/1000;last=now;
  if(age>=duration){canvas.remove();return;}
  c.clearRect(0,0,size,size);drawVfxAsset(c,id,size/2,size/2,age,{size,color,soft,opacity:.75});requestAnimationFrame(frame);
 }requestAnimationFrame(frame);
}
