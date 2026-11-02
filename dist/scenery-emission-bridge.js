// Native painters report only approved emissive surfaces to their current scene.
// A WeakMap keeps studio/village draws inert and prevents cross-world ownership.
const receivers=new WeakMap();
export function bindSceneryEmission(canvas,receiver){receivers.set(canvas,receiver);return()=>{if(receivers.get(canvas)===receiver)receivers.delete(canvas);};}
export function captureSceneryEmission(c,kind,data){const receiver=receivers.get(c.canvas);if(!receiver)return false;receiver.capture(c,kind,data);return true;}
