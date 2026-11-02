import {beatPhase,beatTime} from './score.js';
import {musicFloor} from './frenzy.js';
import {RECORDED_BEATMAPS} from './recorded-beatmaps.js';
import {MUSIC_ALBUMS,ALBUM_TIERS} from './music-albums.js';
export const albumForEdition=id=>MUSIC_ALBUMS.find(a=>a.editions.some(e=>e.id===id));
export const hasAlbumClock=run=>!run?.trainingClock&&Object.hasOwn(RECORDED_BEATMAPS,run?.albumEdition);
const clocks=new Map();
export function albumClock(id){
 if(clocks.has(id))return clocks.get(id);
 if(!Object.hasOwn(RECORDED_BEATMAPS,id))return null;const map=RECORDED_BEATMAPS[id];
 const {times,duration}=map,n=times.length,gaps=times.map((t,i)=>(times[i+1]??duration+times[0])-t),sorted=[...gaps].sort((a,b)=>a-b),intro=sorted[Math.floor(n/2)],start=4*intro-times[0];
 const time=phase=>{
  if(phase<4)return phase*intro;
  const p=phase-4,cycles=Math.floor(p/n),local=p-cycles*n,i=Math.floor(local),a=times[i],b=times[i+1]??duration+times[0];
  return start+cycles*duration+a+(local-i)*(b-a);
 };
 const phase=seconds=>{
  if(seconds<4*intro)return seconds/intro;
  const p=seconds-start-times[0],cycles=Math.floor(p/duration),local=seconds-start-cycles*duration;let lo=0,hi=n;
  while(lo+1<hi){const m=(lo+hi)>>1;if(times[m]<=local)lo=m;else hi=m;}
  return 4+cycles*n+lo+(local-times[lo])/((times[lo+1]??duration+times[0])-times[lo]);
 };
 const clock=Object.freeze({time,phase,duration,count:n,intro,start,times});clocks.set(id,clock);return clock;
}
export function albumTrack(run){
 const a=albumForEdition(run?.albumEdition);if(!a)return null;const e=a.editions.find(e=>e.id===run.albumEdition);
 return {name:a.title,style:a.genre+' · '+ALBUM_TIERS[e.tier],bpm:e.actionsPerMinute,album:a,edition:e};
}

export const sceneBeatPhase=(run,seconds)=>hasAlbumClock(run)?albumClock(run.albumEdition).phase(seconds):beatPhase(musicFloor(run),seconds);
export const sceneBeatTime=(run,phase)=>hasAlbumClock(run)?albumClock(run.albumEdition).time(phase):beatTime(musicFloor(run),phase);
