import test from 'node:test';
import assert from 'node:assert/strict';
import {PICKAXE_STYLES,pickaxeTier,nextPickaxeStyle} from '../dist/pickaxe-style.js';
import {generateAsset,assetToSvg,ART_RULES} from '../dist/art-kit.js';
import {pickaxeCursor} from '../dist/pickaxe-cursor.js';
import {PALETTE} from '../dist/palette.js';
import {createState,purchaseUpgrade,restoreState,power,upgradeCost} from '../dist/core.js';
import {forgeMarkup} from '../dist/forge-view.js';
test('exactly ten appearances change only at ten-level milestones and cap at 100',()=>{
 assert.equal(PICKAXE_STYLES.length,10);assert.equal(pickaxeTier(1),0);assert.equal(pickaxeTier(9),0);
 for(let level=10;level<=90;level+=10){assert.equal(pickaxeTier(level),level/10);assert.equal(pickaxeTier(level-1),level/10-1);assert.equal(nextPickaxeStyle(level-1).level,level);}
 assert.equal(pickaxeTier(99),9);assert.equal(pickaxeTier(100),9);assert.equal(pickaxeTier(1000),9);assert.equal(nextPickaxeStyle(90),null);
});
test('all ten silhouettes are distinct, deterministic, bounded and stay in HEPT32',()=>{
 const forms=new Set();for(let i=0;i<10;i++){const art=generateAsset('pickaxe',{variant:i});forms.add(JSON.stringify(art.shapes));assert.ok(art.shapes.length<=ART_RULES.maxShapes);for(const shape of art.shapes)assert.ok(PALETTE.includes(shape.fill));assert.equal(assetToSvg(art),assetToSvg(generateAsset('pickaxe',{variant:i,seed:999})));}
 assert.equal(forms.size,10);
});
test('cursor uses real pickaxe art, a blade hotspot and native fallback at each milestone',()=>{
 const variants=new Set();for(const style of PICKAXE_STYLES){const css=pickaxeCursor(style.level);variants.add(css);assert.match(css,/5 16, pointer$/);const svg=decodeURIComponent(css.split('data:image/svg+xml,')[1].split('")')[0]);assert.match(svg,/width="40" height="44"/);assert.ok(svg.includes(style.metal));assert.doesNotMatch(svg,/undefined|NaN/);}
 assert.equal(variants.size,10);assert.equal(pickaxeCursor(10),pickaxeCursor(19));assert.equal(pickaxeCursor(90),pickaxeCursor(100));
});
test('real forge purchase and save restoration retain the same appearance and next milestone',()=>{
 const s=createState();s.level=9;s.bank=1e9;s.materials=[1e9,1e9,1e9,1e9];
 assert.match(forgeMarkup(s,'pickaxe',upgradeCost(s),power(s)),/NOVO VISUAL · NV\. 10/);
 const old=pickaxeCursor(s.level);assert.ok(purchaseUpgrade(s));assert.equal(s.level,10);assert.notEqual(pickaxeCursor(s.level),old);
 const restored=restoreState(JSON.stringify(s));assert.equal(pickaxeCursor(restored.level),pickaxeCursor(s.level));
 assert.match(forgeMarkup(s,'pickaxe',upgradeCost(s),power(s)),/Picareta Cobre/);assert.match(forgeMarkup(s,'pickaxe',upgradeCost(s),power(s)),/NOVO VISUAL · NV\. 20/);
});
