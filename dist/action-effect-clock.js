// Synchronous effect context, deliberately outside persisted rhythmic state.
// Recursive explosion/loot callbacks share the real use time without claiming a beat.
const phases=new WeakMap();
// Combat's per-pulse ceilings use the same nearest beat as ordinary attacks.
export const effectBeat=(run,fallback=Math.max(run?.acted??-1,run?.beat??-1))=>phases.has(run)?Math.round(phases.get(run)):fallback;
export function withEffectPhase(run,phase,resolve){
 const previous=phases.get(run);phases.set(run,phase);
 try{return resolve();}finally{if(previous===undefined)phases.delete(run);else phases.set(run,previous);}
}
