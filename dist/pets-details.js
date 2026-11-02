import {PET_ROSTER} from './pet-companion-roster.js';
export const petDetails=Object.fromEntries(PET_ROSTER.map(p=>[p.id,{rarity:p.rarity||null,abilityName:p.power}]));
