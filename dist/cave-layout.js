// Build the architecture before placing rewards. Corridors remain three cells wide.
const dims=room=>({cols:room.cols||21,rows:room.rows||15});
export function isFloor(room,x,y){const {cols,rows}=dims(room);return Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0&&x<cols-1&&y<rows-1&&(!room.floorMask||room.floorMask[y*cols+x]===1);}
export const wallAt=(room,x,y)=>!isFloor(room,x,y);
const STYLES=['GALERIAS','LAGOAS','OSSUÁRIO','FENDAS','COLÔNIAS','TOCAS','HORTAS'];
export function createLayout(room,random,biome=0,boss=false){
 const {cols,rows}=dims(room),mask=Array(cols*rows).fill(0),safe=new Set(),rooms=[];
 const carve=(x,y,protect=false)=>{if(x>0&&y>0&&x<cols-1&&y<rows-1){mask[y*cols+x]=1;if(protect)safe.add(y*cols+x);}};
 const chamber=(x,y,rx,ry,round=true)=>{rooms.push({x,y,rx,ry});for(let py=y-ry;py<=y+ry;py++)for(let px=x-rx;px<=x+rx;px++){const dx=Math.abs(px-x)/rx,dy=Math.abs(py-y)/ry;if(round?dx*dx+dy*dy<=1.15:dx+dy<1.75)carve(px,py);}carve(x,y,true);};
 const corridor=(a,b,horizontalFirst)=>{let x=a.x,y=a.y;const stamp=()=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)carve(x+dx,y+dy,true);};stamp();const moveX=()=>{while(x!==b.x){x+=Math.sign(b.x-x);stamp();}};const moveY=()=>{while(y!==b.y){y+=Math.sign(b.y-y);stamp();}};if(horizontalFirst){moveX();moveY();}else{moveY();moveX();}};
 if(boss){for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)carve(x,y,true);rooms.push({x:10,y:7,rx:9,ry:6});}
 else{
  // Jitter whole chambers, never individual vertices: recognisable silhouettes, varied routes.
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const x=[7,21,34][col]+Math.floor(random()*3)-1,y=[5,14,24][row]+Math.floor(random()*3)-1;
   const rx=(biome===3?4:5)+Math.floor(random()*2),ry=(biome===1?4:3)+Math.floor(random()*2);
   chamber(x,y,rx,ry,![2,3].includes(biome));
  }
  // A spanning tree plus extra edges gives both detours and loops, with no sealed rooms.
  for(let i=1;i<rooms.length;i++){const col=i%3,parent=col?i-1:i-3;corridor(rooms[parent],rooms[i],random()<.5);}
  for(const i of [1,2,4,5])if(random()<.72)corridor(rooms[i],rooms[i+3],random()<.5);
  chamber(6,11,5,4,false);corridor({x:3,y:11},rooms[3],true);
  chamber(cols-5,3,4,2,false);corridor(rooms[2],{x:cols-3,y:2},false);
  // Safe entry lane makes the first gestures legible before the branching chambers.
  for(let x=1;x<=11;x++)for(let y=9;y<=13;y++)carve(x,y,true);
 }
 room.floorMask=mask;room.layout={version:1,style:boss?'ARENA':STYLES[biome]||STYLES[0],rooms,protectedTiles:[...safe]};
 return room.layout;
}
export function locateHedgehog(room,biome=0){
 const {cols,rows}=dims(room),candidates=[];
 // A giant silhouette needs a broad wall face with solid backing, not a tiny corner.
 // Include the northern outer wall for old rectangular rooms and open boss arenas.
 for(let y=0;y<rows-1;y++)for(let x=3;x<cols-3;x++)if(wallAt(room,x,y)&&isFloor(room,x,y+1)){
  let span=0,backing=0,front=0;
  for(let dx=-3;dx<=3;dx++){
   if(wallAt(room,x+dx,y))span++;
   if(isFloor(room,x+dx,y+1))front++;
   for(let dy=0;dy<=6;dy++)if(wallAt(room,x+dx,y-dy))backing++;
  }
  // Prefer deep internal recesses when they genuinely fit; broad exterior wall otherwise.
  const spacious=span===7&&front>=5,interior=y>=6&&backing>=35;
  const score=(spacious?2000:0)+span*120+backing*15+front*25+(interior?300:0)-(Math.abs(x-7)+Math.abs(y-7))*.4;
  candidates.push({x,y,score});
 }
 candidates.sort((a,b)=>b.score-a.score||b.y-a.y||a.x-b.x);
 const p=candidates[0]||{x:Math.min(7,cols-3),y:0};
 room.hedgehog={x:p.x,y:p.y,facing:1,biome,pulseBeat:-1};delete room.gardener;return room.hedgehog;
}
export function createAbyssLayout(room){
 const {cols,rows}=dims(room);room.floorMask=Array.from({length:cols*rows},(_,i)=>{const x=i%cols,y=Math.floor(i/cols);return +(x>0&&x<cols-1&&y>0&&y<rows-1);});
 room.layout={version:1,style:'ABISMO',rooms:[],protectedTiles:[]};
 // Scalloped rock walls keep a broad unbroken central lane for continuous scrolling.
 for(let y=1;y<rows-1;y++){const inset=1+Math.floor((Math.sin((y+room.seed%19)*.35)+1)*1.2);for(let x=1;x<=inset;x++){room.floorMask[y*cols+x]=0;room.floorMask[y*cols+cols-1-x]=0;}}
 locateHedgehog(room);return room.layout;
}
export function shiftAbyssLayout(room,depth,player){
 if(!room.floorMask)return;
 const {cols,rows}=dims(room);room.floorMask=room.floorMask.slice(cols).concat(Array(cols).fill(0));
 for(let x=0;x<cols;x++){room.floorMask[x]=0;room.floorMask[(rows-2)*cols+x]=+(x>0&&x<cols-1);}
 const inset=1+Math.floor((Math.sin((depth+rows+room.seed%19)*.35)+1)*1.2);
 for(let x=1;x<=inset;x++){room.floorMask[(rows-2)*cols+x]=0;room.floorMask[(rows-2)*cols+cols-1-x]=0;}
 // A miner in a side alcove always keeps a clear connection when that strip scrolls.
 for(let x=Math.min(player.x,4);x<=Math.max(player.x,cols-5);x++)if(x>0&&x<cols-1&&player.y>0&&player.y<rows-1)room.floorMask[player.y*cols+x]=1;
 if(room.hedgehog){room.hedgehog.y--;if(room.hedgehog.y<2)locateHedgehog(room,room.hedgehog.biome);}
}
export function validateLayout(room){
 if(!room.floorMask)return true;
 const {cols,rows}=dims(room),mask=room.floorMask;
 if(!Array.isArray(mask)||mask.length!==cols*rows||mask.some(v=>v!==0&&v!==1))return false;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if((!x||!y||x===cols-1||y===rows-1)&&mask[y*cols+x])return false;
 const start=mask.indexOf(1);if(start<0)return false;
 const seen=new Uint8Array(mask.length),q=[start];seen[start]=1;
 for(let i=0;i<q.length;i++){const at=q[i];for(const n of [at-1,at+1,at-cols,at+cols])if(mask[n]&&!seen[n]){seen[n]=1;q.push(n);}}
 if(q.length!==mask.reduce((a,b)=>a+b,0))return false;
 const layout=room.layout;
 if(layout!==undefined&&(!layout||layout.version!==1||!Array.isArray(layout.rooms)||layout.rooms.length>12||!Array.isArray(layout.protectedTiles)||layout.protectedTiles.length>mask.length||layout.protectedTiles.some(i=>!Number.isInteger(i)||!mask[i])))return false;
 const h=room.hedgehog;
 if(h!==undefined&&(!h||![h.x,h.y,h.biome,h.pulseBeat].every(Number.isSafeInteger)||h.x<0||h.x>=cols||h.y<0||h.y>=rows||h.biome<0||h.biome>6||h.pulseBeat< -1||![1,-1].includes(h.facing)))return false;
 return true;
}
