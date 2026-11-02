import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createState,startRun} from '../dist/core.js';
import {CARDS} from '../dist/cards.js';
import {cardHudMarkup} from '../dist/card-hud.js';
import {APPROVED_CARD_RASTERS} from '../dist/card-art-registry.js';
import {approvedCardArt} from '../dist/approved-interface-icons.js';
const state=()=>{const s=createState(712);startRun(s);return s;};
test('active card miniatures use official artwork, real levels and accessible effects without changing the profile',()=>{
 const s=state();s.run.cards=Object.fromEntries(CARDS.map(c=>[c.id,1]));s.run.cards.muscle=4;const before=structuredClone(s),html=cardHudMarkup(s);
 for(const c of CARDS){assert.ok(html.includes('data-hud-card="'+c.id+'"'));assert.ok(html.includes('src="'+APPROVED_CARD_RASTERS[c.id]+'"'));assert.ok(html.includes(c.name));}
 assert.equal((html.match(/<article/g)||[]).length,CARDS.length);assert.match(html,/Nv\. 4/);assert.match(html,/aria-label=/);assert.match(html,/loading="lazy"/);assert.doesNotMatch(html,/<svg/);assert.deepEqual(s,before);
});
test('extra-life rows show the level and retain remaining lives in the description; empty runs stay empty',()=>{
 assert.equal(cardHudMarkup(null),'');const s=state();assert.equal(cardHudMarkup(s),'');s.run.cards={revival:3,ice:0};s.run.cardRevives=2;assert.match(cardHudMarkup(s),/>Nv\. 3<\/b>/);assert.match(cardHudMarkup(s),/1 vida extra/);assert.doesNotMatch(cardHudMarkup(s),/data-hud-card="ice"/);s.run.cardRevives=7;assert.match(cardHudMarkup(s),/0 vidas extras/);
});
test('all canonical card consumers resolve PNGs and retired vector payloads are absent from the shipped module',async()=>{
 for(const [id,url]of Object.entries(APPROVED_CARD_RASTERS)){const html=approvedCardArt(id);assert.ok(html.includes(url));assert.doesNotMatch(html,/<svg/);}
 const source=await readFile(new URL('../dist/approved-interface-icons.js',import.meta.url),'utf8');assert.doesNotMatch(source,/"cartas\//);
});
