// Only the projected ground shadow is softened; authored material faces stay crisp.
const bounds=new WeakMap();
export const SOFT_SHADOW=Object.freeze({opacity:.56,padding:1.2});
export function shadowBounds(points){if(!Array.isArray(points)||points.length<3||!points.every(p=>p.length===2&&p.every(Number.isFinite)))return null;const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return{x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2,rx:Math.max(.5,(Math.max(...xs)-Math.min(...xs))/2),ry:Math.max(.35,(Math.max(...ys)-Math.min(...ys))/2)};}
export function paintSoftGroundShadow(c,points,{color='#132233',opacity=SOFT_SHADOW.opacity,padding=SOFT_SHADOW.padding}={}){
 const b=shadowBounds(points);if(!b||!/^#[0-9a-f]{6}$/i.test(color))return false;
 c.save();try{const alpha=c.globalAlpha??1;c.translate(b.x,b.y);c.scale(b.rx+padding,b.ry+padding*.6);const g=c.createRadialGradient?.(0,0,0,0,0,1);if(!g?.addColorStop)return false;
 g.addColorStop(0,color+'d9');g.addColorStop(.30,color+'b0');g.addColorStop(.68,color+'48');g.addColorStop(1,color+'00');c.globalAlpha=alpha*Math.max(0,Math.min(1,opacity));c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,Math.PI*2);c.fill();return true;}finally{c.restore();}
}
export function paintSoftShadowShape(c,shape){
 const contact=shape.type==='ellipse'&&shape.fill==='#180d2f'&&shape.cy>=90&&shape.ry<=8;
 if(!contact&&(shape.type!=='path'||shape.fill!=='#132233'))return false;
 if(contact)return paintSoftGroundShadow(c,[[shape.cx-shape.rx,shape.cy-shape.ry],[shape.cx+shape.rx,shape.cy-shape.ry],[shape.cx+shape.rx,shape.cy+shape.ry],[shape.cx-shape.rx,shape.cy+shape.ry]],{color:shape.fill,padding:.8});
 let points=bounds.get(shape);if(!points){const values=shape.d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number);if(!values||values.length%2)return false;points=Array.from({length:values.length/2},(_,i)=>values.slice(i*2,i*2+2));bounds.set(shape,points);}
 return paintSoftGroundShadow(c,points);
}
