import {paintSoftGroundShadow} from './soft-ground-shadow.js';
import {fittedFoundation,paintFittedSupport} from './refuge-fitted-supports.js';
import {contactFoundation,paintContactShadow} from './refuge-contact.js';
import {P} from './palette.js';
import {buildRefugeRoadPlan} from './refuge-road-plan.js';
import {REFUGE_VISUAL_ACCESS} from './refuge-road-access.js';
export const REFUGE_TILE=Object.freeze({width:20,depth:10,shear:-20,origin:Object.freeze([500,85]),rise:3});
export const REFUGE_BANK_DEPTH=30;
export const REFUGE_COAST_CELLS=Object.freeze([[2,0],[16,0],[16,1],[21,1],[21,4],[24,4],[24,18],[22,18],[22,23],[10,23],[10,24],[3,24],[3,21],[0,21],[0,7],[2,7]].map(Object.freeze));
export const REFUGE_PROJECTION=Object.freeze({origin:REFUGE_TILE.origin,u:Object.freeze([REFUGE_TILE.width,REFUGE_TILE.depth]),v:Object.freeze([REFUGE_TILE.shear,REFUGE_TILE.depth]),vertical:Object.freeze([0,-1])});
export function refugeProject(u,v){const p=REFUGE_PROJECTION;return [p.origin[0]+p.u[0]*u+p.v[0]*v,p.origin[1]+p.u[1]*u+p.v[1]*v];}
export function refugeUnproject(x,y){const p=REFUGE_PROJECTION,dx=x-p.origin[0],dy=y-p.origin[1],det=p.u[0]*p.v[1]-p.u[1]*p.v[0];return [(dx*p.v[1]-dy*p.v[0])/det,(dy*p.u[0]-dx*p.u[1])/det];}
function softenedLoop(points,radius=7){
 const corners=points.map((p,i)=>{const before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length],a=Math.hypot(before[0]-p[0],before[1]-p[1]),b=Math.hypot(after[0]-p[0],after[1]-p[1]),r=Math.min(radius,a/3,b/3);return {p,entry:[p[0]+(before[0]-p[0])*r/a,p[1]+(before[1]-p[1])*r/a],exit:[p[0]+(after[0]-p[0])*r/b,p[1]+(after[1]-p[1])*r/b]};});
 const sequence=corners.slice(1).concat(corners[0]),boundary=[corners[0].exit];
 for(const q of sequence){boundary.push(q.entry);for(let i=1;i<=16;i++){const t=i/16,r=1-t;boundary.push([r*r*q.entry[0]+2*r*t*q.p[0]+t*t*q.exit[0],r*r*q.entry[1]+2*r*t*q.p[1]+t*t*q.exit[1]]);}}
 boundary.pop();return {path:'M'+corners[0].exit.join(' ')+sequence.map(q=>'L'+q.entry.join(' ')+'Q'+q.p.join(' ')+' '+q.exit.join(' ')).join('')+'Z',boundary:Object.freeze(boundary.map(Object.freeze))};
}
const coast=softenedLoop(REFUGE_COAST_CELLS.map(([u,v])=>refugeProject(u,v)));
export const REFUGE_COAST=coast.path;
// A conservative chord error for these same quadratic corners, shared with navigation.
export const REFUGE_BOUNDARY_ERROR=.02;
export const REFUGE_BOUNDARY=coast.boundary;
export function polygonContains(points,x,y){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/d)):0;return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
export function refugeLandContains(x,y,margin=0){return Number.isFinite(x)&&Number.isFinite(y)&&polygonContains(REFUGE_BOUNDARY,x,y)&&(margin<=0||REFUGE_BOUNDARY.every((a,i)=>segmentDistance(x,y,a,REFUGE_BOUNDARY[(i+1)%REFUGE_BOUNDARY.length])>=margin+REFUGE_BOUNDARY_ERROR));}
export function refugeTilePoints(u,v){return [[u,v],[u+1,v],[u+1,v+1],[u,v+1]].map(([a,b])=>refugeProject(a,b));}
export function refugeFoundation(s){
 const contact=contactFoundation(s);if(contact)return contact;
 const fitted=fittedFoundation(s);if(fitted)return fitted;
 const width=(s.foundationWidth??s.width)*1.14,height=Math.max(8,Math.min(12,Math.round(width*.095))),x=s.x,front=s.y-height+(s.foundationFront??10),half=width/2,slopes=s.foundationSlopes??[.5,.5];
 const a=[x-half,front-half*slopes[0]],b=[x,front-half*(slopes[0]+slopes[1])],r=[x+half,front-half*slopes[1]],l=[x,front];
 return {a,b,r,l,height,front,width,top:[a,b,r,l],ground:[a,b,r,l].map(([x,y])=>[x,y+height])};
}
export function refugeArtY(s){return s.y-refugeFoundation(s).height;}
function polygon(c,points,fill,stroke=null,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function supportMaterials(s){
 const kind='B'; // Human-selected materials by structure, AUTH-20261015-0706.
 const mineral={top:P.steel,left:P.gray,right:P.slate,edge:P.silver,outline:P.ink};
 if(kind==='A')return mineral;
 if(kind==='B'){if(['well','stars','miner'].includes(s.id))return mineral;if(s.id==='tree')return {top:P.slate,left:P.deepTeal,right:P.ink,edge:P.steel,outline:P.ink};return {top:P.ochre,left:P.clay,right:P.wood,edge:P.sand,outline:P.ink};}
 return {top:P.sand,left:P.ochre,right:P.clay,edge:P.ochre,outline:P.wood};
}
// GV-008: short ground contact, same light and displacement as approved Mission V2.
// Input is the existing bottom footprint, never the upper rim or sprite bounds.
const contactShadowCache=new WeakMap();
export function refugeGroundShadow(ground,ratio=1){
 let byScale=contactShadowCache.get(ground);if(!byScale){byScale=new Map();contactShadowCache.set(ground,byScale);}
 if(byScale.has(ratio))return byScale.get(ratio);
 const points=[...ground,...ground.map(([x,y])=>[x+2.8*ratio,y+1.8*ratio])].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=ps=>{const h=[];for(const p of ps){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}h.pop();return h;};
 const shadow=half(points).concat(half(points.slice().reverse()));byScale.set(ratio,shadow);return shadow;
}
export function paintRefugeGroundShadow(c,ground,ratio=1){paintSoftGroundShadow(c,refugeGroundShadow(ground,ratio),{color:P.forest,opacity:.34,padding:2});}
function paintStationBase(c,s){
 if(paintContactShadow(c,s))return;
 if(paintFittedSupport(c,s))return;
 const material=supportMaterials(s);
 const {a,b,r,l,height,ground}=refugeFoundation(s);
 if(['well','stars','tree','miner'].includes(s.id))paintRefugeGroundShadow(c,ground,(s.foundationWidth??s.width)/90);
 else polygon(c,[l,r,[r[0]+7,r[1]+height+5],[l[0]+7,l[1]+height+5]],P.forest);
 polygon(c,[a,l,[l[0],l[1]+height],[a[0],a[1]+height]],material.left,material.outline,1.1);
 polygon(c,[l,r,[r[0],r[1]+height],[l[0],l[1]+height]],material.right,material.outline,1.1);
 polygon(c,[a,b,r,l],material.top,material.outline,1.1);
 c.strokeStyle=material.edge;c.lineWidth=1;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(...r);c.stroke();
}
let paving,cachedStations,cachedExclusions;
export function refugePaving(stations=cachedStations,exclusions=cachedExclusions??[]){
 if(paving&&stations===cachedStations&&exclusions===cachedExclusions)return paving;
 const solids=[...stations.map(s=>refugeFoundation(s).ground),...exclusions];
 paving=buildRefugeRoadPlan({boundary:REFUGE_BOUNDARY,error:REFUGE_BOUNDARY_ERROR,solids,stations:stations.map(s=>({...s,gameplayApproach:s.approach,approach:REFUGE_VISUAL_ACCESS[s.id].point})),hub:REFUGE_VISUAL_ACCESS.statue.point,project:refugeProject,unproject:refugeUnproject});cachedStations=stations;cachedExclusions=exclusions;return paving;
}

let cachedShore;
function shoreGeometry(source){
 if(cachedShore?.source===source)return cachedShore;const shore=new Path2D(source);let index=0;
 const bottom=new Path2D(source.replace(/-?\d+(?:\.\d+)?/g,n=>String(Number(n)+(index++%2?REFUGE_BANK_DEPTH:0))));
 const outsideBank=new Path2D();outsideBank.rect(0,0,1000,620);outsideBank.addPath(bottom);return cachedShore={source,shore,outsideBank};
}
export function clipRefugeBank(c,source){c.clip(shoreGeometry(source).outsideBank,'evenodd');}
function rock(c,x,y,w){const h=w*.55,a=[x-w*.45,y-h*.35],b=[x-w*.1,y-h],r=[x+w*.4,y-h*.75],d=[x+w*.5,y-h*.1],l=[x,y];polygon(c,[l,d,[x+w*.7,y+4],[x+w*.1,y+4]],P.forest);polygon(c,[a,b,r,d,l],P.gray,P.ink,1.1);polygon(c,[a,b,r,[x+w*.05,y-h*.4]],P.steel);}
export function paintRefugePlatform(c,source,stations,ambientBases=[],exclusions=[]){
 const {shore}=shoreGeometry(source);c.save();c.fillStyle=P.blue;c.fillRect(0,0,1000,620);c.lineJoin='round';
 c.save();c.translate(0,REFUGE_BANK_DEPTH);c.fillStyle=P.wood;c.fill(shore);c.strokeStyle=P.ink;c.lineWidth=2.5;c.stroke(shore);c.restore();
 for(let i=0;i<REFUGE_BOUNDARY.length;i++){const a=REFUGE_BOUNDARY[i],b=REFUGE_BOUNDARY[(i+1)%REFUGE_BOUNDARY.length];if(b[0]>=a[0])continue;polygon(c,[a,b,[b[0],b[1]+REFUGE_BANK_DEPTH],[a[0],a[1]+REFUGE_BANK_DEPTH]],b[1]>a[1]?P.wood:P.clay);}
 c.save();c.translate(0,5);c.fillStyle=P.forest;c.fill(shore);c.strokeStyle=P.ink;c.lineWidth=2;c.stroke(shore);c.restore();
 c.fillStyle=P.green;c.fill(shore);c.strokeStyle=P.lime;c.lineWidth=1.7;c.stroke(shore);
 c.save();c.clip(shore);
 for(const tile of refugePaving(stations,exclusions).tiles){const p=tile.outline,z=REFUGE_TILE.rise;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(b[0]<a[0])polygon(c,[a,b,[b[0],b[1]+z],[a[0],a[1]+z]],b[1]>a[1]?P.clay:P.ochre);}polygon(c,p,P.sand,P.clay,.7);}
 for(const [x,y,w]of [[155,300,13],[172,307,8],[370,203,10],[383,208,7],[820,420,14],[838,425,8],[420,460,12],[434,464,7],[648,168,10]])if(refugeLandContains(x,y,w))rock(c,x,y,w);
 for(const s of [...stations,...ambientBases])paintStationBase(c,s);
 c.restore();c.restore();
}

