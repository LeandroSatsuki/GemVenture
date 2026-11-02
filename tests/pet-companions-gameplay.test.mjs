import {rectangularRoom} from './helpers/rectangular-room.mjs';
import {secureCargo} from '../dist/frenzy.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import * as H from '../dist/home-collection.js';
import * as B from '../dist/pet-bonds.js';
import * as Powers from '../dist/pet-powers.js';
import {petsServiceView} from '../dist/pets-service.js';
import {petPortraitFit} from '../dist/pet-art-runtime.js';
import {PET_ART_DEFINITIONS} from '../dist/pet-art-catalog.js';
import {reveal,sightRange} from '../dist/cavern.js';
const make=()=>E.createState(41001),close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function arena(s){rectangularRoom(s);const r=s.run;Object.assign(r.room,{minBeats:0,floorMask:null,layout:null,explored:null,visible:null,terrain:Array(r.room.cols*r.room.rows).fill(0),wave:null,rocks:[],enemies:[],nodes:[],goal:999,quota:999});r.guardUntil=-1;return r;}
function playing(id){const s=make();if(id){s.homeCollection.pets=[id];H.equipPet(s,id);}assert.equal(E.startRun(s),true);arena(s);return s;}
const records=(s,n,stars=0)=>{s.descent.records=Object.fromEntries(Array.from({length:n},(_,i)=>[i+1,{points:10,clears:1,stars:i<5?stars:0}]));};
const proofs={
 'slime-friend':[s=>{s.descent.bosses=[10];s.petBonds.progress.safeReturns=10;},s=>s.petBonds.progress.safeReturns=9],
 'bat-friend':[s=>s.petBonds.progress.combo100Runs=3,s=>s.petBonds.progress.combo100Runs=2],
 cascalhito:[s=>{records(s,15);s.petBonds.progress.rocks=500;},s=>s.petBonds.progress.rocks=499],
 fagulhito:[s=>s.petBonds.progress.exploredFloors=Array.from({length:15},(_,i)=>i+1),s=>s.petBonds.progress.exploredFloors.pop()],
 bolota:[s=>{s.missionsCompleted=20;s.petBonds.progress.coins=5000;},s=>s.missionsCompleted=19],
 garim:[s=>{s.petBonds.progress.bankedGems=750;records(s,16);},s=>s.petBonds.progress.bankedGems=749],
 nimbo:[s=>{s.journey.earnedStars=60;s.petBonds.progress.undamagedFloors=[1,2,3];},s=>s.journey.earnedStars=59],
 trufa:[s=>records(s,20,5),s=>delete s.descent.records[20]],
 mizu:[s=>{s.descent.bosses=[5,10,15,20,25];s.journey.earnedStars=75;},s=>s.descent.bosses.pop()],
 cadencio:[s=>{s.descent.bosses=[5,10,15,20,25,30];s.bestCombo=200;},s=>s.bestCombo=199]
};
for(const [id,[enough,below]] of Object.entries(proofs))test('unlock threshold, purity, one grant and no charge: '+id,()=>{
 const s=make();enough(s);below(s);B.recordPetProgress(s);assert.ok(!s.homeCollection.pets.includes(id));
 enough(s);const wallet=JSON.stringify([s.bank,s.materials,s.stars]),before=JSON.stringify(s);for(let i=0;i<5;i++)petsServiceView(s);assert.equal(JSON.stringify(s),before);
 assert.equal(B.recordPetProgress(s).filter(e=>e.id===id&&e.type==='petUnlocked').length,1);assert.ok(s.homeCollection.pets.includes(id));assert.equal(B.recordPetProgress(s).filter(e=>e.id===id).length,0);assert.equal(JSON.stringify([s.bank,s.materials,s.stars]),wallet);
});
test('all ten owned companions roundtrip and only one affects a run',()=>{for(const p of H.PET_CATALOG){const s=make();s.homeCollection.pets=H.PET_CATALOG.map(p=>p.id);H.equipPet(s,p.id);E.startRun(s);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored,p.id);assert.equal(H.equippedPet(restored).id,p.id);assert.equal(H.equipPet(restored,null).ok,false);}});
test('three combo proofs require three actual expeditions and survive reload midway',()=>{
 let s=make();for(let run=0;run<3;run++){E.startRun(s);arena(s);s.run.combo=99;assert.equal(E.act(s,{type:'move',...s.run.player},0).ok,true);assert.equal(s.petBonds.progress.combo100Runs,run+1);
  const loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);s=loaded;E.act(s,{type:'move',...s.run.player},1);assert.equal(s.petBonds.progress.combo100Runs,run+1);assert.equal(E.act(s,{type:'move',...s.run.player},1).ok,false);E.finishRun(s,'death');}
 assert.ok(s.homeCollection.pets.includes('bat-friend'));
});
test('safe returns, banked gems and rock counters are idempotent at their actual hooks',()=>{const s=playing();s.run.bag=5;s.run.materials=[2,3,0,0];E.finishRun(s,'return');assert.equal(s.petBonds.progress.safeReturns,1);assert.equal(s.petBonds.progress.bankedGems,5);assert.equal(E.finishRun(s,'return'),false);assert.equal(s.petBonds.progress.safeReturns,1);
 E.startRun(s);const target={type:'rock',hp:0};B.recordPetRock(s,target);B.recordPetRock(s,target);assert.equal(s.petBonds.progress.rocks,1);
 s.run.materials=[5,0,0,0];E.finishRun(s,'retreat');assert.equal(s.petBonds.progress.safeReturns,1);
});
test('exploration requires every floor tile, and distinct floor proofs cannot be farmed',()=>{const s=playing(),r=s.run,room=r.room;room.cols=6;room.rows=6;room.floorMask=Array(36).fill(0);room.explored=Array(36).fill(0);for(let y=1;y<5;y++)for(let x=1;x<5;x++)room.floorMask[y*6+x]=1;room.explored=[...room.floorMask];room.explored[7]=0;B.recordPetExploration(s);assert.equal(s.petBonds.progress.exploredFloors.length,0);room.explored[7]=1;B.recordPetExploration(s);B.recordPetExploration(s);assert.deepEqual(s.petBonds.progress.exploredFloors,[1]);room.cleared=true;room.petDamage=0;B.recordPetClear(s);B.recordPetClear(s);assert.deepEqual(s.petBonds.progress.undamagedFloors,[1]);});
test('spent stars and gems do not erase historical requirements; legacy unknown challenges are not invented',()=>{const s=make();s.descent.bosses=[5,10,15,20,25];s.journey.earnedStars=75;s.stars=0;s.petBonds.progress.undamagedFloors=[1,2,3];s.petBonds.progress.bankedGems=750;records(s,16);s.materials=[0,0,0,0];B.recordPetProgress(s);for(const id of ['nimbo','mizu','garim'])assert.ok(s.homeCollection.pets.includes(id));
 const old=make();delete old.petBonds.progress;old.homeCollection.pets=['slime-friend'];old.homeCollection.activePet='slime-friend';old.bestCombo=150;const restored=E.restoreState(JSON.stringify(old));assert.ok(restored);assert.equal(restored.homeCollection.activePet,'slime-friend');assert.equal(restored.petBonds.progress.combo100Runs,1);assert.equal(restored.petBonds.progress.safeReturns,0);assert.deepEqual(restored.petBonds.progress.undamagedFloors,[]);
});
test('malformed known progress/powers refuse restore, future versions remain opaque',()=>{for(const bad of [-1,NaN,1.5]){const s=make();s.petBonds.progress.rocks=bad;assert.equal(E.restoreState(JSON.stringify(s)),null);}
 const s=playing('mizu');s.run.petPower.mizuBeats=32;assert.equal(E.restoreState(JSON.stringify(s)),null);
 const future=make();future.petBonds.progress={version:99,opaque:[1,2]};const restored=E.restoreState(JSON.stringify(future));assert.ok(restored);const before=JSON.stringify(restored);assert.deepEqual(B.recordPetProgress(restored),[]);assert.equal(JSON.stringify(restored),before);
});
test('Pingô improves actual tonic healing by 20%; Pipisco grants .5 only for accepted actions',()=>{const base=playing(),p=playing('slime-friend');close(E.tonicHealing(p),E.tonicHealing(base)*1.2);p.run.health=20;p.run.items.tonic=1;E.act(p,{type:'item',item:'tonic'},0);close(p.run.health,20+E.tonicHealing(p));
 const bat=playing('bat-friend');bat.run.rhythm=50;E.act(bat,{type:'move',...bat.run.player},0);close(bat.run.rhythm,52.5);E.act(bat,{type:'move',...bat.run.player},0);close(bat.run.rhythm,52.5);
});
test('Cascalhito doubles exactly the fifth direct mining hit after the mining cap',()=>{const s=playing('cascalhito'),r=s.run,t={id:1,type:'rock',kind:0,x:4,y:11,hp:10000,maxHp:10000,value:1};r.room.rocks=[t];const damage=[];
 for(let beat=0;beat<5;beat++){const hp=t.hp;assert.equal(E.act(s,{type:'hit',id:1},beat).ok,true);damage.push(hp-t.hp);}close(damage[4],damage[0]*2);close(damage[3],damage[0]);assert.equal(r.petPower.miningHits,0);
});
test('Cadêncio boosts mining and combat only at combo 50+',()=>{for(const type of ['rock','enemy']){const hits=[];for(const id of [null,'cadencio']){const s=playing(id),r=s.run,t={id:1,type,kind:0,x:4,y:11,hp:10000,maxHp:10000,value:1};r.room[type==='rock'?'rocks':'enemies']=[t];r.combo=49;E.act(s,{type:'hit',id:1},0);hits.push(10000-t.hp);}close(hits[1],hits[0]*1.2);}
 const low=playing('cadencio');low.run.combo=49;assert.equal(Powers.petDamageMultiplier(low),1);
});
test('Bolota pays the exact 12% over many small coin drops and keeps rounding across a save',()=>{let s=playing('bolota');let coins=0;for(let i=0;i<25;i++){coins+=Powers.petCoinValue(s,1);if(i===11){s=E.restoreState(JSON.stringify(s));assert.ok(s);}}assert.equal(coins,28);
 const r=s.run,t={id:1,type:'rock',kind:0,x:4,y:11,hp:1,maxHp:1,value:100};r.room.rocks=[t];E.act(s,{type:'hit',id:1},0);assert.equal(r.bag,112);assert.equal(s.petBonds.progress.coins,112);
});
test('Garim grants one gem of the tenth common vein type, never advances on rare veins',()=>{const s=playing('garim'),r=s.run;
 for(let beat=0;beat<10;beat++){const t={id:beat+1,type:'crystal',kind:beat===9?1:0,x:4,y:11,hp:1,maxHp:1,value:1,born:0};r.room.nodes=[t];const old=r.materials[t.kind];E.act(s,{type:'hit',id:t.id},beat);if(beat===9)assert.equal(r.materials[1]-old,E.crystalValue(s,t)+1);}
 assert.equal(r.petPower.veins,0);Powers.petCommonVein(s,{rare:true,kind:0});assert.equal(r.petPower.veins,0);
});
test('Fagulhito adds one tile but does not reveal through a wall',()=>{const r={cards:{},petId:'fagulhito'},plain={cards:{}};assert.equal(sightRange(r),sightRange(plain)+1);const room={cols:20,rows:15,rocks:[],floorMask:Array(300).fill(1),explored:Array(300).fill(0)};room.floorMask[7*20+4]=0;reveal(room,{x:3,y:7},sightRange(r));assert.equal(room.visible[7*20+5],0);});
function attack(s,beat=23){const r=s.run;r.acted=beat;r.enemyBeat=beat;const e={id:100,type:'enemy',kind:2,x:r.player.x+1,y:r.player.y,hp:100,maxHp:100,stunUntil:-1,windup:{x:r.player.x,y:r.player.y,radius:0,tiles:[{...r.player}],beat}};r.room.enemies=[e];const before=r.health;E.tick(s,beat);return {loss:before-r.health,enemy:e};}
test('Nimbo prepares at 20 real rhythm hits, halves one creature attack and only pushes into a free tile',()=>{const s=playing('nimbo');for(let beat=0;beat<20;beat++)E.act(s,{type:'move',...s.run.player},beat);assert.equal(s.run.petPower.nimboCharge,true);assert.equal(s.run.petPower.rhythmHits,0);const normal=attack(playing()).loss,hit=attack(s);close(hit.loss,normal*.5);assert.equal(s.run.petPower.nimboCharge,false);assert.equal(hit.enemy.x,s.run.player.x+2);
 s.run.petPower.nimboCharge=true;const boss={id:2,boss:true,hp:10,x:5,y:11};s.run.room.enemies=[boss];assert.equal(Powers.petDefense(s,true,()=>false),.5);assert.equal(boss.x,5);
 s.run.petPower.nimboCharge=true;assert.equal(Powers.petDefense(s,false,()=>true),1);assert.equal(s.run.petPower.nimboCharge,true);
});
test('Mizu charges at 32 music beats, blocks one attack, cannot stack or spend on a terrain hazard',()=>{const s=playing('mizu');for(let b=0;b<31;b++)Powers.petMusicBeat(s,b);assert.equal(s.run.petPower.mizuCharge,false);Powers.petMusicBeat(s,31);assert.equal(s.run.petPower.mizuCharge,true);Powers.petMusicBeat(s,100);assert.equal(s.run.petPower.mizuBeats,0);assert.equal(Powers.petDefense(s,false,()=>true),1);const hit=attack(s,101);assert.equal(hit.loss,0);assert.equal(s.run.petPower.mizuCharge,false);assert.equal(s.run.room.petDamage,0);
});
test('Trufa heals once on a real clear and once per new Abyss section',()=>{const s=playing('trufa'),r=s.run;r.health=50;r.room.charge=r.room.quota;r.room.goal=1;E.act(s,{type:'move',...r.player},0);assert.equal(r.room.cleared,true);close(r.health,58);E.act(s,{type:'move',...r.player},1);close(r.health,58);
 const a=playing('trufa');a.run.health=50;Powers.petClearHeal(a,100,2);Powers.petClearHeal(a,100,2);close(a.run.health,58);Powers.petClearHeal(a,100,3);close(a.run.health,66);
});
test('pet runtime counters and ability charges do not progress inside training',()=>{const s=playing('nimbo');s.run.trainingClock={};const before=JSON.stringify(s.petBonds);for(let i=0;i<30;i++){Powers.petRhythmHit(s);Powers.petMusicBeat(s,i);B.recordPetRhythm(s);}assert.equal(JSON.stringify(s.petBonds),before);assert.equal(s.run.petPower.nimboCharge,false);});
test('all ten presentation grounds land on the pedestal plane without clipping their union bounds',()=>{for(const pet of Object.values(PET_ART_DEFINITIONS))for(const [w,h,ground] of [[120,72,48.672],[150,110,82.352]]){const rig=pet.views.presentation,fit=petPortraitFit(rig,w,h,ground);assert.ok(fit.k>0);close(fit.top+rig.ground[1]*fit.k,ground);assert.ok(fit.top>=-1e-6&&fit.left>=-1e-6&&fit.left+fit.width<=w+1e-6&&fit.top+fit.height<=h+1e-6,pet.id);}});


test('unclassified historical coins are not fabricated as expedition-only progress',()=>{const s=make();delete s.petBonds.progress;s.totalGems=9000;s.missionsCompleted=20;const loaded=E.restoreState(JSON.stringify(s));assert.ok(loaded);assert.equal(loaded.petBonds.progress.coins,0);B.recordPetProgress(loaded);assert.ok(!loaded.homeCollection.pets.includes('bolota'));});
test('Mizu charges through the real music tick before resolving a creature attack',()=>{const s=playing('mizu');s.run.petPower.mizuBeats=31;s.run.petPower.lastBeat=22;const hit=attack(s,23);assert.equal(hit.loss,0);assert.equal(s.run.petPower.mizuCharge,false);assert.equal(s.run.petPower.mizuBeats,0);});
test('Nimbo recoil is applied after a bat finishes its attack movement and respects blocked exits',()=>{const s=playing('nimbo'),r=s.run;r.petPower.nimboCharge=true;r.acted=23;r.enemyBeat=23;const start={...r.player};const bat={id:100,type:'enemy',kind:1,x:start.x+1,y:start.y,hp:100,maxHp:100,stunUntil:-1,windup:{...start,tiles:[start],beat:23}};r.room.enemies=[bat];E.tick(s,23);assert.equal(Math.abs(bat.x-start.x)+Math.abs(bat.y-start.y),1);assert.equal(r.petPower.pendingRecoil,false);
 r.petPower.nimboCharge=true;const old={x:bat.x,y:bat.y};Powers.petDefense(s,true,()=>false);Powers.resolvePetRecoil(s,()=>false);assert.deepEqual({x:bat.x,y:bat.y},old);
});
test('Trufa heals through the actual Abyss section transition exactly once',()=>{const s=make();s.homeCollection.pets=['trufa'];H.equipPet(s,'trufa');s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];assert.equal(E.startRun(s,'abyss'),true);const r=s.run;r.health=40;r.acted=96;r.enemyBeat=96;r.guardUntil=1000;r.room.enemies=[];E.tick(s,96);assert.equal(r.abyss.section,2);close(r.health,48);E.tick(s,96);close(r.health,48);});

test('secured cargo advances banked gems once; returning it does not count the same gems twice',()=>{const s=playing(),r=s.run;r.floor=5;r.room.cleared=true;r.bag=9;r.materials=[4,2,0,0];assert.equal(secureCargo(s),true);assert.equal(s.petBonds.progress.bankedGems,6);assert.equal(secureCargo(s),false);E.finishRun(s,'return');assert.equal(s.petBonds.progress.bankedGems,6);assert.equal(s.petBonds.progress.safeReturns,1);});
