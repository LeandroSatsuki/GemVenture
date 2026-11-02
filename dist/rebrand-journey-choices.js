import {approvedLargeCardArt} from './approved-card-raster.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// DTOs are supplied by the existing run owner. No selection, draw, clock or action here.
export function journeyFloorCardsMarkup(cards){
 return cards.map(c=>'<button class="gem-card" data-card="'+escape(c.id)+'" style="--card:'+escape(c.color)+'"><span class="card-role">'+escape(c.role)+'</span><span class="card-art card-raster-slot">'+approvedLargeCardArt(c.id)+'</span><strong>'+escape(c.name)+'</strong><p>'+escape(c.text)+'</p><span class="card-detail">'+escape(c.detail)+'</span><small>'+escape(c.level?'MELHORAR · NÍVEL '+(c.level+1):'NOVO PODER')+'</small></button>').join('');
}
export function journeyAbyssCardsMarkup(cards){
 return cards.map((c,i)=>'<button class="abyss-card" data-abyss-card="'+escape(c.id)+'" style="--card:'+escape(c.color)+'" disabled><kbd>'+(i+1)+'</kbd><small>'+escape(c.role)+'</small><i class="card-raster-slot">'+approvedLargeCardArt(c.id)+'</i><strong>'+escape(c.name)+'</strong><span>'+escape(c.text)+'</span>'+(c.detail?'<span class="abyss-card-detail">'+escape(c.detail)+'</span>':'')+'<b>'+escape(c.instant?'EFEITO IMEDIATO':c.level?'NÍVEL '+(c.level+1):'NOVO PODER')+'</b></button>').join('');
}
