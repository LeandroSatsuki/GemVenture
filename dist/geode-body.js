// Stable ground envelope for the approved body in all three frontal poses.
// Keep the central body solid; clear its four outer corners for flanking.
export const GEODE_BODY=Object.freeze({halfSize:1,reach:2});
export const geodeBodyContains=(b,x,y)=>Math.abs(b.x-x)+Math.abs(b.y-y)<=GEODE_BODY.halfSize;
