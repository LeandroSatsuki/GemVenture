import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createState} from '../dist/core.js';
import * as M from '../dist/missions.js';
import * as V from '../dist/village.js';
import {buildingMarkup} from '../dist/village-view.js';
import {missionBoardMarkup} from '../dist/rebrand-missions.js';
const source=fs.readFileSync(new URL('../dist/run.js',import.meta.url),'utf8');
const start=source.indexOf('function missionBoardViewModel('),end=source.indexOf('function captureMissionPresentation(',start);
const timeStart=source.indexOf('function missionTimeLeft('),timeEnd=source.indexOf('function showMissionReceipt(',timeStart);
const ctx={...M,...V,buildingMarkup};vm.createContext(ctx);vm.runInContext(source.slice(timeStart,timeEnd)+source.slice(start,end)+'\nglobalThis.project=missionBoardViewModel;',ctx);
function model(s){const list=M.missionList(s);return ctx.project(s,{list,used:list.filter(m=>m.status!=='expired').length,slots:V.missionSlots(s),nextSlot:V.nextMissionSlot(s),offers:M.missionOffers(s).filter(o=>!list.some(m=>m.status!=='expired'&&m.template===o.template)),odds:M.missionOdds(s)});}
const count=(s,re)=>[...s.matchAll(re)].length;
test('approved single-list presentation preserves actual host DTO, status hooks and all rows',()=>{
 const s=createState(62);s.village.missions=150;
 for(let i=0;i<3;i++){const offer=M.missionOffers(s).find(o=>!M.missionList(s).some(m=>m.template===o.template));assert.ok(M.acceptMission(s,offer.id));}
 const list=M.missionList(s);list[0].status='ready';list[0].progress=list[0].goal;list[2].status='expired';list[2].remaining=0;
 const dto=model(s),before=JSON.stringify(s),html=missionBoardMarkup(dto);
 assert.equal(JSON.stringify(s),before);assert.equal(count(html,/<ul /g),1);assert.equal(count(html,/<li /g),dto.active.length+dto.offers.length);
 assert.equal(count(html,/data-claim-mission=/g),1);assert.equal(count(html,/data-abandon-mission=/g),2);assert.equal(count(html,/data-mission="/g),dto.offers.length);
 for(const status of ['active','ready','expired'])assert.ok(html.includes(`data-mission-status="${status}"`));assert.doesNotMatch(html,/role="tab"|data-track|Em andamento|Concluídas|Contratos/);
});
test('full real roster hides offers and preserves every accepted action',()=>{
 const s=createState(63);s.village.missions=150;
 while(M.missionList(s).length<5){const offer=M.missionOffers(s).find(o=>!M.missionList(s).some(m=>m.template===o.template));assert.ok(offer);assert.ok(M.acceptMission(s,offer.id));}
 const html=missionBoardMarkup(model(s));assert.equal(count(html,/<li /g),5);assert.doesNotMatch(html,/data-mission="/);assert.match(html,/Vagas cheias/);assert.equal(count(html,/data-abandon-mission=/g),5);
});
test('untrusted labels and IDs cannot inject elements or event handlers',()=>{
 const dto=model(createState(64));dto.offers[0].verb='Quebre <img src=x onerror=alert(1)>';dto.offers[0].id='"/><script>x</script>';
 const html=missionBoardMarkup(dto);assert.doesNotMatch(html,/<img src=x|<script>/);assert.match(html,/&lt;img/);assert.match(html,/%22%2F%3E%3Cscript%3E/);
});
test('Missions CSS follows legacy styling and declares real font aliases without preview shell',()=>{
 const index=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(index.indexOf('missions-vila.css')>index.indexOf('rebrand-missions.css'));
 const fonts=fs.readFileSync(new URL('../dist/missions-fonts.css',import.meta.url),'utf8');assert.match(fonts,/font-family:Fredoka/);assert.match(fonts,/font-family:Nunito/);assert.doesNotMatch(index,/preview-model|preview-entry|preview-shell/);
});
