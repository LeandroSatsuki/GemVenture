import {CARDS} from './cards.js';
import {abyssCardDefinition} from './abyss-cards.js';
// Read-only catalog projection. Never applies a card, regenerates an offer,
// infers identity from cumulative stacks or exposes opaque IDs as markup.
export function chosenCardView(s){
 const r=s?.run;
 if(!r)return {status:'inactive',confirmed:false,id:null,card:null,context:null};
 const abyss=r.mode==='abyss',context={mode:abyss?'abyss':'floors',floor:r.floor,...(abyss?{section:r.abyss?.cardSection??null}:{})};
 const pending=abyss?!!r.abyss?.cardChoice:r.room?.cleared===true&&r.cardChosen!==true;
 if(pending)return {status:'pending',confirmed:false,id:null,card:null,context};
 const confirmed=abyss?Number.isSafeInteger(r.abyss?.cardSection)&&r.abyss.cardSection>1:r.room?.cleared===true&&r.cardChosen===true;
 if(!confirmed)return {status:'inactive',confirmed:false,id:null,card:null,context};
 const stored=r.cardChosenId;
 if(stored==null)return {status:'legacy',confirmed:true,id:null,card:null,context};
 const definition=typeof stored==='string'?(abyss?abyssCardDefinition(stored):CARDS.find(c=>c.id===stored)):null;
 if(!definition)return {status:'unavailable',confirmed:true,id:null,card:null,context};
 const {id,name,text,role,icon,color}=definition;
 return {status:'chosen',confirmed:true,id,card:{id,name,text,role,icon,color,artId:id,descriptionScope:'catalog'},context};
}
