import {petArtSpec,petArtId} from './pet-art-catalog.js';
const images=new Map();
function imageFor(url){
 if(typeof Image==='undefined')return null;
 let im=images.get(url);if(!im){im=new Image();im.decoding='async';im.src=url;images.set(url,im);}
 return im.complete&&im.naturalWidth?im:null;
}
export function petIdlePose(id,time=0,reduced=false){
 if(reduced)return {clip:'pose',frame:0};
 const key=petArtId(id),seed=[...String(key)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,41001);
 const clock=Math.max(0,Number.isFinite(time)?time:0),cycle=Math.floor(clock/4),phase=(clock%4)/4;
 // Clips share their boundary pose. Irregular quiet/gesture cycles require no timer history.
 const pick=(Math.imul((cycle+1)^seed,1664525)+1013904223)>>>0;
 return {clip:pick%3===0?'idle-alt':'idle',frame:Math.min(47,Math.floor(phase*48))};
}
export function petSourceRect(id,view='presentation',clip='pose',frame=0,direction='S'){
 const rig=petArtSpec(id)?.views[view],motion=rig?.clips[clip];if(!rig||!motion)return null;
 const [w,h]=rig.frame,index=Math.max(0,Math.min(motion.frames-1,Math.floor(frame)||0)),row=Math.max(0,rig.directions.indexOf(direction)),rows=Math.ceil(motion.frames/motion.columns);
 return {rig,motion,x:(index%motion.columns)*w,y:(row*rows+Math.floor(index/motion.columns))*h,width:w,height:h};
}
export function drawPetArt(c,id,x,y,worldScale,{view='presentation',time=0,reduced=false,direction='S',action=null}={}){
 const pose=action?{clip:action,frame:Math.floor(Math.max(0,time)%4/4*48)}:petIdlePose(id,time,reduced);
 let source=petSourceRect(id,view,pose.clip,pose.frame,direction);if(!source)return false;
 let im=imageFor(source.motion.url);
 if(!im){source=petSourceRect(id,view,'pose',0,direction);im=source&&imageFor(source.motion.url);}
 if(!source||!im)return false;
 const k=worldScale/source.rig.sourceScale,[gx,gy]=source.rig.ground;
 c.save();c.imageSmoothingEnabled=true;c.drawImage(im,source.x,source.y,source.width,source.height,x-gx*k,y-gy*k,source.width*k,source.height*k);c.restore();return true;
}
export function preloadPetPortraits(){for(const id of ['pingo','pipisco','cascalhito','fagulhito','bolota','garim','nimbo','trufa','mizu','cadencio']){const spec=petArtSpec(id);imageFor(spec.views.presentation.clips.pose.url);}}
const controllers=new WeakMap();
// Fit the ground pivot, not the bottommost nontransparent pixel of a gesture.
export function petPortraitFit(rig,w,h,groundY=null){
 const [fw,fh]=rig.frame,[gx,gy]=rig.ground;
 if(groundY===null)groundY=h-(fh-gy)*Math.min(w/fw,h/fh);
 const k=Math.max(0,Math.min(w/2/Math.max(gx,fw-gx,1),groundY/Math.max(1,gy),fh>gy?(h-groundY)/(fh-gy):Infinity));
 return {k,x:w/2,y:groundY,left:w/2-gx*k,top:groundY-gy*k,width:fw*k,height:fh*k};
}
export function bindPetPreviews(root){
 controllers.get(root)?.();const nodes=[...root.querySelectorAll('[data-pet-preview]')];if(!nodes.length||typeof requestAnimationFrame!=='function')return ()=>{};
 let stopped=false,request=0,time=0,last=performance.now();const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const records=nodes.map(node=>({node,canvas:node.querySelector('canvas'),frame:'',size:''}));
 const onVisibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',onVisibility);
 const stop=()=>{stopped=true;cancelAnimationFrame(request);document.removeEventListener('visibilitychange',onVisibility);};controllers.set(root,stop);
 function tick(now){
  if(stopped||!root.isConnected||records.every(({node})=>!node.isConnected)||root.closest('dialog')&&!root.closest('dialog').open){stop();return;}
  const hidden=document.hidden,reduced=preference.matches||document.body.classList.contains('soft-fx');
  if(!hidden&&!reduced)time+=Math.max(0,Math.min(.1,(now-last)/1000));last=now;
  for(const record of records){
   const {node,canvas}=record;if(!canvas||node.closest('[hidden]')||hidden)continue;
   const box=node.getBoundingClientRect(),w=Math.round(box.width),h=Math.round(box.height);if(!w||!h)continue;
   const id=node.dataset.petPreview,pose=petIdlePose(id,time,reduced),key=pose.clip+':'+pose.frame,size=w+':'+h;
   if(record.frame===key&&record.size===size&&node.dataset.ready==='true')continue;
   const rig=petArtSpec(id)?.views.presentation;if(!rig)continue;
   const dpr=Math.min(2,devicePixelRatio||1);if(record.size!==size){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);record.size=size;}
   const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
   const pedestal=node.closest('.gv-pets__card-stage,.gv-pets__detail-stage')?.querySelector('.gv-pets__pedestal'),base=pedestal?.getBoundingClientRect();
   let ground=base?base.top+base.height*.28-box.top:null;
   const scene=node.closest('.gv-pets__scene'),surface=node.closest('[data-pet-surface-y]'),image=scene?.querySelector('.gv-pets__scene-image');
   if(!base&&surface&&image){const r=image.getBoundingClientRect(),ih=image.naturalHeight||660,iw=image.naturalWidth||768,scale=Math.min(r.width/iw,r.height/ih);ground=r.top+(r.height-ih*scale)/2+ih*scale*Number(surface.dataset.petSurfaceY)-box.top;}
   const fit=petPortraitFit(rig,w,h,ground);
   const fallback=node.querySelector('img');if(fallback)Object.assign(fallback.style,{inset:'auto',left:fit.left+'px',top:fit.top+'px',width:fit.width+'px',height:fit.height+'px'});
   node.dataset.petGround=String(ground);
   const ok=drawPetArt(c,id,fit.x,fit.y,fit.k*rig.sourceScale,{time,reduced});
   if(ok){node.dataset.ready='true';record.frame=key;}
  }
  request=requestAnimationFrame(tick);
 }
 request=requestAnimationFrame(tick);return stop;
}
