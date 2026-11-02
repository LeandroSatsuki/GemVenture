import {P} from './palette.js';

// Presentation-only pilot. The caller owns combat, clocks, pause and event truth.
export const RABBIT_SPECS=Object.freeze({
 boss:{bounds:{x:73,y:72,width:1138,height:1032},anchor:{x:750,y:1030},width:92,side:384},
 child:{bounds:{x:142,y:147,width:1015,height:987},anchor:{x:650,y:1050},width:42,side:256}
});
// New isolated imagegen body extension; source PNGs/head masks stay unchanged.
// Four-pixel margin around alpha>=128 bounds, without rewriting image pixels.
export const RABBIT_BODY_SPEC=Object.freeze({bounds:{x:241,y:287,width:713,height:810},anchor:{x:650,y:1093},side:256,displayWidth:23,headLift:16,soleY:-1});
// Original 1254px PNG coordinates. These are clips, not new/recolored art.
export const RABBIT_MASKS=Object.freeze({
 bossHead:[[440,557],[480,526],[480,0],[1254,0],[1254,790],[1116,790],[1112,899],[1059,938],[1005,960],[976,972],[924,963],[847,962],[744,991],[640,1005],[550,985],[505,968],[482,936],[420,906],[412,820],[421,722]],
 bossArm:[[0,0],[480,0],[480,526],[440,557],[421,722],[412,820],[366,812],[332,805],[321,833],[293,929],[263,1039],[0,1055]],
 carrotLeaves:[[0,0],[480,0],[480,500],[371,529],[320,529],[293,562],[228,542],[170,561],[0,560]],
 carrotRoot:[[0,680],[222,680],[273,692],[317,731],[335,807],[293,946],[262,1040],[0,1055]],
 childHead:[[249,731],[259,600],[317,529],[317,0],[1254,0],[1254,723],[1040,723],[1037,847],[1007,896],[958,938],[888,977],[827,991],[754,980],[651,1009],[578,1025],[469,997],[422,980],[403,943],[365,920],[298,908],[270,908],[258,860]],
 childHeadClean:[[277,728],[279,634],[296,584],[317,557],[317,0],[1254,0],[1254,590],[1045,623],[1045,723],[1037,847],[1007,896],[958,931],[888,965],[827,984],[754,974],[652,1000],[576,1000],[470,974],[418,950],[375,916],[307,903],[275,878]]
});
export const RABBIT_PIVOTS=Object.freeze({bossHead:[750,1000],bossArm:[421,791],bossCarrot:[252,620],childHead:[650,1000]});
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:0));
const ease=p=>p*p*(3-2*p);
function poly(c,points){c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.closePath();}
function sourceTransform(c,s,canvas){const b=s.bounds;c.scale(canvas.width/b.width,canvas.height/b.height);c.translate(-b.x,-b.y);}
function masked(image,s,makeCanvas,include,exclude=[]){
 const b=s.bounds,k=s.side/Math.max(b.width,b.height),canvas=makeCanvas(Math.ceil(b.width*k),Math.ceil(b.height*k)),c=canvas.getContext('2d');
 const mapped=points=>points.map(([x,y])=>[(x-b.x)*canvas.width/b.width,(y-b.y)*canvas.height/b.height]);
 c.save();if(include){poly(c,mapped(include));c.clip();}c.drawImage(image,b.x,b.y,b.width,b.height,0,0,canvas.width,canvas.height);c.globalCompositeOperation='destination-out';c.fillStyle=P.white;for(const p of exclude){poly(c,mapped(p));c.fill();}c.restore();return canvas;
}
function tint(source,makeCanvas){const v=makeCanvas(source.width,source.height),c=v.getContext('2d');c.drawImage(source,0,0);c.globalCompositeOperation='source-in';c.fillStyle=P.white;c.fillRect(0,0,v.width,v.height);return v;}
function eyePatch(c,image,{x,y,w,h,fromX=x,fromY}){c.drawImage(image,fromX,fromY,w,h,x,y,w,h);}
export function createRabbitRig({bossImage,childImage,bodyImage=null,makeCanvas}){
 for(const [name,img]of [['boss',bossImage],['child',childImage]])if((img?.naturalWidth||img?.width)!==1254||(img?.naturalHeight||img?.height)!==1254)throw new Error('Unexpected approved rabbit source dimensions: '+name);
 const m=RABBIT_MASKS,b=RABBIT_SPECS.boss,s=RABBIT_SPECS.child;
 const boss={source:masked(bossImage,b,makeCanvas),base:masked(bossImage,b,makeCanvas,null,[m.bossHead,m.bossArm]),head:masked(bossImage,b,makeCanvas,m.bossHead),arm:masked(bossImage,b,makeCanvas,m.bossArm,[m.carrotLeaves,m.carrotRoot])};
 boss.carrotLeaves=masked(bossImage,b,makeCanvas,m.carrotLeaves);boss.carrotRoot=masked(bossImage,b,makeCanvas,m.carrotRoot);
 boss.dazed=makeCanvas(boss.head.width,boss.head.height);const dc=boss.dazed.getContext('2d');dc.drawImage(boss.head,0,0);dc.save();sourceTransform(dc,b,boss.dazed);
 // Reuse nearby clean fur from the SAME PNG only under the two new eye marks.
 // This local face substitution needs human acceptance, especially at large zoom.
 eyePatch(dc,bossImage,{x:494,y:699,w:91,h:115,fromX:600,fromY:699});eyePatch(dc,bossImage,{x:714,y:797,w:125,h:78,fromY:710});
 dc.strokeStyle=P.ink;dc.lineWidth=17;dc.lineCap='round';for(const [x,y]of [[539,755],[775,833]]){dc.beginPath();dc.moveTo(x-20,y-22);dc.lineTo(x+20,y+22);dc.moveTo(x+20,y-22);dc.lineTo(x-20,y+22);dc.stroke();}dc.restore();
 for(const name of ['head','arm','carrotLeaves','carrotRoot','dazed'])boss[name+'Flash']=tint(boss[name],makeCanvas);
 const child={source:masked(childImage,s,makeCanvas),base:masked(childImage,s,makeCanvas,null,[m.childHead]),head:masked(childImage,s,makeCanvas,bodyImage?m.childHeadClean:m.childHead)};
 if(bodyImage){if((bodyImage.naturalWidth||bodyImage.width)!==1254||(bodyImage.naturalHeight||bodyImage.height)!==1254)throw new Error('Unexpected rabbit body extension dimensions');child.body=masked(bodyImage,RABBIT_BODY_SPEC,makeCanvas);}
 const canvases=[...Object.values(boss),...Object.values(child)];return {boss,child,canvasCount:canvases.length,pixels:canvases.reduce((n,v)=>n+v.width*v.height,0)};
}
export function rabbitPose({kind='boss',state='idle',progress=0,age=0,time=0,soft=false,confirmedDamage=0,hitDirection=1}={}){
 const p=clamp(progress),a=Math.max(0,Number.isFinite(age)?age:0),t=Number.isFinite(time)?time:0;
 const pose={state,headDy:soft?0:-.7*Math.sin(t*2.3),headDx:0,headAngle:0,armAngle:soft?0:.012*Math.sin(t*2.3+.7),carrotAngle:soft?0:.014*Math.sin(t*2.3+1),armDy:0,squash:0,sink:0,dazed:false,cubes:false,orbit:soft?0:t,flash:0};
 if(kind==='child'){pose.headDy=soft?0:-.45*Math.sin(t*2.5);if(state==='stunned'){pose.cubes=true;pose.sink=1.1;pose.headAngle=soft?0:.025*Math.sin(t*3);}return pose;}
 if(state==='windup'){const q=ease(clamp(p/.72));pose.armAngle=(soft?.19:.76)*q;pose.carrotAngle=(soft?-.02:-.10)*q;pose.armDy=(soft?-1:-3)*q;pose.headDy=soft?0:1.3*q;if(p>.72&&!soft)pose.armAngle+=Math.sin(a*39)*.012;}
 if(state==='slam'){const q=ease(clamp(p/.35)),settle=1-ease(clamp((p-.45)/.55));pose.armAngle=(soft?.19:.76)*(1-q)-(soft?.09:.28)*q*settle;pose.carrotAngle=.12*q*settle;pose.armDy=-3*(1-q)+2*q*settle;pose.squash=(soft?.015:.05)*Math.sin(Math.PI*p);pose.headDy=soft?0:1.3*settle;}
 if(state==='vulnerable'||state==='hit'){pose.dazed=true;pose.cubes=true;pose.sink=8;pose.headDy=0;pose.armAngle=-.12;pose.carrotAngle=.06;pose.armDy=3;}
 if(state==='recover'){pose.sink=8*(1-ease(p));pose.headDy=0;pose.armAngle=-.12*(1-p);pose.armDy=3*(1-p);}
 if(state==='hit'&&confirmedDamage>0&&a<.18){pose.flash=(soft?.10:.26)*Math.max(0,1-a/.16);pose.headDx=soft?0:-Math.sign(hitDirection||1)*1.2*Math.sin(Math.PI*a/.18);}
 return pose;
}
function setup(c,kind,x,y,width){const s=RABBIT_SPECS[kind],b=s.bounds,k=Math.min(width/b.width,width*.96/b.height);c.translate(x,y);c.scale(k,k);c.translate(-s.anchor.x,-s.anchor.y);return k;}
function drawSource(c,canvas,s){const b=s.bounds;c.drawImage(canvas,b.x,b.y,b.width,b.height);}
function around(c,p,angle,dy=0){c.translate(p[0],p[1]+dy);c.rotate(angle);c.translate(-p[0],-p[1]);}
export function paintRabbitBase(c,rig,{kind='boss',x=0,y=0,width=RABBIT_SPECS[kind].width,foreground=false}={}){
 const s=RABBIT_SPECS[kind];c.save();setup(c,kind,x,y,width);
 if(!foreground){c.globalAlpha=.28;c.fillStyle=P.ink;c.beginPath();c.ellipse(kind==='boss'?750:650,kind==='boss'?1037:1065,kind==='boss'?420:467,kind==='boss'?63:53,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 // Dark aperture extends behind the head; no uncovered transparent cut-out.
 c.fillStyle=P.coal;c.beginPath();c.ellipse(kind==='boss'?755:650,kind==='boss'?933:949,kind==='boss'?371:444,kind==='boss'?113:131,0,0,Math.PI*2);c.fill();}
 drawSource(c,rig[kind].base,s);c.restore();
}
export function paintRabbitHead(c,rig,{kind='boss',x=0,y=0,width=RABBIT_SPECS[kind].width,pose=rabbitPose({kind}),airborne=false}={}){
 const s=RABBIT_SPECS[kind],part=rig[kind];c.save();const k=setup(c,kind,x,y,width),unit=width/s.width/k;
 // Front lip occludes grounded lowering. Airborne children deliberately leave it.
 if(!airborne){c.beginPath();c.rect(-500,-1000,2400,2020);c.clip();}
 c.translate((pose.headDx||0)*unit,((pose.headDy||0)+(pose.sink||0))*unit);around(c,RABBIT_PIVOTS[kind==='boss'?'bossHead':'childHead'],pose.headAngle||0);
 if(pose.squash){const p=RABBIT_PIVOTS.bossHead;c.translate(...p);c.scale(1+pose.squash,1-pose.squash);c.translate(-p[0],-p[1]);}
 const name=kind==='boss'&&pose.dazed?'dazed':'head';drawSource(c,part[name],s);
 if((airborne||rig.child.body)&&kind==='child'){c.strokeStyle=P.ink;c.lineWidth=12;c.lineJoin='round';c.lineCap='round';c.beginPath();for(const [i,p]of [[296,584],[279,634],[277,728],[275,878],[307,903],[375,916],[418,950],[470,974],[576,1000],[652,1000],[754,974],[827,984],[888,965],[958,931],[1007,896],[1037,847],[1045,723],[1045,623]].entries())i?c.lineTo(...p):c.moveTo(...p);c.stroke();}
 if(pose.flash>0){c.globalAlpha=pose.flash;drawSource(c,part[name+'Flash'],s);}c.restore();
}
// Presentation envelope only; the integrator supplies real motim progress.
// First/last 12% rise/sink at the fixed burrow. Flight/contact timing stays caller-owned.
export function rabbitChildEmergence(progress){const p=clamp(progress);return ease(clamp(Math.min(p,1-p)/.12));}
export function paintRabbitChildFigure(c,rig,{x=0,y=0,width=42,pose=rabbitPose({kind:'child'}),airborne=false,tilt=0,emergence=airborne?1:0,burrowAnchor=null}={}){
 if(!rig?.child||airborne&&!rig.child.body||!(width>0)||![x,y,width,tilt,emergence].every(Number.isFinite))return false;
 if(burrowAnchor&&![burrowAnchor.x,burrowAnchor.y].every(Number.isFinite))return false;
 const b=RABBIT_BODY_SPEC,unit=width/42,reveal=airborne?clamp(emergence):0,ground=burrowAnchor||{x,y};c.save();
 // Clip in fixed ground coordinates BEFORE figure translation or tilt.
 // The original front lip is drawn by the caller after the figure.
 if(reveal<1){c.beginPath();c.rect(ground.x-120*unit,ground.y-180*unit,240*unit,178.8*unit);c.clip();}
 c.translate(x,y);if(airborne)c.rotate(tilt*reveal);
 if(reveal>0&&rig.child.body){const k=b.displayWidth*unit/b.bounds.width;c.drawImage(rig.child.body,(b.bounds.x-b.anchor.x)*k,(b.bounds.y-b.anchor.y)*k+(b.soleY+b.headLift*(1-reveal))*unit,b.bounds.width*k,b.bounds.height*k);}
 paintRabbitHead(c,rig,{kind:'child',x:0,y:rig.child.body?-b.headLift*reveal*unit:0,width,pose,airborne});c.restore();return true;
}
export function paintRabbitArm(c,rig,{x=0,y=0,width=92,pose=rabbitPose(),maxCarrotStretch=5.5}={}){
 const s=RABBIT_SPECS.boss;c.save();const k=setup(c,'boss',x,y,width),unit=width/92/k;around(c,RABBIT_PIVOTS.bossArm,pose.armAngle,pose.armDy*unit);
 const aim=rabbitCarrotAim({x,y,width,pose,maxCarrotStretch});
 c.save();around(c,RABBIT_PIVOTS.bossCarrot,aim.angle);drawSource(c,rig.boss.carrotLeaves,s);if(pose.flash){c.save();c.globalAlpha=pose.flash;drawSource(c,rig.boss.carrotLeavesFlash,s);c.restore();}
 // Rigid stem joins the original hand and carrot; no axial scaling.
 c.fillStyle=P.forest;c.fillRect(234,614,28,119);c.fillStyle=P.green;c.fillRect(234,614,12,119);
 drawSource(c,rig.boss.carrotRoot,s);if(pose.flash){c.globalAlpha=pose.flash;drawSource(c,rig.boss.carrotRootFlash,s);}c.restore();drawSource(c,rig.boss.arm,s);if(pose.flash){c.globalAlpha=pose.flash;drawSource(c,rig.boss.armFlash,s);}c.restore();
}
// Optional art-study reach target. NOT inferred from player/children in this rig.
// The mechanics/VFX integrator must provide a real locked impact before using it.
export function rabbitCarrotAim({x=0,y=0,width=92,pose,maxCarrotStretch=5.5}={}){
 const reach=clamp(pose.reach),fallback={angle:pose.carrotAngle,stretch:1};if(!pose.carrotTarget||!reach)return fallback;
 const s=RABBIT_SPECS.boss,k=Math.min(width/s.bounds.width,width*.96/s.bounds.height),unit=width/92/k,p=RABBIT_PIVOTS.bossArm,g=RABBIT_PIVOTS.bossCarrot;
 const tx=(pose.carrotTarget.x-x)/k+s.anchor.x-p[0],ty=(pose.carrotTarget.y-y)/k+s.anchor.y-p[1]-pose.armDy*unit,co=Math.cos(pose.armAngle),si=Math.sin(pose.armAngle);
 const dx=co*tx+si*ty+p[0]-g[0],dy=-si*tx+co*ty+p[1]-g[1],distance=Math.hypot(dx,dy);
 // Optional far-impact reach. Omitted/invalid/smaller limits keep V4 exactly.
 // The carrot is a rigid tool. Its range belongs to the impact telegraph/VFX,
 // never to an elongation of the painted model.
 const targetAngle=Math.atan2(dy,dx)-Math.atan2(393,-34);

 let delta=targetAngle-pose.carrotAngle;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;
 return {angle:pose.carrotAngle+delta*reach,stretch:1};
}
export function rabbitCubePositions({x,y,width=92,kind='boss',phase=0}={}){
 const scale=width/RABBIT_SPECS[kind].width,rx=(kind==='boss'?22:13)*scale,ry=(kind==='boss'?5:3)*scale;
 return [0,1,2].map(i=>{const a=phase*2.2+i*Math.PI*2/3;return {i,x:x+Math.cos(a)*rx,y:y+Math.sin(a)*ry,depth:Math.sin(a),size:(kind==='boss'?2.65:1.75)*scale};}).sort((a,b)=>a.depth-b.depth);
}
export function paintRabbitCubes(c,options,pass='all'){
 for(const p of rabbitCubePositions(options)){if(pass==='back'&&p.depth>=0||pass==='front'&&p.depth<0)continue;const {x,y,size:s}=p;c.save();c.lineJoin='round';c.lineWidth=.6*options.width/RABBIT_SPECS[options.kind||'boss'].width;c.strokeStyle=P.ink;
 for(const [points,color]of [[[[x,y-s],[x+s,y-s*.45],[x,y],[x-s,y-s*.45]],P.lemon],[[[x-s,y-s*.45],[x,y],[x,y+s],[x-s,y+s*.45]],P.yellow],[[[x,y],[x+s,y-s*.45],[x+s,y+s*.45],[x,y+s]],P.gold]]){poly(c,points);c.fillStyle=color;c.fill();c.stroke();}c.restore();}
}
export function paintRabbit(c,rig,{kind='boss',x=0,y=0,width=RABBIT_SPECS[kind].width,pose=rabbitPose({kind}),neutral=false,maxCarrotStretch=5.5}={}){
 if(!rig?.[kind]||!(width>0)||![x,y,width].every(Number.isFinite))return false;
 if(neutral){c.save();setup(c,kind,x,y,width);drawSource(c,rig[kind].source,RABBIT_SPECS[kind]);c.restore();return true;}
 paintRabbitBase(c,rig,{kind,x,y,width});const cubes={x:x+(kind==='boss'?7:0)*width/RABBIT_SPECS[kind].width,y:y-(kind==='boss'?73:37)*width/RABBIT_SPECS[kind].width,width,kind,phase:pose.orbit};
 if(pose.cubes)paintRabbitCubes(c,cubes,'back');
 if(kind==='boss'){paintRabbitArm(c,rig,{x,y,width,pose,maxCarrotStretch});paintRabbitHead(c,rig,{kind,x,y,width,pose});}else paintRabbitChildFigure(c,rig,{x,y,width,pose});paintRabbitBase(c,rig,{kind,x,y,width,foreground:true});if(pose.cubes)paintRabbitCubes(c,cubes,'front');return true;
}
// Presentation clock: caller must stop step() during pause/hidden; no Date/RAF use.
export function createRabbitClock(){let time=0;return {step(dt,{paused=false,hidden=false}={}){if(!paused&&!hidden)time+=clamp(dt,0,.1);return time;},get time(){return time;},restore(value=0){time=Math.max(0,Number.isFinite(value)?value:0);}};}
