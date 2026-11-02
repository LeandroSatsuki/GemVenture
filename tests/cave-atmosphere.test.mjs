import test from 'node:test';
import assert from 'node:assert/strict';
import {CAVE_ATMOSPHERES,caveAtmosphereProfile,paintCaveAtmosphere} from '../dist/cave-atmosphere.js';
import {PALETTE} from '../dist/palette.js';
const run={floor:1,mode:'floors',room:{}};
test('air supports all campaign biomes and legacy rooms without depending on tile masks',()=>{
 assert.equal(CAVE_ATMOSPHERES.length,7);
 for(let floor=1;floor<=35;floor++){
  const p=caveAtmosphereProfile({...run,floor});assert.ok(PALETTE.includes(p.color));assert.ok(p.alpha>0&&p.alpha<=.03);
 }
 for(const r of [null,{...run,room:null},{...run,mode:'abyss'},{...run,room:{layout:{style:'ABISMO'}}},{...run,floor:36}])assert.equal(caveAtmosphereProfile(r),null);
});
test('air skips frames without separate crisp output and restores drawing state',()=>{
 const calls=[],c={canvas:{width:1000,height:700},save(){calls.push('save');},restore(){calls.push('restore');},setTransform(...v){calls.push(v);},fillRect(...v){calls.push(v);}};
 assert.equal(paintCaveAtmosphere(c,run),false);assert.deepEqual(calls,[]);
 assert.equal(paintCaveAtmosphere(c,run,{crispReady:true}),true);
 assert.deepEqual(calls,['save',[1,0,0,1,0,0],[0,0,1000,700],'restore']);
 assert.equal(c.globalCompositeOperation,'source-over');assert.equal(c.globalAlpha,CAVE_ATMOSPHERES[0].alpha*.5);
});
