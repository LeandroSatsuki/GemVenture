import {installGeodeAmbience} from './geode-ambience.js';
import {getVideoPreferences,toGeodeLightingOptions} from './video-preferences.js';
import {CAMPAIGN_CAVE_ART} from './campaign-cave-data.js';
import {biomeIndex} from './core.js';
const instances=new WeakMap();
export const supportsGeodeAmbience=scene=>!!(scene&&!scene.disposed&&!scene.error&&scene.room&&Number.isInteger(scene.biome)&&scene.biome>=0&&scene.biome<7&&scene.images&&(scene.surface||scene.room.abyssCave||scene.legacy)&&scene.data?.material);
export function ambientDecorations(world){return instances.get(world)?.adapter.decorations?.()||[];}
export function paintAmbientDecoration(world,c,item){instances.get(world)?.adapter.paintDecoration?.(c,item);}
export function releaseGeodeAmbience(world){const entry=instances.get(world);if(!entry)return;entry.adapter.dispose();instances.delete(world);}
// Run after the existing scene has warmed, before its first painted frame.
// Poll a scalar revision: dragging menu controls rebuilds caches at most once per frame.
export function syncGeodeAmbience(world,{run=null,preferences=getVideoPreferences(),install=installGeodeAmbience,makeCanvas}={}){
 let entry=instances.get(world),scene=world.campaignScene;
 if(!scene&&run?.room?.floorMask){const biome=biomeIndex(run.floor);scene=entry?.scene.legacy&&entry.scene.room===run.room&&entry.scene.biome===biome?entry.scene:{legacy:true,room:run.room,biome,images:new Map(),data:CAMPAIGN_CAVE_ART[biome]};scene.metrics={depth:run.abyss?.rows||0};}
 if(entry&&(entry.scene!==scene||entry.preferences!==preferences||!supportsGeodeAmbience(scene))){releaseGeodeAmbience(world);entry=null;}
 if(!supportsGeodeAmbience(scene))return null;
 const revision=preferences.getRevision();
 if(!entry){const adapter=install(world,{scene,makeCanvas,settings:toGeodeLightingOptions(preferences.getState())});entry={scene,adapter,preferences,revision};instances.set(world,entry);}
 else if(entry.revision!==revision){entry.adapter.set(toGeodeLightingOptions(preferences.getState()));entry.revision=revision;}
 return entry.adapter;
}
