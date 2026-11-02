// Presentation-only palettes. Geode blue is the requested pilot; the other
// six profiles are color studies, without changing the bosses or their rules.
export const BOSS_FLAME_PROFILES=Object.freeze([
 {bossIndex:0,label:'Geodo · azul',edge:'#1831a7',body:'#2890dc',inner:'#5ee9e9',core:'#ffffff'},
 {bossIndex:1,label:'Raiz · verde',edge:'#005f41',body:'#08b23b',inner:'#47f641',core:'#e8ff75'},
 {bossIndex:2,label:'Fóssil · marfim e âmbar',edge:'#8a4926',body:'#de9751',inner:'#fbbe82',core:'#ffffff'},
 {bossIndex:3,label:'Místico · vermelho',edge:'#720d0d',body:'#da2424',inner:'#f78d8d',core:'#ffffff'},
 {bossIndex:4,label:'Micelial · magenta',edge:'#3d083b',body:'#c12458',inner:'#f94e6d',core:'#ffffff'},
 {bossIndex:5,label:'Tocas · dourado',edge:'#813704',body:'#ecab11',inner:'#ece910',core:'#ffffff'},
 {bossIndex:6,label:'Cenoura · laranja',edge:'#813704',body:'#ef6e10',inner:'#fbbe82',core:'#ffffff'}
].map(Object.freeze));
export const BRAZIER_FLAME_SPEC=Object.freeze({maxInstances:4,maxEmbersPerInstance:2,logicalBounds:{x:-27,y:-57,w:54,h:72},coreMode:'direct Canvas 2D curves',newRasterCaches:0});
export function sampleBrazierFlame(time=0,phase=0,soft=false){
 const t=(Number.isFinite(time)?time:0)+phase;
 if(soft)return {height:29,tip:1,curl:1,side:0,core:0,time:0};
 return {height:31+3.2*Math.sin(t*8.1)+1.1*Math.cos(t*13.4),tip:3.4*Math.sin(t*5.8)+1.2*Math.sin(t*12.5),curl:3.4*Math.sin(t*9.4+.7),side:2.8*Math.sin(t*7.3+1.4),core:Math.sin(t*10.2),time:t};
}
export function paintBrazierFlame(c,brazier,{time=0,bossIndex=0,soft=false}={}){
 const profile=BOSS_FLAME_PROFILES[bossIndex]||BOSS_FLAME_PROFILES[0],s=sampleBrazierFlame(time,brazier.phase||0,soft),x=brazier.x,y=brazier.y-5;
 c.save();c.translate(x,y);
 // Only the halo is soft. Flame silhouettes remain clean paths at any zoom/DPR.
 const glow=c.createRadialGradient(0,-11,2,0,-11,24);glow.addColorStop(0,profile.body+'55');glow.addColorStop(.55,profile.body+'1c');glow.addColorStop(1,profile.body+'00');c.fillStyle=glow;c.fillRect(-25,-38,50,51);
 c.beginPath();c.moveTo(-7.8,.7);
 c.bezierCurveTo(-14,-5,-8-s.side*.5,-11,-11,-18-s.side);
 c.quadraticCurveTo(-6,-14,-4,-18);
 c.bezierCurveTo(-5,-23,s.tip-2,-s.height+5,s.tip,-s.height);
 c.bezierCurveTo(s.tip+1,-s.height+10,11+s.curl,-22,8,-13);
 c.quadraticCurveTo(15,-18+s.side,12,-7);
 c.bezierCurveTo(10,1,4,2.6,0,2.2);c.closePath();c.fillStyle=profile.body;c.fill();c.strokeStyle=profile.edge;c.lineWidth=.7;c.stroke();
 c.beginPath();c.moveTo(-5.5,.4);c.bezierCurveTo(-9,-5,-3,-10,-4,-15-s.core);c.quadraticCurveTo(-1,-12,1,-22-s.core*1.4);c.bezierCurveTo(2,-16,9,-10,6,-4);c.quadraticCurveTo(5,2,-1,2);c.closePath();c.fillStyle=profile.inner;c.fill();
 c.beginPath();c.moveTo(-2.8,.3);c.bezierCurveTo(-4,-4,1,-7,1,-11-s.core*.7);c.bezierCurveTo(4,-6,6,-2,2,1.4);c.closePath();c.fillStyle=profile.core;c.fill();
 if(!soft)for(let i=0;i<2;i++){
  const u=((s.time*.66+i*.47)%1+1)%1,px=Math.sin(s.time*3.6+i*2.7)*3.8+(i?1:-1)*u*5,py=-17-u*34,r=.35+.7*(1-u);
  c.globalAlpha=Math.sin(u*Math.PI)*.8;c.fillStyle=i?profile.inner:profile.body;c.beginPath();c.ellipse(px,py,r,r*1.8,.3,0,Math.PI*2);c.fill();
 }
 c.globalAlpha=1;
 // Front lip stays anchored; the animated base emerges from the same bowl.
 c.beginPath();c.ellipse(0,.8,10.2,2.1,0,0,Math.PI);c.strokeStyle='#6e7880';c.lineWidth=1.2;c.stroke();
 c.restore();
}
