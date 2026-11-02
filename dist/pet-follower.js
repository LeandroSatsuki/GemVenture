import {petArtSpec} from './pet-art-catalog.js';
// Presentation history only. No profile, collisions, targets, pickups or saved coordinates.
export const PET_FOLLOW_LIMITS=Object.freeze({gap:44,speed:760,minSeparation:18,maxPoints:256,teleportGap:128});
const finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
function locate(points,p,minimum=0){let best=null,at=0;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=distance(a,b);if(!length)continue;const u=Math.max(0,Math.min(1,((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/(length*length))),d=at+length*u,q=mix(a,b,u),error=distance(p,q);if(d>=minimum-1e-5&&(!best||error<best.error-1e-6))best={d,error};at+=length;}return best;}
// Preserve crossed corners even when one frame/reduced-motion step finishes several legs.
export function followedCorners(from,to,route){
 if(!Array.isArray(route)||route.length<2||!route.every(finite))return [to];
 const a=locate(route,from),b=a&&locate(route,to,a.d);if(!a||!b||a.error>8||b.error>8)return [to];
 let d=0;const out=[];for(let i=1;i<route.length;i++){d+=distance(route[i-1],route[i]);if(d>a.d+1e-5&&d<b.d-1e-5)out.push(route[i]);}return [...out,to];
}
export class PetFollower{
 constructor(){this.reset();}
 reset(){this.id=null;this.scene=null;this.points=[];this.cursor=0;this.age=0;this.pose=null;}
 shift(dx,dy){if(!Number.isFinite(dx)||!Number.isFinite(dy))return;for(const p of this.points){p.x+=dx;p.y+=dy;}if(this.pose){this.pose.x+=dx;this.pose.y+=dy;}}
 sample({id,scene,player,route=null,dt=0,paused=false,reduced=false,canStand=()=>true}){
  if(!petArtSpec(id)||!finite(player)){this.reset();return null;}
  const initialize=(fromRoute=false)=>{this.reset();this.id=id;this.scene=scene;const start=fromRoute&&Array.isArray(route)&&finite(route[0])?route[0]:player;if(canStand(start))this.points=[{x:start.x,y:start.y,d:0}];};
  if(this.id!==id||this.scene!==scene||!this.points.length)initialize(true);
  if(!this.points.length)return null;if(paused)return this.pose;
  const step=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;this.age+=step;
  const previous=this.points.at(-1),travel=distance(previous,player);
  if(travel>0.01){
   if(travel>PET_FOLLOW_LIMITS.teleportGap&&!route){initialize();return null;}
   const path=followedCorners(previous,player,route);let last=previous;
   for(const end of path){const length=distance(last,end),segments=Math.max(1,Math.ceil(length/6));
    for(let i=1;i<=segments;i++)if(!canStand(mix(last,end,i/segments))){initialize();return null;}
    if(length>.01){this.points.push({x:end.x,y:end.y,d:this.points.at(-1).d+length});last=end;}
   }
  }
  const head=this.points.at(-1),target=Math.max(this.points[0].d,head.d-PET_FOLLOW_LIMITS.gap),oldCursor=this.cursor;
  this.cursor=reduced?target:Math.max(this.points[0].d,Math.min(target,this.cursor+PET_FOLLOW_LIMITS.speed*step));
  let a=this.points[0],b=a;for(let i=1;i<this.points.length;i++){b=this.points[i];if(b.d>=this.cursor)break;a=b;}
  const p=b.d>a.d?mix(a,b,Math.max(0,Math.min(1,(this.cursor-a.d)/(b.d-a.d)))):{x:a.x,y:a.y};
  // Trim only already-traversed history; never shortcut the remaining path.
  while(this.points.length>2&&this.points[1].d<this.cursor-24)this.points.shift();
  if(this.points.length>PET_FOLLOW_LIMITS.maxPoints){initialize();return null;}
  const separation=distance(p,player),moving=this.cursor-oldCursor>.01;
  const dx=(b.x-a.x)-(b.y-a.y)/8,dy=(b.y-a.y)*44/32;const direction=moving&&Math.hypot(dx,dy)>.01?(Math.abs(dx)>Math.abs(dy)?dx>0?'E':'W':dy>0?'S':'N'):(this.pose?.direction||'S');
  this.pose={id,x:p.x,y:p.y,direction,age:this.age,moving,reduced,alpha:Math.max(0,Math.min(1,(separation-PET_FOLLOW_LIMITS.minSeparation)/14)),hop:id==='slime-friend'&&!reduced&&moving?Math.abs(Math.sin(this.cursor*.13))*1.7:0,lift:id==='bat-friend'?7+(reduced?0:Math.sin(this.age*4)*.8):0,wing:id==='bat-friend'&&!reduced?Math.sin(this.age*17)*.18:0};
  if(!canStand(p))this.pose.alpha=0;return this.pose;
 }
}
