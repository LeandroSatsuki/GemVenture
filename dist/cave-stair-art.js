import {P} from './palette.js';
import {CAMPAIGN_CAVE_ART} from './campaign-cave-data.js';
import {biomeIndex} from './campaign.js';
import {usesStairs,stairReady} from './cave-descent.js';

// Ground basis is the same as World.project, at its half-size drawing scale.
// Positive z is below the floor. There is no raised stone frame around the cut.
const mouth=[[-1.04,1.25],[-1.27,.57],[-1.12,-.3],[-1.38,-.86],[-1.11,-1.72],[-.64,-2.25],[.13,-2.4],[.56,-2.08],[1.08,-1.79],[1.25,-.94],[.96,-.23],[1.2,.48],[.88,1.3],[.25,1.52],[-.32,1.36]].map(([u,v])=>[u,v*.55]);
function shape(c,points,x,y,color,alpha=1){c.beginPath();points.forEach(([u,v,z=0],i)=>{const px=x+22*u+2*v,py=y+16*v+z;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();c.fillStyle=color;c.globalAlpha=alpha;c.fill();}
export function paintCaveStair(c,run,point){
 if(!usesStairs(run))return false;
 const p=run.room.exit;if(run.room.explored&&!run.room.explored[p.y*run.room.cols+p.x])return true;
 const {x,y}=point,rock=CAMPAIGN_CAVE_ART[biomeIndex(run.floor)].material.rock;
 c.save();c.lineJoin='round';
 // An asymmetric fissure cut straight into existing ground, without an oval lip.
 shape(c,mouth,x,y,P.ink);c.save();c.clip();
 // The far and left cut faces expose the thickness below the floor surface.
 shape(c,[...mouth.slice(3,10),...mouth.slice(3,10).reverse().map(([u,v])=>[u*.8,v*.9,6])],x,y,rock[2],.28);
 shape(c,[mouth[9],mouth[10],mouth[11],mouth[12],[.62,.6,5],[.77,.16,7],[.62,-.15,8],[.87,-.5,8]],x,y,rock[2],.48);
 // The same approved overhang shadow falls into the empty opening.
 shape(c,[mouth[3],mouth[4],mouth[5],mouth[6],[-.32,-.88,5],[-.8,-.5,6]],x,y,P.ink,.75);
 c.restore();
 // Mandatory boss floors retain their existing rubble gate.
 if(!stairReady(run)){shape(c,[[-.64,1.2],[-.44,.91],[.14,1.03],[.4,.84],[.91,1.07],[.97,1.41],[.45,1.55],[-.33,1.44]],x,y,rock[2]);shape(c,[[-.58,1.17],[-.38,.89],[.12,1],[.41,.81],[.88,1.04],[.83,1.25],[.17,1.3]],x,y,rock[1]);}
 c.restore();return true;
}
