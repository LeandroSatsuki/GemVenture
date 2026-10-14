import {P} from './palette.js';
// Ten appearances total: starter, then milestones 10, 20, …, 90. Level 100 keeps the final form.
export const PICKAXE_STYLES=Object.freeze([
 ['Ferro',P.steel,P.slate,P.clay],['Cobre',P.sand,P.ochre,P.wood],
 ['Quartzo',P.cyan,P.blue,P.wood],['Rubi',P.pink,P.rose,P.maroon],
 ['Topázio',P.yellow,P.gold,P.wood],['Esmeralda',P.lime,P.green,P.forest],
 ['Safira',P.blue,P.deepBlue,P.steel],['Ametista',P.pink,P.plum,P.slate],
 ['Solar',P.lemon,P.orange,P.gold],['Estelar',P.white,P.cyan,P.plum]
].map(([name,metal,shade,handle],i)=>Object.freeze({name,metal,shade,handle,level:i?i*10:1})));
export const pickaxeTier=level=>Math.max(0,Math.min(9,Math.floor((Number(level)||1)/10)));
export const nextPickaxeStyle=level=>PICKAXE_STYLES[pickaxeTier(level)+1]||null;
