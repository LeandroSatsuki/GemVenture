import test from 'node:test';import assert from 'node:assert/strict';
import {mountHudHitRegions} from '../dist/hud-hit-regions.js';
function fixture(){
 const queued=new Map();let next=0,resize,structure;const observers=[];
 const win={requestAnimationFrame:f=>{queued.set(++next,f);return next;},cancelAnimationFrame:id=>queued.delete(id),ResizeObserver:class{constructor(f){resize=f;observers.push(this);}observe(){}unobserve(){}disconnect(){this.disconnected=true;}},MutationObserver:class{constructor(f){structure=f;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}};
 const region={dataset:{},children:[],clientHeight:200,scrollHeight:80,contains:n=>region.children.includes(n)},root={ownerDocument:{defaultView:win},querySelectorAll:()=>[region]};
 return {root,region,queued,observers,resize:()=>resize(),structure:()=>structure(),flush(){const jobs=[...queued.values()];queued.clear();for(const f of jobs)f();}};
}
test('empty space does not own input, while overflowing content keeps its native scrollbar through resize and content changes',()=>{
 const f=fixture(),h=mountHudHitRegions(f.root);assert.equal(f.region.dataset.hudScrollable,'false');
 f.region.scrollHeight=400;f.structure();f.structure();f.resize();assert.equal(f.queued.size,1);f.flush();assert.equal(f.region.dataset.hudScrollable,'true');assert.equal(f.queued.size,0,'no continuous frame polling');
 f.region.clientHeight=500;f.resize();f.flush();assert.equal(f.region.dataset.hudScrollable,'false');
 f.region.clientHeight=0;f.resize();f.flush();assert.equal(f.region.dataset.hudScrollable,'false');h.dispose();
});
test('disposing the HUD cancels measurements and releases observers without changing input handlers',()=>{
 const f=fixture(),onclick=()=>{};f.region.onclick=onclick;const h=mountHudHitRegions(f.root);f.structure();h.dispose();assert.equal(f.queued.size,0);assert.ok(f.observers.every(o=>o.disconnected));assert.equal(f.region.onclick,onclick);assert.equal(f.region.dataset.hudScrollable,undefined);f.resize();assert.equal(f.queued.size,0);
});
