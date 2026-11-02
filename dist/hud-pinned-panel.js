// Incoming passive information yields to existing controls, never the reverse.
export function avoidPinnedMission(bounds,height,mission){
 if(!mission||!(height>0))return bounds;
 const crossing=bounds.x+bounds.width>mission.left-12&&bounds.x<mission.right+12&&bounds.y+height>mission.top-12&&bounds.y<mission.bottom+12;
 return crossing?{...bounds,y:mission.bottom+12}:bounds;
}
