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
| Current actor-sorted wall consumer and finish | `dist/cave-wall-occlusion.js`, `dist/dungeon-wall-finish.js`, called by `dist/world.js` |
| Migrated cave material families and environmental finish | `dist/dungeon-volumes.js`, `dist/dungeon-environment.js`, `dist/cave-depth.js`; see dated updates in `docs/art/refuge-night-v1.md` |
| Telegraphs and bounded ceiling replenishment | `dist/cave-ceiling.js` |
| Continuous Abismo rows and hazards | `dist/frenzy.js` |
| Art previews | `dist/art-studio.html`, `dist/art-studio.js` |
| Isolated local QA | `tests/visual-server.mjs`, port 4174 |

`generateAsset(type,{seed,variant,biome})` produces immutable assets in a 100×110 frame, ground anchor `(50,96)`, outline 2.8, maximum 30 shapes. Shapes are paths, ellipses and rounded rectangles, with optional affine matrices. SVG and canvas must show the same design. Shape fills and outlines must come from the 32-color palette.

The raster cache is bounded to 256 sprites, vector assets to 512, paths to 2048. Gameplay should reuse cached pixels; animation transforms must not become ever-changing cache keys. `visualKey` represents actual geometry, not merely a unique source seed. Layer keys may distinguish base and accent but remain bounded.

`project(x,y)` uses a semi-top-down grid: 44 horizontal units, 32 vertical, 4 horizontal shear per row. Keep interaction coordinates aligned with rendered ground anchors. Vertical jumping offsets the sprite, not the logical cell or camera target. Preserve soft camera following.

The well, star shrine, tree, forge and Zag expose static base/accent layers for motion. Inspect current layer pivots before transforming them. Render base + accent as the same complete asset at zero phase.

The giant spectator hedgehog has seven cached parts: shadow, body, crystals, face, eyes, paw-left and paw-right. Use `HEDGEHOG_PART_PIVOTS`; draw at roughly 128 units versus the miner's 31. Its sprite remains raster-cached up to 160 units, unlike large vector-only studio previews. Base/accent aliases remain compatible. Animate a slow anchored breath, restrained gaze toward the board, separate blinks and alternating rhythmic paw taps. The fixed burrow uses a wall-only clip so the giant cannot cover walkable space. Northern burrows need extra camera margin; preserve smooth camera motion and never change collision to fit artwork.

Human update, 14 October 2026: the hedgehog accepts a special non-lethal pickaxe interaction. `dist/hedgehog.js` owns targeting, approach, mood and growth limits; `core.js` owns rhythm and real crystal spawning. Save growth state separately from the burrow position. The cover supplies visual identity; new native art/poses remain a separate delivery. See `docs/art/hedgehog-interaction.md`. Do not restore the obsolete never-targetable rule. Keep the wall clip and draw the spectator before actors, including when the miner is directly in front of it.

Cave tests must cover all current biomes and boss floors from `dist/campaign.js` (currently seven biomes, five floors each). Missing floor-mask data in an old save must use a compatible safe fallback. Never place entities or resources in solid walls. Boss death remains mandatory before clearing a boss floor. Paused cards, rest, village and hidden tabs must not advance combat hazards.

Use existing test names from `tests/`; do not assume this list remains complete. The full suite is `npm test`. After adding an imported module, update the explicit module list in `export-art-studio.mjs` and verify the portable `atelie-gemventure.html` export.

28 October 2026 override: migrated native families use Cosmos64 and the approved
cave basis; the old HEPT32/30-shape limit applies only to remaining legacy families.
See `docs/art/refuge-night-v1.md`, completion v4, for exact migrated scope. Three
rock kinds require different silhouettes; crystals use a broad bouquet. Player
outfits are selected through `miner-outfit.js` in every consumer, never baked into
one UI-only portrait. Keep complete wall height and fade foreground occlusion;
cache static geometry, not continuously changing animation keys. Finite floor
stars replace essence, with best-rating-only payout and legacy save migration.

28 October 2026, v5 override: the user chose the active Forge panel as the common
UI reference. Rhythm moves beside consumables, not above the world. Northern
horizontal wall faces use two courses (30); other faces remain 48 and fade on
occlusion. The lobby uses optional living-v6 Diorama clips, independently posed
head/neck and shared rigid helmet frame, exported to Canvas atlases. Cave clips
remain separate. Future motions must preserve outfit sockets and neutral clip
boundaries, audit hand/head clearance, and validate actual playback. Never call
numerical success an artistic approval. See docs/art/refuge-night-v1.md.

31 October 2026 cave study: current `occludingWallPlan` uses height 30 for its
segments and local alpha compositing in the actor queue. `WALL_HEIGHT=48` and
the variable-height `buildWallPlan` still exist for other/legacy consumers;
their constants do not identify the active face height. The 29 October depth
contract explicitly follows the actual 30-high faces. Check the consumer before
changing wall art, shadows or crown decoration. Do not fix visibility by moving
collision or shrinking all walls. The new room direction and evaluation methods
are in [cave-structure.md](cave-structure.md) and
[cave-tiles-occlusion.md](cave-tiles-occlusion.md).
