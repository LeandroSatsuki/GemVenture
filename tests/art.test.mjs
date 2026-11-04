import {readFileSync} from 'node:fs';


import {createHash} from 'node:crypto';


import test from 'node:test';


import assert from 'node:assert/strict';


import {readFile,readdir} from 'node:fs/promises';


import {ART_TYPES,ART_RULES,generateAsset,assetToSvg} from '../dist/art-kit.js';


import {PALETTE,GEM_RAMPS} from '../dist/palette.js';


import {CRYSTALS} from '../dist/core.js';





test('generated families stay within the palette and detail budget across seeds and biomes',()=>{


 const cosmos=JSON.parse(readFileSync(new URL('../dist/assets/dungeon-actors-v1/palette.json',import.meta.url),'utf8')).colors;const migrated=new Set(['rock','crystal','lantern','fossil','mushroom','bush','molehill','lava','lift','cave-chest','cave-mushroom']);assert.equal(new Set(PALETTE).size,32);


 for(const type of ART_TYPES)for(let biome=0;biome<7;biome++)for(const seed of [0,1,55,1208,2147483647,4294967295]){


  const allowed=new Set(migrated.has(type)?cosmos:PALETTE),budget=migrated.has(type)?250:ART_RULES.maxShapes;const asset=generateAsset(type,{seed,biome,variant:seed%(type==='boss'?7:4)});


  assert.ok(asset.shapes.length>0&&asset.shapes.length<=budget,type);


  assert.deepEqual(asset.anchor,{x:50,y:96});


  for(const shape of asset.shapes){assert.ok(allowed.has(shape.fill)||(!shape.fill&&shape.stroke),shape.fill);if(shape.stroke)assert.ok(allowed.has(shape.stroke));


   for(const value of Object.values(shape))if(typeof value==='number')assert.ok(Number.isFinite(value));


   if(shape.d)assert.match(shape.d,/^[MmLlHhVvCcSsQqTtAaZz\s\d.,eE+-]+$/);


   if(shape.matrix){assert.equal(shape.matrix.length,6);assert.ok(shape.matrix.every(Number.isFinite));}


  }


 }


});


test('procedural silhouettes are reproducible after cache eviction and vary between seeds',()=>{


 const baseline=JSON.stringify(generateAsset('crystal',{seed:13,variant:2}));


 for(let i=0;i<600;i++)generateAsset('rock',{seed:i});


 assert.equal(JSON.stringify(generateAsset('crystal',{seed:13,variant:2})),baseline);


 assert.notEqual(JSON.stringify(generateAsset('crystal',{seed:13}).shapes),JSON.stringify(generateAsset('crystal',{seed:55}).shapes));


 assert.throws(()=>generateAsset('missing'),RangeError);


 assert.ok(Object.isFrozen(generateAsset('miner').shapes[0]));


});


test('SVG exports preserve every shape, outline and gameplay crystal color',()=>{


 for(let i=0;i<4;i++){assert.equal(CRYSTALS[i].color,GEM_RAMPS[i][0]);assert.equal(CRYSTALS[i].shade,GEM_RAMPS[i][1]);}


 for(const type of ART_TYPES){const asset=generateAsset(type),svg=assetToSvg(asset);


  assert.equal((svg.match(/<(?:path|ellipse|rect) /g)||[]).length,asset.shapes.length);


  assert.ok(svg.includes('viewBox="0 0 100 110"'));


  assert.doesNotMatch(svg,/<script|<image|<filter|gradient|undefined|NaN/i);


 }


});


test('legacy palette remains frozen and candidate UI changes match their explicit receipt',async()=>{


 const approvedUI={...JSON.parse(await readFile(new URL('./fixtures/reliquary-v10-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/forge-v6-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/post-choice-v12-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/choice-v4-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/lift-v2ab-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/tree-ecos-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/missions-vila-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/vitrola-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/cuidadora-v06-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/return-v02-approved-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/refuge-night-v2-ui-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/refuge-night-v3-ui-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/dungeon-v1-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/dungeon-v2-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/dungeon-v3-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/completion-v4-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/gamefeel-v5-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/gamefeel-v6-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/gamefeel-v7-candidate-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/crystal-veins-v5-integration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/crystal-effects-v1-integration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-consistency-v1-integration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/biome-pickaxe-ruby-v1-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/cave-depth-disco-v1-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/combo-lights-v2-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-layout-r2-integration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/combo-beat-v3-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-elevator-r3-restoration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-exploration-r4-integration-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-lift-content-r5-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/combo-impact-v1-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/ui-lift-width-r6-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/pet-companions-v2-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/pet-companions-gameplay-v1-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/pet-art-polish-v3-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/pets-collection-v4-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/campaign-progression-v1-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-services-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-vitrola-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-reliquary-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-missions-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/vfx-family-20261031-approved.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/miner-cave-detail-v6-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/miner-cave-tool-v7-contract.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-wardrobe-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/crystal-contact-20261031-approved.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-pets-20261031-ui.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/tree-sfx-p1-20261031-approved.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/attack-readability-20261031-approved.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/buttons-20261031-approved.json',import.meta.url),'utf8')).files,...JSON.parse(await readFile(new URL('./fixtures/approved-rest-20261031-ui.json',import.meta.url),'utf8')).files};


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/campaign-caves-v1-approved.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-return-20261031-ui.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-expedition-cards-20261031-ui.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-ui-completion-20261031.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/golden-proc-20261101-correction.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/player-hud-r2-20261101-correction.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-settings-pause-20261101-ui.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-help-20261101-ui.json',import.meta.url),'utf8')).files);


 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vitrola-albums-20261101-integration.json',import.meta.url),'utf8')).files);

 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vitrola-covers-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-card-feedback-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vitrola-unified-20261101-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-refuge-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-tutorial-guide-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/button-hierarchy-20261101-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/abyss-readability-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-card-miniatures-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-clean-r2-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-intro-ui-scale-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/boss-arena-space-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/zag-orbs-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/matriarch-20261101-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/combo-progression-20261101-applied.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-finds-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-training-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/abyss-caves-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-miniboss-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/completion-feedback-20261101-applied.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-floor-performance-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/completion-coin-audio-20261101-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-miniboss-ui-r2-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-abyss-preparation-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-stairs-20261101.json',import.meta.url),'utf8')).files);

 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/mushroom-no-labels-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-biome-unlock-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-stairs-visual-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-abyss-requirement-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/bomb-red-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-descent-rock-art-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/geode-lighting-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/biome-lighting-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-cave-orbs-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/liquid-lighting-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-hole-fall-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-video-settings-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-field-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/micelial-20261101-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/scenery-lighting-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/fossil-fissures-20261101-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-cave-finds-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/pyres-approved-ambience-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vfx-neon-20261101.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-discoveries-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-cave-alerts-20261101-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-level-progress-20261102-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/rabbit-20261102-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-completion-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/approved-sentinel-20261102-ui.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/zag-npc-only-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vfx-legacy-neon-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/contextual-tutorial-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/final-ui-review-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/combo-soft-shadow-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/mystic-fire-20261102-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/final-ui-mystic-dependency-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-boss-bars-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/mystic-beam-20261102-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/boss-optional-help-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/boss-emission-20261102-approved.json',import.meta.url),'utf8')).files);
 const allowed=new Set(PALETTE);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/first-hour-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/progression-curves-20261102.json',import.meta.url),'utf8')).files);




 // Chronological integration chain: progression -> recorded playback -> free-time consumables.
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/vitrola-playback-20261102-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/items-free-time-20261102.json',import.meta.url),'utf8')).files);

 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-editor-camera-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/items-free-time-20261102.json',import.meta.url),'utf8')).finalAccessibilityFiles);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/geode-crown-20261102-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/first-hour-items-recheck-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/recorded-volume-20261102-integration.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/pause-resume-surfaces-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/geode-crown-center-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/early-descent-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/tutorial-hud-ownership-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/dungeon-learning-optin-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-pinned-ready-ui80-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/hud-pointer-bounds-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/runtime-performance-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/quest-rewards-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-runtime-performance-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/spore-lake-20261102-approved.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-room-reduction-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/cave-stream-fluidity-20261102.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/boss-hotfix-20261103.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/training-owned-music-20261103.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/recorded-reliability-20261103.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/ui-footer-20261103.json',import.meta.url),'utf8')).files);
 Object.assign(approvedUI,JSON.parse(await readFile(new URL('./fixtures/runtime-feedback-20261103.json',import.meta.url),'utf8')).files);
 for(const file of await readdir(new URL('../dist/',import.meta.url))){if(file.startsWith('qa-')||!/\.(js|css|html|svg)$/.test(file))continue;


  const source=await readFile(new URL('../dist/'+file,import.meta.url),'utf8');


  if(approvedUI[file]){assert.equal(createHash('sha256').update(source).digest('hex'),approvedUI[file],file+': approved UI receipt changed');assert.doesNotMatch(source,/AREN32|aren32/);continue;}


  for(const match of source.matchAll(/#([\da-f]{6})(?:[\da-f]{2})?\b/gi))assert.ok(allowed.has('#'+match[1].toLowerCase()),file+': '+match[0]);


  assert.doesNotMatch(source,/AREN32|aren32/);


 }


});



