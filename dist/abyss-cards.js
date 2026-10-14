import {CARDS,cardOffer} from './cards.js';
export const ABYSS_CHOICE_SECONDS=4;
// Once a build reaches every cap, milestones still offer three useful choices.
export const ABYSS_RECOVERY_CARDS=Object.freeze([
 {id:'abyss-heal',name:'Reparo vital',text:'Recupere 25 de vida.',role:'CURA',icon:'harvest',color:'#f94e6d'},
 {id:'abyss-breath',name:'Respire fundo',text:'Recupere 30 de fôlego.',role:'FÔLEGO',icon:'breath',color:'#5ee9e9'},
 {id:'abyss-ward',name:'Bolha de proteção',text:'Ganhe um escudo temporário.',role:'ESCUDO',icon:'ward',color:'#ece910'}
]);
export const abyssCardDefinition=id=>CARDS.find(c=>c.id===id)||ABYSS_RECOVERY_CARDS.find(c=>c.id===id);
const random=seed=>{let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
export function offerAbyssCards(s){
 const r=s.run,a=r?.abyss;if(r?.mode!=='abyss'||!a||a.cardChoice||a.section<=1||a.section<=(a.cardSection||1))return false;
 const roll=random(s.seed+s.attempts*7919+a.section*31337);
 // Elevator charge has no effect in a continuous descent.
 const offers=cardOffer(roll,r,s,c=>c.id!=='battery');
 for(const c of ABYSS_RECOVERY_CARDS){if(offers.length===3)break;offers.push(c.id);}
 a.cardSection=a.section;a.cardChoice={section:a.section,offers,remaining:ABYSS_CHOICE_SECONDS,autoIndex:Math.floor(roll()*offers.length)};
 r.events.push({type:'abyssCardOffer',section:a.section});return true;
}
export function advanceAbyssChoice(r,seconds){
 const c=r?.mode==='abyss'&&r.abyss?.cardChoice;
 if(!c||!Number.isFinite(seconds)||seconds<0)return null;
 c.remaining=Math.max(0,c.remaining-seconds);
 return c.remaining===0?c.offers[c.autoIndex]:null;
}
export function validAbyssChoice(r){
 const a=r.abyss;if(!a)return true;
 if(a.cardSection!==undefined&&(!Number.isSafeInteger(a.cardSection)||a.cardSection<1||a.cardSection>a.section))return false;
 const c=a.cardChoice;if(c===undefined||c===null)return true;
 return r.mode==='abyss'&&c.section===a.section&&c.section===a.cardSection&&c.section>1&&Array.isArray(c.offers)&&c.offers.length===3&&new Set(c.offers).size===3&&c.offers.every(id=>id!=='battery'&&!!abyssCardDefinition(id))&&Number.isFinite(c.remaining)&&c.remaining>=0&&c.remaining<=ABYSS_CHOICE_SECONDS&&Number.isInteger(c.autoIndex)&&c.autoIndex>=0&&c.autoIndex<3;
}
