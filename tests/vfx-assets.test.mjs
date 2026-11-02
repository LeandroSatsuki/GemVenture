import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {P,PALETTE} from '../dist/palette.js';
import {VFX_SHEETS,VFX_LIMITS,vfxFrame} from '../dist/vfx-manifest.js';
import {VfxSprites,mapVfxPixels,drawVfxAsset} from '../dist/vfx-assets.js';
import {Effects} from '../dist/effects.js';

test('archived sheets retain their declared frame grid and transparent source format',async()=>{
 for(const spec of Object.values(VFX_SHEETS)){
  const png=await readFile(new URL('../dist/assets/vfx/'+spec.file,import.meta.url));
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),spec.width*spec.columns);
  assert.equal(png.readUInt32BE(20),spec.height*Math.ceil(spec.frames/spec.columns));
  let transparency=false;for(let at=8;at<png.length;){const n=png.readUInt32BE(at),type=png.subarray(at+4,at+8).toString();if(type==='tRNS')transparency=true;at+=n+12;}
  assert.ok([4,6].includes(png[25])||transparency,'source must contain alpha');
 }
});
test('frame playback respects exact duration, pause and expiration',()=>{
 const spec=VFX_SHEETS.explosion;
 assert.equal(vfxFrame(spec,0),0);assert.equal(vfxFrame(spec,spec.duration/2),15);
 assert.equal(vfxFrame(spec,spec.duration-.0001),29);
 for(const age of [-1,spec.duration,Infinity,NaN])assert.equal(vfxFrame(spec,age),-1);
 const sprites=new VfxSprites();sprites.play('explosion',20,30);sprites.update(.2);
 sprites.update(0);assert.equal(sprites.items[0].age,.2);sprites.update(1);assert.equal(sprites.items.length,0);
 assert.equal(sprites.play('unknown',0,0),false);assert.equal(sprites.play('impact',NaN,0),false);
 assert.equal(sprites.play('impact',0,0,{duration:0}),false);
});
test('dense effects and endless scrolling retain fixed budgets and coordinates',()=>{
 const sprites=new VfxSprites();for(let i=0;i<500;i++)sprites.play('impact',10,20);
 assert.equal(sprites.items.length,VFX_LIMITS.active);sprites.scroll(2,16);
 assert.equal(sprites.items[0].x,8);assert.equal(sprites.items[0].y,4);
 sprites.setSoft(true);assert.equal(sprites.items.length,0);
 assert.equal(sprites.play('aura',10,20),true,'soft confirmation is one stationary facet');
 for(let i=0;i<50;i++)sprites.play('explosion',10,20);assert.equal(sprites.items.length,VFX_LIMITS.softActive);
 sprites.update(5);assert.equal(sprites.items.length,0);
 const fx=new Effects();fx.consume([{type:'bomb',x:5,y:6}],(x,y)=>({x:x*10,y:y*10}),{x:0,y:0});
 assert.equal(fx.sprites.items[0].color,P.red);assert.equal(fx.sprites.items[0].bombRed,true);assert.equal(fx.sprites.items[0].opacity,1);assert.equal(fx.sprites.items[0].x,25);
 fx.consume([{type:'scroll'}],()=>null,{x:0,y:0});assert.equal(fx.sprites.items[0].x,23);assert.equal(fx.sprites.items[0].y,6);
 fx.clear();assert.equal(fx.sprites.items.length,0);
});
test('palette conversion uses only HEPT32 and preserves transparency',()=>{
 for(const color of [P.cyan,P.pink,P.yellow,P.lime,P.orange,P.steel]){
  const data=new Uint8ClampedArray([40,30,20,255,180,150,130,180,255,255,255,90,17,18,19,0]);
  mapVfxPixels(data,color);assert.deepEqual([...data].filter((_,i)=>i%4===3),[255,180,90,0]);
  for(let i=0;i<12;i+=4){const hex='#'+[...data.slice(i,i+3)].map(n=>n.toString(16).padStart(2,'0')).join('');assert.ok(PALETTE.includes(hex),hex);}
 }
 assert.equal(drawVfxAsset({},'unknown',0,0,.1),false,'unknown clip remains inert');
});
test('built-in crisp clips never decode the retired sheets or rebuild an atlas',async()=>{
 const saved={Image:globalThis.Image,ImageData:globalThis.ImageData,document:globalThis.document};
 let requests=0,allocations=0,reads=0,blits=0;
 globalThis.ImageData=class{constructor(data,width,height){Object.assign(this,{data,width,height});}};
 globalThis.document={createElement(){allocations++;const canvas={width:0,height:0};canvas.getContext=()=>({createRadialGradient(){return{addColorStop(){}};},fillRect(){},drawImage(){},getImageData(){reads++;return {data:new Uint8ClampedArray(canvas.width*canvas.height*4)};},putImageData(){}});return canvas;}};
 globalThis.Image=class{set src(url){requests++;const spec=Object.values(VFX_SHEETS).find(s=>url.endsWith(s.file));queueMicrotask(()=>{if(spec.file==='aura.png'){this.onerror();return;}this.naturalWidth=spec.width*spec.columns;this.naturalHeight=spec.height*Math.ceil(spec.frames/spec.columns);if(spec.file==='reward.png')this.naturalWidth--;this.onload();});}};
 try{
  const assets=await import('../dist/vfx-assets.js?loader-test');
  const first=assets.loadVfxAssets();assert.equal(assets.loadVfxAssets(),first);await first;
  const status=assets.vfxStatus();assert.equal(requests,0);assert.equal(reads,0);
  assert.deepEqual(status.failed,[]);assert.equal(status.variants,0);assert.equal(status.renderer,'crisp-family');
  assert.ok(status.variants<=VFX_LIMITS.variants);
  const before=allocations,c=new Proxy({globalAlpha:1,save(){},restore(){},drawImage(image){if(image.width>48)blits++;}},{get:(o,k)=>o[k]??(()=>{})});
  for(let i=0;i<100;i++)assert.equal(assets.drawVfxAsset(c,'explosion',0,0,.2,{color:P.cyan}),true);
  assert.equal(reads,0);assert.equal(blits,0);assert.ok(allocations-before<=12,'only bounded optional light textures');
  assert.equal(assets.drawVfxAsset(c,'aura',0,0,.2),true,'retired/failed image cannot bring back the old flame');
 }finally{Object.assign(globalThis,saved);}
});
