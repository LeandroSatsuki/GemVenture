import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createState,SKILLS} from '../dist/core.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {liftScreenMarkup} from '../dist/lift-view.js';
import {ABYSS_GATE_COST,depositGate,canEnterAbyss} from '../dist/descent-progress.js';
import {BLESSINGS,RELICS} from '../dist/pillars.js';
import {ASTRAL_RELICS} from '../dist/astral.js';

test('V2AB browses all known campaign floors without changing the actual profile',()=>{
 const s=createState(41);s.best=35;s.seals=6;s.descent.stops=Array.from({length:35},(_,i)=>i+1);
 s.descent.records[11]={points:7654,clears:3};const before=JSON.stringify(s);
 for(let floor=1;floor<=35;floor++){
  const vm=liftHostPresentationModel(s,floor,'floors');
  assert.equal(vm.selectedFloor,floor);assert.equal(vm.visualCatalog.length,7);
  assert.equal(vm.floors.length,5);assert.equal(vm.actions.depart.enabled,true);
  assert.equal(vm.selected.performance.bestTimeMs,null);assert.equal(vm.selected.performance.lastScore,null);
  assert.equal(vm.selected.stars.earned,null,'run score stars are not invented floor ratings');
  assert.equal(vm.selected.rewards.catalog.available,true);
  if(vm.selected.boss)assert.equal(vm.art.boss.scene[0].name,vm.selected.name);
 }
 assert.equal(JSON.stringify(s),before);
 assert.match(liftScreenMarkup(s,11),/7\.654 PTS/);
});

test('V2AB keeps discovery and stop restrictions while hiding unknown floor rewards',()=>{
 const s=createState(8);s.best=2;const before=JSON.stringify(s);
 const vm=liftHostPresentationModel(s,5);
 assert.equal(vm.biomeCards.length,1);assert.equal(vm.selected.reached,false);
 assert.equal(vm.selected.rewards.catalog.available,false);
 const html=liftScreenMarkup(s,5);
 assert.doesNotMatch(html,/data-depart=|data-stop=|REI GEODO|Floresta Esquecida/);
 assert.equal(JSON.stringify(s),before);
});

test('V2AB product Abyss uses real gate conditions, not the illustrative test fixture',()=>{
 const s=createState();let html=liftScreenMarkup(s,1,'abyss');
 assert.equal(canEnterAbyss(s),false);assert.match(html,/id="abyssStart" disabled/);
 assert.match(html,/ACESSO BLOQUEADO/);assert.match(html,/id="abyssDetails"/);
 assert.equal((html.match(/class="gv-v2-abyss-reward-tile"/g)||[]).length,3);
 assert.doesNotMatch(html,/abyss-reward-chest|abyss-reward-scroll|is-reference/);
 s.materials=[2000,1500,1200,900];assert.equal(depositGate(s,0),100);
 let vm=liftHostPresentationModel(s,1,'abyss');assert.equal(vm.abyss.materials[0].deposited,100);
 assert.equal(vm.abyss.materials[0].remaining,1400);assert.equal(vm.abyss.materials[0].deposit,100);
 s.descent.gate=[...ABYSS_GATE_COST];assert.equal(canEnterAbyss(s),false);
 s.descent.bosses=[20];vm=liftHostPresentationModel(s,1,'abyss');
 assert.equal(vm.abyss.canEnter,true);assert.equal(vm.abyss.referenceFixture,undefined);
 html=liftScreenMarkup(s,1,'abyss');assert.match(html,/ACESSO LIBERADO/);
 assert.doesNotMatch(html,/id="abyssStart" disabled/);
 assert.match(html,/r2-gate-hero/);assert.match(html,/data-gate-material="0" data-gate-ratio="1"/);
});

test('release has the same real Abyss gate locally and on the hosted game',()=>{
 const previous=globalThis.location;globalThis.location={hostname:'127.0.0.1'};
 try{const s=createState(),vm=liftHostPresentationModel(s,1,'abyss');
  assert.equal(vm.abyss.testAccess,false);assert.equal(vm.abyss.canEnter,false);
  const html=liftScreenMarkup(s,1,'abyss');assert.match(html,/ACESSO BLOQUEADO/);assert.match(html,/COMO LIBERAR/);
  assert.match(html,/is-product/);assert.doesNotMatch(html,/is-reference|abyss-reward-chest|abyss-reward-scroll/);
 }finally{if(previous===undefined)delete globalThis.location;else globalThis.location=previous;}
});

test('preparation shows actual blessings, historical and astral relics, and equipped skills only',()=>{
 const s=createState();s.pendingBlessing=BLESSINGS[0].id;s.pendingBlessingLevel=1;
 s.relics=[RELICS[0].id];s.astral.equipped=[ASTRAL_RELICS[0].id];s.equipped=[SKILLS[0].id];
 const before=JSON.stringify(s),vm=liftHostPresentationModel(s,1,'abyss');
 assert.equal(vm.abyss.preparation.blessing.id,s.pendingBlessing);
 assert.ok(vm.abyss.preparation.relics.some(r=>r.id===RELICS[0].id));
 assert.ok(vm.abyss.preparation.relics.some(r=>r.id===ASTRAL_RELICS[0].id));
 assert.ok(vm.abyss.preparation.skills.some(k=>k.id===SKILLS[0].id));
 assert.equal(JSON.stringify(s),before);
});

test('V2AB source and host keep one style reference and real deposit/scroll integration hooks',()=>{
 const index=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.equal((index.match(/href="rebrand-lift\.css"/g)||[]).length,1);
 const run=fs.readFileSync(new URL('../dist/run.js',import.meta.url),'utf8');
 assert.match(run,/\.gv-v2-survival-art \.r2-gate-hero, \.gate-art/);
 assert.match(run,/querySelector\('\.gv-v2-abyss'\)/);
 assert.match(run,/if\(canEnterAbyss\(s\)\)begin\('abyss'\)/);
 assert.match(run,/depositGate\(s,Number\(b\.dataset\.gate\)\)/);
});
