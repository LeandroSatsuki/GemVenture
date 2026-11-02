import {MATERIALS} from './materials.js';
import {ABYSS_GATE_COST,gateProgress} from './descent-progress.js';
// Final consumer frame: producer's full 100x88 export, uniform source fit exactly once.
// Existing material indices 0..3 map to left pillar, left lintel, right lintel, right pillar.
export const GATE_HERO_FRAME=Object.freeze({width:100,height:88});
export const GATE_HERO_SOCKETS=Object.freeze([{"material":0,"rect":[13.828202581926515,50.67428003972194,22.042701092353525,58.7020854021847]},{"material":1,"rect":[21.109235352532274,18.28301886792453,33.524329692154915,23.230387288977163]},{"material":2,"rect":[60.50148957298907,18.28301886792453,72.72989076464746,23.230387288977163]},{"material":3,"rect":[75.15690168818271,50.67428003972194,83.2780536246276,58.7020854021847]}].map(s=>Object.freeze({...s,rect:Object.freeze(s.rect)})));
const image=(role,w,h)=>'<img class="r2-gate-image" src="assets/abyss-gate-r2/gate-'+role+'-1x-v01.png" srcset="assets/abyss-gate-r2/gate-'+role+'-1x-v01.png 1x, assets/abyss-gate-r2/gate-'+role+'-2x-v01.png 2x, assets/abyss-gate-r2/gate-'+role+'-4x-v01.png 4x" width="'+w+'" height="'+h+'" alt="" aria-hidden="true">';
export function gateNavArt(){return image('nav',24,26);}
export function gateHeroArt(s){
 const percent=Math.floor(gateProgress(s)*100),label='Portão do Abismo, '+percent+'% preenchido. '+MATERIALS.map((m,i)=>m.name+': '+s.descent.gate[i]+' de '+ABYSS_GATE_COST[i]).join('; ');
 const fills=GATE_HERO_SOCKETS.map(({material:i,rect:[left,top,right,bottom]})=>{const ratio=Math.max(0,Math.min(1,s.descent.gate[i]/ABYSS_GATE_COST[i]));return '<rect data-gate-material="'+i+'" data-gate-ratio="'+ratio+'" x="'+left+'" y="'+top+'" width="'+((right-left)*ratio)+'" height="'+(bottom-top)+'" rx=".6" fill="'+MATERIALS[i].color+'"/>';}).join('');
 return '<div class="r2-gate-hero" role="img" aria-label="'+label+'">'+image('hero',100,88)+'<svg class="r2-gate-sockets" viewBox="0 0 100 88" width="100" height="88" aria-hidden="true" focusable="false">'+fills+'</svg></div>';
}
