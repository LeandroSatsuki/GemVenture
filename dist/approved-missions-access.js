// A tutorial target may live on another page and inside the service shadow root.
const presentations=new WeakMap();
export function registerMissionPresentation(dialog,presentation){presentations.set(dialog,presentation);return()=>{if(presentations.get(dialog)===presentation)presentations.delete(dialog);};}
export function missionPresentationTarget(dialog,id){return presentations.get(dialog)?.revealOffer(id)||null;}
