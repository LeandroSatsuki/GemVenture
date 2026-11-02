import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRun,act} from '../dist/core.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {awardScore,STAR_MARKS} from '../dist/stars.js';
import {BOSSES} from '../dist/bosses.js';

test('elevator requirements match actual starts across all 35 campaign floors',()=>{
 for(const seed of [41,712]){
  const profile=createState(seed);profile.best=35;profile.seals=6;
  profile.descent.stops=Array.from({length:35},(_,i)=>i+1);
  const before=JSON.stringify(profile);
  for(let floor=1;floor<=35;floor++){
   const vm=liftHostPresentationModel(profile,floor),actual=structuredClone(profile);
   assert.ok(startRun(actual,'floors',floor));const room=actual.run.room;
   if(room.bossFloor){
    assert.equal(vm.selected.objectives.length,1);
    assert.ok(vm.selected.objectives[0].label.includes(BOSSES[Math.floor((floor-1)/5)].name));
   }else{
    assert.deepEqual(vm.selected.objectives,[{kind:'stairs',label:'Minere para completar a carga. O buraco é um atalho.'}],`floor ${floor}, seed ${seed}`);
   }
  }
  assert.equal(JSON.stringify(profile),before,'Inspecting requirements must preserve the profile');
 }
});

test('five score stars and floor exit requirements are independent',()=>{
 const starred=createState(712);startRun(starred);const r=starred.run;
 awardScore(starred,Math.round(r.score.target*STAR_MARKS.at(-1)),0);
 assert.equal(r.score.earned,5);
 assert.equal(act(starred,{type:'move',x:r.player.x,y:r.player.y+1},0).ok,true);
 assert.equal(r.room.cleared,false,'Five stars alone do not satisfy the exit requirements');
 const cleared=createState(712);startRun(cleared);const c=cleared.run;
 c.room.charge=c.room.quota;c.combo=c.room.goal-1;c.beat=c.room.minBeats;
 c.player={x:c.room.exit.x,y:c.room.exit.y+1};c.room.explored=null;c.room.visible=null;assert.equal(act(cleared,{type:'move',...c.room.exit},c.room.minBeats).ok,true);
 assert.equal(c.room.cleared,true);
 assert.ok(c.score.earned<5,'Meeting exit requirements does not require all five stars');
});
