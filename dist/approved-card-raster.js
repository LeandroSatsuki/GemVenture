import {approvedCardArt} from './approved-interface-icons.js';
// Every card consumer shares the canonical artwork; retired card drawings are not fallback assets.
import {APPROVED_CARD_RASTERS} from './card-art-registry.js';
export {APPROVED_CARD_RASTERS};
export function approvedLargeCardArt(id){
 const source=Object.hasOwn(APPROVED_CARD_RASTERS,id)?APPROVED_CARD_RASTERS[id]:null;
 return source?'<img class="approved-card-raster" src="'+source+'" alt="" aria-hidden="true" decoding="async" draggable="false">':approvedCardArt(id);
}

