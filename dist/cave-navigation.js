// Derived, bounded navigation data. Never serialized and never changes RNG.
const rooms=new WeakMap(),MAX_FIELDS=4;
function topology(room,obstacles){
 const cols=room.cols||21,rows=room.rows||15,n=cols*rows,mask=room.floorMask;
 let state=rooms.get(room),changed=!state||state.cols!==cols||state.rows!==rows;
 if(changed){state={cols,rows,floor:new Uint8Array(n),blocked:null,fields:new Map(),builds:0,hits:0,revisions:0};rooms.set(room,state);}
 // Compare values as well as identity: callers may edit a mask in place.
 for(let y=0,i=0;y<rows;y++)for(let x=0;x<cols;x++,i++){
  const floor=+(x>0&&y>0&&x<cols-1&&y<rows-1&&(!mask||mask[i]===1));
  if(state.floor[i]!==floor){state.floor[i]=floor;changed=true;}
 }
 const key=obstacles.map(p=>p.y*cols+p.x).join(',');
 if(changed||state.obstacles!==key){
  state.obstacles=key;state.blocked=Uint8Array.from(state.floor,v=>1-v);
  for(const p of obstacles)if(p.x>=0&&p.y>=0&&p.x<cols&&p.y<rows)state.blocked[p.y*cols+p.x]=1;
  state.fields.clear();state.revisions++;
 }
 return state;
}
function field(state,from){
 const {cols,rows,blocked}=state,start=from.y*cols+from.x;
 if(state.fields.has(start)){const f=state.fields.get(start);state.fields.delete(start);state.fields.set(start,f);state.hits++;return f;}
 const n=cols*rows,distances=new Int32Array(n).fill(-1),parents=new Int32Array(n).fill(-1),queue=new Int32Array(n);
 queue[0]=start;distances[start]=0;parents[start]=start;
 const result={distances,parents,queue,start,head:0,end:1};state.fields.set(start,result);state.builds++;
 if(state.fields.size>MAX_FIELDS)state.fields.delete(state.fields.keys().next().value);
 return result;
}
function expand(state,f,target){
 if(f.distances[target]>=0)return;
 const {cols,rows,blocked}=state;
 // A nearby target must not force a traversal of the entire expedition.
 // Resume this same BFS frontier for the next target; tie order is retained.
 while(f.head<f.end&&f.distances[target]<0){
  const at=f.queue[f.head++],x=at%cols,y=Math.floor(at/cols);
  // Preserve the approved right, left, down, up tie order.
  for(const id of [x+1<cols-1?at+1:-1,x>1?at-1:-1,y+1<rows-1?at+cols:-1,y>1?at-cols:-1])if(id>=0&&!blocked[id]&&f.distances[id]===-1){
   f.distances[id]=f.distances[at]+1;f.parents[id]=at;f.queue[f.end++]=id;
  }
 }
}
const inside=(s,p)=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<s.cols&&p.y<s.rows;
function localPath(room,from,to,obstacles){
 const cols=room.cols||21,rows=room.rows||15,blocked=new Set(obstacles.map(p=>p.y*cols+p.x)),start=from.y*cols+from.x,end=to.y*cols+to.x;
 const floor=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0&&x<cols-1&&y<rows-1&&(!room.floorMask||room.floorMask[y*cols+x]===1);
 if(!floor(to.x,to.y)||blocked.has(end))return [];
 const queue=[start],parents=new Map([[start,start]]);let head=0;
 for(;head<queue.length&&head<128;head++){
  const at=queue[head],x=at%cols,y=Math.floor(at/cols);
  if(at===end){const out=[];for(let p=end;p!==start;p=parents.get(p))out.push({x:p%cols,y:Math.floor(p/cols)});return out.reverse();}
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,id=ny*cols+nx;if(floor(nx,ny)&&!parents.has(id)&&!blocked.has(id)){parents.set(id,at);queue.push(id);}}
 }
 return head===queue.length?[]:null;
}
export function navigationPath(room,from,to,obstacles=[]){
 if(from.x===to.x&&from.y===to.y)return [];
 // Keep short mining/movement requests cheap: no full-grid validation or
 // allocation for an adjacent target. A longer maze detour resumes below.
 if(Math.abs(from.x-to.x)+Math.abs(from.y-to.y)<=12){const local=localPath(room,from,to,obstacles);if(local)return local;}
 const s=topology(room,obstacles);if(!inside(s,from)||!inside(s,to)||s.blocked[to.y*s.cols+to.x])return [];
 const f=field(s,from),end=to.y*s.cols+to.x;expand(s,f,end);if(f.distances[end]<0)return [];
 const path=[];for(let at=end;at!==f.start;at=f.parents[at])path.push({x:at%s.cols,y:Math.floor(at/s.cols)});
 return path.reverse();
}
export function navigationConnected(room,from,to,obstacles=[],preferFrom=false){
 if(from.x===to.x&&from.y===to.y)return false;
 const s=topology(room,obstacles);if(!inside(s,from)||!inside(s,to)||s.blocked[to.y*s.cols+to.x])return false;
 // Ordinary spawning only needs connectivity, not a separate path from every
 // candidate. Reverse the flood when both endpoints are free; retain the old
 // ability to leave an obstructed starting tile for exceptional callers.
 const a=from.y*s.cols+from.x,b=to.y*s.cols+to.x;
 const forward=s.blocked[a]||preferFrom,f=field(s,forward?from:to),target=forward?b:a;expand(s,f,target);return f.distances[target]>0;
}
export function navigationPursuit(room,goal,obstacles=[]){
 const s=topology(room,obstacles),f=field(s,goal),{cols,rows}=s;
 return e=>{const at=e.y*cols+e.x;expand(s,f,at);const d=f.distances[at];if(d<=0)return null;
  for(const id of [e.x+1<cols-1?at+1:-1,e.x>1?at-1:-1,e.y+1<rows-1?at+cols:-1,e.y>1?at-cols:-1])if(id>=0&&f.distances[id]===d-1)return{x:id%cols,y:Math.floor(id/cols)};
  return null;
 };
}
export function navigationCacheStatus(room){const s=rooms.get(room);return s?{builds:s.builds,hits:s.hits,revisions:s.revisions,fields:s.fields.size,expanded:[...s.fields.values()].reduce((n,f)=>n+f.head,0),limit:MAX_FIELDS}:{builds:0,hits:0,revisions:0,fields:0,expanded:0,limit:MAX_FIELDS};}
