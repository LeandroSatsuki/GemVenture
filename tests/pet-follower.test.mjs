import test from 'node:test';
import assert from 'node:assert/strict';
import {PetFollower,followedCorners,PET_FOLLOW_LIMITS} from '../dist/pet-follower.js';
const p=(x,y)=>({x,y}),id='slime-friend';
test('crossed route corners are retained at low frame rates, including reduced movement',()=>{
 const route=[p(0,0),p(100,0),p(100,100),p(200,100)];assert.deepEqual(followedCorners(p(50,0),p(150,100),route),[p(100,0),p(100,100),p(150,100)]);
 for(const reduced of [false,true]){const f=new PetFollower(),safe=q=>Math.abs(q.y)<.001&&q.x<=100||Math.abs(q.x-100)<.001&&q.y>=0&&q.y<=100||Math.abs(q.y-100)<.001&&q.x>=100;
  f.sample({id,scene:'room',player:route[0],canStand:safe});f.sample({id,scene:'room',player:route.at(-1),route,dt:.1,reduced,canStand:safe});
  for(let i=0;i<10;i++){const pose=f.sample({id,scene:'room',player:route.at(-1),dt:.1,reduced,canStand:safe});assert.ok(safe(pose));assert.equal(pose.reduced,reduced);if(reduced)assert.equal(pose.hop,0);}
 }
});
test('an untrusted shortcut through a wall is discarded rather than interpolated',()=>{
 const f=new PetFollower(),safe=q=>q.x<=10||q.y>=90;f.sample({id,scene:1,player:p(0,0),canStand:safe});const pose=f.sample({id,scene:1,player:p(100,100),dt:.1,route:[p(0,0),p(100,100)],canStand:safe});assert.equal(pose,null);assert.equal(f.points.length,1);
});
test('pause freezes history, age and pose; follower has no profile or camera dependence',()=>{
 const f=new PetFollower();f.sample({id,scene:1,player:p(0,0)});const pose=f.sample({id,scene:1,player:p(100,0),dt:.1});const before=JSON.stringify(f);assert.equal(f.sample({id,scene:1,player:p(120,0),dt:9,paused:true}),pose);assert.equal(JSON.stringify(f),before);assert.equal('profile' in f,false);assert.equal('camera' in f,false);
});
test('scene changes, equipment changes, missing pet and teleports reset without a cross-scene streak',()=>{
 const f=new PetFollower();f.sample({id,scene:1,player:p(0,0)});f.sample({id,scene:1,player:p(100,0),dt:.1});assert.equal(f.sample({id,scene:2,player:p(900,600),dt:.1}).alpha,0);assert.equal(f.points.length,1);assert.equal(f.sample({id,scene:2,player:p(2000,600),dt:.1}),null);assert.equal(f.sample({id:'bat-friend',scene:2,player:p(2000,600),dt:.1}).alpha,0);assert.equal(f.sample({id:null,scene:2,player:p(2000,600)}),null);
});
test('Abyss scroll shifts retained trail and pose uniformly, preserving separation',()=>{
 const f=new PetFollower();f.sample({id,scene:1,player:p(100,100)});const pose=f.sample({id,scene:1,player:p(180,100),dt:.1}),before={...pose};f.shift(-4,-32);assert.equal(f.pose.x,before.x-4);assert.equal(f.pose.y,before.y-32);const after=f.sample({id,scene:1,player:p(176,68),paused:true});assert.equal(after,f.pose);
});
test('history stays bounded on long runs and pets fade where a backtrack overlaps the player',()=>{
 const f=new PetFollower();for(let i=0;i<5000;i++)f.sample({id,scene:1,player:p(i*4,0),dt:.016});assert.ok(f.points.length<PET_FOLLOW_LIMITS.maxPoints);const q=f.pose;assert.ok(q.alpha>0);assert.ok(20000-q.x>=PET_FOLLOW_LIMITS.minSeparation);const overlap=f.sample({id,scene:1,player:p(q.x,q.y),dt:0});assert.equal(overlap.alpha,0);
});
test('slime hops and bat flight are presentation only and reduced motion removes periodic motion',()=>{
 for(const pet of ['slime-friend','bat-friend']){const f=new PetFollower();f.sample({id:pet,scene:1,player:p(0,0)});const pose=f.sample({id:pet,scene:1,player:p(100,0),dt:.1,reduced:true});assert.equal(pose.hop,0);assert.equal(pose.wing,0);assert.equal(pose.lift,pet==='bat-friend'?7:0);assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.y));}
});

test('first reduced-motion route seeds its real departure and appears behind the endpoint',()=>{
 const f=new PetFollower();assert.equal(f.sample({id,scene:'base',player:p(0,0),canStand:()=>false}),null);
 const route=[p(0,0),p(0,100),p(100,100)],pose=f.sample({id,scene:'base',player:p(100,100),route,dt:.04,reduced:true});
 assert.equal(pose.alpha,1);assert.equal(pose.y,100);assert.ok(Math.abs(pose.x-(100-PET_FOLLOW_LIMITS.gap))<1e-8);assert.equal(pose.hop,0);
});
