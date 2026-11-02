export const MYSTIC_BEAM_LOOK=Object.freeze({travelBeats:.45,riseBeats:.18,widthScale:1.1,heightScale:1.28,flashBeats:.18,maxColumns:128});
const clamp=n=>Math.max(0,Math.min(1,n)),key=p=>p.x+','+p.y;
// Presentation derives only from a resolved native shot; warning never creates a flame.
export function beamColumnPlan(b,beat,soft=false){
 const shot=b?.mirage?.lastShot,out=new Map();if(b?.hp<=0||b?.mirage?.phase!==2||!shot||!Number.isFinite(beat))return out;
 const age=beat-shot.impact;if(age<0||age>=1)return out;
 for(const [i,p]of shot.tiles.slice(0,MYSTIC_BEAM_LOOK.maxColumns).entries()){
  const delay=soft?0:i/Math.max(1,shot.tiles.length-1)*MYSTIC_BEAM_LOOK.travelBeats;if(age<delay)continue;
  const t=soft?1:clamp((age-delay)/MYSTIC_BEAM_LOOK.riseBeats),rise=t*t*(3-2*t);
  out.set(key(p),{rise,widthScale:MYSTIC_BEAM_LOOK.widthScale,heightScale:MYSTIC_BEAM_LOOK.heightScale});
 }
 return out;
}
export function fireColumnFor(b,f,beat,plan){
 if(b?.mirage?.phase!==2)return null;
 return plan.get(key(f))||(f.source==='beam'&&beat>=f.activeAt?{rise:1,widthScale:MYSTIC_BEAM_LOOK.widthScale,heightScale:MYSTIC_BEAM_LOOK.heightScale}:null);
}
export function paintMysticBeamWarning(c,b,beat,project,soft=false){
 const m=b?.mirage;if(!m||b.hp<=0||m.phase!==2)return;
 const shot=m.shot,last=m.lastShot,age=last?beat-last.impact:Infinity,marks=[];if(shot)marks.push({w:shot,flash:false});if(age>=0&&age<MYSTIC_BEAM_LOOK.flashBeats)marks.push({w:last,flash:true});
 for(const {w,flash}of marks){if(!w?.tiles?.length)continue;const from=project(w.from.x,w.from.y),end=w.tiles.at(-1),to=project(end.x,end.y),progress=flash?0:clamp((beat-w.started)/(w.due-w.started));
  c.save();try{c.lineCap='round';c.strokeStyle='#ffd95a';c.lineWidth=flash?1.5:1;c.globalAlpha=flash?.48*(1-age/MYSTIC_BEAM_LOOK.flashBeats):soft?.32:.23+progress*.16;
   c.setLineDash(flash?[]:[3.5,3]);c.beginPath();c.moveTo(from.x/2,from.y/2);c.lineTo(to.x/2,to.y/2);c.stroke();
  }finally{c.restore();}
 }
}
