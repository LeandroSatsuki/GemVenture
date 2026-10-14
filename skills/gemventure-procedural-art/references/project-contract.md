# Project contract

The project currently serves `dist/` directly. Reinspect the repository if the build changes.

| Concern | Owner |
| --- | --- |
| Palette and material ramps | `dist/palette.js` |
| Seeded asset schema, SVG/canvas output, cache | `dist/art-kit.js` |
| Buildings, rocks and resources | `dist/scene-art.js` |
| Creatures and biome variations | `dist/creature-art.js` |
| Boss silhouettes | `dist/boss-art.js` |
| Cursor and ten pickaxe tiers | `dist/pickaxe-style.js` |
| Scene composition, layer animation, camera and visibility | `dist/world.js` |
| Cave layout/visibility and generation | `dist/cave-layout.js`, `dist/cavern.js`, `dist/core.js` |
| Telegraphs and bounded ceiling replenishment | `dist/cave-ceiling.js` |
| Continuous Abismo rows and hazards | `dist/frenzy.js` |
| Art previews | `dist/art-studio.html`, `dist/art-studio.js` |
| Isolated local QA | `tests/visual-server.mjs`, port 4174 |

`generateAsset(type,{seed,variant,biome})` produces immutable assets in a 100×110 frame, ground anchor `(50,96)`, outline 2.8, maximum 30 shapes. Shapes are paths, ellipses and rounded rectangles, with optional affine matrices. SVG and canvas must show the same design. Shape fills and outlines must come from the 32-color palette.

The raster cache is bounded to 256 sprites, vector assets to 512, paths to 2048. Gameplay should reuse cached pixels; animation transforms must not become ever-changing cache keys. `visualKey` represents actual geometry, not merely a unique source seed. Layer keys may distinguish base and accent but remain bounded.

`project(x,y)` uses a semi-top-down grid: 44 horizontal units, 32 vertical, 4 horizontal shear per row. Keep interaction coordinates aligned with rendered ground anchors. Vertical jumping offsets the sprite, not the logical cell or camera target. Preserve soft camera following.

The well, star shrine, tree, forge and Zag expose static base/accent layers for motion. Inspect current layer pivots before transforming them. Render base + accent as the same complete asset at zero phase.

The giant spectator hedgehog has seven cached parts: shadow, body, crystals, face, eyes, paw-left and paw-right. Use `HEDGEHOG_PART_PIVOTS`; draw at roughly 128 units versus the miner's 31. Its sprite remains raster-cached up to 160 units, unlike large vector-only studio previews. Base/accent aliases remain compatible. Animate a slow anchored breath, restrained gaze toward the board, separate blinks and alternating rhythmic paw taps. The fixed burrow uses a wall-only clip so the giant cannot cover walkable space. Northern burrows need extra camera margin; preserve smooth camera motion and never change collision to fit artwork.

Cave tests must cover all six current biomes and boss floors. Missing floor-mask data in an old save must use a compatible safe fallback. Never place entities or resources in solid walls. Boss death remains mandatory before clearing a boss floor. Paused cards, rest, village and hidden tabs must not advance combat hazards.

Use existing test names from `tests/`; do not assume this list remains complete. The full suite is `npm test`. After adding an imported module, update the explicit module list in `export-art-studio.mjs` and verify the portable `atelie-gemventure.html` export.
