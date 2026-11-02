// Presentation scope only. The Abismo pane and every other dialog retain their existing theme.
export function applyExpeditionUI(dialog,kind){
 const supported=kind==='lift'&&!!dialog.querySelector('.lift-browser');
 dialog.classList.toggle('gv-expedition-theme',supported);
 if(supported)dialog.dataset.gvExpedition='floors';else delete dialog.dataset.gvExpedition;
 return supported;
}
