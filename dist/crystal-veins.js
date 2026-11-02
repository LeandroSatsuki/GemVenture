import {CRYSTAL_VEIN_DATA} from './crystal-vein-data.js';
// Geological veins only. Collected gems keep their independent cut-gem family.
export const CRYSTAL_VEIN_STYLE=Object.freeze({revision:5,projection:'gemventure-cave-v1',components:6,outline:.38,cacheLimit:252});
export const CRYSTAL_VEIN_RAMPS=Object.freeze([
 ['#287cb8','#245473','#183454','#2fbfcd'],
 ['#ce2029','#9c3824','#591d35','#f27f72'],
 ['#e97c07','#c94814','#9c3824','#ffd95a'],
 ['#5dae27','#288a3f','#005a41','#a2e66f']
].map(Object.freeze));
const cache=new Map();
export function crystalVeinShapes({variant=0,biome=0,j=0}={}){
 variant=(Number(variant)>>>0)%4;biome=(Number(biome)>>>0)%7;j=Math.max(-4,Math.min(4,Math.round(Number(j)||0)));
 const key=variant+':'+biome+':'+j;if(cache.has(key))return cache.get(key);
 const ramp=CRYSTAL_VEIN_RAMPS[variant],colors={'#287cb8':ramp[0],'#245473':ramp[1],'#183454':ramp[2],'#2fbfcd':ramp[3]};
 // A bounded uniform size variation preserves the cave basis and ground pivot.
 const scale=1+biome*.002+j*.0015,matrix=Object.freeze([scale,0,0,scale,50*(1-scale),96*(1-scale)]);
 const shapes=Object.freeze(CRYSTAL_VEIN_DATA.map(s=>Object.freeze({...s,fill:colors[s.fill]||s.fill,stroke:colors[s.stroke||s.fill]||s.stroke||s.fill,strokeWidth:s.stroke ? .38 : .09,matrix})));
 if(cache.size>=CRYSTAL_VEIN_STYLE.cacheLimit)cache.delete(cache.keys().next().value);cache.set(key,shapes);return shapes;
}
