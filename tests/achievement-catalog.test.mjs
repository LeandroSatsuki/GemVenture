import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../dist/steam-achievements.json',import.meta.url),'utf8'));
test('Steam preparation contains exactly 30 easy and 20 hard achievements with stable measurable criteria',()=>{
 const list=catalog.achievements;assert.equal(list.length,50);assert.equal(new Set(list.map(a=>a.id)).size,50);assert.equal(list.filter(a=>a.difficulty==='easy').length,30);assert.equal(list.filter(a=>a.difficulty==='very_hard').length,20);
 for(const a of list){assert.match(a.id,/^ACH_[A-Z0-9_]+$/);assert.ok(a.name&&a.description&&a.metric);assert.ok(Number.isInteger(a.target)&&a.target>0);assert.ok(['cumulative','single_run','single_floor','snapshot'].includes(a.scope));}assert.match(catalog.status,/sem integração/);
});
test('prestige and perfect-run achievement requirements do not depend on current wallet or random relic acquisition',()=>{
 const list=catalog.achievements;assert.equal(list.find(a=>a.id==='ACH_STARS_200').metric,'performance_stars_earned');assert.equal(list.find(a=>a.id==='ACH_FULL_DESCENT_UNTOUCHED').metric,'full_campaign_no_health_damage');assert.ok(list.every(a=>!['stars','bank','astral_rolls','astral_owned'].includes(a.metric)));
});
