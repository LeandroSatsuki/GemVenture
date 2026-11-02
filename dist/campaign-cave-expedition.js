export const EXPEDITION_SPEC=Object.freeze({version:2,layoutVersion:3,cols:160,rows:108,chunkSize:16,halls:15,sideHalls:3,gridCols:5,gridRows:3,minBurrowDistance:180,chunkCache:64,wallDepthStep:.25,rasterChunkBudgetBytes:67108864,workBudgetMs:2,maxWorkUnits:24});
export const expeditionProject=(x,y)=>[50+22*x+2*y,57.5+16*y];
export const expeditionUnproject=(x,y)=>{const gy=(y-57.5)/16;return {x:(x-50-2*gy)/22,y:gy};};
export function expeditionRng(seed){let n=(seed^0x6d2b79f5)>>>0;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function expeditionDistances(world,start,blocked=null){
 const {cols,rows,floorMask}=world,n=cols*rows,dist=new Int32Array(n).fill(-1),parents=new Int32Array(n).fill(-1),queue=new Int32Array(n),s=start.y*cols+start.x;let end=1;queue[0]=s;dist[s]=0;
 for(let head=0;head<end;head++){const at=queue[head],x=at%cols,y=Math.floor(at/cols);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,next=ny*cols+nx;if(nx<0||ny<0||nx>=cols||ny>=rows||!floorMask[next]||dist[next]>=0||blocked?.has(next))continue;dist[next]=dist[at]+1;parents[next]=at;queue[end++]=next;}}
 return {dist,parents,visited:end};
}
export function expeditionPath(world,from,to,blocked=null){
 const {cols,rows}=world;if(!Number.isInteger(to.x)||!Number.isInteger(to.y)||to.x<0||to.y<0||to.x>=cols||to.y>=rows||!world.floorMask[to.y*cols+to.x])return [];
 const {parents,dist}=expeditionDistances(world,from,blocked),end=to.y*cols+to.x,start=from.y*cols+from.x;if(dist[end]<0)return [];const path=[];for(let at=end;at!==start;at=parents[at])path.push({x:at%cols,y:Math.floor(at/cols)});return path.reverse();
}
export function createExpedition(seed=712,biome=0){
 seed=Number(seed)>>>0;biome=Math.max(0,Math.min(6,biome|0));const {cols,rows,gridCols,gridRows,halls,sideHalls,minBurrowDistance}=EXPEDITION_SPEC,random=expeditionRng(seed^Math.imul(biome+1,65537)),pick=(a,b)=>a+Math.floor(random()*(b-a+1));
 const world={version:2,contract:'expedition-v2',seed,biome,cols,rows,floorMask:new Uint8Array(cols*rows),terrain:new Uint8Array(cols*rows),protected:new Uint8Array(cols*rows),rooms:[],links:[],reserved:new Set()};
 const carve=(x,y,safe=false)=>{if(x<=0||y<=0||x>=cols-1||y>=rows-1)return;const i=y*cols+x;world.floorMask[i]=1;if(safe)world.protected[i]=1;};
 for(let gy=0;gy<gridRows;gy++)for(let gx=0;gx<gridCols;gx++){const form=pick(0,3);world.rooms.push({id:gy*gridCols+gx,kind:'main',form,gx,gy,x:gx*32+16+pick(-2,2),y:gy*36+18+pick(-1,1),rx:form===0?13:form===1?10:12,ry:form===0?9:form===1?12:pick(10,12),cuts:[pick(3,5),pick(3,5),pick(3,8),pick(3,8)],notchSide:form===3?(random()<.5?-1:1):0});}
 for(const room of world.rooms)for(let y=room.y-room.ry;y<=room.y+room.ry;y++)for(let x=room.x-room.rx;x<=room.x+room.rx;x++){const dx=x-room.x,dy=y-room.y,quadrant=(dy<0?0:2)+(dx<0?0:1);if(Math.abs(dx)+Math.abs(dy)<=room.rx+room.ry-room.cuts[quadrant]&&!(room.notchSide&&dx*room.notchSide>4&&dy>2))carve(x,y);}
 // Reserve a deep chamber's north backing before making any links. This
 // keeps the approved north-facing 2.5D burrow inside an internal wall mass.
 const startRoom=world.rooms[0],startPoint={x:startRoom.x-startRoom.rx+3,y:startRoom.y},deepCandidates=world.rooms.filter(r=>r.gy>0&&Math.abs(r.x-startPoint.x)+Math.abs(r.y-r.ry-startPoint.y)>=185),sanctuary=deepCandidates[pick(0,deepCandidates.length-1)],forbidden=new Set([`${sanctuary.id-gridCols}:${sanctuary.id}`]),edgeKey=(a,b)=>`${Math.min(a,b)}:${Math.max(a,b)}`;
 const neighbors=id=>{const r=world.rooms[id],out=[];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const gx=r.gx+dx,gy=r.gy+dy;if(gx>=0&&gy>=0&&gx<gridCols&&gy<gridRows){const to=gy*gridCols+gx;if(!forbidden.has(edgeKey(id,to)))out.push(to);}}return out;};
 const selected=new Set(),seen=new Set([0]),stack=[0];while(stack.length){const at=stack.at(-1),options=neighbors(at).filter(id=>!seen.has(id));if(!options.length){stack.pop();continue;}const to=options[pick(0,options.length-1)];selected.add(edgeKey(at,to));seen.add(to);stack.push(to);}
 if(seen.size!==halls)throw Error('Disconnected hall graph');for(const r of world.rooms)for(const to of neighbors(r.id))if(to>r.id&&!selected.has(edgeKey(r.id,to))&&random()<.28)selected.add(edgeKey(r.id,to));
 function corridor(points,radius=2){
  const stamp=(x,y)=>{for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)carve(x+dx,y+dy,true);};let [x,y]=points[0];stamp(x,y);for(const [tx,ty]of points.slice(1)){while(x!==tx){x+=Math.sign(tx-x);stamp(x,y);}while(y!==ty){y+=Math.sign(ty-y);stamp(x,y);}}
 }
 for(const key of selected){const [ai,bi]=key.split(':').map(Number),a=world.rooms[ai],b=world.rooms[bi];let points;
  if(a.gy===b.gy){const ay=a.y+pick(-3,3),by=b.y+pick(-3,3),middle=Math.floor((a.x+a.rx+b.x-b.rx)/2);points=[[a.x+a.rx-1,ay],[middle,ay],[middle,by],[b.x-b.rx+1,by]];}
  else{const ax=a.x+pick(-3,3),bx=b.x+pick(-3,3),middle=Math.floor((a.y+a.ry+b.y-b.ry)/2);points=[[ax,a.y+a.ry-1],[ax,middle],[bx,middle],[bx,b.y-b.ry+1]];}
  corridor(points);world.links.push({from:ai,to:bi,points});for(const r of [a,b]){const end=r===a?points[0]:points.at(-1);corridor([[r.x,r.y],[end[0],r.y],end],1);}
 }
 const entrance=world.rooms[0];world.spawn={x:entrance.x-entrance.rx+3,y:entrance.y};corridor([[world.spawn.x,world.spawn.y],[entrance.x,entrance.y]],1);
 // Interior north wall: unlike the old preview, never at the map's top edge.
 const frontY=sanctuary.y-sanctuary.ry,h={x:sanctuary.x,y:frontY-1,facing:1,biome,pulseBeat:-1};
 for(let dx=-5;dx<=5;dx++){if(!world.floorMask[(h.y+1)*cols+h.x+dx])throw Error('Burrow front does not fit');for(let dy=0;dy<9;dy++)if(world.floorMask[(h.y-dy)*cols+h.x+dx])throw Error('Burrow backing was pierced');}
 world.hedgehog=h;world.burrowHall=sanctuary.id;for(let dy=-10;dy<=3;dy++)for(let dx=-8;dx<=8;dx++)world.reserved.add((h.y+dy)*cols+h.x+dx);
 const initial=expeditionDistances(world,world.spawn);world.burrowDistance=initial.dist[(h.y+1)*cols+h.x];if(world.burrowDistance<minBurrowDistance)throw Error('Burrow too close to entrance');
 const exitRoom=[...world.rooms].filter(r=>r.id!==sanctuary.id).sort((a,b)=>initial.dist[b.y*cols+b.x]-initial.dist[a.y*cols+a.x])[0];world.exit={x:exitRoom.x,y:exitRoom.y};world.exitHall=exitRoom.id;
 // Side chambers stay optional and initially clear. They are reservations for
 // future content, not new buffs, chests or rewards in this prototype.
 for(let i=0;i<40&&world.rooms.length<halls+sideHalls;i++){
  const candidates=world.rooms.filter(r=>r.kind==='main'&&r.id!==sanctuary.id&&r.gy<gridRows-1),host=candidates[pick(0,candidates.length-1)],x=host.x+(random()<.5?-1:1)*(host.rx-3),y=host.y+host.ry+5,rx=pick(3,4),ry=2;if(y+ry>=rows-1)continue;
  let clear=true;for(let dy=-ry-1;dy<=ry+1;dy++)for(let dx=-rx-1;dx<=rx+1;dx++){const index=(y+dy)*cols+x+dx;if(world.floorMask[index]||world.reserved.has(index))clear=false;}if(!clear)continue;
  const room={id:world.rooms.length,kind:'side',x,y,rx,ry,cut:1,host:host.id};world.rooms.push(room);for(let dy=-ry;dy<=ry;dy++)for(let dx=-rx;dx<=rx;dx++)if(Math.abs(dx)+Math.abs(dy)<=rx+ry-1){carve(x+dx,y+dy,true);world.reserved.add((y+dy)*cols+x+dx);}corridor([[host.x,host.y+host.ry-3],[x,host.y+host.ry-3],[x,y]],1);
 }
 const burrowPath=expeditionPath(world,world.spawn,{x:h.x,y:h.y+1});world.burrowDistance=burrowPath.length;for(const p of burrowPath)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=(p.y+dy)*cols+p.x+dx;if(world.floorMask[i])world.protected[i]=1;}
 for(let dx=-3;dx<=3;dx++)for(let dy=1;dy<=3;dy++){const i=(h.y+dy)*cols+h.x+dx;if(world.floorMask[i]){world.protected[i]=1;world.reserved.add(i);}}
 if(biome)for(const room of world.rooms.filter(r=>r.kind==='main'))for(let k=0;k<3;k++){const cx=room.x+pick(-room.rx+3,room.rx-3),cy=room.y+pick(-room.ry+3,room.ry-3),radius=pick(2,4);for(let y=cy-radius;y<=cy+radius;y++)for(let x=cx-radius;x<=cx+radius;x++)if(world.floorMask[y*cols+x]&&Math.hypot(x-cx,y-cy)<=radius&&Math.abs(x-world.spawn.x)+Math.abs(y-world.spawn.y)>8)world.terrain[y*cols+x]=biome;}
 return world;
}
export function createResourcePlan(world,templates){
 const random=expeditionRng(world.seed^0x7a9b31^world.biome),pick=n=>Math.floor(random()*n),main=world.rooms.filter(r=>r.kind==='main'),occupied=new Set(),byChunk=new Map(),byTile=new Map(),all=[];
 const ordered=[...main].sort((a,b)=>{const ha=((Math.imul(a.id+1,2654435761)^world.seed)>>>0),hb=((Math.imul(b.id+1,2654435761)^world.seed)>>>0);return ha-hb;});
 const source=[...templates.nodes.map(n=>({...n,type:'crystal'})),...templates.rocks.map(n=>({...n,type:'rock'}))];
 for(const [i,native]of source.entries()){
  const room=ordered[i%ordered.length],candidates=[];for(let y=room.y-room.ry+1;y<=room.y+room.ry-1;y++)for(let x=room.x-room.rx+1;x<=room.x+room.rx-1;x++){const index=y*world.cols+x;if(world.floorMask[index]&&!world.protected[index]&&!world.reserved.has(index)&&!occupied.has(index)&&Math.abs(x-world.spawn.x)+Math.abs(y-world.spawn.y)>3)candidates.push({x,y,index});}
  if(!candidates.length)throw Error('No resource position');const p=candidates[pick(candidates.length)],id=`${world.seed}:${world.biome}:${native.type}:${native.id}`,node={...native,id,x:p.x,y:p.y};occupied.add(p.index);all.push(node);byTile.set(p.index,node);const key=Math.floor(p.x/16)+','+Math.floor(p.y/16);if(!byChunk.has(key))byChunk.set(key,[]);byChunk.get(key).push(node);
 }
 return {all,byChunk,byTile,referenceCounts:{rocks:templates.rocks.length,crystals:templates.nodes.length}};
}
export class ResourceLedger{
 constructor(plan){this.plan=plan;this.hp=new Map();this.removed=new Set();}
 listChunk(key){return (this.plan.byChunk.get(key)||[]).filter(n=>!this.removed.has(n.id)).map(n=>({...n,hp:this.hp.get(n.id)??n.hp}));}
 hit(id){const n=this.plan.all.find(n=>n.id===id);if(!n||this.removed.has(id))return {accepted:false};const hp=Math.max(0,(this.hp.get(id)??n.hp)-1);this.hp.set(id,hp);if(!hp)this.removed.add(id);return {accepted:true,hp,removed:!hp};}
 blockedTiles(world){return new Set(this.plan.all.filter(n=>n.type==='rock'&&!this.removed.has(n.id)).map(n=>n.y*world.cols+n.x));}
 snapshot(){return {version:1,hp:[...this.hp].sort((a,b)=>a[0].localeCompare(b[0])),removed:[...this.removed].sort()};}
 restore(state){if(state?.version!==1||!Array.isArray(state.hp)||!Array.isArray(state.removed))throw Error('Invalid inspection ledger');const valid=new Map(this.plan.all.map(n=>[n.id,n]));if(state.removed.some(id=>!valid.has(id))||state.hp.some(([id,hp])=>!valid.has(id)||!Number.isInteger(hp)||hp<0||hp>valid.get(id).hp))throw Error('Invalid inspection resource');const hp=new Map(state.hp),removed=new Set(state.removed);if([...hp].some(([id,value])=>(value===0)!==removed.has(id))||[...removed].some(id=>hp.get(id)!==0))throw Error('Inconsistent inspection depletion');this.hp=hp;this.removed=removed;}
}
export class ExpeditionDiscovery{
 constructor(world){this.world=world;this.explored=new Uint8Array(world.cols*world.rows);this.revision=0;this.foundBurrow=false;}
 reveal(player,radius=5,blocked=new Set()){const w=this.world,cx=Math.round(player.x),cy=Math.round(player.y),reach=Math.ceil(radius*1.4);let changed=false;
  for(let y=Math.max(0,cy-reach);y<=Math.min(w.rows-1,cy+reach);y++)for(let x=Math.max(0,cx-reach);x<=Math.min(w.cols-1,cx+reach);x++){const dx=x-cx,dy=y-cy;if(Math.hypot(dx+dy/11,dy*8/11)>radius)continue;const steps=Math.max(Math.abs(dx),Math.abs(dy));let clear=true;for(let i=1;i<steps;i++){const px=Math.round(cx+dx*i/steps),py=Math.round(cy+dy*i/steps);if(!w.floorMask[py*w.cols+px]||blocked.has(py*w.cols+px)){clear=false;break;}}if(clear&&!this.explored[y*w.cols+x]){this.explored[y*w.cols+x]=1;changed=true;}}
  if(changed)this.revision++;const h=w.hedgehog;for(let dx=-3;dx<=3;dx++)if(this.explored[(h.y+1)*w.cols+h.x+dx])this.foundBurrow=true;return changed;
 }
}
