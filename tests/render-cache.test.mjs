import test from 'node:test';import assert from 'node:assert/strict';import {drawAsset} from '../dist/art-kit.js';
test('gameplay sprites reuse painting, evict older seeds, and retain vectors for large previews',()=>{
 const oldPath=globalThis.Path2D,oldDocument=globalThis.document;let allocations=0,fills=0,blits=0;
 const context={scale(){},translate(){},transform(){},save(){},restore(){},fill(){fills++;},stroke(){},drawImage(){blits++;}};
 globalThis.Path2D=class{ellipse(){}roundRect(){}};globalThis.document={createElement(){allocations++;return{getContext:()=>context};}};
 try{
  drawAsset(context,'miner',0,0,31);const first=fills;
  for(let i=0;i<10000;i++)drawAsset(context,'miner',i,0,31);
  assert.equal(allocations,1);assert.equal(fills,first);assert.equal(blits,10001);
  for(let i=0;i<200;i++)drawAsset(context,'rock',0,0,30,{seed:i});
  const painted=fills;assert.ok(allocations<=10,'200 seeds share the nine actual rock silhouettes');
  for(let frame=0;frame<30;frame++)for(let i=0;i<200;i++)drawAsset(context,'rock',0,0,30,{seed:i});
  assert.equal(fills,painted,'dense rooms do not repaint every sprite on every frame');
  drawAsset(context,'miner',0,0,31);assert.equal(fills,painted,'miner remains cached');
  for(let biome=0;biome<5;biome++)for(let variant=0;variant<4;variant++)for(let i=0;i<200;i++)drawAsset(context,'crystal',0,0,30,{seed:i,biome,variant});
  assert.ok(allocations<=256,'evicted canvas surfaces are recycled');
  const rasterAllocations=allocations,before=fills;drawAsset(context,'miner',0,0,300);assert.equal(allocations,rasterAllocations);assert.ok(fills>before,'large preview paints vector shapes');
 }finally{globalThis.Path2D=oldPath;globalThis.document=oldDocument;}
});
