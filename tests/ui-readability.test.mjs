import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createState,upgradeCost,power} from '../dist/core.js';
import {recipeMarkup,forgeMarkup} from '../dist/forge-view.js';
import {PALETTE,P} from '../dist/palette.js';

test('direct recipes never count the same wallet twice, while project deposits remain distinct',()=>{
 const s=createState();s.materials=[10,0,0,0];
 const direct=recipeMarkup(s,[20,0,0,0]);assert.match(direct,/recipe-gem missing/);assert.match(direct,/10 \/ 20/);assert.match(direct,/width:50%/);assert.doesNotMatch(direct,/recipe-gem enough/);
 const invested=recipeMarkup(s,[20,0,0,0],[10,0,0,0]);assert.match(invested,/recipe-gem enough/);assert.match(invested,/DEPOSITADO/);assert.match(invested,/10 \/ 20/);
 s.materials[0]=20;assert.match(recipeMarkup(s,[20,0,0,0]),/recipe-gem paid/);
});

test('forge keeps each action and currency distinct in the reference layout',()=>{
 const s=createState();s.bank=30;s.materials=[2,1,0,0];const before=JSON.stringify(s);
 const markup=forgeMarkup(s,'pickaxe',upgradeCost(s),power(s));
 assert.ok(markup.indexOf('smith-projects')<markup.indexOf('id="forgeScene"'));
 assert.ok(markup.indexOf('id="forgeScene"')<markup.indexOf('smith-recipe'));
 assert.match(markup,/smith-selection/);assert.match(markup,/data-building="forge"/);
 assert.match(markup,/id="forgeAction" disabled/);assert.match(markup,/FORJAR PICARETA/);
 assert.equal((markup.match(/class="recipe-gem/g)||[]).length,2);assert.doesNotMatch(markup,/gear-workbench/);
 assert.equal(JSON.stringify(s),before,'presentation cannot spend crystals or change the build');
});

const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('restful menu colors stay in HEPT32 and preserve readable text contrast',async()=>{
 const css=await readFile(new URL('../dist/ui-refinement.css',import.meta.url),'utf8');
 for(const match of css.matchAll(/#[0-9a-f]{6}(?:[0-9a-f]{2})?\b/gi))assert.ok(PALETTE.includes(match[0].slice(0,7).toLowerCase()),match[0]);
 for(const [foreground,background]of [[P.white,P.gray],[P.ink,P.steel],[P.white,P.slate],[P.ink,P.ochre],[P.ink,P.orange],...[P.cyan,P.pink,P.yellow,P.lime].map(c=>[P.ink,c])])assert.ok(contrast(foreground,background)>=4.5,foreground+' / '+background);
 assert.ok(luminance(P.gray)<luminance(P.steel));assert.ok(luminance(P.forest)<luminance(P.green));
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.indexOf('ui-refinement.css')>html.indexOf('miner.css'));
});
