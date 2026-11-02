import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationPath,navigationConnected,navigationPursuit,navigationCacheStatus} from '../dist/cave-navigation.js';
import {createSaveSnapshot} from '../dist/save-snapshot.js';
import {createState,startRun,generateRoom,enemyBeat,pathTo} from '../dist/core.js';
import {installCaveNoticeLayout} from '../dist/cave-notice-layout.js';

// Frozen reference BFS: the previous public pathTo semantics, including ties.
function originalPath(room,from,to,obstacles=[]){
 const {cols,rows}=room,blocked=new Set(obstacles.map(p=>p.y*cols+p.x)),end=to.y*cols+to.x,start=from.y*cols+from.x;
 const floor=(x,y)=>x>0&&y>0&&x<cols-1&&y<rows-1&&(!room.floorMask||room.floorMask[y*cols+x]===1);
 if(from.x===to.x&&from.y===to.y||!floor(to.x,to.y)||blocked.has(end))return [];
 const queue=[start],parents=new Int32Array(cols*rows).fill(-1);parents[start]=start;
 for(let i=0;i<queue.length;i++){const at=queue[i],x=at%cols,y=Math.floor(at/cols);if(at===end){const out=[];for(let p=end;p!==start;p=parents[p])out.push({x:p%cols,y:Math.floor(p/cols)});return out.reverse();}
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,id=ny*cols+nx;if(floor(nx,ny)&&parents[id]===-1&&!blocked.has(id)){parents[id]=at;queue.push(id);}}
 }return [];
}
function room(){return {cols:13,rows:11,floorMask:Array(143).fill(1),rocks:[],enemies:[]};}

test('cached paths preserve the old exact BFS ties and directional connectivity with blocked starts',()=>{
 for(let seed=0;seed<12;seed++){
  const r=room(),obstacles=[];for(let i=14;i<130;i++)if((i*37+seed*19)%17<3)r.floorMask[i]=0;for(let i=0;i<5;i++)obstacles.push({x:2+(i*3+seed)%9,y:2+(i+seed)%7});
  for(let i=0;i<20;i++){const a={x:1+(i*3)%11,y:1+(i*5)%9},b={x:1+(i*7+seed)%11,y:1+(i*2+seed)%9},expected=originalPath(r,a,b,obstacles);
   assert.deepEqual(navigationPath(r,a,b,obstacles),expected);
   for(const preferFrom of [true,false])assert.equal(navigationConnected(r,a,b,obstacles,preferFrom),expected.length>0);
  }
 }
});
test('navigation invalidates in-place walls, moving/removed obstacles and rebased masks; caches stay bounded',()=>{
 const r=room(),a={x:2,y:2},b={x:9,y:7},obstacles=[{x:5,y:5}];
 navigationPursuit(r,a,obstacles)({x:9,y:7});for(let i=0;i<100;i++)navigationPursuit(r,a,obstacles)({x:9,y:7});assert.equal(navigationCacheStatus(r).builds,1);
 for(const change of [()=>r.floorMask[3*r.cols+2]=0,()=>obstacles[0].x++,()=>obstacles.pop(),()=>r.floorMask=r.floorMask.map((v,i)=>i===30?0:v)]){change();navigationPursuit(r,a,obstacles)({x:9,y:7});assert.deepEqual(navigationPath(r,a,b,obstacles),originalPath(r,a,b,obstacles));}
 for(let x=1;x<=10;x++)navigationPath(r,{x,y:1},b,obstacles);const stats=navigationCacheStatus(r);assert.ok(stats.revisions>=4);assert.ok(stats.fields<=stats.limit);
});
test('a nearby target expands only the necessary BFS frontier, which resumes for later targets',()=>{
 const r={cols:192,rows:144,floorMask:Array(192*144).fill(1)},a={x:5,y:5};
 assert.deepEqual(navigationPath(r,a,{x:6,y:5}),[{x:6,y:5}]);assert.equal(navigationCacheStatus(r).builds,0);
 const b={x:20,y:20};assert.deepEqual(navigationPath(r,a,b),originalPath(r,a,b));assert.equal(navigationCacheStatus(r).builds,1);assert.ok(navigationCacheStatus(r).expanded<2000);
});
test('empty enemy beats never build pursuit data, and cached native paths survive rock destruction',()=>{
 const r=room(),s={run:{room:r,player:{x:2,y:2},enemyBeat:-1,beat:0}};
 enemyBeat(s,4);enemyBeat(s,5);assert.equal(navigationCacheStatus(r).builds,0);
 r.rocks=[{x:3,y:2,hp:2}];const a={x:2,y:2},b={x:5,y:2};assert.deepEqual(pathTo(r,a,b),originalPath(r,a,b,r.rocks));r.rocks[0].hp=0;assert.deepEqual(pathTo(r,a,b),originalPath(r,a,b));
});
test('save serialization is byte-identical, immediate and observes edits, rebasing and quoted user strings',()=>{
 const write=createSaveSnapshot(),s=createState(41001);s.seals=6;startRun(s);s.run.floor=6;generateRoom(s);s.playerName='room \\" run \\" [0,1] 🌟';
 const compare=()=>assert.equal(write.serialize(s),JSON.stringify(s));compare();compare();assert.ok(write.status().hits>=4);
 s.run.room.explored[25]=1;s.run.room.visible[26]=1;s.run.room.floorMask[27]^=1;s.run.room.terrain[28]=4;s.run.health--;s.bank++;compare();
 s.run.room.floorMask=s.run.room.floorMask.slice();s.run.room.floorMask[29]^=1;compare();
 const restored=JSON.parse(write.serialize(s));assert.equal(restored.bank,s.bank);assert.equal(restored.run.health,s.run.health);assert.equal(restored.run.room.terrain[28],4);
 assert.equal(createSaveSnapshot({cacheGrids:false}).serialize(s),JSON.stringify(s));
 for(const extra of [undefined,null,Infinity,{toJSON(key){return key;}},['x',undefined]]){s.extra=extra;compare();}
});
test('notice layout avoids repeated style/geometry work, while resize, text and HUD translation invalidate it',()=>{
 let geometry=0,computed=0,onResize,onMutation;const nodes=new Map();
 function node(id,height=40){const attrs=new Map(),style=new Map(),n={id,isConnected:true,hidden:false,inert:false,parentElement:null,className:'',textContent:'',classList:{contains:k=>id==='body'?k==='immersive-run':k==='show'},closest:()=>null,getAttribute:k=>k==='style'?[...style].join(';'):attrs.get(k)??null,hasAttribute:k=>attrs.has(k),setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),style:{getPropertyValue:k=>style.get(k)||'',setProperty:(k,v)=>style.set(k,v),removeProperty:k=>style.delete(k)},getBoundingClientRect(){geometry++;return{left:0,right:200,top:200,bottom:200+height,width:200,height};}};nodes.set(id,n);return n;}
 const body=node('body'),toast=node('toast'),message=node('message'),control=node('controlDeck');toast.className='show';toast.textContent='Aviso';
 const win={innerWidth:1000,innerHeight:700,getComputedStyle(){computed++;return{display:'block',visibility:'visible'};},ResizeObserver:class{constructor(fn){onResize=fn;}observe(){}disconnect(){}},MutationObserver:class{constructor(fn){onMutation=fn;}observe(){}disconnect(){}}},doc={body,defaultView:win,getElementById:id=>nodes.get(id)||null};
 const view=installCaveNoticeLayout(doc),first=view.getState(),reads=geometry,styles=computed;
 for(let i=0;i<1000;i++)view.sync();assert.equal(geometry,reads);assert.equal(computed,styles);assert.deepEqual(view.getState(),first);
 toast.textContent='Aviso com conteúdo atualizado';view.sync();assert.ok(geometry>reads);const next=geometry;
 control.style.setProperty('translate','50px 30px');view.sync();assert.ok(geometry>next);
 const last=geometry;onResize();view.sync();assert.ok(geometry>last);onMutation([]);view.dispose();
});
