import {P} from './palette.js';
import {biomeIndex} from './campaign.js';
export const CREATURE_COLORS=[
 [[P.cyan,P.blue],[P.blue,P.deepBlue],[P.cyan,P.deepTeal]],
 [[P.lime,P.green],[P.green,P.forest],[P.wood,P.clay]],
 [[P.sand,P.clay],[P.silver,P.slate],[P.sand,P.clay]],
 [[P.orange,P.red],[P.pink,P.plum],[P.orange,P.red]],
 [[P.pink,P.plum],[P.lemon,P.green],[P.steel,P.plum]],
 [[P.ochre,P.clay],[P.gold,P.wood],[P.clay,P.bark]],
 [[P.lime,P.green],[P.sand,P.ochre],[P.orange,P.clay]]
];
const names=[['Gosma de quartzo','Morcego de safira','Guardião de geodo'],['Gosma de esporos','Morcego de folhas','Guardião de raízes'],['Gosma de âmbar','Morcego ossudo','Guardião fóssil'],['Gosma de magma','Morcego de brasa','Guardião de obsidiana'],['Gosma micelial','Mariposa de esporos','Colosso de fungos'],['Gosma de argila','Morcego de âmbar','Guardião das tocas'],['Gosma de broto','Mariposa da horta','Guardião da colheita']];
const abilities=['Deixa uma poça. Saia de cima!','Dispara em linha reta. Desvie!','Esmaga ao redor. Afaste-se!'];
export const BIOME_CREATURES=names.map((row,biome)=>row.map((name,kind)=>({id:biome+':'+kind,name,kind,biome,color:CREATURE_COLORS[biome][kind][0],ability:abilities[kind],drop:['tonic','ward','blast'][kind]})));
export const creatureFor=(floor,kind)=>BIOME_CREATURES[biomeIndex(floor)][kind];
