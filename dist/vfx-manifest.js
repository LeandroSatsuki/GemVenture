// Replace these PNGs to polish VFX. Geometry/timing are independent of combat.
export const VFX_ROOT='assets/vfx/';
export const VFX_SHEETS=Object.freeze({
 impact:Object.freeze({file:'impact.png',width:291,height:301,columns:6,frames:30,playFrames:14,duration:.28,size:38,pivot:[.5,.5]}),
 explosion:Object.freeze({file:'explosion.png',width:355,height:355,columns:6,frames:30,duration:.68,size:112,pivot:[.5,.5]}),
 shield:Object.freeze({file:'shield.png',width:265,height:265,columns:6,frames:30,duration:.7,size:62,pivot:[.5,.5]}),
 aura:Object.freeze({file:'aura.png',width:437,height:437,columns:6,frames:30,duration:.65,size:74,pivot:[.5,.64]}),
 reward:Object.freeze({file:'reward.png',width:120,height:109,columns:7,frames:40,duration:.85,size:70,pivot:[.5,.5]})
});
export const VFX_LIMITS=Object.freeze({active:24,softActive:6,frame:64,variants:30});
export function vfxFrame(spec,age,duration=spec.duration){
 if(!Number.isFinite(age)||!Number.isFinite(duration)||duration<=0)return -1;
 if(age<0||age>=duration)return -1;
 const frames=spec.playFrames??spec.frames;
 return Math.min(frames-1,Math.floor(age/duration*frames));
}
