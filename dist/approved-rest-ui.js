import {CAMP_OFFERS,buyCamp,maxHealth,maxRhythm,canRebuild} from './core.js';
import {comboColor} from './gamefeel-v5.js';
import {HUD_ART} from './hud-art-registry.js';
import {confirmButtonResult} from './button-feedback.js';
import {serviceShadow} from './approved-service-host.js';
import {restMarkup} from './approved-rest-markup.js';

function installRestShell(doc){if(doc.querySelector('link[data-approved-rest-shell]'))return;const link=doc.createElement('link');link.rel='stylesheet';link.href='approved-rest-shell.css';link.dataset.approvedRestShell='';doc.head.append(link);}
if(typeof document!=='undefined')installRestShell(document);

// Presentation eligibility mirrors the current domain; buyCamp owns the transaction.
export function restServiceView(profile){
 const r=profile?.run,recovery=!!r?.recovery?.active;
 if(!r||!recovery&&!r.rest?.active)return null;
 const healthLimit=maxHealth(profile);
 return {recovery,floor:r.floor,health:r.health,rhythm:r.rhythm,maxHealth:healthLimit,maxRhythm:maxRhythm(profile),combo:r.combo,comboColor:comboColor(r.combo),canRebuild:canRebuild(profile),materials:r.materials,offers:recovery?[]:CAMP_OFFERS.map(o=>{
  const bought=r.rest.bought.includes(o.id),current=o.id==='heal'?r.health:r.items[o.id],limit=o.id==='heal'?healthLimit:9;
  const reason=bought?'prepared':o.id==='heal'&&current>=limit?'full':o.id!=='heal'&&current>7?'capacity':r.materials[o.material]<o.cost?'funds':'ready';
  const after=reason==='ready'?Math.min(limit,current+(o.id==='heal'?35:2)):current;
  return {...o,current,limit,after,delta:after-current,bought,available:reason==='ready',reason};
 })};
}

export function mountApprovedRest(dialog,profile,{onChange=()=>{},onTalents=()=>{},onContinue=()=>{},onClose=()=>{},softMode=()=>false}={}){
 if(!restServiceView(profile))return ()=>{};
 const doc=dialog.ownerDocument;installRestShell(doc);const shadow=serviceShadow(dialog,restMarkup),style=doc.createElement('link');
 style.rel='stylesheet';style.href='approved-rest-ui.css';shadow.prepend(style);
 const root=shadow.querySelector('#gv-rest-service'),$=id=>root.querySelector('#'+id),motion=doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)'),fmt=n=>Math.ceil(n).toLocaleString('pt-BR');
 const previousWidth={value:dialog.style.getPropertyValue('width'),priority:dialog.style.getPropertyPriority('width')};
 let disposed=false,leaving=false,request=0,gainTimer=null,animations=[];
 const reduced=()=>softMode()||motion.matches;
 function cancel(){animations.forEach(a=>a.cancel());animations=[];clearTimeout(gainTimer);$('rf-hpgain').hidden=true;}
 function animate(el,frames,duration){if(disposed||reduced()||doc.hidden||!el)return;const a=el.animate(frames,{duration,easing:'ease-out'});animations.push(a);a.finished.then(()=>{animations=animations.filter(x=>x!==a);},()=>{});}
 function offerMarkup(o){const title={heal:'Vida',ward:'Escudo de eco',blast:'Geobomba'}[o.id];return '<article class="offer" data-id="'+o.id+'"><h3>'+title+'</h3><div class="benefit"><img src="'+HUD_ART[o.id==='heal'?'heart':o.id].url+'" alt=""><strong class="delta"></strong></div><p class="preview"></p><div class="cost"><div class="costline"><img src="assets/refuge-night-v3/gem-'+o.material+'.png" alt="'+['Quartzo','Rubi','Topázio','Esmeralda'][o.material]+'"><strong></strong><small></small></div><div class="bar" role="progressbar" aria-label="Fragmentos disponíveis para este preparo"><i></i></div></div><button type="button" class="button buy" data-camp="'+o.id+'"></button></article>';}
 $('rf-offers').innerHTML=CAMP_OFFERS.map(offerMarkup).join('');
 function render(){
  const v=restServiceView(profile);if(!v||disposed)return;
  root.dataset.soft=String(reduced());$('rf-window').dataset.mode=v.recovery?'recovery':'camp';
  dialog.style.setProperty('width','min('+(v.recovery?680:960)+'px, calc(100vw - 24px))','important');
  $('rf-title').textContent=v.recovery?'Nova chance':'Fogueira';$('rf-subtitle').textContent=v.recovery?'Combo mantido':'Andar '+v.floor+' · Tempo parado';
  $('rf-health').textContent=fmt(v.health);$('rf-hp-max').textContent='/ '+fmt(v.maxHealth);$('rf-breath').textContent=fmt(v.rhythm);$('rf-breath-max').textContent='/ '+fmt(v.maxRhythm);
  $('rf-hpfill').style.width=v.health/v.maxHealth*100+'%';$('rf-breathfill').style.width=v.rhythm/v.maxRhythm*100+'%';
  for(const [id,value,max]of [['rf-hpbar',v.health,v.maxHealth],['rf-breathbar',v.rhythm,v.maxRhythm]])for(const [a,n]of [['aria-valuenow',value],['aria-valuemax',max],['aria-valuemin',0]])$(id).setAttribute(a,n);
  $('rf-combo').textContent=v.combo+'×';$('rf-combo').style.color=v.comboColor;$('rf-combo-label').textContent='Combo';
  $('rf-rule').hidden=v.recovery;$('rf-protection').hidden=!v.recovery;$('rf-offers').hidden=v.recovery;$('rf-tree').disabled=!v.canRebuild;
  $('rf-continue').textContent=v.recovery?'Voltar à luta':'Continuar descida';
  for(const o of v.offers){
   const card=root.querySelector('[data-id="'+o.id+'"]'),q=s=>card.querySelector(s),title={heal:'Vida',ward:'Escudo de eco',blast:'Geobomba'}[o.id],amount=v.materials[o.material];
   card.dataset.prepared=String(o.bought);
   q('.delta').innerHTML=o.bought||o.reason==='full'?fmt(o.current)+'<small>/'+fmt(o.limit)+'</small>':o.id==='heal'&&o.available?'+'+fmt(o.delta):o.id==='heal'?'+35':'+2';
   q('.preview').innerHTML=o.bought?'':o.reason==='full'?'Completo':o.reason==='capacity'?fmt(o.current)+'/9':fmt(o.current)+' → '+fmt(o.available?o.after:Math.min(o.limit,o.current+(o.id==='heal'?35:2)))+(o.id!=='heal'?'<small> /9</small>':'');
   q('.costline strong').textContent=fmt(amount)+(o.bought?'':'/'+o.cost);q('.costline small').textContent=o.bought?'na mochila':'';
   const bar=q('.cost .bar');bar.setAttribute('aria-valuenow',amount);bar.setAttribute('aria-valuemin',0);bar.setAttribute('aria-valuemax',Math.max(o.cost,amount));q('.cost .bar i').style.width=Math.min(100,amount/o.cost*100)+'%';
   const b=q('[data-camp]'),label=o.bought?'✓ Preparado':o.reason==='funds'?(o.cost-amount===1?'Falta ':'Faltam ')+fmt(o.cost-amount):o.reason==='capacity'?'Sem espaço':o.reason==='full'?'Vida cheia':o.id==='heal'?'Recuperar':'Preparar';
   b.disabled=!o.available&&!o.bought;b.setAttribute('aria-disabled',String(!o.available));b.textContent=label;
   b.setAttribute('aria-label',(o.available?(o.id==='heal'?'Recuperar ':'Preparar ')+title:label+' · '+title)+(o.reason==='capacity'?' · estoque '+o.current+'/9; não cabe +2':''));
  }
 }
 function purchase(id){
  if(disposed||leaving)return;const before=restServiceView(profile),o=before?.offers.find(o=>o.id===id);if(!o?.available||!buyCamp(profile,id))return;
  cancel();render();const after=restServiceView(profile),gain=id==='heal'?after.health-before.health:profile.run.items[id]-o.current;
  $('rf-result').textContent=id==='heal'?'+'+fmt(gain)+' vida':'+'+gain+' '+(id==='ward'?'escudos':'bombas');
  const button=root.querySelector('[data-camp="'+id+'"]');button.focus({preventScroll:true});
  animate(root.querySelector('[data-id="'+id+'"] .benefit img'),[{transform:'scale(1.16)'},{transform:'scale(1)'}],220);
  if(id==='heal'){$('rf-hpgain').textContent='+'+fmt(gain);$('rf-hpgain').hidden=false;animate($('rf-hpgain'),[{transform:'translateY(6px)'},{transform:'translateY(0)'}],240);gainTimer=setTimeout(()=>{if(!disposed)$('rf-hpgain').hidden=true;},1100);}
  onChange(id);confirmButtonResult(button,'craft');
 }
 for(const b of root.querySelectorAll('[data-camp]'))b.onclick=()=>purchase(b.dataset.camp);
 $('rf-close').onclick=onClose;$('rf-tree').onclick=()=>{if(!disposed&&!leaving&&restServiceView(profile)?.canRebuild)onTalents();};
 $('rf-continue').onclick=()=>{if(disposed||leaving||!restServiceView(profile))return;leaving=true;cancel();onContinue();};
 function key(e){if(e.repeat&&['Enter','Space'].includes(e.code))e.preventDefault();}
 function visibility(){if(doc.hidden)cancel();}
 function motionChanged(){cancel();render();}
 root.addEventListener('keydown',key);doc.addEventListener('visibilitychange',visibility);motion.addEventListener('change',motionChanged);
 for(const i of root.querySelectorAll('[data-icon]'))i.src=HUD_ART[i.dataset.icon].url;$('rf-fire').src='assets/approved-rest-v1/campfire-v01.png';
 root.dataset.instant='true';render();$('rf-close').focus({preventScroll:true});request=requestAnimationFrame(()=>{if(!disposed)root.dataset.instant='false';});
 return ()=>{disposed=true;cancel();cancelAnimationFrame(request);root.removeEventListener('keydown',key);doc.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',motionChanged);if(previousWidth.value)dialog.style.setProperty('width',previousWidth.value,previousWidth.priority);else dialog.style.removeProperty('width');};
}
