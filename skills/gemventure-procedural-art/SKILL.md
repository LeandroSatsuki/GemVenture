---
name: gemventure-procedural-art
description: Create, audit and improve GemVenture procedural art, cave rooms, connections, terrain tiles, wall joins, occlusion and biome scenery, plus creature animation and village composition. Use for code-native assets and seeded environments under the active camera and material contracts; raster generation and gameplay balance have separate scopes.
---

# Gemventure procedural art

## Select the active art mode first

- **Diorama / Clareira Mágica / Library migration:** when working in `diorama-library/projects/gemventure-creatures/` or its reviews, read [references/diorama-clearing.md](references/diorama-clearing.md), workspace AGENTS.md, the project's STYLE.md and src/theme.ts. This is native procedural Cosmos64 art with the approved cave camera. The HEPT32, isometric Flow bitmap and legacy coordination rules below do not apply to this mode. Do not modify the source game to review Library art.
- **Source-game runtime or legacy art:** use the runtime instructions below and its current sources. Do not transfer the Diorama palette/camera into the game without an explicit integration request.

These modes preserve different existing contracts; never blend them into a new direction. User decisions and project-specific instructions take precedence. An experiment is not approved because it passed an audit.

## Cave specialization: structure, tiles and immersion

The user's 31 October 2026 direction is **mechanics first**: rhythmic mining,
quick access, movement and game feel determine the cave. Favor substantial,
recognizable rooms and deliberate connections. Do not preserve an existing
generator merely because it already works, or enlarge every room without
checking empty travel, resource access and readable entrances.

Load only the reference matching the work:

- For analysis, room generation, circulation and pace: [cave-structure.md](references/cave-structure.md).
- For walls, floor tiles, inner/outer corners, curves, upper surfaces and actor visibility: [cave-tiles-occlusion.md](references/cave-tiles-occlusion.md).
- For environmental identity, non-interactive decoration and evidence from other games: [cave-biomes-research.md](references/cave-biomes-research.md).

Begin with the real consumer and an identified baseline. Separate walkable
geometry, collision, projected art and visibility. In the source game,
`world.js` currently draws actor-sorted `occludingWallPlan` faces, not the older
variable-height `buildWallPlan` presentation. Consult current code and the dated
updates in `docs/art/refuge-night-v1.md`; the broad legacy HEPT32 instructions
below do not override migrated Cosmos64 cave families.

For a structural baseline, run:

```text
node <skill>/scripts/audit-cave-structure.mjs <checkout> <evidence-directory> 100
```

This executes the actual generator in memory, sampling the first common floor
of every biome and one boss seed per biome. It writes metrics and a logical
map sheet. It measures initial access, not combat, timing, rendering or fun.
For changes covering an entire campaign, also check the other common floors,
legacy layouts and the separate Abismo stream with the project's relevant tests.

Compare the **same seeds** before/after in plan and in the cave camera at actual
game size. A different hash is not proof of a different journey; connected tiles
are not proof of comfortable movement. State observed defects, design hypotheses
and unverified perception separately. Deliver a scoped room/tiles pilot when
requested; research or a skill update alone does not install a new cave.

## Source-game runtime mode

For runtime work, use the user's Gemventure checkout (currently `E:/Genventure/gemventure`). Read its current art modules before making assumptions. This skill preserves the game's art direction; it does not authorize publishing, installing packs, changing the economy, or changing the user's save.

## Current source and scope

The maintained copy is `<checkout>/skills/gemventure-procedural-art/`. When using an installed copy, read the checkout's entrypoint and only the relevant reference there before implementation. Use `docs/TEAM_WORKFLOW.md` for baseline, ownership and delivery. Frozen package copies document their historical baseline.

Procedural palette/shape limits apply to generated geometry. Approved raster families follow `gemventure-image-art` and their specific references; interface symbols follow `gemventure-icon-art`. Do not impose the procedural two-color rule on approved raster bevels or replace approved PNGs with generator output. The village bitmap instructions below describe composition of that approved family, not permission to regenerate it.

## Active companions

For companion changes, read `docs/art/pet-companions-v2.md`. The ten approved companions use their own palettes and existing native atlases. Presentation uses `miner-presentation-8deg-v1`; gameplay uses `gemventure-cave-v1`. Collection previews place the ground pivot on the pedestal surface; do not align by the cropped sprite bottom or add a second pedestal over the scene. Preserve legacy companion IDs, persistent unlock proofs, one equipped companion per run and the distinction between creature attacks and environmental damage.

## Visual contract

### Vila compacta: bíblia visual vigente (25/10/2026)

Para novos tiles, estruturas e props da vila, leia
`E:/Genventure/coordination/village-style-bible-20261025/STYLE-GATE.md` e as seis
imagens originais preservadas ao lado dele. O usuário determinou que qualquer
candidata fora dessa família seja rejeitada antes da composição. O mapa V03
registrado em `E:/Genventure/coordination/VILLAGE-RASTER-BASELINE-20261024.md`
continua a fonte de câmera, relevo e terreno. Conexão matemática de tiles não
substitui o portão visual; o piloto plano de 25/10 foi rejeitado para arte.

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

The crystal-backed hedgehog is a **giant spectator**, roughly four times the miner's width, seated inside a generous hole in the cavern wall and watching the cave like a game board. The human's 14 October 2026 update makes it a special non-lethal pickaxe interaction: an on-beat contact causes a sad curl/paw tuck and bounded crystal growth. It is not an enemy, has no kill reward, and area attacks must not trigger it. See `docs/art/hedgehog-interaction.md` for authoritative behavior. Give this landmark more care than an ordinary creature: defined muzzle, ears, paws and integrated crystal clusters. Use the GitHub cover for identity and the newly approved creature PNGs for rendering style; keep body color constant and vary only crystals across biomes. Animate dance, contact, sadness and recovery with native layers/controlled poses; keep the burrow fixed. Clip its art away from walkable passages and draw it before actors so it cannot hide the miner approaching the burrow.

Construct cave topology before populating it. Validate connected chambers, readable corridors, safe spawn/exit, clear boss arena, resource reachability and bounded replenishment across seeds and biomes. Preserve the separate continuous Abismo flow and legacy saves.

## Delivery gates

1. Run `node <skill>/scripts/audit-assets.mjs <checkout> [output.svg]` to audit seeded assets and optionally export a contact sheet. Run relevant project art, cave, input and performance tests after integration.
2. Inspect the contact sheet **and actual gameplay**, including small enemy scale, bright explosions, wall/rock distinction and at least two contrasting biomes. Inspect village spacing and animated layer alignment. Numerical validation does not certify visual quality.
3. Check new silhouettes in monochrome, then color. If they depend on a tiny detail or label to be identifiable, simplify the shape. Verify palette membership, shape count, finite geometry, deterministic variants and cache bounds.
4. Test in a separate QA origin/tab. Preserve the player's tab and save. Save a screenshot of the reviewed result. Report exactly which families/scenes were changed and any unresolved visual or balance limitations.

The asset script validates the generator; it does not measure enjoyment, guarantee balance, or replace visual review. On 28 October the user removed essence: stars now buy records and relics. Preserve the per-floor best-rating ledger (maximum five per floor); never generate repeatable stars. Old-save compatibility may read the retired field only to migrate its balance once.
