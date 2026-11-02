// Barão Cenoura: same two ears, broad chamfered head, incisors and rigid carrot.
// Z is vertical; local facade faces +Y. No deformation of the weapon or simulation state.
const TAU=Math.PI*2,white=['#ffffe0','#c4ccc7','#8394a6'],pink=['#f27f72','#e77988','#ba4a54'],green=['#a2e66f','#5dae27','#1d3926'],orange=['#ffd95a','#f06c1a','#c94814'],ink='#271b3b';
export const RABBIT_YAWS=Object.freeze({down:0,left:Math.PI/2,up:Math.PI,right:-Math.PI/2});
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((n,i)=>n-b[i]);
export function rabbitDirection(b,player){const d=b.windup?.direction;if(d in RABBIT_YAWS)return d;const q=b.windup?.aim||player||{x:b.x,y:b.y+1},dx=q.x-b.x,dy=q.y-b.y;return Math.abs(dx)>Math.abs(dy)?dx>=0?'right':'left':dy<0?'up':'down';}
export function rabbitMesh({direction='down',pose={},time=0,soft=false}={}){
 const yaw=RABBIT_YAWS[direction]??0,co=Math.cos(yaw),si=Math.sin(yaw),faces=[],bob=soft?0:Math.sin(time*2)*.45;
 const rotate=p=>[p[0]*co-p[1]*si,p[0]*si+p[1]*co,p[2]+bob];
 const face=(id,points,ramp,transform=p=>p,color=null)=>{const p=points.map(q=>rotate(transform(q))),n=cross(sub(p[1],p[0]),sub(p[2],p[0])),length=Math.hypot(...n);if(length<1e-8)return;const unit=n.map(v=>v/length);if(unit[0]*(-1/11)+unit[1]+unit[2]*8/11<=.0001)return;
  const light=unit[0]*-.5+unit[1]*-.3+unit[2]*.8,fill=color||ramp[light>.3?0:light>-.5?1:2];faces.push({id,points:p,normal:unit,fill,depth:p.reduce((s,q)=>s+q[1]+q[2]*8/11,0)/p.length});};
 const box=(id,x,y,z,w,d,h,ramp,bevel=2,transform=p=>p)=>{
  const ring=(inset,zz)=>{const a=w/2-inset,b=d/2-inset,k=Math.min(3,w/5,d/5);return [[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]].map(([u,v])=>[x+u,y+v,z+zz]);};
  const rings=[ring(bevel,0),ring(0,bevel),ring(0,h-bevel),ring(bevel,h)];
  for(let layer=0;layer<3;layer++)for(let i=0;i<8;i++){const j=(i+1)%8;face(id,[rings[layer][i],rings[layer][j],rings[layer+1][j],rings[layer+1][i]],ramp,transform);}
  face(id,rings[3],ramp,transform);face(id,[...rings[0]].reverse(),ramp,transform);
 };
 const front=(id,x,z,w,h,color,y=19.1)=>face(id,[[x-w/2,y,z],[x+w/2,y,z],[x+w/2,y,z-h],[x-w/2,y,z-h]],white,p=>p,color);
 box('head',0,0,9,51,38,35,white,3.5);
 for(const x of [-15,15]){box('ear-'+x,x,-3,43,14,14,34+(x<0?5:0),white,2);front('ear-insert-'+x,x,73+(x<0?4:0),7,25,pink[1],4.1);}
 // Face markings stay attached to the facade and disappear naturally in rear view.
 face('left-eye',[[-15,19.2,33],[-7,19.2,30],[-7,19.2,26],[-15,19.2,28]],white,p=>p,ink);face('right-eye',[[7,19.2,30],[15,19.2,33],[15,19.2,28],[7,19.2,26]],white,p=>p,ink);
 face('nose', [[-4,19.4,24],[4,19.4,24],[0,23,20]],pink,p=>p,pink[0]);
 for(const x of [-2.8,2.8])box('incisor',x,19,12,5,3,7,white,.5);
 // One rigid arm chain and one tapered weapon, tilted at the shoulder only.
 const angle=(pose.armAngle||0)*.65,shoulder=[-24,0,25];
 const arm=q=>{const a=q[1]-shoulder[1],b=q[2]-shoulder[2];return[q[0],shoulder[1]+a*Math.cos(angle)-b*Math.sin(angle),shoulder[2]+a*Math.sin(angle)+b*Math.cos(angle)+(pose.armDy||0)*.25];};
 box('arm',-30,3,21,14,13,11,white,2,arm);box('mitten',-35,10,27,13,13,12,white,2,arm);
 box('stem',-35,10,21,4,4,23,green,.5,arm);
 box('leaf-left',-39,10,42,7,7,13,green,1,arm);box('leaf-right',-31,10,42,7,7,16,green,1,arm);
 const top=[[-44,2,25],[-26,2,25],[-26,18,25],[-44,18,25]],tip=[-35,10,-2];
 face('carrot-top',top,orange,arm);for(let i=0;i<4;i++)face('carrot-side',[top[i],tip,top[(i+1)%4]],orange,arm);
 const facadeVisible=Math.cos(yaw)+Math.sin(yaw)/11>0;for(const f of faces){if(/eye|nose|incisor|ear-insert/.test(f.id))f.depth+=200;}const visible=faces.filter(f=>facadeVisible||!/nose|incisor/.test(f.id));visible.sort((a,b)=>a.depth-b.depth);return visible;
}
export function paintDirectionalRabbit(c,{x,y,width=92,direction='down',pose={},time=0,soft=false}={}){
 const faces=rabbitMesh({direction,pose,time,soft}),k=width/94;c.save();c.translate(x,y);c.scale(k,k);c.lineJoin='round';
 for(const f of faces){c.beginPath();f.points.forEach(([a,b,z],i)=>i?c.lineTo(a+b/11,b*8/11-z):c.moveTo(a+b/11,b*8/11-z));c.closePath();c.fillStyle=f.fill;c.fill();c.strokeStyle=f.fill;c.lineWidth=.25;c.stroke();}
 c.restore();return true;
}
