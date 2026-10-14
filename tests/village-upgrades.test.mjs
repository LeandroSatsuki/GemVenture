import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {BUILDINGS,buildingUpgrade,upgradeBuilding,restoreVillage} from '../dist/village.js';
import {makeOffering,WISH_FAMILIES,blessingEffects,blessingInfo,grantXP} from '../dist/pillars.js';
import {missionOffers,missionOdds,missionReward,acceptMission,claimMission} from '../dist/missions.js';
import {wellMarkup} from '../dist/pillar-view.js';
function rich(){const s=E.createState(712);s.bank=1000000;s.materials=[100000,100000,100000,100000];return s;}
function run(id,level=1){const s=E.createState(12);s.pendingBlessing=id;s.pendingBlessingLevel=level;E.startRun(s);const r=s.run;r.room.visible=null;r.room.explored=null;r.room.terrain.fill(0);r.room.rocks=[];r.room.nodes=[];r.room.enemies=[];r.room.wave=null;r.room.quota=999;return s;}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≈ ${b}`);

test('buildings consume exact resources, persist through death and respect their individual caps',()=>{
 for(const id of Object.keys(BUILDINGS)){const s=rich(),cap=BUILDINGS[id].cap;s.bank=1e9;s.materials.fill(1e9);let lastCost=0;for(let level=1;level<cap;level++){const p=buildingUpgrade(s,id),wallet=[...s.materials],bank=s.bank;assert.ok(p.cost>lastCost);lastCost=p.cost;assert.ok(upgradeBuilding(s,id));assert.equal(s.village[id],level+1);assert.equal(s.bank,bank-p.cost);assert.deepEqual(s.materials,wallet.map((v,i)=>v-p.recipe[i]));}const snapshot=JSON.stringify(s);assert.equal(upgradeBuilding(s,id),false);assert.equal(JSON.stringify(s),snapshot);assert.deepEqual(E.restoreState(snapshot),s);E.startRun(s);assert.equal(upgradeBuilding(s,'well'),false);E.finishRun(s,'death');assert.equal(s.village[id],cap);}
 const poor=E.createState(),before=JSON.stringify(poor);assert.equal(upgradeBuilding(poor,'well'),false);assert.equal(upgradeBuilding(poor,'unknown'),false);assert.equal(JSON.stringify(poor),before);
});

test('old saves receive level-one buildings without losing upgrades, missions or prepared legacy blessings',()=>{
 const s=rich();s.level=60;s.pendingBlessing='fury';s.forge.invested.anvil=123;delete s.village;delete s.pendingBlessingLevel;const t=E.restoreState(JSON.stringify(s));assert.deepEqual(t.village,{forge:1,well:1,missions:1});assert.equal(t.level,60);assert.equal(t.forge.invested.anvil,123);assert.equal(t.pendingBlessing,'fury');
 for(const bad of [null,[],{forge:0,well:1,missions:1},{forge:1,well:11,missions:1},{forge:1.5,well:1,missions:1}])assert.equal(restoreVillage(bad),null);
});

test('forge building boosts raw tool power without changing investments or skill slots',()=>{
 const s=rich();s.forge.invested.anvil=123;const power=E.power(s),slots=[...s.equipped];upgradeBuilding(s,'forge');close(E.power(s),power*1.02);assert.equal(s.forge.invested.anvil,123);assert.deepEqual(s.equipped,slots);
});

test('every crystal rolls only its three themed blessings; legacy bonuses stay intact',()=>{
 for(let kind=0;kind<4;kind++){const seen=new Set();for(let seed=0;seed<80;seed++){const s=rich();s.seed=seed;const wallet=[...s.materials],b=makeOffering(s,kind);assert.ok(WISH_FAMILIES[kind].ids.includes(b.id));seen.add(b.id);assert.equal(s.materials[kind],wallet[kind]-45);assert.equal(makeOffering(s,kind),null);assert.ok(blessingInfo(b.id,1).good);assert.ok(blessingInfo(b.id,10).risk);assert.ok(blessingInfo(b.id,1,b.pendingBlessingRoll).risk);}assert.equal(seen.size,3);}
 close(blessingEffects({blessing:'might'}).power,1.04);close(blessingEffects({blessing:'wisdom'}).xp,1.05);close(blessingEffects({blessing:'shellwish'}).incoming,.97);close(blessingEffects({blessing:'luckywish'}).doubleLoot,.04);
});

test('offering snapshots well level, survives reload, expires on return and cannot reroll while running',()=>{
 const s=rich();s.village.well=3;makeOffering(s,1);upgradeBuilding(s,'well');assert.equal(s.pendingBlessingLevel,3);const t=E.restoreState(JSON.stringify(s));E.startRun(t);assert.equal(t.run.blessingLevel,3);assert.equal(t.pendingBlessing,null);assert.equal(t.pendingBlessingLevel,1);assert.equal(makeOffering(t,2),null);assert.ok(E.restoreState(JSON.stringify(t)));E.finishRun(t,'death');E.startRun(t);assert.equal(t.run.blessing,null);
 const bad=structuredClone(t);bad.run.blessingLevel=11;assert.equal(E.restoreState(JSON.stringify(bad)),null);
});

test('new blessings apply actual force, life, XP, breath and incoming-damage tradeoffs',()=>{
 const might=run('might');close(E.power(might),1.04);const quartz=run('steady');E.act(quartz,{type:'hit',id:900},.45);close(quartz.run.rhythm,100-12.5*.95);
 const wisdom=run('wisdom');grantXP(wisdom,100);assert.equal(wisdom.experience.xp,105);
 const emerald=run('bountywish');assert.equal(emerald.run.health,97);assert.equal(E.maxHealth(emerald),97);
 for(const [id,ratio]of [['might',1.05],['shellwish',.97]]){const s=run(id);s.run.room.enemies=[{id:99,type:'enemy',kind:2,x:4,y:11,hp:50,maxHp:50,stunUntil:-1,windup:{x:3,y:11,radius:0,beat:4}}];s.run.acted=4;E.tick(s,4);close(s.run.health,100-22.4*.35*ratio);}
});

test('luck pays real crystals once per hit or destruction and critical blessings deal actual bonus damage',()=>{
 let lucky=0,critical=0;for(let seed=0;seed<100;seed++){
  const a=run('luckywish',10),b=run(null);for(const s of [a,b]){s.run.room.seed=seed;s.run.room.nodes=[{id:900,type:'crystal',kind:0,x:4,y:11,hp:1,maxHp:1,value:100,born:0}];E.act(s,{type:'hit',id:900},0);}if(a.run.materials[0]===b.run.materials[0]*2)lucky++;else assert.equal(a.run.materials[0],b.run.materials[0]);const held=a.run.materials[0];E.act(a,{type:'hit',id:900},1);assert.equal(a.run.materials[0],held);
  const c=run('crit',10);c.run.room.seed=seed;c.run.room.enemies=[{id:901,type:'enemy',kind:0,x:4,y:11,hp:100,maxHp:100,stunUntil:-1,windup:null}];E.act(c,{type:'hit',id:901},0);if(c.run.room.enemies[0].hp===98)critical++;else assert.equal(c.run.room.enemies[0].hp,99);
 }assert.ok(lucky>5&&lucky<40);assert.ok(critical>2&&critical<30);
 const template=run('luckywish',10);template.run.room.nodes=[{id:900,type:'crystal',kind:2,x:4,y:11,hp:100,maxHp:100,value:100,born:0,rare:true,rareUntil:40}];template.run.frenzy.quest={kind:'vein',name:'VEIO RARO',target:900,goal:1,progress:0,until:40,done:false};let doubled=false;for(let seed=0;seed<40;seed++){const rare=structuredClone(template);rare.run.room.seed=seed;E.act(rare,{type:'hit',id:900},0);E.act(rare,{type:'hit',id:900},1);assert.equal(rare.run.frenzy.quest.collected,rare.run.materials[2]);if(rare.run.events.some(e=>e.id==='well-luck'))doubled=true;}assert.ok(doubled);

});

test('mission levels improve rarity, rewards and choice count without rewriting an accepted contract',()=>{
 const s=rich(),offers=missionOffers(s),odds=missionOdds(s);acceptMission(s,offers[0].id);const contract=structuredClone(s.mission),reward=missionReward(contract);upgradeBuilding(s,'missions');assert.deepEqual(s.mission,contract);assert.ok(missionOdds(s).gold>odds.gold);assert.ok(missionOdds(s).rare>odds.rare);const next=missionOffers(s);assert.equal(next.length,3);assert.ok(next.every(m=>m.rewardLevel===2));assert.ok(missionReward({...next[0],tier:contract.tier}).gems>reward.gems);
 s.mission.progress=s.mission.goal;s.mission.status='ready';const bank=s.bank;assert.ok(claimMission(s));assert.equal(s.bank,bank+reward.gems);assert.equal(claimMission(s),false);
 s.village.missions=10;assert.equal(missionOffers(s).length,6);assert.ok(E.restoreState(JSON.stringify(s)));s.unlocked.push('questluck');const chance=missionOdds(s);assert.ok(chance.gold+chance.rare<1);
});

test('well previews show the selected color, broad family and cost and saved blessing strength',()=>{
 const s=rich();let html=wellMarkup(s,false,1);assert.match(html,/FORÇA · CRÍTICOS/);assert.match(html,/OFERECER 45/);assert.doesNotMatch(html,/BRASA RUBRA|GOLPE DE SORTE|wish-odds/);assert.doesNotMatch(html,/undefined|NaN/);makeOffering(s,3);html=wellMarkup(s,true);assert.match(html,/BÊNÇÃO GUARDADA/);assert.match(html,/wish-crystal/);assert.doesNotMatch(html,/data-offering|undefined|NaN/);
});
