import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCavePlan,createCaveGeometry,createCavePreview} from '../dist/cave-formation.js';
test('independent cave module builds in the game with existing palette, without DOM or gameplay state',()=>{
 const a=buildCavePlan(),b=buildCavePlan();assert.deepEqual(a,b);assert.equal(a.rocks.length,22);
 const root=createCaveGeometry({plan:a});assert.equal(root.children.length,23);
 root.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){assert.ok(['180d2f','353658','8b97b6'].includes(m.color.getHexString()));}});root.userData.dispose();
});
test('camera is a separate orthographic dependency and cavity stays open',()=>{
 const plan=buildCavePlan(),snapshot=JSON.stringify(plan),a=createCavePreview({plan}),b=createCavePreview({plan,camera:{azimuthDeg:70}});
 assert.ok(a.camera.isOrthographicCamera);assert.notDeepEqual(a.camera.position.toArray(),b.camera.position.toArray());assert.equal(JSON.stringify(plan),snapshot);assert.equal(plan.portal.openFront,true);a.dispose();b.dispose();
});
