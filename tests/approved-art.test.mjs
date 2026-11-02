import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {APPROVED_ART} from '../dist/approved-art-manifest.js';
import {approvedArtSource,approvedArtSpec,approvedArtRect,drawApprovedArt,approvedArtSvg,APPROVED_ART_LIMITS} from '../dist/approved-art.js';

test('all seven biomes have their approved resources, creatures and bosses with verified original bytes',async()=>{
 assert.equal(APPROVED_ART.length,78);assert.equal(new Set(APPROVED_ART.map(a=>a.id)).size,78);
 for(let biome=0;biome<7;biome++){
  for(let variant=0;variant<4;variant++)assert.ok(approvedArtSpec('crystal',{biome,variant}));
  for(let variant=0;variant<3;variant++)assert.ok(approvedArtSpec('rock',{biome,variant}));
  for(const type of ['slime','bat','golem'])assert.ok(approvedArtSpec(type,{biome}));
  assert.equal(approvedArtSpec('boss',{variant:biome}).biome,biome);
 }
 assert.ok(approvedArtSpec('rabbit',{biome:6}));assert.equal(approvedArtSpec('hedgehog'),null);
 const audit=JSON.parse(await readFile(new URL('../docs/art/approved-alpha-audit.json',import.meta.url),'utf8'));
 for(const spec of APPROVED_ART){const file=await readFile(new URL('../dist/assets/approved-art/'+spec.file,import.meta.url));assert.equal(createHash('sha256').update(file).digest('hex'),spec.sha256,spec.id);assert.equal(file.readUInt32BE(16),spec.width);assert.equal(file.readUInt32BE(20),spec.height);assert.ok(audit.entries.some(e=>e.id===spec.id&&e.sha256===spec.sha256&&e.zeroAlpha>0));}
});
test('alpha bounds retain aspect and anatomical anchors at gameplay and preview sizes',()=>{
 for(const spec of APPROVED_ART)for(const width of [30,39,75,92,400]){
  const r=approvedArtRect(spec,300,250,width);assert.ok(r.width<=width+.001);assert.ok(r.height<=width*.96+.001);
  assert.ok(Math.abs(r.width/r.height-spec.bounds.width/spec.bounds.height)<1e-8);
  assert.ok(Math.abs(r.x+(spec.anchor.x-spec.bounds.x)*r.scale-300)<1e-8);
  assert.ok(Math.abs(r.y+(spec.anchor.y-spec.bounds.y)*r.scale-250)<1e-8);
 }
 assert.equal(drawApprovedArt({},'rock',0,0,30),false,'unloaded assets retain a procedural fallback');
 assert.equal(drawApprovedArt({},'golem',0,0,30,{layer:'eyes'}),false,'full bodies are never repeated for a procedural animation part');
 assert.match(approvedArtSvg('crystal',{variant:1,biome:3}),/ruby-b4\.png/);
});
test('loading is sequential, bounded and immutable while drawing; broken replacements fall back safely',async()=>{
 const old={Image:globalThis.Image,document:globalThis.document};let inFlight=0,peak=0,allocated=0,draws=0;
 globalThis.document={createElement(){allocated++;const canvas={width:0,height:0};canvas.getContext=()=>({drawImage(){}});return canvas;}};
 globalThis.Image=class{set src(url){inFlight++;peak=Math.max(peak,inFlight);const spec=APPROVED_ART.map(s=>approvedArtSpec(s.type,s)).find(s=>url===approvedArtSource(s));queueMicrotask(()=>{inFlight--;if(spec.id==='boss-b6'){this.onerror();return;}this.naturalWidth=spec.width;this.naturalHeight=spec.height;this.onload();});}};
 try{const api=await import('../dist/approved-art.js?loader-test');const promise=api.loadApprovedArt();assert.equal(api.loadApprovedArt(),promise);const status=await promise;assert.equal(status.ready,77);assert.deepEqual(status.failed,['boss-b6']);assert.equal(peak,1);assert.ok(allocated<=APPROVED_ART_LIMITS.assets);assert.ok(status.cachePixels<78*384*384);
  const before=allocated,c={drawImage(){draws++;}};for(let i=0;i<10000;i++)assert.equal(api.drawApprovedArt(c,'slime',0,0,32),true);assert.equal(allocated,before);assert.equal(draws,10000);assert.equal(api.drawApprovedArt(c,'boss',0,0,75,{variant:5}),false);
 }finally{Object.assign(globalThis,old);}
});
