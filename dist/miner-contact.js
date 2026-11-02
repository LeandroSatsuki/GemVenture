export const GRID_ROW=58,GRID_COL=72,BOUNCE_HEIGHT=65;
const ease=t=>t*t*(3-2*t);
// Forward frontier only: the last physical anchor's row and the row below.
// Already passed rows above the anchor do not become a mineable backtracking map.
export function findMinerLanding({from,aim,solidAt,launch=true}){
 const height=launch?Math.min(BOUNCE_HEIGHT,aim.row===from.row?GRID_ROW-1:Infinity):0,A=4*height,B=(aim.row-from.row)*GRID_ROW-A;
 let first=null;
 for(let row=Math.max(1,Math.ceil(from.row));row<=Math.ceil(aim.row);row++){
  const C=(from.row-row)*GRID_ROW,disc=B*B-4*A*C;
  if(disc<0)continue;
  const t=A?(-B+Math.sqrt(disc))/(2*A):B>0?-C/B:Infinity;
  if(t<=1e-9||t>1+1e-9||2*A*t+B<=0)continue;
  const fraction=Math.min(1,t),x=from.col+(aim.col-from.col)*ease(fraction),col=Math.floor(x+.5);
  if(col<0||col>6)continue;const type=solidAt(row,col);
  if(!type)continue;
  if(!first||fraction<first.t)first={t:fraction,row,col,type,pointCol:x};
 }
 return {from:{...from},aim:{...aim},height,tEnd:first?.t??1,
  contact:first?{row:first.row,col:first.col,type:first.type,pointCol:first.pointCol}:null,
  end:first?{row:first.row,col:first.pointCol}:{...aim}};
}
export function sampleMinerArc(plan,progress,{soft=false}={}){
 const u=Math.max(0,Math.min(1,progress)),t=u*plan.tEnd;
 if(u===1)return {col:plan.end.col,row:plan.end.row,lift:0,tilt:0,physicalTipRow:plan.end.row,contact:plan.contact,done:true};
 const col=plan.from.col+(plan.aim.col-plan.from.col)*ease(t);
 // Ground/camera path ends at the actual surface; the visual hop is rebased
 // against it, so an early collision cannot leave the drill hovering or snap it.
 const row=plan.from.row+(plan.end.row-plan.from.row)*u;
 const physical=plan.from.row+(plan.aim.row-plan.from.row)*t-4*t*(1-t)*plan.height/GRID_ROW;
 return {col,row,lift:Math.max(0,(row-physical)*GRID_ROW),
  tilt:soft?0:(plan.end.col-plan.from.col)*Math.sin(Math.PI*u)*.18,
  physicalTipRow:physical,contact:plan.contact,done:u===1};
}
