import {RELIC_CATEGORIES,RARE_RELIC_IDS,RARE_RELIC_DESCRIPTION} from './relic-classification.js';
export const RELIC_FILTERS=Object.freeze({all:'Todos',attack:'Ataque',defense:'Defesa',utility:'Utilidade',rare:'Raros'});
export function filteredRelicIds(relics,astral,filter='all'){
 if(!Object.hasOwn(RELIC_FILTERS,filter))throw new RangeError('Unknown relic filter');
 return relics.filter(r=>filter==='all'||(filter==='rare'?RARE_RELIC_IDS.includes(r.id):RELIC_CATEGORIES[r.id]===RELIC_FILTERS[filter])).map(r=>r.id);
}
export function filterMarkup(selected='all'){
 return `<nav class="relic-filters" aria-label="Filtrar coleção">${Object.entries(RELIC_FILTERS).map(([id,label])=>`<button type="button" data-relic-filter="${id}" aria-pressed="${id===selected}"${id==='rare'?` aria-describedby="relicRareHint" title="${RARE_RELIC_DESCRIPTION}"`:''}>${label}</button>`).join('')}</nav><p id="relicRareHint" class="filter-clarification"${selected==='rare'?'':' hidden'}>${RARE_RELIC_DESCRIPTION}</p><p class="filter-status" role="status"></p>`;
}
export function applyCollectionFilter(body,relics,astral,filter='all'){
 const ids=new Set(filteredRelicIds(relics,astral,filter));
 for(const card of body.querySelectorAll('.r2-relic-card'))card.hidden=!ids.has(card.dataset.equipAstral);
 for(const button of body.querySelectorAll('[data-relic-filter]'))button.setAttribute('aria-pressed',String(button.dataset.relicFilter===filter));
 const hint=body.querySelector('#relicRareHint');if(hint)hint.hidden=filter!=='rare';
 const status=body.querySelector('.filter-status');if(status)status.textContent=ids.size?`${RELIC_FILTERS[filter]} · ${ids.size} ${ids.size===1?'eco exibido':'ecos exibidos'}`:'Nenhum eco neste filtro.';
 return ids.size;
}
