import {ASTRAL_COST,ASTRAL_SLOTS,ASTRAL_RELICS} from './astral.js';
import {relicMarkup} from './rebrand-relic.js';

// Read-only presentation adapter. Rules, random draws and persistence stay in astral.js/run.js.
export function astralMarkup(s){
 const a=s.astral,remaining=ASTRAL_RELICS.length-a.owned.length;
 return relicMarkup({stars:s.stars,cost:ASTRAL_COST,slots:ASTRAL_SLOTS,remaining,
  relics:ASTRAL_RELICS,owned:a.owned,equipped:a.equipped,offer:a.offer,last:a.last,
  canInvoke:s.stars>=ASTRAL_COST&&remaining>0});
}
