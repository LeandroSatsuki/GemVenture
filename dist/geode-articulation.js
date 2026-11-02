import {captureSceneryEmission} from './scenery-emission-bridge.js';
// Articulated presentation of the existing Geode pixels. No new boss model,
// clock, damage, attack radius, camera transform or simulation randomness.
export const GEODE_LIMBS=Object.freeze([
 {id:'left',pivot:[407,409],points:[[146,425],[208,329],[395,226],[433,261],[445,344],[406,475],[362,566],[345,630],[372,703],[374,788],[340,872],[286,918],[126,897],[35,849],[35,724],[91,653],[145,590]]},
 {id:'right',pivot:[870,522],points:[[896,393],[969,348],[1108,371],[1176,430],[1190,517],[1163,592],[1125,633],[1157,672],[1212,737],[1218,843],[1170,928],[1071,1078],[999,1110],[884,1084],[861,1043],[788,1025],[768,994],[768,890],[853,807],[890,724],[913,645],[852,600],[848,500]]}
]);
const clamp=n=>Math.max(0,Math.min(1,n));
export function geodeArticulation({state='idle',progress=0,age=0,ambient=0,soft=false}={}){
 const out={left:0,right:0,lift:0,lean:0,core:0};if(soft)return out;
 const p=clamp(progress),wave=Math.sin(ambient*1.55);
 out.left=.028*wave;out.right=-.024*Math.sin(ambient*1.55+.65);out.lean=.009*wave;
 if(state==='pillar-charge'||state==='pulse-charge'){
  const raise=p*p*(3-2*p),pulse=state==='pulse-charge';
  out.left=(pulse?.60:.48)*raise;out.right=-(pulse?.60:.70)*raise;
  out.lift=-2.2*raise;out.lean=pulse?0:-.025*raise;out.core=raise;
 }
 if(state==='pillar-impact'||state==='pulse-impact'){
  // Release at the actual impact, then settle. Never anticipate a hit event.
  const settle=Math.exp(-age*10),rebound=Math.sin(age*24)*settle;
  out.left=-.17*settle+.08*rebound;out.right=.18*settle-.08*rebound;
  out.lift=2*settle;out.lean=.018*rebound;out.core=settle;
 }
 return out;
}
export function createGeodeLimbs(body,makeCanvas,spec){
 const {bounds:b}=spec,sx=body.width/b.width,sy=body.height/b.height;
 const trace=(c,part)=>{c.beginPath();part.points.forEach(([x,y],i)=>i?c.lineTo((x-b.x)*sx,(y-b.y)*sy):c.moveTo((x-b.x)*sx,(y-b.y)*sy));c.closePath();};
 const torso=makeCanvas(body.width,body.height),tc=torso.getContext('2d');tc.drawImage(body,0,0);
 const limbs=GEODE_LIMBS.map(part=>{const bitmap=makeCanvas(body.width,body.height),c=bitmap.getContext('2d');c.save();trace(c,part);c.clip();c.drawImage(body,0,0);c.restore();tc.save();tc.globalCompositeOperation='destination-out';trace(tc,part);tc.fill();tc.restore();return {...part,bitmap};});
 return {torso,limbs,pixels:body.width*body.height*3};
}
export function paintGeodeLimbs(c,rig,{spec,left,top,width,height,k,motion}){
 // The original fist occludes the outer half of the front boot. Complete only
 // that hidden support, underneath the untouched source pixels, when raised.
 const patch=(pts,fill)=>{c.beginPath();pts.forEach(([u,v],i)=>{const x=(u-spec.anchor.x)*k,y=(v-spec.anchor.y)*k;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.fillStyle=fill;c.fill();};
 patch([[683,974],[764,966],[909,1039],[908,1097],[748,1134],[618,1076],[617,1020]],'#271b3b');
 patch([[685,985],[761,978],[894,1045],[747,1085],[632,1025]],'#8394a6');
 patch([[632,1025],[747,1085],[747,1120],[632,1068]],'#5c627d');
 patch([[747,1085],[894,1045],[894,1088],[747,1120]],'#374252');
 // Joint sockets sit under both layers and stay inside the shoulder volume.
 for(const part of rig.limbs){const [u,v]=part.pivot,x=(u-spec.anchor.x)*k,y=(v-spec.anchor.y)*k;c.fillStyle='#5c627d';c.beginPath();c.ellipse(x,y,68*k,73*k,0,0,Math.PI*2);c.fill();}
 c.drawImage(rig.torso,left,top,width,height);captureSceneryEmission(c,'occluder',[rig.torso,left,top,width,height]);captureSceneryEmission(c,'boss-raster',{index:0,image:rig.torso,rect:[left,top,width,height],alpha:c.globalAlpha});
 for(const part of rig.limbs){const [u,v]=part.pivot,x=(u-spec.anchor.x)*k,y=(v-spec.anchor.y)*k;c.save();c.translate(x,y);c.rotate(motion[part.id]);c.translate(-x,-y);c.drawImage(part.bitmap,left,top,width,height);captureSceneryEmission(c,'occluder',[part.bitmap,left,top,width,height]);captureSceneryEmission(c,'boss-raster',{index:0,image:part.bitmap,rect:[left,top,width,height],alpha:c.globalAlpha});c.restore();}
}
