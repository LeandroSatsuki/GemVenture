import {paintVfxEmission,collectVfxEmission} from './vfx-emission.js';
import {prepareSentinelRewardArt,drawSentinelRewardLabel} from './sentinel-world-rewards.js';
import {damageLabelRoles,appendDamageLabel,damageLabelFrame,labelPriority,damageLabelInFrame} from './damage-labels.js';

import {createMiningPainter,prepareMiningPacket} from './mining-vfx.js';

import {createLightningPainter} from './lightning-vfx.js';

import {createPowerPainter} from './power-vfx.js';

import {createFamilyPainter} from './vfx-family.js';

import {CRYSTAL_VEIN_RAMPS} from './crystal-veins.js';

import {GeodeVfx,isGeodeDamage} from './geode-vfx.js';

import {createPlayerShield} from './player-shield-vfx.js';

import {createPlayerTitan} from './player-titan-vfx.js';

import {createPlayerHeal} from './player-heal-vfx.js';

import {P,GEM_RAMPS} from './palette.js';

import {paintCrisp} from './crisp-layer.js';

import {VfxSprites,vfxStatus} from './vfx-assets.js';

import {MinionEffects} from './minion-effects.js';

// Effects live in 600 × 380 scene coordinates. Their clock never drives gameplay.

const SHADES=Object.fromEntries([...GEM_RAMPS,[P.orange,P.red],[P.lemon,P.gold],[P.silver,P.steel]]);

export const comboTier=n=>n>=20?4:n>=15?3:n>=10?2:n>=5?1:0;

export const comboTitle=n=>['ENCONTRE O PULSO','RESSONÂNCIA','EM CHAMAS','SUPERNOVA','IMPARÁVEL'][comboTier(n)];

const COLORS=['#5ee9e9','#e8ff75','#ef6e10','#f94e6d'];

export class Effects{

 constructor(){prepareSentinelRewardArt();this.mining=createMiningPainter();this.lightning=createLightningPainter(P);this.powerVfx=createPowerPainter(P);this.familyVfx=createFamilyPainter(P);this.geode=new GeodeVfx();this.soft=false;this.sprites=new VfxSprites();this.minions=new MinionEffects();this.playerShield=createPlayerShield();this.playerTitan=createPlayerTitan();this.playerHeal=createPlayerHeal();this.clear();}

 clear(){this.mining.clear();this.geode.clear();this.playerShield.clear();this.playerTitan.clear();this.playerHeal.clear();this.sprites.clear();this.minions.clear();this.particles=[];this.rings=[];this.labels=[];this.beams=[];this.beamSerial=0;this.fireMarks=[];this.buffAccents=[];this.criticalProcSeen=new WeakSet();this.shake=0;this.age=0;this.damageEpoch=0;}

 setSoft(value){this.soft=value;this.sprites.setSoft(value);this.minions.setSoft(value);this.clear();}

 ring(x,y,color,radius=42,duration=.5){this.rings.push({x,y,color,radius,duration,life:duration});if(this.rings.length>18){const small=this.rings.findIndex(r=>r.radius<60);this.rings.splice(small<0?0:small,1);}}

 burst(x,y,color,strength=1,shade=SHADES[color]||P.slate){const count=this.soft?5:Math.round((vfxStatus().ready.length?10:22)*strength);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(25+Math.random()*100)*strength,life=.35+Math.random()*.55;this.particles.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life,total:life,color:i%5===0?P.lemon:color,shade,spark:i%5===0,size:1.5+Math.random()*3,spin:Math.random()*6});}const cap=this.soft?80:420;if(this.particles.length>cap)this.particles.splice(0,this.particles.length-cap);this.ring(x,y,color,30*strength,this.soft?.35:.55);this.shake=Math.min(2.8,Math.max(this.shake,strength));}

 crystalSpark(x,y,{kind=0,id=0}={}){

  const ramp=CRYSTAL_VEIN_RAMPS[(Number(kind)>>>0)%4],count=this.soft?2:5,phase=(Number(id)||0)*.71;

  for(let i=0;i<count;i++){const a=-Math.PI*.88+i*Math.PI*.19+Math.sin(phase)*.2,speed=this.soft?5:20+i*4,life=this.soft?.18:.24+i*.022;

   this.particles.push({x,y,px:x,py:y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-4,life,total:life,color:ramp[3],shade:ramp[0],spark:i%2===0,mineral:true,size:this.soft?1.25:1.15+(i%3)*.4,spin:phase+i*.6});

  }

  const cap=this.soft?80:420;if(this.particles.length>cap)this.particles.splice(0,this.particles.length-cap);

 }

 popup(x,y,text,color,big=false,rewardIcon=undefined){this.labels.push({x,y,text,color,big,rewardIcon,life:big?1.25:1,total:big?1.25:1});if(this.labels.length>28)this.labels.shift();}

 beam(from,to,color,style='legacy'){this.beams.push({from:{...from},to:{...to},color,style,seed:this.beamSerial++,life:.35});if(this.beams.length>12)this.beams.shift();}

 consume(events,project,player,rabbitPlan=null,{treasureCoordinates=null}={}){const miningPacket=prepareMiningPacket(events);let miningPlayer=player;this.geode.consume(events,project,this.age,this.soft);this.playerShield.consume(events);this.playerTitan.consume(events);this.playerHeal.consume(events,this.age);const themedKills=new Set(events.filter(e=>e.type==='kill'&&this.minions.readyDeath(e)).map(e=>e.x+','+e.y));const damageRoles=damageLabelRoles(events);for(const e of events){if(rabbitPlan?.full.has(e))continue;const treasureLoot=e.type==='loot'&&treasureCoordinates?.has(e.x+','+e.y);if(e.type==='proc'&&e.id==='find-chest'&&treasureCoordinates?.has(e.x+','+e.y))continue;if(e.type==='shield'||e.type==='shieldBlock'||e.type==='boost'&&['giant','shield'].includes(e.id))continue;if(e.type==='scroll'){this.damageEpoch++;this.mining.scroll(2,16);miningPlayer={x:miningPlayer.x-4,y:miningPlayer.y-32};this.geode.scroll(2,16);this.sprites.scroll(2,16);this.minions.scroll(2,16);for(const list of [this.particles,this.rings,this.labels,this.fireMarks,this.buffAccents])for(const p of list){p.x-=2;p.y-=16;if(p.px!==undefined){p.px-=2;p.py-=16;}}for(const b of this.beams){b.from.x-=2;b.from.y-=16;b.to.x-=2;b.to.y-=16;}continue;}if(e.type==='dash'){player=project(e.to.x,e.to.y);miningPlayer=player;}const q=Number.isFinite(e.x)?project(e.x,e.y):player,p={x:q.x/2,y:q.y/2-8},color=e.color||'#5ee9e9';

  const powerProc=e.type==='proc'&&['laser','ricochet','ember'].includes(e.id),criticalProc=e.type==='proc'&&['force','talent-critical','lucky'].includes(e.id),luckProc=e.type==='proc'&&e.id==='well-luck',laserWave=e.type==='wave'&&e.source==='laser',powerBoost=e.type==='boost'&&['lightning','magnet','fire'].includes(e.id);

  const themedDeath=e.type==='kill'&&this.minions.death(e,project),themedHit=e.type==='hit'&&themedKills.has(e.x+','+e.y);

  const mineralLoot=miningPacket.loots.has(e),miningContact=miningPacket.contacts.has(e);

  if(e.type==='minibossDefeated'&&e.visualReward){const v=e.visualReward;const items=v.items||[],rise=items.length*24;this.popup(p.x,p.y-50-rise,'+'+v.coins,P.gold,true,'coin');this.popup(p.x,p.y-26-rise,'+'+v.crystals,CRYSTAL_VEIN_RAMPS[v.kind]?.[3]||P.silver,true,v.kind);items.forEach((item,i)=>this.popup(p.x,p.y-26-(items.length-1-i)*24,'+'+item.amount,P.cyan,true,item.item));}
  if(miningContact){const loot=miningPacket.contacts.get(e);this.mining.consume(loot?[e,loot]:[e],project,miningPlayer,this.age,{projected:true});}

  const mineralHit=e.type==='hit'&&e.mineral&&Number.isInteger(e.mineral.kind);const geodeHit=isGeodeDamage(e);const sprite=treasureLoot||mineralLoot||powerProc||criticalProc||luckProc||laserWave||powerBoost||mineralHit||themedDeath||themedHit||geodeHit||rabbitPlan?.hitVisual.has(e)?null:({hit:'impact',loot:e.heavy?'explosion':'reward',kill:'reward',boost:'aura',meteor:'explosion',invader:'aura',bomb:'explosion',slam:'explosion',proc:'aura',enemyAttack:'impact',rockfall:'impact',wave:'explosion',bossDefeated:'reward',nova:'explosion',clear:'reward'})[e.type];

  if(sprite)this.sprites.play(sprite,p.x,p.y,{bombRed:e.type==='bomb',color:e.type==='bomb'?P.red:['slam','meteor','nova'].includes(e.type)?P.orange:e.type==='heal'?P.lime:color,size:e.type==='nova'?190:e.type==='bossDefeated'?115:e.heavy?115:undefined,opacity:e.type==='bomb'?1:sprite==='aura'?.7:.85});

  if(e.type==='hit'){if(!mineralHit&&!themedHit&&!geodeHit&&!rabbitPlan?.hitVisual.has(e))this.burst(p.x,p.y,color,.45);const role=damageRoles.get(e)||'secondary';appendDamageLabel(this.labels,{...e,color:role==='critical'?P.lemon:color},{x:p.x,y:p.y-12},role,this.age,this.damageEpoch,this.soft);}

  if(e.type==='loot'||e.type==='kill'){if(mineralLoot||treasureLoot)this.shake=Math.min(2.8,Math.max(this.shake,e.heavy?2.8:1.2));else if(!themedDeath)this.burst(p.x,p.y,color,e.heavy?2.8:e.type==='kill'?1.5:1.2);if(Number.isFinite(e.value)&&e.value>0&&!e.sentinelRewardCovered)this.popup(p.x,p.y-27,`+${e.value} ◇`,color,true);}

  if(e.type==='item'){this.ring(p.x,p.y,color,55,.6);if(!e.sentinelRewardCovered)this.popup(p.x+18,p.y-45,'+'+e.amount+' '+({blast:'BOMBA',tonic:'PULSO',ward:'ESCUDO'}[e.item]),color,true);}

  if(e.type==='boost'){if(powerBoost){this.buffAccents.push({x:p.x,y:p.y+8,life:.82,total:.82,tier:{lightning:0,magnet:3,fire:2}[e.id]});if(this.buffAccents.length>8)this.buffAccents.shift();}}if(e.type==='meteor'){this.beam({x:p.x-60,y:p.y-170},p,'#ef6e10');this.burst(p.x,p.y,'#ef6e10',3);}if(e.type==='firetrail'){this.fireMarks.push({x:p.x,y:p.y+8,life:.45,total:.45});if(this.fireMarks.length>24)this.fireMarks.shift();}if(e.type==='invader')this.burst(p.x,p.y,'#f94e6d',3);if(e.type==='bomb'||e.type==='slam'){this.burst(p.x,p.y,e.type==='bomb'?P.red:'#ef6e10',2.8,e.type==='bomb'?P.maroon:undefined);this.ring(p.x,p.y,e.type==='bomb'?P.red:'#e8ff75',95,.7);}

  // Criticals and green luck use distinct crisp silhouettes, never the old body flame.

  if((criticalProc||luckProc)&&!this.criticalProcSeen.has(e)){this.criticalProcSeen.add(e);const duration=criticalProc?.82:.64;this.buffAccents.push({x:p.x,y:p.y+8,life:duration,total:duration,tier:1,kind:criticalProc?'critical':'luck'});if(this.buffAccents.length>8)this.buffAccents.shift();}

  // Generic confirmations use the shared crisp facet clip, without a second old aura/ring burst.

  if(e.type==='enemyAttack')this.burst(p.x,p.y,color,.8);

  if(e.type==='enemyStep')this.ring(p.x,p.y+8,color,10,.22);

  if(e.type==='bump')this.ring(p.x+e.dx*9,p.y+8+e.dy*6,P.cyan,12,.2);

  if(e.type==='sprout')this.ring(p.x,p.y+8,color,22,.6);

  if(e.type==='rockfall'||e.type==='rockfallDust'){this.burst(p.x,p.y+8,P.steel,e.type==='rockfall'?.6:.25);}

  if(laserWave){const a=project(e.x,e.y),range=e.range===5?5:0;for(const [dx,dy]of [[-range,0],[range,0],[0,-range],[0,range]]){const b=project(e.x+dx,e.y+dy);this.beam({x:a.x/2,y:a.y/2-8},{x:b.x/2,y:b.y/2-8},P.cyan,'lightning');}}

  if(e.type==='wave'&&!laserWave){this.ring(p.x,p.y,color,125,.7);this.ring(p.x,p.y,'#e8ff75',95,.55);this.burst(p.x,p.y,color,2);this.popup(p.x,p.y-35,'ONDA DE CHOQUE',color,true);}

  if(e.type==='echo'){const a=project(e.from.x,e.from.y);this.beam({x:a.x/2,y:a.y/2-8},p,P.cyan,'lightning');}

  if(e.type==='bossDefeated'){for(let i=0;i<4;i++)this.ring(p.x,p.y,COLORS[i],280-i*35,.8+i*.12);this.burst(p.x,p.y,'#f94e6d',3);this.popup(p.x,p.y-40,'CHEFE DERROTADO','#e8ff75',true);}

  if(e.type==='nova'){for(let i=0;i<4;i++)this.ring(p.x,p.y,COLORS[i],320-i*38,.7+i*.13);this.burst(p.x,p.y,'#ef6e10',3);this.popup(p.x,p.y-36,'RUPTURA TOTAL','#e8ff75',true);}

  if(e.type==='clear'){this.ring(player.x/2,player.y/2,'#5ee9e9',260,1);this.burst(player.x/2,player.y/2,'#e8ff75',2);}

 }}

 update(dt){this.sprites.update(dt);this.minions.update(dt);this.age+=dt;this.mining.update(this.age);this.geode.update(this.age);this.shake=Math.max(0,this.shake-dt*9);for(const p of this.particles){p.life-=dt;p.px=p.x;p.py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;p.vx*=Math.exp(-dt*2);p.spin+=dt*5;}for(const list of [this.rings,this.labels,this.beams,this.fireMarks,this.buffAccents])for(const p of list)p.life-=dt;this.particles=this.particles.filter(p=>p.life>0);this.rings=this.rings.filter(p=>p.life>0);this.labels=this.labels.filter(p=>p.life>0);this.beams=this.beams.filter(p=>p.life>0);this.fireMarks=this.fireMarks.filter(p=>p.life>0);this.buffAccents=this.buffAccents.filter(p=>p.life>0);}

 draw(c,combo=0,sprites=true,labels=true,miningSoft=this.soft){paintVfxEmission(c,collectVfxEmission(this,{includeMining:false,includeSprites:false,includeActors:false}),{soft:this.soft});c.save();c.globalCompositeOperation='source-over';for(const r of this.rings){const k=1-r.life/r.duration;c.globalAlpha=(1-k)*(this.soft?.25:.55);c.strokeStyle=r.color;c.lineWidth=(1-k)*3+.5;c.beginPath();c.ellipse(r.x,r.y,Math.max(1,r.radius*k),Math.max(1,r.radius*k*.6),0,0,Math.PI*2);c.stroke();}

 for(const b of this.beams){if(b.style==='lightning'){c.globalAlpha=1;this.lightning.draw(c,b.from,b.to,.35-b.life,{soft:this.soft,seed:b.seed});continue;}c.globalAlpha=b.life/.35;c.strokeStyle=b.color;c.lineWidth=this.soft?2:5;c.beginPath();c.moveTo(b.from.x,b.from.y);c.lineTo((b.from.x+b.to.x)/2-8,(b.from.y+b.to.y)/2+6);c.lineTo(b.to.x,b.to.y);c.stroke();}

 for(const a of this.buffAccents){c.save();c.globalAlpha=1;c.translate(a.x,a.y);this.familyVfx.draw(c,a.kind||'combo',a.total-a.life,{soft:this.soft,tier:a.tier});c.restore();}

 for(const p of this.particles){c.globalAlpha=Math.min(1,p.life/p.total*1.4);c.fillStyle=p.color;c.save();c.translate(p.x,p.y);c.rotate(p.spin);const s=p.size;c.beginPath();if(p.spark){c.moveTo(0,-s*1.5);c.lineTo(s*.3,-s*.3);c.lineTo(s,0);c.lineTo(s*.3,s*.3);c.lineTo(0,s*1.5);c.lineTo(-s*.3,s*.3);c.lineTo(-s,0);c.lineTo(-s*.3,-s*.3);}else{c.moveTo(0,-s);c.lineTo(s*.65,0);c.lineTo(0,s*1.4);c.lineTo(-s*.65,0);}c.closePath();c.fill();if(!p.spark&&!this.soft){c.fillStyle=p.shade;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.65,0);c.lineTo(0,s*1.4);c.closePath();c.fill();}c.restore();}c.globalCompositeOperation='source-over';

 c.globalAlpha=1;if(sprites)this.sprites.draw(c);

 this.mining.draw(c,this.age,{soft:miningSoft});

 if(labels)this.drawLabels(c);

 c.restore();}

 emissionSources(options={}){return collectVfxEmission(this,options);}
 latestLightningAge(){const b=this.beams.findLast(b=>b.style==='lightning');return b?.life>0?.35-b.life:Infinity;}

 drawFireFloor(c){for(const m of this.fireMarks){c.save();c.globalAlpha*=m.life/m.total;this.powerVfx.drawBurn(c,{x:m.x,y:m.y},this.age*2,{soft:this.soft});c.restore();}}

 geodeWarningBeat(beat,paused=false){return this.geode.visualBeat(beat,paused);}

 drawGeodeFloor(c,options={}){this.geode.draw(c,this.age,{layer:'floor',soft:this.soft||!!options.soft});}

 drawGeodeChips(c,options={}){this.geode.draw(c,this.age,{layer:'chips',soft:this.soft||!!options.soft});}

 drawPlayerShield(c,bodyWorld,options){return this.playerShield.draw(c,bodyWorld,{...options,time:this.age});}

 drawPlayerHeal(c,bodyWorld,options={}){return this.playerHeal.draw(c,bodyWorld,this.age,options);}

 drawPlayerTitan(c,options){return this.playerTitan.draw(c,{...options,time:this.age});}

 drawLabels(c){paintCrisp(c,c=>{c.save();const matrix=c.getTransform?.();for(const p of [...this.labels].sort((a,b)=>labelPriority(a)-labelPriority(b))){const k=1-p.life/p.total,f=p.damageRole?damageLabelFrame(p,this.soft):null;c.globalAlpha=f?f.alpha:Math.min(1,p.life*3);c.font=`bold ${f?f.font:p.big?18:12}px 'Chakra Petch', monospace`;c.textAlign='center';if(f&&!damageLabelInFrame(p,f,matrix,c.canvas?.width,c.canvas?.height,c.measureText?.(p.text)?.width))continue;c.lineWidth=3;c.strokeStyle='#180d2f';const y=f?f.y:p.y-(this.soft?8:k*30),scale=f?f.scale:this.soft?1:1+Math.max(0,1-k*7)*.45;c.save();c.translate(p.x,y);c.scale(scale,scale);if(drawSentinelRewardLabel(c,p)){c.restore();continue;}c.strokeText(p.text,0,0);c.fillStyle=p.color;c.fillText(p.text,0,0);c.restore();}c.restore();});}

}

