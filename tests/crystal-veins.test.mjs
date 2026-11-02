import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {crystalVeinShapes,CRYSTAL_VEIN_RAMPS} from '../dist/crystal-veins.js';
import {dungeonMineralShapes} from '../dist/dungeon-volumes.js';
import {worldCrystalShapes} from '../dist/world-crystals.js';
import {generateAsset,assetToSvg,drawAsset} from '../dist/art-kit.js';
import {missionArt} from '../dist/missions-assets.js';import {missionObjectiveArt} from '../dist/hud-art.js';
test('all geological entry points share the six-prism family without white glitches',()=>{
 for(let biome=0;biome<7;biome++)for(let variant=0;variant<4;variant++)for(const j of [-4,0,4]){
  const options={biome,variant,j},a=crystalVeinShapes(options);
  assert.strictEqual(a,dungeonMineralShapes('crystal',options));assert.strictEqual(a,worldCrystalShapes(options));
  assert.equal(a.filter(s=>s.id.startsWith('contour-')).length,6);assert.ok(a.some(s=>s.id.startsWith('host-rock')));
  assert.ok(a.every(s=>s.fill!=='#ffffe0'&&s.fill!=='#ffffff'));assert.ok(a.some(s=>s.fill===CRYSTAL_VEIN_RAMPS[variant][3]));
  assert.deepEqual(a,crystalVeinShapes(options));assert.ok(Object.isFrozen(a));
 }
});
test('native Canvas and SVG honor thin contours and never fill stroke-only paths',()=>{
 const a=generateAsset('crystal',{seed:41001}),svg=assetToSvg(a);assert.match(svg,/stroke-width="0.38"/);assert.doesNotMatch(svg,/fill="null"/);
 const old=globalThis.Path2D;globalThis.Path2D=class{};let fills=0,strokes=0;const widths=[];
 const ctx={save(){},restore(){},translate(){},scale(){},transform(){},fill(){fills++;},stroke(){strokes++;widths.push(this.lineWidth);}};
 try{drawAsset(ctx,'crystal',0,0,150,{seed:41001,procedural:true});assert.equal(fills,a.shapes.filter(s=>s.fill).length);assert.equal(strokes,a.shapes.filter(s=>s.stroke).length);assert.ok(widths.includes(.38));}finally{globalThis.Path2D=old;}
});
test('mission board and cave objectives use the matching veins, while reward gems remain separate',async()=>{
 for(const [key,variant] of [['crystals',0],['quartz',0],['ruby',1],['topaz',2],['emerald',3]]){assert.equal(missionArt[key],'assets/crystal-veins-v5/vein-'+variant+'.svg');assert.ok((await readFile(new URL('../dist/'+missionArt[key],import.meta.url))).length);}
 for(const id of ['miner','quartz','prism','geode','vital'])assert.match(missionObjectiveArt(id),/crystal-veins-v5/);
 const icons=await readFile(new URL('../dist/descent-icons.js',import.meta.url),'utf8');assert.match(icons,/gem-0.png/);assert.doesNotMatch(icons,/crystal-veins-v5/);
});
