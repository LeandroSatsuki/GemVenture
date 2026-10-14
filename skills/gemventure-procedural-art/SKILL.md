---
name: gemventure-procedural-art
description: Create, polish and validate procedural assets, creature animation and cave/village composition for Gemventure. Use for its code-native game art and seeded scenery, preserving the HEPT32 identity and readable silhouettes.
---

# Gemventure procedural art

Work in the user's Gemventure checkout (currently `E:/Genventure/gemventure`). Read its current art modules before making assumptions. This skill preserves the game's art direction; it does not authorize publishing, installing packs, changing the economy, or changing the user's save.

## Visual contract

### Current village pass: supplied Flow art

The user's 13 October 2026 reference and prompt define the current village shapes. The user explicitly clarified that the reference is a guide: create individual assets and retain HEPT32. Read `ART_ASSETS.md` and `asset-work/village-hept32-prompts.md`. Match isometric chunky silhouettes, bevels, matte materials, single shadow tones and the reference's relative proportions. Do not put the full reference image into the game or reinterpret the old frontal icons as the final assets. Generate bitmap pieces with imagegen, transparent alpha and the named HEPT32 material pairs. Render with ground anchors, bounded cached rasters and independent idle slices. Inspect the complete scene with HUD and click targets. Station labels appear at the top on hover or keyboard focus, never permanently beneath buildings. Existing cave gameplay is a separate visual migration.

- The miner and mission board are the local reference for proportions and readability. Inspect them at gameplay scale before adding a family. Research a relevant reference first, then translate the principle into Gemventure's own shapes; do not copy another game's sprites.
- Use **HEPT32 only**, through `P`, `GEM_RAMPS` and `BIOME_ART` from `dist/palette.js`. Keep established mineral colors and danger cues. One base and **one shadow color per material**, light from upper left. Small emissive accents are not extra shadow bands.
- Prioritize a recognizable outer silhouette and a few large masses. Round organic bodies, paws, canopies and building corners. Crystals may have regular intentional facets; tools may have a functional edge. Avoid jittering every vertex, crooked roofs, asymmetric stars, tiny facets, noise textures and incidental spikes.
- Give buildings a shared outline weight, ground anchor and view angle. More important buildings can be larger, not more detailed. A tree reads as a tree before it reads as a skill system; an elevator uses wood, rope, pulleys and mine framing.
- Use stable seeded **proportion** variants within a fixed skeleton. A biome changes coherent materials/accessories, not every color at random. Every asset must visually belong beside the miner and its neighboring assets.

## Generator and motion

Read [references/project-contract.md](references/project-contract.md) when implementing.

Extend `generateAsset`/`drawAsset` and existing shape builders rather than drawing a parallel art system. Prefer native vector/canvas assets for these simple shapes. Use supplied packs as references or compatible components, not a reason to abandon the palette.

Keep static geometry independent of time. Animate cached layers around explicit pivots: paws tap, wings hinge, bodies squash slightly, a crystal floats above a fixed well, a canopy sways above a rooted trunk. Moving creatures need anticipation, contact and settling; do not drag their shadow through the air. Honor reduced-motion mode and gameplay pause. Do not shake or rotate the camera for idle art.

## Composition

Read [references/composition-and-references.md](references/composition-and-references.md) for scene or cave work.

Reserve the strongest saturation and contrast for the player, rewards and actionable dangers. Group scenery at edges; preserve open routes and breathing space around village stations. Permanent cave walls use a continuous cliff mass with an edge, **never the mineable rock sprite**. A ceiling fall needs an on-beat ground warning before landing.

The crystal-backed hedgehog is a **giant spectator**, roughly four times the miner's width, seated inside a generous hole in the cavern wall and watching the cave like a game board. It is scenery, never a target. Give this landmark more care than an ordinary creature: defined muzzle, ears, paws and integrated crystal clusters, while keeping solid colors and one shadow per material. Animate breathing, blinking, gaze and alternating on-beat paw taps with cached parts; keep the burrow fixed. Prefer broad wall sections and clip its art away from walkable passages so its size cannot hide combat.

Construct cave topology before populating it. Validate connected chambers, readable corridors, safe spawn/exit, clear boss arena, resource reachability and bounded replenishment across seeds and biomes. Preserve the separate continuous Abismo flow and legacy saves.

## Delivery gates

1. Run `node <skill>/scripts/audit-assets.mjs <checkout> [output.svg]` to audit seeded assets and optionally export a contact sheet. Run relevant project art, cave, input and performance tests after integration.
2. Inspect the contact sheet **and actual gameplay**, including small enemy scale, bright explosions, wall/rock distinction and at least two contrasting biomes. Inspect village spacing and animated layer alignment. Numerical validation does not certify visual quality.
3. Check new silhouettes in monochrome, then color. If they depend on a tiny detail or label to be identifiable, simplify the shape. Verify palette membership, shape count, finite geometry, deterministic variants and cache bounds.
4. Test in a separate QA origin/tab. Preserve the player's tab and save. Save a screenshot of the reviewed result. Report exactly which families/scenes were changed and any unresolved visual or balance limitations.

The asset script validates the generator; it does not measure enjoyment, guarantee balance, or replace visual review. Do not add resource sinks for essences: they remain reserved for future mechanics.
