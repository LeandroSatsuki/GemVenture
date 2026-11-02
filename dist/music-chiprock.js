// Authored 40-bar arrangements on the existing sixteenth-note clock.
// A melody cell spans one bar (eight eighth notes). Null is a rest, not a
// random choice. Notes are semitones above the current harmony root.
const SCORES={
 pixel:{
  a:[[12,null,19,24,null,22,19,null],[15,null,19,22,19,null,15,null],[17,19,null,24,22,null,19,17],[15,null,12,null,10,12,null,null]],
  b:[[24,null,27,26,24,null,19,null],[22,24,null,27,26,22,null,null],[19,null,22,24,null,22,17,null],[19,17,15,null,14,12,null,null]],
  bridge:[[12,null,null,19,null,null,17,null],[15,null,null,null,12,null,null,null],[10,null,null,15,null,17,null,null],[19,null,17,null,12,null,null,null]]},
 dusk:{
  a:[[24,null,null,22,19,null,17,null],[19,null,22,null,24,null,null,null],[22,null,null,19,17,null,15,null],[17,null,19,null,12,null,null,null]],
  b:[[27,null,26,24,null,22,24,null],[26,null,null,22,19,null,null,null],[24,null,22,19,null,17,19,null],[22,null,19,null,17,15,null,null]],
  bridge:[[19,null,null,null,17,null,null,null],[15,null,null,12,null,null,null,null],[17,null,null,null,19,null,null,null],[22,null,19,null,12,null,null,null]]},
 iron:{
  a:[[12,null,15,19,null,17,15,null],[12,null,10,12,null,7,null,null],[15,null,19,22,null,19,17,null],[15,12,null,10,7,12,null,null]],
  b:[[24,null,22,19,22,null,19,null],[17,19,null,22,19,null,15,null],[19,null,22,24,22,19,null,17],[15,null,17,19,15,12,null,null]],
  bridge:[[12,null,null,7,null,null,10,null],[12,null,null,null,15,null,null,null],[17,null,null,15,null,12,null,null],[10,null,7,null,12,null,null,null]]}
};
const FORMS=['theme','lift','answer','bridge','return'];

export function chiprockStep(id,step,{root,beat,hot=false}){
 const score=SCORES[id];if(!score)return [];
 const q=step%16,bar=Math.floor(step/16),section=Math.floor(bar/8)%5;
 const sectionName=FORMS[section],bridge=section===3,lift=section===1,final=section===4;
 const cell=score[bridge?'bridge':lift?'b':'a'][(bar+(section===2?2:0))%4];
 const events=[];
 const add=(kind,n,duration,level,role,extra={})=>events.push({kind,freq:root*2**(n/12),duration,level,role,section:sectionName,...extra});
 // Let each written note breathe until the next onset, with an upper bound
 // that leaves space for action sounds even at the slowest boss tempo.
 if(q%2===0&&cell[q/2]!==null){
  const i=q/2;let length=1;while(i+length<8&&cell[i+length]===null)length++;
  const note=cell[i]+(final&&hot&&bar%4===2?12:0);
  let gate=Math.min(1.45,length*.46);
  for(const answer of [3,7])if(!bridge&&cell[answer]===null&&answer>i)gate=Math.min(gate,(answer-i)*.5-.06);
  add('lead',note,beat*gate,id==='iron'?.052:id==='pixel'?.064:.063,'signature',
      {color:id==='dusk'?'warm':'chip',pan:0});
 }
 // A quiet answer occupies an actual rest in the signature. The lead never
 // competes with a continuous high arpeggio on every sixteenth note.
 if(!bridge&&q%2===0&&cell[q/2]===null&&[6,14].includes(q))
  add('pluck',bar%2?19:24,beat*.3,.037,'answer',{color:'bell',pan:bar%2?-.36:.36});

 if(id==='pixel'){
  if(q%4===0)add('bass',[-12,-12,-5,q===12&&bar%4===3?-2:0][q/4],beat*.43,.13,'bass',{color:'chip'});
  if(!bridge&&[3,7,11,15].includes(q)&&cell[Math.floor(q/2)]===null)
   add('lead',[12,15,19,22][Math.floor(q/4)],beat*.16,.022,'arp',{color:'chip',pan:bar%2?-.4:.4});
  if((lift||final)&&q===0&&bar%2===0)add('guitar',0,beat*.62,.055,'riff',{color:'rock',pan:bar%4===0?-.3:.3});
 }else if(id==='dusk'){
  if(q%2===0&&(!bridge||q%4===0))add('bass',q===14&&bar%2?-5:q%8===6?0:-12,beat*.44,.16,'bass',{color:'electric'});
  if(q===0)for(const n of [0,3,7])add('pad',n,beat*(bridge?2.6:3.4),.024,'harmony',{color:'warm',pan:n===0?-.38:n===3?.38:0});
  if(!bridge&&q%4===3)add('pluck',[12,19,15,22][Math.floor(q/4)],beat*.31,.038,'arp',{color:'bell',pan:q%8===3?-.44:.44});
  if((lift||final)&&[2,10].includes(q))add('guitar',0,beat*.34,.052,'riff',{color:'rock',pan:q===2?-.32:.32});
 }else{
  const riff=[0,0,7,0,10,7,5,3];
  if(q%2===0&&(!bridge||q%4===0)){
   const n=bridge?0:riff[(q/2+(bar%2?4:0))%8];
   add('guitar',n,beat*(q===14?.65:.28),bridge?.085:.11,'riff',{color:'rock',pan:bar%4<2?-.28:.28});
   add('bass',n%12-12,beat*.39,.16,'bass',{color:'electric'});
  }
  if(q===0&&bar%8===0)add('crash',0,.48,.042,'accent');
 }
 // One fill per eight bars; accents are musical decoration, never new kicks.
 if(!bridge&&bar%8===7&&[13,15].includes(q))add('tom',q===13?7:0,.1,.055,'fill');
 return events;
}
