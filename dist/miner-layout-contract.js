// GV-020/021 layout candidate only. No gameplay, DOM, clocks or persistence.
const freeze=value=>{for(const item of Object.values(value))if(item&&typeof item==='object')freeze(item);return Object.freeze(value);};
export const MINER_LAYOUT=freeze({
 revision:3,status:'isolated-layout-contract',
 frame:{x:0,y:0,width:700,height:960},
 field:{x:0,y:0,width:700,height:880},
 cellWindow:{x:63,y:0,width:574,height:880},
 decorative:{x:0,y:762,width:700,height:118},
 visibleRows:{above:5,below:12,maximumCells:126},
 cabin:{x:40,y:762,width:620,height:112},
 cabinFloor:{x:70,y:802,width:560,height:42},
 cabinFront:{x:40,y:844,width:620,height:30},
 chains:[{top:{x:52,y:18},mount:{x:52,y:792},halfWidth:6},{top:{x:648,y:18},mount:{x:648,y:792},halfWidth:6}],
 occupants:[
  {id:'left',feet:{x:210,y:838},art:{x:184,y:768,width:52,height:70},envelope:{x:179,y:762,width:62,height:76}},
  {id:'right',feet:{x:490,y:838},art:{x:464,y:768,width:52,height:70},envelope:{x:459,y:762,width:62,height:76}},
 ],
 drill:{tip:{x:0,y:0},main:{x:-35,y:-64,width:70,height:64},withAttachments:{x:-40,y:-64,width:80,height:64}},
 receiptStrip:{x:0,y:880,width:700,height:80},
 receiptCards:Array.from({length:4},(_,kind)=>({kind,x:18+168.5*kind,y:890,width:158.5,height:60})),
 externalToolbar:{minimumCssHeight:44,outsideFrame:true},
 maximumDpr:2,
});
export function minerPoint(row,col,cameraY){return {x:134+col*72,y:row*58-cameraY+230};}
export function fitMinerStage({width,height,mode='normal'}){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new RangeError('Positive available CSS dimensions required');
 if(!['normal','compact','watch'].includes(mode))throw new RangeError('Unknown miner view mode');
 // Keep the entire original field. If height is insufficient, scroll the dialog
 // body instead of cropping it or shrinking below this width where avoidable.
 const ratio=MINER_LAYOUT.frame.width/MINER_LAYOUT.frame.height;
 const preferred=mode==='compact'?width:Math.min(width,height*ratio);
 const cssWidth=Math.min(700,width,Math.max(Math.min(width,350),preferred));
 const scale=cssWidth/700,cssHeight=MINER_LAYOUT.frame.height*scale;
 return {width:cssWidth,height:cssHeight,scale,scrollY:cssHeight>height+.01,mode};
}
export function minerBackingStore(fit,dpr=1){
 const density=Math.min(MINER_LAYOUT.maximumDpr,Math.max(1,Number.isFinite(dpr)?dpr:1));
 // Whole 35:48 units preserve the 700:960 presentation aspect at fractional CSS sizes.
 const unit=Math.ceil(fit.width*density/35),width=unit*35,height=unit*48;
 return {width,height,scale:width/700,offsetX:0,offsetY:0,density};
}
export function minerReceiptTarget(kind,{canvasRect,visibleRect}={}){
 if(!Number.isInteger(kind)||kind<0||kind>3)throw new RangeError('Crystal kind must be 0..3');
 const card=MINER_LAYOUT.receiptCards[kind],x=card.x+card.width/2,y=card.y+card.height/2;
 if(!canvasRect)return {kind,x,y,visible:false,reason:'frame-not-measured'};
 const r=canvasRect,sx=r.width/700,sy=r.height/MINER_LAYOUT.frame.height;
 if(!Number.isFinite(sx)||!Number.isFinite(sy)||sx<=0||sy<=0||Math.abs(sx-sy)>.0001)return {kind,x,y,visible:false,reason:'non-uniform-or-empty-frame'};
 const client={x:r.left+x*sx,y:r.top+y*sy};
 const bounds={left:r.left+card.x*sx,top:r.top+card.y*sy,right:r.left+(card.x+card.width)*sx,bottom:r.top+(card.y+card.height)*sy};
 const visible=Boolean(visibleRect&&bounds.left>=visibleRect.left-1&&bounds.top>=visibleRect.top-1&&bounds.right<=visibleRect.right+1&&bounds.bottom<=visibleRect.bottom+1);
 return {kind,x,y,client,bounds,visible,reason:visible?'visible':'outside-visible-clip'};
}
