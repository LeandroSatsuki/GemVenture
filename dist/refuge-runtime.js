import {REFUGE_NAVIGATION} from './refuge-scene.js';
import {navigationFromContract} from './geometry-adapter.js';
import {RefugeMovement} from './refuge-movement.js';
const navigation=navigationFromContract(REFUGE_NAVIGATION);
// Geometry is immutable per module revision; all visits reuse the same finite mesh.
if(typeof requestIdleCallback==='function')requestIdleCallback(()=>navigation.prepare(),{timeout:2000});
export function createRefugeController(sampleHop,stride){return new RefugeMovement(navigation,{sampleHop,stride});}
export function canonicalApproach(id){return REFUGE_NAVIGATION.approaches[id]||null;}
