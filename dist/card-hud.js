import {pauseCardSummary} from './approved-pause-summary.js';
import {cardRole,ROLE_PALETTE} from './card-feedback.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardHudMarkup(profile){return pauseCardSummary(profile).map(card=>{
 const badge='Nv. '+card.level,label=card.name+' | '+badge+' | '+card.effect;
 return '<article class="card-chip" data-hud-card="'+card.id+'" style="--card:'+ROLE_PALETTE[cardRole(card.id)].color+'" title="'+esc(label)+'" aria-label="'+esc(label)+'" tabindex="0">'+card.icon.replace('decoding="async"','decoding="async" loading="lazy"')+'<strong class="hud-card-name">'+esc(card.name)+'</strong><b class="hud-card-level">'+esc(badge)+'</b></article>';
}).join('');}
