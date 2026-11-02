// Account presentation and a permanent, cumulative unlock. No currency is spent here.
export const RELIQUARY_UNLOCK_STARS=30;
export function cleanMinerName(value){return String(value??'').normalize('NFC').replace(/[<>\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().slice(0,24);}
export function earnedStars(profile){
 if(profile.floorStars!==undefined&&profile.journey?.earnedStars!==undefined)return Math.max(0,profile.journey.earnedStars,profile.stars||0,Object.values(profile.floorStars).reduce((n,v)=>n+v,0)+(profile.legacyStarCredit||0));
 const knownSpend=(profile.astral?.rolls||0)*35+Object.entries({supplies:12,charge:18,yield:20}).reduce((n,[k,c])=>{const rank=profile.starUpgrades?.[k]||0;return n+c*rank*(rank+1)/2;},0)+[3,8,15,25,35,45].slice(0,profile.seals||0).reduce((a,b)=>a+b,0);
 return Math.max(Number.isSafeInteger(profile.journey?.earnedStars)?Math.max(0,profile.journey.earnedStars):0,(profile.stars||0)+knownSpend,profile.astral?.owned?.length?30:0);
}
export const reliquaryUnlocked=s=>earnedStars(s)>=RELIQUARY_UNLOCK_STARS;
export function restoreJourney(raw,profile){return {version:1,name:cleanMinerName(raw?.name),earnedStars:earnedStars({...profile,journey:raw}),tourStep:typeof raw?.tourStep==='string'?raw.tourStep:null,tourDone:raw?.tourDone===true,relicIntroDone:raw?.relicIntroDone===true};}
