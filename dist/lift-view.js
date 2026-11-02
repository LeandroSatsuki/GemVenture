import {liftScreenMarkup as approvedLiftScreenMarkup,bindLiftNavigation as approvedBindLiftNavigation} from './rebrand-lift.js';
import {liftHostPresentationModel} from './lift-v2ab-model.js';
import {liftModeNavMarkup} from './rebrand-lift.js';
import {gateNavArt,gateHeroArt} from './abyss-gate-art.js';
import {biomeIndex,SKILLS} from './core.js';
import {depthLimit} from './campaign.js';
import {floorAddress,ABYSS_GATE_COST,gateProgress,gateBossDefeated,abyssTestAccess,canEnterAbyss,canStartAt,stopCost,biomeEntrance} from './descent-progress.js';
import {MATERIALS,canPayMaterials,floorMinerals} from './materials.js';
import {BLESSINGS,RELICS,blessingInfo} from './pillars.js';
import {gemIcon,expeditionMap} from './expedition-map.js';
import {generateAsset,assetSvgBody} from './art-kit.js';
import {BOSSES} from './bosses.js';

function modeIcon(abyss){return abyss?gateNavArt():'<svg viewBox="0 0 100 110" aria-hidden="true">'+assetSvgBody(generateAsset('lift',{variant:1}))+'<path d="M50 45V71M40 62L50 73L60 62" fill="none" stroke="#5ee9e9" stroke-width="6" stroke-linejoin="round"/></svg>';}

function gateArt(s){return gateHeroArt(s);
}
export function gateMarkup(s){
 const test=abyssTestAccess(),open=canEnterAbyss(s),percent=Math.floor(gateProgress(s)*100),best=s.abyssBest||0;
 const materials=MATERIALS.map((m,i)=>{const left=ABYSS_GATE_COST[i]-s.descent.gate[i],n=Math.min(100,left,s.materials[i]);return '<div style="--gem:'+m.color+'">'+gemIcon(i)+'<div><strong>'+m.name+'</strong><span>'+s.descent.gate[i]+' / '+ABYSS_GATE_COST[i]+'</span></div><button data-gate="'+i+'" '+(!n?'disabled':'')+' aria-label="Colocar '+n+' '+m.name+' no portão">'+(!left?'✓':'+ '+n)+'</button></div>';}).join('');
 return '<section class="mode-card mode-abyss gv-r2 '+(open?'gate-open':'')+'" aria-labelledby="abyssModeTitle"><header><span class="mode-state">'+(test?'TESTE LIBERADO':open?'✓ LIBERADO':'◇ BLOQUEADO')+'</span><span class="mode-style">SOBREVIVÊNCIA</span></header><div class="mode-hero"><div><h2 id="abyssModeTitle">ABISMO ∞</h2></div><div class="gate-art r2-gate-art">'+gateArt(s)+'</div></div><div class="mode-record"><span>SEU RECORDE</span><strong>'+best.toLocaleString('pt-BR')+' <small>m</small></strong></div><div class="mode-access"><strong>'+(test?'ACESSO TEMPORÁRIO':open?'PORTÃO ABERTO':'PORTÃO · '+percent+'%')+'</strong><div class="gate-meter" '+(test?'hidden':'')+' role="progressbar" aria-label="Cristais do portão" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><i style="width:'+percent+'%"></i></div><span class="gate-boss '+(gateBossDefeated(s)?'done':'')+'">'+(test?'ENTRADA LIVRE PARA TESTE':gateBossDefeated(s)?'✓ BOSS MÍSTICO VENCIDO':'◇ VENÇA O BOSS MÍSTICO')+'</span></div><button class="primary mode-start" id="abyssStart" '+(!open?'disabled':'')+'>'+(open?(best?'JOGAR NOVAMENTE ↓':'ENTRAR NO ABISMO ↓'):'PORTÃO SELADO')+'</button><details id="abyssDetails" class="mode-details"><summary>'+(open?'DETALHES':'DESBLOQUEAR · DETALHES')+'</summary><ul><li>Descida contínua, sem pausa entre salas.</li><li>Mais profundidade. Mais perigo e saque.</li><li>Uma nova tentativa começa em 0 m. Seu recorde fica.</li></ul>'+(!open?'<h3>COMPLETE O PORTÃO</h3><p>Deposite cada cor. Vença o Boss Místico.</p><div class="gate-materials">'+materials+'</div>':(test?'<p class="mode-complete">TESTE LOCAL · PROGRESSÃO DO PORTÃO PRESERVADA</p>':'<p class="mode-complete">✓ CRISTAIS COMPLETOS · ✓ CHEFE VENCIDO</p>'))+'</details></section>';
}
export function departureMarkup(s,selected=1){
 const address=floorAddress(selected),reached=selected<=Math.max(1,s.best)||biomeEntrance(s,selected),focus=floorMinerals(selected).focus,record=s.descent.records?.[selected];
 const title=!reached?'NÃO EXPLORADO':address.boss?BOSSES[biomeIndex(selected)].name:['Veio de quartzo','Veio de rubi','Veio de topázio','Jardim de esmeralda'][focus];
 return '<section id="liftFloorPanel" class="lift-floor-panel" aria-labelledby="liftFloorTitle"><header><div><span class="lift-floor-address">ANDAR '+address.code+' · '+selected*25+' M</span><h3 id="liftFloorTitle">'+title+'</h3></div>'+(reached?'<span class="lift-floor-resource">'+(address.boss?'GUARDIÃO':gemIcon(focus)+MATERIALS[focus].name+' abundante')+'</span>':'')+'</header>'+(reached?'<div class="lift-floor-record"><span>RECORDE</span><strong>'+(record?record.points.toLocaleString('pt-BR')+' PTS':'SEM REGISTRO')+'</strong>'+(record?'<span>'+record.clears+' VITÓRIA'+(record.clears===1?'':'S')+'</span>':'')+'</div><div class="lift-floor-action">'+stopMarkup(s,selected)+'</div>':'<p class="lift-unexplored-note">Continue a expedição para descobrir este andar.</p>')+'</section>';
}
export function stopMarkup(s,floor){
 if(s.descent.stops.includes(floor)||biomeEntrance(s,floor))return '<span class="lift-stop-state">✓ Parada ativa</span><button class="primary stop-travel" data-depart="'+floor+'" aria-label="Descer ao andar '+floorAddress(floor).code+'" '+(!canStartAt(s,floor)?'disabled':'')+'>DESCER ↓</button>';
 const cost=stopCost(floor),eligible=floor<=depthLimit(s);
 return '<div class="stop-unlock"><div class="lift-stop-price"><span class="lift-stop-caption">'+(canPayMaterials(s,cost)?'CUSTO EM CRISTAIS':'CRISTAIS INSUFICIENTES')+'</span>'+cost.map((n,i)=>n?'<span class="'+(s.materials[i]<n?'insufficient':'')+'" title="'+MATERIALS[i].name+' · '+s.materials[i]+' disponíveis" aria-label="'+n+' '+MATERIALS[i].name+'; saldo '+s.materials[i]+'" style="--mineral:'+MATERIALS[i].color+'">'+gemIcon(i)+n+'</span>':'').join('')+'</div><button class="primary" data-stop="'+floor+'" '+(!eligible||floor>Math.max(1,s.best)||!canPayMaterials(s,cost)?'disabled':'')+'>'+(eligible?'ATIVAR PARADA':'ABRA O BIOMA')+'</button></div>';
}

export function abyssDetailsMarkup(s){
 const blessing=blessingInfo(s.pendingBlessing,s.pendingBlessingLevel,s.pendingBlessingRoll),relics=RELICS.filter(r=>s.relics.includes(r.id)),skills=SKILLS.filter(k=>s.equipped.includes(k.id)||(k.passive&&s.unlocked.includes(k.id)));
 return '<section class="abyss-preparation"><h3>RECOMPENSAS</h3><div class="abyss-prizes"><span>◇ CRISTAIS</span><span>● MOEDAS</span><span>★ ATÉ 5 ESTRELAS</span></div><h3>PRÓXIMA DESCIDA</h3>'+
 (blessing?'<article class="prepared-blessing"><strong>'+blessing.name+'</strong><span>'+blessing.good+'</span><small>'+blessing.risk+'</small></article>':'<p class="empty-preparation">SEM BÊNÇÃO DO POÇO</p>')+
 relics.map(r=>'<article class="prepared-relic"><strong>'+r.name+'</strong><span>'+r.text+'</span></article>').join('')+
 '<h3>HABILIDADES</h3><div class="prepared-skills">'+(skills.length?skills.map(k=>'<span>'+k.name+'</span>').join(''):'<span>NENHUMA EQUIPADA</span>')+'</div></section>';
}
export function liftScreenMarkup(s,selected=1,mode='floors'){
 return approvedLiftScreenMarkup(liftHostPresentationModel(s,selected,mode,{floors:modeIcon(false),abyss:modeIcon(true)})).replace('<details class="gv-v2-abyss-systems">','<details id="abyssDetails" class="gv-v2-abyss-systems">');
}
export function bindLiftNavigation(root,onSelect){
 return approvedBindLiftNavigation(root,onSelect);
}
