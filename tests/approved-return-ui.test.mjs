import test from 'node:test';import assert from 'node:assert/strict';
import {createState,startRun,finishRun} from '../dist/core.js';
import {returnRewards} from '../dist/rewards.js';
import {withdrawalView,retentionLabel,approvedReturnMarkup,approvedReturnTransfers} from '../dist/approved-return-ui.js';
test('withdrawal amounts match the single native payout, including opening rounding and fractional forge progress',()=>{
 for(const floor of [1,14])for(const level of [0,1,40])for(const bag of [0,1,181]){
  const s=createState(712);s.forge.levels.vault=level;startRun(s);s.run.floor=floor;s.run.bag=bag;s.run.materials=[17,23,11,9];
  const before=structuredClone(s),v=withdrawalView(s);assert.deepEqual(s,before);assert.equal(v.rows[0].before,bag);assert.deepEqual(v.rows.slice(1).map(r=>r.before),s.run.materials);
  assert.ok(finishRun(s,'retreat'));assert.equal(s.lastResult.kept,v.rows[0].after);assert.deepEqual(s.lastResult.keptMaterials,v.rows.slice(1).map(r=>r.after));assert.equal(s.bank-before.bank,Math.max(0,s.lastResult.kept));assert.equal(finishRun(s,'retreat'),false);
 }
 assert.equal(retentionLabel(.5),'50%');assert.equal(retentionLabel(.5025),'50,25%');assert.equal(retentionLabel(.6),'60%');assert.equal(withdrawalView({}),null);
});
test('visual flights group destinations without losing or duplicating rewards or mutating result data',()=>{
 const cards=returnRewards({rocks:{gems:53,count:4},enemies:{gems:40,count:2}},181,90,[8,11,5,4]),before=structuredClone(cards),groups=approvedReturnTransfers(cards);
 assert.deepEqual(cards,before);assert.equal(groups.length,5);for(const dest of ['bank','material-0','material-1','material-2','material-3'])assert.equal(groups.filter(c=>c.destination===dest).reduce((n,c)=>n+c.value,0),cards.filter(c=>c.destination===dest).reduce((n,c)=>n+c.value,0));
 assert.deepEqual(approvedReturnTransfers(returnRewards(null,0,0)),[]);assert.equal(approvedReturnTransfers(returnRewards(null,181,90))[0].value,90);
});
test('return presentation preserves pages, empty/legacy results and every retained material with canonical fragment art',()=>{
 const r={reason:'death',depleted:'rhythm',mode:'floors',floor:14,kept:90,lost:91,peak:147,score:8120,earnedStars:3,secured:{coins:70,materials:[3,2,1,0]},zagPasses:2};
 const cards=returnRewards({rocks:{gems:53},enemies:{gems:40}},181,90,[8,11,5,4]),before=structuredClone(r),first=approvedReturnMarkup(r,0,cards),last=approvedReturnMarkup(r,1,cards);
 assert.equal((first.match(/class="reward reward-card/g)||[]).length,4);assert.equal((last.match(/class="reward reward-card/g)||[]).length,3);assert.match(first,/Sem fôlego/);assert.match(first,/gem-0\.png/);assert.doesNotMatch(first,/vein-/);assert.match(first,/Já na base/);assert.match(first,/3.*guardadas/);assert.match(first,/Próximos/);assert.match(last,/Guardar tudo/);assert.deepEqual(r,before);
 for(const empty of [[],returnRewards(null,0,0)]){const html=approvedReturnMarkup({...r,kept:0,lost:0},0,empty);assert.match(html,/Sem saque nesta descida/);assert.match(html,/Voltar ao refúgio/);}
 const html=approvedReturnMarkup(r,0,[{id:'legacy-source',destination:'bank',name:'<script>',value:2}]);assert.doesNotMatch(html,/<script>/);
});
