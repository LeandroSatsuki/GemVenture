import {orbPresentationView,orbSlotMarkup} from './approved-orb-presentation.js';
export function orbHudMarkup(run){const view=orbPresentationView(run);return view?'<div class="run-orb-slots" aria-label="Três espaços de orbs da descida">'+view.slots.map(orbSlotMarkup).join('')+'</div>':'';}
export function updateOrbHud(root,run){
 const view=orbPresentationView(run);let tray=root.querySelector('.run-orb-tray');
 if(!view){tray?.remove();root.classList.remove('run-orbs-visible');return;}
 if(!tray){const doc=root.ownerDocument;if(!doc.getElementById('runOrbStyles')){const css=doc.createElement('link');css.id='runOrbStyles';css.rel='stylesheet';css.href=new URL('./run-orb-hud.css',import.meta.url).href;doc.head?.append(css);}tray=doc.createElement('section');tray.className='run-orb-tray';tray.setAttribute('aria-label','Orbs da descida');root.querySelector('.hud5-buffs').prepend(tray);}
 tray.hidden=!!run.room.cleared;root.classList.toggle('run-orbs-visible',!tray.hidden);const markup=orbHudMarkup(run);if(markup!==tray._orbMarkup){tray.innerHTML=markup;tray._orbMarkup=markup;}
}
