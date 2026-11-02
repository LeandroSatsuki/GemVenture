import {P} from './palette.js';

// All normalized coordinates are in units of the composition's width, on BOTH axes.
// x/y is groundAnchor, not the image corner. No clock, callbacks or gameplay state.
export const LOCAL_FX_LIMITS=Object.freeze({streams:3,dropsPerStream:3,ripples:2,sparkles:4,maxPoints:8});
export const FOUNTAIN_CALIBRATION=Object.freeze({groundAnchor:Object.freeze({x:.5,y:1.02}),spout:Object.freeze({x:.5,y:.48}),crestY:.12,basin:Object.freeze({x:.5,y:.76,rx:.30,ry:.07})});
const TAU=Math.PI*2,finite=(n,d=0)=>Number.isFinite(n)?n:d,mod=(n,d)=>((n%d)+d)%d;
const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
const bound=(n,a,b)=>Math.max(a,Math.min(b,finite(n,a)));
function enter(c,{x,y,width,groundAnchor}){
 if(!c||!validPoint({x,y})||!Number.isFinite(width)||width<=0||width>1024||!validPoint(groundAnchor))return false;
 c.save();c.translate(x-groundAnchor.x*width,y-groundAnchor.y*width);c.scale(width,width);return true;
}
function line(c,points,width,color){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.lineWidth=width;c.strokeStyle=color;c.stroke();}
function quadratic(s,q,e,u){const v=1-u;return{x:v*v*s.x+2*v*u*q.x+u*u*e.x,y:v*v*s.y+2*v*u*q.y+u*u*e.y};}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}

export function sampleLocalCrystalPose({time=0,reduced=false,soft=false,phase=0,width=1}={}){
 if(reduced)return {dx:0,dy:0,angle:0};const t=finite(time)+finite(phase),a=soft?.5:1;
 return {dx:0,dy:Math.sin(t*TAU/5.2)*finite(width,1)*.012*a,angle:Math.sin(t*TAU/7.1)*.008*a};
}

// `back`: jet + falling stream. `front`: ripples and tiny splashes INSIDE the basin.
// Caller paints basin front-lip sprite AFTER water. Pure time must freeze on pause.
export function paintFountainWater(c,{x,y,width,time=0,reduced=false,soft=false,phase=0,layer='all',nozzleTopY,groundAnchor=FOUNTAIN_CALIBRATION.groundAnchor,spout=FOUNTAIN_CALIBRATION.spout,crestY=FOUNTAIN_CALIBRATION.crestY,basin=FOUNTAIN_CALIBRATION.basin}={}){
 if(!['back','front','all','nozzle'].includes(layer)||!validPoint(spout)||!validPoint(basin)||!Number.isFinite(crestY)||![basin.rx,basin.ry].every(n=>Number.isFinite(n)&&n>0&&n<1))return {streams:0,drops:0,ripples:0};
 if(!enter(c,{x,y,width,groundAnchor}))return {streams:0,drops:0,ripples:0};
 const alpha=c.globalAlpha,t=reduced?0:finite(time)+finite(phase),k=soft?.72:1;
 c.globalCompositeOperation='source-over';c.lineCap='round';c.lineJoin='round';
 let streams=0,drops=0,ripples=0;
 if(layer==='nozzle'){
  // Reconnect only the rising neck after the exact pedestal PNG occludes the
  // falling water. End just above its rear rim; never cross the high crystals.
  const top=bound(nozzleTopY??(crestY+(spout.y-crestY)*.65),crestY,spout.y);
  const points=[[spout.x,spout.y],[spout.x,top]];c.globalAlpha=alpha*.92;
  line(c,points,.055,P.blue);line(c,points,.038,P.cyan);
  if(!soft){c.globalAlpha=alpha*.60;line(c,points,.009,P.white);}
  c.restore();return {streams:1,drops:0,ripples:0};
 }
 if(layer!=='front'){
  // Base and shade, with a narrow emissive highlight. No haze or extra ground shadow.
  const rise=reduced?0:Math.sin(t*TAU/3.7)*.008*k,peak=crestY+rise;
  const jets=soft?[-1,1]:[-1,0,1];
  for(const side of jets){
   const start={x:spout.x+side*.012,y:spout.y},end={x:basin.x+side*basin.rx*.66,y:basin.y},q={x:spout.x+side*basin.rx*.42,y:2*(peak+Math.abs(side)*.045)-(start.y+end.y)*.5};
   const path=()=>{c.beginPath();c.moveTo(start.x,start.y);c.quadraticCurveTo(q.x,q.y,end.x,end.y);};
   c.globalAlpha=alpha*.92;path();c.strokeStyle=P.blue;c.lineWidth=side===0?.055:.040;c.stroke();
   path();c.strokeStyle=P.cyan;c.lineWidth=side===0?.038:.026;c.stroke();
   if(!soft){path();c.globalAlpha=alpha*.60;c.strokeStyle=P.white;c.lineWidth=.009;c.stroke();}
   streams++;
   if(!reduced){for(let i=0;i<(soft?2:3);i++){
    const u=mod(t*(.68+Math.abs(side)*.08)+i/3+side*.17,1),p=quadratic(start,q,end,u);
    c.globalAlpha=alpha*.8*k;ellipse(c,p.x,p.y,.012,.022,P.cyan);drops++;
   }}
  }
 }
 if(layer!=='back'){
  c.save();c.beginPath();c.ellipse(basin.x,basin.y,basin.rx,basin.ry,0,0,TAU);c.clip();
  for(let i=0;i<(soft?1:2);i++){
   const u=reduced?.45:mod(t*.65+i*.5,1),a=reduced?.40:(1-u)*.55;
   c.globalAlpha=alpha*a*k;c.beginPath();c.ellipse(basin.x,basin.y,basin.rx*(.16+.72*u),basin.ry*(.18+.60*u),0,0,TAU);c.strokeStyle=P.cyan;c.lineWidth=.012;c.stroke();ripples++;
  }
  if(!reduced&&!soft){for(const side of [-1,1]){
   const u=mod(t*1.25+(side+1)*.23,1),dy=-Math.sin(u*Math.PI)*basin.ry*.65;
   c.globalAlpha=alpha*(1-u)*.8;ellipse(c,basin.x+side*basin.rx*(.15+u*.30),basin.y+dy,.010,.015,P.cyan);drops++;
  }}
  c.restore();
 }
 c.restore();return {streams,drops,ripples};
}

function sparkle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.23,y-r*.23);c.lineTo(x+r,y);c.lineTo(x+r*.23,y+r*.23);c.lineTo(x,y+r);c.lineTo(x-r*.23,y+r*.23);c.lineTo(x-r,y);c.lineTo(x-r*.23,y-r*.23);c.closePath();c.fill();}

// Points supplied by the actual asset manifest. They are not a guessed orbit.
// The effect does not paint the star, crystals, faces, or any replacement sprite.
export function paintCrystalAccents(c,{x,y,width,time=0,reduced=false,soft=false,phase=0,groundAnchor={x:.5,y:1.02},points=[],kind='crystal'}={}){
 if(!Array.isArray(points)||!['crystal','star'].includes(kind)||!enter(c,{x,y,width,groundAnchor}))return 0;
 const alpha=c.globalAlpha,t=finite(time)+finite(phase),count=Math.min(points.length,soft?2:LOCAL_FX_LIMITS.sparkles);let drawn=0;
 c.globalCompositeOperation='source-over';
 for(let i=0;i<count;i++){
  const p=points[i];if(!validPoint(p))continue;
  const age=mod(t+i*1.39,5.6),level=reduced?(i===0?.42:0):age<.65?Math.sin(age/.65*Math.PI):0;
  if(level<=0)continue;
  c.globalAlpha=alpha*level*(soft?.55:.82);const r=bound(p.radius??.027,.012,.045)*(reduced?1:.68+.32*level);
  sparkle(c,p.x,p.y,r,kind==='star'?P.lemon:P.cyan);
  if(!soft){c.globalAlpha*=.75;sparkle(c,p.x,p.y,r*.36,P.white);}drawn++;
 }
 c.restore();return drawn;
}
