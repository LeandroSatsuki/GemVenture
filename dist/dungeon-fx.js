import {P} from './palette.js';

// Small rigid volumes: this is presentation only; danger areas and timings stay
// with combat. No flickering random vertices or expanding weapon sprites.
export function paintVoxelFlame(c,x,y,time=0,scale=1,soft=false,red=false){
 c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';
 const block=(x,y,w,h,top,front,side)=>{c.fillStyle=front;c.fillRect(x,y,w,h);c.fillStyle=top;c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y-2);c.lineTo(x+w+2,y-2);c.lineTo(x+w,y);c.closePath();c.fill();c.fillStyle=side;c.beginPath();c.moveTo(x+w,y);c.lineTo(x+w+2,y-2);c.lineTo(x+w+2,y+h-2);c.lineTo(x+w,y+h);c.closePath();c.fill();};
 for(let i=0;i<3;i++){const phase=soft?0:Math.sin(time*5+i*2),h=7+(i===1?6:0)+phase*1.5;block(i*4-6,-h,5,h,red?P.orange:'#ffd95a',red?P.red:'#f06c1a',red?P.maroon:'#ce2029');}
 block(-2,-7,4,7,red?P.yellow:'#ffffe0',red?P.orange:'#ffd95a',red?P.red:'#e97c07');
 if(!soft)for(let i=0;i<2;i++){const u=(time*.5+i*.5)%1;c.globalAlpha=1-u;block(-4+i*7,-18-u*12,1.6,2,red?P.yellow:'#ffffe0',red?P.orange:'#ffd95a',red?P.red:'#f06c1a');}
 c.restore();
}
export function paintVoxelExplosion(c,x,y,age,{size=90,duration=.65,opacity=1,soft=false,red=false}={}){
 const p=Math.max(0,Math.min(1,age/duration));if(p>=1)return false;
 c.save();c.globalAlpha*=opacity*(1-p);const reach=size*(soft?.08:.24)*p;
 for(let i=0;i<(soft?3:7);i++){const a=i*2.39996,r=reach*(.55+(i%3)*.2);paintVoxelFlame(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.5-p*size*.08,age+i*.2,size/95*(1-p*.5),true,red);}
 c.restore();return true;
}
