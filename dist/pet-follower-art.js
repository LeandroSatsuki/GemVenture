import {drawPetArt,petIdlePose} from './pet-art-runtime.js';
import {petArtSpec} from './pet-art-catalog.js';
export const PET_VISUAL_SIZE=Object.freeze({'slime-friend':16,'bat-friend':24,pingo:16,pipisco:24,cascalhito:19,fagulhito:17,bolota:18,garim:18,nimbo:18,trufa:18,mizu:18,cadencio:19});
export function paintPetFollower(c,pose){
 if(!pose||pose.alpha<=0||!petArtSpec(pose.id))return false;
 c.save();c.translate(pose.x/2,pose.y/2);c.globalAlpha*=pose.alpha;
 c.save();c.globalAlpha*=.2;c.fillStyle='#183454';c.beginPath();c.ellipse(0,1,5.5,1.7,0,0,Math.PI*2);c.fill();c.restore();
 const motion=petIdlePose(pose.id,pose.age||0,!!pose.reduced);
 const hop=pose.moving&&!pose.reduced&&motion.clip==='idle'?(pose.hop||0):0;
 const ok=drawPetArt(c,pose.id,0,-hop,.5,{view:'cave',time:pose.age||0,reduced:!!pose.reduced,direction:pose.direction||'S'});c.restore();return ok;
}
