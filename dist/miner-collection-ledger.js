// Optional presentation adapter for the audited cumulative machine ledger.
// Covers settlement on save/background/show/frame without changing those payments.
import {minerAccruedSince,minerCollectionReceipt} from './miner-collection-contract.js';
const zero=()=>[0,0,0,0];
export class MinerCollectionLedger{
 constructor(currentCrystals,{initialPaidGain=zero()}={}){
  const current=minerAccruedSince(zero(),currentCrystals).nextBaseline;
  const initial=minerCollectionReceipt({gain:initialPaidGain,events:[]}).gain;
  this.seen=current.map((n,k)=>n-initial[k]);
  if(this.seen.some(n=>n<0))throw new RangeError('Initial paid gain exceeds cumulative machine ledger');
  this.sequence=0;
 }
 reconcile(currentCrystals,fx,{origin=null}={}){
  const receipt=minerAccruedSince(this.seen,currentCrystals);
  // Lower historical totals mean a changed/reset game context, never new loot.
  // Caller must explicitly create a new presentation context; do not hide reset.
  if(receipt.reset)return {accepted:false,reset:true,gain:[...receipt.gain],queued:false};
  if(!receipt.prizes.length){this.seen=[...receipt.nextBaseline];return {accepted:true,reset:false,gain:[...receipt.gain],queued:false};}
  const sequence=this.sequence+1,result=fx.enqueue({sequence,prizes:receipt.prizes},{origin});
  if(!result.accepted)throw new Error('Do not mix a ledger stream with independent receipt producers');
  // Advance the cursor only after the protected visual channel accepted credit.
  this.seen=[...receipt.nextBaseline];this.sequence=sequence;
  return {accepted:true,reset:false,gain:[...receipt.gain],queued:true,sequence};
 }
 status(){return {seen:[...this.seen],sequence:this.sequence};}
}
