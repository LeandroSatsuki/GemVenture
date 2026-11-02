import {prepareStyledSurface} from './styled-surface.js';
import {retreatSummary} from './expedition-summary.js';
import {comboColor} from './gamefeel-v5.js';
import {HUD_ART} from './hud-art-registry.js';
import {serviceShadow} from './approved-service-host.js';

const fmt=n=>new Intl.NumberFormat('pt-BR').format(Math.max(0,Math.floor(Number(n)||0)));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=['Quartzo','Rubi','Topázio','Esmeralda'];
const art=id=>id.startsWith('material-')?'assets/refuge-night-v3/gem-'+Number(id.slice(9))+'.png':HUD_ART[id]?.url||HUD_ART.coin.url;
const img=(id,alt='')=>'<img src="'+art(id)+'" alt="'+esc(alt)+'" draggable="false">';
export const retentionLabel=ratio=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(ratio*100)+'%';
function installShell(doc){if(doc.querySelector('link[data-approved-return-shell]'))return;const css=doc.createElement('link');css.rel='stylesheet';css.href='approved-return-shell.css';css.dataset.approvedReturnShell='';doc.head.append(css);}
if(typeof document!=='undefined')installShell(document);

export function withdrawalView(state){
 const r=state?.run;if(!r)return null;const summary=retreatSummary(state);
 return {floor:r.floor,abyss:r.mode==='abyss',depth:(r.abyss?.rows||0)*5,ratio:summary.ratio,rows:[{id:'coin',name:'Moedas',before:r.bag,after:summary.coins},...r.materials.map((n,i)=>({id:'material-'+i,name:names[i],before:n,after:summary.materials[i]}))]};
}
function correction(row){const changed=row.before!==row.after,values=(changed?'<del>'+fmt(row.before)+'</del><span class="arrow" aria-hidden="true">→</span>':'')+'<strong>'+fmt(row.after)+'</strong>',coin=row.id==='coin';
 return '<div class="correction'+(coin?' coin':'')+'" aria-label="'+esc(row.name+': '+fmt(row.before)+' na mochila; '+fmt(row.after)+' no resgate')+'">'+img(row.id)+(coin?'<span class="resource-name">'+esc(row.name)+'</span><span class="correction-values">'+values+'</span>':'<div><span class="resource-name">'+esc(row.name)+'</span><span class="correction-values">'+values+'</span></div>')+'</div>';
}
export function withdrawalMarkup(v){return '<section id="gv-return-service"><div class="window" data-view="withdrawal"><header class="head">'+img('home')+'<div><h2>Retirada de emergência</h2><p class="context">'+(v.abyss?'Abismo · '+fmt(v.depth)+' m':'Andar '+fmt(v.floor))+'</p></div><button type="button" class="button close" data-withdraw-close aria-label="Continuar na mina">×</button></header><section class="rescue" aria-label="Resgate da mochila"><header class="retention"><div><h3>Você leva</h3><p>Melhore na Forja</p></div><strong>'+retentionLabel(v.ratio)+'</strong></header><div class="corrections">'+v.rows.map(correction).join('')+'</div></section><footer class="footer"><button type="button" class="button" id="keepGoing">Continuar na mina</button><button type="button" class="button primary" id="confirmRetreat">Resgatar e voltar</button></footer></div></section>';}

export function mountApprovedWithdrawal(dialog,state,{onCancel,onConfirm}={}){
 const v=withdrawalView(state);if(!v)return()=>{};const doc=dialog.ownerDocument;installShell(doc);
 const shadow=serviceShadow(dialog,withdrawalMarkup(v)),css=doc.createElement('link');css.rel='stylesheet';css.href='approved-return-ui.css';shadow.prepend(css);
 const prior={value:dialog.style.getPropertyValue('width'),priority:dialog.style.getPropertyPriority('width')};dialog.style.setProperty('width','min(720px, calc(100vw - 24px))','important');
 let disposed=false,submitted=false;const cancel=()=>{if(!disposed&&!submitted)onCancel?.();};
 shadow.querySelector('[data-withdraw-close]').onclick=cancel;shadow.querySelector('#keepGoing').onclick=cancel;
 shadow.querySelector('#confirmRetreat').onclick=()=>{if(disposed||submitted)return;submitted=true;onConfirm?.();};shadow.querySelector('#keepGoing').focus();
 return()=>{disposed=true;if(prior.value)dialog.style.setProperty('width',prior.value,prior.priority);else dialog.style.removeProperty('width');};
}

export function mountApprovedReturnSurface(dialog){
 const doc=dialog.ownerDocument;installShell(doc);dialog.classList.add('approved-return-dialog');
 const host=doc.createElement('div');host.className='approved-service-host';dialog.replaceChildren(host);const shadow=host.attachShadow({mode:'open'});prepareStyledSurface(host,shadow);
 for(const file of ['approved-services.css','approved-return-ui.css']){const css=doc.createElement('link');css.rel='stylesheet';css.href=file;shadow.append(css);}
 const view=doc.createElement('div');shadow.append(view);return view;
}
export function approvedReturnMarkup(result,page,cards){
 const r=result,total=Math.max(1,Math.ceil(cards.length/4)),more=(page+1)*4<cards.length,hasGain=cards.some(c=>c.value>0),death=r.reason==='death';
 const title=death?(r.depleted==='rhythm'?'Sem fôlego':r.depleted==='health'?'Vida esgotada':'Fim da descida'):r.reason==='victory'?'Vitória!':'Saque da descida',icon=death?(r.depleted==='rhythm'?'breath':'heart'):'home';
 const rows=cards.slice(page*4,page*4+4).map((c,i)=>'<article class="reward reward-card'+(c.id==='empty'?' is-empty empty':'')+'" data-index="'+i+'"><span class="reward-art">'+(c.id==='empty'?'':img(c.destination.startsWith('material-')?c.destination:'coin'))+'</span><h3>'+esc(c.id==='other'?'Outras moedas':c.id==='empty'?'Sem saque nesta descida':c.name)+'</h3><strong data-count="'+(Number(c.value)||0)+'"'+(c.id==='empty'?' hidden':'')+'>+0</strong></article>').join('')||'<p class="reward empty">Sem saque nesta descida</p>';
 const secured=r.secured?'<div class="secured">Já na base <span>'+img('coin','Moedas já guardadas')+'<b>'+fmt(r.secured.coins)+'</b></span>'+(r.secured.materials||[]).map((v,i)=>v?'<span>'+img('material-'+i,names[i]+' já guardado')+'<b>'+fmt(v)+'</b></span>':'').join('')+'</div>':'';
 return '<section id="gv-return-service"><div class="window" data-view="receipt"><header class="head">'+img(icon)+'<div><h2 id="returnLootTitle">'+title+'</h2><p class="context">Refúgio · '+(r.mode==='abyss'?'Abismo · '+fmt(r.depth)+' m':'Andar '+fmt(r.floor))+'</p></div></header><div class="kept-summary"><span>'+img('coin','Moedas resgatadas')+'<b>+'+fmt(r.kept)+'</b></span>'+(r.lost?'<span class="loss">'+fmt(r.lost)+' moedas perdidas</span>':'<span>Saque salvo</span>')+(r.zagPasses?'<span>+'+fmt(r.zagPasses)+' passes</span>':'')+'</div><div class="rewards reward-grid" data-empty="'+(!cards.length||cards.every(c=>c.id==='empty'))+'">'+rows+'</div>'+secured+'<div class="stats"><span>Combo máximo <b style="color:'+comboColor(r.peak||0)+'">'+fmt(r.peak)+'×</b></span><span aria-label="'+fmt(r.earnedStars)+' estrelas já guardadas">'+img('star')+'<b>'+fmt(r.earnedStars)+'</b> guardadas</span><span><b>'+fmt(r.score)+'</b> pontos</span></div><footer class="footer return-bottom"><span class="page"'+(total===1?' hidden':'')+'>'+(page+1)+' / '+total+'</span><button type="button" class="button primary" id="rewardOK">'+(more?'Próximos →':hasGain?'Guardar tudo ✓':'Voltar ao refúgio')+'</button></footer></div></section>';
}
// Visual grouping only. Domain credit and the final balances stay in ReturnScreen.
export function approvedReturnTransfers(cards){const groups=new Map();for(const c of cards){if(!(c.value>0))continue;const key=c.destination;if(!groups.has(key))groups.set(key,{...c});else groups.get(key).value+=c.value;}return [...groups.values()];}
export function approvedReturnFlightArt(card){const id=card.destination.startsWith('material-')?card.destination:'coin';return '<img src="'+art(id)+'" alt="" width="32" height="32" style="display:block;object-fit:contain;width:100%;height:100%">';}
