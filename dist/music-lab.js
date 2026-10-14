import {Music} from './audio.js';
import {ALL_TRACKS,trackBeatTime,trackBeatPhase,trackCue,isBossTrack} from './score.js';
import {RECORDS,recordById} from './records.js';
const $=id=>document.getElementById(id),music=new Music();
let elapsed=0,last=performance.now(),playing=false;
$('record').innerHTML=RECORDS.map(r=>`<option value="${r.id}">${r.genre} · ${r.name}</option>`).join('');
$('discCount').textContent=RECORDS.length+' discos.';
const index=()=>{const theme=Number($('theme').value);return theme>=8?theme+($('mode').value==='4'?1:0):theme+Number($('mode').value);};
function render(){
 const i=index(),phase=trackBeatPhase(i,elapsed),cue=trackCue(i,phase);
 $('songName').textContent=recordById($('record').value).name;$('tempo').textContent=Math.round(cue.bpm)+' BPM';
 $('pulse').dataset.on=playing&&phase%1<.18;
 $('cue').textContent=cue.warning||cue.changing?cue.label:playing?cue.name:'PRONTO?';
 $('count').textContent=cue.warning?cue.count:'♫';
 document.querySelectorAll('.timeline span').forEach((n,j)=>n.classList.toggle('active',j===Math.floor(phase/32)%5));
 $('hint').textContent=isBossTrack(i)?'Chefe: pulso firme. O arranjo muda.':'Aviso antes. Mudança suave.';
 $('play').textContent=playing?'Ⅱ PAUSAR':'▶ OUVIR';
}
function pause(){playing=false;music.silence();render();}
async function play(){if(playing){pause();return;}if(!await music.enable()){$('hint').textContent='Não foi possível ativar o áudio.';return;}playing=true;last=performance.now();render();}
function change(){elapsed=0;last=performance.now();music.silence();render();}
const boundaries=[32,64,96,128,192];
// Audition the actual four-beat warning before the next change, never an abrupt seek into it.
function nextTurn(){const phase=trackBeatPhase(index(),elapsed),cycle=Math.floor(phase/160),local=phase%160,next=boundaries.find(b=>b-4>local+.01);elapsed=trackBeatTime(index(),cycle*160+next-4);last=performance.now();music.silence();render();}
function frame(now){if(playing)elapsed+=(now-last)/1000;last=now;render();requestAnimationFrame(frame);}
setInterval(()=>{if(playing)music.update(elapsed+(performance.now()-last)/1000,index());},25);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',pause);
for(const id of ['theme','mode'])$(id).onchange=change;
$('record').onchange=()=>{music.setRecord($('record').value);change();};
$('play').onclick=play;$('turn').onclick=nextTurn;$('reset').onclick=change;
render();requestAnimationFrame(frame);
