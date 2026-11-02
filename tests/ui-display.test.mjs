import test from 'node:test';
import assert from 'node:assert/strict';
import {createUiPreferences,UI_DISPLAY_KEY,uiDisplayMetrics,elementLayoutScale,UI_PERCENT} from '../dist/ui-display.js';
test('UI size is independent of the game save, audio and FX and survives reopening',()=>{
 const store=new Map([['gemventure-save-v2','player-progress'],['gemventure-fx','soft'],['gemventure-audio-v1','volume']]);const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const ui=createUiPreferences({storage});assert.equal(ui.getState().percent,80);let changes=0;const unsubscribe=ui.subscribe(()=>changes++);ui.setPercent(130);unsubscribe();ui.setPercent(125);assert.equal(changes,1);
 assert.equal(createUiPreferences({storage}).getState().percent,125);assert.equal(store.get('gemventure-save-v2'),'player-progress');assert.equal(store.get('gemventure-fx'),'soft');assert.equal(store.get('gemventure-audio-v1'),'volume');assert.deepEqual(JSON.parse(store.get(UI_DISPLAY_KEY)),{version:1,percent:125});
});
test('range limits, reset and unavailable persistence remain usable in this session',()=>{
 const storage={getItem(){throw Error('Unavailable');},setItem(){throw Error('Unavailable');}},ui=createUiPreferences({storage});
 assert.equal(ui.getState().percent,80);assert.equal(ui.setPercent(999).percent,150);assert.equal(ui.setPercent(-1).percent,75);assert.equal(ui.setPercent(100).percent,100);assert.equal(ui.getState().persisted,false);
 const corrupt=createUiPreferences({storage:{getItem:()=>'{broken'}});assert.equal(corrupt.getState().percent,80);assert.equal(createUiPreferences({storage:{getItem:()=>JSON.stringify({version:9,percent:150})}}).getState().percent,80);
});
test('large-screen adaptation and user size compose without shrinking baseline controls',()=>{
 assert.equal(uiDisplayMetrics(1280,720).scale,.8);assert.equal(uiDisplayMetrics(1920,1080).scale,1.08);assert.equal(uiDisplayMetrics(2560,1440).scale,1.44);assert.equal(uiDisplayMetrics(3840,2160).scale,1.6);assert.equal(uiDisplayMetrics(320,720).scale,.8);
 assert.equal(uiDisplayMetrics(1920,1080,150).scale,2.025);assert.equal(uiDisplayMetrics(1280,720,75).scale,.75);
});
test('tree dragging preserves the pointer distance through every UI size',()=>{
 for(const scale of [.75,1,1.35,1.5,2.7]){const element={offsetWidth:400,getBoundingClientRect:()=>({width:400*scale})},physicalDrag=120*scale;assert.ok(Math.abs(physicalDrag/elementLayoutScale(element)-120)<.00001);}
});

test('80 is the initial and reset size while an explicitly saved 100 percent remains the player choice',()=>{const store=new Map([[UI_DISPLAY_KEY,JSON.stringify({version:1,percent:100})]]),ui=createUiPreferences({storage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}});assert.equal(ui.getState().percent,100);assert.equal(ui.setPercent(UI_PERCENT.default).percent,80);assert.equal(JSON.parse(store.get(UI_DISPLAY_KEY)).percent,80);assert.equal(uiDisplayMetrics(1280,720,100).scale,1);});
