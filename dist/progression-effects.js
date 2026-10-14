import {talentEffects,TALENT_EFFECTS} from './talents.js';
import {astralEffects} from './astral.js';
import {gearBonuses} from './gear.js';
const cache=new WeakMap();
// Revision checks avoid rebuilding a large web for every hit, without stale purchases.
export function progressionEffects(s){const old=cache.get(s),revision=(s.talents?.revision||0)+':'+(s.astral?.revision||0);let effects;if(old&&old.talents===s.talents&&old.astral===s.astral&&old.revision===revision)effects=old.effects;else{effects=talentEffects(s);for(const [key,value]of Object.entries(astralEffects(s)))effects[key]=(effects[key]||0)+value;for(const [key,def]of Object.entries(TALENT_EFFECTS)){if(key!=='abyssPower')effects[key]=Math.min(def.cap*1.5,effects[key]||0);}cache.set(s,{talents:s.talents,astral:s.astral,revision,effects});}if(s.run)s.run.visionBonus=effects.vision+gearBonuses(s).sight/100;return effects;}
export const invalidateProgression=s=>cache.delete(s);
