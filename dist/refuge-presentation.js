import {P} from './palette.js';
const TAU=Math.PI*2,duration=2.6;
const smooth=t=>t*t*t*(t*(t*6-15)+10);
export function createRefugeHoverMotion(){
 let previous=false,wasReduced=false,start=null;
 return Object.freeze({sample(time,active,reduced=false){
  const now=Number.isFinite(time)?time:0;
  if(reduced){previous=!!active;wasReduced=true;start=null;return 0;}
  if(active&&(!previous||wasReduced)&&(start===null||now-start>=duration))start=now;
  previous=!!active;wasReduced=false;
  if(start===null)return 0;
  const u=Math.max(0,Math.min(1,(now-start)/duration));return u===1?0:TAU*smooth(u);
 }});
}

// The fire stays inside the approved forge doorway; building pixels are untouched.
export function paintForgeFire(c,{x,y,width,time=0,reduced=false,boost=0,r2=false}={}){
 if(![x,y,width,time].every(Number.isFinite)||width<=0)return;
 const t=reduced?0:time,flutter=reduced?0:r2?Math.sin(t*5.2)*.075+Math.sin(t*8.4)*.03+boost*.035:Math.sin(t*4.2)*.035+Math.sin(t*7.1)*.016;
 c.save();c.translate(x-width*.215,y-width*.335);c.scale(width/120,width/120);
 c.beginPath();c.moveTo(-10,1);c.lineTo(-10,-20);c.lineTo(4,-30);c.lineTo(13,-17);c.lineTo(13,9);c.closePath();c.clip();
 c.fillStyle=P.orange;c.beginPath();c.moveTo(-9,1);c.lineTo(-9,-10);c.lineTo(-3,-14);c.lineTo(1,-27*(1+flutter));c.lineTo(8,-17);c.lineTo(12,-5);c.lineTo(12,8);c.closePath();c.fill();
 c.fillStyle=P.yellow;c.beginPath();c.moveTo(-4,4);c.lineTo(-4,-8);c.lineTo(2,-16*(1+flutter));c.lineTo(7,-9);c.lineTo(8,6);c.closePath();c.fill();c.restore();
}
