// Drawing contract only: caller owns loading, cache, clock, pause and sampler.
export const LIFT_LAYER_FRAME=Object.freeze({width:1263,height:1246,visibleWidth:683,ground:[657.5,1109],nominalWidth:105,maxLocalTravel:4.5});
export const LIFT_ROPE=Object.freeze({sourceRect:[582,337,34,195],top:[598,337],bottom:[608.5,534.5]});
export function drawLiftLayers(c,layers,{x,y,width=105,dyLocal=0,sourceToCache=1}={}){
 if(![x,y,width,dyLocal,sourceToCache].every(Number.isFinite)||width<=0||sourceToCache<=0)throw Error('Invalid lift registration');
 const scale=width/683,dy=dyLocal/scale;
 if(dy>0.0001||dy<-(4.5*683/105)-.0001)throw Error('Lift offset outside reviewed envelope');
 const paint=(im,offset=0)=>c.drawImage(im,0,offset,im.width/sourceToCache,im.height/sourceToCache);
 c.save();c.translate(x,y);c.scale(scale,scale);c.translate(-657.5,-1109);
 paint(layers.fixed);paint(layers.cabin,dy);
 const [sx,sy,sw,sh]=LIFT_ROPE.sourceRect,[tx,ty]=LIFT_ROPE.top,[bx,by]=LIFT_ROPE.bottom,height=by+dy-ty;
 c.save();c.translate(tx-sw/2,ty);c.transform(1,0,(bx-tx)/height,1,0,0);
 c.drawImage(layers.rope,sx*sourceToCache,sy*sourceToCache,sw*sourceToCache,sh*sourceToCache,0,0,sw,height);c.restore();
 paint(layers.socket,dy);paint(layers.front);c.restore();
}
