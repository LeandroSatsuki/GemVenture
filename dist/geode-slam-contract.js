export const SLAM={"anticipation":0.25,"hold":0.125,"recovery":0.25,"total":0.625,"frames":20,"contactFrame":8,"rise":0.2,"life":2,"handForward":38,"handSide":72};

// Re-time existing poses: raised fists, a short accelerating strike, contact on
// the musical impact, then settling. The animation never schedules damage.
export const SLAM_STRIKE=.07;
export function slamFrameIndex(impactAge,count=SLAM.frames){
 const clamp=x=>Math.max(0,Math.min(1,x));let index;
 if(impactAge< -SLAM_STRIKE)index=5*clamp((impactAge+SLAM.anticipation)/(SLAM.anticipation-SLAM_STRIKE));
 else if(impactAge<0){const u=clamp(1+impactAge/SLAM_STRIKE);index=5+(SLAM.contactFrame-5)*u*u;}
 else if(impactAge<SLAM.hold)index=SLAM.contactFrame+2*impactAge/SLAM.hold;
 else{const u=clamp((impactAge-SLAM.hold)/SLAM.recovery);index=10+(count-1-10)*(1-(1-u)**2);}
 return Math.min(count-1,Math.max(0,Math.floor(index+1e-7)));
}
