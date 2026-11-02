import {movement} from './core.js';
import {sightRange} from './cavern.js';
import {P} from './palette.js';

export const FIELD_PRESENTATION=Object.freeze({fogFeather:12,lightFeather:8,lightInset:8,ringAlpha:.15,shadowAlpha:.24,maxBuffers:3});
export const visionPresentationScale=run=>sightRange(run)/5;
export function movementReach(profile){const distance=movement(profile);return{distance,rx:22*distance,ry:16*distance,shear:2*distance};}
export function paintMovementReach(c,profile,player,{scale=2}={}){
 if(!profile.run||profile.run.room.cleared||profile.run.recovery?.active||profile.run.rest?.active)return false;
 const {rx,ry,shear}=movementReach(profile),x=player.x/2,y=player.y/2;
 c.save();c.globalAlpha*=FIELD_PRESENTATION.ringAlpha;c.strokeStyle=P.silver;c.lineWidth=1/Math.max(.5,scale);c.lineJoin='round';c.beginPath();
 for(let i=0;i<=96;i++){const a=i*Math.PI/48,px=x+Math.cos(a)*rx+Math.sin(a)*shear,py=y+Math.sin(a)*ry;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.stroke();c.restore();return true;
}
export function mineralVisualPoint(node,project,world){const p=project(node.x,node.y),pose=node.type==='crystal'?world.fx?.mining?.pose(node.id,world.fx.age,{soft:world.reduced||!!world.motionPreference?.matches}):null;return[p[0]+(pose?.dx||0),p[1]+(pose?.dy||0)];}
export function paintMineralContact(c,x,y,width){
 c.save();c.translate(x,y+.25);c.scale(width*.21,width*.045);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(17,22,36,.32)');g.addColorStop(.5,'rgba(17,22,36,.20)');g.addColorStop(1,'rgba(17,22,36,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,Math.PI*2);c.fill();c.restore();
}

// Bounded world-aligned mask. Only the soft environmental pass is filtered;
// sprites, attack warnings, material edges, HUD and CRT are never blurred.
export class SoftCaveMask{
 constructor(makeCanvas=()=>document.createElement('canvas')){this.makeCanvas=makeCanvas;this.buffers=[];this.rebuilds=0;this.key='';this.refs=[];}
 reset(){for(const b of this.buffers)b.width=b.height=1;this.key='';this.refs=[];}
 buffer(i,w,h){const b=this.buffers[i]??=this.makeCanvas();if(b.width!==w)b.width=w;if(b.height!==h)b.height=h;const c=b.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';c.clearRect(0,0,w,h);return c;}
 prepare(layers,viewport,{feather=FIELD_PRESENTATION.fogFeather,strict=false}={}){
  const pad=32,x=Math.floor((viewport.x-pad)/64)*64,y=Math.floor((viewport.y-pad)/64)*64,w=Math.ceil(viewport.w+pad*2+64),h=Math.ceil(viewport.h+pad*2+64),key=[x,y,w,h,feather,strict].join(':');
  if(key===this.key&&layers.length===this.refs.length&&layers.every((l,i)=>l.path===this.refs[i]?.path&&l.alpha===this.refs[i]?.alpha))return this;
  this.key=key;this.refs=layers.map(l=>({...l}));this.x=x;this.y=y;this.w=w;this.h=h;this.rebuilds++;
  const raw=this.buffer(0,w,h);raw.save();raw.translate(-x,-y);raw.fillStyle=P.ink;for(const l of layers){raw.globalAlpha=l.alpha??1;raw.fill(l.path);}raw.restore();
  let source=this.buffers[0];
  if(strict){const eroded=this.buffer(2,w,h),inset=FIELD_PRESENTATION.lightInset;eroded.drawImage(source,0,0);eroded.globalCompositeOperation='destination-in';for(const [dx,dy]of [[inset,0],[-inset,0],[0,inset],[0,-inset]])eroded.drawImage(source,dx,dy);eroded.globalCompositeOperation='source-over';source=this.buffers[2];}
  const soft=this.buffer(1,w,h);soft.filter='blur('+feather+'px)';soft.drawImage(source,0,0);soft.filter='none';
  if(strict){soft.globalCompositeOperation='destination-in';soft.drawImage(this.buffers[0],0,0);soft.globalCompositeOperation='source-over';}
  return this;
 }
 paint(c){if(this.buffers[1])c.drawImage(this.buffers[1],this.x,this.y);}
 status(){return{buffers:this.buffers.filter(Boolean).length,rebuilds:this.rebuilds,bytes:this.buffers.reduce((n,b)=>n+(b?b.width*b.height*4:0),0)};}
}
