import {salvageRetention} from './core.js';
import {openingBalance} from './balance.js';
// Display the existing withdrawal rules, including the opening expedition's rounding.
export function retreatSummary(state){
 const run=state?.run;if(!run)return null;
 const ratio=salvageRetention(state),round=openingBalance(run).salvageBonus>0?n=>Math.ceil(n-1e-8):Math.floor;
 const coins=round(run.bag*ratio),materials=run.materials.map(n=>round(n*ratio));
 return {ratio,coins,lostCoins:run.bag-coins,materials,crystals:materials.reduce((sum,n)=>sum+n,0),lostCrystals:run.materials.reduce((sum,n)=>sum+n,0)-materials.reduce((sum,n)=>sum+n,0)};
}
