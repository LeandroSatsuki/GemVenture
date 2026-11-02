import {createRefugeNavigation} from './refuge-navigation.js';
// Scenic-only preview: the approved player controller and geometry remain untouched.
const point=p=>({x:p[0],y:p[1]}),length=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),round=n=>Number(n.toFixed(8));
export function buildRefugeRoadPlan({boundary,error,solids,stations,project,unproject,hub={x:520,y:378}}){
 const nav=createRefugeNavigation({surface:{boundary:boundary.map(point),error},obstacles:solids.map((p,i)=>({id:String(i),points:p.map(point)})),radius:11.5,spacing:12});
 const targets=[{id:'statue',name:'ESTÁTUA',approach:hub},...stations.map(s=>({id:s.id,name:s.name,approach:s.approach}))].map(t=>{const uv=unproject(t.approach.x,t.approach.y);if(!nav.safe(t.approach))throw Error('Unsafe scenic endpoint '+t.id);return {...t,u:round(uv[0]),v:round(uv[1])};});
 const us=[...new Set([...Array.from({length:24},(_,i)=>i+.5),...targets.map(t=>t.u)])].sort((a,b)=>a-b),vs=[...new Set([...Array.from({length:24},(_,i)=>i+.5),...targets.map(t=>t.v)])].sort((a,b)=>a-b),nodes=[],byKey=new Map();
 for(let j=0;j<vs.length;j++)for(let i=0;i<us.length;i++){const xy=project(us[i],vs[j]),p={x:xy[0],y:xy[1]};if(nav.safe(p)){byKey.set(i+','+j,nodes.length);nodes.push({...p,u:us[i],v:vs[j],i,j,links:[]});}}
 if(nodes.length>1800)throw Error('Scenic graph exceeds budget');
 for(let id=0;id<nodes.length;id++){const n=nodes[id];for(const [di,dj]of [[1,0],[0,1]]){const next=byKey.get((n.i+di)+','+(n.j+dj));if(next!==undefined&&nav.segment(n,nodes[next])){const cost=length(n,nodes[next]);n.links.push({id:next,cost});nodes[next].links.push({id,cost});}}}
 for(const t of targets){t.node=byKey.get(us.indexOf(t.u)+','+vs.indexOf(t.v));if(t.node===undefined)throw Error('Missing scenic target '+t.id);}
 const connected=new Set([targets[0].node]),remaining=new Set(targets.slice(1).map(t=>t.node)),usedEdges=new Map(),edgeKey=(a,b)=>a<b?a+':'+b:b+':'+a;
 // A tree grown towards the closest unconnected destination: no arbitrary decorative spurs.
 while(remaining.size){
  const dist=new Float64Array(nodes.length).fill(Infinity),parent=new Int32Array(nodes.length).fill(-1),done=new Uint8Array(nodes.length);for(const id of connected)dist[id]=0;let reached=-1;
  for(let step=0;step<nodes.length;step++){let best=-1,cost=Infinity;for(let i=0;i<nodes.length;i++)if(!done[i]&&dist[i]<cost){cost=dist[i];best=i;}if(best<0)break;if(remaining.has(best)){reached=best;break;}done[best]=1;for(const e of nodes[best].links)if(cost+e.cost+1e-8<dist[e.id]){dist[e.id]=cost+e.cost;parent[e.id]=best;}}
  if(reached<0)throw Error('Disconnected scenic route');
  for(let id=reached;id>=0&&!connected.has(id);){const previous=parent[id];if(previous<0)throw Error('Scenic route lacks a connected parent');usedEdges.set(edgeKey(id,previous),[id,previous]);connected.add(id);id=previous;}
  for(const id of [...remaining])if(connected.has(id))remaining.delete(id);
 }
 const graph=new Map();for(const [a,b]of usedEdges.values()){if(!graph.has(a))graph.set(a,[]);if(!graph.has(b))graph.set(b,[]);graph.get(a).push(b);graph.get(b).push(a);}
 const endpoints=new Set(targets.map(t=>t.node)),anchors=[...graph].filter(([id,links])=>links.length!==2||endpoints.has(id)).map(([id])=>id),seenEdges=new Set(),chains=[];
 for(const anchor of anchors)for(const next of graph.get(anchor)){if(seenEdges.has(edgeKey(anchor,next)))continue;const chain=[anchor];let before=anchor,current=next;seenEdges.add(edgeKey(before,current));
  while(true){chain.push(current);if(anchors.includes(current))break;const following=graph.get(current).find(id=>id!==before);before=current;current=following;seenEdges.add(edgeKey(before,current));}
  const simple=[];for(const id of chain){const p=nodes[id];while(simple.length>1){const a=simple.at(-2),b=simple.at(-1);if(a.u===b.u&&b.u===p.u||a.v===b.v&&b.v===p.v)simple.pop();else break;}simple.push(p);}chains.push(simple);
 }
 const stones=[];
 function add(p){
  const w=18+((stones.length*7)%5),h=w*.5;
  if(stones.some(s=>Math.abs(s.x-p.x)/((s.width+w)/2+1.5)+Math.abs(s.y-p.y)/((s.width+w)/4+1.5)<1))return;
  const corners=[[p.x-w/2,p.y],[p.x,p.y-h/2],[p.x+w/2,p.y],[p.x,p.y+h/2]],bevel=stones.length%3===0?.12:.2,outline=[];
  for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];outline.push([a[0]+(b[0]-a[0])*bevel,a[1]+(b[1]-a[1])*bevel],[b[0]+(a[0]-b[0])*bevel,b[1]+(a[1]-b[1])*bevel]);}
  stones.push({x:p.x,y:p.y,width:w,outline});
 }
 for(const t of targets)add(t.approach);for(const a of anchors)add(nodes[a]);
 for(const chain of chains){const total=chain.slice(1).reduce((sum,p,i)=>sum+length(chain[i],p),0),count=Math.max(1,Math.round(total/24));
  for(let k=1;k<count;k++){let left=total*k/count;for(let i=1;i<chain.length;i++){const a=chain[i-1],b=chain[i],d=length(a,b);if(left<=d||i===chain.length-1){const t=left/d;add({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});break;}left-=d;}}
 }
 const leaves=[...graph].filter(([,links])=>links.length===1).map(([id])=>id);if(leaves.some(id=>!endpoints.has(id)))throw Error('Scenic route with no destination');
 for(const t of targets)if(!stones.some(s=>length(s,t.approach)<.001))throw Error('A destination lacks its terminal stone '+t.id);
 return Object.freeze({tiles:Object.freeze(stones.map(s=>Object.freeze({...s,outline:Object.freeze(s.outline.map(Object.freeze))}))),targets:Object.freeze(targets.map(Object.freeze)),chains:Object.freeze(chains.map(c=>Object.freeze(c.map(p=>Object.freeze({x:p.x,y:p.y,u:p.u,v:p.v}))))),edges:usedEdges.size,nodes:nodes.length,leaves:leaves.length,scenicOnly:true});
}

