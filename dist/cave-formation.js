// Independent Three.js formation; existing Canvas, palette and anchors stay intact.
// Prepare ONCE outside RAF, draw the cached transparent raster, dispose on unload.
import * as THREE from './cave-formation/three.module.js';
import {P} from './palette.js';
import {createCaveCanvasAsset} from './cave-formation/cave-canvas-adapter.js';
import {createCaveFormation,buildCavePlan,createCaveCamera,addCaveLighting} from './cave-formation/cave-geometry.js';
export {buildCavePlan,CAVE_DEFAULTS,AUTHORING_VIEW} from './cave-formation/cave-geometry.js';
export function createCaveAsset(options={}){return createCaveCanvasAsset(THREE,{...options,palette:P});}
export function createCaveGeometry(options={}){return createCaveFormation(THREE,{...options,palette:P});}
export function createCavePreview({plan=buildCavePlan(),camera={},...options}={}){
 const scene=new THREE.Scene(),formation=createCaveGeometry({...options,plan});scene.add(formation);addCaveLighting(THREE,scene);
 return {scene,formation,camera:createCaveCamera(THREE,camera),dispose:()=>formation.userData.dispose()};
}
