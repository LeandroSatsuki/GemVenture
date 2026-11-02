import {paintBossV2} from './dungeon-bosses-v2.js';
import {approvedArtSpec,approvedArtSource,approvedArtRect} from './approved-art.js';
// Masks match the current original boss paintings. Only rigid arms move; no rubber scaling.
export const BOSS_ARM_RIGS=Object.freeze({
 1:[{pivot:[430,600],points:[[105,650],[290,525],[435,495],[450,666],[420,700],[420,790],[230,840],[110,780]],sign:-1},{pivot:[850,680],points:[[800,660],[915,590],[1110,710],[1135,825],[1030,900],[800,760]],sign:1}],
 2:[{pivot:[350,440],points:[[155,355],[310,245],[390,275],[410,480],[310,655],[380,785],[365,940],[215,980],[40,900],[35,760],[190,620]],sign:-1},{pivot:[940,475],points:[[880,360],[1010,335],[1160,415],[1170,550],[1100,625],[1185,835],[1180,1000],[1110,1060],[940,1010],[915,855],[955,690],[900,620]],sign:1}],
 3:[{pivot:[365,580],points:[[275,450],[380,415],[410,610],[340,710],[260,735],[105,680],[100,570]],sign:-1},{pivot:[920,680],points:[[850,510],[965,545],[1060,655],[1165,690],[1190,790],[1100,890],[965,865],[880,760]],sign:1}],
 4:[{pivot:[400,775],points:[[35,640],[170,565],[280,640],[340,735],[420,705],[435,830],[260,900],[125,815],[40,705]],sign:-1},{pivot:[865,795],points:[[830,750],[955,795],[1070,675],[1195,750],[1190,835],[1010,930],[850,875]],sign:1}]
});
const images=new Map(),shadows=new Map();let promise;
export function loadBossMotion(){if(typeof Image==='undefined')return Promise.resolve();return promise??=Promise.all(Object.keys(BOSS_ARM_RIGS).map(key=>new Promise(resolve=>{const i=Number(key),img=new Image();img.onload=()=>{images.set(i,img);resolve()};img.onerror=()=>resolve();img.src=approvedArtSource(approvedArtSpec('boss',{variant:i}));})));}
export function bossArmPose(index,time,{windup=null,beat=0,soft=false}={}){const p=windup?Math.max(0,Math.min(1,(beat-(windup.startedBeat??windup.beat-3))/Math.max(1,windup.beat-(windup.startedBeat??windup.beat-3)))):0;return{angle:soft?0:Math.sin(time*(index===2?1.4:2)+index)*.022+p*.13,lift:soft?0:p*18};}
function path(c,points){points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function paintBossMotion(c,n,x,y,width,time,{beat=0,soft=false,player=null}={}){
 if(paintBossV2(c,n,x,y,width,time,{beat,soft,player}))return true;
 const image=images.get(n.bossIndex),parts=BOSS_ARM_RIGS[n.bossIndex];if(!image||!parts)return false;
 const spec=approvedArtSpec('boss',{variant:n.bossIndex}),k=approvedArtRect(spec,0,0,width).scale,pose=bossArmPose(n.bossIndex,time,{windup:n.windup,beat,soft});
 const shadow=shadows.get(n.bossIndex);if(shadow){c.save();c.translate(x,y+1);c.transform(1,0,-.22,-.18,0,0);c.globalAlpha*=.34;c.drawImage(shadow,-spec.anchor.x*k,-spec.anchor.y*k,spec.width*k,spec.height*k);c.restore();}
 c.save();c.translate(x,y);c.scale(k,k);c.translate(-spec.anchor.x,-spec.anchor.y);
 c.save();c.beginPath();c.rect(0,0,spec.width,spec.height);for(const p of parts)path(c,p.points);c.clip('evenodd');c.drawImage(image,0,0);c.restore();
 for(const p of parts){c.save();c.translate(p.pivot[0],p.pivot[1]-pose.lift);c.rotate(p.sign*pose.angle);c.translate(-p.pivot[0],-p.pivot[1]);c.beginPath();path(c,p.points);c.clip();c.drawImage(image,0,0);c.restore();}
 c.restore();return true;
}
