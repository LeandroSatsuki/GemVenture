// Pure presentation sampler; supply the existing paused visual clock.
// Frozen PNGs are never transformed non-uniformly or regenerated per frame.
export function sampleEchoCrown(layer,time=0,reduced=false){
 if(reduced||layer.motion===false)return {dx:0,dy:0};
 const t=Number.isFinite(time)?time:0;
 return {dx:0,dy:layer.amp*(.75*Math.sin(t*Math.PI*2/layer.period+layer.phase)+.25*Math.sin(t*Math.PI*2/(layer.period*1.73)+layer.phase*1.4))};
}
export function drawEchoTree(ctx,images,manifest,{x,y,time=0,reduced=false,width=130}={}){
 const k=width/manifest.nominalWidth,ground=manifest.groundAnchor;
 ctx.save();ctx.translate(x,y);ctx.scale(k,k);ctx.translate(-ground[0],-ground[1]);
 for(const l of manifest.layers){const im=images[l.id];if(!im)continue;const [bx,by,r,b]=l.bounds,p=sampleEchoCrown(l,time,reduced);ctx.drawImage(im,bx,by,r-bx,b-by,l.left+p.dx,l.top+p.dy,(r-bx)*l.scale,(b-by)*l.scale);}
 ctx.restore();
}
