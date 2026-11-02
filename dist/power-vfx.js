import {paintVfxEmission} from './vfx-emission.js';
// One material vocabulary: a clear silhouette, one shadow face, a small light accent.
// State uses quiet body/ground accents; the real Tempestade discharge takes priority.
const q=n=>Math.round(n*2)/2,fract=n=>n-Math.floor(n);
export function powerFrame(active,beat,{soft=false}={}){
  const phase=soft?.45:fract(beat),pulse=soft?.15:Math.exp(-phase*8);
  return {lightning:!!active.lightning,magnet:!!active.magnet,fire:!!active.fire,phase,pulse,soft};
}
export function fireRingFrame(beat,{soft=false}={}){
  const clock=soft?0:beat,rotation=clock*Math.PI/6;
  return Array.from({length:6},(_,i)=>{
    const angle=rotation+i*Math.PI/3,x=Math.cos(angle)*24,y=2+Math.sin(angle)*12;
    return {angle,x,y,rear:y<0,size:soft?.52:.53+.065*Math.sin(clock*Math.PI*2+i*1.4),lean:-Math.sin(angle)*2,ember:soft?null:fract(clock*.5+i/6)};
  });
}
export function createPowerPainter(P){
  const emission={floor:[],front:[]};
  function poly(c,points,color,alpha=1){
    c.save();try{c.globalAlpha*=alpha;c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(q(x),q(y)):c.moveTo(q(x),q(y)));c.closePath();c.fill();}finally{c.restore();}
  }
  function facet(c,x,y,rx,ry,color,shade,lit=true){
    poly(c,[[x,y-ry],[x+rx,y],[x,y+ry],[x-rx,y]],color);
    poly(c,[[x,y-ry],[x+rx,y],[x,y+ry],[x,y]],shade);
    if(lit)poly(c,[[x,y-ry],[x-rx*.6,y-ry*.25],[x,y]],P.lemon,.7);
  }
  function ember(c,x,y,size,lean=0){
    const p=[[x-3*size,y],[x-4*size,y-4*size],[x-2*size,y-8*size],[x+lean,y-14*size],[x+2*size,y-8*size],[x+4*size,y-5*size],[x+3*size,y]];
    poly(c,p,P.rust,.7);poly(c,p.map(([a,b])=>[a,b-size*.7]),P.orange);
    poly(c,[[x-size*1.8,y-size],[x-size*1.7,y-size*5],[x+lean*.4,y-size*8],[x+size*1.8,y-size*4],[x+size*1.5,y-size]],P.gold);
    poly(c,[[x-size*.7,y-size*1.4],[x,y-size*5],[x+size*.8,y-size*1.4]],P.lemon,.8);
  }
  function fireRing(c,beat,{soft,glow,layer}){
    const frame=fireRingFrame(beat,{soft});
    if(layer==='floor')for(const point of frame){
      // A flowing band of heat on the ground; its width is cosmetic, not attack range.
      const a=point.angle-.72,b=point.angle+.23,m=(a+b)/2;
      const edge=(angle,rx,ry)=>[Math.cos(angle)*rx,2+Math.sin(angle)*ry];
      if(glow)poly(c,[edge(a,25.7,13),edge(m,25.7,13),edge(b,25.7,13),edge(b,21,9),edge(m,21,9),edge(a,21,9)],P.orange,soft?.045:.08);
      poly(c,[edge(a,24.5,12.3),edge(m,24.5,12.3),edge(b,24.5,12.3),edge(b,22.4,10.3),edge(m,22.4,10.3),edge(a,22.4,10.3)],P.orange,.78);
      poly(c,[edge(b-.34,24,12),edge(b,24,12),edge(b,23.2,11.2),edge(b-.34,23.2,11.2)],P.lemon,.8);
    }
    for(const [i,p]of frame.entries()){
      if(p.rear!==(layer==='floor'))continue;
      ember(c,p.x,p.y,p.size,p.lean);
      if(!soft&&i%2===0){
        const u=p.ember;c.save();c.globalAlpha*=(1-u)*.5;
        facet(c,p.x-p.lean*u,p.y-5-u*9,.65,1.5,P.gold,P.orange,false);c.restore();
      }
    }
  }
  function draw(c,body,active,beat,{soft=false,glow=true,layer='front',shotAge=Infinity}={}){
    const f=powerFrame(active,beat,{soft});emission[layer]=[];if(!f.lightning&&!f.magnet&&!f.fire)return false;
    const lights=[];if(f.fire)for(const point of fireRingFrame(beat,{soft}))if(point.rear===(layer==='floor'))lights.push({x:point.x,y:point.y-4,radius:7,alpha:.7,color:P.orange});
    if(layer==='front'){if(f.lightning)lights.push({x:-12,y:-22,radius:7,alpha:shotAge<.35?.3:.8,color:P.cyan});if(f.magnet)for(const side of [-1,1])lights.push({x:side*14,y:-8,radius:6,alpha:.65,color:P.pink});}
    emission[layer]=glow?lights.map(p=>({...p,x:p.x+body.x,y:p.y+body.y})):[];if(glow)paintVfxEmission(c,emission[layer],{soft});
    c.save();try{
      c.translate(body.x,body.y);c.globalCompositeOperation='source-over';
      if(layer==='floor'){
        if(f.fire)fireRing(c,beat,{soft,glow,layer});
      }else{
        if(f.lightning){
          c.save();c.globalAlpha*=shotAge<.35?.3:.8;
          const h=soft?0:f.pulse;
          if(glow)poly(c,[[-16,-24],[-11,-30],[-7,-23],[-11,-17]],P.cyan,.08+h*.08);
          facet(c,-12,-22,2.6,5.5+h,P.cyan,P.blue);
          if(!soft&&f.pulse>.35)facet(c,-17,-27,1,2,P.cyan,P.blue,false);
          c.restore();
        }
        if(f.magnet){
          // Paired, faceted pole pieces live near the waist; no floating U sticker.
          for(const side of [-1,1]){
            poly(c,[[side*13,-12],[side*16,-10],[side*16,-3],[side*13,-1],[side*12,-4],[side*14,-5],[side*14,-9],[side*12,-10]],P.rose);
            poly(c,[[side*13,-12],[side*16,-10],[side*15,-7],[side*13,-8]],P.pink);
            poly(c,[[side*13,-12],[side*15,-10.5],[side*14.5,-9.5],[side*12.5,-11]],P.silver,.9);
          }
          const count=soft?2:3;
          for(let i=0;i<count;i++){
            const u=soft?.55:fract(beat*.5+i/count),side=i%2?-1:1;
            const x=side*(33-17*u),y=-6-9*Math.sin(u*Math.PI)+i*2;
            c.save();c.globalAlpha*=Math.sin(u*Math.PI)*.7;
            facet(c,x,y,1.3,2.4,P.pink,P.rose,false);c.restore();
          }
        }
        if(f.fire)fireRing(c,beat,{soft,glow,layer});
      }
    }finally{c.restore();}return true;
  }
  function drawBurn(c,body,beat,{soft=false}={}){
    if(!body||![body.x,body.y,beat].every(Number.isFinite))return false;
    paintVfxEmission(c,[-1,1].map(side=>({x:body.x+side*6,y:body.y-2,radius:5,alpha:.6,color:P.orange})),{soft});
    c.save();try{c.translate(body.x,body.y);for(const side of [-1,1])ember(c,side*6,1,soft?.42:.42+.04*Math.sin(beat*Math.PI*2+side),side*1.2);}finally{c.restore();}return true;
  }
  return Object.freeze({draw,drawBurn,emissionSources:()=>[...emission.floor,...emission.front]});
}
