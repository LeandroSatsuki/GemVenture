import {maxHealth,maxRhythm,actionWindowMs} from './core.js';
import {roomSize,isFloor} from './cavern.js';
import {missionList,MISSION_TYPES} from './missions.js';
import {scoreProgress,starMarks} from './stars.js';
import {beatDuration,beatPhase,musicCue,trackForFloor} from './score.js';
import {musicFloor} from './frenzy.js';
import {runBeatPhase,runMusicCue,runRailSeconds,runTrack} from './training-clock.js';
import {hasAlbumClock,albumClock} from './album-clock.js';

export const fraction=(value,max)=>Number.isFinite(value)&&max>0?Math.max(0,Math.min(1,value/max)):0;
// UI trace of musical beat phase, not an FFT/audio spectrum or separate animation clock.
export function rhythmWave(phase,amplitude=18){
 return Array.from({length:121},(_,i)=>{const x=i*100/120,p=(phase+x/25)*Math.PI*2,y=50+Math.sin(p)*amplitude*(.5+.5*Math.cos(p/2)**2);return(i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);}).join(' ');
}
export function rhythmPositions(phase,run=null){if(hasAlbumClock(run)){const c=albumClock(run.albumEdition),now=c.time(phase),beats=Array.from({length:5},(_,i)=>Math.floor(phase)+i);return {beats,positions:beats.map(b=>15+(c.time(b)-now)/c.intro*25)};}const beats=Array.from({length:5},(_,i)=>Math.floor(phase)+i);return {beats,positions:beats.map(beat=>15+(beat-phase)*25)};}
// Factual contract GV-HUD-current-data-adriano-v1, including rectangular fallback.
// In Abyss this is the current shifting window, never accumulated exploration.
export function exploration(room){
 if(!room)return {supported:false,explored:0,total:0,percent:0,fill:0};
 const {cols,rows}=roomSize(room),supported=!!room.explored;let remembered=0;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(room.explored?.[y*cols+x]&&isFloor(room,x,y))remembered++;
 const total=room.floorMask?.reduce((sum,v)=>sum+v,0)||(cols-2)*(rows-2);
 const fill=supported&&Number.isFinite(total)&&total>0?Math.max(0,Math.min(1,remembered/total)):0;
 return {supported,explored:remembered,total:Number.isFinite(total)&&total>0?total:0,percent:Math.round(fill*100),fill};
}
export function selectedMission(s){const list=missionList(s);return list.find(m=>m.status==='active')||list.find(m=>m.status==='ready')||list[0]||null;}
export function hudView(s,elapsed=0){
 const r=s.run;if(!r)return null;
 const floor=musicFloor(r),phase=runBeatPhase(r,elapsed),cue=runMusicCue(r,phase),hpMax=maxHealth(s),breathMax=maxRhythm(s),mission=selectedMission(s);
 const width=actionWindowMs(s,Math.round(phase))/1000/runRailSeconds(r,phase)*50;
 const sequence=rhythmPositions(phase,r);
 return {hp:{value:r.health,max:hpMax,ratio:fraction(r.health,hpMax)},breath:{value:r.rhythm,max:breathMax,ratio:fraction(r.rhythm,breathMax),low:r.rhythm<=30},exploration:exploration(r.room),mission:mission?{...mission,definition:MISSION_TYPES.find(m=>m.id===mission.template)}:null,score:scoreProgress(r),marks:starMarks(r),phase,bpm:Math.round(cue.bpm),trackName:runTrack(r).name,window:{width,left:15-width/2},notes:sequence.positions,noteBeats:sequence.beats};
}
