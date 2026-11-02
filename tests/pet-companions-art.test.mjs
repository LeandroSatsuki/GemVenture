import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PET_ART_DEFINITIONS,petArtSpec} from '../dist/pet-art-catalog.js';
import {petIdlePose,petSourceRect,drawPetArt} from '../dist/pet-art-runtime.js';
import {PetFollower} from '../dist/pet-follower.js';
import {createState,restoreState} from '../dist/core.js';
import {petsServiceView} from '../dist/pets-service.js';
import {commitPetAction} from '../dist/pets-transaction.js';

test('ten approved pet models have separate presentation/cave cameras and both idle clips',()=>{
 assert.equal(Object.keys(PET_ART_DEFINITIONS).length,10);
 assert.equal(petArtSpec('slime-friend'),petArtSpec('pingo'));
 assert.equal(petArtSpec('bat-friend'),petArtSpec('pipisco'));
 for(const pet of Object.values(PET_ART_DEFINITIONS)){
  assert.equal(pet.revision,['pingo','pipisco','garim','trufa'].includes(pet.id)?3:2);assert.equal(pet.views.presentation.camera,'miner-presentation-8deg-v1');assert.equal(pet.views.cave.camera,'gemventure-cave-v1');
  assert.deepEqual(pet.views.cave.directions,['S','W','N','E']);assert.deepEqual(pet.views.presentation.directions,['S']);
  for(const view of Object.values(pet.views)){assert.equal(view.clips.idle.frames,48);assert.equal(view.clips['idle-alt'].frames,48);assert.equal(view.clips.idle.seconds,4);}
 }
});
test('all packed source rectangles fit real PNGs including cave direction blocks',async()=>{
 for(const pet of Object.values(PET_ART_DEFINITIONS))for(const [view,rig] of Object.entries(pet.views))for(const [clip,motion] of Object.entries(rig.clips)){
  const bytes=await readFile(new URL('../dist/'+motion.url,import.meta.url)),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
  assert.ok(w<=4096,'bounded texture width');
  for(const direction of rig.directions)for(let f=0;f<motion.frames;f++){
   const r=petSourceRect(pet.id,view,clip,f,direction);assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=w&&r.y+r.height<=h,pet.id+view+clip+direction+f);
  }
 }
});
test('idle scheduling is deterministic, bounded and still for reduced motion',()=>{
 for(const id of Object.keys(PET_ART_DEFINITIONS))for(let step=0;step<500;step++){
  const t=step*.137,a=petIdlePose(id,t),b=petIdlePose(id,t);assert.deepEqual(a,b);assert.ok(['idle','idle-alt'].includes(a.clip));assert.ok(a.frame>=0&&a.frame<48);
  assert.deepEqual(petIdlePose(id,t,true),{clip:'pose',frame:0});
 }
 for(const id of ['unknown','constructor','toString','__proto__'])assert.equal(petSourceRect(id),null);
});
test('all new art IDs can follow without moving through walls; cardinal facings use cave basis',()=>{
 for(const id of Object.keys(PET_ART_DEFINITIONS))for(const [direction,point] of [['E',{x:100,y:0}],['W',{x:-100,y:0}],['S',{x:12.5,y:100}],['N',{x:-12.5,y:-100}]]){
  const f=new PetFollower();f.sample({id,scene:1,player:{x:0,y:0}});const pose=f.sample({id,scene:1,player:point,dt:.1});
  assert.equal(pose.direction,direction,id+direction);const frozen=JSON.stringify(f);f.sample({id,scene:1,player:point,dt:2,paused:true});assert.equal(JSON.stringify(f),frozen);
 }
});
test('legacy ownership/equipment survives restore; locked companions cannot grant or equip themselves',()=>{
 const s=createState(41001);s.homeCollection.pets=['slime-friend','bat-friend'];s.homeCollection.activePet='slime-friend';
 const restored=restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.homeCollection.activePet,'slime-friend');
 const before=JSON.stringify(restored),view=petsServiceView(restored);assert.equal(view.pets.length,10);assert.equal(view.pets.find(p=>p.id==='slime-friend').name,'Pingô');assert.equal(view.pets.filter(p=>!p.owned).length,8);
 let writes=0;for(const p of view.pets.filter(p=>!p.owned)){
  assert.equal(p.equip.available,false);assert.equal(p.owned,false);
  const result=commitPetAction({profile:restored,action:'equip',id:p.id,persist:()=>{writes++;return true;},install:()=>true,readProfile:()=>restored});assert.equal(result.ok,false);
 }
 assert.equal(writes,0);assert.equal(JSON.stringify(restored),before);
});
test('render uses registered frame, pivot and view; unknown pet is a safe no-op',()=>{
 const prior=globalThis.Image;globalThis.Image=class{complete=true;naturalWidth=100;set src(v){this.url=v;}};
 try{
  const calls=[],ctx={save(){},restore(){},drawImage(...a){calls.push(a);}};
  assert.equal(drawPetArt(ctx,'unknown',0,0,1),false);
  assert.equal(drawPetArt(ctx,'slime-friend',10,20,1,{reduced:true}),true);assert.match(calls[0][0].url,/presentation/);
  assert.equal(drawPetArt(ctx,'pingo',0,0,.5,{view:'cave',direction:'E',reduced:true}),true);assert.match(calls[1][0].url,/cave/);
  assert.equal(calls[1][2],petSourceRect('pingo','cave','pose',0,'E').y);
 }finally{globalThis.Image=prior;}
});
