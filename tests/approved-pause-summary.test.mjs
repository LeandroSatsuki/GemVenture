import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,cardDetail,cardLimit} from '../dist/cards.js';
import {createState,startRun,power} from '../dist/core.js';
import {pauseCardSummary} from '../dist/approved-pause-summary.js';

const profile=()=>{const s=createState(712);startRun(s);return s;};
const numbers=text=>text.match(/\d+(?:[,.]\d+)?/g)||[];
test('all real cards retain canonical stacked numbers at every allowed level, without flavor paragraphs',()=>{
 const s=profile();
 for(const card of CARDS)for(let level=1;level<=cardLimit(card,s);level++){
  s.run.cards={[card.id]:level};
  const [row]=pauseCardSummary(s),detail=cardDetail(card,level,power(s),0,s);
  assert.equal(row.id,card.id);assert.equal(row.name,card.name);assert.equal(row.level,level);
  assert.equal(row.detail,detail);assert.deepEqual(numbers(row.effect),numbers(detail),card.id+' level '+level);
  assert.ok(row.icon.includes('<img')&&row.icon.includes('assets/card-art/'),card.id+' uses the official card miniature');
  assert.ok(!row.effect.includes(card.text));assert.ok(!row.effect.includes('→'));
 }
});
test('probability caps, gradual fire and low-health condition stay explicit',()=>{
 const s=profile();s.run.cards={lucky:16,shell:4,ice:5,ember:3,secondwind:4};
 const rows=Object.fromEntries(pauseCardSummary(s).map(r=>[r.id,r]));
 assert.match(rows.lucky.effect,/60%.*×2/);assert.match(rows.shell.effect,/−60%/);
 assert.match(rows.ice.effect,/40%.*inimigo −45%/);assert.equal(rows.ember.effect,'18 fogo gradual');
 assert.match(rows.secondwind.effect,/vida\/golpe · vida <40%/);
});
test('healing, seed acceleration, actual power and spent extra lives use the current profile',()=>{
 const s=profile();s.run.cards={muscle:8,popcorn:3,candy:4,sprouts:2,revival:4};s.run.cardRevives=3;
 const rows=()=>Object.fromEntries(pauseCardSummary(s).map(r=>[r.id,r]));
 assert.match(rows().candy.effect,/11,2 vida\/cristal/);
 assert.equal(rows().revival.effect,'1 vida extra · volta com 30 vida');
 assert.equal(rows().sprouts.effect,'+50% crescimento');
 s.equipped.push('seed');assert.equal(rows().sprouts.effect,'+100% crescimento');
 const previous=rows().popcorn.effect;s.run.cards.muscle=16;assert.notEqual(rows().popcorn.effect,previous);
 s.run.cardRevives=4;assert.match(rows().revival.effect,/^0 vidas extras/);
});
test('empty/absent runs stay empty and summaries never mutate cards or profile',()=>{
 assert.deepEqual(pauseCardSummary(null),[]);const s=profile();assert.deepEqual(pauseCardSummary(s),[]);
 s.run.cards={muscle:2,popcorn:1,ice:0};const before=structuredClone(s);
 assert.deepEqual(pauseCardSummary(s).map(r=>r.id),['muscle','popcorn']);assert.deepEqual(s,before);
});
