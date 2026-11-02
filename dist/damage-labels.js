// Presentation-only hierarchy. Damage, score and rewards stay in core events.
export const DAMAGE_LABEL_LIMITS=Object.freeze({normal:10,soft:6,secondary:6,mergeSeconds:.45});
const criticalIds=new Set(['force','talent-critical','well-critical','lucky']);
const text=n=>Number(n.toFixed(2)).toLocaleString('pt-BR');
export function damageLabelRoles(events){
 const roles=new Map();let start=0,perfect=0;
 for(let i=0;i<events.length;i++){const e=events[i];if(e.type==='scroll'){start=i+1;perfect=start;continue;}if(e.type==='perfect')perfect=i+1;
  if(e.type!=='playerActionResolved')continue;const action=e.interaction,t=action?.target;
  if(action?.outcome==='damage'&&t){const from=Math.max(start,perfect);let critical=false;
   for(let j=from;j<i;j++){const h=events[j];if(h.type==='proc'&&criticalIds.has(h.id))critical=true;if(h.type==='hit'&&h.damage>0&&h.x===t.x&&h.y===t.y&&(h.mineral?.id==null||h.mineral.id===t.id)){roles.set(h,critical?'critical':'direct');break;}}
  }start=i+1;perfect=start;
 }return roles;
}
export function damageLabelFrame(p,soft=false){const k=Math.max(0,Math.min(1,1-p.life/p.total)),secondary=p.damageRole==='secondary';return{font:p.font,scale:soft?1:1+Math.max(0,1-k*7)*(secondary?.06:p.damageRole==='critical'?.55:.45),y:p.y-(soft?6:k*(secondary?12:28)),alpha:Math.min(1,p.life*4)*(secondary?.82:1)};}
const box=(p,soft)=>{const f=damageLabelFrame(p,soft),w=(p.text.length*p.font*.64+6)*f.scale;return{x:p.x-w/2,y:f.y-p.font*f.scale,width:w,height:p.font*f.scale+4};};
const overlaps=(a,b)=>a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height;
export function appendDamageLabel(labels,e,point,role,time,epoch=0,soft=false){
 if(!Number.isFinite(e.damage)||e.damage<=0)return null;
 const identity=e.mineral?.id!=null?'mineral:'+e.mineral.id:e.targetId!=null?'target:'+e.targetId:null,key=identity===null?null:epoch+':'+identity;
 if(role==='secondary'&&key!==null){const old=labels.find(p=>p.damageRole==='secondary'&&p.damageKey===key&&p.life>0);
  if(old&&time-old.groupStarted<=DAMAGE_LABEL_LIMITS.mergeSeconds){old.amount+=e.damage;old.hits++;old.text=text(old.amount);old.life=Math.min(old.total,.9-(time-old.groupStarted));return old;}
  if(old)labels.splice(labels.indexOf(old),1);
 }
 const total=role==='secondary'?.72:1,p={x:point.x,y:point.y,text:text(e.damage),color:e.color,big:false,font:role==='critical'?14:role==='direct'?12:10,damageRole:role,damageKey:key,amount:e.damage,hits:1,groupStarted:time,life:total,total};
 const occupied=labels.filter(l=>l.damageRole&&l.life>0).map(l=>box(l,soft));let best=null,bestCost=Infinity;
 for(const [dx,dy]of [[0,0],[0,-16],[-16,-28],[16,-40],[0,-52]]){p.x=point.x+dx;p.y=point.y+dy;const b=box(p,soft),cost=occupied.reduce((n,r)=>n+(overlaps(b,r)?1:0),0);if(cost<bestCost){best={x:p.x,y:p.y};bestCost=cost;}if(cost===0)break;}
 Object.assign(p,best);labels.push(p);
 // Preserve direct/critical acknowledgments when secondary ticks saturate the view.
 while(labels.filter(l=>l.damageRole).length>(soft?DAMAGE_LABEL_LIMITS.soft:DAMAGE_LABEL_LIMITS.normal)||labels.filter(l=>l.damageRole==='secondary').length>DAMAGE_LABEL_LIMITS.secondary){let i=labels.findIndex(l=>l.damageRole==='secondary');if(i<0)i=labels.findIndex(l=>l.damageRole==='direct');if(i<0)i=labels.findIndex(l=>l.damageRole);labels.splice(i,1);}
 while(labels.length>28){const i=labels.findIndex(l=>l.damageRole==='secondary');labels.splice(i<0?0:i,1);}return p;
}
export const labelPriority=p=>p.big?4:p.damageRole==='critical'?3:p.damageRole==='direct'?2:p.damageRole==='secondary'?0:1;

// Canvas bounds are physical pixels; the incoming transform includes camera, scale and DPR.
export function damageLabelInFrame(p,frame,m,width,height,textWidth){
 if(!m||![m.a,m.b,m.c,m.d,m.e,m.f,width,height].every(Number.isFinite)||width<=0||height<=0)return true;
 const half=((Number.isFinite(textWidth)?textWidth:p.text.length*p.font*.64)/2+2)*frame.scale,left=p.x-half,right=p.x+half,top=frame.y-(p.font+2)*frame.scale,bottom=frame.y+3*frame.scale;
 return [[left,top],[right,top],[left,bottom],[right,bottom]].every(([x,y])=>{const px=m.a*x+m.c*y+m.e,py=m.b*x+m.d*y+m.f;return px>=1&&py>=1&&px<=width-1&&py<=height-1;});
}
