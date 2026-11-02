// Isolated art candidate: five meanings, one vocabulary of facets and clean accents.
export const FAMILY_SPECS=Object.freeze({impact:{duration:.34},heal:{duration:.64},reward:{duration:.78},shield:{duration:2.1},combo:{duration:.82},critical:{duration:.82},luck:{duration:.64}});
const clamp=n=>Math.max(0,Math.min(1,n)),out=n=>1-(1-clamp(n))**3;
const q=n=>Math.round(n*2)/2;
const fade=(age,duration)=>clamp(age/.035)*clamp((duration-age)/Math.min(.2,duration*.45));
export function shieldOutline(radius=28){
  const x=radius*Math.sqrt(3)/2;
  return [[0,-radius],[x,-radius/2],[x,radius/2],[0,radius],[-x,radius/2],[-x,-radius/2]];
}

export function sampleFamily(kind,age,{soft=false,tier=0,activeLength=1.8}={}){
  if(!FAMILY_SPECS[kind]||!Number.isFinite(age)||age<0)return null;
  const duration=kind==='shield'?activeLength+.23:FAMILY_SPECS[kind].duration;
  if(age>=duration)return null;
  return {kind,age,duration,phase:age/duration,alpha:fade(age,duration),soft:!!soft,
    tier:Math.max(0,Math.min(3,Math.trunc(tier)||0)),entry:out(age/.16),
    release:kind==='shield'?clamp((age-activeLength)/.23):0};
}

export function createFamilyPainter(P){
  let glowLevel=1;
  function halo(c,points,color){
    if(!glowLevel)return;
    c.save();try{
      c.strokeStyle=color;c.lineJoin='round';
      c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();
      const alpha=c.globalAlpha;c.lineWidth=3;c.globalAlpha=alpha*.075*glowLevel;c.stroke();
      c.lineWidth=1.5;c.globalAlpha=alpha*.17*glowLevel;c.stroke();
    }finally{c.restore();}
  }
  const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();c.fill();};
  function diamond(c,x,y,w,h,base,shade,accent=true){
    halo(c,[[x,y-h],[x+w,y-h*.12],[x,y+h],[x-w,y-h*.12]],base);
    poly(c,[[x,y-h],[x+w,y-h*.12],[x,y+h],[x-w,y-h*.12]],base);
    poly(c,[[x,y-h],[x+w,y-h*.12],[x,y+h],[x,y]],shade);
    if(accent)poly(c,[[x,y-h],[x-w*.55,y-h*.35],[x,y-h*.12]],P.lemon);
  }
  function flare(c,x,y,r,base,shade){
    const a=r*.26;
    halo(c,[[x,y-r],[x+a,y-a],[x+r,y],[x+a,y+a],[x,y+r],[x-a,y+a],[x-r,y],[x-a,y-a]],base);
    poly(c,[[x,y-r],[x+a,y-a],[x+r,y],[x+a,y+a],[x,y+r],[x-a,y+a],[x-r,y],[x-a,y-a]],base);
    poly(c,[[x,y],[x+a,y+a],[x,y+r],[x-a,y+a]],shade);
    poly(c,[[x,y-r*.76],[x+r*.12,y-r*.12],[x,y],[x-r*.12,y-r*.12]],P.lemon);
  }
  function impact(c,f){
    const reach=f.soft?3:out(f.age/.23)*17,spread=1-f.phase*.6;
    if(f.age<.17)flare(c,0,0,(f.soft?4:10)*(1-f.age/.22),P.cyan,P.blue);
    for(let i=0;i<(f.soft?2:5);i++){
      const a=-2.7+i*.83,x=Math.cos(a)*reach,y=Math.sin(a)*reach-f.phase*2;
      diamond(c,x,y,(2.2-i*.16)*spread,(3.4-i*.16)*spread,P.cyan,P.blue,i===1);
    }
  }
  function reward(c,f){
    const u=out(f.phase),count=f.soft?1:3;
    if(f.age<.21)flare(c,0,-5,8.5*(1-f.age/.25),P.lemon,P.gold);
    for(let i=0;i<count;i++){
      const lane=i-(count-1)/2,x=f.soft?0:lane*(5+u*8),y=-5-(f.soft?2:u*20)+Math.abs(lane)*3;
      const scale=clamp((f.age-i*.035)/.1)*(1-f.phase*.35);
      diamond(c,x,y,4.5*scale,7*scale,P.cyan,P.blue,true);
    }
    if(!f.soft&&f.phase<.65){flare(c,-12*u,-12-10*u,2.2*(1-f.phase),P.lemon,P.gold);flare(c,12*u,-9-9*u,1.7*(1-f.phase),P.lemon,P.gold);}
  }
  function heal(c,f){
    for(let i=0;i<(f.soft?1:3);i++){
      const a=clamp((f.age-i*.045)/.14),x=f.soft?12:(i-1)*12,y=-20-(f.soft?0:out(f.phase)*11)-(i===1?9:0),s=(i===1?3.8:3.1)*a;
      if(s<=0)continue;
      halo(c,[[x-s*.34,y-s],[x+s*.34,y-s],[x+s*.34,y-s*.34],[x+s,y-s*.34],[x+s,y+s*.34],[x+s*.34,y+s*.34],[x+s*.34,y+s],[x-s*.34,y+s],[x-s*.34,y+s*.34],[x-s,y+s*.34],[x-s,y-s*.34],[x-s*.34,y-s*.34]],P.lime);
      c.fillStyle=P.green;c.fillRect(q(x-s),q(y-s*.34+1),q(s*2),q(s*.68));c.fillRect(q(x-s*.34),q(y-s+1),q(s*.68),q(s*2));
      c.fillStyle=P.lime;c.fillRect(q(x-s),q(y-s*.34),q(s*2),q(s*.68));c.fillRect(q(x-s*.34),q(y-s),q(s*.68),q(s*2));
    }
    if(!f.soft)for(const sign of [-1,1])diamond(c,sign*18,-13-out(f.phase)*9,1.2,2.1,P.lime,P.green,false);
  }
  function shield(c,f,blockAge){
    const scale=f.soft?1:(.8+.2*f.entry)*(1-f.release*.1),ry=28*scale,rx=ry*Math.sqrt(3)/2;
    const symmetricSnap=n=>Math.sign(n)*Math.round(Math.abs(n)*2)/2;
    const outer=shieldOutline(ry).map(p=>p.map(symmetricSnap));
    c.save();c.translate(0,-17);
    halo(c,outer,P.cyan);
    c.save();c.globalAlpha*=.07;poly(c,outer,P.cyan);c.restore();
    const inner=outer.map(([x,y])=>[symmetricSnap(x*.9),symmetricSnap(y*.9)]);
    for(let i=0;i<6;i++){const j=(i+1)%6;poly(c,[outer[i],outer[j],inner[j],inner[i]],i>2?P.cyan:P.blue);}
    poly(c,[outer[5],outer[0],inner[0],inner[5]],P.lemon);
    if(Number.isFinite(blockAge)&&blockAge>=0&&blockAge<.24){
      c.save();c.globalAlpha*=1-blockAge/.24;flare(c,rx,0,f.soft?3:6,P.lemon,P.gold);c.restore();
    }
    if(f.release>0&&!f.soft)for(let i=0;i<3;i++)diamond(c,(i-1)*(12+f.release*8),-ry+f.release*10,1.7*(1-f.release),2.7*(1-f.release),P.cyan,P.blue,false);
    c.restore();
  }
  function combo(c,f){
    const colors=[P.cyan,P.lemon,P.orange,P.pink],shades=[P.blue,P.gold,P.red,P.rose],base=colors[f.tier],shade=shades[f.tier];
    const reach=f.soft?0:out(f.age/.25)*(5+f.tier*2),n=f.soft?1:3;
    for(let i=0;i<n;i++){
      const lane=i-(n-1)/2,x=lane*(11+reach),y=-42-Math.max(0,1-Math.abs(lane))*6-(f.soft?0:out(f.phase)*7);
      flare(c,x,y,(i===(n-1)/2?4.8:3.1)*(1+f.tier*.12)*(1-f.phase*.35),base,shade);
    }
    if(!f.soft&&f.tier>=2)for(const sign of [-1,1])diamond(c,sign*(25+reach),-32-f.phase*8,1.7,3.1,base,shade,false);
  }
  function critical(c,f){
    const lift=f.soft?0:out(f.phase)*5,shrink=1-f.phase*.3;
    // One dominant star and four satellites; buffs keep their existing three-star accent.
    flare(c,0,-48-lift,(f.soft?5.4:7.2)*shrink,P.lemon,P.gold);
    if(!f.soft)for(const side of [-1,1]){
      flare(c,side*(14+f.entry*3),-43-lift,3.3*shrink,P.lemon,P.gold);
      flare(c,side*(25+f.entry*3),-35-lift,2.7*shrink,P.lemon,P.gold);
    }
  }
  function luck(c,f){
    const travel=f.soft?0:out(f.phase)*7,shrink=1-f.phase*.28;
    // Paired emerald facets signal extra loot. Healing retains its plus/cross silhouette.
    for(const side of (f.soft?[1]:[-1,1]))diamond(c,side*(17+(f.soft?0:f.entry*3)),-26-travel-(side>0?5:0),4.1*shrink,6.8*shrink,P.lime,P.green);
  }
  function draw(c,kind,age,{soft=false,tier=0,activeLength=1.8,blockAge,layer='front',glow=true}={}){
    const f=sampleFamily(kind,age,{soft,tier,activeLength});if(!f)return false;
    const oldGlow=glowLevel;glowLevel=glow&&layer==='front'?(soft?.35:1):0;
    c.save();try{
      c.globalCompositeOperation='source-over';c.globalAlpha*=f.alpha*(kind==='shield'?.72:1);
      if(layer==='floor'){
        if(kind==='combo'&&!soft){
          c.globalAlpha*=.22*(1-f.phase);
          const r=18+out(f.phase)*(7+f.tier*3),colors=[P.cyan,P.lemon,P.orange,P.pink];
          for(const sign of [-1,1])poly(c,[[sign*r-5,0],[sign*r,-2],[sign*r+5,0],[sign*r,2]],colors[f.tier]);
        }
      }else if(kind==='impact')impact(c,f);else if(kind==='reward')reward(c,f);else if(kind==='heal')heal(c,f);else if(kind==='shield')shield(c,f,blockAge);else if(kind==='critical')critical(c,f);else if(kind==='luck')luck(c,f);else combo(c,f);
    }finally{c.restore();glowLevel=oldGlow;}
    return true;
  }
  return Object.freeze({draw});
}

// Light anchors use the same local motion as the approved faceted painters.
// No new particles or independent clock; callers supply the current clip age.
export function sampleFamilyEmission(P,kind,age,options={}){
 const f=sampleFamily(kind,age,options);if(!f)return[];
 const points=[],add=(x,y,radius,color,alpha=f.alpha)=>points.push({x,y,radius,alpha,color,kind:'family-accent'});
 if(kind==='impact'){
  if(f.age<.17)add(0,0,f.soft?4:8,P.cyan);
  const reach=f.soft?3:out(f.age/.23)*17;
  for(let i=0;i<(f.soft?2:5);i++){const a=-2.7+i*.83;add(Math.cos(a)*reach,Math.sin(a)*reach-f.phase*2,4,P.cyan);}
 }else if(kind==='reward'){
  const u=out(f.phase),count=f.soft?1:3;
  if(f.age<.21)add(0,-5,6,P.lemon);
  for(let i=0;i<count;i++){const lane=i-(count-1)/2;add(f.soft?0:lane*(5+u*8),-5-(f.soft?2:u*20)+Math.abs(lane)*3,5,P.cyan);}
  if(!f.soft&&f.phase<.65){add(-12*u,-12-10*u,3,P.lemon);add(12*u,-9-9*u,3,P.lemon);}
 }else if(kind==='critical'){
  const lift=f.soft?0:out(f.phase)*5;add(0,-48-lift,f.soft?5:8,P.lemon);
  if(!f.soft)for(const side of[-1,1]){add(side*(14+f.entry*3),-43-lift,4,P.lemon);add(side*(25+f.entry*3),-35-lift,3,P.lemon);}
 }else if(kind==='luck'){
  const travel=f.soft?0:out(f.phase)*7;for(const side of(f.soft?[1]:[-1,1]))add(side*(17+(f.soft?0:f.entry*3)),-26-travel-(side>0?5:0),6,P.lime);
 }else if(kind==='shield'){
  const scale=f.soft?1:(.8+.2*f.entry)*(1-f.release*.1);for(const[x,y]of shieldOutline(28*scale))add(x,y-17,5,P.cyan,f.alpha*.65);
 }else if(kind==='combo'){
  const color=[P.cyan,P.lemon,P.orange,P.pink][f.tier],reach=f.soft?0:out(f.age/.25)*(5+f.tier*2),n=f.soft?1:3;
  for(let i=0;i<n;i++){const lane=i-(n-1)/2;add(lane*(11+reach),-42-Math.max(0,1-Math.abs(lane))*6-(f.soft?0:out(f.phase)*7),5,color);}
  if(!f.soft&&f.tier>=2)for(const sign of[-1,1])add(sign*(25+reach),-32-f.phase*8,4,color);
 }
 return points;
}
