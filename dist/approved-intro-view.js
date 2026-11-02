import {prepareStyledSurface} from './styled-surface.js';
import {introCopy} from './approved-intro-copy.js';
import {drawLobbyPlayer} from './player-appearance.js';
import {elementLayoutScale,normalizePopupViewport} from './ui-display.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n));
export function findIntroTarget(document,selector){
 if(!selector)return null;
 const roots=[document,...[...document.querySelectorAll('.approved-service-host')].map(n=>n.shadowRoot).filter(Boolean)];
 for(const root of roots)for(const node of root.querySelectorAll(selector))if(node.getClientRects().length&&!node.closest('[hidden]'))return node;
 return null;
}
export function introTargetClicked(event,selector){return !!selector&&(event.composedPath?.()||[event.target]).some(node=>node?.matches?.(selector)||node?.closest?.(selector));}
export function createApprovedIntroView({document,onNext,onSkip,profile}){
 const win=document.defaultView,root=document.createElement('div');root.id='refugeWelcome';root.className='approved-intro approved-service-host';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','Primeira expedição');
 const popover=typeof root.showPopover==='function';if(popover)root.setAttribute('popover','manual');
 if(!document.getElementById('approvedIntroFonts')){const font=document.createElement('style');font.id='approvedIntroFonts';font.textContent="@font-face{font-family:GVIntroDisplay;src:url('assets/menu-fonts/Fredoka-600-Static.ttf');font-weight:600}@font-face{font-family:GVIntroBody;src:url('assets/menu-fonts/Nunito-600-Static.ttf');font-weight:600}";document.head.append(font);}
 const shadow=root.attachShadow({mode:'open'}),style=document.createElement('link');style.rel='stylesheet';style.href='approved-intro-ui.css';shadow.append(style);prepareStyledSurface(root,shadow);
 const content=document.createElement('div');content.innerHTML='<div class="ip-shade"></div>'.repeat(4)+'<div class="ip-ring" hidden></div><div id="gv-primeiros-passos"><section class="ip-window" aria-label="Apresentação guiada"><header class="ip-head"><img src="assets/hud-v5/home.png" alt=""><h2>Primeira expedição</h2><button type="button" class="ip-button ip-skip" aria-label="Pular apresentação">Pular</button></header><div class="ip-hero"><div class="ip-actor" aria-hidden="true"><canvas width="360" height="424"></canvas></div><article class="ip-speech"><div class="ip-heading"><h3 tabindex="-1"></h3><button type="button" class="ip-button ip-info" aria-label="Ver fala completa" aria-expanded="false">i</button></div><p class="ip-copy" aria-live="polite"></p></article></div><form class="ip-controls" novalidate><label class="ip-name">Seu nome<input id="minerName" name="minerName" maxlength="24" autocomplete="nickname" placeholder="Nome de minerador" aria-label="Seu nome de minerador" required></label><div class="ip-progress" hidden><span class="ip-count"></span><div class="ip-track" role="progressbar" aria-label="Etapa da apresentação" aria-valuemin="1"><i></i></div></div><small class="ip-error" role="alert" hidden></small><button type="submit" class="ip-button ip-primary" data-primary="true"><span>Próximo</span><span aria-hidden="true">›</span></button><div class="ip-point" hidden aria-hidden="true">↗</div></form></section></div>';
 shadow.append(...content.childNodes);document.body.append(root);
 const q=s=>shadow.querySelector(s),surface=q('#gv-primeiros-passos'),ring=q('.ip-ring'),shades=[...shadow.querySelectorAll('.ip-shade')],form=q('form'),canvas=q('canvas');let current=null,expanded=false,last='',resolveTarget=()=>null;
 form.onsubmit=e=>{e.preventDefault();if(!current?.entry.click)onNext();};q('.ip-skip').onclick=onSkip;
 q('.ip-info').onclick=()=>{expanded=!expanded;q('.ip-info').setAttribute('aria-expanded',String(expanded));q('.ip-info').setAttribute('aria-label',expanded?'Ver fala resumida':'Ver fala completa');q('.ip-copy').textContent=introCopy(current.entry,expanded);layout();};
 function mount(){const modal=[...document.querySelectorAll('dialog[open]')].find(n=>n.id!=='returnDialog'),parent=modal||document.body;if(root.parentElement!==parent){if(popover&&root.matches(':popover-open'))root.hidePopover();parent.append(root);}if(popover&&!root.matches(':popover-open'))root.showPopover();normalizePopupViewport(root);}
 function layout(){
  if(root.hidden)return;mount();const W=win.innerWidth,H=win.innerHeight,target=resolveTarget(),r=target?.getBoundingClientRect();
  const usable=r&&r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<W&&r.top<H;
  const b=usable?{x:clamp(r.left-7,0,W),y:clamp(r.top-7,0,H),right:clamp(r.right+7,0,W),bottom:clamp(r.bottom+7,0,H)}:null;
  const boxes=b?[[0,0,W,b.y],[0,b.y,b.x,b.bottom-b.y],[b.right,b.y,W-b.right,b.bottom-b.y],[0,b.bottom,W,H-b.bottom]]:[[0,0,W,H],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  shades.forEach((s,i)=>{const [x,y,w,h]=boxes[i];Object.assign(s.style,{left:x+'px',top:y+'px',width:Math.max(0,w)+'px',height:Math.max(0,h)+'px'});});ring.hidden=!b;
  if(b)Object.assign(ring.style,{left:b.x+'px',top:b.y+'px',width:(b.right-b.x)+'px',height:(b.bottom-b.y)+'px'});
  const s=elementLayoutScale(surface),rect=surface.getBoundingClientRect(),pw=rect.width,ph=rect.height;let x=(W-pw)/2,y=(H-ph)/2;
  if(b){
   if(b.right+pw+30<W){x=b.right+18;y=b.y;}
   else if(b.x-pw-18>12){x=b.x-pw-18;y=b.y;}
   else if(b.bottom+ph+30<H){x=(W-pw)/2;y=b.bottom+18;}
   else if(b.y-ph-18>12){x=(W-pw)/2;y=b.y-ph-18;}
   else{x=12;y=H-ph-12;}
  }
  surface.style.left=clamp(x,12,W-pw-12)/s+'px';surface.style.top=clamp(y,12,H-ph-12)/s+'px';
  const soft=document.body.classList.contains('soft-fx')||win.matchMedia('(prefers-reduced-motion:reduce)').matches;surface.dataset.soft=String(soft);
  const c=canvas.getContext('2d');c.clearRect(0,0,360,424);drawLobbyPlayer(c,profile(),180,414,410,win.performance.now()/1000,{reduced:soft});
 }
 function render(model,{target=()=>null}={}){
  if(!model.active){if(popover&&root.matches(':popover-open'))root.hidePopover();root.hidden=true;last='';current=null;return;}
  current=model;resolveTarget=target;root.hidden=false;mount();const e=model.entry,changed=last!==e.id;
  if(changed){last=e.id;expanded=false;q('.ip-info').setAttribute('aria-expanded','false');q('.ip-info').setAttribute('aria-label','Ver fala completa');surface.classList.remove('ip-respond');void surface.offsetWidth;surface.classList.add('ip-respond');}
  root.dataset.step=e.id;surface.dataset.context=String(!['hello','story'].includes(e.id));q('h2').textContent=e.id.startsWith('relic-')?'Relicário':'Primeira expedição';q('h3').textContent=e.id==='story'&&profile().journey.name?'Prazer, '+profile().journey.name+'!':e.title;q('.ip-copy').textContent=introCopy(e,expanded);
  q('.ip-name').hidden=!e.name;q('.ip-progress').hidden=!!e.name;q('.ip-primary').hidden=!!e.click;q('.ip-primary span').textContent=e.name?'Vamos nessa':model.last?e.id.startsWith('relic-')?'Concluir':'Vamos explorar':'Próximo';q('.ip-point').hidden=!e.click;
  q('.ip-count').textContent=model.index+1+' / '+model.total;const track=q('.ip-track');track.setAttribute('aria-valuenow',String(model.index+1));track.setAttribute('aria-valuemax',String(model.total));q('.ip-track i').style.width=(model.index+1)/model.total*100+'%';
  q('.ip-error').hidden=true;form.elements.minerName.removeAttribute('aria-invalid');if(changed&&e.click)resolveTarget()?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'instant'});layout();if(changed&&!e.name)q('h3').focus({preventScroll:true});
 }
 function focusables(scope){const result=[...scope.querySelectorAll('button,input,select,[tabindex="0"]')];for(const h of scope.querySelectorAll('.approved-service-host'))if(h.shadowRoot)result.push(...focusables(h.shadowRoot));return result.filter(n=>!n.disabled&&n.getClientRects().length);}
 const key=e=>{if(root.hidden)return;const path=e.composedPath?.()||[e.target],target=resolveTarget();if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();onSkip();return;}if(e.repeat&&['Space','Enter'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();return;}if(e.key==='Tab'){
  const list=[...focusables(shadow),...(target?.matches('button,input,select,[tabindex="0"]')?[target]:target?focusables(target):[])];let active=document.activeElement;while(active?.shadowRoot?.activeElement)active=active.shadowRoot.activeElement;const i=list.indexOf(active);if(list.length){e.preventDefault();e.stopImmediatePropagation();list[(i+(e.shiftKey?-1:1)+list.length)%list.length].focus();}return;
 }if(!path.includes(root)&&!path.includes(target)){e.preventDefault();e.stopImmediatePropagation();}};
 document.addEventListener('keydown',key,true);
 return {root,form,render,layout,live(text){q('.ip-error').textContent=text;q('.ip-error').hidden=false;form.elements.minerName.setAttribute('aria-invalid','true');layout();},destroy(){document.removeEventListener('keydown',key,true);root.remove();}};
}
