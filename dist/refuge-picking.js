// Immutable alpha planes are prepared once per image/frame. No pixel reads during hover.
export const REFUGE_PICK_LIMITS=Object.freeze({maskSide:160,outlineSide:512,outlineCaches:2,alphaThreshold:40});
export function createAlphaPlane(rgba,width,height,{side=REFUGE_PICK_LIMITS.maskSide,threshold=REFUGE_PICK_LIMITS.alphaThreshold}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||rgba.length!==width*height*4)throw Error('Invalid alpha source');
 const k=Math.min(1,side/Math.max(width,height)),w=Math.max(1,Math.ceil(width*k)),h=Math.max(1,Math.ceil(height*k)),cells=new Uint8Array(w*h);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(rgba[(y*width+x)*4+3]>=threshold)cells[Math.min(h-1,Math.floor(y*h/height))*w+Math.min(w-1,Math.floor(x*w/width))]=1;
 return Object.freeze({width:w,height:h,sourceWidth:width,sourceHeight:height,cells});
}
export function alphaContains(plane,x,y){
 if(!plane||!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>=plane.sourceWidth||y>=plane.sourceHeight)return false;
 return !!plane.cells[Math.floor(y*plane.height/plane.sourceHeight)*plane.width+Math.floor(x*plane.width/plane.sourceWidth)];
}
export function inversePoint(m,x,y){
 const [a,b,c,d,e,f]=m,det=a*d-b*c;if(![...m,x,y].every(Number.isFinite)||Math.abs(det)<1e-9)return null;
 const px=x-e,py=y-f;return {x:(d*px-c*py)/det,y:(a*py-b*px)/det};
}
export function transformedAlphaContains(plane,m,x,y){const p=inversePoint(m,x,y);return !!p&&alphaContains(plane,p.x,p.y);}
export function multiplyAffine(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
// Returns the visible part closest to the viewer. Empty pixels do not swallow input.
export function pickRefugePart(parts,x,y,test){
 for(let i=parts.length-1;i>=0;i--){const part=parts[i];if(test(part,x,y))return part;}return null;
}


export function createAlphaMask(plane,makeCanvas){
 const canvas=makeCanvas();canvas.width=plane.width;canvas.height=plane.height;const c=canvas.getContext('2d'),pixels=c.createImageData(plane.width,plane.height);
 for(let i=0;i<plane.cells.length;i++)if(plane.cells[i]){pixels.data[i*4]=pixels.data[i*4+1]=pixels.data[i*4+2]=pixels.data[i*4+3]=255;}
 c.putImageData(pixels,0,0);return canvas;
}

export function createSilhouetteRenderer({makeCanvas,side=REFUGE_PICK_LIMITS.outlineSide,limit=REFUGE_PICK_LIMITS.outlineCaches}={}){
 const entries=new Map();let renders=0;
 return Object.freeze({
  paint(c,key,bounds,painter,{x,y,density=2,color,lineWidth=2,maskPainter}={}){
   if(!c||!bounds||![x,y,bounds.left,bounds.top,bounds.right,bounds.bottom].every(Number.isFinite))return false;
   const pad=lineWidth+2,width=bounds.right-bounds.left+pad*2,height=bounds.bottom-bounds.top+pad*2;
   if(width<=0||height<=0)return false;const k=Math.min(Math.max(1,density),side/Math.max(width,height));
   const w=Math.ceil(width*k),h=Math.ceil(height*k);let entry=entries.get(key);
   if(!entry){const frame=makeCanvas(),mask=makeCanvas();if(!frame||!mask)return false;entry={frame,mask};entries.set(key,entry);while(entries.size>limit)entries.delete(entries.keys().next().value);}
   if(entry.frame.width!==w||entry.frame.height!==h){entry.frame.width=entry.mask.width=w;entry.frame.height=entry.mask.height=h;}
   const f=entry.frame.getContext('2d'),m=entry.mask.getContext('2d');
   f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,w,h);if(!maskPainter){f.setTransform(k,0,0,k,(-bounds.left+pad)*k,(-bounds.top+pad)*k);painter(f);}
   m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,w,h);m.globalCompositeOperation='source-over';
   if(maskPainter){m.setTransform(k,0,0,k,(-bounds.left+pad)*k,(-bounds.top+pad)*k);maskPainter(m);m.setTransform(1,0,0,1,0,0);}else m.drawImage(entry.frame,0,0);
   m.globalCompositeOperation='source-in';m.fillStyle=color;m.fillRect(0,0,w,h);m.globalCompositeOperation='source-over';
   const left=x+bounds.left-pad,top=y+bounds.top-pad;
   // Draw an external ring, never a filled yellow silhouette behind translucent seams.
   // Both buffers are reused; the original painter runs directly at its real anchor.
   f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,w,h);f.globalCompositeOperation='source-over';
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-.707,-.707],[.707,-.707],[-.707,.707],[.707,.707]])f.drawImage(entry.mask,dx*lineWidth*k,dy*lineWidth*k);
   f.globalCompositeOperation='destination-out';f.drawImage(entry.mask,0,0);f.globalCompositeOperation='source-over';
   c.save();c.drawImage(entry.frame,left,top,w/k,h/k);c.translate(x,y);painter(c);c.restore();renders++;return true;
  },
  info(){return {entries:entries.size,limit,renders,pixels:[...entries.values()].reduce((n,e)=>n+e.frame.width*e.frame.height*2,0)};}
 });
}
