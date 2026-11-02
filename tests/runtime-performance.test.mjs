import test from 'node:test';import assert from 'node:assert/strict';
import {Music} from '../dist/audio.js';
import {createHudLayoutPresenter} from '../dist/hud-layout-presenter.js';
import {createHudLayoutPreferences} from '../dist/hud-layout.js';
import {drawLobbyPlayer,playerAppearanceCacheStatus} from '../dist/player-appearance.js';
import {installCaveNoticeLayout} from '../dist/cave-notice-layout.js';

test('unchanged default HUD never forces synchronous geometry reads across 1000 frames',()=>{
 let reads=0;const root={hidden:false,getBoundingClientRect(){reads++;throw Error('Default CSS HUD does not need measurement');}},view=createHudLayoutPresenter({preferences:createHudLayoutPreferences()});
 for(let i=0;i<1000;i++)view.frame(root);assert.equal(reads,0);view.dispose();
});
test('empty cave notices avoid computed-style reads while real notices still occupy their lane',()=>{
 let reads=0,shown=false;const rect=h=>({left:0,top:20,right:220,bottom:20+h,width:220,height:h}),node=(h)=>{const values=new Map(),attrs=new Map();return{isConnected:true,textContent:'',closest:()=>null,classList:{contains:()=>shown},style:{getPropertyValue:k=>values.get(k)||'',setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},getAttribute:k=>attrs.get(k)??null,hasAttribute:k=>attrs.has(k),setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),getBoundingClientRect:()=>rect(h)};},toast=node(40),message=node(30),doc={body:{classList:{contains:()=>true}},defaultView:{innerWidth:1440,innerHeight:900,addEventListener(){},removeEventListener(){},getComputedStyle(){reads++;return{display:'block',visibility:'visible'};}},getElementById:id=>({toast,message}[id]||null)},view=installCaveNoticeLayout(doc);
 for(let i=0;i<1000;i++)view.sync();assert.equal(reads,0);
 shown=true;let plan=view.sync();assert.equal(plan.totalHeight,40);assert.equal(reads,1);
 shown=false;message.textContent='Aviso';plan=view.sync();assert.equal(plan.totalHeight,30);assert.equal(reads,2);view.dispose();
});
test('custom HUD measures on resize, preferences and element changes, then releases observers',()=>{
 let reads=0,resize,mutation,disconnected=0;const values=new Map(),win={ResizeObserver:class{constructor(fn){resize=fn;}observe(){}unobserve(){}disconnect(){disconnected++;}},MutationObserver:class{constructor(fn){mutation=fn;}observe(){}disconnect(){disconnected++;}},getComputedStyle:()=>({translate:'none'})};
 const node={dataset:{},ownerDocument:{defaultView:win},style:{getPropertyValue:k=>values.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},getBoundingClientRect(){reads++;return{left:50,top:30,width:100,height:40};}};
 const root={hidden:false,ownerDocument:{defaultView:win},clientWidth:1000,clientHeight:600,getBoundingClientRect(){reads++;return{left:0,top:0,width:1000};},querySelectorAll:s=>s==='.vital'?[node]:[]},preferences=createHudLayoutPreferences();preferences.apply({life:{scale:1.1}});const view=createHudLayoutPresenter({preferences});
 view.frame(root);const initial=reads;for(let i=0;i<1000;i++)view.frame(root);assert.equal(reads,initial);
 resize();view.frame(root);assert.equal(reads,initial+2);
 mutation([{addedNodes:[{nodeType:3}],removedNodes:[]}]);view.frame(root);assert.equal(reads,initial+2);
 mutation([{addedNodes:[{nodeType:1}],removedNodes:[]}]);view.frame(root);assert.equal(reads,initial+4);
 preferences.apply({});view.frame(root);assert.equal(values.size,0);view.dispose();assert.equal(disconnected,2);
});
function schedule(times){const m=new Music(),notes=[];m.enabled=true;m.ctx={state:'running',currentTime:10};m.master={gain:{setTargetAtTime(){}}};
 m.tone=(...a)=>notes.push(['tone',a[0],a[4]]);m.noise=(...a)=>notes.push(['noise',a[1],a[2]]);m.vocal=(...a)=>notes.push(['vocal',a[0],a[2]]);
 for(const t of times){m.ctx.currentTime=10+t;m.update(t,0);}
 return notes.filter(n=>n[2]<11.5).map(n=>[n[0],n[1],+n[2].toFixed(6)]);
}
test('native music scheduling preserves every note through a synthetic 180ms callback gap',()=>{
 const fine=Array.from({length:81},(_,i)=>i*.025),jitter=fine.filter(t=>t<=.1||t>=.28);assert.deepEqual(schedule(jitter),schedule(fine));
});
test('repeated music scheduler calls at the same time do not duplicate notes',()=>{assert.deepEqual(schedule([0,0,0,.1,.1,.2,.2,.4,.4,1.5]),schedule([0,.1,.2,.4,1.5]));});
test('authored lobby animations keep a bounded image cache through long idles and outfit changes',()=>{
 const original=globalThis.Image,heights={idle:6720,jamal:7680,sit:7680,wave:4480,step:5760,sway:5760,look:4800,wardrobe:320};let draws=0;
 globalThis.Image=class{set src(url){this.url=url;const clip=url.split('/').at(-1).replace('.png','');this.naturalWidth=clip==='wardrobe'||clip==='front'?320:2560;this.naturalHeight=heights[clip]||320;this.complete=true;}};
 const c={save(){},restore(){},drawImage(){draws++;}};
 try{for(const hat of ['hardhat','duck'])for(const shirt of ['blue','pink'])for(let t=0;t<900;t+=.5){assert.ok(drawLobbyPlayer(c,{seed:712,homeCollection:{outfit:{hat,shirt}}},100,200,246,t));const stats=playerAppearanceCacheStatus();assert.ok(stats.images<=stats.maxImages);assert.ok(stats.decodedBytes<=stats.maxDecodedBytes);}
 assert.ok(draws>6000);
 }finally{globalThis.Image=original;}
});
