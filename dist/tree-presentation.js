import {SKILLS} from './core.js';
import {TALENT_SECTORS} from './talents.js';
import {approvedSkillSlotGlyph} from './talent-icons-v5.js';
import {icons} from './tree-icons.js';
import {applyTreeProjection} from './tree-layout.js';

const svgIcon=(name)=>icons[name].replace('<svg ','<svg aria-hidden="true" focusable="false" ');
// Coordination-approved labels for this screen only; domain sectors remain intact.
const sectorLabels=['RITMO','CRÍTICOS','EXPLOSÕES','DEFESA','SAQUE','CRESCIMENTO'];
export function decorateTreeFrame(dialog) {
  applyTreeProjection(dialog);
  dialog.querySelectorAll('.web-sectors [data-sector]').forEach(button=>{
    const label=sectorLabels[Number(button.dataset.sector)];
    if(!label)return;
    for(const child of [...button.childNodes])if(child.nodeType===3)child.remove();
    button.querySelector('.tree-sector-label')?.remove();
    const text=button.ownerDocument.createElement('span');
    text.className='tree-sector-label';text.textContent=label;button.append(text);
    button.setAttribute('aria-label',label);button.title=label;
    button.querySelector('svg')?.setAttribute('aria-hidden','true');
  });
  const header=dialog.querySelector('.dialog-top');
  const points=dialog.querySelector('.web-points');
  const top=dialog.querySelector('.web-top');
  if(points){
    points.querySelector('b').textContent=points.querySelector('b').textContent.replace('✦','').trim();
    points.insertAdjacentHTML('afterbegin',`<span class="tree-points-icon">${svgIcon('points-gold-star')}</span>`);
    header.insertBefore(points,dialog.querySelector('#close'));
  }
  if(top)top.hidden=true;
  const center=dialog.querySelector('#webCenter');
  center.innerHTML=svgIcon('origin-reticle')+'<span>ORIGEM</span>';
  const root=dialog.querySelector('.web-node.root');
  root.querySelector('svg')?.remove();
  root.insertAdjacentHTML('afterbegin','<img class="tree-origin-art" src="assets/refuge-night-v3/gem-0.png" alt="" draggable="false">');
  dialog.querySelector('.web-map-legend').innerHTML=`<span><i class="tree-legend-dot"></i>BÔNUS</span><span><i class="tree-legend-dot" data-legend-kind="milestone" aria-hidden="true"></i>MARCO</span><span><i class="tree-legend-dot" data-legend-kind="ability" aria-hidden="true"></i>HABILIDADE</span><span class="max-mark">${svgIcon('legend-max-crown')}MÁXIMO</span><span class="mastery-mark">${svgIcon('legend-mastery-star')}MAESTRIA</span>`;
}

export function decorateTreeDetail(root,s,n) {
  const detail=root.querySelector('#webDetail');
  detail.style.setProperty('--tree-selection-color',TALENT_SECTORS[n.sector].color);
  // Ownership and accessibility remain driven exclusively by TalentView.
  root.querySelectorAll('[data-talent]').forEach(button=>{
    const locked=button.dataset.talent!=='root'&&!button.classList.contains('owned')&&!button.classList.contains('reachable');
    button.classList.toggle('tree-locked',locked);
    button.querySelector('.tree-lock')?.remove();
    const label=button.getAttribute('aria-label').replace(/, bloqueado$/,'');
    const title=button.title.replace(/ · BLOQUEADO$/,'');
    button.setAttribute('aria-label',label+(locked?', bloqueado':''));
    button.title=title+(locked?' · BLOQUEADO':'');
    // One contained lock only on locked milestones. Other nodes keep dim glyphs.
    if(locked&&button.classList.contains('notable'))button.insertAdjacentHTML('beforeend',`<span class="tree-lock" aria-hidden="true">${svgIcon('locked-node-lock')}</span>`);
  });
  const build=root.querySelector('.web-build');if(!build)return;
  build.querySelector('.tree-build-slots')?.remove();
  const slots=document.createElement('div');
  slots.className='tree-build-slots';
  slots.setAttribute('aria-label','Habilidades equipadas');
  for(let i=0;i<5;i++){
    const id=s.equipped[i]??null;
    const slot=document.createElement('span');
    slot.className='tree-build-slot';
    const name=id?SKILLS.find(skill=>skill.id===id).name:'Espaço vazio';
    slot.title=name; slot.setAttribute('aria-label',name);slot.setAttribute('role','img');
    slot.innerHTML=approvedSkillSlotGlyph(id);
    slots.append(slot);
  }
  build.querySelector('b').after(slots);
}
