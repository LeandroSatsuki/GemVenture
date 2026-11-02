import test from 'node:test';import assert from 'node:assert/strict';
import {avoidPinnedMission} from '../dist/hud-pinned-panel.js';

test('incoming information yields to a pinned mission without changing its bounds',()=>{
 const mission=Object.freeze({left:500,right:690,top:82,bottom:190}),incoming=Object.freeze({x:330,y:12,width:360});
 assert.deepEqual(avoidPinnedMission(incoming,108,mission),{x:330,y:202,width:360});
 assert.deepEqual(mission,{left:500,right:690,top:82,bottom:190});
 assert.equal(avoidPinnedMission(incoming,40,mission),incoming);
 assert.equal(avoidPinnedMission({x:100,y:12,width:200},108,mission).y,12);
 assert.equal(avoidPinnedMission(incoming,0,mission),incoming);
});
