import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||process.cwd());
const {ART_TYPES,ART_RULES,generateAsset,assetSvgBody}=await import(pathToFileURL(resolve(root,'dist/art-kit.js')));
const {PALETTE,BIOME_ART}=await import(pathToFileURL(resolve(root,'dist/palette.js')));
const palette=new Set(PALETTE),seeds=[0,1,55,1208,2147483647,4294967295];
let checked=0,maxShapes=0;
for(const type of ART_TYPES)for(let variant=0;variant<(type==='pickaxe'?10:type==='boss'?BIOME_ART.length:4);variant++)for(let biome=0;biome<BIOME_ART.length;biome++)for(const seed of seeds){
 const options={seed,biome,variant},a=generateAsset(type,options);
 assert.ok(a.shapes.length>0&&a.shapes.length<=ART_RULES.maxShapes,type+' shape budget');
 assert.deepEqual(a.anchor,{x:50,y:96});
 for(const s of a.shapes){
  assert.ok(palette.has(s.fill),type+' palette '+s.fill);if(s.stroke)assert.ok(palette.has(s.stroke),type+' outline');
  for(const v of Object.values(s))if(typeof v==='number')assert.ok(Number.isFinite(v),type+' finite');
  if(s.d)assert.ok(!/NaN|Infinity|undefined/.test(s.d),type+' path');
  if(s.matrix)assert.ok(s.matrix.length===6&&s.matrix.every(Number.isFinite),type+' matrix');
 }
 const snapshot=JSON.stringify(a);
 assert.equal(JSON.stringify(generateAsset(type,options)),snapshot,type+' deterministic generation');
 maxShapes=Math.max(maxShapes,a.shapes.length);checked++;
}
if(process.argv[3]){
 const cols=8,tileW=140,tileH=150,cells=[];
 for(const type of ART_TYPES)for(const biome of [0,4]){
  const i=cells.length,x=(i%cols)*tileW,y=Math.floor(i/cols)*tileH,a=generateAsset(type,{seed:55,biome,variant:type==='boss'?biome:biome%4});
  cells.push(`<g transform="translate(${x+20} ${y+10})">${assetSvgBody(a)}<text x="50" y="130" text-anchor="middle" fill="#c5cddb" font-family="sans-serif" font-size="12">${type} · ${biome+1}</text></g>`);
 }
 const h=Math.ceil(cells.length/cols)*tileH;
 await writeFile(resolve(process.argv[3]),`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*tileW}" height="${h}" viewBox="0 0 ${cols*tileW} ${h}"><rect width="100%" height="100%" fill="#180d2f"/>${cells.join('')}</svg>`);
}
console.log(JSON.stringify({families:ART_TYPES.length,biomes:BIOME_ART.length,variantsChecked:checked,maxShapes,palette:palette.size},null,2));
