import {BIOMES} from './core.js';
import {floorAddress} from './descent-progress.js';
import {formatFloorTime} from './floor-records-view.js';
import {HUD_ART} from './hud-art-registry.js';
import {elementLayoutScale} from './ui-display.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number.isFinite(n)?n.toLocaleString('pt-BR'):'—';
export function floorPerformanceRows(profile){
 return Object.entries(profile.descent.records||{}).filter(([,r])=>r.clears>0).sort(([a],[b])=>Number(a)-Number(b)).map(([id,r])=>{
  const floor=Number(id),address=floorAddress(floor);return {floor,address:address.code,region:address.region,biome:BIOMES[address.region-1]?.name||'Bioma '+address.region,stars:r.stars,bestTimeMs:r.bestTimeMs,lastScore:r.lastScore,points:r.points,clears:r.clears};
 });
}
export function floorPerformanceRowsMarkup(profile){
 let region=0,html='';const cell=(label,value,cls='')=>'<span class="gp-cell '+cls+'" role="cell"><span class="gp-label" aria-hidden="true">'+label+'</span><span class="gp-value">'+esc(value)+'</span></span>';
 for(const r of floorPerformanceRows(profile)){
  if(r.region!==region){region=r.region;html+='<div class="gp-biome" role="row"><span role="cell" aria-colspan="6"><b>'+String(region).padStart(2,'0')+'</b> · '+esc(r.biome)+'</span></div>';}
  const stars=r.stars===undefined?'<span class="gp-missing" aria-label="Estrelas sem registro">—</span>':'<span class="gp-stars" role="img" aria-label="'+r.stars+' de 5 estrelas">'+Array.from({length:5},(_,i)=>'<img src="'+HUD_ART.star.url+'" class="'+(i<r.stars?'lit':'')+'" alt="">').join('')+'</span>';
  html+='<div class="gp-row" role="row"><span class="gp-floor" role="rowheader">'+r.address+'</span><span role="cell">'+stars+'</span>'+cell('Melhor tempo',Number.isFinite(r.bestTimeMs)?formatFloorTime(r.bestTimeMs):'—')+cell('Últimos pts',num(r.lastScore))+cell('Recorde pts',num(r.points),'gp-best')+cell('Vezes',num(r.clears)+'×')+'</div>';
 }
 return html;
}
const markup="<section class=\"gp-window\" aria-label=\"Desempenho local\">\n  <header class=\"gp-header\"><img data-art=\"record\" alt=\"\"><div><h2>Desempenho</h2><span class=\"gp-local\">Neste dispositivo</span></div><button type=\"button\" class=\"gp-button gp-info cursor-interaction\" aria-label=\"Sobre os registros\" aria-expanded=\"false\">i</button><button type=\"button\" class=\"gp-button gp-close cursor-interaction\" aria-label=\"Fechar\">×</button></header>\n  <div class=\"gp-details\" hidden>Últimos pts: pontuação da conclusão mais recente. Vezes: conclusões do andar. “—” indica um dado ainda não registrado; zero é um resultado salvo. Tempos antigos aparecem ao concluir novamente.</div>\n  <div class=\"gp-caption\">Recordes podem vir de tentativas diferentes.</div>\n  <div class=\"gp-scroll\" role=\"region\" aria-label=\"Registros dos andares\">\n   <div class=\"gp-table\" role=\"table\" aria-label=\"Estrelas, melhor tempo, última pontuação, recorde e conclusões por andar\">\n    <div class=\"gp-columns\" role=\"row\"><span role=\"columnheader\">Andar</span><span role=\"columnheader\">Estrelas</span><span role=\"columnheader\">Melhor tempo</span><span role=\"columnheader\">Últimos pts</span><span role=\"columnheader\">Recorde pts</span><span role=\"columnheader\">Vezes</span></div>\n    <div class=\"gp-records\" role=\"rowgroup\"></div>\n   </div>\n   <div class=\"gp-empty\" hidden><img data-art=\"record\" alt=\"\"><h3>O primeiro recorde vem aí.</h3><p>Conclua um andar para registrar.</p></div>\n  </div>\n  <footer class=\"gp-footer\"><div class=\"gp-online\"><button type=\"button\" class=\"gp-ranking\" disabled>Classificação online</button><span>Em breve</span></div><button type=\"button\" class=\"gp-button gp-primary gp-back cursor-interaction\">‹ Voltar ao Elevador</button></footer>\n </section>";
export function mountFloorPerformance(parent,{profile,onBack,onClose,softMode=()=>false,focus=true}={}){
 const doc=parent.ownerDocument,win=doc.defaultView,host=doc.createElement('section');host.id='gv-floor-performance';host.setAttribute('aria-label','Desempenho local');host.innerHTML=markup;parent.append(host);
 const q=s=>host.querySelector(s),media=win.matchMedia('(prefers-reduced-motion:reduce)');let disposed=false;
 host.querySelectorAll('[data-art]').forEach(img=>img.src=HUD_ART[img.dataset.art].url);
 const content=floorPerformanceRowsMarkup(profile);q('.gp-records').innerHTML=content;q('.gp-table').hidden=!content;q('.gp-empty').hidden=!!content;
 q('.gp-back').dataset.primary='true';q('.gp-scroll').tabIndex=0;
 function fit(){if(disposed)return;const scale=elementLayoutScale(host)||1,scene=win.getComputedStyle(parent),live=parent.parentElement.querySelector('#gvl-live');
  const available=(win.innerHeight-24)/scale-(parseFloat(scene.paddingTop)||0)-(parseFloat(scene.paddingBottom)||0)-(live?.offsetHeight||0);
  q('.gp-window').style.maxHeight=Math.max(180,Math.min(620,available))+'px';host.dataset.stacked=String(host.clientWidth<660);host.dataset.soft=String(softMode()||media.matches);
 }
 function info(){const detail=q('.gp-details');detail.hidden=!detail.hidden;q('.gp-info').setAttribute('aria-expanded',String(!detail.hidden));}
 function click(e){const b=e.target.closest('button');if(!b||b.disabled||disposed)return;if(b.matches('.gp-info'))info();else if(b.matches('.gp-back'))onBack();else if(b.matches('.gp-close'))onClose();}
 function key(e){if(e.key!=='Tab')return;const stops=[q('.gp-info'),q('.gp-close'),q('.gp-scroll'),q('.gp-back')],active=host.getRootNode().activeElement,i=stops.indexOf(active);if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===stops.length-1){e.preventDefault();stops[e.shiftKey?stops.length-1:0].focus({preventScroll:true});}e.stopPropagation();}
 const resize=new win.ResizeObserver(fit);resize.observe(host);host.addEventListener('click',click);host.addEventListener('keydown',key);win.addEventListener('resize',fit);media.addEventListener('change',fit);fit();q('.gp-window').classList.add('gp-enter');if(focus)q('.gp-back').focus({preventScroll:true});
 return ()=>{if(disposed)return;disposed=true;resize.disconnect();win.removeEventListener('resize',fit);media.removeEventListener('change',fit);host.removeEventListener('click',click);host.removeEventListener('keydown',key);host.remove();};
}
