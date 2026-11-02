// Transient, room-scoped rhythm grace. Never serialized or used as a combat shield.
const grace=new WeakMap();
export function beginResumeRhythm(run,phase,until){if(!run||!Number.isFinite(phase)||!Number.isFinite(until)||until<=phase)return false;grace.set(run,{room:run.room,start:phase,until});return true;}
export function clearResumeRhythm(run){if(run)grace.delete(run);}
export function resumeRhythmRemaining(run,phase){const g=run&&grace.get(run);if(!g)return 0;if(g.room!==run.room){grace.delete(run);return 0;}const at=Number.isFinite(phase)?phase:Math.max(run.beat??-1,run.acted??-1,run.missed??-1);if(at>=g.until){grace.delete(run);return 0;}return Math.max(0,Math.min(1,(g.until-at)/(g.until-g.start)));}
export const resumeRhythmActive=(run,phase)=>resumeRhythmRemaining(run,phase)>0;
