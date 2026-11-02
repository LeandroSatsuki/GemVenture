import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {createState} from '../dist/core.js';import {createMiner,minerTile} from '../dist/miner.js';import {minerCellAppearance} from '../dist/miner-material-contract.js';import {VfxSprites} from '../dist/vfx-assets.js';import {P} from '../dist/palette.js';
// Capture the actual view's art requests and loading fallback, without image/network IO.
const url=new URL('../dist/miner-view.js',import.meta.url);let src=await fs.readFile(url,'utf8');
src=src.replace("import {drawApprovedArt,loadApprovedArt,approvedArtSvg} from './approved-art.js';","import {loadApprovedArt,approvedArtSvg} from './approved-art.js';const drawApprovedArt=(c,type,x,y,width,options)=>{globalThis.__jazidaVisual.calls.push({type,x,y,options});return !globalThis.__jazidaVisual.fallback;};");
src=src.replace('function gem(c,x,y,size,k){','function gem(c,x,y,size,k){globalThis.__jazidaVisual.gems++;');
src=src.replace(/from (['"])(\.\.?\/[^'"]+)\1/g,(_,q,p)=>'from '+JSON.stringify(new URL(p,url).href));
const {MinerGame}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
function state(){const s=createState(713);s.miner=createMiner(713);Object.assign(s.miner,{steps:20,crystalRush:8000});return s;}
function view(s,soft=false){const ctx=new Proxy({globalAlpha:1},{get:(o,k)=>k in o?o[k]:()=>{}}),v=Object.create(MinerGame.prototype);Object.assign(v,{s,ctx,soft:()=>soft,queue:[],particles:[],rings:[],beams:[],popups:[],cameraY:20*58,vfxPaint:0,vfx:new VfxSprites(),music:{sfx(){},loot(){}},crewClock:0});return v;}

test('Jazida resource art never promises a whole gem, at empty or full reserve; reading preserves state and true type',()=>{
 for(const charge of [0,89999,90000,270000]){const s=state();s.miner.oreCharge=charge;const before=JSON.stringify(s);let deposits=0;for(let row=20;row<=27;row++)for(let col=0;col<7;col++){const type=minerTile(s.miner,row,col),a=minerCellAppearance(s.miner,row,col);assert.equal(a.type,type);if(type==='crystal'){assert.equal(a.artType,'rock');assert.equal(a.drawType,'stone');assert.equal(a.variant,0);deposits++;}}assert.equal(deposits,53);assert.equal(JSON.stringify(s),before);}
});
test('actual view uses rocks and stone fallback during Jazida, including reduced motion before images load',()=>{
 for(const soft of [false,true])for(const fallback of [false,true]){const s=state(),v=view(s,soft),before=JSON.stringify(s),cubes=[];globalThis.__jazidaVisual={calls:[],fallback,gems:0};v.cube=(...args)=>cubes.push(args);try{v.draw(1000,{row:20,col:3,physicalTipRow:20,lift:0,tilt:0});const r=globalThis.__jazidaVisual;assert.ok(r.calls.length);assert.ok(r.calls.every(c=>c.type==='rock'));assert.equal(r.gems,0);if(fallback)for(const call of r.calls){const cube=cubes.find(c=>c[1]===call.x&&c[2]===call.y-20);assert.ok(cube);assert.notEqual(cube.at(-2),P.blue);}assert.equal(JSON.stringify(s),before);}finally{delete globalThis.__jazidaVisual;}}
});
test('queued Jazida break preserves its row and original mineral kind through expiry, depth and focus changes',()=>{
 const s=state(),pending={tile:'crystal',kind:3},a=minerCellAppearance(s.miner,69,3,pending);Object.assign(s.miner,{steps:70,focus:0,crystalRush:0});assert.deepEqual(minerCellAppearance(s.miner,69,3,pending),a);assert.equal(a.biome,0);assert.equal(a.artType,'rock');assert.equal(a.kind,3);
});
test('unpaid deposit break releases rock debris with original count, lifetime and row palette',()=>{
 for(const soft of [false,true]){const v=view(state(),soft);v.playEvent({type:'break',tile:'crystal',kind:3,row:69,col:3},1000);assert.equal(v.particles.length,soft?2:5);assert.ok(v.particles.every(p=>p.k===-1&&p.biome===0&&p.life===650));}
});
test('visual correction never freezes real specials or Jazida expiration',()=>{
 const s=state();assert.equal(minerCellAppearance(s.miner,20,3).type,'crystal');s.miner.crystalRush=0;const a=minerCellAppearance(s.miner,20,3);assert.equal(a.type,'overdrive');assert.equal(a.drawType,'overdrive');assert.equal(a.resource,false);
});
