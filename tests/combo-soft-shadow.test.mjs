import test from 'node:test';import assert from 'node:assert/strict';
import {sampleComboDisco,comboPulseGeometry,paintComboDiscoFloor} from '../dist/combo-disco.js';
import {paintSoftGroundShadow,paintSoftShadowShape,shadowBounds} from '../dist/soft-ground-shadow.js';
import {generateAsset} from '../dist/art-kit.js';
test('the local musical field grows at all eight milestones, stays bounded and does not anticipate the beat',()=>{
 let prior=0;for(const combo of[5,10,15,20,50,100,250,500]){const f=sampleComboDisco({combo,beat:8,player:{x:100,y:200}}),g=comboPulseGeometry(f);assert.ok(g.radius>=prior&&g.radius<=38);prior=g.radius;assert.ok(g.bands<=3&&g.comets<=4);assert.equal(g.pulse,1);for(const phase of[.5,.9,.999])assert.equal(comboPulseGeometry(sampleComboDisco({combo,beat:8+phase})).pulse,0);}
});
test('soft combo geometry is stationary; pause, restored combo and lost combo do not replay a milestone',()=>{
 const memory={},options={combo:100,player:{x:10,y:20},soft:true,memory};const a=sampleComboDisco({...options,beat:8}),b=sampleComboDisco({...options,beat:80});assert.deepEqual(comboPulseGeometry(a),comboPulseGeometry(b));assert.equal(a.entry,null);assert.equal(comboPulseGeometry(a).comets,0);assert.equal(sampleComboDisco({...options,combo:0,beat:81}),null);
});
test('soft cast shadows keep source geometry immutable and never soften a body face',()=>{
 const stops=[],calls=[],stack=[],c=new Proxy({globalAlpha:.8,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},createRadialGradient(){return{addColorStop:(...x)=>stops.push(x)};}},{get:(o,k)=>o[k]??((...a)=>calls.push([k,...a]))}),p=[[0,0],[20,0],[24,10],[4,10]],before=JSON.stringify(p);
 assert.equal(paintSoftGroundShadow(c,p),true);assert.equal(JSON.stringify(p),before);assert.equal(c.globalAlpha,.8);assert.equal(stack.length,0);assert.equal(stops.at(-1)[1].slice(-2),'00');assert.ok(calls.some(x=>x[0]==='arc'));assert.ok(!calls.some(x=>x[0]==='filter'));
 for(const type of['rock','crystal']){const a=generateAsset(type,{variant:0}),snapshot=JSON.stringify(a);assert.ok(a.shapes.some(s=>s.fill==='#132233'));for(const shape of a.shapes)if(shape.fill!=='#132233')assert.equal(paintSoftShadowShape(c,shape),false);assert.equal(JSON.stringify(a),snapshot);}
 assert.equal(shadowBounds([[NaN,0],[1,1],[2,2]]),null);assert.equal(paintSoftGroundShadow(c,[]),false);
 assert.equal(paintSoftShadowShape(c,{type:'ellipse',fill:'#180d2f',cx:50,cy:96,rx:32,ry:7}),true);assert.equal(paintSoftShadowShape(c,{type:'ellipse',fill:'#180d2f',cx:50,cy:40,rx:9,ry:4}),false,'body ellipses stay intact');
});
test('combo drawing clips to the floor, draws curves and restores state even if drawing fails',()=>{
 let saved=0,restored=0,clipped=0;const c=new Proxy({globalAlpha:1,save(){saved++;},restore(){restored++;},clip(){clipped++;},createRadialGradient(){return{addColorStop(){}};},fill(){throw Error('draw fail');}},{get:(o,k)=>o[k]??(()=>{})});
 assert.throws(()=>paintComboDiscoFloor(c,sampleComboDisco({combo:100}),null,{}),/draw fail/);assert.equal(saved,restored);assert.equal(clipped,1);
});
