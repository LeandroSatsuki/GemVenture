import {collectedGemSvg} from './collected-gems.js';
import {BLESSINGS,RELICS,OFFERING_COST,nextLevelXP,blessingInfo,WISH_FAMILIES} from './pillars.js';
import {MATERIALS} from './materials.js';
import {approvedArtSvg} from './approved-art.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {approvedInterfaceIcons as icons} from './approved-interface-entry.js';
import {buildingLevel} from './village.js';
import {buildingMarkup} from './village-view.js';
import {currentFlowMarkup} from './flow-village.js';
// Retired service: compatibility exports cannot expose actions or spend currency.
export function wellPresentationModel(){return null;}
export function wellMarkup(){return '';}
export function relicMarkup(s){return `<div class="relic-heading"><h2>RELÍQUIAS</h2><strong>★ ${s.stars}</strong></div><div class="relic-grid">${RELICS.map(r=>{const owned=s.relics.includes(r.id);return `<article class="relic ${owned?'owned':''}"><div class="relic-art">${icons.founder(r.id)}</div><h3>${r.name}</h3><strong>${r.detail}</strong><button class="primary" data-relic="${r.id}" ${owned||s.stars<r.cost?'disabled':''}>${owned?'ATIVA':'DESPERTAR · ★ '+r.cost}</button></article>`;}).join('')}</div><p class="relic-rule">ATÉ 5 ESTRELAS POR DESCIDA</p>${Object.values(s.starUpgrades).some(n=>n>0)?'<details class="quiet-details"><summary>MELHORIAS ANTERIORES</summary><p>Seus bônus estelares anteriores continuam ativos.</p></details>':''}`;}
export function experienceMarkup(s){const p=s.experience,blessing=blessingInfo(s.run?.blessing||s.pendingBlessing,s.run?.blessingLevel||s.pendingBlessingLevel,s.run?s.run.blessingRoll:s.pendingBlessingRoll);return `<div class="experience-label"><b>NV. ${p.level}</b><span>${p.xp} / ${nextLevelXP(p.level)} XP</span><strong>${p.points} PONTOS DE HABILIDADE</strong></div><div class="experience-bar"><i style="width:${p.xp/nextLevelXP(p.level)*100}%"></i></div>${blessing?'<span class="blessing-tag">'+blessing.name+' · '+(s.run?'ATIVA':'PRÓXIMA DESCIDA')+'</span>':''}`;}
