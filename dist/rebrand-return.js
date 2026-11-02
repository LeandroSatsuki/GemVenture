import {collectedGemSvg} from './collected-gems.js';
import {generateAsset,assetToSvg} from './art-kit.js';
import {glyph} from './ui-art.js';
export function activateReturnPresentation(dialog){dialog.classList.add('gv-r2');dialog.dataset.r2Screen='return';}
const coin=()=>'<svg viewBox="0 0 128 128" aria-hidden="true"><image href="assets/refuge-night-v3/coin.png" width="128" height="128"/></svg>';
// Destination owns the payout; origin art remains only for rocks and defeated creatures.
export function returnCardArt(card,index){return card.destination.startsWith('material-')?collectedGemSvg(card.kind):card.art==='crystal'?coin():assetToSvg(generateAsset(card.art,{variant:card.kind,seed:71+index}));}
export function returnFlightArt(card,index){return card.destination.startsWith('material-')?collectedGemSvg(card.kind):coin();}
