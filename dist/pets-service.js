import {collectionView} from './home-collection.js';
import {petJourneyView} from './pet-bonds.js';
// Read-only: opening the collection never grants or advances a companion.
export function petsServiceView(profile){const c=collectionView(profile),inRun=!!profile.run;
 if(!c.supported)return {id:'pets',supported:false,canOpen:false,reason:'Dados de coleção indisponíveis',pets:[],activePet:null,remove:{available:false}};
 return {id:'pets',supported:true,canOpen:!inRun,reason:inRun?'Volte ao refúgio':'Disponível',activePet:c.activePet,
 pets:c.pets.map(p=>{const journey=petJourneyView(profile,p.id);return {...p,equipped:p.id===c.activePet,journey,unlockHint:journey.hint,equip:{available:!inRun&&p.owned},care:{available:!inRun&&p.owned}};}),remove:{available:!inRun&&c.activePet!==null}};
}
