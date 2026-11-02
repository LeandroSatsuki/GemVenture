export const WING_SPEC=Object.freeze({width:42,height:44,pivot:Object.freeze([5,34]),
  shoulderX:5,shoulderY:-18,liftWorld:14,periodBeats:2,maxAngle:.115,
  cacheCount:1,shapeCount:5,entrySeconds:.12,status:'final-isolated-review-human-acceptance-pending'});
// Conservative painted extent including stroke, entrance and steady motion.
export const WING_ENVELOPE=Object.freeze({left:-44,top:-49,right:44,bottom:1});

export function wingPoseAtBody({active,bodyWorld,visualBeat=0,reduced=false,appearance=1}){
  if(!active)return null;
  const open=reduced?1:Math.max(0,Math.min(1,appearance));
  const wave=reduced?0:Math.sin(visualBeat*Math.PI);
  return {x:bodyWorld.x/2,y:bodyWorld.y/2,
    angle:wave*WING_SPEC.maxAngle-(1-open)*.32,
    projection:reduced?1:.93+.07*Math.cos(visualBeat*Math.PI),alpha:open};
}

export function paintWingsBehind(ctx,cache,pose){
  if(!pose||pose.alpha<=0)return;
  ctx.save();ctx.globalAlpha*=pose.alpha;
  for(const side of [-1,1]){
    ctx.save();ctx.translate(pose.x+side*WING_SPEC.shoulderX,pose.y+WING_SPEC.shoulderY);
    ctx.scale(side*pose.projection,1);ctx.rotate(pose.angle);
    ctx.drawImage(cache,-WING_SPEC.pivot[0],-WING_SPEC.pivot[1],WING_SPEC.width,WING_SPEC.height);
    ctx.restore();
  }
  ctx.restore();
}

function browserWingImage(){return new Promise((resolve,reject)=>{if(typeof Image==='undefined'){reject(Error('Image unavailable'));return;}const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Wing decode failed'));im.src='assets/vfx/gv043-wing-layer.png';});}
export function createCrystalWingCache({loadImage=browserWingImage}={}){let image=null,pending=null,failed=false,loads=0;const status=()=>({ready:!!image&&image.width===126&&image.height===132&&image.complete!==false,failed,pending:!!pending,loads,pixels:image?image.width*image.height:0});return Object.freeze({status,image:()=>status().ready?image:null,load({retry=false}={}){if(pending)return pending;if(status().ready||failed&&!retry)return Promise.resolve(status());failed=false;loads++;pending=Promise.resolve().then(loadImage).then(im=>{if(im.width!==126||im.height!==132||im.complete===false)throw Error('Wing registration changed');image=im;},()=>{image=null;failed=true;}).catch(()=>{image=null;failed=true;}).finally(()=>{pending=null;});return pending.then(status);}});}
export const crystalWingCache=createCrystalWingCache();
