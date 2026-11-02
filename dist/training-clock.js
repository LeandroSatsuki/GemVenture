import {beatTime,beatDuration,beatPhase,musicCue,savedMusicElapsed,trackForFloor,timingGraceMs} from './score.js';
import {musicFloor} from './frenzy.js';
import {hasAlbumClock,albumClock,albumTrack} from './album-clock.js';

export const TRAINING_BPMS=Object.freeze([80,100,120]);
export const validTrainingBpm=bpm=>TRAINING_BPMS.includes(bpm);
export const hasTrainingClock=run=>run?.trainingClock?.version===1&&validTrainingBpm(run.trainingClock.bpm);
export const runBeatTime=(run,phase)=>hasTrainingClock(run)?phase*60/run.trainingClock.bpm:hasAlbumClock(run)?albumClock(run.albumEdition).time(phase):beatTime(musicFloor(run),phase);
export const runBeatDuration=(run,beat)=>hasTrainingClock(run)?60/run.trainingClock.bpm:hasAlbumClock(run)?albumClock(run.albumEdition).time(Math.floor(beat)+1)-albumClock(run.albumEdition).time(Math.floor(beat)):beatDuration(musicFloor(run),beat);
export const runTimingGraceMs=(run,beat)=>hasTrainingClock(run)||hasAlbumClock(run)?0:timingGraceMs(musicFloor(run),beat);

export const runBeatPhase=(run,seconds)=>hasTrainingClock(run)?seconds*run.trainingClock.bpm/60:hasAlbumClock(run)?albumClock(run.albumEdition).phase(seconds):beatPhase(musicFloor(run),seconds);
export const runMusicCue=(run,phase)=>hasAlbumClock(run)?{name:'BATERIA DA MÚSICA',warning:false,changing:false,count:0,direction:0,label:'',bpm:60/runBeatDuration(run,phase)}:hasTrainingClock(run)?{name:'TREINO',warning:false,changing:false,count:0,direction:0,label:'',bpm:run.trainingClock.bpm}:musicCue(musicFloor(run),phase);
export const runSavedMusicElapsed=run=>hasAlbumClock(run)?(Number.isFinite(run.elapsed)?Math.max(0,run.elapsed):0):savedMusicElapsed(run);
export const runTrack=run=>hasAlbumClock(run)?albumTrack(run):trackForFloor(musicFloor(run));
export const runRailSeconds=(run,beat)=>hasAlbumClock(run)?albumClock(run.albumEdition).intro:runBeatDuration(run,beat);
