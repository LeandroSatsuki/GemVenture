import {paintCaveStair} from './cave-stair-art.js';
import {arrivalPlan,bossExitPlan} from './cave-arrival-plan.js';
import {refugeLiftAssets} from './refuge-lift-assets.js';
import {P} from './palette.js';
import {biomeIndex} from './core.js';
import {caveBiomeProfile} from './cave-biome-art.js';
import {drawAsset} from './art-kit.js';

export const CAVE_ARRIVAL_PLACEMENT=Object.freeze({x:54,y:233.5,width:34});
export const CAVE_ARRIVAL_SUPPORT=Object.freeze({left:73,right:82,top:230,bottom:239});
export const CAVE_ARRIVAL_EDGE=Object.freeze([[82,230],[82.5625,230],[83.6875,239],[82,239]].map(p=>Object.freeze(p)));
function polygon(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function support(c,profile,ground){
 c.save();c.beginPath();c.rect(25,183.5,49,56);c.rect(73,230,9,9);c.clip();c.lineJoin='round';c.lineWidth=1;c.strokeStyle=P.ink;
 polygon(c,[[34.7,230.5],[80.2,230.5],[81.7,233.8],[35.7,233.8]]);c.fillStyle=profile?.base||P.slate;c.fill();c.stroke();
 polygon(c,[[35.7,233.8],[81.7,233.8],[81.7,238.5],[35.7,238.5]]);c.fillStyle=profile?.base||P.slate;c.fill();c.stroke();
 c.strokeStyle=profile?.light||P.steel;c.lineWidth=.65;c.beginPath();c.moveTo(36,231.2);c.lineTo(79.7,231.2);c.stroke();c.restore();
 // Exact approved edge cap and the current compositor ground, never a reconstructed mask.
 c.save();const outside=new Path2D();outside.rect(0,0,1200,760);outside.addPath(ground);c.clip(outside,'evenodd');polygon(c,CAVE_ARRIVAL_EDGE);c.clip();c.fillStyle=profile?.base||P.slate;c.fillRect(82,230,1.6875,9);c.restore();
}
function exitMarker(c,point){const {x,y}=point;c.save();c.strokeStyle=P.steel;c.fillStyle=P.ink;c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,12,5,0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle=P.sand;c.beginPath();c.moveTo(x,y-3);c.lineTo(x,y+2);c.moveTo(x-3,y);c.lineTo(x,y+2);c.lineTo(x+3,y);c.stroke();c.restore();}
function proceduralArrival(c,placement){drawAsset(c,'lift',placement.x,placement.y,placement.width,{seed:0});}

export function createCaveArrivalPresentation({assets=refugeLiftAssets,paintFallback=proceduralArrival}={}){
 let loading=null,ready=false,revision=0,phase='cold';
 return Object.freeze({
  load(){
   if(loading)return loading;
   phase='loading';loading=Promise.resolve().then(()=>assets.load()).then(()=>{ready=!!assets.status().ready;phase=ready?'ready':'failed';if(ready)revision++;return ready;}).catch(()=>{ready=false;phase='failed';return false;});
   return loading;
  },
  revision:()=>revision,
  status:()=>({phase,ready,revision,fallback:!ready,failed:[...(assets.status().failed||[])]}),
  paint(c,run,ground){
   if(run?.mode==='abyss')return true;
   const boss=bossExitPlan(run);if(boss){if(!paintCaveStair(c,run,boss.exitHalf)&&boss.exitActive)exitMarker(c,boss.exitHalf);return true;}
   const plan=arrivalPlan(run);if(!plan.enabled)return false;
   if(!ground)throw new TypeError('Arrival presentation requires the current World ground path');
   const dx=plan.wallClipRequired?plan.mountHalf.x-72:0,dy=plan.wallClipRequired?plan.mountHalf.y-233.5:0,localGround=new Path2D();localGround.addPath(ground,{a:1,b:0,c:0,d:1,e:-dx,f:-dy});
   c.save();c.translate(dx,dy);support(c,caveBiomeProfile(biomeIndex(run.floor)),localGround);
   c.save();const window=new Path2D();window.rect(25,183.5,49,56);if(plan.wallClipRequired)window.addPath(localGround);c.clip(window,plan.wallClipRequired?'evenodd':'nonzero');
   if(ready)assets.paint(c,null,{...CAVE_ARRIVAL_PLACEMENT,poseOverride:{dy:0},reduced:true});else paintFallback(c,CAVE_ARRIVAL_PLACEMENT);
   c.restore();c.restore();if(!paintCaveStair(c,run,plan.exitHalf)&&plan.exitActive)exitMarker(c,plan.exitHalf);return true;
  }
 });
}
const nativeLift={load:async()=>true,status:()=>({ready:true,failed:[]}),paint:(c,_run,p)=>drawAsset(c,'lift',p.x,p.y,p.width,{procedural:true,biome:0})};
const caveArrival=createCaveArrivalPresentation({assets:nativeLift});
export const loadCaveArrivalArt=()=>caveArrival.load();
export const caveArrivalArtRevision=()=>caveArrival.revision();
export const caveArrivalArtStatus=()=>caveArrival.status();
export const paintCaveArrival=(c,run,ground)=>caveArrival.paint(c,run,ground);
