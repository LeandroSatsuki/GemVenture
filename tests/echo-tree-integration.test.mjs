import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';
import {REFUGE_ASSETS,REFUGE_COMPOSITIONS as groups} from '../dist/refuge-art-manifest.js';
import {sampleEchoCrown} from '../dist/echo-tree-rig.js';
import {multiplyAffine} from '../dist/refuge-picking.js';
const manifest=JSON.parse(await fs.readFile(new URL('./fixtures/echo-tree-v3-reference.json',import.meta.url),'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
test('five approved sources and original pure rig are byte exact; other groups unchanged',async()=>{
 assert.equal(hash(await fs.readFile(new URL('../dist/echo-tree-rig.js',import.meta.url))),manifest.rigSha256);
 for(const l of manifest.layers){const spec=REFUGE_ASSETS.find(a=>a.file==='gv009-'+l.file);assert(spec);assert.equal(hash(await fs.readFile(new URL('../dist/assets/refuge-v1/'+spec.file,import.meta.url))),l.sha256);}
 for(const [type,expectedHash]of Object.entries(manifest.otherGroups))if(!['well','shrine','miningMachine'].includes(type))assert.equal(hash(JSON.stringify(groups[type])),expectedHash);
 assert.equal(groups.tree.layers.length,5);
});
test('cached draw transforms reproduce approved assembly/sampler; trunk and reduced pose stay fixed',async()=>{
 const before={Image:globalThis.Image,document:globalThis.document};
 globalThis.Image=class{set src(url){const s=REFUGE_ASSETS.find(a=>url.endsWith(a.file));this.naturalWidth=s.size[0];this.naturalHeight=s.size[1];queueMicrotask(()=>this.onload());}};
 globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>({drawImage(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255)})})})};
 try{
  const art=await import('../dist/refuge-art.js?rig-transforms');await art.loadRefugeArt();const b=art.refugeArtBounds('tree');assert(Math.abs(b.width-manifest.nominalWidth)<1e-8);
  const render=(time,reduced)=>{const draws=[],stack=[];let m=[1,0,0,1,0,0];const c={save(){stack.push([...m]);},restore(){m=stack.pop();},translate(x,y){m=multiplyAffine(m,[1,0,0,1,x,y]);},rotate(a){m=multiplyAffine(m,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);},scale(x,y){m=multiplyAffine(m,[x,0,0,y,0,0]);},transform(...n){m=multiplyAffine(m,n);},drawImage(im,x,y,w,h){draws.push({x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5],w:m[0]*w,h:m[3]*h});}};art.drawRefugeArt(c,'tree',500,191,130,time,reduced);return draws;};
  const k=130/manifest.nominalWidth;let motion=false;
  for(const time of [0,.25,1,3,7,11,19,60,120])for(const reduced of [false,true]){
   const drawn=render(time,reduced);assert.equal(drawn.length,5);
   manifest.layers.forEach((l,i)=>{const p=sampleEchoCrown(l,time,reduced),[left,top,right,bottom]=l.bounds,expected={x:500+(l.left-manifest.groundAnchor[0]+p.dx)*k,y:191+(l.top-manifest.groundAnchor[1]+p.dy)*k,w:(right-left)*l.scale*k,h:(bottom-top)*l.scale*k};for(const key of ['x','y','w','h'])assert(Math.abs(drawn[i][key]-expected[key])<1e-8,`${l.id}/${key}`);});
   assert.deepEqual(drawn[0],render(0,false)[0]);if(reduced)assert.deepEqual(drawn,render(0,true));else if(JSON.stringify(drawn)!==JSON.stringify(render(0,false)))motion=true;
  }
  assert(motion);assert.deepEqual(render(3,false),render(3,false),'paused external time repeats the same pose');
 }finally{for(const [key,value]of Object.entries(before))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});
