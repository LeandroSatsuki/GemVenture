import {activeCards,cardCount,cardDetail} from './cards.js';
import {power} from './core.js';
import {approvedCardArt} from './approved-interface-icons.js';

// Presentation only: totals, caps, power scaling, healing and remaining revives
// come from the same canonical formatter used by the card selection screen.
export function compactCardEffect(detail){
 return detail.replaceAll(' de chance','')
  .replace('dano em cada golpe','dano/golpe')
  .replace('dano no outro alvo','dano no alvo vizinho')
  .replace('gemas por cristal','gemas/cristal')
  .replace('vida por cristal','vida/cristal')
  .replace('dano de fogo ao longo do tempo','fogo gradual')
  .replace('inimigo causa','inimigo')
  .replace('vida por inimigo','vida/abate')
  .replace('alcance de movimento','alcance')
  .replace('de alcance de visão','visão')
  .replace('de tolerância ao ritmo','tolerância ao ritmo')
  .replace('vida ao bater · abaixo de 40% de vida','vida/golpe · vida <40%')
  .replace('gemas nos cristais','gemas/cristal')
  .replace('carga por geodo','carga/geodo')
  .replace('velocidade de crescimento','crescimento')
  .replace(' · volta com 30 de vida',' · volta com 30 vida');
}

export function pauseCardSummary(profile){
 if(!profile?.run)return [];
 const damage=power(profile);
 return activeCards(profile.run).map(card=>{
  const level=cardCount(profile.run,card.id),detail=cardDetail(card,level,damage,0,profile);
  return {id:card.id,name:card.name,level,effect:compactCardEffect(detail),detail,icon:approvedCardArt(card.id)};
 });
}
