import test from 'node:test';import assert from 'node:assert/strict';
import {floorPerformanceRows,floorPerformanceRowsMarkup} from '../dist/approved-floor-performance.js';
test('performance consultation preserves independent marks, numeric order and the profile',()=>{
 const profile={descent:{records:{8:{points:21300,lastScore:18500,bestTimeMs:94500,stars:2,clears:2},2:{points:12800,lastScore:10450,bestTimeMs:51800,stars:4,clears:9},1:{points:9200,lastScore:8700,bestTimeMs:42300,stars:5,clears:12},4:{clears:0,points:0}}}};
 const before=structuredClone(profile),rows=floorPerformanceRows(profile);assert.deepEqual(rows.map(r=>r.address),['1–1','1–2','2–3']);assert.equal(rows[0].points,9200);assert.equal(rows[0].lastScore,8700);assert.equal(rows[0].bestTimeMs,42300);assert.equal(rows[0].clears,12);floorPerformanceRowsMarkup(profile);assert.deepEqual(profile,before);
});
test('unknown legacy marks remain absent while saved zero is a real result',()=>{
 const profile={descent:{records:{1:{points:0,clears:1},2:{points:0,lastScore:0,bestTimeMs:0,stars:0,clears:1}}}},rows=floorPerformanceRows(profile),html=floorPerformanceRowsMarkup(profile);
 assert.equal(rows[0].stars,undefined);assert.equal(rows[0].bestTimeMs,undefined);assert.equal(rows[1].stars,0);assert.equal(rows[1].bestTimeMs,0);assert.match(html,/Estrelas sem registro/);assert.match(html,/0 de 5 estrelas/);assert.match(html,/0,0 s/);assert.match(html,/Últimos pts/);
});
test('all 35 campaign records retain their address and six fields',()=>{
 const profile={descent:{records:Object.fromEntries(Array.from({length:35},(_,i)=>[i+1,{points:10000+i,lastScore:i,bestTimeMs:1000+i,stars:i%6,clears:i+1}]))}},rows=floorPerformanceRows(profile),html=floorPerformanceRowsMarkup(profile);
 assert.equal(rows.length,35);assert.equal(rows.at(-1).address,'7–5');assert.equal(rows.at(-1).lastScore,34);assert.equal((html.match(/class="gp-row"/g)||[]).length,35);assert.equal((html.match(/role="rowheader"/g)||[]).length,35);assert.equal((html.match(/class="gp-label"/g)||[]).length,140);
});
