// Stable slots: adding an item never changes a character's saved identity.
export const OUTFIT_SLOTS=Object.freeze({
 hat:{name:'Capacete',items:[['hardhat','Minerador'],['duck','Patinho']]},
 shirt:{name:'Blusa',items:[['blue','Azul'],['pink','Rosa']]},
 pants:{name:'Calça',items:[['default','Clássica']]},
 shoes:{name:'Sapatos',items:[['default','Botas vermelhas']]},
 glasses:{name:'Óculos',items:[['none','Sem óculos']]}
});
export const defaultOutfit=()=>({hat:'hardhat',shirt:'blue',pants:'default',shoes:'default',glasses:'none'});
export function validOutfit(o){return o===undefined||!!o&&Object.keys(o).every(k=>OUTFIT_SLOTS[k]?.items.some(([id])=>id===o[k]));}
export function minerOutfit(profile){return {...defaultOutfit(),...profile?.homeCollection?.outfit};}
export function minerOutfitKey(profile){const o=minerOutfit(profile);return o.hat+'-'+o.shirt;}
export function setMinerOutfit(profile,slot,item){if(profile.run||!OUTFIT_SLOTS[slot]?.items.some(([id])=>id===item))return false;profile.homeCollection.outfit={...minerOutfit(profile),[slot]:item};return true;}
export function outfitMarkup(profile,active='hat'){
 const o=minerOutfit(profile);if(!OUTFIT_SLOTS[active])active='hat';
 const crop={hat:'74 45 172 88',shirt:'98 186 124 59',pants:'108 244 104 24',shoes:'108 262 104 34',glasses:'102 135 116 42'};
 return '<div class="outfit-slots"><nav class="outfit-tabs" role="tablist" aria-label="Roupas">'+Object.entries(OUTFIT_SLOTS).map(([slot,s])=>'<button role="tab" id="outfit-tab-'+slot+'" aria-controls="outfit-options" data-outfit-tab="'+slot+'" aria-selected="'+(slot===active)+'">'+s.name+'</button>').join('')+'</nav><div class="outfit-options" id="outfit-options" role="tabpanel" aria-labelledby="outfit-tab-'+active+'">'+OUTFIT_SLOTS[active].items.map(([id,name])=>{
  const look={...o,[active]:id},src='assets/miner-living-v7/'+look.hat+'-'+look.shirt+'/front.png';
  return '<button class="outfit-item secondary" data-outfit-slot="'+active+'" data-outfit-item="'+id+'" aria-pressed="'+(o[active]===id)+'"><svg viewBox="'+crop[active]+'" aria-hidden="true"><image href="'+src+'" width="320" height="320"/></svg><span>'+name+'</span>'+(o[active]===id?'<b aria-label="Equipado">✓</b>':'')+'</button>';
 }).join('')+'</div></div>';
}
