import test from 'node:test';import assert from 'node:assert/strict';
import {buildLiquidEmissionPlan,sampleLiquidParticles,createLiquidAmbience,LIQUID_LIGHT_COLORS} from '../dist/liquid-ambience.js';
const makePath=()=>({moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){}});
function fixture(){const cols=42,rows=30,room={cols,rows,seed:712,floorMask:Array(cols*rows).fill(1),explored:Array(cols*rows).fill(1),visible:Array(cols*rows).fill(1),terrain:Array(cols*rows).fill(0)},cells=[];for(let y=3;y<26;y++)for(let x=3;x<39;x++){room.terrain[y*cols+x]=x<19?1:3;cells.push({x,y});}return {room,cells};}
test('water and lava remain emissive outside enemy sight; non-liquid terrain stays excluded',()=>{
 const {room,cells}=fixture();room.visible[cells[0].y*room.cols+cells[0].x]=0;for(let i=1;i<4;i++)room.terrain[cells[i].y*room.cols+cells[i].x]=[2,5,6][i-1];const before=JSON.stringify(room),plan=buildLiquidEmissionPlan(room,cells,{makePath});
 assert.deepEqual(plan.groups.map(g=>g.type),[1,3]);assert.equal(plan.cells,cells.length-3);assert(plan.emitters.length<=12);assert(plan.groups[0].cells.some(p=>p.x===cells[0].x&&p.y===cells[0].y));assert.equal(JSON.stringify(room),before);
});
test('water is cool and magical, lava is warm; particles originate on their own visible surfaces and honor soft mode',()=>{
 const {room,cells}=fixture(),plan=buildLiquidEmissionPlan(room,cells,{makePath}),a=sampleLiquidParticles(plan,4);assert(a.length>0&&a.length<=24);assert.deepEqual(a,sampleLiquidParticles(plan,4));assert.deepEqual(sampleLiquidParticles(plan,4,true),[]);
 for(const p of a){assert.equal(room.terrain[p.sourceY*room.cols+p.sourceX],p.type);assert(p.y<=57.5+16*p.sourceY);assert(p.alpha>=0&&p.alpha<=1);}
 assert.notDeepEqual(a,sampleLiquidParticles(plan,4.1));assert.equal(LIQUID_LIGHT_COLORS[1].color,'#28dcff');assert.equal(LIQUID_LIGHT_COLORS[3].color,'#ff681f');
});
test('Abismo rebasing preserves absolute emitter phases while updating projected positions',()=>{
 const {room,cells}=fixture(),a=buildLiquidEmissionPlan(room,cells,{depth:0,makePath});const moved={...room,floorMask:room.floorMask.slice(42).concat(Array(42).fill(1)),terrain:room.terrain.slice(42).concat(Array(42).fill(0)),visible:room.visible.slice(42).concat(Array(42).fill(1))},b=buildLiquidEmissionPlan(moved,cells.map(p=>({...p,y:p.y-1})),{depth:1,makePath});
 for(const p of a.emitters){const q=b.emitters.find(q=>q.x===p.x&&q.y===p.y-1&&q.type===p.type);assert(q);assert.equal(q.phase,p.phase);assert.equal(q.py,p.py-16);assert.equal(q.px,p.px-2);}
});
test('neon zero makes no draw calls; reused textures and bounded light caches are released with the scene',()=>{
 const previousPath=globalThis.Path2D;globalThis.Path2D=class{moveTo(){}lineTo(){}quadraticCurveTo(){}closePath(){}};
 try{const {room,cells}=fixture(),canvases=[],context=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]??(()=>{}),set:(target,key,value)=>{target[key]=value;return true;}}),liquid=createLiquidAmbience(room,{makeCanvas:(w,h)=>{const c={width:w,height:h,getContext:()=>context};canvases.push(c);return c;}}),masks={cells,floor:makePath(),sourcePath:makePath};
 liquid.update(masks,{time:4});let draws=0;const forbidden=new Proxy({},{get:()=>()=>{draws++;}});liquid.paintGround(forbidden,masks,{gain:0});liquid.paintParticles(forbidden,{gain:0});liquid.paintNight(forbidden,{},()=>draws++,masks,{gain:0});assert.equal(draws,0);
 for(let i=0;i<20;i++){liquid.update(masks,{time:4+i*.1});liquid.paintGround(context,masks);liquid.paintParticles(context);}assert.equal(canvases.length,4);assert.equal(liquid.status().textures,2);assert(liquid.status().cacheWidth<=1024&&liquid.status().cacheHeight<=1024);assert(liquid.status().canvasBytes<=8520000);
 liquid.update(masks,{time:8,soft:true});assert.equal(liquid.status().particles,0);liquid.dispose();assert.equal(liquid.status().canvasBytes,0);assert(canvases.every(c=>c.width===1&&c.height===1));
 }finally{globalThis.Path2D=previousPath;}
});
