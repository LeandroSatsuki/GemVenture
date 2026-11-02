import {P} from './palette.js';
import {caveGroundPath} from './cave-depth.js';
export const STAGES=Object.freeze([
 {at:5,name:'Faísca',shape:'shard',count:4,reach:38},
 {at:10,name:'Dueto',shape:'double',count:6,reach:46},
 {at:15,name:'Cadência',shape:'bar',count:8,reach:54},
 {at:20,name:'Ressonância',shape:'echo',count:10,reach:62},
 {at:50,name:'Prisma',shape:'prism',count:12,reach:76},
 {at:100,name:'Contratempo',shape:'weave',count:14,reach:90},
 {at:250,name:'Apogeu',shape:'crystal',count:16,reach:103},
 {at:500,name:'Encore',shape:'constellation',count:18,reach:112}
].map(Object.freeze));
export const LIMITS=Object.freeze({resident:18,accent:12,softResident:4});
// Legacy filename/public projection helper retained; the active look is the approved progression.
export const COMBO_DISCO=Object.freeze({start:5,saturation:500,maxSpots:18,maxParticles:12,flashBeats:1.6,colors:[P.blue,P.cyan,P.pink,P.lemon]});
export function discoLightQuad(p,{size=1,wallSlope=null}={}){
 const s=p.scale*size,a=p.angle,co=Math.cos(a),si=Math.sin(a);
 return [[-s,-s],[s,-s],[s,s],[-s,s]].map(([x,y])=>{const u=x*co-y*si,v=x*si+y*co;return wallSlope==null?[p.x+u+v/11,p.y+v*8/11]:[p.x+u,p.y-14+u*wallSlope+v];});
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return((n^n>>>16)>>>0)/4294967296;};
export function sampleComboDisco({combo=0,player={x:0,y:0},beat=0,seed=0,soft=false,cleared=false,memory={}}={}){
 const valid=Number.isFinite(combo)&&Number.isFinite(beat)&&Number.isFinite(player.x)&&Number.isFinite(player.y);
 if(!valid||cleared||combo<5){memory.seed=seed;memory.combo=valid?combo:0;memory.entry=null;return null;}
 const stage=STAGES.findLast(s=>combo>=s.at),index=STAGES.indexOf(stage),context=memory.seed===seed&&Number.isFinite(memory.combo),previous=context?memory.combo:combo;
 if(combo<previous||beat<(memory.beat??beat))memory.entry=null;
 if(combo>previous){const crossed=STAGES.filter(s=>s.at>previous&&s.at<=combo);if(crossed.length)memory.entry={beat,major:true,at:crossed.at(-1).at};else if(Math.floor(combo/5)>Math.floor(previous/5))memory.entry={beat,major:false,at:Math.floor(combo/5)*5};}
 if(!context)memory.entry=null;memory.seed=seed;memory.combo=combo;memory.beat=beat;
 let entry=memory.entry;const age=entry?Math.max(0,beat-entry.beat):Infinity,envelope=age<1.6?(1-age/1.6)**1.6:0;
 if(!envelope){memory.entry=null;entry=null;}
 const snapped=Math.abs(beat-Math.round(beat))<1e-8?Math.round(beat):beat,phase=((snapped%1)+1)%1,pulse=soft?0:Math.max(0,1-phase/.45)**3,origin={x:player.x/2,y:player.y/2},key=Number(seed)>>>0;
 const count=soft?Math.min(LIMITS.softResident,stage.count):stage.count;
 const colors=index<4?[P.blue,P.cyan]:index<6?[P.cyan,P.pink,P.blue]:[P.cyan,P.lemon,P.blue];
 const spots=Array.from({length:count},(_,i)=>{const rnd=hash(key^Math.imul(i+1,193939)),angle=i*2.399963+hash(i+key)*.35+(soft?0:beat*Math.PI/64),reach=24+Math.sqrt(rnd)*stage.reach;
  let x=Math.cos(angle)*reach,y=Math.sin(angle)*reach*.56;
  if(!soft&&stage.shape==='double'){const side=i%2?1:-1;x=side*(25+Math.floor(i/2)*15);y=(Math.floor(i/2)-1)*17+Math.sin(beat*Math.PI/4+side)*5;}
  if(!soft&&stage.shape==='bar'){x=(i-3.5)*15;y=x*.23+Math.sin(beat*Math.PI/4+i*.7)*8;}
  if(!soft&&stage.shape==='echo'){const breath=1+Math.sin(beat*Math.PI/4)*.08;x*=breath;y*=breath;}
  if(!soft&&stage.shape==='prism'){x+=(Math.sin(beat*Math.PI/8+i*.5))*9;y+=Math.sin(beat*Math.PI/8+i*.5)*3;}
  if(!soft&&stage.shape==='weave'){x=(i/2-3.25)*23;y=Math.sin(x/37+beat*Math.PI/4+(i%2)*Math.PI)*27;}
  if(!soft&&stage.shape==='crystal')y+=Math.sin(beat*Math.PI/8+i)*9;
  const groupPulse=pulse;
  return{x:origin.x+x,y:origin.y+y,angle:angle+(soft?0:Math.sin(beat*Math.PI/8+i)*.1),scale:3.7+index*.23+rnd*1.4,color:colors[i%colors.length],alpha:soft?.18:.20+.22*groupPulse,shape:stage.shape};});
 const accents=soft?[]:Array.from({length:entry?(entry.major?12:4):0},(_,i)=>{const angle=i*Math.PI*2/(entry.major?12:4)+.17,reach=18+age*(entry.major?35:17);return{x:origin.x+Math.cos(angle)*reach,y:origin.y+Math.sin(angle)*reach*.56,angle,scale:entry.major?4.1:2.8,color:colors[i%colors.length],alpha:envelope*(entry.major?.6:.32),shape:index>=4?'prism':stage.shape};});
 return {stage,index,origin,spots,accents,pulse,beat:snapped,beatIndex:Math.floor(snapped),phase,entry:entry?{...entry,age,envelope}:null,soft,energy:.12+index*.035};
}

// Musical energy is kept close to the feet. No tiled marks or thirds-of-a-beat flashes.
export function comboPulseGeometry(frame){
 if(!frame)return null;const level=frame.index,soft=frame.soft,phase=soft?0:frame.phase;
 return{signature:['single','paired','echo','flow','prism','weave','aurora','encore'][level],radius:20+level*2.5,bands:[1,1,2,2,2,2,3,3][level],comets:soft?0:level===0?1:level<4?2:level<6?3:4,angle:soft?0:frame.beat*Math.PI/8,pulse:soft?0:frame.pulse,wave:soft?0:Math.min(1,phase/.65),alpha:soft?.14:.23+.20*frame.pulse,colors:level<4?[P.cyan,P.blue]:level<6?[P.cyan,P.pink]:[P.cyan,P.lemon]};
}
function halo(c,r,color,alpha){const g=c.createRadialGradient(0,0,r*.15,0,0,r);g.addColorStop(0,color+'00');g.addColorStop(.48,color+'66');g.addColorStop(.76,color+'26');g.addColorStop(1,color+'00');c.fillStyle=g;c.globalAlpha=alpha;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();}
function arc(c,r,start,length,color,alpha,width){c.strokeStyle=color;c.lineCap='round';c.lineWidth=width;c.globalAlpha=alpha;c.beginPath();c.arc(0,0,r,start,start+length);c.stroke();}
export function paintComboDiscoFloor(c,frame,room,prepared=null){
 if(!frame)return false;const floor=prepared?{ground:prepared}:caveGroundPath(room);if(!floor)return false;
 c.save();try{c.clip(floor.ground,'evenodd');c.globalCompositeOperation='screen';const alpha=c.globalAlpha,g=comboPulseGeometry(frame);c.translate(frame.origin.x,frame.origin.y+1);c.scale(1,.53);
 halo(c,g.radius+8,g.colors[0],alpha*(frame.soft?.10:.09+.09*g.pulse));
 for(let band=0;band<g.bands;band++){
  const weave=!frame.soft&&g.signature==='weave'?Math.sin(g.angle*2+band*Math.PI)*1.8:0,r=g.radius-band*4.3+weave,start=g.angle*(band%2?-1:1)+band*1.7,color=g.colors[band%2];
  for(const side of(frame.index===0?[0]:[0,Math.PI])){arc(c,r,start+side,Math.PI*.71,color,alpha*g.alpha*.20,4.3);arc(c,r,start+side,Math.PI*.71,color,alpha*g.alpha,1.15);}
 }
 if(!frame.soft){
  const envelope=(1-g.wave)**2,r=g.radius-3+g.wave*13;
  if(envelope>0){arc(c,r,0,Math.PI*2,g.colors[0],alpha*envelope*(.20+frame.index*.018),1.4*(1-g.wave)+.3);if(g.signature==='echo')arc(c,r-4,0,Math.PI*2,g.colors[1],alpha*envelope*.15,1);}
  for(let i=0;i<g.comets;i++){const a=g.angle*(i%2?-1:1)+i*Math.PI*2/g.comets,r=g.radius-(i%2)*4.3,color=g.colors[i%2];arc(c,r,a-.44,.44,color,alpha*(.34+.25*g.pulse),1.6);c.globalAlpha=alpha*(.55+.25*g.pulse);c.fillStyle=color;c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r,1.15,0,Math.PI*2);c.fill();}
  if(frame.entry){const u=frame.entry.age/1.6,e=frame.entry.envelope;for(let i=0;i<(frame.entry.major?2:1);i++)arc(c,g.radius+u*(frame.entry.major?28:14)+i*4,0,Math.PI*2,g.colors[i%2],alpha*e*(frame.entry.major?.30:.15),Math.max(.35,1.6-u));}
  if(g.signature==='encore'&&frame.beatIndex%4===0)halo(c,g.radius+14,g.colors[1],alpha*g.pulse*.12);
 }
 }finally{c.restore();}return true;
}
export function paintComboDiscoWall(c,frame,face,occlusion=1){
 if(!frame||frame.index<4||frame.soft)return false;const x=frame.origin.x,y=frame.origin.y-14,g=comboPulseGeometry(frame),r=g.radius*2.1,minX=Math.min(face.a[0],face.b[0]),maxX=Math.max(face.a[0],face.b[0]),bottom=Math.max(face.a[1],face.b[1]),top=Math.min(face.a[1],face.b[1])-face.height;
 if(x+r<minX||x-r>maxX||y+r<top||y-r>bottom)return false;
 c.save();try{c.beginPath();c.moveTo(...face.a);c.lineTo(...face.b);c.lineTo(face.b[0],face.b[1]-face.height);c.lineTo(face.a[0],face.a[1]-face.height);c.closePath();c.clip();c.globalCompositeOperation='screen';const alpha=c.globalAlpha*clamp(occlusion,0,1);c.translate(x,y);halo(c,r,g.colors[0],alpha*(.035+.035*g.pulse));}finally{c.restore();}return true;
}
