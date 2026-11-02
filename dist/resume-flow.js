// Wall-clock countdown only. No simulation, timers or audio scheduler are owned here.
export function createResumeFlow(){
 let context=null,left=0,last=null,active=false;
 const cancel=()=>{context=null;left=0;last=null;active=false;};
 return {start(now,run){if(!run)return false;context=run;left=3;last=now;active=true;return true;},cancel,
  frame(now,{run,interrupted=false,waiting=false}={}){if(!active)return false;if(run!==context||interrupted){cancel();return false;}const dt=Math.max(0,(now-last)/1000);last=now;if(dt>.5){cancel();return false;}if(!waiting)left=Math.max(0,left-dt);if(left>1e-7)return false;cancel();return true;},
  get active(){return active;},get number(){return active?Math.max(1,Math.ceil(left-1e-7)):0;}
 };
}
