// Pure samplers for the existing visual clock. No RAF, timer, audio or state writes.
export const IDLE_SPEC=Object.freeze({
  notes:Object.freeze({period:14,start:4,spacing:.45,life:1.6,maxLive:2,referenceWidth:75,travelX:-6.5,travelY:-9.6}),
  lift:Object.freeze({period:18,start:5,rise:1.8,hold:.8,return:3.6,amplitude:3,referenceWidth:105}),
  gramophone:Object.freeze({bounds:Object.freeze([265,84,1136,1038]),ground:Object.freeze([700.5,1038]),mouth:Object.freeze([455,335])})
});
const smooth=t=>Math.max(0,Math.min(1,t*t*t*(t*(t*6-15)+10))),phase=(t,p)=>((t%p)+p)%p;
export function gramophoneMouth({x,y,width}){
  if(![x,y,width].every(Number.isFinite)||width<=0)return null;
  const a=IDLE_SPEC.gramophone,s=width/(a.bounds[2]-a.bounds[0]);
  return {x:x+(a.mouth[0]-a.ground[0])*s,y:y+(a.mouth[1]-a.ground[1])*s};
}
export function sampleGramophoneNotes({time=0,width=75,playing=false,reduced=false,soft=false}){
  if(!playing||reduced||!Number.isFinite(time)||!Number.isFinite(width)||!(width>0))return [];
  const n=IDLE_SPEC.notes,t=phase(time,n.period)-n.start,k=width/n.referenceWidth,notes=[];
  for(let i=0;i<(soft?1:n.maxLive);i++){const u=(t-i*n.spacing)/n.life;if(u<=0||u>=1)continue;
    notes.push({dx:n.travelX*u*k*(soft?.55:1),dy:n.travelY*u*k*(soft?.55:1),
      alpha:Math.sin(Math.PI*u)*.88,scale:k*(.85+.15*smooth(Math.min(1,u*4))),angle:(i?-.09:.08)*u});
  }return notes;
}
export function paintGramophoneNotes(c,{x,y,width,time=0,playing=false,reduced=false,soft=false,colors,notesOverride}){
  const notes=notesOverride?notesOverride.map(n=>({...n,dx:n.dx*width/75,dy:n.dy*width/75,scale:n.scale*width/75})):sampleGramophoneNotes({time,width,playing,reduced,soft}),mouth=gramophoneMouth({x,y,width});
  if(!mouth)return 0;
  for(const n of notes){c.save();c.globalAlpha*=n.alpha;c.translate(mouth.x+n.dx,mouth.y+n.dy);c.scale(n.scale,n.scale);c.rotate(n.angle);
    c.fillStyle=colors.lemon;c.strokeStyle=colors.ink;c.lineWidth=.65;c.lineJoin='round';
    c.beginPath();c.ellipse(-.7,0,1.2,.85,-.3,0,Math.PI*2);c.fill();c.stroke();
    c.beginPath();c.moveTo(.25,-.2);c.lineTo(.25,-4.7);c.quadraticCurveTo(2.3,-4.2,2.15,-2.4);c.stroke();
    c.strokeStyle=colors.lemon;c.lineWidth=.8;c.beginPath();c.moveTo(.25,-.2);c.lineTo(.25,-4.7);c.quadraticCurveTo(2.3,-4.2,2.15,-2.4);c.stroke();c.restore();
  }return notes.length;
}
export function sampleRefugeLiftIdle({time=0,width=105,reduced=false,soft=false}){
  if(reduced||!Number.isFinite(time)||!Number.isFinite(width)||!(width>0))return {dy:0,phase:'rest'};
  const s=IDLE_SPEC.lift,t=phase(time,s.period)-s.start,k=width/s.referenceWidth*(soft?.33:1);
  if(t<0||t>=s.rise+s.hold+s.return)return {dy:0,phase:'rest'};
  if(t<s.rise)return {dy:-s.amplitude*k*smooth(t/s.rise),phase:'rise'};
  if(t<s.rise+s.hold)return {dy:-s.amplitude*k,phase:'hold'};
  return {dy:-s.amplitude*k*(1-smooth((t-s.rise-s.hold)/s.return)),phase:'return'};
}
