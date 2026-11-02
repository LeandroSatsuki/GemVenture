import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CARDS} from '../dist/cards.js';
import {ABYSS_RECOVERY_CARDS} from '../dist/abyss-cards.js';
import {APPROVED_CARD_RASTERS,approvedLargeCardArt} from '../dist/approved-card-raster.js';
import {approvedCardArt} from '../dist/approved-interface-icons.js';
import {journeyFloorCardsMarkup,journeyAbyssCardsMarkup} from '../dist/rebrand-journey-choices.js';
const manifest=JSON.parse(readFileSync(new URL('../dist/assets/card-art/manifest.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
test('approved canvases cover every common and recovery card with unchanged PNG bytes',()=>{
 assert.deepEqual(Object.keys(APPROVED_CARD_RASTERS).sort(),[...CARDS,...ABYSS_RECOVERY_CARDS].map(c=>c.id).sort());
 assert.equal(manifest.cards.length,24);
 for(const entry of manifest.cards){
  const file=readFileSync(new URL('../dist/'+APPROVED_CARD_RASTERS[entry.id],import.meta.url));
  assert.equal(createHash('sha256').update(file).digest('hex'),entry.sha256,entry.id);
  assert.equal(file.subarray(1,4).toString(),'PNG');
  assert.ok(file.readUInt32BE(16)>0&&file.readUInt32BE(20)>0);
 }
 assert.match(APPROVED_CARD_RASTERS.ice,/v02\.png$/);
});
test('common offers use approved images while retaining data actions, text and upgrade levels',()=>{
 for(const card of CARDS){
  const dto={...card,level:1,detail:'real effect <value>'},html=journeyFloorCardsMarkup([dto]);
  assert.ok(html.includes('data-card="'+card.id+'"'));
  assert.ok(html.includes('src="'+APPROVED_CARD_RASTERS[card.id]+'"'));
  assert.match(html,/real effect &lt;value&gt;/);
  assert.match(html,/MELHORAR · NÍVEL 2/);
  assert.equal(dto.level,1);
 }
});
test('Abismo preserves guarded selection, shortcuts and recovery labels with raster art',()=>{
 const cards=[...CARDS,...ABYSS_RECOVERY_CARDS].map(c=>({...c,instant:c.id.startsWith('abyss-')}));
 const html=journeyAbyssCardsMarkup(cards);
 assert.equal((html.match(/ disabled>/g)||[]).length,24);
 assert.equal((html.match(/class="approved-card-raster"/g)||[]).length,24);
 assert.equal((html.match(/EFEITO IMEDIATO/g)||[]).length,3);
 for(const [i,c] of cards.entries()){
  assert.ok(html.includes('data-abyss-card="'+c.id+'"'));
  assert.ok(html.includes('<kbd>'+(i+1)+'</kbd>'));
 }
});
test('compact card art uses canonical raster and unknown IDs stay rejected',()=>{
 assert.match(approvedCardArt('lantern'),/<img[^>]+src="assets\/card-art\/lantern-approved-v01\.png"/);assert.doesNotMatch(approvedCardArt('lantern'),/<svg/);
 for(const id of ['future-card','__proto__']){
  assert.throws(()=>approvedCardArt(id),RangeError);
  assert.throws(()=>approvedLargeCardArt(id),RangeError);
 }
});
