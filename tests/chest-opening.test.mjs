import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {registerHooks} from 'node:module';

// This same test runs in the isolated candidate and, after integration, tests/.
// Only missing read-only owners are resolved to the checkout during candidate QA.
const localDist=new URL('../dist/',import.meta.url),candidate=!existsSync(new URL('core.js',localDist));
const domainDist=candidate?new URL('../../../../gemventure/dist/',import.meta.url):localDist;
const owners=new Set(['cave-find-shapes.js','dungeon-volumes.js','cave-finds.js']);
const hook=candidate?registerHooks({resolve(spec,context,next){
 if(context.parentURL?.startsWith(localDist.href)&&spec.startsWith('./')){const target=new URL(spec,context.parentURL),name=target.pathname.split('/').at(-1);if(owners.has(name)&&!existsSync(target))return {url:new URL(name,domainDist).href,shortCircuit:true};}
 return next(spec,context);
}}):null;
const art=await import(new URL('approved-chest-opening-art.js',localDist));
const {ChestOpeningPresentation}=await import(new URL('chest-opening-presentation.js',localDist));
const E=await import(new URL('core.js',domainDist));
const {chestReward,FIND_RULES}=await import(new URL('cave-finds.js',domainDist));
const {generateAsset,assetToSvg}=await import(new URL('art-kit.js',domainDist));
const {volumeBuilder}=await import(new URL('dungeon-volumes.js',domainDist));
const {rectangularRoom}=await import(new URL('../tests/helpers/rectangular-room.mjs',domainDist));
hook?.deregister();

const chest=(id='find:room:3',used=false)=>({type:'caveFind',kind:'chest',id,x:4,y:11,hp:used?0:1,maxHp:1,used});
const event=find=>({type:'findUsed',kind:'chest',id:find.id,x:find.x,y:find.y,area:false});
const asSvg=shapes=>assetToSvg({type:'cave-chest',width:100,height:110,shapes});

test('approved closed geometry is exact, body/shadow stay fixed, and frames remain finite inside inherited footprint',()=>{
 const frames=art.chestOpeningFrames(),closed=generateAsset('cave-chest',{seed:1,variant:0});
 assert.equal(asSvg(frames[0]),assetToSvg(closed));assert.strictEqual(art.chestOpeningFrames(),frames);assert.equal(frames.length,16);assert.deepEqual(art.CHEST_OPENING.hinge,{y:-17,z:28});
 const body=volumeBuilder({castShadow:false});body.prism(0,0,0,65,42,29,['#ed9353','#9c3824','#591d35'],3,5);const fixed=body.shapes.map(s=>({...s,matrix:[1,0,0,1,0,8]})),shadow=closed.shapes.filter(s=>s.fill==='#132233');
 const bounds=shapes=>shapes.flatMap(s=>{const n=s.d.match(/[-+]?(?:\d*\.\d+|\d+)/g).map(Number);return Array.from({length:n.length/2},(_,i)=>[n[2*i],n[2*i+1]+8]);});const oldBottom=Math.max(...bounds(frames[0]).map(p=>p[1]));
 for(let i=0;i<frames.length;i++){
  const shapes=frames[i];assert.ok(shapes.length<=150);assert.doesNotMatch(asSvg(shapes),/NaN|Infinity|undefined/);assert.deepEqual(shapes,art.chestOpeningShapes(i/15));
  for(const [x,y] of bounds(shapes)){assert.ok(x>=0&&x<=100);assert.ok(y>=0&&y<=oldBottom+1e-6);}
  if(i){assert.deepEqual(shapes.slice(0,shadow.length),shadow);assert.deepEqual(shapes.slice(shadow.length,shadow.length+fixed.length),fixed);}
 }
});

test('real chest event animates once after its domain payout; sampling never mutates state or grants rewards',()=>{
 const state=E.createState(43);E.startRun(state);rectangularRoom(state);const run=state.run;run.room.quota=99999;run.room.wave=null;
 const find={...chest('find:'+run.room.seed+':3'),number:3,reward:chestReward(run.room.seed,run.floor,3)};run.room.caveFinds=[find];const view=new ChestOpeningPresentation();view.setContext(run.room);
 const materials=[...run.materials];assert.equal(view.accept([event(find)],4),0);assert.equal(view.sample(find,{age:4}).phase,'closed');
 assert.equal(E.act(state,{type:'hit',id:find.id},0).ok,true);assert.equal(find.used,true);assert.equal(run.materials[find.reward.kind],materials[find.reward.kind]+find.reward.amount);
 const snapshot=JSON.stringify(state),events=run.events;assert.equal(view.accept(events,4),1);assert.equal(view.accept(events,4),0);
 assert.deepEqual(view.sample(find,{age:4}),{frameIndex:1,progress:0,phase:'opening'});
 const half=view.sample(find,{age:4.225});assert.equal(half.phase,'opening');assert.ok(Math.abs(half.progress-.5)<1e-8);assert.ok(half.frameIndex>1&&half.frameIndex<15);
 for(let n=0;n<20;n++)assert.deepEqual(view.sample(find,{age:4.225}),half);assert.deepEqual(view.sample(find,{age:4.1}),half);
 assert.deepEqual(view.sample(find,{age:4.5}),{frameIndex:15,progress:1,phase:'open'});assert.equal(JSON.stringify(state),snapshot);assert.strictEqual(run.events,events);
 E.act(state,{type:'hit',id:find.id},1);assert.equal(run.materials[find.reward.kind],materials[find.reward.kind]+find.reward.amount);
});

test('loaded used chests are final, context changes reject old events, and same-room refresh never replays',()=>{
 const used=chest('find:loaded:3',true),room={caveFinds:[used]},view=new ChestOpeningPresentation();assert.equal(view.setContext(room),true);assert.equal(view.setContext(room),false);assert.equal(view.accept([event(used)],0),0);assert.equal(view.sample(used,{age:0}).frameIndex,15);
 const next=chest('find:new:3'),nextRoom={caveFinds:[next]};view.setContext(nextRoom);assert.equal(view.accept([event(used)],1),0);assert.equal(view.sample(used,{age:99}).phase,'closed');next.used=true;next.hp=0;assert.equal(view.accept([event(next)],1),1);assert.equal(view.setContext(nextRoom),false);assert.equal(view.sample(next,{age:1.1}).phase,'opening');
 view.setContext({caveFinds:[{...next}]});assert.equal(view.accept([event(next)],1.1),0);view.setContext(null);assert.equal(view.accept([event(next)],1.2),0);
});

test('soft settles a pending opening permanently; invalid events and excess entries cannot activate',()=>{
 const nodes=Array.from({length:FIND_RULES.maxProps+10},(_,i)=>chest('find:bounded:'+i)),view=new ChestOpeningPresentation();view.setContext({caveFinds:nodes});for(const n of nodes){n.used=true;n.hp=0;}
 assert.equal(view.accept(nodes.map(event),3),FIND_RULES.maxProps);assert.equal(view.accept(nodes.map(event),3),0);const f=nodes[0];assert.equal(view.sample(f,{age:3}).phase,'opening');assert.equal(view.sample(f,{age:3.01,soft:true}).frameIndex,15);assert.equal(view.sample(f,{age:3.02,soft:false}).phase,'open');assert.equal(view.sample(nodes.at(-1),{age:4}).phase,'closed');
 const fresh=chest(),room={caveFinds:[fresh]};view.setContext(room);fresh.used=true;fresh.hp=0;
 assert.equal(view.accept([{...event(fresh),type:'loot'},{...event(fresh),kind:'combo'},{...event(fresh),id:'foreign'},{...event(fresh),x:100}],0),0);
 room.caveFinds=[];assert.equal(view.accept([event(fresh)],0),0);
});

test('native renderer imports without DOM and uses bounded fixed-frame sprites at the canonical pivot',()=>{
 assert.equal(art.paintChestOpening(null,0,0,34,0),false);const oldPath=Object.getOwnPropertyDescriptor(globalThis,'Path2D');let allocated=0,paths=0;
 class Path{constructor(d){assert.equal(typeof d,'string');paths++;}}
 class Context{constructor(canvas){this.canvas=canvas;this.draws=[];}save(){}restore(){}scale(){}translate(){}transform(){}fill(){}stroke(){}drawImage(...args){this.draws.push(args);}}
 const doc={createElement(name){assert.equal(name,'canvas');allocated++;const canvas={};canvas.getContext=()=>new Context(canvas);return canvas;}};
 Object.defineProperty(globalThis,'Path2D',{configurable:true,writable:true,value:Path});
 try{
  const ctx=new Context({ownerDocument:doc});assert.equal(art.paintChestOpening(ctx,80,90,34,0),false);assert.equal(allocated,0);
  for(let repeat=0;repeat<4;repeat++)for(let i=1;i<=15;i++)assert.equal(art.paintChestOpening(ctx,80,90,34,i),true);
  assert.equal(allocated,15);assert.ok(paths<=16*150);const draw=ctx.draws[0];assert.ok(Math.abs(draw[1]-(80-54*.34))<1e-8);assert.ok(Math.abs(draw[2]-(90-100*.34))<1e-8);assert.equal(draw[3],108*.34);assert.equal(draw[4],118*.34);
  const count=allocated;art.paintChestOpening(ctx,20,30,64,15);assert.equal(allocated,count);assert.equal(art.chestOpeningFrameIndex(0,{soft:true}),15);assert.equal(art.chestOpeningFrameIndex(0,{reduced:true}),15);
 }finally{if(oldPath)Object.defineProperty(globalThis,'Path2D',oldPath);else delete globalThis.Path2D;}
});
