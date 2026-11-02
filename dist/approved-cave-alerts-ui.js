import {CaveAlertModel} from './cave-alerts-model.js';
import {usesStairs} from './cave-descent.js';

export function createCaveAlerts({document:doc,onLayout=()=>{}}){
 const model=new CaveAlertModel(),win=doc.defaultView;let objective=null,box=null,link=null,observer=null,last=null,room=null,previousStage=null,arrivalKey=null,layoutKey='',accentMs=0;
 const animations=new Map();
 function mount(root){
  const next=root?.querySelector('#objective');if(!next)return false;
  if(!link){link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./approved-cave-alerts-ui.css',import.meta.url).href;link.addEventListener('load',onLayout);doc.head.append(link);}
  if(objective!==next){observer?.disconnect();box?.remove();objective=next;box=doc.createElement('div');box.dataset.caveAlerts='';box.hidden=true;box.setAttribute('aria-label','Perigos da caverna');
   box.innerHTML='<section data-alert-horde hidden><div class="gv-alert-line"><strong></strong><span></span></div><div class="gv-alert-track" role="progressbar" aria-label="Chegada da horda" aria-valuemin="0" aria-valuemax="100"><i></i></div></section><section data-alert-pressure hidden><div class="gv-alert-line"><strong></strong><span></span></div><div class="gv-alert-track" role="progressbar" aria-label="Aumento do perigo" aria-valuemin="0" aria-valuemax="100"><i></i></div><div class="gv-pressure-steps"><i></i><i></i><i></i></div></section>';
   objective.parentElement.append(box);objective.dataset.approvedAlerts='true';if(win.ResizeObserver){observer=new win.ResizeObserver(onLayout);observer.observe(objective);}onLayout();
  }
  return true;
 }
 const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 function bar(row,value,show){const track=row.querySelector('.gv-alert-track');track.hidden=!show;if(!show)return;const percent=Math.max(0,Math.min(100,value*100));track.querySelector('i').style.width=percent+'%';track.setAttribute('aria-valuenow',String(Math.round(percent)));}
 function accent(row,soft){animations.get(row)?.cancel();if(!soft){const animation=row.animate?.([{transform:'translateY(2px)',filter:'brightness(1.3)'},{transform:'translateY(0)',filter:'brightness(1)'}],{duration:200,easing:'ease-out'});if(animation){animations.set(row,animation);animation.onfinish=()=>{if(animations.get(row)===animation)animations.delete(row);};}}}
 return {
  accept(events,run){return model.accept(events,run);},
  frame(root,run,phase,{blocked=false,soft=false,now=0}={}){
   const delta=last===null?0:Math.max(0,Math.min(50,now-last));last=now;
   if(room!==run?.room){room=run?.room;previousStage=null;arrivalKey=null;accentMs=0;for(const a of animations.values())a.cancel();animations.clear();}
   const view=model.sample(run,phase),active=!!run&&!root?.hidden&&!doc.hidden,held=blocked||!active;
   if(!held){model.advance(delta);accentMs=Math.max(0,accentMs-delta);}
   if(!run||!root||root.hidden){if(box)box.hidden=true;return {attention:false};}
   if(!mount(root))return {attention:false};
   const reduced=soft||!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches,h=view.horde,p=view.pressure;
   // Do not infer a celebration from a restored pressure stage.
   const stage=p?.stage||0;if(previousStage!==null&&stage>previousStage){accent(box.querySelector('[data-alert-pressure]'),reduced);accentMs=200;}previousStage=stage;
   if(h?.state==='arrived'&&arrivalKey!==h.number){arrivalKey=h.number;accent(box.querySelector('[data-alert-horde]'),reduced);}
   const hRow=box.querySelector('[data-alert-horde]'),pRow=box.querySelector('[data-alert-pressure]');hRow.hidden=!h;pRow.hidden=!p;box.hidden=!h&&!p;
   if(h){text(hRow.querySelector('strong'),'Horda '+h.number);text(hRow.querySelector('span'),h.state==='warning'?Math.ceil(h.remaining)+' pulsos':h.count+' criaturas');bar(hRow,h.progress||0,h.state==='warning');}
   if(p){text(pRow.querySelector('strong'),p.state==='active'?'Dano inimigo':'Perigo');text(pRow.querySelector('span'),p.state==='active'?'+'+p.damagePercent+'%':Math.ceil(p.remaining)+' pulsos');pRow.dataset.danger=String(p.state==='active');bar(pRow,p.progress||0,p.state==='warning');const steps=pRow.querySelector('.gv-pressure-steps');steps.hidden=p.state!=='active';steps.setAttribute('aria-label','Pressão '+p.stage+' de 3');[...steps.children].forEach((e,i)=>e.dataset.on=String(i<p.stage));}
   if(usesStairs(run)){const title=objective.querySelector('small');if(title)text(title,title.textContent.toLocaleLowerCase('pt-BR').replace('encontre a descida','Encontre a descida').replace('pule no buraco','Pule no buraco').replace('buraco','Buraco').replace('derrote o chefe','Derrote o chefe').replace('descendo','Descendo'));}
   objective.dataset.alertsActive=String(!box.hidden);
   const key=String(!!h)+':'+String(!!p);if(key!==layoutKey){layoutKey=key;onLayout();}
   for(const animation of animations.values()){if(reduced)animation.cancel();else if(held&&animation.playState==='running')animation.pause();else if(!held&&animation.playState==='paused')animation.play();}
   return {attention:!!(h||p?.state==='warning'||accentMs>0)};
  },
  destroy(){observer?.disconnect();for(const a of animations.values())a.cancel();box?.remove();link?.remove();if(objective){delete objective.dataset.approvedAlerts;delete objective.dataset.alertsActive;}onLayout();},
 };
}
