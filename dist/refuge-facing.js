// Presentation only: read the approved ground route without changing it.
export const REFUGE_FACING_DEFAULT='front-left';
export const REFUGE_FACING_TOLERANCE=Object.freeze({distance:1e-6,axisRatio:.025});
const signs=view=>[view.endsWith('right')?1:-1,view.startsWith('front')?1:-1];
export function facingFromGroundDelta(dx,dy,previous=REFUGE_FACING_DEFAULT){
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return previous;
 const length=Math.hypot(dx,dy);if(length<=REFUGE_FACING_TOLERANCE.distance)return previous;
 const threshold=Math.max(REFUGE_FACING_TOLERANCE.distance,length*REFUGE_FACING_TOLERANCE.axisRatio),old=signs(previous),sx=Math.abs(dx)>threshold?Math.sign(dx):old[0],sy=Math.abs(dy)>threshold?Math.sign(dy):old[1];
 return (sy>0?'front':'back')+'-'+(sx>0?'right':'left');
}
function legAtTime(travel,time){const i=travel.legs.findIndex(l=>time<=l.start+l.duration+1e-9);return i<0?travel.legs.length-1:i;}
function legAtPoint(travel,point){
 for(let i=0;i<travel.legs.length;i++){const [a,b]=travel.legs[i].route.points,dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy;if(!length2)continue;const t=((point.x-a.x)*dx+(point.y-a.y)*dy)/length2;
  if(t>=-1e-7&&t<=1+1e-7&&Math.hypot(point.x-(a.x+t*dx),point.y-(a.y+t*dy))<1e-5)return i;
 }return -1;
}
export class RefugeFacing{
 constructor(){this.view=REFUGE_FACING_DEFAULT;this.routes=new WeakMap();this.trails=new WeakMap();}
 routeViews(travel){let views=this.routes.get(travel);if(!views){let current=this.view;views=travel.legs.map(l=>{const [a,b]=l.route.points;return current=facingFromGroundDelta(b.x-a.x,b.y-a.y,current);});this.routes.set(travel,views);}return views;}
 observe(travel,from,pose,trail){
  if(!travel||!pose)return this.view;const views=this.routeViews(travel);
  if(Math.hypot(pose.x-from.x,pose.y-from.y)>REFUGE_FACING_TOLERANCE.distance)this.view=views[legAtTime(travel,travel.elapsed)]||this.view;
  for(const sample of trail)if(!this.trails.has(sample)){const i=legAtPoint(travel,sample);this.trails.set(sample,views[i]||this.view);}
  return this.view;
 }
 trailView(sample){return this.trails.get(sample)||this.view;}
}
