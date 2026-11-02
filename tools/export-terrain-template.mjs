import {writeFile,mkdir} from 'node:fs/promises';
import {TERRAIN_GRID,TERRAIN_FOOTPRINT,TERRAIN_SLOTS,TERRAIN_MATERIALS,terrainGuideSvg,terrainGenerationPrompt} from '../dist/terrain-kit.js';
const root=new URL('../dist/assets/terrain-kit-v1/',import.meta.url);
await mkdir(root,{recursive:true});
await writeFile(new URL('guia-encaixes.svg',root),terrainGuideSvg({labels:true}));
await writeFile(new URL('mascaras.svg',root),terrainGuideSvg());
for(const m of TERRAIN_MATERIALS){await writeFile(new URL(m.id+'-template.svg',root),terrainGuideSvg({material:m.id}));await writeFile(new URL(m.id+'-prompt.txt',root),terrainGenerationPrompt(m.id));}
await writeFile(new URL('layout.json',root),JSON.stringify({version:2,status:'GEOMETRY TEMPLATE — FINAL ART PENDING',canvas:TERRAIN_GRID,footprint:TERRAIN_FOOTPRINT,pieces:TERRAIN_SLOTS,materials:TERRAIN_MATERIALS,draft:{file:'pedra-estudo-v1.png',columns:4,rows:6,status:'VISUAL STUDY ONLY — NOT ALIGNED TO FINAL 8x8 TEMPLATE'}},null,2));
console.log('Terrain contract: 47 connected masks + 17 auxiliary slots = 64. No gameplay changes.');
