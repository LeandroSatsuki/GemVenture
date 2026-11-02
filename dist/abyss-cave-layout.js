// Approved continuous architecture. Absolute rows make
// previously discovered ground stable when the 42x30 simulation window rebases.
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>13,0x85ebca6b);return((n^n>>>16)>>>0)/4294967296;};
export function abyssBounds(seed,absoluteRow,cols=42){
 const segment=Math.floor(absoluteRow/60),phase=((absoluteRow%60)+60)%60,h=hash(seed+segment*977),center=20+Math.round((h-.5)*4),neck=11+(h>.5?1:0),wide=16+Math.floor(hash(seed+segment*977+31)*3);
 const swell=Math.pow(Math.max(0,Math.sin(Math.PI*phase/60)),.75),radius=Math.round(neck+(wide-neck)*swell);
 let left=Math.min(8,Math.max(2,center-radius)),right=Math.max(33,Math.min(cols-3,center+radius));
 const slot=Math.floor((absoluteRow+8-12)/72),hole=12+Math.max(0,slot)*72,side=Math.max(0,slot)%2;
 if(absoluteRow>=hole-8&&absoluteRow<=hole){if(side===0){left=Math.max(left,14);right=Math.max(right,38);}else{right=Math.min(right,27);left=Math.min(left,3);}}
 if(absoluteRow>=hole+1&&absoluteRow<=hole+4){if(side===0)left=3;else right=38;}
 return {left,right,segment};
}
function burrow(room,depth,biome=0){
 const first=Math.max(0,Math.ceil((depth+1-12)/72)),absolute=12+first*72,y=absolute-depth;
 if(y>room.rows-3){room.hedgehog={x:0,y:0,facing:1,biome,pulseBeat:room.hedgehog?.pulseBeat??-1};return;}
 room.hedgehog={x:first%2?33:8,y,facing:1,biome,pulseBeat:room.hedgehog?.pulseBeat??-1};
}
function row(room,y,absolute){const {left,right}=abyssBounds(room.seed,absolute,room.cols);for(let x=1;x<room.cols-1;x++)room.floorMask[y*room.cols+x]=+(x>=left&&x<=right);}
export function createAbyssCaveLayout(room){
 room.floorMask=Array(room.cols*room.rows).fill(0);for(let y=1;y<room.rows-1;y++)row(room,y,y);
 room.abyssCave={version:1};room.layout={version:1,style:'ABISMO',rooms:[],protectedTiles:[]};burrow(room,0);return room.layout;
}
export function shiftAbyssCaveLayout(room,depth,player){
 const {cols,rows}=room;room.floorMask=room.floorMask.slice(cols).concat(Array(cols).fill(0));room.floorMask.fill(0,0,cols);row(room,rows-2,depth+1+rows-2);
 // Connected overlapping strips already retain the escape lane. Repair only
 // an invalid player cell; stamping a whole row would cut through the burrow.
 if(player.x>0&&player.x<cols-1&&player.y>0&&player.y<rows-1&&!room.floorMask[player.y*cols+player.x])for(let x=Math.min(player.x,20);x<=Math.max(player.x,20);x++)room.floorMask[player.y*cols+x]=1;
 burrow(room,depth+1,room.hedgehog?.biome||0);
}

export const isAbyssCave=room=>room?.abyssCave?.version===1&&room.cols===42&&room.rows===30&&room.layout?.style==='ABISMO';
export const validAbyssCave=room=>room.abyssCave===undefined||!!(room.abyssCave&&isAbyssCave(room)&&room.bossFloor!==true&&!room.campaignCave);
