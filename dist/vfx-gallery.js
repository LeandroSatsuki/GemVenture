import {P} from './palette.js';
import {VFX_ROOT,VFX_SHEETS} from './vfx-manifest.js';
import {loadVfxAssets,drawVfxAsset} from './vfx-assets.js';
const names={impact:'IMPACTO',explosion:'EXPLOSÃO',shield:'ESCUDO',aura:'PODER',reward:'RECOMPENSA'};
const tones=[[P.cyan,'QUARTZO'],[P.pink,'RUBI'],[P.yellow,'TOPÁZIO'],[P.lime,'ESMERALDA'],[P.orange,'FOGO'],[P.steel,'PEDRA']];
let color=P.cyan,age=.2,last=0,paint=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,soft=!playing;
const play=document.getElementById('play'),reduced=document.getElementById('soft');
function controls(){play.textContent=playing?'PAUSAR':'ANIMAR';play.setAttribute('aria-pressed',String(playing));reduced.setAttribute('aria-pressed',String(soft));}controls();
play.onclick=()=>{playing=!playing;if(!playing)age=.16;controls();};reduced.onclick=()=>{soft=!soft;controls();};
document.getElementById('tones').innerHTML=tones.map(([c,label])=>`<button data-tone="${c}" style="--tone:${c}" aria-pressed="${c===color}">${label}</button>`).join('');
document.querySelectorAll('[data-tone]').forEach(button=>button.onclick=()=>{color=button.dataset.tone;document.querySelectorAll('[data-tone]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
const entries=Object.entries(VFX_SHEETS).map(([id,spec])=>{
 const article=document.createElement('article');article.innerHTML=`<h2>${names[id]}</h2><canvas width="300" height="220" aria-label="Animação: ${names[id]}"></canvas><details><summary>ARQUIVO</summary><p>${VFX_ROOT+spec.file}</p><p>${spec.width} × ${spec.height} por quadro · ${spec.frames} quadros · ${spec.columns} colunas</p></details>`;
 document.getElementById('gallery').append(article);return {id,spec,c:article.querySelector('canvas').getContext('2d')};
});
const result=await loadVfxAssets();document.getElementById('status').textContent=result.failed.length?'ARQUIVO AUSENTE: '+result.failed.join(', '):'5 EFEITOS · HEPT32';
function draw(){for(const {id,spec,c}of entries){c.fillStyle=P.ink;c.fillRect(0,0,300,220);c.fillStyle=P.slate;c.beginPath();c.ellipse(150,160,110,32,0,0,Math.PI*2);c.fill();drawVfxAsset(c,id,150,110,playing?Math.min(age,spec.duration-.001):spec.duration*.22,{color,size:id==='impact'?100:150,soft});}}
function tick(now){const dt=last?(now-last)/1000:0;last=now;if(!document.hidden&&playing)age=(age+Math.min(dt,.1))%1.35;if(!document.hidden&&now-paint>33){draw();paint=now;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
