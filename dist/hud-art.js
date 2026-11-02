import {MISSION_ART} from './approved-missions-assets.js';
import {HUD_ART} from './hud-art-registry.js';
import {approvedMissionGlyph} from './approved-interface-icons.js';
export function hudArt(id){
 const art=HUD_ART[id];if(!art)throw Error('Unknown HUD art slot: '+id);
 return art.url?`<span class="asset-slot" data-art="${id}" data-state="ready"><img src="${art.url}" alt="" draggable="false"></span>`:`<span class="asset-slot" data-art="${id}" data-state="pending" aria-label="${art.label}: arte pendente"><small>${art.label}<b>ARTE PENDENTE</b></small></span>`;
}
// Exact raster mapping of the existing Missions board. Other templates retain its approved glyph.
export const OBJECTIVE_ART={miner:'crystals',quartz:'quartz',prism:'ruby',geode:'topaz',vital:'emerald',rocks:'rocks',brute:'rocks',hunter:'slime',slime:'slime',guardians:'golem',bats:'bat',beats:'music',combo:'music',points:'trophy',items:'pulse-potion',bombs:'bomb',cures:'pulse-potion',floors:'stairs-floors',depth4:'stairs-floors',depth8:'stairs-floors'};
export function missionObjectiveArt(template){const id=OBJECTIVE_ART[template],url=MISSION_ART[id];return url?`<span class="asset-slot" data-mission="${template}"><img src="${url}" alt="" draggable="false"></span>`:`<span class="objective-glyph" data-approved-template="${template}">${approvedMissionGlyph(template)}</span>`;}
