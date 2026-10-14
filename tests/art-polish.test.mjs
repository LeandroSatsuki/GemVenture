import test from 'node:test';
import assert from 'node:assert/strict';
import {ART_TYPES,ART_ACCENT_PIVOTS,HEDGEHOG_PART_PIVOTS,generateAsset,drawAsset} from '../dist/art-kit.js';
import {softenPolygon} from '../dist/scene-art.js';

test('village accents are separate cached parts and compatibility gardeners are crystal hedgehogs',()=>{
 for(const type of Object.keys(ART_ACCENT_PIVOTS)){
  const a=generateAsset(type),base=a.shapes.filter(s=>s.layer==='base'),accent=a.shapes.filter(s=>s.layer==='accent');
  assert.ok(base.length>0,type);assert.ok(accent.length>0,type);assert.equal(base.length+accent.length,a.shapes.length);
  assert.ok(ART_ACCENT_PIVOTS[type].every(Number.isFinite));
 }
 for(let biome=0;biome<6;biome++)for(const seed of [1,32,999])assert.deepEqual(generateAsset('gardener',{seed,biome}).shapes,generateAsset('hedgehog',{seed,biome}).shapes);
 assert.equal(new Set(Array.from({length:6},(_,biome)=>JSON.stringify(generateAsset('hedgehog',{biome}).shapes))).size,6,'every biome has its own coat while crystals keep the four resource colors');
});

test('rounded construction keeps curves intact and bevels remain inside the original polygon',()=>{
 const curve='M 2 30 Q 10 5 30 10 L 40 30 Z';assert.equal(softenPolygon(curve),curve);
 const box=softenPolygon('M 0 0 L 100 0 L 100 100 L 0 100 Z',3.5);
 assert.match(box,/Q/);assert.match(box,/Z\s*$/);
 assert.ok((box.match(/-?\d*\.?\d+/g)||[]).map(Number).every(n=>n>=0&&n<=100));
 assert.equal((box.match(/Q/g)||[]).length,4);
 assert.doesNotMatch(softenPolygon('M 3 3 L 3 3 L 4 4 Z'),/NaN|Infinity/);
});

test('the giant spectator has seven complete non-overlapping animation parts',()=>{
 for(let biome=0;biome<6;biome++){
  const a=generateAsset('hedgehog',{biome}),parts=Object.keys(HEDGEHOG_PART_PIVOTS);
  assert.equal(a.shapes.length,30);
  assert.equal(parts.reduce((n,part)=>n+a.shapes.filter(s=>s.part===part).length,0),a.shapes.length);
  for(const part of parts)assert.ok(a.shapes.some(s=>s.part===part),part);
  assert.equal(a.shapes.filter(s=>s.part==='paw-left').length,3);
  assert.equal(a.shapes.filter(s=>s.part==='paw-right').length,3);
  assert.ok(a.shapes.filter(s=>s.part==='eyes').every(s=>s.layer==='base'));
 }
});

test('separate accent rendering reuses pixels and preserves the bounded canvas budget',()=>{
 const beforeDocument=globalThis.document,beforePath=globalThis.Path2D;let created=0,fills=0;
 class Path{constructor(){}ellipse(){}roundRect(){}}
 const paint={scale(){},translate(){},save(){},restore(){},transform(){},fill(){fills++;},stroke(){}};
 globalThis.Path2D=Path;globalThis.document={createElement(){created++;return {width:0,height:0,getContext(){return paint;}};}};
 const ctx={drawImage(){}};
 try{
  const a=generateAsset('well',{seed:817});
  drawAsset(ctx,'well',0,0,100,{seed:817});const allFills=fills;
  drawAsset(ctx,'well',0,0,100,{seed:817,layer:'base'});
  drawAsset(ctx,'well',0,0,100,{seed:817,layer:'accent'});
  assert.equal(allFills,a.shapes.length);assert.equal(fills,allFills*2);assert.equal(created,3);
  drawAsset(ctx,'well',0,0,100,{seed:817,layer:'accent'});assert.equal(fills,allFills*2);
  const prior=fills,priorCreated=created;
  for(const layer of Object.keys(HEDGEHOG_PART_PIVOTS))drawAsset(ctx,'hedgehog',0,0,128,{seed:817,layer});
  assert.equal(fills-prior,generateAsset('hedgehog',{seed:817}).shapes.length,'seven parts render exactly one spectator');
  assert.equal(created-priorCreated,7,'giant parts use cached sprites at 128px');
  const cached=fills;
  for(const layer of Object.keys(HEDGEHOG_PART_PIVOTS))drawAsset(ctx,'hedgehog',0,0,128,{seed:817,layer});
  assert.equal(fills,cached,'subsequent animation frames do not repaint vectors');
  for(let i=0;i<1800;i++)drawAsset(ctx,ART_TYPES[i%ART_TYPES.length],0,0,80,{seed:i*48271,variant:Math.floor(i/ART_TYPES.length)%4,biome:Math.floor(i/(ART_TYPES.length*4))%6,layer:['all','base','accent'][i%3]});
  assert.ok(created<=256,'animated layers must not create an unbounded canvas cache');
 }finally{globalThis.document=beforeDocument;globalThis.Path2D=beforePath;}
});
