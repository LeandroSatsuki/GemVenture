// Zag is retired from cave generation. Keep these adapters so old saves and
// existing callers load without recreating the NPC or discarding progression.
export const inZagArea=()=>false;
export function placeCaveZag(run){delete run.room.caveZag;delete run.room.zagShop;return null;}
export function migrateCaveZag(run){delete run.room.caveZag;delete run.room.zagShop;}
export const validCaveZag=run=>run.room.caveZag===undefined&&run.room.zagShop===undefined;
