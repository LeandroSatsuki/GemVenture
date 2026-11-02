import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createState,restoreState} from '../dist/core.js';
import {wardrobeMarkup,REFUGE_MAIN_ACTIONS} from '../dist/refuge-lobby.js';
import {PLAYER_APPEARANCE_SOURCE,resolvePlayerAppearance,registerPlayerAppearance,sampleLobbyIdle,drawLobbyPlayer} from '../dist/player-appearance.js';
import {bindLiftNavigation} from '../dist/rebrand-lift.js';
import {liftHostPresentationModel} from '../dist/lift-v2ab-model.js';
import {resourceWalletMarkup} from '../dist/refuge-hud.js';
import {worldCrystalShapes} from '../dist/world-crystals.js';
import {GEM_CUTS,collectedGemSvg} from '../dist/collected-gems.js';
import {REFUGE_NIGHT_FILES} from '../dist/refuge-art-ready.js';
const file=p=>readFileSync(new URL('../dist/'+p,import.meta.url));

test('approved v3 source is byte-identical and all lobby atlases have complete frame rows',()=>{
 assert.equal(createHash('sha256').update(file('assets/miner-procedural-v3/front.png')).digest('hex'),PLAYER_APPEARANCE_SOURCE.frontSha256);
 const expected={'front':[256,256],'idle':[256,1024],'wardrobe':[256,1024],'step-touch':[8192,1024],'happy-bounce':[8192,1024]};
 for(const [name,size]of Object.entries(expected)){const b=file('assets/miner-procedural-v3/'+name+'.png');assert.deepEqual([b.readUInt32BE(16),b.readUInt32BE(20)],size,name);}
 for(const path of REFUGE_NIGHT_FILES){const b=file(path);assert.equal(b.toString('ascii',1,4),'PNG',path);}
});
test('portrait and wardrobe resolve the same equipped appearance, unknown legacy IDs safely fall back',()=>{
 const base=resolvePlayerAppearance({}),candidate={...base,id:'qa-appearance',url:'qa-front.png',portrait:[1,2,3,4]};registerPlayerAppearance(candidate);
 const profile={homeCollection:{look:'qa-appearance'}};assert.equal(resolvePlayerAppearance(profile).url,candidate.url);assert.deepEqual(resolvePlayerAppearance(profile).portrait,candidate.portrait);
 assert.equal(resolvePlayerAppearance({homeCollection:{look:'obsolete'}}).id,'hardhat-blue');
});
test('idle dances are deterministic and reduced motion never enters a dance',()=>{
 for(let t=0;t<120;t+=.13){assert.deepEqual(sampleLobbyIdle(t),sampleLobbyIdle(t));assert.equal(sampleLobbyIdle(t,true).name,'idle');assert.equal(sampleLobbyIdle(t,false,'wardrobe').name,'wardrobe');}
 assert.notDeepEqual(Array.from({length:120},(_,t)=>sampleLobbyIdle(t,false,'idle',4)),Array.from({length:120},(_,t)=>sampleLobbyIdle(t,false,'idle',7)));
 assert.deepEqual([...new Set(Array.from({length:600},(_,i)=>sampleLobbyIdle(i).name))].sort(),['idle','jamal','look','sit','step','sway','wave']);
});
test('pet wardrobe reads actual unlock requirements without granting pets or mutating save',()=>{
 const s=createState(41001),before=JSON.stringify(s),markup=wardrobeMarkup(s,'pets');assert.equal(JSON.stringify(s),before);assert.equal((markup.match(/BLOQUEADO/g)||[]).length,10);assert.match(markup,/chefe do andar 10/);assert.match(markup,/Combo 100/);assert.match(markup,/expedições diferentes/);
 s.homeCollection.pets=['slime-friend'];s.homeCollection.activePet='slime-friend';const restored=restoreState(JSON.stringify(s));assert.ok(restored);const owned=wardrobeMarkup(restored,'pets');assert.match(owned,/DESEQUIPAR/);assert.equal((owned.match(/>BLOQUEADO</g)||[]).length,9);
 assert.equal(restored.bank,s.bank);assert.deepEqual(restored.materials,s.materials);
});
test('wallets use independent DOM IDs and gem silhouettes differ from geological crystals',()=>{
 const html=resourceWalletMarkup([2,4,8,16])+resourceWalletMarkup([2,4,8,16],'lobby-material-'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);assert.equal(ids.length,8);
 assert.equal(new Set(GEM_CUTS.map(g=>g.outline)).size,4);for(let i=0;i<4;i++){assert.doesNotMatch(collectedGemSvg(i),/clipPath|url\(/);assert.match(collectedGemSvg(i),/collected-gem/);}
 for(let b=0;b<7;b++)for(let v=0;v<4;v++){const a=worldCrystalShapes({variant:v,biome:b,j:0});assert.deepEqual(a,worldCrystalShapes({variant:v,biome:b,j:0}));assert.ok(a.length<250);assert.doesNotMatch(JSON.stringify(a),/NaN|undefined/);}
});
test('main services keep requested order and store last, without Zag in the lobby',()=>{assert.deepEqual(REFUGE_MAIN_ACTIONS.map(a=>a.id),['forge','tree','stars','shop']);});

test('front presentation atlas crops remain inside every packed sheet throughout the dance',()=>{
 const old=globalThis.Image,rig=resolvePlayerAppearance({}),calls=[];
 globalThis.Image=class{complete=true;naturalWidth=4096;};
 const c={save(){},restore(){},drawImage(...args){calls.push(args);}};
 try{
  for(let i=0;i<288;i++){
   const time=i/20,p=sampleLobbyIdle(time),clip=rig.clips[p.name],png=file(clip.url);
   drawLobbyPlayer(c,{},790,725,230,time,{direction:3});
   const [img,x,y,w,h]=calls.at(-1);assert.equal(img.src,clip.url);assert.equal(w,320);assert.equal(h,320);
   assert.ok(x>=0&&y>=0&&x+w<=png.readUInt32BE(16)&&y+h<=png.readUInt32BE(20),`${p.name} at ${time}`);
  }
  drawLobbyPlayer(c,{},790,725,230,100,{reduced:true});assert.deepEqual(calls.at(-1).slice(1,5),[0,0,320,320]);
 }finally{if(old===undefined)delete globalThis.Image;else globalThis.Image=old;}
});

test('lift arrows retain their layout slots across overflow changes and respect track ends',()=>{
 const arrows=[-1,1].map(d=>({hidden:true,getAttribute(){return String(d);}}));
 const track={scrollWidth:700,clientWidth:700,scrollLeft:0,addEventListener(_,fn){this.sync=fn;},scrollBy({left}){this.scrollLeft+=left;}};
 const root={querySelector:s=>s==='.gv-v2-floor-track'?track:null,querySelectorAll:s=>s==='[data-floor-scroll]'?arrows:[]};
 bindLiftNavigation(root,()=>{});assert.ok(arrows.every(a=>!a.hidden&&a.disabled));
 track.scrollWidth=1200;track.sync();assert.equal(arrows[0].disabled,true);assert.equal(arrows[1].disabled,false);
 arrows[1].onclick();assert.equal(track.scrollLeft,252);track.sync();assert.ok(arrows.every(a=>!a.hidden&&!a.disabled));
 track.scrollLeft=500;track.sync();assert.equal(arrows[1].disabled,true);
 track.clientWidth=1200;track.scrollLeft=0;track.sync();assert.ok(arrows.every(a=>!a.hidden&&a.disabled));
});

test('collected rewards use gems independently of the geological sprite registry',()=>{
 const s=createState(41001),before=JSON.stringify(s),vm=liftHostPresentationModel(s,1,'floors');
 for(let i=0;i<4;i++){const e=vm.selected.rewards.catalog.entries.find(e=>e.id==='material-'+i);assert.equal(e.asset.module,'collected-gems.js');assert.match(e.artHtml,/collected-gem/);assert.match(e.artHtml,/assets\/refuge-night-v3\/gem-/);}
 assert.equal(JSON.stringify(s),before);
});
