// GV-022 proposal only. No imports from the game, persistence, timers or payments.
const zero=()=>[0,0,0,0];
function amounts(value,name){if(!Array.isArray(value)||value.length!==4||value.some(n=>!Number.isSafeInteger(n)||n<0))throw new TypeError(name+' must contain four non-negative safe integers');return [...value];}
export function sumPaidEvents(events=[]){const paid=zero();for(const e of events){if(Number.isInteger(e.crystal)&&e.crystal>=0&&e.crystal<4&&Number.isSafeInteger(e.crystalAmount)&&e.crystalAmount>0){const total=paid[e.crystal]+e.crystalAmount;if(!Number.isSafeInteger(total))throw new RangeError('Payment total overflow');paid[e.crystal]=total;}}return paid;}
export function minerCollectionReceipt(result,{beforeCrystals,afterCrystals}={}){
 const gain=amounts(result.gain,'gain'),retained=sumPaidEvents(result.events||[]),sampled=sumPaidEvents((result.events||[]).slice(-4));
 let ledger=null;
 if(beforeCrystals!==undefined||afterCrystals!==undefined){const before=amounts(beforeCrystals,'beforeCrystals'),after=amounts(afterCrystals,'afterCrystals');ledger=after.map((n,i)=>n-before[i]);if(ledger.some(n=>n<0)||ledger.some((n,i)=>n!==gain[i]))throw new Error('Settlement gain differs from the isolated machine-ledger delta');}
 if(retained.some((n,i)=>n>gain[i]))throw new Error('Retained events exceed the paid aggregate');
 return Object.freeze({
  gain:Object.freeze(gain),ledger:ledger&&Object.freeze(ledger),
  prizes:Object.freeze(gain.flatMap((amount,kind)=>amount?[Object.freeze({type:'crystal-credit',kind,amount})]:[])),
  retained:Object.freeze(retained),sampled:Object.freeze(sampled),
  outsideRetained:Object.freeze(gain.map((n,i)=>n-retained[i])),
  outsideSampled:Object.freeze(gain.map((n,i)=>n-sampled[i]))
 });
}
export function minerAccruedSince(displayed,current){
 const before=amounts(displayed,'displayed'),after=amounts(current,'current'),reset=after.some((n,i)=>n<before[i]);
 const gain=reset?zero():after.map((n,i)=>n-before[i]);
 return Object.freeze({presentationOnly:true,reset,gain:Object.freeze(gain),prizes:Object.freeze(gain.flatMap((amount,kind)=>amount?[Object.freeze({type:'crystal-credit',kind,amount})]:[])),nextBaseline:Object.freeze(after)});
}
