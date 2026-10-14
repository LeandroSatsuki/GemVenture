import {MATERIALS} from './materials.js';
export function createLoot(){return{crystals:Array.from({length:4},()=>({count:0,gems:0})),rocks:{count:0,gems:0},enemies:{count:0,gems:0},essence:0};}
const amount=n=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
// Saved gem rewards are distributed without losing fractions or crediting twice.
export function returnRewards(loot,bag,kept,materials=null){
 if(materials){const coins=returnRewards({...loot,crystals:[]},bag,kept);return [...materials.flatMap((n,i)=>n?[{id:'material-'+i,name:MATERIALS[i].name,art:'crystal',kind:i,count:n,gross:n,value:n,destination:'material-'+i}]:[]),...coins];}
 const labels=['Quartzos','Prismas','Geodos','Cristais vitais'];
 const groups=labels.map((name,kind)=>({id:'crystal-'+kind,name,art:'crystal',kind,count:amount(loot?.crystals?.[kind]?.count),gross:amount(loot?.crystals?.[kind]?.gems),destination:'bank'}));
 groups.push({id:'rocks',name:'Rochas escavadas',art:'rock',kind:0,count:amount(loot?.rocks?.count),gross:amount(loot?.rocks?.gems),destination:'bank'},{id:'enemies',name:'Criaturas derrotadas',art:'golem',kind:0,count:amount(loot?.enemies?.count),gross:amount(loot?.enemies?.gems),destination:'bank'});
 const tracked=groups.reduce((sum,g)=>sum+g.gross,0);if(bag>tracked)groups.push({id:'other',name:'Outras gemas',art:'crystal',kind:0,count:0,gross:bag-tracked,destination:'bank'});
 const total=groups.reduce((sum,g)=>sum+g.gross,0),saved=amount(kept);let allocated=0;
 for(const g of groups){const share=total?saved*g.gross/total:0;g.value=Math.floor(share);g.remainder=share-g.value;allocated+=g.value;}
 const ranked=[...groups].sort((a,b)=>b.remainder-a.remainder);for(let i=0;i<saved-allocated;i++)ranked[i%ranked.length].value++;
 const result=groups.filter(g=>g.gross>0).map(({remainder,...g})=>g);
 if(amount(loot?.essence))result.push({id:'essence',name:'Essências',art:'crystal',kind:1,count:amount(loot.essence),value:amount(loot.essence),destination:'essence'});
 return result.length?result:[{id:'empty',name:'Gemas salvas',art:'crystal',kind:0,count:0,value:0,destination:'bank'}];
}
