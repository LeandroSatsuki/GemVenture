import {floorAddress} from './descent-progress.js';
import {stopMarkup} from './lift-view.js';
import {BIOMES,SEALS,depthLimit} from './core.js';
import {BOSSES} from './bosses.js';
import {BIOME_ART,P} from './palette.js';
import {MATERIALS,floorMinerals} from './materials.js';
import {BIOME_CREATURES} from './creatures.js';
import {generateAsset,assetSvgBody,assetToSvg} from './art-kit.js';
export const gemIcon=i=>assetToSvg(generateAsset('crystal',{variant:i,seed:42}));
export function floorPicture(biome,floor,boss=false){const b=BIOME_ART[biome],art=(type,x,y,size,variant=0)=>`<g transform="translate(${x} ${y}) scale(${size})">${assetSvgBody(generateAsset(type,{biome,variant,seed:floor}))}</g>`;return `<svg viewBox="0 0 230 125" role="img" aria-label="${boss?BOSSES[biome].name:BIOMES[biome].name}"><path d="M8 40L66 14H186L223 49V97L170 123H48L7 97Z" fill="${b.edge}"/><path d="M8 32L66 6H186L223 41V84L170 110H48L7 84Z" fill="${b.floor}"/><path d="M26 73L85 43L192 74L147 98Z" fill="${b.patch}"/>${art('rock',8,0,.65)}${art(['rock','tree','fossil','lava','mushroom','molehill','bush'][biome],148,0,.7)}${boss?art('boss',70,-5,1.02,biome):art('crystal',74,32,.58,floorMinerals(floor).focus)+art(['slime','bat','golem'][floor%3],130,43,.45)}<path d="M46 89L87 104M147 109L183 94" stroke="${b.accent}" stroke-width="3"/></svg>`;}
export function expeditionMap(s){
 const seal=SEALS[s.seals];
 return `<header class="descent-heading"><span>SUA DESCOBERTA</span><h2>BIOMAS</h2></header><div class="descent-scroll" aria-label="Mapa das profundezas descobertas">${BIOMES.slice(0,Math.floor((Math.max(1,s.best)-1)/5)+1).map((b,i)=>{
 const reached=Math.min(5,Math.max(1,s.best)-i*5);
 return `<details id="map-biome-${i}" class="map-biome ${i>s.seals?'map-locked':''}" style="--biome:${b.accent}"><summary><span class="biome-thumbnail">${floorPicture(i,i*5+1)}</span><span class="biome-title"><small>BIOMA ${String(i+1).padStart(2,'0')} · ${reached}/5</small><strong>${b.name}</strong></span><span class="biome-chevron" aria-hidden="true">⌄</span></summary><div class="map-fauna">${BIOME_CREATURES[i].map((n,k)=>`<span title="${n.name}">${assetToSvg(generateAsset(['slime','bat','golem'][k],{biome:i}))}<b>${n.name}</b></span>`).join('')}</div><ol>${Array.from({length:5},(_,j)=>{
 const floor=i*5+j+1,boss=j===4,focus=floorMinerals(floor).focus,record=s.descent.records?.[floor];
 if(j>=reached)return `<li class="map-floor map-undiscovered"><div class="map-stop">${floorAddress(floor).code}</div><div class="unknown-floor" aria-hidden="true">?</div><div class="map-floor-copy"><span>${j+1}/5</span><h4>NÃO EXPLORADO</h4></div></li>`;
 return `<li class="map-floor ${boss?'map-boss':''}"><div class="map-stop">${floorAddress(floor).code}</div><div class="map-picture">${floorPicture(i,floor,boss)}</div><div class="map-floor-copy"><span>${floorAddress(floor).step}/5 · ${floor*25} M ${i>s.seals?'· BLOQUEADO':s.best>=floor?'· ALCANÇADO':''}</span><h4>${boss?BOSSES[i].name:['Veio de quartzo','Veio de rubi','Veio de topázio','Jardim de esmeralda'][focus]}</h4><p>${boss?'DERROTE PARA AVANÇAR':`<i style="color:${MATERIALS[focus].color}">${gemIcon(focus)}</i> ${MATERIALS[focus].name} abundante`}</p><div class="floor-record"><span>RECORDE</span><strong>${record?record.points.toLocaleString('pt-BR')+' PTS':'—'}</strong><small>${record?record.clears+' VITÓRIA'+(record.clears===1?'':'S'):'SEM REGISTRO'}</small></div>${stopMarkup(s,floor)}</div></li>`;
 }).join('')}</ol></details>`;
 }).join('')}<div class="map-mystery">? · PROFUNDEZAS DESCONHECIDAS</div></div><footer class="map-departure">${seal?`<div><strong>${seal.name}</strong><span>Andar ${seal.floor} · ★ ${seal.stars} estrelas</span></div><button id="buySeal" class="secondary" ${s.best<seal.floor||s.stars<seal.stars?'disabled':''}>ABRIR BIOMA</button>`:'<strong>CAMINHO ABERTO</strong>'}<button class="primary" id="liftStart">DESCER</button></footer>`;
}
