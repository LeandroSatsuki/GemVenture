import test from 'node:test';
import assert from 'node:assert/strict';
import {REFUGE_ASSETS} from '../dist/refuge-art-manifest.js';

test('native refuge layer decoding is bounded, cached and isolates broken images without recoloring',async()=>{
 const before={Image:globalThis.Image,document:globalThis.document};let active=0,peak=0,requests=0;
 const byFile=new Map(REFUGE_ASSETS.map(s=>[s.file,s]));
 globalThis.Image=class {set src(url){requests++;active++;peak=Math.max(peak,active);const spec=[...byFile].find(([file])=>url.endsWith(file))?.[1];setTimeout(()=>{active--;if(spec===REFUGE_ASSETS[0])return this.onerror?.();this.naturalWidth=spec.size[0];this.naturalHeight=spec.size[1];this.onload?.();},1);}};
 globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>({drawImage(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255)})})})};
 try{
  const art=await import('../dist/refuge-art.js?bounded-loading');
  const loading=art.loadRefugeArt();assert.equal(art.loadRefugeArt(),loading);await loading;
  const status=art.refugeArtStatus();assert.equal(status.ready,REFUGE_ASSETS.length-1);assert.deepEqual(status.failed,[REFUGE_ASSETS[0].id]);assert.ok(peak<=art.REFUGE_ART_LIMITS.concurrentDecodes);
  assert.equal(requests,REFUGE_ASSETS.length);await art.loadRefugeArt();assert.equal(requests,REFUGE_ASSETS.length,'redrawing does not decode assets again');
  assert.ok(status.cachePixels<REFUGE_ASSETS.length*art.REFUGE_ART_LIMITS.cacheSide**2);
 }finally{for(const [key,value]of Object.entries(before))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});

test('reduced motion freezes every native crystal canopy transform across visual time',async()=>{
 const before={Image:globalThis.Image,document:globalThis.document};
 globalThis.Image=class {set src(url){const spec=REFUGE_ASSETS.find(s=>url.endsWith(s.file));this.naturalWidth=spec.size[0];this.naturalHeight=spec.size[1];queueMicrotask(()=>this.onload?.());}};
 globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>({drawImage(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255)})})})};
 try{
  const art=await import('../dist/refuge-art.js?reduced-canopy');await art.loadRefugeArt();
  const render=time=>{const log=[],c={};for(const method of ['save','restore','translate','transform','rotate','scale','drawImage'])c[method]=(...args)=>log.push([method,...args.map(a=>typeof a==='object'?{width:a.width,height:a.height}:a)]);assert.equal(art.drawRefugeArt(c,'tree',200,220,130,time,true),true);return log;};
  assert.deepEqual(render(0),render(100));
 }finally{for(const [key,value]of Object.entries(before))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});
