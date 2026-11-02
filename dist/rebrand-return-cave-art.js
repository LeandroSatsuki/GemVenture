// GV019 isolated candidate. ID and destination select origin art; values and transfers stay owned.
import {generateAsset,assetToSvg} from './art-kit.js';
import {approvedArtSvg} from './approved-art.js';
import {returnCardArt as legacyCardArt,returnFlightArt as legacyFlightArt} from './rebrand-return.js';
export {activateReturnPresentation} from './rebrand-return.js';
export function returnCardArt(card,index){
 if(card.id==='rocks'&&card.destination==='bank')return assetToSvg(generateAsset('rock',{biome:0,variant:0}));
 if(card.id==='enemies'&&card.destination==='bank')return approvedArtSvg('golem',{biome:0,variant:0});
 return legacyCardArt(card,index);
}
export function returnFlightArt(card,index){return legacyFlightArt(card,index);}
