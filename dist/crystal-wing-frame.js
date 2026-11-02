import {WING_SPEC,wingPoseAtBody} from './crystal-wings.js';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
// Clockless/read-only adapter. activeBoost is injected from the existing game.
export function sampleCrystalWingFrame({run,activeBoost,player,hopWorld=0,bumpWorld={x:0,y:0},
  visualBeat=0,reduced=false,appearanceAgeSeconds=null}){
  if(typeof activeBoost!=='function')throw new TypeError('Use the authoritative activeBoost function');
  if(!player||![player.x,player.y,hopWorld,bumpWorld?.x,bumpWorld?.y,visualBeat].every(finite))throw new TypeError('Finite shared body pose and visual phase required');
  if(appearanceAgeSeconds!==null&&(!finite(appearanceAgeSeconds)||appearanceAgeSeconds<0))throw new RangeError('Appearance age must be a non-negative visual age or null');
  const active=Boolean(activeBoost(run,'wings'));
  const bodyWorld={x:player.x+bumpWorld.x,y:player.y+bumpWorld.y-hopWorld-(active?WING_SPEC.liftWorld:0)};
  const appearance=appearanceAgeSeconds===null?1:Math.min(1,appearanceAgeSeconds/WING_SPEC.entrySeconds);
  return {active,bodyWorld,wings:wingPoseAtBody({active,bodyWorld,visualBeat,reduced,appearance})};
}
