import test from 'node:test';import assert from 'node:assert/strict';
import {lightingVisible,lightingLineClear,createExplorationLightingMasks,CAVE_LIGHT_MASK_SPEC} from '../dist/cave-lighting-masks.js';
const makePath=()=>({moveTo(){},lineTo(){},closePath(){}});
const room=()=>({cols:9,rows:9,seed:712,floorMask:Array(81).fill(1),visible:Array(81).fill(1),explored:Array(81).fill(1),rocks:[]});
const view={center:[150,130],width:400,height:300};
test('lighting excludes undiscovered and remembered-only cells; native visibility and geometry stay authoritative',()=>{
 const r=room();r.visible[40]=0;r.explored[41]=0;r.visible[41]=0;r.floorMask[42]=0;const before=JSON.stringify(r),m=createExplorationLightingMasks(r,view,null,{makePath,scope:'sight'});assert.equal(lightingVisible(r,4,4),false);assert(!m.cells.some(p=>p.y===4&&[4,5,6].includes(p.x)));assert.equal(JSON.stringify(r),before);
});
test('wall and live rock occlusion prevent light connecting sources across a blocker',()=>{
 const r=room();r.floorMask[4*9+4]=0;assert.equal(lightingLineClear(r,{x:2,y:4},{x:6,y:4}),false);assert.equal(lightingLineClear(r,{x:2,y:3},{x:6,y:3}),true);assert.equal(lightingLineClear(r,{x:2,y:3},{x:6,y:3},new Set(['4,3'])),false);
});
test('masks are viewport bounded, reuse stable discovery and rebuild on movement and Abismo rebase',()=>{
 const r={cols:192,rows:144,seed:712,floorMask:Array(192*144).fill(1),visible:Array(192*144).fill(1),explored:Array(192*144).fill(1),rocks:[]},m=createExplorationLightingMasks(r,view,null,{makePath});assert(m.cells.length<=CAVE_LIGHT_MASK_SPEC.maxCells);assert.equal(createExplorationLightingMasks(r,view,m,{makePath}),m);
 for(let i=0;i<100;i++)m.sourcePath({x:i,y:4});assert(m.status().sourcePaths<=CAVE_LIGHT_MASK_SPEC.maxSourcePaths);
 assert.notEqual(createExplorationLightingMasks(r,view,m,{depth:1,makePath}),m);r.visible=[...r.visible];assert.equal(createExplorationLightingMasks(r,view,m,{makePath}),m);
});

test('scenery masks retain unseen floor without expanding enemy discovery and invalidate on a broken blocker',()=>{const r=room();r.visible.fill(0);r.explored.fill(0);r.rocks=[{x:4,y:3,hp:1}];const before=JSON.stringify(r),m=createExplorationLightingMasks(r,view,null,{makePath});assert.equal(m.scope,'scenery');assert.equal(m.cells.length,81);assert.equal(lightingVisible(r,4,4),false);assert.equal(JSON.stringify(r),before);r.rocks[0].hp=0;assert.notEqual(createExplorationLightingMasks(r,view,m,{makePath}),m);});
