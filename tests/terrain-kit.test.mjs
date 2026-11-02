import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {TERRAIN_GRID,TERRAIN_MASKS,TERRAIN_SLOTS,normalizeTerrainMask,terrainMaskAt,terrainSlot,terrainPolygon,projectTerrainPoint,terrainGuideSvg} from '../dist/terrain-kit.js';

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function coverage(mask,edge){const axis=edge%2?0:1,at=edge===1||edge===2?1:0,points=terrainPolygon(mask).filter(p=>Math.abs(p[axis]-at)<1e-8).map(p=>p[1-axis]);return points.length?[Math.min(...points),Math.max(...points)]:[];}
test('all 256 neighborhoods normalize to exactly 47 stable slots inside a 64-cell atlas',()=>{
 assert.equal(TERRAIN_MASKS.length,47);assert.equal(TERRAIN_SLOTS.length,64);
 for(let mask=0;mask<256;mask++){const n=normalizeTerrainMask(mask);assert.equal(normalizeTerrainMask(n),n);assert.equal(TERRAIN_MASKS[terrainSlot(mask)],n);assert.ok(terrainSlot(mask)>=0&&terrainSlot(mask)<47);}
 for(const s of TERRAIN_SLOTS){assert.ok(s.frame.x>=0&&s.frame.y>=0);assert.ok(s.frame.x+s.frame.width<=TERRAIN_GRID.width);assert.ok(s.frame.y+s.frame.height<=TERRAIN_GRID.height);}
});
test('geometric silhouettes are finite, nondegenerate and remain within their frame',()=>{
 for(const mask of TERRAIN_MASKS){const points=terrainPolygon(mask);let area=0;
  for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];assert.ok(p.every(n=>Number.isFinite(n)&&n>=-1e-9&&n<=1+1e-9));area+=p[0]*q[1]-q[0]*p[1];const xy=projectTerrainPoint(p);assert.ok(xy[0]>=0&&xy[0]<=256&&xy[1]>=0&&xy[1]<=256);}
  assert.ok(area>0,mask);assert.ok(area<=2+1e-9,mask);
 }
 assert.deepEqual(projectTerrainPoint([0,0]),[32,120]);assert.deepEqual(projectTerrainPoint([1,1]),[224,248]);
});
test('every binary 4x3 neighborhood has matching horizontal seams',()=>{
 for(let pattern=0;pattern<4096;pattern++){
  const map=Array.from({length:3},(_,y)=>Array.from({length:4},(_,x)=>(pattern>>(y*4+x))&1));
  if(!map[1][1]||!map[1][2])continue;
  const a=coverage(terrainMaskAt(map,1,1),1),b=coverage(terrainMaskAt(map,2,1),3);
  assert.equal(a.length,b.length,pattern);for(let i=0;i<a.length;i++)close(a[i],b[i]);
 }
});
test('every binary 3x4 neighborhood has matching vertical seams',()=>{
 for(let pattern=0;pattern<4096;pattern++){
  const map=Array.from({length:4},(_,y)=>Array.from({length:3},(_,x)=>(pattern>>(y*3+x))&1));
  if(!map[1][1]||!map[2][1])continue;
  const a=coverage(terrainMaskAt(map,1,1),2),b=coverage(terrainMaskAt(map,1,2),0);
  assert.equal(a.length,b.length,pattern);for(let i=0;i<a.length;i++)close(a[i],b[i]);
 }
});
test('diagonal holes remain visible, and separate materials never join',()=>{
 const full=terrainPolygon(255),hole=terrainPolygon(15);assert.notDeepEqual(full,hole);
 assert.ok(hole.length>full.length);assert.equal(terrainMaskAt([[1,2,1],[1,1,2],[2,1,1]],1,1),4|8);
 assert.equal(terrainMaskAt([[0,0,0],[0,1,0],[0,0,0]],1,1),0);
});
test('exports contain 64 separated transparent mask cells, no embedded artwork or scripts',()=>{
 const svg=terrainGuideSvg();assert.equal((svg.match(/<g transform=/g)||[]).length,64);assert.ok(svg.includes('width="2048" height="2048"'));
 assert.doesNotMatch(svg,/<image|<script|<text|NaN|undefined/);assert.ok(terrainGuideSvg({labels:true}).includes('MÁSCARA'));
});
test('all seven PNG templates keep the exact 2048-pixel grid and alpha channel',async()=>{
 for(const material of ['pedra','terra','grama','agua','lava','madeira','alvenaria']){
  const png=await readFile(new URL('../dist/assets/terrain-kit-v1/'+material+'-template.png',import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),2048);assert.equal(png.readUInt32BE(20),2048);assert.equal(png[25],6);
 }
 const layout=JSON.parse(await readFile(new URL('../dist/assets/terrain-kit-v1/layout.json',import.meta.url),'utf8'));
 assert.equal(layout.version,2);assert.equal(layout.pieces.length,64);assert.equal(layout.materials.length,7);
 assert.match(layout.draft.status,/NOT ALIGNED/);
});
