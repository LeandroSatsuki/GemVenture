import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {RECORDS,RECORD_GENRES,buyRecord,equipRecord} from '../dist/records.js';
import {recordsMarkup} from '../dist/records-view.js';
import {covers} from '../dist/vitrola-assets.js';
const state=()=>({run:null,stars:0,records:{owned:['pulse'],active:'pulse'}});
const cards=html=>[...html.matchAll(/data-record-card="([^"]+)"/g)].map(x=>x[1]);
test('all 15 real records remain visible in the default catalog, no fictional bonuses',()=>{
 const s=state(),before=structuredClone(s),html=recordsMarkup(s);
 assert.equal(RECORDS.length,15);assert.deepEqual(cards(html),RECORDS.map(r=>r.id));assert.deepEqual(s,before);
 assert.doesNotMatch(html,/Bônus ativos|buffs permanentes|1 \/ 12|0 \/ 12/);
 assert.match(html,/Coleção <b>1 \/ 15/);
 for(const r of RECORDS)assert.ok(html.includes(r.name));
});
test('every real genre is a filter and isolates only its records',()=>{
 const s=state();for(const genre of RECORD_GENRES){const html=recordsMarkup(s,genre);assert.deepEqual(cards(html),RECORDS.filter(r=>genre==='TODOS'||r.genre===genre).map(r=>r.id));assert.equal([...html.matchAll(/aria-pressed="true"/g)].length,1);}
 assert.match(recordsMarkup(s,'missing'),/Nenhum disco neste gênero/);
});
test('each unowned record has its true cost and is disabled without enough stars',()=>{
 const s=state();for(const r of RECORDS.filter(r=>r.id!=='pulse')){const html=recordsMarkup(s,r.genre);assert.match(html,new RegExp('data-record="'+r.id+'" disabled'));assert.ok(html.includes(' '+r.cost+'</strong>'));}
});
test('purchase consumes exact stars once and updates active record and collection',()=>{
 const s=state();s.stars=500;assert.ok(buyRecord(s,'iron'));assert.equal(s.stars,498);assert.equal(s.records.active,'iron');assert.equal(buyRecord(s,'iron'),false);let html=recordsMarkup(s);
 assert.match(html,/Coleção <b>2 \/ 15/);assert.match(html,/data-record="iron" disabled>TOCANDO/);assert.match(html,/data-record="pulse" >TOCAR/);
 assert.ok(equipRecord(s,'pulse'));assert.equal(s.stars,498);html=recordsMarkup(s);assert.match(html,/data-record="pulse" disabled>TOCANDO/);
});
test('full collection has 15 entries, no purchase buttons and one equipped state',()=>{
 const s=state();s.records.owned=RECORDS.map(r=>r.id);const html=recordsMarkup(s);assert.match(html,/Coleção <b>15 \/ 15/);assert.doesNotMatch(html,/COMPRAR/);assert.equal([...html.matchAll(/>TOCANDO</g)].length,1);
});
test('preview exists for all discs including unaffordable ones and preserves focus hooks',()=>{
 const s=state(),html=recordsMarkup(s,'TODOS','iron');assert.equal([...html.matchAll(/data-record-preview=/g)].length,15);assert.equal([...html.matchAll(/data-record-title=/g)].length,15);assert.match(html,/id="currentRecordTitle" tabindex="-1"/);assert.match(html,/aria-label="Parar prévia FERRO EM BRASA"/);assert.match(html,/■ PARAR/);
});
test('run restrictions remain domain-enforced independently of presentation',()=>{
 const s=state();s.stars=500;s.run={};assert.equal(buyRecord(s,'iron'),false);assert.equal(equipRecord(s,'pulse'),false);assert.equal(s.stars,500);
});

test('all shipped covers match the approved collection and iron V03, with full352px canvases',async()=>{
 const receipt=JSON.parse(await fs.readFile(new URL('./fixtures/vitrola-approved-ui.json',import.meta.url),'utf8'));
 assert.equal(receipt.covers.length,15);assert.equal(receipt.covers.find(r=>r.id==='iron').sha256,'dd19e1afe686c91ba51930509d3440c9ee3a5458b6049bd3a619ae2e41206030');
 for(const r of RECORDS){const png=await fs.readFile(new URL('../dist/'+covers[r.id],import.meta.url));assert.equal(png.readUInt32BE(16),352);assert.equal(png.readUInt32BE(20),352);assert.equal(crypto.createHash('sha256').update(png).digest('hex'),receipt.covers.find(c=>c.id===r.id).sha256);}
});
