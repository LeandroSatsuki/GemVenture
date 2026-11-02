import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {abyssBounds,isAbyssCave} from '../dist/abyss-cave-layout.js';
import {createLegacyAbyssLayout,shiftAbyssLayout,validateLayout} from '../dist/cave-layout.js';
import {hedgehogHabitat,clipBurrowFog} from '../dist/abyss-cave-habitat.js';
import {hedgehogVisible} from '../dist/hedgehog.js';
function run(){const s=E.createState(712);s.descent.bosses=[5,10,15,20];s.descent.gate=[1500,1200,1000,800];E.startRun(s,'abyss');return s;}
test('new Abismo runs select the approved stream while campaign rooms retain their own marker',()=>{
 const s=run();assert.ok(isAbyssCave(s.run.room));assert.ok(validateLayout(s.run.room));assert.equal(s.run.room.campaignCave,undefined);assert.ok(E.restoreState(JSON.stringify(s)));
 const c=E.createState(712);E.startRun(c);assert.equal(c.run.room.abyssCave,undefined);assert.equal(c.run.room.campaignCave.version,1);
});
test('100 seeds retain wide connected passages and varied longitudinal journeys',()=>{
 const routes=new Set();for(let seed=0;seed<100;seed++){let previous=null;const route=[];for(let y=0;y<720;y++){const p=abyssBounds(seed,y);assert.ok(p.right-p.left+1>=23);assert.ok(p.left>=2&&p.right<=39);assert.ok(p.left<=20&&p.right>=24);if(previous)assert.ok(Math.min(previous.right,p.right)-Math.max(previous.left,p.left)+1>=20);previous=p;route.push(p.left+','+p.right);}routes.add(route.join(';'));}assert.equal(routes.size,100);
});
test('streaming retains old rows, a reachable burrow front and solid wall backing',()=>{
 const s=run(),room=s.run.room;
 for(let depth=0;depth<360;depth++){const h=room.hedgehog;if(h.x){for(let dx=-5;dx<=5;dx++){assert.equal(room.floorMask[(h.y+1)*42+h.x+dx],1);if(h.y>=9)for(let dy=0;dy<9;dy++)assert.equal(room.floorMask[(h.y-dy)*42+h.x+dx],0);}}
  const old=room.floorMask;shiftAbyssLayout(room,depth,{x:20,y:15});for(let y=1;y<27;y++)assert.deepEqual(room.floorMask.slice(y*42,(y+1)*42),old.slice((y+1)*42,(y+2)*42));assert.ok(validateLayout(room));assert.equal(room.floorMask.length,1260);
 }
});
test('legacy active streams remain markerless and retain their native broad rescue row',()=>{
 const s=run(),r=s.run;delete r.room.abyssCave;createLegacyAbyssLayout(r.room);assert.equal(isAbyssCave(r.room),false);const h=r.room.hedgehog;
 shiftAbyssLayout(r.room,0,{x:20,y:15});assert.equal(r.room.abyssCave,undefined);for(let x=4;x<=37;x++)assert.equal(r.room.floorMask[15*42+x],1);assert.ok(validateLayout(r.room));assert.ok(h);
 const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.run.room.abyssCave,undefined);
});
test('restore rejects corrupt or mode-incompatible new stream markers',()=>{
 for(const marker of [null,{version:2},{version:'1'}]){const s=run();s.run.room.abyssCave=marker;assert.equal(E.restoreState(JSON.stringify(s)),null);}
 const s=run();s.run.mode='floors';assert.equal(E.restoreState(JSON.stringify(s)),null);
});
test('habitat explains existing growth, without granting resources or changing its limits',()=>{
 const s=run(),before=JSON.stringify(s.run),home=hedgehogHabitat(s.run.room);assert.match(home.summary,/cultiva.*cristais/);assert.match(home.reason,/picaretada no pulso/);assert.equal(JSON.stringify(s.run),before);assert.equal(hedgehogHabitat({}),null);
});
test('an off-window burrow is not selectable even with a large explored radius',()=>{
 const s=run(),room=s.run.room;room.hedgehog={...room.hedgehog,x:0,y:0};room.visible=Array(1260).fill(1);assert.equal(hedgehogVisible(room),false);
});
test('burrow fog aperture requires discovery and does not reveal or mutate the map',()=>{
 const Original=globalThis.Path2D;globalThis.Path2D=class{rect(){}moveTo(){}lineTo(){}bezierCurveTo(){}quadraticCurveTo(){}closePath(){}};
 try{const s=run(),room=s.run.room,view={center:[350,300],width:600,height:400};let clips=0;const ctx={clip:(_path,rule)=>{assert.equal(rule,'evenodd');clips++;}};
  room.visible=Array(1260).fill(0);assert.equal(hedgehogVisible(room),false);assert.equal(clipBurrowFog(ctx,room,view),false);
  const h=room.hedgehog;room.visible[(h.y+1)*42+h.x]=1;const before=JSON.stringify(room);assert.equal(clipBurrowFog(ctx,room,view),true);assert.equal(clips,1);assert.equal(JSON.stringify(room),before);
 }finally{globalThis.Path2D=Original;}
});
