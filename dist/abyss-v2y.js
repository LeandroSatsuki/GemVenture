import {icon,liftCabinIcon,rewardArt} from './abyss-selected-art-v2y.js';
import {collectedGemSvg} from './collected-gems.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=value=>Number.isFinite(value)?value.toLocaleString('pt-BR'):'—';
const safeColor=value=>/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(String(value??''))?value:'#a7c8f8';
function art(spec,className){if(!spec||!/^assets\/(?:approved-art|lift-v2|refuge-lift-r2)\/[\w.-]+\.(?:png|svg)$/i.test(spec.source??''))return '';return `<img class="${className}" src="${esc(spec.source)}" width="${Number(spec.width)||1}" height="${Number(spec.height)||1}" alt="" aria-hidden="true">`;}

export function abyssMarkupV2Y(vm){
 const a=vm.abyss??{},prep=a.preparation??{},best=Number.isFinite(a.bestMeters)?a.bestMeters:0;
 const metrics=[{icon:'trophy',label:'SEU RECORDE',value:a.referenceFixture?'0':num(best),unit:a.referenceFixture?'andares':'m'},{icon:'swords',label:'MAIOR ONDA',value:a.referenceFixture?'0':Number.isInteger(a.maxWave)?num(a.maxWave):'Sem registro'},{icon:'ranking',label:'CLASSIFICAÇÃO',value:a.leaderboard?.label??'Sem registro'}];
 const gateMaterials=(a.materials??[]).map((m,i)=>{const complete=m.complete===true||m.remaining===0;const deposit=Number(m.deposit)>0;return `<article class="gv-v2-gate-material" style="--gem:${safeColor(m.color)}"><span class="gv-v2-gem-dot" aria-hidden="true"></span><div><strong>${esc(m.name)}</strong><small>${num(m.deposited)} / ${num(m.required)} · saldo ${num(m.available)}</small></div><button type="button" data-gate="${i}" aria-label="${complete?'Depósito completo':deposit?`Colocar ${num(m.deposit)} ${esc(m.name)} no portão`:`Sem ${esc(m.name)} disponível para depósito`}"${deposit?'':' disabled'}>${complete?'✓':deposit?`+ ${num(m.deposit)}`:'—'}</button></article>`;}).join('');
 const prepItems=[...(prep.blessing?[{name:prep.blessing.name,detail:prep.blessing.good}]:[]),...(prep.relics??[]).map(x=>({name:x.name,detail:x.text})),...(prep.skills??[]).map(x=>({name:x.name,detail:''}))];
 const details=[{icon:'enemies',title:'INIMIGOS',text:'Inimigos cada vez mais fortes a cada andar.'},{icon:'heart',title:'SOBREVIVÊNCIA',text:'Veja quantos andares você consegue alcançar.'},{icon:'infinite',title:'PROGRESSÃO INFINITA',text:'Não há um último andar. O desafio continua.'}];
 const visuals=a.referenceFixture?
  [{label:'Cristal rosa ilustrativo',html:rewardArt('ruby')},{label:'Cristal azul ilustrativo',html:rewardArt('quartz')},{label:'Moedas ilustrativas',html:rewardArt('coins')},{label:'Baú ilustrativo',html:rewardArt('chest')},{label:'Pergaminho ilustrativo',html:rewardArt('scroll')}]:
  [{label:'Rubi lapidado',html:collectedGemSvg(1)},{label:'Quartzo lapidado',html:collectedGemSvg(0)},{label:'Moedas',html:rewardArt('coins')}];
 return `<section class="gv-v2-abyss gv-v2-abyss-v2v" aria-label="Abismo" tabindex="0">
  <section class="gv-v2-abyss-hero" aria-label="Entrada do Abismo">${art(a.heroScene,'gv-v2-abyss-scene')}<div class="gv-v2-abyss-copy"><span class="gv-v2-abyss-badge">${a.testAccess?'TESTE LIBERADO':a.canEnter?'ACESSO LIBERADO':'ACESSO BLOQUEADO'}</span><h2>ABISMO <i>∞</i></h2><p>Um desafio sem fim. Enfrente inimigos cada vez mais fortes e veja até onde você consegue chegar.</p></div><aside class="gv-v2-survival"><strong>SOBREVIVÊNCIA</strong><span class="gv-v2-survival-art"><span class="gv-v2-survival-vortex" aria-hidden="true"></span>${a.heroArt??icon('infinite')}</span></aside></section>
  <section class="gv-v2-abyss-requirements" aria-label="Como liberar o Abismo"><h3>COMO LIBERAR</h3><p>${esc(a.requirement??'Vença o Boss Místico no andar 4–5 (20) e complete os depósitos de gemas.')}</p><p>${a.bossDefeated?'✓ Boss Místico vencido':'○ Boss Místico pendente'} · Portão ${num(a.progressPercent)}% completo</p><div class="gv-v2-gate-list">${gateMaterials}</div></section>
  <section class="gv-v2-abyss-stats" aria-label="Estatísticas do Abismo">${metrics.map(m=>`<article><span class="gv-v2-stat-icon">${icon(m.icon)}</span><div><small>${m.label}</small><strong>${esc(m.value)}${m.unit?`<span class="gv-v2-stat-unit">${esc(m.unit)}</span>`:''}</strong></div></article>`).join('')}</section>
  <button type="button" class="gv-v2-cta gv-v2-abyss-start" id="abyssStart"${a.canEnter?'':' disabled'}><span class="gv-v2-abyss-cta-icon" aria-hidden="true">${liftCabinIcon()}</span><strong>${a.canEnter?'ENTRAR NO ABISMO ↓':'PORTÃO SELADO'}</strong></button>
  <section class="gv-v2-abyss-details"><h3>DETALHES</h3><div class="gv-v2-detail-grid">${details.map(d=>`<article><span class="gv-v2-detail-icon">${icon(d.icon)}</span><div><b>${d.title}</b><span>${d.text}</span></div></article>`).join('')}</div></section>
  <section class="gv-v2-abyss-rewards ${a.referenceFixture?'is-reference':'is-product'}" aria-label="${a.referenceFixture?'Composição ilustrativa de recompensas':'Categorias de recompensas do Abismo'}"><div class="gv-v2-abyss-reward-copy"><h3>RECOMPENSAS</h3><p>Ganhe recompensas conforme avança no Abismo.</p><div class="gv-v2-abyss-categories"><span>${icon('crystal')}CRISTAIS</span><span>${icon('coin')}MOEDAS</span><span>${icon('star')}ATÉ 5 ESTRELAS</span></div></div><div class="gv-v2-abyss-reward-tiles">${visuals.map(v=>`<span class="gv-v2-abyss-reward-tile" aria-label="${v.label}">${v.html}</span>`).join('')}</div></section>
  <details class="gv-v2-abyss-systems"><summary>PORTÃO E PREPARAÇÃO <span>progresso real · depósitos e equipamento</span></summary><div class="gv-v2-abyss-system-grid"><section><h3>PORTÃO · ${num(a.progressPercent)}%</h3><p class="gv-v2-boss-state">${a.testAccess?'Acesso temporário de teste':a.bossDefeated?'Boss Místico vencido':'Vença o Boss Místico'}</p></section><section><h3>PREPARAÇÃO REAL</h3>${prepItems.length?prepItems.map(x=>`<article><strong>${esc(x.name)}</strong><span>${esc(x.detail)}</span></article>`).join(''):'<p>Nenhuma bênção, relíquia ou habilidade preparada.</p>'}</section></div></details>
 </section>`;
}









