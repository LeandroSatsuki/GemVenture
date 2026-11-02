import {confirmButtonResult} from './button-feedback.js';
import {forgeProject,forgeEffects,FORGE_CAP,depositForge,craftForge,depositEquipment} from './forge.js';
import {upgradeCost,coreCost,power,maxHealth,purchaseUpgrade,purchaseCore} from './core.js';
import {MATERIALS,pickRecipe,wellRecipe,canPayMaterials} from './materials.js';
import {buildingUpgrade,upgradeBuilding,buildingLevel} from './village.js';
import {PICKAXE_STYLES,pickaxeTier,nextPickaxeStyle} from './pickaxe-style.js';
import {serviceShadow} from './approved-service-host.js';
const projects=[['pickaxe','Picareta','pickaxe-v01-256.png','FORÇA'],['vigor','Vida','life-heart-reuse.png','VIDA'],['anvil','Bigorna','anvil-v05-attempt-3-256.png','FORÇA'],['tonic','Poções','alembic-v06-256.png','CURA'],['vault','Cofre','safe-v06-256.png','RESGATE']];
const fmt=n=>Number(n.toFixed(2)).toLocaleString('pt-BR');
const coin='assets/descent-choice/summary/coin.png';
const gem=i=>'assets/refuge-night-v3/gem-'+i+'.png';
const art=p=>'assets/forge-v6/'+p[2];
export function mountApprovedForge(dialog,s,{initialId='pickaxe',onChange,onSelect,onClose,beforeAction=()=>false,softMode=()=>false}){
 let selected=projects.some(p=>p[0]===initialId)?initialId:'pickaxe',busy=false,buildingOpen=false,completed=null;
 const costCell=(i,prefix)=>`<div class="cost-cell" id="${prefix}-${i}" style="--material:${MATERIALS[i].color}"><img src="${gem(i)}" alt="${MATERIALS[i].name}"><b class="count"></b><span class="check" aria-hidden="true"></span><div class="track" role="progressbar"><span class="fill"></span></div></div>`;
 const funding=(id)=>`<div class="funding"><img src="${coin}" alt="Moedas"><div class="track coin-track" id="${id}" role="progressbar"><span class="fill"></span><b></b></div></div>`;
 const shadow=serviceShadow(dialog,`<div id="gv-ecos-study" class="forge-service"><section class="scene"><div class="window">
 <header class="head"><div class="place"><img src="assets/village-hept32/forge.png" alt=""><h2>FORJA</h2></div><div class="wallet"><img id="bank-icon" src="${coin}" alt="Moedas guardadas"><strong id="bank"></strong></div><button id="forge-close" class="button close" aria-label="Fechar Forja">×</button></header>
 <div class="forge-toolbar"><div class="stock">${MATERIALS.map((m,i)=>`<span><img id="stock-${i}" src="${gem(i)}" alt="${m.name}"><b id="stock-value-${i}"></b></span>`).join('')}</div>
 <div class="building-slot"><button class="button building-trigger" id="building-trigger" aria-expanded="false">MELHORAR FORJA <small id="building-level"></small></button>
 <section class="building-panel" id="building-panel" aria-label="Melhoria da Forja" hidden><header><h3>FORJA</h3><button id="building-close" class="button close" aria-label="Fechar melhoria">×</button></header><div class="stat"><b id="building-rank"></b><span id="building-effect"></span></div><div class="costs building-costs">${MATERIALS.map((m,i)=>costCell(i,'building-cost')).join('')}</div>${funding('building-money')}<button id="building-confirm" class="button primary">CONCLUIR</button><div id="building-result" class="result" role="status"></div></section></div></div>
 <nav class="sectors forge-nav" aria-label="Projetos da Forja">${projects.map(p=>`<button class="button sector" data-forge="${p[0]}"><img src="${art(p)}" alt="">${p[1]}</button>`).join('')}</nav>
 <div class="forge-layout"><section class="forge-picture"><img src="assets/forge-v6/workshop.png" alt="Oficina da Forja"><div class="forge-project-name"><img id="project-art" alt=""><div><h3 id="project-name"></h3><span id="project-rank"></span></div></div></section>
 <section class="forge-recipe"><div class="stat"><b id="effect-label"></b><span class="stat-values"><b id="effect-before"></b><span id="effect-arrow">→</span><strong id="effect-after"></strong></span></div>
 <div id="costs" class="costs">${MATERIALS.map((m,i)=>costCell(i,'cost')).join('')}</div>${funding('project-money')}
 <button id="forgeAction" class="button primary">CONTRIBUIR</button><details class="forge-help"><summary>COMO FORJAR</summary><p id="forge-help"></p><ul>${MATERIALS.map((m,i)=>`<li><img src="${gem(i)}" alt="${m.name}">${m.use}</li>`).join('')}</ul></details><div class="result" id="forge-result" role="status" aria-live="polite"></div></section></div>
 </div></section></div>`);
 const root=shadow.querySelector('#gv-ecos-study'),q=selector=>root.querySelector(selector),qa=selector=>[...root.querySelectorAll(selector)],soft=()=>softMode()||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function current(){
  const equipment=['pickaxe','vigor'].includes(selected),vigor=selected==='vigor',rank=equipment?(vigor?s.core:s.level):forgeProject(s,selected).level;
  if(!equipment)return {...forgeProject(s,selected),equipment,rank};
  const max=rank>=FORGE_CAP,cost=max?0:vigor?coreCost(s):upgradeCost(s),recipe=max?[0,0,0,0]:vigor?wellRecipe(s):pickRecipe(s),invested=s.forge?.funds?.[selected]||0;
  return {equipment,rank,complete:max,cost,recipe,invested,remaining:Math.max(0,cost-invested),ready:!max&&invested===cost&&canPayMaterials(s,recipe),locked:false};
 }
 function bar(el,amount,total,label){const pct=total?Math.min(100,amount/total*100):0;el.setAttribute('aria-label',label);el.setAttribute('aria-valuemin','0');el.setAttribute('aria-valuemax',String(total));el.setAttribute('aria-valuenow',String(amount));el.querySelector('.fill').style.width=pct+'%';}
 function cell(prefix,i,amount,total){const el=q('#'+prefix+'-'+i);el.hidden=!total;el.querySelector('.count').textContent=fmt(amount)+'/'+fmt(total);el.querySelector('.check').textContent=amount>=total?'✓':'';bar(el.querySelector('.track'),amount,total,MATERIALS[i].name+': '+amount+' de '+total);}
 function buildingRender(){
  const p=completed||buildingUpgrade(s,'forge');q('#building-level').textContent='NV. '+buildingLevel(s,'forge');q('#building-rank').textContent='NV. '+p.level+(p.max?'':' → '+(p.level+1));
  q('#building-effect').textContent=fmt((p.level-1)*2)+'% → '+fmt(Math.min(9,p.level)*2)+'%';
  for(let i=0;i<4;i++)cell('building-cost',i,completed?p.recipe[i]:Math.min(s.materials[i],p.recipe[i]),p.recipe[i]);
  bar(q('#building-money'),completed?p.cost:Math.min(s.bank,p.cost),p.cost,'Moedas para melhoria da Forja');q('#building-money b').textContent=fmt(completed?p.cost:Math.min(s.bank,p.cost))+'/'+fmt(p.cost);
  q('#building-confirm').disabled=!!completed||!p.ready;q('#building-confirm').textContent=completed?'✓ CONCLUÍDO':p.max?'MÁXIMO':'CONCLUIR';q('#building-result').textContent=completed?'✓ NV. '+buildingLevel(s,'forge'):'';
 }
 function render(){
  root.dataset.soft=String(soft());const p=current(),def=projects.find(v=>v[0]===selected),vigor=selected==='vigor';q('#bank').textContent=fmt(s.bank);MATERIALS.forEach((m,i)=>q('#stock-value-'+i).textContent=fmt(s.materials[i]));
  qa('[data-forge]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.forge===selected));b.style.setProperty('--sector','var(--gv-select)');});
  q('#project-art').src=art(def);q('#project-name').textContent=selected==='pickaxe'?PICKAXE_STYLES[pickaxeTier(s.level)].name:def[1];q('#project-rank').textContent='NV. '+p.rank+' / '+FORGE_CAP;
  const before=forgeEffects(s),after=forgeEffects({...s,level:s.level+(selected==='pickaxe'?1:0),core:s.core+(vigor?1:0)}),value=selected==='pickaxe'?power(s):vigor?maxHealth(s):selected==='anvil'?p.rank*.5:selected==='tonic'?p.rank*.6:50+p.rank*.25;
  const next=selected==='pickaxe'?value+after.power-before.power:vigor?value+after.health-before.health:selected==='anvil'?value+.5:selected==='tonic'?value+.6:value+.25,suffix=p.equipment?'':'%';
  q('#effect-label').textContent=def[3];q('#effect-before').textContent=fmt(value)+suffix;q('#effect-after').textContent=fmt(p.complete?value:next)+suffix;q('#effect-arrow').hidden=p.complete;q('#effect-after').hidden=p.complete;
  q('#costs').hidden=p.complete;qa('.forge-recipe>.funding').forEach(n=>n.hidden=p.complete);
  for(let i=0;i<4;i++)cell('cost',i,p.equipment?Math.min(s.materials[i],p.recipe[i]):p.materials[i],p.recipe[i]);
  bar(q('#project-money'),p.invested,p.cost,'Moedas depositadas');q('#project-money b').textContent=fmt(p.invested)+'/'+fmt(p.cost);
  const canFeed=p.equipment?p.remaining>0&&s.bank>0:p.remaining>0&&s.bank>0||p.missing.some((n,i)=>n>0&&s.materials[i]>0);
  q('#forgeAction').disabled=busy||!!s.run||p.complete||p.locked||!p.ready&&!canFeed;q('#forgeAction').textContent=p.complete?'MÁXIMO':p.locked?'ANDAR '+p.required:p.ready?(p.equipment?'FORJAR':'CONCLUIR'):p.equipment&&p.invested>=p.cost?'FORJAR':'CONTRIBUIR';
  const nextStyle=selected==='pickaxe'?nextPickaxeStyle(s.level):null;q('#forge-help').textContent=(p.equipment?'As moedas depositadas ficam guardadas. Os cristais são consumidos ao forjar.':'Contribuições de moedas e cristais ficam guardadas até concluir.')+(nextStyle?' Novo visual no nível '+nextStyle.level+'.':'');
  buildingRender();
 }
 function bump(el){if(soft())return;el.animate([{transform:'scale(1)'},{transform:'scale(1.12)',offset:.4},{transform:'scale(1)'}],{duration:280,easing:'ease-out'});}
 function clearFlights(){shadow.querySelectorAll('.forge-flight').forEach(n=>{n.getAnimations().forEach(a=>a.cancel());n.remove();});}
 function flight(image,target){if(soft())return;const a=image.getBoundingClientRect(),b=target.getBoundingClientRect(),node=image.cloneNode();node.className='forge-flight';node.removeAttribute('id');node.style.left=a.x+'px';node.style.top=a.y+'px';shadow.append(node);node.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${b.x-a.x+b.width/2-14}px,${b.y-a.y+b.height/2-14}px) scale(.6)`,opacity:0}],{duration:460,easing:'ease-out'}).finished.catch(()=>{}).finally(()=>node.remove());}
 function setBuilding(open,restore=false){buildingOpen=open;if(open){completed=null;buildingRender();}q('#building-panel').hidden=!open;q('#building-trigger').setAttribute('aria-expanded',String(open));if(open)q('#building-close').focus({preventScroll:true});else if(restore)q('#building-trigger').focus({preventScroll:true});}
 q('#building-trigger').onclick=()=>setBuilding(!buildingOpen,true);q('#building-close').onclick=()=>setBuilding(false,true);
 q('#building-confirm').onclick=e=>{if(e.detail>1||completed||busy)return;const p=buildingUpgrade(s,'forge');if(!p.ready)return;busy=true;try{if(!upgradeBuilding(s,'forge'))return;completed=p;onChange('building');busy=false;render();confirmButtonResult(q('#building-confirm'),'building');bump(q('.place>img'));}finally{busy=false;}};
 root.addEventListener('pointerdown',e=>{if(buildingOpen&&!q('.building-slot').contains(e.target))setBuilding(false);});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&buildingOpen){e.preventDefault();e.stopPropagation();setBuilding(false,true);}},true);
 qa('[data-forge]').forEach(b=>b.onclick=()=>{if(busy)return;clearFlights();setBuilding(false);selected=b.dataset.forge;onSelect?.(selected);q('#forge-result').textContent='';render();});
 q('#forgeAction').onclick=e=>{
  if(e.detail>1||busy||q('#forgeAction').disabled||beforeAction())return;const p=current(),before={bank:s.bank,materials:[...s.materials]};let ok=false;busy=true;
  try{if(p.equipment)ok=p.ready?(selected==='pickaxe'?purchaseUpgrade(s):purchaseCore(s)):depositEquipment(s,selected)>0;else ok=p.ready?craftForge(s,selected):depositForge(s,selected,Math.max(1000,Math.ceil(p.cost/4)))>0;if(!ok)return;onChange(p.ready?'craft':'deposit');busy=false;render();q('#forge-result').textContent=p.ready?'✓ NV. '+current().rank:'✓ Depositado';confirmButtonResult(q('#forgeAction'),p.ready?'craft':'deposit');if(p.ready)bump(q('#project-art'));else{if(before.bank>s.bank)flight(q('#bank-icon'),q('#project-money'));before.materials.forEach((n,i)=>{if(n>s.materials[i]){flight(q('#stock-'+i),q('#cost-'+i));bump(q('#cost-'+i+' img'));}});}}
  finally{busy=false;}
 };
 q('#forge-close').onclick=onClose;render();
 return ()=>{root.getAnimations({subtree:true}).forEach(a=>a.cancel());clearFlights();};
}
