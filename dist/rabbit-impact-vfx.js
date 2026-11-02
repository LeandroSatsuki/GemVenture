import {P} from './palette.js';

export const RABBIT_VFX_SPEC=Object.freeze({carrotSeconds:.32,mutinySeconds:.22,hitSeconds:.18,maxBursts:8,maxPieces:64,maxHitCues:8,maxSeenKeys:256,bossWidth:92,contactY:-48,contactCenterX:7,contactSpacing:18});
const finite=Number.isFinite,point=p=>p&&finite(p.x)&&finite(p.y),cell=p=>point(p)&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=23&&p.y>=1&&p.y<=17;
const header=e=>e&&e.version===2&&typeof e.id==='string'&&e.id.startsWith(e.type+':')&&e.id.length<1024&&Number.isSafeInteger(e.sourceId)&&Number.isSafeInteger(e.beat)&&e.beat>=0;
export function isRabbitVfxEvent(e){
 if(!header(e))return false;
 if(e.type==='rabbitCarrotImpact')return ['left','right','up','down'].includes(e.direction)&&cell(e.target)&&point(e.origin)&&e.origin.id===e.sourceId&&Number.isSafeInteger(e.scheduledBeat)&&e.scheduledBeat>=0&&Array.isArray(e.tiles)&&e.tiles.length>0&&e.tiles.length<=25&&e.tiles.every(cell)&&e.tiles.some(p=>p.x===e.target.x&&p.y===e.target.y)&&Array.isArray(e.childrenHit)&&e.childrenHit.length<=1;
 if(e.type==='rabbitMutinyImpact')return cell(e.target)&&e.target.id===e.sourceId&&Number.isSafeInteger(e.scheduledBeat)&&e.scheduledBeat>=0&&finite(e.windowUntil)&&e.windowUntil>=e.scheduledBeat&&Array.isArray(e.children)&&e.children.length===3&&e.children.every(cell)&&new Set(e.children.map(c=>c.id)).size===3;
 return e.type==='rabbitBossHit'&&cell(e)&&finite(e.actualDamage)&&e.actualDamage>0&&finite(e.hp)&&e.hp>=0&&finite(e.windowUntil)&&e.windowUntil>=e.beat&&typeof e.actionId==='string'&&e.actionId.startsWith('player-action:')&&e.actionId.length<1024;
}
const same=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y;
// Visual decisions only: never remove events from the engine/audio/HUD stream.
export function planRabbitCompatibility(events=[]){
 const full=new Set(),hitVisual=new Set();
 for(let i=0;i<events.length;i++){const e=events[i];if(!isRabbitVfxEvent(e))continue;
  if(e.type==='rabbitCarrotImpact'){
   const prior=events[i-1];if(prior?.type==='carrotSlam'&&same(prior,e.target)&&prior.direction===e.direction){full.add(prior);for(let j=i+1;j<events.length;j++){const q=events[j];if(q.type==='slam'){if(same(q,e.target)&&q.color===P.orange)full.add(q);break;}if(!['score','rabbitStun','rabbitChildStunned','rabbitMutiny'].includes(q.type))break;}}
  }
  if(e.type==='rabbitMutinyImpact'&&events[i+1]?.type==='bossOpen'&&events[i+1].name==='COELHO TONTO!')full.add(events[i+1]);
  if(e.type==='rabbitBossHit'){
   const action=events.find(q=>q.type==='playerActionResolved'&&q.version===1&&q.id===e.actionId&&q.interaction?.gesture==='strike'&&q.interaction.outcome==='damage'&&q.interaction.damage===e.actualDamage&&q.interaction.target?.id===e.sourceId&&q.interaction.target?.bossIndex===6);
   if(action)for(let j=i+1;j<events.length;j++){const q=events[j];if(q.type==='score')continue;if(q.type==='hit'&&same(q,e)&&finite(q.damage)&&q.damage>=e.actualDamage)hitVisual.add(q);break;}
  }
 }
 for(let i=1;i<events.length;i++){const e=events[i],q=events[i-1];if(header(e)&&e.type==='rabbitChildStunned'&&e.cause==='carrot-bait'&&cell(e)&&q?.type==='rabbitStun'&&same(q,e)&&q.color===P.lemon)full.add(q);}
 return {full,hitVisual};
}
function projected(project,p){const q=project(p.x,p.y);return point(q)?{x:q.x/2,y:q.y/2}:null;}
function cells(project,tiles){return tiles.map(p=>[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(([dx,dy])=>projected(project,{x:p.x+dx,y:p.y+dy})));}
function clipCells(c,masks){c.beginPath();for(const poly of masks){c.moveTo(poly[0].x,poly[0].y);for(let i=1;i<4;i++)c.lineTo(poly[i].x,poly[i].y);c.closePath();}c.clip();}
function puff(c,x,y,size,base,shade){const w=size*1.3,h=size*.75;c.fillStyle=base;c.beginPath();c.moveTo(x-w,y);c.lineTo(x-w*.55,y-h);c.lineTo(x+w*.55,y-h);c.lineTo(x+w,y-h*.2);c.lineTo(x+w*.65,y+h*.45);c.lineTo(x-w*.65,y+h*.45);c.closePath();c.fill();c.fillStyle=shade;c.beginPath();c.moveTo(x-w,y);c.lineTo(x+w,y-h*.2);c.lineTo(x+w*.65,y+h*.45);c.lineTo(x-w*.65,y+h*.45);c.closePath();c.fill();}
export function rabbitContactAnchors(ground,bossWidth=92){if(!point(ground)||!finite(bossWidth)||bossWidth<=0)return[];const k=bossWidth/92;return [-1,0,1].map(side=>({x:ground.x+(7+side*18)*k,y:ground.y-48*k}));}
export function createRabbitImpactVfx(){
 let bursts=[],hits=[],seen=new Set();
 function remember(key){seen.add(key);while(seen.size>RABBIT_VFX_SPEC.maxSeenKeys)seen.delete(seen.values().next().value);}
 function clear({preserveSeen=false}={}){bursts=[];hits=[];if(!preserveSeen)seen=new Set();}
 function prime(events=[]){for(const e of events)if(isRabbitVfxEvent(e)){remember('id:'+e.id);if(e.type==='rabbitBossHit')remember('action:'+e.sourceId+':'+e.actionId);}}
 function consume(events=[],{project,time,musicTime,beatTime,bossWidth=92,restore=false}={}){
  const plan=planRabbitCompatibility(events),result={accepted:0,stale:0,duplicates:0,invalid:0,plan};
  if(restore){prime(events);return result;}
  if(typeof project!=='function'||typeof beatTime!=='function'||!finite(time)||!finite(musicTime)||!finite(bossWidth)||bossWidth<=0)return {...result,reason:'explicit-clock-and-projection-required'};
  for(const e of events){if(!isRabbitVfxEvent(e)){if(['rabbitCarrotImpact','rabbitMutinyImpact','rabbitBossHit'].includes(e?.type))result.invalid++;continue;}const action=e.type==='rabbitBossHit'?'action:'+e.sourceId+':'+e.actionId:null;if(seen.has('id:'+e.id)||action&&seen.has(action)){result.duplicates++;continue;}remember('id:'+e.id);if(action)remember(action);
   const kind=e.type==='rabbitCarrotImpact'?'carrot':e.type==='rabbitMutinyImpact'?'mutiny':'hit',life=RABBIT_VFX_SPEC[kind+'Seconds'],eventTime=beatTime(e.scheduledBeat??e.beat);if(!finite(eventTime))continue;const age=Math.max(0,musicTime-eventTime);if(age>=life){result.stale++;continue;}
   const center=projected(project,kind==='hit'?e:e.target);if(!center)continue;const item={kind,start:time-age,life,pieces:[],masks:null,sourceId:e.sourceId};
   if(kind==='carrot'){const tileList=[e.target,...e.tiles.filter(p=>!same(p,e.target))],n=Math.min(8,tileList.length);for(let i=0;i<n;i++){const tile=tileList[i===0?0:Math.floor(i*(tileList.length-1)/(n-1))],p=projected(project,tile);if(!p)continue;item.pieces.push({x:p.x,y:p.y,dx:i%2?1:-1,size:2.25+(i%3)*.4,front:i===0||i===n-1});}item.masks=cells(project,e.tiles);if(item.masks.some(poly=>poly.some(p=>!p)))continue;}
   else if(kind==='mutiny'){for(const [i,p]of rabbitContactAnchors(center,bossWidth).entries())for(const side of [-1,1])item.pieces.push({x:p.x+side*2,y:p.y,dx:side,size:side<0?1.6:2.1,front:true,white:side<0,group:i});}
   else{const k=bossWidth/92;for(const [i,side]of [-1,0,1].entries())item.pieces.push({x:center.x+side*12*k,y:center.y-4*k,dx:side,size:1.5+i*.2,front:true});hits.push({sourceId:e.sourceId,start:item.start,life,actualDamage:e.actualDamage,actionId:e.actionId});if(hits.length>RABBIT_VFX_SPEC.maxHitCues)hits.shift();}
   bursts.push(item);while(bursts.length>RABBIT_VFX_SPEC.maxBursts||bursts.reduce((n,v)=>n+v.pieces.length,0)>RABBIT_VFX_SPEC.maxPieces)bursts.shift();result.accepted++;
  }return result;
 }
 function update(time){if(!finite(time))return;bursts=bursts.filter(e=>time>=e.start&&time-e.start<e.life);hits=hits.filter(e=>time>=e.start&&time-e.start<e.life);}
 function sampleBossHit(sourceId,time){if(!finite(time))return null;const e=hits.findLast(e=>e.sourceId===sourceId&&time>=e.start&&time-e.start<e.life);return e?{age:time-e.start,actualDamage:e.actualDamage,actionId:e.actionId}:null;}
 function draw(c,{time,pass='front',soft=false}={}){
  if(!finite(time)||!['floor','front','all'].includes(pass))return 0;let painted=0;c.save();c.globalCompositeOperation='source-over';
  for(const e of bursts){const age=time-e.start;if(age<0||age>=e.life)continue;const u=age/e.life;c.save();if(e.masks)clipCells(c,e.masks);c.globalAlpha*=(1-u)*(soft?.58:.85);
   for(let i=0;i<e.pieces.length;i++){const p=e.pieces[i];if(pass!=='all'&&p.front!==(pass==='front'))continue;if(soft&&(e.kind==='carrot'?i>1:e.kind==='mutiny'?i%2!==0:i!==0))continue;const drift=soft?0:Math.sin(u*Math.PI)*3,x=p.x+p.dx*drift,y=p.y-(soft?0:Math.sin(u*Math.PI)*3.3),size=p.size*(soft?1:1+u*.12);puff(c,x,y,size,p.white?P.white:P.sand,p.white?P.silver:P.clay);painted++;}
   c.restore();
  }c.restore();return painted;
 }
 return Object.freeze({clear,prime,consume,update,sampleBossHit,draw,status:()=>({bursts:bursts.length,pieces:bursts.reduce((n,e)=>n+e.pieces.length,0),hitCues:hits.length,seenKeys:seen.size})});
}
