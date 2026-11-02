import {avoidPinnedMission} from './hud-pinned-panel.js';
import {livingBoss} from './bosses.js';
import {BIOME_ART} from './palette.js';

// Screen-space presentation only. Existing combat captions and IDs remain owned by run.js.
export function prepareBossHud(doc,hud){
 if(!hud)return;
 if(!doc.getElementById('bossHudStyles')){const link=doc.createElement('link');link.id='bossHudStyles';link.rel='stylesheet';link.href=new URL('./boss-hud.css',import.meta.url).href;doc.head.append(link);}
 const bar=hud.querySelector('.boss-health');bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-labelledby','bossName');
}
export function bossHeaderBounds(width,{combo,location,vital,breath,score}={}){
 const left=Math.max(12,(combo?.right||0)+12,(vital?.right||0)+12),right=Math.min(width-12,(location?.left||width)-12),available=right-left;
 const band=available>=250,fallbackRight=Math.min(width-12,(score?.left||width)-12),w=Math.min(480,band?available:fallbackRight-12);
 return {x:band?left+(available-w)/2:12+(fallbackRight-12-w)/2,y:band?12:Math.max(combo?.bottom||0,location?.bottom||0,vital?.bottom||0,breath?.bottom||0)+12,width:w};
}
export function updateBossPresentation(root,run){
 const hud=root?.querySelector('#bossHud');if(!hud||root.hidden)return;
 const boss=run&&livingBoss(run.room);
 if(!boss||hud.hidden){root.style.setProperty('--boss-mission-offset','0px');return;}
 const bar=hud.querySelector('.boss-health');bar.setAttribute('aria-valuemax',String(boss.maxHp));bar.setAttribute('aria-valuenow',String(Math.max(0,Math.ceil(boss.hp))));
 hud.style.setProperty('--boss',BIOME_ART[boss.bossIndex].accent);
 const rect=root.getBoundingClientRect(),scale=rect.width/root.clientWidth;if(!(scale>0))return;
 const bounds=selector=>{const el=root.querySelector(selector),r=el?.getBoundingClientRect();return el?.gvHudBaseBounds||(r?.width&&!el.hidden?{left:(r.left-rect.left)/scale,right:(r.right-rect.left)/scale,top:(r.top-rect.top)/scale,bottom:(r.bottom-rect.top)/scale}:null);};
 let {x,y,width}=bossHeaderBounds(root.clientWidth,{combo:bounds('.combo'),location:bounds('.location'),vital:bounds('.vital'),breath:bounds('.breath'),score:bounds('.score')});
 if(hud.dataset?.hudAdjusted!=='true')({x,y,width}=avoidPinnedMission({x,y,width},hud.offsetHeight,bounds('.mission')));
 hud.style.setProperty('--boss-left',x+'px');hud.style.setProperty('--boss-top',y+'px');hud.style.setProperty('--boss-width',width+'px');
 root.style.setProperty('--boss-mission-offset','0px');
}
