import {paintGeodePulseWarning} from './geode-vfx.js';
const arenaPoly=(c,p)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
export function paintArenaGround(c,scene,path){
 if(!scene.arena)return;
 const [x,y]=[284,164],ring=(rx,ry)=>Array.from({length:12},(_,i)=>{const a=i*Math.PI/6+Math.PI/12;return [x+Math.cos(a)*rx,y+Math.sin(a)*ry];});
 c.save();c.clip(path);
 arenaPoly(c,ring(166,91));c.fillStyle='#26344c';c.fill();
 const outer=ring(157,85),inner=ring(137,73);
 for(let i=0;i<12;i++){const j=(i+1)%12;arenaPoly(c,[outer[i],outer[j],inner[j],inner[i]]);c.fillStyle=i%3===0?'#38465a':'#303f54';c.fill();}
 arenaPoly(c,ring(131,70));c.fillStyle='#202d44';c.fill();
 // Large geological slabs, no luminous hazard-like ring or tile grid.
 for(const [p,color]of [
  [[[170,145],[225,98],[284,100],[257,142],[213,169]],'#29384e'],
  [[[257,142],[284,100],[340,112],[379,150],[321,159]],'#2c3b51'],
  [[[213,169],[257,142],[321,159],[316,207],[261,227]],'#26364b'],
  [[[321,159],[379,150],[405,175],[350,215],[316,207]],'#243247']
 ]){arenaPoly(c,p);c.fillStyle=color;c.fill();}
 c.strokeStyle='#415267';c.lineWidth=.8;c.globalAlpha=.65;
 for(const line of [[[174,151],[225,162],[253,142],[284,100]],[[257,142],[299,159],[321,159],[351,186]],[[261,227],[278,200],[299,159]]]){c.beginPath();line.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
 // A flush arrival apron, not steps with new collision or height.
 c.globalAlpha=1;
 for(let i=0;i<3;i++){const px=110+i*11,py=238-i*10;arenaPoly(c,[[px-25,py-6],[px+21,py-6],[px+24,py+5],[px-23,py+5]]);c.fillStyle=i===1?'#39475a':'#303d52';c.fill();}
 c.restore();
}
export function paintArenaProp(c,prop){
 c.save();c.translate(...prop.offset);for(const shape of prop.shapes){c.fillStyle=shape.fill;c.fill(new Path2D(shape.d));}c.restore();
}
export function paintBossWarning(c,scene,warning){
 if(!warning)return;
 if(warning.geodePulse){
  paintGeodePulseWarning(c,{windup:warning,project:(x,y)=>({x:100+44*x+4*y,y:115+32*y}),presentationBeat:5.6,soft:true});return;
 }
 const cells=new Set(warning.tiles.map(p=>p.x+','+p.y)),corners=[[-12,-8],[10,-8],[12,8],[-10,8]],dirs=[[0,-1],[1,0],[0,1],[-1,0]];
 c.save();c.fillStyle='#ffd95a';c.globalAlpha=.16;
 for(const p of warning.tiles){const x=50+22*p.x+2*p.y,y=57.5+16*p.y;arenaPoly(c,corners.map(([u,v])=>[x+u,y+v]));c.fill();}
 c.globalAlpha=.95;c.lineWidth=1.3;c.strokeStyle='#ffd95a';c.beginPath();
 for(const p of warning.tiles)for(let i=0;i<4;i++)if(!cells.has((p.x+dirs[i][0])+','+(p.y+dirs[i][1]))){const x=50+22*p.x+2*p.y,y=57.5+16*p.y,a=corners[i],b=corners[(i+1)%4];c.moveTo(x+a[0],y+a[1]);c.lineTo(x+b[0],y+b[1]);}c.stroke();c.restore();
}
