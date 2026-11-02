import {PET_ART_DEFINITIONS,petArtSpec} from './pet-art-catalog.js';
import {drawPetArt,preloadPetPortraits} from './pet-art-runtime.js';
export const LOBBY_PET_ART=Object.freeze(Object.fromEntries(Object.entries({...PET_ART_DEFINITIONS,'slime-friend':PET_ART_DEFINITIONS.pingo,'bat-friend':PET_ART_DEFINITIONS.pipisco}).map(([id,p])=>[id,{source:'pet-'+p.id+'-v2',revision:2,front:p.views.presentation.clips.pose.url,motion:p.views.presentation.clips.idle.url,frames:48,seconds:4}])));
export const LOBBY_PET_EMBEDDED=Object.freeze({});
export function lobbyPetMarkup(id){const art=petArtSpec(id);return art?'<span class="pet-companion-art" data-pet-preview="'+id+'"><img src="'+art.views.presentation.clips.pose.url+'" alt=""><canvas aria-hidden="true"></canvas></span>':'';}
export function paintLobbyPet(c,id,x,y,size,time,reduced=false){
 if(!petArtSpec(id))return false;
 c.save();c.globalAlpha*=.2;c.fillStyle='#183454';c.beginPath();c.ellipse(x,y+2,size*.105,size*.022,0,0,Math.PI*2);c.fill();c.restore();
 return drawPetArt(c,id,x,y,size/64,{view:'presentation',time,reduced});
}
if(typeof Image!=='undefined')preloadPetPortraits();
