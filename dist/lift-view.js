import {BIOMES,biomeIndex,SKILLS} from './core.js';
import {depthLimit} from './campaign.js';
import {floorAddress,ABYSS_GATE_COST,gateProgress,gateBossDefeated,abyssTestAccess,canEnterAbyss,canStartAt,stopCost} from './descent-progress.js';
import {MATERIALS,canPayMaterials} from './materials.js';
import {BLESSINGS,RELICS,blessingInfo} from './pillars.js';
import {gemIcon,expeditionMap} from './expedition-map.js';
import {generateAsset,assetSvgBody} from './art-kit.js';

function modeIcon(abyss){return abyss?'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 58V23L20 8H44L55 23V58Z" fill="#841252" stroke="#f94e6d" stroke-width="4"/><path d="M20 58V27L27 19H37L44 27V58Z" fill="#180d2f"/><path d="M26 28V55M38 28V55M20 38H44" stroke="#f94e6d" stroke-width="3"/><path d="M4 59H60" stroke="#f94e6d" stroke-width="5"/></svg>':'<svg viewBox="0 0 100 110" aria-hidden="true">'+assetSvgBody(generateAsset('lift',{variant:1}))+'<path d="M50 45V71M40 62L50 73L60 62" fill="none" stroke="#5ee9e9" stroke-width="6" stroke-linejoin="round"/></svg>';}

function gateArt(s){
 const progress=gateProgress(s),percent=Math.floor(progress*100);
 const socket=(i,x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M0 -15L12 0L0 15L-12 0Z" fill="'+MATERIALS[i].color+'" opacity="'+(.18+.82*s.descent.gate[i]/ABYSS_GATE_COST[i])+'" stroke="'+MATERIALS[i].color+'" stroke-width="3"/></g>';
 return '<svg viewBox="0 0 260 210" role="img" aria-label="Portão do Abismo, '+percent+'% preenchido"><path d="M30 195V80L70 30H190L230 80V195Z" fill="#353658" stroke="#8b97b6" stroke-width="10"/><path d="M65 195V87L91 58H169L195 87V195" fill="#180d2f" stroke="#841252" stroke-width="8"/><path d="M85 195V110Q130 20 175 110V195" fill="#841252" opacity="'+(.12+progress*.75)+'"/><path d="M110 195V119L141 84L127 140L151 157L122 195" fill="#f94e6d" opacity="'+progress+'"/>'+socket(0,56,111)+socket(1,104,39)+socket(2,157,39)+socket(3,207,111)+'<path d="M13 199H247" stroke="#8b97b6" stroke-width="12"/></svg>';
}
export function gateMarkup(s){
 const test=abyssTestAccess(),open=canEnterAbyss(s),percent=Math.floor(gateProgress(s)*100),best=s.abyssBest||0;
 const materials=MATERIALS.map((m,i)=>{const left=ABYSS_GATE_COST[i]-s.descent.gate[i],n=Math.min(100,left,s.materials[i]);return '<div style="--gem:'+m.color+'">'+gemIcon(i)+'<div><strong>'+m.name+'</strong><span>'+s.descent.gate[i]+' / '+ABYSS_GATE_COST[i]+'</span></div><button data-gate="'+i+'" '+(!n?'disabled':'')+' aria-label="Colocar '+n+' '+m.name+' no portão">'+(!left?'✓':'+ '+n)+'</button></div>';}).join('');
 return '<section class="mode-card mode-abyss '+(open?'gate-open':'')+'" aria-labelledby="abyssModeTitle"><header><span class="mode-state">'+(test?'TESTE LIBERADO':open?'✓ LIBERADO':'◇ BLOQUEADO')+'</span><span class="mode-style">SOBREVIVÊNCIA</span></header><div class="mode-hero"><div><h2 id="abyssModeTitle">ABISMO ∞</h2></div><div class="gate-art">'+gateArt(s)+'</div></div><div class="mode-record"><span>SEU RECORDE</span><strong>'+best.toLocaleString('pt-BR')+' <small>m</small></strong></div><div class="mode-access"><strong>'+(test?'ACESSO TEMPORÁRIO':open?'PORTÃO ABERTO':'PORTÃO · '+percent+'%')+'</strong><div class="gate-meter" '+(test?'hidden':'')+' role="progressbar" aria-label="Cristais do portão" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><i style="width:'+percent+'%"></i></div><span class="gate-boss '+(gateBossDefeated(s)?'done':'')+'">'+(test?'ENTRADA LIVRE PARA TESTE':gateBossDefeated(s)?'✓ BOSS MÍSTICO VENCIDO':'◇ VENÇA O BOSS MÍSTICO')+'</span></div><button class="primary mode-start" id="abyssStart" '+(!open?'disabled':'')+'>'+(open?(best?'JOGAR NOVAMENTE ↓':'ENTRAR NO ABISMO ↓'):'PORTÃO SELADO')+'</button><details id="abyssDetails" class="mode-details"><summary>'+(open?'DETALHES':'DESBLOQUEAR · DETALHES')+'</summary><ul><li>Descida contínua, sem pausa entre salas.</li><li>Mais profundidade. Mais perigo e saque.</li><li>Uma nova tentativa começa em 0 m. Seu recorde fica.</li></ul>'+(!open?'<h3>COMPLETE O PORTÃO</h3><p>Deposite cada cor. Vença o Boss Místico.</p><div class="gate-materials">'+materials+'</div>':(test?'<p class="mode-complete">TESTE LOCAL · PROGRESSÃO DO PORTÃO PRESERVADA</p>':'<p class="mode-complete">✓ CRISTAIS COMPLETOS · ✓ CHEFE VENCIDO</p>'))+'</details></section>';
}
export function departureMarkup(s,selected=1){
 const stops=s.descent.stops.filter(f=>canStartAt(s,f));
 return '<section class="lift-departure"><div><h2>ELEVADOR</h2></div><label for="departureFloor">COMEÇAR EM</label><select id="departureFloor">'+stops.map(f=>'<option value="'+f+'" '+(f===selected?'selected':'')+'>'+floorAddress(f).code+' · '+BIOMES[biomeIndex(f)].name+'</option>').join('')+'</select><button class="primary" id="liftStart">DESCER ↓</button><details class="quiet-details"><summary>PARADAS</summary><p>Visite um andar e ative sua parada com cristais.</p></details></section>';
}
export function stopMarkup(s,floor){
 if(s.descent.stops.includes(floor))return '<button class="stop-travel" data-depart="'+floor+'" '+(!canStartAt(s,floor)?'disabled':'')+'>PARTIR DAQUI ↓</button>';
 const cost=stopCost(floor),eligible=floor<=depthLimit(s);
 return '<div class="stop-unlock"><div>'+cost.map((n,i)=>n?'<span title="'+MATERIALS[i].name+'" style="color:'+MATERIALS[i].color+'">'+gemIcon(i)+n+'</span>':'').join('')+'</div><button data-stop="'+floor+'" '+(!eligible||!canPayMaterials(s,cost)?'disabled':'')+'>'+(eligible?'ATIVAR PARADA':'ABRA O BIOMA')+'</button></div>';
}

export function abyssDetailsMarkup(s){
 const blessing=blessingInfo(s.pendingBlessing,s.pendingBlessingLevel,s.pendingBlessingRoll),relics=RELICS.filter(r=>s.relics.includes(r.id)),skills=SKILLS.filter(k=>s.equipped.includes(k.id)||(k.passive&&s.unlocked.includes(k.id)));
 return '<section class="abyss-preparation"><h3>RECOMPENSAS</h3><div class="abyss-prizes"><span>◇ CRISTAIS</span><span>● MOEDAS</span><span>★ ATÉ 5 ESTRELAS</span></div><h3>PRÓXIMA DESCIDA</h3>'+
 (blessing?'<article class="prepared-blessing"><strong>'+blessing.name+'</strong><span>'+blessing.good+'</span><small>'+blessing.risk+'</small></article>':'<p class="empty-preparation">SEM BÊNÇÃO DO POÇO</p>')+
 relics.map(r=>'<article class="prepared-relic"><strong>'+r.name+'</strong><span>'+r.text+'</span></article>').join('')+
 '<h3>HABILIDADES</h3><div class="prepared-skills">'+(skills.length?skills.map(k=>'<span>'+k.name+'</span>').join(''):'<span>NENHUMA EQUIPADA</span>')+'</div></section>';
}
export function liftScreenMarkup(s,selected=1,mode='floors'){
 const abyss=mode==='abyss';
 return '<div class="lift-layout"><nav class="lift-mode-nav" aria-label="Modos de descida"><button data-lift-mode="floors" aria-pressed="'+!abyss+'"><b class="lift-mode-icon">'+modeIcon(false)+'</b><strong>ANDARES</strong></button><button data-lift-mode="abyss" aria-pressed="'+abyss+'"><b class="lift-mode-icon">'+modeIcon(true)+'</b><strong>ABISMO</strong><small>'+(abyssTestAccess()?'TESTE':canEnterAbyss(s)?'LIBERADO':'BLOQUEADO')+'</small></button></nav><section class="lift-pane" tabindex="0" aria-label="'+(abyss?'Abismo':'Andares')+'">'+(abyss?gateMarkup(s)+abyssDetailsMarkup(s):departureMarkup(s,selected)+expeditionMap(s).replace('<button class="primary" id="liftStart">DESCER</button>',''))+'</section></div>';
}
