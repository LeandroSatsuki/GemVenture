// GV-021 presentation only. Never imports settlement, game state or persistence.
const zeros=()=>[0,0,0,0];
const extent=n=>Number.isFinite(n)&&n>0?n:0;
const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.visible!==false?{x:p.x,y:p.y,width:extent(p.width),height:extent(p.height),labelX:Number.isFinite(p.labelX)?p.labelX:null,labelY:Number.isFinite(p.labelY)?p.labelY:null,labelAlign:['left','center','right'].includes(p.labelAlign)?p.labelAlign:'center'}:null;
const safeSum=(a,b)=>{const n=a+b;if(!Number.isSafeInteger(n)||n<0)throw new RangeError('Collection amount exceeds safe integer range');return n;};
const samePoint=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y;
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>t*t*(3-2*t);
const amountFormat=new Intl.NumberFormat('pt-BR');
function path(origin,target,t,kind){
 const u=ease(clamp(t)),cx=(origin.x+target.x)*.5+(kind-1.5)*8,cy=Math.min(origin.y,target.y)-Math.min(42,Math.hypot(target.x-origin.x,target.y-origin.y)*.18);
 return {x:(1-u)**2*origin.x+2*(1-u)*u*cx+u*u*target.x,y:(1-u)**2*origin.y+2*(1-u)*u*cy+u*u*target.y};
}
export const COLLECTION_LIMITS=Object.freeze({kinds:4,liveTokens:4,pendingSlots:4,travelSeconds:.42,staggerSeconds:.05,highlightSeconds:.3,reducedHighlightSeconds:.5,maxDeltaSeconds:.1});
export class MinerCollectionFx{
 constructor(){this.pending=zeros();this.origins=[null,null,null,null];this.live=[];this.clock=0;this.sequence=0;this.targetErrors=0;}
 enqueue(packet,{origin=null}={}){
  if(!packet||!Number.isSafeInteger(packet.sequence)||packet.sequence<1)throw new TypeError('Ordered positive receipt sequence required');
  if(packet.sequence<=this.sequence)return {accepted:false,reason:'replay-or-out-of-order'};
  if(!Array.isArray(packet.prizes)||packet.prizes.length>4)throw new TypeError('Use the validated aggregate receipt.prizes, at most four totals');
  const totals=zeros();
  for(const p of packet.prizes){if(p.type!=='crystal-credit'||!Number.isInteger(p.kind)||p.kind<0||p.kind>3||!Number.isSafeInteger(p.amount)||p.amount<=0)throw new TypeError('Invalid paid crystal receipt');totals[p.kind]=safeSum(totals[p.kind],p.amount);}
  // Validate the entire packet before advancing sequence or mutating any slot.
  const next=this.pending.map((n,k)=>safeSum(n,totals[k]));
  for(const item of this.live)if(!item.announced)safeSum(next[item.kind],item.amount);
  const anchor=point(origin);
  for(let k=0;k<4;k++)if(totals[k]){this.origins[k]=!this.pending[k]?anchor:samePoint(this.origins[k],anchor)?anchor:null;}
  this.pending=next;this.sequence=packet.sequence;
  return {accepted:true,totals:[...totals]};
 }
 suspend(){
  // Keep undisplayed credit independently of disposable debris/animation queues.
  for(const item of this.live)if(!item.announced){this.pending[item.kind]=safeSum(this.pending[item.kind],item.amount);this.origins[item.kind]=null;}
  this.live=[];
  return this.status();
 }
 advance(dt,{getTarget,getOrigin=()=>null,visible=true,paused=false,soft=false,reduced=false}={}){
  if(!Number.isFinite(dt)||dt<0)throw new TypeError('dt must be non-negative seconds');
  if(!visible||paused)return {announcements:[],snapshot:this.snapshot()};
  if(typeof getTarget!=='function')throw new TypeError('UI must supply a visible destination callback');
  this.clock+=Math.min(COLLECTION_LIMITS.maxDeltaSeconds,dt);
  const announcements=[];const quiet=soft||reduced;
  const targetFor=k=>{try{return point(getTarget(k));}catch{this.targetErrors++;return null;}};
  const originFor=k=>{try{return point(getOrigin(k));}catch{return null;}};
  const announce=item=>{if(item.announced)return;item.announced=true;item.phase='highlight';item.highlightAt=this.clock;announcements.push({type:'crystal-credit',kind:item.kind,amount:item.amount});};
  const retained=[];
  for(const item of this.live){
   const target=targetFor(item.kind);
   if(!target){if(!item.announced){this.pending[item.kind]=safeSum(this.pending[item.kind],item.amount);this.origins[item.kind]=null;}continue;}
   item.target=target;
   if(!item.announced&&(quiet||this.clock>=item.born+COLLECTION_LIMITS.travelSeconds)){item.quiet=quiet;announce(item);}
   const hold=item.quiet?COLLECTION_LIMITS.reducedHighlightSeconds:COLLECTION_LIMITS.highlightSeconds;
   if(!item.announced||this.clock-item.highlightAt<hold)retained.push(item);
  }
  this.live=retained;
  if(!this.live.length){
   let slot=0;
   for(let kind=0;kind<4;kind++){
    if(!this.pending[kind])continue;const target=targetFor(kind);if(!target)continue;
    const origin=this.origins[kind]||originFor(kind),item={kind,amount:this.pending[kind],origin,target,source:this.origins[kind]?'event':origin?'summary':'counter',born:this.clock+slot*COLLECTION_LIMITS.staggerSeconds,announced:false,quiet:quiet||!origin,phase:'flight'};
    this.pending[kind]=0;this.origins[kind]=null;this.live.push(item);slot++;
    if(item.quiet)announce(item);
   }
  }
  return {announcements,snapshot:this.snapshot()};
 }
 snapshot(){
  return Object.freeze(this.live.map(item=>{
   const t=clamp((this.clock-item.born)/COLLECTION_LIMITS.travelSeconds),hold=item.quiet?COLLECTION_LIMITS.reducedHighlightSeconds:COLLECTION_LIMITS.highlightSeconds;
   const age=item.announced?clamp((this.clock-item.highlightAt)/hold):0;
   return Object.freeze({kind:item.kind,amount:item.amount,phase:item.phase,quiet:item.quiet,source:item.source,visible:item.announced||this.clock>=item.born,progress:t,highlightProgress:age,
    target:Object.freeze({...item.target}),position:Object.freeze(item.announced?{x:item.target.x,y:item.target.y}:path(item.origin,item.target,t,item.kind)),
    trail:item.announced?null:Object.freeze([path(item.origin,item.target,Math.max(0,t-.08),item.kind),path(item.origin,item.target,Math.max(0,t-.04),item.kind)])});
  }));
 }
 status(){return {sequence:this.sequence,clock:this.clock,pending:[...this.pending],live:this.live.length,unannounced:this.pending.map((n,k)=>this.live.filter(i=>!i.announced&&i.kind===k).reduce((sum,i)=>safeSum(sum,i.amount),n)),targetErrors:this.targetErrors};}
}
export function paintMinerCollection(c,snapshot,{colors,ink,paintToken,formatAmount=n=>amountFormat.format(n),font='bold 16px sans-serif'}={}){
 if(!Array.isArray(colors)||colors.length!==4||!ink)throw new TypeError('Pass the game MATERIALS colors and palette ink');
 c.save();const baseAlpha=c.globalAlpha;try{
  c.globalCompositeOperation='source-over';c.lineJoin='round';c.lineCap='round';
  for(const item of snapshot){if(!item.visible)continue;const color=colors[item.kind];
   if(item.phase==='flight'){
    if(typeof paintToken!=='function')throw new TypeError('Pass the existing approved gem/icon painter');
    c.globalAlpha=baseAlpha*.35;c.lineWidth=2;c.strokeStyle=color;c.beginPath();c.moveTo(item.trail[0].x,item.trail[0].y);c.lineTo(item.trail[1].x,item.trail[1].y);c.lineTo(item.position.x,item.position.y);c.stroke();
    c.globalAlpha=baseAlpha;c.save();try{paintToken(c,item.position.x,item.position.y,6+Math.sin(Math.PI*item.progress)*1.5,item.kind);}finally{c.restore();}
   }else{
    const p=item.highlightProgress,a=(1-p)*.8,w=item.target.width||42,h=item.target.height||30,x=item.target.x,y=item.target.y;
    c.globalAlpha=baseAlpha*a;c.strokeStyle=color;c.lineWidth=item.quiet?1.5:2;c.beginPath();c.roundRect(x-w/2-3,y-h/2-3,w+6,h+6,6);c.stroke();
    c.globalAlpha=baseAlpha*Math.min(1,(1-p)*2.5);c.font=font;c.textAlign='center';c.textBaseline='bottom';c.lineWidth=3;c.strokeStyle=ink;c.fillStyle=color;
    const label='+'+formatAmount(item.amount),ty=item.target.labelY??(y-h/2-7-(item.quiet?0:p*4)),tx=item.target.labelX??x;c.textAlign=item.target.labelAlign;c.strokeText(label,tx,ty);c.fillText(label,tx,ty);
   }
  }
 }finally{c.restore();}
}
