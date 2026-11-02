import {paintSoftGroundShadow} from './soft-ground-shadow.js';
// Isolated GV030/031 layout C: preserve current contacts/pixels/clocks; no official application.
import {P} from './palette.js';
export const REFUGE_CONTACT_REPOSITION=true; // Frozen layout C proposal, enabled only in this isolated composition.
export const REFUGE_CONTACT_SPECS=Object.freeze({
 records:Object.freeze({asset:'gramophone',sourceFile:'assets/refuge-v1/gramophone.png',sourceAnchor:[700.5,1038],sourceWidth:871,groupWidth:100,layerWidth:100,removedHeight:8,
  footprint:[[447,850],[785,700],[1105,862],[785,1038]],
  feet:[[[448,851],[500,825],[549,853],[500,886]],[[715,998],[784,964],[852,999],[784,1033]],[[1005,861],[1052,836],[1101,861],[1052,895]]],shadow:[1.8,1.2]}),
 zag:Object.freeze({asset:'roulette-base',sourceFile:'assets/refuge-v1/roulette-base.png',sourceAnchor:[661,1072],sourceWidth:524,groupWidth:122,layerWidth:100,removedHeight:9,
  footprint:[[403,936],[563,832],[920,938],[727,1071]],
  feet:[[[403,936],[563,832],[920,938],[727,1071]]],shadow:[2.2,1.4]})
});
// Candidate-only arrival correction: keep the avatar left of the foreground mission-board roof.
export const REFUGE_STATUE_APPROACH_OFFSET_X=REFUGE_CONTACT_REPOSITION?-40:0;
export function contactStation(s){
 const spec=REFUGE_CONTACT_SPECS[s.id];if(!spec)return s;
 const dx=REFUGE_CONTACT_REPOSITION&&s.id==='records'?-30:0,dy=REFUGE_CONTACT_REPOSITION&&s.id==='records'?60:0;
 return {...s,x:s.x+dx,y:s.y+dy,hit:s.hit?{...s.hit,x:s.hit.x+dx,y:s.hit.y+dy+spec.removedHeight}:undefined};
}
export function contactStatue(s){return REFUGE_CONTACT_REPOSITION?{...s,x:s.x-40,y:s.y-10}:s;}
export function contactScenicAccess(access){
 if(!REFUGE_CONTACT_REPOSITION)return access;
 return Object.fromEntries(Object.entries(access).map(([id,s])=>{const d=id==='records'?[-30,60]:id==='statue'?[-40,-10]:[0,0];return [id,{...s,point:{x:s.point.x+d[0],y:s.point.y+d[1]},gameplayApproach:{x:s.gameplayApproach.x+d[0]+(id==='statue'?REFUGE_STATUE_APPROACH_OFFSET_X:0),y:s.gameplayApproach.y+d[1]}}];}));
}
export function contactPoint(s,p){const spec=REFUGE_CONTACT_SPECS[s.id],k=s.width/spec.groupWidth*spec.layerWidth/spec.sourceWidth;return [s.x+(p[0]-spec.sourceAnchor[0])*k,s.y+(p[1]-spec.sourceAnchor[1])*k];}
export function contactFoundation(s){
 const spec=REFUGE_CONTACT_SPECS[s.id];if(!spec)return null;
 const ground=spec.footprint.map(p=>contactPoint(s,p)),[a,b,r,l]=ground;
 return {a,b,r,l,top:ground,ground,height:0,front:Math.max(...ground.map(p=>p[1])),width:Math.max(...ground.map(p=>p[0]))-Math.min(...ground.map(p=>p[0])),embeddedSupport:true};
}
function hull(points){const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const half=ps=>{const h=[];for(const q of ps){while(h.length>1&&cross(h.at(-2),h.at(-1),q)<=0)h.pop();h.push(q);}h.pop();return h;};return half(p).concat(half(p.slice().reverse()));}
export function contactShadowPolygons(s){const spec=REFUGE_CONTACT_SPECS[s.id];if(!spec)return [];const k=s.width/(s.id==='records'?75:95),[dx,dy]=spec.shadow.map(v=>v*k);return spec.feet.map(foot=>{const p=foot.map(q=>contactPoint(s,q));return hull([...p,...p.map(([x,y])=>[x+dx,y+dy])]);});}
export function paintContactShadow(c,s){
 if(!REFUGE_CONTACT_SPECS[s.id])return false;
 c.save();c.fillStyle=P.forest;c.strokeStyle=P.forest;c.lineWidth=.65*s.width/(s.id==='records'?75:95);c.lineJoin='round';
 for(const p of contactShadowPolygons(s))paintSoftGroundShadow(c,p,{color:P.forest,opacity:.38,padding:1.3});
 c.restore();return true;
}
