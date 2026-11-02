import {approvedTalentNodeGlyph as original,approvedSkillGlyph} from './approved-talent-icons.js';
export {approvedSkillGlyph,approvedSkillSlotGlyph} from './approved-talent-icons.js';
const sectorArt=['refuge-v1/gramophone.png','card-art/muscle-approved-v01.png','hud-v5/blast.png','hud-v5/ward.png','refuge-night-v3/gem-0.png','card-art/sprouts-approved-v01.png'];
export function approvedTalentSectorGlyph(index){return `<img src="assets/${sectorArt[index]||sectorArt[0]}" alt="" aria-hidden="true" draggable="false">`;}
// Reuse the actual approved protection and breath symbols for these new functions.
export function approvedTalentNodeGlyph(node){return node.id==='prism-shelter'?approvedSkillGlyph('guard'):node.id==='breath-encore'?approvedSkillGlyph('breath'):original(node);}

