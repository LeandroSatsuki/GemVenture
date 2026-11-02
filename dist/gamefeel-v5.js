// Presentation only. The counter always shows the domain value; flights never
// write combo, score or rewards. One milestone flight at a time per HUD root.
const hues=['#4aeaff','#a2e66f','#ffd95a','#f27f72','#db5ebe','#b8a4ff'];
export const comboColor=n=>hues[Math.max(0,Math.trunc(Number(n)||0))%hues.length];
const flights=new WeakMap(),pulseAnimations=new WeakMap();
const soft=(root,value)=>!!(value||root?.ownerDocument?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const parts=root=>{const label=root?.querySelector('[data-hud-field="combo"]');return {label,box:label?.closest('.combo')};};
function hitPulse(box,reduced=false){
 if(!box?.animate)return null;for(const a of pulseAnimations.get(box)||[])a.cancel();
 const animation=box.animate(reduced?[{opacity:.8},{opacity:1}]:[{transform:'scale(1.18) rotate(-3deg)',filter:'brightness(1.7) saturate(1.25)'},{transform:'scale(.98) rotate(1deg)',filter:'brightness(1.08)',offset:.62},{transform:'scale(1)',filter:'brightness(1)'}],{duration:reduced?150:300,easing:'cubic-bezier(.16,.8,.25,1)'});
 animation.finished?.catch(()=>{});pulseAnimations.set(box,[animation]);return animation;
}
export function clearComboFeedback(root){const f=flights.get(root);f?.cancel();const {box}=parts(root);for(const a of pulseAnimations.get(box)||[])a.cancel();if(box)pulseAnimations.delete(box);}
export function syncCombo(root,combo,{phase=0,reduced=false,blocked=false}={}){
 const {label,box}=parts(root);if(!label||!box)return;const quiet=soft(root,reduced),color=comboColor(combo),digits=String(Math.max(0,Math.trunc(combo)||0)).length;
 box.style.setProperty('--combo-color',color);box.style.setProperty('--combo-font-size',(digits>5?48:digits>4?58:digits>3?68:84)+'px');
 const beat=quiet||blocked?0:Math.max(0,1-((Math.max(0,phase)||0)%1)/.36);box.style.setProperty('--combo-beat',beat.toFixed(3));
 const f=flights.get(root),stop=blocked||!!root.ownerDocument?.hidden;if(f&&f.blocked!==stop){f.blocked=stop;f.animations.forEach(a=>stop?a.pause():a.play());}
}
export function pulseCombo(root,combo,reduced=false){syncCombo(root,combo,{reduced});const {box}=parts(root);return hitPulse(box,soft(root,reduced));}
export function comboNumberFlightFrames(source,target,reduced=false){
 if(reduced)return [{opacity:0},{opacity:1,offset:.25},{opacity:0}];
 const dx=target.left+target.width/2-source.left-source.width/2,dy=target.top+target.height/2-source.top-source.height/2,scale=Math.max(.2,Math.min(1,target.width/source.width,target.height/source.height));
 const at=(x,y,s,angle=0)=>'translate(calc(-50% + '+x+'px), calc(-50% + '+y+'px)) scale('+s+') rotate('+angle+'deg)';
 return [{opacity:0,transform:at(0,0,1.08),offset:0},{opacity:1,transform:at(0,0,1.08),offset:.02},{opacity:1,transform:at(dx*.28,dy*.28-45,1.02,-5),offset:.45},{opacity:1,transform:at(dx*.85,dy*.85-12,scale*1.1,2),offset:.85},{opacity:0,transform:at(dx,dy,scale)}];
}
export function flyCombo({document:doc,root,container,source,slot,combo,reduced=false}={}){
 if(!root||!container||!source||!slot||!doc)return null;clearComboFeedback(root);const quiet=soft(root,reduced),color=comboColor(combo);source.style.setProperty('--combo-color',color);
 const animations=[],duration=quiet?650:1000;let clone=null,cancelled=false,blocked=false;
 const finish=()=>{clone?.remove();doc.removeEventListener('visibilitychange',onVisibility);if(flights.get(root)===control)flights.delete(root);};
 const cancel=()=>{cancelled=true;animations.forEach(a=>a.cancel());finish();};
 const control={animations,duration,cancel,get blocked(){return blocked;},set blocked(v){blocked=v;}};
 const onVisibility=()=>{if(doc.hidden)cancel();};doc.addEventListener('visibilitychange',onVisibility);
 if(!quiet){const number=source.querySelector('strong'),origin=number.getBoundingClientRect(),target=slot.getBoundingClientRect();
  clone=doc.createElement('div');clone.className='combo-number-flight';clone.setAttribute('aria-hidden','true');clone.textContent=String(combo)+'×';clone.style.setProperty('--combo-color',color);clone.style.left=(origin.left+origin.width/2)+'px';clone.style.top=(origin.top+origin.height/2)+'px';clone.style.fontSize=Math.min(120,Math.max(64,origin.height))+'px';container.append(clone);
  const rect=clone.getBoundingClientRect();animations.push(clone.animate(comboNumberFlightFrames(rect,target),{duration:640,delay:360,fill:'both',easing:'cubic-bezier(.2,.6,.3,1)'}));
 }
 const base='translate(-50%,-50%)';const pop=source.animate(quiet?[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}]:[{opacity:0,transform:base+' scale(.45) rotate(-10deg)',filter:'brightness(1)'},{opacity:1,transform:base+' scale(1.16) rotate(-5deg)',filter:'brightness(1.65)',offset:.1},{opacity:1,transform:base+' scale(.98) rotate(-2deg)',filter:'brightness(1)',offset:.22},{opacity:1,transform:base+' scale(1.08) rotate(2deg)',filter:'brightness(1.55)',offset:.36},{opacity:0,transform:base+' scale(1.02)',filter:'brightness(1)',offset:.58},{opacity:0,transform:base+' scale(1)'}],{duration,easing:'ease-out'});animations.push(pop);flights.set(root,control);
 Promise.all(animations.map(a=>a.finished)).then(()=>{finish();if(!cancelled&&!quiet&&!doc.hidden)hitPulse(parts(root).box,false);},finish);return control;
}

const frames=new Map();
export function spinningStarSvg(frame=0){
 const f=((Math.floor(frame)%48)+48)%48;if(frames.has(f))return frames.get(f);
 const angle=f*Math.PI/24,cs=Math.cos(angle),sn=Math.sin(angle),tilt=-.23;
 const ring=(r,z)=>Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.46:r,x=Math.cos(a)*rr,y=Math.sin(a)*rr;const tx=x+z*.32,ty=y*Math.cos(tilt)-z*Math.sin(tilt);return [50+tx*cs-ty*sn,50+tx*sn+ty*cs,y*Math.sin(tilt)+z*Math.cos(tilt)];});
 const front=ring(36,7),back=ring(36,-7),inner=ring(29,10),faces=[];
 const add=(p,fill)=>faces.push({p,fill,z:p.reduce((s,v)=>s+v[2],0)/p.length});
 add(back,'#9c3824');for(let i=0;i<10;i++){const j=(i+1)%10;add([front[i],back[i],back[j],front[j]],i<5?'#e97c07':'#9c3824');add([front[i],front[j],inner[j],inner[i]],i>5?'#ffffe0':'#f7bf6f');}add(inner,'#ffd95a');
 const svg='<svg viewBox="0 0 100 100" aria-hidden="true">'+faces.sort((a,b)=>a.z-b.z).map(o=>'<polygon points="'+o.p.map(p=>p.slice(0,2).map(n=>n.toFixed(2)).join(',')).join(' ')+'" fill="'+o.fill+'" stroke="#591d35" stroke-width=".65" stroke-linejoin="round"/>').join('')+'</svg>';frames.set(f,svg);return svg;
}
export function flyStar({document:doc,slot,container,reduced=false}){
 const node=doc.createElement('div');node.className='star-flight gv-star-flight';node.innerHTML=spinningStarSvg(0);container.append(node);
 const dest=slot.getBoundingClientRect(),origin=node.getBoundingClientRect(),dx=dest.left+dest.width/2-origin.left-origin.width/2,dy=dest.top+dest.height/2-origin.top-origin.height/2;
 let alive=true,start=performance.now(),last=-1;const spin=now=>{if(!alive)return;const frame=reduced?0:Math.floor((now-start)/1000*36)%48;if(frame!==last){node.innerHTML=spinningStarSvg(frame);last=frame;}requestAnimationFrame(spin);};requestAnimationFrame(spin);
 const a=node.animate(reduced?[{opacity:0},{opacity:1,offset:.3},{opacity:0}]:[{opacity:0,transform:'scale(.35)'},{opacity:1,transform:'translate(-32px,-24px) scale(1.2)',offset:.22},{opacity:1,transform:`translate(${dx*.35}px,${dy*.35-55}px) scale(.85)`,offset:.55},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.2)`}],{duration:1150,easing:'cubic-bezier(.2,.7,.3,1)'});
 a.finished.then(()=>{alive=false;node.remove();},()=>{alive=false;node.remove();});return node;
}
