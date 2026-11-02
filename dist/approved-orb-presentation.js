import {ORB_COLORS,ORB_FAMILIES,orbsEnabled,equippedOrb} from './run-orbs.js';
import {ORB_ICONS} from './approved-orb-assets.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const symbol={impact:'force',pulse:'force',shelter:'guard',brace:'guard',stride:'dash',lantern:'sight'};
export function orbSymbol(id,color){return '<span class="run-orb-symbol"><img src="'+ORB_ICONS[symbol[id]||{red:'force',yellow:'guard',blue:'dash'}[color]]+'" alt=""></span>';}
export function orbPresentationView(run){
 if(!orbsEnabled(run))return null;const slots=ORB_COLORS.map(color=>{const o=equippedOrb(run,color);return{color,orb:o,empty:!o,pulseHits:run.orbs?.pulseHits||0,cooldown:run.orbs?.guardCooldown||0};});
 return slots.some(slot=>!slot.empty)?{slots}:null;
}
export function orbSlotMarkup(slot){const {orb:o,color,empty,pulseHits,cooldown}=slot;const aria=o?o.name+': '+o.effect+(o.id==='brace'?'; '+(cooldown?cooldown+' batidas para recarregar':'pronta'):''):ORB_FAMILIES[color].name+': vazio.';let micro=o?.id==='pulse'?'<span class="run-orb-pips" role="img" aria-label="'+pulseHits+' de 4 golpes">'+[0,1,2,3].map(i=>'<i data-on="'+(i<pulseHits)+'"></i>').join('')+'</span>':o?.id==='brace'?(cooldown?cooldown+' ♬':'<span class="run-orb-ready">✓</span>'):{impact:'+10%',shelter:'−8%',stride:'+1',lantern:'+2'}[o?.id]||'—';return '<div class="run-orb-slot" data-orb-color="'+color+'" data-empty="'+empty+'" role="img" aria-label="'+esc(aria)+'">'+orbSymbol(o?.id,color)+'<span class="run-orb-micro">'+micro+'</span></div>';}
export function orbPauseMarkup(run){const view=orbPresentationView(run);if(!view)return'';return '<section class="run-orb-pause" aria-label="Orbs da descida"><h3>Orbs da descida</h3>'+view.slots.map(({orb:o,color})=>'<article class="run-orb-summary" data-orb-color="'+color+'">'+orbSymbol(o?.id,color)+'<div><strong>'+esc(o?.name||ORB_FAMILIES[color].name)+'</strong><p>'+esc(o?.effect||'Nenhuma orb equipada.')+'</p></div></article>').join('')+'</section>';}
