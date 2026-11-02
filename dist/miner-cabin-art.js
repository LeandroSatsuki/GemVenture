// GV-020: fixed decorative frame only. No field scroll/shake or game clock.
export const CABIN_FRAME=Object.freeze({x:40,y:602,width:620,height:112});
export const CREW_SOURCE=Object.freeze({size:[1351,1164],bounds:[387,239,965,939],ground:[676,939],width:52,upperCutY:846,lowerStartY:826,sway:.75,period:3.2});
export const CREW_CACHE_FRAME=Object.freeze({width:64,height:76,anchor:[32,76],density:2});
function box(c,x,y,w,h,fill,stroke,r=4,line=2){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.lineJoin='round';c.stroke();}}
function poly(c,points,fill,stroke,line=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.lineJoin='round';c.stroke();}}
export function drawCabinBack(c,P){
 // A single continuous rear sill connects both suspension brackets.
 box(c,43,605,614,44,P.wood,P.ink,6,2.4);
 box(c,48,608,604,8,P.clay,null,3);
 box(c,51,633,598,13,P.bark,null,3);
 for(const x of [43,637]){box(c,x,606,20,99,P.wood,P.ink,5,2);box(c,x+3,609,6,89,P.clay,null,3);box(c,x+12,613,5,84,P.bark,null,2);}
 // Steel suspension fittings coincide with chain mounts, not the drill.
 for(const x of [52,648]){box(c,x-7,621,14,23,P.steel,P.ink,4,1.6);box(c,x-4,623,4,17,P.silver,null,2);c.beginPath();c.arc(x,632,3.5,0,Math.PI*2);c.fillStyle=P.ink;c.fill();}
}
export function drawCabinFloor(c,P){
 c.save();c.beginPath();c.rect(70,642,560,42);c.clip();
 // Broad horizontal working floor; shallow top and bevels are visible.
 poly(c,[[72,643],[627,643],[630,648],[630,681],[626,684],[74,684],[70,680],[70,648]],P.clay,P.ink,2);
 poly(c,[[73,644],[627,644],[626,649],[74,649]],P.ochre,null);
 box(c,74,673,552,9,P.wood,null,2);
 // Sparse full-length joined planks, no grain or noise texture.
 for(const x of [257,443]){c.strokeStyle=P.wood;c.lineWidth=1.4;c.beginPath();c.moveTo(x,649);c.lineTo(x,675);c.stroke();}
 c.restore();
}
export function drawCabinFront(c,P){
 c.save();c.beginPath();c.rect(40,684,620,30);c.clip();
 // Front starts below y684: both complete boots at y678 stay visible.
 box(c,42,685,616,27,P.wood,P.ink,5,2.4);
 box(c,46,687,608,7,P.clay,null,3);
 box(c,48,704,604,5,P.bark,null,2);
 for(const x of [54,350,646]){box(c,x-6,686,12,24,P.steel,P.ink,3,1.4);box(c,x-3,688,3,18,P.silver,null,1);for(const y of [691,705]){c.beginPath();c.arc(x,y,1.4,0,Math.PI*2);c.fillStyle=P.ink;c.fill();}}
 c.restore();
}
export function drawChain(c,chain,P){
 const {top,mount}=chain,length=mount.y-top.y,N=Math.ceil(length/14),step=(length-15)/(N-1);
 c.save();c.beginPath();c.rect(top.x-6,top.y,12,length);c.clip();
 for(let i=0;i<N;i++){
  const y=top.y+7.5+i*step,front=i%2===0,rx=front?5.2:2.8,inner=front?2.7:1.2;
  c.beginPath();c.ellipse(top.x,y,rx,7.4,0,0,Math.PI*2);c.ellipse(top.x,y,inner,4.6,0,0,Math.PI*2,true);c.fillStyle=front?P.steel:P.slate;c.fill('evenodd');c.strokeStyle=P.ink;c.lineWidth=.9;c.stroke();
  if(front){c.strokeStyle=P.silver;c.lineWidth=1.1;c.beginPath();c.ellipse(top.x-.4,y,rx-.9,6.3,0,Math.PI*.78,Math.PI*1.45);c.stroke();}
 }
 c.restore();
}
export function advanceCrewClock(clock,dt,{enabled=true,visible=true,paused=false}={}){
 if(!Number.isFinite(clock)||!Number.isFinite(dt)||dt<0)throw Error('Finite visual clock/delta required');
 return enabled&&visible&&!paused?clock+Math.min(.1,dt):clock;
}
export function crewPose(clock,index,{reduced=false}={}){return {upperDX:reduced?0:CREW_SOURCE.sway*Math.sin(clock*Math.PI*2/CREW_SOURCE.period+index*Math.PI),feetDX:0,feetDY:0};}
export function drawCrew(c,source,feet,index,clock,{reduced=false}={}){
 const F=CREW_CACHE_FRAME,pose=crewPose(clock,index,{reduced}),x=feet.x-F.anchor[0],y=feet.y-F.anchor[1];
 // Source stays intact. Two controlled clips overlap at hips; boots are drawn
 // at the identical transform every frame. No reflected light or body stretch.
 c.drawImage(source.lower,x,y,F.width,F.height);
 c.drawImage(source.upper,x+pose.upperDX,y,F.width,F.height);
}
export function drawFixedEnsemble(c,{P,layout,crewImage,clock=0,reduced=false}){
 drawCabinBack(c,P);
 for(const chain of layout.chains)drawChain(c,chain,P);
 drawCabinFloor(c,P);
 layout.occupants.forEach((occupant,i)=>drawCrew(c,crewImage,occupant.feet,i,clock,{reduced}));
 drawCabinFront(c,P);
}
export function drawCachedEnsemble(c,assets,layout,clock=0,{reduced=false}={}){
 // Existing raster layers retain size and source density; only placement follows layout.
 const dy=layout.cabin.y-CABIN_FRAME.y;
 c.drawImage(assets.back,40,602+dy,620,112);
 layout.chains.forEach((chain,i)=>{
  const image=assets.chains[i],length=chain.mount.y-chain.top.y,piece=image.height/2;
  // Repeat/crop the same links instead of stretching them through the extension.
  for(let y=0;y<length;y+=piece){const h=Math.min(piece,length-y);c.drawImage(image,0,0,image.width,h*2,chain.top.x-6,chain.top.y+y,12,h);}
 });
 c.drawImage(assets.floor,40,602+dy,620,112);
 layout.occupants.forEach((occupant,i)=>drawCrew(c,assets.crew,occupant.feet,i,clock,{reduced}));
 c.drawImage(assets.front,40,602+dy,620,112);
}
