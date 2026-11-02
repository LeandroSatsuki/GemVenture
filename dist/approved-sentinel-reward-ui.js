import {layoutMinibossHud} from './cave-miniboss-hud.js';
// Compatibility adapter: victories now float in the world; this only spaces the live status.
export function createSentinelReward(){let last=-Infinity;return {accept(){return 0;},get pending(){return false;},frame(now,{hudRoot}={}){if(now-last>=250){layoutMinibossHud(hudRoot);last=now;}},dispose(){}};}
