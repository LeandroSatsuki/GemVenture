import {beatTime,beatDuration,beatPhase,musicCue,savedMusicElapsed,trackForFloor,timingGraceMs} from './score.js';
import {editionById} from './music-albums.js';
import {musicFloor} from './frenzy.js';
import {hasAlbumClock,albumClock,albumTrack} from './album-clock.js';

export const TRAINING_BPMS=Object.freeze([80,100,120]);
export const validTrainingBpm=bpm=>TRAINING_BPMS.includes(bpm);
export const hasTrainingClock=run=>run?.trainingClock?.version===1&&validTrainingBpm(run.trainingClock.bpm);
export const trainingAlbumClock=run=>hasTrainingClock(run)&&editionById(run.trainingClock.albumEdition)?albumClock(run.trainingClock.albumEdition):null;
const recordedClock=run=>trainingAlbumClock(run)||(hasAlbumClock(run)?albumClock(run.albumEdition):null);
export const runBeatTime=(run,phase)=>recordedClock(run)?recordedClock(run).time(phase):hasTrainingClock(run)?phase*60/run.trainingClock.bpm:beatTime(musicFloor(run),phase);
export const runBeatDuration=(run,beat)=>recordedClock(run)?recordedClock(run).time(Math.floor(beat)+1)-recordedClock(run).time(Math.floor(beat)):hasTrainingClock(run)?60/run.trainingClock.bpm:beatDuration(musicFloor(run),beat);
export const runTimingGraceMs=(run,beat)=>hasTrainingClock(run)||hasAlbumClock(run)?0:timingGraceMs(musicFloor(run),beat);

export const runBeatPhase=(run,seconds)=>recordedClock(run)?recordedClock(run).phase(seconds):hasTrainingClock(run)?seconds*run.trainingClock.bpm/60:beatPhase(musicFloor(run),seconds);
export const runMusicCue=(run,phase)=>recordedClock(run)?{name:'BATERIA DA MÚSICA',warning:false,changing:false,count:0,direction:0,label:'',bpm:60/runBeatDuration(run,phase)}:hasTrainingClock(run)?{name:'TREINO',warning:false,changing:false,count:0,direction:0,label:'',bpm:run.trainingClock.bpm}:musicCue(musicFloor(run),phase);
export const runSavedMusicElapsed=run=>hasAlbumClock(run)?(Number.isFinite(run.elapsed)?Math.max(0,run.elapsed):0):savedMusicElapsed(run);
export const runTrack=run=>trainingAlbumClock(run)?albumTrack({albumEdition:run.trainingClock.albumEdition}):hasAlbumClock(run)?albumTrack(run):trackForFloor(musicFloor(run));
export const runRailSeconds=(run,beat)=>recordedClock(run)?recordedClock(run).intro:runBeatDuration(run,beat);
