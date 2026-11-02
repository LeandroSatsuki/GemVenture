// Presentation-only movement. The navigation provider owns the walking surface.
export class RefugeMovement{
 constructor(navigation,{sampleHop,stride}){if(typeof sampleHop!=='function'||!Number.isFinite(stride)||stride<=0)throw new TypeError('Existing hop sampler and stride required');this.nav=navigation;this.sampleHop=sampleHop;this.stride=stride;this.travel=null;this.arrived=null;this.trail=[];this.lastRequest=null;}
 request(fromWorld,destination,{station=null,reduced=false}={}){
  const from={x:fromWorld.x/2,y:fromWorld.y/2},plan=station?this.nav.approach(from,destination):this.nav.route(from,destination);this.arrived=null;
  // An invalid click never replaces an existing safe route, but cancels its pending visit.
  if(!plan.ok){if(this.travel)this.travel.station=null;this.lastRequest={ok:false,reason:plan.reason};return this.lastRequest;}
  const points=[{...plan.points[0]}];for(let i=1;i<plan.points.length;i++){const a=plan.points[i-1],b=plan.points[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/this.stride);for(let j=1;j<=steps;j++)points.push({x:a.x+(b.x-a.x)*j/steps,y:a.y+(b.y-a.y)*j/steps});}
  const worldPoints=points.map(p=>({x:p.x*2,y:p.y*2})),legs=[];let duration=0;
  for(let i=1;i<worldPoints.length;i++){const route={points:[worldPoints[i-1],worldPoints[i]],length:Math.hypot(worldPoints[i].x-worldPoints[i-1].x,worldPoints[i].y-worldPoints[i-1].y)};const time=this.sampleHop(route,0).duration;if(!Number.isFinite(time)||time<=0)throw Error('Invalid existing hop duration');legs.push({route,start:duration,duration:time});duration+=time;}
  this.travel={points:worldPoints,legs,duration,elapsed:0,sample:0,station};this.lastRequest={ok:true,station,points:worldPoints.map(p=>({...p})),duration,reduced};return this.lastRequest;
 }
 poseAt(travel,time){if(time>=travel.duration||!travel.legs.length){const end=travel.points.at(-1);return {...end,hop:0};}const leg=travel.legs.find(l=>time<l.start+l.duration)||travel.legs.at(-1);return this.sampleHop(leg.route,Math.max(0,time-leg.start));}
 advance(dt,{paused=false,reduced=false}={}){
  if(paused)return null;dt=Number.isFinite(dt)?Math.max(0,dt):0;for(const p of this.trail)p.life-=dt;this.trail=this.trail.filter(p=>p.life>0);
  const t=this.travel;if(!t)return null;t.elapsed=reduced?t.duration:Math.min(t.duration,t.elapsed+dt);
  // Reuse the established World trail interval/lifetime/budget; no wall-clock dependence.
  t.sample=Math.max(t.sample,Math.ceil(Math.max(0,t.elapsed-.22)/.032));
  while(t.sample*.032<Math.min(t.elapsed,t.duration)){const at=t.sample++*.032,life=.22-(t.elapsed-at);if(life>0){const pose=this.poseAt(t,at);this.trail.push({x:pose.x,y:pose.y,hop:reduced?0:pose.hop,life});}}
  this.trail=this.trail.slice(-24);const pose=this.poseAt(t,t.elapsed),done=t.elapsed>=t.duration;
  if(done){this.arrived=t.station;this.travel=null;}return {x:pose.x,y:pose.y,hop:reduced?0:pose.hop,done};
 }
 takeArrival(){const id=this.arrived;this.arrived=null;return id;}
 cancel(){this.travel=null;this.arrived=null;this.trail=[];}
}
