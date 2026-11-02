import {visible} from './cavern.js';
import {drawRefugeArt} from './refuge-art.js';
import {drawAsset} from './art-kit.js';
export function caveZagEntity(run){const zag=run.room.caveZag;return zag&&visible(run.room,zag)?[{type:'caveZag',x:zag.x,y:zag.y}]:[];}
export function paintCaveZag(c,run,phase,{soft=false}={}){const zag=run.room.caveZag;if(!zag)return;const x=50+22*zag.x+2*zag.y,y=57.5+16*zag.y;c.save();c.translate(x,y);c.rotate(soft?0:Math.sin(phase*Math.PI)*.035);c.scale(1+(soft?0:Math.sin(phase*Math.PI*2)*.012),1);if(!drawRefugeArt(c,'zag',0,0,38,0,true))drawAsset(c,'zag',0,0,38,{seed:1});c.restore();}
