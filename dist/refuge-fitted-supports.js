// Human-requested preview: fitted stone platforms, matching the well/reliquary.
// Ground positions, sprite dimensions, original PNGs and legacy contact B stay intact.
import {P} from './palette.js';
export const FITTED_SUPPORT_SPECS=Object.freeze({"missions":{"asset":"missions","sourceFile":"assets/refuge-v1/missions.png","sourceAnchor":[706,1004],"sourceWidth":796,"groupWidth":100,"layerWidth":100,"removedHeight":10,"nominalWidth":90,"footprint":[[372,824],[447,773],[979,942],[897,997]],"feet":[[[374,818],[450,847],[505,812],[449,789]],[[823,959],[898,987],[974,938],[914,918]]],"shadow":[1.8,1.2],"height":10,"slopes":[0.3,0.7],"margin":2},"forge":{"asset":"forge","sourceFile":"assets/village-hept32/forge.png","sourceAnchor":[658.5,1115],"sourceWidth":749,"groupWidth":100,"layerWidth":100,"removedHeight":12,"nominalWidth":120,"sourceScaleY":0.9999634943233673,"footprint":[[293,878],[651,709],[1016,891],[759,1106],[651,1053]],"feet":[[[296,875],[544,1000],[598,972],[348,848]],[[875,949],[1011,887],[1011,876],[875,938]],[[603,976],[650,1000],[679,987],[631,963]],[[658,1054],[758,1105],[869,1048],[770,1005]]],"shadow":[2.2,1.4],"height":12,"slopes":[0.5,0.5],"margin":2},"lift":{"asset":"lift-fixed-and-front","sourceFile":"assets/refuge-lift-r2/lift-part-fixed-r2.png","sourceAnchor":[657.5,1109],"sourceWidth":683,"groupWidth":100,"layerWidth":100,"removedHeight":11,"nominalWidth":105,"footprint":[[321.98571428571427,868.3857142857142],[461.83809523809526,787.0761904761905],[933.4333333333333,1024.5],[803.3380952380952,1099.304761904762]],"feet":[[[321.98571428571427,868.3857142857142],[406.54761904761904,910.6666666666666],[523.6333333333333,842.3666666666667],[445.5761904761905,796.8333333333334]],[[722.0285714285715,1044.0142857142857],[800.0857142857143,1096.0523809523809],[930.1809523809524,1021.2476190476191],[855.3761904761905,975.7142857142857]]],"shadow":[2,1.3],"height":11,"slopes":[0.5,0.5],"margin":2}});
const cache=new Map();
function hull(points){const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const half=ps=>{const h=[];for(const q of ps){while(h.length>1&&cross(h.at(-2),h.at(-1),q)<=0)h.pop();h.push(q);}h.pop();return h;};return half(p).concat(half(p.slice().reverse()));}
function bevel(points,r){return points.flatMap((p,i)=>{const before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length],a=Math.hypot(before[0]-p[0],before[1]-p[1]),b=Math.hypot(after[0]-p[0],after[1]-p[1]),rr=Math.min(r,a*.2,b*.2);return [[p[0]+(before[0]-p[0])*rr/a,p[1]+(before[1]-p[1])*rr/a],[p[0]+(after[0]-p[0])*rr/b,p[1]+(after[1]-p[1])*rr/b]];});}
function offset(points,pad){const edges=points.map((p,i)=>{const q=points[(i+1)%points.length],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);return {p:[p[0]+dy/len*pad,p[1]-dx/len*pad],d:[dx,dy]};});return edges.map((b,i)=>{const a=edges[(i+edges.length-1)%edges.length],cross=a.d[0]*b.d[1]-a.d[1]*b.d[0],qx=b.p[0]-a.p[0],qy=b.p[1]-a.p[1],t=(qx*b.d[1]-qy*b.d[0])/cross;return [a.p[0]+t*a.d[0],a.p[1]+t*a.d[1]];});}
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function fill(c,points,color){path(c,points);c.fillStyle=color;c.fill();}
export function fittedFoundation(s){
 const spec=FITTED_SUPPORT_SPECS[s.id];if(!spec)return null;
 const key=[s.x,s.y,s.width].join('/'),existing=cache.get(s.id);if(existing?.key===key)return existing.value;
 const k=s.width/spec.sourceWidth,ratio=s.width/spec.nominalWidth,height=spec.height*ratio,artY=s.y-height,[su,sv]=s.id==='missions'?[.5,.5]:spec.slopes;
 const point=([x,y])=>[s.x+(x-spec.sourceAnchor[0])*k,artY+(y-spec.sourceAnchor[1])*k*(spec.sourceScaleY??1)];
 const feet=spec.feet.map(poly=>poly.map(point)),support=spec.footprint.map(point);
 const uv=p=>{const x=p[0]-s.x,y=p[1]-artY,v=(y-su*x)/(su+sv);return [x+v,v];},xy=([u,v])=>[s.x+u-v,artY+su*u+sv*v];
 const projected=[...support,...feet.flat()].map(uv),pad=(s.id==='missions'?4:spec.margin)*ratio;
 let u0=Math.min(...projected.map(p=>p[0]))-pad,u1=Math.max(...projected.map(p=>p[0]))+pad,v0=Math.min(...projected.map(p=>p[1]))-pad,v1=Math.max(...projected.map(p=>p[1]))+pad;
 // A square in ground space projects as a diamond, like the other stone bases.
 if(s.id==='missions'){const cu=(u0+u1)/2,cv=(v0+v1)/2,half=Math.max(u1-u0,v1-v0)/2;u0=cu-half;u1=cu+half;v0=cv-half;v1=cv+half;}
 const [a,b,r,l]=[[u0,v1],[u0,v0],[u1,v0],[u1,v1]].map(xy);
 // The forge/anvil footprint is not a symmetric diamond. Fit its actual outline.
 const outline=s.id==='forge'?offset(hull([...support,...feet.flat()]),pad):[a,b,r,l],top=bevel(outline,1.7*ratio),ground=top.map(([x,y])=>[x,y+height]);
 const contact=feet.map(poly=>hull([...poly,...poly.map(([x,y])=>[x+1.2*ratio,y+.8*ratio])])),groundShadow=hull([...ground,...ground.map(([x,y])=>[x+2.8*ratio,y+1.8*ratio])]);
 const value={a,b,r,l,top,ground,height,front:Math.max(...ground.map(p=>p[1])),width:Math.max(...ground.map(p=>p[0]))-Math.min(...ground.map(p=>p[0])),fittedStone:true,feet,contact,groundShadow,ratio};cache.set(s.id,{key,value});return value;
}
export function paintFittedSupport(c,s){
 const f=fittedFoundation(s);if(!f)return false;
 const {top,ground,height,ratio}=f;c.save();c.lineJoin='round';c.lineCap='round';c.lineWidth=1.1*ratio;c.strokeStyle=P.ink;
 fill(c,f.groundShadow,P.forest);
 for(let i=0;i<top.length;i++){const a=top[i],b=top[(i+1)%top.length];if(b[0]>=a[0])continue;const side=[a,b,[b[0],b[1]+height],[a[0],a[1]+height]];fill(c,side,b[1]>a[1]?P.slate:P.gray);c.stroke();}
 fill(c,top,P.steel);c.stroke();
 // Thin upper-left rim, the same mineral swatches as well/reliquary.
 c.strokeStyle=P.silver;c.lineWidth=.8*ratio;for(let i=0;i<top.length;i++){const a=top[i],b=top[(i+1)%top.length];if(b[0]<=a[0])continue;c.beginPath();c.moveTo(a[0],a[1]+.5*ratio);c.lineTo(b[0],b[1]+.5*ratio);c.stroke();}
 // Object-to-platform occlusion, clipped to the top; no grass-green shadow on stone.
 c.save();path(c,top);c.clip();c.globalAlpha=.48;for(const p of f.contact)fill(c,p,P.slate);c.restore();c.restore();return true;
}
