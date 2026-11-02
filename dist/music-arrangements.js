import {chiprockStep} from './music-chiprock.js';
import {ALL_TRACKS,scoreStep,isBossTrack,trackBeatTime} from './score.js';

// Original compositions. A disc owns its harmony, riff and orchestration;
// the expedition alone owns tempo. Sixteenth notes never add required clicks.
export const ARRANGEMENTS=Object.freeze({
 pulse:{family:'house',chords:[0,8,3,10,0,5,8,7],riff:[12,null,19,null,15,17,null,19,12,null,10,12,7,null,15,19]},
 iron:{family:'rock',chords:[0,0,5,3,0,8,5,7],riff:[0,0,7,0,10,7,5,3,0,0,12,10,7,5,3,7]},
 aria:{family:'opera',chords:[0,5,8,7,0,3,5,7],riff:[12,15,19,17,15,12,10,7,12,19,24,22,19,17,15,12]},
 moss:{family:'forest',chords:[0,5,3,10,0,10,5,3],riff:[12,null,19,22,null,19,15,null,12,7,null,10,15,null,19,12]},
 amber:{family:'funk',chords:[0,5,0,7,3,5,10,7],riff:[0,null,12,7,null,0,10,null,0,7,null,12,10,7,null,3]},
 night:{family:'disco',chords:[0,3,8,10,0,5,3,7],riff:[12,19,24,19,15,22,27,22,17,24,29,24,19,26,31,26]},
 choir:{family:'choir',chords:[0,8,5,7,3,10,8,7],riff:[12,7,15,12,19,15,22,19,24,19,22,17,19,15,12,10]},
 storm:{family:'metal',chords:[0,1,0,8,0,5,3,7],riff:[0,0,0,7,0,0,1,0,0,12,0,10,8,7,3,1]},
 circuit:{family:'techno',chords:[0,0,0,3,0,0,5,7],riff:[0,12,0,7,null,0,10,0,12,0,7,15,0,null,10,7]},
 dusk:{family:'synthwave',chords:[0,8,3,10,0,5,8,7],riff:[12,19,15,22,12,19,15,24,10,17,14,22,10,17,14,19]},
 voice:{family:'vocalpop',chords:[0,8,3,10,0,5,8,7],riff:[12,12,15,null,19,17,15,null,12,15,19,22,19,17,15,12]},
 rush:{family:'dnb',chords:[0,0,8,8,3,3,10,7],riff:[0,0,12,7,0,10,12,7,0,0,7,12,10,7,3,0]},
 pixel:{family:'chip',chords:[0,5,7,3,0,8,5,7],riff:[12,19,24,19,15,19,27,19,17,24,29,24,15,22,27,22]},
 swing:{family:'swing',chords:[0,5,0,7,3,5,0,7],riff:[12,null,16,19,22,19,16,14,12,7,10,12,14,16,19,12]},
 turbo:{family:'eurobeat',chords:[0,5,7,0,9,5,7,0],riff:[12,16,19,24,21,19,16,19,24,23,21,19,16,14,16,12]}
});

export function arrangementStep(record,trackIndex,step,mood={}){
 const p=ARRANGEMENTS[record.id]||ARRANGEMENTS.pulse,t=ALL_TRACKS[trackIndex]||ALL_TRACKS[0];
 const q=step%16,bar=Math.floor(step/16),phrase=Math.floor(step/128),boss=isBossTrack(trackIndex);
 const calm=phrase%5===3,drive=phrase%5===1,hot=(mood.combo||0)>=50;
 const b=trackBeatTime(trackIndex,step/4+1)-trackBeatTime(trackIndex,step/4);
 const chord=(p.chords[Math.floor(bar/2)%p.chords.length]+t.bass[Math.floor(bar/4)%t.bass.length])%12,root=t.root*2**(chord/12);
 const events=[],add=(kind,n=0,duration=.2,level=.1,extra={})=>events.push({kind,freq:root*2**(n/12),duration,level,...extra});
 const strength=calm?.7:hot?1.08:1;
 // Keep the same audible anchor in every genre, including orchestral breaks.
 if(step%4===0)add('kick',0,.18,(p.family==='techno'?.62:.48)*(calm?.85:1));
 const snare=(q===4||q===12)&&!(boss&&(p.family==='opera'||p.family==='choir')&&q===4);
 if(snare)add('snare',0,p.family==='metal'||p.family==='rock'?.16:.11,(p.family==='techno'?.09:.13)*strength);
 const sparse=['opera','choir','forest'].includes(p.family),hatEvery=calm||sparse?4:2;
 if(step%hatEvery===0)add('hat',0,q===14?.12:.035,(q%4===2?.028:.011)*strength,{cutoff:sparse?3400:6500});
 const riff=p.riff[Math.floor(step/2)%16];
 const alternate=Math.floor(bar/4)%2===1,shift=alternate&&['house','forest','opera'].includes(p.family)?7:0;

 switch(p.family){
  case 'vocalpop': {
   if(q%4===2)add('bass',-12,b*.42,.18,{color:'sub'});
   if(q===0||q===8)for(const n of [0,3,7,12])add('pad',n,b*1.8,.021,{color:'warm'});
   if(step%2===0&&riff!==null){
    add('sing',riff+(hot&&alternate?12:0),b*(q===14?.85:.43),hot?.14:.11,{vowel:['a','i','o','a','u','i','a','o'][Math.floor(step/2)%8]});
    if(hot&&q%4===0)add('pluck',riff+12,b*.22,.035,{color:'bell',pan:.22});
   }
   break;
  }
  case 'dnb': {
   if([0,3,6,8,11,14].includes(q))add('bass',p.riff[q]-12,b*.32,.16,{color:'reese'});
   if(!calm&&step%2===1)add('hat',0,.025,.01,{cutoff:7400});
   if(q===7||q===10)add('snare',0,.06,.032);
   if(q===0||q===8)for(const n of [12,15,19])add('pad',n,b*1.6,.022,{color:'warm'});
   if(step%4===2)add('pluck',[24,19,22,17][Math.floor(step/4)%4],b*.48,.061,{color:'bell',pan:.2});
   if(q>=12&&bar%4===3)add('tom',7-(q-12)*2,.1,.07);
   break;
  }
  case 'chip': {events.push(...chiprockStep(record.id,step,{root,beat:b,hot}));break;}
  case 'swing': {
   const delay=step%4===2?1/6:0;
   if(step%4===0)add('bass',[-12,-8,-5,-2][Math.floor(step/4)%4],b*.56,.17,{color:'soft'});
   if(q===2||q===10)for(const n of [12,16,19,22])add('keys',n,b*.37,.037,{color:'clav',delayBeats:1/6,pan:-.2});
   if(step%2===0&&riff!==null)add('lead',riff,b*.38,.067,{color:'brass',delayBeats:delay,pan:.2});
   break;
  }
  case 'eurobeat': {
   if(step%2===0)add('bass',[-12,0,-5,0][Math.floor(step/2)%4],b*.3,.18,{color:'electric'});
   if(step%2===0&&riff!==null)add('lead',riff,b*.4,.065,{color:'supersaw',pan:.2});
   if(q===0||q===8)for(const n of [12,16,19])add('keys',n,b*.8,.035,{color:'bright'});
   if(hot&&q===0&&bar%2===0)add('sing',24,b*.85,.1,{vowel:'a'});
   break;
  }
  case 'rock': {events.push(...chiprockStep(record.id,step,{root,beat:b,hot}));break;}
  case 'metal': {
   if(step%2===0&&(!calm||step%4===0)){
    add('guitar',riff,b*(q===14?.9:.37),.16*strength,{color:p.family,pan:bar%2?-.18:.18});
    add('bass',riff%12-12,b*.42,.19,{color:'electric'});
   }
   if(q===0&&bar%4===0)add('crash',0,.65,.06);
   if((drive||hot)&&q>=12&&bar%4===3)add('tom',12-(q-12)*3,.13,.1);
   if(hot&&bar%4===0&&q===0)add('vocal',12,.3,.1);
   break;
  }
  case 'techno': {
   // Acid line, offbeat sub and gated stabs: no house melody pasted on top.
   const n=p.riff[step%16];
   if(n!==null&&(!calm||step%2===0))add('acid',n-12,b*(step%4===3?.45:.21),.14*strength,{brightness:.25+.65*((bar%8)/7),accent:step%4===2});
   if(q%4===2)add('bass',-12,b*.3,.17,{color:'sub'});
   if(q===2||q===10)add('hat',0,.14,.025,{cutoff:4800});
   if(bar%4===3&&q===15)add('tom',0,.09,.07);
   if(hot&&q===0&&bar%4===0)add('vocal',19,.19,.08);
   break;
  }
  case 'funk': {
   if([0,3,6,8,10,14].includes(q))add('bass',p.riff[q]-12,b*.28,.23,{color:'slap'});
   if([2,7,11,15].includes(q))for(const n of [12,16,19,22])add('keys',n,b*.27,.038,{color:'clav',pan:-.2});
   if(q===5||q===13)add('pluck',19+(alternate?3:0),b*.35,.075,{color:'bell',pan:.23});
   break;
  }
  case 'disco': {
   if(step%2===0)add('bass',[-12,0,-5,0][Math.floor(step/2)%4],b*.35,.2,{color:'electric'});
   if(q===2||q===10)for(const n of [12,15,19,22])add('keys',n,b*.7,.037,{color:'bright'});
   if(step%2===0&&riff!==null&&(!calm||step%4===0))add('lead',riff,b*.28,.065,{color:'disco',pan:.2});
   if(hot&&q===0&&bar%4===0)add('vocal',24,.27,.1);
   break;
  }
  case 'opera': case 'choir': {
   if(q===0){
    add('bass',-12,b*2,.11,{color:'sub'});
    for(const n of [0,3,7,12])add('pad',n,b*3.8,.027,{color:p.family});
   }
   const spacing=p.family==='choir'?8:4;
   if(step%spacing===0)add('vocal',p.riff[Math.floor(step/spacing)%16],b*(p.family==='choir'?1.65:.85),p.family==='choir'?.09:.1);
   if(q===6||q===14)add('pluck',24+(alternate?7:0),b*.9,.042,{color:'bell'});
   break;
  }
  case 'forest': {
   if(q===0||q===10)add('bass',-12,b*.7,.14,{color:'soft'});
   if([0,3,7,10,14].includes(q))add('tom',[12,7,0][bar%3],.12,.08);
   if(step%2===0&&riff!==null)add('pluck',riff+shift,b*.85,.09,{color:'wood',pan:step%4===0?-.23:.23});
   if(q===0&&bar%2===0)for(const n of [0,7,12])add('pad',n,b*5,.021,{color:'warm'});
   break;
  }
  case 'synthwave': {events.push(...chiprockStep(record.id,step,{root,beat:b,hot}));break;}
  default: {
   if(q%4===2)add('bass',-12,b*.45,.19,{color:'sub'});
   if(q===2||q===10)for(const n of [12,15,19])add('keys',n,b*.65,.047,{color:'bright'});
   if(step%2===0&&riff!==null&&(!calm||step%4===0))add('pluck',riff+shift,b*.55,.095,{color:'bell'});
   if(q===0&&bar%4===0)for(const n of [0,7,12])add('pad',n,b*3.5,.021,{color:'warm'});
   if(hot&&q===0&&bar%4===0)add('vocal',24,.25,.08);
  }
 }
 // Only the warning motif is inherited from the shared score. No genre can hide it.
 for(const e of scoreStep(trackIndex,step))if(e.kind==='cue')events.push({...e,duration:.17,level:.17});
 return events;
}
