// Keep every save synchronous and byte-compatible with JSON.stringify(profile).
// Only reuse serialization of large numeric room grids. Mutable arrays are
// checked by value, so exploration, liquids and rebasing cannot become stale.
export function createSaveSnapshot({cacheGrids=true}={}){
 const arrays=new WeakMap();let builds=0,hits=0;
 const property=(key,value)=>JSON.stringify({[key]:value}).slice(1,-1);
 const record=(object,replacements)=>'{'+Object.keys(object).map(key=>replacements.has(key)?JSON.stringify(key)+':'+replacements.get(key):property(key,object[key])).filter(Boolean).join(',')+'}';
 function serialize(profile){
  const run=profile?.run,room=run?.room;
  if(!cacheGrids||!room||[profile,run,room].some(o=>typeof o.toJSON==='function'))return JSON.stringify(profile);
  const raw=new Map();
  for(const key of ['floorMask','terrain','visible','explored']){
   const a=room[key];if(!Array.isArray(a)||a.length<1024||typeof a.toJSON==='function')continue;
   let entry=arrays.get(a),same=entry?.values.length===a.length,valid=true;
   for(let i=0;i<a.length;i++){if(!Number.isFinite(a[i])){valid=false;break;}if(same&&entry.values[i]!==a[i])same=false;}
   if(!valid)continue;
   if(!same){entry={values:a.slice(),raw:JSON.stringify(a)};arrays.set(a,entry);builds++;}else hits++;
   raw.set(key,entry.raw);
  }
  // Assemble actual object properties, never sentinel strings or substitutions
  // inside user text. The persisted key order and JSON format stay unchanged.
  const roomJSON=record(room,raw),runJSON=record(run,new Map([['room',roomJSON]]));
  return record(profile,new Map([['run',runJSON]]));
 }
 return {serialize,status:()=>({builds,hits,cacheGrids})};
}
