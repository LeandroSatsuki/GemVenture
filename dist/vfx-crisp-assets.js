import {P,GEM_RAMPS} from './palette.js';
import {createFamilyPainter,FAMILY_SPECS,sampleFamilyEmission} from './vfx-family.js';
import {VFX_SHEETS} from './vfx-manifest.js';
export const CRISP_VFX_IDS=Object.freeze(['impact','explosion','shield','aura','reward']);
const tones=[...GEM_RAMPS,[P.orange,P.red],[P.steel,P.slate]],painters=new Map();
function tone(color){if(color===P.lemon)return 2;if(color===P.silver)return 5;return Math.max(0,tones.findIndex(t=>t.includes(color)));}
function palette(color){const i=tone(color);if(!painters.has(i)){const [base,shade]=tones[i],colors={...P,cyan:base,blue:shade};painters.set(i,{colors,painter:createFamilyPainter(colors)});}return painters.get(i);}
export function crispAssetFrame(id,age,{color=P.cyan,size,duration,soft=false,flatten=1,opacity=1}={}){
 const spec=VFX_SHEETS[id],life=duration??spec?.duration;if(!spec||!Number.isFinite(age)||!Number.isFinite(life)||life<=0||age<0||age>=life||!Number.isFinite(size??spec.size)||(size??spec.size)<=0||!Number.isFinite(flatten)||flatten<=0||!Number.isFinite(opacity)||opacity<=0)return null;
 const kind=id==='aura'||id==='reward'?'reward':id==='shield'?'shield':'impact',scale=Math.min(2.8,(size??spec.size)/(id==='impact'?38:id==='explosion'?56:70)),familyAge=age/life*FAMILY_SPECS[kind].duration;
 return{kind,familyAge,scale,flatten,opacity:Math.min(1,opacity),soft:!!soft,...palette(color)};
}
export function crispAssetEmission(id,x,y,age,options={}){
 if(![x,y].every(Number.isFinite))return[];const f=crispAssetFrame(id,age,options);if(!f)return[];
 return sampleFamilyEmission(f.colors,f.kind,f.familyAge,{soft:f.soft,activeLength:FAMILY_SPECS.shield.duration-.23}).map(p=>({...p,x:x+p.x*f.scale,y:y+p.y*f.scale*f.flatten,radius:Math.min(12,p.radius*f.scale),alpha:p.alpha*f.opacity,kind:'crisp-'+id}));
}
export function paintCrispAsset(c,id,x,y,age,options={}){
 const f=crispAssetFrame(id,age,options);if(!f||![x,y].every(Number.isFinite))return false;
 c.save();try{c.translate(x,y);c.scale(f.scale,f.scale*f.flatten);c.globalAlpha*=f.opacity;f.painter.draw(c,f.kind,f.familyAge,{soft:f.soft,activeLength:FAMILY_SPECS.shield.duration-.23});}finally{c.restore();}return true;
}
