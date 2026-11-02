import {prepareStyledSurface} from './styled-surface.js';
// Service-local CSS prevents historical menus from changing approved buttons.
export function serviceShadow(dialog,markup){
 const host=dialog.ownerDocument.createElement('div');host.className='approved-service-host';
 dialog.querySelector('#dialogBody').replaceChildren(host);
 const shadow=host.attachShadow({mode:'open'}),css=dialog.ownerDocument.createElement('link');
 css.rel='stylesheet';css.href='approved-services.css';shadow.append(css);
 prepareStyledSurface(host,shadow);
 const template=dialog.ownerDocument.createElement('template');template.innerHTML=markup;shadow.append(template.content.cloneNode(true));
 return shadow;
}
