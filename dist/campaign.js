export const FLOORS_PER_BIOME=5;
export const TOTAL_FLOORS=35;
export const BIOME_COUNT=TOTAL_FLOORS/FLOORS_PER_BIOME;
export const CAMPAIGN_VERSION=2;
export const biomeIndex=floor=>Math.max(0,Math.min(BIOME_COUNT-1,Math.floor((floor-1)/FLOORS_PER_BIOME)));
export const depthLimit=s=>(s.seals+1)*FLOORS_PER_BIOME;
export const bossFloor=index=>(index+1)*FLOORS_PER_BIOME;
// Old four-floor runs keep their room, loot and boss; only their map position changes.
export const legacyFloor=floor=>floor>0?Math.floor((floor-1)/4)*5+(floor%4||5):0;
