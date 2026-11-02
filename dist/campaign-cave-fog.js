const project=(x,y)=>[50+22*x+2*y,57.5+16*y];
const tileAt=(x,y)=>{const gy=(y-57.5)/16;return {x:(x-50-gy*2)/22,y:gy};};
const quad=(path,a,b,top=-9,bottom=9)=>{path.moveTo(a[0]-12,a[1]+top);path.lineTo(b[0]+11,b[1]+top);path.lineTo(b[0]+13,b[1]+bottom);path.lineTo(a[0]-10,a[1]+bottom);path.closePath();};
export function campaignFog(room,view,previous=null){
 const corners=[];for(const dx of [-view.width/2-30,view.width/2+30])for(const dy of [-view.height/2-40,view.height/2+40])corners.push(tileAt(view.center[0]+dx,view.center[1]+dy));const l=Math.max(0,Math.floor(Math.min(...corners.map(p=>p.x)))-1),r=Math.min(room.cols-1,Math.ceil(Math.max(...corners.map(p=>p.x)))+1),t=Math.max(0,Math.floor(Math.min(...corners.map(p=>p.y)))-1),b=Math.min(room.rows-1,Math.ceil(Math.max(...corners.map(p=>p.y)))+1),key=[l,r,t,b].join(':');
 if(previous?.key===key&&previous.visible===room.visible)return previous;
 const paths=[new Path2D(),new Path2D()];for(let y=t;y<=b;y++){let start=l,kind=-1;for(let x=l;x<=r+1;x++){const i=y*room.cols+x,next=x>r||room.visible[i]?-1:room.explored[i]?1:0;if(next!==kind){if(kind>=0)quad(paths[kind],project(start,y),project(x-1,y));start=x;kind=next;}}}return {key,visible:room.visible,paths};
}
const discoCache=new WeakMap();
export function campaignDiscoGround(room,player){const cy=Math.round((player.y-115)/32),cx=Math.round((player.x-100-cy*4)/44),key=cx+','+cy,old=discoCache.get(room);if(old?.key===key&&old.mask===room.floorMask)return old.path;const path=new Path2D();for(let y=Math.max(1,cy-12);y<=Math.min(room.rows-2,cy+12);y++){let start=-1;for(let x=Math.max(1,cx-12);x<=Math.min(room.cols-2,cx+12)+1;x++){const floor=x<=Math.min(room.cols-2,cx+12)&&room.floorMask[y*room.cols+x];if(floor&&start<0)start=x;if(!floor&&start>=0){quad(path,project(start,y),project(x-1,y),-8,8);start=-1;}}}discoCache.set(room,{key,path,mask:room.floorMask});return path;}
