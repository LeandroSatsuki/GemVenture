// Brief synthesized cues. Music keeps its own clock; no effect changes tempo.
// Note: frequency, duration, waveform, gain, delay, optional final frequency.
export const SOUND_CUES={
 drillHit:[[95,.1,'triangle',.055,0,42],[48,.1,'sine',.04,0]],
 drillDense:[[78,.22,'triangle',.022,0,60],[44,.24,'sine',.035,0]],
 drillDeflect:[[220,.12,'triangle',.065,0,110],[440,.06,'sine',.035,.03]],
 drillBomb:[[80,.35,'triangle',.09,0,28],[44,.45,'sine',.09,.025,24]],
 drillPulse:[[55,.5,'sine',.1,0,110],[392,.14,'triangle',.045,.1],[587,.18,'sine',.05,.23]],
 drillBoost:[[110,.15,'triangle',.06,0,220],[220,.2,'triangle',.045,.1,440]],
 burrow:[[150,.3,'triangle',.09,0,45],[90,.26,'sine',.07,.06,35]],
 emerge:[[65,.3,'sine',.12,0,180],[294,.12,'triangle',.08,.035,98],[587,.22,'sine',.05,.1]],
 rabbitStun:[[587,.09,'sine',.08,0,784],[880,.12,'triangle',.07,.08,1175],[1318,.22,'sine',.06,.16]],
 carrotSlam:[[110,.2,'triangle',.11,0,44],[165,.14,'triangle',.06,.04,80],[523,.22,'sine',.07,.08]],
 rockfall:[[100,.2,'triangle',.075,0,42],[68,.24,'sine',.065,.015,30]],
 ceiling:[[523,.055,'sine',.055,0],[392,.075,'sine',.05,.16]],
 zagStart:[[196,.16,'triangle',.1,0],[294,.18,'triangle',.1,.12],[392,.3,'sine',.1,.24]],
 zagTick:[[784,.08,'sine',.08,0]],
 zagWin:[[523,.16,'triangle',.1,0],[784,.2,'sine',.12,.08],[1047,.25,'sine',.1,.16],[1568,.45,'sine',.08,.24]],
 zagBreak:[[196,.22,'triangle',.12,0,60],[330,.12,'triangle',.08,.19,220],[220,.25,'triangle',.08,.33,147]],
 recordEquip:[[392,.11,'sine',.09,0],[523,.13,'triangle',.08,.09],[784,.22,'sine',.08,.18]],
 recordBuy:[[392,.12,'triangle',.1,0],[587,.12,'triangle',.1,.08],[784,.16,'sine',.11,.16],[1175,.34,'sine',.1,.25]],
 recordDrop:[[523,.13,'triangle',.13,0],[784,.17,'triangle',.12,.1],[1047,.2,'sine',.12,.2],[1568,.42,'sine',.11,.3]],
 ui:[[660,.06,'sine',.06,0]],
 accept:[[392,.1,'sine',.09,0],[587,.18,'sine',.1,.07]],
 claim:[[523,.2,'sine',.13,0],[659,.2,'sine',.12,.08],[784,.24,'sine',.12,.16],[1047,.4,'sine',.1,.24]],
 mission:[[659,.16,'triangle',.1,0],[784,.16,'sine',.12,.1],[1047,.4,'sine',.12,.2]],
 pick:[[740,.055,'triangle',.075,0,330],[1480,.04,'sine',.025,.01]],
 crystal:[[1175,.12,'sine',.08,0],[1568,.18,'sine',.07,.035]],
 heavy:[[196,.22,'triangle',.12,0,65],[1318,.3,'sine',.085,.04],[1760,.22,'sine',.06,.09]],
 kill:[[180,.12,'triangle',.1,0,70],[784,.1,'sine',.06,.05]],
 hurt:[[160,.16,'triangle',.11,0,80]],
 miss:[[330,.1,'sine',.085,0,220]],
 heal:[[392,.16,'sine',.085,0],[523,.18,'sine',.09,.07],[784,.3,'sine',.08,.14]],
 shield:[[523,.22,'sine',.07,0],[1047,.32,'sine',.09,.025]],
 proc:[[880,.12,'triangle',.055,0,1320],[1320,.14,'sine',.06,.04]],
 warning:[[294,.14,'sine',.12,0],[294,.14,'sine',.1,.19]],
 card:[[784,.12,'sine',.1,0],[1047,.25,'triangle',.075,.07]],
 descend:[[523,.13,'sine',.08,0],[392,.18,'sine',.09,.09],[262,.3,'sine',.09,.18]],
 death:[[330,.3,'sine',.12,0],[262,.35,'sine',.1,.16],[196,.6,'sine',.08,.33]]
};
export function eventSoundCues(events){
 const cues=new Set();
 for(const e of events){
  if(e.type==='missionReady'||e.type==='challengeWin')cues.add('mission');
  else if(e.type==='cargo')cues.add('claim');
  else if(e.type==='hurt')cues.add(e.reason==='attack'?'hurt':'miss');
  else if(['meteorWarning','invaderWarning','bossWarning','waveWarning','sectionWarning'].includes(e.type))cues.add('warning');
  else if(e.type==='burrow'||e.type==='emerge'||e.type==='rabbitStun'||e.type==='carrotSlam')cues.add(e.type);
  else if(e.type==='ceilingWarning')cues.add('ceiling');
  else if(e.type==='rockfall'||e.type==='rockfallDust')cues.add('rockfall');
  else if(e.type==='heal')cues.add('heal');
  else if(e.type==='shield')cues.add('shield');
  else if(e.type==='card')cues.add('card');
  else if(e.type==='boost'||e.type==='proc')cues.add('proc');
  else if(e.type==='loot')cues.add(e.heavy?'heavy':'crystal');
  else if(e.type==='kill')cues.add('kill');
  else if(e.type==='hit')cues.add('pick');
 }
 // A chain reaction must not become hundreds of simultaneous sounds.
 return ['mission','claim','hurt','burrow','emerge','rabbitStun','carrotSlam','warning','ceiling','rockfall','heal','shield','card','miss','heavy','proc','crystal','kill','pick'].filter(id=>cues.has(id)).slice(0,3);
}
