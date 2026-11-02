import {captureSceneryEmission} from './scenery-emission-bridge.js';
import {geodeArticulation,createGeodeLimbs,paintGeodeLimbs} from './geode-articulation.js';
// Isolated presentation study. No gameplay events, damage, radius or save schema.
export const GEODE_SPEC=Object.freeze({bounds:{x:37,y:128,width:1178,height:1001},anchor:{x:620,y:1060},cacheSide:384,width:75});
export const GEODE_MASKS=Object.freeze({
 A:[[487,482],[585,510],[698,543],[740,589],[745,657],[687,717],[425,650],[402,562],[443,502]],
 B:[[625,148],[718,165],[734,189],[733,253],[683,288],[595,272],[573,246],[573,188]]
});
export const GEODE_CHEST_PATCH=[[479,447],[585,479],[703,514],[771,579],[781,677],[693,752],[412,674],[380,561],[432,483]];
// Foot contacts are authored in the original sprite, not at the bitmap bottom.
// The rear/left foot and front/right foot sit on different projected ground rows.
export const GEODE_CONTACTS=Object.freeze([
 Object.freeze({x:475,y:990,rx:120,ry:30}),
 Object.freeze({x:745,y:1118,rx:124,ry:30})
]);
export const GEODE_GROUND=Object.freeze({slope:128/270,sourceY:990+(620-475)*128/270});
export function paintGeodeContactShadow(c,{x,y,width=75}={}){
 const k=width/GEODE_SPEC.bounds.width,a=GEODE_SPEC.anchor;
 c.save();c.fillStyle='#180d2f';c.globalAlpha=.40;
 for(const foot of GEODE_CONTACTS){c.beginPath();c.ellipse(x+(foot.x-a.x)*k,y+(foot.y-a.y)*k,foot.rx*k,foot.ry*k,0,0,Math.PI*2);c.fill();}
 c.restore();
}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
export function geodePose({state='idle',progress=0,age=0,ambient=0,soft=false,confirmedDamage=0,hitDirection=1}={}){
 const p=clamp(progress),t=Math.max(0,age),pose={dx:0,dy:0,sx:1,sy:1,breath:soft?0:(.5-.5*Math.cos(ambient*Math.PI*2/2.8))*.04,flash:0};
 pose.motion=geodeArticulation({state,progress,age,ambient,soft});
 if(soft)return pose;
 if(state==='pillar-charge'){
  const end=clamp((p-.82)/.18);pose.dx=Math.sin(age*47)*.4*p;pose.dy=-3*Math.sin(end*Math.PI);pose.sx=1-.025*Math.sin(end*Math.PI);pose.sy=1+.035*Math.sin(end*Math.PI);
 }
 if(state==='pillar-impact'){const k=clamp(1-t/.22);pose.sx=1+.08*k;pose.sy=1-.10*k;}
 if(state==='pulse-charge'){pose.sx=1-.055*p;pose.sy=1+.085*p;}
 if(state==='pulse-impact'){const k=clamp(1-t/.26);pose.sx=1+.11*k;pose.sy=1-.13*k;}
 if(state==='hit'&&confirmedDamage>0&&t<.18){pose.dx=-Math.sign(hitDirection||1)*1.4*Math.sin(Math.PI*t/.18);pose.flash=t<.10?.22*(1-t/.10):0;}
 return pose;
}
export function createGeodeRig(image,makeCanvas,{chestImage=null}={}){
 const s=GEODE_SPEC,b=s.bounds,k=s.cacheSide/b.width,body=makeCanvas(s.cacheSide,Math.ceil(b.height*k));body.getContext('2d').drawImage(image,b.x,b.y,b.width,b.height,0,0,body.width,body.height);
 if(chestImage){const c=body.getContext('2d');c.save();c.beginPath();GEODE_CHEST_PATCH.forEach(([x,y],i)=>{const px=(x-b.x)*body.width/b.width,py=(y-b.y)*body.height/b.height;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();c.clip();c.globalCompositeOperation='source-atop';c.drawImage(chestImage,b.x,b.y,b.width,b.height,0,0,body.width,body.height);c.restore();}
 const flash=makeCanvas(body.width,body.height),f=flash.getContext('2d');f.drawImage(body,0,0);f.globalCompositeOperation='source-in';f.fillStyle='#ffffff';f.fillRect(0,0,flash.width,flash.height);
 const articulated=createGeodeLimbs(body,makeCanvas,s);
 return {body,flash,...articulated,pixels:body.width*body.height*5};
}
export function paintGeodeRig(c,rig,{x,y,width=75,variant='A',pose=geodePose(),shadow=true}={}){
 const s=GEODE_SPEC,b=s.bounds,k=width/b.width,left=(b.x-s.anchor.x)*k,top=(b.y-s.anchor.y)*k,height=b.height*k,ground=(GEODE_GROUND.sourceY-s.anchor.y)*k;
 if(shadow)paintGeodeContactShadow(c,{x,y,width});
 // Squash around the projected sole line, keeping both feet on the same plane.
 // Logical anchor is unchanged; only an explicit attack pose can lift the body.
 c.save();
 if(pose.sx===1&&pose.sy===1){const foot=(b.y+b.height-s.anchor.y)*k;c.translate(x+pose.dx*width/75,y+foot+pose.dy*width/75);c.scale(1,1);c.translate(0,-foot);}
 else{c.translate(x+pose.dx*width/75,y+ground+pose.dy*width/75);c.transform(pose.sx,GEODE_GROUND.slope*(pose.sx-pose.sy),0,pose.sy,0,0);c.translate(0,-ground);}
 const motion=pose.motion||geodeArticulation({soft:true});
 c.translate(0,motion.lift*width/75);c.rotate(motion.lean);
 paintGeodeLimbs(c,rig,{spec:s,left,top,width,height,k,motion});
 if(pose.breath>0){
  c.save();c.globalCompositeOperation='source-atop';c.beginPath();GEODE_MASKS[variant].forEach(([px,py],i)=>{const ax=(px-s.anchor.x)*k,ay=(py-s.anchor.y)*k;i?c.lineTo(ax,ay):c.moveTo(ax,ay);});c.closePath();c.clip();
  const pivot=(variant==='A'?717:288)-s.anchor.y;c.translate(0,pivot*k);c.scale(1,1+pose.breath);c.translate(0,-pivot*k);c.drawImage(rig.body,left,top,width,height);c.restore();
 }
 if(pose.flash>0){c.save();c.globalAlpha=pose.flash;c.drawImage(rig.flash,left,top,width,height);c.restore();}
 c.restore();captureSceneryEmission(c,'boss-source',{index:0,anchor:{x:x+(pose.dx||0)*width/75,y:y+((pose.dy||0)+(motion.lift||0))*width/75},alpha:c.globalAlpha});
}
// Event consumer must pass only confirmed damage and deduplicate by boss + beat.
// This minimal gate has no mechanical authority and is reset on room/restore.
export function createGeodeHitGate(){let last=null;return {accept({bossId,bossIndex,beat,damage}){if(bossIndex!==0||!Number.isInteger(bossId)||bossId<0||!(damage>0)||!Number.isFinite(damage)||!Number.isInteger(beat))return false;const key=bossId+':'+beat;if(last===key)return false;last=key;return true;},reset(){last=null;}};}
