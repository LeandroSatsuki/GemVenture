import {P,GEM_RAMPS} from './palette.js';
// Effects live in 600 × 380 scene coordinates. Their clock never drives gameplay.
const SHADES=Object.fromEntries([...GEM_RAMPS,[P.orange,P.red],[P.lemon,P.gold],[P.silver,P.steel]]);
export const comboTier=n=>n>=20?4:n>=15?3:n>=10?2:n>=5?1:0;
export const comboTitle=n=>['ENCONTRE O PULSO','RESSONÂNCIA','EM CHAMAS','SUPERNOVA','IMPARÁVEL'][comboTier(n)];
const COLORS=['#5ee9e9','#e8ff75','#ef6e10','#f94e6d'];
export class Effects{
 constructor(){this.soft=false;this.clear();}
 clear(){this.particles=[];this.rings=[];this.labels=[];this.beams=[];this.shake=0;this.age=0;}
 setSoft(value){this.soft=value;this.clear();}
 ring(x,y,color,radius=42,duration=.5){this.rings.push({x,y,color,radius,duration,life:duration});if(this.rings.length>18){const small=this.rings.findIndex(r=>r.radius<60);this.rings.splice(small<0?0:small,1);}}
 burst(x,y,color,strength=1){const count=this.soft?5:Math.round(22*strength);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(25+Math.random()*100)*strength,life=.35+Math.random()*.55;this.particles.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life,total:life,color:i%5===0?P.lemon:color,shade:SHADES[color]||P.slate,spark:i%5===0,size:1.5+Math.random()*3,spin:Math.random()*6});}const cap=this.soft?80:420;if(this.particles.length>cap)this.particles.splice(0,this.particles.length-cap);this.ring(x,y,color,30*strength,this.soft?.35:.55);this.shake=Math.min(2.8,Math.max(this.shake,strength));}
 popup(x,y,text,color,big=false){this.labels.push({x,y,text,color,big,life:big?1.25:1,total:big?1.25:1});if(this.labels.length>28)this.labels.shift();}
 beam(from,to,color){this.beams.push({from,to,color,life:.35});if(this.beams.length>12)this.beams.shift();}
 consume(events,project,player){let hitCount=0;for(const e of events){if(e.type==='scroll'){for(const list of [this.particles,this.rings,this.labels])for(const p of list){p.x-=2;p.y-=16;if(p.px!==undefined){p.px-=2;p.py-=16;}}for(const b of this.beams){b.from.x-=2;b.from.y-=16;b.to.x-=2;b.to.y-=16;}continue;}if(e.type==='dash')player=project(e.to.x,e.to.y);const q=Number.isFinite(e.x)?project(e.x,e.y):player,p={x:q.x/2,y:q.y/2-8},color=e.color||'#5ee9e9';
  if(e.type==='hit'){this.burst(p.x,p.y,color,.45);if(hitCount++<8)this.popup(p.x,p.y-12,Number(e.damage.toFixed(2)).toLocaleString('pt-BR'),color);}
  if(e.type==='loot'||e.type==='kill'){this.burst(p.x,p.y,color,e.heavy?2.8:e.type==='kill'?1.5:1.2);this.popup(p.x,p.y-27,`+${e.value||4} ◇`,color,true);}
  if(e.type==='item'){this.ring(p.x,p.y,color,55,.6);this.popup(p.x+18,p.y-45,'+'+e.amount+' '+({blast:'BOMBA',tonic:'PULSO',ward:'ESCUDO'}[e.item]),color,true);}
  if(e.type==='boost'){this.burst(p.x,p.y,color,3);this.ring(p.x,p.y,color,200,.9);}if(e.type==='meteor'){this.beam({x:p.x-60,y:p.y-170},p,'#ef6e10');this.burst(p.x,p.y,'#ef6e10',3);}if(e.type==='firetrail')this.burst(p.x,p.y,'#ef6e10',.6);if(e.type==='invader')this.burst(p.x,p.y,'#f94e6d',3);if(e.type==='bomb'||e.type==='slam'){this.burst(p.x,p.y,'#ef6e10',2.8);this.ring(p.x,p.y,'#e8ff75',95,.7);}
  if(e.type==='heal'||e.type==='shield'){this.ring(p.x,p.y,color,55,.8);this.popup(p.x,p.y-32,e.type==='heal'?'+'+Math.round(e.value||25)+' VIDA':'ESCUDO',color,true);}
  if(e.type==='proc'){this.ring(p.x,p.y,color,this.soft?38:74,.65);if(!this.soft)this.burst(p.x,p.y,color,1.15);}
  if(e.type==='shieldBlock')this.ring(p.x,p.y,'#ece910',38,.3);
  if(e.type==='enemyAttack')this.burst(p.x,p.y,color,.8);
  if(e.type==='enemyStep')this.ring(p.x,p.y+8,color,10,.22);
  if(e.type==='bump')this.ring(p.x+e.dx*9,p.y+8+e.dy*6,P.cyan,12,.2);
  if(e.type==='sprout')this.ring(p.x,p.y+8,color,22,.6);
  if(e.type==='rockfall'||e.type==='rockfallDust'){this.burst(p.x,p.y+8,P.steel,e.type==='rockfall'?.6:.25);}
  if(e.type==='wave'){this.ring(p.x,p.y,color,125,.7);this.ring(p.x,p.y,'#e8ff75',95,.55);this.burst(p.x,p.y,color,2);this.popup(p.x,p.y-35,'ONDA DE CHOQUE',color,true);}
  if(e.type==='echo'){const a=project(e.from.x,e.from.y);this.beam({x:a.x/2,y:a.y/2-8},p,'#47f641');}
  if(e.type==='bossDefeated'){for(let i=0;i<4;i++)this.ring(p.x,p.y,COLORS[i],280-i*35,.8+i*.12);this.burst(p.x,p.y,'#f94e6d',3);this.popup(p.x,p.y-40,'CHEFE DERROTADO','#e8ff75',true);}
  if(e.type==='nova'){for(let i=0;i<4;i++)this.ring(p.x,p.y,COLORS[i],320-i*38,.7+i*.13);this.burst(p.x,p.y,'#ef6e10',3);this.popup(p.x,p.y-36,'RUPTURA TOTAL','#e8ff75',true);}
  if(e.type==='perfect'&&(e.combo>0&&e.combo%5===0)){this.ring(player.x/2,player.y/2-7,COLORS[Math.min(3,comboTier(e.combo)-1)],85+comboTier(e.combo)*20,.8);}
  if(e.type==='clear'){this.ring(player.x/2,player.y/2,'#5ee9e9',260,1);this.burst(player.x/2,player.y/2,'#e8ff75',2);}
 }}
 update(dt){this.age+=dt;this.shake=Math.max(0,this.shake-dt*9);for(const p of this.particles){p.life-=dt;p.px=p.x;p.py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;p.vx*=Math.exp(-dt*2);p.spin+=dt*5;}for(const list of [this.rings,this.labels,this.beams])for(const p of list)p.life-=dt;this.particles=this.particles.filter(p=>p.life>0);this.rings=this.rings.filter(p=>p.life>0);this.labels=this.labels.filter(p=>p.life>0);this.beams=this.beams.filter(p=>p.life>0);}
 draw(c,combo=0){c.save();c.globalCompositeOperation='source-over';for(const r of this.rings){const k=1-r.life/r.duration;c.globalAlpha=(1-k)*(this.soft?.25:.55);c.strokeStyle=r.color;c.lineWidth=(1-k)*3+.5;c.beginPath();c.ellipse(r.x,r.y,Math.max(1,r.radius*k),Math.max(1,r.radius*k*.6),0,0,Math.PI*2);c.stroke();}
 for(const b of this.beams){c.globalAlpha=b.life/.35;c.strokeStyle=b.color;c.lineWidth=this.soft?2:5;c.beginPath();c.moveTo(b.from.x,b.from.y);c.lineTo((b.from.x+b.to.x)/2-8,(b.from.y+b.to.y)/2+6);c.lineTo(b.to.x,b.to.y);c.stroke();}
 for(const p of this.particles){c.globalAlpha=Math.min(1,p.life/p.total*1.4);c.fillStyle=p.color;c.save();c.translate(p.x,p.y);c.rotate(p.spin);const s=p.size;c.beginPath();if(p.spark){c.moveTo(0,-s*1.5);c.lineTo(s*.3,-s*.3);c.lineTo(s,0);c.lineTo(s*.3,s*.3);c.lineTo(0,s*1.5);c.lineTo(-s*.3,s*.3);c.lineTo(-s,0);c.lineTo(-s*.3,-s*.3);}else{c.moveTo(0,-s);c.lineTo(s*.65,0);c.lineTo(0,s*1.4);c.lineTo(-s*.65,0);}c.closePath();c.fill();if(!p.spark&&!this.soft){c.fillStyle=p.shade;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.65,0);c.lineTo(0,s*1.4);c.closePath();c.fill();}c.restore();}c.globalCompositeOperation='source-over';
 for(const p of this.labels){const k=1-p.life/p.total;c.globalAlpha=Math.min(1,p.life*3);c.font=`bold ${p.big?18:12}px 'Chakra Petch', monospace`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#180d2f';const y=p.y-(this.soft?8:k*30),scale=this.soft?1:1+Math.max(0,1-k*7)*.45;c.save();c.translate(p.x,y);c.scale(scale,scale);c.strokeText(p.text,0,0);c.fillStyle=p.color;c.fillText(p.text,0,0);c.restore();}
 c.restore();}
}
