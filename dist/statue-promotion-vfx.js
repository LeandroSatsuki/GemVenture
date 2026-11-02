import {P} from './palette.js';

export const STATUE_PROMOTION_SPEC=Object.freeze({
 minAccent:.72,maxAccent:1.6,defaultAccent:.8,afterAccent:1.2,
 fragmentSeconds:.24,fragmentFadeFrom:.35,revealSeconds:.08,fragments:6,glints:3,maxFragmentTravel:5,
 maxStep:.25,maxAssets:7,maxAssetPixels:40000,maxCachePixels:1400000
});
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);},finite=Number.isFinite;
const palette=new Set(Object.values(P)),defaultGlints=Object.freeze([[.23,.25],[.72,.38],[.61,.59]].map(Object.freeze));
// Fixed partitions of the figure cache. Alpha, not the partition, excludes the base.
const cells=Object.freeze([
 [[0,0],[.46,0],[.43,.35],[0,.39]],
 [[.46,0],[1,0],[1,.4],[.43,.35]],
 [[0,.39],[.43,.35],[.56,.68],[0,.72]],
 [[.43,.35],[1,.4],[1,.7],[.56,.68]],
 [[0,.72],[.56,.68],[.5,1],[0,1]],
 [[.56,.68],[1,.7],[1,1],[.5,1]]
].map(p=>Object.freeze(p.map(Object.freeze))));
const travel=Object.freeze([[-3,-3.5],[3,-3],[-5,0],[5,0],[-2,-1],[2,-1]].map(Object.freeze));
export const STATUE_PROMOTION_CELLS=cells;
function validEvent(e){return e?.type==='accountTierChanged'&&e.version===1&&typeof e.id==='string'&&e.id.length>0&&e.id.length<=240&&Number.isInteger(e.oldTier)&&e.oldTier>=0&&Number.isInteger(e.newTier)&&e.newTier>e.oldTier&&e.newTier<=6;}
function validAsset(a,tier){const f=a?.frame,images=[a?.full,a?.figure,a?.pedestal,a?.shine,a?.cracks].filter(Boolean);return a?.tier===tier&&typeof a.id==='string'&&!!a.full&&f&&Array.isArray(f.anchor)&&f.anchor.length===2&&[f.width,f.height,...f.anchor].every(finite)&&f.width>0&&f.height>0&&f.width<=256&&f.height<=256&&f.anchor[0]>=0&&f.anchor[0]<=f.width&&f.anchor[1]>=0&&f.anchor[1]<=f.height&&images.every(im=>finite(im.width)&&finite(im.height)&&im.width>0&&im.height>0&&im.width*im.height<=STATUE_PROMOTION_SPEC.maxAssetPixels)&&images.every(im=>im.width===a.full.width&&im.height===a.full.height);}
function aligned(a,b){return a.frame.width===b.frame.width&&a.frame.height===b.frame.height&&a.frame.anchor.every((v,i)=>v===b.frame.anchor[i]);}
function separated(a){return a.separationVerified===true&&a.figure&&a.pedestal&&a.shine&&a.cracks;}
function star(c,x,y,r,color,alpha){if(alpha<=0)return;c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.23,y-r*.23);c.lineTo(x+r,y);c.lineTo(x+r*.23,y+r*.23);c.lineTo(x,y+r);c.lineTo(x-r*.23,y+r*.23);c.lineTo(x-r,y);c.lineTo(x-r*.23,y-r*.23);c.closePath();c.fill();}

// No score, persistent state, ACK, audio, DOM, timers or input handlers here.
export function createStatuePromotionVfx(){
 let active=null,time=0,paused=false,hidden=false,complete=null,cue=null,cueSent=false,done=false,finalPainted=false;
 let sessionKey=null,seen=0; // Seven tiers imply at most six distinct promotions per account.
 function reset(){active=null;time=0;complete=null;cue=null;cueSent=false;done=false;finalPainted=false;}
 function start(e,{headId,before,after,contextKey,accentIn=STATUE_PROMOTION_SPEC.defaultAccent,soft=false,reduced=false}={}){
  if(active)return{ok:false,reason:'busy'};
  if(!validEvent(e)||headId!==e.id)return{ok:false,reason:'not-pending-head'};
  if(typeof contextKey!=='string'||!contextKey||contextKey.length>240)return{ok:false,reason:'missing-context'};
  if(sessionKey!==contextKey){sessionKey=contextKey;seen=0;reset();}
  if(seen&(1<<e.newTier))return{ok:false,reason:'already-completed-in-context'};
  if(!validAsset(before,e.oldTier)||!validAsset(after,e.newTier)||!aligned(before,after))return{ok:false,reason:'assets-not-ready-or-aligned'};
  if(!finite(accentIn)||accentIn<STATUE_PROMOTION_SPEC.minAccent||accentIn>STATUE_PROMOTION_SPEC.maxAccent)return{ok:false,reason:'invalid-accent'};
  reset();active={id:e.id,oldTier:e.oldTier,newTier:e.newTier,before,after,contextKey,accentIn,soft:!!(soft||reduced),fracture:!!(separated(before)&&separated(after)&&!soft&&!reduced)};
  return{ok:true,fracture:active.fracture,accentIn,duration:accentIn+STATUE_PROMOTION_SPEC.afterAccent};
 }
 function configure({paused:p=paused,hidden:h=hidden,contextKey=sessionKey,soft=false,reduced=false}={}){
  if(contextKey!==sessionKey){reset();sessionKey=contextKey;seen=0;}
  if((p&&!paused)||(h&&!hidden)){cue=null;finalPainted=false;}
  paused=!!p;hidden=!!h;
  if(active&&(soft||reduced)){active.soft=true;active.fracture=false;}
 }
 function update(dt){
  if(!active||paused||hidden||done)return false;
  if(!finite(dt)||dt<0||dt>STATUE_PROMOTION_SPEC.maxStep)return false;
  const previous=time;time=Math.min(time+dt,active.accentIn+STATUE_PROMOTION_SPEC.afterAccent);
  if(!cueSent&&previous<active.accentIn&&time>=active.accentIn){cueSent=true;cue={id:active.id,type:'statueRevealAccent',at:active.accentIn,oldTier:active.oldTier,newTier:active.newTier};}
  if(time>=active.accentIn+STATUE_PROMOTION_SPEC.afterAccent){done=true;complete={id:active.id,type:'statuePresentationComplete',newTier:active.newTier,contextKey:active.contextKey};}
  return true;
 }
 function sample(){
  if(!active)return null;
  const a=active.accentIn,age=time-a,soft=active.soft,quiet=soft||!active.fracture,fade=quiet?smooth((age+.08)/.24):smooth(age/STATUE_PROMOTION_SPEC.revealSeconds),fragment=active.fracture?clamp((time-(a-.07))/STATUE_PROMOTION_SPEC.fragmentSeconds):0;
  const phase=quiet?(time<a-.08?'old':age<.16?'reveal':done?'complete':'read'):(time<a-.34?'old':time<a-.12?'shine':time<a?'fracture':age<.26?'reveal':done?'complete':'read');
  return{id:active.id,oldTier:active.oldTier,newTier:active.newTier,time,accentAt:a,duration:a+STATUE_PROMOTION_SPEC.afterAccent,phase,paused:paused||hidden,soft,fracture:active.fracture,fallback:!active.fracture&&!soft,
   oldAlpha:1-fade,newAlpha:fade,glow:quiet?0:smooth((time-(a-.36))/.22)*(1-smooth((time-(a-.04))/.19))*.5,
   fissure:active.fracture?smooth((time-(a-.15))/.1)*(1-smooth(age/.12)):0,
   fragment,fragmentAlpha:active.fracture?1-smooth((fragment-STATUE_PROMOTION_SPEC.fragmentFadeFrom)/(1-STATUE_PROMOTION_SPEC.fragmentFadeFrom)):0,
   glint:quiet?0:smooth(age/.04)*(1-smooth((age-.12)/.22)),done};
 }
 function draw(c,{x,y,scale=1,bounds}={}){
  const s=sample();if(!s||hidden||![x,y,scale].every(finite)||scale<=0||scale>8)return false;
  const old=active.before,next=active.after,f=old.frame,dx=-f.anchor[0],dy=-f.anchor[1];
  c.save();if(bounds){if(![bounds.x,bounds.y,bounds.width,bounds.height].every(finite)||bounds.width<=0||bounds.height<=0){c.restore();return false;}c.beginPath();c.rect(bounds.x,bounds.y,bounds.width,bounds.height);c.clip();}
  c.translate(x,y);c.scale(scale,scale);c.globalCompositeOperation='source-over';
  const image=(img,alpha=1)=>{if(alpha<=0)return;c.globalAlpha=alpha;c.drawImage(img,dx,dy,f.width,f.height);};
  if(!active.fracture){
   // Safe fade of the complete supplied art if semantic masks are unavailable.
   if(s.newAlpha>=1)image(next.full);else{image(old.full,1);image(next.full,s.newAlpha);}
   if(!s.soft&&old.shine)image(old.shine,s.glow*(1-s.newAlpha));
  }else if(s.time<active.accentIn-.07){
   image(old.full);image(old.shine,s.glow);image(old.cracks,s.fissure);
  }else if(s.fragment<1){
   // Base stays at exactly the same transform. Material changes, ground does not.
   image(old.pedestal);image(next.pedestal,s.newAlpha);image(next.figure,s.newAlpha);
   const motion=smooth(s.fragment),fade=s.fragmentAlpha;
   for(let i=0;i<cells.length;i++){
    c.save();c.translate(travel[i][0]*motion,travel[i][1]*motion);c.beginPath();for(let j=0;j<cells[i].length;j++){const p=cells[i][j];if(j)c.lineTo(dx+p[0]*f.width,dy+p[1]*f.height);else c.moveTo(dx+p[0]*f.width,dy+p[1]*f.height);}c.closePath();c.clip();image(old.figure,fade);image(old.shine,s.glow*fade);image(old.cracks,s.fissure*fade);c.restore();
   }
  }else image(next.full);
  if(s.glint>0){
   const points=next.glints||defaultGlints,color=palette.has(next.accent)?next.accent:P.white;
   for(let i=0;i<Math.min(3,points.length);i++){const p=points[i];if(p&&p.length===2&&p.every(v=>finite(v)&&v>=0&&v<=1))star(c,dx+p[0]*f.width,dy+p[1]*f.height,(i===0?3.2:2.2)*s.glint,color,s.glint*.8);}
  }
  c.restore();if(done&&!paused&&!hidden)finalPainted=true;return true;
 }
 function takeAccent(){const r=cue;cue=null;return r;}
 function takeCompletion(){if(!finalPainted||paused||hidden)return null;const r=complete;complete=null;return r;}
 // The consumer releases only after the one-shot completion has been taken.
 function release({acknowledged=false}={}){if(!done||complete)return false;if(acknowledged)seen|=1<<active.newTier;reset();return true;}
 function cancel(){const id=active?.id||null;reset();return id;}
 function status(){return{active:!!active,id:active?.id||null,contextKey:sessionKey,time,paused,hidden,done,seenMask:seen,fragmentSlots:6,glintSlots:3};}
 return{start,configure,update,sample,draw,takeAccent,takeCompletion,release,cancel,status};
}
