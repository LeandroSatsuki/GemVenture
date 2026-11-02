// Only newly generated campaign opening rooms opt in. Existing active rooms keep
// their stored HP/value and their original spawn rules until the next room.
export const OPENING_MINING_VERSION=1;
const CURVE=Object.freeze([
 {crystals:[2,2,2,2],rocks:[2,2,3],values:[3,3,3,3]},
 {crystals:[3,4,5,3],rocks:[3,4,5],values:[3,7,12,4]},
 {crystals:[5,7,10,5],rocks:[4,6,9],values:[4,10,19,5]},
 {crystals:[7,11,18,9],rocks:[6,10,15],values:[4,13,27,6]}
].map(p=>Object.freeze(Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Object.freeze(v)])))));
export const openingMiningEligible=run=>run?.mode==='floors'&&Number.isInteger(run.floor)&&run.floor>=1&&run.floor<=4;
export const openingMiningProfile=run=>openingMiningEligible(run)&&run.room?.openingMining===OPENING_MINING_VERSION?CURVE[run.floor-1]:null;
export const openingCrystalHp=(run,kind,native)=>openingMiningProfile(run)?.crystals[kind]??native;
export const openingRockHp=(run,kind,native)=>openingMiningProfile(run)?.rocks[kind]??native;
export const openingCrystalValue=(run,kind,native)=>openingMiningProfile(run)?.values[kind]??native;
