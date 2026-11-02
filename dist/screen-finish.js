// Approved CRT: same screen-space shader, reduced from 0.9 to 0.45 by user request.
// Standard postprocessing primitives; not Eastward's shader or a claim of exact reproduction.
export const FINISH_PRESETS = Object.freeze({
  clear: Object.freeze({softness:0,chroma:0,scanlines:0,vignette:0}),
  normal: Object.freeze({softness:.22,chroma:.38,scanlines:0,vignette:0}),
  crt: Object.freeze({softness:.28,chroma:.55,scanlines:.13,vignette:.035})
});
// User-requested half-strength finish; shared by both GPU and page fallback.
export const APPROVED_CRT=Object.freeze({preset:'crt',strength:.45});
const VERTEX=`attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT=`precision highp float;
uniform sampler2D image; uniform vec2 outputSize; uniform float pixelRatio;
uniform vec4 amount; varying vec2 uv;
vec3 sampleAt(vec2 p){return texture2D(image,clamp(p,vec2(0.),vec2(1.))).rgb;}
void main(){
 vec2 px=vec2(pixelRatio)/outputSize;
 // Small, symmetric reconstruction kernel preserves large uniform palette areas.
 vec3 center=sampleAt(uv);
 vec3 near=(sampleAt(uv+vec2(px.x,0.))+sampleAt(uv-vec2(px.x,0.))
           +sampleAt(uv+vec2(0.,px.y))+sampleAt(uv-vec2(0.,px.y)))*.25;
 vec3 color=mix(center,near,amount.x);
 // Channel separation grows gently toward the edges; no geometry displacement.
 float edge=smoothstep(.10,.75,length(uv-.5));
 vec2 shift=vec2(px.x*amount.y*mix(.22,1.,edge),0.);
 color.r+=sampleAt(uv+shift).r-center.r;
 color.b+=sampleAt(uv-shift).b-center.b;
 // Stationary scanlines in CSS pixels: independent of animation and device scale.
 float line=.5+.5*cos(6.2831853*gl_FragCoord.y/(3.*pixelRatio));
 color*=1.-amount.z*line;
 float vignette=smoothstep(.25,.72,length(uv-.5));
 color*=1.-amount.w*vignette;
 gl_FragColor=vec4(clamp(color,0.,1.),1.);
}`;
const clamp=(n,hi)=>Number.isFinite(n)?Math.max(0,Math.min(hi,n)):0;
export function createScreenFinish(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
 if(!gl)return null;
 const shaders=[];let program=null,buffer=null,texture=null;
 try{
 function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 buffer=gl.createBuffer();texture=gl.createTexture();gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
 for(const flag of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,flag,gl.CLAMP_TO_EDGE);
 for(const flag of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,flag,gl.LINEAR);
 gl.uniform1i(gl.getUniformLocation(program,'image'),0);
 const size=gl.getUniformLocation(program,'outputSize'),ratio=gl.getUniformLocation(program,'pixelRatio'),amount=gl.getUniformLocation(program,'amount');
 let dead=false,textureWidth=0,textureHeight=0;
 return {
  draw(source,{preset='crt',strength=.9,dpr=1,...overrides}={}){
   if(dead||gl.isContextLost())return false;
   const p={...(FINISH_PRESETS[preset]||FINISH_PRESETS.clear),...overrides},k=clamp(strength,2),density=Math.max(1,clamp(dpr,2));
   gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   const w=source.videoWidth||source.naturalWidth||source.width,h=source.videoHeight||source.naturalHeight||source.height;
   if(w!==textureWidth||h!==textureHeight){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);textureWidth=w;textureHeight=h;}
   else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,source);
   gl.uniform2f(size,canvas.width,canvas.height);gl.uniform1f(ratio,density);
   gl.uniform4f(amount,clamp(p.softness*k,.7),clamp(p.chroma*k,1.2),clamp(p.scanlines*k,.25),clamp(p.vignette*k,.10));
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return gl.getError()===gl.NO_ERROR;
  },
  // Read immediately after draw; intended for QA, never the frame loop.
  readPixels(){const data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;},
  dispose(){if(dead)return;dead=true;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);for(const s of shaders)gl.deleteShader(s);}
 };
 }catch{
  if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);for(const s of shaders)gl.deleteShader(s);return null;
 }
}
