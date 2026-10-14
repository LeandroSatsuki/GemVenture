// Original biome themes with phrase variations and a shared musical clock.
import {biomeIndex} from './campaign.js';
import {isBossFloor} from './bosses.js';
export const TRACKS=[
 {name:'PRISMA PULSE',style:'CRYSTAL HOUSE',bpm:116,root:130.813,lead:'triangle',bass:[0,0,5,7],melody:[12,0,19,0,15,17,19,0,12,0,10,0,7,10,15,19],answer:[19,22,19,17,15,0,12,0,10,12,15,0,19,17,15,12],hat:2},
 {name:'NEON ROOTS',style:'JUNGLE GROOVE',bpm:128,root:146.832,lead:'sine',bass:[0,7,3,5],melody:[12,15,0,19,17,0,15,12,0,10,12,17,0,19,22,0],answer:[24,0,22,19,0,17,19,15,12,0,15,17,19,0,15,10],hat:1},
 {name:'FOSSIL BREAK',style:'ANCIENT BREAKS',bpm:140,root:123.471,lead:'square',bass:[0,3,8,7],melody:[12,0,12,19,0,15,0,10,12,19,22,0,19,15,10,0],answer:[24,19,0,22,19,0,15,19,0,12,15,0,10,12,19,0],hat:1},
 {name:'CORE OVERDRIVE',style:'MAGMA RUSH',bpm:152,root:110,lead:'sawtooth',bass:[0,8,5,7],melody:[12,19,24,19,15,22,27,22,17,24,29,24,19,22,26,22],answer:[24,19,15,19,27,22,19,22,29,24,20,24,26,22,19,10],hat:1}
];
export const BOSS_TRACKS=[
 {name:'COROA DE QUARTZO',style:'BATALHA · CRISTAL',bpm:92,root:98,lead:'triangle',bass:[0,5,3,7],melody:[12,0,0,19,0,0,15,0,12,0,0,10,0,0,7,0],answer:[19,0,17,0,15,0,12,0,10,0,7,0,12,0,0,0],hat:4},
 {name:'CANTO DAS RAÍZES',style:'BATALHA · FLORESTA',bpm:100,root:110,lead:'sine',bass:[0,3,5,7],melody:[12,0,15,0,0,19,0,0,17,0,0,15,12,0,0,0],answer:[24,0,22,0,0,19,0,17,15,0,12,0,10,0,0,0],hat:4},
 {name:'MARCHA DOS ANTIGOS',style:'BATALHA · FÓSSEIS',bpm:108,root:82.407,lead:'triangle',bass:[0,8,5,7],melody:[12,0,12,0,19,0,0,0,15,0,15,0,10,0,0,0],answer:[24,0,19,0,22,0,19,0,15,0,12,0,10,0,0,0],hat:2},
 {name:'ECLIPSE MÍSTICO',style:'BATALHA · MANTO',bpm:116,root:103.826,lead:'sine',bass:[0,5,8,7],melody:[12,0,19,0,24,0,0,22,19,0,15,0,12,0,0,0],answer:[24,0,22,0,19,0,17,0,15,0,19,0,12,0,0,0],hat:2}
];
TRACKS.push({name:'MICÉLIO VIVO',style:'SPORE GROOVE',bpm:136,root:155.563,lead:'sine',bass:[0,5,8,3],melody:[12,0,15,19,0,17,12,0,24,19,0,15,17,0,10,12],answer:[24,0,19,22,0,17,19,0,15,12,0,10,15,0,19,12],hat:2});
BOSS_TRACKS.push({name:'VALSA DO MICÉLIO',style:'BATALHA · ESPIRAL',bpm:104,root:77.782,lead:'triangle',bass:[0,5,3,8],melody:[12,0,19,0,15,0,24,0,19,0,17,0,15,0,10,0],answer:[24,0,22,0,19,0,17,0,15,0,12,0,19,0,0,0],hat:4});
TRACKS.push({name:'PULSO DE ÂMBAR',style:'TÚNEIS · GROOVE',bpm:140,root:116.541,lead:'triangle',bass:[0,3,7,5],melody:[12,0,7,12,0,15,0,19,17,0,12,0,10,12,0,7],answer:[19,0,15,12,0,10,12,0,17,19,0,15,0,12,7,0],hat:2});
BOSS_TRACKS.push({name:'O REI SOB A TERRA',style:'BATALHA · TOCAS',bpm:108,root:73.416,lead:'triangle',bass:[0,0,5,3],melody:[7,0,12,0,0,15,0,12,7,0,10,0,0,19,0,12],answer:[19,0,15,0,0,12,0,7,17,0,15,0,0,10,0,7],hat:4});
TRACKS.push({name:'RAÍZES EM FESTA',style:'HORTA · SWING',bpm:144,root:130.813,lead:'triangle',bass:[0,5,7,3],melody:[12,0,16,19,0,16,12,7,12,0,19,16,0,14,12,7],answer:[19,0,16,12,0,14,16,19,24,0,19,16,14,0,12,7],hat:2});
BOSS_TRACKS.push({name:'VALSA DA CENOURA',style:'BATALHA · COLHEITA',bpm:112,root:98,lead:'triangle',bass:[0,3,5,7],melody:[12,0,19,0,16,0,12,0,7,0,14,0,19,0,16,0],answer:[24,0,19,0,16,0,14,0,12,0,16,0,19,0,7,0],hat:4});
// Append paired themes; the first ten IDs remain compatible with saved clocks.
export const ALL_TRACKS=[...TRACKS.slice(0,4),...BOSS_TRACKS.slice(0,4),...TRACKS.slice(4).flatMap((track,i)=>[track,BOSS_TRACKS[i+4]])];
export const isBossTrack=index=>index>=4&&(index<8||index%2===1);
export const trackIndexForFloor=floor=>{const i=biomeIndex(floor);return i>=4?8+(i-4)*2+(isBossFloor(floor)?1:0):i+(isBossFloor(floor)?4:0);};
export const trackForFloor=floor=>ALL_TRACKS[trackIndexForFloor(floor)];
export const beatSeconds=floor=>60/trackForFloor(floor).bpm;

// One deterministic clock drives sound, input, creatures and the pulse rail.
// Tempo changes are phrase-bound, announced four beats ahead and eased over four beats.
export const MUSIC_SECTIONS=[
 {name:'FLUXO',rate:1},{name:'IMPULSO',rate:1.04},{name:'FLUXO',rate:1},
 {name:'RESPIRO',rate:.97},{name:'RETORNO',rate:1}
];
const clocks=new Map();
function tempoClock(index){
 if(clocks.has(index))return clocks.get(index);
 const base=60/(ALL_TRACKS[index]||TRACKS[0]).bpm,times=[0];
 for(let b=0;b<160;b++){
  const section=Math.floor(b/32),offset=b%32,target=MUSIC_SECTIONS[section].rate,previous=MUSIC_SECTIONS[(section+4)%5].rate;
  const rate=isBossTrack(index)?1:previous+(target-previous)*Math.min(1,(offset+1)/4);
  times.push(times[b]+base/rate);
 }
 const clock={times,length:times[160]};clocks.set(index,clock);return clock;
}
export function trackBeatTime(index,phase){
 const c=tempoClock(index);if(phase<0)return phase*(c.times[1]-c.times[0]);
 const cycles=Math.floor(phase/160),local=phase-cycles*160,b=Math.floor(local);
 return cycles*c.length+c.times[b]+(local-b)*(c.times[b+1]-c.times[b]);
}
export function trackBeatPhase(index,seconds){
 const c=tempoClock(index);if(seconds<0)return seconds/c.times[1];
 const cycles=Math.floor(seconds/c.length),local=seconds-cycles*c.length;let lo=0,hi=160;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(c.times[mid]<=local)lo=mid;else hi=mid;}
 return cycles*160+lo+(local-c.times[lo])/(c.times[lo+1]-c.times[lo]);
}
export const beatTime=(floor,phase)=>trackBeatTime(trackIndexForFloor(floor),phase);
export const beatPhase=(floor,seconds)=>trackBeatPhase(trackIndexForFloor(floor),seconds);
export const beatDuration=(floor,beat)=>beatTime(floor,Math.floor(beat)+1)-beatTime(floor,Math.floor(beat));
export function timingGraceMs(floor,beat){
 if(isBossFloor(floor)||beat<32)return 0;
 const local=((Math.floor(beat)%160)+160)%160,section=Math.floor(local/32);
 return section>0&&local%32<8?60:0;
}
export function trackCue(index,phase){
 const local=((phase%160)+160)%160,section=Math.floor(local/32),offset=local%32,current=MUSIC_SECTIONS[section],previous=MUSIC_SECTIONS[(section+4)%5],next=MUSIC_SECTIONS[(section+1)%5];
 const warning=offset>=28&&next.rate!==current.rate,changing=offset<4&&current.rate!==previous.rate;
 const target=warning?next:current,from=warning?current:previous;
 return {name:current.name,warning,changing,count:warning?Math.ceil(32-offset):0,
  label:isBossTrack(index)?'VIRADA':target.rate>from.rate?'ACELERA':'DESACELERA',
  direction:Math.sign(target.rate-from.rate),bpm:60/(trackBeatTime(index,Math.floor(phase)+1)-trackBeatTime(index,Math.floor(phase)))};
}
export const musicCue=(floor,phase)=>trackCue(trackIndexForFloor(floor),phase);
export function savedMusicElapsed(run){
 if(!run)return 0;const elapsed=Number.isFinite(run.elapsed)?Math.max(0,run.elapsed):0;
 return run.musicClock===2?elapsed:beatTime(run.floor,elapsed*(run.clockBpm||110)/60);
}

export function scoreStep(trackIndex,step){
 const t=ALL_TRACKS[trackIndex]||TRACKS[0],k=step%128,phrase=Math.floor(k/32),notes=phrase%2?t.answer:t.melody,events=[];
 const section=Math.floor(step/128)%5,calm=section===3,drive=section===1,cue=trackCue(trackIndex,step/4);
 // The anchor is always present: ornaments never add a required action.
 if(k%4===0)events.push({kind:'kick',gain:calm?.85:1});
 if(isBossTrack(trackIndex)&&k%16===0)for(const note of [0,7,12])events.push({kind:'chord',freq:t.root*2**((t.bass[phrase]+note)/12)});
 if(!calm&&(trackIndex===2?[6,12,22,28].includes(k%32):k%8===4))events.push({kind:'snare',gain:drive?1.1:1});
 const hats=calm?4:drive?1:t.hat;
 if(k%hats===0)events.push({kind:'hat',accent:k%4===2,gain:calm?.6:1});
 if(k%(calm?16:drive?4:8)===0)events.push({kind:'bass',freq:t.root/2*2**(t.bass[phrase]/12)});
 if(k%(calm?4:2)===0){const n=notes[Math.floor(k/2)%16];if(n)events.push({kind:'lead',freq:t.root*2**((n+(drive&&phrase%2?12:0))/12),gain:calm?.7:1});}
 if(drive&&k%8===7)events.push({kind:'fill',freq:t.root*3});
 if(cue.warning&&k%4===0)events.push({kind:'cue',freq:t.root*2**((12+(cue.direction>0?4-cue.count:cue.count)*2)/12)});
 if(cue.warning&&cue.count<=2&&k%2===1)events.push({kind:'fill',freq:t.root*4});
 return events;
}
