import {avoidPinnedMission} from './hud-pinned-panel.js';
import {sentinelStatus} from './sentinel-presentation.js';
const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
export function updateMinibossHud(root,run){
 let host=root.querySelector('.cave-miniboss-hud');if(!host){const doc=root.ownerDocument;if(!doc.getElementById('caveMinibossStyles')){const link=doc.createElement('link');link.id='caveMinibossStyles';link.rel='stylesheet';link.href=new URL('./cave-miniboss-hud.css',import.meta.url).href;doc.head.append(link);}host=doc.createElement('div');host.className='cave-miniboss-hud';host.innerHTML='<section class="gv-sentinel cave-miniboss-status" aria-label="Sentinela do Veio" hidden><div class="gv-sentinel-head"><strong>Sentinela do Veio</strong><span></span></div><div class="cave-miniboss-life" role="progressbar" aria-label="Vida da Sentinela do Veio" aria-valuemin="0"><i></i></div><div class="gv-sentinel-details"><span></span><b></b></div></section><div class="gv-sentinel cave-miniboss-warning" role="status" hidden><div class="gv-sentinel-head"><strong>Sentinela próxima</strong><span>Opcional</span></div></div>';root.append(host);}
 const view=sentinelStatus(run),status=host.querySelector('.cave-miniboss-status'),warning=host.querySelector('.cave-miniboss-warning');status.hidden=!view||view.state==='near';warning.hidden=view?.state!=='near';
 if(!view||view.state==='near')return;
 text(status.querySelector('.gv-sentinel-head span'),view.state==='engaged'?'Em combate':'Opcional');text(status.querySelector('.gv-sentinel-details span'),view.state==='engaged'?'Afaste-se para recuar':'Golpeie para enfrentar');text(status.querySelector('.gv-sentinel-details b'),view.hp+' / '+view.max);
 const bar=status.querySelector('[role=progressbar]');bar.setAttribute('aria-valuemax',String(view.max));bar.setAttribute('aria-valuenow',String(view.hp));bar.querySelector('i').style.width=view.ratio*100+'%';
}
export function layoutMinibossHud(root){
 const host=root?.querySelector('.cave-miniboss-hud');if(!host||root.hidden)return;
 const rect=root.getBoundingClientRect(),scale=rect.width/root.clientWidth;if(!(scale>0))return;
 const bounds=selector=>{const el=root.querySelector(selector),r=el?.getBoundingClientRect();return el?.gvHudBaseBounds||(r?.width&&!el.hidden?{left:(r.left-rect.left)/scale,right:(r.right-rect.left)/scale,top:(r.top-rect.top)/scale,bottom:(r.bottom-rect.top)/scale}:null);};
 const combo=bounds('.combo'),location=bounds('.location'),vital=bounds('.vital'),breath=bounds('.breath'),mission=bounds('.mission'),width=root.clientWidth;
 const left=Math.max(12,(combo?.right||0)+12,(vital?.right||0)+12),right=Math.min(width-12,(location?.left||width)-12),available=right-left;
 const band=available>=270,w=band?Math.min(396,available):Math.min(396,width-24),x=band?left+(available-w)/2:(width-w)/2,y=band?12:Math.max(combo?.bottom||0,location?.bottom||0,vital?.bottom||0,breath?.bottom||0)+12;
 const panel=[...host.children].find(e=>!e.hidden),position=panel?.dataset?.hudAdjusted==='true'?{x,y,width:w}:avoidPinnedMission({x,y,width:w},panel?.offsetHeight||0,mission);
 host.style.setProperty('--sentinel-left',position.x+'px');host.style.setProperty('--sentinel-top',position.y+'px');host.style.setProperty('--sentinel-width',position.width+'px');
 root.style.setProperty('--sentinel-mission-offset','0px');
}
