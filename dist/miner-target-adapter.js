// Pure adapter. UI owns the layout and visibility calculation; no DOM or fixed destinations.
export function collectionTargetFromUi(target,{canvasRect,logicalWidth,logicalHeight,label=null}={}){
 if(!target?.visible||!canvasRect||![target.x,target.y,canvasRect.width,canvasRect.height,logicalWidth,logicalHeight].every(Number.isFinite)||[canvasRect.width,canvasRect.height,logicalWidth,logicalHeight].some(n=>n<=0))return null;
 const sx=canvasRect.width/logicalWidth,sy=canvasRect.height/logicalHeight;if(Math.abs(sx-sy)>.0001)return null;
 const b=target.bounds;if(!b||![b.left,b.right,b.top,b.bottom].every(Number.isFinite)||b.right<=b.left||b.bottom<=b.top)return null;
 const width=(b.right-b.left)/sx,height=(b.bottom-b.top)/sy;
 return {x:target.x,y:target.y,width,height,visible:true,labelX:Number.isFinite(label?.x)?label.x:target.x,labelY:Number.isFinite(label?.y)?label.y:target.y+height/2-3,labelAlign:label?.align||'center'};
}
