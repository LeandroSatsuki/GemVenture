import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {REFUGE_NAVIGATION} from '../dist/refuge-scene.js';import {navigationFromContract} from '../dist/geometry-adapter.js';import {refugeLandContains,polygonContains,segmentDistance} from '../dist/refuge-terrain.js';
const nav=navigationFromContract(REFUGE_NAVIGATION);
test('all110 trips stay inside the island with the entire feet disc and avoid ten solid footprints',()=>{
 const locations=[REFUGE_NAVIGATION.spawn,...Object.values(REFUGE_NAVIGATION.approaches)];assert.equal(locations.length,11);let trips=0,samples=0;assert.equal(REFUGE_NAVIGATION.obstacles.length,10);
 for(const a of locations)for(const b of locations)if(a!==b){const route=nav.route(a,b);assert.equal(route.ok,true);trips++;
  for(let j=1;j<route.points.length;j++){const p=route.points[j-1],q=route.points[j],steps=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/6));for(let k=0;k<=steps;k++){const t=k/steps,x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t;assert.ok(refugeLandContains(x,y,REFUGE_NAVIGATION.actorRadius));for(const o of REFUGE_NAVIGATION.obstacles){assert.equal(polygonContains(o.polygon,x,y),false);for(let i=0;i<o.polygon.length;i++)assert.ok(segmentDistance(x,y,o.polygon[i],o.polygon[(i+1)%o.polygon.length])>REFUGE_NAVIGATION.actorRadius);}samples++;}}
 }assert.equal(trips,110);assert.ok(samples>1000);assert.ok(nav.stats().nodes<5000);
});
test('outside clicks and pedestal clicks cannot become destinations',()=>{const polygon=REFUGE_NAVIGATION.obstacles.find(o=>o.id==='statue').polygon,inside={x:polygon.reduce((s,p)=>s+p[0],0)/polygon.length,y:polygon.reduce((s,p)=>s+p[1],0)/polygon.length};for(const p of [{x:0,y:0},{x:1000,y:620},inside,{x:500,y:80}])assert.equal(nav.route(REFUGE_NAVIGATION.spawn,p).ok,false);});
test('combat projection, hop sampler and cave movement remain unchanged',async()=>{
 const current=(await fs.readFile(new URL('../dist/world.js',import.meta.url),'utf8')).replace(/\r\n/g,'\n'),baseline=JSON.parse(await fs.readFile(new URL('./fixtures/refuge-r3-cave-motion.json',import.meta.url),'utf8'));
 const movement=code=>code.slice(code.indexOf(' advanceMovement('),code.indexOf(' drawTrail('));
 assert.equal(movement(current).replace(/\n  if\(this\.refugeMode\)\{[^\n]*\}\n/,'\n'),baseline.movement);
 const a=current.indexOf('export function hopPose'),b=current.indexOf('\n}',a)+2;assert.equal(current.slice(a,b),baseline.hopSampler);
 const run=await fs.readFile(new URL('../dist/run.js',import.meta.url),'utf8');assert.doesNotMatch(run,/baseTimer|mountRefugeQA|refugeQAPaused|\/gv028\//);assert.match(run,/takeRefugeArrival\(\)/);
});

