import {captureSceneryEmission} from './scenery-emission-bridge.js';
import {GEODE_BODY} from './geode-body.js';
import {paintAngryEyes} from './geode-polish.js';
import {FAN,fanTiles,facing,combatLook} from './geode-fan.js';
import {SLAM} from './geode-slam-contract.js';
import {CROWN_ATLAS} from './geode-crown-atlas.js';
import {crownActive} from './geode-crown.js';
const critical=new Set(['idle-0','guard-0','guard-1','guard-2','guard-3','pillar-rise']);
const images=new Map(),pending=new Map(),effects=[];let order=0,ghost=null;
export const FAN_ANGLES=Object.freeze({SE:-45,S:0,SW:45});
export const visualLook=look=>look==='E'||look==='SE'?'SE':look==='W'||look==='SW'?'SW':'S';
export const MOTION=Object.freeze({turn:.28,fracture:.45,guard:SLAM.total,idle:1.5});
export function retainCrownArena(previous,room){return room&&(room===previous||room.enemies.some(crownActive))?room:null;}
const ease=t=>{t=clamp(t);return t<.5?4*t*t*t:1-(-2*t+2)**3/2;};
const clamp=x=>Math.max(0,Math.min(1,x));
export function loadCrownClip(key='idle-0'){
 if(images.has(key)){images.get(key).used=++order;return Promise.resolve(true);}if(pending.has(key))return pending.get(key);if(!CROWN_ATLAS[key])return Promise.resolve(false);
 const p=new Promise(resolve=>{const image=new Image();image.onload=async()=>{await image.decode?.();images.set(key,{image,used:++order});while(images.size>8){const victim=[...images].filter(([k])=>k!==key&&!critical.has(k)).sort((a,b)=>a[1].used-b[1].used)[0];if(!victim)break;images.delete(victim[0]);}resolve(true);};image.onerror=()=>resolve(false);image.src='./assets/geode-crown-test05/'+key+'.png';}).finally(()=>pending.delete(key));pending.set(key,p);return p;
}
export const loadGeodeCrownArt=()=>Promise.all([...critical].map(loadCrownClip));
export const crownCacheStatus=()=>({atlases:images.size,pending:pending.size,maxAtlases:8,decodedPixels:[...images.values()].reduce((n,v)=>n+v.image.naturalWidth*v.image.naturalHeight,0)});
export function resetCrownPresentation(){effects.length=0;ghost=null;}
export function slamPlan(b,phase){
 const w=b.windup,c=b.crown,pending=w?.crown&&phase>=w.beat-SLAM.anticipation&&phase<w.beat+SLAM.hold+SLAM.recovery?{at:w.beat,look:c.look,x:w.x,y:w.y}:null;
 const prior=c.slam&&phase>=c.slam.at-SLAM.anticipation&&phase<c.slam.at+SLAM.hold+SLAM.recovery?c.slam:null;const plan=prior||pending;if(!plan||phase<plan.at-SLAM.anticipation||phase>=plan.at+SLAM.hold+SLAM.recovery)return null;
 return {...plan,progress:clamp((phase-plan.at+SLAM.anticipation)/SLAM.total)};
}
export function crownFrame(b,phase,{soft=false}={}){
 if(phase<4)return {key:'idle-0',dir:'S',index:soft?0:Math.floor(phase/MOTION.idle*16)%16,spec:CROWN_ATLAS['idle-0']};
 const slam=slamPlan(b,phase);if(slam){const key='guard-'+b.crown.broken,spec=CROWN_ATLAS[key];return {key,dir:visualLook(slam.look),index:soft?(phase>=slam.at?SLAM.contactFrame:0):Math.min(spec.count-1,Math.floor(slam.progress*spec.count+1e-7)),spec};}
 const c=b.crown,elapsed=phase-c.started;let key='idle-'+Math.min(2,c.broken),progress=(phase%MOTION.idle)/MOTION.idle,dir=visualLook(c.look);
 if(phase-c.hitAt>=0&&phase-c.hitAt<MOTION.fracture){key='fracture-'+Math.max(1,c.broken);progress=(phase-c.hitAt)/MOTION.fracture;dir=visualLook(c.hitLook||c.previousLook||dir);}
 else if(c.stage==='open'){key='open';progress=clamp(elapsed/4);}
 else if(c.stage==='recover'){key='reform';progress=clamp(elapsed/2);}
 else if(c.stage==='cue'){
  const from=FAN_ANGLES[visualLook(c.previousLook)],to=FAN_ANGLES[dir],turnElapsed=phase-(c.turnAt??c.started);
  if(elapsed<0){dir=visualLook(c.previousLook||dir);progress=0;}
  else if(from!==to&&turnElapsed<MOTION.turn&&!soft){key='fan-sweep-'+Math.min(2,c.broken);progress=(from+(to-from)*ease(turnElapsed/MOTION.turn)+45)/90;dir='S';}
  else{key='cue-'+Math.min(2,c.broken);progress=clamp(elapsed/2);}
 }
 const spec=CROWN_ATLAS[key];return {key,dir,index:Math.min(spec.count-1,Math.floor((soft?0:Math.max(0,progress))*spec.count)),spec};
}
function sprite(c,b,x,y,phase,soft=false,override=null){let f=override||crownFrame(b,phase,{soft});void loadCrownClip(f.key);let ready=images.get(f.key);if(!ready){const key=['guard-'+b.crown.broken,'fracture-'+b.crown.broken,'idle-'+Math.min(2,b.crown.broken),'idle-0'].find(k=>images.has(k));if(!key)return false;ready=images.get(key);f={key,dir:visualLook(b.crown.look),index:CROWN_ATLAS[key].count-1,spec:CROWN_ATLAS[key]};}ready.used=++order;
 const spec=f.spec,fw=spec.frameWidth,fh=spec.frameHeight,row=spec.directions.indexOf(f.dir),flat=row*spec.count+f.index,sx=flat%spec.columns*fw,sy=Math.floor(flat/spec.columns)*fh,scale=.82;
 c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const rect=[x-spec.pivotX/2*scale,y-spec.pivotY/2*scale,fw/2*scale,fh/2*scale];c.drawImage(ready.image,sx,sy,fw,fh,...rect);captureSceneryEmission(c,'occluder',[ready.image,sx,sy,fw,fh,...rect]);captureSceneryEmission(c,'boss-atlas',{image:ready.image,sourceRect:[sx,sy,fw,fh],rect,index:0,anchor:{x,y},alpha:c.globalAlpha});paintAngryEyes(c,x,y,f);c.restore();return true;
}
export function paintCrownArt(c,b,x,y,phase,soft=false){
 c.save();c.fillStyle='#132233';c.globalAlpha=.43;c.beginPath();c.ellipse(x,y+2,29,10,0,0,Math.PI*2);c.fill();c.restore();
 const result=sprite(c,b,x,y,phase,soft),k=Math.min(2,b.crown.broken),f=crownFrame(b,phase,{soft});
 if(f.key.startsWith('fan-'))void loadCrownClip('cue-'+k);
 else if(f.key.startsWith('fracture-'))void loadCrownClip('fan-sweep-'+k);
 else if(b.crown.stage==='cue'||b.crown.stage==='fracture'){void loadCrownClip('fracture-'+(k+1));if(b.crown.until-phase<.7)void loadCrownClip('guard-'+k);}
 if(b.crown.stage==='open')void loadCrownClip('reform');return result;
}
export function acceptCrownEvents(events,b,phase){for(const e of events){if(['geodeCrownFracture','geodeCrownSlam','geodeCrownRearPulse'].includes(e.type)&&!effects.some(x=>x.id===e.id))effects.push({...e,phase:e.beat});if(e.type==='bossDefeated'&&b?.crown){ghost={b:{...b,crown:{...b.crown}},phase};void loadCrownClip('defeat');}}while(effects.length>12)effects.shift();}
const point=(x,y)=>({x:(100+x*44+y*4)/2,y:(115+y*32)/2});
function glow(c,x,y,r,alpha,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.save();c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
export function paintCrownGround(c,b,phase,soft=false){
 const state=b.crown,center=point(b.x,b.y),v={W:[-1,0],E:[1,0],N:[0,-1],S:[0,1]}[state.side],p=point(b.x+v[0]*GEODE_BODY.reach,b.y+v[1]*GEODE_BODY.reach),open=state.stage==='open'&&phase>=state.started,pulse=soft?1:.65+.35*Math.cos((phase-Math.floor(phase))*Math.PI*2);
 const w=b.windup;
 if(w?.crown&&w.pillarLocked&&phase>=w.startedBeat&&phase<w.beat){const u=clamp((phase-w.startedBeat)/(w.beat-w.startedBeat));c.save();c.fillStyle='#f27f72';c.strokeStyle='#ffd95a';c.lineWidth=1;for(const tile of w.tiles){const p=point(tile.x,tile.y);c.globalAlpha=.035+.035*u;cellPath(c,p);c.fill();if(tile.ring===0){c.globalAlpha=.45+.35*u;cellPath(c,p);c.stroke();}}c.restore();fanArc(c,b,w.aim||w.waveLook,FAN.inner-.15,'#ffd95a',.75);fanSides(c,b,w.aim||w.waveLook,.45);}
 // The travelling crest itself is the visual trace; no blue guide arc.
 // A persistent segmented rear boundary explains the recurring repulsion.
 const look=combatLook(b,phase);fanArc(c,b,look,1.65,'#8394a6',.35,true);
 for(const e of effects){if(e.type!=='geodeCrownRearPulse'||e.sourceId!==b.id)continue;const age=phase-e.phase;if(age<0||age>.8)continue;fanArc(c,b,e.look,1.7+age*(soft?1:4),'#2fbfcd',(1-age/.8)*.85,true);if(!soft)fanArc(c,b,e.look,1.3+age*4,'#8394a6',(1-age/.8)*.5,true);}
 for(const e of effects){if(e.type!=='geodeCrownSlam'||e.sourceId!==b.id)continue;const age=phase-e.phase;if(age<0||age>.45)continue;const root=point(e.x,e.y),target=point(e.targetX,e.targetY);for(const side of [-1,1]){const hand=handSocket(e.look,side),x=root.x+hand.x,y=root.y+hand.y;c.save();c.globalAlpha=(1-age/.45)*.8;c.strokeStyle='#8394a6';c.lineWidth=1.5;for(let i=0;i<(soft?4:8);i++){const a=i*Math.PI/4,r=5+age*22;c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.45);c.lineTo(x+Math.cos(a)*(r+5),y+Math.sin(a)*(r+5)*.45);c.stroke();}c.restore();}glow(c,target.x,target.y,21,Math.max(0,1-age/.2)*.5,'#2fbfcd');}

 if(state.stage==='cue'||state.stage==='fracture'){
  glow(c,p.x,p.y,23,.20*pulse,'#2fbfcd');c.save();c.strokeStyle='#2fbfcd';c.lineWidth=1.8;c.lineJoin='round';c.beginPath();c.moveTo(p.x-10,p.y-4);c.lineTo(p.x-3,p.y-7);c.lineTo(p.x+2,p.y-1);c.lineTo(p.x+9,p.y-5);c.lineTo(p.x+5,p.y+5);c.stroke();
  const socket=targetSocket(b,phase,soft);c.globalAlpha=.5;c.setLineDash([3,4]);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(center.x+socket.x,center.y+socket.y);c.stroke();c.restore();
 }
 if(open){glow(c,center.x,center.y-43,24,.12*pulse,'#2fbfcd');if(!soft){c.save();c.globalAlpha=.28;c.strokeStyle='#2fbfcd';c.lineWidth=1;c.beginPath();c.ellipse(center.x,center.y,30+2*pulse,12+pulse,0,0,Math.PI*2);c.stroke();c.restore();}}
}
export function handSocket(look,side){const a=(90+FAN_ANGLES[visualLook(look)])*Math.PI/180,f=SLAM.handForward,s=SLAM.handSide*side,x=f*Math.cos(a)-s*Math.sin(a),y=f*Math.sin(a)+s*Math.cos(a);return{x:(x+y*4/44)*.82,y:y*32/44*.82};}
export function paintCrownPillar(c,n,x,y,phase,soft=false){const key='pillar-rise',ready=images.get(key);if(!ready){void loadCrownClip(key);return;}ready.used=++order;const s=CROWN_ATLAS[key],age=phase-n.born;if(age<0||phase>=n.until)return;const envelope=n.crownWave?clamp(age<SLAM.rise?age/SLAM.rise:(n.until-phase)/(FAN.crestLife-SLAM.rise)):clamp(age/SLAM.rise),index=soft?s.count-1:Math.min(s.count-1,Math.floor(envelope*(s.count-1)+1e-7)),fw=s.frameWidth,fh=s.frameHeight,scale=n.crownWave?.48:.82;c.save();c.globalAlpha=n.crownWave?clamp((n.until-phase)/.18):clamp((n.until-phase)/.35);c.drawImage(ready.image,index%s.columns*fw,Math.floor(index/s.columns)*fh,fw,fh,x-s.pivotX/2*scale,y-s.pivotY/2*scale,fw/2*scale,fh/2*scale);c.restore();}
function cellPath(c,p){c.beginPath();c.moveTo(p.x-12,p.y-8);c.lineTo(p.x+10,p.y-8);c.lineTo(p.x+12,p.y+8);c.lineTo(p.x-10,p.y+8);c.closePath();}
function fanArc(c,b,look,radius,color,alpha,rear=false){const f=facing(look),a=rear?-Math.PI/2:Math.atan2(f.y,f.x),low=rear?-Math.PI:Math.max(0,a-FAN.halfAngle),high=rear?0:Math.min(Math.PI,a+FAN.halfAngle);c.save();c.strokeStyle=color;c.lineWidth=rear?1.5:2.1;c.globalAlpha=alpha;if(rear)c.setLineDash([3,4]);c.beginPath();for(let i=0;i<=32;i++){const angle=low+i/32*(high-low),p=point(b.x+Math.cos(angle)*radius,b.y+Math.sin(angle)*radius);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();c.restore();}
function fanSides(c,b,look,alpha){const f=facing(look),a=Math.atan2(f.y,f.x);c.save();c.strokeStyle='#ffd95a';c.lineWidth=1;c.globalAlpha=alpha;c.setLineDash([4,5]);for(const sign of [-1,1]){const angle=Math.max(0,Math.min(Math.PI,a+sign*FAN.halfAngle)),p=point(b.x+Math.cos(angle)*FAN.inner,b.y+Math.sin(angle)*FAN.inner),q=point(b.x+Math.cos(angle)*(FAN.outer-.2),b.y+Math.sin(angle)*(FAN.outer-.2));c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke();}c.restore();}
export function crownSocket(look='S',index=0){const a=(90+(typeof look==='number'?look:FAN_ANGLES[visualLook(look)]))*Math.PI/180,side=[0,-22,22][index],f=[-4,4,4][index],wx=f*Math.cos(a)-Math.sin(a)*side,wy=f*Math.sin(a)+Math.cos(a)*side,z=index===0?64.5:57.5;return{x:(wx+wy*4/44)*.82,y:(wy*32/44-z)*.82};}
function targetSocket(b,phase,soft){const f=crownFrame(b,phase,{soft}),look=f.key.startsWith('fan-')?-45+f.index/(f.spec.count-1)*90:f.dir;return crownSocket(look,Math.min(2,b.crown.broken));}
function shard(c,x,y,size,angle){c.save();c.translate(x,y);c.rotate(angle);const face=(points,color)=>{c.fillStyle=color;c.strokeStyle='#245473';c.lineWidth=.8;c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px*size,py*size):c.moveTo(px*size,py*size));c.closePath();c.fill();c.stroke();};face([[-.55,-.25],[0,-.8],[.55,-.25],[0,.1]],'#2fbfcd');face([[-.55,-.25],[0,.1],[0,.8],[-.55,.38]],'#287cb8');face([[0,.1],[.55,-.25],[.55,.38],[0,.8]],'#245473');c.restore();}
export function paintCrownAir(c,b,phase,soft=false){
 const state=b.crown;if((state.stage==='cue'||state.stage==='fracture')&&phase>=state.started&&state.broken<3){const p=point(b.x,b.y),s=targetSocket(b,phase,soft),x=p.x+s.x,y=p.y+s.y,color='#2fbfcd';glow(c,x,y,13,soft?.12:.12+.08*Math.cos(phase*Math.PI*2),color);c.save();c.strokeStyle=color;c.lineWidth=1.25;for(const sign of [-1,1]){c.beginPath();c.moveTo(x+sign*10,y-6);c.lineTo(x+sign*13,y-3);c.lineTo(x+sign*13,y+3);c.stroke();}c.restore();}
 for(const e of effects){if(e.type!=='geodeCrownFracture')continue;const age=phase-e.phase;if(age<0||age>1.4||e.sourceId!==b.id)continue;const origin=point(e.x,e.y),socket=crownSocket(e.look,e.plateIndex||0),x=origin.x+socket.x,y=origin.y+socket.y;
  glow(c,x,y,soft?15:26,Math.max(0,1-age/.32)*.55,'#2fbfcd');c.save();c.globalAlpha=1-clamp((age-.85)/.55);
  const sign=e.plateIndex===1?-1:1;shard(c,x+sign*age*(soft?5:75),y+age*15-(soft?0:6)*Math.sin(Math.min(1,age/1.4)*Math.PI)+age*age*10,13-e.plateIndex*1.4,soft?0:sign*age*2.8);
  if(!soft)for(let i=0;i<3;i++)shard(c,x+Math.cos(i*2.4+e.broken)*age*34,y-age*20+Math.sin(i*2.4)*age*14+age*age*20,3.4-i*.55,age*(i+1));
  c.lineWidth=1.5;for(let i=0;i<(soft?4:17);i++){const a=i*2.399+e.broken*.8,r=8+age*(22+(i%4)*9),px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.65+age*age*18;c.strokeStyle=i%3?'#2fbfcd':'#c4ccc7';c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(a)*5,py-Math.sin(a)*4);c.stroke();}c.restore();
 }
}
export function paintCrownGhost(c,phase,soft=false){if(!ghost)return;const age=phase-ghost.phase;if(age<0||age>2){ghost=null;return;}const p=point(ghost.b.x,ghost.b.y),spec=CROWN_ATLAS.defeat;c.save();c.globalAlpha=1-clamp((age-1.2)/.8);sprite(c,ghost.b,p.x,p.y,phase,soft,{key:'defeat',dir:visualLook(ghost.b.crown.look),index:Math.min(spec.count-1,Math.floor(age/2*spec.count)),spec});c.restore();}
