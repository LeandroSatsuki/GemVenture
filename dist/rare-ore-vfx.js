import {CRYSTAL_VEIN_RAMPS} from './crystal-veins.js';
export const RARE_ORE_VFX_SPEC=Object.freeze({period:2.4,maxWidth:60,top:-47,bottom:-2,glints:3});
const finite=Number.isFinite;
export function sampleRareOre({node,width=30,time=0,soft=false}={}){
 if(!node?.rare||node.type!=='crystal'||!finite(node.hp)||node.hp<=0)return null;
 const size=finite(width)?Math.max(24,Math.min(36,width)):30,t=soft?0:finite(time)?Math.max(0,time):0;
 const phase=(finite(node.id)?Math.abs(node.id)%11:0)/11,pulse=soft?.5:.5+.5*Math.sin((t/RARE_ORE_VFX_SPEC.period+phase)*Math.PI*2),ramp=CRYSTAL_VEIN_RAMPS[(Number(node.kind)>>>0)%4];
 return{radius:size*.52+1.5,alpha:.42+pulse*.16,top:-size*.91-3,soft:!!soft,color:ramp[3],shade:ramp[0],glints:[[-1,.32],[1,.58],[-.25,1]].map(([side,height],i)=>({x:side*(size*.52+1.5),y:-(size*.91+3)*height,alpha:soft?.64:.38+.62*(.5+.5*Math.sin(t*2.2+phase*6+i*2.1)),size:1.35+(i%2)*.4}))};
}
function diamond(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.65,y);c.lineTo(x,y+r);c.lineTo(x-r*.65,y);c.closePath();c.fill();}
// The caller already owns the paused/hidden/reduced-motion presentation clock.
// Draw before the vein so this local glow never covers its polished faces.
export function paintRareOre(c,{node,x,y,width=30,time=0,soft=false}={}){
 if(!finite(x)||!finite(y))return false;const f=sampleRareOre({node,width,time,soft});if(!f)return false;
 c.save();c.translate(x,y);const alpha=c.globalAlpha;
 const glow=c.createRadialGradient(0,f.top*.48,1,0,f.top*.48,f.radius+4);
 glow.addColorStop(0,f.color+'26');glow.addColorStop(.6,f.color+'12');glow.addColorStop(1,f.color+'00');
 c.globalCompositeOperation='screen';c.globalAlpha=alpha*f.alpha;c.fillStyle=glow;c.fillRect(-f.radius-4,f.top-5,(f.radius+4)*2,-f.top+8);
 c.globalCompositeOperation='source-over';
 for(const g of f.glints){c.globalAlpha=alpha*g.alpha;diamond(c,g.x,g.y,g.size,f.color);if(!soft){c.globalAlpha=alpha*g.alpha*.3;diamond(c,g.x,g.y,g.size*1.8,f.shade);}}
 c.restore();return true;
}
