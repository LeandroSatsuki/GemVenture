import {PET_ROSTER} from './pet-companion-roster.js';
import {defaultOutfit,validOutfit} from './miner-outfit.js';
const HOME=['wall','floor','table','shelf','corner'],PUBLIC=['publicA','publicB','publicC'];
export const HOME_SLOTS=Object.freeze([...HOME,...PUBLIC]);
const item=(id,name,slots,visual,unlock='base')=>Object.freeze({id,name,slots:Object.freeze(slots),visual:Object.freeze(visual),unlock,cost:0});
export const DECOR_CATALOG=Object.freeze([
 item('wood-panels','Parede de madeira',['wall'],{kind:'surface',material:'wood'}),
 item('stone-wall','Parede de pedra',['wall'],{kind:'surface',material:'stone'}),
 item('stone-floor','Piso de pedra',['floor'],{kind:'surface',material:'stone'}),
 item('wood-floor','Piso de madeira',['floor'],{kind:'surface',material:'wood'}),
 item('supply-crate','Caixa de suprimentos',['table','corner',...PUBLIC],{kind:'procedural',type:'crate'}),
 item('blue-sample','Quartzo de coleção',['shelf','table',...PUBLIC],{kind:'approved',assetId:'quartz-b1'}),
 item('green-corner','Planta do lar',['corner',...PUBLIC],{kind:'refuge',assetId:'green-tree'}),
 item('stone-sample','Pedra de coleção',['shelf','corner',...PUBLIC],{kind:'approved',assetId:'rock-1-b1'}),
 ...Array.from({length:7},(_,i)=>item('biome-memory-'+(i+1),'Lembrança do bioma '+(i+1),['shelf','table',...PUBLIC],{kind:'approved',assetId:'quartz-b'+(i+1),biome:i},'boss-'+((i+1)*5)))
]);
export const PET_CATALOG=PET_ROSTER;
const baseOwned=()=>DECOR_CATALOG.filter(d=>d.unlock==='base').map(d=>d.id);
export const createHomeCollection=()=>({version:1,owned:baseOwned(),placements:Object.fromEntries(HOME_SLOTS.map(k=>[k,null])),pets:[],activePet:null,cared:[],look:'miner-default',outfit:defaultOutfit()});
export function validHomeCollection(c){return !!c&&c.version===1&&Array.isArray(c.owned)&&c.owned.every(id=>DECOR_CATALOG.some(d=>d.id===id))&&Array.isArray(c.pets)&&c.pets.every(id=>PET_CATALOG.some(p=>p.id===id))&&Array.isArray(c.cared)&&c.cared.every(id=>c.pets.includes(id))&&c.look==='miner-default'&&validOutfit(c.outfit)&&(!c.activePet||c.pets.includes(c.activePet))&&c.placements&&HOME_SLOTS.every(slot=>c.placements[slot]===null||c.owned.includes(c.placements[slot])&&DECOR_CATALOG.some(d=>d.id===c.placements[slot]&&d.slots.includes(slot)))&&Object.keys(c.placements).every(slot=>HOME_SLOTS.includes(slot));}
export const restoreHomeCollection=raw=>raw===undefined?createHomeCollection():structuredClone(raw);
export function collectionView(s){const c=s.homeCollection;if(!validHomeCollection(c))return {supported:false,slots:[],decor:[],pets:[],activePet:null,characterLooks:[]};return {supported:true,slots:[...HOME_SLOTS],placements:{...c.placements},decor:DECOR_CATALOG.map(d=>({...d,owned:c.owned.includes(d.id)})),pets:PET_CATALOG.map(p=>({...p,owned:c.pets.includes(p.id),cared:c.cared.includes(p.id)})),activePet:c.activePet,characterLooks:[{id:'miner-default',owned:true,equipped:true}]};}
export function placeDecoration(s,slot,id){const c=s.homeCollection;if(s.run||!validHomeCollection(c)||!HOME_SLOTS.includes(slot)||id!==null&&(!c.owned.includes(id)||!DECOR_CATALOG.find(d=>d.id===id)?.slots.includes(slot)))return {ok:false,reason:'Encaixe indisponível'};c.placements[slot]=id;return {ok:true,events:[{type:'decorationPlaced',slot,id}]};}
export function equipPet(s,id){const c=s.homeCollection;if(s.run||!validHomeCollection(c)||id!==null&&!c.pets.includes(id))return {ok:false,reason:'Escolha no refúgio'};c.activePet=id;return {ok:true,events:[{type:'petEquipped',id}]};}
export function carePet(s,id){const c=s.homeCollection;if(s.run||!validHomeCollection(c)||!c.pets.includes(id))return {ok:false};if(!c.cared.includes(id))c.cared.push(id);return {ok:true,events:[{type:'petCare',id}]};}
export function equippedPet(s){if(!validHomeCollection(s.homeCollection))return null;const id=s.run?s.run.petId:s.homeCollection.activePet;return s.homeCollection.pets.includes(id)?PET_CATALOG.find(p=>p.id===id)||null:null;}
export function petEffects(s){const p=equippedPet(s);return {tonic:p?.id==='slime-friend'?.2:0,rhythm:p?.id==='bat-friend'?.5:0};}
