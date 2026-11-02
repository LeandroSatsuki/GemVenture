import {P} from './palette.js';

// Approved R2 materials/fonts in the existing World health footprints.
// Pure painters: World owns anchors,visibility,lift,HP,ratios,copy and clocks.
export const CANVAS_HEALTH_LAYOUT=Object.freeze({player:Object.freeze({left:-22,top:-2,width:44,height:17,trackLeft:-19,trackTop:1,trackWidth:38,trackHeight:3,textY:13,textSize:7}),boss:Object.freeze({left:-37,width:74,height:8,trackLeft:-35,trackTop:2,trackWidth:70,trackHeight:4,nameY:-8,nameSize:10,alertY:-23,alertSize:8})});
export const CANVAS_HEALTH_FONTS=Object.freeze({display:"'GV R2 Display','Arial Rounded MT Bold',sans-serif",body:"'GV R2 Body','Trebuchet MS','Segoe UI',sans-serif"});
function panel(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function text(c,value,x,y,color,size,display=false){c.font=(display?'600 ':'900 ')+size+'px '+(display?CANVAS_HEALTH_FONTS.display:CANVAS_HEALTH_FONTS.body);c.textAlign='center';c.lineWidth=2;c.strokeStyle=P.ink;c.strokeText(value,x,y);c.fillStyle=color;c.fillText(value,x,y);}
export function paintPlayerHealth(c,{x,y,ratio,color,text:copy}){
 c.save();try{c.globalAlpha=1;panel(c,x-22,y-2,44,17,3,P.ink);panel(c,x-21,y-1,42,15,2,P.slate);c.strokeStyle=color;c.lineWidth=1.2;c.beginPath();c.roundRect(x-21,y-1,42,7,1.5);c.stroke();c.fillStyle=P.ink;c.fillRect(x-19,y+1,38,3);c.fillStyle=color;c.fillRect(x-19,y+1,38*ratio,3);text(c,copy,x,y+13,P.white,7);}finally{c.restore();}
}
export function paintBossHealth(c,{x,top,ratio,color,name,alert,showVitals=true}){
 c.save();try{if(showVitals){text(c,name,x,top-8,color,10,true);panel(c,x-37,top,74,8,2,P.ink);c.fillStyle=P.slate;c.fillRect(x-35,top+2,70,4);c.fillStyle=color;c.fillRect(x-35,top+2,70*ratio,4);}if(alert)text(c,alert,x,top-23,P.lemon,8);}finally{c.restore();}
}
