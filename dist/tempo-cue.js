import {runMusicCue} from './training-clock.js';
import {musicFloor} from './frenzy.js';

// A passive view of the existing score clock. Never starts or delays a change.
export function tempoCue(run,phase,{blocked=false,tutorial=false}={}){
 if(!run||!Number.isFinite(phase)||phase<4||blocked||tutorial||run.trainingClock||run.room?.cleared||run.rest?.active||run.recovery?.active||run.abyss?.cardChoice)return null;
 const cue=runMusicCue(run,phase);if(!cue.warning&&!cue.changing)return null;
 const boss=cue.label==='VIRADA',label=boss?'Virada':cue.direction>0?'Acelera':'Desacelera',icon=boss?'↻':cue.direction>0?'↑':'↓',count=cue.warning?cue.count:null;
 return {mode:cue.warning?'warning':'changing',direction:boss?'turn':cue.direction>0?'up':'down',label,icon,count,text:icon+' '+label+(count?' · '+count:''),accessible:boss?'Virada musical'+(count?' em '+count+' pulsos':''):count?'Ritmo '+(cue.direction>0?'acelera':'desacelera')+' em '+count+' pulsos':'Ritmo '+(cue.direction>0?'acelerando':'desacelerando')};
}

export function mountTempoCue(document,bpm){
 const cluster=document.createElement('span');cluster.className='tempo-cluster';bpm.before(cluster);cluster.append(bpm);
 const node=document.createElement('span');node.className='tempo-cue';node.hidden=true;node.setAttribute('role','img');cluster.append(node);
 if(!document.head.querySelector('[data-tempo-cue]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./tempo-cue.css',import.meta.url).href;css.dataset.tempoCue='';document.head.append(css);}
 let previous='';return model=>{const key=model?.mode+'|'+model?.text;if(key===previous)return;previous=key;node.hidden=!model;if(!model){node.textContent='';node.removeAttribute('aria-label');return;}node.dataset.mode=model.mode;node.dataset.direction=model.direction;node.textContent=model.text;node.setAttribute('aria-label',model.accessible);};
}
