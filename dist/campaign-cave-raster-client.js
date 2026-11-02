// One dedicated raster worker per scene; completed images belong to ChunkStream.
export function createCaveRasterClient(world,wallGroups,material,{createWorker,hydrate}={}){
 const supported=typeof Worker==='function'&&typeof OffscreenCanvas==='function'&&typeof ImageBitmap==='function'&&typeof document!=='undefined'&&/^https?:/.test(document.baseURI||'');
 if(!createWorker&&!supported)return null;
 let worker,watchdog=null,dead=false,failed=false,serial=0,jobs=0,maxJobMs=0,maxReceiveMs=0;const pending=new Map();
 const release=value=>{for(const c of [value?.canvas,...(value?.walls||[]).map(p=>p.canvas),...(value?.terrainRasters||[]).map(p=>p.canvas)])c?.close?.();};
 function stop(error){if(failed||dead)return;failed=true;clearTimeout(watchdog);worker?.terminate();for(const p of pending.values()){clearTimeout(p.timeout);p.reject(error);}pending.clear();}
 try{
  worker=createWorker?createWorker():new Worker(new URL('campaign-cave-raster-worker.js',document.baseURI),{type:'module',name:'cave-static-rasters'});
  worker.onmessage=({data})=>{if(data.type==='ready'){clearTimeout(watchdog);return;}if(data.type==='fatal'){stop(Error(data.error||'Raster worker unavailable'));return;}if(data.type!=='chunk')return;const p=pending.get(data.id);pending.delete(data.id);if(!p||dead||failed){release(data.chunk);return;}clearTimeout(p.timeout);if(data.error){stop(Error(data.error));p.reject(Error(data.error));return;}jobs++;maxJobMs=Math.max(maxJobMs,data.elapsed||0);const start=performance.now();try{p.resolve(hydrate(data.chunk));maxReceiveMs=Math.max(maxReceiveMs,performance.now()-start);}catch(error){release(data.chunk);p.reject(error);stop(error);}};
  worker.onerror=e=>stop(Error(e.message||'Raster worker failed'));
  worker.onmessageerror=()=>stop(Error('Raster transfer failed'));
  const {cols,rows,seed,floorMask,terrain,rooms,hedgehog}=world;
  watchdog=setTimeout(()=>stop(Error('Raster worker startup timeout')),10000);
  worker.postMessage({type:'init',world:{cols,rows,seed,floorMask,terrain,rooms,hedgehog},wallGroups,material});
 }catch(error){clearTimeout(watchdog);worker?.terminate();return null;}
 return {
  request(key){if(dead||failed)return null;const id=++serial;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>stop(Error('Raster worker chunk timeout')),15000);pending.set(id,{resolve,reject,timeout});try{worker.postMessage({type:'chunk',id,key});}catch(error){stop(error);}});},
  status(){return {enabled:!dead&&!failed,pending:pending.size,jobs,maxJobMs,maxReceiveMs,failed};},
  dispose(){if(dead)return;dead=true;clearTimeout(watchdog);worker.terminate();for(const p of pending.values()){clearTimeout(p.timeout);p.reject(Error('Raster scene disposed'));}pending.clear();}
 };
}
