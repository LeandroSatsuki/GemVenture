import {elementLayoutScale} from './ui-display.js';
import {confirmButtonResult} from './button-feedback.js';
import {SKILLS,RANKED_SKILLS,skillRank,skillText,skillUpgradeCost,learn,equip,upgradeSkill,canRebuild} from './core.js';
import {compactTalentNetwork,compactRank,compactConnected,compactCost,buyCompactTalent,refundCompactTalent,nextBranchMember} from './compact-talents.js';
import {TALENT_SECTORS,TALENT_EFFECTS,talentRank} from './talents.js';
import {progressionEffects,invalidateProgression} from './progression-effects.js';
import {skillPointCost} from './pillars.js';
import {approvedTalentNodeGlyph} from './talent-icons-v5.js';
import {approvedTalentSectorGlyph} from './approved-talent-icons.js';
import {positions,overview as approvedOverview,worldSize} from './approved-tree-geometry.js';
import {treeMarkup} from './approved-tree-markup.js';
import {serviceShadow} from './approved-service-host.js';
let lastTreeUi=null;
export function mountApprovedTree(dialog,state,{initialId,onChange,onSelect,onClose,onFeedback=()=>{},softMode=()=>false}){
const shadow=serviceShadow(dialog,treeMarkup);
const glyph=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replaceAll('currentColor','#edf4ff'));
const network=compactTalentNetwork(SKILLS),labels=['RITMO','CRÍTICOS','EXPLOSÕES','DEFESA','SAQUE','CRESCIMENTO'];
const centers=[[220,310],[620,310],[1020,310],[1020,690],[620,690],[220,690]];
const D={...worldSize,positions,overview:approvedOverview,icons:Object.fromEntries(network.nodes.map(n=>[n.id,glyph(approvedTalentNodeGlyph(n.members?.[0]||n))])),sectors:TALENT_SECTORS.map((s,i)=>({name:labels[i],color:s.color,icon:glyph(approvedTalentSectorGlyph(i)),cx:centers[i][0]*1.45,cy:centers[i][1]*.84+60}))};

const root=shadow.querySelector('#gv-ecos-study'),q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
const s=state;let selected=lastTreeUi?.selected||initialId||'ear',zoom=lastTreeUi?.zoom||.5,soft=softMode(),expanded=false;if(!D.positions[selected])selected='ear';
const net=compactTalentNetwork(SKILLS),byId=new Map(net.nodes.map(n=>[n.id,n])),nodeButtons=new Map();
const num=n=>Number(n.toFixed(2)).toLocaleString('pt-BR');
const maxRank=n=>n.kind==='root'?1:n.kind==='skill'?(RANKED_SKILLS.includes(n.id)?3:1):n.max;
const rank=n=>compactRank(s,n.id),isSoft=()=>soft||matchMedia('(prefers-reduced-motion: reduce)').matches;
const vp=q('#ecos-viewport'),world=q('#ecos-world'),space=q('#ecos-space');
const key=e=>[...e].sort().join('|'),primary=new Set(D.overview.map(key));
let dragged=false,drag=null,offsetX=0,offsetY=0,interacted=false;
function message(text){q('#ecos-result').textContent=text;}
function save(){interacted=true;lastTreeUi={selected,zoom,pan:{x:vp.scrollLeft,y:vp.scrollTop}};onSelect?.(selected);}
const restored=!!lastTreeUi;
function image(src,alt=''){const im=document.createElement('img');im.src=src;im.alt=alt;im.draggable=false;return im;}
function bump(el){if(!el||isSoft())return;el.getAnimations().forEach(a=>a.cancel());el.animate([{transform:'scale(1)'},{transform:'scale(1.14)',offset:.4},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});}
function flash(id){bump(nodeButtons.get(id)?.querySelector('img'));bump(q('#ecos-detail-icon'));if(isSoft())return;qa('.edge').filter(p=>p.dataset.a===id||p.dataset.b===id).forEach(p=>p.classList.add('gained'));}
function center(x,y){vp.scrollLeft=x*zoom+offsetX-vp.clientWidth/2;vp.scrollTop=y*zoom+offsetY-vp.clientHeight/2;}
function setZoom(z,point){const x=point?.x??(vp.scrollLeft+vp.clientWidth/2-offsetX)/zoom,y=point?.y??(vp.scrollTop+vp.clientHeight/2-offsetY)/zoom;zoom=Math.max(.32,Math.min(1.5,z));offsetX=Math.max(0,(vp.clientWidth-D.width*zoom)/2);offsetY=Math.max(0,(vp.clientHeight-D.height*zoom)/2);world.style.width=D.width+'px';world.style.height=D.height+'px';world.style.left=offsetX+'px';world.style.top=offsetY+'px';world.style.transform=`scale(${zoom})`;space.style.width=Math.max(vp.clientWidth,D.width*zoom)+'px';space.style.height=Math.max(vp.clientHeight,D.height*zoom)+'px';q('#ecos-edges').setAttribute('viewBox',`0 0 ${D.width} ${D.height}`);q('#ecos-edges').style.width=D.width+'px';q('#ecos-edges').style.height=D.height+'px';root.style.setProperty('--ecos-zoom',String(zoom));q('#ecos-zoom').textContent=Math.round(zoom*100)+'%';center(x,y);}
function overview(){setZoom(Math.min((vp.clientWidth-24)/D.width,(vp.clientHeight-24)/D.height),D.positions.root);}
D.sectors.forEach((sec,i)=>{const b=document.createElement('button');b.className='button sector cursor-interaction';b.style.setProperty('--sector',sec.color);b.setAttribute('aria-pressed','false');b.append(image(sec.icon),document.createTextNode(sec.name));b.onclick=()=>{const previous=selected;selected=net.nodes.find(n=>n.members&&n.sector===i).id;q('#ecos-secondary').hidden=true;message('');render();const points=net.nodes.filter(n=>n.kind!=='root'&&n.sector===i).map(n=>D.positions[n.id]);setZoom(.82,{x:(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2,y:(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2});save();if(selected!==previous)onFeedback('select',{id:selected});};q('#ecos-sectors').append(b);});
net.nodes.forEach(n=>{const p=D.positions[n.id],b=document.createElement('button');b.type='button';b.className='node '+n.kind+' cursor-interaction';b.dataset.node=n.id;b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.setProperty('--sector',D.sectors[n.sector].color);const im=image(n.kind==='root'?'assets/refuge-night-v3/gem-0.png':D.icons[n.id]);b.append(im);const r=document.createElement('span');r.className='node-rank';r.setAttribute('aria-hidden','true');b.append(r);const eq=document.createElement('span');eq.className='node-slot';eq.setAttribute('aria-hidden','true');b.append(eq);b.onclick=()=>{if(dragged)return;select(n.id);};b.ondblclick=e=>{e.preventDefault();if(dragged)return;selected=n.id;render();if(!q('#ecos-buy').disabled)purchase();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const v=e.key==='ArrowLeft'?[-1,0]:e.key==='ArrowRight'?[1,0]:e.key==='ArrowUp'?[0,-1]:[0,1];const closest=net.nodes.filter(m=>m.id!==n.id).map(m=>({m,dx:D.positions[m.id].x-p.x,dy:D.positions[m.id].y-p.y})).filter(a=>a.dx*v[0]+a.dy*v[1]>0).sort((a,b)=>(Math.hypot(a.dx,a.dy)+Math.abs(a.dx*v[1]-a.dy*v[0])*2)-(Math.hypot(b.dx,b.dy)+Math.abs(b.dx*v[1]-b.dy*v[0])*2))[0];if(closest){select(closest.m.id);nodeButtons.get(closest.m.id).focus({preventScroll:true});center(D.positions[closest.m.id].x,D.positions[closest.m.id].y);}};world.append(b);nodeButtons.set(n.id,b);});
function select(id){const changed=selected!==id;selected=id;q('#ecos-secondary').hidden=true;message('');render();save();if(changed)onFeedback('select',{id:selected});}
function drawEdges(){const svg=q('#ecos-edges');svg.replaceChildren();for(const [a,b]of net.edges){const isPrimary=primary.has(key([a,b])),adjacent=a===selected||b===selected;if(!isPrimary&&!adjacent)continue;const p=D.positions[a],r=D.positions[b],path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M${p.x},${p.y}L${r.x},${r.y}`);path.setAttribute('class','edge'+(compactRank(s,a)&&compactRank(s,b)?' lit':'')+(adjacent?' selected-link':'')+(!isPrimary?' secondary':''));path.style.setProperty('--edge',D.sectors[byId.get(adjacent?selected:b).sector].color);path.dataset.a=a;path.dataset.b=b;svg.append(path);}}
function metricValue(n,r){const def=TALENT_EFFECTS[n.effect];let value;if(n.members)value=n.members.reduce((sum,m)=>sum+m.amount*talentRank(s,m.id),0);else value=def.major*Math.log2(1+r);return Math.min(def.cap,value);}
function effect(n,r,max){const box=q('#ecos-effect');box.replaceChildren();if(n.kind==='root'){const p=document.createElement('p');p.textContent='Escolha sua próxima rota.';box.append(p);return;}if(n.kind==='skill'){const p=document.createElement('p');const skillDisplay=skillText(s,n.id,r||1);p.textContent=n.passive?skillDisplay.replace(/\s*Sempre ativa\.$/,''):skillDisplay;box.append(p);if(!max&&r>0){const next=skillText(s,n.id,r+1);if(next!==p.textContent){const more=document.createElement('p');more.className='submetric';const lead=p.textContent.split('. ')[0]+'. ';more.textContent='Próximo: '+(next.startsWith(lead)?next.slice(lead.length):next);box.append(more);}}return;}const def=TALENT_EFFECTS[n.effect],current=metricValue(n,r),target=n.members?nextBranchMember(s,n.id,SKILLS):null,next=max?current:n.members?Math.min(def.cap,current+(target?.amount||0)):Math.min(def.cap,def.major*Math.log2(2+r));const fmt=value=>num(value*(def.unit==='%'?100:1))+def.unit;const line=document.createElement('div');line.className='metric';const before=document.createElement('span');before.textContent=fmt(current);const arrow=document.createElement('span');arrow.textContent='→';const after=document.createElement('strong');after.textContent=fmt(next);line.append(before,arrow,after);box.append(line);if(n.kind==='mastery'){const p=document.createElement('p');p.className='submetric';p.textContent='Abismo +'+num(Math.log2(1+r)*3.5)+'% → +'+num(Math.log2(2+r)*3.5)+'% · ganhos decrescentes';box.append(p);}}
function render(){const n=byId.get(selected),r=rank(n),max=r>=maxRank(n),skill=n.kind==='skill',editable=canRebuild(s),connected=compactConnected(s,n.id,SKILLS),cost=n.kind==='root'||max||!connected?null:skill?(r?skillUpgradeCost(s,n.id).points:skillPointCost(n)):compactCost(s,n.id,SKILLS);root.style.setProperty('--sector',D.sectors[n.sector].color);soft=softMode();root.dataset.soft=String(isSoft());root.classList.toggle('is-expanded',expanded);q('#ecos-expand').textContent=expanded?'RECOLHER':'EXPANDIR';q('#ecos-expand').setAttribute('aria-pressed',String(expanded));q('#ecos-points').textContent=num(s.experience.points);q('#ecos-level').textContent='NV '+s.experience.level;q('#ecos-kind').textContent=n.kind==='root'?'ORIGEM':skill?(n.passive?'PASSIVA':D.sectors[n.sector].name):n.kind==='mastery'?'MAESTRIA':'BÔNUS · '+D.sectors[n.sector].name;q('#ecos-name').textContent=n.name;q('#ecos-detail-icon').src=n.kind==='root'?'assets/refuge-night-v3/gem-0.png':D.icons[n.id];effect(n,r,max);q('#ecos-rank').textContent=r+'/'+(maxRank(n)===Infinity?'∞':maxRank(n));q('#ecos-cost').style.visibility=cost===null?'hidden':'visible';q('#ecos-cost b').textContent=cost===null?'':cost+' PT';const progress=q('#ecos-progress');progress.style.visibility=maxRank(n)===Infinity?'hidden':'visible';progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(maxRank(n)===Infinity?Math.max(1,r+1):maxRank(n)));progress.setAttribute('aria-valuenow',String(r));progress.querySelector('span').style.width=(maxRank(n)===Infinity?0:r/maxRank(n)*100)+'%';const buy=q('#ecos-buy');buy.disabled=!editable||n.kind==='root'||max||!connected||s.experience.points<cost;buy.textContent=!editable?'AJUSTAR NO REFÚGIO':n.kind==='root'?'ESCOLHA UM NÓ':max?'MÁXIMO':!connected?'REQUER CONEXÃO':r?'MELHORAR':'APRENDER';const eq=q('#ecos-equip'),refund=q('#ecos-refund');eq.hidden=!skill;refund.hidden=skill;eq.style.visibility=skill&&r?'visible':'hidden';eq.disabled=n.passive||!editable||(!s.equipped.includes(n.id)&&s.equipped.length>=5);eq.textContent=n.passive?'SEMPRE ATIVA':s.equipped.includes(n.id)?'DESEQUIPAR':'EQUIPAR';eq.classList.toggle('is-passive',!!n.passive);refund.style.visibility=!skill&&r&&n.kind!=='root'?'visible':'hidden';refund.disabled=!!s.run;qa('.sector').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n.sector)));for(const m of net.nodes){const b=nodeButtons.get(m.id),value=rank(m),isMax=value>=maxRank(m);b.classList.toggle('owned',value>0);b.classList.toggle('reachable',compactConnected(s,m.id,SKILLS));b.setAttribute('aria-pressed',String(m.id===selected));b.setAttribute('aria-label',m.name+', '+value+'/'+(maxRank(m)===Infinity?'infinito':maxRank(m))+(s.equipped.includes(m.id)?', equipada':!value&&!compactConnected(s,m.id,SKILLS)?', requer conexão':''));const badge=b.querySelector('.node-rank');badge.textContent=m.kind==='root'?'':m.kind==='mastery'?'∞':isMax?'✓':value?String(value):'';badge.hidden=!badge.textContent;const slot=b.querySelector('.node-slot'),index=s.equipped.indexOf(m.id);slot.hidden=index<0;slot.textContent=index+1;}q('#ecos-map-status').textContent=D.sectors[n.sector].name;drawEdges();slots();}
function slots(){q('#ecos-build-count').textContent=s.equipped.length+'/5';const wrap=q('#ecos-slots');wrap.replaceChildren();for(let i=0;i<5;i++){const id=s.equipped[i],b=document.createElement('button');b.className='slot cursor-interaction';b.disabled=!id;b.setAttribute('aria-label',id?'Inspecionar '+byId.get(id).name:'Espaço vazio');if(id){b.append(image(D.icons[id]));const count=document.createElement('small');count.textContent=i+1;b.append(count);b.onclick=()=>{select(id);center(D.positions[id].x,D.positions[id].y);nodeButtons.get(id).focus({preventScroll:true});};}else b.textContent='+';wrap.append(b);}}
function purchase(){const n=byId.get(selected),r=rank(n);if(q('#ecos-buy').disabled)return;const ok=n.kind==='skill'?(r?upgradeSkill(s,n.id):learn(s,n.id)):buyCompactTalent(s,n.id,SKILLS);if(!ok){message('Requisitos não atendidos.');onFeedback('deny',{id:selected});return;}invalidateProgression(s);render();message('✓ '+(r?'Nível '+rank(n):'Aprendido'));flash(n.id);save();onChange(selected);confirmButtonResult(q('#ecos-buy'),'craft');onFeedback('reward',{id:selected,operation:r?'upgrade':'learn'});}
q('#ecos-buy').onclick=purchase;
q('#ecos-equip').onclick=()=>{if(q('#ecos-equip').disabled)return;if(equip(s,selected)){render();message(s.equipped.includes(selected)?'✓ Equipado':'✓ Espaço liberado');save();onChange(selected);confirmButtonResult(q('#ecos-equip'),s.equipped.includes(selected)?'set':'unset');onFeedback(s.equipped.includes(selected)?'set':'unset',{id:selected});}};
q('#ecos-refund').onclick=()=>{if(q('#ecos-refund').disabled)return;if(refundCompactTalent(s,selected,SKILLS)){invalidateProgression(s);render();message('✓ Ponto devolvido');save();onChange(selected);confirmButtonResult(q('#ecos-refund'),'refund');onFeedback('refund',{id:selected});}else{message('Este nó sustenta outros nós.');onFeedback('deny',{id:selected});}};

let secondaryOpener=null;function secondary(title){secondaryOpener=document.activeElement;q('#ecos-secondary-title').textContent=title;q('#ecos-secondary-body').replaceChildren();q('#ecos-secondary').hidden=false;q('#ecos-secondary-close').focus({preventScroll:true});return q('#ecos-secondary-body');}
q('#ecos-secondary-close').onclick=()=>{q('#ecos-secondary').hidden=true;secondaryOpener?.focus({preventScroll:true});};
q('#ecos-minus').onclick=()=>{setZoom(zoom-.15);save();};q('#ecos-plus').onclick=()=>{setZoom(zoom+.15);save();};q('#ecos-origin').onclick=()=>{center(D.positions.root.x,D.positions.root.y);save();};q('#ecos-overview').onclick=()=>{overview();save();};q('#ecos-expand').onclick=()=>{expanded=!expanded;render();save();};q('#ecos-help').onclick=()=>q('#ecos-help-panel').hidden=!q('#ecos-help-panel').hidden;
vp.oncontextmenu=e=>e.preventDefault();vp.onauxclick=e=>{if(e.button===1)e.preventDefault();};vp.onpointerdown=e=>{if(![0,1,2].includes(e.button))return;e.preventDefault();dragged=false;drag={x:e.clientX,y:e.clientY,sx:vp.scrollLeft,sy:vp.scrollTop,scale:elementLayoutScale(vp)};if(e.button===1)vp.setPointerCapture(e.pointerId);};vp.onpointermove=e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){dragged=true;vp.classList.add('is-dragging');vp.setPointerCapture(e.pointerId);vp.scrollLeft=drag.sx-(e.clientX-drag.x)/drag.scale;vp.scrollTop=drag.sy-(e.clientY-drag.y)/drag.scale;}};vp.onpointerup=vp.onpointercancel=()=>{const moved=dragged;drag=null;vp.classList.remove('is-dragging');setTimeout(()=>{dragged=false;},0);if(moved)save();};
q('#ecos-close').onclick=onClose;root.addEventListener('keydown',e=>{if(e.key==='Escape'){q('#ecos-secondary').hidden=true;q('#ecos-help-panel').hidden=true;}});
render();setZoom(zoom);if(restored){const pan=lastTreeUi?.pan;if(pan){vp.scrollLeft=pan.x;vp.scrollTop=pan.y;}}else overview();
const resizeObserver=new ResizeObserver(()=>{if(!drag){if(!restored&&!interacted)overview();else setZoom(zoom);}});resizeObserver.observe(vp);
// A node, its connections and accumulated bonuses share one stable side inspector.
function inspectorOpen(open=true){root.classList.toggle('is-inspector-open',open);q('#ecos-inspector-toggle').setAttribute('aria-expanded',String(open));}
function updateInspectorTabs(){
 const extra=!q('#ecos-secondary').hidden,title=q('#ecos-secondary-title').textContent;
 q('#ecos-node-view').setAttribute('aria-pressed',String(!extra));
 q('#ecos-buffs').setAttribute('aria-pressed',String(extra&&title==='BUFFS'));
 for(const child of q('#ecos-detail').children)if(child.id!=='ecos-secondary')child.inert=extra;
}
function nodeView(){q('#ecos-secondary').hidden=true;updateInspectorTabs();}
const renderOriginal=render;
render=function(){renderOriginal();updateInspectorTabs();};
const selectOriginal=select;
select=function(id){selectOriginal(id);inspectorOpen();};
const secondaryOriginal=secondary;
secondary=function(title){const body=secondaryOriginal(title);updateInspectorTabs();return body;};
q('#ecos-node-view').onclick=()=>{nodeView();inspectorOpen();};
q('#ecos-secondary-close').onclick=()=>{nodeView();secondaryOpener?.focus({preventScroll:true});};
q('#ecos-inspector-toggle').onclick=()=>inspectorOpen(!root.classList.contains('is-inspector-open'));
q('#ecos-inspector-close').onclick=()=>{inspectorOpen(false);q('#ecos-inspector-toggle').focus({preventScroll:true});};
qa('.sector').forEach(button=>{const choose=button.onclick;button.onclick=()=>{choose();inspectorOpen();};});
root.addEventListener('keydown',e=>{if(e.key==='Escape')updateInspectorTabs();});
q('#ecos-buffs').onclick=()=>{
 const body=secondary('BUFFS'),totals=progressionEffects(s),seen=new Set();let count=0;
 function group(label,icon,keys){
  const active=keys.filter(id=>TALENT_EFFECTS[id]&&totals[id]>0);if(!active.length)return;
  const section=document.createElement('section');section.className='totals-group';
  const heading=document.createElement('div');heading.className='totals-heading';heading.append(image(icon),document.createTextNode(label));section.append(heading);
  for(const id of active){seen.add(id);const def=TALENT_EFFECTS[id],row=document.createElement('div');row.className='total-row';const name=document.createElement('span'),value=document.createElement('strong');name.textContent=def.name;value.textContent='+'+num(totals[id]*(def.unit==='%'?100:1))+def.unit;row.append(name,value);section.append(row);count++;}
  body.append(section);
 }
 TALENT_SECTORS.forEach((sector,i)=>group(D.sectors[i].name,D.sectors[i].icon,sector.effects));
 group('ABISMO','assets/refuge-night-v3/gem-0.png',Object.keys(TALENT_EFFECTS).filter(id=>!seen.has(id)));
 if(!count){const empty=document.createElement('p');empty.textContent='Nenhum buff aplicado.';body.append(empty);}
 inspectorOpen();
};

updateInspectorTabs();

return ()=>{save();resizeObserver.disconnect();root.getAnimations({subtree:true}).forEach(a=>a.cancel());};
}
