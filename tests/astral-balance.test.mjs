import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {ASTRAL_COST,ASTRAL_RELICS,rollAstral,chooseAstral,equipAstral} from '../dist/astral.js';
import {progressionEffects} from '../dist/progression-effects.js';
import {depthDifficulty,mineralYield,rarePayment} from '../dist/balance.js';
import {heatState,secureCargo} from '../dist/frenzy.js';
import {forgeProject} from '../dist/forge.js';
import {sightRange} from '../dist/cavern.js';
test('30 different permanent echoes cost four stars, offer three unowned choices and cannot reroll an unpaid or pending offer',()=>{
 assert.equal(ASTRAL_RELICS.length,30);assert.equal(new Set(ASTRAL_RELICS.map(r=>r.effect)).size,30);const s=E.createState(15);s.stars=ASTRAL_COST-1;assert.equal(rollAstral(s),false);s.stars=ASTRAL_COST*2;assert.ok(rollAstral(s));assert.equal(s.stars,ASTRAL_COST);const offer=[...s.astral.offer];assert.equal(new Set(offer).size,3);assert.equal(rollAstral(s),false);
 const t=E.restoreState(JSON.stringify(s));assert.deepEqual(t.astral.offer,offer);assert.ok(chooseAstral(t,offer[0]));assert.equal(chooseAstral(t,offer[1]),false);assert.ok(rollAstral(t));assert.equal(t.astral.offer.includes(offer[0]),false);assert.equal(t.stars,0);
});
test('collection completes without duplicates, last offers shrink and equipment is limited to three',()=>{
 const s=E.createState(41);s.stars=ASTRAL_COST*30;for(let i=0;i<30;i++){assert.ok(rollAstral(s));assert.equal(s.astral.offer.length,Math.min(3,30-i));assert.ok(chooseAstral(s,s.astral.offer[0]));}assert.equal(s.astral.owned.length,30);assert.equal(s.astral.equipped.length,3);assert.equal(rollAstral(s),false);assert.equal(equipAstral(s,s.astral.owned[3]),false);assert.ok(equipAstral(s,s.astral.owned[0]));assert.ok(equipAstral(s,s.astral.owned[3]));assert.ok(E.restoreState(JSON.stringify(s)));
});
test('equipped rules really change starting supplies, healing, sight and runtime cache',()=>{
 const s=E.createState(7);s.astral.owned=['provisions','compass','spring','powder','first-light'];s.astral.equipped=['provisions','compass','spring'];assert.equal(progressionEffects(s).potion,.25);assert.ok(equipAstral(s,'spring'));assert.equal(progressionEffects(s).potion,0);equipAstral(s,'spring');E.startRun(s);assert.equal(s.run.items.tonic,2);assert.equal(E.tonicHealing(s),31.25);const plain=E.createState(7);E.startRun(plain);assert.ok(sightRange(s.run)>sightRange(plain.run));assert.equal(equipAstral(s,'spring'),false);assert.equal(rollAstral(s),false);
 const t=E.createState(7);t.astral.owned=['powder','first-light'];t.astral.equipped=[...t.astral.owned];E.startRun(t);assert.equal(t.run.items.blast,2);assert.equal(t.run.guardUntil,7);
});
test('rescue relic grants its tonic exactly once',()=>{
 const s=E.createState(6);s.astral.owned=['rescue-kit'];s.astral.equipped=['rescue-kit'];s.descent.gate=[1500,1200,1000,800];s.descent.bosses=[5,10,15,20,25];E.startRun(s,'abyss');s.run.abyss.checkpoint={section:3,until:40,used:false};s.run.beat=20;assert.ok(secureCargo(s));assert.equal(s.run.items.tonic,1);assert.equal(secureCargo(s),false);assert.equal(s.run.items.tonic,1);
});
test('heat loot is bounded and abyss difficulty never resets at a biome boundary',()=>{
 const s=E.createState(4);s.descent.gate=[1500,1200,1000,800];s.descent.bosses=[5,10,15,20,25];E.startRun(s,'abyss');const r=s.run;let previous=0;for(let section=1;section<=1000;section++){r.abyss.section=section;const d=depthDifficulty(r);assert.ok(d.health>previous);previous=d.health;r.beat=section*96;r.frenzy.mutator='glass';r.frenzy.buffs.magnet=r.beat+20;assert.ok(heatState(r).loot<=3.5);}assert.ok(mineralYield(100,100,100)<=434);assert.ok(mineralYield(100)<100);
});
test('rare vein total payout is independent of subdividing damage into tiny hits',()=>{
 const slow={maxHp:100},fast={maxHp:100};let a=0,b=0;for(let i=0;i<1000;i++)a+=rarePayment(slow,37,.1);for(let i=0;i<4;i++)b+=rarePayment(fast,37,25);assert.equal(a,37);assert.equal(a,b);const saved=JSON.parse(JSON.stringify(slow));assert.equal(rarePayment(saved,37,0),0);
});
test('old forge investments migrate once with excess refunded, owned ranks and legacy power intact',()=>{
 const s=E.createState(88);s.forge.version=2;s.forge.levels.anvil=99;s.forge.invested.anvil=Math.round(4800*1.075**97);s.forge.materials.anvil=[60,40,20,0].map(n=>Math.ceil(n*7*1.055**97));const previous=s.forge.invested.anvil,bank=s.bank,materials=[...s.forge.materials.anvil];const t=E.restoreState(JSON.stringify(s));assert.ok(t);assert.equal(t.forge.version,5);assert.equal(t.forge.levels.anvil,99);assert.equal(Object.keys(t.forge.gear.items).length,8);const p=forgeProject(t,'anvil');assert.equal(t.bank,bank+previous-p.cost);for(let i=0;i<4;i++)assert.equal(t.materials[i],Math.max(0,materials[i]-p.recipe[i]));const again=E.restoreState(JSON.stringify(t));assert.equal(again.bank,t.bank);assert.deepEqual(again.materials,t.materials);
});
