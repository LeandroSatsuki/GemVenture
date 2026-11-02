import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';
import {fileURLToPath} from'node:url';import {planRelease,buildRelease} from'../tools/build-release.mjs';
import {CAMPAIGN_CAVE_ART} from'../dist/campaign-cave-data.js';import {MUSIC_ALBUMS} from'../dist/music-albums.js';
const root=fileURLToPath(new URL('../',import.meta.url)),plan=planRelease(),files=new Set(plan.files),norm=f=>f.replace(/^\.\//,'');
test('shipping plan retains native entry and all seven biome families, cosmetics and recorded editions',()=>{
 for(const file of ['index.html','menu-entry.js','run.js','core.js','audio.js','hud-layout-presenter.js','approved-forge-ui.css'])assert.ok(files.has(file),file);
 for(const b of CAMPAIGN_CAVE_ART)for(const file of Object.values(b.assets))assert.ok(files.has(norm(file)),file);
 for(const a of MUSIC_ALBUMS)for(const e of a.editions)assert.ok(files.has(norm(e.audioUrl)),e.audioUrl);
 for(const hat of ['hardhat','duck'])for(const shirt of ['blue','pink'])for(const clip of ['front','idle','wardrobe','jamal','sit','wave','step','sway','look'])assert.ok(files.has(`assets/miner-living-v7/${hat}-${shirt}/${clip}.png`));
});
test('production ships no developer pages, historical backups, QA fixtures or missing imports',()=>{
 assert.ok(plan.excluded.length>0);assert.ok(plan.bytes<plan.distBytes);
 for(const file of files){assert.doesNotMatch(file,/(^|\/)(?:qa-|tests\/|tools\/|analysis\/|coordination\/|backup\/|__pycache__\/)/);assert.doesNotMatch(file,/^(?:art-studio|music-lab|terrain-studio|asset-catalog|balance-report|village-preview|vfx-gallery)\.html$/);
  if(!file.endsWith('.js'))continue;const s=fs.readFileSync(path.join(root,'dist',file),'utf8');for(const m of s.matchAll(/(?:from\s*|import\s*\()(['"])(\.\.?\/[^'"]+\.js)\1/g)){const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),m[2]));assert.ok(files.has(dependency),file+' -> '+dependency);}
 }
});
test('release output guard refuses to write inside runtime or outside the dedicated releases directory',()=>{
 assert.throws(()=>buildRelease({root,out:path.join(root,'dist')}),/must stay inside/);assert.throws(()=>buildRelease({root,out:path.resolve(root,'../coordination')}),/must stay inside/);
});

test('release retains the module raster worker and its imported painter dependencies',()=>{for(const name of ['campaign-cave-raster-worker.js','campaign-cave-raster-client.js','campaign-cave-surface.js','campaign-cave-walls.js','campaign-cave-terrain.js'])assert.ok(files.has(name),name);});
