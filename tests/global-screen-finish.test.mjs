import test from 'node:test';import assert from 'node:assert/strict';
import {installGlobalFinish,globalFinishStatus,approvedMask} from '../dist/global-screen-finish.js';
import {createWorldFinish} from '../dist/world-finish.js';
function fixture(supported=true){
 const nodes=[],observers=[];const events=target=>Object.assign(target,{listeners:new Map(),addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);},removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);},emit(type,event={}){for(const fn of this.listeners.get(type)||[])fn({type,target:this,...event});}});
 const doc=events({fullscreenElement:null});
 const element=tag=>{const node=events({tag,nodeType:1,style:{},children:[],attrs:{},width:1,height:1,isConnected:false,opened:false,append(child){child.remove();this.children.push(child);child.parentElement=this;child.isConnected=this.isConnected;},remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);this.parentElement=null;this.isConnected=false;},setAttribute(k,v){this.attrs[k]=v;},matches(q){return q===':popover-open'?this.opened:false;},querySelector(){return null;},showPopover(){this.opened=true;this.showCount=(this.showCount||0)+1;},hidePopover(){this.opened=false;},getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};},toDataURL(){return 'data:image/png;base64,fixture';}});nodes.push(node);return node;};
 doc.body=element('body');doc.head=element('head');doc.documentElement=element('html');for(const e of [doc.body,doc.head,doc.documentElement])e.isConnected=true;doc.createElement=element;doc.createElementNS=(ns,tag)=>element(tag);
 const win=events({innerWidth:64,innerHeight:48,devicePixelRatio:1,CSS:{supports:()=>supported},MutationObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}});win.visualViewport=events({});
 return {doc,win,nodes,observers,element,overlay:()=>nodes.find(n=>n.id==='gv-global-crt'),mask:()=>nodes.find(n=>n.id==='gv-global-crt').children[0]};
}
test('one inert final layer follows dialog/fullscreen without rebuilding masks or owning input',async()=>{
 const f=fixture(),api=installGlobalFinish(f);try{
  assert.equal(installGlobalFinish(f),api);assert.equal(f.nodes.filter(n=>n.id==='gv-global-crt').length,1);assert.equal(api.status().strength,.45);assert.equal(api.status().active,true);
  const overlay=f.overlay();assert.equal(overlay.inert,true);assert.equal(overlay.attrs['aria-hidden'],'true');assert.match(overlay.style.cssText,/pointer-events:none/);assert.equal(overlay.onclick,undefined);assert.equal(overlay.onkeydown,undefined);
  const builds=api.status().maskBuilds,promotions=api.status().promotions;f.doc.emit('beforetoggle',{target:f.element('dialog'),newState:'open'});await Promise.resolve();assert(api.status().promotions>promotions);assert.equal(api.status().maskBuilds,builds);
  const fullscreen=f.element('section');f.doc.body.append(fullscreen);f.doc.fullscreenElement=fullscreen;f.doc.emit('fullscreenchange');await Promise.resolve();assert.equal(overlay.parentElement,fullscreen);
  f.doc.fullscreenElement=null;f.doc.emit('fullscreenchange');await Promise.resolve();assert.equal(overlay.parentElement,f.doc.body);
 }finally{api.dispose();}assert.equal(globalFinishStatus().active,false);
});
test('global installation skips the old CRT pass even during clean fallback; graphics loss recovers',async()=>{
 for(const support of [false,true]){
  const f=fixture(support),api=installGlobalFinish(f);let allocations=0;const legacy=createWorldFinish({makeCanvas(){allocations++;throw Error('must not allocate legacy GPU layer');}});
  try{assert.equal(legacy.apply({canvas:{isConnected:true}}),false);assert.equal(allocations,0);
   if(support){const builds=api.status().maskBuilds;f.mask().emit('contextlost');assert.equal(api.status().active,false);assert.equal(api.status().presentation,'clear-fallback');f.mask().emit('contextrestored');await Promise.resolve();assert.equal(api.status().active,true);assert.equal(api.status().maskBuilds,builds+1);}
   else assert.equal(api.status().presentation,'clear-fallback');
   api.setEnabled(false);assert.equal(api.status().active,false);assert.equal(legacy.apply({canvas:{isConnected:true}}),false);assert.equal(allocations,0);
  }finally{legacy.dispose();api.dispose();}
 }
});
test('mask preserves static three-CSS-pixel period at 1x/2x with no color tint',()=>{
 for(const dpr of [1,2]){const w=128*dpr,m=approvedMask(w,w,dpr),alpha=(x,y)=>m[(y*w+x)*4+3];for(let y=55*dpr;y<65*dpr;y++)assert.equal(alpha(64*dpr,y),alpha(64*dpr,y+3*dpr));for(let i=0;i<m.length;i+=4){assert.equal(m[i]+m[i+1]+m[i+2],0);assert(m[i+3]<=38);}assert.deepEqual(m,approvedMask(w,w,dpr));}
});
