import {sampleBrazierFlame} from './campaign-cave-flame.js';
import {WALL_PYRE_SPEC} from './cave-wall-pyres-plan.js';
const polygon=(c,p,color)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();};
const mix=(a,b,t)=>'#'+[16,8,0].map(k=>Math.round(((parseInt(a.slice(1),16)>>k)&255)*(1-t)+((parseInt(b.slice(1),16)>>k)&255)*t).toString(16).padStart(2,'0')).join('');
export function paintWallPyre(c,item,{time=0,soft=false,player=null}={}){
 c.save();
 // Same foreground safety envelope as the cave walls. No gameplay visibility writes.
 if(player&&item.visualDepth>(player.y-115)/32){const p=new Path2D();p.rect(item.bounds.x-20,item.bounds.y-20,64,80);p.rect(player.x/2-52,player.y/2-80,104,120);c.clip(p,'evenodd');}
 c.translate(item.projected.mount.x,item.projected.mount.y);
 const m=item.material,side=item.facing!=='north',w=side?2.4:4.3;
 // A small keyed slab anchors a metal bowl to the continuous cliff mass.
 polygon(c,[[-w,-5],[w-1,-6],[w+1,4],[0,7],[-w,5]],mix(m.rock[2],m.rock[1],.22));
 polygon(c,[[-w,-5],[w-1,-6],[w+1,-4],[-w+1,-3]],mix(m.rock[2],m.rock[0],.40));
 polygon(c,[[2,-3],[4,-2],[4,6],[1,7],[0,4]],m.rock[2]);
 polygon(c,[[-2,1],[1,0],[2,5],[-1,5]],'#374252');
 polygon(c,[[-5,-2],[4,-3],[6,-1],[3,3],[-2,4],[-5,1]],'#374252');
 polygon(c,[[-5,-2],[4,-3],[6,-1],[-3,1]],'#5c627d');
 polygon(c,[[-3,-1],[3,-2],[4,-1],[-2,0]],m.floor);
 c.save();c.translate(0,-1);c.scale(WALL_PYRE_SPEC.flameScale,WALL_PYRE_SPEC.flameScale);
 const palette={body:m.light||m.gem[0],edge:m.gem[2],inner:mix(m.gem[0],'#ffffff',.38),core:'#ffffff'};
 paintSmallFlame(c,palette,time,item.phase,soft);
 c.restore();c.restore();
}
function paintSmallFlame(c,p,time,phase,soft){
 // Same native motion sample and curved silhouette as the approved boss flame.
 const s=sampleBrazierFlame(time,phase,soft),g=c.createRadialGradient(0,-11,2,0,-11,24);g.addColorStop(0,p.body+'44');g.addColorStop(1,p.body+'00');c.fillStyle=g;c.fillRect(-24,-36,48,48);
 c.beginPath();c.moveTo(-7.8,.7);c.bezierCurveTo(-14,-5,-8-s.side*.5,-11,-11,-18-s.side);c.quadraticCurveTo(-6,-14,-4,-18);c.bezierCurveTo(-5,-23,s.tip-2,-s.height+5,s.tip,-s.height);c.bezierCurveTo(s.tip+1,-s.height+10,11+s.curl,-22,8,-13);c.quadraticCurveTo(15,-18+s.side,12,-7);c.bezierCurveTo(10,1,4,2.6,0,2.2);c.closePath();c.fillStyle=p.body;c.fill();c.strokeStyle=p.edge;c.lineWidth=.7;c.stroke();
 c.beginPath();c.moveTo(-5.5,.4);c.bezierCurveTo(-9,-5,-3,-10,-4,-15-s.core);c.quadraticCurveTo(-1,-12,1,-22-s.core*1.4);c.bezierCurveTo(2,-16,9,-10,6,-4);c.quadraticCurveTo(5,2,-1,2);c.closePath();c.fillStyle=p.inner;c.fill();
 c.beginPath();c.moveTo(-2.8,.3);c.bezierCurveTo(-4,-4,1,-7,1,-11-s.core*.7);c.bezierCurveTo(4,-6,6,-2,2,1.4);c.closePath();c.fillStyle=p.core;c.fill();
 if(!soft)for(let i=0;i<2;i++){const u=((s.time*.66+i*.47)%1+1)%1;c.globalAlpha=Math.sin(u*Math.PI)*.6;c.fillStyle=p.inner;c.shadowColor=p.body;c.shadowBlur=3;c.beginPath();c.ellipse(Math.sin(s.time*3.6+i*2.7)*3.8+(i?1:-1)*u*5,-17-u*34,.6,.9,.3,0,Math.PI*2);c.fill();c.shadowBlur=0;}c.globalAlpha=1;
}

export function paintWallPyreEmission(c,item,{time=0,soft=false,player=null}={}){
 c.save();if(player&&item.visualDepth>(player.y-115)/32){const p=new Path2D();p.rect(item.bounds.x-20,item.bounds.y-20,64,80);p.rect(player.x/2-52,player.y/2-80,104,120);c.clip(p,'evenodd');}
 c.translate(item.projected.mount.x,item.projected.mount.y-1);
 const m=item.material,color=m.light||m.gem[0],g=c.createRadialGradient(0,-7,0,0,-7,14);g.addColorStop(0,color+'66');g.addColorStop(.35,color+'24');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(-14,-21,28,28);
 c.scale(WALL_PYRE_SPEC.flameScale,WALL_PYRE_SPEC.flameScale);paintSmallFlame(c,{body:color,edge:m.gem[2],inner:mix(m.gem[0],'#ffffff',.38),core:'#ffffff'},time,item.phase,soft);c.restore();
}
