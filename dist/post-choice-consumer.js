// Integration adapter: the host supplies the approved domain and art modules.
import {chosenCardView} from './chosen-card-view.js';
import {approvedLargeCardArt} from './approved-card-raster.js';
import {decoratePostChoice} from './post-choice.js';
export function decoratePostChoiceFromState(root,state,currentEffectText){
 return decoratePostChoice(root,{view:chosenCardView(state),renderCardArt:approvedLargeCardArt,currentEffectText});
}
