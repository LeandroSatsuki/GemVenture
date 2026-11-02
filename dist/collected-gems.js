import {P,GEM_RAMPS} from './palette.js';

// Inventory stones are cut gems, never the geological clusters found in a room.
export const GEM_CUTS=Object.freeze([
 {name:'Quartzo',outline:'M32 6 51 20 47 43 32 58 13 43 9 20Z',table:'M32 14 43 24 38 39 24 39 20 24Z'},
 {name:'Rubi',outline:'M20 7H44L57 25 32 58 7 25Z',table:'M23 16H41L46 25 32 43 18 25Z'},
 {name:'Topázio',outline:'M32 5 55 32 32 59 9 32Z',table:'M32 16 44 32 32 46 20 32Z'},
 {name:'Esmeralda',outline:'M20 7H44L53 17V47L44 57H20L11 47V17Z',table:'M23 17H41V46H23Z'}
]);
export function collectedGemSvg(kind=0){
 const i=(Number(kind)>>>0)%4;
 return `<svg viewBox="0 0 128 128" class="collected-gem" aria-hidden="true"><image href="assets/refuge-night-v3/gem-${i}.png" width="128" height="128"/></svg>`;
}
