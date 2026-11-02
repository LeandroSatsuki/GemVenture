// Read-only material presentation. Does not award, mutate or promise future loot.
import {minerTile,minerKind,minerRare,MINER_CREDIT_MS} from './miner.js';
export const minerRowBiome=row=>Math.floor(Math.max(0,row)/70)%4;
export function minerCellAppearance(m,row,col,pending=null){
 const type=pending?.tile??minerTile(m,row,col),kind=Number.isInteger(pending?.kind)?pending.kind:minerKind(m,row);
 const resource=['stone','dense','crystal'].includes(type),rareHint=type==='stone'&&minerRare(m,row,col);
 return {row,col,type,drawType:type==='crystal'?'stone':type,kind,biome:minerRowBiome(row),resource,
  // Deposits are mineral-bearing rocks, never a promise of paid gems.
  // Keep the real simulation type separate from its read-only drawing type.
  artType:resource?'rock':null,
  variant:type==='dense'?1:0,
  rareHint,temporaryCrystal:type==='crystal',
  paymentAuthority:'settleMiner gain / event crystalAmount; appearance never credits',
  reserveReady:m.oreCharge>=MINER_CREDIT_MS};
}
