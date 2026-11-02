import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {isFloor} from '../dist/cave-layout.js';
import {buildCaveScenery,decorationFits} from '../dist/cave-scenery.js';
function room(seed=712,floor=1){const s=E.createState(seed);s.seals=6;E.startRun(s);s.run.floor=floor;E.generateRoom(s);return s.run.room;}
test('scenery preserves simulation and survives collection and room completion unchanged',()=>{
 const r=room(),before=JSON.stringify(r),a=buildCaveScenery(r);assert.equal(JSON.stringify(r),before);assert.deepEqual(a,buildCaveScenery(r));
 r.rocks=[];r.nodes=[];r.enemies=[];r.cleared=true;assert.deepEqual(buildCaveScenery(r),a);
});
test('100 seeded caves have no physical rails and keep decoration outside the floor',()=>{
 let rails=0,decor=0;const signatures=new Set();
 for(let seed=1;seed<=100;seed++){
  const r=room(seed),p=buildCaveScenery(r);signatures.add(JSON.stringify(p));
  for(const f of p.fields)for(let y=0;y<r.rows;y++)for(let x=0;x<r.cols;x++)if(f.map[y][x])assert.ok(isFloor(r,x,y));
  for(const path of p.rails){rails++;assert.ok(path.length>=7&&path.length<=18);for(let i=0;i<path.length;i++){const q=path[i];assert.ok(isFloor(r,q.x,q.y));assert.ok(!r.layout.protectedTiles.includes(q.y*r.cols+q.x));if(i)assert.equal(Math.abs(q.x-path[i-1].x)+Math.abs(q.y-path[i-1].y),1);}}
  for(const d of p.decorations){decor++;assert.ok(decorationFits(r,d));assert.ok(!isFloor(r,d.x,d.y)&&isFloor(r,d.x,d.y+1));assert.ok(Math.abs(d.x-r.hedgehog.x)+Math.abs(d.y-r.hedgehog.y)>6);}
 }assert.equal(signatures.size,100);assert.equal(rails,0);assert.ok(decor>100);
 console.log(JSON.stringify({seeds:100,railRoutes:rails,wallClusters:decor}));
});
test('expanded biome scenery preserves routes and arrival space; boss decoration stays outside walking areas, Abyss and legacy stay empty',()=>{
 const empty={fields:[],rails:[],decorations:[]};
 for(let biome=0;biome<7;biome++){
  const r=room(712,biome*5+1),before=JSON.stringify(r),plan=buildCaveScenery(r,{biome});assert.equal(JSON.stringify(r),before);assert.deepEqual(buildCaveScenery(r,{biome}),plan);assert.ok(plan.fields.length>0);
  for(const path of plan.rails)for(const p of path){assert.ok(isFloor(r,p.x,p.y));assert.ok(!r.layout.protectedTiles.includes(p.y*r.cols+p.x));assert.ok(Math.abs(p.x-3)+Math.abs(p.y-11)>5);assert.ok(Math.abs(p.x-r.exit.x)+Math.abs(p.y-r.exit.y)>4);}
  for(const d of plan.decorations.filter(d=>d.screenSpace)){
   const b=d.bounds,overlaps=(l,t,right,bottom)=>b.left<right&&b.right>l&&b.top<bottom&&b.bottom>t;
   assert.ok(!overlaps(25,183.5,74,239.5));
   for(let y=1;y<r.rows-1;y++)for(let x=1;x<r.cols-1;x++)if(isFloor(r,x,y)){const px=50+22*x+2*y,py=57.5+16*y;assert.ok(!overlaps(px-12,py-8,px+12,py+8));}
  }
  const bossRoom=room(712,biome*5+5),bossPlan=buildCaveScenery(bossRoom,{biome});assert.deepEqual(bossPlan.rails,[]);for(const d of bossPlan.decorations)assert.ok(decorationFits(bossRoom,d));
  assert.deepEqual(buildCaveScenery({...r,floorMask:null},{biome}),empty);
  assert.deepEqual(buildCaveScenery({...r,layout:{style:'ABISMO'}},{biome}),empty);
 }
});
test('rail segments never overlap or touch, including regression seed 23',()=>{
 for(let seed=1;seed<=1000;seed++){
  const {rails}=buildCaveScenery(room(seed));
  for(let i=1;i<rails.length;i++)for(const a of rails[i])for(const b of rails[i-1])assert.ok(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)>=2,`overlap seed ${seed}`);
 }
});

import {World} from '../dist/world.js';
import {BIOME_ART} from '../dist/palette.js';
test('legacy cave background retains its ground patches outside the illustrated-wall rollout',()=>{
 const originalPath=globalThis.Path2D;
 globalThis.Path2D=class{constructor(){return new Proxy(this,{get:()=>()=>{}});}};
 try{
  for(let biome=1;biome<7;biome++){
   let patches=0;const context=new Proxy({ellipse(){if(this.fillStyle===BIOME_ART[biome].patch&&this.globalAlpha===.26)patches++;}},{get:(target,key)=>key in target?target[key]:()=>{}});
   const room={cols:21,rows:15,seed:712,cleared:false,exit:{x:18,y:2}},before=JSON.stringify(room);
   World.prototype.cave.call({cache:{width:1200,height:760},background:()=>context},{run:{floor:biome*5+1,room}});
   assert.equal(patches,8,'legacy ground patches missing in biome '+biome);assert.equal(JSON.stringify(room),before);
  }
 }finally{if(originalPath===undefined)delete globalThis.Path2D;else globalThis.Path2D=originalPath;}
});
