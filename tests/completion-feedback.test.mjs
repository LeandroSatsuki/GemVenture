import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Exercise the actual native transfer-session implementation, not a duplicate validator.
const source=(await readFile(new URL('../dist/return-screen.js',import.meta.url),'utf8')).replace(/^import[^\n]*\n/gm,'').replace('export class ReturnScreen','class ReturnScreen');
const createSession=new Function('beginRefugeResourceTransfer',source+'\nreturn createRewardVisualSession;')(()=>({track:()=>true,finishCounter(){},release(){}}));
class Events{
 constructor(){this.listeners=new Map();}
 addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
 removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 fire(type,event={}){for(const fn of [...(this.listeners.get(type)||[])])fn(event);}
}
function fixture(){
 const doc=new Events(),win=new Events(),fonts=new Events();
 const box={left:80,top:50,width:60,height:24};
 const rect=()=>({...box,right:box.left+box.width,bottom:box.top+box.height});
 const node=id=>({id,ownerDocument:doc,isConnected:true,hidden:false,inert:false,parentElement:null,clientLeft:0,clientTop:0,clientWidth:800,clientHeight:600,scrollTop:0,scrollLeft:0,closest:()=>null,getBoundingClientRect:rect});
 doc.body=node('body');doc.body.classList={contains:key=>key==='immersive-base'};
 doc.documentElement=node('html');doc.body.parentElement=doc.documentElement;
 const target=node('bank');target.parentElement=doc.body;
 doc.hidden=false;doc.defaultView=win;doc.fonts=fonts;doc.getElementById=id=>id==='bank'?target:null;doc.querySelector=()=>null;doc.querySelectorAll=()=>[];
 win.innerWidth=800;win.innerHeight=600;win.visualViewport=null;
 win.getComputedStyle=()=>({display:'block',visibility:'visible',opacity:'1',overflowX:'visible',overflowY:'visible',transform:'none',clip:'auto',clipPath:'none',maskImage:'none',contain:'none'});
 win.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){}};
 win.MutationObserver=class{observe(){}disconnect(){}};
 let reject,cancellations=0;
 const animation={finished:new Promise((_,no)=>reject=no),cancel(){cancellations++;reject(new Error('cancelled'));}};
 const session=createSession(doc,[0,0,0,0]),destination=session.destination('bank');assert.ok(destination);session.track(animation,destination);
 return {doc,win,fonts,box,target,session,cancellations:()=>cancellations};
}
test('late font completion preserves a native flight with unchanged visible destination, but cancels a genuinely moved one',async()=>{
 const f=fixture();f.fonts.fire('loadingdone');assert.equal(f.cancellations(),0,'unrelated/unchanged font completion must not erase the reward');
 f.box.left+=12;f.fonts.fire('loadingdone');assert.equal(f.cancellations(),1,'font-caused geometry changes still invalidate the flight');
 f.session.finishCounter();await Promise.resolve();assert.equal(f.fonts.listeners.get('loadingdone').size,0,'font listener is released after counter and flight end');
});
test('late fonts do not allow a reward flight to a clipped or detached destination',async()=>{
 for(const change of [f=>f.box.left=810,f=>f.target.isConnected=false]){
  const f=fixture();change(f);f.fonts.fire('loadingdone');assert.equal(f.cancellations(),1);f.session.release();await Promise.resolve();assert.equal(f.cancellations(),1,'cancellation is idempotent');
 }
});
test('native resize and hidden-tab cancellation remain immediate even when target bounds are unchanged',async()=>{
 for(const event of ['resize','hidden']){
  const f=fixture();if(event==='resize')f.win.fire('resize');else{f.doc.hidden=true;f.doc.fire('visibilitychange');}
  assert.equal(f.cancellations(),1);f.session.release();await Promise.resolve();
 }
});
