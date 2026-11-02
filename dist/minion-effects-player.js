import {paintVfxEmission} from './vfx-emission.js';
// Pure atlas sampler. Loader/clock/events remain owned by the game.
export function minionEffectFrame(spec,age,{lifetimeSeconds}={}){
 if(!spec||!Number.isFinite(age)||age<0)return null;
 if(Number.isFinite(lifetimeSeconds)&&age>=lifetimeSeconds)return null;
 const duration=spec.clipSeconds;if(!Number.isFinite(duration)||duration<=0)return null;
 if(!spec.loop&&age>=duration)return null;
 const local=spec.loop?age%duration:age,index=Math.min(spec.frames-1,Math.floor(local/duration*spec.frames));
 return {index,x:index%spec.columns*spec.frameSize,y:Math.floor(index/spec.columns)*spec.frameSize};
}
export function drawMinionEffect(c,spec,image,{x,y,age,size=spec?.worldSize,opacity=1,soft=false,lifetimeSeconds}={}){
 if(!c||!image||![x,y,size,opacity].every(Number.isFinite)||size<=0)return false;
 const frame=minionEffectFrame(spec,age,{lifetimeSeconds});if(!frame)return false;
 paintVfxEmission(c,minionEmission(spec,{x,y,age,size,opacity,lifetimeSeconds}),{soft});
 c.save();c.globalCompositeOperation='source-over';c.globalAlpha*=Math.max(0,Math.min(1,opacity));
 c.drawImage(image,frame.x,frame.y,spec.frameSize,spec.frameSize,x-spec.anchor.x/spec.frameSize*size,y-spec.anchor.y/spec.frameSize*size,size,size);c.restore();return true;
}

// A small spill follows the real atlas anchor/frame and semantic material color.
// Original approved atlas pixels are unchanged, including smoke and residues.
export function minionEmission(spec,{x,y,age,size=spec?.worldSize,opacity=1,soft=false,lifetimeSeconds}={}){
 if(![x,y,size,opacity].every(Number.isFinite)||size<=0||opacity<=0||!minionEffectFrame(spec,age,{lifetimeSeconds}))return[];
 const u=spec.loop?0:age/spec.clipSeconds,color=spec.colors?.[2]||spec.colors?.[0];if(!/^#[0-9a-f]{6}$/i.test(color||''))return[];
 const quiet=spec.kind==='slime-residue'?.12:spec.kind==='bat-poof'?.16:.48;
 return[{x,y:y-(spec.anchor.y/spec.frameSize-.5)*size,radius:Math.min(8,size*.14),alpha:(1-u)*quiet*Math.min(1,opacity),color,kind:'minion-'+spec.kind}];
}
