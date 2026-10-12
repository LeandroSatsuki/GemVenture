import {rng,BIOMES,biomeIndex} from './engine.js';
const polygon=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
function crystal(c,x,y,w,h,palette,angle=0){c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle);polygon(c,[[0,-h],[-w*.55,-h*.67],[-w*.5,-5],[0,0],[w*.55,-5],[w*.55,-h*.67]],palette[0]);polygon(c,[[0,-h],[-w*.55,-h*.67],[0,-h*.5],[0,0],[w*.55,-5],[w*.55,-h*.67]],palette[1]);polygon(c,[[0,-h],[0,0],[w*.55,-5],[w*.55,-h*.67]],palette[2]);polygon(c,[[0,-h],[-w*.55,-h*.67],[0,-h*.5],[w*.55,-h*.67]],palette[3]);c.fillStyle=palette[3];c.fillRect(-w*.3,-h*.59,2,h*.25);c.restore();}
function mushroom(c,x,y,size,color){c.fillStyle='#ffce91';c.fillRect(x-1,y-size,3,size);polygon(c,[[x-size,y-size],[x-size,y-size*1.3],[x-size*.55,y-size*1.7],[x+size*.45,y-size*1.7],[x+size,y-size*1.25],[x+size,y-size]],color);c.fillStyle='#ffee83';c.fillRect(x-3,y-size*1.5,2,2);c.fillRect(x+3,y-size*1.2,2,2);}
export class CaveArt{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.background=document.createElement('canvas');this.background.width=480;this.background.height=270;this.particles=[];this.texts=[];this.shake=0;this.swing=0;this.last=performance.now();this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 rebuild(state){this.state=state;const c=this.background.getContext('2d');const r=rng(state.seed+state.floor*19+state.run*113);const b=biomeIndex(state.floor),bio=BIOMES[b];this.bio=bio;this.biome=b;c.imageSmoothingEnabled=false;c.fillStyle=bio.colors[0];c.fillRect(0,0,480,270);
 // Layered silhouettes, strata, and individual rock faces form a seeded cave.
 polygon(c,[[0,0],[480,0],[480,164],[433,147],[411,100],[376,89],[351,62],[280,46],[209,71],[165,111],[102,125],[68,174],[0,170]],'#1a1516');
 for(let i=0;i<45;i++){const x=r()*480,y=r()*190,w=15+r()*70,h=12+r()*55;polygon(c,[[x,y],[x+w*.65,y-7],[x+w,y+h*.4],[x+w*.8,y+h],[x,y+h*.85]],r()>.45?bio.colors[0]:'#21181b');}
 // Blue and green shadows keep every region legible without losing its palette.
 for(let i=0;i<17;i++){const x=35+r()*420,y=95+r()*85;crystal(c,x,y,8+r()*14,17+r()*48,[bio.colors[0],bio.colors[0],bio.colors[1],bio.colors[1]],(r()-.5)*.7);}
 c.globalAlpha=.19;for(let i=0;i<5;i++){polygon(c,[[175+i*12,0],[186+i*12,0],[245+i*30,200],[220+i*25,210]],bio.gem[1]);}c.globalAlpha=1;
 for(let i=0;i<35;i++){const x=i*15-10,h=18+r()*61;polygon(c,[[x,0],[x+24,0],[x+22,h*.35],[x+12,h],[x+6,h*.65]],i%3?bio.colors[0]:bio.colors[1]);if(i%4===0){c.fillStyle=bio.colors[2];c.fillRect(x+8,3,3,h*.36);}}
 // Hanging vines, amber ribs, or lava seams distinguish each biome.
 if(b===1){for(let i=0;i<25;i++){let x=r()*480,y=r()*28;const length=15+r()*80;c.fillStyle='#3b7d4f';c.fillRect(x,y,2,length);for(let k=0;k<length;k+=9){polygon(c,[[x,y+k],[x-6,y+k-3],[x-4,y+k+5]],k%2?'#63ab3f':'#2a594f');polygon(c,[[x+2,y+k+3],[x+8,y+k],[x+5,y+k+7]],'#3b7d4f');}}}
 if(b===2){c.save();c.translate(324,115);c.rotate(-.3);c.strokeStyle='#bd6a62';c.lineWidth=3;c.beginPath();c.moveTo(-45,0);c.quadraticCurveTo(0,-13,49,2);c.stroke();for(let i=-35;i<40;i+=11){c.beginPath();c.ellipse(i,-5,5,19,0,0,Math.PI*1.7);c.stroke();}c.fillStyle='#ffce91';c.fillRect(43,-10,14,12);c.fillStyle='#2c2025';c.fillRect(51,-7,4,4);c.restore();for(let i=0;i<3;i++){c.strokeStyle='#8f4d57';c.lineWidth=2;c.beginPath();c.arc(65+i*154,150-i*12,10,0,Math.PI*1.75);c.stroke();}}
 if(b===3){for(let i=0;i<8;i++){const x=r()*480;c.fillStyle='#ad2f45';c.fillRect(x,70+r()*60,3,100);c.fillStyle='#de523e';c.fillRect(x,120+r()*40,2,50);}}
 // Tiered cave floor with chipped, stratified edges.
 polygon(c,[[0,156],[55,147],[95,154],[140,149],[169,161],[208,152],[260,159],[300,145],[357,151],[406,140],[480,160],[480,270],[0,270]],bio.colors[1]);
 polygon(c,[[0,165],[65,158],[98,164],[151,158],[198,169],[241,162],[299,157],[345,162],[415,151],[480,172],[480,270],[0,270]],bio.colors[0]);
 polygon(c,[[0,213],[65,200],[125,217],[173,207],[235,217],[283,198],[346,210],[389,202],[442,216],[480,205],[480,270],[0,270]],bio.colors[1]);
 polygon(c,[[0,224],[65,209],[125,226],[173,216],[235,226],[283,207],[346,219],[389,211],[442,225],[480,214],[480,270],[0,270]],'#21181b');
 for(let i=0;i<185;i++){const x=Math.floor(r()*480),y=158+Math.floor(r()*112);c.fillStyle=[bio.colors[0],bio.colors[1],bio.colors[2],'#2c2025'][Math.floor(r()*4)];c.fillRect(x,y,2+r()*9,1+r()*3);}
 for(let i=0;i<32;i++){const x=r()*480,y=165+r()*83;polygon(c,[[x,y],[x+3,y-4],[x+10,y-4],[x+15,y],[x+11,y+4],[x+2,y+3]],bio.colors[0]);c.fillStyle=bio.colors[2];c.fillRect(x+3,y-3,6,1);}
 if(b===1){for(let i=0;i<20;i++)mushroom(c,r()*480,160+r()*85,3+r()*5,i%2?'#fea7a7':'#92e8c0');}
 if(b===3){polygon(c,[[0,244],[74,238],[140,250],[215,243],[290,252],[389,242],[480,251],[480,270],[0,270]],'#ad2f45');polygon(c,[[0,253],[74,247],[140,259],[215,252],[290,261],[389,251],[480,260],[480,270],[0,270]],'#de523e');for(let i=0;i<28;i++){c.fillStyle=i%2?'#ffae70':'#e67839';c.fillRect(r()*480,255+r()*15,8+r()*23,2);}}
 // Tiny elevator: a visual anchor for returning to the surface.
 c.fillStyle='#1a1516';c.fillRect(18,124,30,54);c.fillStyle='#8f4d57';c.fillRect(18,120,3,58);c.fillRect(45,120,3,58);c.fillRect(18,120,30,4);c.fillStyle='#bd6a62';c.fillRect(19,176,31,4);c.fillStyle='#52333f';c.fillRect(24,134,18,39);c.fillStyle='#1a1516';for(let i=0;i<4;i++)c.fillRect(26+i*4,136,2,33);c.fillStyle='#686f99';c.fillRect(31,0,2,120);c.fillRect(36,0,2,120);c.fillStyle='#ffee83';c.fillRect(30,125,7,4);c.fillStyle='#ffae70';c.fillRect(12,153,3,7);
 // Foreground silhouettes frame the playable crystals.
 for(let i=0;i<9;i++){const x=i*62-20;polygon(c,[[x,270],[x+4,249-r()*10],[x+15,249-r()*9],[x+27,270]],'#1a1516');}
 this.particles=[];this.texts=[];
 }
 burst(node,color,earned,perfect){this.swing=1;this.shake=this.reduced?0:perfect?4:2;const count=this.reduced?4:perfect?28:13;for(let i=0;i<count;i++)this.particles.push({x:node.x/2,y:node.y/2-12,vx:(Math.random()-.5)*100,vy:-20-Math.random()*85,life:.4+Math.random()*.5,color:i%4===0?'#ffee83':color,size:1+Math.random()*2});if(earned)this.texts.push({x:node.x/2,y:node.y/2-36,text:'+'+earned+' gemas',life:1.4,color:'#92e8c0'});else this.texts.push({x:node.x/2,y:node.y/2-40,text:perfect?'PERFEITO!':'TIC!',life:.8,color:perfect?'#ffee83':'#a3a7c2'});}
 draw(time,state,selected,paused){const dt=Math.min((time-this.last)/1000,.04);this.last=time;const c=this.ctx;c.imageSmoothingEnabled=false;c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,480,270);c.save();if(this.shake>.1){c.translate(Math.round((Math.random()-.5)*this.shake),Math.round((Math.random()-.5)*this.shake));this.shake*=.8;}c.drawImage(this.background,0,0);
 const t=paused?0:time/1000;
 for(let i=0;i<29;i++){const x=(i*47.31+Math.sin(t*.25+i)*8)%480,y=55+(i*29.17+Math.cos(t*.32+i)*8)%168;c.globalAlpha=.18+((Math.sin(t*1.6+i)+1)*.24);c.fillStyle=this.bio.gem[2];c.fillRect(Math.floor(x),Math.floor(y),i%7===0?2:1,i%7===0?2:1);}c.globalAlpha=1;
 for(const n of state.nodes){const x=n.x/2,y=n.y/2,w=n.size/2;if(n.hp<=0){c.fillStyle=this.bio.colors[1];c.fillRect(x-9,y-1,18,4);c.fillStyle=this.bio.gem[0];c.fillRect(x-5,y-3,3,3);c.fillRect(x+5,y-4,4,4);continue;}
 c.globalAlpha=.11;c.fillStyle=this.bio.gem[2];c.beginPath();c.ellipse(x,y-11,30,24,0,0,7);c.fill();c.globalAlpha=1;
 polygon(c,[[x-w*1.4,y],[x-w,y-7],[x+w,y-6],[x+w*1.5,y+1],[x+w,y+6],[x-w,y+6]],this.bio.colors[1]);
 crystal(c,x-w*.65,y,w*.7,w*1.65,this.bio.gem,-.36);crystal(c,x+w*.6,y+1,w*.72,w*1.8,this.bio.gem,.4);crystal(c,x,y+2,w,w*(2.2+n.variant*.18),this.bio.gem,.04);crystal(c,x+w*.18,y+4,w*.5,w*.96,this.bio.gem,-.2);
 if(n.hp<n.maxHp){c.strokeStyle=this.bio.gem[0];c.lineWidth=1;c.beginPath();c.moveTo(x-4,y-w*1.7);c.lineTo(x+3,y-w*1.3);c.lineTo(x-2,y-w*.8);c.lineTo(x+4,y-w*.4);c.stroke();}
 if(n.id===selected){const pulse=this.reduced?0:Math.sin(t*5)*2;c.strokeStyle='#92e8c0';c.lineWidth=1;const a=23+pulse;for(const [dx,dy,sx,sy] of [[-a,-a-13,1,1],[a,-a-13,-1,1],[-a,8,1,-1],[a,8,-1,-1]]){c.beginPath();c.moveTo(x+dx,y+dy+sy*5);c.lineTo(x+dx,y+dy);c.lineTo(x+dx+sx*5,y+dy);c.stroke();}c.fillStyle='#ffffff';c.fillRect(x-1,y-w*2.3-8,2,3);}
 if(!this.reduced&&Math.sin(t*2+n.id*2)> .96){c.fillStyle='#ffffff';c.fillRect(x+6,y-23,1,7);c.fillRect(x+3,y-20,7,1);}
 }
 // Miner, backpack, lamp and the single upgradable pickaxe.
 const px=238,py=191,bob=this.reduced||paused?0:Math.floor(Math.sin(t*3)*1);c.save();c.translate(px,py+bob);c.fillStyle='#1a1516';c.fillRect(-9,9,21,4);c.fillStyle='#454a6a';c.fillRect(-8,-13,7,18);c.fillStyle='#bd6a62';c.fillRect(-5,-7,13,15);c.fillStyle='#ffce91';c.fillRect(-5,-20,12,12);c.fillStyle='#1a1516';c.fillRect(4,-16,2,3);c.fillStyle='#f0b541';c.fillRect(-8,-25,15,6);c.fillStyle='#e67839';c.fillRect(-10,-20,20,3);c.fillStyle='#ffee83';c.fillRect(2,-24,6,5);c.fillStyle='#1d2235';c.fillRect(-5,5,5,7);c.fillRect(4,5,5,7);c.fillStyle='#ffce91';c.fillRect(7,-8,5,4);c.save();c.translate(13,-7);c.rotate(-.4-this.swing*1.1);c.fillStyle='#bd6a62';c.fillRect(-1,-10,3,22);polygon(c,[[-12,-12],[-5,-16],[6,-14],[13,-7],[3,-10],[-5,-11]],this.bio.gem[2]);c.restore();c.restore();this.swing=Math.max(0,this.swing-dt*5);
 if(!paused){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;p.life-=dt;}for(const f of this.texts){f.y-=17*dt;f.life-=dt;}}
 this.particles=this.particles.filter(p=>p.life>0);for(const p of this.particles){c.globalAlpha=Math.min(1,p.life*3);c.fillStyle=p.color;c.fillRect(Math.floor(p.x),Math.floor(p.y),p.size,p.size);}c.globalAlpha=1;this.texts=this.texts.filter(f=>f.life>0);c.textAlign='center';c.font='bold 8px monospace';for(const f of this.texts){c.globalAlpha=Math.min(1,f.life*2);c.fillStyle='#1a1516';c.fillText(f.text,f.x+1,f.y+1);c.fillStyle=f.color;c.fillText(f.text,f.x,f.y);}c.globalAlpha=1;c.restore();
 if(paused){c.fillStyle='#1a151699';c.fillRect(0,0,480,270);c.textAlign='center';c.fillStyle='#92e8c0';c.font='bold 14px monospace';c.fillText('PAUSA',240,128);c.fillStyle='#a3a7c2';c.font='9px monospace';c.fillText('Seu próximo brilho pode esperar.',240,147);} }
}
