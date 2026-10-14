import {P} from './palette.js';

// Original GemVenture shapes. The compatibility name is retained so scenes and
// cached animation parts keep their existing anchors. No third-party vectors.
const rect=(x,y,width,height,fill,radius=2,stroke=P.ink)=>({type:'rect',x,y,width,height,fill,radius,stroke});
const path=(d,fill,stroke=null)=>({type:'path',d,fill,stroke});
export const PACK_PARTS=Object.freeze({
 minerBody:Object.freeze([
  rect(9,53,6,9,P.red,2),rect(17,53,6,9,P.red,2),
  rect(7,43,18,13,P.blue,4),
  path('M 20 43 L 25 46 L 25 52 Q 25 56 21 56 L 19 56 Z',P.deepBlue),
  rect(3,44,6,9,P.sand,3),rect(23,44,6,9,P.sand,3),
  rect(6,29,20,18,P.sand,5),
  path('M 22 30 Q 26 31 26 35 L 26 42 Q 26 47 21 47 L 19 47 Q 23 44 23 39 Z',P.ochre),
  rect(11,36,2,4,P.ink,1,null),rect(20,36,2,4,P.ink,1,null)
 ].map(Object.freeze)),
 minerHelmet:Object.freeze([
  rect(4,28,56,17,P.gold,7),
  rect(12,13,40,29,P.yellow,9),
  path('M 43 15 Q 52 18 52 25 L 52 40 L 41 40 Z',P.gold),
  rect(2,39,60,8,P.yellow,3),
  rect(22,24,16,17,P.gold,3),
  rect(26,27,8,10,P.lemon,2,null),
  path('M 42 40 L 60 40 L 60 46 L 42 46 Z',P.gold)
 ].map(Object.freeze))
});
