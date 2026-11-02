// GV-033/GV-035 Elevador V2: new composition renderer.
import {abyssMarkupV2Y} from './abyss-v2y.js';
import {formatFloorTime} from './floor-records-view.js';
// Pure DOM markup only. Game rules, state, persistence and event ownership remain in their existing modules.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = value => Number.isFinite(value) ? value.toLocaleString('pt-BR') : '—';
const disabled = enabled => enabled === true ? '' : ' disabled';
const safeColor = value => /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(String(value ?? '')) ? value : '#10254b';
function asset(spec, className, alt='') {
  if (!spec || !/^assets\/(?:approved-art|abyss-gate-r2|refuge-lift-r2|lift-v2|refuge-night-v3|dungeon-refinement-v2)\/[\w.-]+\.(?:png|svg)$/i.test(spec.source ?? '')) return '';
  return `<img class="${className}" src="${esc(spec.source)}" width="${Number(spec.width)||1}" height="${Number(spec.height)||1}" alt="${esc(alt)}"${alt ? '' : ' aria-hidden="true"'}>`;
}
function enemyStrip(art) {
  const scene=Array.isArray(art?.scene)?art.scene:[];
  return `<div class="gv-v2-enemies" aria-label="Inimigos deste andar"><strong>INIMIGOS</strong>${scene.map(x=>`<span>${asset(x,'gv-v2-enemy',x.name)}<small>${esc(x.name)}</small></span>`).join('')}</div>`;
}
function rewardCatalogMarkup(catalog) {
  if(!catalog?.available || !Array.isArray(catalog.entries))return '<p class="gv-v2-reward-empty">Catálogo indisponível para este andar.</p>';
  const byId=new Map(catalog.entries.map(entry=>[entry.id,entry]));
  const groups=[['collectible','Recompensas possíveis']];
  const used=new Set();
  const card=entry=>{
    used.add(entry.id);
    const visual=entry.asset?.kind==='approved-raster'?asset(entry.asset,'gv-v2-reward-image'):entry.artHtml??'';
    return `<article class="gv-v2-reward-item" tabindex="0" aria-label="${esc(entry.name)}"><span class="gv-v2-reward-art" aria-hidden="true">${visual}</span><strong>${esc(entry.name)}</strong></article>`;
  };
  const sections=groups.map(([key,label])=>{
    const rows=(catalog.groups?.[key]??[]).map(id=>byId.get(id)).filter(Boolean);
    return rows.length?`<section class="gv-v2-reward-group" aria-label="${label}"><div class="gv-v2-reward-grid">${rows.map(card).join('')}</div></section>`:'';
  }).join('');
  const ungrouped=[];
  return `<div class="gv-v2-reward-scroll" tabindex="0" aria-label="Lista de ${used.size} recompensas possíveis">${sections}${ungrouped.length?`<section class="gv-v2-reward-group" aria-label="Outras recompensas"><h4>OUTRAS RECOMPENSAS</h4><div class="gv-v2-reward-grid">${ungrouped.map(card).join('')}</div></section>`:''}</div>`;
}
export function liftModeNavMarkup(vm) {
  const abyss = vm.mode === 'abyss';
  return `<nav class="gv-lift-v2-modes" aria-label="Modos de descida">
    <button type="button" class="gv-v2-mode${abyss?'':' is-active'}" data-lift-mode="floors" aria-pressed="${!abyss}"><span class="gv-v2-tab-icon" aria-hidden="true">${vm.modeIcons?.floors ?? ''}</span><span class="gv-v2-tab-label"><strong>Andares</strong><small>Cavernas do Refúgio</small></span></button>
    <button type="button" class="gv-v2-mode gv-v2-mode-abyss${abyss?' is-active':''}" data-lift-mode="abyss" aria-pressed="${abyss}"><span class="gv-v2-tab-icon" aria-hidden="true">${vm.modeIcons?.abyss ?? ''}</span><span class="gv-v2-tab-label"><strong>Abismo</strong><small>Modo desafiador</small></span></button>
  </nav>`;
}
function biomeRail(vm) {
  const cards = Array.isArray(vm.biomeCards) ? vm.biomeCards : (vm.biomes ?? []);
  return `<nav class="gv-v2-biome-rail" aria-label="Biomas da expedição"><button class="gv-v2-rail-arrow" type="button" data-biome-scroll="-1" aria-label="Biomas anteriores"><span class="gv-v2-chevron" aria-hidden="true"></span></button><div class="gv-v2-biome-track">${cards.map((b,i)=>{const image=b.panorama;const artClass='gv-v2-biome-crop';return `<button type="button" class="gv-v2-biome${b.selected?' is-selected':''}${b.locked?' is-locked':''}" ${b.locked?'disabled':''} data-lift-biome="${esc(b.actionValue ?? b.id)}" aria-pressed="${!!b.selected}" aria-label="${esc(b.name)}, ${num(b.explored)}/5 explorados${b.locked?', bloqueado':''}"><span class="gv-v2-biome-art" style="--biome-tone:${safeColor(b.color)}">${image ? asset(image,artClass,b.name) : '<span class="gv-v2-empty-art">Paisagem pendente</span>'}</span><span class="gv-v2-biome-copy"><small>${String(i+1).padStart(2,'0')}</small><strong>${esc(b.name)}</strong><em>${num(b.explored)}/5 explorados</em></span></button>`}).join('')}</div><button class="gv-v2-rail-arrow" type="button" data-biome-scroll="1" aria-label="Próximos biomas"><span class="gv-v2-chevron" aria-hidden="true"></span></button></nav>`;
}
function floorsMarkup(vm) {
  const selectedBiome = (vm.biomeCards ?? vm.biomes ?? []).find(b=>b.selected) ?? vm.biomeVisual ?? {};
  const floors = (vm.floors ?? []).map(f=>`<button type="button" class="gv-v2-floor${f.selected?' is-selected':''}${!f.reached?' is-unknown':''}" data-lift-floor="${esc(f.actionValue)}" aria-pressed="${!!f.selected}" aria-controls="liftFloorPanel" aria-label="Andar ${esc(f.address)}, ${!f.reached?'não explorado':f.canStart?'parada ativa':f.boss?'guardião':'explorado'}; ${Number.isInteger(f.stars?.earned)?`${f.stars.earned} de ${f.stars.total??5} estrelas`:'estrelas por andar sem registro'}"><strong>${esc(f.address)}</strong><span class="gv-v2-floor-stars" aria-hidden="true">${Array.from({length:f.stars?.total ?? 5},(_,i)=>`<i class="${Number.isInteger(f.stars?.earned)&&i<f.stars.earned?'is-earned':''}" aria-hidden="true">★</i>`).join('')}</span></button>`).join('');
  const s=vm.selected ?? {}, action=vm.actions ?? {};
  const cost=(s.cost ?? []).filter(c=>Number.isFinite(c.amount)&&c.amount>0);
  const costHtml=cost.length?`<div class="gv-v2-costs" aria-label="Custo para ativar a parada">${cost.map(c=>`<div class="gv-v2-cost${c.available<c.amount?' is-short':''}"><span>${esc(c.name)}</span><strong>${num(c.amount)}</strong><small>saldo ${num(c.available)}</small></div>`).join('')}</div>`:'';
  let call='';
  if(!s.reached) call='<p>Continue a expedição para descobrir este andar.</p>';
  else if(s.stopActive) call='<p class="gv-v2-state">✓ Parada ativa · elevador pronto</p>';
  else call=`<p class="gv-v2-state">${!s.unlockEligible?'Bioma bloqueado':!s.canPay?'Cristais insuficientes':'Parada ainda inativa'}</p>${costHtml}<button type="button" class="gv-v2-cta" data-stop="${esc(action.unlockStop?.value)}"${disabled(action.unlockStop?.enabled)}>${s.unlockEligible?'Ativar parada':'Abra o bioma'}</button>`;
  const bestTime=formatFloorTime(s.performance?.bestTimeMs);
  const lastScore=Number.isFinite(s.performance?.lastScore)?`${num(s.performance.lastScore)} PTS`:'Sem registro';
  const pointsRecord=s.record?`<small>Maior pontuação: ${num(s.record.points)} PTS · ${num(s.record.clears)} ${s.record.clears===1?'vitória':'vitórias'}</small>`:'';
  const earnedStars=Number.isInteger(s.stars?.earned)?Math.max(0,Math.min(5,s.stars.earned)):null;
  const starsInfo=`<span class="gv-v2-earned-stars" aria-label="${earnedStars===null?'Estrelas por andar sem registro no save':`${earnedStars} de 5 estrelas`}">${earnedStars===null?'Estrelas por pontuação: sem registro':`${earnedStars} / 5 ★ por pontuação`}</span>`;
  const focus=s.reached?`<span class="gv-v2-focus">${esc(s.boss?'Guardião':s.focusMaterialName)}</span>`:'';
  const objectiveItems=(s.objectives??[]).map(o=>`<li><span aria-hidden="true">•</span><span>${esc(o.label)}</span></li>`).join('');
  const enemyHTML=s.boss?enemyStrip(vm.art?.boss):enemyStrip(vm.art);
  const navIcon=`<span class="gv-v2-elevator-icon" aria-hidden="true">${vm.modeIcons?.floors ?? ''}</span>`;
  const CTA=label=>`<span class="gv-v2-cta-label">${navIcon}<strong>${label}</strong></span>`;
  const completion=s.rewards?.completion?`<p class="gv-v2-clear-reward">Ao concluir: +${num(s.rewards.completion.xp)} XP</p>`:'';
  return `<section class="gv-v2-floors" aria-label="Exploração por andares"><div class="gv-v2-scroll" tabindex="0" aria-label="Detalhes dos andares; rolagem vertical">
    ${biomeRail(vm)}
    ${action.buySeal?`<section class="gv-v2-biome-unlock" aria-label="Liberar próximo bioma"><div><strong>${esc(action.buySeal.name)}</strong><span>Chegue ao andar ${esc(String(Math.floor((action.buySeal.requiredFloor-1)/5)+1)+'–5')} e conquiste ${num(action.buySeal.requiredStars)} estrelas ao longo da campanha.</span><small>${num(action.buySeal.earnedStars)} / ${num(action.buySeal.requiredStars)} ★ conquistadas · não consome estrelas</small></div><button type="button" class="primary" id="buySeal"${disabled(action.buySeal.enabled)}>ABRIR PRÓXIMO BIOMA</button></section>`:''}
    <section class="gv-v2-biome-banner" id="liftBiomePanel" aria-labelledby="liftBiomeTitle" style="--biome-tone:${safeColor(vm.biomeVisual?.palette?.floor)}">${asset(vm.biomeVisual?.panorama,'gv-v2-biome-panorama')}<div class="gv-v2-banner-copy"><span>BIOMA ${String((vm.selectedBiome??0)+1).padStart(2,'0')}</span><h2 id="liftBiomeTitle">${esc(vm.biomeVisual?.name ?? selectedBiome.name ?? '')}</h2><p>${esc(vm.biomeVisual?.description ?? 'Explore este bioma e avance pelos seus cinco andares.')}</p></div>${vm.biomeVisual?.panorama?'':'<span class="gv-v2-art-gap" data-review-art-gap="biome-panorama">Panorama aprovado pendente</span>'}</section>
    <nav class="gv-v2-floor-rail" aria-label="Andares de ${esc(vm.biomeVisual?.name ?? '')}"><button class="gv-v2-rail-arrow" type="button" data-floor-scroll="-1" aria-label="Andares anteriores"><span class="gv-v2-chevron" aria-hidden="true"></span></button><div class="gv-v2-floor-track">${floors}</div><button class="gv-v2-rail-arrow" type="button" data-floor-scroll="1" aria-label="Próximos andares"><span class="gv-v2-chevron" aria-hidden="true"></span></button></nav>
    <div class="gv-v2-lower"><section class="gv-v2-floor-card" id="liftFloorPanel" aria-labelledby="liftFloorTitle"><header><span>ANDAR ${esc(s.address)} · ${num(s.depthMeters)} m</span><h3 id="liftFloorTitle">${esc(s.reached?s.name:'Não explorado')}</h3>${focus}${starsInfo}</header><div class="gv-v2-floor-detail"><section class="gv-v2-objective"><small>PARA LIBERAR A SAÍDA</small>${s.boss?`<p class="gv-v2-boss-objective">${esc(s.objectives?.[0]?.label ?? 'Derrote o guardião para liberar a saída.')}</p>`:`<ul>${objectiveItems}</ul>`}</section>${enemyHTML}</div></section>
      <aside class="gv-v2-side-card"><section class="gv-v2-rewards" aria-label="Recompensas possíveis do andar ${esc(s.address)}"><h3>RECOMPENSAS <small>possíveis · ${num(s.rewards?.catalog?.groups?.collectible?.length)} tipos</small></h3>${rewardCatalogMarkup(s.rewards?.catalog)}</section><section class="gv-v2-performance"><article><h3>MELHOR TEMPO</h3><strong>${bestTime}</strong></article><article class="gv-v2-score"><img src="assets/refuge-night-v3/trophy.png" width="48" height="48" alt=""><div><h3>ÚLTIMO SCORE</h3><strong>${lastScore}</strong>${pointsRecord}</div></article></section><button type="button" class="gv-v2-online" id="floorRecords" aria-label="Ver meu desempenho por andar"><span class="gv-v2-ranking-icon" aria-hidden="true">${vm.modeIcons?.abyss ?? '◇'}</span><strong>DESEMPENHO LOCAL</strong><span class="gv-v2-ranking-chevron" aria-hidden="true">›</span></button></aside></div>
    </div><footer class="gv-v2-departure">${s.stopActive?`<p>Andar ${esc(s.address)} · Parada ativa</p><button type="button" class="gv-v2-cta gv-v2-floor-cta" data-depart="${esc(action.depart?.value)}" aria-label="Descer ao andar ${esc(s.address)}"${disabled(action.depart?.enabled)}>${CTA('DESCER')}</button>`:call}</footer>
  </section>`;
}
function abyssMarkup(vm) {
  const a=vm.abyss ?? {},gateMaterials=(a.materials??[]).map((m,i)=>{const complete=m.complete===true||(Number.isFinite(m.remaining)&&m.remaining===0)||(Number.isFinite(m.required)&&Number(m.deposited)>=Number(m.required));const deposit=Number(m.deposit)>0;const label=complete?'✓':deposit?'+ '+num(m.deposit):'—';return `<article class="gv-v2-gate-material" style="--gem:${safeColor(m.color)}"><span class="gv-v2-gem-dot" aria-hidden="true"></span><div><strong>${esc(m.name)}</strong><small>${num(m.deposited)} / ${num(m.required)} · saldo ${num(m.available)}</small></div><button type="button" data-gate="${i}" aria-label="${complete?'Depósito completo':deposit?`Colocar ${num(m.deposit)} ${esc(m.name)} no portão`:`Sem ${esc(m.name)} disponível para depósito`}"${disabled(deposit)}>${label}</button></article>`;}).join('');
  const prep=a.preparation ?? {};
  const prepItems=[...(prep.blessing?[{title:prep.blessing.name,body:prep.blessing.good,foot:prep.blessing.risk}]:[]),...(prep.relics??[]).map(r=>({title:r.name,body:r.text})),...(prep.skills??[]).map(k=>({title:k.name,body:''}))];
  const best=num(a.bestMeters ?? 0),progress=num(a.progressPercent ?? 0);
  return `<section class="gv-v2-abyss" aria-label="Abismo">
    <section class="gv-v2-abyss-hero"><div class="gv-v2-abyss-copy"><span class="gv-v2-kicker">DESCIDA CONTÍNUA</span><h2>ABISMO <i>∞</i></h2><p>Uma nova tentativa começa em 0 m. Seu recorde permanece.</p></div><div class="gv-v2-portal-art gate-art" aria-label="Portão do Abismo">${a.heroArt ?? ''}</div><aside class="gv-v2-survival"><small>MODO</small><strong>SOBREVIVÊNCIA</strong><span>${a.testAccess?'ACESSO DE TESTE':a.canEnter?'PRONTO PARA ENTRAR':'ACESSO BLOQUEADO'}</span></aside><span class="gv-v2-art-gap" data-review-art-gap="abyss-panorama">Paisagem aprovada do Abismo pendente</span></section>
    <section class="gv-v2-abyss-stats" aria-label="Estado da progressão"><article><small>RECORDE</small><strong>${best} m</strong></article><article><small>PORTÃO</small><strong>${progress}%</strong></article><article><small>BOSS MÍSTICO</small><strong>${a.bossDefeated?'Vencido':'Pendente'}</strong></article></section>
    <button type="button" class="gv-v2-cta gv-v2-abyss-start" id="abyssStart"${disabled(a.canEnter)}>${a.canEnter?(a.bestMeters?'Jogar novamente ↓':'Entrar no Abismo ↓'):'Portão selado'}</button>
    <section class="gv-v2-abyss-details"><h3>DETALHES</h3><div class="gv-v2-detail-grid"><article><b>Descida</b><span>Contínua, sem pausa entre salas.</span></article><article><b>Profundidade</b><span>Mais fundo, mais perigo e saque.</span></article><article><b>Recorde</b><span>A tentativa reinicia em 0 m; a melhor marca fica.</span></article></div></section>
    <section class="gv-v2-abyss-prep"><div class="gv-v2-prep-gate"><h3>PORTÃO</h3><div class="gv-v2-gate-list">${gateMaterials}</div><p class="gv-v2-boss-state">${a.testAccess?'Acesso temporário de teste':a.bossDefeated?'Boss Místico vencido':'Vença o Boss Místico'}</p></div><div class="gv-v2-prep-items"><h3>PREPARAÇÃO REAL</h3>${prepItems.length?`<div class="gv-v2-prep-grid">${prepItems.map(x=>`<article><b>${esc(x.title)}</b>${x.body?`<span>${esc(x.body)}</span>`:''}${x.foot?`<small>${esc(x.foot)}</small>`:''}</article>`).join('')}</div>`:'<p>Nenhuma bênção, relíquia ou habilidade preparada.</p>'}</div></section>
  </section>`;
}
export function liftBrowserMarkup(vm) {
  // Legacy expedition-map.js import: retain the established renderer export and hooks.
  return floorsMarkup(vm);
}
export function liftScreenMarkup(vm) {
  const abyss=vm.mode==='abyss';
  return `<main class="gv-lift-v2" data-mode="${abyss?'abyss':'floors'}" data-review="${vm.review===true}"><header class="gv-v2-header"><span class="gv-v2-lift-mark" aria-hidden="true">${asset(vm.liftMark,'gv-v2-lift-mark-img')}</span><div class="gv-v2-heading"><h1>ELEVADOR</h1><small>Explore as profundezas e desbloqueie novos andares!</small></div><button type="button" class="gv-v2-close" data-lift-close aria-label="Fechar"><svg class="gv-v2-close-mark" viewBox="0 0 44 44" width="52" height="52" aria-hidden="true" focusable="false"><path d="M12 8 22 18 32 8 36 12 26 22 36 32 32 36 22 26 12 36 8 32 18 22 8 12Z" fill="#f8fbff" stroke="#030813" stroke-width="3" stroke-linejoin="round"/></svg></button></header>${liftModeNavMarkup(vm)}${abyss?abyssMarkupV2Y(vm):floorsMarkup(vm)}</main>`;
}
// Keep arrow grid slots stable; disable unavailable navigation without a resize loop.
export function bindLiftNavigation(root,onSelect) {
  root.querySelector('[data-lift-close]')?.addEventListener('click',()=>document.getElementById('close')?.click());
  const rails=[{selector:'[data-biome-scroll]',target:'.gv-v2-biome-track',attribute:'data-biome-scroll',step:260},{selector:'[data-floor-scroll]',target:'.gv-v2-floor-track',attribute:'data-floor-scroll',step:252}];
  const syncRail=spec=>{const track=root.querySelector(spec.target),arrows=[...root.querySelectorAll(spec.selector)],overflow=!!track&&track.scrollWidth>track.clientWidth+1;for(const button of arrows){const direction=Number(button.getAttribute(spec.attribute)),atStart=!track||track.scrollLeft<=1,atEnd=!track||track.scrollLeft+track.clientWidth>=track.scrollWidth-1;button.hidden=false;button.disabled=!overflow||(direction<0?atStart:atEnd);button.onclick=()=>{if(!button.disabled)track.scrollBy({left:direction*spec.step,behavior:'smooth'});};}};
  for(const spec of rails){const track=root.querySelector(spec.target);if(track){track.addEventListener?.('scroll',()=>syncRail(spec),{passive:true});syncRail(spec);}}
  if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(()=>{if(root.isConnected===false){observer.disconnect();return;}for(const spec of rails)syncRail(spec);});for(const spec of rails){const track=root.querySelector(spec.target);if(track)observer.observe(track);}}
  for(const attribute of ['lift-biome','lift-floor']){const buttons=[...root.querySelectorAll(`[data-${attribute}]`)],available=buttons.filter(button=>!button.disabled);buttons.forEach(button=>{button.onclick=()=>onSelect(attribute==='lift-biome'?Number(button.dataset.liftBiome)*5+1:Number(button.dataset.liftFloor),`[data-${attribute}="${button.getAttribute(`data-${attribute}`)}"]`);button.onkeydown=event=>{const current=available.indexOf(button);if(current<0)return;const delta=event.key==='ArrowRight'||event.key==='ArrowDown'?1:event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:0;const next=event.key==='Home'?0:event.key==='End'?available.length-1:delta?(current+delta+available.length)%available.length:-1;if(next<0||!available[next])return;event.preventDefault();available[next].click();};});}
}


