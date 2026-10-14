import {buildingUpgrade} from './village.js';
import {MATERIALS} from './materials.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {glyph} from './ui-art.js';
export function buildingMarkup(s,id){const p=buildingUpgrade(s,id),n=p.level,next=id==='forge'?`FORÇA +${n*2}%`:id==='well'?'MAIS BÔNUS RAROS':'DESAFIOS E PRÊMIOS ↑';
 return `<details class="building-upgrade" aria-label="Melhorar ${p.name}"><summary>${glyph({forge:'forge',well:'fortune',missions:'hunter'}[id])}<b>NV. ${n}</b><span>${p.max?'MÁXIMO':'MELHORAR'}</span></summary><div><span>NV. ${n} / ${p.cap}</span><strong>${p.max?'NÍVEL MÁXIMO':next}</strong></div>${p.max?'':`<div class="building-cost"><b>◇ ${p.cost.toLocaleString('pt-BR')}</b>${p.recipe.map((v,i)=>`<span title="${MATERIALS[i].name} · ${s.materials[i]} guardados" class="${s.materials[i]<v?'missing':''}">${assetToSvg(generateAsset('crystal',{variant:i}))}<b>${v.toLocaleString('pt-BR')}</b></span>`).join('')}</div><button class="secondary" data-building="${id}" ${p.ready?'':'disabled'}>MELHORAR · NV. ${n+1}</button>`}</details>`;
}
