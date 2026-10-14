// Long-run economy: depth affects difficulty independently from the biome art.
export const ECONOMY_VERSION=2;
// A fixed depth curve, not hidden player-dependent difficulty. Introductory
// floors teach mining/dodging before normal biomes and the infinite Abyss.
const STANDARD_OPENING=Object.freeze({enemyHealth:1,materialHealth:1,rockHealth:1,incoming:1,windup:0,recovery:0,firstWave:16,quota:null,timing:0,salvageBonus:0});
const OPENING_FLOORS=Object.freeze([
 {enemyHealth:.42,materialHealth:.55,rockHealth:.65,incoming:.35,windup:1,recovery:2,firstWave:36,quota:18,timing:35,salvageBonus:.30},
 {enemyHealth:.48,materialHealth:.65,rockHealth:.75,incoming:.40,windup:1,recovery:1,firstWave:30,quota:24,timing:25,salvageBonus:.25},
 {enemyHealth:.62,materialHealth:.78,rockHealth:.86,incoming:.55,windup:0,recovery:1,firstWave:24,quota:28,timing:15,salvageBonus:.18},
 {enemyHealth:.80,materialHealth:.92,rockHealth:.96,incoming:.72,windup:0,recovery:0,firstWave:20,quota:34,timing:5,salvageBonus:.10}
].map(Object.freeze));
export const earlyFloorBalance=floor=>OPENING_FLOORS[floor-1]||STANDARD_OPENING;
export const openingBalance=run=>run&&run.mode!=='abyss'?earlyFloorBalance(run.floor):STANDARD_OPENING;
export function openingWave(floor,number){
 if(floor===1)return{count:Math.min(3,Math.max(1,number)),cap:4,interval:40,warning:4};
 if(floor===2)return{count:Math.min(3,1+Math.ceil(number/2)),cap:5,interval:36,warning:4};
 if(floor===3)return{count:Math.min(4,1+number),cap:7,interval:32,warning:4};
 if(floor===4)return{count:Math.min(6,2+number),cap:10,interval:28,warning:4};
 return null;
}
export function depthDifficulty(run){if(run?.mode!=='abyss')return {health:1,damage:1};const d=Math.max(0,(run.abyss?.section||1)-1);return {health:1+.045*d+.0015*d*d,damage:1+.055*Math.sqrt(d)+.004*d};}
export const mineralYield=(base,bonus=0,environment=1)=>Math.max(1,Math.round(base*.55*Math.min(2.25,1+Math.max(-.5,bonus))*Math.min(3.5,environment)));
export const projectCost=(base,level)=>Math.round(base*(1+.10*Math.max(0,level-2))**2);
export const forgeCoinCost=(level,base=35,slope=.075)=>Math.round(base*(1+slope*Math.max(0,level))**3);
export const rarePayment=(node,fullValue,actualDamage)=>{node.yieldFraction=(node.yieldFraction||0)+fullValue*actualDamage/node.maxHp;const whole=Math.floor(node.yieldFraction+1e-8),paid=whole-(node.yieldPaid||0);node.yieldPaid=whole;return Math.max(0,paid);};
