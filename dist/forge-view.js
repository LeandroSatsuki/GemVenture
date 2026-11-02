import {collectedGemSvg} from './collected-gems.js';
import {pickaxePreview} from './pickaxe-art.js';
import {PICKAXE_STYLES,pickaxeTier,nextPickaxeStyle} from './pickaxe-style.js';
import {MATERIALS,wellRecipe,pickRecipe,canPayMaterials} from './materials.js';
import {approvedArtSvg} from './approved-art.js';
import {FORGE_PROJECTS,forgeProject,FORGE_CAP,forgeEffects} from './forge.js';
import {gearMarkup} from './gear-view.js';
import {assetSvgBody,generateAsset} from './art-kit.js';
import {P} from './palette.js';
import {forgeProjectIcon} from './forge-project-icons.js';
const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
import {buildingMarkup} from './village-view.js';
export function forgeScene(tier=0){return `<svg class="forge-illustration" viewBox="0 0 640 390" role="img" aria-label="Forja isométrica, minerador e cristais">
 <g class="forge-ground" stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"><path d="M60 244L320 364V388L60 268Z" fill="${P.clay}"/><path d="M320 364L580 244V268L320 388Z" fill="${P.wood}"/><path d="M60 244L320 124L580 244L320 364Z" fill="${P.green}"/></g>
 <g class="forge-workshop-art" transform="translate(-55 0)"><ellipse class="forge-glow" cx="345" cy="256" rx="100" ry="23" fill="${P.orange}" opacity=".16"/>
 <image href="assets/village-hept32/forge.png" x="230" y="0" width="300" height="300"/>
 <g class="forge-furnace" transform="translate(230 8.2558) scale(.232558)" aria-hidden="true"><defs><clipPath id="forge-mouth"><path d="M439 717L459 700L546 742L563 773V912L439 851Z"/></clipPath></defs><g clip-path="url(#forge-mouth)"><path d="M439 717L459 700L546 742L563 773V912L439 851Z" fill="${P.ink}"/><image class="forge-fire-a" href="assets/forge-ui-v2/fire-a.png" x="386" y="720" width="222" height="222"/><image class="forge-fire-b" href="assets/forge-ui-v2/fire-b.png" x="386" y="720" width="222" height="222"/></g></g>
 <g class="forge-smith" transform="translate(820 0) scale(-1 1)" aria-hidden="true"><image class="forge-smith-ready" href="assets/forge-ui-v2/miner-ready.png" x="273" y="107" width="163" height="163"/><image class="forge-smith-strike" href="assets/forge-ui-v2/miner-strike.png" x="273" y="107" width="163" height="163"/></g>
 ${Array.from({length:4},(_,i)=>`<rect class="forge-ember" style="animation-delay:${i*.4}s" x="${322+i*8}" y="195" width="3" height="3" fill="${P.orange}"/>`).join('')}
 ${[P.cyan,P.pink,P.yellow,P.lime].map((color,i)=>`<g class="forge-feed-gem" style="animation-delay:${i*.12}s"><rect x="${101+i*5}" y="222" width="10" height="10" rx="2" fill="${color}" stroke="${P.ink}" stroke-width="2"/></g>`).join('')}
 </g></svg>`;}

export function forgeDepositAmount(s,p){return Math.max(1,Math.min(p.remaining,Math.max(1000,Math.ceil(p.cost/4))));}
export function recipeMarkup(s,cost,invested){
 const deposited=invested!==undefined;
 return cost.map((n,i)=>{if(!n)return '';const held=s.materials[i]||0,amount=deposited?invested[i]||0:Math.min(n,held),paid=amount>=n,enough=deposited?held+amount>=n:held>=n,percent=Math.min(100,amount/n*100);
 return '<div class="recipe-gem '+(paid?'paid':enough?'enough':'missing')+'" style="--mineral:'+MATERIALS[i].color+'" title="'+(deposited?'DEPOSITADO':'DISPONÍVEL')+' · '+amount+' / '+n+' · SALDO '+held+'" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(percent)+'" aria-valuetext="'+amount+' de '+n+', '+Math.floor(percent)+'%" aria-label="'+MATERIALS[i].name+', '+amount+' de '+n+'"><i class="recipe-progress" style="width:'+percent+'%" aria-hidden="true"></i>'+collectedGemSvg(i)+'<div><strong>'+MATERIALS[i].name+'</strong><span class="recipe-amount"><b>'+fmt(amount)+' / '+fmt(n)+'</b><small class="recipe-percent">'+Math.floor(percent)+'%</small></span></div></div>';
 }).join('');
}
export function forgeMarkup(s,id,pickCost,pickPower,busy=false,gearPiece='pickaxe',gearIndex=0,gearKind=1,gearClearConfirm=false){
 const vigor=id==='vigor',level=vigor?s.core:s.level,pick=id==='pickaxe'||vigor,p=pick?null:forgeProject(s,id),done=pick?level>=FORGE_CAP:p.complete,locked=!pick&&p.locked,ready=!pick&&p.ready,cost=pick?pickCost:p.cost,recipe=pick?(vigor?wellRecipe(s):pickRecipe(s)):p.recipe;
 const canFeed=pick?s.bank>=cost&&canPayMaterials(s,recipe):p.remaining>0&&s.bank>0||p.missing.some((n,i)=>n>0&&s.materials[i]>0);
 const show=n=>Number(n.toFixed(2)).toLocaleString('pt-BR'),nextPower=forgeEffects({...s,level:s.level+(vigor?0:1),core:s.core+(vigor?1:0)});
 const reward=pick?(vigor?'VIDA ':'FORÇA ')+show(pickPower)+' → '+show(vigor?nextPower.health:pickPower+nextPower.power-forgeEffects(s).power):p.reward(Math.min(FORGE_CAP,p.level+1));
 const title=id==='pickaxe'?PICKAXE_STYLES[pickaxeTier(s.level)].name:vigor?'VIDA':p.name;
 const items=[{id:'pickaxe',name:'Picareta',icon:'force'},{id:'vigor',name:'Vida',icon:'heart'},...FORGE_PROJECTS].map(item=>({...item,icon:({anvil:'forge',armor:'chest',vault:'vault'})[item.id]||item.icon}));
 const nav=items.map(item=>{const project=['pickaxe','vigor'].includes(item.id)?null:forgeProject(s,item.id),rank=project?project.level:item.id==='vigor'?s.core:s.level,status=project?.locked?'ANDAR '+project.required:project?.ready?'PRONTO!':'NV. '+rank;
 return '<button class="smith-project '+(item.id===id?'selected':'')+'" data-forge="'+item.id+'" aria-pressed="'+(item.id===id)+'" title="'+status+'" '+(busy?'disabled':'')+'>'+forgeProjectIcon(item.id)+'<strong>'+item.name+'</strong></button>';}).join('');
 const selectedIcon=id==='pickaxe'?generatePickaxePreview(s.level):forgeProjectIcon(id);
 const visualTip=id==='pickaxe'?(nextPickaxeStyle(s.level)?'NOVO VISUAL · NV. '+nextPickaxeStyle(s.level).level:'VISUAL MÁXIMO'):title;
 return `<header class="smith-header"><h2>FORJA</h2><div class="smith-header-tools"><strong>◇ ${fmt(s.bank)} <small>MOEDAS</small></strong>${buildingMarkup(s,'forge')}</div></header>
 <div class="smith-stock">${MATERIALS.map((m,i)=>'<div style="--mineral:'+m.color+'">'+collectedGemSvg(i)+'<strong>'+fmt(s.materials[i])+'</strong><span>'+m.name+'</span></div>').join('')}</div>
 <div class="smith-layout"><nav class="smith-projects" aria-label="Projetos da forja">${nav}</nav>
 <div class="smith-center"><div class="forge-scene" id="forgeScene">${forgeScene(pickaxeTier(s.level))}<span class="forge-scene-sign">${busy?'FUNDINDO…':''}</span><div class="forge-celebration" id="forgeCelebration" role="status"></div></div><details class="quiet-details forge-material-help"><summary>USOS DOS CRISTAIS</summary><div class="smith-purpose">${MATERIALS.map((m,i)=>'<span style="--mineral:'+m.color+'">'+collectedGemSvg(i)+'<b>'+m.use+'</b></span>').join('')}</div></details></div>
 <section class="smith-recipe" aria-label="Receita selecionada"><header class="smith-selection"><div class="smith-selection-icon" title="${visualTip}">${selectedIcon}</div><div><span class="smith-kicker">${done?'MÁXIMO':'NV. '+(pick?level:p.level)+' / '+FORGE_CAP}</span><h3>${title}</h3><strong class="forge-benefit">${id==='pickaxe'?'PICARETA · ':''}${done?(pick?(vigor?'VIDA ':'FORÇA ')+show(pickPower):p.reward(p.level)):reward}</strong></div></header>
 ${id==='armor'?gearMarkup(s,gearPiece,gearIndex,gearKind,busy,gearClearConfirm):''}
 ${done?'<div class="forge-complete">✓ OBRA COMPLETA</div>':`<div class="recipe-grid">${recipeMarkup(s,recipe,pick?undefined:p.materials)}</div><div class="recipe-coins"><span>◇ MOEDAS</span><b>${fmt(pick?Math.min(s.bank,cost):p.invested)} / ${fmt(cost)}</b></div>
 ${locked?'<p class="forge-lock">ALCANCE O ANDAR '+p.required+'</p>':''}
 <button class="primary forge-action" id="forgeAction" ${busy||locked||!ready&&!canFeed?'disabled':''}>${busy?'FUNDINDO…':locked?'BLOQUEADO':pick?(vigor?'REFORÇAR VIDA':'FORJAR PICARETA'):ready?'CONSTRUIR':'DEPOSITAR RECURSOS'}</button><details class="quiet-details"><summary>COMO FORJAR</summary><p>${pick?'O preço inclui moedas e todos os cristais da receita.':'Depósitos ficam salvos. Complete a receita para construir.'}</p></details>`}
 </section></div>`;
}
function generatePickaxePreview(level){return pickaxePreview(level);}
