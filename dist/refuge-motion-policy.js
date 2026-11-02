// Isolated R2 proposal. One sample per existing visual frame; no clock/audio/DOM/storage.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=u=>{u=clamp(u);return u*u*u*(u*(u*6-15)+10);};
export const POLICY=Object.freeze({
 lift:Object.freeze({period:11,first:3.2,rise:1.15,hold:.5,return:1.8,duration:3.45,rest:2,amplitude:4.5,softAmplitude:1.2}),
 star:Object.freeze({period:12,first:5.8,duration:1.8,rest:2.8}),
 drill:Object.freeze({period:13,first:8.1,rise:.6,hold:.3,return:1.1,duration:2,rest:3.5,strokeSource:25.3103693181818}),
 wheel:Object.freeze({period:14,first:6.8,duration:2.6,rest:4}),
 notes:Object.freeze({period:6.5,first:1.2,duration:2.15,rest:1.6,life:1.75,spacing:.4,maxLive:2,size:1.25,travelX:-10.2,travelY:-15}),
 crown:Object.freeze({amplitude:1.65,period:.74,hoverGain:.35,pulse:1.35,rest:2}),
 forge:Object.freeze({flutterA:.075,flutterB:.03,speedA:5.2,speedB:8.4,hoverGain:.035,pulse:1.1,rest:1.8})
});
const ids={lift:'lift',stars:'star',shrine:'star',miner:'drill',miningMachine:'drill',zag:'wheel',roulette:'wheel',records:'notes',gramophone:'notes',tree:'crown',forge:'forge'};
export function notesEligible(playback,audioState){
 return playback?.playing===true&&audioState?.ready===true&&audioState?.context==='running'&&audioState?.disposed!==true&&audioState?.preferences?.enabled===true&&Number.isFinite(audioState.preferences.musicVolume)&&audioState.preferences.musicVolume>0;
}
const nextDue=(p,t)=>t<p.first?p.first:p.first+(Math.floor((t-p.first)/p.period)+1)*p.period;
function depthAt(age,rise,hold,back){return age<0||age>=rise+hold+back?0:age<rise?smooth(age/rise):age<rise+hold?1:1-smooth((age-rise-hold)/back);}
export function createMotionPolicy(){
 const keys=Object.keys(POLICY),states=Object.fromEntries(keys.map(k=>[k,{start:null,until:0,next:Infinity,previous:false}]));
 let lastTime=null,lastMode='',lastOutput=null;
 function synchronize(now,active,discard=true){for(const key of keys){const s=states[key],p=POLICY[key];if(discard&&s.start!==null)s.until=now+p.rest;else if(lastTime!==null&&now<lastTime)s.until=now;s.start=null;s.previous=key===active;s.next=p.period?nextDue(p,now):Infinity;}}
 return Object.freeze({sample({time=0,activeId=null,paused=false,hidden=false,soft=false,reduced=false,playback,audioState}={}){
  const now=Number.isFinite(time)?Math.max(0,time):0,active=ids[activeId]||null,eligible=notesEligible(playback,audioState)&&!hidden&&!reduced;
  const events=[],mode=String(soft)+'/'+String(reduced);
  if(paused||hidden){for(const key of keys)states[key].previous=key===active;if(!eligible){states.notes.start=null;if(lastOutput)lastOutput={...lastOutput,notes:[]};}return lastOutput?{...lastOutput,notes:eligible?lastOutput.notes:[],noteEligible:eligible,events}:empty(now);}
  const reset=lastTime===null||now<lastTime||now-lastTime>.25||mode!==lastMode;
  if(reset)synchronize(now,active);
  for(const key of keys){const s=states[key],p=POLICY[key],duration=p.duration??p.pulse;
   if(s.start!==null&&now>=s.start+duration)s.start=null;
   const edge=key===active&&!s.previous,auto=now>=s.next;
   s.previous=key===active;if(auto)s.next=nextDue(p,now);
   const allowed=!reduced&&(!soft||key==='lift'||key==='notes')&&(key!=='notes'||eligible);
   if(!allowed){s.start=null;continue;}
   if(!reset&&(edge||auto)&&s.start===null&&now>=s.until){s.start=now;s.until=now+duration+p.rest;events.push({key,source:edge?'hover':'idle',time:now});}
  }
  const age=key=>states[key].start===null?-1:now-states[key].start;
  const liftAge=age('lift'),drillAge=age('drill'),starAge=age('star'),wheelAge=age('wheel');
  const pulse=key=>{const a=age(key);return a<0?0:Math.sin(Math.PI*clamp(a/POLICY[key].pulse))**2;};
  const noteAge=age('notes'),notes=[];
  if(eligible&&!reduced&&noteAge>=0)for(let i=0;i<(soft?1:2);i++){const u=(noteAge-i*POLICY.notes.spacing)/POLICY.notes.life;if(u<=0||u>=1)continue;notes.push({dx:POLICY.notes.travelX*u*(soft?.55:1),dy:POLICY.notes.travelY*u*(soft?.55:1),alpha:Math.sin(Math.PI*u)*.88,scale:POLICY.notes.size*(.85+.15*smooth(Math.min(1,u*4))),angle:(i?-.09:.08)*u});}
  lastTime=now;lastMode=mode;
  lastOutput={time:now,stable:soft||reduced,soft,reduced,noteEligible:eligible,events,
   lift:{dy:-(soft?POLICY.lift.softAmplitude:POLICY.lift.amplitude)*depthAt(liftAge,POLICY.lift.rise,POLICY.lift.hold,POLICY.lift.return)||0,phase:liftAge<0?'rest':'active'},
   star:{phase:starAge<0?0:smooth(starAge/POLICY.star.duration),stable:soft||reduced},
   drill:{phase:drillAge<0?0:smooth(drillAge/POLICY.drill.duration),dy:depthAt(drillAge,.6,.3,1.1)*POLICY.drill.strokeSource,stable:soft||reduced},
   wheelAngle:wheelAge<0?0:TAU*smooth(wheelAge/POLICY.wheel.duration),notes,crownBoost:pulse('crown'),forgeBoost:pulse('forge')};
  return lastOutput;
 }});
}
function empty(time){return {time,stable:true,events:[],notes:[],noteEligible:false,lift:{dy:0,phase:'rest'},star:{phase:0,stable:true},drill:{phase:0,dy:0,stable:true},wheelAngle:0,crownBoost:0,forgeBoost:0};}
export function sampleCrownR2(layer,time,reduced,boost=0){
 if(reduced||layer.motion===false)return {dx:0,dy:0};
 const p=POLICY.crown,period=layer.period*p.period,a=layer.amp*p.amplitude*(1+p.hoverGain*boost);
 return {dx:0,dy:a*(.75*Math.sin(time*TAU/period+layer.phase)+.25*Math.sin(time*TAU/(period*1.73)+layer.phase*1.4))};
}
