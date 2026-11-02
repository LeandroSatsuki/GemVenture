import {paintBurrowHost as paintR1BurrowHost} from './campaign-cave-host.js';
// Stylized volumetric stone blocks over the unchanged continuous wall kit. Same camera and height as the source game.
export const WALL_KIT=Object.freeze({height:30,rim:4,radius:3,darken:.20,projection:[44,0,4,32],revision:5});
const area=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
export function roundedContours(loops,radius=WALL_KIT.radius){
 return loops.map(loop=>{
  const out=[];
  for(let i=0;i<loop.length;i++){
   const b=loop[i],a=loop[(i+loop.length-1)%loop.length],c=loop[(i+1)%loop.length],al=Math.hypot(a[0]-b[0],a[1]-b[1]),cl=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,al*.24,cl*.24),p=[b[0]+(a[0]-b[0])*r/al,b[1]+(a[1]-b[1])*r/al],q=[b[0]+(c[0]-b[0])*r/cl,b[1]+(c[1]-b[1])*r/cl];
   for(let k=0;k<=4;k++){const t=k/4,u=1-t;out.push([u*u*p[0]+2*u*t*b[0]+t*t*q[0],u*u*p[1]+2*u*t*b[1]+t*t*q[1]]);}
  }
  return out;
 });
}
export function buildPilotWallPlan(loops){
 const rounded=roundedContours(loops),faces=[];
 rounded.forEach((loop,li)=>{
  const orientation=Math.sign(area(loop));let distance=0;
  for(let i=0;i<loop.length;i++){
   const a=loop[i],b=loop[(i+1)%loop.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const steps=Math.max(1,Math.ceil(length/15));
   for(let j=0;j<steps;j++){
    const at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],p=at(j/steps),q=at((j+1)/steps),height=WALL_KIT.height;
    faces.push({id:`pilot:${li}:${i}:${j}`,type:'wall',a:p,b:q,height,role:q[0]-p[0]>=0?'front':'return',cap:[[p[0],p[1]-height],[q[0],q[1]-height],[q[0],q[1]-height-4],[p[0],p[1]-height-4]],visualDepth:(Math.max(p[1],q[1])*2-115)/32,arcStart:distance+length*j/steps,arcEnd:distance+length*(j+1)/steps,loop:li,orientation});
   }
   distance+=length;
  }
 });
 return {loops:rounded,faces};
}
const polygon=(c,p)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
// Shared material/voxel grammar: broad blocks with a top bevel and a shadowed
// return. Arc intervals are independent of render segmentation and camera.
const stoneHash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967296;};
const stoneMix=(a,b,t)=>{const n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);return '#'+[16,8,0].map(k=>Math.round(((n>>k)&255)*(1-t)+((m>>k)&255)*t).toString(16).padStart(2,'0')).join('');};
function stoneIntervals(left,right,row,salt=0){
 const blocks=[],span=173,phase=row*39;
 for(let cell=Math.floor((left-phase)/span);cell<=Math.floor((right-phase)/span);cell++){
  const key=cell*101+row*7919+salt,count=4+(stoneHash(key+9)>.45?1:0),weights=Array.from({length:count},(_,i)=>.65+stoneHash(key+i*67)*.9),sum=weights.reduce((a,b)=>a+b,0);let x=cell*span+phase;
  weights.forEach((w,i)=>{const next=x+span*w/sum;if(next>=left&&x<=right)blocks.push({left:x,right:next,key:key+i*211});x=next;});
 }
 return blocks;
}
function paintBlockField(c,material,at,left,right,bounds,shade=false,salt=0){
 function drawBlock(block,row,end=row+1){
  const {left:l,right:r,key}=block,low=s=>typeof bounds[row]==='function'?bounds[row](s):bounds[row],high=s=>typeof bounds[end]==='function'?bounds[end](s):bounds[end],b=.9,bevel=1.5+stoneHash(key+43)*1.0;
  const pts=[[l+b,low(l)],[r-b,low(r)],[r,low(r)+b],[r,high(r)-b],[r-b,high(r)],[l+b,high(l)],[l,high(l)-b],[l,low(l)+b]].map(([s,z])=>at(s,z));
  polygon(c,pts);c.fillStyle=stoneMix(material.rock[2],material.rock[1],(shade?.04:.13)+stoneHash(key+19)*(shade?.08:.19));c.fill();
  c.strokeStyle=material.floor;c.lineWidth=.8;c.stroke();
  // A broad top plane and one narrow side plane make relief at final scale.
  polygon(c,[[l+b,high(l)-.3],[r-b,high(r)-.3],[r-bevel,high(r)-bevel],[l+bevel,high(l)-bevel]].map(([s,z])=>at(s,z)));c.fillStyle=stoneMix(material.rock[2],material.rock[0],shade?.16:.29+stoneHash(key+87)*.06);c.fill();
  polygon(c,[[r-.5,low(r)+b],[r-.5,high(r)-b],[r-bevel,high(r)-bevel],[r-bevel,low(r)+bevel]].map(([s,z])=>at(s,z)));c.fillStyle=stoneMix(material.rock[2],material.floor,.43);c.fill();
  if(stoneHash(key+17)>.64){polygon(c,[[l+.7,low(l)+b],[l+.7,high(l)-b],[l+1.5,high(l)-bevel],[l+1.5,low(l)+bevel]].map(([s,z])=>at(s,z)));c.fillStyle=stoneMix(material.rock[2],material.rock[0],shade?.12:.20);c.fill();}
 }
 for(let row=0;row<bounds.length-1;row++)for(const block of stoneIntervals(left,right,row,salt))drawBlock(block,row);
 // A few tall interlocking chunks interrupt the continuous course: variation
 // comes from block proportions and relief, not noise on every tile vertex.
 for(let row=0;row<bounds.length-2;row+=2)for(const block of stoneIntervals(left,right,row,salt))if(stoneHash(block.key+777)>.73)drawBlock(block,row,row+2);
}
export function paintPilotWall(c,face,material,darken=WALL_KIT.darken){
 const {height:h,arcStart:s0,arcEnd:s1}=face,shade=face.role==='return',dx=face.b[0]-face.a[0],dy=face.b[1]-face.a[1],len=s1-s0||1,at=(s,z)=>[face.a[0]+dx*(s-s0)/len,face.a[1]+dy*(s-s0)/len-z],overlap=.22,lo=s0-overlap,hi=s1+overlap,a=at(lo,0),b=at(hi,0),mid=s=>13.5+Math.sin(s/47)*1.7+Math.sin(s/113)*.7;
 c.save();polygon(c,[a,b,at(hi,h),at(lo,h)]);c.fillStyle=material.rock[2];c.fill();c.save();c.clip();
 paintBlockField(c,material,at,lo,hi,[0,mid,h],shade,face.loop*1013);c.restore();
 c.save();polygon(c,[at(lo,h),at(hi,h),at(hi,h+4),at(lo,h+4)]);c.clip();c.fillStyle=stoneMix(material.rock[2],material.rock[0],.34);c.fill();
 for(const {left:l,right:r,key}of stoneIntervals(lo,hi,1,face.loop*1013)){
  polygon(c,[at(l,h),at(r,h),at(r,h+4),at(l,h+4)]);c.fillStyle=stoneMix(material.rock[2],material.rock[0],.28+stoneHash(key+3)*.11);c.fill();
  c.strokeStyle=stoneMix(material.rock[2],material.floor,.28);c.lineWidth=.75;c.beginPath();c.moveTo(...at(l,h));c.lineTo(...at(l-1.3,h+4));c.stroke();
 }c.restore();
 c.strokeStyle=material.floor;c.lineWidth=.85;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();
 if(darken){c.globalCompositeOperation='source-atop';c.globalAlpha=darken;c.fillStyle=material.floor;c.fillRect(Math.min(a[0],b[0])-2,Math.min(a[1],b[1])-h-6,Math.abs(b[0]-a[0])+4,Math.abs(b[1]-a[1])+h+10);}c.restore();
}

// The raised host wall joins the ordinary wall's coping at y+8-34. No detached
// ring of collectible-looking stones is used around the opening.
export function traceBurrowArch(c,x,y){
 c.beginPath();c.moveTo(x-65,y-43);c.bezierCurveTo(x-65,y-73,x-35,y-97,x,y-97);c.bezierCurveTo(x+35,y-97,x+65,y-73,x+65,y-43);c.lineTo(x+65,y-7);c.quadraticCurveTo(x+65,y+11,x+47,y+11);c.lineTo(x-47,y+11);c.quadraticCurveTo(x-65,y+11,x-65,y-7);c.closePath();
}
export function paintBurrowHost(c,plan,material){
 if(!plan.arenaJoin)return paintR1BurrowHost(c,plan,material);
 const {cx:x,cy:y}=plan,points=[[-116,8],[-116,-22],[-104,-22],[-104,-54],[-87,-54],[-87,-106],[-61,-106],[-61,-122],[-20,-122],[-20,-128],[35,-128],[35,-118],[68,-118],[68,-96],[92,-96],[92,-54],[104,-54],[104,-22],[116,-22],[116,8]],front=points.map(([u,v])=>[x+u,y+v]),back=front.map(([u,v])=>{const blend=Math.max(0,Math.min(1,(116-Math.abs(u-x))/24));return [u-8*blend,v-4-8*blend];});
 c.save();polygon(c,back);c.fillStyle=material.rock[2];c.fill();
 // Extruded stepped crown: same light and broad planes as the ordinary blocks.
 for(let i=0;i<front.length-1;i++){
  const a=front[i],b=front[i+1],dx=b[0]-a[0],dy=b[1]-a[1];if(dx===0&&dy>0)continue;
  polygon(c,[a,b,back[i+1],back[i]]);c.fillStyle=stoneMix(material.rock[2],material.rock[0],dx>0?.36:.20);c.fill();c.strokeStyle=stoneMix(material.rock[2],material.floor,.2);c.lineWidth=.65;c.stroke();
 }
 c.save();polygon(c,front);c.clip();c.fillStyle=material.rock[2];c.fill();
 const bound=z=>s=>z+Math.sin((s+plan.x*31)/54+z)*1.3;
 paintBlockField(c,material,(s,z)=>[x+s,y-z],-120,120,[ -8,bound(17),bound(38),bound(60),bound(81),bound(102),134],false,plan.x*67+plan.y*149);
 c.restore();
 // Finish only the portal: a narrow chamfered stone lip, then recessed
 // side/soffit planes. The surrounding R4 blocks and silhouette are untouched.
 const inner=[[-65,-43]],curve=(a,b,d,e,t)=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*d[0]+t*t*t*e[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*d[1]+t*t*t*e[1]];};
 for(let i=1;i<=5;i++)inner.push(curve([-65,-43],[-65,-73],[-35,-97],[0,-97],i/5));
 for(let i=1;i<=5;i++)inner.push(curve([0,-97],[35,-97],[65,-73],[65,-43],i/5));
 inner.push([65,-7],[60.5,5],[47,11],[-47,11],[-60.5,5],[-65,-7]);
 const frontLip=inner.map(([u,v])=>[u*1.12-2,5+(v-5)*1.06-3]),outerLip=inner.map(([u,v])=>[u*1.21-2,5+(v-5)*1.12-3]),world=p=>[x+p[0],y+p[1]],between=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 polygon(c,outerLip.map(world));c.fillStyle=material.rock[2];c.fill();
 for(let i=0;i<inner.length;i++){
  const j=(i+1)%inner.length,mid=(inner[i][0]+inner[j][0])/2,top=(inner[i][1]+inner[j][1])/2<-76;
  // Faceted broad stone face, with a subdued bevel on its exposed edge.
  polygon(c,[outerLip[i],outerLip[j],frontLip[j],frontLip[i]].map(world));c.fillStyle=stoneMix(material.rock[2],material.rock[1],mid<0?.23:.13);c.fill();
  polygon(c,[outerLip[i],outerLip[j],between(outerLip[j],frontLip[j],.29),between(outerLip[i],frontLip[i],.29)].map(world));c.fillStyle=stoneMix(material.rock[2],material.rock[0],mid<0?.31:.18);c.fill();
  // The inner cut catches left light while the overhead/right faces stay dark.
  polygon(c,[frontLip[i],frontLip[j],inner[j],inner[i]].map(world));c.fillStyle=top?stoneMix(material.rock[2],material.floor,.48):mid<0?stoneMix(material.rock[2],material.rock[0],.18):stoneMix(material.rock[2],material.floor,.25);c.fill();
  if([1,4,7,10].includes(i)){c.strokeStyle=stoneMix(material.rock[2],material.floor,.48);c.lineWidth=.75;c.beginPath();c.moveTo(...world(outerLip[i]));c.lineTo(...world(frontLip[i]));c.stroke();}
 }
 traceBurrowArch(c,x,y);c.fillStyle='#071b2b';c.fill();
 c.globalCompositeOperation='source-atop';c.globalAlpha=WALL_KIT.darken;c.fillStyle=material.floor;c.fillRect(x-130,y-146,260,166);c.restore();
}

// User reverted the R2-R4 solid caps. Negative loops are dark map limits,
// never walkable floor or raised relief. Keep the historical painter for R4.
export function buildCaveReliefs(loops){return [];}
export function paintCaveRelief(c,relief,material){
 const p=relief.points,x=Math.min(...p.map(v=>v[0])),y=Math.min(...p.map(v=>v[1])),w=Math.max(...p.map(v=>v[0]))-x,h=Math.max(...p.map(v=>v[1]))-y;
 c.save();polygon(c,p);c.clip();c.fillStyle=material.rock[2];c.fill();c.fillStyle=material.floor;c.globalAlpha=.38;c.fillRect(x,y,w,h);c.globalAlpha=.22;
 polygon(c,[[x-15,y+h*.72],[x+w*.28,y+h*.22],[x+w*.8,y+h*.15],[x+w+12,y+h*.5],[x+w*.55,y+h*.46],[x+w*.1,y+h*.87]]);c.fillStyle=material.rock[1];c.fill();
 c.globalAlpha=.30;c.lineWidth=1.2;c.strokeStyle=material.floor;for(const t of [.34,.70]){c.beginPath();c.moveTo(x-4,y+h*t);c.lineTo(x+w*.34,y+h*(t+.08));c.lineTo(x+w*.71,y+h*(t-.03));c.lineTo(x+w+4,y+h*(t+.04));c.stroke();}c.restore();
}
