import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {ART_TYPES,ART_RULES,generateAsset,assetToSvg} from '../dist/art-kit.js';
import {PALETTE,GEM_RAMPS} from '../dist/palette.js';
import {CRYSTALS} from '../dist/core.js';

test('generated families stay within the palette and detail budget across seeds and biomes',()=>{
 const allowed=new Set(PALETTE);assert.equal(allowed.size,32);
 for(const type of ART_TYPES)for(let biome=0;biome<6;biome++)for(const seed of [0,1,55,1208,2147483647,4294967295]){
  const asset=generateAsset(type,{seed,biome,variant:seed%(type==='boss'?6:4)});
  assert.ok(asset.shapes.length>0&&asset.shapes.length<=ART_RULES.maxShapes,type);
  assert.deepEqual(asset.anchor,{x:50,y:96});
  for(const shape of asset.shapes){assert.ok(allowed.has(shape.fill),shape.fill);if(shape.stroke)assert.ok(allowed.has(shape.stroke));
   for(const value of Object.values(shape))if(typeof value==='number')assert.ok(Number.isFinite(value));
   if(shape.d)assert.match(shape.d,/^[MmLlHhVvCcSsQqTtAaZz\s\d.,eE+-]+$/);
   if(shape.matrix){assert.equal(shape.matrix.length,6);assert.ok(shape.matrix.every(Number.isFinite));}
  }
 }
});
test('procedural silhouettes are reproducible after cache eviction and vary between seeds',()=>{
 const baseline=JSON.stringify(generateAsset('crystal',{seed:13,variant:2}));
 for(let i=0;i<600;i++)generateAsset('rock',{seed:i});
 assert.equal(JSON.stringify(generateAsset('crystal',{seed:13,variant:2})),baseline);
 assert.notEqual(JSON.stringify(generateAsset('crystal',{seed:13}).shapes),JSON.stringify(generateAsset('crystal',{seed:55}).shapes));
 assert.throws(()=>generateAsset('missing'),RangeError);
 assert.ok(Object.isFrozen(generateAsset('miner').shapes[0]));
});
test('SVG exports preserve every shape, outline and gameplay crystal color',()=>{
 for(let i=0;i<4;i++){assert.equal(CRYSTALS[i].color,GEM_RAMPS[i][0]);assert.equal(CRYSTALS[i].shade,GEM_RAMPS[i][1]);}
 for(const type of ART_TYPES){const asset=generateAsset(type),svg=assetToSvg(asset);
  assert.equal((svg.match(/<(?:path|ellipse|rect) /g)||[]).length,asset.shapes.length);
  assert.ok(svg.includes('viewBox="0 0 100 110"'));
  assert.doesNotMatch(svg,/<script|<image|<filter|gradient|undefined|NaN/i);
 }
});
test('all declared colors in shipped art, UI and effects come from HEPT32',async()=>{
 const allowed=new Set(PALETTE);
 for(const file of await readdir(new URL('../dist/',import.meta.url))){if(!/\.(js|css|html|svg)$/.test(file))continue;
  const source=await readFile(new URL('../dist/'+file,import.meta.url),'utf8');
  for(const match of source.matchAll(/#([\da-f]{6})(?:[\da-f]{2})?\b/gi))assert.ok(allowed.has('#'+match[1].toLowerCase()),file+': '+match[0]);
  assert.doesNotMatch(source,/AREN32|aren32/);
 }
});
