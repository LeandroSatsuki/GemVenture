// Input recognition only. Domain-owned sounds remain authoritative for outcomes.
export const IMPORTANT_UI_BUTTONS='.primary,.buy,.enter,.menu-primary,[data-primary="true"],#safeReturn,#extract,#floorRescue,#sendCargo,#resume,#rewardOK';
export const DOMAIN_UI_BUTTONS='#descend,[data-depart],#abyssStart,#gvl-enter,#confirmSafeReturn,#confirmRetreat,#sendCargo,#floorRescue';
export const OWNED_UI_BUTTONS='#sound,#inspectSkills,.skill-slot,[data-village="tree"],[data-refuge-action="tree"],.item-button,[data-card],[data-abyss-card],#confirmCard';

export function eventButton(event){
 return (event.composedPath?.()||[event.target]).find(n=>n?.tagName==='BUTTON')||event.target?.closest?.('button')||null;
}
export function buttonSoundRole(button,event){
 if(!button||button.disabled||button.getAttribute?.('aria-disabled')==='true'||button.closest?.('[hidden],[inert]'))return 'silent';
 const path=event?.composedPath?.()||[];
 if(button.matches(OWNED_UI_BUTTONS)||path.some(n=>n?.dataset?.service==='tree')||button.closest?.('[data-service="tree"]'))return 'owned';
 if(button.matches(DOMAIN_UI_BUTTONS))return 'domain';
 return button.matches(IMPORTANT_UI_BUTTONS)?'primary':'click';
}
