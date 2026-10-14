// One permanent outfit: the miner owns the pieces, not an item inventory.
export const GEAR_ITEMS=Object.freeze([
 {id:'helmet',name:'Capacete',icon:'helmet',colors:[0,2]},
 {id:'chest',name:'Peitoral',icon:'chest',colors:[0,2,3]},
 {id:'pants',name:'Calça',icon:'pants',colors:[0,2]},
 {id:'boots',name:'Botas',icon:'boots',colors:[0,3]},
 {id:'necklace',name:'Colar',icon:'necklace',colors:[0,1,2,3]},
 {id:'ring',name:'Anel',icon:'ring',colors:[0,1,2,3]},
 {id:'backpack',name:'Mochila',icon:'backpack',colors:[0,2,3]},
 {id:'pickaxe',name:'Picareta',icon:'force',colors:[1]}
]);
export const GEAR_TRAITS=Object.freeze([
 {id:'steady',kind:0,name:'Pulso firme',label:'MENOS FÔLEGO PERDIDO',unit:'%',step:.8,items:['helmet','chest','pants','boots','necklace']},
 {id:'breath',kind:0,name:'Fôlego vivo',label:'FÔLEGO POR ACERTO',unit:'',step:.12,items:['helmet','boots','necklace','ring','backpack']},
 {id:'stride',kind:0,name:'Passo leve',label:'MOVIMENTO',unit:'',step:1,maxRank:3,items:['pants','boots','backpack']},
 {id:'sight',kind:0,name:'Olho da mina',label:'CAMPO DE VISÃO',unit:'%',step:2,items:['helmet','necklace','ring','backpack']},
 {id:'force',kind:1,name:'Golpe rubro',label:'DANO DA PICARETA',unit:'%',step:.8,items:['pickaxe','ring','necklace']},
 {id:'boss',kind:1,name:'Caça-titãs',label:'DANO EM CHEFES',unit:'%',step:1.2,items:['pickaxe','ring','necklace']},
 {id:'crystal',kind:1,name:'Corte de gema',label:'DANO EM CRISTAIS',unit:'%',step:1.5,items:['pickaxe','ring']},
 {id:'rock',kind:1,name:'Quebra-rocha',label:'DANO EM PEDRAS',unit:'%',step:2,items:['pickaxe','ring']},
 {id:'blast',kind:1,name:'Faísca rubra',label:'CHANCE DE EXPLOSÃO',unit:'%',step:1,items:['pickaxe','necklace']},
 {id:'guard',kind:2,name:'Placa firme',label:'MENOS DANO RECEBIDO',unit:'%',step:.5,items:['helmet','chest','pants','backpack']},
 {id:'health',kind:2,name:'Coração de pedra',label:'VIDA MÁXIMA',unit:'',step:1.5,items:['helmet','chest','pants','necklace','ring']},
 {id:'retention',kind:2,name:'Fecho seguro',label:'SAQUE SALVO NA MORTE',unit:'%',step:.5,items:['chest','ring','backpack']},
 {id:'tonic',kind:3,name:'Seiva vital',label:'CURA DAS POÇÕES',unit:'%',step:1,items:['chest','necklace','backpack']},
 {id:'yield',kind:3,name:'Bolso fértil',label:'CRISTAIS COLETADOS',unit:'%',step:.6,items:['boots','ring','backpack']},
 {id:'siphon',kind:3,name:'Sopro verde',label:'VIDA POR CRIATURA',unit:'',step:.3,items:['chest','necklace','ring']}
]);
const item=id=>GEAR_ITEMS.find(x=>x.id===id),trait=id=>GEAR_TRAITS.find(x=>x.id===id);
export const createGear=()=>({version:1,items:Object.fromEntries(GEAR_ITEMS.map(x=>[x.id,{traits:[null,null],strain:0}])),pending:null});
export const gearSlotOpen=(s,index)=>index===0||index===1&&(s.forge?.levels?.armor||0)>=20;
export const gearPool=(piece,kind)=>GEAR_TRAITS.filter(x=>x.kind===kind&&x.items.includes(piece));
const validTrait=(x,piece)=>x===null||!!x&&typeof x==='object'&&!Array.isArray(x)&&!!trait(x.id)&&trait(x.id).items.includes(piece)&&x.kind===trait(x.id).kind&&Number.isInteger(x.rank)&&x.rank>=1&&x.rank<=(trait(x.id).maxRank||10);
export function restoreGear(raw){
 if(!raw||raw.version!==1||!raw.items||typeof raw.items!=='object'||Array.isArray(raw.items)||Object.keys(raw.items).length!==GEAR_ITEMS.length||!GEAR_ITEMS.every(({id})=>{const p=raw.items[id];return p&&Array.isArray(p.traits)&&p.traits.length===2&&p.traits.every(x=>validTrait(x,id))&&(!p.traits[0]||!p.traits[1]||p.traits[0].id!==p.traits[1].id)&&Number.isSafeInteger(p.strain)&&p.strain>=0&&p.strain<=100000;}))return null;
 const q=raw.pending;if(q!==null&&(!q||!item(q.piece)||![0,1].includes(q.index)||!item(q.piece).colors.includes(q.kind)||!Array.isArray(q.options)||q.options.length<1||q.options.length>3||q.options.some(x=>!validTrait(x,q.piece)||x.kind!==q.kind)||new Set(q.options.map(x=>x.id)).size!==q.options.length))return null;
 return structuredClone(raw);
}
export function migrateArmorSet(old){
 const gear=createGear(),ids=[['steady','breath'],['force','boss'],['guard','health'],['tonic','yield']];
 if(!old||old.version!==1||!Array.isArray(old.slots)||old.slots.length!==4||!Array.isArray(old.rolls)||old.rolls.length!==4||old.rolls.some(n=>!Number.isSafeInteger(n)||n<0||n>100000)||old.slots.some((x,i)=>x!==null&&(!ids[i].includes(x.id)||!Number.isInteger(x.rank)||x.rank<1||x.rank>6||typeof x.critical!=='boolean')))return null;
 const map={steady:'helmet',breath:'boots',force:'pickaxe',boss:'pickaxe',guard:'chest',health:'chest',tonic:'necklace',yield:'backpack'};
 for(const oldTrait of old.slots){if(!oldTrait)continue;const piece=map[oldTrait.id],def=trait(oldTrait.id),slot=gear.items[piece].traits.findIndex(x=>x===null);if(slot>=0)gear.items[piece].traits[slot]={id:def.id,kind:def.kind,rank:oldTrait.rank};}
 if(old.pending!==null){const q=old.pending;if(!q||!Number.isInteger(q.kind)||q.kind<0||q.kind>3||!ids[q.kind].includes(q.id)||!Number.isInteger(q.rank)||q.rank<1||q.rank>6||typeof q.critical!=='boolean')return null;const piece=map[q.id],index=gear.items[piece].traits[0]?1:0;gear.pending={piece,index,kind:q.kind,options:[{id:q.id,kind:q.kind,rank:q.rank}]};}
 return gear;
}
export function gearRollCost(s,piece,index,kind){const p=s.forge?.gear?.items?.[piece];if(!p||![0,1].includes(index)||!gearSlotOpen(s,index)||!item(piece)?.colors.includes(kind)||!gearPool(piece,kind).some(x=>!p.traits.some(t=>t?.id===x.id)))return null;const level=s.forge.levels.armor||0;return {crystals:Math.ceil(30+level*.7+p.strain*5),coins:Math.ceil(450+level*20+p.strain*75)};}
export function rollGear(s,piece,index,kind,random=Math.random){const p=s.forge?.gear?.items?.[piece],cost=gearRollCost(s,piece,index,kind);if(s.run||!cost||!p||s.forge.gear.pending||p.strain>=100000||s.bank<cost.coins||s.materials[kind]<cost.crystals)return null;const pool=gearPool(piece,kind).filter(x=>!p.traits.some(t=>t?.id===x.id));if(!pool.length)return null;const choices=[...pool],options=[],count=Math.min(3,choices.length);for(let i=0;i<count;i++){const a=random(),b=random();if(!Number.isFinite(a)||a<0||a>=1||!Number.isFinite(b)||b<0||b>=1)return null;const def=choices.splice(Math.floor(a*choices.length),1)[0];options.push({id:def.id,kind,rank:b<.12?2:1});}s.materials[kind]-=cost.crystals;s.bank-=cost.coins;p.strain++;s.forge.gear.pending={piece,index,kind,options};return s.forge.gear.pending;}
export function chooseGearTrait(s,choice){const g=s.forge?.gear,q=g?.pending;if(s.run||!q||!Number.isInteger(choice)||choice<0||choice>=q.options.length)return false;g.items[q.piece].traits[q.index]={...q.options[choice]};g.pending=null;return true;}
export function discardGearRoll(s){if(s.run||!s.forge?.gear?.pending)return false;s.forge.gear.pending=null;return true;}
export function gearUpgradeCost(s,piece,index){const p=s.forge?.gear?.items?.[piece],t=p?.traits?.[index];if(!t||t.rank>=(trait(t.id)?.maxRank||10)||!gearSlotOpen(s,index))return null;const level=s.forge.levels.armor||0;return {kind:t.kind,crystals:Math.ceil(22+level*.5+t.rank*16+p.strain*4),coins:Math.ceil(350+level*15+t.rank*170+p.strain*65),chance:Math.max(.3,.9-(t.rank-1)*.055-p.strain*.002)};}
export function upgradeGearTrait(s,piece,index,random=Math.random){const p=s.forge?.gear?.items?.[piece],cost=gearUpgradeCost(s,piece,index);if(s.run||!p||!cost||s.forge.gear.pending||p.strain>=100000||s.bank<cost.coins||s.materials[cost.kind]<cost.crystals)return null;const a=random();if(!Number.isFinite(a)||a<0||a>=1)return null;s.bank-=cost.coins;s.materials[cost.kind]-=cost.crystals;p.strain++;const success=a<cost.chance,critical=success&&a<cost.chance*.08;if(success)p.traits[index].rank=Math.min(trait(p.traits[index].id).maxRank||10,p.traits[index].rank+(critical?2:1));return {success,critical,rank:p.traits[index].rank};}
export function clearGearTrait(s,piece,index){const g=s.forge?.gear,p=g?.items?.[piece];if(s.run||!p||![0,1].includes(index)||g.pending||!p.traits[index])return false;p.traits[index]=null;return true;}
export function gearBonuses(s){const b=Object.fromEntries(GEAR_TRAITS.map(t=>[t.id,0]));for(const {id} of GEAR_ITEMS)for(const t of s.forge?.gear?.items?.[id]?.traits||[])if(t){const def=trait(t.id);if(def)b[t.id]+=def.step*t.rank;}for(const key of Object.keys(b))b[key]=Number(b[key].toFixed(3));return b;}
export function gearTraitText(t){if(!t)return 'VAZIO';const def=trait(t.id);if(!def)return 'VAZIO';const n=Number((t.rank*def.step).toFixed(2));return '+'+n.toLocaleString('pt-BR')+def.unit+' '+def.label;}
