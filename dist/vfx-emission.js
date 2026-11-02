import {sampleFamilyEmission} from './vfx-family.js';
import {crispAssetEmission} from './vfx-crisp-assets.js';
import {getVideoPreferences} from './video-preferences.js';
import {P} from './palette.js';
export const VFX_EMISSION_SPEC=Object.freeze({maxSources:64,maxColors:12,textureSize:48,maxRadius:18,alpha:.62});
const textures=new Map(),clamp=n=>Math.max(0,Math.min(1,n));
let revision=-1,gain=1;
function intensity(){const prefs=getVideoPreferences(),next=prefs.getRevision();if(next!==revision){revision=next;gain=prefs.getState().neon_cristais_pct/100;}return gain;}
function texture(color){
 if(textures.has(color))return textures.get(color);
 if(textures.size>=VFX_EMISSION_SPEC.maxColors){const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),target=rgb(color);let nearest=null,distance=Infinity;for(const [key,image]of textures){const score=rgb(key).reduce((sum,n,i)=>sum+(n-target[i])**2,0);if(score<distance){nearest=image;distance=score;}}return nearest;}
 let image;try{image=typeof document!=='undefined'?document.createElement('canvas'):typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(48,48):null;}catch{return null;}
 const c=image?.getContext?.('2d');if(!c?.createRadialGradient)return null;
 image.width=image.height=VFX_EMISSION_SPEC.textureSize;const r=image.width/2,g=c.createRadialGradient(r,r,0,r,r,r);
 g.addColorStop(0,color+'cc');g.addColorStop(.2,color+'a0');g.addColorStop(.55,color+'40');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,image.width,image.height);
 if(textures.size>=VFX_EMISSION_SPEC.maxColors){const key=textures.keys().next().value,old=textures.get(key);old.width=old.height=1;textures.delete(key);}textures.set(color,image);return image;
}
export function paintVfxEmission(c,sources,{soft=false,strength=intensity(),core=false}={}){
 if(!c||strength<=0)return 0;
 const points=sources.filter(p=>[p.x,p.y,p.radius,p.alpha].every(Number.isFinite)&&p.radius>0&&p.alpha>0&&/^#[0-9a-f]{6}$/i.test(p.color||'')).slice(0,VFX_EMISSION_SPEC.maxSources);
 const cells=new Map(),cell=p=>Math.floor(p.x/12)+','+Math.floor(p.y/12);for(const p of points)cells.set(cell(p),(cells.get(cell(p))||0)+1);
 let drawn=0;c.save();try{c.globalCompositeOperation='screen';for(const p of points){const image=texture(p.color);if(!image)continue;const r=Math.min(VFX_EMISSION_SPEC.maxRadius,p.radius);c.globalAlpha=Math.min(.85,VFX_EMISSION_SPEC.alpha*strength*clamp(p.alpha)*(soft?.55:1))/Math.max(1,cells.get(cell(p))/3);c.drawImage(image,p.x-r,p.y-r,r*2,r*2);if(core&&['fragment','mining-fragment'].includes(p.kind)){const size=p.kind==='mining-fragment'?1.2:.8;c.globalAlpha=Math.min(.9,strength*clamp(p.alpha))*(soft?.6:1);c.fillStyle=p.color;c.fillRect(p.x-size/2,p.y-size/2,size,size);c.globalAlpha*=.65;c.fillStyle=P.white;c.fillRect(p.x-.22,p.y-.22,.44,.44);}drawn++;}}finally{c.restore();}return drawn;
}
const valid=p=>[p?.x,p?.y,p?.life,p?.total].every(Number.isFinite)&&p.life>0&&p.total>0;
export function collectVfxEmission(fx,{soft=fx.soft,includeMining=true,includeSprites=true,includeActors=true,limit=VFX_EMISSION_SPEC.maxSources}={}){
 const groups=[];
 if(includeMining)groups.push(fx.mining?.emissionSources?.(fx.age,{soft})||[]);
 groups.push((fx.particles||[]).filter(valid).slice(0,limit).map(p=>({x:p.x,y:p.y,radius:Math.min(9,4+(p.size||1)),alpha:clamp(p.life/p.total),color:p.color,kind:'fragment'})));
 groups.push((fx.beams||[]).filter(b=>b.life>0).slice(0,Math.ceil(limit/8)).flatMap(b=>Array.from({length:8},(_,i)=>({x:b.from.x+(b.to.x-b.from.x)*i/7,y:b.from.y+(b.to.y-b.from.y)*i/7,radius:7,alpha:clamp(b.life/.35),color:b.color,kind:'beam'}))));
 groups.push((fx.rings||[]).filter(r=>r.life>0).slice(0,Math.ceil(limit/8)).flatMap(r=>{const u=1-r.life/r.duration;return Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return{x:r.x+Math.cos(a)*r.radius*u,y:r.y+Math.sin(a)*r.radius*u*.6,radius:5,alpha:(1-u)*.65,color:r.color,kind:'ring'};});}));
 groups.push((fx.buffAccents||[]).filter(a=>a.life>0).flatMap(a=>sampleFamilyEmission(P,a.kind||'combo',a.total-a.life,{soft,tier:a.tier}).map(p=>({...p,x:a.x+p.x,y:a.y+p.y,kind:'buff'}))));
 if(includeActors)groups.push(fx.geode?.emissionSources?.(fx.age,{soft,limit})||[]);
 if(includeActors)groups.push(fx.minions?.emissionSources?.({soft,limit})||[]);
 groups.push((fx.fireMarks||[]).filter(p=>p.life>0).slice(0,limit).map(p=>({x:p.x,y:p.y-3,radius:6,alpha:clamp(p.life/p.total),color:P.orange,kind:'burn'})));
 if(includeSprites)groups.push((fx.sprites?.items||[]).filter(i=>i.age>=0&&i.age<i.duration).flatMap(i=>i.id==='explosion'&&[P.orange,P.red].includes(i.color)?[{x:i.x,y:i.y-8,radius:Math.min(16,(i.size||48)*.18),alpha:Math.min(1,(1-i.age/i.duration)*3)*(i.opacity??1),color:i.color||P.cyan,kind:'sprite'}]:crispAssetEmission(i.id,i.x,i.y,i.age,{...i,soft})));
 // Round-robin groups preserve mining and beam confirmation during dense bursts.
 const out=[];for(let i=0;out.length<limit;i++){let found=false;for(const g of groups)if(g[i]){out.push(g[i]);found=true;if(out.length>=limit)break;}if(!found)break;}return out;
}
export function vfxEmissionStatus(){return{textures:textures.size,bytes:[...textures.values()].reduce((n,c)=>n+c.width*c.height*4,0),maxColors:VFX_EMISSION_SPEC.maxColors};}
