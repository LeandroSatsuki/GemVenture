// Presentation only: confirmed perfect events drive the contact accent; no input/reward logic.
export function createApprovedPulseFeel(root){
 const doc=root.ownerDocument,rail=root.querySelector('.track'),fill=root.querySelector('.energy-fill'),edge=root.querySelector('.energy-edge'),contact=root.querySelector('.contact'),rays=root.querySelector('.contact-rays'),media=doc.defaultView.matchMedia('(prefers-reduced-motion:reduce)');let animations=[],blocked=false,reduced=false;
 const stop=()=>{for(const a of animations)a.cancel();animations=[];};
 function update(combo,options={}){blocked=!!options.blocked;reduced=!!options.reduced||media.matches;const value=Math.max(0,Math.min(250,combo)),amount=value/250;fill.style.width=edge.style.width=amount*100+'%';fill.style.opacity=reduced?'.06':String(.06+amount*.10);rail.style.setProperty('--feel-glow',(reduced?0:4+amount*7)+'px');if(blocked||reduced||doc.hidden)stop();}
 function hit(combo,options={}){update(combo,{blocked,reduced:options.reduced});if(blocked||reduced||doc.hidden)return;stop();animations=[contact.animate([{opacity:.8,transform:'scale(.55)'},{opacity:0,transform:'scale(1.6)'}],{duration:170,easing:'ease-out'}),rays.animate([{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:'translate(12px,-12px)'}],{duration:210,easing:'ease-out'})];}
 const visibility=()=>{if(doc.hidden)stop();};doc.addEventListener('visibilitychange',visibility);media.addEventListener('change',stop);
 return {update,hit,stop,destroy(){stop();doc.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',stop);}};
}
