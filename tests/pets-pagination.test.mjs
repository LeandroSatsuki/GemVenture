import test from 'node:test';
import assert from 'node:assert/strict';
import {PET_PAGE_SIZE,petPage} from '../dist/pets-selection.js';
import {PET_ROSTER} from '../dist/pet-companion-roster.js';
import {petsMarkup} from '../dist/pets-view.js';
import {createState} from '../dist/core.js';
import {petPortraitFit} from '../dist/pet-art-runtime.js';
import {PET_ART_DEFINITIONS} from '../dist/pet-art-catalog.js';
const items=PET_ROSTER.map(p=>({id:p.id,tier:p.rarity}));
test('collection pages eight then two, preserving order and all identities',()=>{
 const before=JSON.stringify(items),first=petPage(items),second=petPage(items,{page:1,selected:first.selected});
 assert.equal(PET_PAGE_SIZE,8);assert.equal(first.pages,2);assert.equal(first.visible.length,8);assert.equal(second.visible.length,2);
 assert.deepEqual([...first.visible,...second.visible],items.map(p=>p.id));assert.equal(second.selected,'mizu');assert.equal(JSON.stringify(items),before);
 assert.equal(petPage(items,{page:50}).page,1);assert.equal(petPage(items,{page:-1}).page,0);
});
test('rarity filters handle every tier, empty results and stale pages without leaking another tier',()=>{
 for(const filter of ['comum','incomum','raro','epico','lendario']){
  const p=petPage(items,{filter,page:10,selected:'slime-friend'});assert.equal(p.page,0);assert.deepEqual(p.visible,items.filter(p=>p.tier===filter).map(p=>p.id));assert.ok(p.visible.includes(p.selected));
 }
 assert.deepEqual(petPage(items,{filter:'missing'}),{page:0,pages:1,total:0,visible:[],selected:null});
 assert.ok(PET_ROSTER.every(p=>p.rarity));assert.equal(PET_ROSTER.find(p=>p.id==='cadencio').rarity,'lendario');
});
test('first paint already paginated, including when the equipped pet is on page two; reads never mutate save',()=>{
 for(const id of ['slime-friend','cadencio']){
  const s=createState(41001);s.homeCollection.pets=[id];s.homeCollection.activePet=id;const before=JSON.stringify(s),html=petsMarkup(s);
  const cards=[...html.matchAll(/<article class="gv-pets__card [^>]+>/g)],visible=cards.filter(m=>!m[0].includes('hidden'));
  assert.equal(visible.length,id==='cadencio'?2:8);assert.ok(visible.some(m=>m[0].includes('data-pet-card="'+id+'"')));assert.equal(JSON.stringify(s),before);
  assert.match(html,/aria-label="Próxima página de pets"/);assert.doesNotMatch(html,/data-pet-tier="unknown"/);
 }
});
test('detail and card share the pet-to-pedestal ratio and identical grounded transform for every species',()=>{
 for(const pet of Object.values(PET_ART_DEFINITIONS)){
  const rig=pet.views.presentation,small=petPortraitFit(rig,120,72,72-32.4+32.4*.28),large=petPortraitFit(rig,240,144,144-64.8+64.8*.28);
  assert.ok(Math.abs(large.k/small.k-2)<1e-8,pet.id);assert.ok(Math.abs(large.y-small.y*2)<1e-8,pet.id);
 }
});
