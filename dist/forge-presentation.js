// UI navigation only: never writes state, gear, recipes or save data.
export const FORGE_PRESENTATION_IDS=Object.freeze(['pickaxe','vigor','anvil','tonic','vault']);
export function normalizeForgeProjectId(requestedId){
 return FORGE_PRESENTATION_IDS.includes(requestedId)?requestedId:'pickaxe';
}
// Host supplies its current canonical renderer and calculations.
// Normalize BEFORE costs/power/render and adopt returned id as transient selection.
export function renderForgePresentation(state,requestedId,host,busy=false){
 const id=normalizeForgeProjectId(requestedId),vigor=id==='vigor';
 const cost=vigor?host.coreCost(state):host.upgradeCost(state);
 const strength=vigor?host.maxHealth(state):host.power(state);
 const original=host.forgeMarkup(state,id,cost,strength,busy);
 const html=original.replace(/<button\b[^>]*\bdata-forge="armor"[^>]*>[\s\S]*?<\/button>/g,'');
 return {id,html,fallback:id!==requestedId};
}
