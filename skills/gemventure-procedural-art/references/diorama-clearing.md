# Diorama — Clareira Mágica

Use this mode only for the procedural Diorama/Library migration. It updates the
existing skill; it is not a new art direction or authorization to install assets
in the source game.

## Authority and discovery — required

Find the active `diorama-library/projects/gemventure-creatures/` in the workspace.
Read workspace AGENTS.md, that project's STYLE.md, `src/theme.ts`,
`src/projection.ts`, Library `tiles.json` and `libraries/README.md`.
Use the latest implementation and user decisions, rather than the browser URL's
revision number or a frozen output package. Record baseline sources and an image
before changes. Distinguish approval of a shape, animation, light or perspective
from approval of an entire later candidate.

The source game under E:/Genventure is read-only during Library art work.
Preserve catalog IDs, reviews, trash, tiles, generated manifests and previous media.
Keep directions/animation/variants within the same card where appropriate.

## Invariants — required

- Cosmos64 source palette and cave projection: column(44,0), row(4,32),
  height(0,-1). Never import the historical surface/isometric camera or HEPT32
  into this mode. References guide shape/material; do not paste them as models.
- The existing chunky voxel/geometry language, apparent block size, silhouettes,
  proportions and local bevel rules remain the baseline. No global bevel,
  generic low-poly redesign, photographic textures or extra polygons for noise.
- Stage/Frame3 native solids and decals → Canvas2D → PNG/atlas. This project has
  no PBR roughness shader, SSAO or real-time shadow-map pipeline to tune.
  Do not invent shader settings as substitutes for composition or geometry.
- Shared camera and key light remain in theme. At revision20:145°/52°,
  ambient0.20. Preserve current shadow/contact rules unless a specific defect
  justifies a local correction. Review STYLE.md for later changes.
- Directional glints belong to real lit bevels/facets, clipped to their host;
  no global white outline, halo or bloom covering bad joins. Keep external
  contours distinct from internal seams; connected floor interiors stay borderless.

## Composition and circulation — required outcomes, contextual means

Keep the altar/character and functional stations readable. Preserve negative
space around the central platform and every stair/gate approach. Existing paths
are hints of free circulation, not a requirement to pave every link.

Place small, coherent groups near station approaches, margins and transitions.
Do not spread stones or foliage uniformly, fill an empty patch without a purpose,
or increase decoration counts just to suggest progress. Check actual footprints
and projected silhouettes, including how height changes occlusion.

`src/base/composition.ts` is the shared source for current approach guides,
seeded stone details and selective crown profiles. `layout.ts` holds topology,
stations, stairs, roots and protected spaces. Treat current counts/coordinates as
baseline data, not universal artistic laws. Approach guides are authoring data,
not proof of runtime collision/navigation integration.

## Color and visual planes

Preserve each source material family. Green frames nature; cyan/blue often marks
water/magic; pink/violet supports fantastic foliage; warm accents identify fire
and timber; gray supports mineral structures. These are composition cues, not
permission to recolor assets automatically. Prefer spacing and grouping before
changing a ramp or reducing saturation.

Visual importance and physical depth are different from painter bands. Measure
depth through the cave camera from the ground anchor, not screen Y or layer IDs.
Focus stations and emitters do not fade merely because they are farther away.
The current distant-woodland treatment is scoped in `depth.ts`/`BASE_DEPTH`:
tonal compression and a small shadow-blue glaze. It is not global blur/fog.
Do not intensify it without a comparison or add fog by default in this short scene.

## Vegetation and deterministic variety

Preserve existing species/colors, roots, lamps and silhouettes. Use a few bounded
crown families where repetition is visible; do not randomly perturb every vertex,
rotate each leaf or assign an unrelated palette per block. Keep the default
classic generator stable for approved standalone props and unaffected instances.

Selective compact/broad/stepped crowns are current tested candidates, not a
requirement to vary every tree. Respect their support, foliage gaps, view cones,
walkable perimeter and station visibility. Do not move roots merely to fix drawing
order. When moving an instance intentionally, preserve its original detail/mote seed.
Same seed/parameters must repeat. Separate variation of detail from topology;
do not claim a new map generator from a fixed-topology variation study.

## Geometry, shore and materials

Fix a real join in geometry/placement before adding shadows, outlines or effects.
Keep terrain thickness differences that correspond to actual height levels;
stairs must meet their intended elevations. Preserve existing cap/core overlap
that closes edges. Never mutate a reused Shape with a transform; clone it first.

Shore details form uneven pockets at land/water transitions, leaving quiet water
and gaps; avoid a necklace of equal stones. Keep water clipped to its basin/shore,
falls landing inside it and continuous bends free of disconnected bars/tubes.
Preserve water and animal timing when polishing only their surfaces.

Wood rails use shared endpoint/post coordinates, stand upright in world space,
and penetrate their supports. An intended gate is explicit in the connectivity
graph. Do not extrude a ring with a helper that discards holes. Keep openings real.
Material variation is per coherent group, with source ramps in theme; no scattered
noise, false realism or incidental surface patches that look like floating plates.

## Character, environment and validation

Check the approved miner at native scale near each approach, not only enlarged
props. Use review controls/ground checkpoints without altering the protagonist's
size, outline, animation or outfit to compensate for scenery. Authoring previews
do not certify runtime gameplay or collisions.

Preserve current asynchronous ambient cycles and pause/hidden/reduced-motion
behavior. Do not add tree sway, effects or particles simply because infrastructure
exists. The squirrel's atlas stays resident; first/last frames match its rest layer.

For each meaningful increment: native check/export/inspect, color and grayscale,
same-camera before/after, root/host/connection audits and in-context preview.
Test several seeds and repeat the first, checking composition, free approaches,
station visibility, alpha bounds and repeatability. Existing shadow masks should
be cached for the correct scene/seed, not recomputed every animation frame.
Measure relevant export/texture costs; do not claim FPS or gameplay unless tested.

Update the existing STYLE.md and review/CHANGELOG.md with implemented changes,
evidence, rejected trials and actual limits. Keep untested suggestions separate
from verified rules, and user approval separate from technical validation.
