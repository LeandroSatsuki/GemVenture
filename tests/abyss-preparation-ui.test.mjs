import test from 'node:test';import assert from 'node:assert/strict';
import {createState,SKILLS} from '../dist/core.js';
import {abyssPreparationView,preparationSkillGlyph} from '../dist/approved-abyss-preparation.js';
test('preparation reads rank effects, separates passive and relic origins and never changes the profile',()=>{
 const s=createState(712);s.unlocked=['fury','breath',...SKILLS.filter(k=>k.passive).map(k=>k.id)];s.equipped=['fury','breath'];s.skillRanks={fury:3,breath:2};s.relics=['aurora'];s.astral.owned=['scholar'];s.astral.equipped=['scholar'];s.pendingBlessing='might';s.pendingBlessingLevel=4;s.pendingBlessingRoll={version:1,tier:1,risk:1};const before=structuredClone(s),v=abyssPreparationView(s);
 assert.match(v.skills.find(k=>k.id==='fury').text,/×5/);assert.match(v.skills.find(k=>k.id==='breath').text,/\+6/);assert.equal(v.skills.filter(k=>!k.passive).length,2);assert.equal(v.skills.filter(k=>k.passive).length,SKILLS.filter(k=>k.passive).length);assert.equal(v.relics.filter(k=>k.founder).length,1);assert.equal(v.relics.filter(k=>!k.founder).length,1);assert.match(v.blessing.good,/20%/);assert.match(v.blessing.risk,/40%/);assert.deepEqual(s,before);
});
test('skills and founding relics with the same ID have distinct selection keys; all current glyphs resolve',()=>{
 const s=createState();s.unlocked=['echo'];s.equipped=['echo'];s.relics=['echo'];const v=abyssPreparationView(s);assert.equal(v.skills[0].key,'skill:echo');assert.equal(v.relics[0].key,'relic:echo');for(const skill of SKILLS)assert.match(preparationSkillGlyph(skill),/<svg/);
});
test('empty preparation and unknown history do not fabricate equipment or records; zero remains zero',()=>{
 const s=createState();const v=abyssPreparationView(s,{bestMeters:0,maxWave:0,leaderboard:{label:'Sem registro'}});assert.deepEqual(v.skills,[]);assert.deepEqual(v.relics,[]);assert.equal(v.blessing,null);assert.equal(v.bestMeters,0);assert.equal(v.maxWave,0);assert.equal(abyssPreparationView(s).maxWave,null);
});
