// Share decoded recordings between vitrola windows and the expedition, within
// the same AudioContext. Bound memory and wait time; failed loads remain retryable.
const contexts=new WeakMap(),MAX_BYTES=48*1024*1024,LOAD_TIMEOUT_MS=10000;
function storeFor(ctx,fetchAudio){
 let transports=contexts.get(ctx);if(!transports)contexts.set(ctx,transports=new WeakMap());
 let store=transports.get(fetchAudio);if(!store)transports.set(fetchAudio,store={buffers:new Map(),pending:new Map(),bytes:0});return store;
}
const keyFor=e=>e.audioUrl;
export function recordedAudioReady(ctx,edition,fetchAudio=globalThis.fetch){return !!ctx&&!!edition&&storeFor(ctx,fetchAudio).buffers.has(keyFor(edition));}
export function loadRecordedAudio(ctx,edition,{fetchAudio=globalThis.fetch,signal,timeoutMs=LOAD_TIMEOUT_MS}={}){
 if(!ctx?.decodeAudioData||!edition?.audioUrl)return Promise.reject(Error('Áudio indisponível. Tente novamente.'));
 if(signal?.aborted)return Promise.reject(new DOMException('Reprodução cancelada.','AbortError'));
 const store=storeFor(ctx,fetchAudio),key=keyFor(edition),cached=store.buffers.get(key);
 if(cached){store.buffers.delete(key);store.buffers.set(key,cached);return Promise.resolve(cached.buffer);}
 let loading=store.pending.get(key);
 if(!loading){
  const controller=new AbortController();let timer,expired=false;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;controller.abort();reject(Error('A música demorou para carregar. Toque em Ouvir para tentar novamente.'));},timeoutMs);});
  const work=(async()=>{
   const response=await fetchAudio(edition.audioUrl,{signal:controller.signal});
   if(!response.ok)throw Error('Não foi possível carregar esta música. Tente novamente.');
   const bytes=await response.arrayBuffer();if(expired)throw Error('Carregamento interrompido.');
   const buffer=await ctx.decodeAudioData(bytes);
   if(expired)throw Error('Carregamento interrompido.');
   if(!Number.isFinite(buffer.duration)||buffer.duration<=0||buffer.duration+.001<(edition.duration||0))throw Error('O arquivo da música está incompleto. Tente novamente.');
   const size=buffer.length&&buffer.numberOfChannels?buffer.length*buffer.numberOfChannels*4:Math.ceil(buffer.duration*(buffer.sampleRate||48000)*2*4);
   store.buffers.set(key,{buffer,size});store.bytes+=size;
   while(store.bytes>MAX_BYTES&&store.buffers.size>1){const oldest=store.buffers.keys().next().value;store.bytes-=store.buffers.get(oldest).size;store.buffers.delete(oldest);}
   return buffer;
  })();
  loading=Promise.race([work,timeout]).finally(()=>{clearTimeout(timer);if(store.pending.get(key)===loading)store.pending.delete(key);});
  store.pending.set(key,loading);
 }
 if(!signal)return loading;
 return new Promise((resolve,reject)=>{
  const abort=()=>{signal.removeEventListener('abort',abort);reject(new DOMException('Reprodução cancelada.','AbortError'));};
  signal.addEventListener('abort',abort,{once:true});
  loading.then(value=>{signal.removeEventListener('abort',abort);resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});
 });
}
