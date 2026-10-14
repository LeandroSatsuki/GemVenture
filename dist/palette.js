// HEPT32 by ENDESGA. One palette for every scene, asset, interface and effect.
export const PALETTE_SOURCE='https://lospec.com/palette-list/hept32';
export const PALETTE_NAME='HEPT32';
export const P=Object.freeze({black:'#000000',ink:'#180d2f',slate:'#353658',gray:'#686b72',steel:'#8b97b6',silver:'#c5cddb',white:'#ffffff',cyan:'#5ee9e9',blue:'#2890dc',deepBlue:'#1831a7',deepTeal:'#053239',forest:'#005f41',green:'#08b23b',lime:'#47f641',lemon:'#e8ff75',sand:'#fbbe82',ochre:'#de9751',clay:'#b66831',wood:'#8a4926',bark:'#461c14',coal:'#1e090d',maroon:'#720d0d',rust:'#813704',red:'#da2424',orange:'#ef6e10',gold:'#ecab11',yellow:'#ece910',blush:'#f78d8d',pink:'#f94e6d',rose:'#c12458',plum:'#841252',aubergine:'#3d083b'});
export const PALETTE=Object.freeze(Object.values(P));
export const GEM_RAMPS=Object.freeze([[P.cyan,P.blue],[P.pink,P.rose],[P.yellow,P.gold],[P.lime,P.green]].map(Object.freeze));
export const BIOME_ART=Object.freeze([
 {floor:P.slate,patch:P.deepBlue,rock:P.steel,shade:P.slate,edge:P.ink,accent:P.cyan},
 {floor:P.deepTeal,patch:P.forest,rock:P.green,shade:P.forest,edge:P.ink,accent:P.lime},
 {floor:P.bark,patch:P.wood,rock:P.ochre,shade:P.clay,edge:P.coal,accent:P.sand},
 {floor:P.aubergine,patch:P.maroon,rock:P.rose,shade:P.plum,edge:P.ink,accent:P.orange},
 {floor:P.deepTeal,patch:P.plum,rock:P.slate,shade:P.forest,edge:P.ink,accent:P.pink},
 {floor:P.wood,patch:P.bark,rock:P.ochre,shade:P.clay,edge:P.coal,accent:P.yellow},
 {floor:P.forest,patch:P.wood,rock:P.clay,shade:P.deepTeal,edge:P.ink,accent:P.orange}
].map(Object.freeze));
