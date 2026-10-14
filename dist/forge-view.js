import {PICKAXE_STYLES,pickaxeTier,nextPickaxeStyle} from './pickaxe-style.js';
import {MATERIALS,wellRecipe,pickRecipe,canPayMaterials} from './materials.js';
import {gemIcon} from './expedition-map.js';
import {FORGE_PROJECTS,forgeProject,FORGE_CAP,forgeEffects} from './forge.js';
import {gearMarkup} from './gear-view.js';
import {assetSvgBody,generateAsset} from './art-kit.js';
import {P} from './palette.js';
import {flowImageUrl} from './flow-village.js';
import {glyph} from './ui-art.js';
const fmt=n=>new Intl.NumberFormat('pt-BR').format(n);
import {buildingMarkup} from './village-view.js';
export function forgeScene(tier=0){return `<svg class="forge-illustration" viewBox="0 0 640 390" role="img" aria-label="Forja isométrica, minerador e cristais">
 <g stroke="${P.ink}" stroke-width="4" stroke-linejoin="round"><path d="M30 244L379 328V374L30 290Z" fill="${P.clay}"/><path d="M379 328L610 232V278L379 374Z" fill="${P.wood}"/><path d="M30 244L270 118L610 232L379 328Z" fill="${P.forest}"/></g>
 <ellipse class="forge-glow" cx="345" cy="256" rx="100" ry="23" fill="${P.orange}" opacity=".16"/>
 <image href="${flowImageUrl('forge')}" x="230" y="0" width="300" height="300"/>
 <image href="${flowImageUrl('miner')}" x="85" y="120" width="115" height="140"/>
 <g class="forge-hammer"><path d="M183 229L204 188L211 191L191 232Z" fill="${P.ochre}"/><path d="M190 185L216 192L211 205L185 198Z" fill="${P.steel}"/></g>
 ${Array.from({length:4},(_,i)=>`<rect class="forge-ember" style="animation-delay:${i*.4}s" x="${322+i*8}" y="195" width="3" height="3" fill="${P.orange}"/>`).join('')}
 ${[P.cyan,P.pink,P.yellow,P.lime].map((color,i)=>`<g class="forge-feed-gem" style="animation-delay:${i*.12}s"><rect x="${101+i*5}" y="222" width="10" height="10" rx="2" fill="${color}" stroke="${P.ink}" stroke-width="2"/></g>`).join('')}
 </svg>`;}

export function forgeDepositAmount(s,p){return Math.max(1,Math.min(p.remaining,Math.max(1000,Math.ceil(p.cost/4))));}
export function recipeMarkup(s,cost,invested){
 const deposited=invested!==undefined;
 return cost.map((n,i)=>{if(!n)return '';const held=s.materials[i]||0,amount=deposited?invested[i]||0:Math.min(n,held),paid=amount>=n,enough=deposited?held+amount>=n:held>=n,percent=Math.min(100,amount/n*100);
 return '<div class="recipe-gem '+(paid?'paid':enough?'enough':'missing')+'" style="--mineral:'+MATERIALS[i].color+'" title="'+(deposited?'DEPOSITADO':'DISPONÍVEL')+' · '+amount+' / '+n+' · SALDO '+held+'" aria-label="'+MATERIALS[i].name+', '+amount+' de '+n+'"><i class="recipe-progress" style="width:'+percent+'%" aria-hidden="true"></i>'+gemIcon(i)+'<div><strong>'+MATERIALS[i].name+'</strong><b>'+fmt(amount)+' / '+fmt(n)+'</b></div></div>';
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
 return '<button class="smith-project '+(item.id===id?'selected':'')+'" data-forge="'+item.id+'" aria-pressed="'+(item.id===id)+'" title="'+status+'" '+(busy?'disabled':'')+'>'+glyph(item.icon)+'<strong>'+item.name+'</strong></button>';}).join('');
 const selectedIcon=id==='pickaxe'?generatePickaxePreview(s.level):glyph(items.find(item=>item.id===id)?.icon||'forge');
 const visualTip=id==='pickaxe'?(nextPickaxeStyle(s.level)?'NOVO VISUAL · NV. '+nextPickaxeStyle(s.level).level:'VISUAL MÁXIMO'):title;
 return `<header class="smith-header"><h2>FORJA</h2><div class="smith-header-tools"><strong>◇ ${fmt(s.bank)} <small>MOEDAS</small></strong>${buildingMarkup(s,'forge')}</div></header>
 <div class="smith-stock">${MATERIALS.map((m,i)=>'<div style="--mineral:'+m.color+'">'+gemIcon(i)+'<strong>'+fmt(s.materials[i])+'</strong><span>'+m.name+'</span></div>').join('')}</div>
 <div class="smith-layout"><nav class="smith-projects" aria-label="Projetos da forja">${nav}</nav>
 <div class="smith-center"><div class="forge-scene" id="forgeScene">${forgeScene(pickaxeTier(s.level))}<span class="forge-scene-sign">${busy?'FUNDINDO…':''}</span><div class="forge-celebration" id="forgeCelebration" role="status"></div></div><details class="quiet-details forge-material-help"><summary>USOS DOS CRISTAIS</summary><div class="smith-purpose">${MATERIALS.map((m,i)=>'<span style="--mineral:'+m.color+'">'+gemIcon(i)+'<b>'+m.use+'</b></span>').join('')}</div></details></div>
 <section class="smith-recipe" aria-label="Receita selecionada"><header class="smith-selection"><div class="smith-selection-icon" title="${visualTip}">${selectedIcon}</div><div><span class="smith-kicker">${done?'MÁXIMO':'NV. '+(pick?level:p.level)+' / '+FORGE_CAP}</span><h3>${title}</h3><strong class="forge-benefit">${id==='pickaxe'?'PICARETA · ':''}${done?(pick?(vigor?'VIDA ':'FORÇA ')+show(pickPower):p.reward(p.level)):reward}</strong></div></header>
 ${id==='armor'?gearMarkup(s,gearPiece,gearIndex,gearKind,busy,gearClearConfirm):''}
 ${done?'<div class="forge-complete">✓ OBRA COMPLETA</div>':`<div class="recipe-grid">${recipeMarkup(s,recipe,pick?undefined:p.materials)}</div><div class="recipe-coins"><span>◇ MOEDAS</span><b>${fmt(pick?Math.min(s.bank,cost):p.invested)} / ${fmt(cost)}</b></div>
 ${locked?'<p class="forge-lock">ALCANCE O ANDAR '+p.required+'</p>':''}
 <button class="primary forge-action" id="forgeAction" ${busy||locked||!ready&&!canFeed?'disabled':''}>${busy?'FUNDINDO…':locked?'BLOQUEADO':pick?(vigor?'REFORÇAR VIDA':'FORJAR PICARETA'):ready?'CONSTRUIR':'DEPOSITAR RECURSOS'}</button><details class="quiet-details"><summary>COMO FORJAR</summary><p>${pick?'O preço inclui moedas e todos os cristais da receita.':'Depósitos ficam salvos. Complete a receita para construir.'}</p></details>`}
 </section></div>`;
}
function generatePickaxePreview(level){return '<svg viewBox="0 0 100 110" role="img" aria-label="Picareta '+PICKAXE_STYLES[pickaxeTier(level)].name+'">'+assetSvgBody(generateAsset('pickaxe',{variant:pickaxeTier(level)}))+'</svg>';}
