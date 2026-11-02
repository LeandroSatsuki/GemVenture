// Presentation only: no changes to the approved wave cells, damage or timing.
export function densifyWaveCrests(pillars){const out=[...pillars],seen=new Set(),cell=(p,x=p.x,y=p.y)=>[p.born,p.ring,p.look,x,y].join(':'),occupied=new Set(pillars.filter(p=>p.crownWave).map(p=>cell(p)));let added=0;
 for(let i=0;i<pillars.length;i++){const a=pillars[i];if(!a.crownWave)continue;for(let j=i+1;j<pillars.length;j++){const b=pillars[j],dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);if(!b.crownWave||a.born!==b.born||a.ring!==b.ring||a.look!==b.look||Math.max(dx,dy)!==1)continue;if(dx&&dy&&(occupied.has(cell(a,a.x,b.y))||occupied.has(cell(a,b.x,a.y))))continue;const x=(a.x+b.x)/2,y=(a.y+b.y)/2,key=[x,y,a.born,a.ring,a.look].join(':');if(seen.has(key))continue;seen.add(key);out.push({...a,x,y,visualOnly:true,visibilityAt:[{x:a.x,y:a.y},{x:b.x,y:b.y}]});if(++added>=96)return out;}}
 return out;
}
export function crestVisible(room,n,visible){return n.type==='geodePillar'&&n.visualOnly?n.visibilityAt?.length===2&&n.visibilityAt.every(p=>visible(room,p)):visible(room,n);}
const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
// Same torso transform as geode-test05.ts, before the cave affine projection.
export function angryFaceProjection(frame){const t=frame.index/frame.spec.count,key=frame.key,fan=key.startsWith('fan-'),yaw=fan?-45+frame.index/(frame.spec.count-1)*90:frame.dir==='SE'?-45:frame.dir==='SW'?45:0;
 const hit=key.startsWith('fracture-')?Math.sin(clamp(t/.16)*Math.PI/2)*(1-smooth((t-.16)/.84)):0,fall=key==='defeat'?smooth(t):0,open=key==='open'?smooth(t/.055):key==='reform'?1-smooth(t/.12):0,punch=key.startsWith('guard-')?Math.sin(Math.PI*smooth(t)):0;
 const a=(90+yaw)*Math.PI/180,pitch=(hit*8+fall*10-punch*4+open*2)*Math.PI/180,fx=Math.cos(a),fy=Math.sin(a),cp=Math.cos(pitch),sp=Math.sin(pitch),breath=fan?0:Math.sin(t*Math.PI*2),z0=-fall*7-open*1.5;
 return(side,z)=>{const up=4+breath*.28+z,forward=-hit*2.5+26.12*cp-up*sp,wx=fx*forward-fy*side,wy=fy*forward+fx*side,wz=z0+26.12*sp+up*cp;return{x:(wx+wy*4/44)*.82,y:(wy*32/44-wz)*.82};};
}
export function paintAngryEyes(c,x,y,frame){const project=angryFaceProjection(frame),p=(side,z)=>{const q=project(side,z);return[x+q.x,y+q.y];};c.save();
 // Clip to the flat front, leaving the bevels and the silhouette untouched.
 c.beginPath();for(const [i,q]of [[-29,9],[29,9],[29,43],[-29,43]].entries()){const a=p(...q);i?c.lineTo(...a):c.moveTo(...a);}c.closePath();c.clip();
 const darkFace=frame.key.startsWith('fan-')?-45+frame.index/(frame.spec.count-1)*90< -10:frame.dir==='SE';c.strokeStyle=darkFace?'#5c627d':'#161928';c.lineWidth=1.65;c.lineCap='round';for(const sign of [-1,1]){c.beginPath();c.moveTo(...p(sign*18,33));c.lineTo(...p(sign*6,29.5));c.stroke();const corners=[[sign*12-1.7,26],[sign*12+1.7,26],[sign*12+1.7,23.8],[sign*12-1.7,23.8]];c.fillStyle='#ffd95a';c.beginPath();corners.forEach((q,i)=>i?c.lineTo(...p(...q)):c.moveTo(...p(...q)));c.closePath();c.fill();}c.restore();
}
