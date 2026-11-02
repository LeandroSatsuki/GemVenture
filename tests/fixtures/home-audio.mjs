// WebAudio graph fixture for the approved refuge arrangement and volume routing.
export function homeAudioContext(at=0){
 const nodes=[],events=[],param=()=>({value:0,setValueAtTime(...args){events.push(['set',...args]);},linearRampToValueAtTime(...args){events.push(['linear',...args]);},exponentialRampToValueAtTime(...args){events.push(['exp',...args]);},setTargetAtTime(...args){events.push(['target',...args]);},cancelScheduledValues(){}});
 const ctx={state:'running',currentTime:at,nodes,events,createOscillator(){const o={type:'sine',frequency:param(),connections:[],connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;},start(t){this.startAt=t;},stop(t=ctx.currentTime){this.endAt=t;}};nodes.push(o);return o;},createGain(){return {gain:param(),connections:[],connect(n){this.connections.push(n);},disconnect(){this.disconnected=true;}};},advance(t){this.currentTime=t;for(const n of nodes)if(!n.disconnected&&n.endAt<=t)n.onended?.();}};return ctx;
}
