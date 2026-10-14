import * as E from '../dist/core.js';
import {playNoviceFloor} from '../tests/novice-player.mjs';
import {beatTime} from '../dist/score.js';
import {pickRecipe,wellRecipe} from '../dist/materials.js';
const seeds=[43,71,88,123,229,391,712,991,2026,4019];
const cases=[];
for(const floor of [1,2,4,6])for(const seed of seeds){
 const s=E.createState(seed);s.seals=6;s.best=floor;s.descent.bosses=[5,10,15,20,25,30,35];E.startRun(s);s.run.floor=floor;E.generateRoom(s);
 const result=playNoviceFloor(s);cases.push({floor,seed,...result,seconds:Math.round(beatTime(floor,result.beats))});
}
const repeated=[];
for(const seed of seeds.slice(0,5)){
 const s=E.createState(seed),attempts=[];
 for(let i=0;i<4;i++){
  E.startRun(s);const result=playNoviceFloor(s);if(s.run)E.finishRun(s,result.cleared?'return':'retreat');
  const before=s.level;while(E.purchaseUpgrade(s)){}if(!s.unlocked.includes('ear'))E.learn(s,'ear');if(!s.unlocked.includes('force'))E.learn(s,'force');
  attempts.push({...result,pickaxe:s.level,upgrades:s.level-before,bank:s.bank,savedMaterials:[...s.materials]});
 }
 repeated.push({seed,attempts});
}
const totals=[1,2,4,6].map(floor=>{const a=cases.filter(x=>x.floor===floor);return{floor,clears:a.filter(x=>x.cleared).length,samples:a.length,medianSeconds:a.map(x=>x.seconds).sort((a,b)=>a-b)[5],meanDamage:Math.round(a.reduce((sum,x)=>sum+x.damageTaken,0)/a.length)};});
const continuous=[];
for(const seed of seeds){
 const s=E.createState(seed),floors=[];E.startRun(s);
 while(s.run&&s.run.floor<=5){
  const floor=s.run.floor,result=playNoviceFloor(s);floors.push({floor,...result});
  if(!result.cleared||floor===5)break;
  const priorities=s.run.health<60?['candy','shell','vampire','muscle','ricochet']:['muscle','ricochet','popcorn','candy','shell'];
  const offer=s.run.cardOffer;const card=priorities.find(id=>offer.includes(id))||offer[0];E.chooseCard(s,card);if(!E.descend(s))break;
 }
 continuous.push({seed,floors});
}
console.log(JSON.stringify({assumptions:'visible targets, 7% off-beat inputs, 10% ignored warnings, no lookahead, no preloaded build; continuous runs select earned cards and keep health',totals,firstPickaxe:{coins:E.upgradeCost(E.createState(1)),materials:pickRecipe(E.createState(1))},firstHealth:{coins:E.coreCost(E.createState(1)),materials:wellRecipe(E.createState(1))},cases,repeated,continuous},null,2));
