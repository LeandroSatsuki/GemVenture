import {accountScoreView,acknowledgePromotion} from './account-score.js';
import {createStatuePromotionVfx} from './statue-promotion-vfx.js';
import {createStatuePromotionAssets} from './statue-promotion-assets.js';
import {drawStatueFamily} from './statue-family.js';

// Existing frame/save/audio belong to the host. No RAF, timer, storage or input here.
export function createStatuePromotionController({profile,save,assets=createStatuePromotionAssets(),align=(now,lead)=>lead,onAccent=()=>{}}={}){
 if(typeof profile!=='function'||typeof save!=='function')throw TypeError('Live profile and existing save required');
 const fx=createStatuePromotionVfx();let owner=null,awaiting=null,contextProfile=null,contextAccount=null,contextKey=null,prepared=null,ready=false,failedHead=null,lastError=null;
 let policy={eligible:false,paused:true,hidden:false,soft:false,reduced:false,audio:false,now:0},visible=false,painted=false,wasSuspended=true,hold=0,acknowledgements=0,accents=0;
 function current(){const p=profile(),view=accountScoreView(p);return view?{p,account:p.accountScore,view,key:JSON.stringify([p.accountScore.id,p.accountScore.rules])}:null;}
 function cancel(){const id=owner?.event.id||fx.status().id;fx.cancel();owner=null;painted=false;hold=0;wasSuspended=true;return id||null;}
 function prepare(){if(!prepared)prepared=assets.loadAll().then(result=>{ready=true;return result;}).catch(error=>{lastError=String(error);ready=true;return assets.status();});return prepared;}
 function suspend({paused=true,hidden=policy.hidden}={}){policy={...policy,paused:!!paused,hidden:!!hidden};fx.configure({paused:true,hidden:!!hidden,contextKey,soft:policy.soft,reduced:policy.reduced});painted=false;wasSuspended=true;}
 function step(dt,options={}){
  painted=false;const priorAudio=policy.audio;policy={...policy,...options};
  if(!priorAudio&&policy.audio&&fx.sample()?.time<fx.sample()?.accentAt)wasSuspended=true;
  const c=current();if(!c){cancel();awaiting=null;contextProfile=null;contextAccount=null;contextKey=null;return;}
  if(c.p!==contextProfile||c.account!==contextAccount||c.key!==contextKey){cancel();fx.configure({contextKey:null,paused:true,hidden:policy.hidden});awaiting=null;failedHead=null;contextProfile=c.p;contextAccount=c.account;contextKey=c.key;}
  if(owner&&(owner.p!==c.p||owner.account!==c.account||owner.key!==c.key||!awaiting&&c.view.pending[0]?.id!==owner.event.id))cancel();
  if(!policy.eligible){cancel();fx.configure({paused:true,hidden:policy.hidden,contextKey});return;}
  const stopped=!!policy.paused||!!policy.hidden||!visible;
  fx.configure({paused:stopped,hidden:policy.hidden,contextKey,soft:policy.soft,reduced:policy.reduced});
  if(awaiting){wasSuspended=stopped;return;}
  if(!owner&&!policy.paused&&!policy.hidden){const event=c.view.pending[0];if(event&&event.id!==failedHead){owner={p:c.p,account:c.account,key:c.key,event,preparing:true};prepare();}}
  if(stopped){wasSuspended=true;return;}
  if(owner?.preparing){
   if(!ready)return;
   const before=assets.get(owner.event.oldTier),after=assets.get(owner.event.newTier);
   if(!before||!after){failedHead=owner.event.id;lastError='Promotion full artwork unavailable';cancel();return;}
   let accentIn=.8;if(policy.audio){const candidate=align(policy.now,.72);if(Number.isFinite(candidate)&&candidate>=.72&&candidate<=1.6)accentIn=candidate;}
   const result=fx.start(owner.event,{headId:c.view.pending[0]?.id,before,after,contextKey,accentIn,soft:policy.soft,reduced:policy.reduced});
   if(!result.ok){failedHead=owner.event.id;lastError=result.reason;cancel();return;}
   owner.preparing=false;hold=0;wasSuspended=false;return;
  }
  if(!owner)return;
  if(wasSuspended){const sample=fx.sample(),remaining=sample?sample.accentAt-sample.time:0;if(policy.audio&&remaining>0){const aligned=align(policy.now,remaining);if(Number.isFinite(aligned))hold=Math.max(0,Math.min(.5,aligned-remaining));}wasSuspended=false;return;}
  if(!Number.isFinite(dt)||dt<0||dt>.25)return;
  const held=Math.min(hold,dt);hold-=held;fx.update(dt-held);
 }
 function frameVisible(c,x,y,width){
  if(typeof c.getTransform!=='function'||!c.canvas||![x,y,width].every(Number.isFinite)||width<=0)return false;
  const m=c.getTransform(),k=width/74,left=x-52*k,top=y-128*k,right=left+104*k,bottom=top+140*k;
  const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([px,py])=>({x:m.a*px+m.c*py+m.e,y:m.b*px+m.d*py+m.f}));
  return points.every(p=>p.x>=0&&p.y>=0&&p.x<=c.canvas.width&&p.y<=c.canvas.height)&&(c.globalAlpha??1)>.95;
 }
 function draw(c,{x,y,width}={}){
  visible=frameVisible(c,x,y,width);
  if(!owner)return false;
  if(owner.preparing){drawStatueFamily(c,owner.event.oldTier,x,y,width);return true;}
  const drawn=fx.draw(c,{x,y,scale:width/74});
  painted=!!drawn&&visible&&!policy.paused&&!policy.hidden&&!fx.status().paused;
  return !!drawn;
 }
 function afterSave(p,success){
  if(!success||!awaiting)return false;
  const c=current();if(!c||c.p!==p||p!==awaiting.p||c.account!==awaiting.account||c.key!==awaiting.key||c.view.pending.some(event=>event.id===awaiting.id))return false;
  fx.release({acknowledged:true});owner=null;awaiting=null;painted=false;hold=0;return true;
 }
 function afterPaint(){
  if(!owner||owner.preparing||awaiting)return null;
  if(!painted||!visible||policy.paused||policy.hidden){fx.takeAccent();return null;}
  const c=current();if(!c||c.p!==owner.p||c.account!==owner.account||c.key!==owner.key||c.view.pending[0]?.id!==owner.event.id){cancel();return null;}
  const accent=fx.takeAccent();if(accent&&policy.audio){try{onAccent(accent);accents++;}catch(error){lastError=String(error);}}
  const completion=fx.takeCompletion();if(!completion)return null;
  if(completion.id!==owner.event.id||completion.contextKey!==owner.key||completion.newTier!==owner.event.newTier){cancel();return null;}
  if(!acknowledgePromotion(c.p,completion.id)){cancel();return null;}
  acknowledgements++;awaiting={p:c.p,account:c.account,key:c.key,id:completion.id,newTier:completion.newTier};
  let persisted=false;try{persisted=save()===true;}catch(error){lastError=String(error);}
  if(persisted)afterSave(c.p,true);
  return {...completion,acknowledged:true,persisted};
 }
 function needsSaveRetry(){const c=current();return !!awaiting&&!!c&&c.p===awaiting.p&&c.account===awaiting.account&&c.key===awaiting.key;}
 function status(){return {active:!!owner,preparing:!!owner?.preparing,id:owner?.event.id||null,contextKey,visible,painted,awaitingPersistence:!!awaiting,awaitingId:awaiting?.id||null,acknowledgements,accents,hold,lastError,assets:assets.status(),vfx:fx.status(),sample:fx.sample()};}
 return Object.freeze({prepare,step,draw,afterPaint,afterSave,needsSaveRetry,suspend,cancel,status});
}
