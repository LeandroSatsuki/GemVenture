import {floorAddress} from './descent-progress.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number.isFinite(n)?n.toLocaleString('pt-BR'):'Sem registro';
export const formatFloorTime=ms=>Number.isFinite(ms)&&ms>=0?(ms/1000).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+' s':'Sem registro';
export function floorRecordsMarkup(s){
 const records=Object.entries(s.descent.records||{}).filter(([,r])=>r.clears>0).sort(([a],[b])=>Number(a)-Number(b));
 return '<section class="floor-records"><p>Seus resultados neste dispositivo. Tempo e pontuação recordes podem vir de tentativas diferentes.</p>'+(records.length?'<div class="floor-records__scroll" tabindex="0"><table><caption>Desempenho pessoal por andar</caption><thead><tr><th>Andar</th><th>Estrelas</th><th>Melhor tempo</th><th>Último score</th><th>Melhor score</th></tr></thead><tbody>'+records.map(([floor,r])=>'<tr><th scope="row">'+floorAddress(Number(floor)).code+'</th><td>'+esc(r.stars===undefined?'Sem registro':r.stars+' / 5 ★')+'</td><td>'+formatFloorTime(r.bestTimeMs)+'</td><td>'+num(r.lastScore)+'</td><td>'+num(r.points)+'</td></tr>').join('')+'</tbody></table></div>':'<p>Conclua um andar para registrar seu desempenho.</p>')+'<small>Tempos antigos não gravados aparecerão ao concluir o andar novamente.</small><button type="button" id="backToLift" class="primary">VOLTAR AO ELEVADOR</button></section>';
}
